"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
  id?: string;
}

export default function Section({
  children,
  className = "",
  variant = "primary",
  id,
}: SectionProps) {
  const baseStyles =
    variant === "primary"
      ? "relative rounded-2xl border border-border bg-card/90 p-[20px] shadow-xl backdrop-blur-sm md:p-[50px]"
      : "py-[50px]";

  return (
    <div id={id} className={cn("text-center", baseStyles, className)}>
      {children}
    </div>
  );
}
