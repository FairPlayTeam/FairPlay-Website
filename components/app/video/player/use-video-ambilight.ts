'use client'

import { useCallback, useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GlowRgb = { r: number; g: number; b: number }

type AmbilightColors = {
  top: GlowRgb
  right: GlowRgb
  bottom: GlowRgb
  left: GlowRgb
  core: GlowRgb
}

type UseVideoAmbilightArgs = {
  videoRef: { current: HTMLVideoElement | null }
  glowRef: { current: HTMLDivElement | null }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Interval between two color samples (ms). Keeps CPU usage low. */
const AMBILIGHT_SAMPLE_INTERVAL_MS = 220

/**
 * Lerp factor applied each tick.
 * Lower = smoother / slower transitions. Range: 0.05 – 0.5
 */
const AMBILIGHT_BLEND_FACTOR = 0.22

/**
 * Saturation boost multiplier applied to sampled colors.
 * Values > 1 make dull / dark scenes still look vibrant.
 */
const AMBILIGHT_SATURATION_BOOST = 1.7

/**
 * Radius (in canvas pixels) of the averaging kernel used when sampling
 * each zone. Larger radius = more stable, less noisy colors.
 */
const AMBILIGHT_SAMPLE_RADIUS = 2

/** Internal canvas resolution. Small = fast; 32×18 keeps 16:9 ratio. */
const CANVAS_W = 32
const CANVAS_H = 18

/** CSS variable names — single source of truth shared with the gradient. */
export const AMBILIGHT_CSS_VARS = {
  top: '--ambilight-top',
  right: '--ambilight-right',
  bottom: '--ambilight-bottom',
  left: '--ambilight-left',
  core: '--ambilight-core',
} as const

/**
 * Ready-to-use radial-gradient background value.
 * Apply this to the glow layer that sits behind (or around) the video.
 *
 * @example
 *   <div style={{ background: AMBILIGHT_BACKGROUND }} />
 */
export const AMBILIGHT_BACKGROUND =
  [
    'radial-gradient(75% 55% at 50% 10%,   var(--ambilight-top),    transparent 65%)',
    'radial-gradient(68% 62% at 94% 48%,   var(--ambilight-right),  transparent 70%)',
    'radial-gradient(75% 58% at 50% 96%,   var(--ambilight-bottom), transparent 68%)',
    'radial-gradient(68% 62% at 6%  48%,   var(--ambilight-left),   transparent 70%)',
    'radial-gradient(56% 56% at 50% 50%,   var(--ambilight-core),   transparent 72%)',
  ].join(', ')

/** Neutral starting point — all zones black so the glow is invisible on load. */
const DEFAULT_COLORS: AmbilightColors = {
  top:    { r: 0, g: 0, b: 0 },
  right:  { r: 0, g: 0, b: 0 },
  bottom: { r: 0, g: 0, b: 0 },
  left:   { r: 0, g: 0, b: 0 },
  core:   { r: 0, g: 0, b: 0 },
}

// ---------------------------------------------------------------------------
// Pure color helpers (no React deps — defined outside the hook)
// ---------------------------------------------------------------------------

/** Linear interpolation between two RGB colors. */
function blendRgb(current: GlowRgb, target: GlowRgb, t: number): GlowRgb {
  return {
    r: Math.round(current.r + (target.r - current.r) * t),
    g: Math.round(current.g + (target.g - current.g) * t),
    b: Math.round(current.b + (target.b - current.b) * t),
  }
}

/**
 * Boost saturation of an RGB color without converting to HSL.
 * Moves each channel away from the grey axis by `factor`.
 */
function boostSaturation({ r, g, b }: GlowRgb, factor: number): GlowRgb {
  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)))
  return {
    r: clamp(128 + (r - 128) * factor),
    g: clamp(128 + (g - 128) * factor),
    b: clamp(128 + (b - 128) * factor),
  }
}

