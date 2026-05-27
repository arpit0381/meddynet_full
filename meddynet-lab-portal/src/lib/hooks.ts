import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// ========== STATS & EARNINGS ==========
export const useLabStats = () => {
    return useQuery({
        queryKey: ['labStats'],
        queryFn: async () => {
            const { data } = await api.get('/labs/me/stats');
            return data;
        },
        staleTime: 2 * 60 * 1000, // 2 min cache — dashboard load faster
        retry: 1,
    });
};

export const useLabEarnings = () => {
    return useQuery({
        queryKey: ['labEarnings'],
        queryFn: async () => {
            const { data } = await api.get('/labs/me/earnings');
            return data;
        },
    });
};

export const useLabProfile = () => {
    return useQuery({
        queryKey: ['labProfile'],
        queryFn: async () => {
            const { data } = await api.get('/labs/me');
            return data;
        },
    });
};

export const useUpdateLabProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (profileData: any) => {
            const { data } = await api.patch('/labs/me', profileData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labProfile'] });
            queryClient.invalidateQueries({ queryKey: ['labStats'] });
        },
    });
};

// ========== BOOKINGS ==========
export const useLabBookings = () => {
    return useQuery({
        queryKey: ['labBookings'],
        queryFn: async () => {
            const { data } = await api.get('/labs/me/bookings');
            return data;
        },
        staleTime: 60 * 1000, // 1 min cache
        retry: 1,
    });
};

export const useUpdateBookingStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
            const { data } = await api.patch(`/bookings/${bookingId}/status`, { status });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labBookings'] });
            queryClient.invalidateQueries({ queryKey: ['labStats'] });
        },
    });
};

export const useAssignTechnician = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ bookingId, techId }: { bookingId: string; techId: string }) => {
            const { data } = await api.patch(`/labs/me/bookings/${bookingId}/assign?tech_id=${techId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labBookings'] });
            queryClient.invalidateQueries({ queryKey: ['labStats'] });
        },
    });
};

// ========== TECHNICIANS ==========
export const useLabTechnicians = () => {
    return useQuery({
        queryKey: ['labTechnicians'],
        queryFn: async () => {
            const { data } = await api.get('/labs/me/technicians');
            return data;
        },
    });
};

export const useAddTechnician = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (techData: any) => {
            const { data } = await api.post('/labs/me/technicians', techData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labTechnicians'] });
        },
    });
};

// ========== REPORTS ==========
export const useLabReports = () => {
    return useQuery({
        queryKey: ['labReports'],
        queryFn: async () => {
            // Lab sharing reports logic - usually same as fetching lab tests that need reports
            // Assuming this endpoint exists, or we map through bookings for reports.
            // Let's create an endpoint or just fetch bookings.
            const { data } = await api.get('/labs/me/bookings');
            return data;
        },
    });
};

export const useUploadReport = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            // Must have report_file and booking_id
            const { data } = await api.post('/reports', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labReports'] });
            queryClient.invalidateQueries({ queryKey: ['labBookings'] });
        },
    });
};
// ========== TESTS MANAGEMENT ==========
export const useLabTestsList = () => {
    return useQuery({
        queryKey: ['labTests'],
        queryFn: async () => {
            const { data } = await api.get('/labs/me/tests');
            return data;
        },
    });
};

export const useAddLabTest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (testData: any) => {
            const { data } = await api.post('/labs/me/tests', testData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labTests'] });
        },
    });
};

export const useToggleTestStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (testId: string) => {
            const { data } = await api.patch(`/labs/me/tests/${testId}/toggle`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labTests'] });
        },
    });
};

export const useToggleTechStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (techId: string) => {
            const { data } = await api.patch(`/labs/me/technicians/${techId}/toggle`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labTechnicians'] });
        },
    });
};

export const useQuickSchedule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { patient_name: string; type: string; scheduled_at: string; patient_phone?: string; notes?: string }) => {
            const { data } = await api.post('/bookings/lab/quick', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labBookings'] });
            queryClient.invalidateQueries({ queryKey: ['labStats'] });
        },
    });
};

// ========== NOTIFICATIONS ==========
export const useNotifications = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await api.get('/notifications');
            return data;
        },
        staleTime: 60 * 1000,
        refetchInterval: 2 * 60 * 1000, // Poll every 2 min (was 30s — too aggressive)
        retry: 1,
    });
};

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.patch(`/notifications/${id}/read`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

export const useMarkAllNotificationsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { data } = await api.patch('/notifications/read-all');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};
