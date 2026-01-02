"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaStar, FaRegStar } from "react-icons/fa";
import VideoDescription from "@/components/app/video/VideoDescription";
import Button from "@/components/ui/Button";
import { FollowButton } from "@/components/ui/FollowButton";
import { getUser, PublicUser } from "@/lib/users";
import { VideoDetails, rateVideo } from "@/lib/video";
import { useAuth } from "@/context/AuthContext";
import UserAvatar from "@/components/ui/UserAvatar";

export function VideoInfo({ video }: { video: VideoDetails }) {
  const [profile, setProfile] = useState<PublicUser>();
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [avgRating, setAvgRating] = useState(video.avgRating);
  const [ratingsCount, setRatingsCount] = useState(video.ratingsCount);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();

  const isOwner = user?.id === video.userId;

  const isStarActive = (star: number) => {
    if (hoverRating !== null) return star <= hoverRating;
    if (myRating !== null) return star <= myRating;
    return star <= Math.round(avgRating);
  };

  const handleRate = async (score: number) => {
    if (!user || isOwner || isSubmitting) return;

    const prevAvg = avgRating;
    const prevCount = ratingsCount;
    const prevMyRating = myRating;

    const newCount = myRating ? ratingsCount : ratingsCount + 1;
    const newAvg =
      (avgRating * ratingsCount - (myRating ?? 0) + score) / newCount;

    // optimistic update
    setAvgRating(newAvg);
    setRatingsCount(newCount);
    setMyRating(score);
    setIsSubmitting(true);

    try {
      await rateVideo(video.id, score);
    } catch (err) {
      console.error(err);
      // rollback
      setAvgRating(prevAvg);
      setRatingsCount(prevCount);
      setMyRating(prevMyRating);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!video.user?.username) return;

    getUser(video.user.username)
      .then((res) => setProfile(res.data))
      .catch(console.error);
  }, [video.user?.username]);

  return (
    <div className="mt-4 space-y-6">
      <h1 className="text-xl sm:text-[22px] font-bold text-text">
        {video.title}
      </h1>

      <div className="flex flex-col sm:flex-row gap-6 justify-between border-b border-border pb-6">
        <div className="flex flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar user={video.user} size={48} />
            <div className="min-w-0">
              <Link href={`/channel/${video.user?.username}`}>
                <h3 className="font-semibold text-text text-base sm:text-lg truncate">
                  {video.user?.displayName || video.user?.username}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  @{video.user?.username}
                </p>
              </Link>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-4">
            {!user ? (
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(
                  typeof window !== "undefined" ? window.location.pathname : "/"
                )}`}
              >
                <Button variant="videoDetails" className="rounded-full px-6">
                  Login to Subscribe
                </Button>
              </Link>
            ) : !isOwner ? (
              <FollowButton
                username={video.user?.username ?? ""}
                initialFollowing={!!profile?.isFollowing}
              />
            ) : null}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-text">
          <div className="hidden lg:block">
            <span className="font-medium">{avgRating.toFixed(1)}/5</span>
            <span className="text-muted-foreground">
              {" "}
              • {ratingsCount} reviews
            </span>
          </div>

          <div className="flex items-center justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                disabled={!user || isOwner}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => handleRate(star)}
                className="p-1 cursor-pointer disabled:cursor-not-allowed"
              >
                {isStarActive(star) ? (
                  <FaStar className="text-yellow-400 size-5" />
                ) : (
                  <FaRegStar className="size-5" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <VideoDescription video={video} />
    </div>
  );
}
