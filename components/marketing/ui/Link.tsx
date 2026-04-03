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

export default function Link({ href, children, className = "", variant = "primary" }: LinkProps) {
  return (
    <NextLink
      href={href}
      className={cn(
        "relative inline-block",
        "border-b border-dotted border-primary/40",
        "text-primary",
        "no-underline",
        "leading-tight",
        "pb-px",
        "transition-colors duration-200 ease-in-out",
        "hover:border-primary-200/50 hover:text-primary-200",
        "group",
        className,
      )}
    >
      <span>{children}</span>
      {variant === "primary" && (
        <span className="ml-1 inline-block text-sm transition-transform duration-200 group-hover:translate-x-1">
          <MdArrowOutward />
        </span>
      )}
    </NextLink>
  );
}
