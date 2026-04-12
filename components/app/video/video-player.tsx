"use client";

import Hls, { Level, Events } from "hls.js";
import { useHotkeys } from "react-hotkeys-hook";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaRedo, FaWindowRestore, FaShareAlt, FaChartLine } from "react-icons/fa";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import VideoStatsPanel from "@/components/app/video/player/video-stats-panel";
import VideoSettingsPanel from "@/components/app/video/player/video-settings-panel";
import { usePreferenceStore } from "@/lib/stores/preference";
import { useVideoAmbilight } from "./player/use-video-ambilight";
import { useMediaQuery } from "@/hooks/use-media-query";
import { VideoPlayerControls } from "./player/video-player-controls";
import { VideoPlayerOverlays } from "./player/video-player-overlays";
import { cn } from "@/lib/utils";

type VideoPlayerProps = {
  url: string;
  thumbnailUrl: string | null;
  isTheatreMode?: boolean;
  onToggleTheatreMode?: () => void;
};

type OverlayAnimation = "play" | "pause" | "mute" | "unmute" | null;

const FPS = 30;
const CONTROLS_HIDE_DELAY_MS = 2500;

function getProxiedMediaUrl(url: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) return url;

  try {
    const normalizedApiBaseUrl = apiBaseUrl.replace(/\/$/, "");
    const targetUrl = new URL(url);
    const apiUrl = new URL(normalizedApiBaseUrl);

    if (targetUrl.origin !== apiUrl.origin) {
      return url;
    }

    const apiPathPrefix = `${apiUrl.pathname.replace(/\/$/, "")}/`;
    if (!targetUrl.pathname.startsWith(apiPathPrefix)) {
      return url;
    }

    const relativePath = targetUrl.pathname.slice(apiPathPrefix.length);
    const proxiedPath = relativePath.split("/").filter(Boolean).map(encodeURIComponent).join("/");

    return `/api/media/${proxiedPath}${targetUrl.search}`;
  } catch {
    return url;
  }
}

