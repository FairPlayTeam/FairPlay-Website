import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import type { Video } from '@/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Video[] | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end('Method Not Allowed')
  }

  const { data, error } = await supabase
    .from('videos')
    .select('id, title, description, type, url, youtube_id, quality_score, themes')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  res.status(200).json((data ?? []) as Video[])
}
