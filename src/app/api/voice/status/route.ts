import { NextResponse } from "next/server";
import { getVoiceDemoConfig, publicTrialSeconds } from "@/lib/voice/server/config";
import { noStoreHeaders } from "@/lib/voice/server/security";
import type { DemoStatusResponse } from "@/lib/voice/types";

export const dynamic = "force-dynamic";

/**
 * Lets the Conversation Studio show an accurate availability state before
 * a visitor clicks anything. Never reveals WHICH prerequisite is missing
 * (that is logged server-side only) and never contacts Soniox.
 */
export async function GET() {
  const result = getVoiceDemoConfig();
  const body: DemoStatusResponse = result.ok
    ? { available: true, trialSeconds: result.config.trialSeconds }
    : { available: false, reason: result.reason, trialSeconds: publicTrialSeconds() };

  if (!result.ok && result.reason === "not_configured") {
    console.warn(`[voice-demo] unavailable — missing prerequisites: ${result.missing.join(", ")}`);
  }

  return NextResponse.json(body, { headers: noStoreHeaders });
}
