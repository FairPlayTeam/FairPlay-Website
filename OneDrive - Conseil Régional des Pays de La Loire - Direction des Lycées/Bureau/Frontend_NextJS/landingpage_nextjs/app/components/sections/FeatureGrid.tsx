"use client";

import { FaHandHoldingUsd, FaAd, FaUsers, FaCodeBranch, FaLightbulb, FaBalanceScale } from "react-icons/fa";
import FeatureItem from "../ui/FeatureItem";
import Link from "../ui/Link";

interface SectionProps {
  className?: string;
}

export default function FeatureGrid({ className = "" }: SectionProps) {
  return (
    <div className={`grid gap-[40px] text-left ${className} 
      grid-cols-1 
      sm:grid-cols-2 
      lg:grid-cols-3
    `}>
      <FeatureItem>
        <FaHandHoldingUsd className="text-[var(--color-accent)] text-[45px] mb-[20px]" />
        <h3 className="text-[24px] mb-[15px]">100% Free. Forever.</h3>
        <p>Access an unlimited library of videos with no fees or subscriptions. We are committed to universal access to quality knowledge and entertainment.</p>
      </FeatureItem>

      <FeatureItem>
        <FaAd className="text-[var(--color-accent)] text-[45px] mb-[20px]" />
        <h3 className="text-[24px] mb-[15px]">Zero Ads. Zero Interruptions.</h3>
        <p>Enjoy your videos in complete serenity. FairPlay is built without any advertising, for total immersion in the content.</p>
      </FeatureItem>

      <FeatureItem>
        <FaUsers className="text-[var(--color-accent)] text-[45px] mb-[20px]" />
        <h3 className="text-[24px] mb-[15px]">An Engaged Community.</h3>
        <p>Participate in constructive exchanges, comment, annotate, and create. FairPlay is a platform built by and for its users. You join our <Link href="https://discord.gg/6g5cBUVra9" variant="secondary">Discord</Link> community!</p>
      </FeatureItem>

      <FeatureItem>
        <FaCodeBranch className="text-[var(--color-accent)] text-[45px] mb-[20px]" />
        <h3 className="text-[24px] mb-[15px]">Open Source & Free API.</h3>
        <p>Our code is open to all. Contribute and build on our foundation. The FairPlay ecosystem is transparent and collaborative. Here is our <Link href="https://github.com/orgs/FairPlayTeam/">github</Link></p>
      </FeatureItem>

      <FeatureItem>
        <FaLightbulb className="text-[var(--color-accent)] text-[45px] mb-[20px]" />
        <h3 className="text-[24px] mb-[15px]">Relevant & Captivating Content.</h3>
        <p>No more misinformation and sensationalism. FairPlay values enlightening documentaries, useful tutorials, inspiring stories, and in-depth entertainment.</p>
      </FeatureItem>

      <FeatureItem>
        <FaBalanceScale className="text-[var(--color-accent)] text-[45px] mb-[20px]" />
        <h3 className="text-[24px] mb-[15px]">Fairness and Respect.</h3>
        <p>Our moderation focuses on promoting a healthy environment, excluding controversial topics and encouraging respectful discussions.</p>
      </FeatureItem>
    </div>
  );
}