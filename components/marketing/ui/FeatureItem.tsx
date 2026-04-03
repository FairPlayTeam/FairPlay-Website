import React from "react";
import { cn } from "@/lib/utils";

interface FeatureItemProps {
  children: React.ReactNode;
  className?: string;
}

export default function FeatureItem({ children, className }: FeatureItemProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl p-7",
        "border border-border/50 bg-card/40",
        "transition-all duration-300 ease-in-out",
        "hover:-translate-y-1 hover:border-primary/20 hover:bg-card/60",
        className,
      )}
    >
      {children}
    </div>
  );
}
