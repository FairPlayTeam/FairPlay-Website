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
          if (volume === 0) {
            set({ isMuted: true });
          } else {
            set({ volume: volume, isMuted: false });
          }
        },
        toggleMute: () => {
          const current = get();
          set({ isMuted: !current.isMuted });
        },
      }),
      {
        name: "preference-storage",
      }
    )
  )
);
