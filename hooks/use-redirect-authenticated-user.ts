"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export function useRedirectAuthenticatedUser(destination: string) {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.status === "authenticated" && auth.user) {
      router.replace(destination);
    }
  }, [auth.status, auth.user, destination, router]);

  return auth;
}
