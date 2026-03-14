'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Bell,
  Compass,
  Gamepad2,
  BookOpen,
  Upload,
  Shield,
  ShieldCheck,
  Menu,
  TrendingUp,
} from 'lucide-react'
import { SiDiscord, SiMatrix, SiKofi } from 'react-icons/si'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/context/sidebar-context'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/context/auth-context'
import { useQueryClient } from '@tanstack/react-query'
import { clearToken } from '@/lib/token'
import { logoutCurrentSession } from '@/lib/users'
import { useState } from 'react'

const mainLinks = [
  { icon: Compass, label: 'Explore', href: '/explore' },
  { icon: Bell, label: 'Subscriptions', href: '/subscriptions' },
  { icon: Upload, label: 'Upload', href: '/upload' },
  { icon: Shield, label: 'Mods', href: '/moderator' },
  { icon: ShieldCheck, label: 'Admin', href: '/admin' },
]

const categories = [
  { icon: TrendingUp, label: 'Trending', href: '/search?q=trending' },
  { icon: BookOpen, label: 'Learning', href: '/search?q=learning' },
  { icon: Gamepad2, label: 'Gaming', href: '/search?q=gaming' },
]

export default function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isOpen, close, toggle } = useSidebar()
  const queryClient = useQueryClient()
  const { user, isReady } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const isVideoWatchPage = pathname?.startsWith('/video/') ?? false

  const handleLogout = async () => {
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
  }

  return (
    <>
      {isOpen && (
        <div
          className={cn(
            'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm cursor-pointer',
            !isVideoWatchPage && 'lg:hidden',
          )}
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 w-60 flex flex-col overflow-y-auto bg-background/95 backdrop-blur-md px-3 py-4 transition-transform duration-300',
          !isVideoWatchPage && 'lg:translate-x-0 lg:top-16 lg:bg-transparent lg:backdrop-blur-none',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div
          className={cn(
            'flex flex-1 flex-col gap-4 transition-opacity duration-200',
            isReady ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
        >
          <div className={cn('mb-4 flex items-center gap-4', !isVideoWatchPage && 'lg:hidden')}>
            <Button
              onClick={toggle}
              size="icon"
              variant="ghost"
              className={cn(
                'rounded-full text-foreground hover:bg-accent',
                !isVideoWatchPage && 'lg:hidden',
              )}
              aria-label="Close menu"
            >
              <Menu />
            </Button>

            <Link href="/" className="text-xl font-bold text-foreground">
              Rewind
            </Link>
          </div>

          <div className="flex flex-col gap-1">
            {mainLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              const isModsLink = link.label === 'Mods'
              const isAdminLink = link.label === 'Admin'
              const canShowMods = user?.role === 'admin' || user?.role === 'moderator'
              const canShowAdmin = user?.role === 'admin'
              const shouldRenderMods = !isModsLink || (isReady && canShowMods)
              const shouldRenderAdmin = !isAdminLink || (isReady && canShowAdmin)

              if (!shouldRenderMods || !shouldRenderAdmin) {
                return null
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className={cn(
                    'flex items-center gap-4 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200',
                    isActive
                      ? 'bg-secondary text-foreground'
                      : 'text-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <Icon className="size-4" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </div>

          <Separator />

          <div className="flex flex-col gap-1">
            {categories.map((link) => {
              const Icon = link.icon
              const linkQuery = new URLSearchParams(link.href.split('?')[1] ?? '').get('q')
              const currentQuery = searchParams.get('q')
              const isActive = pathname === '/search' && currentQuery === linkQuery
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className={cn(
                    'flex items-center gap-4 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200',
                    isActive
                      ? 'bg-card text-foreground'
                      : 'text-foreground hover:bg-card hover:text-foreground',
                  )}
                >
                  <Icon className="size-4" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="flex flex-col gap-4 mt-auto pt-4">
            {isReady && !!user && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="lg:hidden flex w-full items-center gap-4 rounded-lg px-3 py-2 text-sm font-medium"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            )}
            <div className="flex gap-2 text-muted-foreground">
              <Link
                href="https://discord.gg/K68Z9HbsA5"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="ghost" className="w-full" aria-label="Join Discord">
                  <SiDiscord className="size-5" />
                </Button>
              </Link>

              <Link
                href="https://matrix.to/#/#fairplay-video:matrix.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="ghost" className="w-full" aria-label="Join Matrix">
                  <SiMatrix className="size-5" />
                </Button>
              </Link>

              <Link
                href="https://ko-fi.com/fairplay_"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="ghost" className="w-full" aria-label="Support on Ko-fi">
                  <SiKofi className="size-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
