'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, ClipboardList, User } from 'lucide-react';
import { useJobStore } from '@/store/jobStore';

export const BottomNav = () => {
  const pathname = usePathname();
  const { activeJob } = useJobStore();

  if (pathname === '/login') return null;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Active Job', path: activeJob ? `/job/${activeJob.id}` : '/dashboard', icon: MapPin },
    { name: 'History', path: '/history', icon: ClipboardList },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 md:backdrop-blur-md border-t border-gray-100 z-50 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
      <div className="flex justify-around items-center h-20 px-4">
        {navItems.map((item) => {
          // Exact match for dashboard, startsWith for others to handle /job/[id]
          const isActive = item.path === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname.startsWith(item.path.split('/')[1] ? `/${item.path.split('/')[1]}` : item.path);
          
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center justify-center w-full h-full relative group transition-all ${
                isActive ? 'text-[#00A86B]' : 'text-gray-400'
              }`}
            >
              {isActive && (
                <div 
                  className="absolute top-0 w-12 h-1 bg-[#00A86B] rounded-b-full shadow-[0_2px_10px_rgba(0,168,107,0.4)] animate-in slide-in-from-bottom-1 fade-in duration-300"
                />
              )}
              <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-[#00A86B]/5 scale-110' : 'group-active:scale-95'}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest mt-1 transition-all ${isActive ? 'opacity-100' : 'opacity-60 text-[8px]'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
