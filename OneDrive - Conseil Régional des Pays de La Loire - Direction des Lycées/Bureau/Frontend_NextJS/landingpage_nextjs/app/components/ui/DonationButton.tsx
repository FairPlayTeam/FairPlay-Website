import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary";
}

export default function Button({ children, onClick, className = "", variant = "primary"}: ButtonProps) {
    const styles = variant === "primary"
    ? "px-[15px] py-[5px]"
    : "px-[35px] py-[10px]";

    return (
    <button
      onClick={onClick}
      className={`
      cursor-pointer
      inline-flex
      items-center justify-center
      text-[15px] font-bold text-[var(--color-text)]
      rounded-full bg-[var(--color-donate)]
      transition-shadow duration-500 ease-in-out hover:shadow-[0_0_25px_rgba(255,105,180,0.4)]
      ${styles} ${className}`}>
      {children}
    </button>
  );
}