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

const loginFormSchema = z.object({
  identifier: z.string("Email or username is required"),
  password: z.string("Password is required"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginClient() {
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

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.post(
        "/auth/login",
        { emailOrUsername: values.identifier, password: values.password },
        { withCredentials: true }
      );

      setToken(response.data.sessionKey);
      refetchUser();
      router.push(callbackUrl || "/explore");
    } catch (error) {
      setError(
        (error as { response: { data: { error: string } } })?.response?.data
          ?.error ?? "Something went wrong!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background px-4">
      <Card>
        <h1 className="text-3xl font-semibold text-text mb-4">Login</h1>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="identifier">Email or username</label>
            <Input
              id="identifier"
              type="text"
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!form.formState.errors.identifier}
              {...form.register("identifier")}
            />
            {form.formState.errors.identifier && (
              <p className="text-sm text-red-500">
                {form.formState.errors.identifier.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              aria-invalid={!!form.formState.errors.password}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <Button
            type="submit"
            variant="secondary"
            disabled={loading}
            aria-busy={loading}
            className="w-full rounded-md"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Want to create an account?{" "}
            <a
              href="/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Register
            </a>
          </p>
        </form>
      </Card>
    </div>
  );
}
