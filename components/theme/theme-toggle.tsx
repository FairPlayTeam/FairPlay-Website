"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
  variant?: "ghost" | "outline" | "secondary";
};

export function ThemeToggle({ className, variant = "ghost" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const nextTheme = isDark ? "light" : "dark";
  const label = mounted ? `Switch to ${nextTheme} mode` : "Toggle color theme";

  return (
    <Button
      type="button"
      variant={variant}
      size="icon"
      className={cn("rounded-full", className)}
      onClick={() => setTheme(nextTheme)}
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
