"use client";

import { useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthPageShell } from "@/components/app/auth/auth-page-shell";
import { AuthPasswordField } from "@/components/app/auth/auth-password-field";
import { AuthTextField } from "@/components/app/auth/auth-text-field";
import { login } from "@/lib/auth/api";
import { syncRoleCookie } from "@/lib/auth/cookies";
import { loginFormSchema, type LoginFormValues } from "@/lib/auth/forms";
import { setSessionToken } from "@/lib/auth/session";
import { useRedirectAuthenticatedUser } from "@/hooks/use-redirect-authenticated-user";
import { useAuthSubmit } from "@/hooks/use-auth-submit";
import { buildAuthHref, getSafeCallbackUrl } from "@/lib/safe-redirect";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(params.get("callbackUrl"));
  const { refetchUser } = useRedirectAuthenticatedUser(callbackUrl);

  const submitLogin = useCallback(
    async (values: LoginFormValues) => {
      const response = await login({
        emailOrUsername: values.identifier,
        password: values.password,
      });

      setSessionToken(response.data.sessionKey);
      const authenticatedUser = await refetchUser();
      syncRoleCookie(authenticatedUser?.role ?? null);
      router.replace(callbackUrl);
    },
    [callbackUrl, refetchUser, router],
  );

  const { onSubmit, error, isSubmitting, clearError } = useAuthSubmit<LoginFormValues>(submitLogin);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    shouldFocusError: true,
    defaultValues: { identifier: "", password: "" },
  });

  const identifierValue = useWatch({
    control: form.control,
    name: "identifier",
    defaultValue: "",
  });
  const isUnverifiedError = error?.includes("Please verify your email address before logging in.");
  const emailForResend = identifierValue.includes("@") ? identifierValue : undefined;

  return (
    <AuthPageShell
      title="Login"
      switchHref={buildAuthHref("/register", callbackUrl)}
      switchLabel="Sign Up"
      formId="login-form"
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel="Login"
      submitPendingLabel="Signing in..."
      isSubmitting={isSubmitting}
      error={isUnverifiedError ? null : error}
      errorId="login-form-error"
    >
      <AuthTextField
        id="identifier"
        label="Email or username"
        type="text"
        placeholder="nealmohan@youtube.com"
        autoComplete="username"
        autoFocus
        registration={form.register("identifier", { onChange: clearError })}
        error={form.formState.errors.identifier?.message}
      />
      <AuthPasswordField
        id="password"
        label="Password"
        placeholder="Password"
        autoComplete="current-password"
        registration={form.register("password", { onChange: clearError })}
        error={form.formState.errors.password?.message}
      />

      {isUnverifiedError && (
        <p className="text-sm text-destructive">
          Your email address has not been verified.{" "}
          <a
            href={
              emailForResend
                ? `/register/verify?email=${encodeURIComponent(emailForResend)}`
                : "/register/verify"
            }
            className="underline underline-offset-2"
          >
            Resend verification email
          </a>
        </p>
      )}
    </AuthPageShell>
  );
}
