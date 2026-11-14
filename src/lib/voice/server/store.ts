import "server-only";
import type { VoiceDemoConfig } from "./config";

/**
 * Durable usage store for the public demo. A claim atomically enforces:
 *   - the global concurrency ceiling (active leases),
 *   - per-visitor and per-IP daily attempt limits,
 *   - the global daily allowance of reserved trial seconds,
 * and records the attempt. Reserved seconds are never refunded once keys
 * have been issued (conservative budgeting); a lease is released early when
 * the visitor stops, and expires on its own if the tab is abandoned.
 *
 * Only hashed identifiers are stored (HMAC with a daily salt) — never raw IP
 * addresses, audio, transcripts or translations.
 */

export interface ClaimInput {
  sessionId: string;
  ipHash: string;
  visitorHash: string;
  reservedSeconds: number;
  leaseSeconds: number;
  maxPerVisitor: number;
  maxPerIp: number;
  dailySeconds: number;
  maxConcurrent: number;
}

export type ClaimOutcome = "ok" | "busy" | "visitor_limit" | "daily_limit";

export interface VoiceDemoStore {
  claim(input: ClaimInput): Promise<ClaimOutcome>;
  /** refund=true deletes the attempt (keys were never issued); otherwise just ends the lease. */
  release(sessionId: string, refund: boolean): Promise<void>;
}

export class StoreUnavailableError extends Error {}

const OUTCOMES = new Set<ClaimOutcome>(["ok", "busy", "visitor_limit", "daily_limit"]);

/* ------------------------------------------------------------------ */
/* Supabase / Postgres (durable, multi-instance safe)                  */
/* ------------------------------------------------------------------ */

class SupabaseStore implements VoiceDemoStore {
  constructor(
    private readonly url: string,
    private readonly serviceKey: string,
  ) {}

  private async rpc(fn: string, args: Record<string, unknown>): Promise<unknown> {
    let res: Response;
    try {
      res = await fetch(`${this.url}/rest/v1/rpc/${fn}`, {
        method: "POST",
        headers: {
          apikey: this.serviceKey,
          Authorization: `Bearer ${this.serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(args),
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      });
    } catch {
      throw new StoreUnavailableError(`voice store ${fn}: network error`);
    }
    if (!res.ok) throw new StoreUnavailableError(`voice store ${fn}: HTTP ${res.status}`);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  async claim(input: ClaimInput): Promise<ClaimOutcome> {
    const result = await this.rpc("voice_demo_claim", {
      p_session_id: input.sessionId,
      p_ip_hash: input.ipHash,
      p_visitor_hash: input.visitorHash,
      p_reserved_seconds: input.reservedSeconds,
      p_lease_seconds: input.leaseSeconds,
      p_max_per_visitor: input.maxPerVisitor,
      p_max_per_ip: input.maxPerIp,
      p_daily_seconds: input.dailySeconds,
      p_max_concurrent: input.maxConcurrent,
    });
    if (typeof result === "string" && OUTCOMES.has(result as ClaimOutcome)) {
      return result as ClaimOutcome;
    }
    throw new StoreUnavailableError("voice store claim: unexpected response");
  }

  async release(sessionId: string, refund: boolean): Promise<void> {
    await this.rpc("voice_demo_release", { p_session_id: sessionId, p_refund: refund });
  }
}

/* ------------------------------------------------------------------ */
/* In-memory (LOCAL DEVELOPMENT ONLY — refused in production config)   */
/* ------------------------------------------------------------------ */

interface MemoryRow {
  day: string;
  ipHash: string;
  visitorHash: string;
  reservedSeconds: number;
  leaseExpiresAt: number;
}

class MemoryStore implements VoiceDemoStore {
  private rows = new Map<string, MemoryRow>();

  async claim(input: ClaimInput): Promise<ClaimOutcome> {
    const now = Date.now();
    const day = new Date(now).toISOString().slice(0, 10);
    for (const [id, row] of this.rows) if (row.day !== day) this.rows.delete(id);
    const rows = [...this.rows.values()];

    if (rows.filter((r) => r.leaseExpiresAt > now).length >= input.maxConcurrent) return "busy";
    if (rows.filter((r) => r.visitorHash === input.visitorHash).length >= input.maxPerVisitor) {
      return "visitor_limit";
    }
    if (rows.filter((r) => r.ipHash === input.ipHash).length >= input.maxPerIp) return "visitor_limit";
    const reserved = rows.reduce((sum, r) => sum + r.reservedSeconds, 0);
    if (reserved + input.reservedSeconds > input.dailySeconds) return "daily_limit";

    this.rows.set(input.sessionId, {
      day,
      ipHash: input.ipHash,
      visitorHash: input.visitorHash,
      reservedSeconds: input.reservedSeconds,
      leaseExpiresAt: now + input.leaseSeconds * 1000,
    });
    return "ok";
  }

  async release(sessionId: string, refund: boolean): Promise<void> {
    if (refund) {
      this.rows.delete(sessionId);
      return;
    }
    const row = this.rows.get(sessionId);
    if (row) row.leaseExpiresAt = Math.min(row.leaseExpiresAt, Date.now());
  }
}

const globalForStore = globalThis as unknown as { __czVoiceMemoryStore?: MemoryStore };

export function getStore(config: VoiceDemoConfig): VoiceDemoStore {
  if (config.store === "supabase") {
    return new SupabaseStore(config.supabaseUrl, config.supabaseServiceKey);
  }
  globalForStore.__czVoiceMemoryStore ??= new MemoryStore();
  return globalForStore.__czVoiceMemoryStore;
}
