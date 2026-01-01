"use client";

import { useEffect, useState } from "react";
import { VideoCard } from "@/components/app/video/VideoCard";
import { getVideos, type VideoDetails } from "@/lib/video";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import DisclaimerPopup from "@/components/app/layout/DisclaimerPopup";
import { toast } from "@/components/ui/Toast/toast-utils";

export default function VideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoDetails[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const referrer = document.referrer;
      const isFromLandingPage = referrer === "https://fairplay.video/";
      setIsPopupOpen(isFromLandingPage);
    }
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const { data } = await getVideos();
        setVideos(data.videos);
        setError(null);
      } catch {
        setError("Unable to load videos. Please try later.");
        toast.error("Error while fetching videos.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-5rem)] w-full grid place-items-center">
        <Spinner className="size-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl mb-4">Error</h2>
        <p className="text-text">{error || "Failed to load videos."}</p>
      </div>
    );
  }

  const handleVideoPress = (id: string) => {
    router.push(`/video/${id}`);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Explore</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              thumbnailUrl={video.thumbnailUrl}
              title={video.title}
              displayName={video.user?.displayName || video.user?.username}
              meta={`${video.viewCount} views • ${new Date(video.createdAt).toLocaleDateString()}`}
              onPress={() => handleVideoPress(video.id)}
              variant="grid"
            />
          ))}
        </div>
      </div>
      <DisclaimerPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </>
  );
}
