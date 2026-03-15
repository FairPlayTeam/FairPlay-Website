"use client";

import { motion } from "framer-motion";
import { FaArrowRight, FaCheck, FaTimes, FaCircleNotch } from "react-icons/fa";
import MarketingTopbar from "@/components/marketing/MarketingTopbar";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import Link from "@/components/marketing/Link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RoadmapStatus = "done" | "progress" | "planned";

interface RoadmapItem {
  phase: string;
  title: string;
  description: React.ReactNode;
  status: RoadmapStatus;
  date: string;
}

const statusMeta: Record<
  RoadmapStatus,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  done: {
    label: "Done",
    className: "bg-secondary text-secondary-foreground",
    icon: FaCheck,
  },
  progress: {
    label: "In Progress",
    className: "bg-primary/10 text-primary",
    icon: FaCircleNotch,
  },
  planned: {
    label: "Planned",
    className: "bg-muted text-muted-foreground",
    icon: FaTimes,
  },
};

export default function RoadmapPage() {
  const roadmap: RoadmapItem[] = [
    {
      phase: "Phase 1",
      title: "Foundation & Core Setup",
      description: (
        <>Initialization of the project, setting up the repo and the foundation of the framework.</>
      ),
      status: "done",
      date: "Q2 2025",
    },
    {
      phase: "Phase 2",
      title: "Core Features & API",
      description: (
        <>
          Implementation of core functionalities, community contributions, code refactoring, and{" "}
          <Link href="https://apiv2.fairplay.video/docs/" variant="secondary">
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
          <Link href="/docs/contribution-guidelines" variant="secondary">
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
      description: <>Official Beta release of the FairPlay streaming platform.</>,
      status: "planned",
      date: "Q1 2026",
    },
  ];

  return (
    <>
      <MarketingTopbar animateOnLoad={false} />

      <main className="background-gradient min-h-screen px-6 py-20 text-foreground">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Project Roadmap</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            A clear vision of our evolution. Each step builds the foundation of a free and human
            project. Thank you for making this possible!
          </p>
        </section>

        <div className="flex flex-col space-y-10 max-w-4xl mx-auto">
          {roadmap.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.2 }}
              className="relative rounded-2xl border border-border bg-card/90 p-6 shadow-sm backdrop-blur-lg transition-all duration-300 hover:scale-[1.01] hover:border-primary/30"
            >
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm uppercase tracking-widest text-muted-foreground">
                  {item.phase}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
                    statusMeta[item.status].className,
                  )}
                >
                  {(() => {
                    const StatusIcon = statusMeta[item.status].icon;
                    return (
                      <>
                        <StatusIcon className={cn(item.status === "progress" && "animate-spin")} />
                        {statusMeta[item.status].label}
                      </>
                    );
                  })()}
                </span>
              </div>
              <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
              <p className="text-muted-foreground">{item.description}</p>
              <p className="mt-4 text-sm text-primary">{item.date}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-20">
          <Button
            variant="secondary"
            onClick={() => (window.location.href = "https://github.com/FairPlayTeam")}
          >
            Contribute on Github <FaArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>
      <MarketingFooter variant="secondary" />
    </>
  );
}
