"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export default function Card({ className = "", children }: CardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md mx-auto p-6 rounded-lg shadow-lg",
        "bg-container border border-border",
        className
      )}
    >
      {children}
    </div>
  );
}
