'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useJobStore } from '@/store/jobStore';
import { User, Phone, LogOut, Settings, Bell, CircleHelp, ChevronRight, Shield, CreditCard, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { AttendanceToggle } from '@/components/dashboard/AttendanceToggle';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { isAuthenticated, phone, logout } = useAuthStore();
  const { jobs } = useJobStore();
  const router = useRouter();
  
  const completedCount = jobs.filter((j: any) => j.status === 'completed').length;
  const earningsRaw = jobs.filter((j: any) => j.status === 'completed').reduce((acc: number, j: any) => acc + (j.total_amount / 100 || 0), 0);
  const earningsStr = earningsRaw >= 1000 ? `₹${(earningsRaw/1000).toFixed(1)}K` : `₹${earningsRaw}`;

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

  const handleLogout = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: 'Ending tactical session...',
        success: () => {
          logout();
          router.push('/login');
          return 'Session terminated successfully.';
        },
        error: 'Logout failed',
      }
    );
  };

  const handleMenuItemClick = (item: { title: string, path?: string }) => {
    if (item.path) {
      router.push(item.path);
    } else {
      toast(item.title, { description: 'Opening administrative module...' });
    }
  };

  const menuSections = [
    {
      title: 'Preferences',
      items: [
        { title: 'App Settings', icon: Settings, color: 'text-blue-500', bg: 'bg-blue-50', path: '/profile/settings' },
        { title: 'Notifications', icon: Bell, color: 'text-purple-500', bg: 'bg-purple-50', path: '/profile/notifications' },
      ]
    },
    {
      title: 'Security',
      items: [
        { title: 'Privacy Policy', icon: Shield, color: 'text-[#00A86B]', bg: 'bg-green-50', path: '/profile/privacy' },
        { title: 'Payment Methods', icon: CreditCard, color: 'text-orange-500', bg: 'bg-orange-50', path: '/profile/payments' },
      ]
    },
    {
      title: 'Support',
      items: [
        { title: 'Help & Support', icon: CircleHelp, color: 'text-pink-500', bg: 'bg-pink-50', path: '/profile/support' },
        { title: 'System Status', icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50', path: '/profile/status' },
      ]
    }
  ];

  return (
    <div className="flex flex-col bg-[#F9FAFB] md:bg-gray-50/50 pb-24 md:pb-12 font-sans overflow-x-hidden">
      {/* Dynamic Header Section */}
      <div className="bg-linear-to-br from-gray-950 via-gray-900 to-black px-4 sm:px-6 md:px-16 pt-10 md:pt-20 pb-20 md:pb-32 text-white rounded-b-[2.5rem] md:rounded-none shadow-2xl relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-white/5 rounded-full blur-[80px] md:blur-[120px] -mr-40 -mt-40 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 md:w-64 h-32 md:h-64 bg-[#00A86B]/10 rounded-full blur-[60px] -ml-20 -mb-20 pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center relative z-10 mb-6 md:mb-12">
            <div className="flex items-center gap-3">
               <div className="p-2 md:p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/5 shadow-inner">
                 <User className="text-white w-5 h-5 md:w-6 md:h-6" />
               </div>
               <h1 className="text-xl md:text-3xl font-black tracking-tight">Your Profile</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden sm:block">
                <AttendanceToggle />
              </div>
              <button onClick={handleLogout} className="p-2.5 md:p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md active:scale-90 transition-all border border-white/10 flex items-center gap-2 group shadow-lg">
                <span className="hidden md:block font-extrabold text-[10px] uppercase tracking-widest">End Session</span>
                <LogOut size={18} className="text-white group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 relative z-10 text-center md:text-left">
            <div className="relative">
              <div className="w-24 h-24 md:w-36 md:h-36 bg-linear-to-br from-[#00A86B] to-[#00d084] rounded-[2.5rem] md:rounded-[3.5rem] flex items-center justify-center border-4 border-white/10 shadow-2xl shadow-[#00A86B]/30 transition-all hover:scale-105 duration-500 group">
                <User className="text-white w-10 h-10 md:w-16 md:h-16 group-hover:rotate-6 transition-transform" />
              </div>
              <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-10 md:w-12 h-10 md:h-12 bg-white border-4 border-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="text-[#00A86B] w-5 md:w-6 h-5 md:h-6" />
              </div>
            </div>
            <div className="md:pb-2">
              <div className="md:hidden mb-2">
                <AttendanceToggle />
              </div>
              <h2 className="text-2xl md:text-5xl font-black text-white leading-none tracking-tight">Technician Center</h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-white/90 font-black mt-4 bg-white/10 hover:bg-white/15 cursor-default px-5 py-2.5 rounded-2xl text-[11px] md:text-sm w-max backdrop-blur-md border border-white/10 transition-colors tracking-widest uppercase">
                <Phone className="w-3.5 h-3.5 text-[#00A86B]" />
                <span>+91 {phone}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 md:px-0 -mt-10 md:-mt-16 relative z-20 space-y-6 md:space-y-10 flex-1">
        
        {/* Statistics Cards */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
           {[
              { label: 'Completed', val: completedCount.toString(), color: 'text-gray-900', bg: 'bg-white' },
              { label: 'Rating', val: '4.8', color: 'text-[#00A86B]', bg: 'bg-white' },
              { label: 'Earnings', val: earningsStr, color: 'text-blue-600', bg: 'bg-white' },
              { label: 'Active', val: '4h', color: 'text-orange-500', bg: 'bg-white' }
           ].map((stat) => (
             <div key={stat.label} className={`${stat.bg} p-5 md:p-8 rounded-[2rem] shadow-xl shadow-black/3 border border-white flex flex-col items-center justify-center transition-all hover:shadow-black/6 hover:-translate-y-1 group`}>
               <span className={`text-2xl md:text-4xl font-black ${stat.color} tracking-tighter group-hover:scale-110 transition-transform`}>{stat.val}</span>
               <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2 group-hover:text-gray-500">{stat.label}</span>
             </div>
           ))}
        </motion.div>
        
        {/* Menu Sections */}
        <div className="space-y-6 md:space-y-12">
          {menuSections.map((section, sectionIdx) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 + (sectionIdx * 0.1) }}
            >
              <h3 className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-4">{section.title}</h3>
              <div className="bg-white rounded-[2.2rem] md:rounded-[3rem] shadow-xl shadow-black/3 border border-white/50 overflow-hidden p-2 transition-all hover:shadow-black/5">
                {section.items.map((item) => (
                  <button 
                    key={item.title} 
                    onClick={() => handleMenuItemClick(item)}
                    className={`group w-full p-4 md:p-5 flex items-center justify-between hover:bg-gray-50/80 transition-all border-b border-gray-50 last:border-0 rounded-[1.8rem] active:scale-[0.98] mb-1 last:mb-0`}
                  >
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[1.5rem] ${item.bg} flex items-center justify-center shrink-0 shadow-sm border border-black/5 group-hover:scale-105 group-hover:rotate-3 transition-all duration-500`}>
                        <item.icon className={`${item.color} w-5 h-5 md:w-8 md:h-8`} />
                      </div>
                      <div className="text-left">
                        <span className="font-black text-gray-800 text-lg md:text-2xl tracking-tight block group-hover:text-[#00A86B] transition-colors">{item.title}</span>
                        <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 block opacity-0 group-hover:opacity-100 transition-opacity">Access Terminal</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 group-hover:bg-[#00A86B]/10 rounded-full flex items-center justify-center transition-colors">
                      <ChevronRight className="text-gray-300 w-5 h-5 md:w-6 md:h-6 group-hover:text-[#00A86B] group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.6 }}
          className="py-12 text-center"
        >
          <div className="inline-block px-8 py-3 bg-white/50 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Build Terminal: MEDDY-TECH-882-PWA</p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
