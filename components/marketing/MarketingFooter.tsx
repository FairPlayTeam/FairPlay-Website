"use client";

import Link from "next/link";
import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";

interface FooterProps {
  variant?: "primary" | "secondary";
}

export default function MarketingFooter({ variant = "primary" }: FooterProps) {
  return (
    <footer className="border-t border-border bg-card px-6 py-10 text-center text-[15px] text-foreground sm:px-10">
      {variant === "primary" && (
        <section className="mx-auto mb-10 max-w-250 px-2 text-[0.95rem] leading-relaxed text-muted-foreground sm:px-0">
          <p className="mb-5">
            Looking for a{" "}
            <strong className="text-foreground">free streaming platform without ads</strong>?
            FairPlay offers a refreshing alternative to mainstream video services. Watch
            high-quality content with no interruptions, no subscriptions, and no tracking. Our
            community-driven platform is open source, ethical, and respects your privacy. Whether
            you&apos;re into{" "}
            <strong className="text-foreground">
              documentaries, tutorials, or inspiring stories
            </strong>
            , FairPlay lets you stream without distractions. Discover an{" "}
            <strong className="text-foreground">ad-free alternative to YouTube</strong> - designed
            for people who care about quality and transparency.
          </p>
          <p>
            FairPlay is built by volunteers, supported by donations, and driven by a mission:{" "}
            <strong className="text-foreground">redefine streaming with values</strong>. Join our
            growing community and be part of the change. No algorithms, no autoplay traps - just
            meaningful videos, handpicked and fairly moderated. Try FairPlay today and experience
            the freedom of <strong className="text-foreground">streaming without compromise</strong>
            .
          </p>
        </section>
      )}

      <div className="mx-auto mb-8 flex max-w-350 flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
        <div className="font-heading text-2xl font-bold text-foreground">FairPlay</div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:justify-center">
          <Link
            href="/terms"
            className="border-transparent text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            Terms of Use
          </Link>
          <Link
            href="/terms#privacy-policy"
            className="border-transparent text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms#conduct"
            className="border-transparent text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            Code of Conduct
          </Link>
          <Link
            href="/terms#faq"
            className="border-transparent text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            FAQ
          </Link>
        </div>

        <div className="flex justify-center gap-6 text-[22px]">
          <a
            href="https://github.com/FairPlayTeam/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
            aria-label="GitHub"
          >
            <FaGithub />
          </a>
          <a
            href="https://x.com/StreamNew90503"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
            aria-label="Twitter / X"
          >
            <FaTwitter />
          </a>
          <a
            href="https://discord.gg/AZBwM6u9Kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
            aria-label="Discord"
          >
            <FaDiscord />
          </a>
        </div>
      </div>

      <p className="border-t border-border pt-5 text-sm text-foreground">
        (c) 2025 FairPlay. Powered by the Community.
      </p>
    </footer>
  );
}
