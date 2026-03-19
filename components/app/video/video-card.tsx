"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

type VideoCardProps = {
  thumbnailUrl: string | null;
  title: string;
  displayName?: string | null;
  meta?: string;
  tags?: string[] | null;
  href?: string;
  className?: string;
  variant?: "grid" | "list" | "listLarge";
  overlayTopRight?: ReactNode;
  overlayTopLeft?: ReactNode;
  overlayCenter?: ReactNode;
  overlayBottomLeft?: ReactNode;
};

export function VideoCard({
  thumbnailUrl,
  title,
  displayName,
  meta,
  tags,
  href,
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

  const router = useRouter();

  const wrapperBase =
    "group block cursor-pointer rounded-2xl transition-colors p-1 mb-2 outline-none";
  const hoverStyle = "hover:bg-accent/50";

  const cardWrapper = (children: ReactNode, classes: string) => {
    const resolvedHref = href?.trim();
    if (resolvedHref) {
      return (
        // use div with click handler instead of Link to avoid nested anchors
        <div
          className={classes}
          role="link"
          tabIndex={0}
          onClick={() => router.push(resolvedHref)}
          onKeyDown={(e) => {
            if (e.key === "Enter") router.push(resolvedHref);
          }}
        >
          {children}
        </div>
      );
    }
    return <div className={classes}>{children}</div>;
  };

  const ImageBlock = (
    <div className="relative w-full aspect-video overflow-hidden rounded-xl">
      {overlayCenter && <div className="absolute inset-0 z-10">{overlayCenter}</div>}
      {overlayTopRight && <div className="absolute top-1 right-1 z-20">{overlayTopRight}</div>}
      {overlayTopLeft && <div className="absolute top-1 left-1 z-20">{overlayTopLeft}</div>}
      {overlayBottomLeft && (
        <div className="absolute bottom-1 left-1 z-20">{overlayBottomLeft}</div>
      )}

      {imgSrc ? (
        <Image
          src={imgSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="h-full w-full bg-muted" />
      )}
    </div>
  );

  if (isGrid) {
    return cardWrapper(
      <>
        {ImageBlock}

        <div className="flex flex-1 flex-col gap-2 p-3">
          <h3 className="font-semibold text-foreground line-clamp-2">{title}</h3>

          {displayName && (
            <p className="text-sm font-medium text-muted-foreground line-clamp-1">{displayName}</p>
          )}

          {meta && <p className="text-xs text-muted-foreground line-clamp-1">{meta}</p>}

          {tags && tags.length > 0 && (
            <div className="pt-2 overflow-hidden min-w-0">
              <div
                className="flex flex-nowrap gap-1 overflow-hidden min-w-0"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to right, black 0%, black 75%, transparent 100%)",
                  maskImage: "linear-gradient(to right, black 0%, black 75%, transparent 100%)",
                }}
              >
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="group"
                  >
                    <Badge className="py-2.5 cursor-pointer text-foreground bg-secondary group-hover:border group-hover:border-border hover:bg-input">
                      {tag.toLowerCase()}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </>,
      cn(wrapperBase, hoverStyle, "overflow-hidden", className),
    );
  }

  if (isLarge) {
    return cardWrapper(
      <>
        <div className="relative w-full aspect-video sm:w-72 sm:h-40 overflow-hidden rounded-xl shrink-0">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 sm:gap-1 p-3 sm:py-2">
          <h3 className="font-semibold text-xl line-clamp-2">{title}</h3>

          {displayName && (
            <p className="text-sm text-muted-foreground line-clamp-1">{displayName}</p>
          )}

          {meta && <p className="text-xs text-muted-foreground line-clamp-1">{meta}</p>}
        </div>
      </>,
      cn(wrapperBase, hoverStyle, "sm:flex sm:flex-row sm:gap-3 flex-col", className),
    );
  }

  return cardWrapper(
    <>
      <div className="relative w-full aspect-video sm:w-45 sm:h-25 overflow-hidden rounded-xl sm:rounded-lg shrink-0">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 sm:gap-1 p-3 sm:p-0">
        <h3 className="font-semibold text-foreground line-clamp-2">{title}</h3>

        {displayName && <p className="text-sm text-muted-foreground line-clamp-1">{displayName}</p>}

        {meta && <p className="text-xs text-muted-foreground line-clamp-1">{meta}</p>}
      </div>
    </>,
    cn(wrapperBase, hoverStyle, "sm:flex sm:flex-row sm:gap-3 flex-col sm:rounded-xl", className),
  );
}
