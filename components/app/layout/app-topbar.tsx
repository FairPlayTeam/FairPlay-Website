"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/ui/user-avatar";
import { useAuth } from "@/context/auth-context";
import { useSidebar } from "@/context/sidebar-context";
import { useLogout } from "@/hooks/use-logout";
import { buildServiceUnavailableHref } from "@/lib/safe-redirect";
import Logo from "@/components/marketing/ui/Logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const TOPBAR_ITEM_HEIGHT = "h-8";

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
    <div className="relative flex flex-1 items-center">
      <Input
        type="search"
        placeholder="Search..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && onSearch()}
        className={cn(
          TOPBAR_ITEM_HEIGHT,
          "rounded-full border-input pl-4 pr-10 transition-colors focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0",
        )}
      />

      <Button
        type="button"
        size="icon"
        onClick={onSearch}
        aria-label="Search"
        className="absolute right-0 size-8 rounded-full bg-transparent text-muted-foreground hover:bg-accent/50"
      >
        <Search className="size-4" />
      </Button>
    </div>
  );
}

export default function AppTopbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { toggle, close } = useSidebar();
  const { user, isReady, isUnavailable, errorMessage } = useAuth();
  const { logout, isLoggingOut } = useLogout({ onLoggedOut: close });

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const isVideoWatchPage = pathname?.startsWith("/video/") ?? false;
  const serviceUnavailableHref = buildServiceUnavailableHref(pathname ?? "/explore");
  const shouldShowUnavailableAuthState = isReady && isUnavailable && !user;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = useCallback(() => {
    const q = searchTerm.trim();

    if (!q) {
      return;
    }

    router.push(`/search?q=${encodeURIComponent(q)}`);
    setIsSearchOpen(false);
  }, [router, searchTerm]);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex h-15 items-center justify-between px-4 transition-colors duration-300",
        isScrolled ? "bg-background/90 shadow-sm backdrop-blur-lg" : "bg-transparent",
      )}
    >
      {isSearchOpen ? (
        <div className="flex w-full items-center gap-3 pr-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search"
            className={cn(TOPBAR_ITEM_HEIGHT, "w-9 rounded-full text-foreground hover:bg-accent")}
          >
            <ArrowLeft className="size-4" />
          </Button>

          <SearchBar value={searchTerm} onChange={setSearchTerm} onSearch={handleSearch} />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Open menu"
              className={cn(
                TOPBAR_ITEM_HEIGHT,
                "w-9 rounded-full text-foreground hover:bg-accent",
                !isVideoWatchPage && "lg:hidden",
              )}
            >
              <Menu className="size-4" />
            </Button>

            <Logo />
          </div>

          <div className="absolute left-1/2 hidden w-full max-w-md -translate-x-1/2 items-center sm:flex">
            <SearchBar value={searchTerm} onChange={setSearchTerm} onSearch={handleSearch} />
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle
              variant="ghost"
              className={cn(TOPBAR_ITEM_HEIGHT, "w-9 rounded-full text-foreground hover:bg-accent")}
            />

            <Button
              variant="ghost"
              size="icon"
              type="button"
              className={cn(
                TOPBAR_ITEM_HEIGHT,
                "w-9 rounded-full text-foreground hover:bg-accent sm:hidden",
              )}
              onClick={() => setIsSearchOpen(true)}
              aria-label="Open search"
            >
              <Search className="size-4" />
            </Button>

            <Button
              asChild
              variant="secondary"
              className={cn(TOPBAR_ITEM_HEIGHT, "hidden rounded-full px-4 md:inline-flex")}
            >
              <Link href="https://ko-fi.com/fairplay_" target="_blank" rel="noopener noreferrer">
                Donate
              </Link>
            </Button>

            {isReady && user ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="destructive"
                  className={cn(TOPBAR_ITEM_HEIGHT, "hidden rounded-full px-4 lg:inline-flex")}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  type="button"
                  className={cn(TOPBAR_ITEM_HEIGHT, "w-9 rounded-full p-0")}
                  onClick={() => router.push("/profile")}
                  aria-label="Open profile"
                >
                  <UserAvatar user={user} className="size-9" />
                </Button>
              </div>
            ) : null}

            {shouldShowUnavailableAuthState ? (
              <Button
                asChild
                variant="outline"
                className={cn(TOPBAR_ITEM_HEIGHT, "hidden rounded-full px-4 lg:inline-flex")}
                title={errorMessage ?? undefined}
              >
                <Link href={serviceUnavailableHref}>Auth unavailable</Link>
              </Button>
            ) : null}

            {isReady && !user && !isUnavailable ? (
              <div className="hidden gap-2 lg:flex">
                <Separator orientation="vertical" />
                <Button
                  variant="secondary"
                  className={cn(TOPBAR_ITEM_HEIGHT, "rounded-full px-4")}
                  onClick={() => router.push("/login")}
                >
                  Login
                </Button>

                <Button
                  variant="secondary"
                  className={cn(
                    TOPBAR_ITEM_HEIGHT,
                    "rounded-full bg-foreground px-4 text-background hover:bg-foreground-muted hover:text-background-muted",
                  )}
                  onClick={() => router.push("/register")}
                >
                  Register
                </Button>
              </div>
            ) : null}
          </div>
        </>
      )}
    </header>
  );
}
