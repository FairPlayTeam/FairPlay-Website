"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type PreferenceState = {
  volume: number;
  isMuted: boolean;
  isTheatreMode: boolean;
};

export type PreferenceActions = {
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setTheatreMode: (value: boolean) => void;
};

export const usePreferenceStore = create<PreferenceState & PreferenceActions>()(
  devtools(
    persist(
      (set, get) => ({
        volume: 0.5,
        isMuted: false,
        isTheatreMode: false,
        setVolume: (volume) => {
          const nextVolume = Math.max(0, Math.min(1, volume));
          set({ volume: nextVolume, isMuted: nextVolume === 0 });
        },
        toggleMute: () => {
          const current = get();
          set({ isMuted: !current.isMuted });
        },
        setTheatreMode: (value: boolean) => set({ isTheatreMode: value }),
      }),
      {
        name: "preference-storage",
      },
    ),
  ),
);
