"use client";

import { useState, useEffect } from "react";
import { followUser, unfollowUser } from "@/lib/users";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell } from "react-icons/fa";

type FollowButtonProps = {
  readonly username: string;
  readonly initialFollowing?: boolean;
  readonly onChangeCount?: (delta: number) => void;
};

export function FollowButton({
  username,
  initialFollowing = false,
  onChangeCount,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(false);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    setFollowing(!!initialFollowing);
  }, [initialFollowing]);

  async function onClick() {
    if (acting) return;
    setActing(true);

    const next = !following;
    setFollowing(next);
    onChangeCount?.(next ? 1 : -1);

    try {
      if (next) {
        await followUser(username);
      } else {
        await unfollowUser(username);
      }
    } catch {
      setFollowing(!next);
      onChangeCount?.(next ? -1 : 1);
    } finally {
      setActing(false);
    }
  }

  return (
    <motion.button
      type="button"
      layout
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      disabled={acting}
      className={cn(
        "relative flex items-center justify-center gap-2",
        acting ? "cursor-not-allowed" : "cursor-pointer",
        "text-[15px] px-4 py-2 sm:px-6 sm:py-2.5",
        "rounded-full transition-colors duration-200",
        following ? "bg-(--gray-500)" : "bg-white"
      )}
    >
      <AnimatePresence mode="popLayout">
        {following && (
          <motion.div
            key="bell-icon"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="flex items-center"
          >
            <motion.div
              animate={{ rotate: [0, -20, 20, -15, 15, -10, 10, 0] }}
              transition={{ duration: 0.9, ease: "easeInOut", delay: 0.1 }}
            >
              <FaBell className="text-text" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.span
        layout="position"
        className={cn(following ? "text-text" : "text-black", "font-semibold z-10")}
      >
        {following ? "Subscribed" : "Subscribe"}
      </motion.span>
    </motion.button>
  );
}
