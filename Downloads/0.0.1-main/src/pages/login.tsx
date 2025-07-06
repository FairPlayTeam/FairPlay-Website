import React, { useState } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../components/Layout.module.css';
import {
  SearchIcon,
  PlusCircleIcon,
  BellIcon,
  MenuIcon,
} from '../components/icons';
import { UserMenu } from '../components/UserMenu';

export default function Auth() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // register state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPfpFile, setRegisterPfpFile] = useState<File | null>(null);
  const [registerPfpFileName, setRegisterPfpFileName] = useState('Aucun fichier choisi');
  const [registerError, setRegisterError] = useState('');

  const router = useRouter();

  // State for the sidebar collapse, matching Layout.tsx
  const [collapsed, setCollapsed] = useState(false);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) {
      setLoginError(error.message);
    } else {
      router.push('/');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Les mots de passe ne correspondent pas.');
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email: registerEmail,
      password: registerPassword,
      options: {
        data: { username: registerUsername }
      }
    });
    if (error) {
      setRegisterError(error.message);
      return;
    }

    // pfp upload : not implemented yet
    if (registerPfpFile && data.user) {
      const fileExt = registerPfpFile.name.split('.').pop();
      const fileName = `${data.user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, registerPfpFile);
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      }
    }

    router.push('/profile');
  };

  return (
    <>
      <Head>
        <title>Login OpenStream</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
      </Head>

      {/* Replaced the existing header with the structure from Layout.tsx */}
      <header className={styles.header}>
        <div className={styles.logoSection}>
          {/* Add a button for toggling the sidebar, similar to Layout.tsx */}
          <button className={styles.menuButton} onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
            <MenuIcon />
          </button>
          <Link href="/" className={styles.logoSection} >
            <img
              src="/horitontal_tree_adapted.png"
              alt="OpenStream Logo"
              className={styles.logoImg}
              onError={e => { const t = e.currentTarget; t.onerror = null; t.src = 'https://placehold.co/32x32/FF0000/FFFFFF?text=OS' }}
            />
          </Link>
        </div>
        <div className={styles.searchBarContainer}>
          <input type="text" placeholder="Rechercher..." className="Layout_searchInput__F3Qmq" />
          <button className={styles.searchButton} aria-label="Search">
            <SearchIcon />
          </button>
        </div>
        <div className="Layout_rightIcons__8R_ss">
          <button className={styles.iconButton} aria-label="Create video">
            <PlusCircleIcon />
          </button>
          <button className={styles.iconButton} aria-label="Notifications">
            <BellIcon />
          </button>
          <UserMenu />
        </div>
      </header>

      <main className="auth-container">
        <div className="auth-card">
          <div className="auth-tabs">
            <div className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => { setActiveTab('login'); setLoginError(''); setRegisterError(''); }} >
              Connexion
            </div>
            <div className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`} onClick={() => { setActiveTab('register'); setLoginError(''); setRegisterError(''); }} >
              Inscription
            </div>
          </div>
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <i className="fas fa-envelope"></i>
                <input type="email" placeholder="Adresse email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <i className="fas fa-lock"></i>
                <input type="password" placeholder="Mot de passe" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
              </div>
              {loginError && <p className="error-message">{loginError}</p>}
              <button type="submit" className="auth-button">Se connecter</button>
            </form>
          )}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <i className="fas fa-envelope"></i>
                <input type="email" placeholder="Adresse email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <i className="fas fa-user"></i>
                <input type="text" placeholder="Nom d'utilisateur" value={registerUsername} onChange={(e) => setRegisterUsername(e.target.value)} required />
              </div>
              <div className="form-group">
                <i className="fas fa-lock"></i>
                <input type="password" placeholder="Mot de passe" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <i className="fas fa-lock"></i>
                <input type="password" placeholder="Confirmer le mot de passe" value={registerConfirmPassword} onChange={(e) => setRegisterConfirmPassword(e.target.value)} required />
              </div>
              <div className="form-group file-upload-group">
                <label htmlFor="pfp-upload" className="custom-file-upload">
                  <i className="fas fa-cloud-upload-alt"></i> Choisir une photo de profil
                </label>
                <input
                  id="pfp-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setRegisterPfpFile(e.target.files[0]);
                      setRegisterPfpFileName(e.target.files[0].name);
                    } else {
                      setRegisterPfpFile(null);
                      setRegisterPfpFileName('Aucun fichier choisi');
                    }
                  }}
                />
                <span className="file-name">{registerPfpFileName}</span>
              </div>
              {registerError && <p className="error-message">{registerError}</p>}
              <button type="submit" className="auth-button">S'inscrire</button>
            </form>
          )}
        </div>
      </main>

      <footer>
        <p>&copy; 2023 OpenStream. Tous droits réservés.</p>
      </footer>

      <style jsx global>{`:root {
            --background-color: #0f0f0f; /* Un noir plus profond */
            --card-background: #181818; /* Un gris très foncé */
            --text-color: #ffffff;
            --accent-color: #3dda50; /* Vert accentué */
            --border-color: #383838; /* Bordures subtiles */
            --subtle-text: #9e9e9e; /* Texte secondaire renforcé */
            --hover-card: #2a2a2a;
            --danger-color: #dc3545;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--background-color);
            color: var(--text-color);
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }

        header {
            background-color: var(--card-background);
            padding: 0.8rem 2rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 1.6rem;
            font-weight: 700;
            color: var(--accent-color);
            text-decoration: none;
        }

        .logo img {
            height: 40px;
            width: auto;
            vertical-align: middle;
        }

        nav {
            display: flex;
            gap: 1.5rem;
        }

        nav a {
            color: var(--subtle-text);
            text-decoration: none;
            font-weight: 500;
            padding: 0.5rem 0;
            transition: color 0.3s ease, border-bottom 0.3s ease;
            border-bottom: 2px solid transparent;
        }

        nav a:hover,
        nav a.active {
            color: var(--text-color);
            border-bottom: 2px solid var(--accent-color);
        }

        .auth-container {
            flex-grow: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2rem;
            min-height: calc(100vh - 120px);
        }

        .auth-card {
            background-color: var(--card-background);
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            padding: 2.5rem;
            width: 100%;
            max-width: 450px;
            text-align: center;
            border: 1px solid var(--border-color);
        }

        .auth-tabs {
            display: flex;
            margin-bottom: 2rem;
            border-bottom: 1px solid var(--border-color);
        }

        .auth-tab {
            flex: 1;
            padding: 1rem 0;
            cursor: pointer;
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--subtle-text);
            border-bottom: 3px solid transparent;
            transition: color 0.3s ease, border-bottom-color 0.3s ease;
        }

        .auth-tab.active {
            color: var(--text-color);
            border-bottom-color: var(--accent-color);
        }

        .auth-form {
            display: flex;
            flex-direction: column;
            gap: 1.2rem;
        }

        .form-group {
            position: relative;
            margin-bottom: 0.5rem;
        }

        .form-group i {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--subtle-text);
            font-size: 1rem;
            z-index: 1;
        }

        .auth-form input[type="email"],
        .auth-form input[type="password"],
        .auth-form input[type="text"] {
            width: 100%;
            padding: 1rem 1rem 1rem 45px;
            background-color: var(--hover-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-color);
            font-size: 1rem;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .auth-form input[type="email"]:focus,
        .auth-form input[type="password"]:focus,
        .auth-form input[type="text"]:focus {
            border-color: var(--accent-color);
            box-shadow: 0 0 0 3px rgba(61, 220, 80, 0.2);
            outline: none;
        }

        .auth-form input::placeholder {
            color: var(--subtle-text);
            opacity: 0.8;
        }

        .file-upload-group {
            margin-top: 1rem;
            text-align: left;
            position: relative;
        }

        .file-upload-group label {
            display: block;
            font-size: 0.95rem;
            font-weight: 500;
            color: var(--text-color);
            margin-bottom: 0.5rem;
        }

        .auth-form input[type="file"] {
            display: none; /* Cache l'input par défaut */
        }

        .custom-file-upload {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--hover-card);
            color: var(--subtle-text);
            padding: 0.8rem 1.2rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
            gap: 10px;
            width: 100%;
        }

        .custom-file-upload:hover {
            background-color: #3a3a3a;
            border-color: var(--accent-color);
            color: var(--text-color);
        }

        .custom-file-upload i {
            position: static;
            transform: none;
            color: var(--accent-color);
        }
        .file-name-display {
            font-size: 0.85rem;
            color: var(--subtle-text);
            margin-top: 0.5rem;
            text-align: center;
            display: block;
        }

        .auth-form button[type="submit"] {
            background-color: var(--accent-color);
            color: white;
            padding: 1rem;
            border: none;
            border-radius: 25px;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            transition: background-color 0.2s ease, transform 0.1s ease;
            margin-top: 1.5rem;
            width: 100%;
        }

        .auth-form button[type="submit"]:hover {
            background-color: #2e9f41;
            transform: translateY(-2px);
        }

        .forgot-password {
            font-size: 0.9rem;
            color: var(--subtle-text);
            text-decoration: none;
            margin-top: -0.5rem;
            display: block;
            transition: color 0.2s ease;
        }
        .forgot-password:hover {
            color: var(--text-color);
        }

        .hidden-form {
            display: none;
        }

        footer {
            background-color: var(--card-background);
            color: var(--subtle-text);
            text-align: center;
            padding: 1.2rem;
            margin-top: auto;
            border-top: 1px solid var(--border-color);
            font-size: 0.85rem;
        }

        @media (max-width: 768px) {
            header {
                flex-direction: column;
                padding: 0.8rem 1rem;
            }
            nav {
                margin-top: 0.8rem;
                gap: 1rem;
            }
            .auth-container {
                padding: 1rem;
            }
            .auth-card {
                padding: 1.5rem;
                border-radius: 8px;
            }
            .auth-tabs {
                margin-bottom: 1.5rem;
            }
            .auth-tab {
                font-size: 1rem;
                padding: 0.8rem 0;
            }
            .auth-form input, .custom-file-upload, .auth-form button {
                font-size: 0.95rem;
            }
            .auth-form input[type="email"],
            .auth-form input[type="password"],
            .auth-form input[type="text"] {
                padding-left: 40px;
            }
            .form-group i {
                left: 12px;
            }
            .custom-file-upload {
                padding: 0.7rem 1rem;
            }
            .auth-form button[type="submit"] {
                padding: 0.9rem;
            }
        }
        `}
</style>
    </>
  );
}
