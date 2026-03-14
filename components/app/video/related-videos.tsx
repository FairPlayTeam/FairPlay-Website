'use client'

import { useMemo } from 'react'
import { VideoDetails } from '@/lib/video'
import { VideoCard } from './video-card'
import { Spinner } from '@/components/ui/spinner'
import useInfiniteScroll from '@/hooks/use-infinite-scroll'

interface RelatedVideosProps {
  videos: VideoDetails[]
  currentVideoId: string
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
}

export function RelatedVideos({
  videos,
  currentVideoId,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: RelatedVideosProps) {
  const filteredVideos = useMemo(
    () => videos.filter((v) => v.id !== currentVideoId),
    [videos, currentVideoId],
  )

  const sentinelRef = useInfiniteScroll({
    hasMore: Boolean(onLoadMore) && hasMore,
    isLoading: isLoadingMore,
    onLoadMore: onLoadMore ?? (() => undefined),
  })

  return (
    <div className="mx-4 space-y-4">
      <h2 className="font-semibold text-2xl text-foreground">Related Videos</h2>

      <div className="flex flex-col">
        {filteredVideos.map((video) => (
          <VideoCard
            key={video.id}
            thumbnailUrl={video.thumbnailUrl}
            title={video.title}
            displayName={video.user?.displayName || video.user?.username}
            meta={`${video.viewCount} views • ${new Date(video.createdAt).toLocaleDateString()}`}
            href={`/video/${video.id}`}
            variant="list"
          />
        ))}

        {onLoadMore && <div ref={sentinelRef} className="h-1" />}

        {isLoadingMore && (
          <div className="grid w-full place-items-center py-6">
            <Spinner className="size-10" />
          </div>
        )}
      </div>
    </div>
  )
}

