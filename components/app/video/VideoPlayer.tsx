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
  FaBackward,
  FaForward,
} from "react-icons/fa";
import { FaArrowRotateRight } from "react-icons/fa6";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Slider from "@/components/ui/Slider";
import { getToken } from "@/lib/token";
import { formatTime } from "@/lib/time";
import { usePreferenceStore } from "@/lib/stores/preference";

interface VideoPlayerProps {
  url: string;
  thumbnailUrl: string | null;
}

const FPS = 30;
const CONTROLS_HIDE_DELAY_MS = 2500;

export function VideoPlayer({ url, thumbnailUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isMuted = usePreferenceStore((state) => state.isMuted);
  const setVolume = usePreferenceStore((state) => state.setVolume);

  const volume = usePreferenceStore((state) => state.volume);
  const toggleMute = usePreferenceStore((state) => state.toggleMute);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [seekDelta, setSeekDelta] = useState<number>(0);

  const [animation, setAnimation] = useState<
    "play" | "pause" | "mute" | "unmute" | null
  >(null);

  const isPlayingRef = useRef(isPlaying);
  const isMutedRef = useRef(isMuted);
  const volumeRef = useRef(volume);
  const controlsHideTimeoutRef = useRef<number | null>(null);

  const clamp = (value: number) => Math.max(0, Math.min(value, duration));

  const applyPreferences = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const nextVolume = Math.min(1, Math.max(0, volumeRef.current));
    video.muted = isMutedRef.current;
    video.defaultMuted = isMutedRef.current;
    video.volume = nextVolume;
  }, []);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const clearControlsHideTimeout = useCallback(() => {
    if (controlsHideTimeoutRef.current !== null) {
      window.clearTimeout(controlsHideTimeoutRef.current);
      controlsHideTimeoutRef.current = null;
    }
  }, []);

  const showControls = useCallback(
    (autoHide = true) => {
      setControlsVisible(true);
      clearControlsHideTimeout();

      if (autoHide && isPlayingRef.current) {
        controlsHideTimeoutRef.current = window.setTimeout(() => {
          setControlsVisible(false);
        }, CONTROLS_HIDE_DELAY_MS);
      }
    },
    [clearControlsHideTimeout]
  );

  useEffect(() => {
    isMutedRef.current = isMuted;
    volumeRef.current = volume;
    applyPreferences();
  }, [applyPreferences, isMuted, volume]);

  useEffect(() => {
    return () => clearControlsHideTimeout();
  }, [clearControlsHideTimeout]);

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
        applyPreferences();
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
      const onLoadedMetadata = () => {
        applyPreferences();
        if (isPlayingRef.current) {
          handlePlayPromise(video.play());
        } else {
          setIsBuffering(false);
        }
      };

      video.src = url;
      video.addEventListener("loadedmetadata", onLoadedMetadata);
      return () => {
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
      };
    } else {
      console.error("HLS is not supported in this browser.");
    }
  }, [applyPreferences, url]);

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

  const handleJump = (value: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = clamp(value);
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (delta: number) => {
    if (videoRef.current) {
      handleJump(videoRef.current.currentTime + delta);
      setSeekDelta((prev) => prev + delta);
    }

    setTimeout(() => setSeekDelta(0), 1000);
  };

  const handleVolumeChange = useCallback(
    (volume: number) => {
      if (volume === 0) {
        setVolume(0);
        if (videoRef.current) {
          videoRef.current.muted = true;
        }
      } else {
        setVolume(volume);
        if (videoRef.current) {
          videoRef.current.volume = volume;
          videoRef.current.muted = false;
        }
      }
    },
    [setVolume, toggleMute]
  );

  const triggerAnimation = (type: "play" | "pause" | "mute" | "unmute") => {
    setAnimation(type);
    setTimeout(() => setAnimation(null), 500);
  };

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    showControls(true);
    if (video.paused || video.ended) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [showControls]);

  const handleToggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      toggleMute();
      triggerAnimation(isMuted ? "mute" : "unmute");
      if (isMuted) {
        videoRef.current.volume = volume;
      }
    }
  }, [isMuted, toggleMute, volume]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }

    container.requestFullscreen().catch(() => {});
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const jumpToFrame = (delta: number) => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    video.pause();

    const frameDuration = delta / FPS;

    const newTime = clamp(video.currentTime + frameDuration);

    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  useHotkeys(
    ["space", "k"],
    () => {
      togglePlay();
      triggerAnimation(isPlaying ? "pause" : "play");
    },
    { preventDefault: true }
  );

  useHotkeys("f", toggleFullscreen);
  useHotkeys("m", handleToggleMute);

  useHotkeys("arrowleft", () => handleSeek(-5));
  useHotkeys("arrowright", () => handleSeek(5));

  useHotkeys("j", () => handleSeek(-10));
  useHotkeys("l", () => handleSeek(10));

  useHotkeys("comma", () => jumpToFrame(-1));
  useHotkeys("period", () => jumpToFrame(1));

  useHotkeys(
    ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    (e) => {
      handleJump(duration * (parseInt(e.key) / 10));
    },
    { preventDefault: true }
  );

  return (
    <div
      ref={containerRef}
      onPointerMove={() => showControls(true)}
      onPointerDown={() => showControls(true)}
      className="group relative aspect-video lg:rounded-lg bg-black overflow-hidden shadow-lg group"
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
        {seekDelta < 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.75, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: 0 }}
            className="absolute inset-0 w-1/3 grid place-items-center pointer-events-none"
          >
            <div className="text-white text-xl flex flex-row items-center gap-3">
              <FaBackward className="size-6" />
              <span>{seekDelta}</span>
            </div>
          </motion.div>
        )}
        {seekDelta > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.75, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: 0 }}
            className="absolute top-0 bottom-0 right-0 w-1/3 grid place-items-center pointer-events-none"
          >
            <div className="text-white text-xl flex flex-row items-center gap-3">
              <span>+{seekDelta}</span>
              <FaForward className="size-6" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <video
        ref={videoRef}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => {
          isPlayingRef.current = true;
          setIsPlaying(true);
          showControls(true);
        }}
        onPause={() => {
          isPlayingRef.current = false;
          setIsPlaying(false);
          showControls(false);
        }}
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
        className={`${
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        } absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-2 pt-4 transition-opacity duration-300`}
      >
        <Slider
          step={0.25}
          value={currentTime}
          max={duration || 100}
          onChange={handleJump}
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
                onClick={handleToggleMute}
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
