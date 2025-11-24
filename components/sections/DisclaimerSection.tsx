"use client";

import Link from "@/components/ui/Link";

export default function DisclaimerSection() {
  return (
    <div className="intro-card mx-auto max-w-[800px] text-center">
      <h2 className="text-[34px] mb-[25px] font-bold">A Project in Progress</h2>
      <p className="text-[19px] text-para">
        FairPlay is currently under development. You&apos;ll be introduced to
        the user interface and some features, but please note that the project
        is still under development. We thank you for your patience and invite
        you to contribute to its development! A &quot;live build&quot; version
        of FairPlay is also available at{" "}
        <Link href="https://lab.fairplay.video/">the "lab"</Link>
      </p>
    </div>
  );
}
