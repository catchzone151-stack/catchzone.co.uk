# CatchZone Voice — Public Demo Operations Runbook

The Conversation Studio on `/voice` can run a short, public, live translation
trial using Soniox speech recognition, translation and text-to-speech. **Paid
processing is fail-closed**: unless every prerequisite below is in place, the
server mints no credentials, the Studio shows "Live demo paused", and nothing
is billed. The rest of the Voice pages work normally either way.

Current state when this branch was delivered: **not enabled** (no
configuration is set). No Soniox request was made during development.

---

## 1. How it works

```
Browser ──(consent + mic permission)──► POST /api/voice/session
                                         │ kill switch + prerequisites
                                         │ origin / shape / consent / pair checks
                                         │ per-instance burst filter
                                         │ durable claim (Supabase RPC, atomic):
                                         │   concurrency · per-visitor · per-IP · daily seconds
                                         │ mint 2 Soniox temporary keys (server key never leaves server)
                                         ▼
Browser ◄── { STT key, TTS key, session token } ──
Browser ══ WebSocket (temp key) ══► Soniox STT + two-way translation (stt-rt-v6)
Browser ══ WebSocket (temp key) ══► Soniox TTS per completed utterance (tts-rt-v2)
Browser ──(stop / page hide)──► POST /api/voice/session/end  (releases concurrency lease)
```

