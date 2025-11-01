'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Pfp } from '@/app/components/ui/pfp';
import { SearchInput } from '@/app/components/ui/SearchInput';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { getFollowers, getFollowing, type SimpleUser } from '@/services/users';

export default function PeopleModal() {
  const router = useRouter();
  const params = useSearchParams();
  const u = params.get('u');
  const type = params.get('type') as 'followers' | 'following' | null;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SimpleUser[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!u || !type) return;
    const fn = type === 'followers' ? getFollowers : getFollowing;

    fn(String(u), 1, 50)
      .then((res) => {
        if (!mounted) return;
        setItems((res as any)[type] as SimpleUser[]);
      })
      .catch((e) => mounted && setError(e?.message || 'Échec du chargement.'))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [u, type]);

  const filtered =
    query.trim().length > 0
      ? items.filter(
          (user) =>
            user.username.toLowerCase().includes(query.toLowerCase()) ||
            (user.displayName || '').toLowerCase().includes(query.toLowerCase())
        )
      : items;

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
      }}
    >
      <div
        className="p-3 border-b"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-container-dark)',
        }}
      >
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder={`Search ${type === 'followers' ? 'followers' : 'following'}`}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div
              className="animate-spin rounded-full h-6 w-6 border-2"
              style={{
                borderColor: 'var(--color-accent-dark)',
                borderTopColor: 'transparent',
              }}
            />
          </div>
        ) : error ? (
          <p
            className="text-center"
            style={{ color: 'var(--color-text-para)' }}
          >
            {error}
          </p>
        ) : filtered.length === 0 ? (
          <EmptyState
            message={query ? 'No matches found.' : 'No users found.'}
          />
        ) : (
          <ul className="space-y-2">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-lg p-2 cursor-pointer transition"
                style={{
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-container)',
                }}
                onClick={() => router.push(`/user/${item.username}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-dark)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-container)';
                }}
              >
                <div
                  className="w-11 h-11 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--gray-200)' }}
                >
                  <Pfp idOrUsername={item.username} size={44} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p
                    className="font-medium truncate"
                    style={{ color: 'var(--color-text-bold)' }}
                  >
                    {item.displayName || item.username}
                  </p>
                  <p
                    className="text-sm truncate"
                    style={{ color: 'var(--color-text-footer)' }}
                  >
                    @{item.username}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}