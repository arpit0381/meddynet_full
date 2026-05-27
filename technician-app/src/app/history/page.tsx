'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useJobStore } from '@/store/jobStore';
import { Card, CardContent } from '@/components/ui/card';
import { History as HistoryIcon, MapPin, IndianRupee, Calendar, TrendingUp, Filter, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HistoryPage() {
  const { isAuthenticated } = useAuthStore();
  const { jobs } = useJobStore();
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

  const completedJobs = jobs.filter(j => j.status === 'completed');

  return (
    <div className="flex flex-col bg-gray-50 pb-24 md:pb-12 font-sans overflow-x-hidden">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-4 sm:px-6 md:px-10 pt-10 md:pt-12 pb-6 md:pb-8 shadow-sm border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-2xl md:hidden">
            <HistoryIcon className="text-[#00A86B]" size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <HistoryIcon className="text-[#00A86B] hidden md:block" size={28} />
              Job History
            </h1>
            <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Review your past performance</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between md:justify-end gap-6 bg-gray-50/50 md:bg-transparent p-3 md:p-0 rounded-2xl">
           <div className="flex flex-col items-start md:items-end">
              <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Earned Today</span>
              <span className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter">₹{completedJobs.reduce((acc, j) => acc + (j.total_amount / 100 || 0), 0)}</span>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-[#00A86B] shadow-lg shadow-[#00A86B]/20 flex items-center justify-center group">
              <TrendingUp className="text-white w-6 h-6 group-hover:scale-110 transition-transform" />
           </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-2xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all shadow-sm active:scale-95">
            <Filter size={16} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-lg active:scale-95">
            Export Report
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-10 pt-6 md:pt-10 max-w-7xl mx-auto w-full">
        {completedJobs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {completedJobs.map((job, index) => (
              <motion.div 
                key={job.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="shadow-lg shadow-black/3 rounded-[2rem] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all bg-white group border border-gray-50/50">
                  <CardContent className="p-6 md:p-7 flex flex-col gap-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                           <Calendar className="w-3.5 h-3.5 text-gray-400" />
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{new Date(job.scheduled_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-black text-gray-900 text-xl md:text-2xl tracking-tight leading-none group-hover:text-[#00A86B] transition-colors">{job.patient_name}</h3>
                      </div>
                      <div className="flex items-center gap-1 font-black text-gray-900 bg-green-50/50 px-4 py-2 rounded-2xl border border-green-100/30 group-hover:bg-[#00A86B] group-hover:text-white transition-colors duration-300">
                        <IndianRupee className="w-4 h-4 text-[#00A86B] group-hover:text-white" />
                        <span className="text-lg leading-none">{job.total_amount / 100}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start text-xs text-gray-500 font-medium bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50 group-hover:bg-white group-hover:border-gray-100/50 transition-all">
                      <MapPin className="w-4 h-4 mr-2.5 shrink-0 text-[#00A86B] mt-0.5" />
                      <span className="leading-relaxed font-bold text-gray-600">{job.address}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-auto border-t border-gray-50 pt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#00A86B] shadow-[0_0_8px_rgba(0,168,107,0.5)]"></div>
                        <span className="text-[10px] font-black text-[#00A86B] uppercase tracking-widest">Mission Completed</span>
                      </div>
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md self-end">{job.id}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-10 md:p-20 mt-6 md:mt-20 bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-2xl shadow-black/3 border border-gray-50 max-w-2xl mx-auto flex flex-col items-center overflow-hidden relative group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gray-50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="w-20 md:w-24 h-20 md:h-24 bg-linear-to-br from-gray-50 to-gray-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner relative z-10">
              <ClipboardList className="text-gray-300 w-10 md:w-12 h-10 md:h-12" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2 tracking-tight relative z-10">No job history yet</h3>
            <p className="text-gray-500 font-medium text-sm md:text-base max-w-xs mx-auto relative z-10 leading-relaxed">Your completed collections will appear here. Build your tactical track record!</p>
            <button onClick={() => router.push('/dashboard')} className="mt-8 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl relative z-10 flex items-center gap-2">
              <span>Back to Duty</span>
              <TrendingUp size={18} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
