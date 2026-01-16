import type { Metadata } from "next";

const title = "Login";
const description = "Sign in to your FairPlay account.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
