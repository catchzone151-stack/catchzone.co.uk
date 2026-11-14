"use client";

import type { DemoRefusalReason, DemoSessionGranted, DemoSessionResponse } from "@/lib/voice/types";

/**
 * Browser engine for the public Conversation Studio.
 *
 * Flow (https://docs.soniox.com/guides/direct-stream and
 * https://docs.soniox.com/translation/sts-translation):
 *   1. microphone permission (no credential is requested until granted);
 *   2. POST /api/voice/session → short-lived, restricted Soniox keys;
 *   3. Soniox real-time STT with two-way translation, streamed straight from
 *      the browser with the single-use STT key;
 *   4. each completed translated utterance is spoken with Soniox real-time
 *      TTS; the microphone pauses while it plays so the translation is not
 *      re-captured and re-translated.
 *
 * Every transcript and translation shown comes from Soniox's live token
 * stream. Nothing is pre-recorded, simulated or stored by CatchZone.
 */

export type EnginePhase =
  | "idle"
  | "requesting-mic"
  | "requesting-session"
  | "connecting"
  | "listening"
  | "speaking"
  | "stopping"
  | "ended"
  | "error";

export type EngineErrorKind =
  | "mic_denied"
  | "mic_missing"
  | "mic_unsupported"
  | "refused"
  | "connection"
  | "provider"
  | "playback";

export interface EngineError {
  kind: EngineErrorKind;
  reason?: DemoRefusalReason;
}

export interface TranscriptLine {
  id: number;
  /** What the visitor said. */
  original: string;
  originalPartial: string;
  originalLang: string | null;
  /** Soniox translation of it. */
  translation: string;
  translationPartial: string;
  translationLang: string | null;
}

export interface EngineSnapshot {
  phase: EnginePhase;
  error: EngineError | null;
  lines: TranscriptLine[];
  /** Seconds left in the trial once connected. */
  remaining: number | null;
  trialSeconds: number | null;
  endedBecause: "user" | "time" | null;
}

type Listener = (snapshot: EngineSnapshot) => void;

interface SonioxTokenLike {
  text: string;
  is_final: boolean;
  language?: string;
  translation_status?: "none" | "original" | "translation";
}

/* ------------------------------------------------------------------ */
/* Microphone source that shares its stream with an AnalyserNode.      */
/* Mirrors the SDK's MicrophoneSource (default MediaRecorder format).  */
/* ------------------------------------------------------------------ */

interface SourceHandlers {
  onData: (chunk: ArrayBuffer) => void;
  onError: (error: Error) => void;
}

class SharedStreamSource {
  private recorder: MediaRecorder | null = null;

  constructor(private readonly stream: MediaStream) {}

  async start(handlers: SourceHandlers): Promise<void> {
    const recorder = new MediaRecorder(this.stream);
    this.recorder = recorder;
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        event.data.arrayBuffer().then(handlers.onData, (err: unknown) =>
          handlers.onError(err instanceof Error ? err : new Error(String(err))),
        );
      }
    });
    recorder.addEventListener("error", () => handlers.onError(new Error("MediaRecorder error")));
    recorder.start(60);
  }

  stop(): void {
    if (this.recorder && this.recorder.state !== "inactive") this.recorder.stop();
    this.recorder = null;
  }

  pause(): void {
    if (this.recorder?.state === "recording") this.recorder.pause();
  }

  resume(): void {
    if (this.recorder?.state === "paused") this.recorder.resume();
  }
}

/* ------------------------------------------------------------------ */
/* PCM (s16le, 24 kHz) playback queue with an output analyser.         */
/* ------------------------------------------------------------------ */

const TTS_SAMPLE_RATE = 24000;

class PcmPlayer {
  private nextTime = 0;
  private leftover: Uint8Array | null = null;
  private sources = new Set<AudioBufferSourceNode>();

  constructor(
    private readonly ctx: AudioContext,
    private readonly output: AudioNode,
  ) {}

