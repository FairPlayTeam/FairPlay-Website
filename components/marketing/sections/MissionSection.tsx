import { motion } from "framer-motion";
import type { ReactNode } from "react";
import Section from "@/components/marketing/layout/Section";
import FadeInSection from "@/components/marketing/sections/FadeInSection";
import SectionIntro from "@/components/marketing/ui/SectionIntro";

interface SourceProps {
  href: string;
  children: ReactNode;
}

const PLAY_PATH =
  "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z";

const MASK_FADE_RIGHT = "linear-gradient(to right, black 0%, black 40%, transparent 100%)";
const MASK_FADE_LEFT = "linear-gradient(to left, black 0%, black 40%, transparent 100%)";

const ENTRY_TRANSITION = { duration: 0.9, ease: [0.22, 1, 0.36, 1] } as const;

const EASE_IN_OUT = [0.42, 0, 0.58, 1] as const;

const floatVariants = {
  hidden: { opacity: 0, x: -40, rotate: -30 },
  visible: { opacity: 1, x: 0, rotate: -12, transition: ENTRY_TRANSITION },
  float: {
    y: [0, -14, 0],
    transition: { duration: 5, ease: EASE_IN_OUT, repeat: Infinity, repeatType: "loop" as const },
  },
};

const floatRightVariants = {
  hidden: { opacity: 0, x: 40, rotate: 20 },
  visible: { opacity: 1, x: 0, rotate: 6, transition: { ...ENTRY_TRANSITION, delay: 0.15 } },
  float: {
    y: [0, -10, 0],
    transition: {
      duration: 6.5,
      ease: EASE_IN_OUT,
      repeat: Infinity,
      repeatType: "loop" as const,
      delay: 0.8,
    },
  },
};

function Source({ href, children }: SourceProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Source: ${children}`}
      className="ml-1 align-super text-[0.7em] font-semibold text-primary/80 underline decoration-primary/40 underline-offset-2 transition-colors duration-200 hover:text-primary hover:decoration-primary"
    >
      [{children}]
    </a>
  );
}

function Stat({ children }: { children: ReactNode }) {
  return <strong className="font-extrabold text-primary/80">{children}</strong>;
}

export default function MissionSection() {
  return (
    <FadeInSection>
      <Section id="mission" variant="plain" className="overflow-hidden">
        <div className="relative mx-auto text-center">
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="420"
            height="420"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            role="presentation"
            className="pointer-events-none absolute -left-0 top-1/2 -translate-y-1/2 text-primary/20"
            style={{ maskImage: MASK_FADE_RIGHT, WebkitMaskImage: MASK_FADE_RIGHT }}
            variants={floatVariants}
            initial="hidden"
            animate={["visible", "float"]}
          >
            <path d={PLAY_PATH} />
          </motion.svg>

          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="260"
            height="260"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            role="presentation"
            className="pointer-events-none absolute -right-0 bottom-0 text-primary/15"
            style={{ maskImage: MASK_FADE_LEFT, WebkitMaskImage: MASK_FADE_LEFT }}
            variants={floatRightVariants}
            initial="hidden"
            animate={["visible", "float"]}
          >
            <path d={PLAY_PATH} />
          </motion.svg>

          <SectionIntro
            title="Our Mission:"
            accent="Redefining Streaming"
            className="mx-auto mb-8 max-w-3xl"
          />

          <p className="mx-auto max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
            The internet is in bad shape. <Stat>51%</Stat> of internet traffic now comes from bots
            <Source href="https://cpl.thalesgroup.com/about-us/newsroom/2025-imperva-bad-bot-report-ai-internet-traffic">
              Imperva 2025
            </Source>
            , <Stat>52%</Stat> of web content is AI-generated
            <Source href="https://futurism.com/artificial-intelligence/over-50-percent-internet-ai-slop">
              Graphite 2025
            </Source>
            , including <Stat>71%</Stat> of images on social media
            <Source href="https://artsmart.ai/blog/ai-in-social-media-statistics/">
              Forbes 2025
            </Source>
            . Between all the deepfakes, misinformation, and the flood of mass-produced fast-paced
            content,{" "}
            <strong className="font-semibold text-foreground">
              what space is left for humans?
            </strong>
          </p>

          <div className="mx-auto my-8 h-px w-16 bg-primary/30" />

          <p className="mx-auto max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
            That&apos;s why we launched FairPlay, we want to make it a place where your skills,
            interests, and content are{" "}
            <span className="font-semibold text-foreground">truly highlighted</span>.
          </p>
        </div>
      </Section>
    </FadeInSection>
  );
}
