import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'

export type JobStatus = 'pending' | 'confirmed' | 'assigned' | 'on_the_way' | 'arrived' | 'sample_collected' | 'report_ready' | 'completed' | 'cancelled';

export interface Job {
  id: string;
  patient_name: string;
  address: string;
  patient_phone: string;
  lat: number;
  lng: number;
  status: JobStatus;
  total_amount: number;
  scheduled_at: string;
  type: string;
}

interface JobState {
  activeJob: Job | null;
  jobs: Job[];
  availableJobs: Job[];
  loading: boolean;
  setActiveJob: (job: Job | null) => void;
  updateJobStatus: (id: string, status: JobStatus) => Promise<void>;
  acceptJob: (job: Job) => Promise<void>;
  selfAssignJob: (id: string) => Promise<void>;
  setJobs: (jobs: Job[]) => void;
  fetchJobs: () => Promise<void>;
  fetchAvailableJobs: () => Promise<void>;
  fetchStats: () => Promise<void>;
  clearActiveJob: () => void;
  stats: { today_earnings: number; total_earnings: number; success_rate: number; queue_time_mins: number; total_jobs: number } | null;
}

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      activeJob: null,
      jobs: [],
      availableJobs: [],
      loading: false,
      stats: null,
      setActiveJob: (job) => set({ activeJob: job }),
      
      fetchJobs: async () => {
        set({ loading: true });
        try {
          const response = await api.get("/technician/me/jobs");
          set({ jobs: response.data });
        } catch (error) {
          console.error("Failed to fetch jobs:", error);
        } finally {
          set({ loading: false });
        }
      },

      fetchAvailableJobs: async () => {
        try {
          const response = await api.get("/technician/jobs/available");
          set({ availableJobs: response.data });
        } catch (error) {
          console.error("Failed to fetch available jobs:", error);
        }
      },
      
      fetchStats: async () => {
        try {
          const response = await api.get("/technician/me/stats");
          set({ stats: response.data });
        } catch (error) {
          console.error("Failed to fetch stats:", error);
        }
      },

      selfAssignJob: async (id) => {
        try {
          await api.post(`/technician/bookings/${id}/assign`);
          const jobToMove = get().availableJobs.find(j => j.id === id);
          if (jobToMove) {
              set((state) => ({
                availableJobs: state.availableJobs.filter(j => j.id !== id),
                jobs: [...state.jobs, { ...jobToMove, status: 'assigned' }]
              }));
          }
        } catch (error) {
          console.error("Failed to self-assign job:", error);
          throw error;
        }
      },

      updateJobStatus: async (id, status) => {
        try {
          await api.patch(`/technician/bookings/${id}/status?status=${status}`);
          set((state) => {
            const updatedJobs = state.jobs.map(j => j.id === id ? { ...j, status } : j);
            let activeJob = state.activeJob;
            if (activeJob?.id === id) {
              activeJob = { ...activeJob, status };
            }
            return { jobs: updatedJobs, activeJob };
          });
        } catch (error) {
          console.error("Failed to update status:", error);
        }
      },

      acceptJob: async (job) => {
        try {
          await api.patch(`/technician/bookings/${job.id}/status?status=on_the_way`);
          set((state) => ({
            activeJob: { ...job, status: 'on_the_way' },
            jobs: state.jobs.map(j => j.id === job.id ? { ...j, status: 'on_the_way' } : j)
          }));
        } catch (error) {
          console.error("Failed to accept job:", error);
        }
      },

      setJobs: (jobs) => set({ jobs }),
      clearActiveJob: () => set({ activeJob: null }),
    }),
    {
      name: 'meddynet-job-storage',
    }
  )
);
