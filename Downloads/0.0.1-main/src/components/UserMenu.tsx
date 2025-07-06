import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import styles from './Layout.module.css'

export const UserMenu = () => {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    })()
  }, [])

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('click', handle)
    return () => document.removeEventListener('click', handle)
  }, [open])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Utilisateur'
  // Generate initials based on username or email
  const getInitials = () => {
    if (user?.user_metadata?.username) {
      return user.user_metadata.username.slice(0, 2).toUpperCase()
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return 'JD'
  }
  const initials = getInitials()
  return (
    <div className="user-menu-container" ref={containerRef}>
      <img 
        src={`https://placehold.co/36x36/4A4A4A/FFFFFF?text=${initials}`}
        alt="Profil utilisateur"
        className={styles.userProfileImg}
        onClick={() => setOpen(!open)}
        onError={e => {
          const target = e.currentTarget
          target.onerror = null
          target.src = 'https://placehold.co/36x36/4A4A4A/FFFFFF?text=JD'
        }}
        
      />
      {open && (
        <div className="user-menu">
          <div className="user-menu-header">
            <p className="user-name">{username}</p>
            <p className="user-email">{user?.email}</p>
          </div>
          <Link href="/cgu" className="user-menu-item">CGU</Link>
          <button onClick={handleLogout} className="user-menu-item">Se déconnecter</button>
        </div>
      )}
      <style jsx>{`
        .user-menu-container {
          position: relative;
          max-height: 36px;
        }
        .user-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          background: #212121;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 0.5rem;
          width: 12rem;
          z-index: 20;
        }
        .user-menu-header {
          border-bottom: 1px solid #333;
          margin-bottom: 0.5rem;
          padding-bottom: 0.25rem;
        }
        .user-name {
          font-weight: 500;
        }
        .user-email {
          font-size: 0.875rem;
          color: #bbb;
        }
        .user-menu-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 0.25rem 0;
          color: #fff;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .user-menu-item:hover {
          background: #333;
        }
      `}</style>
    </div>
  )
}
