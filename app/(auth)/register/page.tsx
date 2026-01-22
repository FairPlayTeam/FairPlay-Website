"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { z } from "zod";
import { setToken } from "@/lib/token";

const registerFormSchema = z
  .object({
    email: z.email("Invalid email"),
    username: z.string("Username is required").min(3, "Username is too short"),
    password: z.string("Password is required").min(6, "Password is too short"),
    confirmPassword: z
      .string("Password is required")
      .min(6, "Password is too short"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const { user, isLoading, refetchUser } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(callbackUrl || "/explore");
    }
  }, [user, isLoading, router, callbackUrl]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null);
    setLoading(true);

    try {
      const response = await api.post(
        "/auth/register",
        {
          email: values.email,
          username: values.username,
          password: values.password,
        },
        { withCredentials: true }
      );

      setToken(response.data.sessionKey);
      refetchUser();
      router.push(callbackUrl || "/explore");
    } catch (error) {
      setError(
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Something went wrong!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background px-4">
      <Card>
        <h1 className="text-3xl font-semibold text-text mb-4">
          Create Account
        </h1>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!form.formState.errors.email}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="username">Username</label>
            <Input
              id="username"
              type="text"
              placeholder="Username"
              autoComplete="username"
              aria-invalid={!!form.formState.errors.username}
              {...form.register("username")}
            />
            {form.formState.errors.username && (
              <p className="text-sm text-red-500">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              aria-invalid={!!form.formState.errors.password}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm Password"
              aria-invalid={!!form.formState.errors.confirmPassword}
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {error ? (
            <div className="flex flex-col items-center">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : null}

          <Button
            type="submit"
            variant="secondary"
            disabled={loading}
            aria-busy={loading}
            className="w-full rounded-md"
          >
            {loading ? "Creating..." : "Register"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <a
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Already have an account?
            </a>
          </p>
        </form>
      </Card>
    </div>
  );
}
