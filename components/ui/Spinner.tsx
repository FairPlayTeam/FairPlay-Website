"use client";

import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className }: SpinnerProps) {
  return (
    <svg viewBox="0 0 100 100" className={cn("size-16", className)} fill="none">
      <polygon
        points="35,20 75,50 35,80"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="triangle-loader"
      />
    </svg>
  );
}
