interface ButtonProps {
  className?: string;
}

export default function Logo({ className = "" }: ButtonProps) {
  return (
    <a href="/" className={`
    text-[var(--color-text)] text-[26px] font-[Montserrat,sans-serif] font-bold ${className}`}>
        Fairplay
    </a>
  );
}