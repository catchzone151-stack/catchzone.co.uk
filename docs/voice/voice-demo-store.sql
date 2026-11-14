-- CatchZone Voice — public demo usage store (Postgres / Supabase)
--
-- Durable, multi-instance-safe enforcement of the public demo limits used by
-- src/lib/voice/server/store.ts. NOT applied automatically. Review, then run
-- once in the Supabase SQL editor (or as a migration) of the project whose
-- URL/service-role key are set in VOICE_DEMO_SUPABASE_URL /
-- VOICE_DEMO_SUPABASE_SERVICE_ROLE_KEY.
--
-- Stores only: a random session id, the UTC day, HMAC hashes of the IP and
-- visitor cookie (salted per day, not reversible to an IP), reserved trial
-- seconds and a lease expiry. No audio, transcripts, translations, names,
-- emails or raw IP addresses. Rows older than two days are purged on each
-- claim.

create table if not exists public.voice_demo_sessions (
  session_id        uuid primary key,
  day               date        not null,
  ip_hash           text        not null,
  visitor_hash      text        not null,
  reserved_seconds  integer     not null check (reserved_seconds > 0),
  lease_expires_at  timestamptz not null,
  created_at        timestamptz not null default now()
);

create index if not exists voice_demo_sessions_day_ip      on public.voice_demo_sessions (day, ip_hash);
create index if not exists voice_demo_sessions_day_visitor on public.voice_demo_sessions (day, visitor_hash);
create index if not exists voice_demo_sessions_lease       on public.voice_demo_sessions (lease_expires_at);

-- Lock the table down: RLS on with no policies means the anon and
-- authenticated roles can read/write nothing. Only the service role
-- (server-side) reaches it, and only through the functions below.
alter table public.voice_demo_sessions enable row level security;
revoke all on table public.voice_demo_sessions from anon, authenticated;

create or replace function public.voice_demo_claim(
  p_session_id        uuid,
  p_ip_hash           text,
  p_visitor_hash      text,
  p_reserved_seconds  integer,
  p_lease_seconds     integer,
  p_max_per_visitor   integer,
  p_max_per_ip        integer,
  p_daily_seconds     integer,
  p_max_concurrent    integer
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day      date := (now() at time zone 'utc')::date;
  v_active   integer;
  v_visitor  integer;
  v_ip       integer;
  v_reserved integer;
begin
  -- Serialise claims so concurrent requests cannot both pass the checks.
  perform pg_advisory_xact_lock(hashtext('voice_demo_claim'));

  delete from public.voice_demo_sessions where day < v_day - 2;

  select count(*) into v_active
    from public.voice_demo_sessions where lease_expires_at > now();
  if v_active >= p_max_concurrent then
    return 'busy';
  end if;

  select count(*) into v_visitor
    from public.voice_demo_sessions where day = v_day and visitor_hash = p_visitor_hash;
  select count(*) into v_ip
    from public.voice_demo_sessions where day = v_day and ip_hash = p_ip_hash;
  if v_visitor >= p_max_per_visitor or v_ip >= p_max_per_ip then
    return 'visitor_limit';
  end if;

  select coalesce(sum(reserved_seconds), 0) into v_reserved
    from public.voice_demo_sessions where day = v_day;
  if v_reserved + p_reserved_seconds > p_daily_seconds then
    return 'daily_limit';
  end if;

  insert into public.voice_demo_sessions
    (session_id, day, ip_hash, visitor_hash, reserved_seconds, lease_expires_at)
  values
    (p_session_id, v_day, p_ip_hash, p_visitor_hash, p_reserved_seconds,
     now() + make_interval(secs => p_lease_seconds));

  return 'ok';
end;
$$;

create or replace function public.voice_demo_release(
  p_session_id uuid,
  p_refund     boolean
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_refund then
    -- Keys were never issued (provider error): remove the attempt entirely.
    delete from public.voice_demo_sessions where session_id = p_session_id;
  else
    update public.voice_demo_sessions
       set lease_expires_at = least(lease_expires_at, now())
     where session_id = p_session_id;
  end if;
end;
$$;

-- Retention: removes records older than two days. Called on every claim and
-- also scheduled daily (below), so records are deleted even when the demo is idle.
create or replace function public.voice_demo_purge() returns void
language sql
security definer
set search_path = public
as $$
  delete from public.voice_demo_sessions
   where day < (now() at time zone 'utc')::date - 2;
$$;

revoke all on function public.voice_demo_purge() from public, anon, authenticated;
grant execute on function public.voice_demo_purge() to service_role;

-- Daily retention job (REQUIRED when activating the demo). Requires the
-- pg_cron extension: Supabase Dashboard → Database → Extensions → pg_cron.
-- Then run, once:
--   select cron.schedule('voice-demo-purge', '17 3 * * *', 'select public.voice_demo_purge()');

revoke all on function public.voice_demo_claim(uuid, text, text, integer, integer, integer, integer, integer, integer) from public, anon, authenticated;
revoke all on function public.voice_demo_release(uuid, boolean) from public, anon, authenticated;
grant execute on function public.voice_demo_claim(uuid, text, text, integer, integer, integer, integer, integer, integer) to service_role;
grant execute on function public.voice_demo_release(uuid, boolean) to service_role;
