import { AppShell } from "@/components/app/layout/AppShell";

export default function ChannelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
