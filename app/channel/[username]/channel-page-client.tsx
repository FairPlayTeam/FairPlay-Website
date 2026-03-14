'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { CalendarDays, Pencil } from 'lucide-react'

import { Spinner } from '@/components/ui/spinner'
import { VideoCard } from '@/components/app/video/video-card'
import { FollowButton } from '@/components/ui/follow-button'
import { Button } from '@/components/ui/button'

import { getUser, getUserVideos, type PublicUser, type UserVideoItem } from '@/lib/users'
import { useAuth } from '@/context/auth-context'
import UserAvatar from '@/components/ui/user-avatar'
import useInfiniteScroll from '@/hooks/use-infinite-scroll'
import UserListModal from '@/components/ui/user-list-modal'
import { buildAuthHref } from '@/lib/safe-redirect'

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

type ChannelPageClientProps = {
  username: string
  initialUser: PublicUser | null
  initialVideos: UserVideoItem[]
  initialTotalPages?: number
  initialError?: string | null
}

const PAGE_SIZE = 10

function computeHasMore(currentPage: number, totalPages: number | undefined, itemsLength: number) {
  if (typeof totalPages === 'number') {
    return currentPage < totalPages
  }
  return itemsLength === PAGE_SIZE
}

function mergeUniqueVideos(prev: UserVideoItem[], next: UserVideoItem[]) {
  if (next.length === 0) return prev
  const seen = new Set(prev.map((item) => item.id))
  const merged = [...prev]

  for (const item of next) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      merged.push(item)
    }
  }

  return merged
}