/** Build a CSS `rgba(…)` string. */
function toRgba({ r, g, b }: GlowRgb, alpha: number): string {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Average the pixels inside a square kernel centered on (cx, cy).
 * Clamps coordinates to canvas boundaries so edge samples are safe.
 */
function sampleRegion(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  cx: number,
  cy: number,
  radius: number,
): GlowRgb {
  let r = 0, g = 0, b = 0, count = 0
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const x = Math.max(0, Math.min(width  - 1, cx + dx))
      const y = Math.max(0, Math.min(height - 1, cy + dy))
      const i = (y * width + x) * 4
      r += pixels[i]!
      g += pixels[i + 1]!
      b += pixels[i + 2]!
      count++
    }
  }
  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count),
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useVideoAmbilight({ videoRef, glowRef }: UseVideoAmbilightArgs) {
  // Canvas used for pixel-sampling — created once, never attached to the DOM.
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const sampleCtxRef    = useRef<CanvasRenderingContext2D | null>(null)

  // RAF handle for cleanup.
  const rafRef = useRef<number | null>(null)

  // Timestamp of the last ambilight tick (for throttling).
  const lastTickRef = useRef(0)

  // Whether ambilight has been permanently disabled (e.g. cross-origin video).
  const disabledRef = useRef(false)

  // Smoothed colors — mutated in place to avoid allocations each frame.
  const colorsRef = useRef<AmbilightColors>(structuredClone(DEFAULT_COLORS))

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  /** Write the five CSS variables onto the glow element. */
  const applyCssVars = useCallback(
    (colors: AmbilightColors, alpha?: Partial<Record<keyof AmbilightColors, number>>) => {
      const glow = glowRef.current
      if (!glow) return
      glow.style.setProperty(AMBILIGHT_CSS_VARS.top,    toRgba(colors.top,    alpha?.top    ?? 0.42))
      glow.style.setProperty(AMBILIGHT_CSS_VARS.right,  toRgba(colors.right,  alpha?.right  ?? 0.34))
      glow.style.setProperty(AMBILIGHT_CSS_VARS.bottom, toRgba(colors.bottom, alpha?.bottom ?? 0.34))
      glow.style.setProperty(AMBILIGHT_CSS_VARS.left,   toRgba(colors.left,   alpha?.left   ?? 0.34))
      glow.style.setProperty(AMBILIGHT_CSS_VARS.core,   toRgba(colors.core,   alpha?.core   ?? 0.24))
    },
    [glowRef],
  )

  /** Lazily create (or return cached) the sampling canvas context. */
  const getSampleCtx = useCallback((): CanvasRenderingContext2D | null => {
    if (sampleCtxRef.current) return sampleCtxRef.current

    const canvas = document.createElement('canvas')
    canvas.width  = CANVAS_W
    canvas.height = CANVAS_H
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null

    sampleCanvasRef.current = canvas
    sampleCtxRef.current    = ctx
    return ctx
  }, [])

  // Initialise CSS vars à alpha 0 — le glow est invisible au chargement.
  useEffect(() => {
    const zero = { top: 0, right: 0, bottom: 0, left: 0, core: 0 }
    applyCssVars(DEFAULT_COLORS, zero)
  }, [applyCssVars])

  // -------------------------------------------------------------------------
  // Main RAF loop
  // -------------------------------------------------------------------------
  useEffect(() => {
    const tick = () => {
      rafRef.current = window.requestAnimationFrame(tick)

      // Permanently disabled (e.g. CORS error).
      if (disabledRef.current) return

      // Throttle to AMBILIGHT_SAMPLE_INTERVAL_MS.
      const now = performance.now()
      if (now - lastTickRef.current < AMBILIGHT_SAMPLE_INTERVAL_MS) return
      lastTickRef.current = now

      const video = videoRef.current

      // Skip when there is nothing meaningful to read.
      if (
        !video               ||
        video.readyState < 2 ||
        video.paused         ||
        video.ended          ||
        video.videoWidth  === 0 ||
        video.videoHeight === 0
      ) return

      const ctx = getSampleCtx()
      if (!ctx) return

      try {
        // Down-sample the current video frame onto our tiny canvas.
        ctx.drawImage(video, 0, 0, CANVAS_W, CANVAS_H)
        const { data, width, height } = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H)

        const cx = Math.floor(width  / 2)
        const cy = Math.floor(height / 2)
        const r  = AMBILIGHT_SAMPLE_RADIUS

        // Sample one zone per edge + the centre.
        const rawTargets: AmbilightColors = {
          top:    sampleRegion(data, width, height, cx,          r,          r),
          right:  sampleRegion(data, width, height, width - 1 - r, cy,       r),
          bottom: sampleRegion(data, width, height, cx,          height - 1 - r, r),
          left:   sampleRegion(data, width, height, r,           cy,         r),
          core:   sampleRegion(data, width, height, cx,          cy,         r),
        }

        // Boost saturation so dark / grey scenes still glow nicely.
        const targets: AmbilightColors = {
          top:    boostSaturation(rawTargets.top,    AMBILIGHT_SATURATION_BOOST),
          right:  boostSaturation(rawTargets.right,  AMBILIGHT_SATURATION_BOOST),
          bottom: boostSaturation(rawTargets.bottom, AMBILIGHT_SATURATION_BOOST),
          left:   boostSaturation(rawTargets.left,   AMBILIGHT_SATURATION_BOOST),
          core:   boostSaturation(rawTargets.core,   AMBILIGHT_SATURATION_BOOST),
        }

        // Lerp current → target for smooth transitions.
        const next: AmbilightColors = {
          top:    blendRgb(colorsRef.current.top,    targets.top,    AMBILIGHT_BLEND_FACTOR),
          right:  blendRgb(colorsRef.current.right,  targets.right,  AMBILIGHT_BLEND_FACTOR),
          bottom: blendRgb(colorsRef.current.bottom, targets.bottom, AMBILIGHT_BLEND_FACTOR),
          left:   blendRgb(colorsRef.current.left,   targets.left,   AMBILIGHT_BLEND_FACTOR),
          core:   blendRgb(colorsRef.current.core,   targets.core,   AMBILIGHT_BLEND_FACTOR),
        }

        colorsRef.current = next
        applyCssVars(next)
      } catch {
        // Most likely a cross-origin video — disable permanently.
        disabledRef.current = true
      }
    }

    rafRef.current = window.requestAnimationFrame(tick)

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      // Release the off-screen canvas.
      sampleCanvasRef.current = null
      sampleCtxRef.current    = null
    }
  }, [applyCssVars, getSampleCtx, videoRef])
}