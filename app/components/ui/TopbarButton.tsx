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
        cursor-pointer bg-transparent
        text-[15px] font-medium text-(--color-text)
        whitespace-nowrap
        transition-colors duration-200 ease-in-out
        hover:text-(--color-accent)

        after:content-[''] after:absolute after:bottom-[-3px] after:left-1/2
        after:h-0.5 after:w-full after:max-w-full after:-translate-x-1/2
        after:bg-(--color-accent)
        after:origin-center after:scale-x-0 after:scale-y-0
        after:transition-transform after:duration-300 after:ease-out
        hover:after:scale-x-100 hover:after:scale-y-100
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
