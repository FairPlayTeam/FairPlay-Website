"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes } from "react-icons/fa";
import Logo from "../ui/Logo";
import TopbarButton from "../ui/TopbarButton";
import DonationButton from "../ui/DonationButton";

export default function Topbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    const header = document.querySelector<HTMLElement>(".main-header");
    const headerHeight = header ? header.offsetHeight + 50 : 0;

    if (section) {
      const top = section.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // make opacity and blur change depending on scroll rate
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector<HTMLElement>(".main-header");
      if (!header) return;

      const scroll = window.scrollY;
      const opacity = Math.min(0.8, scroll / 100);
      const blur = Math.min(50, scroll);
      header.style.background = `rgba(15, 15, 15, ${opacity})`;
      header.style.backdropFilter = `blur(${blur}px)`;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
        <motion.header
          className="main-header bg-[#0f0f0f00] py-[12px] px-[20px] sm:px-[40px] sticky top-0 z-[1000] transition-all duration-300 ease-out"
          initial={{
            y: -50,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            duration: 1.5,
            ease: [0.43, 0.13, 0.23, 0.96],
          }}
        >
        <div className="flex items-center justify-between mx-auto max-w-[1400px]">
          <Logo />
          <nav className="hidden md:block">
            <ul className="flex items-center gap-[30px]">
              <li><TopbarButton onClick={() => scrollToSection("about")}>About</TopbarButton></li>
              <li><TopbarButton onClick={() => scrollToSection("values")}>Our Values</TopbarButton></li>
              <li><TopbarButton onClick={() => scrollToSection("community")}>Community</TopbarButton></li>
              <li><TopbarButton onClick={() => scrollToSection("extension")}>Extension</TopbarButton></li>
              <li><TopbarButton onClick={() => scrollToSection("development")}>Development</TopbarButton></li>
              <li><TopbarButton>Roadmap</TopbarButton></li>
              <li>
                <DonationButton onClick={() => window.location.href="http://ko-fi.com/fairplay_"} variant="primary" className="btn-donate">
                  Donate
                </DonationButton>
              </li>
            </ul>
          </nav>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden text-white focus:outline-none cursor-pointer"
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
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.aside
              className="fixed right-0 top-0 h-full w-[80%] max-w-[320px] bg-[#0f0f0f] text-[var(--color-text)] border-l border-[var(--color-border)] shadow-[0_0_25px_rgba(0,0,0,0.6)] z-[1000] p-6 flex flex-col"
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
                  className="text-[var(--color-text)] transition-colors cursor-pointer"
                >
                  <FaTimes size={24} />
                </button>
              </div>
              <nav>
                <ul className="flex flex-col gap-5 text-left">
                  <li><TopbarButton onClick={() => {setIsMenuOpen(false); scrollToSection("about");}}>About</TopbarButton></li>
                  <li><TopbarButton onClick={() => {setIsMenuOpen(false); scrollToSection("values");}}>Our Values</TopbarButton></li>
                  <li><TopbarButton onClick={() => {setIsMenuOpen(false); scrollToSection("community");}}>Community</TopbarButton></li>
                  <li><TopbarButton onClick={() => {setIsMenuOpen(false); scrollToSection("extension");}}>Extension</TopbarButton></li>
                  <li><TopbarButton onClick={() => {setIsMenuOpen(false); scrollToSection("development");}}>Development</TopbarButton></li>
                  <li><TopbarButton onClick={() => {setIsMenuOpen(false)}}>Roadmap</TopbarButton></li>
                  <li className="mt-8">
                    <DonationButton onClick={() => window.location.href="http://ko-fi.com/fairplay_"} variant="secondary" className="w-full">
                      Donate
                    </DonationButton>
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