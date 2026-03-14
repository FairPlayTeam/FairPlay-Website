"use client";

import Hls, { Level } from "hls.js";
import { useHotkeys } from "react-hotkeys-hook";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import { Spinner } from "@/components/ui/spinner";
import { Slider } from "@/components/ui/slider";
import { getToken } from "@/lib/token";
import { cn } from "@/lib/utils";
import { usePreferenceStore } from "@/lib/stores/preference";
import { useVideoAmbilight } from "./player/use-video-ambilight";
import { VideoPlayerControls } from "./player/video-player-controls";
import { VideoPlayerOverlays } from "./player/video-player-overlays";

interface VideoPlayerProps {
  url: string;
  thumbnailUrl: string | null;
}

type OverlayAnimation = "play" | "pause" | "mute" | "unmute" | null;

const FPS = 30;
const CONTROLS_HIDE_DELAY_MS = 2500;

export function VideoPlayer({ url, thumbnailUrl }: VideoPlayerProps) {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLCanvasElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const resolutionSelectRef = useRef<HTMLSelectElement>(null);

  // Store Preferences
  const isMuted = usePreferenceStore((s) => s.isMuted);
  const toggleMute = usePreferenceStore((s) => s.toggleMute);
  const volume = usePreferenceStore((s) => s.volume);
  const setVolume = usePreferenceStore((s) => s.setVolume);
  
  const playbackRate = usePreferenceStore((state) => state.playbackRate);
  const setPlaybackRatePref = usePreferenceStore((state) => state.setPlaybackRate);
  
  const loop = usePreferenceStore((state) => state.loop);
  const setLoopPref = usePreferenceStore((state) => state.setLoop);

  // Player State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekDelta, setSeekDelta] = useState<number>(0);
  const [animation, setAnimation] = useState<OverlayAnimation>(null);

  // Settings State
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeSetting, setActiveSetting] = useState<"main" | "quality" | "speed">("main");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [availableLevels, setAvailableLevels] = useState<Level[]>([]);
  const [autoLabel, setAutoLabel] = useState("Auto");
  const [levelIndexMap, setLevelIndexMap] = useState<number[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number>(-1); // -1 = auto
  const [userSelectedLevel, setUserSelectedLevel] = useState(false);

  const isPlayingRef = useRef(isPlaying);
  const isMutedRef = useRef(isMuted);
  const volumeRef = useRef(volume);
  const controlsHideTimeoutRef = useRef<number | null>(null);

  useVideoAmbilight({
    videoRef,
    glowRef,
    enabled: true,
    blendFactor: 0.1,
    blurPx: 80,
    opacity: 0.4,
  });

  const clamp = useCallback(
    (value: number) => Math.max(0, Math.min(value, duration)),
    [duration]
  );

  const applyPreferences = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMutedRef.current;
    video.defaultMuted = isMutedRef.current;
    video.volume = Math.min(1, Math.max(0, volumeRef.current));
    video.playbackRate = playbackRate;
    video.loop = loop;
  }, [playbackRate, loop]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isMutedRef.current = isMuted;
    volumeRef.current = volume;
    applyPreferences();
  }, [isMuted, volume, applyPreferences]);

  const clearControlsHideTimeout = useCallback(() => {
    if (controlsHideTimeoutRef.current !== null) {
      window.clearTimeout(controlsHideTimeoutRef.current);
      controlsHideTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearControlsHideTimeout();
  }, [clearControlsHideTimeout]);

  const showControls = useCallback(
    (autoHide = true) => {
      setControlsVisible(true);
      clearControlsHideTimeout();

      if (autoHide && isPlayingRef.current) {
        controlsHideTimeoutRef.current = window.setTimeout(
          () => setControlsVisible(false),
          CONTROLS_HIDE_DELAY_MS
        );
      }
    },
    [clearControlsHideTimeout]
  );

  const triggerAnimation = (type: Exclude<OverlayAnimation, null>) => {
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
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    toggleMute();
    triggerAnimation(isMuted ? "unmute" : "mute");
    if (isMuted) {
      video.volume = volume;
    }
  }, [isMuted, toggleMute, volume]);

  const handleJump = useCallback(
    (value: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = clamp(value);
        setCurrentTime(videoRef.current.currentTime);
      }
    },
    [clamp]
  );

  const handleSeek = useCallback(
    (delta: number) => {
      if (videoRef.current) {
        handleJump(videoRef.current.currentTime + delta);
        setSeekDelta((prev) => prev + delta);
      }
      setTimeout(() => setSeekDelta(0), 1000);
    },
    [handleJump]
  );

  const jumpToFrame = useCallback(
    (delta: number) => {
      if (!videoRef.current) return;
      const video = videoRef.current;
      video.pause();

      const frameDuration = delta / FPS;
      const newTime = clamp(video.currentTime + frameDuration);

      video.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [clamp]
  );

  const handleVolumeChange = useCallback(
    (value: number) => {
      const video = videoRef.current;
      if (!video) return;

      if (value === 0) {
        setVolume(0);
        video.muted = true;
      } else {
        setVolume(value);
        video.volume = value;
        video.muted = false;
      }
    },
    [setVolume]
  );

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      container.requestFullscreen().catch(() => {});
    }
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      setContextMenu({ x: event.clientX, y: event.clientY });
      setSettingsOpen(false);
    },
    []
  );

  const handleToggleLoop = useCallback(() => {
    setLoopPref(!loop);
    closeContextMenu();
  }, [closeContextMenu, loop, setLoopPref]);

  const handlePictureInPicture = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    if (
      document.pictureInPictureElement === video &&
      document.exitPictureInPicture
    ) {
      await document.exitPictureInPicture();
      closeContextMenu();
      return;
    }

    if (video.requestPictureInPicture) {
      try {
        await video.requestPictureInPicture();
      } catch {
        // ignore
      }
    }

    closeContextMenu();
  }, [closeContextMenu]);

  const handleCast = useCallback(async () => {
    type CastWindow = Window & {
      chrome?: {
        cast?: {
          framework: {
            CastContext: {
              getInstance: () => { requestSession: () => void };
            };
          };
        };
      };
    };

    const win = window as CastWindow;
    const castContext = win.chrome?.cast?.framework.CastContext;
    if (castContext) {
      try {
        const context = castContext.getInstance();
        context.requestSession();
      } catch {
        // ignore
      }
    } else {
      type PresentationNavigator = Navigator & {
        presentation?: { requestSession: (url: string) => Promise<void> };
      };

      const nav = navigator as PresentationNavigator;
      if (nav.presentation?.requestSession) {
        try {
          await nav.presentation.requestSession(window.location.href);
        } catch {
          // ignore
        }
      } else {
        alert("Casting is not supported in this browser.");
      }
    }

    closeContextMenu();
  }, [closeContextMenu]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
      } catch {
        // ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard.");
      } catch {
        // ignore
      }
    }

    closeContextMenu();
  }, [closeContextMenu]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (settingsOpen && resolutionSelectRef.current) {
      resolutionSelectRef.current.focus();
    }
  }, [settingsOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (settingsOpen) {
          setSettingsOpen(false);
          setActiveSetting("main");
        }
        if (contextMenu) {
          closeContextMenu();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [settingsOpen, contextMenu, closeContextMenu]);

  useEffect(() => {
    if (!contextMenu) return;
    const handleClickAway = () => closeContextMenu();
    window.addEventListener("mousedown", handleClickAway);
    return () => window.removeEventListener("mousedown", handleClickAway);
  }, [contextMenu, closeContextMenu]);

  // HLS Initialization
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // observe loop property changes (context menu toggle)
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "loop") {
          setLoopPref(video.loop);
        }
      }
    });
    obs.observe(video, { attributes: true });

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

      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        applyPreferences();
        
        // populate quality options
        const raw = hls.levels || [];
        const paired = raw.map((lvl, idx) => ({ lvl, idx }));
        paired.sort((a, b) => {
          const ha = a.lvl.height || a.lvl.bitrate || 0;
          const hb = b.lvl.height || b.lvl.bitrate || 0;
          return hb - ha;
        });
        
        const sorted = paired.map((p) => p.lvl);
        setAvailableLevels(sorted);
        setLevelIndexMap(paired.map((p) => p.idx));
        
        if (sorted.length > 0) {
          const top = sorted[0];
          const h = top.height || 0;
          setAutoLabel(`Auto (${h >= 1080 ? "HD" : "SD"})`);
        } else {
          setAutoLabel("Auto");
        }
        
        setSelectedLevel((prev) => (userSelectedLevel ? prev : -1));

        if (isPlayingRef.current) {
          handlePlayPromise(video.play());
        } else {
          setIsBuffering(false);
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, () => {
        if (!userSelectedLevel) {
          const orig = hls.currentLevel;
          const idx = levelIndexMap.findIndex((i) => i === orig);
          setSelectedLevel(idx !== -1 ? idx : -1);
        }
      });

      return () => {
        hls.destroy();
        obs.disconnect();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
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
        obs.disconnect();
      };
    } else {
      console.error("HLS is not supported in this browser.");
    }
  }, [url]); // Excluded applyPreferences explicitly to avoid stream resets on preference change

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
    <div className="relative isolate">
      <canvas ref={glowRef} aria-hidden />

      <div
        ref={containerRef}
        onPointerMove={() => showControls(true)}
        onPointerDown={() => showControls(true)}
        onContextMenu={handleContextMenu}
        className="group relative aspect-video overflow-hidden bg-black shadow-lg lg:rounded-lg"
      >
        <VideoPlayerOverlays animation={animation} seekDelta={seekDelta} />

        <video
          ref={videoRef}
          onClick={togglePlay}
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
              setIsBuffering(false);
            }
          }}
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
          className="h-full w-full cursor-pointer object-contain"
        />

        {isBuffering && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <Spinner className="size-18" />
          </div>
        )}

        <VideoPlayerControls
          controlsVisible={controlsVisible}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          isMuted={isMuted}
          volume={volume}
          isFullscreen={isFullscreen}
          onSeek={handleJump}
          onTogglePlay={togglePlay}
          onToggleMute={handleToggleMute}
          onVolumeChange={handleVolumeChange}
          onToggleFullscreen={toggleFullscreen}
          onToggleSettings={() => setSettingsOpen((prev) => {
            const next = !prev;
            if (!next) setActiveSetting("main");
            return next;
          })}
        />

        <AnimatePresence>
          {contextMenu && (
            <motion.div
              key="context-menu"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.12 }}
              className="fixed z-40 bg-black/80 text-white rounded shadow-lg overflow-hidden"
              style={{
                top: contextMenu.y,
                left: contextMenu.x,
                minWidth: 180,
                transform: "translate(-10px, -10px)",
              }}
            >
              <button
                onClick={handleToggleLoop}
                className="w-full px-3 py-2 flex items-center justify-between text-left text-sm hover:bg-white/10"
              >
                <span>Loop</span>
                <span className="text-xs text-white/60">{loop ? "✓" : ""}</span>
              </button>
              <button
                onClick={handlePictureInPicture}
                className="w-full px-3 py-2 text-left text-sm hover:bg-white/10"
              >
                Picture-in-Picture
              </button>
              <button
                onClick={handleCast}
                className="w-full px-3 py-2 text-left text-sm hover:bg-white/10"
              >
                Cast
              </button>
              <button
                onClick={handleShare}
                className="w-full px-3 py-2 text-left text-sm hover:bg-white/10"
              >
                Share
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {settingsOpen && (
          <motion.div
            ref={settingsPanelRef}
            initial={{ opacity: 0, scale: 0.8, x: 12, y: 12 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 12, y: 12 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="absolute bottom-14 right-2 bg-black/60 text-white p-2 rounded z-30 origin-bottom-right shadow-lg"
            style={{ width: activeSetting === "main" ? 160 : 280 }}
          >
            <AnimatePresence mode="wait">
              {activeSetting === "main" ? (
                <motion.div
                  key="main"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.16 }}
                  className="space-y-2"
                >
                  <div className="text-xs uppercase tracking-wide text-white/70">
                    Settings
                  </div>
                  <button
                    onClick={() => setActiveSetting("quality")}
                    className="flex items-center justify-between w-full px-2 py-2 rounded hover:bg-white/10"
                  >
                    <span className="text-sm">Quality</span>
                    <span className="text-xs text-white/70">
                      {selectedLevel === -1
                        ? autoLabel
                        : availableLevels[selectedLevel]?.height
                        ? `${availableLevels[selectedLevel].height}p`
                        : `${Math.round(
                            (availableLevels[selectedLevel]?.bitrate ?? 0) /
                              1000
                          )}kbps`}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveSetting("speed")}
                    className="flex items-center justify-between w-full px-2 py-2 rounded hover:bg-white/10"
                  >
                    <span className="text-sm">Speed</span>
                    <span className="text-xs text-white/70">
                      {playbackRate.toFixed(2)}x
                    </span>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={activeSetting}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.16 }}
                  className="space-y-3"
                >
                  <button
                    onClick={() => setActiveSetting("main")}
                    className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
                  >
                    <FaArrowLeft className="size-4" />
                    Back
                  </button>

                  {activeSetting === "quality" && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium">Resolution</div>
                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            if (hlsRef.current) {
                              hlsRef.current.currentLevel = -1;
                            }
                            setSelectedLevel(-1);
                            setUserSelectedLevel(true);
                          }}
                          className={cn(
                            "w-full text-left px-2 py-2 rounded",
                            selectedLevel === -1
                              ? "bg-accent text-black"
                              : "hover:bg-white/10"
                          )}
                        >
                          {autoLabel}
                        </button>
                        {availableLevels.map((lvl, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (hlsRef.current) {
                                const orig = levelIndexMap[i] ?? -1;
                                hlsRef.current.currentLevel = orig;
                              }
                              setSelectedLevel(i);
                              setUserSelectedLevel(true);
                            }}
                            className={cn(
                              "w-full text-left px-2 py-2 rounded",
                              selectedLevel === i
                                ? "bg-accent text-black"
                                : "hover:bg-white/10"
                            )}
                          >
                            {lvl.height
                              ? `${lvl.height}p`
                              : `${Math.round(lvl.bitrate / 1000)}kbps`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeSetting === "speed" && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium">Playback speed</div>
                      <div className="grid grid-cols-3 gap-2">
                        {[0.5, 0.75, 1, 1.5, 2, 4].map((preset) => (
                          <button
                            key={preset}
                            onClick={() => setPlaybackRatePref(preset)}
                            className={cn(
                              "text-xs px-2 py-2 rounded",
                              playbackRate === preset
                                ? "bg-accent text-black"
                                : "bg-white/20 hover:bg-white/30"
                            )}
                          >
                            {preset}x
                          </button>
                        ))}
                      </div>
                      <Slider
                        min={0.1}
                        max={4}
                        step={0.05}
                        value={[playbackRate]}
                        onValueChange={(values) => setPlaybackRatePref(values[0])}
                        trackClassName="bg-white/30 h-1"
                        rangeClassName="bg-white"
                        thumbClassName="bg-white"
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}