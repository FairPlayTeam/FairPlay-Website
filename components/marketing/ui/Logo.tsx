import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "text-xl font-extrabold tracking-tight text-foreground sm:text-2xl",
        "transition-opacity duration-200 hover:opacity-80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
        "inline-block scale-y-90",
        className,
      )}
      style={{ fontFamily: "Montserrat, sans-serif" }}
      aria-label="FairPlay"
    >
      FairPlay
    </Link>
  );
}
