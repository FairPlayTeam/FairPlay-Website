'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Star } from 'lucide-react'
import VideoDescription from '@/components/app/video/video-description'
import { Button } from '@/components/ui/button'
import { FollowButton } from '@/components/ui/follow-button'
import { getUser, type PublicUser } from '@/lib/users'
import { type VideoDetails, rateVideo } from '@/lib/video'
import { buildAuthHref } from '@/lib/safe-redirect'
import { useAuth } from '@/context/auth-context'
import UserAvatar from '@/components/ui/user-avatar'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'

export function VideoInfo({ video }: { video: VideoDetails }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<PublicUser>()
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [myRating, setMyRating] = useState<number | null>(video.userRating ?? null)
  const [avgRating, setAvgRating] = useState(video.avgRating)
  const [ratingsCount, setRatingsCount] = useState(video.ratingsCount)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { user } = useAuth()
  const isOwner = user?.id === video.userId
  const callbackUrl = useMemo(() => {
    const query = searchParams.toString()
    return query ? `${pathname}?${query}` : pathname
  }, [pathname, searchParams])

  const isStarActive = (star: number) => {
    if (hoverRating !== null) return star <= hoverRating
    if (myRating !== null) return star <= myRating
    return star <= Math.round(avgRating)
  }

  const handleRate = async (score: number) => {
    if (!user || isOwner || isSubmitting) return

    const prevAvg = avgRating
    const prevCount = ratingsCount
    const prevMyRating = myRating

    const newCount = myRating ? ratingsCount : ratingsCount + 1
    const newAvg = (avgRating * ratingsCount - (myRating ?? 0) + score) / newCount

    setAvgRating(newAvg)
    setRatingsCount(newCount)
    setMyRating(score)
    setIsSubmitting(true)

    try {
      await rateVideo(video.id, score)
    } catch {
      toast.error('Error while rating video.')
      setAvgRating(prevAvg)
      setRatingsCount(prevCount)
      setMyRating(prevMyRating)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!video.user?.username) return

    getUser(video.user.username)
      .then((res) => setProfile(res.data))
      .catch(() => undefined)
  }, [video.user?.username])

  return (
    <div className="mt-4 space-y-6">
      <h1 className="text-xl font-bold text-foreground sm:text-xl">{video.title}</h1>

      <div className="flex flex-col justify-between gap-6 sm:flex-row">
        <div className="flex flex-row justify-between gap-6 sm:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar user={video.user} className="size-12" />

            <div className="min-w-0">
              <Link href={`/channel/${video.user?.username}`}>
                <h3 className="truncate text-base font-semibold text-foreground sm:text-lg">
                  {video.user?.displayName || video.user?.username}
                </h3>
                <p className="truncate text-sm text-muted-foreground">@{video.user?.username}</p>
              </Link>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-4">
            {!user ? (
              <Link href={buildAuthHref('/login', callbackUrl)}>
                <Button
                  variant="outline"
                  className="rounded-full px-5 py-2 text-sm font-semibold"
                >
                  Login to Subscribe
                </Button>
              </Link>
            ) : !isOwner ? (
              <FollowButton
                username={video.user?.username ?? ''}
                initialFollowing={!!profile?.isFollowing}
              />
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-4 text-sm text-foreground sm:flex-row sm:items-center">
          <div className="hidden lg:block">
            <span className="font-medium">{avgRating.toFixed(1)}/5</span>
            <span className="text-muted-foreground"> - {ratingsCount} reviews</span>
          </div>

          <div className="flex items-center justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                disabled={!user || isOwner}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => handleRate(star)}
                className="cursor-pointer p-1 disabled:cursor-not-allowed"
              >
                <Star
                  className={
                    isStarActive(star)
                      ? 'size-5 fill-primary-100 text-primary-100'
                      : 'size-5 text-primary-100'
                  }
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      <VideoDescription video={video} />
    </div>
  )
}

