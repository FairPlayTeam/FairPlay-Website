import { AppShell } from "@/components/app/layout/AppShell";

export default function ModerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
