"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaBars, FaArrowLeft, FaSearch } from "react-icons/fa";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import Input from "@/components/ui/Input";
import UserAvatar from "@/components/ui/UserAvatar";

function SearchBar({
  value,
  onChange,
  onSearch,
}: {
  value: string;
  onChange: (val: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="flex flex-1 items-center overflow-hidden rounded-full">
      <Input
        type="text"
        placeholder="Search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        className="peer rounded-l-full px-4 py-1.5 border-r-0"
      />
      <Button
        size="icon"
        variant="ghost"
        className="bg-white/10 hover:bg-white/15 rounded-r-full border border-border border-l-0 duration-200 peer-focus:border-accent md:size-8.5"
        onClick={onSearch}
      >
        <FaSearch className="md:size-3.5 text-text-amount" />
      </Button>
    </div>
  );
}

export default function Topbar() {
  const router = useRouter();
  const { toggle } = useSidebar();
  const { user } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    setIsSearchOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-4 transition-colors duration-300",
        isScrolled ? "bg-black/90 backdrop-blur-lg" : "bg-transparent"
      )}
    >
      {isSearchOpen ? (
        <div className="flex w-full items-center gap-3 pr-4">
          <Button
            onClick={() => setIsSearchOpen(false)}
            size="icon"
            variant="ghost"
            className="text-text hover:bg-white/5 rounded-full"
          >
            <FaArrowLeft />
          </Button>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={handleSearch}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
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

          <div className="hidden max-w-sm flex-1 items-center sm:flex mx-8">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={handleSearch}
            />
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <Button
              size="icon"
              variant="ghost"
              className="text-text hover:bg-white/5 rounded-full sm:hidden"
              onClick={() => setIsSearchOpen(true)}
            >
              <FaSearch />
            </Button>

            {!user && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push("/login")}
                className="bg-container-dark"
              >
                Login
              </Button>
            )}

            <Button
              size="sm"
              variant="donatePrimary"
              className="btn-donate hidden md:inline-flex"
              onClick={() =>
                (window.location.href = "http://ko-fi.com/fairplay_")
              }
            >
              Donate
            </Button>

            {!!user && (
              <Button
                size="icon"
                variant="ghost"
                className="text-text rounded-full p-0"
                onClick={() => router.push(`/channel/${user.username}`)}
              >
                <UserAvatar user={user} size={36} />
              </Button>
            )}
          </div>
        </>
      )}
    </header>
  );
}