import { AppShell } from "@/components/app/layout/app-shell";

export default function ChannelLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
