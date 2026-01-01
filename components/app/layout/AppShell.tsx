"use client";

import { useEffect, useState } from "react";
import { SidebarProvider } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

import AppSidebar from "@/components/app/layout/AppSidebar";
import AppTopbar from "@/components/app/layout/AppTopbar";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

type AppShellProps = {
  children: React.ReactNode;
  mainClassName?: string;
  contentClassName?: string;
};

export function AppShell({
  children,
  mainClassName = "",
  contentClassName = "",
}: AppShellProps) {
  const { isReady } = useAuth();
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    if (isReady) return;
    const timer = setTimeout(() => setIsTimedOut(true), 5000);
    return () => clearTimeout(timer);
  }, [isReady]);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-text">
        {!isReady && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <Spinner className="size-12" />
              {isTimedOut && (
                <div className="text-center">
                  <p className="text-sm text-text-amount">
                    Loading is taking longer than expected.
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-3"
                    onClick={() => window.location.reload()}
                  >
                    Reload page
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
        <div
          className={cn(
            "transition-opacity duration-300",
            isReady ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <AppTopbar />
          <div className={cn("flex pt-16", contentClassName)}>
            <AppSidebar />
            <main className={cn("flex-1 lg:ml-60", mainClassName)}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
