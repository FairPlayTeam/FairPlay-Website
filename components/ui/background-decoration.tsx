"use client";

import { memo, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";
import { cn } from "@/lib/utils";

function svgToDataUrl(svg: string): string {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

const ICON_AVATAR =
  svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <circle cx="16" cy="16" r="15" stroke="#2E79D5" stroke-width="1.5" />
  <circle cx="16" cy="13" r="5" fill="#2E79D5" opacity="0.8"/>
  <path d="M6 26c0-5.523 4.477-8 10-8s10 2.477 10 8" stroke="#2E79D5" stroke-width="1.5" fill="none" stroke-linecap="round"/>
</svg>`);

const ICON_CODE =
  svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect x="1" y="1" width="30" height="30" rx="7" stroke="#2E79D5" stroke-width="1.5"/>
  <path d="M11 11l-5 5 5 5" stroke="#2E79D5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M21 11l5 5-5 5" stroke="#2E79D5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M18 9l-4 14" stroke="#378ADD" stroke-width="1.8" stroke-linecap="round" opacity="0.7"/>
</svg>`);

const ICON_GITHUB =
  svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <circle cx="16" cy="16" r="15" stroke="#2E79D5" stroke-width="1.5"/>
  <path d="M16 7C11.03 7 7 11.03 7 16c0 3.978 2.579 7.356 6.156 8.549.45.083.615-.195.615-.434 0-.214-.008-.78-.012-1.531-2.503.544-3.031-1.206-3.031-1.206-.409-1.04-1-1.317-1-1.317-.817-.559.062-.547.062-.547.904.063 1.379.928 1.379.928.803 1.376 2.107.979 2.62.748.081-.582.314-.979.572-1.204-1.998-.227-4.1-1-4.1-4.447 0-.982.351-1.785.927-2.414-.093-.228-.402-1.142.088-2.38 0 0 .756-.242 2.476.923A8.63 8.63 0 0116 11.458c.765.004 1.535.104 2.254.304 1.719-1.165 2.474-.923 2.474-.923.491 1.238.182 2.152.09 2.38.577.629.926 1.432.926 2.414 0 3.456-2.105 4.217-4.11 4.44.323.279.611.83.611 1.672 0 1.207-.011 2.181-.011 2.477 0 .241.163.522.619.434C22.424 23.352 25 19.977 25 16c0-4.97-4.03-9-9-9z" fill="#2E79D5"/>
</svg>`);

const ICON_PLAY =
  svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <circle cx="16" cy="16" r="15" stroke="#2E79D5" stroke-width="1.5"/>
  <path d="M13 10.5l9 5.5-9 5.5V10.5z" fill="#2E79D5"/>
</svg>`);

const PARTICLE_IMAGES = [
  { src: ICON_AVATAR, width: 32, height: 32 },
  { src: ICON_AVATAR, width: 32, height: 32 },
  { src: ICON_PLAY, width: 32, height: 32 },
  { src: ICON_PLAY, width: 32, height: 32 },
  { src: ICON_CODE, width: 32, height: 32 },
  { src: ICON_GITHUB, width: 32, height: 32 },
];

const PARTICLES_CONFIG: ISourceOptions = {
  fullScreen: { enable: false },
  background: { color: { value: "transparent" } },
  fpsLimit: 60,
  particles: {
    number: {
      value: 60,
      density: { enable: true },
    },
    collisions: { enable: true },
    shape: { type: "image", options: { image: PARTICLE_IMAGES } },
    opacity: {
      value: { min: 0.25, max: 0.7 },
      animation: { enable: true, speed: 0.3 },
    },
    size: { value: { min: 14, max: 28 } },
    rotate: {
      value: { min: -15, max: 15 },
      animation: { enable: true, speed: 0.3 },
      direction: "random",
    },
    links: {
      enable: true,
      distance: 220,
      color: "#2E79D5",
      opacity: 0.3,
      width: 0.7,
    },
    move: {
      enable: true,
      speed: 0.3,
      random: true,
      outModes: { default: "bounce" },
    },
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: "grab" },
    },
    modes: {
      grab: { distance: 100, links: { opacity: 0.4 } },
    },
  },
  detectRetina: true,
};

interface BackgroundDecorationProps {
  className?: string;
  disableOnMobile?: boolean;
}

const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

function BackgroundDecoration({
  className,
  disableOnMobile = false,
}: BackgroundDecorationProps) {
  const [engineReady, setEngineReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [shouldRenderDecoration, setShouldRenderDecoration] = useState(!disableOnMobile);

  useEffect(() => {
    if (!disableOnMobile) return;

    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const syncViewport = () => setShouldRenderDecoration(!mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, [disableOnMobile]);

  useEffect(() => {
    if (!shouldRenderDecoration) return;

    let mounted = true;

    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      if (mounted) {
        setEngineReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, [shouldRenderDecoration]);

  useEffect(() => {
    if (!engineReady) return;
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, [engineReady]);

  if (!shouldRenderDecoration) {
    return null;
  }

  return (
    <div className={cn("absolute inset-0 z-0", className)}>
      {engineReady && (
        <Particles
          id="particles-bg"
          className={cn(
            "absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in",
            visible ? "opacity-100" : "opacity-0",
          )}
          options={PARTICLES_CONFIG}
        />
      )}

      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-background/20 to-background/90" />
    </div>
  );
}

export default memo(BackgroundDecoration);
