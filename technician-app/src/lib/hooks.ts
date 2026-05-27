import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

export const useMyJobs = () => {
    return useQuery({
        queryKey: ['myJobs'],
        queryFn: async () => {
            const { data } = await api.get('/technician/me/jobs');
            return data;
        },
    });
};

export const useAvailableJobs = () => {
    return useQuery({
        queryKey: ['availableJobs'],
        queryFn: async () => {
            const { data } = await api.get('/technician/jobs/available');
            return data;
        },
    });
};

export const useAssignJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (bookingId: string) => {
            const { data } = await api.post(`/technician/bookings/${bookingId}/assign`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myJobs'] });
            queryClient.invalidateQueries({ queryKey: ['availableJobs'] });
        },
    });
};

export const useUpdateJobStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
            const { data } = await api.patch(`/technician/bookings/${bookingId}/status?status=${status}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myJobs'] });
        },
    });
};

export const useUpdateLocation = () => {
    return useMutation({
        mutationFn: async (coords: { lat: number; lng: number }) => {
            const { data } = await api.patch('/technician/me/location', coords);
            return data;
        },
    });
};
