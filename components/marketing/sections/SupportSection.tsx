import Section from "@/components/marketing/layout/Section";
import MarqueeDonors from "@/components/marketing/ui/MarqueeDonators";
import { Button } from "@/components/ui/button";
import FadeInSection from "./FadeInSection";
import SectionIntro from "@/components/marketing/ui/SectionIntro";

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

          <Button
            className="h-11 rounded-full px-6"
            onClick={() => window.open("https://ko-fi.com/fairplay_", "_blank")}
          >
            Donate on Ko-fi
          </Button>

          <MarqueeDonors />
        </div>
      </Section>
    </FadeInSection>
  );
}
