import "server-only";
import { Pool, type PoolClient } from "pg";
import { StoreUnavailableError, type ClaimInput, type ClaimOutcome, type VoiceDemoStore } from "./storeTypes";

/**
 * Shared across ALL instances by a transaction-scoped PostgreSQL lock.
 * READ COMMITTED is intentional: each query after acquiring the lock sees
 * the preceding claimant's committed reservation. No runtime schema DDL.
 */
export class PostgresStore implements VoiceDemoStore {
  constructor(private readonly pool: Pool) {}

  private async transaction<T>(operation: (client: PoolClient) => Promise<T>): Promise<T> {
    let client: PoolClient | undefined;
    let broken = false;
    try {
      client = await this.pool.connect();
      await client.query("BEGIN ISOLATION LEVEL READ COMMITTED");
      await client.query("SET LOCAL statement_timeout = '2000ms'");
      await client.query("SET LOCAL lock_timeout = '1000ms'");
      await client.query("SET LOCAL idle_in_transaction_session_timeout = '3000ms'");
      await client.query("SELECT pg_advisory_xact_lock(112999, 1)");
      const result = await operation(client);
      await client.query("COMMIT");
      return result;
    } catch {
      // Never propagate driver messages: they may contain hostnames or credentials.
      if (client) {
        try { await client.query("ROLLBACK"); } catch { broken = true; }
      }
      throw new StoreUnavailableError("voice PostgreSQL store unavailable");
    } finally {
      client?.release(broken);
    }
  }

  async claim(input: ClaimInput): Promise<ClaimOutcome> {
    return this.transaction(async (client) => {
      await this.purge(client);
      // Evaluate the UTC day/lease clock AFTER waiting for the global lock.
      const { rows: [clock] } = await client.query<{ day: string; now: Date }>(`
        SELECT to_char(t AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day, t AS now
        FROM (SELECT clock_timestamp() AS t) AS clock
      `);
      if (!clock) throw new Error("missing database clock");
      const { rows: [usage] } = await client.query<{
        active: number; visitor: number; ip: number; reserved: number;
      }>(`
        SELECT
          count(*) FILTER (WHERE lease_expires_at > $4::timestamptz)::int AS active,
          count(*) FILTER (WHERE day = $3::date
            AND visitor_hash = $1)::int AS visitor,
          count(*) FILTER (WHERE day = $3::date
            AND ip_hash = $2)::int AS ip,
          coalesce(sum(reserved_seconds) FILTER (
            WHERE day = $3::date), 0)::int AS reserved
        FROM public.voice_demo_pg_sessions
      `, [input.visitorHash, input.ipHash, clock.day, clock.now]);
      if (!usage) throw new Error("missing usage");
      if (usage.active >= input.maxConcurrent) return "busy";
      if (usage.visitor >= input.maxPerVisitor || usage.ip >= input.maxPerIp) return "visitor_limit";
      if (usage.reserved + input.reservedSeconds > input.dailySeconds) return "daily_limit";
      await client.query(`
        INSERT INTO public.voice_demo_pg_sessions
          (session_id, day, ip_hash, visitor_hash, reserved_seconds, lease_expires_at)
        VALUES ($1, $6::date, $2, $3, $4,
          clock_timestamp() + make_interval(secs => $5))
      `, [input.sessionId, input.ipHash, input.visitorHash, input.reservedSeconds, input.leaseSeconds, clock.day]);
      return "ok";
    });
  }

  async release(sessionId: string, refund: boolean): Promise<void> {
    await this.transaction(async (client) => {
      if (refund) {
        await client.query("DELETE FROM public.voice_demo_pg_sessions WHERE session_id = $1", [sessionId]);
      } else {
        await client.query(`UPDATE public.voice_demo_pg_sessions
          SET lease_expires_at = least(lease_expires_at, clock_timestamp())
          WHERE session_id = $1`, [sessionId]);
      }
      await this.purge(client);
    });
  }

  /** Also callable by a separately scheduled, server-only retention worker. */
  async cleanup(): Promise<void> {
    await this.transaction(async (client) => { await this.purge(client); });
  }

  private async purge(client: PoolClient): Promise<void> {
    // Eligible after 48 hours; never delete a live lease or today's budget.
    await client.query(`DELETE FROM public.voice_demo_pg_sessions
      WHERE created_at < clock_timestamp() - interval '2 days'
        AND day < (clock_timestamp() AT TIME ZONE 'UTC')::date
        AND lease_expires_at <= clock_timestamp()`);
  }
}

/** Small lazy singleton per Autoscale process; no database contact on import/build. */
export function createVoicePool(connectionString: string): Pool {
  const pool = new Pool({
    connectionString,
    max: 2,
    connectionTimeoutMillis: 2000,
    idleTimeoutMillis: 10000,
    maxLifetimeSeconds: 300,
    allowExitOnIdle: true,
    query_timeout: 3000,
    application_name: "catchzone-voice-demo",
  });
  // Idle socket failures must not crash the process or log connection details.
  pool.on("error", () => { console.error("[voice-demo] idle PostgreSQL connection unavailable"); });
  return pool;
}

const shared = globalThis as unknown as {
  __czVoicePg?: { connectionString: string; pool: Pool; store: PostgresStore };
};

export function getPostgresStore(connectionString: string): PostgresStore {
  if (!shared.__czVoicePg || shared.__czVoicePg.connectionString !== connectionString) {
    if (shared.__czVoicePg) void shared.__czVoicePg.pool.end().catch(() => undefined);
    const pool = createVoicePool(connectionString);
    shared.__czVoicePg = { connectionString, pool, store: new PostgresStore(pool) };
  }
  return shared.__czVoicePg.store;
}
