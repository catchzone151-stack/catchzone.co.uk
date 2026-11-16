-- Source of truth for the Replit-managed Voice store. Apply to DEVELOPMENT
-- only; Replit Publish owns production schema changes. Never run from build
-- or application startup. No Supabase roles, extensions or SECURITY DEFINER.
CREATE TABLE IF NOT EXISTS public.voice_demo_pg_sessions (
  session_id uuid PRIMARY KEY,
  day date NOT NULL,
  ip_hash text NOT NULL CHECK (ip_hash ~ '^[A-Za-z0-9_-]{43}$'),
  visitor_hash text NOT NULL CHECK (visitor_hash ~ '^[A-Za-z0-9_-]{43}$'),
  reserved_seconds integer NOT NULL CHECK (reserved_seconds BETWEEN 1 AND 120),
  lease_expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS voice_demo_pg_day_ip ON public.voice_demo_pg_sessions(day, ip_hash);
CREATE INDEX IF NOT EXISTS voice_demo_pg_day_visitor ON public.voice_demo_pg_sessions(day, visitor_hash);
CREATE INDEX IF NOT EXISTS voice_demo_pg_lease ON public.voice_demo_pg_sessions(lease_expires_at);
CREATE INDEX IF NOT EXISTS voice_demo_pg_created ON public.voice_demo_pg_sessions(created_at);
REVOKE ALL ON public.voice_demo_pg_sessions FROM PUBLIC;
