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
  /** Refund only when keys were never issued; otherwise end the lease only. */
  release(sessionId: string, refund: boolean): Promise<void>;
}

export class StoreUnavailableError extends Error {}
