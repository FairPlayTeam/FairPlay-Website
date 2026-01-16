import type { Metadata } from "next";

const title = "Terms";
const description = "FairPlay terms and conditions.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/terms",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
