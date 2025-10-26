"use client";

import React from "react";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export default function FeatureItem({children, className = ""}: SectionProps) {
  return (
    <div 
        style={{
            border: "1px solid",
            borderColor: "var(--color-border)",
        }}
        className={`
            bg-[var(--color-container-dark)]
            p-[30px]
            rounded-[12px]
            transition-transform duration-300 ease-in-out
            hover:-translate-y-1
        ${className}
        `}
    >
        {children}
    </div>
  );
}