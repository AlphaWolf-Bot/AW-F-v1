import { create } from 'zustand';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

interface AchievementState {
  achievements: Achievement[];
  addAchievement: (achievement: Achievement) => void;
}

export const useAchievementStore = create<AchievementState>((set) => ({
  achievements: [],
  addAchievement: (achievement) =>
    set((state) => ({
      achievements: [...state.achievements, achievement],
    })),
})); 