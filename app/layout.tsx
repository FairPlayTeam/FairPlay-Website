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
import { ThemeColorsSchema, themeColorsToCSSVars } from "@/lib/theme";
import { cookies } from "next/headers";
import { ThemeSync } from "@/components/theme/theme-sync";
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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme");
  let injectedCSSObj = "";

  if (themeCookie?.value) {
    try {
      const decodedTheme = JSON.parse(decodeURIComponent(themeCookie.value));
      const parsedTheme = ThemeColorsSchema.safeParse(decodedTheme);
      if (parsedTheme.success) {
        injectedCSSObj = themeColorsToCSSVars(parsedTheme.data);
      }
    } catch (e) {
      console.error("Error while loading theme:", e);
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        {injectedCSSObj && (
          <style
            id="theme-style-tag"
            dangerouslySetInnerHTML={{ __html: `:root{${injectedCSSObj}}` }}
          />
        )}
        <Providers>
          <ThemeSync />
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
