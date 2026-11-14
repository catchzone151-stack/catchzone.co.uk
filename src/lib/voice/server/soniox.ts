import "server-only";
import {
  SESSION_GRACE_SECONDS,
  STT_KEY_OPEN_WINDOW_SECONDS,
  TTS_STREAM_MAX_SECONDS,
  sonioxApiBase,
  type VoiceDemoConfig,
} from "./config";

/**
 * Mints Soniox temporary API keys for one public-demo trial, following
 * https://docs.soniox.com/authentication/temporary-api-keys.
 *
 * The long-lived SONIOX_DEMO_API_KEY never leaves the server. The browser
 * only ever receives:
 *   - an STT key: usage_type "transcribe_websocket", single_use, valid for
 *     30 s to OPEN one stream, and Soniox-enforced max session duration of
 *     (trial + 5 s) — so even a leaked key cannot run longer than the trial;
 *   - a TTS key: usage_type "tts_rt", usable only until the trial ends, with
 *     each spoken stream capped at 30 s by Soniox. (TTS multiplexes one
 *     stream per utterance, so it cannot be single_use — see Soniox's
 *     WebSocket authentication rules.)
 * Both carry a random, non-personal client_reference_id so usage can be
 * traced to a demo session in Soniox usage logs.
 */

export interface TemporaryKey {
  apiKey: string;
  expiresAt: string;
}

export class SonioxKeyError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
  ) {
    super(message);
  }
}

async function createTemporaryKey(
  config: VoiceDemoConfig,
  body: Record<string, unknown>,
): Promise<TemporaryKey> {
  let res: Response;
  try {
    res = await fetch(`${sonioxApiBase(config.region)}/v1/auth/temporary-api-key`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.sonioxApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
  } catch {
    throw new SonioxKeyError("temporary key request failed (network)", null);
  }
  if (!res.ok) {
    // Never log the response body or our key; status is enough to diagnose
    // 401 (bad key) / 403 (permissions) / 429 (quota).
    throw new SonioxKeyError(`temporary key request rejected`, res.status);
  }
  const data = (await res.json()) as { api_key?: unknown; expires_at?: unknown };
  if (typeof data.api_key !== "string" || !data.api_key) {
    throw new SonioxKeyError("temporary key response malformed", res.status);
  }
  return { apiKey: data.api_key, expiresAt: String(data.expires_at ?? "") };
}

export async function mintTrialKeys(
  config: VoiceDemoConfig,
  sessionId: string,
): Promise<{ stt: TemporaryKey; tts: TemporaryKey }> {
  const reference = `cz-voice-demo:${sessionId}`;
  const [stt, tts] = await Promise.all([
    createTemporaryKey(config, {
      usage_type: "transcribe_websocket",
      expires_in_seconds: STT_KEY_OPEN_WINDOW_SECONDS,
      single_use: true,
      max_session_duration_seconds: config.trialSeconds + SESSION_GRACE_SECONDS,
      client_reference_id: reference,
    }),
    createTemporaryKey(config, {
      usage_type: "tts_rt",
      expires_in_seconds: config.trialSeconds + STT_KEY_OPEN_WINDOW_SECONDS,
      max_session_duration_seconds: TTS_STREAM_MAX_SECONDS,
      client_reference_id: reference,
    }),
  ]);
  return { stt, tts };
}
