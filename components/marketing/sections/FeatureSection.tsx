import Image from "next/image";
import Section from "@/components/marketing/layout/Section";
import FadeInSection from "@/components/marketing/sections/FadeInSection";
import BrowserFrame from "@/components/marketing/ui/BrowserFrame";
import SectionIntro from "@/components/marketing/ui/SectionIntro";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Your content,",
    titleAccent: "your rules.",
    description:
      "Choose the licence that matches your intent, from full copyright to Creative Commons. Viewers always know what they can do with your work, and you stay in control.",
    screenshot: "/screenshots/feature-licence.png",
    alt: "Video licence selector interface",
    imageLeft: false,
  },
  {
    title: "Rate with",
    titleAccent: "nuance.",
    description:
      "Stars replace the blunt thumbs-up. A single number tells you more than a like count ever could, and it pushes quality content up without feeding engagement bait.",
    screenshot: "/screenshots/feature-rating.png",
    alt: "Star rating interface on a video",
    imageLeft: true,
  },
  {
    title: "Watch the way",
    titleAccent: "you want.",
    description:
      "Toggle ambilight for an immersive glow, switch between light and dark mode, or enter theatre mode. Your setup, saved automatically.",
    screenshot: "/screenshots/feature-customization.png",
    alt: "Player customization panel with ambilight and theme options",
    imageLeft: false,
  },
];

function FeatureRow({
  title,
  titleAccent,
  description,
  screenshot,
  alt,
  imageLeft,
}: (typeof features)[number]) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-10 md:gap-16",
        imageLeft ? "md:flex-row" : "md:flex-row-reverse",
      )}
    >
      <div className="w-full md:w-3/5">
        <div className="group">
          <BrowserFrame url="fairplay.video">
            <Image
              src={screenshot}
              alt={alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.01]"
            />
          </BrowserFrame>
        </div>
      </div>

      <div className="w-full md:w-2/5">
        <h3 className="mb-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl lg:text-4xl">
          {title} <span className="italic text-primary">{titleAccent}</span>
        </h3>

        <p className="text-base leading-8 text-muted-foreground md:text-lg">{description}</p>

        <div className="mt-6 h-px w-10 bg-primary/30" />
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <FadeInSection>
      <Section id="features" variant="plain">
        <div className="relative mx-auto max-w-5xl">
          <SectionIntro
            title="Built around"
            accent="what matters"
            description="Every feature exists for a reason. No dark patterns, no engagement traps, just tools that respect you and your audience."
            className="mb-16 md:mb-20"
          />

          <div className="flex flex-col gap-20 md:gap-28">
            {features.map((feature) => (
              <FeatureRow key={feature.titleAccent} {...feature} />
            ))}
          </div>
        </div>
      </Section>
    </FadeInSection>
  );
}
