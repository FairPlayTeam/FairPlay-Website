"use client";

import { AppShell } from "@/components/app/layout/AppShell";
import Button from "@/components/ui/Button";

export default function NotFoundContent() {
  return (
    <AppShell mainClassName="flex items-center justify-center">
      <div className="min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <p className="text-sm font-medium text-gray-400">Error</p>

          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            404 Page not found
          </h1>

          <p className="mt-3 text-base sm:text-lg text-gray-300">
            The page you&apos;re looking for doesn&apos;t exist or hasn&apos;t
            been implemented yet.
          </p>

          <div className="mt-6 flex gap-3">
            <Button
              variant="primary"
              onClick={() => {
                window.location.href = "/explore";
              }}
            >
              Back to home
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
