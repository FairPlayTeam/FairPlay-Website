import { AppShell } from '@/components/app/layout/app-shell'

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}

