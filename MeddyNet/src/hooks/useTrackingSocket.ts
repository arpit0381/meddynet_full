import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

interface TrackingUpdate {
  type: 'location_update';
  lat: number;
  lng: number;
  timestamp: string;
}

export const useTrackingSocket = (jobId?: string) => {
  const { user } = useAuthStore();
  const [techLocation, setTechLocation] = useState<{ lat: number; lng: number } | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user || !jobId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, '') || 'localhost:8000';
    // Patients subscribe to the tracking channel for their specific job
    const wsUrl = `${protocol}//${host}/ws/tracking/${jobId}`;
    
    // Connecting to tracking WebSocket
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload: TrackingUpdate = JSON.parse(event.data);
        if (payload.type === 'location_update') {
          setTechLocation({ lat: payload.lat, lng: payload.lng });
        }
      } catch (err) {
        console.error('Tracking parse error:', err);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [user?.id, jobId]);

  return { techLocation };
};
