"use client";

import { cn } from "@/lib/utils";
import { LuLoaderCircle } from "react-icons/lu";

interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className }: SpinnerProps) {
  return (
    <LuLoaderCircle
      className={cn("size-4 animate-spin text-accent", className)}
    />
  );
}
