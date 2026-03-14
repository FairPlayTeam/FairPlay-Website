"use client";

import { useEffect, useState } from "react";
import MarketingTopbar from "@/components/marketing/MarketingTopbar";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import DocsSection from "@/components/marketing/docs/DocsSection";
import DocsSidebar from "@/components/marketing/docs/DocsSidebar";
import { FaLightbulb } from "react-icons/fa";

export default function TermsPage() {
  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: <FaLightbulb size={16} />,
      content: (
        <>
          <p>
            This part is currently being written. Please check back later for
            the full Terms and Conditions.
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
      { threshold: 0.9 }
    );

    document
      .querySelectorAll("section[id]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <MarketingTopbar animateOnLoad={false} />

      <main className="background-gradient min-h-screen px-6 py-20 text-foreground scroll-smooth">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Terms</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground"></p>
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

      <MarketingFooter variant="secondary" />
    </>
  );
}
