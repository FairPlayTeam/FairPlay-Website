"use client";

import Link from "next/link";
import { FaGithub, FaTwitter, FaDiscord } from "react-icons/fa";

interface FooterProps {
  variant?: "primary" | "secondary";
}

export default function Footer({ variant = "primary" }: FooterProps) {
  return (
    <footer className="bg-[var(--color-container)] border-t-1 border-[var(--color-border)] text-[var(--color-text)] text-[15px] px-6 sm:px-10 py-10 text-center">
      {variant === "primary" && (
        <section className="text-[var(--color-text-footer)] text-[0.95rem] leading-relaxed max-w-[1000px] mx-auto mb-10 px-2 sm:px-0">
          <p className="mb-5">
            Looking for a{" "}
            <strong className="text-[var(--color-text-bold)]">
              free streaming platform without ads
            </strong>
            ? FairPlay offers a refreshing alternative to mainstream video
            services. Watch high-quality content with no interruptions, no
            subscriptions, and no tracking. Our community-driven platform is
            open source, ethical, and respects your privacy. Whether you're into{" "}
            <strong className="text-[var(--color-text-bold)]">
              documentaries, tutorials, or inspiring stories
            </strong>
            , FairPlay lets you stream without distractions. Discover an{" "}
            <strong className="text-[var(--color-text-bold)]">
              ad-free alternative to YouTube
            </strong>{" "}
            – designed for people who care about quality and transparency.
          </p>
          <p>
            FairPlay is built by volunteers, supported by donations, and driven
            by a mission:{" "}
            <strong className="text-[var(--color-text-bold)]">
              redefine streaming with values
            </strong>
            . Join our growing community and be part of the change. No
            algorithms, no autoplay traps – just meaningful videos, handpicked
            and fairly moderated. Try FairPlay today and experience the freedom
            of{" "}
            <strong className="text-[var(--color-text-bold)]">
              streaming without compromise
            </strong>
            .
          </p>
        </section>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-[1400px] mx-auto mb-8 text-center md:text-left">
        <div className="text-2xl font-bold font-[Montserrat] text-[var(--color-text)]">
          FairPlay
        </div>

        <div className="flex flex-wrap justify-center md:justify-center gap-4 sm:gap-6">
          <Link
            href="/cgu"
            className="text-gray-300 hover:text-[var(--color-text)] transition-colors duration-200"
          >
            Terms of Use
          </Link>
          <Link
            href="/cgu#privacy-policy"
            className="text-gray-300 hover:text-[var(--color-text)] transition-colors duration-200"
          >
            Privacy Policy
          </Link>
          <Link
            href="/cgu#conduct"
            className="text-gray-300 hover:text-[var(--color-text)] transition-colors duration-200"
          >
            Code of Conduct
          </Link>
          <Link
            href="/cgu#faq"
            className="text-gray-300 hover:text-[var(--color-text)] transition-colors duration-200"
          >
            FAQ
          </Link>
        </div>

        <div className="flex justify-center gap-6 text-[22px]">
          <a
            href="https://github.com/FairPlayTeam/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-[var(--color-text)] transition-colors duration-200"
            aria-label="GitHub"
          >
            <FaGithub />
          </a>
          <a
            href="https://x.com/StreamNew90503"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-[var(--color-text)] transition-colors duration-200"
            aria-label="Twitter / X"
          >
            <FaTwitter />
          </a>
          <a
            href="https://discord.gg/AZBwM6u9Kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-[var(--color-text)] transition-colors duration-200"
            aria-label="Discord"
          >
            <FaDiscord />
          </a>
        </div>
      </div>

      <p className="border-t border-white/10 text-[var(--color-text-bold)] text-sm pt-5">
        © 2025 FairPlay. Powered by the Community.
      </p>
    </footer>
  );
}