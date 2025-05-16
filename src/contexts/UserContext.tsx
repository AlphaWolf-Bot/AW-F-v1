import React, { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  level: number;
  experience: number;
  coins: number;
  achievements: Achievement[];
  progress: Progress;
  stats: Stats;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  completed: boolean;
  reward: number;
}

interface Progress {
  level: number;
  experience: number;
  nextLevelExp: number;
  tasksCompleted: number;
  totalTasks: number;
}

interface Stats {
  totalCoins: number;
  coinsSpent: number;
  adsWatched: number;
  tasksCompleted: number;
  achievementsUnlocked: number;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profile, progress, achievements, stats] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getProgress(),
        userAPI.getAchievements(),
        userAPI.getStats(),
      ]);

      setUser({
        ...profile.data,
        progress: progress.data,
        achievements: achievements.data,
        stats: stats.data,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const refreshUser = async () => {
    await fetchUserData();
  };

  return (
    <UserContext.Provider value={{ user, loading, error, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 