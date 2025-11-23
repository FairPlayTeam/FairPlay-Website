"use client";
import { ReactNode } from "react";
import useFadeInOnScroll from "@/hooks/useFadeInOnScroll";
import { cn } from "@/lib/utils";

interface FadeInSectionProps {
  children: ReactNode;
  className?: string;
}

export default function FadeInSection({
  children,
  className = "",
}: FadeInSectionProps) {
  const { ref, visible } = useFadeInOnScroll();

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-1000 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
        className
      )}
    >
      {children}
    </div>
  );
}
