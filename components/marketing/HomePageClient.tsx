"use client";

import { useEffect } from "react";
import MarketingFooter from "@/components/marketing/layout/MarketingFooter";
import MarketingTopbar from "@/components/marketing/layout/MarketingTopbar";
import CommunitySection from "@/components/marketing/sections/CommunitySection";
import ExtensionSection from "@/components/marketing/sections/ExtensionSection";
import FadeInSection from "@/components/marketing/sections/FadeInSection";
import FeatureGrid from "@/components/marketing/sections/FeatureSection";
import HeroSection from "@/components/marketing/sections/HeroSection";
import MissionSection from "@/components/marketing/sections/MissionSection";
import OpenSourceSection from "@/components/marketing/sections/OpenSourceSection";
import PlayerShowcaseSection from "@/components/marketing/sections/PlayerShowcaseSection";
import SupportSection from "@/components/marketing/sections/SupportSection";

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
        <MissionSection />

        <div className={PAGE_SHELL}>
          <FeatureGrid />
          <ExtensionSection />
        </div>

        <FadeInSection>
          <OpenSourceSection />
        </FadeInSection>

        <div className={PAGE_SHELL}>
          <CommunitySection />
          <SupportSection />
        </div>
      </main>

      <MarketingFooter variant="primary" />
    </>
  );
}
