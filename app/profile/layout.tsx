import { AppShell } from "@/components/app/layout/AppShell";
import { Suspense } from "react";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return <AppShell><Suspense fallback={null}>{children}</Suspense></AppShell>;
}
