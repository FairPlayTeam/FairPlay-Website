"use client";

import { useRouter } from "next/navigation";
import { FaCheck, FaTimes, FaTrash } from "react-icons/fa";

import { StatusBadges } from "@/components/app/video/StatusBadge";
import { VideoCard } from "@/components/app/video/VideoCard";
import { type ModVideoItem } from "@/lib/moderation";
import { cn } from "@/lib/utils";

type ModVideoCardProps = {
  video: ModVideoItem;
  user: ModVideoItem["user"];
  onDelete: (videoId: string) => void;
  onModerate: (videoId: string, action: "approve" | "reject") => void;
  isModerating?: boolean;
};

export function ModVideoCard({
  video,
  user,
  onDelete,
  onModerate,
  isModerating = false,
}: ModVideoCardProps) {
  const router = useRouter();

  const isProcessing = video.processingStatus !== "done";

  const createdAtLabel =
    "createdAt" in video
      ? new Date(video.createdAt as string | number).toLocaleDateString()
      : "";
  const showModerationActions =
    video.moderationStatus === "pending" && !isProcessing;

  const baseActionButtonClasses =
    "cursor-pointer inline-flex h-10 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white shadow-[0_6px_16px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

  const renderActionButton = (
    label: string,
    tone: "approve" | "reject",
    onClick: () => void
  ) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={isModerating}
      aria-label={label}
      className={cn(
        baseActionButtonClasses,
        tone === "approve"
          ? "bg-emerald-500/90 hover:bg-emerald-400"
          : "bg-rose-500/90 hover:bg-rose-400",
        isModerating && "cursor-not-allowed opacity-60"
      )}
    >
      {tone === "approve" ? (
        <FaCheck className="size-4" />
      ) : (
        <FaTimes className="size-4" />
      )}
      <span>{label}</span>
    </button>
  );

  return (
    <div className={cn("relative", isProcessing && "cursor-not-allowed")}>
      <div className={cn(isProcessing && "pointer-events-none")}>
        <VideoCard
          thumbnailUrl={video.thumbnailUrl}
          title={video.title}
          displayName={user.displayName || user.username}
          username={user.username}
          meta={createdAtLabel}
          variant="grid"
          onPress={
            isProcessing ? undefined : () => router.push(`/video/${video.id}`)
          }
          className="group mb-0"
          overlayTopLeft={
            <StatusBadges
              visibility={video.visibility}
              moderationStatus={video.moderationStatus}
              processingStatus={video.processingStatus}
            />
          }
          overlayTopRight={
            !isProcessing && (
              <button
                type="button"
                className="cursor-pointer rounded-full bg-background/80 p-2 text-white shadow hover:bg-red-600"
                aria-label="Delete video"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(video.id);
                }}
              >
                <FaTrash className="size-4" />
              </button>
            )
          }
          overlayCenter={
            isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl backdrop-blur-[2px]">
                <span className="text-base font-semibold text-white">
                  Processing...
                </span>
              </div>
            )
          }
        />
      </div>
      {showModerationActions && (
        <div className="mt-3 mb-4 p-1">
          <div className="grid grid-cols-2 gap-2">
            {renderActionButton("Approve", "approve", () =>
              onModerate(video.id, "approve")
            )}
            {renderActionButton("Reject", "reject", () =>
              onModerate(video.id, "reject")
            )}
          </div>
        </div>
      )}
    </div>
  );
}
