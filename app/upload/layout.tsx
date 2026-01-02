import { AppShell } from "@/components/app/layout/AppShell";

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
