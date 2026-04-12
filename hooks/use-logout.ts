"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { logout as logoutRequest } from "@/lib/auth/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { authQueryKeys } from "@/lib/auth/query";
import { toast } from "sonner";

type UseLogoutOptions = {
  onLoggedOut?: () => void;
};

export function useLogout(options: UseLogoutOptions = {}) {
  const { onLoggedOut } = options;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    if (isLoggingOut) {
      return false;
    }

    setIsLoggingOut(true);

    try {
      await logoutRequest();

      queryClient.setQueryData(authQueryKeys.currentUser, null);
      onLoggedOut?.();
      router.replace("/login");
      return true;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to log out. Please try again."));
      return false;
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, onLoggedOut, queryClient, router]);

  return {
    logout,
    isLoggingOut,
  };
}
