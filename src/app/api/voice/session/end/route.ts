import { NextResponse } from "next/server";
import { getVoiceDemoConfig } from "@/lib/voice/server/config";
import {
  getClientIp,
  burstLimited,
  isAllowedOrigin,
  isUuid,
  noStoreHeaders,
  readSmallJson,
  verifySession,
} from "@/lib/voice/server/security";
import { getStore } from "@/lib/voice/server/store";

export const dynamic = "force-dynamic";

/**
 * Releases a trial's concurrency lease early when the visitor stops or
 * leaves (sent with navigator.sendBeacon on page hide). Requires the HMAC
 * session token issued with the session, so one visitor cannot end
 * another's lease. Reserved daily seconds are NOT refunded. If this call
 * never arrives (abandoned tab, network loss), the lease expires on its own
 * and Soniox independently ends the stream at the key's session cap.
 */
export async function POST(request: Request) {
  const configResult = getVoiceDemoConfig();
  // Even when disabled we acknowledge, so a kill switch flip mid-session is harmless.
  if (!configResult.ok) return new NextResponse(null, { status: 204, headers: noStoreHeaders });
  const config = configResult.config;

  if (!isAllowedOrigin(request, config)) {
    return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  }
  if (burstLimited(`end:${getClientIp(request, config.trustedProxyHops)}`, 20, 60_000)) {
    return NextResponse.json({ ok: false }, { status: 429, headers: noStoreHeaders });
  }

  const body = (await readSmallJson(request)) as
    | { sessionId?: unknown; sessionToken?: unknown; expiresAt?: unknown }
    | null;
  if (
    !body ||
    !isUuid(body.sessionId) ||
    typeof body.sessionToken !== "string" ||
    typeof body.expiresAt !== "number" ||
    !verifySession(config.hashSecret, body.sessionId, body.expiresAt, body.sessionToken)
  ) {
    return NextResponse.json({ ok: false }, { status: 400, headers: noStoreHeaders });
  }

  try {
    await getStore(config).release(body.sessionId, false);
  } catch {
    // Lease will expire on its own; nothing useful to tell the client.
  }
  return new NextResponse(null, { status: 204, headers: noStoreHeaders });
}
