"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FaBackward, FaForward, FaPause, FaPlay, FaVolumeMute, FaVolumeUp } from "react-icons/fa";

type OverlayAnimation = "play" | "pause" | "mute" | "unmute" | null;

type VideoPlayerOverlaysProps = {
  animation: OverlayAnimation;
  seekDelta: number;
};

export function VideoPlayerOverlays({ animation, seekDelta }: VideoPlayerOverlaysProps) {
  return (
    <AnimatePresence>
      {animation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          className="pointer-events-none absolute inset-0 grid place-items-center"
        >
          <div className="grid size-20 place-items-center rounded-full bg-card/30 text-card-foreground [&_svg]:size-9">
            {animation === "play" && <FaPlay />}
            {animation === "pause" && <FaPause />}
            {animation === "mute" && <FaVolumeMute />}
            {animation === "unmute" && <FaVolumeUp />}
          </div>
        </motion.div>
      )}

      {seekDelta !== 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.75, x: seekDelta < 0 ? 20 : -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.85, x: 0 }}
          className={`pointer-events-none absolute top-0 bottom-0 w-1/3 grid place-items-center ${seekDelta < 0 ? "left-0" : "right-0"}`}
        >
          <div className="flex items-center gap-3 text-xl text-card-foreground">
            {seekDelta < 0 && (
              <>
                <FaBackward className="size-6" />
                <span>{seekDelta}</span>
              </>
            )}
            {seekDelta > 0 && (
              <>
                <span>+{seekDelta}</span>
                <FaForward className="size-6" />
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
