import type { Metadata } from "next";
import { AppShell } from "@/components/app/layout/AppShell";

const title = "Upload Video";
const description = "Upload a new video to FairPlay.";

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

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
