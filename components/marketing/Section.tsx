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
      ? "relative rounded-2xl shadow-xl bg-container p-[20px] md:p-[50px]"
      : "py-[50px]";

  return (
    <div id={id} className={cn("text-center", baseStyles, className)}>
      {variant === "primary" && (
        <div
          className="absolute inset-0 -z-10 rounded-2xl p-0.5"
          style={{
            background: "linear-gradient(145deg, #3c3c3c, #0f0f0f, #3c3c3c)",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
          }}
        />
      )}
      {children}
    </div>
  );
}
