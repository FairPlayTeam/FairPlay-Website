import React, { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase'
import { XIcon } from './icons'
import { parseThemes, extractYoutubeId } from '@/lib/utils'

interface UploadModalProps {
  onClose: () => void
  onUploadSuccess: () => void
}

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUploadSuccess }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [existingThemes, setExistingThemes] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [isUploading, setIsUploading] = useState(false)

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
    setYoutubeUrl('')
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'video/*': [] } })

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
    setError('')
    setIsUploading(true)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Utilisateur non authentifié')

      let videoData: any = { title, description, themes: tags, user_id: user.id }
      if (youtubeUrl) {
        const id = extractYoutubeId(youtubeUrl)
        if (!id) throw new Error('URL YouTube invalide')
        videoData = { ...videoData, type: 'youtube', youtube_id: id }
      } else if (file) {
        const fileName = `${Date.now()}_${file.name}`
        const { data, error: uploadError } = await supabase.storage.from('videos').upload(fileName, file)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(data.path)
        videoData = { ...videoData, type: 'native', url: publicUrl }
      } else {
        throw new Error('Fichier ou URL YouTube requis')
      }

      const { error: dbError } = await supabase.from('videos').insert([videoData])
      if (dbError) throw dbError

      onUploadSuccess()
      setTags([])
      setTagInput('')
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="text-xl font-bold">Ajouter une vidéo</h2>
          <button onClick={onClose} className="close-button" aria-label="Fermer">
            <XIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4" style={{ padding: '20px' }}>
          <input
            className="modal-input"
            placeholder="Titre"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <textarea
            className="modal-textarea"
            placeholder="Description (facultatif)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <div className="theme-input-wrapper" style={{ position: 'relative' }}>
            <div className="tag-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {tags.map(tag => (
                <span key={tag} className="tag" style={{ background: '#333', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} style={{ marginLeft: '4px', cursor: 'pointer' }}>
                    <XIcon width={12} height={12} />
                  </button>
                </span>
              ))}
              <input
                className="modal-input"
                style={{ flex: 1, minWidth: '120px' }}
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
              />
            </div>
            {suggestions.length > 0 && (
              <ul className="suggestions" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a1a1a', border: '1px solid #333', zIndex: 10 }}>
                {suggestions.map(s => (
                  <li
                    key={s}
                    style={{ padding: '4px 8px', cursor: 'pointer' }}
                    onClick={() => {
                      if (!tags.includes(s)) setTags([...tags, s])
                      if (!existingThemes.includes(s)) {
                        setExistingThemes([...existingThemes, s])
                      }
                      setTagInput('')
                      setSuggestions([])
                    }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Déposez la vidéo ici...</p>
            ) : (
              <p>Glissez-déposez un fichier vidéo, ou cliquez pour sélectionner</p>
            )}
            {file && <p className="mt-2 text-sm text-gray-400">Fichier sélectionné : {file.name}</p>}
          </div>

          <div className="separator">-- OU --</div>

          <input
            className="modal-input youtube-url-input"
            type="url"
            placeholder="URL YouTube"
            value={youtubeUrl}
            onChange={e => { setYoutubeUrl(e.target.value); setFile(null) }}
          />

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button type="submit" className="upload-button" disabled={isUploading}>
            {isUploading ? 'Publication...' : 'Publier'}
          </button>
        </form>
      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background-color: #0f0f0f;
          border-radius: 13px;
          width: 90%;
          max-width: 500px;
          color: #fff;
          overflow: hidden;
          border: 1px solid #333333;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background-color: #212121;
          border-bottom: 1px solid #333333;
        }
        .modal-header h2 {
          margin: 0;
          font-size: 18px;
          color: #fff;
          font-weight: 500;
        }
        .close-button {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
        }
        .close-button:hover {
          background-color: #333;
        }
        .modal-input,
        .modal-textarea {
          width: calc(100% - 24px);
          padding: 12px;
          background-color: #1a1a1a;
          border: 1px solid #3e3e3e;
          border-radius: 4px;
          color: #fff;
          margin-bottom: 8px;
        }
        .modal-textarea { min-height: 80px; resize: vertical; }
        .dropzone {
          border: 2px dashed #333333;
          border-radius: 4px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background-color 0.2s;
          background-color: #000;
          color: #ccc;
        }
        .dropzone:hover { border-color: #333333; background-color: #0a0a0a; }
        .separator {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 16px 0;
          color: #aaa;
          font-weight: bold;
        }
        .separator::before,
        .separator::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #333333;
          margin: 0 10px;
        }
        .youtube-url-input {
          background-color: #000;
          border: 1px solid #333333;
        }
        .upload-button {
          background-color: #0000FF;
          color: #fff;
          padding: 12px 20px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: background-color 0.2s;
        }
        .upload-button:hover { background-color: #0000CC; }
        .upload-button:disabled { background-color: #555; cursor: not-allowed; }
        .suggestions li:hover {
          background-color: #333;
        }
      `}</style>
    </div>
  )
}

