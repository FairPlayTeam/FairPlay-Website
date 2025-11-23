import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "donatePrimary"
    | "donateSecondary"
    | "download";
}

const baseButtonClasses =
  "cursor-pointer inline-flex items-center justify-center font-bold";

const variantConfig = {
  primary: {
    classes: [
      "px-6 py-3 text-[16px] rounded-lg",
      "bg-transparent text-(--color-accent)",
      "border border-accent",
      "transition-all duration-300 ease-in-out",
      "hover:shadow-lg hover:-translate-y-0.5",
      "hover:bg-(--color-accent) hover:text-(--color-background)",
    ],
  },
  secondary: {
    classes: [
      "text-[15px] text-(--color-text)",
      "rounded-full bg-(--color-accent-dark)",
      "px-[35px] py-2.5",
    ],
  },
  donatePrimary: {
    classes: [
      "text-[15px] text-(--color-text)",
      "rounded-full bg-(--color-donate)",
      "transition-shadow duration-500 ease-in-out hover:shadow-[0_0_25px_rgba(255,105,180,0.4)]",
      "px-[15px] py-[5px]",
    ],
  },
  donateSecondary: {
    classes: [
      "text-[15px] text-(--color-text)",
      "rounded-full bg-(--color-donate)",
      "transition-shadow duration-500 ease-in-out hover:shadow-[0_0_25px_rgba(255,105,180,0.4)]",
      "px-[35px] py-2.5",
    ],
  },
  download: {
    classes: [],
  },
} as const;

export default function Button({
  children,
  className = "",
  variant = "primary",
  onClick,
  ...props
}: ButtonProps) {
  const [loading, setLoading] = useState(false);

  const config = variantConfig[variant] || variantConfig.download;

  return (
    <button
      onClick={onClick}
      className={cn(baseButtonClasses, ...config.classes, className)}
      {...props}
    >
      {children}
    </button>
  );
}
