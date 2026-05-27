/**
 * Admin Portal — TanStack Query Hooks
 * Centralized hooks for all admin API data fetching.
 * These replace the mock data imports across admin pages.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminApi from './api';

// ═══════════════════════════════════════════════════
// QUERY KEYS
// ═══════════════════════════════════════════════════
export const adminKeys = {
  stats: ['admin', 'stats'] as const,
  platformHealth: ['admin', 'platform-health'] as const,
  labs: ['admin', 'labs'] as const,
  onboardingLabs: ['admin', 'onboarding-labs'] as const,
  users: ['admin', 'users'] as const,
  bookings: ['admin', 'bookings'] as const,
  technicians: ['admin', 'technicians'] as const,
  financials: ['admin', 'financials'] as const,
  pendingPayouts: ['admin', 'payouts-pending'] as const,
  supportTickets: ['admin', 'support-tickets'] as const,
  reports: ['admin', 'reports-audit'] as const,
  auditLogs: ['admin', 'audit-logs'] as const,
};


// ═══════════════════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════════════════
export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/stats');
      return data;
    },
  });
}

export function usePlatformHealth() {
  return useQuery({
    queryKey: adminKeys.platformHealth,
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/platform-health');
      return data;
    },
    refetchInterval: 30000, // Auto-refresh every 30s
  });
}


// ═══════════════════════════════════════════════════
// LABS
// ═══════════════════════════════════════════════════
export function useAdminLabs() {
  return useQuery({
    queryKey: adminKeys.labs,
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/labs');
      return data;
    },
  });
}

export function useOnboardingLabs() {
  return useQuery({
    queryKey: adminKeys.onboardingLabs,
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/onboarding/labs');
      return data;
    },
  });
}

export function useVerifyLab() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (labId: string) => {
      const { data } = await adminApi.patch(`/admin/labs/${labId}/verify`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.labs });
      qc.invalidateQueries({ queryKey: adminKeys.onboardingLabs });
      qc.invalidateQueries({ queryKey: adminKeys.stats });
    },
  });
}

export function useToggleLabStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ labId, action }: { labId: string; action: 'activate' | 'deactivate' }) => {
      const { data } = await adminApi.patch(`/admin/labs/${labId}/${action}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.labs });
    },
  });
}


// ═══════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════
export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users,
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/users');
      return data;
    },
  });
}

export function useToggleUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await adminApi.patch(`/admin/users/${userId}/toggle-status`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.users });
      qc.invalidateQueries({ queryKey: adminKeys.stats });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await adminApi.delete(`/admin/users/${userId}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.users });
      qc.invalidateQueries({ queryKey: adminKeys.stats });
    },
  });
}


// ═══════════════════════════════════════════════════
// BOOKINGS
// ═══════════════════════════════════════════════════
export function useAdminBookings() {
  return useQuery({
    queryKey: adminKeys.bookings,
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/bookings');
      return data;
    },
  });
}


// ═══════════════════════════════════════════════════
// TECHNICIANS
// ═══════════════════════════════════════════════════
export function useAdminTechnicians() {
  return useQuery({
    queryKey: adminKeys.technicians,
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/technicians');
      return data;
    },
  });
}


// ═══════════════════════════════════════════════════
// FINANCIALS & PAYOUTS
// ═══════════════════════════════════════════════════
export function useAdminFinancials() {
  return useQuery({
    queryKey: adminKeys.financials,
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/financials');
      return data;
    },
  });
}

export function usePendingPayouts() {
  return useQuery({
    queryKey: adminKeys.pendingPayouts,
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/payouts/pending');
      return data;
    },
  });
}

export function useProcessPayouts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await adminApi.post('/admin/payouts/process');
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.pendingPayouts });
      qc.invalidateQueries({ queryKey: adminKeys.financials });
    },
  });
}


// ═══════════════════════════════════════════════════
// SUPPORT TICKETS
// ═══════════════════════════════════════════════════
export function useAdminSupportTickets() {
  return useQuery({
    queryKey: adminKeys.supportTickets,
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/support/tickets');
      return data;
    },
  });
}

export function useReplyToTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, message, status }: { ticketId: string; message: string; status?: string }) => {
      const { data } = await adminApi.post(`/admin/support/tickets/${ticketId}/reply`, { message, status });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.supportTickets });
    },
  });
}


// ═══════════════════════════════════════════════════
// REPORTS AUDIT
// ═══════════════════════════════════════════════════
export function useAdminReports() {
  return useQuery({
    queryKey: adminKeys.reports,
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/reports-audit');
      return data;
    },
  });
}


// ═══════════════════════════════════════════════════
// AUDIT LOGS
// ═══════════════════════════════════════════════════
export function useAuditLogs(limit: number = 100) {
  return useQuery({
    queryKey: [...adminKeys.auditLogs, limit],
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/audit-logs', { params: { limit } });
      return data;
    },
  });
}


// ═══════════════════════════════════════════════════
// DEDUP LABS (CLEANUP)
// ═══════════════════════════════════════════════════
export function useDeduplicateLabs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await adminApi.post('/admin/cleanup/deduplicate-labs');
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.labs });
    },
  });
}


// ═══════════════════════════════════════════════════
// ALIASES — for pages importing alternate names
// ═══════════════════════════════════════════════════
export const useFinancialLedger = useAdminFinancials;
export const useSupportTickets = useAdminSupportTickets;
export const useRespondToTicket = useReplyToTicket;
