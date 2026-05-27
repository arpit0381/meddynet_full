/**
 * Patient Portal — TanStack Query Hooks
 * Centralized hooks for all API data fetching + mutations.
 * Replaces all mock data imports with live backend calls.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './api';

// ═══════════════════════════════════════════════════
// QUERY KEYS — consistent cache invalidation
// ═══════════════════════════════════════════════════
export const queryKeys = {
  bookings: ['bookings'] as const,
  booking: (id: string) => ['bookings', id] as const,
  reports: ['reports'] as const,
  report: (id: string) => ['reports', id] as const,
  payments: ['payments'] as const,
  payment: (id: string) => ['payments', id] as const,
  notifications: ['notifications'] as const,
  profile: ['profile'] as const,
  labs: ['labs'] as const,
  lab: (id: string) => ['labs', id] as const,
};


// ═══════════════════════════════════════════════════
// BOOKINGS
// ═══════════════════════════════════════════════════

export interface BookingItem {
  name: string;
}

export interface BookingLab {
  id: string;
  name: string;
  city: string;
  address: string;
}

export interface ApiBooking {
  id: string;
  user_id: string;
  lab_id: string;
  tech_id: string | null;
  type: string;
  status: string;
  scheduled_at: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  patient_name: string;
  patient_phone: string;
  total_amount: number;
  promo_code: string | null;
  discount_amount: number;
  notes: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string | null;
  lab: BookingLab | null;
  items: BookingItem[];
  payment_status: string;
}

export function useBookings() {
  return useQuery<ApiBooking[]>({
    queryKey: queryKeys.bookings,
    queryFn: async () => {
      const { data } = await apiClient.get('/bookings');
      return data;
    },
  });
}

export function useBooking(id: string) {
  return useQuery<ApiBooking>({
    queryKey: queryKeys.booking(id),
    queryFn: async () => {
      const { data } = await apiClient.get(`/bookings/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data } = await apiClient.patch(`/bookings/${bookingId}/cancel`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
}


// ═══════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════

export interface ApiReport {
  id: string;
  booking_id: string;
  lab_id: string;
  cloud_url: string;
  file_size_bytes: number;
  is_abnormal: boolean;
  uploaded_at: string | null;
  notified_at: string | null;
  status: string;
  lab: { id: string; name: string } | null;
  test_name: string;
}

export function useReports() {
  return useQuery<ApiReport[]>({
    queryKey: queryKeys.reports,
    queryFn: async () => {
      const { data } = await apiClient.get('/reports');
      return data;
    },
  });
}

export function useReport(id: string) {
  return useQuery<ApiReport>({
    queryKey: queryKeys.report(id),
    queryFn: async () => {
      const { data } = await apiClient.get(`/reports/${id}`);
      return data;
    },
    enabled: !!id,
  });
}


// ═══════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════

export interface ApiPayment {
  id: string;
  booking_id: string | null;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  total_amount: number;
  commission_amount: number;
  lab_amount: number;
  status: string;
  created_at: string | null;
}

export function usePayments() {
  return useQuery<ApiPayment[]>({
    queryKey: queryKeys.payments,
    queryFn: async () => {
      const { data } = await apiClient.get('/payments/me');
      return data;
    },
  });
}

export function useDeposit() {
  return useMutation({
    mutationFn: async (amount: number) => {
      const { data } = await apiClient.post('/payments/deposit', { amount });
      return data;
    },
  });
}


// ═══════════════════════════════════════════════════
// NOTIFICATIONS (MongoDB)
// ═══════════════════════════════════════════════════

export interface ApiNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  metadata: Record<string, string>;
  created_at: string | null;
}

export function useNotifications() {
  return useQuery<ApiNotification[]>({
    queryKey: queryKeys.notifications,
    queryFn: async () => {
      const { data } = await apiClient.get('/notifications');
      return data;
    },
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.patch('/notifications/read-all');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}


// ═══════════════════════════════════════════════════
// USER PROFILE
// ═══════════════════════════════════════════════════

export interface ApiProfile {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  blood_group: string | null;
  age: string | null;
  wallet_balance: number;
  is_active: boolean;
  created_at: string;
}

export function useProfile() {
  return useQuery<ApiProfile>({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      const { data } = await apiClient.get('/users/me');
      return data;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Pick<ApiProfile, 'name' | 'email'>>) => {
      const { data } = await apiClient.patch('/users/me', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('file', file);
      const { data } = await apiClient.post('/users/me/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}


// ═══════════════════════════════════════════════════
// LABS
// ═══════════════════════════════════════════════════

export function useLabs(params?: { city?: string; is_nabl?: boolean; home_collection?: boolean }) {
  return useQuery({
    queryKey: [...queryKeys.labs, params],
    queryFn: async () => {
      const { data } = await apiClient.get('/labs', { params });
      return data;
    },
  });
}

export function useLab(id: string) {
  return useQuery({
    queryKey: queryKeys.lab(id),
    queryFn: async () => {
      const { data } = await apiClient.get(`/labs/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
