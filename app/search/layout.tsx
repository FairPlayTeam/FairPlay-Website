import { AppShell } from "@/components/app/layout/AppShell";

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
