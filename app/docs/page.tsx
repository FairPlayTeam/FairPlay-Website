"use client";

import { useEffect, useState } from "react";
import Topbar from "../components/sections/Topbar";
import Footer from "../components/sections/Footer";
import DocsSection from "../components/docs/DocsSection";
import DocsSidebar from "../components/docs/DocsSidebar";
import Link from "../components/ui/Link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  FaLightbulb,
  FaCogs,
  FaPalette,
  FaDatabase,
  FaUsers,
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
            Welcome to the Fairplay documentation. This guide helps you
            understand how the platform works and how to contribute.
          </p>
          <p>
            Fairplay is an <strong>open-source streaming platform</strong> built
            to redefine how creators and viewers connect in a healthy
            environment.
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
          <p>
            To get started, clone the repository and install the dependencies:
          </p>

          <SyntaxHighlighter
            language="bash"
            style={vscDarkPlus}
            customStyle={{
              borderRadius: "0.75rem",
              padding: "1rem",
              background: "var(--gray-700-transparent)",
            }}
          >
            {`git clone https://github.com/FairPlayTeam/FairPlay-Website
cd FairPlay-Website
npm install
npm run dev`}
          </SyntaxHighlighter>

          <p className="mt-4">
            This project consists of four main repositories:
          </p>
          <ul className="list-disc ml-5 mt-2">
            <li>
              Website:{" "}
              <Link href="https://github.com/FairPlayTeam/FairPlay-Website">
                FairPlay-Website
              </Link>
            </li>
            <li>
              Expo frontend (TypeScript):{" "}
              <Link href="https://github.com/FairPlayTeam/frontend">
                frontend
              </Link>
            </li>
            <li>
              TypeScript backend:{" "}
              <Link href="https://github.com/FairPlayTeam/ts-backend">
                ts-backend
              </Link>
            </li>
            <li>
              Rust backend:{" "}
              <Link href="https://github.com/FairPlayTeam/backend">
                backend
              </Link>
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
            uses Expo/React Native, while this website is built with Next.js and
            TailwindCSS.
          </p>

          <p className="mt-4">
            Here is the main color palette used across our frontend:
          </p>

          <div className="grid grid-cols-6 gap-2 mt-10">
            {[
              { name: "Blue Pastel 100", color: "#94afff" },
              { name: "Blue Pastel 700", color: "#4564c0" },
              { name: "Blue 400", color: "#53a6ff" },
              { name: "Blue 500", color: "#2b90fc" },
              { name: "Gray 100", color: "#e2e2e2" },
              { name: "Gray 200", color: "#bbbbbb" },
              { name: "Gray 300", color: "#8b8b8b" },
              { name: "Gray 400", color: "#666666" },
              { name: "Gray 500", color: "#272626" },
              { name: "Gray 700", color: "#212121" },
              { name: "Gray 900", color: "#0f0f0f" },
              { name: "Pink 500", color: "#ff69b4" },
              { name: "White", color: "#ffffff" },
              { name: "Black", color: "#000000" },
            ].map(({ name, color }) => (
              <button
                key={name}
                className="flex flex-col items-center text-center group cursor-pointer"
                onClick={() => navigator.clipboard.writeText(color)}
                title={`Click to copy ${color}`}
              >
                <div
                  className="w-20 h-10 rounded-lg flex items-center justify-center text-[10px] p-3 border border-(--color-border)"
                  style={{
                    backgroundColor: color,
                    color:
                      parseInt(color.replace("#", ""), 16) > 0xffffff / 2
                        ? "#000"
                        : "#fff",
                  }}
                >
                  {color}
                </div>
                <span className="text-xs mt-1 text-(--color-text-para) group-hover:text-(--color-links)">
                  {name}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-10">
            We are using the <code>next-icons</code> icon set across the
            frontend.
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
            Our backend is fully open-source. You can use our API for free, see
            more details on our{" "}
            <Link href="https://apiv2.fairplay.video/docs/" variant="secondary">
              API enpoints list
            </Link>
            .
          </p>
          <p>
            It is currently written in TypeScript, with plans to migrate to Rust
            for enhanced performance.
          </p>

          <h3 className="font-bold text-xl mt-6">Storage</h3>
          <p>
            Videos are processed using <code>ffmpeg</code> into HLS playlists
            (.m3u8) and stored as S3 objects. Avatars and banners are saved in
            MinIO buckets, while the user database runs on PostgreSQL.
          </p>
          <p>
            Our backend runs entirely on self-hosted servers, made possible by
            generous donations! We currently operate with 2TB of video storage
            and a dedicated compute server, all managed with <code>Docker</code>
            . Thanks to{" "}
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
            Contributions are welcome! Before submitting a pull request, please
            read the{" "}
            <Link href="/docs/contribution-guidelines">
              contribution guidelines
            </Link>
            .
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

    document
      .querySelectorAll("section[id]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <head>
        <title>Fairplay Docs</title>
        <meta
          name="description"
          content="Learn how to use, configure, and contribute to Fairplay, the open-source streaming ecosystem."
        />
      </head>

      <Topbar animateOnLoad={false} />

      <main className="min-h-screen text-(--color-text) px-6 py-20 scroll-smooth">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Documentation</h1>
          <p className="text-(--color-text-para) text-lg max-w-2xl mx-auto">
            Learn how to use, configure, and contribute to Fairplay, the
            open-source streaming ecosystem.
          </p>
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

