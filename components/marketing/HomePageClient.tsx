"use client";

import { useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { PiGithubLogo, PiCodeLight, PiBookOpenTextLight } from "react-icons/pi";
import MarketingTopbar from "@/components/marketing/MarketingTopbar";
import HeroSection from "@/components/marketing/HeroSection";
import Section from "@/components/marketing/Section";
import DisclaimerSection from "@/components/marketing/DisclaimerSection";
import Button from "@/components/ui/Button";
import FeatureGrid from "@/components/marketing/FeatureGrid";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarqueeDonors from "@/components/marketing/MarqueeDonators";
import FadeInSection from "@/components/marketing/FadeInSection";
import ExtensionPreview from "@/components/marketing/ExtensionPreview";

export default function HomePageClient() {
  useEffect(() => {
    const handleScrollToHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const section = document.querySelector<HTMLElement>(hash);
        const header = document.querySelector<HTMLElement>(".main-header");
        const headerHeight = header ? header.offsetHeight + 50 : 0;

        if (section) {
          const top =
            section.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }
    };
    handleScrollToHash();
    window.addEventListener("hashchange", handleScrollToHash);

    return () => window.removeEventListener("hashchange", handleScrollToHash);
  }, []);

  return (
    <>
      <MarketingTopbar />

      <main className="background-gradient mx-auto max-w-350 px-5 md:px-17.5">
        <HeroSection />

        <FadeInSection>
          <Section variant="secondary" className="mt-10 md:mt-25">
            <DisclaimerSection />
          </Section>
        </FadeInSection>

        <FadeInSection>
          <Section id="about" className="mt-10 md:mt-25">
            <div className="intro-card mx-auto max-w-200 text-center">
              <h2 className="text-[33px] mb-6.25 font-bold">
                Our Mission: Redefining Streaming
              </h2>
              <p className="text-[18px] text-medium-gray">
                The internet is in bad shape. <b>47%</b> of internet traffic
                comes from bots, <b>52%</b> of internet content is AI-generated
                including <b>71%</b> of images on social media like YouTube.
                Between all the deepfakes, misinformation, and the flood of
                mass-produced fast-paced content,{" "}
                <b>What space is left for humans?</b>
                <br />
                That&apos;s why we launched FairPlay. We want to make it a place
                where your skills, interests, and content are truly highlighted.
              </p>
            </div>
          </Section>
        </FadeInSection>

        <FadeInSection>
          <Section id="values" variant="secondary" className="mt-10 md:mt-25">
            <h2 className="text-[33px] font-bold mb-12.5">
              Why choose FairPlay?
            </h2>
            <FeatureGrid />
          </Section>
        </FadeInSection>

        <FadeInSection>
          <Section id="extension" className="mt-10 md:mt-25">
            <div className="flex flex-col lg:flex-row gap-12.5 text-left">
              <div className="flex flex-1 justify-center items-center w-full lg:w-auto">
                <ExtensionPreview />
              </div>
              <div className="flex-1 w-full">
                <h2 className="text-[34px] font-bold mb-12.5 text-center lg:text-left">
                  Control Your Web experience with the FairPlay extension
                </h2>
                <p className="text-[16px] mb-12.5 text-center lg:text-left">
                  Tired of short, addictive, and useless content polluting your
                  feed? Our browser extension allows you to hide them and take
                  back control.
                </p>
                <ul className="mb-12.5 flex flex-col items-start gap-3">
                  <li className="flex items-start text-[16px]">
                    <FaCheckCircle className="shrink-0 text-accent text-[18px] mr-2.5 mt-0.75" />
                    Remove YouTube Shorts from your feed.
                  </li>
                  <li className="flex items-start text-[16px]">
                    <FaCheckCircle className="shrink-0 text-accent text-[18px] mr-2.5 mt-0.75" />
                    Remove TikTok and Snapchat videos.
                  </li>
                  <li className="flex items-start text-[16px]">
                    <FaCheckCircle className="shrink-0 text-accent text-[18px] mr-2.5 mt-0.75" />
                    Block custom domains.
                  </li>
                </ul>
                <div className="flex flex-col lg:flex-row justify-center lg:justify-start gap-4">
                  <Button
                    onClick={() =>
                      (window.location.href =
                        "https://microsoftedge.microsoft.com/addons/detail/antivertical-content/aafojaecolkacnnbkmodafapbcbcapkb")
                    }
                    variant="secondary"
                  >
                    Install (Edge/Chrome...)
                  </Button>
                  <Button
                    onClick={() =>
                      (window.location.href =
                        "https://addons.mozilla.org/fr/firefox/addon/fairplay-anti-vertical-content/")
                    }
                    variant="secondary"
                  >
                    Install (Firefox)
                  </Button>
                </div>
              </div>
            </div>
          </Section>
        </FadeInSection>

        <FadeInSection>
          <Section
            id="development"
            variant="secondary"
            className="mt-10 md:mt-25"
          >
            <h2 className="text-[33px] mb-6.25 font-bold">
              FairPlay: An open and evolving project
            </h2>
            <p className="text-[18px] text-medium-gray m-10">
              We believe in the power of collaboration. FairPlay is entirely
              Open Source, meaning its code is accessible and modifiable by
              everyone. Our public and free API encourages innovation and allows
              everyone to build on our platform.
            </p>
            <div className="flex flex-col lg:flex-row justify-center gap-5">
              <Button
                className="gap-2"
                onClick={() =>
                  (window.location.href = "https://github.com/FairPlayTeam")
                }
              >
                <PiGithubLogo />
                &nbsp;Source code{" "}
              </Button>
              <Button
                className="gap-2"
                onClick={() =>
                  (window.location.href = "https://apiv2.fairplay.video/docs/")
                }
              >
                {" "}
                <PiCodeLight />
                &nbsp;API Documentation
              </Button>
              <Button
                className="gap-2"
                onClick={() =>
                  (window.location.href = "/docs/contribution-guidelines")
                }
              >
                {" "}
                <PiBookOpenTextLight />
                &nbsp;Contribution guide
              </Button>
            </div>
          </Section>
        </FadeInSection>

        <FadeInSection>
          <Section id="community" className="mt-10 md:mt-25">
            <div className="flex flex-col lg:flex-row gap-12.5 text-left lg:items-center">
              <div className="flex flex-1 flex-col justify-center items-center lg:items-start text-center lg:text-left">
                <h2 className="text-[33px] font-bold mb-6.25">
                  Join our community
                </h2>
                <p className="text-[18px] mb-6.25 max-w-lg">
                  FairPlay is more than a platform, it&apos;s a movement. By
                  joining our community, you contribute to shaping the future of
                  streaming and Internet. Share your passions, discover new
                  perspectives, and connect with others FairPlayers.
                </p>
                <Button
                  onClick={() =>
                    (window.location.href = "https://discord.gg/6g5cBUVra9")
                  }
                >
                  Discover our Discord
                </Button>
              </div>

              <div className="flex flex-1 justify-center lg:justify-end items-center">
                <iframe
                  src="https://discord.com/widget?id=1385601656028270594&theme=dark"
                  width="350"
                  height="450"
                  sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                  className="rounded-xl shadow-lg border border-gray-800"
                ></iframe>
              </div>
            </div>
          </Section>
        </FadeInSection>

        <FadeInSection>
          <Section variant="secondary" className="mt-10 md:mt-25">
            <div className="intro-card mx-auto max-w-200 text-center">
              <h2 className="text-[34px] mb-6.25 font-bold">
                Support FairPlay, Support Quality Content
              </h2>
              <p className="text-[19px] text-medium-gray mb-7.5">
                FairPlay is 100% free and ad-free, and that will always be our
                commitment. If you appreciate our mission and our platform, your
                donation directly helps us cover infrastructure costs, improve
                features, and grow our community. Every contribution counts, big
                or small.
              </p>
              <Button
                onClick={() =>
                  (window.location.href = "https://ko-fi.com/fairplay_")
                }
                variant="donateSecondary"
              >
                Donate
              </Button>

              <MarqueeDonors />
            </div>
          </Section>
        </FadeInSection>
      </main>
      <MarketingFooter variant="primary" />
    </>
  );
}
