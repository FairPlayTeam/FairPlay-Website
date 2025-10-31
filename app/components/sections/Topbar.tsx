"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes } from "react-icons/fa";
import Logo from "../ui/Logo";
import TopbarButton from "../ui/TopbarButton";
import Button from "../ui/Button";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth";
import { auth, profile } from "@/services/auth";

type TopbarProps = {
  variant?: "public" | "auth";
};

export default function Topbar({ variant = "public" }: TopbarProps) {
  if (variant === "auth") {
    return <TopbarAuth />;
  }
  return <TopbarPublic />;
}

/* ---------------- VARIANTE 1 : PUBLIC (Code 1) ---------------- */

function TopbarPublic() {
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
        className="main-header bg-[#0f0f0f00] py-3 px-5 sm:px-10 sticky top-0 z-1000 transition-all duration-300 ease-out"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
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
                <Button onClick={() => (window.location.href = "http://ko-fi.com/fairplay_")} variant="donatePrimary" className="btn-donate">
                  Donate
                </Button>
              </li>
            </ul>
          </nav>
          <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-white focus:outline-none cursor-pointer" aria-label="Open menu">
            <FaBars size={24} />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-999"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.aside
              className="fixed right-0 top-0 h-full w-[80%] max-w-[320px] bg-[#0f0f0f] border-l border-(--color-border) shadow-[0_0_25px_rgba(0,0,0,0.6)] z-1000 p-6 flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-8">
                <Logo />
                <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu" className="text-(--color-text) transition-colors cursor-pointer">
                  <FaTimes size={24} />
                </button>
              </div>
              <nav>
                <ul className="flex flex-col gap-5 text-left">
                  <li><TopbarButton onClick={() => { setIsMenuOpen(false); scrollToSection("about"); }}>About</TopbarButton></li>
                  <li><TopbarButton onClick={() => { setIsMenuOpen(false); scrollToSection("values"); }}>Our Values</TopbarButton></li>
                  <li><TopbarButton onClick={() => { setIsMenuOpen(false); scrollToSection("community"); }}>Community</TopbarButton></li>
                  <li><TopbarButton onClick={() => { setIsMenuOpen(false); scrollToSection("extension"); }}>Extension</TopbarButton></li>
                  <li><TopbarButton onClick={() => { setIsMenuOpen(false); scrollToSection("development"); }}>Development</TopbarButton></li>
                  <li><TopbarButton onClick={() => setIsMenuOpen(false)}>Roadmap</TopbarButton></li>
                  <li className="mt-8">
                    <Button onClick={() => (window.location.href = "http://ko-fi.com/fairplay_")} variant="donateSecondary" className="w-full">
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

/* ---------------- VARIANTE 2 : AUTH (Code 2) ---------------- */

function TopbarAuth() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      profile.me().then((u) => setUser(u)).catch(() => {});
    }
  }, [user, setUser]);

  async function onLogout() {
    await auth.logout();
    setUser(null);
  }

  return (
    <header className="flex justify-between items-center border-b border-gray-200 px-6 py-3 bg-white w-full">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/favicon.png" alt="FairPlay Logo" width={40} height={40} className="rounded-md" />
          <h1 className="text-2xl font-bold text-gray-900">FairPlay</h1>
        </Link>

        <div className="flex border border-gray-300 rounded-lg overflow-hidden w-96 max-w-md">
          <input
            type="text"
            placeholder="Rechercher des vidéos"
            className="flex-1 px-3 py-2 text-gray-800 focus:outline-none"
          />
          <button className="px-3 bg-gray-200 hover:bg-gray-300 transition" aria-label="Search">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-800"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!user ? (
          <>
            <button
              onClick={() => router.push("/login")}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 font-semibold hover:bg-gray-100 transition"
            >
              Se Connecter
            </button>
            <button
              onClick={() => router.push("/register")}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 font-semibold hover:bg-gray-100 transition"
            >
              S'Inscrire
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <p className="font-semibold text-gray-800">
              Welcome back, {user.displayName || user.username}
            </p>
            <Link
              href="/dashboard"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition"
            >
              My Account
            </Link>
            <button
              onClick={onLogout}
              className="bg-black text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-gray-800 transition"
            >
              Logout
            </button>
          </div>
        )}
        <a
          href="https://ko-fi.com/fairplay_"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-4 py-2 rounded-md text-sm"
        >
          Donate
        </a>
      </div>
    </header>
  );
}