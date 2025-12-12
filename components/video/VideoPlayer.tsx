"use client";

import Hls from "hls.js";
import { useHotkeys } from "react-hotkeys-hook";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaVolumeDown,
} from "react-icons/fa";
import { FaArrowRotateRight } from "react-icons/fa6";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Slider from "@/components/ui/Slider";
import { getToken } from "@/lib/token";
import { formatTime } from "@/lib/time";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  url: string;
  thumbnailUrl: string | null;
}

export function VideoPlayer({ url, thumbnailUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const [animation, setAnimation] = useState<
    "play" | "pause" | "mute" | "unmute" | null
  >(null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlayPromise = (promise: Promise<void>) => {
      promise.catch(() => {
        setIsPlaying(false);
        setIsBuffering(false);
      });
    };

    if (Hls.isSupported()) {
      const token = getToken();
      const hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = true;
          if (token) {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          }
        },
      });

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isPlayingRef.current) {
          handlePlayPromise(video.play());
        } else {
          setIsBuffering(false);
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = url;
      video.addEventListener("loadedmetadata", () => {
        if (isPlayingRef.current) {
          handlePlayPromise(video.play());
        } else {
          setIsBuffering(false);
        }
      });
    } else {
      console.error("HLS is not supported in this browser.");
    }
  }, [url]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", () => setShowControls(false));
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", () =>
          setShowControls(false)
        );
      }

      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [handleMouseMove]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsBuffering(false);
    }
  };

  const handleSeek = (val: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleVolumeChange = useCallback((val: number) => {
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  }, []);

  const triggerAnimation = (type: "play" | "pause" | "mute" | "unmute") => {
    setAnimation(type);
    setTimeout(() => setAnimation(null), 500);
  };

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;

      triggerAnimation(isMuted ? "mute" : "unmute");
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useHotkeys(
    ["space", "k"],
    () => {
      togglePlay();
      triggerAnimation(isPlaying ? "pause" : "play");
    },
    { preventDefault: true }
  );

  useHotkeys("f", toggleFullscreen);
  useHotkeys("m", toggleMute);

  useHotkeys("arrowleft", () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        videoRef.current.currentTime - 5
      );
    }
  });

  useHotkeys("arrowright", () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        duration,
        videoRef.current.currentTime + 5
      );
    }
  });

  return (
    <div
      ref={containerRef}
      className="relative aspect-video lg:rounded-lg bg-black overflow-hidden shadow-lg group"
    >
      <AnimatePresence>
        {animation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="absolute inset-0 grid place-items-center pointer-events-none"
          >
            <div className="text-white [&_svg]:size-9 size-20 bg-black/25 rounded-full grid place-items-center">
              {animation === "play" && <FaPlay />}
              {animation === "pause" && <FaPause />}
              {animation === "mute" && <FaVolumeUp />}
              {animation === "unmute" && <FaVolumeMute />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <video
        ref={videoRef}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        poster={thumbnailUrl ?? undefined}
        crossOrigin="use-credentials"
        className="w-full h-full object-contain cursor-pointer"
      />

      {isBuffering && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <Spinner className="size-12" />
        </div>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-2 pt-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <Slider
          step={0.25}
          value={currentTime}
          max={duration || 100}
          onChange={handleSeek}
          className="mb-1"
        />

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={togglePlay}
              className="text-white hover:bg-white/10 rounded-full"
            >
              {currentTime >= duration ? (
                <FaArrowRotateRight />
              ) : isPlaying ? (
                <FaPause />
              ) : (
                <FaPlay />
              )}
            </Button>

            <div className="flex items-center gap-2 group/volume">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/10 rounded-full"
              >
                {isMuted || volume === 0 ? (
                  <FaVolumeMute />
                ) : volume < 0.5 ? (
                  <FaVolumeDown />
                ) : (
                  <FaVolumeUp />
                )}
              </Button>
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 overflow-hidden mr-2 group-hover/volume:overflow-visible group-hover/volume:w-14 transition-all duration-200"
                trackClassName="bg-white/30 h-1"
                rangeClassName="bg-white"
                thumbClassName="bg-white"
              />
            </div>

            <div className="text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/10 rounded-full"
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
