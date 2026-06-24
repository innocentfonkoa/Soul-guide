import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  transitionType?: string;
  transitionDetail?: string;
  primaryIntention?: string;
  morningOrEvening?: string;
  practiceMinutes?: number;
  onboardingDone: boolean;
  createdAt: string;
}

export interface Practice {
  id: string;
  title: string;
  description: string;
  category: string;
  theme: string;
  durationMin: number;
  audioUrl?: string;
  guideBy?: string;
  isPremium: boolean;
  isDaily: boolean;
}

interface StoreState {
  token: string | null;
  user: User | null;
  currentPractice: Practice | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  setCurrentPractice: (practice: Practice | null) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      currentPractice: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null, currentPractice: null }),
      setCurrentPractice: (practice) => set({ currentPractice: practice }),
    }),
    {
      name: 'soulguide-store',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
