"use client";

import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthPageShell } from "@/components/app/auth/auth-page-shell";
import { AuthPasswordField } from "@/components/app/auth/auth-password-field";
import { AuthTextField } from "@/components/app/auth/auth-text-field";
import { useAuth } from "@/context/auth-context";
import { useAuthSubmit } from "@/hooks/use-auth-submit";
import { api } from "@/lib/api";
import { buildAuthHref, getSafeCallbackUrl } from "@/lib/safe-redirect";
import { setToken } from "@/lib/token";

const loginFormSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email or username is required")
    .transform((value) => (value.includes("@") ? value.toLowerCase() : value)),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const LOGIN_FORM_ID = "login-form";
const LOGIN_FORM_ERROR_ID = "login-form-error";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(params.get("callbackUrl"));
  const { user, isLoading, refetchUser } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(callbackUrl);
    }
  }, [callbackUrl, isLoading, router, user]);

  const submitLogin = useCallback(
    async (values: LoginFormValues) => {
      const response = await api.post("/auth/login", {
        emailOrUsername: values.identifier,
        password: values.password,
      });

      setToken(response.data.sessionKey);
      await refetchUser();
      router.replace(callbackUrl);
    },
    [callbackUrl, refetchUser, router],
  );

  const { onSubmit, error, isSubmitting, clearError } = useAuthSubmit<LoginFormValues>(submitLogin);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    shouldFocusError: true,
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  return (
    <AuthPageShell
      title="Login"
      switchHref={buildAuthHref("/register", callbackUrl)}
      switchLabel="Sign Up"
      formId={LOGIN_FORM_ID}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel="Login"
      submitPendingLabel="Signing in..."
      isSubmitting={isSubmitting}
      error={error}
      errorId={LOGIN_FORM_ERROR_ID}
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
    </AuthPageShell>
  );
}
