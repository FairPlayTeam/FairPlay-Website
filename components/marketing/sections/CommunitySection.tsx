import Section from "@/components/marketing/layout/Section";
import FadeInSection from "@/components/marketing/sections/FadeInSection";
import SectionIntro from "@/components/marketing/ui/SectionIntro";
import { Button } from "@/components/ui/button";

export default function CommunitySection() {
  return (
    <FadeInSection>
      <Section id="community" variant="plain">
        <div className="flex flex-col gap-12 text-left lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-col items-center justify-center text-center lg:items-start lg:text-left">
            <SectionIntro
              title="More than a platform,"
              accent="a community"
              description="FairPlay exists because people actually care. We have a Discord where real conversations happen, feature requests, bug reports, and random debates. Come say hi, it's genuinely nice in there."
              align="left"
              className="mb-8 max-w-xl"
              descriptionClassName="max-w-lg"
            />

            <Button asChild className="h-11 px-5">
              <a href="https://discord.gg/6g5cBUVra9" target="_blank" rel="noopener noreferrer">
                Join our Discord
              </a>
            </Button>
          </div>

          <div className="flex w-full flex-1 items-center justify-center lg:justify-end">
            <iframe
              src="https://discord.com/widget?id=1385601656028270594&theme=dark"
              width="100%"
              height="420"
              sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
              className="h-[420px] w-full max-w-[350px] rounded-xl border border-border shadow-lg sm:h-[450px]"
              title="Discord community widget"
            />
          </div>
        </div>
      </Section>
    </FadeInSection>
  );
}
