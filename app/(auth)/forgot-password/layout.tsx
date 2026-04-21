import type { Metadata } from "next";

const title = "Forgot Password";
const description = "Request a secure password reset link for your FairPlay account.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/forgot-password",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
