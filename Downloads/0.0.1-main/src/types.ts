export type Video = {
  id: string
  title: string
  description: string
  type: 'native' | 'youtube'
  url: string | null
  youtube_id: string | null
  quality_score: number | null
  themes: string[] | string | null
  duration?: string
}
