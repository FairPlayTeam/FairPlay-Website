import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "donatePrimary"
    | "donateSecondary"
    | "download"
    | "ghost";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
}

const baseButtonClasses =
  "cursor-pointer inline-flex items-center justify-center font-bold";

const variantConfig = {
  primary: {
    classes: [
      "px-6 py-3 text-[16px] rounded-lg",
      "bg-transparent text-accent",
      "border border-accent",
      "transition-all duration-300 ease-in-out",
      "hover:shadow-lg hover:-translate-y-0.5",
      "hover:bg-accent hover:text-background",
    ],
  },
  secondary: {
    classes: [
      "text-[15px] text-text",
      "rounded-full bg-accent-dark",
      "px-[35px] py-2.5",
    ],
  },
  donatePrimary: {
    classes: [
      "text-[15px] text-text",
      "rounded-full bg-gradient-donate",
      "transition-shadow duration-500 ease-in-out hover:shadow-[0_0_25px_rgba(80,80,250,0.4)]",
      "px-[15px] py-[5px]",
    ],
  },
  donateSecondary: {
    classes: [
      "text-[15px] text-text",
      "rounded-full bg-gradient-donate",
      "transition-shadow duration-500 ease-in-out hover:shadow-[0_0_25px_rgba(80,80,250,0.4)]",
      "px-[35px] py-2.5",
    ],
  },
  download: {
    classes: [],
  },
  ghost: {
    classes: [
      "bg-transparent text-accent",
      "hover:bg-accent/10",
      "transition-colors duration-300",
      "rounded-lg",
    ],
  },
} as const;

const sizeConfig = {
  default: "text-[15px] px-4 py-2",
  sm: "text-sm px-3 py-1.5",
  lg: "text-base px-8 py-3",
  icon: "h-10 w-10 p-2 aspect-square grid place-items-center [&_svg:not([class*='size-'])]:size-4",
  "icon-sm":
    "h-8 w-8 p-1.5 aspect-square grid place-items-center [&_svg:not([class*='size-'])]:size-3.5",
  "icon-lg":
    "h-12 w-12 p-3 aspect-square grid place-items-center [&_svg:not([class*='size-'])]:size-4.5",
} as const;

export default function Button({
  children,
  className = "",
  variant = "primary",
  size = "default",
  onClick,
  ...props
}: ButtonProps) {
  const [loading, setLoading] = useState(false);

  const config = variantConfig[variant] || variantConfig.download;
  const sizeClasses = sizeConfig[size];

  return (
    <button
      onClick={onClick}
      className={cn(
        baseButtonClasses,
        ...config.classes,
        sizeClasses,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
