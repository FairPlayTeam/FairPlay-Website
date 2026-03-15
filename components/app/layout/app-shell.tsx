"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/context/sidebar-context";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

import AppSidebar from "@/components/app/layout/app-sidebar";
import AppTopbar from "@/components/app/layout/app-topbar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type AppShellProps = {
  children: React.ReactNode;
  mainClassName?: string;
  contentClassName?: string;
};

export function AppShell({ children, mainClassName = "", contentClassName = "" }: AppShellProps) {
  const { isReady } = useAuth();
  const pathname = usePathname();
  const [isTimedOut, setIsTimedOut] = useState(false);
  const isVideoWatchPage = pathname?.startsWith("/video/") ?? false;

  useEffect(() => {
    if (isReady) return;
    const timer = setTimeout(() => setIsTimedOut(true), 5000);
    return () => clearTimeout(timer);
  }, [isReady]);

  return (
    /* Reset sidebar state on navigation to prevent the close animation
    from playing when navigating to pages where the sidebar is hidden */
    <SidebarProvider key={pathname ?? "app-shell"}>
      <div className="min-h-screen bg-background text-foreground">
        {!isReady && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <Spinner className="size-24" />

              {isTimedOut && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
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
            "transition-opacity duration-200 ease-in-out",
            isReady ? "opacity-100" : "invisible opacity-0",
          )}
        >
          <AppTopbar />
          <div className={cn("flex pt-16", contentClassName)}>
            <Suspense fallback={null}>
              <AppSidebar />
            </Suspense>
            <main
              className={cn(
                "flex-1 transition-all duration-300",
                isVideoWatchPage ? "" : "lg:ml-60",
                mainClassName,
              )}
            >
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
