import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary";
}

export default function DownloadButton({ children, onClick, className = "", variant = "primary"}: ButtonProps) {
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
      text-[15px] font-bold text-(--color-text)
      rounded-full bg-(--color-accent-dark)
      ${styles} ${className}`}>
      {children}
    </button>
  );
}