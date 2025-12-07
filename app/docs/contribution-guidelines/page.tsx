"use client";

import { useEffect, useState } from "react";
import Topbar from "@/components/sections/Topbar";
import Footer from "@/components/sections/Footer";
import DocsSection from "@/components/docs/DocsSection";
import DocsSidebar from "@/components/docs/DocsSidebar";
import Link from "@/components/ui/Link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  FaLightbulb,
  FaRobot,
  FaEdit,
  FaShieldAlt,
  FaTag,
} from "react-icons/fa";

export default function DocsPage() {
  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <FaLightbulb size={16} />,
      content: (
        <>
          <p>
            Welcome to the contribution guide, here you'll learn how to setup
            your own copy of this website, a couple rules and stardands we
            follow, and prepare yourself to make some amazing contributions!
          </p>
          <p>
            To get started,{" "}
            <Link href="https://github.com/FairPlayTeam/FairPlay-Website/fork">
              fork the repository
            </Link>{" "}
            and install some dependencies
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
npm install`}
          </SyntaxHighlighter>
          Then, open up the folder with your favorite code editor and create a
          file at the root of the project called <strong>.env</strong>, and add
          this line:
          <SyntaxHighlighter
            language="tsx"
            style={vscDarkPlus}
            customStyle={{
              borderRadius: "0.75rem",
              padding: "1rem",
              background: "var(--gray-700-transparent)",
            }}
          >
            {`NEXT_PUBLIC_API_BASE_URL=https://apiv2.fairplay.video/
`}
          </SyntaxHighlighter>
          Then re-open your terminal and run
          <SyntaxHighlighter
            language="tsx"
            style={vscDarkPlus}
            customStyle={{
              borderRadius: "0.75rem",
              padding: "1rem",
              background: "var(--gray-700-transparent)",
            }}
          >
            {`npm run dev`}
          </SyntaxHighlighter>
          Open your browser and go to{" "}
          <Link href="http://localhost:3000">localhost:3000</Link> You should
          now see a preview of the website where you can test your changes
        </>
      ),
    },
    {
      id: "ai",
      title: "AI Policy",
      icon: <FaRobot size={16} />,
      content: (
        <>
          <p>
            As you can probably tell from the rest of this website, we're not
            big fans of AI. So, heres all the ways you should be using AI when
            working on this.
          </p>

          <ul className="list-disc list-inside">
            <li>AI should only be used for basic css and research</li>
            <li>
              AI generated code must undergo rigorous review by a team member
            </li>
            <li>
              AI should <strong>never</strong> be used to write critical code
              like security, authentication or network infrastructure
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "conventions",
      title: "Code Conventions",
      icon: <FaEdit size={16} />,
      content: (
        <>
          <p>These guides are here to maintain code quality and readability</p>

          <ul className="list-decimal list-inside">
            <li>Readability: code must be understandable by any contributor</li>
            <li>
              Language: all variable, functions, and class names, as well as
              comments must be in American English.
            </li>
            <li>Comments: comment on complex parts of the code.</li>
            <li>
              Tests: any new code added must be accompanied by unit tests when
              applicable
            </li>
            <li>
              Dependency Management: avoid adding unnecessary libraries, prefer
              native and lightweight solutions
            </li>
          </ul>
          <p>
            Before finalizing anything, make sure it passes the linting and
            formatting checks with:
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
            {`npm run lint # or pnpm lint
npm run format # or pnpm format`}
          </SyntaxHighlighter>
        </>
      ),
    },
    {
      id: "security",
      title: "Security",
      icon: <FaShieldAlt size={16} />,
      content: (
        <>
          <p>
            {" "}
            <strong>
              Warning! These are really important security considerations, make
              sure you fully understand them before moving on{" "}
            </strong>{" "}
            <br />
          </p>
          <ul className="list-disc list-inside">
            <li>
              <strong>DO NOT</strong> store API keys or other sensitive data in
              the repository must be committed to the repository, put them in
              .env file you made earlier
            </li>
            <li>
              Any detected security vulnerability must be reported{" "}
              <strong>immediately</strong> and treated as a priority.
            </li>
            <li>
              The project aims for transparency; major decisions (technical or
              organizational) must be discussed publicly on{" "}
              <Link href="https://discord.gg/6g5cBUVra9">Discord</Link> .
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "naming",
      title: "Naming Conventions",
      icon: <FaTag size={16} />,
      content: (
        <>
          <h3 className="font-bold text-xl mt-6">Variables</h3>
          <ul className="list-disc list-inside">
            <li>
              All variables must be in camelCase, except constants which can be
              in all caps.
            </li>
            <li>
              React components and pages must be in <strong>PascalCase</strong>
            </li>
          </ul>
          <h3 className="font-bold text-xl mt-6">Files and Folders</h3>
          <ul className="list-disc list-inside">
            <li>
              Make sure all files follow the same naming conventions and dont
              cause problems on case-sensetive systems like Linux or Mac
            </li>
            <li>
              Avoid spaces, accents, or special characters (including non-roman
              characters)
            </li>
            <li>
              Make sure the file extension is <strong>always</strong> lowercase
            </li>
          </ul>
          <h3 className="font-bold text-xl mt-6">React/Next.js conventions</h3>
          <ul className="list-disc list-inside">
            <li>
              Make sure all files follow the same naming conventions and dont
              cause problems on case-sensetive systems like Linux or Mac
            </li>
            <li>
              Any React component and page files should be in{" "}
              <strong>PascalCase</strong>
            </li>
            <li>
              Utility, hook, and service files should be in{" "}
              <strong>camelCase</strong>
            </li>
            <li>
              Folders should be in <strong>kebab-case</strong>
            </li>
          </ul>
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
      { threshold: 0.9 }
    );

    document
      .querySelectorAll("section[id]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Topbar animateOnLoad={false} />

      <main className="min-h-screen text-text px-6 py-20 scroll-smooth">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Documentation</h1>
          <p className="text-text-para text-lg max-w-2xl mx-auto">
            Learn how contribute to FairPlay, the open-source streaming
            ecosystem.
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
