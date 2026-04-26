"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import BackgroundDecoration from "@/components/ui/background-decoration";
import { cn } from "@/lib/utils";
import Section from "@/components/marketing/layout/Section";

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

function getExternalLinkProps(href: string) {
  return href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

function PrimaryButton({ href, children }: { href: string; children: ReactNode }) {
  const externalProps = getExternalLinkProps(href);

  return (
    <a
      href={href}
      {...externalProps}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-6 py-3",
        "bg-primary text-sm font-semibold text-primary-foreground",
        "hover:bg-primary/90 active:bg-primary/80",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {children}
      <svg
        className="h-4 w-4"
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
  const externalProps = getExternalLinkProps(href);

  return (
    <a
      href={href}
      {...externalProps}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-6 py-3",
        "border border-border bg-background text-sm font-semibold text-foreground",
        "hover:bg-secondary active:bg-secondary/80",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <svg
        className="h-4 w-4 text-primary"
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
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-3xl font-bold text-primary">{value}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export default function HeroSection({
  titleLine1 = "The video platform",
  titleLine2 = "that plays fair.",
  description = "An open-source project for a healthier internet, built around transparency, fairness, and creators.",
  primaryCTA = "Explore the app",
  primaryCTAHref = "/explore?popup",
  secondaryCTA = "Watch Intro",
  secondaryCTAHref = "https://lab.fairplay.video/video/b79f9273-16de-434c-8f69-4fd9f1a2f959",
  stats = DEFAULT_STATS,
}: HeroProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Section className="relative overflow-hidden">
      <BackgroundDecoration disableOnMobile />

      <div className="pointer-events-none absolute inset-0 z-[1] hidden bg-gradient-to-b from-transparent via-background/60 to-background md:block" />

      <div className="relative z-10 flex w-full flex-col items-center">
        <h1
          className={cn(
            "mb-6 max-w-3xl text-center transition-all duration-700 ease-out delay-100",
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          <span className="block text-4xl font-extrabold leading-tight text-foreground sm:text-5xl lg:text-6xl">
            {titleLine1}
          </span>
          <span className="block text-4xl font-extrabold italic leading-tight text-primary sm:text-5xl lg:text-6xl">
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
