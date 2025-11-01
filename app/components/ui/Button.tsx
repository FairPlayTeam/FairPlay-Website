import React, { useState } from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "donatePrimary" | "donateSecondary" | "download";
}

export default function Button({ children, onClick, className = "", variant = "primary" }: ButtonProps) {
  const [loading, setLoading] = useState(false);
  
  switch (variant){
    case "primary":
      return(
        <button
          onClick={onClick}
          style={{
            border: "1px solid",
            borderColor: "var(--color-accent)",
          }}
          className={`
            inline-flex items-center justify-center 
            px-6 py-3 text-[16px] font-bold rounded-lg 
            bg-transparent text-(--color-accent) 
            cursor-pointer 
            transition-all duration-300 ease-in-out
            hover:shadow-lg hover:-translate-y-0.5 
            hover:bg-(--color-accent) hover:text-(--color-background)
          ${className}
          `}
        >
          {children}
        </button>
      );
    case "secondary":
      return(
        <button
          onClick={onClick}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition ${
            loading
              ? 'opacity-60 cursor-not-allowed'
              : 'cursor-pointer bg-(--blue-pastel-700) hover:bg-(--blue-500) text-(--white) shadow-md'
          }`}
        >
          {children}
        </button>
      );
    case "donatePrimary":
      return(
        <button
          onClick={onClick}
          className={`
          cursor-pointer
          inline-flex
          items-center justify-center
          text-[15px] font-bold text-(--color-text)
          rounded-full bg-(--color-donate)
          transition-shadow duration-500 ease-in-out hover:shadow-[0_0_25px_rgba(255,105,180,0.4)]
          px-[15px] py-[5px]
          ${className}`}>
          {children}
        </button>
      );
    case "donateSecondary":
      return(
        <button
          onClick={onClick}
          className={`
          cursor-pointer
          inline-flex
          items-center justify-center
          text-[15px] font-bold text-(--color-text)
          rounded-full bg-(--color-donate)
          transition-shadow duration-500 ease-in-out hover:shadow-[0_0_25px_rgba(255,105,180,0.4)]
          px-[35px] py-2.5
          ${className}`}>
          {children}
        </button>
      );
    case "download":
      return(
        <button
          onClick={onClick}
          className={`
          cursor-pointer
          inline-flex
          items-center justify-center
          text-[15px] font-bold text-(--color-text)
          rounded-full bg-(--color-accent-dark)
          px-[35px] py-2.5
          ${className}`}>
          {children}
        </button>
      );
    default:
  }
}