export function VideoPlayer({
  url,
  thumbnailUrl,
  isTheatreMode = false,
  onToggleTheatreMode,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLCanvasElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Store Preferences
  const isMuted = usePreferenceStore((s) => s.isMuted);
  const toggleMute = usePreferenceStore((s) => s.toggleMute);
  const volume = usePreferenceStore((s) => s.volume);
  const setVolume = usePreferenceStore((s) => s.setVolume);

  const playbackRate = usePreferenceStore((s) => s.playbackRate);
  const setPlaybackRatePref = usePreferenceStore((s) => s.setPlaybackRate);

  const loop = usePreferenceStore((s) => s.loop);
  const setLoopPref = usePreferenceStore((s) => s.setLoop);

  const preferredQuality = usePreferenceStore((s) => s.preferredQuality);
  const setPreferredQuality = usePreferenceStore((s) => s.setPreferredQuality);

  const ambilight = usePreferenceStore((s) => s.ambilight);
  const setAmbilight = usePreferenceStore((s) => s.setAmbilight);

  // Player State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekDelta, setSeekDelta] = useState<number>(0);
  const [animation, setAnimation] = useState<OverlayAnimation>(null);

  // Extracted Panels & Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [availableLevels, setAvailableLevels] = useState<Level[]>([]);
  const [autoLabel, setAutoLabel] = useState("Auto");
  const [levelIndexMap, setLevelIndexMap] = useState<number[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number>(-1); // -1 = auto
  const [userSelectedLevel, setUserSelectedLevel] = useState(false);
  const settingsOpenRef = useRef(settingsOpen);

  // Mutable refs to prevent stale closures in event listeners
  const availableLevelsRef = useRef<Level[]>([]);
  const levelIndexMapRef = useRef<number[]>([]);
  const userSelectedLevelRef = useRef(userSelectedLevel);
  const isPlayingRef = useRef(isPlaying);
  const isMutedRef = useRef(isMuted);
  const volumeRef = useRef(volume);
  const controlsHideTimeoutRef = useRef<number | null>(null);

  // Support share-at-time via ?t=<seconds> query param
  const initialTimeRef = useRef<number>(0);
  const mediaUrl = getProxiedMediaUrl(url);

  // Determine if we're on desktop for default ambilight preference
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // If the user hasn't explicitly selected an ambilight preference, default to off on mobile.
  useEffect(() => {
    if (ambilight === undefined) {
      setAmbilight(isDesktop);
    }
  }, [ambilight, isDesktop, setAmbilight]);

  useVideoAmbilight({
    videoRef,
    glowRef,
    enabled: !!ambilight,
    blendFactor: 0.1,
    blurPx: 80,
    opacity: 0.4,
  });

  // Sync refs
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  useEffect(() => {
    userSelectedLevelRef.current = userSelectedLevel;
  }, [userSelectedLevel]);
  useEffect(() => {
    settingsOpenRef.current = settingsOpen;
  }, [settingsOpen]);

  useEffect(() => {
    availableLevelsRef.current = availableLevels;
  }, [availableLevels]);
  useEffect(() => {
    levelIndexMapRef.current = levelIndexMap;
  }, [levelIndexMap]);

  const clamp = useCallback((value: number) => Math.max(0, Math.min(value, duration)), [duration]);

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
    isMutedRef.current = isMuted;
    volumeRef.current = volume;
    applyPreferences();
  }, [isMuted, volume, applyPreferences]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const t = url.searchParams.get("t");
    if (!t) return;
    const parsed = Number(t);
    if (Number.isFinite(parsed) && parsed > 0) {
      initialTimeRef.current = parsed;
    }
  }, []);

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

      // When settings panel is open, keep controls visible and avoid auto-hide
      if (autoHide && isPlayingRef.current && !settingsOpenRef.current) {
        controlsHideTimeoutRef.current = window.setTimeout(
          () => setControlsVisible(false),
          CONTROLS_HIDE_DELAY_MS,
        );
      }
    },
    [clearControlsHideTimeout],
  );

  const openSettings = useCallback(() => {
    settingsOpenRef.current = true;
    setSettingsOpen(true);
    showControls(false);
  }, [showControls]);

  const closeSettings = useCallback(() => {
    settingsOpenRef.current = false;
    setSettingsOpen(false);
    showControls(true);
  }, [showControls]);

  const toggleSettings = useCallback(() => {
    if (settingsOpenRef.current) {
      closeSettings();
    } else {
      openSettings();
    }
  }, [closeSettings, openSettings]);

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
    [clamp],
  );

  const handleSeek = useCallback(
    (delta: number) => {
      if (videoRef.current) {
        handleJump(videoRef.current.currentTime + delta);
        setSeekDelta((prev) => prev + delta);
      }
      setTimeout(() => setSeekDelta(0), 1000);
    },
    [handleJump],
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
    [clamp],
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
    [setVolume],
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

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  }, []);

  const handleToggleLoop = useCallback(() => {
    setLoopPref(!loop);
    closeContextMenu();
  }, [closeContextMenu, loop, setLoopPref]);

  const handlePictureInPicture = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.pictureInPictureElement === video && document.exitPictureInPicture) {
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

  const handleShare = useCallback(async () => {
    const currentUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url: currentUrl });
      } catch {
        // ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(currentUrl);
        toast.success("Link copied to clipboard.");
      } catch {
        // ignore
      }
    }
    closeContextMenu();
  }, [closeContextMenu]);

  const handleShareAtTime = useCallback(async () => {
    const url = new URL(window.location.href);
    const time = Math.floor(currentTime);
    if (time > 0) {
      url.searchParams.set("t", String(time));
    } else {
      url.searchParams.delete("t");
    }

    const shareUrl = url.toString();
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url: shareUrl });
      } catch {
        // ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard.");
      } catch {
        // ignore
      }
    }

    closeContextMenu();
  }, [closeContextMenu, currentTime]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && contextMenu) {
        closeContextMenu();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [contextMenu, closeContextMenu]);

  useEffect(() => {
    if (!contextMenu) return;
    const handleClickAway = () => closeContextMenu();
    window.addEventListener("mousedown", handleClickAway);
    return () => window.removeEventListener("mousedown", handleClickAway);
  }, [contextMenu, closeContextMenu]);

  //  Auto-quality resolution calculation
  const getVideoViewportHeight = useCallback(() => {
    const el = containerRef.current ?? videoRef.current;
    return el ? el.clientHeight : 0;
  }, []);

  const computeAutoLevelIndex = useCallback(
    (levels: Level[]) => {
      if (!levels.length) return -1;

      const viewHeight = getVideoViewportHeight();
      if (!viewHeight) return 0;

      // Prefer smallest resolution >= view height (levels are sorted descending)
      const desired = Math.max(1, Math.round(viewHeight));
      for (let i = levels.length - 1; i >= 0; i -= 1) {
        const lvl = levels[i];
        if ((lvl.height ?? 0) >= desired) {
          return i;
        }
      }
      return 0; // Fallback highest
    },
    [getVideoViewportHeight],
  );

  const computeAutoLabel = useCallback((levels: Level[], idx: number) => {
    if (idx < 0 || idx >= levels.length) return "Auto";
    const lvl = levels[idx];
    if (!lvl) return "Auto";
    if (lvl.height) return `Auto (${lvl.height}p)`;
    if (lvl.bitrate) return `Auto (${Math.round(lvl.bitrate / 1000)}kbps)`;
    return "Auto";
  }, []);

  const applyAutoSelection = useCallback(
    (levels: Level[], indexMap: number[]) => {
      if (userSelectedLevelRef.current) return;
      if (!hlsRef.current || !levels.length) return;

      const idx = computeAutoLevelIndex(levels);
      if (idx === -1) return;

      const levelId = indexMap[idx] ?? -1;
      hlsRef.current.nextLevel = levelId;
      setSelectedLevel(-1);
      setAutoLabel(computeAutoLabel(levels, idx));
    },
    [computeAutoLabel, computeAutoLevelIndex],
  );

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      applyAutoSelection(availableLevelsRef.current, levelIndexMapRef.current);
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const handleResize = () => {
      applyAutoSelection(availableLevelsRef.current, levelIndexMapRef.current);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [applyAutoSelection]);

  // HLS initialization
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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
      const hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = true;
        },
      });

      hlsRef.current = hls;
      hls.loadSource(mediaUrl);
      hls.attachMedia(video);

      hls.on(Events.MANIFEST_PARSED, () => {
        applyPreferences();

        if (initialTimeRef.current > 0) {
          video.currentTime = initialTimeRef.current;
          setCurrentTime(initialTimeRef.current);
        }

        const raw = hls.levels || [];
        const paired = raw.map((lvl, idx) => ({ lvl, idx }));
        paired.sort((a, b) => {
          const ha = a.lvl.height || a.lvl.bitrate || 0;
          const hb = b.lvl.height || b.lvl.bitrate || 0;
          return hb - ha;
        });

        const sorted = paired.map((p) => p.lvl);
        const indexMap = paired.map((p) => p.idx);

        setAvailableLevels(sorted);
        setLevelIndexMap(indexMap);

        const autoIndex = computeAutoLevelIndex(sorted);
        setAutoLabel(computeAutoLabel(sorted, autoIndex));

        const preferred = preferredQuality;
        let initialSelected = -1;

        if (preferred !== "auto") {
          const [type, value] = preferred.split(":");
          initialSelected = sorted.findIndex((lvl) => {
            if (type === "h") return lvl.height === Number(value);
            if (type === "b") return lvl.bitrate === Number(value);
            return false;
          });
        }

        if (initialSelected !== -1) {
          const origIndex = indexMap[initialSelected] ?? -1;
          if (hlsRef.current) hlsRef.current.nextLevel = origIndex;
          setSelectedLevel(initialSelected);
          setUserSelectedLevel(true);
        } else {
          setSelectedLevel(-1);
          setUserSelectedLevel(false);
          if (hlsRef.current) {
            const best = indexMap[autoIndex] ?? -1;
            hlsRef.current.nextLevel = best;
          }
        }

        if (isPlayingRef.current) {
          handlePlayPromise(video.play());
        } else {
          setIsBuffering(false);
        }
      });

      hls.on(Events.LEVEL_SWITCHED, () => {
        // Use the ref to prevent stale closures overriding user preference
        if (userSelectedLevelRef.current) return;

        const orig = hls.currentLevel;
        const idx = levelIndexMapRef.current.findIndex((i) => i === orig);

        // Update auto label with the currently active level
        if (idx !== -1) {
          setSelectedLevel(-1);
          setAutoLabel(computeAutoLabel(availableLevelsRef.current, idx));
        } else {
          setSelectedLevel(-1);
        }
      });

      return () => {
        hls.destroy();
        obs.disconnect();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      const onLoadedMetadata = () => {
        applyPreferences();
        if (initialTimeRef.current > 0) {
          video.currentTime = initialTimeRef.current;
          setCurrentTime(initialTimeRef.current);
        }
        if (isPlayingRef.current) {
          handlePlayPromise(video.play());
        } else {
          setIsBuffering(false);
        }
      };

      video.src = mediaUrl;
      video.addEventListener("loadedmetadata", onLoadedMetadata);
      return () => {
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        obs.disconnect();
      };
    } else {
      console.error("HLS is not supported in this browser.");
    }
  }, [
    applyPreferences,
    computeAutoLabel,
    computeAutoLevelIndex,
    preferredQuality,
    setLoopPref,
    mediaUrl,
  ]);

  useHotkeys(
    ["space", "k"],
    () => {
      togglePlay();
      triggerAnimation(isPlaying ? "pause" : "play");
    },
    { preventDefault: true },
  );

  useHotkeys("f", toggleFullscreen);
  useHotkeys("t", () => onToggleTheatreMode?.(), { preventDefault: true });
  useHotkeys("m", handleToggleMute);
  useHotkeys("arrowleft", () => handleSeek(-5));
  useHotkeys("arrowright", () => handleSeek(5));
  useHotkeys("j", () => handleSeek(-10));
  useHotkeys("l", () => handleSeek(10));
  useHotkeys("comma", () => jumpToFrame(-1));
  useHotkeys("period", () => jumpToFrame(1));
  useHotkeys(
    ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    (e) => handleJump(duration * (parseInt(e.key) / 10)),
    { preventDefault: true },
  );

  return (
    <motion.div
      layout
      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
      className={cn(
        "relative z-0 max-w-full overflow-visible",
        isTheatreMode && "lg:mx-auto lg:w-full lg:max-w-[calc(80vh*16/9)]",
      )}
    >
      <canvas
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 hidden h-[110%] w-[110%] -translate-x-1/2 -translate-y-1/2 md:block"
      />

      <motion.div
        layout
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
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
              const video = videoRef.current;
              setDuration(video.duration);
              if (initialTimeRef.current > 0) {
                video.currentTime = initialTimeRef.current;
                setCurrentTime(initialTimeRef.current);
              }
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

        <VideoStatsPanel
          visible={statsVisible}
          onClose={() => setStatsVisible(false)}
          videoRef={videoRef}
          containerRef={containerRef}
          hlsRef={hlsRef}
        />

        <VideoSettingsPanel
          open={settingsOpen}
          onClose={closeSettings}
          availableLevels={availableLevels}
          autoLabel={autoLabel}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          setUserSelectedLevel={setUserSelectedLevel}
          userSelectedLevelRef={userSelectedLevelRef}
          levelIndexMap={levelIndexMap}
          setPreferredQuality={setPreferredQuality}
          playbackRate={playbackRate}
          setPlaybackRatePref={setPlaybackRatePref}
          ambilight={ambilight ?? false}
          setAmbilight={setAmbilight}
          hlsRef={hlsRef}
          showControls={showControls}
        />

        <VideoPlayerControls
          controlsVisible={controlsVisible}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          isMuted={isMuted}
          volume={volume}
          isFullscreen={isFullscreen}
          isTheatreMode={isTheatreMode}
          settingsOpen={settingsOpen}
          onSeek={handleJump}
          onTogglePlay={togglePlay}
          onToggleMute={handleToggleMute}
          onVolumeChange={handleVolumeChange}
          onToggleFullscreen={toggleFullscreen}
          onToggleTheatreMode={onToggleTheatreMode ?? (() => undefined)}
          onToggleSettings={toggleSettings}
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
                type="button"
                onClick={handleToggleLoop}
                className="w-full px-3 py-2 flex items-center justify-between text-left text-sm hover:bg-white/10"
              >
                <span className="flex items-center gap-2">
                  <FaRedo className="size-4" />
                  Loop
                </span>
                <span className="text-xs text-white/60">{loop ? "✓" : ""}</span>
              </button>
              <button
                type="button"
                onClick={handlePictureInPicture}
                className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-white/10"
              >
                <FaWindowRestore className="size-4" />
                Picture-in-Picture
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-white/10"
              >
                <FaShareAlt className="size-4" />
                Share
              </button>
              <button
                type="button"
                onClick={handleShareAtTime}
                className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-white/10"
              >
                <FaShareAlt className="size-4" />
                Share at current time
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatsVisible((visible) => !visible);
                  closeContextMenu();
                }}
                className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-white/10 border-t border-white/10 mt-1 pt-2"
              >
                <FaChartLine className="size-4" />
                Stats for nerds
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
