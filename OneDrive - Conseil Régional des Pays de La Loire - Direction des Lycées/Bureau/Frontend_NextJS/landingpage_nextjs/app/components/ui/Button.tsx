import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function Button({ children, onClick, className = "" }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "1px solid",
        borderColor: "var(--color-accent)",
      }}
      className={`
        inline-flex items-center justify-center 
        px-6 py-3 text-[16px] font-bold rounded-lg 
        bg-transparent text-[var(--color-accent)] 
        cursor-pointer 
        transition-all duration-300 ease-in-out
        hover:shadow-lg hover:-translate-y-0.5 
        hover:bg-[var(--color-accent)] hover:text-[var(--color-background)]
      ${className}
      `}
    >
      {children}
    </button>
  );
}