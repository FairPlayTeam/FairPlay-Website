"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaBell,
  FaGlobe,
  FaCompass,
  FaGamepad,
  FaHistory,
  FaBookOpen,
  FaUpload,
  FaDiscord,
} from "react-icons/fa";
import { FaArrowTrendUp } from "react-icons/fa6";
import { SiMatrix, SiKofi } from "react-icons/si";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import Button from "@/components/ui/Button";
import { FaBars } from "react-icons/fa";

const mainLinks = [
  { icon: FaCompass, label: "Explore", href: "/explore" },
  // { icon: FaGlobe, label: "Offline", href: "/offline" },
  { icon: FaBell, label: "Subscriptions", href: "/subscriptions" },
  // { icon: FaHistory, label: "History", href: "/history" },
  { icon: FaUpload, label: "Upload", href: "/upload" },
];

const categories = [
  { icon: FaArrowTrendUp, label: "Trending", href: "/trending" },
  { icon: FaBookOpen, label: "Learning", href: "/learning" },
  { icon: FaGamepad, label: "Gaming", href: "/gaming" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close, toggle } = useSidebar();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/25 backdrop-blur-xs lg:hidden cursor-pointer"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 lg:top-16 bottom-0 z-50 w-60 flex flex-col overflow-y-auto bg-background/95 backdrop-blur-md px-3 py-4 transition-transform duration-300 lg:translate-x-0 lg:bg-transparent lg:backdrop-blur-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-4 mb-4 lg:hidden">
          <Button
            onClick={toggle}
            size="icon"
            variant="ghost"
            className="text-text hover:bg-white/5 rounded-full lg:hidden"
          >
            <FaBars />
          </Button>
          <Link href="/" className="font-bold text-xl text-text">
            FairPlay
          </Link>
        </div>
        <div className="flex flex-col gap-1">
          {mainLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className={cn(
                  "flex items-center gap-4 rounded-lg px-3 py-2 text-[15px] font-medium transition-colors duration-300",
                  isActive
                    ? "bg-white/10 text-text"
                    : "text-text-amount hover:bg-white/5 hover:text-text"
                )}
              >
                <Icon className="size-4.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="my-4 h-px bg-white/10" />

        <div>
          {categories.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className={cn(
                  "flex items-center gap-4 rounded-lg px-3 py-2 text-[15px] font-medium transition-colors duration-300",
                  isActive
                    ? "bg-white/10 text-text"
                    : "text-text-amount hover:bg-white/5 hover:text-text"
                )}
              >
                <Icon className="size-4.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto pt-4 flex gap-2">
          <Link href="https://discord.gg/K68Z9HbsA5" target="_blank" className="flex-1">
            <Button variant="links" className="w-full">
              <FaDiscord className="size-5" />
            </Button>
          </Link>

          <Link href="https://matrix.to/#/#fairplay-video:matrix.org" target="_blank" className="flex-1">
            <Button variant="links" className="w-full">
              <SiMatrix className="size-5" />
            </Button>
          </Link>

          <Link href="https://ko-fi.com/fairplay_" target="_blank" className="flex-1">
            <Button variant="links" className="w-full">
              <SiKofi className="size-5" />
            </Button>
          </Link>
        </div>
      </aside>
    </>
  );
}
