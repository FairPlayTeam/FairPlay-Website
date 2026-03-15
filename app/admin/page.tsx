'use client'

import { useEffect, useRef, useState, type ComponentProps, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Ban, UserCheck, Search, X } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import UserAvatar from '@/components/ui/user-avatar'
import { useAuth } from '@/context/auth-context'
import { buildAuthHref } from '@/lib/safe-redirect'
import {
  adminListUsers,
  adminUpdateBan,
  adminUpdateRole,
  type AdminViewUser,
  type AdminUsersResponse,
} from '@/lib/admin'
import { cn } from '@/lib/utils'

type LoadState = 'idle' | 'loading' | 'ready' | 'error'
type BanFilter = 'all' | 'unbanned' | 'banned'
const PAGE_SIZE = 20

const roleOptions = ['user', 'moderator', 'admin'] as const
const roleLabels: Record<AdminViewUser['role'], string> = {
  user: 'User',
  moderator: 'Moderator',
  admin: 'Admin',
}

type BadgeVariant = ComponentProps<typeof Badge>['variant']

const roleBadgeVariant = (role: AdminViewUser['role']): BadgeVariant => {
  if (role === 'admin') return 'destructive'
  if (role === 'moderator') return 'secondary'
  return 'outline'
}

export default function AdminPage() {
  const router = useRouter()
  const { user: me, isLoading } = useAuth()
  const isAdmin = me?.role === 'admin'

  const [users, setUsers] = useState<AdminViewUser[]>([])
  const [state, setState] = useState<LoadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [banFilter, setBanFilter] = useState<BanFilter>('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<AdminUsersResponse['pagination'] | null>(null)
  const [roleUpdatingIds, setRoleUpdatingIds] = useState<Set<string>>(() => new Set())
  const [banUpdatingIds, setBanUpdatingIds] = useState<Set<string>>(() => new Set())
  const [banTarget, setBanTarget] = useState<AdminViewUser | null>(null)

  const requestSeq = useRef(0)

  useEffect(() => {
    if (!isLoading && !me) {
      router.replace(buildAuthHref('/login', '/admin'))
    }
  }, [me, isLoading, router])

  useEffect(() => {
    const seq = ++requestSeq.current
    if (!me || !isAdmin) return

    const run = async () => {
      setState('loading')
      setError(null)

      try {
        const res = await adminListUsers({
          search: searchTerm.trim() || undefined,
          isBanned: banFilter === 'all' ? undefined : banFilter === 'banned' ? 'true' : 'false',
          page,
          limit: PAGE_SIZE,
        })

        if (requestSeq.current !== seq) return

        setUsers(res.data?.users ?? [])
        setPagination(res.data?.pagination ?? null)
        setState('ready')
      } catch (err) {
        if (requestSeq.current !== seq) return

        setState('error')
        setError(err instanceof Error ? err.message : 'Failed to load users.')
        setUsers([])
        setPagination(null)
      }
    }

    run()

    return () => {
      requestSeq.current += 1
    }
  }, [me, isAdmin, searchTerm, banFilter, page])

  const updateUser = (updatedUser: AdminViewUser) => {
    setUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
  }

  const handleRoleChange = async (userId: string, nextRole: AdminViewUser['role']) => {
    if (userId === me?.id) return
    if (roleUpdatingIds.has(userId)) return
    const previousUser = users.find((user) => user.id === userId)
    if (!previousUser || previousUser.role === nextRole) return

    setRoleUpdatingIds((prev) => new Set(prev).add(userId))
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, role: nextRole } : user)),
    )

    try {
      const res = await adminUpdateRole(userId, nextRole)
      updateUser(res.data.user)
      toast.success('Role updated.')
    } catch {
      setUsers((prev) => prev.map((user) => (user.id === userId ? previousUser : user)))
      toast.error('Failed to update role.')
    } finally {
      setRoleUpdatingIds((prev) => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    }
  }

  const handleToggleBan = async (targetUser: AdminViewUser) => {
    if (targetUser.id === me?.id) return
    if (banUpdatingIds.has(targetUser.id)) return
    const nextIsBanned = !targetUser.isBanned

    setBanUpdatingIds((prev) => new Set(prev).add(targetUser.id))

    try {
      const res = await adminUpdateBan(targetUser.id, nextIsBanned)
      const updatedUser = res.data.user

      setUsers((prev) => {
        const next = prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
        if (banFilter === 'unbanned' && updatedUser.isBanned)
          return next.filter((u) => u.id !== updatedUser.id)
        if (banFilter === 'banned' && !updatedUser.isBanned)
          return next.filter((u) => u.id !== updatedUser.id)
        return next
      })

      toast.success(nextIsBanned ? 'User banned successfully.' : 'User unbanned.')
    } catch {
      toast.error('Failed to update ban status.')
    } finally {
      setBanUpdatingIds((prev) => {
        const next = new Set(prev)
        next.delete(targetUser.id)
        return next
      })
    }
  }

  const handleOpenBanModal = (targetUser: AdminViewUser) => {
    if (banUpdatingIds.has(targetUser.id)) return
    setBanTarget(targetUser)
  }

  const handleConfirmBan = async () => {
    if (!banTarget) return
    const targetUser = banTarget
    setBanTarget(null)
    await handleToggleBan(targetUser)
  }

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPage(1)
    setSearchTerm(searchInput.trim())
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearchTerm('')
    setPage(1)
  }

  const totalPages = pagination?.totalPages ?? 1
  const currentPage = pagination?.page ?? page
  const totalItems = pagination?.totalItems ?? users.length

  if (!isLoading && me && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Not allowed</h1>
        <p className="text-muted-foreground mb-6">
          You don&apos;t have permission to access admin tools.
        </p>
        <Button variant="secondary" onClick={() => router.push('/explore')}>
          Back to Explore
        </Button>
      </div>
    )
  }

  if (!me || state === 'idle') {
    return (
      <div className="h-[calc(100vh-5rem)] w-full grid place-items-center">
        <Spinner className="size-18" />
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl mb-4">Error</h2>
        <p className="text-muted-foreground">{error || 'Failed to load users.'}</p>
      </div>
    )
  }

  return (
    <div className="container px-5 py-10 md:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-1.5">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">
            {totalItems} {totalItems === 1 ? 'user' : 'users'} found
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="border-b border-border pb-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-40">
              <label className="text-xs text-muted-foreground mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Username or email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-9 text-sm pl-9 w-full"
                />
              </div>
            </div>

            <div className="flex-1 min-w-32">
              <label className="text-xs text-muted-foreground mb-1 block">Ban status</label>
              <Select
                value={banFilter}
                onValueChange={(val) => {
                  setBanFilter(val as BanFilter)
                  setPage(1)
                }}
              >
                <SelectTrigger className="h-9 text-sm w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  <SelectItem value="unbanned">Not banned</SelectItem>
                  <SelectItem value="banned">Banned only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-1">
              <Button type="submit" size="sm" className="h-9 px-4 text-sm">
                Search
              </Button>
              {(searchInput || searchTerm) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleClearSearch}
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </form>

        <div className="mt-8">
          {state === 'loading' ? (
            <div className="h-64 grid place-items-center">
              <Spinner className="size-14" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-16">No users found.</p>
          ) : (
            <Accordion type="multiple" className="flex flex-col gap-3">
              {users.map((user) => {
                const displayName = user.displayName || user.username
                const isRoleUpdating = roleUpdatingIds.has(user.id)
                const isBanUpdating = banUpdatingIds.has(user.id)
                const isSelf = user.id === me?.id

                return (
                  <AccordionItem
                    key={user.id}
                    value={user.id}
                    className="rounded-xl border border-border bg-card overflow-hidden data-[state=open]:border-primary/40 transition-colors"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/40 transition-colors [&>svg]:text-muted-foreground group">
                      <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                        <UserAvatar
                          user={{
                            id: user.id,
                            username: user.username,
                            displayName: user.displayName,
                            avatarUrl: user.avatarUrl,
                          }}
                          size="lg"
                        />
                        <div className="min-w-0 flex-1 text-left">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-sm leading-tight">
                              {displayName}
                            </span>
                            <span className="text-xs text-muted-foreground">@{user.username}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <Badge
                              variant={roleBadgeVariant(user.role)}
                              className="text-xs py-0 px-1.5 h-4"
                            >
                              {roleLabels[user.role] ?? user.role}
                            </Badge>
                            {user.isBanned && (
                              <Badge variant="destructive" className="text-xs py-0 px-1.5 h-4">
                                Banned
                              </Badge>
                            )}
                            {user.isVerified && (
                              <Badge
                                variant="secondary"
                                className="text-xs py-0 px-1.5 h-4 bg-primary/10 text-primary border-primary/20"
                              >
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground hidden sm:block shrink-0">
                          Joined {new Date(user.createdAt).toLocaleDateString(undefined)}
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-4 pb-4">
                      <Separator className="mb-4" />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground w-24 shrink-0">Email</span>
                            <span className="break-all font-medium">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground w-24 shrink-0">Username</span>
                            <span className="font-medium">@{user.username}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground w-24 shrink-0">Display name</span>
                            <span className="font-medium">{user.displayName || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground w-24 shrink-0">Joined</span>
                            <span className="font-medium">
                              {new Date(user.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          {user.isBanned && user.banReasonPublic && (
                            <div className="flex items-start gap-2">
                              <span className="text-muted-foreground w-24 shrink-0">Ban reason</span>
                              <span className="text-destructive font-medium">
                                {user.banReasonPublic}
                              </span>
                            </div>
                          )}
                        </div>

                        <div
                          className="flex flex-col gap-3"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground block">Role</label>
                            <Select
                              value={user.role}
                              disabled={isRoleUpdating || isSelf}
                              onValueChange={(val) =>
                                handleRoleChange(user.id, val as AdminViewUser['role'])
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {roleOptions.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {roleLabels[role]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => router.push(`/channel/${user.username}`)}
                            >
                              View channel
                            </Button>
                            <Button
                              type="button"
                              variant={user.isBanned ? 'outline' : 'destructive'}
                              size="sm"
                              title={isSelf ? 'You cannot ban your own account.' : undefined}
                              className={cn(
                                'flex-1 gap-1.5',
                                user.isBanned &&
                                  'border-green-500/40 text-green-600 hover:bg-green-500/10 hover:text-green-600',
                              )}
                              disabled={isBanUpdating || isSelf}
                              onClick={() => handleOpenBanModal(user)}
                            >
                              {user.isBanned ? (
                                <>
                                  <UserCheck className="size-3.5" />
                                  Unban
                                </>
                              ) : (
                                <>
                                  <Ban className="size-3.5" />
                                  Ban
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={Boolean(banTarget)} onOpenChange={(open) => !open && setBanTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {banTarget?.isBanned ? 'Unban user?' : 'Ban user?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {banTarget
                ? `Are you sure you want to ${banTarget.isBanned ? 'unban' : 'ban'} ${banTarget.username}?`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setBanTarget(null)}>
              Cancel
            </Button>
            <Button
              variant={banTarget?.isBanned ? 'default' : 'destructive'}
              onClick={handleConfirmBan}
            >
              {banTarget?.isBanned ? 'Unban' : 'Ban'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}