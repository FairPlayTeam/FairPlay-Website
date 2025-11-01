"use client";

import Image from "next/image";
import { useCallback } from "react";
import { API_BASE_URL } from "@/config";
import { getCachedToken } from "@/services/token";

type Props = {
  thumbnailUrl: string | null;
  title: string;
  displayName?: string | null;
  subtitle?: string;
  meta?: string;
  onPress?: () => void;
  style?: string;
  variant?: "grid" | "list";
};

export function VideoCard({
  thumbnailUrl,
  title,
  displayName,
  subtitle,
  meta,
  onPress,
  style = "",
  variant = "grid",
}: Props) {
  const isGrid = variant === "grid";
  const token = getCachedToken();
  const isApiUrl = !!thumbnailUrl && thumbnailUrl.startsWith(API_BASE_URL);
  const isSigned = !!thumbnailUrl && /[?&](X-Amz-|Signature=)/.test(thumbnailUrl);
  const headers =
    isApiUrl && token && !isSigned ? { Authorization: `Bearer ${token}` } : undefined;

  const handleClick = useCallback(() => {
    if (onPress) onPress();
  }, [onPress]);

  if (isGrid) {
    return (
      <div
        onClick={handleClick}
        className={`cursor-pointer border rounded-lg p-2 space-y-1 ${style}`}
      >
        <div className="w-full aspect-video rounded-md overflow-hidden bg-gray-200">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={title}
              width={400}
              height={225}
              className="w-full h-full object-cover"
              unoptimized={!!headers}
            />
          ) : (
            <div className="w-full h-full bg-gray-300" />
          )}
        </div>

        <p className="font-semibold text-base line-clamp-2">{title}</p>

        {displayName && (
          <p className="text-sm font-medium text-gray-600 truncate">{displayName}</p>
        )}

        {meta && (
          <p className="text-xs text-gray-500 truncate">{meta}</p>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer flex border rounded-lg p-3 gap-3 ${style}`}
    >
      <div className="w-[140px] h-20 rounded-md overflow-hidden bg-gray-200">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            width={140}
            height={80}
            className="w-full h-full object-cover"
            unoptimized={!!headers}
          />
        ) : (
          <div className="w-full h-full bg-gray-300" />
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-1">
        <p className="font-semibold text-base line-clamp-2">{title}</p>

        {subtitle && (
          <p className="text-sm text-gray-600 truncate">{subtitle}</p>
        )}

        {meta && (
          <p className="text-xs text-gray-500 truncate">{meta}</p>
        )}
      </div>
    </div>
  );
}