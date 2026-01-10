import type { Metadata } from "next";
import { AppShell } from "@/components/app/layout/AppShell";

const title = "Admin";
const description = "Admin tools for FairPlay.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
