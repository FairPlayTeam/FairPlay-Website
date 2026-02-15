"use client";

import { useState, useEffect } from "react";
import { followUser, unfollowUser } from "@/lib/users";
import { cn } from "@/lib/utils";

type FollowButtonProps = {
  username: string;
  initialFollowing?: boolean;
  onChangeCount?: (delta: number) => void;
};

export function FollowButton({
  username,
  initialFollowing = false,
  onChangeCount,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(false);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    setFollowing(!!initialFollowing);
  }, [initialFollowing]);

  async function onClick() {
    if (acting) return;
    setActing(true);

    const next = !following;
    setFollowing(next);
    onChangeCount?.(next ? 1 : -1);

    try {
      if (next) {
        await followUser(username);
      } else {
        await unfollowUser(username);
      }
    } catch {
      setFollowing(!next);
      onChangeCount?.(next ? -1 : 1);
    } finally {
      setActing(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={acting}
      className={cn(
        acting ? "cursor-not-allowed" : "cursor-pointer",
        "text-[15px] px-4 py-2 sm:px-6 sm:py-2.5",
        "rounded-full",
        following ? "bg-(--gray-500)" : "bg-white"
      )}
    >
      <span
        className={cn(following ? "text-text" : "text-black", "font-semibold")}
      >
        {following ? "Subscribed" : "Subscribe"}
      </span>
    </button>
  );
}
