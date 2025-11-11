"use client";

import { MdArrowOutward } from "react-icons/md";
import NextLink from "next/link";
import React from "react";

interface TopbarButtonProps extends React.ComponentProps<typeof NextLink> {
  variant?: "primary" | "secondary";
}

export default function TopbarButton({
  children,
  className = "",
  variant = "primary",
  ...props
}: TopbarButtonProps) {
  return (
    <NextLink
      className={`
        group
        relative inline-flex items-center justify-center 
        cursor-pointer
        bg-transparent 
        text-[15px] font-medium text-(--color-text)
        whitespace-nowrap 
        transition-colors duration-200 ease-in-out
        hover:text-(--color-accent)
        after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 
        after:bg-(--color-accent) after:transition-all after:duration-300 after:ease-in-out
        hover:after:w-full
        ${className}
      `}
      {...props}
    >
      {children}
      {variant === "secondary" && (
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