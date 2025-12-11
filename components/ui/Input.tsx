"use client";

import React from "react";
import { cn } from "@/lib/utils";

export default function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-md px-3 py-2 md:text-sm transition-colors duration-200 ease-in-out",
        "bg-container border border-border",
        "text-text placeholder-text-footer",
        "focus:outline-none focus:border-accent",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "aria-invalid:border-red-500 aria-invalid:text-red-500 aria-invalid:placeholder:text-red-500/50",
        "file:mr-4 file:py-2 file:px-4 file:rounded-full file:cursor-pointer",
        "file:bg-accent hover:file:bg-accent/90 file:text-background",
        "file:text-sm file:font-semibold",
        className
      )}
    />
  );
}
