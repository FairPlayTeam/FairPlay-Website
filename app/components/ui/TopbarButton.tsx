import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function TopbarButton({ children, onClick, className = "" }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative inline-flex items-center justify-center 
        cursor-pointer
        bg-transparent 
        text-[15px] font-medium text-(--color-text)
        py-[5px] 
        whitespace-nowrap 
        transition-colors duration-200 ease-in-out
        hover:text-(--color-accent)
        after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 
        after:bg-(--color-accent) after:transition-all after:duration-300 after:ease-in-out
        hover:after:w-full
        ${className}
      `}
    >
      {children}
    </button>
  );
}
