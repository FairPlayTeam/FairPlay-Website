import { supabase } from './supabase'
import type { Video } from '@/types'
import { parseThemes } from './utils'

interface VideoRow {
  id: string
  title: string
  description: string
  type: 'native' | 'youtube'
  url: string | null
  youtube_id: string | null
  quality_score: number | null
  themes: string[] | string | null
}

export async function getRecommendedVideos(userId: string): Promise<Video[]> {
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('theme')
    .eq('user_id', userId)

  const likedThemes = prefs?.map(p => p.theme) ?? []

  const { data: videos } = await supabase
    .from('videos')
    .select('id, title, description, type, url, youtube_id, quality_score, themes')
    .returns<VideoRow[]>()

  if (!videos) return []

  const scored = videos.map(v => {
    const themes = parseThemes(v.themes)
    const hasLiked = themes.some(t => likedThemes.includes(t))
    const themeScore = hasLiked ? 1 : 0
    const ratingScore = v.quality_score ?? 0
    const video: Video = { ...v, themes }
    return { video, score: themeScore * 10 + ratingScore }
  })

  scored.sort((a, b) => b.score - a.score)

  return scored.map(s => s.video)
}
