"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import type { Video } from '@/types'
import { Layout } from '@/components/Layout'

export default function VideoDetailPage() {
  const router = useRouter()
  const { id } = router.query

  const [video, setVideo] = useState<Video | null>(null)
  const [userRating, setUserRating] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data: videoData, error: videoError } = await supabase
          .from('videos')
          .select('id, title, description, type, url, youtube_id, quality_score, themes')
          .eq('id', id as string)
          .single()
        if (videoError || !videoData) throw new Error(videoError?.message || 'Vidéo non trouvée')
        setVideo(videoData as Video)
        const { data: authData } = await supabase.auth.getUser()
        const user = authData.user
        if (user) {
          const { data: ratingData } = await supabase
            .from('ratings')
            .select('score')
            .eq('video_id', id as string)
            .eq('user_id', user.id)
            .maybeSingle()
          if (ratingData) setUserRating(ratingData.score)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleRate = async (score: number) => {
    try {
      setUserRating(score)
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user) throw new Error('Utilisateur non authentifié')
      const userId = authData.user.id
      const { error: upsertError } = await supabase
        .from('ratings')
        .upsert({ video_id: id as string, user_id: userId, score }, { onConflict: 'video_id,user_id' })
      if (upsertError) throw upsertError
      const { data: refreshed } = await supabase
        .from('videos')
        .select('quality_score')
        .eq('id', id as string)
        .single()
      if (refreshed) setVideo(prev => prev ? { ...prev, quality_score: refreshed.quality_score } : prev)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <Layout active="videos">
      <div className="video-detail-container custom-scrollbar">
        {loading && <p className="text-center">Chargement...</p>}
        {error && <p className="text-red-500 text-center">Erreur : {error}</p>}
        {!loading && video && (
          <>
            <h1 className="text-2xl font-bold mb-4">{video.title}</h1>
            <div className="mb-6">
              {video.type === 'youtube' && video.youtube_id ? (
                <iframe
                  width="100%"
                  height="400"
                  src={`https://www.youtube.com/embed/${video.youtube_id}`}
                  frameBorder="0"
                  allowFullScreen
                />
              ) : (
                video.url && <video className="w-full h-96" controls src={video.url} />
              )}
            </div>
            <p className="mb-4">{video.description}</p>
            <div className="mb-4">
              <p className="font-medium">
                Note moyenne : {video.quality_score != null ? video.quality_score.toFixed(1) : 'N/A'} / 5
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span>Ta note :</span>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => handleRate(n)}
                  className={`px-3 py-1 rounded ${n <= userRating ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'}`}
                >
                  {n}⭐
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
