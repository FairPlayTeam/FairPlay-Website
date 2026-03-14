"use client";

import {
  FaHandHoldingUsd,
  FaAd,
  FaUsers,
  FaCodeBranch,
  FaLightbulb,
  FaBalanceScale,
} from "react-icons/fa";
import FeatureItem from "@/components/marketing/FeatureItem";
import Link from "@/components/marketing/Link";
import { cn } from "@/lib/utils";

interface SectionProps {
  className?: string;
}

export default function FeatureGrid({ className = "" }: SectionProps) {
  return (
    <div
      className={cn(
        "grid gap-10 text-left",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      <FeatureItem>
        <FaHandHoldingUsd className="mb-5 text-[45px] text-primary" />
        <h3 className="text-[24px] mb-3.75">100% Free. Forever.</h3>
        <p className="select-none text-muted-foreground">
          Access an unlimited library of videos with no fees or subscriptions.
          We are committed to universal access to quality knowledge and
          entertainment.
        </p>
      </FeatureItem>

      <FeatureItem>
        <FaAd className="mb-5 text-[45px] text-primary" />
        <h3 className="text-[24px] mb-3.75">Zero Ads. Zero Interruptions.</h3>
        <p className="select-none text-muted-foreground">
          Enjoy your videos in complete serenity. FairPlay is built without any
          advertising, for total immersion in the content.
        </p>
      </FeatureItem>

      <FeatureItem>
        <FaUsers className="mb-5 text-[45px] text-primary" />
        <h3 className="text-[24px] mb-3.75">An Engaged Community.</h3>
        <p className="select-none text-muted-foreground">
          FairPlay is a platform built by and for its users. Suggest ideas,
          point out bugs, and come hang out in our{" "}
          <Link href="https://discord.gg/6g5cBUVra9" variant="secondary">
            Discord
          </Link>{" "}
          community!
        </p>
      </FeatureItem>

      <FeatureItem>
        <FaCodeBranch className="mb-5 text-[45px] text-primary" />
        <h3 className="text-[24px] mb-3.75">Open Source & Free API.</h3>
        <p className="select-none text-muted-foreground">
          Our code is open to all. Contribute and build on our foundation. The
          FairPlay ecosystem is transparent and collaborative. Here is our{" "}
          <Link href="https://github.com/orgs/FairPlayTeam/">github</Link>
        </p>
      </FeatureItem>

      <FeatureItem>
        <FaLightbulb className="mb-5 text-[45px] text-primary" />
        <h3 className="text-[24px] mb-3.75">Relevant & Captivating Content.</h3>
        <p className="select-none text-muted-foreground">
          No more misinformation and sensationalism. FairPlay values
          enlightening documentaries, useful tutorials, inspiring stories, and
          in-depth entertainment.
        </p>
      </FeatureItem>

      <FeatureItem>
        <FaBalanceScale className="mb-5 text-[45px] text-primary" />
        <h3 className="text-[24px] mb-3.75">Fairness and Respect.</h3>
        <p className="select-none text-muted-foreground">
          Our moderation focuses on promoting a healthy environment, excluding
          controversial topics and encouraging respectful discussions.
        </p>
      </FeatureItem>
    </div>
  );
}
