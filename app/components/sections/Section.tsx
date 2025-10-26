"use client";
import React from "react";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
  id?: string;
}

export default function Section({children, className = "", variant = "primary", id}: SectionProps) {
  const baseStyles = variant === "primary"
    ? "relative rounded-2xl shadow-xl text-center mt-[100px] bg-[var(--color-container)] p-[20px] md:p-[50px]"
    : "text-center mt-[100px] py-[50px]";

  return (
    <div id={id} className={`${baseStyles} ${className}`.trim()}>
      {variant === "primary" && (
        <div
          className="absolute inset-0 -z-10 rounded-2xl p-[2px]"
          style={{
            background: "linear-gradient(145deg, #3c3c3c, #0f0f0f, #3c3c3c)",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
          }}
        />
      )}
      {children}
    </div>
  );
}
