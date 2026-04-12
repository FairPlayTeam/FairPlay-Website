"use client";

import { VideoCard } from "@/components/app/video/video-card";
import type { SearchResultItem } from "@/lib/video";
import { SearchUserCard } from "./search-user-card";

type SearchResultsListProps = {
  results: SearchResultItem[];
};

export function SearchResultsList({ results }: SearchResultsListProps) {
  return (
    <div className="flex flex-col gap-3">
      {results.map((result) => {
        if (result.type === "creator") {
          return <SearchUserCard key={`creator-${result.creator.id}`} creator={result.creator} />;
        }

        const { video } = result;

        return (
          <VideoCard
            key={`video-${video.id}`}
            thumbnailUrl={video.thumbnailUrl}
            title={video.title}
            displayName={video.user?.displayName || video.user?.username}
            meta={`${video.viewCount} views - ${new Date(video.createdAt).toLocaleDateString()}`}
            href={`/video/${video.id}`}
            variant="listLarge"
            className="mb-0"
          />
        );
      })}
    </div>
  );
}
