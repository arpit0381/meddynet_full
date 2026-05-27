import { useEffect, useRef, useState } from 'react';
import { useLocation } from './useLocation';
import { useAuthStore } from '@/store/authStore';

export const useSocket = () => {
  const { location } = useLocation();
  const { user } = useAuthStore();
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, '') || 'localhost:8000';
    const wsUrl = `${protocol}//${host}/ws/tech/${user.id}`;
    
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => { setIsConnected(true); };

    ws.onmessage = (event) => {
      try {
        JSON.parse(event.data);
        // Events are handled by the jobStore via polling
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onerror = () => { /* connection error, will auto-reconnect */ };
    ws.onclose = () => { setIsConnected(false); };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [user?.id]);

  // Send location updates periodically
  useEffect(() => {
    const socket = socketRef.current;
    if (!location || !socket || !user?.id) return;
    
    if (socket.readyState === WebSocket.OPEN) {
      const updateData = {
        type: 'location_update',
        client_id: user.id,
        lat: location.lat,
        lng: location.lng,
        timestamp: new Date().toISOString()
      };
      
      socket.send(JSON.stringify(updateData));
    }
  }, [location, user?.id]);

  return { isConnected };
};
