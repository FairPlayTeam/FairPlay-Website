"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Mail, RotateCcw } from "lucide-react";
import { resendVerificationEmail } from "@/lib/auth/api";
import { Button } from "@/components/ui/button";

export default function VerifyPendingPage() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const resend = async () => {
    if (!email || status === "sending" || status === "sent") return;
    setStatus("sending");
    try {
      await resendVerificationEmail(email);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Mail className="size-10 text-muted-foreground" />
          <div>
            <p className="text-lg font-semibold">Check your inbox</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We sent a verification link to{" "}
              <span className="font-medium text-foreground">{email || "your email address"}</span>.
              Click the link to activate your account.
            </p>
          </div>
        </div>

        {status !== "sent" && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">Didn&apos;t receive it?</p>
            <Button
              variant="outline"
              size="sm"
              onClick={resend}
              disabled={!email || status === "sending"}
              className="gap-2"
            >
              <RotateCcw className={`size-3.5 ${status === "sending" ? "animate-spin" : ""}`} />
              {status === "sending" ? "Sending..." : "Resend verification email"}
            </Button>
            {status === "error" && (
              <p className="text-xs text-destructive">Failed to send. Please try again.</p>
            )}
          </div>
        )}

        {status === "sent" && (
          <p className="text-center text-sm text-muted-foreground">
            Email resent, check your inbox and click the link to verify your account.
          </p>
        )}
      </div>
    </div>
  );
}
