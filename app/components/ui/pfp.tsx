"use client";

import Image from "next/image";
import { memo, useEffect, useState } from "react";
import { getCachedToken } from "@/services/token";
import { getUser } from "@/services/users";
import { API_BASE_URL } from "@/config";

type Props = {
  idOrUsername: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  avatarUrl?: string | null;
};

export const Pfp = memo(function PfpBase({
  idOrUsername,
  size = 44,
  className = "",
  style = {},
  avatarUrl,
}: Props) {
  const [url, setUrl] = useState<string | null>(avatarUrl ?? null);
  const [uname, setUname] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    if (!idOrUsername) return;
    if (avatarUrl !== undefined) {
      setUrl(avatarUrl);
      setUname(String(idOrUsername));
      return;
    }
    getUser(String(idOrUsername))
      .then((u) => {
        if (!mounted) return;
        setUrl(u.avatarUrl || null);
        setUname(u.username || "");
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [idOrUsername, avatarUrl]);

  const getImageUri = (avatarUrl: string | null) => {
    if (!avatarUrl) return null;
    if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl;
    return `${API_BASE_URL}${avatarUrl.startsWith("/") ? "" : "/"}${avatarUrl}`;
  };

  if (url) {
    const imageUri = getImageUri(url);
    if (imageUri) {
      return (
        <div
          className={`overflow-hidden rounded-full shrink-0 ${className}`}
          style={{
            width: size,
            height: size,
            ...style,
          }}
        >
          <Image
            src={imageUri}
            alt={uname || "avatar"}
            width={size}
            height={size}
            className="object-cover w-full h-full"
            unoptimized
          />
        </div>
      );
    }
  }

  return (
    <div
      className={`overflow-hidden flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        ...style,
      }}
    >
      <span
        className="font-semibold text-gray-700 dark:text-gray-200 select-none"
        style={{
          fontSize: Math.round(size * 0.45),
          lineHeight: `${size}px`,
        }}
      >
        {uname?.[0]?.toUpperCase() || "?"}
      </span>
    </div>
  );
});