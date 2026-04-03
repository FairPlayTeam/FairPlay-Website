"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";
import { cn } from "@/lib/utils";
import Section from "../layout/Section";

interface StatItem {
  value: string;
  label: string;
}

interface HeroProps {
  titleLine1?: string;
  titleLine2?: string;
  description?: string;
  primaryCTA?: string;
  primaryCTAHref?: string;
  secondaryCTA?: string;
  secondaryCTAHref?: string;
  stats?: StatItem[];
}

const DEFAULT_STATS: StatItem[] = [
  { value: "116", label: "Accounts" },
  { value: "6,000", label: "Average monthly visits" },
  { value: "398", label: "Discord members" },
];

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
  { src: ICON_CODE, width: 32, height: 32 },
  { src: ICON_GITHUB, width: 32, height: 32 },
  { src: ICON_PLAY, width: 32, height: 32 },
  { src: ICON_PLAY, width: 32, height: 32 },
];

const PARTICLES_CONFIG: ISourceOptions = {
  fullScreen: { enable: false },
  background: { color: { value: "transparent" } },
  fpsLimit: 60,
  particles: {
    number: { value: 10, density: { enable: false } },
    collisions: { enable: true },
    shape: {
      type: "image",
      options: { image: PARTICLE_IMAGES },
    },
    opacity: {
      value: { min: 0.25, max: 0.7 },
      animation: { enable: true, speed: 0.3, sync: false },
    },
    size: {
      value: { min: 14, max: 28 },
    },
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
      direction: "none",
      random: true,
      straight: false,
      outModes: { default: "bounce" },
    },
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: "grab" },
      resize: { enable: true },
    },
    modes: {
      grab: { distance: 100, links: { opacity: 0.4 } },
    },
  },
  detectRetina: true,
};

function PrimaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center gap-2 px-6 py-3 rounded-full",
        "bg-primary text-primary-foreground font-semibold text-sm",
        "hover:bg-primary/90 active:bg-primary/80",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {children}
      <svg
        className="w-4 h-4"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

function SecondaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center gap-2 px-6 py-3 rounded-full",
        "border border-border bg-background text-foreground font-semibold text-sm",
        "hover:bg-secondary active:bg-secondary/80",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <svg
        className="w-4 h-4 text-primary"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="6.5" />
        <path d="M6.5 5.5l4 2.5-4 2.5V5.5Z" fill="currentColor" stroke="none" />
      </svg>
      {children}
    </a>
  );
}

function StatDisplay({ value, label }: StatItem) {
  return (
    <div className="flex flex-col text-center items-center gap-1">
      <span className="text-3xl font-bold text-primary">{value}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export default function HeroSection({
  titleLine1 = "The video platform",
  titleLine2 = "that plays fair.",
  description = "An open-source project for a healthier internet, with transparency, Work In Progress",
  primaryCTA = "Explore the app",
  primaryCTAHref = "/explore?popup",
  secondaryCTA = "Watch Intro",
  secondaryCTAHref = "https://lab.fairplay.video/video/b79f9273-16de-434c-8f69-4fd9f1a2f959",
  stats = DEFAULT_STATS,
}: HeroProps) {
  const [engineReady, setEngineReady] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [particlesVisible, setParticlesVisible] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setEngineReady(true));
  }, []);

  useEffect(() => {
    if (!engineReady) return;
    const timer = setTimeout(() => setParticlesVisible(true), 300);
    return () => clearTimeout(timer);
  }, [engineReady]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Section className="relative overflow-hidden">
      {engineReady && (
        <>
          <div
            className={cn(
              "pointer-events-none absolute -top-4 -left-4 w-[500px] h-[500px] z-0",
              "transition-opacity duration-1000 ease-in",
              particlesVisible ? "opacity-100" : "opacity-0",
            )}
          >
            <Particles id="particles-tl" className="w-full h-full" options={PARTICLES_CONFIG} />
          </div>
          <div
            className={cn(
              "pointer-events-none absolute -bottom-4 -right-4 w-[500px] h-[500px] z-0",
              "transition-opacity duration-1000 ease-in",
              particlesVisible ? "opacity-100" : "opacity-0",
            )}
          >
            <Particles id="particles-br" className="w-full h-full" options={PARTICLES_CONFIG} />
          </div>
        </>
      )}

      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-background/60 to-background" />

      <div className="relative z-10 flex w-full flex-col items-center px-5 sm:px-8">
        <h1
          className={cn(
            "mb-6 max-w-3xl text-center transition-all duration-700 ease-out delay-100",
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          <span className="block text-4xl font-extrabold leading-tight text-foreground sm:text-5xl lg:text-6xl">
            {titleLine1}
          </span>
          <span className="block text-4xl font-extrabold leading-tight text-primary italic sm:text-5xl lg:text-6xl">
            {titleLine2}
          </span>
        </h1>

        <p
          className={cn(
            "mb-10 max-w-lg text-center text-base leading-relaxed text-muted-foreground sm:text-lg",
            "transition-all duration-700 ease-out delay-200",
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          {description}
        </p>

        <div
          className={cn(
            "mb-16 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center",
            "transition-all duration-700 ease-out delay-300",
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          <PrimaryButton href={primaryCTAHref}>{primaryCTA}</PrimaryButton>
          <SecondaryButton href={secondaryCTAHref}>{secondaryCTA}</SecondaryButton>
        </div>

        {stats.length > 0 && (
          <div
            className={cn(
              "grid w-full max-w-lg grid-cols-1 gap-6 min-[480px]:grid-cols-3 sm:gap-10",
              "transition-all duration-700 ease-out delay-500",
              animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            {stats.map((stat, i) => (
              <StatDisplay key={i} {...stat} />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
