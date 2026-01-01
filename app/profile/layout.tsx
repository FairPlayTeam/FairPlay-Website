import { AppShell } from "@/components/app/layout/AppShell";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
