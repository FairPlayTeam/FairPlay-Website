"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { searchVideos, VideoDetails } from "@/lib/video";
import { VideoCard } from "@/components/video/VideoCard";
import Spinner from "@/components/ui/Spinner";
import { toast } from "@/components/ui/Toast/toast";

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<VideoDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) return;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await searchVideos(query, 1, 20);
        if (!res.data.videos) {
          setResults([]);
          setError("No results found.");
        } else {
          setResults(res.data.videos);
        }
      } catch (err: unknown) {
        toast.error("Error while searching.");
        const errorMessage = err instanceof Error ? err.message : "Error while searching.";
        setError(
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error || errorMessage
        );
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-5rem)] w-full grid place-items-center">
        <Spinner className="size-12" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Results for &quot;{query}&quot;</h1>

      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && results.length === 0 && <p>No video found.</p>}

      <ul className="flex flex-col gap-1">
        {results.map((video) => (
          <VideoCard
            key={video.id}
            thumbnailUrl={video.thumbnailUrl}
            title={video.title}
            displayName={video.user?.displayName || video.user?.username}
            meta={`${video.viewCount} views • ${new Date(video.createdAt).toLocaleDateString()}`}
            onPress={() => router.push(`/video/${video.id}`)}
            variant="listLarge"
          />
        ))}
      </ul>
    </div>
  );
}