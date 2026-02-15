"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import UserAvatar from "@/components/ui/UserAvatar";
import Link from "next/link";
import { getFollowers, getFollowing, type SimpleUser } from "@/lib/users";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

interface UserListModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
    type: "followers" | "following";
}

const PAGE_SIZE = 20;

export default function UserListModal({
    isOpen,
    onClose,
    username,
    type,
}: UserListModalProps) {
    const [users, setUsers] = useState<SimpleUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const requestSeq = useRef(0);

    const fetchUsers = useCallback(
        async (pageNum: number, isInitial = false) => {
            if (!username) return;

            const seq = ++requestSeq.current;
            setLoading(true);
            setError(null);

            try {
                const fetchFn = type === "followers" ? getFollowers : getFollowing;
                const res = await fetchFn(username, pageNum, PAGE_SIZE);

                if (requestSeq.current !== seq) return;

                const data = res.data;
                const newUsers = (type === "followers"
                    ? (data as any).followers
                    : (data as any).following) || [];
                const pagination = data.pagination;

                setUsers((prev) => (isInitial ? newUsers : [...prev, ...newUsers]));
                setHasMore(pagination.page < pagination.totalPages);
                setPage(pagination.page);
            } catch (err) {
                if (requestSeq.current !== seq) return;
                setError("Failed to load users");
                console.error(err);
            } finally {
                if (requestSeq.current !== seq) return;
                setLoading(false);
            }
        },
        [username, type]
    );

    useEffect(() => {
        if (isOpen) {
            setUsers([]);
            setPage(1);
            setHasMore(true);
            fetchUsers(1, true);
        }
    }, [isOpen, fetchUsers]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            fetchUsers(page + 1);
        }
    }, [loading, hasMore, page, fetchUsers]);

    const sentinelRef = useInfiniteScroll({
        hasMore,
        isLoading: loading,
        onLoadMore: loadMore,
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={type === "followers" ? "Followers" : "Following"}
            showCloseButton
            className="max-w-md"
        >
            <div className="flex flex-col gap-2 min-h-[300px]">
                {users.length === 0 && !loading && !error && (
                    <div className="flex-1 flex flex-col items-center justify-center py-10 text-muted-foreground italic">
                        No {type} yet.
                    </div>
                )}

                <div className="flex flex-col">
                    {users.map((u) => (
                        <UserItem key={u.id} user={u} onClose={onClose} />
                    ))}
                </div>

                {loading && (
                    <div className="py-4 flex justify-center">
                        <Spinner className="size-8" />
                    </div>
                )}

                {error && (
                    <div className="py-4 text-center text-sm text-red-400">
                        {error}
                    </div>
                )}

                <div ref={sentinelRef} className="h-4" />
            </div>
        </Modal>
    );
}

function UserItem({ user, onClose }: { user: SimpleUser; onClose: () => void }) {
    return (
        <Link
            href={`/channel/${user.username}`}
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
        >
            <UserAvatar user={user} size={40} className="ring-2 ring-transparent group-hover:ring-accent/20 transition-all" />
            <div className="flex flex-col min-w-0">
                <span className="font-semibold text-text truncate group-hover:text-accent transition-colors">
                    {user.displayName || user.username}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                    @{user.username}
                </span>
            </div>
        </Link>
    );
}
