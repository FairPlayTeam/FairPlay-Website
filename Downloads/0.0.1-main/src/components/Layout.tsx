"use client"
import { useState } from 'react'
import Link from 'next/link'
import styles from './Layout.module.css'
import {
  HomeIcon,
  SubscriptionsIcon,
  HistoryIcon,
  PlaylistIcon,
  VideoIcon,
  WatchLaterIcon,
  DownloadIcon,
  MenuIcon,
  SearchIcon,
  PlusCircleIcon,
  BellIcon,
} from './icons'
import { UserMenu } from './UserMenu'

interface LayoutProps {
  children: React.ReactNode
  active?: 'home' | 'videos'
  onCreateClick?: () => void
}

export const Layout = ({ children, active = 'home', onCreateClick }: LayoutProps) => {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <button
            className={styles.menuButton}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Ouvrir la barre latérale" : "Fermer la barre latérale"}
            aria-expanded={!collapsed}
          >
            <MenuIcon />
          </button>
          <Link href="/" className={styles.logoSection}>
            <img
              src="/horitontal_tree_adapted.png"
              alt="OpenStream Logo"
              className={styles.logoImg}
              onError={e => { const t = e.currentTarget; t.onerror = null; t.src = 'https://placehold.co/32x32/FF0000/FFFFFF?text=OS' }}
            />
          </Link>
        </div>
        <div className={styles.searchBarContainer}>
          <input type="text" className={styles.searchInput} placeholder="Rechercher" />
          <button className={styles.searchButton}>
            <SearchIcon />
          </button>
        </div>
        <div className={styles.rightIcons}>
          <button className={styles.iconButton} onClick={onCreateClick}>
            <PlusCircleIcon /><span className={styles.srOnly}>Créer</span>
          </button>
          <button className={styles.iconButton}>
            <BellIcon /><span className={styles.srOnly}>Notifications</span>
          </button>
          <UserMenu />
        </div>
      </header>
      <main className={`${styles.mainContentContainer} custom-scrollbar`}>
        <aside className={`${styles.sidebar} ${collapsed ? styles.hidden : ''}`}>
          <nav className={styles.sidebarNav}>
            <ul>
              <li className={styles.sidebarListItem}>
                <button
                  onClick={() => (window.location.href = '/')}
                  className={`${styles.sidebarLink} ${active === 'home' ? styles.active : ''}`}
                >
                  <HomeIcon /> Accueil
                </button>
              </li>
              <li className={styles.sidebarListItem}>
                <button
                  onClick={() => (window.location.href = '/videos')}
                  className={`${styles.sidebarLink} ${active === 'videos' ? styles.active : ''}`}
                >
                  <SubscriptionsIcon /> Explorer
                </button>
              </li>
            </ul>
          </nav>
          <div className={styles.sidebarNav}>
            <h2 className={styles.sidebarHeading}>Vous</h2>
            <ul>
              <li className={styles.sidebarListItem}>
                <a href="#" className={styles.sidebarLink}>
                  <HistoryIcon /> Historique
                </a>
              </li>
              <li className={styles.sidebarListItem}>
                <a href="#" className={styles.sidebarLink}>
                  <PlaylistIcon /> Playlists
                </a>
              </li>
              <li className={styles.sidebarListItem}>
                <Link href="/videos" className={styles.sidebarLink}>
                  <VideoIcon /> Vos vidéos
                </Link>
              </li>
              <li className={styles.sidebarListItem}>
                <a href="#" className={styles.sidebarLink}>
                  <WatchLaterIcon /> À regarder plus tard
                </a>
              </li>
              <li className={styles.sidebarListItem}>
                <a href="#" className={styles.sidebarLink}>
                  <DownloadIcon /> Hors ligne
                </a>
              </li>
            </ul>
          </div>
        </aside>
        {children}
      </main>
    </div>
  )
}
