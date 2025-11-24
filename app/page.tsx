"use client";

import { useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import Topbar from "@/components/sections/Topbar";
import HeroSection from "@/components/sections/HeroSection";
import Section from "@/components/sections/Section";
import DisclaimerSection from "@/components/sections/DisclaimerSection";
import Button from "@/components/ui/Button";
import FeatureGrid from "@/components/sections/FeatureGrid";
import Footer from "@/components/sections/Footer";
import MarqueeDonors from "@/components/sections/MarqueeDonators";
import FadeInSection from "@/components/sections/FadeInSection";
import ExtensionPreview from "@/components/sections/ExtensionPreview";
import { PiGithubLogo, PiCodeLight, PiBookOpenTextLight } from "react-icons/pi";

export default function HomePage() {
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
      <Topbar />

      <main className="mx-auto max-w-[1400px] px-5 md:px-[70px]">
        <HeroSection />

        <FadeInSection>
          <Section variant="secondary" className="mt-[100px]">
            <DisclaimerSection />
          </Section>
        </FadeInSection>

        <FadeInSection>
          <Section id="about" className="mt-[100px]">
            <div className="intro-card mx-auto max-w-[800px] text-center">
              <h2 className="text-[33px] mb-[25px] font-bold">
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
                That’s why we launched Fairplay. We want to make it a place
                where your skills, interests, and content are truly highlighted.
              </p>
            </div>
          </Section>
        </FadeInSection>

        <FadeInSection>
          <Section id="values" variant="secondary" className="mt-[100px]">
            <h2 className="text-[33px] font-bold mb-[50px]">
              Why choose FairPlay?
            </h2>
            <FeatureGrid />
          </Section>
        </FadeInSection>

        <FadeInSection>
          <Section id="extension" className="mt-[100px]">
            <div className="flex flex-col lg:flex-row gap-[50px] text-left">
              <div className="flex flex-1 justify-center items-center w-full lg:w-auto">
                <ExtensionPreview />
              </div>
              <div className="flex-1 w-full">
                <h2 className="text-[34px] font-bold mb-[25px] text-center lg:text-left">
                  Control Your Web experience with the FairPlay extension
                </h2>
                <p className="text-[16px] mb-[25px] text-center lg:text-left">
                  Tired of short, addictive, and useless content polluting your
                  feed? Our browser extension allows you to hide them and take
                  back control.
                </p>
                <ul className="mb-[35px] flex flex-col items-start gap-3">
                  <li className="flex items-start text-[16px]">
                    <FaCheckCircle className="shrink-0 text-accent text-[18px] mr-2.5 mt-[3px]" />
                    Remove YouTube Shorts from your feed.
                  </li>
                  <li className="flex items-start text-[16px]">
                    <FaCheckCircle className="shrink-0 text-accent text-[18px] mr-2.5 mt-[3px]" />
                    Remove TikTok and Snapchat videos.
                  </li>
                  <li className="flex items-start text-[16px]">
                    <FaCheckCircle className="shrink-0 text-accent text-[18px] mr-2.5 mt-[3px]" />
                    Block custom domains.
                  </li>
                </ul>
                <div className="flex justify-center lg:justify-start">
                  <Button
                    onClick={() =>
                      (window.location.href =
                        "https://microsoftedge.microsoft.com/addons/detail/antivertical-content/aafojaecolkacnnbkmodafapbcbcapkb")
                    }
                    variant="secondary"
                  >
                    Install (Edge)
                  </Button>
                </div>
              </div>
            </div>
          </Section>
        </FadeInSection>

        <FadeInSection>
          <Section id="development" variant="secondary" className="mt-[100px]">
            <h2 className="text-[33px] mb-[25px] font-bold">
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
                onClick={() => (window.location.href = "/docs#api")}
              >
                {" "}
                <PiCodeLight />
                &nbsp;API Documentation
              </Button>
              <Button
                className="gap-2"
                onClick={() => (window.location.href = "/contributors")}
              >
                {" "}
                <PiBookOpenTextLight />
                &nbsp;Contribution guide
              </Button>
            </div>
          </Section>
        </FadeInSection>

        <FadeInSection>
          <Section id="community" className="mt-[100px]">
            <div className="flex flex-col lg:flex-row gap-[50px] text-left lg:items-center">
              <div className="flex flex-1 flex-col justify-center items-center lg:items-start text-center lg:text-left">
                <h2 className="text-[33px] font-bold mb-[25px]">
                  Join our community
                </h2>
                <p className="text-[18px] mb-[25px] max-w-lg">
                  FairPlay is more than a platform, it&apos;s a movement. By
                  joining our community, you contribute to shaping the future of
                  streaming and Internet. Share your passions, discover new
                  perspectives, and connect with others Fairplayers.
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
          <Section variant="secondary" className="mt-[100px]">
            <div className="intro-card mx-auto max-w-[800px] text-center">
              <h2 className="text-[34px] mb-[25px] font-bold">
                Support FairPlay, Support Quality Content
              </h2>
              <p className="text-[19px] text-medium-gray mb-[30px]">
                FairPlay is 100% free and ad-free, and that will always be our
                commitment. If you appreciate our mission and our platform, your
                donation directly helps us cover infrastructure costs, improve
                features, and grow our community. Every contribution counts, big
                or small.
              </p>
              <Button
                onClick={() =>
                  (window.location.href = "http://ko-fi.com/fairplay_")
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
      <Footer variant="primary" />
    </>
  );
}
