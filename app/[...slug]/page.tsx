'use client';

import { useSearchParams, usePathname, redirect } from 'next/navigation';
import NotFound from '@/app/+not-found/page';

export default function CatchAll() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const seg = segments.length > 0 ? segments[0] : undefined;

  if (seg && seg.startsWith('@') && seg.length > 1) {
    const username = seg.slice(1);
    redirect(`/user/${username}`);
  }

  return <NotFound />;
}