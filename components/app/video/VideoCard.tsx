"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type VideoCardProps = {
  thumbnailUrl: string | null;
  title: string;
  displayName?: string | null;
  username: string;
  meta?: string;
  tags?: string[] | null;
  onPress?: () => void;
  className?: string;
  variant?: "grid" | "list" | "listLarge";
  overlayTopRight?: React.ReactNode;
  overlayTopLeft?: React.ReactNode;
  overlayCenter?: React.ReactNode;
  overlayBottomLeft?: React.ReactNode;
};

export function VideoCard({
  thumbnailUrl,
  title,
  displayName,
  username,
  meta,
  tags,
  onPress,
  className,
  variant = "grid",
  overlayCenter,
  overlayTopLeft,
  overlayTopRight,
  overlayBottomLeft,
}: VideoCardProps) {
  const isGrid = variant === "grid";
  const isLarge = variant === "listLarge";
  const imgSrc = thumbnailUrl ?? undefined;

  const handlePress = () => {
    onPress?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onPress?.();
    }
  };

  if (isGrid) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handlePress}
        onKeyDown={handleKeyDown}
        className={cn(
          "group rounded-2xl cursor-pointer hover:bg-white/5 transition-colors p-1 mb-2 outline-none overflow-hidden",
          className
        )}
      >
        <div className="w-full aspect-video rounded-xl overflow-hidden relative">
          {overlayCenter && (
            <div className="absolute inset-0 z-10 h-full">{overlayCenter}</div>
          )}

          {overlayTopRight && (
            <div className="absolute top-1 right-1 z-20">{overlayTopRight}</div>
          )}

          {overlayTopLeft && (
            <div className="absolute top-1 left-1 z-20">{overlayTopLeft}</div>
          )}

          {overlayBottomLeft && (
            <div className="absolute bottom-1 left-1 z-20">
              {overlayBottomLeft}
            </div>
          )}

          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={title}
              fill
              className="object-cover group-hover:scale-102 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-container" />
          )}
        </div>

        <div className="flex flex-col gap-2 flex-1 p-3">
          <h3 className="font-semibold text-base line-clamp-2">{title}</h3>
          {displayName && (
            <a
              href={`/channel/${username}`}
              className="text-sm text-(--gray-200) hover:text-(--gray-100) line-clamp-1"
            >
              {displayName}
            </a>
          )}

          {meta && (
            <p className="text-xs text-(--gray-300) line-clamp-1">{meta}</p>
          )}

          {tags && tags.length > 0 && (
            <div className="pt-2 overflow-hidden min-w-0">
              <div
                className="flex flex-nowrap gap-1 overflow-hidden min-w-0"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to right, black 0%, black 75%, transparent 100%)",
                  maskImage:
                    "linear-gradient(to right, black 0%, black 75%, transparent 100%)",
                }}
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-(--gray-200) whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isLarge) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handlePress}
        onKeyDown={handleKeyDown}
        className={cn(
          "group sm:flex sm:flex-row sm:gap-3 flex-col rounded-2xl cursor-pointer hover:bg-white/5 transition-colors p-1 mb-2 outline-none",
          className
        )}
      >
        <div className="w-full aspect-video sm:w-72 sm:h-40 rounded-xl overflow-hidden relative shrink-0">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={title}
              fill
              className="object-cover group-hover:scale-102 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-container" />
          )}
        </div>

        <div className="flex flex-col gap-2 sm:gap-1 flex-1 justify-top p-3 sm:py-2">
          <h3 className="font-semibold text-xl line-clamp-2">{title}</h3>
          {displayName && (
            <a
              href={`/channel/${username}`}
              className="text-sm text-(--gray-200) hover:text-(--gray-100) line-clamp-1"
            >
              {displayName}
            </a>
          )}

          {meta && (
            <p className="text-xs text-(--gray-300) line-clamp-1">{meta}</p>
          )}
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
        "group sm:flex sm:flex-row sm:gap-3 flex-col rounded-2xl sm:rounded-xl cursor-pointer hover:bg-white/5 transition-colors p-1 mb-2 outline-none",
        className
      )}
    >
      <div className="w-full aspect-video sm:w-36 sm:h-20 rounded-xl sm:rounded-lg overflow-hidden relative shrink-0">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover group-hover:scale-102 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full bg-container" />
        )}
      </div>

      <div className="flex flex-col justify-center gap-2 sm:gap-1 flex-1 sm:p-0 p-3">
        <h3 className="font-semibold text-base line-clamp-2">{title}</h3>
        {displayName && (
          <a
            href={`/channel/${username}`}
            className="text-sm text-(--gray-200) hover:text-(--gray-100) line-clamp-1"
          >
            {displayName}
          </a>
        )}

        {meta && (
          <p className="text-xs text-(--gray-300) line-clamp-1">{meta}</p>
        )}
      </div>
    </div>
  );
}
