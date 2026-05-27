'use client';

import { useAuthStore } from '@/store/authStore';

import { Power } from 'lucide-react';

export const AttendanceToggle = () => {
  const { isOnline, toggleAttendance } = useAuthStore();

  return (
    <button 
      onClick={toggleAttendance}
      className="relative flex items-center group outline-none shrink-0"
    >
      <div 
        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest sm:tracking-[0.2em] shadow-lg border border-white/10 transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOnline ? 'bg-white text-[#00A86B]' : 'bg-white/10 text-white/60'
        }`}
      >
        <div 
          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
            isOnline ? 'bg-[#00A86B]/10 rotate-0' : 'bg-white/10 rotate-180'
          }`}
        >
          <Power size={12} className="sm:w-3.5 sm:h-3.5" strokeWidth={3} />
        </div>
        <span className="hidden xs:inline-block">
          {isOnline ? 'On-Duty' : 'Offline'}
        </span>
      </div>
      
      {isOnline && (
        <span className="absolute -top-1 -right-1 flex h-2 sm:h-3 w-2 sm:w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 sm:h-3 w-2 sm:w-3 bg-green-500 border border-[#00A86B]"></span>
        </span>
      )}
    </button>
  );
};
///hehe///////////thik hai bhai
