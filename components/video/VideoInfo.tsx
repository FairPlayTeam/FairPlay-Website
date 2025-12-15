"use client";

import Link from "next/link";
import Image from "next/image";
import { FaStar, FaRegStar } from "react-icons/fa";
import VideoDescription from "@/components/video/VideoDescription";
import Button from "@/components/ui/Button";
import { VideoDetails } from "@/lib/video";
import { useAuth } from "@/context/AuthContext";

interface VideoInfoProps {
  video: VideoDetails;
}

export function VideoInfo({ video }: VideoInfoProps) {
  const { user } = useAuth();

  return (
    <div className="mt-4 space-y-6">
      <h1 className="text-2xl font-bold text-text">{video.title}</h1>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="relative size-12 rounded-full overflow-hidden bg-secondary">
            {video.user?.avatarUrl ? (
              <Image
                src={video.user.avatarUrl}
                alt={video.user.username}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text font-bold text-lg">
                {video.user?.username[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-text text-lg">
              {video.user?.displayName || video.user?.username}
            </h3>
            <p className="text-sm text-muted-foreground">
              @{video.user?.username}
            </p>
          </div>
          {!user ? (
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`}
            >
              <Button variant="secondary" className="ml-4 rounded-full px-6">
                Login to Subscribe
              </Button>
            </Link>
          ) : user.id === video.userId && false ? (
            <></>
          ) : (
            // TODO: Implement subscription logic
            <Button variant="secondary" className="ml-4 rounded-full px-6">
              Subscribe
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm text-text mx-4">
          <div className="inline-flex items-center gap-2">
            <span>{video.avgRating.toFixed(1)}/5</span>
            <span>•</span>
            <span>{video.ratingsCount} reviews</span>
          </div>
          {/* TODO: Add rating logic */}
          <div className="inline-flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="size-5">
                {star <= video.avgRating ? (
                  <FaStar className="text-yellow-400" />
                ) : (
                  <FaRegStar />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      <VideoDescription video={video} />
    </div>
  );
}
