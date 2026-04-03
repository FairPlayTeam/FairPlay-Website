"use client";

import { useEffect, useState } from "react";
import MarketingTopbar from "@/components/marketing/layout/MarketingTopbar";
import MarketingFooter from "@/components/marketing/layout/MarketingFooter";
import DocsSection from "@/components/marketing/docs/DocsSection";
import DocsSidebar from "@/components/marketing/docs/DocsSidebar";
import Link from "@/components/marketing/ui/Link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FaLightbulb, FaCogs, FaPalette, FaDatabase, FaUsers } from "react-icons/fa";

const codeBlockStyle = {
  borderRadius: "0.75rem",
  padding: "1rem",
  background: "var(--card)",
  border: "1px solid var(--border)",
};

const themePalette = [
  { name: "Primary 100", variable: "--primary-100" },
  { name: "Primary", variable: "--primary" },
  { name: "Primary 400", variable: "--primary-400" },
  { name: "Primary 500", variable: "--primary-500" },
  { name: "Background", variable: "--background" },
  { name: "Card", variable: "--card" },
  { name: "Secondary", variable: "--secondary" },
  { name: "Muted", variable: "--muted" },
];

export default function DocsPage() {
  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: <FaLightbulb size={16} />,
      content: (
        <>
          <p>
            Welcome to the FairPlay documentation. This guide helps you understand how the platform
            works and how to contribute.
          </p>
          <p>
            FairPlay is an <strong>open-source streaming platform</strong> built to redefine how
            creators and viewers connect in a healthy environment.
          </p>
        </>
      ),
    },
    {
      id: "installation",
      title: "Installation",
      icon: <FaCogs size={16} />,
      content: (
        <>
          <p>To get started, clone the repository and install the dependencies:</p>

          <SyntaxHighlighter language="bash" style={vscDarkPlus} customStyle={codeBlockStyle}>
            {`git clone https://github.com/FairPlayTeam/FairPlay-Website
cd FairPlay-Website
npm install
npm run dev`}
          </SyntaxHighlighter>

          <p className="mt-4">This project consists of four main repositories:</p>
          <ul className="list-disc ml-5 mt-2">
            <li>
              Website:{" "}
              <Link href="https://github.com/FairPlayTeam/FairPlay-Website">FairPlay-Website</Link>
            </li>
            <li>
              Expo frontend (TypeScript):{" "}
              <Link href="https://github.com/FairPlayTeam/frontend">frontend</Link>
            </li>
            <li>
              TypeScript backend:{" "}
              <Link href="https://github.com/FairPlayTeam/ts-backend">ts-backend</Link>
            </li>
            <li>
              Rust backend: <Link href="https://github.com/FairPlayTeam/backend">backend</Link>
            </li>
          </ul>

          <p className="mt-3">
            FairPlay uses{" "}
            <Link href="https://nextjs.org" variant="secondary">
              Next.js
            </Link>{" "}
            and{" "}
            <Link href="https://tailwindcss.com" variant="secondary">
              TailwindCSS
            </Link>{" "}
            for its frontend.
          </p>
        </>
      ),
    },
    {
      id: "frontend",
      title: "Frontend",
      icon: <FaPalette size={16} />,
      content: (
        <>
          <p>
            The live build{" "}
            <Link href="https://lab.fairplay.video" variant="secondary">
              lab.fairplay.video
            </Link>{" "}
            uses Expo/React Native, while this website is built with Next.js and TailwindCSS.
          </p>

          <p className="mt-4">
            Here are the main theme tokens exposed by <code>globals.css</code>. Click a swatch to
            copy the CSS variable.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {themePalette.map(({ name, variable }) => (
              <button
                key={variable}
                className="group flex cursor-pointer flex-col items-start rounded-xl border border-border bg-card/70 p-3 text-left transition-colors duration-200 hover:border-primary/40"
                onClick={() => navigator.clipboard.writeText(variable)}
                title={`Click to copy ${variable}`}
              >
                <div
                  className="h-10 w-full rounded-lg border border-border"
                  style={{ backgroundColor: `var(${variable})` }}
                />
                <span className="mt-3 text-sm font-medium text-foreground group-hover:text-primary">
                  {name}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">{variable}</span>
              </button>
            ))}
          </div>

          <p className="mt-10">
            We are using the <code>next-icons</code> icon set across the frontend.
          </p>
        </>
      ),
    },
    {
      id: "backend",
      title: "Backend",
      icon: <FaDatabase size={16} />,
      content: (
        <>
          <p>
            Our backend is fully open-source. You can use our API for free, see more details on our{" "}
            <Link href="https://apiv2.fairplay.video/docs/" variant="secondary">
              API enpoints list
            </Link>
            .
          </p>
          <p>
            It is currently written in TypeScript, with plans to migrate to Rust for enhanced
            performance.
          </p>

          <h3 className="font-bold text-xl mt-6">Storage</h3>
          <p>
            Videos are processed using <code>ffmpeg</code> into HLS playlists (.m3u8) and stored as
            S3 objects. Avatars and banners are saved in MinIO buckets, while the user database runs
            on PostgreSQL.
          </p>
          <p>
            Our backend runs entirely on self-hosted servers, made possible by generous donations!
            We currently operate with 2TB of video storage and a dedicated compute server, all
            managed with <code>Docker</code>. Thanks to{" "}
            <Link href="https://www.4hostings.com/" variant="secondary">
              4-Hosting
            </Link>{" "}
            for providing hosting support.
          </p>
        </>
      ),
    },
    {
      id: "contribution",
      title: "Contributing",
      icon: <FaUsers size={16} />,
      content: (
        <>
          <p>
            Contributions are welcome! Before submitting a pull request, please read the{" "}
            <Link href="/docs/contribution-guidelines">contribution guidelines</Link>.
          </p>
          <p>
            Discussions and planning take place in our{" "}
            <Link href="https://discord.gg/6g5cBUVra9">Discord community</Link>.
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

    document.querySelectorAll("section[id]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <MarketingTopbar animateOnLoad={false} />

      <main className="background-gradient min-h-screen px-6 py-20 text-foreground scroll-smooth">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Documentation</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Learn how to use, configure, and contribute to FairPlay, the open-source streaming
            ecosystem.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <DocsSidebar sections={sections} activeSection={activeSection} />

          <div className="md:col-span-3 space-y-16">
            {sections.map((section, i) => (
              <DocsSection key={section.id} id={section.id} title={section.title} index={i}>
                {section.content}
              </DocsSection>
            ))}
          </div>
        </div>
      </main>

      <MarketingFooter variant="secondary" />
    </>
  );
}
