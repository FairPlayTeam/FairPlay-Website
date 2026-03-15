"use client";

import Hls, { Level, Events } from "hls.js";
import { useHotkeys } from "react-hotkeys-hook";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaRedo,
  FaWindowRestore,
  FaTv,
  FaShareAlt,
  FaChartLine,
} from "react-icons/fa";
import { Spinner } from "@/components/ui/spinner";
import VideoStatsPanel from "@/components/app/video/video-stats-panel";
import VideoSettingsPanel from "@/components/app/video/video-settings-panel";
import { getToken } from "@/lib/token";
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

  // Mutable refs to prevent stale closures in event listeners
  const availableLevelsRef = useRef<Level[]>([]);
  const levelIndexMapRef = useRef<number[]>([]);
  const userSelectedLevelRef = useRef(userSelectedLevel);
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

  // Sync refs
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { userSelectedLevelRef.current = userSelectedLevel; }, [userSelectedLevel]);
  useEffect(() => { availableLevelsRef.current = availableLevels; }, [availableLevels]);
  useEffect(() => { levelIndexMapRef.current = levelIndexMap; }, [levelIndexMap]);

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

  const handleCast = useCallback(async () => {
    type CastWindow = Window & {
      chrome?: {
        cast?: {
          framework: {
            CastContext: { getInstance: () => { requestSession: () => void } };
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
    [getVideoViewportHeight]
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
    [computeAutoLabel, computeAutoLevelIndex]
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

      hls.on(Events.MANIFEST_PARSED, () => {
        applyPreferences();

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
        setSelectedLevel(idx !== -1 ? idx : -1);
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
  }, [url]);

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
    (e) => handleJump(duration * (parseInt(e.key) / 10)),
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

        <VideoStatsPanel
          visible={statsVisible}
          onClose={() => setStatsVisible(false)}
          videoRef={videoRef}
          containerRef={containerRef}
          hlsRef={hlsRef}
        />

        <VideoSettingsPanel
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          availableLevels={availableLevels}
          autoLabel={autoLabel}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          userSelectedLevel={userSelectedLevel}
          setUserSelectedLevel={setUserSelectedLevel}
          userSelectedLevelRef={userSelectedLevelRef}
          levelIndexMap={levelIndexMap}
          setPreferredQuality={setPreferredQuality}
          playbackRate={playbackRate}
          setPlaybackRatePref={setPlaybackRatePref}
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
          onSeek={handleJump}
          onTogglePlay={togglePlay}
          onToggleMute={handleToggleMute}
          onVolumeChange={handleVolumeChange}
          onToggleFullscreen={toggleFullscreen}
          onToggleSettings={() => setSettingsOpen((prev) => !prev)}
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
                <span className="flex items-center gap-2">
                  <FaRedo className="size-4" />
                  Loop
                </span>
                <span className="text-xs text-white/60">{loop ? "✓" : ""}</span>
              </button>
              <button
                onClick={handlePictureInPicture}
                className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-white/10"
              >
                <FaWindowRestore className="size-4" />
                Picture-in-Picture
              </button>
              <button
                onClick={handleCast}
                className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-white/10"
              >
                <FaTv className="size-4" />
                Cast
              </button>
              <button
                onClick={handleShare}
                className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-white/10"
              >
                <FaShareAlt className="size-4" />
                Share
              </button>
              <button
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
      </div>
    </div>
  );
}