  enqueue(chunk: Uint8Array): void {
    let bytes = chunk;
    if (this.leftover) {
      const merged = new Uint8Array(this.leftover.length + chunk.length);
      merged.set(this.leftover);
      merged.set(chunk, this.leftover.length);
      bytes = merged;
      this.leftover = null;
    }
    if (bytes.length % 2 === 1) {
      this.leftover = bytes.slice(bytes.length - 1);
      bytes = bytes.slice(0, bytes.length - 1);
    }
    const samples = bytes.length / 2;
    if (samples === 0) return;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const buffer = this.ctx.createBuffer(1, samples, TTS_SAMPLE_RATE);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < samples; i++) channel[i] = view.getInt16(i * 2, true) / 32768;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.output);
    const startAt = Math.max(this.ctx.currentTime + 0.02, this.nextTime);
    source.start(startAt);
    this.nextTime = startAt + buffer.duration;
    this.sources.add(source);
    source.onended = () => this.sources.delete(source);
  }

  /** Seconds of queued audio still to play. */
  remaining(): number {
    return Math.max(0, this.nextTime - this.ctx.currentTime);
  }

  stopAll(): void {
    for (const s of this.sources) {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
    }
    this.sources.clear();
    this.nextTime = 0;
    this.leftover = null;
  }
}

/* ------------------------------------------------------------------ */

function levelOf(analyser: AnalyserNode | null, buf: Float32Array<ArrayBuffer> | null): number {
  if (!analyser || !buf) return 0;
  analyser.getFloatTimeDomainData(buf);
  let sum = 0;
  for (let i = 0; i < buf.length; i++) sum += buf[i]! * buf[i]!;
  return Math.min(1, Math.sqrt(sum / buf.length) * 4);
}

const CONTROL_TOKENS = new Set(["<end>", "<fin>"]);

export class TranslationEngine {
  private listeners = new Set<Listener>();
  private snapshot: EngineSnapshot = {
    phase: "idle",
    error: null,
    lines: [],
    remaining: null,
    trialSeconds: null,
    endedBecause: null,
  };

