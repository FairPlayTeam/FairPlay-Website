import type { Metadata } from "next";
import { AppShell } from "@/components/app/layout/app-shell";
import { requireAuthorizedRole } from "@/lib/auth/server-guard";

const title = "Admin";
const description = "Admin tools for FairPlay";

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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAuthorizedRole(["admin"], "/admin");

  return <AppShell>{children}</AppShell>;
}
