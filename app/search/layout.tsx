import type { Metadata } from "next";
import { AppShell } from "@/components/app/layout/AppShell";

const title = "Search";
const description = "Search videos and creators on FairPlay.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/search",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
