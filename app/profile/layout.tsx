import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app/layout/AppShell";

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

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <Suspense fallback={null}>{children}</Suspense>
    </AppShell>
  );
}
