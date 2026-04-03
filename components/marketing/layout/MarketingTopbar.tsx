"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaDiscord } from "react-icons/fa";
import Logo from "@/components/marketing/ui/Logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopbarProps {
  animateOnLoad?: boolean;
}

interface NavLinkProps {
  href: string;
  onClick?: () => void;
  variant?: "default" | "secondary";
  children: React.ReactNode;
  className?: string;
}

function NavLink({ href, onClick, variant = "default", children, className }: NavLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "text-sm font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
        variant === "default" && "text-muted-foreground hover:text-foreground",
        variant === "secondary" && "text-primary hover:text-primary-400",
        className,
      )}
    >
      {children}
    </a>
  );
}

function DiscordButton({ className }: { className?: string }) {
  return (
    <Button
      onClick={() => (window.location.href = "https://discord.gg/fairplay")}
      className={cn("rounded-full px-5 py-2", className)}
    >
      Join Discord
      <FaDiscord />
    </Button>
  );
}

const NAV_LINKS: { label: string; href: string; variant?: "default" | "secondary" }[] = [
  { label: "About Us", href: ".#about" },
  { label: "Our Values", href: ".#values" },
  { label: "Extension", href: ".#extension" },
  { label: "Development", href: ".#development" },
  { label: "Community", href: ".#community" },
];

export default function MarketingTopbar({ animateOnLoad = true }: TopbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector<HTMLElement>(".main-header");
      if (!header) return;
      const scroll = window.scrollY;
      header.style.backgroundColor = `rgb(var(--background-rgb) / ${Math.min(0.8, scroll / 100)})`;
      header.style.backdropFilter = `blur(${Math.min(50, scroll)}px)`;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className="main-header sticky top-0 z-50 bg-transparent px-4 py-3 transition-all duration-300 ease-out sm:px-6 lg:px-10"
        initial={animateOnLoad ? { y: -50, opacity: 0 } : { y: 0, opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: animateOnLoad ? 1.5 : 0,
          ease: [0.43, 0.13, 0.23, 0.96],
        }}
      >
        <div className="relative mx-auto flex max-w-7xl items-center justify-between">
          <Logo />

          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 lg:block"
            aria-label="Navigation principale"
          >
            <ul className="flex items-center gap-6">
              {NAV_LINKS.map(({ label, href, variant }) => (
                <li key={label}>
                  <NavLink href={href} variant={variant}>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle variant="ghost" />
            <Button
              onClick={() => (window.location.href = "https://ko-fi.com/fairplay_")}
              variant="outline"
              className="hidden lg:inline-flex rounded-full px-4 py-2 text-sm font-semibold"
            >
              Donate
            </Button>
            <DiscordButton className="hidden lg:inline-flex" />

            <button
              onClick={() => setIsMenuOpen(true)}
              className="cursor-pointer text-foreground focus:outline-none lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <FaBars size={24} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.aside
              className="fixed right-0 top-0 z-50 flex h-full w-[88%] max-w-xs flex-col border-l border-border bg-card p-5 text-foreground shadow-2xl sm:w-[80%] sm:p-6"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <div className="mb-8 flex items-center justify-between">
                <Logo />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Fermer le menu"
                  className="cursor-pointer text-foreground transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <nav aria-label="Menu mobile">
                <ul className="flex flex-col gap-5 text-left">
                  {NAV_LINKS.map(({ label, href, variant }) => (
                    <li key={label}>
                      <NavLink href={href} variant={variant} onClick={() => setIsMenuOpen(false)}>
                        {label}
                      </NavLink>
                    </li>
                  ))}
                  <li>
                    <div className="pt-2">
                      <ThemeToggle variant="ghost" className="w-full justify-center rounded-full" />
                    </div>
                  </li>
                  <li>
                    <NavLink
                      href="https://ko-fi.com/fairplay_"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Donate
                    </NavLink>
                  </li>
                  <li className="mt-8">
                    <DiscordButton className="w-full justify-center" />
                  </li>
                </ul>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
