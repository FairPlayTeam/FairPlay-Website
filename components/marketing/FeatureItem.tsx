"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export default function FeatureItem({ children, className = "" }: SectionProps) {
  return (
    <div
      className={cn(
        "border border-border bg-card/80 shadow-sm backdrop-blur-sm",
        "p-[30px]",
        "rounded-xl",
        "transition-all duration-300 ease-in-out",
        "hover:border-primary/30",
        "hover:-translate-y-1",
        "min-h-[300px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
