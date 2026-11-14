-- Functional checks for voice-demo-store.sql. Run against a THROWAWAY
-- database only (it truncates the table). Each check raises on failure.
\set ON_ERROR_STOP on
truncate public.voice_demo_sessions;

do $$
declare r text;
begin
  -- args: session, ip_hash, visitor_hash, reserved, lease, per_visitor, per_ip, daily, concurrent
  r := voice_demo_claim(gen_random_uuid(), 'ip1', 'v1', 60, 80, 2, 4, 300, 1);
  assert r = 'ok', 'first claim ok: ' || r;
  r := voice_demo_claim(gen_random_uuid(), 'ip2', 'v2', 60, 80, 2, 4, 300, 1);
  assert r = 'busy', 'concurrency ceiling: ' || r;
end $$;

-- Releasing a lease frees the concurrency slot but keeps the attempt.
do $$
declare sid uuid; r text;
begin
  truncate public.voice_demo_sessions;
  sid := gen_random_uuid();
  r := voice_demo_claim(sid, 'ip1', 'v1', 60, 80, 2, 4, 300, 1);
  perform voice_demo_release(sid, false);
  r := voice_demo_claim(gen_random_uuid(), 'ip1', 'v1', 60, 80, 2, 4, 300, 1);
  assert r = 'ok', 'slot freed after release: ' || r;
  assert (select count(*) from voice_demo_sessions) = 2, 'released attempt still counted';
end $$;

-- Per-visitor and per-IP limits.
do $$
declare r text; sid uuid;
begin
  truncate public.voice_demo_sessions;
  for i in 1..2 loop
    sid := gen_random_uuid();
    r := voice_demo_claim(sid, 'ipA' || i, 'same-visitor', 60, 80, 2, 4, 3000, 10);
    assert r = 'ok', 'visitor attempt ' || i;
  end loop;
  r := voice_demo_claim(gen_random_uuid(), 'ipZ', 'same-visitor', 60, 80, 2, 4, 3000, 10);
  assert r = 'visitor_limit', 'per-visitor limit: ' || r;
  r := voice_demo_claim(gen_random_uuid(), 'shared-ip', 'a', 60, 80, 2, 1, 3000, 10);
  assert r = 'ok';
  r := voice_demo_claim(gen_random_uuid(), 'shared-ip', 'b', 60, 80, 2, 1, 3000, 10);
  assert r = 'visitor_limit', 'per-IP limit: ' || r;
end $$;

-- Global daily allowance, and refunds for failed key minting.
do $$
declare r text; sid uuid;
begin
  truncate public.voice_demo_sessions;
  r := voice_demo_claim(gen_random_uuid(), 'i1', 'v1', 60, 80, 5, 5, 120, 10);
  sid := gen_random_uuid();
  r := voice_demo_claim(sid, 'i2', 'v2', 60, 80, 5, 5, 120, 10);
  assert r = 'ok';
  r := voice_demo_claim(gen_random_uuid(), 'i3', 'v3', 60, 80, 5, 5, 120, 10);
  assert r = 'daily_limit', 'daily allowance: ' || r;
  perform voice_demo_release(sid, true);   -- refund
  r := voice_demo_claim(gen_random_uuid(), 'i3', 'v3', 60, 80, 5, 5, 120, 10);
  assert r = 'ok', 'refund restores allowance: ' || r;
end $$;

-- Expired leases no longer count towards concurrency; old rows are purged.
do $$
declare r text;
begin
  truncate public.voice_demo_sessions;
  insert into voice_demo_sessions values (gen_random_uuid(), (now() at time zone 'utc')::date, 'x', 'y', 60, now() - interval '1 second', now());
  insert into voice_demo_sessions values (gen_random_uuid(), (now() at time zone 'utc')::date - 5, 'old', 'old', 60, now() - interval '5 days', now());
  r := voice_demo_claim(gen_random_uuid(), 'i', 'v', 60, 80, 5, 5, 3000, 1);
  assert r = 'ok', 'expired lease ignored: ' || r;
  assert not exists (select 1 from voice_demo_sessions where ip_hash = 'old'), 'old rows purged';
end $$;

-- Public roles cannot touch the table or call the functions.
set role anon;
do $$ begin
  begin perform 1 from public.voice_demo_sessions; raise exception 'anon could read table';
  exception when insufficient_privilege then null; end;
  begin perform public.voice_demo_claim(gen_random_uuid(),'a','b',60,80,2,4,300,1); raise exception 'anon could call claim';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set role authenticated;
do $$ begin
  begin perform public.voice_demo_release(gen_random_uuid(), true); raise exception 'authenticated could call release';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set role service_role;
select public.voice_demo_claim(gen_random_uuid(),'svc','svc',60,80,2,4,30000,100) = 'ok' as service_role_can_claim;
reset role;

truncate public.voice_demo_sessions;
select 'ALL STORE CHECKS PASSED' as result;
