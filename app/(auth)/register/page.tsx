"use client";

import { useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthPageShell } from "@/components/app/auth/auth-page-shell";
import { AuthPasswordField } from "@/components/app/auth/auth-password-field";
import { PasswordCriteria } from "@/components/app/auth/password-criteria";
import { AuthTextField } from "@/components/app/auth/auth-text-field";
import { register } from "@/lib/auth/api";
import { registerFormSchema, type RegisterFormValues } from "@/lib/auth/forms";
import { useRedirectAuthenticatedUser } from "@/hooks/use-redirect-authenticated-user";
import { useAuthSubmit } from "@/hooks/use-auth-submit";
import { buildAuthHref, getSafeCallbackUrl } from "@/lib/safe-redirect";

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(params.get("callbackUrl"));
  useRedirectAuthenticatedUser(callbackUrl);

  const submitRegistration = useCallback(
    async (values: RegisterFormValues) => {
      await register({
        email: values.email,
        username: values.username,
        password: values.password,
      });

      router.replace(`/register/verify?email=${encodeURIComponent(values.email)}`);
    },
    [router],
  );

  const { onSubmit, error, isSubmitting, clearError } =
    useAuthSubmit<RegisterFormValues>(submitRegistration);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    shouldFocusError: true,
    defaultValues: { email: "", username: "", password: "", confirmPassword: "" },
  });

  const passwordValue = useWatch({ control: form.control, name: "password", defaultValue: "" });

  return (
    <AuthPageShell
      title="Create Account"
      switchHref={buildAuthHref("/login", callbackUrl)}
      switchLabel="Login"
      formId="register-form"
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel="Register"
      submitPendingLabel="Creating..."
      isSubmitting={isSubmitting}
      error={error}
      errorId="register-form-error"
    >
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
      <AuthTextField
        id="username"
        label="Username"
        type="text"
        placeholder="your_username"
        autoComplete="username"
        registration={form.register("username", {
          onChange: (event) => {
            event.target.value = event.target.value.toLowerCase();
            clearError();
          },
        })}
        error={form.formState.errors.username?.message}
      />
      <AuthPasswordField
        id="password"
        label="Password"
        placeholder="Password"
        autoComplete="new-password"
        registration={form.register("password", { onChange: clearError })}
        error={form.formState.errors.password?.message}
        helper={<PasswordCriteria password={passwordValue} />}
        helperId="register-password-criteria"
      />
      <AuthPasswordField
        id="confirmPassword"
        label="Confirm Password"
        placeholder="Confirm Password"
        autoComplete="new-password"
        registration={form.register("confirmPassword", { onChange: clearError })}
        error={form.formState.errors.confirmPassword?.message}
      />
    </AuthPageShell>
  );
}
