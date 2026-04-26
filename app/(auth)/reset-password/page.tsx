"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck, ShieldAlert } from "lucide-react";
import { AuthPageShell } from "@/components/app/auth/auth-page-shell";
import { AuthPasswordField } from "@/components/app/auth/auth-password-field";
import { PasswordCriteria } from "@/components/app/auth/password-criteria";
import BackgroundDecoration from "@/components/ui/background-decoration";
import { Button } from "@/components/ui/button";
import { useAuthSubmit } from "@/hooks/use-auth-submit";
import { resetPassword as resetPasswordRequest } from "@/lib/auth/api";
import {
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from "@/lib/auth/forms";
import { useAuth } from "@/context/auth-context";

function AuthStatusCard({
  icon,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <BackgroundDecoration />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border bg-background/80 p-8 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center">
            {icon}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
            {secondaryHref && secondaryLabel ? (
              <Button asChild variant="outline" className="w-full">
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { refetchUser } = useAuth();
  const token = useMemo(() => params.get("token")?.trim() ?? "", [params]);
  const [status, setStatus] = useState<"form" | "success">("form");

  const submitResetPassword = useCallback(
    async (values: ResetPasswordFormValues) => {
      if (!token) {
        throw new Error("The password reset link is invalid or incomplete.");
      }

      await resetPasswordRequest({
        token,
        password: values.password,
      });

      await refetchUser();
      setStatus("success");
    },
    [refetchUser, token],
  );

  const { onSubmit, error, isSubmitting, clearError } = useAuthSubmit<ResetPasswordFormValues>(
    submitResetPassword,
    "Unable to reset your password right now. Please try again.",
  );

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    shouldFocusError: true,
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = useWatch({ control: form.control, name: "password", defaultValue: "" });
  const isInvalidLink =
    !token ||
    error === "Invalid or expired password reset link." ||
    error === "The password reset link is invalid or incomplete.";

  useEffect(() => {
    if (status !== "success") return undefined;

    const timeout = setTimeout(() => {
      router.replace("/login?reset=success");
    }, 2500);

    return () => clearTimeout(timeout);
  }, [router, status]);

  if (status === "success") {
    return (
      <AuthStatusCard
        icon={<MailCheck className="size-10 text-primary" />}
        title="Password updated"
        description="Your password has been changed and any active sessions were signed out. Redirecting you to login now..."
        primaryHref="/login?reset=success"
        primaryLabel="Go to login"
      />
    );
  }

  if (isInvalidLink) {
    return (
      <AuthStatusCard
        icon={<ShieldAlert className="size-10 text-destructive" />}
        title="Reset link invalid"
        description="This password reset link is missing, expired, or has already been used. Request a fresh link to continue."
        primaryHref="/forgot-password"
        primaryLabel="Request a new link"
        secondaryHref="/login"
        secondaryLabel="Back to login"
      />
    );
  }

  return (
    <AuthPageShell
      title="Reset Password"
      switchHref="/login"
      switchLabel="Login"
      formId="reset-password-form"
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel="Update password"
      submitPendingLabel="Updating..."
      isSubmitting={isSubmitting}
      error={error}
      errorId="reset-password-form-error"
    >
      <AuthPasswordField
        id="password"
        label="New password"
        placeholder="New password"
        autoComplete="new-password"
        autoFocus
        registration={form.register("password", { onChange: clearError })}
        error={form.formState.errors.password?.message}
        helper={<PasswordCriteria password={passwordValue} />}
        helperId="reset-password-criteria"
      />
      <AuthPasswordField
        id="confirmPassword"
        label="Confirm new password"
        placeholder="Confirm new password"
        autoComplete="new-password"
        registration={form.register("confirmPassword", { onChange: clearError })}
        error={form.formState.errors.confirmPassword?.message}
      />
    </AuthPageShell>
  );
}
