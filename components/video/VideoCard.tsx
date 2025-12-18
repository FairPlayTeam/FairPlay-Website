"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getToken } from "@/lib/token";
import { api } from "@/lib/api";

type VideoCardProps = {
  thumbnailUrl: string | null;
  title: string;
  displayName?: string | null;
  meta?: string;
  onPress?: () => void;
  className?: string;
  variant?: "grid" | "list";
};

export function VideoCard({
  thumbnailUrl,
  title,
  displayName,
  meta,
  onPress,
  className,
  variant = "grid",
}: VideoCardProps) {
  const isGrid = variant === "grid";
  const token = getToken();
  const isApiUrl =
    !!thumbnailUrl && thumbnailUrl.startsWith(api.defaults.baseURL || "");
  const isSigned = !!thumbnailUrl && /[?&](X-Amz-|Signature=)/.test(thumbnailUrl);

  const [fetchedSrc, setFetchedSrc] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    const resetTimer = setTimeout(() => setFetchedSrc(null), 0);

    if (!thumbnailUrl) {
      return () => clearTimeout(resetTimer);
    }

    if (isApiUrl && token && !isSigned) {
      let mounted = true;
      fetch(thumbnailUrl, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch image");
          return res.blob();
        })
        .then((blob) => {
          if (!mounted) return;
          const url = URL.createObjectURL(blob);
          objectUrlRef.current = url;
          setFetchedSrc(url);
        })
        .catch(() => {
          if (mounted) setFetchedSrc(thumbnailUrl);
        });

      return () => {
        mounted = false;
        clearTimeout(resetTimer);
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
      };
    }

    clearTimeout(resetTimer);
    const setTimer = setTimeout(() => setFetchedSrc(thumbnailUrl), 0);
    return () => clearTimeout(setTimer);
  }, [thumbnailUrl, isApiUrl, isSigned, token]);

  const handlePress = () => {
    onPress?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onPress?.();
    }
  };

  const imgSrc = fetchedSrc ?? undefined;

  if (isGrid) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handlePress}
        onKeyDown={handleKeyDown}
        className={cn(
          "group rounded-2xl cursor-pointer hover:bg-white/5 transition-colors p-1 mb-2 outline-none",
          className
        )}
      >
        <div className="w-full aspect-video rounded-xl overflow-hidden relative">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={title}
              fill
              className="object-cover group-hover:scale-102 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-gray-300" />
          )}
        </div>

        <div className="flex flex-col gap-2 flex-1 p-3">
          <h3 className="font-semibold text-base line-clamp-2">{title}</h3>
          {displayName && (
            <p className="text-sm font-medium text-(--gray-200) line-clamp-1">
              {displayName}
            </p>
          )}
          {meta && <p className="text-xs text-(--gray-300) line-clamp-1">{meta}</p>}
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handlePress}
      onKeyDown={handleKeyDown}
      className={cn(
        "group flex flex-row gap-3 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors p-1 mb-2 outline-none",
        className
      )}
    >
      <div className="w-36 h-20 rounded-xl overflow-hidden relative shrink-0">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover group-hover:scale-102 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full bg-gray-300" />
        )}
      </div>

      <div className="flex flex-col justify-center gap-1 flex-1 min-w-0">
        <h3 className="font-semibold text-base line-clamp-2">{title}</h3>
        {displayName && (
          <p className="text-sm text-(--gray-200) line-clamp-1">{displayName}</p>
        )}
        {meta && <p className="text-xs text-(--gray-300) line-clamp-1">{meta}</p>}
      </div>
    </div>
  );
}