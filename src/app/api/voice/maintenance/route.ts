import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getPostgresStore } from "@/lib/voice/server/postgresStore";
import { noStoreHeaders } from "@/lib/voice/server/security";

export const dynamic = "force-dynamic";

/**
 * Optional scheduler target for idle-period retention; never issues Soniox keys.
 * Configure a daily authenticated POST BEFORE enabling the public demo.
 * This deliberately works while the demo kill switch is off.
 */
export async function POST(request: Request) {
  const secret = process.env.VOICE_DEMO_CLEANUP_SECRET;
  const supplied = request.headers.get("authorization") ?? "";
  if (!secret || secret.length < 32) {
    return NextResponse.json({ ok: false }, { status: 503, headers: noStoreHeaders });
  }
  const expectedBytes = Buffer.from(`Bearer ${secret}`);
  const suppliedBytes = Buffer.from(supplied);
  if (expectedBytes.length !== suppliedBytes.length || !timingSafeEqual(expectedBytes, suppliedBytes)) {
    return NextResponse.json({ ok: false }, { status: 401, headers: noStoreHeaders });
  }
  const connection = process.env.DATABASE_URL;
  if (process.env.VOICE_DEMO_STORE !== "postgres" || !connection) {
    return NextResponse.json({ ok: false }, { status: 503, headers: noStoreHeaders });
  }
  try {
    await getPostgresStore(connection).cleanup();
    return new NextResponse(null, { status: 204, headers: noStoreHeaders });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503, headers: noStoreHeaders });
  }
}
