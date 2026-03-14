import { api } from '@/lib/api'

type UploadImageResponse = {
  avatarUrl?: string | null
  bannerUrl?: string | null
}

export const uploadImage = async (file: File, type: 'avatar' | 'banner') => {
  const formData = new FormData()
  formData.append(type, file)

  const res = await api.post<UploadImageResponse>(`/upload/${type}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return res.data
}
