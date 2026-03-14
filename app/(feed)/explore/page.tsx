import ExplorePageClient from './explore-page-client'
import type { VideoDetails } from '@/lib/video'
import { getVideosServer } from '@/lib/video'

const pageSize = 24

async function fetchInitialVideos(): Promise<{
  videos: VideoDetails[]
  totalPages?: number
  error?: string
}> {
  try {
    const { data, status } = await getVideosServer(1, pageSize, {
      next: { revalidate: 60 },
    })

    if (!data) {
      return {
        videos: [],
        error: 'Unable to load videos. Please try later.',
      }
    }

    return {
      videos: data.videos ?? [],
      totalPages: data.pagination?.totalPages,
    }
  } catch {
    return {
      videos: [],
      error: 'Unable to load videos. Please try later.',
    }
  }
}

export default async function ExplorePage() {
  const { videos, totalPages, error } = await fetchInitialVideos()

  return (
    <ExplorePageClient initialVideos={videos} initialTotalPages={totalPages} initialError={error} />
  )
}

