"use client";

import Hls, { Events, FragLoadedData } from "hls.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { X } from 'lucide-react'

export interface VideoStatsData {
  screen: { w: number; h: number };
  view: { w: number; h: number };
  resolution: string;
  bufferSeconds: number;
  bwKbps: number;
}

interface VideoStatsPanelProps {
  visible: boolean;
  onClose: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  hlsRef: React.MutableRefObject<Hls | null>;
}

export default function VideoStatsPanel({
  visible,
  onClose,
  videoRef,
  containerRef,
  hlsRef,
}: VideoStatsPanelProps) {
  const [statsData, setStatsData] = useState<VideoStatsData>({
    screen: { w: 0, h: 0 },
    view: { w: 0, h: 0 },
    resolution: "-",
    bufferSeconds: 0,
    bwKbps: 0,
  });

  const [bufferHistory, setBufferHistory] = useState<number[]>([]);
  const [bwHistory, setBwHistory] = useState<number[]>([]);

  const lastStatsSecondRef = useRef<number>(0);
  const lastFragLoadedAtRef = useRef<number>(0);
  const lastMeasuredBwKbpsRef = useRef<number>(0);

  const updateStats = useCallback(() => {
    const now = Date.now();
    const currentSecond = Math.floor(now / 1000);
    if (currentSecond === lastStatsSecondRef.current) return;
    lastStatsSecondRef.current = currentSecond;

    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    const viewEl = containerRef.current ?? videoRef.current;
    const viewWidth = viewEl?.clientWidth ?? 0;
    const viewHeight = viewEl?.clientHeight ?? 0;

    const hls = hlsRef.current;
    const currentLevel = hls?.currentLevel ?? -1;
    const level = hls?.levels?.[currentLevel];
    const resolution = level
      ? level.height
        ? `${level.height}p`
        : `${Math.round((level.bitrate ?? 0) / 1000)}kbps`
      : "-";

    const bufferSeconds = (() => {
      const video = videoRef.current;
      if (!video || !video.duration) return 0;
      const current = video.currentTime;
      for (let i = 0; i < video.buffered.length; i += 1) {
        const start = video.buffered.start(i);
        const end = video.buffered.end(i);
        if (current >= start && current <= end) {
          return Math.max(0, end - current);
        }
      }
      return 0;
    })();

    const recent = Date.now() - lastFragLoadedAtRef.current < 1500;
    const measuredBwKbps = recent ? lastMeasuredBwKbpsRef.current : 0;

    setBufferHistory((prev) => [...prev, bufferSeconds].slice(-20));

    setBwHistory((prev) => {
      const next = [...prev, measuredBwKbps].slice(-20);
      return next;
    });

    setStatsData({
      screen: { w: screenWidth, h: screenHeight },
      view: { w: viewWidth, h: viewHeight },
      resolution,
      bufferSeconds,
      bwKbps: measuredBwKbps,
    });
  }, [containerRef, hlsRef, videoRef]);

  useEffect(() => {
    if (!visible) return;

    updateStats();
    const interval = window.setInterval(updateStats, 1000);
    return () => window.clearInterval(interval);
  }, [updateStats, visible]);

  useEffect(() => {
    if (!visible) return;

    const hls = hlsRef.current;
    if (!hls) return;

    const onFragLoaded = (_: unknown, data: FragLoadedData) => {
      const bw = data.frag.stats.bwEstimate || hls.bandwidthEstimate;
      const kbps = bw ? Math.round(bw / 1000) : 0;
      lastMeasuredBwKbpsRef.current = kbps;
      lastFragLoadedAtRef.current = Date.now();
    };

    hls.on(Events.FRAG_LOADED, onFragLoaded);
    return () => {
      hls.off(Events.FRAG_LOADED, onFragLoaded);
    };
  }, [hlsRef, visible]);

  if (!visible) return null;

  return (
    <div className="pointer-events-auto absolute left-2 top-2 z-40 w-72 rounded bg-black/70 p-2 text-xs text-white">
      <div className="flex items-center justify-between">
        <div className="font-medium">Debug Info:</div>
        <button className="text-white/60 hover:text-white" onClick={onClose}>
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-2 grid gap-1">
        <div className="flex justify-between">
          <span className="text-white/70">Screen</span>
          <span>
            {statsData.screen.w}×{statsData.screen.h}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">View</span>
          <span>
            {statsData.view.w}×{statsData.view.h}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Level</span>
          <span>{statsData.resolution}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Buffered</span>
          <span>{statsData.bufferSeconds.toFixed(1)}s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Bandwidth</span>
          <span>{statsData.bwKbps} kbps</span>
        </div>

        <div className="mt-2 grid gap-1">
          <div className="text-white/70">Buffer (s)</div>
          <div className="flex h-2 gap-1">
            {bufferHistory.map((b, idx) => (
              <div
                key={idx}
                className="h-full bg-green-400"
                style={{ width: `${100 / 20}%`, opacity: Math.min(1, b / 10) }}
              />
            ))}
          </div>
          <div className="text-white/70">Bandwidth (kbps)</div>
          <div className="flex h-2 gap-1">
            {bwHistory.map((b, idx) => (
              <div
                key={idx}
                className="h-full bg-blue-400"
                style={{ width: `${100 / 20}%`, opacity: Math.min(1, b / 5000) }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
