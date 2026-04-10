import type { Metadata } from "next";
import { requireAuthenticatedUser } from "@/lib/auth/server-guard";

const title = "Subscriptions";
const description = "See creators you follow on FairPlay";

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

export default async function SubscriptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthenticatedUser("/subscriptions");

  return children;
}
