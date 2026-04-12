"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type AuthUnavailableNoticeProps = {
  title?: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function AuthUnavailableNotice({
  title = "Authentication is temporarily unavailable",
  description,
  actionHref,
  actionLabel = "Open status page",
}: AuthUnavailableNoticeProps) {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="mb-4 text-2xl font-semibold">{title}</h2>
      <p className="mx-auto max-w-2xl text-muted-foreground">{description}</p>
      {actionHref ? (
        <Button asChild variant="outline" className="mt-6 rounded-full px-5">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
