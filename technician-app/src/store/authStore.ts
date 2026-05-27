import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'

interface User {
  id: string;
  name: string;
  role: string;
  technician_id?: string;
  avatar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  phone: string | null;
  isOnline: boolean;
  shiftStartTime: string | null;
  _hasHydrated: boolean;
  login: (user: User, phone: string) => void;
  logout: () => void;
  toggleAttendance: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      phone: null,
      isOnline: false,
      shiftStartTime: null,
      _hasHydrated: false,
      login: (user, phone) => set({ 
        isAuthenticated: true, 
        user, 
        phone, 
        isOnline: true, 
        shiftStartTime: new Date().toISOString() 
      }),
      logout: () => set({ isAuthenticated: false, user: null, phone: null, isOnline: false, shiftStartTime: null }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      toggleAttendance: async () => {
        const nextStatus = !get().isOnline ? 'on_duty' : 'off_duty';
        try {
            const techId = get().user?.technician_id;

            if (techId) {
                await api.patch(`/technicians/${techId}/duty?status=${nextStatus}`);
            }
            
            set((state) => ({ 
                isOnline: !state.isOnline,
                shiftStartTime: !state.isOnline ? new Date().toISOString() : state.shiftStartTime 
            }));
        } catch (error) {
            console.error("Failed to sync duty status:", error);
        }
      },
    }),
    {
      name: 'tech-auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
