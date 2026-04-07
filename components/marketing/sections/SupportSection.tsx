import Section from "@/components/marketing/layout/Section";
import FadeInSection from "@/components/marketing/sections/FadeInSection";
import MarqueeDonors from "@/components/marketing/ui/MarqueeDonators";
import SectionIntro from "@/components/marketing/ui/SectionIntro";
import { Button } from "@/components/ui/button";

export default function SupportSection() {
  return (
    <FadeInSection>
      <Section variant="plain">
        <div className="mx-auto max-w-2xl text-center">
          <SectionIntro
            title="Support"
            accent="FairPlay"
            description="FairPlay is free, ad-free, and always will be. But servers cost money, and we run entirely on donations. If what we're building makes sense to you, even a small contribution goes a long way."
            className="mb-8"
          />

          <Button asChild className="h-11 rounded-full px-6">
            <a href="https://ko-fi.com/fairplay_" target="_blank" rel="noopener noreferrer">
              Donate on Ko-fi
            </a>
          </Button>

          <MarqueeDonors />
        </div>
      </Section>
    </FadeInSection>
  );
}
