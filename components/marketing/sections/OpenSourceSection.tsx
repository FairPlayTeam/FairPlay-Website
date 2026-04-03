import { Github, Code, BookOpen } from "lucide-react";
import Section from "@/components/marketing/layout/Section";
import { Button } from "@/components/ui/button";
import FadeInSection from "./FadeInSection";
import SectionIntro from "@/components/marketing/ui/SectionIntro";

const LINKS = [
  {
    icon: Github,
    label: "Source code",
    href: "https://github.com/FairPlayTeam",
  },
  {
    icon: Code,
    label: "API Documentation",
    href: "https://apiv2.fairplay.video/docs/",
  },
  {
    icon: BookOpen,
    label: "Contribution guide",
    href: "/docs/contribution-guidelines",
  },
] as const;

export default function OpenSourceSection() {
  return (
    <FadeInSection>
      <Section id="development">
        <div className="relative mx-auto max-w-3xl text-center">
          <SectionIntro
            title="Open source,"
            accent="and proud of it"
            description="FairPlay is fully open source. That means you can read the code, spot something odd, fix it, and submit a PR. Our public API is free to use, build something on top of it, we'd love to see what you come up with."
            className="mb-10"
          />

          <div className="flex w-full flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            {LINKS.map(({ icon: Icon, label, href }) => (
              <Button
                key={label}
                variant="outline"
                className="h-11 w-full px-5 sm:w-auto"
                onClick={() => window.open(href, "_blank")}
              >
                <Icon className="size-4" strokeWidth={1.5} />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </Section>
    </FadeInSection>
  );
}
