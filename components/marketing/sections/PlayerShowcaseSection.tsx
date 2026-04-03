import Section from "@/components/marketing/layout/Section";
import FadeInSection from "@/components/marketing/sections/FadeInSection";
import BrowserFrame from "@/components/marketing/ui/BrowserFrame";
import Image from "next/image";

export default function PlayerShowcaseSection() {
  return (
    <FadeInSection>
      <Section variant="plain" className="pt-4 md:pt-6 lg:pt-8">
        <div className="relative mx-auto max-w-6xl">
          <div className="relative mx-auto">
            <div
              className="pointer-events-none absolute inset-x-0 -top-8 mx-auto h-[60%] w-[70%] rounded-full opacity-20 blur-3xl"
              style={{
                background:
                  "radial-gradient(ellipse at center, hsl(var(--primary)) 0%, transparent 70%)",
              }}
            />

            <BrowserFrame url="fairplay.video/video" elevated showReflection>
              <Image
                src="/screenshots/player_view.png"
                alt="FairPlay video player interface"
                fill
                className="object-cover"
                priority
              />
            </BrowserFrame>
          </div>
        </div>
      </Section>
    </FadeInSection>
  );
}
