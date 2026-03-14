"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes } from "react-icons/fa";
import Logo from "@/components/marketing/Logo";
import TopbarButton from "@/components/marketing/TopbarButton";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  animateOnLoad?: boolean;
}

export default function MarketingTopbar({ animateOnLoad = true }: TopbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // make opacity and blur change depending on scroll rate
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector<HTMLElement>(".main-header");
      if (!header) return;

      const scroll = window.scrollY;
      const opacity = Math.min(0.8, scroll / 100);
      const blur = Math.min(50, scroll);
      header.style.backgroundColor = `rgb(var(--background-rgb) / ${opacity})`;
      header.style.backdropFilter = `blur(${blur}px)`;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className="main-header sticky top-0 z-1000 bg-transparent px-5 py-3 transition-all duration-300 ease-out sm:px-10"
        initial={animateOnLoad ? { y: -50, opacity: 0 } : { y: 0, opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: animateOnLoad ? 1.5 : 0,
          ease: [0.43, 0.13, 0.23, 0.96],
        }}
      >
        <div className="flex items-center justify-between mx-auto max-w-350">
          <Logo />
          <nav className="hidden md:block">
            <ul className="flex items-center gap-7.5">
              <li>
                <TopbarButton href=".#about">About Us</TopbarButton>
              </li>
              <li>
                <TopbarButton href=".#values">Our Values</TopbarButton>
              </li>
              <li>
                <TopbarButton href=".#extension">Extension</TopbarButton>
              </li>
              <li>
                <TopbarButton href=".#development">Development</TopbarButton>
              </li>
              <li>
                <TopbarButton href=".#community">Community</TopbarButton>
              </li>
              <li>
                <TopbarButton href="/roadmap" variant="secondary">
                  Roadmap
                </TopbarButton>
              </li>
              <li>
                <Button
                  onClick={() =>
                    (window.location.href = "https://ko-fi.com/fairplay_")
                  }
                  className="btn-donate"
                >
                  Donate
                </Button>
              </li>
            </ul>
          </nav>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="cursor-pointer text-foreground focus:outline-none md:hidden"
            aria-label="Open menu"
          >
            <FaBars size={24} />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-999 bg-background/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.aside
              className="fixed right-0 top-0 z-1000 flex h-full w-[80%] max-w-[320px] flex-col border-l border-border bg-card p-6 text-foreground shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-8">
                <Logo />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                  className="cursor-pointer text-foreground transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>
              <nav>
                <ul className="flex flex-col gap-5 text-left">
                  <li>
                    <TopbarButton
                      onClick={() => {
                        setIsMenuOpen(false);
                      }}
                      href="#about"
                    >
                      About
                    </TopbarButton>
                  </li>
                  <li>
                    <TopbarButton
                      onClick={() => {
                        setIsMenuOpen(false);
                      }}
                      href="#values"
                    >
                      Our Values
                    </TopbarButton>
                  </li>
                  <li>
                    <TopbarButton
                      onClick={() => {
                        setIsMenuOpen(false);
                      }}
                      href="#community"
                    >
                      Community
                    </TopbarButton>
                  </li>
                  <li>
                    <TopbarButton
                      onClick={() => {
                        setIsMenuOpen(false);
                      }}
                      href="#extension"
                    >
                      Extension
                    </TopbarButton>
                  </li>
                  <li>
                    <TopbarButton
                      onClick={() => {
                        setIsMenuOpen(false);
                      }}
                      href="#development"
                    >
                      Development
                    </TopbarButton>
                  </li>
                  <li>
                    <TopbarButton
                      onClick={() => {
                        setIsMenuOpen(false);
                      }}
                      href="/roadmap"
                    >
                      Roadmap
                    </TopbarButton>
                  </li>
                  <li className="mt-8">
                    <Button
                      onClick={() =>
                        (window.location.href = "https://ko-fi.com/fairplay_")
                      }
                      className="w-full"
                    >
                      Donate
                    </Button>
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
