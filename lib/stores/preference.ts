"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type PreferenceState = {
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  loop: boolean;
};

export type PreferenceActions = {
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  setLoop: (loop: boolean) => void;
};

export const usePreferenceStore = create<PreferenceState & PreferenceActions>()(
  devtools(
    persist(
      (set, get) => ({
        volume: 0.5,
        isMuted: false,
        playbackRate: 1,
        loop: false,
        setVolume: (volume) => {
          const nextVolume = Math.max(0, Math.min(1, volume));
          set({ volume: nextVolume, isMuted: nextVolume === 0 });
        },
        toggleMute: () => {
          const current = get();
          set({ isMuted: !current.isMuted });
        },
        setPlaybackRate: (rate) => {
          set({ playbackRate: rate });
        },
        setLoop: (loop) => {
          set({ loop });
        },
      }),
      {
        name: "preference-storage",
      },
    ),
  ),
);
