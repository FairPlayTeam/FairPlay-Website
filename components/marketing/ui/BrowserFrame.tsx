import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BrowserFrameProps {
  children: ReactNode;
  url: string;
  className?: string;
  viewportClassName?: string;
  elevated?: boolean;
  showReflection?: boolean;
}

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-muted-foreground/60"
      aria-hidden="true"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function BrowserFrame({
  children,
  url,
  className,
  viewportClassName,
  elevated = false,
  showReflection = false,
}: BrowserFrameProps) {
  return (
    <div className={cn("relative mx-auto", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-border/60 bg-muted/40",
          "shadow-lg shadow-black/5 transition-shadow duration-500",
          elevated
            ? "shadow-2xl shadow-black/10 backdrop-blur-sm"
            : "hover:shadow-xl hover:shadow-primary/5",
        )}
      >
        <div className="flex items-center gap-3 border-b border-border/50 bg-background/80 px-4 py-2.5 md:py-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          </div>

          <div className="flex flex-1 items-center gap-2 rounded-md border border-border/40 bg-muted/60 px-3 py-1">
            <LockIcon />
            <span className="truncate text-[11px] text-muted-foreground/70 md:text-xs">{url}</span>
          </div>

          <div className="w-12 md:w-16" />
        </div>

        <div className={cn("relative aspect-video w-full bg-black", viewportClassName)}>
          {children}
        </div>
      </div>

      {showReflection ? (
        <>
          <div className="mx-8 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
          <div className="mx-16 h-px bg-gradient-to-r from-transparent via-border/20 to-transparent" />
        </>
      ) : null}
    </div>
  );
}
