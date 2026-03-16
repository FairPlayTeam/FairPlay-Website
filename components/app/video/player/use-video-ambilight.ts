"use client";

import { useCallback, useEffect, useRef } from "react";

type UseVideoAmbilightArgs = {
  videoRef: { current: HTMLVideoElement | null };
  glowRef: { current: HTMLCanvasElement | null };
  blendFactor?: number;
  sampleIntervalMs?: number;
  scale?: number;
  blurPx?: number;
  opacity?: number;
  enabled?: boolean;
};

/** Interval between two frame captures (ms). */
const DEFAULT_AMBILIGHT_SAMPLE_INTERVAL_MS = 80;

/**
 * Lerp factor applied each tick between the previous canvas state and the
 * new frame. Lower = smoother / slower transitions. Range: 0.05 – 1.0
 */
const DEFAULT_AMBILIGHT_BLEND_FACTOR = 0.08;

/**
 * Internal sampling resolution. Small keeps drawImage() fast.
 * 32x18 keeps 16:9 and is enough for a blurred glow.
 */
const CANVAS_W = 32;
const CANVAS_H = 18;

/**
 * CSS blur radius applied to the glow canvas.
 * Increase for a softer / more diffused halo.
 */
const DEFAULT_AMBILIGHT_BLUR_PX = 110;

/**
 * Opacity of the glow canvas.
 */
const DEFAULT_AMBILIGHT_OPACITY = 0.4;

export function useVideoAmbilight({
  videoRef,
  glowRef,
  blendFactor = DEFAULT_AMBILIGHT_BLEND_FACTOR,
  sampleIntervalMs = DEFAULT_AMBILIGHT_SAMPLE_INTERVAL_MS,
  blurPx = DEFAULT_AMBILIGHT_BLUR_PX,
  opacity = DEFAULT_AMBILIGHT_OPACITY,
  enabled = true,
}: UseVideoAmbilightArgs) {
  // Off-screen canvas used to capture video frames at low resolution.
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sampleCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Previous frame pixel data, used for per-pixel lerp.
  const prevDataRef = useRef<Uint8ClampedArray | null>(null);

  // RAF handle for cleanup.
  const rafRef = useRef<number | null>(null);

  // Timestamp of the last ambilight tick.
  const lastTickRef = useRef(0);

  // Permanently disabled on cross-origin errors.
  const disabledRef = useRef(false);

  // Returns (and lazily creates) the off-screen sampling context.
  const getSampleCtx = useCallback((): CanvasRenderingContext2D | null => {
    if (sampleCtxRef.current) return sampleCtxRef.current;

    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    sampleCanvasRef.current = canvas;
    sampleCtxRef.current = ctx;
    return ctx;
  }, []);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    glow.style.filter = `blur(${blurPx}px)`;
    glow.style.opacity = "0";
    glow.style.transition = "opacity 1.2s ease";
  }, [glowRef, blurPx]);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    // Smoothly fade the glow in/out when ambilight is toggled.
    glow.style.opacity = enabled ? String(opacity) : "0";
  }, [enabled, opacity, glowRef]);

  // Resize handling
  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const observer = new ResizeObserver(() => {
      const glowCtx = glow.getContext("2d");
      if (!glowCtx) return;
      glow.width = glow.offsetWidth || 320;
      glow.height = glow.offsetHeight || 180;
    });

    observer.observe(glow.parentElement || glow);
    return () => observer.disconnect();
  }, [glowRef]);

  // Main RAF loop
  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      rafRef.current = window.requestAnimationFrame(tick);

      if (disabledRef.current) return;

      const now = performance.now();
      if (now - lastTickRef.current < sampleIntervalMs) return;
      lastTickRef.current = now;

      const video = videoRef.current;
      const glow = glowRef.current;

      if (
        !video ||
        !glow ||
        video.readyState < 2 ||
        video.paused ||
        video.ended ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      )
        return;

      const sampleCtx = getSampleCtx();
      if (!sampleCtx) return;

      try {
        // Capture current frame at low resolution.
        sampleCtx.drawImage(video, 0, 0, CANVAS_W, CANVAS_H);
        const imageData = sampleCtx.getImageData(0, 0, CANVAS_W, CANVAS_H);
        const current = imageData.data; // Uint8ClampedArray, length = W*H*4

        // Per-pixel lerp with the previous frame for smooth transitions.
        if (prevDataRef.current) {
          const prev = prevDataRef.current;
          const t = blendFactor;
          for (let i = 0; i < current.length; i++) {
            current[i] = Math.round(prev[i]! + (current[i]! - prev[i]!) * t);
          }
          // Write blended pixels back so drawImage picks them up on the glow canvas.
          sampleCtx.putImageData(imageData, 0, 0);
        }

        // Store blended frame as the new "previous".
        prevDataRef.current = new Uint8ClampedArray(current);

        // Paint the blended low-res frame onto the glow canvas,
        const glowCtx = glow.getContext("2d");
        if (!glowCtx) return;

        // Sync canvas dimensions to its rendered size once.
        if (glow.width !== glow.offsetWidth || glow.height !== glow.offsetHeight) {
          glow.width = glow.offsetWidth || 320;
          glow.height = glow.offsetHeight || 180;
        }

        glowCtx.drawImage(sampleCanvasRef.current!, 0, 0, glow.width, glow.height);

        // Fade in on first valid frame.
        if (!glow.dataset.ambilightReady) {
          glow.dataset.ambilightReady = "1";
          setTimeout(() => {
            if (glowRef.current) {
              glowRef.current.style.opacity = String(opacity);
            }
          }, 0);
        }
      } catch {
        // Cross-origin video, disable permanently.
        disabledRef.current = true;
      }
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      sampleCanvasRef.current = null;
      sampleCtxRef.current = null;
      prevDataRef.current = null;
    };
  }, [getSampleCtx, glowRef, videoRef, blendFactor, sampleIntervalMs, opacity, enabled]);
}
