"use client";

import { useEffect, useRef } from "react";

interface VoiceWaveformProps {
  /** Returns the current 0..1 audio level. Omit for an ambient (decorative) waveform. */
  getLevel?: () => number;
  /** When false the waveform settles to a calm idle line. */
  active?: boolean;
  /** Visual intensity of the idle motion. */
  idleAmplitude?: number;
  className?: string;
}

const CYAN = "94,234,212";
const BLUE = "56,189,248";
const IRIS = "139,92,246";

/**
 * Two interleaved language streams drawn on a canvas. Amplitude follows the
 * real microphone / playback level when `getLevel` is supplied; otherwise it
 * breathes gently. Fully static under prefers-reduced-motion, and the
 * animation loop pauses when off-screen or when the tab is hidden.
 */
export function VoiceWaveform({ getLevel, active = false, idleAmplitude = 0.12, className }: VoiceWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const levelRef = useRef(getLevel);
  const activeRef = useRef(active);
  levelRef.current = getLevel;
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = true;
    let smoothed = 0;
    let t = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const target = activeRef.current && levelRef.current ? levelRef.current() : 0;
      smoothed += (target - smoothed) * 0.18;
      const amp = (idleAmplitude + smoothed * 0.85) * height * 0.42;
      const mid = height / 2;
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, `rgba(${CYAN},0)`);
      gradient.addColorStop(0.18, `rgba(${CYAN},0.9)`);
      gradient.addColorStop(0.5, `rgba(${BLUE},0.95)`);
      gradient.addColorStop(0.82, `rgba(${IRIS},0.9)`);
      gradient.addColorStop(1, `rgba(${IRIS},0)`);

      const layers = [
        { phase: 0, freq: 2.2, weight: 1, alpha: 1, lineWidth: 2 },
        { phase: Math.PI * 0.85, freq: 2.2, weight: 0.82, alpha: 0.55, lineWidth: 1.5 },
        { phase: Math.PI * 0.4, freq: 3.4, weight: 0.45, alpha: 0.3, lineWidth: 1 },
      ];

      for (const layer of layers) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 3) {
          const p = x / width;
          // Envelope tapers both ends so the streams meet at a point, like the logo.
          const envelope = Math.sin(Math.PI * p) ** 1.6;
          const y =
            mid +
            Math.sin(p * Math.PI * layer.freq * 2 + t + layer.phase) *
              amp *
              layer.weight *
              envelope;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = gradient;
        ctx.globalAlpha = layer.alpha;
        ctx.lineWidth = layer.lineWidth;
        ctx.shadowColor = `rgba(${BLUE},0.55)`;
        ctx.shadowBlur = layer.alpha === 1 ? 10 : 0;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    const loop = () => {
      t += 0.03 + smoothed * 0.08;
      draw();
      raf = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      cancelAnimationFrame(raf);
      if (reduced) {
        draw();
        return;
      }
      if (visible && document.visibilityState === "visible") raf = requestAnimationFrame(loop);
    };

    resize();
    draw();
    startLoop();

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      startLoop();
    });
    io.observe(canvas);
    const onVisibility = () => startLoop();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [idleAmplitude]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
