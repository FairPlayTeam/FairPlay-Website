'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft, Menu, Search } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

import { cn } from '@/lib/utils'
import { clearToken } from '@/lib/token'
import { logoutCurrentSession } from '@/lib/users'

import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import UserAvatar from '@/components/ui/user-avatar'

import { useAuth } from '@/context/auth-context'
import { useSidebar } from '@/context/sidebar-context'

const TOPBAR_ITEM_HEIGHT = 'h-8'

function SearchBar({
  value,
  onChange,
  onSearch,
}: {
  value: string
  onChange: (val: string) => void
  onSearch: () => void
}) {
  return (
    <div className="flex flex-1 items-center overflow-hidden rounded-full">
      <Input
        type="search"
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        className={cn(TOPBAR_ITEM_HEIGHT, 'rounded-l-full rounded-r-none border-r-0 px-4')}
      />

      <Button
        type="button"
        size="icon"
        onClick={onSearch}
        aria-label="Search"
        className={cn(
          TOPBAR_ITEM_HEIGHT,
          'w-9 shrink-0 rounded-l-none rounded-r-full border border-l-0 border-input bg-muted hover:bg-accent text-muted-foreground',
        )}
      >
        <Search className="size-4" />
      </Button>
    </div>
  )
}

export default function AppTopbar() {
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()

  const { toggle, close } = useSidebar()
  const { user, isReady } = useAuth()

  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const isVideoWatchPage = pathname?.startsWith('/video/') ?? false

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0)
    handleScroll()

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = useCallback(() => {
    const q = searchTerm.trim()
    if (!q) return

    router.push(`/search?q=${encodeURIComponent(q)}`)
    setIsSearchOpen(false)
  }, [router, searchTerm])

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    try {
      await logoutCurrentSession()
    } finally {
      clearToken()
      queryClient.setQueryData(['me'], null)
      close()
      router.replace('/login')
      setIsLoggingOut(false)
    }
  }, [close, isLoggingOut, queryClient, router])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 flex h-15 items-center justify-between px-4 transition-colors duration-300',
        isScrolled ? 'bg-background/90 backdrop-blur-lg shadow-sm' : 'bg-transparent',
      )}
    >
      {isSearchOpen ? (
        <div className="flex w-full items-center gap-3 pr-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search"
            className={cn(TOPBAR_ITEM_HEIGHT, 'w-9 rounded-full text-foreground hover:bg-accent')}
          >
            <ArrowLeft className="size-4" />
          </Button>

          <SearchBar value={searchTerm} onChange={setSearchTerm} onSearch={handleSearch} />
        </div>
      ) : (
        <>
          {/* Left */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Open menu"
              className={cn(
                TOPBAR_ITEM_HEIGHT,
                'w-9 rounded-full text-foreground hover:bg-accent',
                !isVideoWatchPage && 'lg:hidden',
              )}
            >
              <Menu className="size-4" />
            </Button>

            <Link href="/" className="text-xl font-bold leading-none text-foreground">
              Rewind
            </Link>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 hidden w-full max-w-md items-center sm:flex">
            <SearchBar value={searchTerm} onChange={setSearchTerm} onSearch={handleSearch} />
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className={cn(
                TOPBAR_ITEM_HEIGHT,
                'w-9 rounded-full text-foreground hover:bg-accent sm:hidden',
              )}
              onClick={() => setIsSearchOpen(true)}
              aria-label="Open search"
            >
              <Search className="size-4" />
            </Button>

            <Button asChild variant="secondary" className={cn(TOPBAR_ITEM_HEIGHT, 'rounded-full px-4 hidden md:inline-flex')}>
              <Link href="https://ko-fi.com/fairplay_" target="_blank" rel="noopener noreferrer">
                Donate
              </Link>
            </Button>

            {isReady && user ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="destructive"
                  className={cn(TOPBAR_ITEM_HEIGHT, 'rounded-full px-4 hidden lg:inline-flex')}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  type="button"
                  className={cn(TOPBAR_ITEM_HEIGHT, 'w-9 rounded-full p-0')}
                  onClick={() => router.push('/profile')}
                  aria-label="Open profile"
                >
                  <UserAvatar user={user} className="size-9" />
                </Button>
              </div>
            ) : null}

            {isReady && !user ? (
              <div className="hidden lg:flex gap-2">
                <Separator orientation="vertical" />
                <Button
                  variant="secondary"
                  className={cn(TOPBAR_ITEM_HEIGHT, 'rounded-full px-4')}
                  onClick={() => router.push('/login')}
                >
                  Login
                </Button>

                <Button
                  variant="secondary"
                  className={cn(
                    TOPBAR_ITEM_HEIGHT,
                    'rounded-full px-4 bg-foreground text-background hover:bg-foreground-muted hover:text-background-muted',
                  )}
                  onClick={() => router.push('/register')}
                >
                  Register
                </Button>
              </div>
            ) : null}
          </div>
        </>
      )}
    </header>
  )
}

