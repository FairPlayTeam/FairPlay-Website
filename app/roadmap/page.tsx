"use client";

import { motion } from "framer-motion";
import { FaArrowRight, FaCheck, FaTimes, FaCircleNotch } from "react-icons/fa";
import MarketingTopbar from "@/components/marketing/MarketingTopbar";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import Link from "@/components/ui/Link";
import Button from "@/components/ui/Button";

type RoadmapStatus = "done" | "progress" | "planned";

interface RoadmapItem {
  phase: string;
  title: string;
  description: React.ReactNode;
  status: RoadmapStatus;
  date: string;
}

export default function RoadmapPage() {
  const roadmap: RoadmapItem[] = [
    {
      phase: "Phase 1",
      title: "Foundation & Core Setup",
      description: (
        <>
          Initialization of the project, setting up the repo and the foundation
          of the framework.
        </>
      ),
      status: "done",
      date: "Q2 2025",
    },
    {
      phase: "Phase 2",
      title: "Core Features & API",
      description: (
        <>
          Implementation of core functionalities, community contributions, code
          refactoring, and{" "}
          <Link href="/contributors#api" variant="secondary">
            public API
          </Link>
          . You can take a look at our live build version{" "}
          <Link href="https://lab.fairplay.video">here</Link>
        </>
      ),
      status: "done",
      date: "Q3 2025",
    },
    {
      phase: "Phase 3",
      title: "UI/UX & Documentation",
      description: (
        <>
          Redesign of the site, creation of docs and better{" "}
          <Link href="/contributors" variant="secondary">
            guides for contributors
          </Link>
          .
        </>
      ),
      status: "progress",
      date: "Q4 2025",
    },
    {
      phase: "Phase 4",
      title: "Extension and Next.js",
      description: (
        <>
          Refactor the browser extension, adapting our current frontend to use{" "}
          <Link href="https://nextjs.org" variant="secondary">
            Next.js
          </Link>{" "}
          instead of Expo.
        </>
      ),
      status: "progress",
      date: "Q4 2025",
    },
    {
      phase: "Phase 5",
      title: "Beta Release",
      description: (
        <>Official Beta release of the FairPlay streaming platform.</>
      ),
      status: "planned",
      date: "Q1 2026",
    },
  ];

  return (
    <>
      <MarketingTopbar animateOnLoad={false} />

      <main className="background-gradient min-h-screen text-text px-6 py-20">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Project Roadmap</h1>
          <p className="text-text-para text-lg max-w-2xl mx-auto">
            A clear vision of our evolution. Each step builds the foundation of
            a free and human project. Thank you for making this possible!
          </p>
        </section>

        <div className="flex flex-col space-y-10 max-w-4xl mx-auto">
          {roadmap.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.2 }}
              className="relative bg-container rounded-2xl p-6 backdrop-blur-lg border border-border hover:scale-[1.01] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm uppercase tracking-widest text-text-bold">
                  {item.phase}
                </span>
                <span className="flex items-center space-x-2 text-gray-400">
                  {item.status === "planned" ? (
                    <>
                      <p className="text-gray-400">Planned</p>
                      <FaTimes className="text-red-500" />
                    </>
                  ) : item.status === "progress" ? (
                    <>
                      <p className="text-gray-400">Progress</p>
                      <FaCircleNotch className="text-orange-300" />
                    </>
                  ) : (
                    <>
                      <p className="text-gray-400">Done</p>
                      <FaCheck className="text-green-400" />
                    </>
                  )}
                </span>
              </div>
              <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
              <p className="text-text-para">{item.description}</p>
              <p className="text-sm mt-4 text-text-amount">{item.date}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-20">
          <Button
            variant="secondary"
            onClick={() =>
              (window.location.href = "https://github.com/FairPlayTeam")
            }
          >
            Contribute on Github <FaArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>
      <MarketingFooter variant="secondary" />
    </>
  );
}
