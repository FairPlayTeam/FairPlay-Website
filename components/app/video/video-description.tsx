'use client'

import { useState } from 'react'
import { VideoDetails } from '@/lib/video'
import Link from "next/link"
import { LICENSE_LABELS, type VideoLicense } from '@/app/upload/upload-schema'

export default function VideoDescription({ video }: { video: VideoDetails }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const text = video.description?.trim() || 'No description provided.'
  const createdAtLabel = video.createdAt
    ? new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(new Date(video.createdAt))
    : null

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg bg-card p-4 text-sm text-card-foreground">
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
          <span>{video.viewCount} views</span>

          {createdAtLabel && <span>{createdAtLabel}</span>}

          {video.tags?.length ? (
            <div className="flex gap-2 overflow-hidden">
              {video.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="text-primary-100 whitespace-nowrap shrink-0 cursor-pointer hover:underline">
                  #{tag.toLowerCase()}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <p
          className={`mt-3 whitespace-pre-wrap transition-all ${isExpanded ? '' : 'line-clamp-3'}`}
        >
          {text}
        </p>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="mt-3 font-medium text-primary-100 hover:underline"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      </div>
      {video.license && (
        <div className="text-sm bg-card text-muted-foreground rounded-lg p-4">
          This video is published under the{' '}
          <span className="font-medium text-foreground">
            {LICENSE_LABELS[video.license as VideoLicense]}
          </span>{' '}
          license.
          {video.license !== 'all_rights_reserved' && video.license !== 'cc0' && (
            <a
              href={`https://creativecommons.org/licenses/${video.license.replace('cc_', '').replace(/_/g, '-')}/4.0/`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline hover:text-foreground"
            >
              Learn more
            </a>
          )}
          {video.license === 'cc0' && (
            <a
              href="https://creativecommons.org/publicdomain/zero/1.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline hover:text-foreground"
            >
              Learn more
            </a>
          )}
        </div>
      )}
    </div>
  )
}
