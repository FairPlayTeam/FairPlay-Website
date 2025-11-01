'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, profile } from '@/services/auth';
import { useAuth } from '@/context/auth';
import Button from "../components/ui/Button";

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    profile
      .me()
      .then(() => mounted && router.replace('/'))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [router]);

  async function onSubmit() {
    if (!emailOrUsername || !password) {
      setError('Fill all fields');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await auth.login({ emailOrUsername, password });
      setUser(res.user);
      router.replace('/');
    } catch (e: any) {
      setError(e?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-(--color-background) py-10">
      <div className="w-full max-w-md bg-(--color-container-dark) rounded-xl shadow-lg p-8 backdrop-blur-md border border-(--color-border) space-y-5">
        <h1 className="text-3xl font-semibold text-center text-(--color-accent) mb-6">
          Login
        </h1>

        {error && <p className="text-pink-500 text-center">{error}</p>}

        <div className="flex flex-col gap-4">
          <input
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            placeholder="Email or username"
            type="text"
            className="w-full bg-(--gray-700-transparent) border border-(--color-border) rounded-lg px-4 py-3 text-(--color-text) placeholder-(--gray-300) focus:outline-none focus:ring-2 focus:ring-(--blue-400) transition"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full bg-(--gray-700-transparent) border border-(--color-border) rounded-lg px-4 py-3 text-(--color-text) placeholder-(--gray-300) focus:outline-none focus:ring-2 focus:ring-(--blue-400) transition"
          />
        </div>

        <Button onClick={onSubmit} variant="secondary">{loading ? 'Loading...' : 'Continue'}</Button>
        
        <button
          onClick={() => router.push('/register')}
          className="w-full cursor-pointer text-sm text-(--gray-200) mt-4 hover:text-(--blue-400) transition"
        >
          Create account
        </button>
      </div>
    </div>
  );
}