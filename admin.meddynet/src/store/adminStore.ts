import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator';
}

interface AdminState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setAuth: (user: AdminUser) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setAuth: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'admin-portal-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
