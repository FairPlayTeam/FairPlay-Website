import type { Metadata } from "next";
import { AppShell } from "@/components/app/layout/app-shell";
import { requireAuthorizedRole } from "@/lib/auth/server-guard";

const title = "Moderation";
const description = "Moderation tools for FairPlay";

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

export default async function ModerationLayout({ children }: { children: React.ReactNode }) {
  await requireAuthorizedRole(["admin", "moderator"], "/moderator");

  return <AppShell>{children}</AppShell>;
}
