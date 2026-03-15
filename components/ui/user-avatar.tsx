"use client";

import { User } from "@/lib/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface UserAvatarProps {
  user?:
    | User
    | {
        id?: string;
        username: string;
        displayName: string | null;
        avatarUrl?: string | null;
      }
    | null;
  size?: "default" | "sm" | "lg";
  className?: string;
}

export default function UserAvatar({ user, size, className }: UserAvatarProps) {
  return (
    <Avatar size={size} className={className}>
      <AvatarImage src={user?.avatarUrl ?? undefined} />
      <AvatarFallback>
        {user?.displayName?.[0]?.toUpperCase() ?? user?.username?.[0]?.toUpperCase() ?? "?"}
      </AvatarFallback>
    </Avatar>
  );
}
