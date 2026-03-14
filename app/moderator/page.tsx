'use client'

import { useEffect, useRef, useState, useCallback, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'

import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ModVideoCard } from '@/components/app/video/mod-video-card'

import { listModeratorVideos, type ModVideoItem, updateModeration } from '@/lib/moderation'
import { buildAuthHref } from '@/lib/safe-redirect'
import { deleteVideo } from '@/lib/video'
import { useAuth } from '@/context/auth-context'

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

type ModeratorListParams = NonNullable<Parameters<typeof listModeratorVideos>[0]>

type Filters = {
  search: string
  moderationStatus: ModeratorListParams['moderationStatus'] | ''
  processingStatus: ModeratorListParams['processingStatus'] | ''
  visibility: ModeratorListParams['visibility'] | ''
  userId: string
  sort: string
}
const PAGE_SIZE = 20

const DEFAULT_FILTERS: Filters = {
  search: '',
  moderationStatus: 'pending',
  processingStatus: '',
  visibility: '',
  userId: '',
  sort: 'createdAt:desc',
}

const isModerationStatus = (value: string): value is NonNullable<Filters['moderationStatus']> =>
  value === 'pending' || value === 'approved' || value === 'rejected'

const isProcessingStatus = (value: string): value is NonNullable<Filters['processingStatus']> =>
  value === 'uploading' || value === 'processing' || value === 'done'

const isVisibility = (value: string): value is NonNullable<Filters['visibility']> =>
  value === 'public' || value === 'unlisted' || value === 'private'

