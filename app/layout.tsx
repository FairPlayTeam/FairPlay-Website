import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  METADATA_BASE,
  SITE_NAME,
  TWITTER_HANDLE,
} from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: METADATA_BASE,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const darkmode = true;

  return (
    <html lang="en" className={darkmode ? "dark" : ""}>
      <body className="bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
