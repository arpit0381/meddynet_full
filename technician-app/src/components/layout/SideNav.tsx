'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Home, MapPin, ClipboardList, User, LogOut } from 'lucide-react';
import { useJobStore } from '@/store/jobStore';
import { useAuthStore } from '@/store/authStore';

export const SideNav = () => {
  const pathname = usePathname();
  const { activeJob } = useJobStore();
  const { logout } = useAuthStore();

  if (pathname === '/login') return null;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Active Job', path: activeJob ? `/job/${activeJob.id}` : '/dashboard', icon: MapPin },
    { name: 'History', path: '/history', icon: ClipboardList },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="h-screen sticky top-0 flex flex-col bg-white border-r border-gray-100 w-80 pt-12 pb-8 px-6 shadow-[10px_0_40px_rgba(0,0,0,0.02)] z-50">
      <div className="flex flex-col items-center gap-6 mb-16 px-2">
        <div 
          className="relative w-28 h-28 flex items-center justify-center bg-gray-50 rounded-[2.5rem] shadow-inner p-4 border border-gray-50 transition-transform duration-300 hover:rotate-6 hover:scale-105"
        >
          <Image 
            src="/MeddyNetlogo.png" 
            alt="MeddyNet Logo" 
            width={112} 
            height={112} 
            className="object-contain"
          />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-1">Meddy<span className="text-[#00A86B]">Net</span></h1>
          <div className="inline-block px-3 py-1 bg-gray-900 rounded-full">
            <p className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Technician Terminal</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname.startsWith(item.path.split('/')[1] ? `/${item.path.split('/')[1]}` : item.path);
          
          return (
            <Link
              key={item.name}
              href={item.path}
              className="block group"
            >
              <div
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all duration-300 hover:translate-x-1 active:scale-[0.98] ${
                  isActive 
                    ? 'bg-gray-900 text-white shadow-xl shadow-black/10' 
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                }`}
              >
                <div className={`transition-transform duration-500 ${isActive ? 'rotate-0' : 'group-hover:rotate-12 group-hover:text-[#00A86B]'}`}>
                  <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                </div>
                <span className="text-sm uppercase tracking-widest">{item.name}</span>
                {isActive && (
                  <div 
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00A86B] shadow-[0_0_10px_rgba(0,168,107,0.6)] animate-in fade-in zoom-in duration-300"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="space-y-6 pt-8 border-t border-gray-50 mt-auto">
        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-4 px-8 py-4 rounded-2xl font-black text-red-500 hover:bg-red-50 transition-all border border-transparent group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm uppercase tracking-widest">End Session</span>
        </button>
        
        <div className="bg-gray-50/80 rounded-3xl p-6 border border-gray-100 flex items-center gap-4 group transition-colors hover:bg-white">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-gray-100 group-hover:scale-110 transition-transform">
             <div className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse"></div>
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Authenticated ID</p>
            <p className="text-sm font-black text-gray-900 tracking-tight">MT-992-V</p>
          </div>
        </div>
      </div>
    </div>
  );
};