export default function ModerationPage() {
  const router = useRouter()
  const { user: me, isLoading } = useAuth()
  const isModerator = me?.role === 'admin' || me?.role === 'moderator'

  const [videos, setVideos] = useState<ModVideoItem[]>([])
  const [state, setState] = useState<LoadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [moderatingIds, setModeratingIds] = useState<Set<string>>(() => new Set())
  const [videoToDelete, setVideoToDelete] = useState<ModVideoItem | null>(null)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [pendingSearch, setPendingSearch] = useState('')

  const requestSeq = useRef(0)

  const handleConfirmDelete = async () => {
    if (!videoToDelete) return
    const videoId = videoToDelete.id
    setVideoToDelete(null)

    try {
      await deleteVideo(videoId)
      setVideos((prev) => prev.filter((v) => v.id !== videoId))
      toast.success('Video deleted successfully!')
    } catch {
      toast.error('Failed to delete video')
    }
  }

  const handleCancelDelete = () => {
    setVideoToDelete(null)
  }

  const handleModerateVideo = async (videoId: string, action: 'approve' | 'reject') => {
    if (moderatingIds.has(videoId)) return

    let removedItem: ModVideoItem | null = null
    let removedIndex = -1

    setModeratingIds((prev) => new Set(prev).add(videoId))
    setVideos((prev) => {
      removedIndex = prev.findIndex((v) => v.id === videoId)
      if (removedIndex === -1) return prev
      removedItem = prev[removedIndex]
      return prev.filter((v) => v.id !== videoId)
    })

    try {
      await updateModeration(videoId, action)
      toast.success(action === 'approve' ? 'Video approved' : 'Video rejected')
    } catch {
      if (removedItem && removedIndex >= 0) {
        setVideos((prev) => {
          const next = [...prev]
          next.splice(removedIndex, 0, removedItem as ModVideoItem)
          return next
        })
      }
      toast.error('Failed to update moderation status.')
    } finally {
      setModeratingIds((prev) => {
        const next = new Set(prev)
        next.delete(videoId)
        return next
      })
    }
  }

  const setFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setFilter('search', pendingSearch)
    }
  }

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setPendingSearch('')
  }

  useEffect(() => {
    if (!isLoading && !me) {
      router.replace(buildAuthHref('/login', '/moderator'))
    }
  }, [me, isLoading, router])

  useEffect(() => {
    const seq = ++requestSeq.current

    if (!me || !isModerator) return

    const run = async () => {
      setState('loading')
      setError(null)

      try {
        const params: Parameters<typeof listModeratorVideos>[0] = {
          page: 1,
          limit: PAGE_SIZE,
        }
        if (filters.search) params.search = filters.search
        if (filters.moderationStatus) params.moderationStatus = filters.moderationStatus
        if (filters.processingStatus) params.processingStatus = filters.processingStatus
        if (filters.visibility) params.visibility = filters.visibility
        if (filters.userId) params.userId = filters.userId
        if (filters.sort) params.sort = filters.sort

        const videosRes = await listModeratorVideos(params)
        if (requestSeq.current !== seq) return

        setVideos(videosRes.data?.videos ?? [])
        setState('ready')
      } catch (error) {
        if (requestSeq.current !== seq) return

        setState('error')
        setError(error instanceof Error ? error.message : 'Failed to load videos')
      }
    }

    run()

    return () => {
      requestSeq.current += 1
    }
  }, [me, isModerator, filters])

  if (!isLoading && me && !isModerator) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Not allowed</h1>
        <p className="text-muted-foreground mb-6">
          You don&apos;t have permission to access moderation tools.
        </p>
        <Button variant="secondary" onClick={() => router.push('/explore')}>
          Back to Explore
        </Button>
      </div>
    )
  }

  if (!me || state === 'idle') {
    return (
      <div className="h-[calc(100vh-5rem)] w-full grid place-items-center">
        <Spinner className="size-18" />
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl mb-4">Error</h2>
        <p className="text-muted-foreground">{error || 'Failed to load videos'}</p>
      </div>
    )
  }

  const isFiltered =
    filters.search !== DEFAULT_FILTERS.search ||
    filters.moderationStatus !== DEFAULT_FILTERS.moderationStatus ||
    filters.processingStatus !== DEFAULT_FILTERS.processingStatus ||
    filters.visibility !== DEFAULT_FILTERS.visibility ||
    filters.userId !== DEFAULT_FILTERS.userId ||
    filters.sort !== DEFAULT_FILTERS.sort

  return (
    <div className="w-full">
      <div className="container mx-auto p-4">
        <div className="flex flex-wrap gap-2 items-end bg-muted/40 border rounded-xl p-4 mb-5">
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs text-muted-foreground mb-1 block">Search title</label>
            <Input
              placeholder="Search..."
              value={pendingSearch}
              onChange={(e) => setPendingSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onBlur={() => setFilter('search', pendingSearch)}
              className="h-9"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Moderation</label>
            <Select
              value={filters.moderationStatus || '_all'}
              onValueChange={(value) =>
                setFilter('moderationStatus', isModerationStatus(value) ? value : '')
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Processing</label>
            <Select
              value={filters.processingStatus || '_all'}
              onValueChange={(value) =>
                setFilter('processingStatus', isProcessingStatus(value) ? value : '')
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All</SelectItem>
                <SelectItem value="uploading">Uploading</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Visibility</label>
            <Select
              value={filters.visibility || '_all'}
              onValueChange={(value) => setFilter('visibility', isVisibility(value) ? value : '')}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">User (username / ID)</label>
            <Input
              placeholder="Filter by user..."
              value={filters.userId}
              onChange={(e) => setFilter('userId', e.target.value)}
              className="h-9"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Sort</label>
            <Select value={filters.sort} onValueChange={(v) => setFilter('sort', v)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt:desc">Newest first</SelectItem>
                <SelectItem value="createdAt:asc">Oldest first</SelectItem>
                <SelectItem value="title:asc">Title A-Z</SelectItem>
                <SelectItem value="title:desc">Title Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isFiltered && (
            <div className="self-end">
              <Button variant="ghost" size="sm" onClick={handleResetFilters} className="h-9">
                Reset filters
              </Button>
            </div>
          )}
        </div>

        {state === 'loading' ? (
          <div className="h-64 grid place-items-center">
            <Spinner className="size-14" />
          </div>
        ) : videos.length === 0 ? (
          <h1 className="text-2xl font-bold mb-6">No videos.</h1>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {videos.map((v) => (
              <ModVideoCard
                key={v.id}
                video={v}
                user={v.user}
                onDelete={() => setVideoToDelete(v)}
                onModerate={handleModerateVideo}
                isModerating={moderatingIds.has(v.id)}
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={Boolean(videoToDelete)} onOpenChange={(open) => !open && setVideoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete video?</AlertDialogTitle>
            <AlertDialogDescription>
              {videoToDelete
                ? `Are you sure you want to delete "${
                    videoToDelete.title || 'this video'
                  }"? This action cannot be undone.`
                : undefined}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={handleCancelDelete}>
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

