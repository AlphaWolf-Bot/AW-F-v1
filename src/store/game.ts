import { create } from 'zustand';

interface GameState {
  level: number;
  experience: number;
  experienceToNext: number;
  tapsRemaining: number;
  updateLevel: (level: number) => void;
  updateExperience: (experience: number) => void;
  updateTapsRemaining: (taps: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  level: 1,
  experience: 0,
  experienceToNext: 100,
  tapsRemaining: 100,
  updateLevel: (level) => set({ level }),
  updateExperience: (experience) => set({ experience }),
  updateTapsRemaining: (tapsRemaining) => set({ tapsRemaining }),
})); 