'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Bell, CheckCircle2, AlertCircle, Info, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const NOTIFICATIONS = [
  { 
    id: 1, 
    type: 'assignment', 
    title: 'New Job Assigned!', 
    time: '2 mins ago', 
    desc: 'New pickup at Health Avenue. 450 INR. Immediate attention required.',
    icon: Bell,
    color: 'bg-blue-50 text-blue-600'
  },
  { 
    id: 2, 
    type: 'system', 
    title: 'Attendance Marked', 
    time: '45 mins ago', 
    desc: 'You are now Online. Happy collecting!',
    icon: CheckCircle2,
    color: 'bg-green-50 text-green-600'
  },
  { 
    id: 3, 
    type: 'alert', 
    title: 'Late Pickup Warning', 
    time: '2 hours ago', 
    desc: 'Your last assignment was delayed. Please try to follow the schedule.',
    icon: AlertCircle,
    color: 'bg-red-50 text-red-600'
  },
  { 
    id: 4, 
    type: 'info', 
    title: 'App Update', 
    time: '1 day ago', 
    desc: 'Version 2.0 is out! Enjoy the new stunning desktop and mobile layouts.',
    icon: Info,
    color: 'bg-purple-50 text-purple-600'
  }
];

export default function NotificationsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router, mounted]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 font-sans overflow-x-hidden">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-4 sm:px-6 pt-10 md:pt-12 pb-6 shadow-sm border-b border-gray-100 flex items-center gap-4">
        <Link href="/dashboard" className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors active:scale-95">
           <ChevronLeft size={22} className="text-gray-900" />
        </Link>
        <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Notifications Center</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 space-y-4">
        {NOTIFICATIONS.map((notif, i) => (
          <motion.div 
            key={notif.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50 flex gap-4 hover:shadow-md transition-all group cursor-pointer active:scale-[0.99]"
          >
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${notif.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm border border-black/5`}>
              <notif.icon size={22} className="group-hover:rotate-12 transition-transform" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1.5 md:mb-2">
                <h3 className="font-extrabold text-gray-900 leading-tight tracking-tight text-base md:text-lg transition-colors group-hover:text-[#00A86B]">{notif.title}</h3>
                <span className="text-[9px] md:text-[10px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md">{notif.time}</span>
              </div>
              <p className="text-xs md:text-sm text-gray-500 font-bold leading-relaxed">{notif.desc}</p>
            </div>
          </motion.div>
        ))}

        <div className="pt-12 text-center">
           <button className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.3em] hover:text-[#00A86B] transition-colors bg-gray-100/50 px-6 py-2.5 rounded-full border border-transparent hover:border-gray-200">Archive All Read</button>
        </div>
      </div>
    </div>
  );
}
