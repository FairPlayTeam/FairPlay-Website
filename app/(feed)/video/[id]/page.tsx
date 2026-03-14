import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { getVideoServer } from '@/lib/video'
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OPEN_GRAPH_IMAGE,
  SITE_NAME,
  TWITTER_HANDLE,
  getAbsoluteUrl,
} from '@/lib/seo'
import VideoPageClient from './video-page-client'

type PageProps = {
  params: Promise<{ id: string }>
}

const FALLBACK_TITLE = 'FairPlay'
const FALLBACK_DESCRIPTION = 'Watch on FairPlay'

const fetchVideo = cache(async (id: string) => {
  return getVideoServer(id, {
    next: { revalidate: 60 },
  })
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const { video, status } = await fetchVideo(id)
  const title = video?.title?.trim() || FALLBACK_TITLE
  const description = video?.description?.trim() || FALLBACK_DESCRIPTION
  const canonical = `/video/${encodeURIComponent(id)}`
  const imageUrl = getAbsoluteUrl(video?.thumbnailUrl ?? null)
  const openGraphImages = imageUrl ? [{ url: imageUrl }] : [DEFAULT_OPEN_GRAPH_IMAGE]
  const twitterImages = imageUrl ? [imageUrl] : [DEFAULT_OG_IMAGE]

  if (status === 404) {
    return {
      title: 'Video not found',
      robots: {
        index: true,
        follow: false,
      },
    }
  }

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'video.other',
      siteName: SITE_NAME,
      images: openGraphImages,
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: twitterImages,
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function VideoPage({ params }: PageProps) {
  const { id } = await params
  const { status } = await fetchVideo(id)
  if (status === 404) notFound()

  return <VideoPageClient videoId={id} />
}
