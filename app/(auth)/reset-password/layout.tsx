import type { Metadata } from "next";

const title = "Reset Password";
const description = "Choose a new password for your FairPlay account.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/reset-password",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
