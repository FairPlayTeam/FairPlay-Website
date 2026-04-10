import type { Metadata } from "next";
import { AppShell } from "@/components/app/layout/app-shell";
import { requireAuthenticatedUser } from "@/lib/auth/server-guard";

const title = "Upload Video";
const description = "Upload a new video to FairPlay";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/upload",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function UploadLayout({ children }: { children: React.ReactNode }) {
  await requireAuthenticatedUser("/upload");

  return <AppShell>{children}</AppShell>;
}
