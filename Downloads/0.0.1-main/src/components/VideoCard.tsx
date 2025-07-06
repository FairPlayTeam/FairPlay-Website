import React from 'react'
import { EllipsisVerticalIcon } from './icons'
import type { Video } from '@/types'
import { parseThemes } from '@/lib/utils'

export const VideoCard = ({ video }: { video: Video }) => (
  <div className="video-card">
    <div
      className="video-thumbnail-wrapper"
      style={{
        width: '100%',
        overflow: 'hidden',
        borderRadius: '8px',
        backgroundColor: '#f0f0f0',
        position: 'relative',
        paddingTop: video.type === 'youtube' ? '56.25%' : undefined
      }}
    >
      {video.type === 'youtube' && video.youtube_id ? (
        <iframe
          src={`https://www.youtube.com/embed/${video.youtube_id}`}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        />
      ) : video.type === 'native' && video.url ? (
        <img
          src={video.url.replace(/\.(mp4|mov|webm)$/, '.png')}
          alt={video.title}
          className="video-thumbnail"
          style={{
            display: 'block',
            width: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/320x180/000/888?text=Thumbnail'; }}
        />
      ) : (
        <div
          className="video-thumbnail-placeholder"
          style={{
            width: '100%',
            height: '180px',
            backgroundColor: '#e0e0e0'
          }}
        />
      )}
    </div>
    <div className="video-details-container" style={{ display: 'flex', marginTop: '8px' }}>
      <img
        src="https://placehold.co/36x36/4A4A4A/FFFFFF?text=P"
        alt="Channel Avatar"
        className="channel-avatar"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          flexShrink: 0,
          marginRight: '8px'
        }}
      />
      <div className="video-text-content" style={{ flex: 1 }}>
        <h3 className="video-title" style={{ fontSize: '14px', fontWeight: 600, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {video.title}
        </h3>
        <p className="video-description" style={{ fontSize: '12px', color: '#666', margin: '4px 0 0', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {video.description}
        </p>
        <p className="video-theme" style={{ fontSize: '11px', color: '#aaa', margin: '2px 0 0' }}>
          {parseThemes(video.themes).join(', ')}
        </p>
      </div>
      <button className="video-options-button" style={{ marginLeft: '8px', padding: '4px', border: 'none', background: 'none', cursor: 'pointer' }}>
        <EllipsisVerticalIcon />
      </button>
    </div>
  </div>
)

