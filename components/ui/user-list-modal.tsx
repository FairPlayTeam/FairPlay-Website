'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Modal from '@/components/ui/modal'
import { Spinner } from '@/components/ui/spinner'
import UserAvatar from './user-avatar'
import Link from 'next/link'
import { getFollowers, getFollowing, type BaseUser } from '@/lib/users'
import useInfiniteScroll from '@/hooks/use-infinite-scroll'
import { cn } from '@/lib/utils'

interface UserListModalProps {
  isOpen: boolean
  onClose: () => void
  username: string
  type: 'followers' | 'following'
}

const PAGE_SIZE = 20

function mergeUniqueUsers(prev: BaseUser[], next: BaseUser[]) {
  if (next.length === 0) return prev
  const seen = new Set(prev.map((item) => item.id || item.username))
  const merged = [...prev]

  for (const item of next) {
    const key = item.id || item.username
    if (!seen.has(key)) {
      seen.add(key)
      merged.push(item)
    }
  }

  return merged
}

export default function UserListModal({ isOpen, onClose, username, type }: UserListModalProps) {
  const [users, setUsers] = useState<BaseUser[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const requestSeq = useRef(0)

  const fetchUsers = useCallback(
    async (pageNum: number, isInitial = false) => {
      if (!username) return

      const seq = ++requestSeq.current
      setLoading(true)
      setError(null)

      try {
        let newUsers: BaseUser[] = []
        let pagination: { page: number; totalPages: number } | undefined

        if (type === 'followers') {
          const res = await getFollowers(username, pageNum, PAGE_SIZE)
          if (requestSeq.current !== seq) return
          newUsers = res.data.followers ?? []
          pagination = res.data.pagination
        } else {
          const res = await getFollowing(username, pageNum, PAGE_SIZE)
          if (requestSeq.current !== seq) return
          newUsers = res.data.following ?? []
          pagination = res.data.pagination
        }

        setUsers((prev) => (isInitial ? newUsers : mergeUniqueUsers(prev, newUsers)))
        setHasMore((pagination?.page ?? 0) < (pagination?.totalPages ?? 0))
        setPage(pagination?.page ?? pageNum)
      } catch {
        if (requestSeq.current !== seq) return
        setError('Failed to load users.')
      } finally {
        if (requestSeq.current !== seq) return
        setLoading(false)
      }
    },
    [username, type],
  )

  useEffect(() => {
    if (!isOpen) {
      requestSeq.current += 1
      return
    }

    setUsers([])
    setPage(1)
    setHasMore(true)
    fetchUsers(1, true)
  }, [isOpen, fetchUsers])

  const loadMore = useCallback(() => {
    if (!isOpen || loading || !hasMore) return
    fetchUsers(page + 1)
  }, [isOpen, loading, hasMore, page, fetchUsers])

  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: loading,
    onLoadMore: loadMore,
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'followers' ? 'Followers' : 'Following'}
      showCloseButton
      className="max-w-md"
    >
      <div className="flex flex-col gap-2 min-h-[300px]">
        {users.length === 0 && !loading && !error && (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-muted-foreground italic">
            No {type} yet.
          </div>
        )}

        <ul className="flex flex-col" role="list">
          {users.map((u) => (
            <UserItem key={u.id} user={u} onClose={onClose} />
          ))}
        </ul>

        {loading && (
          <div className="py-4 flex justify-center">
            <Spinner className="size-10" />
          </div>
        )}

        {error && <div className="py-4 text-center text-sm text-destructive">{error}</div>}

        <div ref={sentinelRef} className="h-4" />
      </div>
    </Modal>
  )
}

function UserItem({ user, onClose }: { user: BaseUser; onClose: () => void }) {
  return (
    <li>
      <Link
        href={`/channel/${user.username}`}
        onClick={onClose}
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl transition-colors',
          'hover:bg-secondary group',
        )}
      >
        <UserAvatar
          user={user}
          size="lg"
          className="ring-2 ring-transparent group-hover:ring-accent/20 transition-all"
        />
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-foreground truncate">
            {user.displayName || user.username}
          </span>
          <span className="text-xs text-muted-foreground truncate">@{user.username}</span>
        </div>
      </Link>
    </li>
  )
}