Temporary keys (per <https://docs.soniox.com/authentication/temporary-api-keys>):

| Key | `usage_type` | Restrictions |
| --- | --- | --- |
| Speech recognition + translation | `transcribe_websocket` | `single_use: true`, opens a stream only within 30 s, Soniox ends the stream after **trial + 5 s** (`max_session_duration_seconds`) |
| Spoken output | `tts_rt` | usable only until trial + 30 s, each spoken stream capped at 30 s by Soniox. Not single-use because TTS uses one stream per utterance (Soniox WebSocket rules). |

Both carry `client_reference_id = cz-voice-demo:<random session id>`, visible
in Soniox usage logs. No personal data is in that reference.

What CatchZone stores: only hashed fair-use records (see §4). No audio,
transcripts or translations are received or stored by CatchZone.

## 2. Prerequisites (all required before enabling)

### 2.1 Soniox — dedicated, isolated project

1. In the Soniox Console create a **separate project** for the public demo
   (e.g. "catchzone-website-public-demo"). Do **not** reuse the project or key
   used by the private client-evaluation application (the separate Replit
   project). This keeps billing, quotas and revocation independent.
2. Choose its region deliberately (Console → Projects and regions). For
   UK/EU visitors an EU project may be preferable; set `SONIOX_DEMO_REGION=eu`
   if so.
3. **Project → Limits**: set a **monthly usage (cost) limit** a little below
   the amount you are prepared to spend, plus an email notification trigger
   lower than that. Soniox notes limits can take a short while to apply.
4. **Project → Limits → API quotas**: set the project's real-time STT
   concurrency and TTS concurrency **low** (e.g. 2–3) so the demo can never
   consume the organisation's whole quota.
5. **API keys**: create a key with only these permissions:
   - Temporary API keys
   - Speech-to-text, real-time
   - Text-to-speech, real-time
   (Optionally "Model listing" for `npm run voice:sync-languages` — use a
   separate key for that if you prefer.) Nothing else.

### 2.2 Durable usage store — Supabase (existing CatchZone infrastructure)

In-memory limits do not survive restarts and do not span Replit Autoscale
instances, so production **requires** the durable store (memory mode is
refused when `NODE_ENV=production`).

1. Choose a Supabase project (a dedicated one is cleanest; an existing
   project works — the table is isolated and locked down).
2. Review and run `docs/voice/voice-demo-store.sql` in the SQL editor. It
   creates `public.voice_demo_sessions` (RLS on, no policies, no access for
   `anon`/`authenticated`) and two `security definer` functions callable only
   by `service_role`.
3. **Retention job (required):** enable the `pg_cron` extension
   (Dashboard → Database → Extensions) and run once:
   `select cron.schedule('voice-demo-purge', '17 3 * * *', 'select public.voice_demo_purge()');`
   This deletes fair-use records older than two days even when the demo is
   idle, which is what the privacy policy states.
4. Optional verification on a **throwaway** database:
   `docs/voice/voice-demo-store.test.sql` (truncates the table).

### 2.3 Environment variables (Replit Secrets — server only)

| Variable | Value |
| --- | --- |
| `SONIOX_DEMO_API_KEY` | the scoped key from 2.1 |
| `SONIOX_DEMO_REGION` | empty (US) or `eu` / `jp` / `in` matching the project |
| `VOICE_DEMO_HASH_SECRET` | ≥ 32 random characters (e.g. `openssl rand -base64 48`) |
| `VOICE_DEMO_STORE` | `supabase` |
| `VOICE_DEMO_SUPABASE_URL` | `https://<project>.supabase.co` |
| `VOICE_DEMO_SUPABASE_SERVICE_ROLE_KEY` | that project's service-role key |
| `VOICE_DEMO_SPEND_CONTROLS_CONFIRMED` | `true` — only after 2.1 steps 3–5 are done |
| `VOICE_DEMO_ENABLED` | `true` — the on/off switch |

Optional tuning (defaults are conservative; values are clamped):

| Variable | Default | Allowed |
| --- | --- | --- |
| `VOICE_DEMO_TRIAL_SECONDS` | 60 | 15–120 |
| `VOICE_DEMO_ATTEMPTS_PER_VISITOR` | 2 per UTC day | 1–10 |
| `VOICE_DEMO_ATTEMPTS_PER_IP` | 4 per UTC day | 1–20 |
| `VOICE_DEMO_DAILY_SECONDS` | 1800 (30 trial-minutes/day, site-wide) | 60–36000 |
| `VOICE_DEMO_MAX_CONCURRENT` | 2 | 1–10 |
| `VOICE_DEMO_TTS_VOICE` | `Adrian` | a Soniox voice name |
| `VOICE_DEMO_TRUSTED_PROXY_HOPS` | 1 | 0–5 (proxies in front of the app adding `X-Forwarded-For`) |
| `VOICE_DEMO_ALLOWED_ORIGINS` | `https://catchzone.co.uk,https://www.catchzone.co.uk` | comma list |

**Never** prefix any of these with `NEXT_PUBLIC_`.

## 3. Emergency kill switch

Fastest → slowest, any one is sufficient:

1. Set `VOICE_DEMO_ENABLED=false` (or delete it) in Replit Secrets and
   restart/redeploy. New trials stop immediately; in-flight trials end within
   the trial length because Soniox enforces the session cap.
2. Revoke/delete `SONIOX_DEMO_API_KEY` in the Soniox Console. No new temporary
   keys can be minted; already-minted ones expire within ~90 s.
3. Lower the Soniox project cost limit to the amount already spent — Soniox
   rejects further requests.

## 4. Abuse protection & privacy summary

- Explicit on-screen consent, then browser microphone permission, **before**
  any credential is requested (a denied mic never consumes a trial).
- Same-origin browser check, JSON-only, 2 KB body cap, consent flag, language
  pair validated against the Soniox catalogue.
- Per-instance burst filter (6 session requests/min/IP) before the database.
- Durable, atomic limits: global concurrency, per-visitor (HttpOnly
  `cz_voice_vid` cookie, 2 days, set only on starting a trial), per-IP, global
  daily seconds. Verified with a 20-way race test (exactly the configured
  number succeed).
- IP addresses and visitor ids are stored only as HMAC-SHA256 hashes salted
  per UTC day; rows are purged after ~2 days.
- Abandoned tabs: lease expires automatically (trial + 20 s); Soniox ends the
  stream at the key's session cap regardless.
- Known limitation: a determined attacker can rotate IPs and drop cookies.
  The global daily allowance, concurrency ceiling, Soniox project quotas and
  cost limit bound the worst case. If abuse appears, add a bot challenge
  (e.g. Cloudflare Turnstile) before enabling again.
- `X-Forwarded-For` trust: the right-most N entries are used. Confirm the
  hop count for the production proxy chain (Replit) and adjust
  `VOICE_DEMO_TRUSTED_PROXY_HOPS` if needed.

## 5. Monitoring

- Soniox Console → Usage summary / usage logs, filter by
  `client_reference_id` prefix `cz-voice-demo:`.
- Soniox Console → Concurrency limits for live/peak streams.
- Server logs: lines prefixed `[voice-demo]` (missing prerequisites, store
  errors, temporary-key HTTP status). No secrets or content are logged.
- Supabase: `select day, count(*), sum(reserved_seconds) from voice_demo_sessions group by day;`

## 6. Owner activation checklist (short form)

1. Soniox Console: create a **new, dedicated** project for the public website
   demo. Never reuse the key of the private client-evaluation environment.
2. In that project set a monthly **cost limit** + email alert, and low
   real-time STT and TTS **concurrency quotas** (e.g. 2).
3. Create an API key with only: Temporary API keys, Speech-to-text real-time,
   Text-to-speech real-time.
4. Supabase: run `docs/voice/voice-demo-store.sql`, enable `pg_cron`, schedule
   the daily purge (§2.2 step 3).
5. Set the hosting secrets from §2.3, with `VOICE_DEMO_SPEND_CONTROLS_CONFIRMED=true`
   and finally `VOICE_DEMO_ENABLED=true`.
6. Redeploy, then follow §7.

## 7. Enabling — verification

1. Complete §2.1–2.3.
2. Deploy, then `GET /api/voice/status` → `{"available":true,...}`.
3. Run one real trial yourself; check Soniox usage logs show the
   `cz-voice-demo:` reference and the expected duration.
4. Try a third trial from the same browser → "used today's free live trials".

## 8. Updating the language catalogue

`npm run voice:sync-languages` re-reads Soniox's published STT, translation and
TTS language tables, refuses to write if they disagree, and (if
`SONIOX_API_KEY` is set to a key with the Model listing permission) also
cross-checks `GET /v1/models`. Commit the regenerated
`src/data/voice/soniox-languages.json`; every page and the API validation
update automatically.
