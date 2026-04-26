import React from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: "banner" | "plain";
  id?: string;
}

export default function Section({ children, className, variant = "plain", id }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        variant === "banner" && "w-full bg-primary/10 px-5 py-16 sm:px-8 md:py-20 lg:px-12",
        variant === "plain" && "w-full px-5 py-16 sm:px-8 md:py-20 lg:px-12 lg:py-24",
        className,
      )}
    >
      {children}
    </section>
  );
}
