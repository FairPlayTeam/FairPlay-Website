import Section from "@/components/marketing/layout/Section";
import ExtensionPreview from "@/components/marketing/ui/ExtensionPreview";
import { Button } from "@/components/ui/button";
import { FaCheckCircle } from "react-icons/fa";
import FadeInSection from "./FadeInSection";
import SectionIntro from "@/components/marketing/ui/SectionIntro";

export default function ExtensionSection() {
  return (
    <FadeInSection>
      <Section id="extension" variant="plain">
        <div className="flex flex-col gap-12 text-left lg:flex-row lg:items-center">
          <div className="flex w-full flex-1 items-center justify-center lg:w-auto">
            <ExtensionPreview />
          </div>

          <div className="flex-1">
            <SectionIntro
              title="of your feed"
              accent="Take back control"
              accentPosition="start"
              description="Short-form content is designed to hijack your attention, one 30-second clip at a time. Our browser extension quietly removes it from your feed so you can actually focus on what you came to watch."
              align="left"
              className="mb-8 max-w-xl"
              descriptionClassName="max-w-lg text-center lg:text-left"
            />

            <ul className="mb-10 flex flex-col gap-4 text-base leading-7 text-foreground/90">
              {[
                "Remove YouTube Shorts from your feed.",
                "Remove TikTok and Snapchat videos.",
                "Block custom domains.",
              ].map((item) => (
                <li key={item} className="flex items-start">
                  <FaCheckCircle className="mr-2.5 mt-1 shrink-0 text-lg text-primary" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Button
                onClick={() =>
                  (window.location.href =
                    "https://microsoftedge.microsoft.com/addons/detail/antivertical-content/aafojaecolkacnnbkmodafapbcbcapkb")
                }
                className="h-11 w-full px-5 sm:w-auto"
              >
                Install for Edge / Chrome
              </Button>
              <Button
                onClick={() =>
                  (window.location.href =
                    "https://addons.mozilla.org/fr/firefox/addon/fairplay-anti-vertical-content/")
                }
                variant="outline"
                className="h-11 w-full px-5 sm:w-auto"
              >
                Install for Firefox
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </FadeInSection>
  );
}
