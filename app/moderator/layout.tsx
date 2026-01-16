import type { Metadata } from "next";
import { AppShell } from "@/components/app/layout/AppShell";

const title = "Moderation";
const description = "Moderation tools for FairPlay.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/moderator",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ModerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
