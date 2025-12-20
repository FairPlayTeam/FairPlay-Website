"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaStar, FaRegStar } from "react-icons/fa";
import VideoDescription from "@/components/video/VideoDescription";
import Button from "@/components/ui/Button";
import { FollowButton } from "@/components/ui/FollowButton";
import { getUser } from "@/lib/users";
import { VideoDetails } from "@/lib/video";
import { PublicUser } from "@/lib/users";
import { useAuth } from "@/context/AuthContext";
import UserAvatar from "@/components/ui/UserAvatar";

export function VideoInfo({ video }: { video: VideoDetails }) {
  const [profile, setProfile] = useState<PublicUser | undefined>(undefined);
  const { user } = useAuth();

  useEffect(() => {
    const uname = video.user?.username;
    if (!uname) {
      console.log("No username.");
      return;
    }

    getUser(uname)
      .then((response) => {
        setProfile(response.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [video.user?.username]);

  return (
    <div className="mt-4 space-y-6">
      <h1 className="text-2xl font-bold text-text">{video.title}</h1>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <UserAvatar user={video.user} size={48} />
          <div>
            <Link href={"/channel/" + video.user?.username}>
              <h3 className="font-semibold text-text text-lg">
                {video.user?.displayName || video.user?.username}
              </h3>
              <p className="text-sm text-muted-foreground">
                @{video.user?.username}
              </p>
            </Link>
          </div>
          {!user ? (
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`}
            >
              <Button variant="videoDetails" className="ml-4 rounded-full px-6">
                Login to Subscribe
              </Button>
            </Link>
          ) : user.id === video.userId ? (
            <></>
          ) : (
            <div className="ml-4">
              <FollowButton
                username={video.user?.username ?? ""}
                initialFollowing={!!profile?.isFollowing}
              />
            </div>
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
