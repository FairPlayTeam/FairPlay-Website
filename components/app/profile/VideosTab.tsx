"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import { toast } from "@/components/ui/Toast/toast";
import { MyVideoCard } from "@/components/app/video/MyVideoCard";
import { MyVideoItem, getMyVideos } from "@/lib/users";
import { deleteVideo } from "@/lib/video";
import { User } from "@/types/schema";
import Button from "@/components/ui/Button";
import { FaUpload } from "react-icons/fa";

interface VideosTabProps {
  user: User;
}

type LoadState = "idle" | "loading" | "ready" | "error";

export default function VideosTab({ user }: VideosTabProps) {
  const router = useRouter();

  const [videos, setVideos] = useState<MyVideoItem[]>([]);

  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const requestSeq = useRef(0);

  useEffect(() => {
    const seq = ++requestSeq.current;

    const run = async () => {
      setState("loading");
      setError(null);

      try {
        const videosRes = await getMyVideos(1, 20);
        if (requestSeq.current !== seq) return;

        setVideos(videosRes.data?.videos ?? []);
        setState("ready");
      } catch (e) {
        if (requestSeq.current !== seq) return;

        setState("error");
        setError(e instanceof Error ? e.message : "Failed to load videos");
        setVideos([]);
      }
    };

    run();
  }, [user]);

  const handleDeleteVideo = async (videoId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this video? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteVideo(videoId);
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      toast.success("Video deleted successfully!");
    } catch {
      toast.error("Failed to delete video");
    }
  };

  if (state === "loading" || state === "idle") {
    return (
      <div className="h-40 w-full grid place-items-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="text-center py-8 text-red-500">
        {error || "Failed to load videos"}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-10">
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 h-40">
          <span className="text-text-amount">
            You don&apos;t have any videos
          </span>
          <Button
            variant="secondary"
            className="mt-2"
            onClick={() => router.push("/upload")}
          >
            Upload Video
          </Button>
        </div>
      ) : (
        <div>
          <Button
            variant="secondary"
            className="rounded-md flex items-center gap-2 ml-auto px-4 py-2 mb-4"
            onClick={() => router.push("/upload")}
          >
            <FaUpload />
            Upload Video
          </Button>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {videos.map((v) => (
              <div key={v.id}>
                <MyVideoCard
                  video={v}
                  user={user}
                  onDelete={() => handleDeleteVideo(v.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
