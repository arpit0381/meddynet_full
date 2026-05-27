import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LabUser {
  id: string;
  lab_id: string;
  name: string;
  role: 'lab_admin' | 'lab_technician';
}

interface LabState {
  user: LabUser | null;
  isAuthenticated: boolean;
  activeTestCount: number;
  setAuth: (user: LabUser) => void;
  setStats: (count: number) => void;
  logout: () => void;
}

export const useLabStore = create<LabState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      activeTestCount: 0,
      setAuth: (user) => set({ user, isAuthenticated: true }),
      setStats: (count) => set({ activeTestCount: count }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'lab-portal-storage',
    }
  )
);
