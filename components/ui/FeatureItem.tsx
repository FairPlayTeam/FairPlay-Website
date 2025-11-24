"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export default function FeatureItem({
  children,
  className = "",
}: SectionProps) {
  return (
    <div
      className={cn(
        "bg-container-dark",
        "border border-border",
        "p-[30px]",
        "rounded-xl",
        "transition-transform duration-300 ease-in-out",
        "hover:-translate-y-1",
        "h-[300px]",
        className
      )}
    >
      {children}
    </div>
  );
}
