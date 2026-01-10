import type { Metadata } from "next";

const title = "Register";
const description = "Create a FairPlay account.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/register",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
