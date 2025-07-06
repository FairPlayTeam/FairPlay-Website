"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { UploadModal } from '@/components/UploadModal'
import { HomeIcon, SubscriptionsIcon, UserIcon } from '@/components/icons'

export default function HomePage() {
  const [showUploadModal, setShowUploadModal] = useState(false)
  return (
    <Layout active="home" onCreateClick={() => setShowUploadModal(true)}>
      <section className="home-content-section custom-scrollbar">
        <h1 className="hero-title">Libérez-vous de l'emprise des réseaux sociaux.</h1>
        <p className="hero-subtitle">
          Profitez de vidéos et de contenus captivants, gratuitement, pour toujours.
          Pas d'algorithmes intrusifs, pas de publicités, juste du contenu pertinent.
        </p>
        <Link href="/videos" className="call-to-action-button">Commencer à explorer</Link>
        <div className="features-section">
          <div className="feature-card">
            <HomeIcon className="feature-icon" />
            <h3 className="feature-title">Expérience sans distraction</h3>
            <p className="feature-description">
              Conçu pour vous offrir une expérience de visionnage pure, sans les distractions habituelles des réseaux sociaux.
            </p>
          </div>
          <div className="feature-card">
            <SubscriptionsIcon className="feature-icon" />
            <h3 className="feature-title">Contenu sélectionné</h3>
            <p className="feature-description">
              Découvrez des vidéos de qualité sélectionnées avec soin, loin du bruit et de la désinformation.
            </p>
          </div>
          <div className="feature-card">
            <UserIcon className="feature-icon" />
            <h3 className="feature-title">Confidentialité Respectée</h3>
            <p className="feature-description">
              Vos données personnelles ne sont jamais collectées ni partagées. Votre vie privée est notre priorité.
            </p>
          </div>
        </div>
    </section>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        html, body { margin: 0; font-family: 'Roboto', sans-serif; height: 100%; overflow: hidden; }
        #__next { height: 100%; } /* S'assurer que le conteneur Next.js prend toute la hauteur */
      `}</style>
      <style jsx>{`
        .home-content-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          background: #1a1a1a;
          overflow-y: auto;
          gap: 2rem;
        }
        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 1rem;
        }
        .hero-subtitle {
          font-size: 1.5rem;
          color: #ccc;
          margin-bottom: 2rem;
          max-width: 800px;
        }
        .call-to-action-button {
          background-color: #ff0000;
          color: #fff;
          padding: 1rem 2rem;
          border-radius: 9999px;
          text-decoration: none;
          font-size: 1.2rem;
          font-weight: bold;
          transition: background-color 0.3s ease;
        }
        .call-to-action-button:hover { background-color: #cc0000; }
        .features-section {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 2rem;
          margin-top: 3rem;
          max-width: 1000px;
        }
        .feature-card {
          background-color: #222;
          padding: 1.5rem;
          border-radius: 12px;
          text-align: left;
          width: 300px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          transition: transform 0.2s ease;
        }
        .feature-card:hover { transform: translateY(-5px); }
        .feature-icon {
          width: 48px;
          height: 48px;
          margin-bottom: 1rem;
          color: #ff0000;
        }
        .feature-title {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .feature-description {
          font-size: 1rem;
          color: #aaa;
        }
      `}</style>
    {showUploadModal && (
      <UploadModal onClose={() => setShowUploadModal(false)} onUploadSuccess={() => setShowUploadModal(false)} />
    )}
    </Layout>
  )
}
