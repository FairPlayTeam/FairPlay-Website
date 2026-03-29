"use client";

import Link from "next/link";
import { CalendarDays, Users, Video } from "lucide-react";
import UserAvatar from "@/components/ui/user-avatar";
import type { SearchCreator } from "@/lib/video";

type SearchUserCardProps = {
  creator: SearchCreator;
};

export function SearchUserCard({ creator }: SearchUserCardProps) {
  const title = creator.displayName || creator.username;
  const joinedAt = new Date(creator.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
  });

  return (
    <Link
      href={`/channel/${creator.username}`}
      className="group flex items-start gap-4 rounded-2xl p-4 transition-colors hover:bg-accent/50"
    >
      <UserAvatar user={creator} className="size-16 shrink-0" />

      <div className="min-w-0 flex-1 space-y-2">
        <div className="space-y-1">
          <h3 className="truncate text-lg font-semibold text-foreground">{title}</h3>
          <p className="truncate text-sm text-muted-foreground">@{creator.username}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-4" />
            {creator.followerCount.toLocaleString()} followers
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Video className="size-4" />
            {creator.videoCount.toLocaleString()} videos
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            Joined {joinedAt}
          </span>
        </div>
      </div>
    </Link>
  );
}
