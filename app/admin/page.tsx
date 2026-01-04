"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import UserAvatar from "@/components/ui/UserAvatar";
import { toast } from "@/components/ui/Toast/toast-utils";
import { useAuth } from "@/context/AuthContext";
import {
  adminListUsers,
  adminUpdateBan,
  adminUpdateRole,
  type AdminUser,
  type AdminUsersResponse,
} from "@/lib/admin";
import { cn } from "@/lib/utils";

type LoadState = "idle" | "loading" | "ready" | "error";
type BanFilter = "all" | "unbanned" | "banned";

const roleOptions = ["user", "moderator", "admin"] as const;
const roleLabels = {
  user: "User",
  moderator: "Moderator",
  admin: "Admin",
} as const;

export default function AdminPage() {
  const router = useRouter();
  const { user: me, isLoading } = useAuth();
  const isAdmin = me?.role === "admin";

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [banFilter, setBanFilter] = useState<BanFilter>("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] =
    useState<AdminUsersResponse["pagination"] | null>(null);
  const [roleUpdatingIds, setRoleUpdatingIds] = useState<Set<string>>(
    () => new Set()
  );
  const [banUpdatingIds, setBanUpdatingIds] = useState<Set<string>>(
    () => new Set()
  );

  const requestSeq = useRef(0);
  const pageSize = 20;

  useEffect(() => {
    if (!isLoading && !me) {
      router.replace(`/login?callbackUrl=/admin`);
    }
  }, [me, isLoading, router]);

  useEffect(() => {
    const seq = ++requestSeq.current;

    if (!me || !isAdmin) return;

    const run = async () => {
      setState("loading");
      setError(null);

      try {
        const res = await adminListUsers({
          search: searchTerm.trim() || undefined,
          isBanned:
            banFilter === "all" ? undefined : banFilter === "banned" ? "true" : "false",
          page,
          limit: pageSize,
        });

        if (requestSeq.current !== seq) return;

        setUsers(res.data?.users ?? []);
        setPagination(res.data?.pagination ?? null);
        setState("ready");
      } catch (err) {
        if (requestSeq.current !== seq) return;

        setState("error");
        setError(err instanceof Error ? err.message : "Failed to load users.");
        setUsers([]);
        setPagination(null);
      }
    };

    run();
  }, [me, isAdmin, searchTerm, banFilter, page, pageSize]);

  const updateUser = (updatedUser: AdminUser) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  const handleRoleChange = async (userId: string, nextRole: AdminUser["role"]) => {
    if (roleUpdatingIds.has(userId)) return;
    const previousUser = users.find((user) => user.id === userId);
    if (!previousUser || previousUser.role === nextRole) return;

    setRoleUpdatingIds((prev) => new Set(prev).add(userId));
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, role: nextRole } : user
      )
    );

    try {
      const res = await adminUpdateRole(userId, nextRole);
      updateUser(res.data.user);
      toast.success("Role updated.");
    } catch {
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? previousUser : user))
      );
      toast.error("Failed to update role.");
    } finally {
      setRoleUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleToggleBan = async (targetUser: AdminUser) => {
    if (banUpdatingIds.has(targetUser.id)) return;

    const nextIsBanned = !targetUser.isBanned;
    const actionLabel = nextIsBanned ? "ban" : "unban";

    if (
      !confirm(
        `Are you sure you want to ${actionLabel} ${targetUser.username}?`
      )
    ) {
      return;
    }

    setBanUpdatingIds((prev) => new Set(prev).add(targetUser.id));

    try {
      const res = await adminUpdateBan(targetUser.id, nextIsBanned);
      const updatedUser = res.data.user;

      setUsers((prev) => {
        const next = prev.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        );

        if (banFilter === "unbanned" && updatedUser.isBanned) {
          return next.filter((user) => user.id !== updatedUser.id);
        }
        if (banFilter === "banned" && !updatedUser.isBanned) {
          return next.filter((user) => user.id !== updatedUser.id);
        }

        return next;
      });

      toast.success(
        nextIsBanned ? "User banned successfully." : "User unbanned."
      );
    } catch {
      toast.error("Failed to update ban status.");
    } finally {
      setBanUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(targetUser.id);
        return next;
      });
    }
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setPage(1);
  };

  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? page;
  const totalItems = pagination?.totalItems ?? users.length;

  if (!isLoading && me && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Not allowed</h1>
        <p className="text-text mb-6">
          You don&apos;t have permission to access admin tools.
        </p>
        <Button variant="secondary" onClick={() => router.push("/explore")}>
          Back to Explore
        </Button>
      </div>
    );
  }

  if (!me || state === "idle" || state === "loading") {
    return (
      <div className="h-[calc(100vh-5rem)] w-full grid place-items-center">
        <Spinner className="size-12" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl mb-4">Error</h2>
        <p className="text-text">{error || "Failed to load users."}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Pannel</h1>
          <p className="text-text-amount">
            {totalItems} {totalItems === 1 ? "user" : "users"}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="mt-6 grid gap-3 md:grid-cols-[2fr_1fr_auto] md:items-end"
      >
        <div className="space-y-2">
          <label htmlFor="admin-search" className="text-sm text-text-amount">
            Search
          </label>
          <Input
            id="admin-search"
            placeholder="Search by username or email"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="ban-filter" className="text-sm text-text-amount">
            Ban status
          </label>
          <select
            id="ban-filter"
            value={banFilter}
            onChange={(event) => {
              setBanFilter(event.target.value as BanFilter);
              setPage(1);
            }}
            className={cn(
              "w-full rounded-md px-3 py-2 md:text-sm transition-colors duration-200 ease-in-out",
              "bg-container border border-border text-text",
              "focus:outline-none focus:border-accent"
            )}
          >
            <option value="all">All users</option>
            <option value="unbanned">Not banned</option>
            <option value="banned">Banned only</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button type="submit" variant="secondary" className="px-5 py-2 rounded-md">Search</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClearSearch}
            className="text-text px-5 py-1.5"
          >
            Clear
          </Button>
        </div>
      </form>

      <div className="mt-8 grid gap-4">
        {users.length === 0 ? (
          <div className="rounded-xl border border-border bg-container p-6 text-center text-text-amount">
            No users found.
          </div>
        ) : (
          users.map((user) => {
            const displayName = user.displayName || user.username;
            const isRoleUpdating = roleUpdatingIds.has(user.id);
            const isBanUpdating = banUpdatingIds.has(user.id);

            return (
              <div
                key={user.id}
                role="button"
                tabIndex={0}
                aria-label={`Open ${user.username}'s channel.`}
                onClick={() => router.push(`/channel/${user.username}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`/channel/${user.username}`);
                  }
                }}
                className="rounded-xl border border-border bg-container p-4 cursor-pointer transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <UserAvatar
                      user={{
                        id: user.id,
                        username: user.username,
                        displayName: user.displayName,
                      }}
                      size={48}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold break-all">
                          {displayName}
                        </h2>
                       <span className="text-xs text-text-amount break-all">
                          @{user.username}
                        </span>
                      </div>
                      <p className="text-sm text-text-amount break-all">{user.email}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5",
                            user.isVerified
                              ? "bg-blue-500/10 text-blue-300"
                              : "bg-white/10 text-text-amount"
                          )}
                        >
                          {user.isVerified ? "Verified" : "Unverified"}
                        </span>
                        {user.isBanned && (
                          <span className="rounded-full px-2 py-0.5 bg-red-500/10 text-red-300">
                            Banned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex flex-col gap-3 sm:flex-row sm:items-end"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <div className="space-y-2 min-w-42.5">
                      <label
                        htmlFor={`role-${user.id}`}
                        className="text-xs uppercase tracking-wide text-text-amount"
                      >
                        Role
                      </label>
                      <select
                        id={`role-${user.id}`}
                        value={user.role}
                        onChange={(event) =>
                          handleRoleChange(
                            user.id,
                            event.target.value as AdminUser["role"]
                          )
                        }
                        disabled={isRoleUpdating}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                        className={cn(
                          "w-full rounded-md px-3 py-2 md:text-sm transition-colors duration-200 ease-in-out",
                          "bg-container border border-border text-text",
                          "focus:outline-none focus:border-accent",
                          "disabled:opacity-60 disabled:cursor-not-allowed"
                        )}
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {roleLabels[role]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      disabled={isBanUpdating}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleToggleBan(user);
                      }}
                      onKeyDown={(event) => event.stopPropagation()}
                      className={cn(
                        "border",
                        user.isBanned
                          ? "border-green-500/40 text-green-300 hover:bg-green-500/10"
                          : "border-red-500/40 text-red-300 hover:bg-red-500/10",
                        "disabled:opacity-60 disabled:cursor-not-allowed px-5 py-1.5"
                      )}
                    >
                      {user.isBanned ? "Unban" : "Ban"}
                    </Button>
                  </div>
                </div>
                <div className="mt-3 text-sm text-text-amount">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </div>

                {user.isBanned && user.banReasonPublic ? (
                  <div className="mt-2 text-sm text-red-300">
                    Ban reason: {user.banReasonPublic}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-amount">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex gap-2 justify-center">
          <Button
            type="button"
            variant="ghost"
            className="text-text px-5 py-2"
            disabled={currentPage <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-text px-5 py-2"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
