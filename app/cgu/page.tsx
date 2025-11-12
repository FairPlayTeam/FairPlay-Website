"use client";

import { useEffect, useState } from "react";
import Topbar from "../components/sections/Topbar";
import Footer from "../components/sections/Footer";
import DocsSection from "../components/docs/DocsSection";
import DocsSidebar from "../components/docs/DocsSidebar";
import Link from "../components/ui/Link";
import {
  FaLightbulb,
  FaCogs,
  FaUserCircle,
  FaShieldAlt,
  FaFileAlt,
  FaQuestionCircle,
  FaCube,
  FaExclamationTriangle,
  FaRedo,
} from "react-icons/fa";

export default function DocsPage() {
  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: <FaLightbulb size={16} />,
      content: (
        <>
          <p>
            Welcome to <strong>FairPlay</strong>! These Terms and Conditions
            govern your access to and use of the FairPlay website, applications,
            and services. By accessing or using our Services, you agree to these
            Terms and our <a href="#privacy-policy">Privacy Policy</a>.
          </p>
          <p>
            FairPlay is an <strong>open-source streaming platform</strong>{" "}
            designed to foster a healthy and collaborative environment for both
            creators and viewers.
          </p>
        </>
      ),
    },
    {
      id: "generalTerms",
      title: "General Terms",
      icon: <FaCogs size={16} />,
      content: (
        <>
          <p>
            By using FairPlay, you confirm that you are at least 13 years old.
            Users between 13 and 18 must have parental or guardian consent. You
            agree to use FairPlay only for lawful purposes and in accordance
            with these Terms.
          </p>
          <p>
            As a community-driven, open-source project, FairPlay relies on
            contributions from its users. By participating, you support this
            collaborative spirit. FairPlay is completely free, no hidden fees.
          </p>
        </>
      ),
    },
    {
      id: "user-accounts",
      title: "User Accounts",
      icon: <FaUserCircle size={16} />,
      content: (
        <>
          <p>
            Certain features require an account. You agree to provide accurate
            and up-to-date information during registration and maintain it. You
            are responsible for safeguarding your password and all activity
            under your account. FairPlay is not liable for losses from account
            misuse.
          </p>
        </>
      ),
    },
    {
      id: "conduct",
      title: "Code of Conduct",
      icon: <FaShieldAlt size={16} />,
      content: (
        <>
          <p>
            FairPlay is committed to creating a welcoming and inclusive
            environment. Users must follow our Code of Conduct, which prohibits:
          </p>
          <ul>
            <li>Harassment, discrimination, or disrespectful behavior.</li>
            <li>Spreading misinformation.</li>
            <li>Sharing NSFW content.</li>
            <li>Engaging in political or religious discussions in the comments of videos unrelated to those topics.</li>
            <li>Engaging in illegal activities.</li>
          </ul>
          <p>Violation may result in account suspension or termination.</p>
        </>
      ),
    },
    {
      id: "privacy-policy",
      title: "Privacy Policy",
      icon: <FaFileAlt size={16} />,
      content: (
        <>
          <p>
            FairPlay values your privacy. We collect minimal data needed to
            operate and improve our service.
          </p>
          <h3>Information We Collect</h3>
          <ul>
            <li>
              <strong>Account Info:</strong> Email and username. No real names
              or other personal identifiers are collected.
            </li>
            <li>
              <strong>Usage Data:</strong> Aggregated, anonymous statistics to
              enhance performance. Not linked to individuals.
            </li>
            <li>
              <strong>Content Data:</strong> Uploaded content is stored, but we
              only monitor for adherence to our Code of Conduct.
            </li>
          </ul>
          <h3>How We Use Your Information</h3>
          <ul>
            <li>To provide and maintain our Services.</li>
            <li>To manage your account and support.</li>
            <li>To personalize your experience.</li>
            <li>To ensure security and prevent fraud.</li>
            <li>To enforce our Terms and Code of Conduct.</li>
          </ul>
          <h3>Data Sharing and Disclosure</h3>
          <p>
            We do not sell or trade personal data. Aggregated or anonymized info
            may be shared freely. Personal data is only disclosed if required by
            law or valid authorities.
          </p>
          <h3>Data Security</h3>
          <p>
            We implement security measures, but no online service is 100%
            secure.
          </p>
          <h3>Your Choices</h3>
          <p>
            You can review or update your information in your account or contact
            us for access, corrections, or deletion.
          </p>
        </>
      ),
    },
    {
      id: "faq",
      title: "Frequently Asked Questions",
      icon: <FaQuestionCircle size={16} />,
      content: (
        <>
          <p>
            A video version of this FAQ is also available{" "}
            <Link href="https://www.youtube.com/watch?v=fc8YUDCxWdw">here</Link>
          </p>
          <h3>Q: Is FairPlay really free?</h3>
          <p>
            A: Yes! FairPlay is completely free and ad-free, supported by
            community contributions and donations.
          </p>

          <h3>Q: How is FairPlay open-source?</h3>
          <p>
            A: The code is on{" "}
            <a
              href="https://github.com/FairPlay"
              target="_blank"
              rel="noopener"
            >
              GitHub
            </a>{" "}
            under the MIT License. Anyone can contribute or suggest
            improvements.
          </p>

          <h3>Q: How does FairPlay protect my privacy?</h3>
          <p>
            A: Minimal data collection, no tracking, no selling of personal
            data.
          </p>

          <h3>Q: What content is allowed?</h3>
          <p>
            A: Anything that does not include misinformation or NSFW content. See our{" "}
            <a href="#codeOfConduct">Code of Conduct</a>.
          </p>

          <h3>Q: Can I contribute?</h3>
          <p>
            A: Absolutely! Contributions can be code, translations, UI/UX
            design, moderation, or spreading the word. See our{" "}
            <a
              href="https://github.com/FairPlay/CONTRIBUTING"
              target="_blank"
              rel="noopener"
            >
              Contributors Guide
            </a>
            .
          </p>

          <h3>Q: Where can I report issues?</h3>
          <p>
            A: Use our GitHub{" "}
            <a
              href="https://github.com/FairPlay/issues"
              target="_blank"
              rel="noopener"
            >
              issue tracker
            </a>{" "}
            or our{" "}
            <a
              href="https://discord.gg/AZBwM6u9Kr"
              target="_blank"
              rel="noopener"
            >
              Discord server
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: "intellectualProperty",
      title: "Intellectual Property",
      icon: <FaCube size={16} />,
      content: (
        <>
          <h3>Source Code & Documentation</h3>
          <p>
            All FairPlay code and documentation are under the{" "}
            <a
              href="https://opensource.org/licenses/MIT"
              target="_blank"
              rel="noopener"
            >
              MIT License
            </a>
            . You may copy, modify, and redistribute, provided you retain
            copyright notices.
          </p>

          <h3>Third-Party Contributions</h3>
          <p>
            All user contributions are licensed under MIT unless specified.
            Contributors must have the right to grant this license.
          </p>

          <h3>Hosted Videos</h3>
          <ul>
            <li>
              <strong>Uploader License:</strong> Creators will be able to select
              a license (e.g., CC BY-SA, CC0, All Rights Reserved).
            </li>
            <li>
              <strong>Default License:</strong> If unspecified, “All Rights
              Reserved.”
            </li>
            <li>
              <strong>Rights to FairPlay:</strong> Uploading grants FairPlay a
              worldwide, non-exclusive, royalty-free license to host, stream,
              and distribute the content.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "limitation",
      title: "Limitation of Liability",
      icon: <FaExclamationTriangle size={16} />,
      content: (
        <>
          <p>
            FairPlay is provided "as is" and "as available" without warranties.
            We do not guarantee uninterrupted or error-free services.
          </p>
        </>
      ),
    },
    {
      id: "changes",
      title: "Changes to Terms",
      icon: <FaRedo size={16} />,
      content: (
        <>
          <p>
            We may update these Terms at any time. Updates are effective
            immediately upon posting.{" "}
            <strong>
              Continued use of Services constitutes acceptance of the changes.
            </strong>
          </p>
        </>
      ),
    },
  ];

  const [activeSection, setActiveSection] = useState<string>("introduction");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { threshold: 0.9 },
    );

    document
      .querySelectorAll("section[id]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <head>
        <title>Fairplay Terms</title>
        <meta
          name="description"
          content="Learn how to use, configure, and contribute to Fairplay, the open-source streaming ecosystem."
        />
      </head>

      <Topbar animateOnLoad={false} />

      <main className="min-h-screen text-(--color-text) px-6 py-20 scroll-smooth">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Terms</h1>
          <p className="text-(--color-text-para) text-lg max-w-2xl mx-auto"></p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <DocsSidebar sections={sections} activeSection={activeSection} />

          <div className="md:col-span-3 space-y-16">
            {sections.map((section, i) => (
              <DocsSection
                key={section.id}
                id={section.id}
                title={section.title}
                index={i}
              >
                {section.content}
              </DocsSection>
            ))}
          </div>
        </div>
      </main>

      <Footer variant="secondary" />
    </>
  );
}
