'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Timer } from 'lucide-react';

export const ShiftTimer = () => {
  const { isOnline, shiftStartTime } = useAuthStore();
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    if (!isOnline || !shiftStartTime) return;

    const interval = setInterval(() => {
      const start = new Date(shiftStartTime).getTime();
      const now = new Date().getTime();
      const diff = now - start;

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setElapsed(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isOnline, shiftStartTime]);

  if (!isOnline) return null;

  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/5">
      <Timer size={14} className="text-yellow-300" />
      <span className="text-[10px] font-black text-white uppercase tracking-widest">{elapsed}</span>
    </div>
  );
};
