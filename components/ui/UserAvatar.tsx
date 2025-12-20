"use client";

import { cn } from "@/lib/utils";
import { User } from "@/types/schema";
import Image from "next/image";
import { useMemo } from "react";

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
  size?: number;
  className?: string;
}

export default function UserAvatar({
  user,
  size = 40,
  className = "",
}: UserAvatarProps) {
  const background = useMemo(() => {
    const str = user?.username ?? "User";

    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      sum += str.charCodeAt(i);
    }

    const hue = sum % 360;
    const start = `hsl(${hue}, 60%, 40%)`;
    const end = `hsl(${hue}, 60%, 60%)`;

    return `radial-gradient(circle at center, ${start}, ${end})`;
  }, [user?.username]);

  if (user?.avatarUrl) {
    return (
      <Image
        src={user.avatarUrl}
        alt={user.displayName ?? "User avatar"}
        width={size}
        height={size}
        className={cn("rounded-full", className)}
        style={{
          width: size,
          height: size,
        }}
      />
    );
  }

  return (
    <div
      className={cn("rounded-full grid place-items-center", className)}
      style={{ background, width: size, height: size, fontSize: size / 2 }}
    >
      <span className="text-white font-medium">
        {user?.displayName?.[0].toUpperCase() ??
          user?.username?.[0].toUpperCase() ??
          "?"}
      </span>
    </div>
  );
}
