'use client';

import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { Activity, HardDrive, Wifi, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';

export default function StatusPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshSystems = () => {
    setIsRefreshing(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Syncing tactical telemetry...',
        success: () => {
          setIsRefreshing(false);
          return 'All systems synchronized.';
        },
        error: 'Sync failed.'
      }
    );
  };

  const metrics = [
    { label: 'Core Engine', val: 'Operational', icon: Zap, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Network Latency', val: '14ms', icon: Wifi, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Tactical Cache', val: '86%', icon: HardDrive, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Security Layer', val: 'Active', icon: ShieldCheck, color: 'text-[#00A86B]', bg: 'bg-green-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <SubPageHeader title="System Status" description="App Telemetry" />
      
      <div className="max-w-4xl mx-auto p-5 space-y-8">
        <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A86B]/10 rounded-full blur-3xl"></div>
           <div className="flex flex-col items-center justify-center text-center">
              <div className="relative mb-8">
                 <div className="w-24 h-24 rounded-full border-8 border-white/5 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-8 border-[#00A86B] animate-pulse"></div>
                 </div>
                 <Activity className="absolute inset-0 m-auto text-white w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-2">Systems Nominal</h2>
              <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em] mb-8">Fleet Ops Sync Active</p>
              
              <button 
                onClick={refreshSystems}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${isRefreshing ? 'bg-white/5 text-white/40' : 'bg-[#00A86B] text-white shadow-xl shadow-[#00A86B]/20 overflow-hidden group'}`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                {isRefreshing ? 'Scanning...' : 'Re-scan Tactical Hub'}
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((item, i) => (
            <motion.div 
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[2rem] shadow-xl shadow-black/2 border border-white flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center border border-black/5`}>
                  <item.icon className={`${item.color} w-5 h-5`} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                   <p className="font-black text-gray-900 text-lg leading-none mt-1">{item.val}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