  private session: DemoSessionGranted | null = null;
  private stream: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private outAnalyser: AnalyserNode | null = null;
  private analyserBuf: Float32Array<ArrayBuffer> | null = null;
  private player: PcmPlayer | null = null;
  // Loose typing: the SDK is dynamically imported to keep it out of the page bundle.
  private client: { realtime: { record: (o: unknown) => RecordingLike; tts: (o: unknown) => Promise<TtsStreamLike> } } | null = null;
  private recording: RecordingLike | null = null;
  private source: SharedStreamSource | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private resumeTimer: ReturnType<typeof setInterval> | null = null;
  private speechQueue: { text: string; lang: string }[] = [];
  private speaking = false;
  private activeTts: TtsStreamLike | null = null;
  private pendingSpeech: { text: string; lang: string } | null = null;
  private lineId = 0;
  private utteranceOpen = false;
  private released = false;
  /** Incremented by every start/dispose so stale async work can detect it was superseded. */
  private gen = 0;

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot);
    return () => this.listeners.delete(listener);
  }

  getSnapshot(): EngineSnapshot {
    return this.snapshot;
  }

  /** 0..1 audio level of whichever side is currently active (for the waveform). */
  getLevel(): number {
    const phase = this.snapshot.phase;
    if (phase === "speaking") return levelOf(this.outAnalyser, this.analyserBuf);
    if (phase === "listening") return levelOf(this.micAnalyser, this.analyserBuf);
    return 0;
  }

  private set(patch: Partial<EngineSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...patch };
    for (const l of this.listeners) l(this.snapshot);
  }

  private fail(error: EngineError, gen = this.gen): void {
    if (gen !== this.gen) return;
    this.teardown();
    this.set({ phase: "error", error });
  }

  async start(source: string, target: string): Promise<void> {
    if (!["idle", "ended", "error"].includes(this.snapshot.phase)) return;
    const gen = ++this.gen;
    this.released = false;
    this.set({ phase: "requesting-mic", error: null, lines: [], remaining: null, endedBecause: null });

    // Audio context must be created inside the click gesture (iOS/Safari).
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
      void this.ctx.resume();
    } catch {
      this.fail({ kind: "mic_unsupported" }, gen);
      return;
    }

    // 1. Microphone permission first — no credential is requested until it is granted.
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      this.fail({ kind: "mic_unsupported" }, gen);
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
      });
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      this.fail({
        kind:
          name === "NotAllowedError" || name === "SecurityError"
            ? "mic_denied"
            : name === "NotFoundError" || name === "NotReadableError"
              ? "mic_missing"
              : "mic_unsupported",
      }, gen);
      return;
    }
    if (gen !== this.gen || !this.ctx) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    this.stream = stream;

    const ctx = this.ctx;
    this.micAnalyser = ctx.createAnalyser();
    this.micAnalyser.fftSize = 1024;
    ctx.createMediaStreamSource(stream).connect(this.micAnalyser);
    this.outAnalyser = ctx.createAnalyser();
    this.outAnalyser.fftSize = 1024;
    this.outAnalyser.connect(ctx.destination);
    this.analyserBuf = new Float32Array(new ArrayBuffer(1024 * 4));
    this.player = new PcmPlayer(ctx, this.outAnalyser);

    // 2. Ask the server for a trial (consent was given in the UI before start()).
    this.set({ phase: "requesting-session" });
    let response: DemoSessionResponse;
    try {
      const res = await fetch("/api/voice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, target, consent: true }),
        credentials: "same-origin",
        cache: "no-store",
      });
      response = (await res.json()) as DemoSessionResponse;
    } catch {
      this.fail({ kind: "connection" }, gen);
      return;
    }
    if (gen !== this.gen) {
      // Superseded (page hidden / unmounted) while waiting: give the lease straight back.
      if (response.ok) {
        this.session = response;
        this.releaseLease();
        this.session = null;
      }
      return;
    }
    if (!response.ok) {
      this.fail({ kind: "refused", reason: response.reason }, gen);
      return;
    }
    this.session = response;
    this.set({ trialSeconds: response.trialSeconds });

    // 3. Connect to Soniox directly from the browser with the temporary keys.
    this.set({ phase: "connecting" });
    try {
      const { SonioxClient } = await import("@soniox/client");
      const granted = response;
      const client = new SonioxClient({
        config: async (context) => ({
          api_key: context?.usage === "tts_rt" ? granted.tts.apiKey : granted.stt.apiKey,
          ...(granted.region ? { region: granted.region } : {}),
        }),
      });
      if (gen !== this.gen) return;
      this.client = client as unknown as typeof this.client;
    } catch {
      this.fail({ kind: "connection" }, gen);
      return;
    }

    this.source = new SharedStreamSource(stream);
    const recording = this.client!.realtime.record({
      model: response.stt.model,
      audio_format: "auto",
      source: this.source,
      language_hints: [source, target],
      enable_language_identification: true,
      enable_endpoint_detection: true,
      max_endpoint_delay_ms: response.stt.maxEndpointDelayMs,
      context: response.stt.context,
      translation: { type: "two_way", language_a: source, language_b: target },
    });
    this.recording = recording;

    recording.on("connected", () => {
      if (gen !== this.gen) return;
      this.set({ phase: "listening", remaining: response.trialSeconds });
      this.startTimer(response.trialSeconds);
    });
    recording.on("result", (result: { tokens: SonioxTokenLike[] }) => {
      if (gen === this.gen) this.onTokens(result.tokens);
    });
    recording.on("endpoint", () => {
      if (gen === this.gen) this.onEndpoint();
    });
    recording.on("error", (error: Error & { code?: string; raw?: unknown }) => {
      if (gen === this.gen) this.onSonioxError(error);
    });
  }

  private startTimer(seconds: number): void {
    const endsAt = Date.now() + seconds * 1000;
    this.timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      if (remaining !== this.snapshot.remaining) this.set({ remaining });
      if (remaining <= 0) void this.stop("time");
    }, 250);
  }

  private newLine(): TranscriptLine {
    return {
      id: ++this.lineId,
      original: "",
      originalPartial: "",
      originalLang: null,
      translation: "",
      translationPartial: "",
      translationLang: null,
    };
  }

  private onTokens(tokens: SonioxTokenLike[]): void {
    const meaningful = tokens.filter((t) => !CONTROL_TOKENS.has(t.text));
    if (meaningful.length === 0) return;

    // Spoken tokens after an endpoint start a new line; translation tokens
    // that finalise just after the endpoint still belong to the last line.
    const hasSpoken = meaningful.some((t) => t.translation_status !== "translation");
    const lines = this.snapshot.lines.slice();
    if (lines.length === 0 || (hasSpoken && !this.utteranceOpen)) lines.push(this.newLine());
    if (hasSpoken) this.utteranceOpen = true;
    const line = { ...lines[lines.length - 1]! };

    let originalPartial = "";
    let translationPartial = "";
    let newFinalTranslation = "";
    let translationLang = line.translationLang;

    for (const token of meaningful) {
      const isTranslation = token.translation_status === "translation";
      if (isTranslation) {
        if (token.language) translationLang = token.language;
        if (token.is_final) {
          line.translation += token.text;
          newFinalTranslation += token.text;
        } else translationPartial += token.text;
      } else {
        if (token.language) line.originalLang = token.language;
        if (token.is_final) line.original += token.text;
        else originalPartial += token.text;
      }
    }
    line.originalPartial = originalPartial;
    line.translationPartial = translationPartial;
    line.translationLang = translationLang;

    lines[lines.length - 1] = line;
    this.set({ lines: lines.slice(-12) });

    if (newFinalTranslation && translationLang) {
      const pending = this.pendingSpeech;
      if (pending && pending.lang === translationLang) pending.text += newFinalTranslation;
      else {
        if (pending) this.enqueueSpeech(pending);
        this.pendingSpeech = { text: newFinalTranslation, lang: translationLang };
      }
      // Translations may finalise slightly after the endpoint — debounce the flush.
      if (!this.utteranceOpen) this.scheduleFlush();
    }
  }

  private onEndpoint(): void {
    this.utteranceOpen = false;
    this.scheduleFlush();
  }

  private scheduleFlush(): void {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => this.flushSpeech(), 350);
  }

  private flushSpeech(): void {
    this.flushTimer = null;
    const pending = this.pendingSpeech;
    this.pendingSpeech = null;
    if (pending && pending.text.trim()) this.enqueueSpeech(pending);
  }

  private enqueueSpeech(item: { text: string; lang: string }): void {
    if (!item.text.trim()) return;
    this.speechQueue.push({ text: item.text.trim(), lang: item.lang });
    if (!this.speaking) void this.speakNext();
  }

  private async speakNext(): Promise<void> {
    const item = this.speechQueue.shift();
    if (!item || !this.client || !this.session || !this.player) {
      this.speaking = false;
      this.afterSpeech();
      return;
    }
    this.speaking = true;
    if (this.snapshot.phase === "listening") {
      this.recording?.pause();
      this.set({ phase: "speaking" });
    }
    try {
      const stream = await this.client.realtime.tts({
        model: this.session.tts.model,
        voice: this.session.tts.voice,
        language: item.lang,
        audio_format: "pcm_s16le",
        sample_rate: TTS_SAMPLE_RATE,
      });
      this.activeTts = stream;
      await new Promise<void>((resolve) => {
        stream.on("audio", (chunk: Uint8Array) => this.player?.enqueue(chunk));
        stream.on("terminated", () => resolve());
        stream.on("error", () => resolve());
        stream.sendText(item.text, { end: true });
      });
      await this.waitForPlayback();
    } catch {
      // A failed spoken output should not discard the written translation.
      this.set({ error: { kind: "playback" } });
    } finally {
      this.activeTts = null;
    }
    if (this.speechQueue.length > 0 && this.client) return this.speakNext();
    this.speaking = false;
    this.afterSpeech();
  }

  private waitForPlayback(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (!this.player || this.player.remaining() <= 0.05) {
          if (this.resumeTimer) clearInterval(this.resumeTimer);
          this.resumeTimer = null;
          resolve();
        }
      };
      this.resumeTimer = setInterval(check, 100);
      check();
    });
  }

  private afterSpeech(): void {
    if (this.snapshot.phase === "speaking") {
      this.recording?.resume();
      this.set({ phase: "listening" });
    } else if (this.snapshot.phase === "stopping") {
      this.finish();
    }
  }

  private onSonioxError(error: Error & { code?: string; raw?: unknown }): void {
    const raw = JSON.stringify(error.raw ?? "") + String(error.message ?? "");
    // Soniox ends the stream at the key's max session duration: that is the trial ending, not a fault.
    if (/session duration limit|temp_api_key_session_expired/i.test(raw)) {
      void this.stop("time");
      return;
    }
    if (["stopping", "ended"].includes(this.snapshot.phase)) return;
    this.fail({ kind: error.code === "network_error" || error.code === "connection_error" ? "connection" : "provider" });
  }

  async stop(because: "user" | "time" = "user"): Promise<void> {
    if (!["listening", "speaking", "connecting"].includes(this.snapshot.phase)) return;
    this.set({ phase: "stopping", endedBecause: because });
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    const recording = this.recording;
    if (recording) {
      try {
        await Promise.race([recording.stop(), new Promise((r) => setTimeout(r, 4000))]);
      } catch {
        /* final results are best-effort */
      }
      recording.cancel();
    }
    this.flushSpeech();
    if (!this.speaking) this.finish();
  }

  private finish(): void {
    this.teardown();
    if (this.snapshot.phase !== "error") this.set({ phase: "ended" });
  }

  /** Releases the server lease early. Safe to call more than once. */
  private releaseLease(): void {
    const s = this.session;
    if (!s || this.released) return;
    this.released = true;
    const payload = JSON.stringify({ sessionId: s.sessionId, sessionToken: s.sessionToken, expiresAt: s.expiresAt });
    try {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon?.("/api/voice/session/end", blob)) return;
    } catch {
      /* fall through */
    }
    void fetch("/api/voice/session/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => undefined);
  }

  private teardown(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.flushTimer) clearTimeout(this.flushTimer);
    if (this.resumeTimer) clearInterval(this.resumeTimer);
    this.timer = this.flushTimer = this.resumeTimer = null;
    try {
      this.recording?.cancel();
    } catch {
      /* ignore */
    }
    this.recording = null;
    try {
      this.activeTts?.cancel();
    } catch {
      /* ignore */
    }
    this.activeTts = null;
    this.speechQueue = [];
    this.pendingSpeech = null;
    this.speaking = false;
    this.utteranceOpen = false;
    this.source?.stop();
    this.source = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.player?.stopAll();
    this.player = null;
    void this.ctx?.close().catch(() => undefined);
    this.ctx = null;
    this.micAnalyser = this.outAnalyser = null;
    this.client = null;
    this.releaseLease();
    // Credentials are dropped from memory as soon as the trial ends.
    this.session = null;
  }

  /** Called on unmount / page hide: ends any session and cancels in-flight starts. */
  dispose(): void {
    this.gen++;
    this.teardown();
    this.set({ phase: "idle", remaining: null });
  }

  reset(): void {
    if (["ended", "error"].includes(this.snapshot.phase)) {
      this.set({ phase: "idle", error: null, remaining: null, endedBecause: null });
    }
  }
}

interface RecordingLike {
  on(event: string, handler: (...args: never[]) => void): unknown;
  stop(): Promise<void>;
  cancel(): void;
  pause(): void;
  resume(): void;
}

interface TtsStreamLike {
  on(event: string, handler: (...args: never[]) => void): unknown;
  sendText(text: string, options?: { end?: boolean }): void;
  cancel(): void;
}
