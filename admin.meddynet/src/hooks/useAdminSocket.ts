import { useEffect, useRef, useState } from 'react';

interface SystemLog {
  level: string;
  event: string;
  message: string;
  timestamp: string;
}

export const useAdminSocket = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, '') || 'localhost:8000';
    const wsUrl = `${protocol}//${host}/ws/admin/system`;
    
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setLogs(prev => [payload, ...prev].slice(0, 50));
      } catch (err) {
        console.error('Admin WS error:', err);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, []);

  return { logs };
};
