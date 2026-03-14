'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { MyVideoCard } from '@/components/app/video/my-video-card'
import { MyVideoItem, getMyVideos } from '@/lib/users'
import { deleteVideo } from '@/lib/video'
import { User } from '@/lib/users'
import { CloudUpload } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import useInfiniteScroll from '@/hooks/use-infinite-scroll'

interface VideosTabProps {
  user: User
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

const PAGE_SIZE = 10

function resolveHasMore(itemsCount: number, page: number, totalPages?: number) {
  if (typeof totalPages === 'number') return page < totalPages
  return itemsCount === PAGE_SIZE
}

function mergeUniqueVideos(prev: MyVideoItem[], next: MyVideoItem[]) {
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

function UploadCard({ onClick }: { onClick: () => void }) {
  return (
    <div className="p-1">
      <button
        type="button"
        onClick={onClick}
        aria-label="Go to upload page"
        className="w-full rounded-xl border-2 border-dashed border-border/70 text-center transition-colors duration-200 cursor-pointer hover:border-primary/50 aspect-video flex flex-col items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CloudUpload className="size-7 text-primary" />
        <div className="space-y-1.5">
          <p className="text-base font-semibold text-foreground">Upload a video</p>
          <p className="text-sm text-muted-foreground">Click to go to the upload page</p>
        </div>
        <span className="mt-1 inline-flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">
          Upload
        </span>
      </button>
    </div>
  )
}

export default function VideosTab({ user }: VideosTabProps) {
  const router = useRouter()

  const [videos, setVideos] = useState<MyVideoItem[]>([])
  const [state, setState] = useState<LoadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [videoToDelete, setVideoToDelete] = useState<MyVideoItem | null>(null)

  const requestSeq = useRef(0)

  useEffect(() => {
    const seq = ++requestSeq.current

    const run = async () => {
      setState('loading')
      setError(null)

      try {
        const res = await getMyVideos(1, PAGE_SIZE)
        if (requestSeq.current !== seq) return

        const initialVideos = res.data?.videos ?? []
        const totalPages = res.data?.pagination?.totalPages

        setVideos(initialVideos)
        setPage(1)
        setHasMore(resolveHasMore(initialVideos.length, 1, totalPages))
        setState('ready')
      } catch (e) {
        if (requestSeq.current !== seq) return
        setState('error')
        setError(e instanceof Error ? e.message : 'Failed to load videos')
        setVideos([])
      }
    }

    run()

    return () => {
      requestSeq.current += 1
    }
  }, [user])

  const loadMore = useCallback(async () => {
    if (state !== 'ready' || loadingMore || !hasMore) return

    setLoadingMore(true)
    const seq = requestSeq.current
    const nextPage = page + 1

    try {
      const res = await getMyVideos(nextPage, PAGE_SIZE)
      if (requestSeq.current !== seq) return

      const nextVideos = res.data?.videos ?? []
      const totalPages = res.data?.pagination?.totalPages

      setVideos((prev) => mergeUniqueVideos(prev, nextVideos))
      setPage(nextPage)
      setHasMore(resolveHasMore(nextVideos.length, nextPage, totalPages))
    } catch {
      if (requestSeq.current !== seq) return
      setHasMore(false)
    } finally {
      if (requestSeq.current !== seq) return
      setLoadingMore(false)
    }
  }, [hasMore, loadingMore, page, state])

  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: state !== 'ready' || loadingMore,
    onLoadMore: loadMore,
  })

  const handleConfirmDelete = async () => {
    if (!videoToDelete) return
    const videoId = videoToDelete.id
    setVideoToDelete(null)

    try {
      await deleteVideo(videoId)
      setVideos((prev) => prev.filter((v) => v.id !== videoId))
      toast.success('Video deleted successfully')
    } catch {
      toast.error('Failed to delete video')
    }
  }

  if (state === 'loading' || state === 'idle') {
    return (
      <div className="h-[calc(100vh-5rem)] w-full grid place-items-center">
        <Spinner className="size-18" />
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="text-center py-8 text-destructive">{error || 'Failed to load videos'}</div>
    )
  }

  return (
    <div className="container mx-auto md:px-4 pb-10">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <UploadCard onClick={() => router.push('/upload')} />

        {videos.map((v) => (
          <MyVideoCard key={v.id} video={v} user={user} onDelete={() => setVideoToDelete(v)} />
        ))}

        <div ref={sentinelRef} className="h-1 col-span-full" />
      </div>

      <AlertDialog
        open={Boolean(videoToDelete)}
        onOpenChange={(open) => !open && setVideoToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete video?</AlertDialogTitle>
            <AlertDialogDescription>
              {videoToDelete
                ? `Are you sure you want to delete "${
                    videoToDelete.title || 'this video'
                  }"? This action cannot be undone.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setVideoToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

