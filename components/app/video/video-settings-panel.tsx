"use client";

import Hls, { Level } from "hls.js";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface VideoSettingsPanelProps {
  open: boolean;
  onClose: () => void;
  availableLevels: Level[];
  autoLabel: string;
  selectedLevel: number;
  setSelectedLevel: (n: number) => void;
  setUserSelectedLevel: (v: boolean) => void;
  userSelectedLevelRef: React.MutableRefObject<boolean>;
  levelIndexMap: number[];
  setPreferredQuality: (quality: string) => void;
  playbackRate: number;
  setPlaybackRatePref: (rate: number) => void;
  ambilight: boolean;
  setAmbilight: (enabled: boolean) => void;
  hlsRef: React.MutableRefObject<Hls | null>;
  showControls: (autoHide?: boolean) => void;
}

export default function VideoSettingsPanel({
  open,
  onClose,
  availableLevels,
  autoLabel,
  selectedLevel,
  setSelectedLevel,
  setUserSelectedLevel,
  userSelectedLevelRef,
  levelIndexMap,
  setPreferredQuality,
  playbackRate,
  setPlaybackRatePref,
  ambilight,
  setAmbilight,
  hlsRef,
  showControls,
}: VideoSettingsPanelProps) {
  const [activeSetting, setActiveSetting] = useState<"main" | "quality" | "speed">("main");

  const panelRef = useRef<HTMLDivElement>(null);
  const resolutionSelectRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    resolutionSelectRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleClickAway = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;

      const settingsButton = document.querySelector('[data-settings-button]');
      if (settingsButton && (settingsButton === target || settingsButton.contains(target))) return;

      setActiveSetting("main");
      showControls(true);
      onClose();
    };

    window.addEventListener("mousedown", handleClickAway);
    return () => window.removeEventListener("mousedown", handleClickAway);
  }, [open, onClose, showControls]);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveSetting("main");
    showControls(false);
  }, [open, showControls]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.8, x: 12, y: 12 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, x: 12, y: 12 }}
        transition={{ type: "spring", stiffness: 450, damping: 30 }}
        className="absolute bottom-14 right-2 bg-black/60 text-white p-2 rounded z-30 origin-bottom-right shadow-lg"
        style={{ width: activeSetting === "main" ? 160 : 200 }}
      >
        {activeSetting === "main" ? (
          <motion.div
            key="main"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.16 }}
            className="space-y-2"
          >
            <div className="text-xs tracking-wide text-white/70">Settings</div>

            <button
              onClick={() => setAmbilight(!ambilight)}
              className="flex items-center justify-between w-full px-2 py-2 rounded hover:bg-white/10"
            >
              <span className="text-sm">Ambient Light</span>
              <Switch
                checked={ambilight}
                onCheckedChange={(checked) => setAmbilight(Boolean(checked))}
                size="sm"
                className="ml-2"
              />
            </button>

            <button
              onClick={() => setActiveSetting("speed")}
              className="flex items-center justify-between w-full px-2 py-2 rounded hover:bg-white/10"
            >
              <span className="text-sm">Speed</span>
              <span className="text-xs text-white/70">{playbackRate.toFixed(2)}x</span>
            </button>

            <button
              ref={resolutionSelectRef}
              onClick={() => setActiveSetting("quality")}
              className="flex items-center justify-between w-full px-2 py-2 rounded hover:bg-white/10"
            >
              <span className="text-sm">Quality</span>
              <span className="text-xs text-white/70">
                {selectedLevel === -1
                  ? autoLabel
                  : availableLevels[selectedLevel]?.height
                  ? `${availableLevels[selectedLevel].height}p`
                  : `${Math.round((availableLevels[selectedLevel]?.bitrate ?? 0) / 1000)}kbps`}
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
                <div className="text-sm font-medium">Resolution:</div>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  <button
                    onClick={() => {
                      if (hlsRef.current) {
                        hlsRef.current.nextLevel = -1;
                      }
                      setSelectedLevel(-1);
                      setUserSelectedLevel(false);
                      userSelectedLevelRef.current = false;
                      setPreferredQuality("auto");
                    }}
                    className={cn(
                      "w-full text-sm text-left px-2 py-2 rounded",
                      selectedLevel === -1
                        ? "bg-primary"
                        : "bg-accent/20 hover:bg-accent/60"
                    )}
                  >
                    {autoLabel}
                  </button>
                  {availableLevels.map((lvl, i) => {
                    const qualityId = lvl.height
                      ? `h:${lvl.height}`
                      : `b:${lvl.bitrate}`;

                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (hlsRef.current) {
                            const orig = levelIndexMap[i] ?? -1;
                            hlsRef.current.nextLevel = orig;
                          }
                          setSelectedLevel(i);
                          setUserSelectedLevel(true);
                          userSelectedLevelRef.current = true;
                          setPreferredQuality(qualityId);
                        }}
                        className={cn(
                          "w-full text-sm text-left px-2 py-2 rounded",
                          selectedLevel === i
                            ? "bg-primary"
                            : "bg-accent/20 hover:bg-accent/60"
                        )}
                      >
                        {lvl.height ? `${lvl.height}p` : `${Math.round(lvl.bitrate / 1000)}kbps`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeSetting === "speed" && (
              <div className="space-y-3">
                <div className="text-sm font-medium">Speed Presets:</div>
                <div className="grid grid-cols-3 gap-2">
                  {[0.5, 0.75, 1, 1.5, 2, 4].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setPlaybackRatePref(preset)}
                      className={cn(
                        "text-xs px-2 py-2 rounded",
                        playbackRate === preset
                          ? "bg-primary"
                          : "bg-accent/20 hover:bg-accent/30"
                      )}
                    >
                      {preset}x
                    </button>
                  ))}
                </div>
                <div className="text-sm font-medium">Playback Speed: {playbackRate.toFixed(2)}x</div>
                <Slider
                  min={0.1}
                  max={4}
                  step={0.05}
                  value={[playbackRate]}
                  onValueChange={(values) => setPlaybackRatePref(values[0])}
                  trackClassName="bg-muted h-1"
                  rangeClassName="bg-primary"
                  thumbClassName="bg-white"
                />
              </div>
            )}

          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
