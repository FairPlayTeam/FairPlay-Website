"use client";

import { MdArrowOutward } from "react-icons/md";
import NextLink from "next/link";
import React from "react";
import { cn } from "@/lib/utils";

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
}

export default function Link({
  href,
  children,
  className = "",
  variant = "primary",
}: LinkProps) {
  return (
    <NextLink
      href={href}
      className={cn(
        "relative inline-block",
        "border-b-2 border-dotted border-links",
        "rounded-xs",
        "text-links",
        "no-underline",
        "leading-[1.1]",
        "pb-px",
        "transition-colors duration-200 ease-in-out",
        "hover:text-links-hover",
        "group",
        className
      )}
    >
      <span>{children}</span>
      {variant === "primary" && (
        <span
          className="
            inline-block text-[0.9em] ml-[5px]
            transition-transform duration-200 ease-in-out
            group-hover:translate-x-0.5
          "
        >
          <MdArrowOutward />
        </span>
      )}
    </NextLink>
  );
}
