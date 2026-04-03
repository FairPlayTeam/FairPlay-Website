"use client";

import { useEffect } from "react";
import MarketingTopbar from "@/components/marketing/layout/MarketingTopbar";
import HeroSection from "@/components/marketing/sections/HeroSection";
import MissionSection from "@/components/marketing/sections/MissionSection";
import FeatureGrid from "./sections/FeatureSection";
import MarketingFooter from "@/components/marketing/layout/MarketingFooter";
import FadeInSection from "@/components/marketing/sections/FadeInSection";
import OpenSourceSection from "./sections/OpenSourceSection";
import CommunitySection from "./sections/CommunitySection";
import SupportSection from "./sections/SupportSection";
import ExtensionSection from "./sections/ExtensionSection";
import PlayerShowcaseSection from "./sections/PlayerShowcaseSection";

const PAGE_SHELL = "mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12";

function useScrollToHash() {
  useEffect(() => {
    const scrollTo = () => {
      const hash = window.location.hash;
      if (!hash) return;
      const target = document.querySelector<HTMLElement>(hash);
      const header = document.querySelector<HTMLElement>(".main-header");
      const offset = header ? header.offsetHeight + 50 : 0;
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    };
    scrollTo();
    window.addEventListener("hashchange", scrollTo);
    return () => window.removeEventListener("hashchange", scrollTo);
  }, []);
}

export default function HomePageClient() {
  useScrollToHash();

  return (
    <>
      <MarketingTopbar />

      <main className="mx-auto w-full">
        <HeroSection />
        <PlayerShowcaseSection />
      </main>

      <MissionSection />

      <main className={PAGE_SHELL}>
        <FeatureGrid />
        <ExtensionSection />
      </main>

      <FadeInSection>
        <OpenSourceSection />
      </FadeInSection>

      <main className={PAGE_SHELL}>
        <CommunitySection />
        <SupportSection />
      </main>

      <MarketingFooter variant="primary" />
    </>
  );
}
