"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type PreferenceState = {
  volume: number;
  isMuted: boolean;
};

export type PreferenceActions = {
  setVolume: (volume: number) => void;
  toggleMute: () => void;
};

export const usePreferenceStore = create<PreferenceState & PreferenceActions>()(
  devtools(
    persist(
      (set, get) => ({
        volume: 0.5,
        isMuted: false,
        setVolume: (volume) => {
          const nextVolume = Math.max(0, Math.min(1, volume));
          set({ volume: nextVolume, isMuted: nextVolume === 0 });
        },
        toggleMute: () => {
          const current = get();
          set({ isMuted: !current.isMuted });
        },
      }),
      {
        name: "preference-storage",
      },
    ),
  ),
);
