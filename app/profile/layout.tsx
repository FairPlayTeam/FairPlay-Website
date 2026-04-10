import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app/layout/app-shell";
import { requireAuthenticatedUser } from "@/lib/auth/server-guard";

const title = "Profile Settings";
const description = "Manage your FairPlay profile and account settings.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/profile",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  await requireAuthenticatedUser("/profile");

  return (
    <AppShell>
      <Suspense fallback={null}>{children}</Suspense>
    </AppShell>
  );
}
