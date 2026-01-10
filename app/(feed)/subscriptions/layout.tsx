import type { Metadata } from "next";

const title = "Subscriptions";
const description = "See creators you follow on FairPlay.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/subscriptions",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function SubscriptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
