"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { AuthPageShell } from "@/components/app/auth/auth-page-shell";
import { AuthTextField } from "@/components/app/auth/auth-text-field";
import BackgroundDecoration from "@/components/ui/background-decoration";
import { Button } from "@/components/ui/button";
import { useAuthSubmit } from "@/hooks/use-auth-submit";
import { requestPasswordReset } from "@/lib/auth/api";
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from "@/lib/auth/forms";

function ForgotPasswordSuccess({ email }: { email: string }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <BackgroundDecoration />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border bg-background/80 p-8 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center">
            <MailCheck className="size-10 text-primary" />
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">Check your inbox</h1>
              <p className="text-sm text-muted-foreground">
                If an eligible account exists for{" "}
                <span className="font-medium text-foreground">{email}</span>, we sent a one-time
                password reset link.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/login">Back to login</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/forgot-password">Send another link</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const params = useSearchParams();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const submitForgotPassword = useCallback(async (values: ForgotPasswordFormValues) => {
    await requestPasswordReset({ email: values.email });
    setSubmittedEmail(values.email);
  }, []);

  const { onSubmit, error, isSubmitting, clearError } = useAuthSubmit<ForgotPasswordFormValues>(
    submitForgotPassword,
    "Unable to send a reset link right now. Please try again.",
  );

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    shouldFocusError: true,
    defaultValues: {
      email: params.get("email") ?? "",
    },
  });

  if (submittedEmail) {
    return <ForgotPasswordSuccess email={submittedEmail} />;
  }

  return (
    <AuthPageShell
      title="Forgot Password"
      switchHref="/login"
      switchLabel="Login"
      formId="forgot-password-form"
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel="Send reset link"
      submitPendingLabel="Sending..."
      isSubmitting={isSubmitting}
      error={error}
      errorId="forgot-password-form-error"
    >
      <p className="text-sm text-muted-foreground">
        Enter the email linked to your account and we&apos;ll send you a secure one-time reset
        link.
      </p>
      <AuthTextField
        id="email"
        label="Email"
        type="email"
        placeholder="nealmohan@youtube.com"
        autoComplete="email"
        autoFocus
        registration={form.register("email", { onChange: clearError })}
        error={form.formState.errors.email?.message}
      />
    </AuthPageShell>
  );
}
