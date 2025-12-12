import { useState } from "react";
import { VideoDetails } from "@/lib/video";

interface VideoDescriptionProps {
  video: VideoDetails;
}

export default function VideoDescription({ video }: VideoDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const text = video.description?.trim() || "No description provided.";

  return (
    <div className="bg-container p-4 rounded-xl text-sm">
      <div className="flex flex-wrap items-center gap-4">
        <span>{video.viewCount} views</span>
        {video.createdAt && (
          <span>
            {new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            }).format(new Date(video.createdAt))}
          </span>
        )}
      </div>

      <p
        className={`mt-3 whitespace-pre-wrap transition-all ${
          isExpanded ? "" : "line-clamp-3"
        }`}
      >
        {text}
      </p>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 font-medium text-accent cursor-pointer hover:underline"
      >
        {isExpanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
}