export default function ChannelPageClient({
  username,
  initialUser,
  initialVideos,
  initialTotalPages,
  initialError,
}: ChannelPageClientProps) {
  const router = useRouter()
  const { user: me } = useAuth()
  const pathname = usePathname()

  const [user, setUser] = useState<PublicUser | null>(initialUser)
  const [videos, setVideos] = useState<UserVideoItem[]>(initialVideos)
  const [state, setState] = useState<LoadState>(() => {
    if (initialError) return 'error'
    return initialUser ? 'ready' : 'idle'
  })
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [page, setPage] = useState(initialUser ? 1 : 0)
  const [hasMore, setHasMore] = useState(() => {
    if (!initialUser) return false
    return computeHasMore(1, initialTotalPages, initialVideos.length)
  })
  const [loadingMore, setLoadingMore] = useState(false)
  const [userListConfig, setUserListConfig] = useState<{
    isOpen: boolean
    type: 'followers' | 'following'
  }>({ isOpen: false, type: 'followers' })

  const requestSeq = useRef(0)
  const shouldFetchInitial = !initialUser && !initialError
  const meUsername = me?.username ?? null
  const userUsername = user?.username ?? null
  const isMe = !!meUsername && !!userUsername && meUsername === userUsername
  const isReady = state === 'ready'
  const isLoading = state === 'loading' || state === 'idle'

  useEffect(() => {
    requestSeq.current += 1

    if (initialError) {
      setUser(null)
      setVideos([])
      setError(initialError)
      setPage(0)
      setHasMore(false)
      setState('error')
      return
    }

    if (initialUser) {
      setUser(initialUser)
      setVideos(initialVideos)
      setError(null)
      setPage(1)
      setHasMore(computeHasMore(1, initialTotalPages, initialVideos.length))
      setState('ready')
      return
    }

    setUser(null)
    setVideos([])
    setError(null)
    setPage(0)
    setHasMore(false)
    setState('idle')
  }, [initialError, initialUser, initialVideos, initialTotalPages, username])

  useEffect(() => {
    if (!username) {
      setUser(null)
      setVideos([])
      setError('User not found')
      setState('error')
      return
    }

    if (!shouldFetchInitial) return
    const seq = ++requestSeq.current

    const run = async () => {
      setState('loading')
      setError(null)

      try {
        const [uRes, vsRes] = await Promise.all([
          getUser(username),
          getUserVideos(username, 1, PAGE_SIZE),
        ])

        if (requestSeq.current !== seq) return

        const u = uRes.data
        const vs = vsRes.data

        setUser(u)
        const initial = vs?.videos ?? []
        const totalPages = vs?.pagination?.totalPages
        setVideos(initial)
        setPage(1)
        setHasMore(computeHasMore(1, totalPages, initial.length))
        setState('ready')
      } catch (e: unknown) {
        if (requestSeq.current !== seq) return
        const message = e instanceof Error ? e.message : 'Failed to load channel.'
        setUser(null)
        setVideos([])
        setError(message)
        setState('error')
      }
    }

    run()
  }, [shouldFetchInitial, username])

  useEffect(() => {
    if (!meUsername || !userUsername || isMe) return

    let active = true

    getUser(userUsername)
      .then((res) => {
        if (!active) return
        setUser(res.data)
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [isMe, meUsername, userUsername])

  const loadMore = useCallback(async () => {
    if (!username || !isReady || loadingMore || !hasMore) return

    setLoadingMore(true)
    const seq = requestSeq.current
    const nextPage = page + 1

    try {
      const vsRes = await getUserVideos(username, nextPage, PAGE_SIZE)
      if (requestSeq.current !== seq) return

      const vs = vsRes.data
      const nextVideos = vs?.videos ?? []
      const totalPages = vs?.pagination?.totalPages

      setVideos((prev) => mergeUniqueVideos(prev, nextVideos))
      setPage(nextPage)
      setHasMore(computeHasMore(nextPage, totalPages, nextVideos.length))
    } catch {
      if (requestSeq.current !== seq) return
      setHasMore(false)
    } finally {
      if (requestSeq.current !== seq) return
      setLoadingMore(false)
    }
  }, [hasMore, isReady, loadingMore, page, username])

  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: !isReady || loadingMore,
    onLoadMore: loadMore,
  })

  const bannerUrl = user?.bannerUrl

  const onFollowerDelta = (delta: number) => {
    setUser((prev) => {
      if (!prev) return prev
      const nextCount = Math.max(0, (prev.followerCount ?? 0) + delta)
      return { ...prev, followerCount: nextCount }
    })
  }

  const openUserList = (type: 'followers' | 'following') => {
    setUserListConfig({ isOpen: true, type })
  }
  if (isLoading) {
    return (
      <div className="h-[calc(100vh-5rem)] w-full grid place-items-center">
        <Spinner className="size-18" />
      </div>
    )
  }

  if (state === 'error' || !user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl mb-4">Error</h2>
        <p className="text-muted-foreground">{error || 'User not found'}</p>
      </div>
    )
  }

  return (
    <div className="w-full bg-background">
      {bannerUrl ? (
        <div className="relative w-full h-32 md:h-48 lg:h-56 overflow-hidden bg-muted">
          <Image
            src={bannerUrl}
            alt={`${user.username} banner`}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      ) : null}

      <div className="container mx-auto px-4 pb-8">
        <div
          className={`flex flex-col md:flex-row gap-6 relative ${
            !bannerUrl ? 'md:items-center mt-6' : ''
          }`}
        >
          <div
            className={`flex justify-center md:justify-start shrink-0 relative z-10 ${
              bannerUrl ? '-mt-12 md:-mt-16' : ''
            }`}
          >
            <UserAvatar
              user={user}
              className="h-34 w-34 md:h-34 md:w-34 border-5 border-background bg-card rounded-full"
            />
          </div>

          <div className={`flex-1 min-w-0 ${bannerUrl ? 'md:mt-6' : ''} text-center md:text-left`}>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  {user.displayName || user.username}
                </h1>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
                  <span>@{user.username}</span>
                  <span>-</span>
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="size-4" />
                    <span>
                      Joined{' '}
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm">
                  <button
                    type="button"
                    onClick={() => openUserList('followers')}
                    aria-label="Open followers list"
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    <span className="font-semibold tabular-nums">{user.followerCount}</span>
                    <span className="text-muted-foreground">Followers</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openUserList('following')}
                    aria-label="Open following list"
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    <span className="font-semibold tabular-nums">{user.followingCount}</span>
                    <span className="text-muted-foreground">Following</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold tabular-nums">{user.videoCount}</span>
                    <span className="text-muted-foreground">Videos</span>
                  </div>
                </div>

                {user.bio && (
                  <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {user.bio}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
                {isMe ? (
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/profile`)}
                    className="w-full rounded-full gap-3 px-4 py-2 text-sm font-semibold"
                  >
                    <Pencil className="size-4" />
                    <span>Edit Channel</span>
                  </Button>
                ) : !me ? (
                  <Link href={buildAuthHref('/login', pathname || '/')}>
                    <Button variant="outline" className="rounded-full px-4 py-2 text-sm font-semibold">
                      Login to Subscribe
                    </Button>
                  </Link>
                ) : (
                  <FollowButton
                    username={user.username ?? ''}
                    initialFollowing={Boolean(user.isFollowing)}
                    onChangeCount={onFollowerDelta}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {videos.length === 0 ? (
          <p className="flex justify-center pt-16 text-sm text-muted-foreground">No videos yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((v) => {
              const createdAtLabel = new Date(v.createdAt).toLocaleDateString()
              const meta = `${v.viewCount} views - ${createdAtLabel}`

              return (
                <VideoCard
                  key={v.id}
                  thumbnailUrl={v.thumbnailUrl}
                  title={v.title}
                  displayName={user.displayName || user.username}
                  meta={meta}
                  href={`/video/${v.id}`}
                  variant="grid"
                />
              )
            })}

            <div ref={sentinelRef} className="h-1 col-span-full" />

            {loadingMore ? (
              <div className="w-full grid place-items-center py-8 col-span-full">
                <Spinner className="size-14" />
              </div>
            ) : null}
          </div>
        )}
      </div>

      <UserListModal
        isOpen={userListConfig.isOpen}
        onClose={() => setUserListConfig((prev) => ({ ...prev, isOpen: false }))}
        username={user.username}
        type={userListConfig.type}
      />
    </div>
  )
}

