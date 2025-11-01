"use client";

import { useState } from "react";
import { followUser, unfollowUser } from "@/services/users";

type Props = {
  username: string;
  initialFollowing?: boolean;
  onChangeCount?: (delta: number) => void;
};

export function FollowButton({ username, initialFollowing, onChangeCount }: Props) {
  const [following, setFollowing] = useState(!!initialFollowing);
  const [acting, setActing] = useState(false);

  async function onClick() {
    if (acting) return;
    setActing(true);
    const target = username;
    if (following) {
      setFollowing(false);
      onChangeCount?.(-1);
      try {
        await unfollowUser(target);
      } catch {
        setFollowing(true);
        onChangeCount?.(1);
      } finally {
        setActing(false);
      }
    } else {
      setFollowing(true);
      onChangeCount?.(1);
      try {
        await followUser(target);
      } catch {
        setFollowing(false);
        onChangeCount?.(-1);
      } finally {
        setActing(false);
      }
    }
  }

  return (
    <button
      type="button"
      className={`rounded-lg px-4 py-2 font-semibold text-white transition-colors ${
        following ? "bg-gray-800 hover:bg-gray-700" : "bg-black hover:bg-gray-900"
      } ${acting ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={onClick}
      disabled={acting}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}