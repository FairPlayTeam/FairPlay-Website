import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { getSafeCallbackUrl } from "@/lib/safe-redirect";

type ServiceUnavailablePageProps = {
  searchParams: Promise<{
    from?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Service Unavailable",
  description: "FairPlay could not validate your session right now.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/service-unavailable",
  },
};

export default async function ServiceUnavailablePage({
  searchParams,
}: ServiceUnavailablePageProps) {
  const { from } = await searchParams;
  const retryHref = getSafeCallbackUrl(from, "/explore");

  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center text-center">
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Authentication is temporarily unavailable
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          FairPlay could not confirm your session with the backend right now. This usually means the
          API is temporarily unavailable, not that you were logged out.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild className="rounded-full px-5">
            <Link href={retryHref}>Try again</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-5">
            <Link href="/explore">Go to Explore</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
