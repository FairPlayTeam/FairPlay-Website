import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { parseThemes, extractYoutubeId } from '@/lib/utils'
import { useRouter } from 'next/router'
import { useDropzone } from 'react-dropzone'

export default function Upload() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [existingThemes, setExistingThemes] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.from('videos').select('themes')
      if (data) {
        const all = data.flatMap((v: any) => parseThemes(v.themes))
        const unique = Array.from(new Set(all))
        setExistingThemes(unique)
      }
    })()
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0])
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'video/*': []} })

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const newTag = tagInput.replace(/^\/+/, '').trim()
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag])
        if (!existingThemes.includes(newTag)) {
          setExistingThemes([...existingThemes, newTag])
        }
      }
      setTagInput('')
      setSuggestions([])
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // get user to add user_id
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Utilisateur non authentifié')

      let videoData: any = { title, description, themes: tags, user_id: user.id }
      if (youtubeUrl) {
        const id = extractYoutubeId(youtubeUrl)
        if (!id) throw new Error('URL YouTube invalide')
        videoData = { ...videoData, type: 'youtube', youtube_id: id }
      } else if (file) {
        const fileName = `${Date.now()}_${file.name}`
        const { data, error: uploadError } = await supabase
          .storage
          .from('videos')
          .upload(fileName, file)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(data.path)
        videoData = { ...videoData, type: 'native', url: publicUrl }
      } else {
        throw new Error('Fichier ou URL YouTube requis')
      }

      const { error: dbError } = await supabase
        .from('videos')
        .insert([videoData])
      if (dbError) throw dbError
      router.push('/videos')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h1 className="text-2xl mb-4">Upload d'une vidéo</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="border p-2"
          placeholder="Titre"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <textarea
          className="border p-2"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {tags.map(tag => (
              <span key={tag} style={{ background: '#eee', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
                {tag}
                <button type="button" onClick={() => removeTag(tag)} style={{ marginLeft: '4px' }}>x</button>
              </span>
            ))}
            <input
              className="border p-2 flex-1"
              placeholder="Tags"
              value={tagInput}
              onChange={e => {
                const value = e.target.value
                setTagInput(value)
                if (value.startsWith('/')) {
                  const query = value.slice(1).toLowerCase()
                  setSuggestions(existingThemes.filter(t => t.toLowerCase().startsWith(query)))
                } else {
                  setSuggestions([])
                }
              }}
              onKeyDown={handleTagKeyDown}
              style={{ flex: 1, minWidth: '120px' }}
            />
          </div>
          {suggestions.length > 0 && (
            <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ccc', zIndex: 10 }}>
              {suggestions.map(s => (
                <li key={s} style={{ padding: '4px 8px', cursor: 'pointer' }} onClick={() => {
                  if (!tags.includes(s)) setTags([...tags, s])
                  if (!existingThemes.includes(s)) setExistingThemes([...existingThemes, s])
                  setTagInput('')
                  setSuggestions([])
                }}>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div {...getRootProps()} className="border-dashed border-2 p-6 text-center">
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Déposez la vidéo ici...</p>
          ) : (
            <p>Glissez-déposez un fichier vidéo, ou cliquez pour sélectionner</p>
          )}
          {file && <p className="mt-2">Fichier sélectionné : {file.name}</p>}
        </div>

        <div className="text-center my-2">-- OU --</div>

        <input
          className="border p-2"
          type="url"
          placeholder="Lien YouTube"
          value={youtubeUrl}
          onChange={e => setYoutubeUrl(e.target.value)}
        />

        {error && <p className="text-red-500">{error}</p>}
        <button className="bg-green-600 text-white py-2 rounded-lg">Publier</button>
      </form>
    </div>
  )
}
