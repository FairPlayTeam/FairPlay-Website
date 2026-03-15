import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-5rem)] w-full grid place-items-center">
          <Spinner className="size-18" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
