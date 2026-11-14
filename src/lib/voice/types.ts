/** Shared (client + server) contract for the public demo API. No secrets live here. */

export type DemoUnavailableReason =
  | "disabled"
  | "not_configured"
  | "store_unavailable"
  | "provider_unavailable";

export type DemoRefusalReason =
  | DemoUnavailableReason
  | "forbidden_origin"
  | "invalid_request"
  | "consent_required"
  | "unsupported_pair"
  | "rate_limited"
  | "busy"
  | "visitor_limit"
  | "daily_limit";

export interface DemoStatusResponse {
  available: boolean;
  reason?: DemoUnavailableReason;
  trialSeconds: number;
}

export interface DemoSessionGranted {
  ok: true;
  sessionId: string;
  sessionToken: string;
  /** Epoch ms after which the server considers the trial over. */
  expiresAt: number;
  trialSeconds: number;
  region?: string;
  stt: {
    apiKey: string;
    model: string;
    maxEndpointDelayMs: number;
    context: {
      general: { key: string; value: string }[];
      terms: string[];
    };
  };
  tts: {
    apiKey: string;
    model: string;
    voice: string;
  };
}

export interface DemoSessionRefused {
  ok: false;
  reason: DemoRefusalReason;
}

export type DemoSessionResponse = DemoSessionGranted | DemoSessionRefused;
