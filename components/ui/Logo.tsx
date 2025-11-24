import Link from "next/link";

interface ButtonProps {
  className?: string;
}

export default function Logo({ className = "" }: ButtonProps) {
  return (
    <Link
      href="/"
      className={`
    text-text text-[26px] font-[Montserrat,sans-serif] font-bold ${className}`}
    >
      Fairplay
    </Link>
  );
}
