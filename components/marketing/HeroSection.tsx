"use client";

import HeroImage from "@/components/marketing/HeroImage";
import HeroText from "@/components/marketing/HeroText";

export default function HeroSection() {
  return (
    <section
      className="
        hero-vitrine
        flex flex-col-reverse lg:flex-row items-center justify-between
        gap-12.5
        pt-10
        min-h-[calc(100vh-100px)]
        text-left
      "
    >
      <div className="flex-2 w-full flex flex-col items-center lg:items-start text-center lg:text-left">
        <HeroText />
      </div>

      {/* hidden on mobile */}
      <div className="flex-1 w-full hidden lg:flex justify-end">
        <HeroImage />
      </div>
    </section>
  );
}
