"use client";

import {
  FaCog,
  FaCompress,
  FaExpand,
  FaPause,
  FaPlay,
  FaVolumeDown,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import { FaArrowRotateRight } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatTime } from "@/lib/time";

type VideoPlayerControlsProps = {
  controlsVisible: boolean;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isFullscreen: boolean;
  settingsOpen: boolean;
  onSeek: (value: number) => void;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolumeChange: (value: number) => void;
  onToggleFullscreen: () => void;
  onToggleSettings?: () => void;
};

export function VideoPlayerControls({
  controlsVisible,
  currentTime,
  duration,
  isPlaying,
  isMuted,
  volume,
  isFullscreen,
  settingsOpen,
  onSeek,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onToggleFullscreen,
  onToggleSettings,
}: VideoPlayerControlsProps) {
  return (
    <div
      className={`${
        controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
      } absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent px-4 pb-2 pt-4 transition-opacity duration-300`}
    >
      <Slider
        value={[currentTime]}
        onValueChange={(values) => onSeek(values[0])}
        step={0.25}
        max={duration || 100}
        className="mb-3 h-1 bg-muted"
        aria-label="timeline"
        disabled={duration === 0}
      />

      <div className="flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={onTogglePlay} className="rounded-full">
            {currentTime >= duration ? (
              <FaArrowRotateRight />
            ) : isPlaying ? (
              <FaPause />
            ) : (
              <FaPlay />
            )}
          </Button>

          <div className="group/volume flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={onToggleMute} className="rounded-full">
              {isMuted || volume === 0 ? (
                <FaVolumeMute />
              ) : volume < 0.5 ? (
                <FaVolumeDown />
              ) : (
                <FaVolumeUp />
              )}
            </Button>

            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={(values) => onVolumeChange(values[0])}
              min={0}
              max={1}
              step={0.05}
              className="mr-2 h-1 w-0 overflow-hidden bg-muted transition-all duration-200 group-hover/volume:w-14 group-hover/volume:overflow-visible"
              aria-label="volume"
            />
          </div>

          <div className="text-sm font-medium">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onToggleSettings ? (
            <Button
              data-settings-button
              size="icon"
              variant="ghost"
              onClick={onToggleSettings}
              aria-expanded={settingsOpen}
              className="rounded-full"
            >
              <FaCog />
            </Button>
          ) : null}
          <Button size="icon" variant="ghost" onClick={onToggleFullscreen} className="rounded-full">
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </Button>
        </div>
      </div>
    </div>
  );
}
