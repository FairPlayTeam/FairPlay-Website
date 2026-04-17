"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MailCheck, XCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { resendVerificationEmail, verifyEmail } from "@/lib/auth/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

const SESSION_SYNC_RETRY_DELAYS_MS = [150, 300, 600];

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const { refetchUser } = useAuth();
  const token = params.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error",
  );
  const [errorMessage, setErrorMessage] = useState(
    token ? "" : "The verification link is invalid or incomplete.",
  );
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    if (!token) return undefined;

    let isMounted = true;
    let redirectTimeout: ReturnType<typeof setTimeout> | null = null;

    void (async () => {
      try {
        await verifyEmail(token);
        if (!isMounted) return;
        setStatus("success");

        for (const delay of SESSION_SYNC_RETRY_DELAYS_MS) {
          try {
            await refetchUser();
            break;
          } catch {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }

        redirectTimeout = setTimeout(() => window.location.replace("/explore"), 1200);
      } catch (error) {
        if (!isMounted) return;
        setStatus("error");
        setErrorMessage(getApiErrorMessage(error, "Something went wrong. Please try again."));
      }
    })();

    return () => {
      isMounted = false;
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
  }, [refetchUser, token]);

  const handleResend = async () => {
    if (!resendEmail || resendStatus === "sending" || resendStatus === "sent") return;
    setResendStatus("sending");
    try {
      await resendVerificationEmail(resendEmail);
      setResendStatus("sent");
    } catch {
      setResendStatus("error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <Spinner className="size-10" />
            <div>
              <p className="text-lg font-semibold">Verifying your email</p>
              <p className="mt-1 text-sm text-muted-foreground">Just a moment...</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <MailCheck className="size-10 text-primary" />
            <div>
              <p className="text-lg font-semibold">Email verified!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                You&apos;re all set. Redirecting you now...
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <XCircle className="size-10 text-destructive" />
              <div>
                <p className="text-lg font-semibold">Verification failed</p>
                <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-center text-sm text-muted-foreground">
                Need a new link? Enter your email below.
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                onClick={handleResend}
                disabled={!resendEmail || resendStatus === "sending" || resendStatus === "sent"}
                className="w-full"
              >
                {resendStatus === "sending"
                  ? "Sending..."
                  : resendStatus === "sent"
                    ? "Email sent!"
                    : "Resend verification email"}
              </Button>

              {resendStatus === "sent" && (
                <p className="text-center text-xs text-muted-foreground">
                  Check your inbox and click the link to verify your account.
                </p>
              )}
              {resendStatus === "error" && (
                <p className="text-center text-xs text-destructive">
                  Failed to send. Please try again.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
