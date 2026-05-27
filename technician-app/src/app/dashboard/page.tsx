'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useJobStore } from '@/store/jobStore';
import { Bell, Sparkles, TrendingUp, Clock, Calendar, Target, ShieldCheck, ArrowRight } from 'lucide-react';

import { HorizontalJobScroller } from '@/components/job/HorizontalJobScroller';
import { StatPair } from '@/components/dashboard/StatPair';
import { ActiveJobBanner } from '@/components/dashboard/ActiveJobBanner';
import { AttendanceToggle } from '@/components/dashboard/AttendanceToggle';
import { ShiftTimer } from '@/components/dashboard/ShiftTimer';
import { FleetMonitor } from '@/components/dashboard/FleetMonitor';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

const getGreeting = () => {

  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

export default function DashboardPage() {
  const { user, isAuthenticated, phone, _hasHydrated } = useAuthStore();
  const { activeJob, jobs, availableJobs, stats, setActiveJob, fetchJobs, fetchAvailableJobs, fetchStats, selfAssignJob, loading } = useJobStore();
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    if (!_hasHydrated) return;

    if (isAuthenticated) {
      fetchJobs();
      fetchAvailableJobs();
      fetchStats();
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, fetchJobs, fetchAvailableJobs, router, _hasHydrated]);


  if (!isAuthenticated) return null;

  const pendingJobs = jobs.filter(j => j.status === 'assigned' || j.status === 'confirmed');
  const visibleJobs = pendingJobs; 
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const todayEarnings = completedJobs.reduce((acc, curr) => acc + curr.total_amount, 0) / 100; // to ₹
  const greeting = getGreeting();

  const handleSync = () => {
    setIsSyncing(true);
    toast.loading('Syncing with Meddy Fleet Ops...', { id: 'sync' });
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('System Operational & Synced!', { id: 'sync' });
    }, 2000);
  };

  const handleSelfAssign = async (job: any) => {
    try {
        toast.loading('Securing Assignment...', { id: 'assign' });
        await selfAssignJob(job.id);
        toast.success('Job Secured!', { id: 'assign' });
    } catch (err) {
        toast.error('Assignment failed. Try again.', { id: 'assign' });
    }
  };

  return (
    <div className="flex flex-col bg-[#F9FAFB] md:bg-gray-50/30 pb-24 md:pb-12 font-sans overflow-x-hidden">
      
      {/* Desktop & Mobile Header: More integrated hero section */}
      <div className="bg-[#00A86B] text-white px-4 sm:px-6 md:px-12 pt-8 md:pt-12 pb-20 md:pb-32 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-white/5 rounded-full blur-2xl md:blur-3xl -mr-40 -mt-40 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-black/10 rounded-full blur-xl md:blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8 relative z-10">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between md:justify-start gap-3 sm:gap-4 mb-4 md:mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 md:w-5 md:h-5 text-yellow-300 fill-yellow-300" />
                <span className="text-white/90 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[8px] md:text-[10px]">{greeting}</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                 <div className="scale-90 md:scale-100 transform origin-right">
                   <ShiftTimer />
                 </div>
                 <Link href="/notifications" className="relative p-2 bg-white/10 rounded-xl md:hidden backdrop-blur-md shrink-0">
                    <Bell size={16} className="text-white" />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#00A86B]"></span>
                 </Link>
                 <div className="md:hidden">
                   <AttendanceToggle />
                 </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-8">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight tracking-tighter">
                Welcome back, <br className="md:hidden" />
                <span className="text-white">Tech {phone?.slice(-4)}</span>
              </h1>
              <div className="hidden md:flex items-center gap-4 mb-2">
                <AttendanceToggle />
                <Link href="/notifications" className="relative p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all border border-white/10 group">
                    <Bell size={24} className="text-white group-hover:rotate-12 transition-transform" />
                    <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-[#00A86B]"></span>
                </Link>
              </div>
            </div>
            <p className="text-white/70 font-bold text-base md:text-lg mt-3 md:mt-4 max-w-md hidden sm:block">You have {pendingJobs.length} new assignments waiting for your review today.</p>
          </div>

          <div className="hidden md:grid grid-cols-2 gap-4 lg:min-w-[400px]">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-6 py-5 rounded-[2rem] flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Success Rate</span>
              <span className="text-2xl lg:text-3xl font-black">{stats?.success_rate || "0.0"}%</span>
              <div className="flex items-center gap-1.5 text-green-300 text-[10px] font-bold mt-2">
                <TrendingUp size={12} />
                Live
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-6 py-5 rounded-[2rem] flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Queue Time</span>
              <span className="text-2xl lg:text-3xl font-black">{stats?.queue_time_mins || "12"}m</span>
              <div className="flex items-center gap-1.5 text-blue-200 text-[10px] font-bold mt-2">
                <Clock size={12} />
                Network Avg
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 -mt-10 md:-mt-20 relative z-20 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
          
          {/* Main Content Area: Left/Center on desktop */}
          <div className="md:col-span-12 lg:col-span-8 space-y-8 md:space-y-10">
            
            {/* Action Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-6">
               <StatPair pendingCount={pendingJobs.length} earnings={todayEarnings} />
            </div>

            {/* Assignments Section */}
            <div>
              <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 md:h-8 bg-[#00A86B] rounded-full"></div>
                  <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Active Assignments</h2>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-100 px-3 md:px-4 py-1.5 md:py-2 rounded-2xl shadow-sm">
                   <Calendar size={14} className="text-gray-400" />
                   <span className="text-[10px] md:text-xs font-black text-gray-600">Today, {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                </div>
              </div>

              {visibleJobs.length > 0 ? (
                <HorizontalJobScroller jobs={visibleJobs} onAccept={setActiveJob} />
              ) : (
                <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-10 md:p-16 text-center shadow-xl shadow-black/2 border border-gray-50 flex flex-col items-center group overflow-hidden relative transition-all hover:shadow-black/5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00A86B]/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-110 transition-transform hidden md:block"></div>
                  <div className="w-16 md:w-20 h-16 md:h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 relative z-10">
                    <Calendar className="text-gray-300 w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-gray-900 mb-2 relative z-10">
                    Your Queue is Clear
                  </h3>
                  <p className="text-gray-400 font-bold max-w-xs text-xs md:text-sm relative z-10 leading-relaxed">
                    Check for available jobs in your neighborhood below.
                  </p>
                </div>
              )}

              {/* NEW Available Jobs Section */}
              {availableJobs.length > 0 && (
                <div className="mt-8 md:mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center justify-between mb-6 px-1">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 md:h-8 bg-blue-600 rounded-full"></div>
                      <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Available in Your Area</h2>
                    </div>
                  </div>
                  <HorizontalJobScroller jobs={availableJobs} onAccept={handleSelfAssign} />
                </div>
              )}


              {/* Duty Insights Section */}
              <div className="mt-8 md:mt-12">
                <div className="flex items-center gap-3 mb-6 md:mb-8 px-1">
                  <div className="w-1.5 h-6 md:h-8 bg-gray-900 rounded-full"></div>
                  <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Duty Operations</h2>
                  <span className="hidden sm:inline-block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 bg-gray-100 px-2.5 py-1 rounded-full">Fleet Pulse</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 pb-12 md:pb-20">
                  {/* Nearby Team */}
                  <div className="h-full">
                    <FleetMonitor />
                  </div>

                  {/* Daily Goal Card */}
                  <div className="bg-[#00A86B] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-7 text-white relative overflow-hidden flex flex-col justify-between group min-h-[300px] md:min-h-[340px] shadow-lg shadow-[#00A86B]/20">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-xl md:blur-2xl group-hover:scale-150 transition-transform duration-700 hidden md:block"></div>
                    <div>
                      <Target className="w-7 h-7 md:w-8 md:h-8 mb-4 opacity-50" />
                      <h3 className="text-xl font-black leading-tight mb-2">Daily Goal</h3>
                      <p className="text-white/70 font-bold text-sm leading-relaxed">3 more pickups to reach your ₹2000 target today.</p>
                    </div>
                    <div className="mt-6 bg-black/10 p-5 rounded-3xl border border-white/5 backdrop-blur-sm">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 text-white/80">
                        <span>Current Progress</span>
                        <span>{stats?.success_rate || 0}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all duration-1000 ease-out" style={{ width: `${stats?.success_rate || 0}%` }}></div>
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-widest mt-3 text-white/50 text-center">Consistent Pace</p>
                    </div>
                  </div>

                  {/* Pulse / Compliance Card */}
                  <div className="h-full bg-gray-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-7 text-white flex flex-col justify-between min-h-[300px] md:min-h-[340px] shadow-lg shadow-black/20 group overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-xl md:blur-3xl group-hover:bg-blue-500/10 transition-colors hidden md:block"></div>
                    <div>
                      <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/10 rounded-xl">
                            <ShieldCheck className="text-blue-400 w-5 h-5" />
                          </div>
                          <span className="font-black text-sm uppercase tracking-widest">Pulse</span>
                        </div>
                        <div className="px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-[8px] font-black uppercase tracking-tighter border border-blue-500/30">Secure</div>
                      </div>
                      <div className="space-y-3 md:space-y-4 relative z-10">
                        <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                          <span className="text-white/50 text-xs font-bold">Protocol Score</span>
                          <span className="font-black text-green-400">9.8</span>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                          <span className="text-white/50 text-xs font-bold">Safety Gear</span>
                          <span className="font-black text-blue-400">Verified</span>
                        </div>
                        <div className="flex justify-between items-center py-2.5">
                          <span className="text-white/50 text-xs font-bold">GPS Accuracy</span>
                          <span className="font-black">High</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="w-full mt-6 py-3.5 md:py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 disabled:opacity-50 flex items-center justify-center gap-2 relative z-10 group/btn"
                    >
                      {isSyncing ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Operational Sync</span>
                          <Sparkles size={12} className="text-yellow-400 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>


          {/* Sidebar Area: Multi-column support on medium screens, grid on large */}
          <div className="md:col-span-12 lg:col-span-4 space-y-6 md:space-y-8 sticky lg:top-8">
            {activeJob ? (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <ActiveJobBanner job={activeJob} />
              </div>
            ) : (
              <Card className="border-0 shadow-xl md:shadow-2xl shadow-black/3 rounded-[2rem] md:rounded-[2.5rem] bg-white p-6 md:p-8 overflow-hidden relative group transition-all hover:shadow-black/6">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00A86B]/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2 relative z-10">
                  <TrendingUp className="text-[#00A86B] w-5 h-5" />
                  Fleet Performance
                </h3>
                <div className="space-y-5 md:space-y-6 relative z-10">
                  {[
                    { label: 'Avg Distance', val: '4.2 km', progress: 65, color: 'bg-[#00A86B]' },
                    { label: 'Collection Time', val: '14 min', progress: 85, color: 'bg-blue-500' },
                    { label: 'Rating Stability', val: 'High', progress: 92, color: 'bg-orange-500' }
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                        <span>{item.label}</span>
                        <span className="text-gray-900">{item.val}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} transition-all duration-1000 ease-out`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-8 flex items-center justify-between p-4 bg-gray-50 hover:bg-[#00A86B]/10 rounded-2xl transition-all group/btn border border-transparent hover:border-[#008a58]/20">
                   <span className="font-bold text-gray-600 group-hover/btn:text-[#00A86B] text-sm">View Full Metrics</span>
                   <ArrowRight size={18} className="text-gray-300 group-hover/btn:text-[#00A86B] group-hover/btn:translate-x-1 transition-all" />
                </button>
              </Card>
            )}

            <Card className="border-0 shadow-xl md:shadow-2xl shadow-black/3 rounded-[2rem] md:rounded-[2.5rem] bg-gray-900 p-6 md:p-8 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
               <h3 className="text-xl font-black mb-4 relative z-10">24/7 Support</h3>
               <p className="text-white/60 text-sm font-medium leading-relaxed relative z-10 mb-6 max-w-[240px]">Need help with a collection or device issue? Tactical support is available.</p>
               <button className="w-full bg-white text-gray-900 py-4 rounded-2xl font-black text-sm relative z-10 transition-all active:scale-[0.97] hover:bg-gray-100 shadow-lg group">
                 <span className="group-hover:translate-x-0.5 transition-transform inline-block">Call Operator</span>
               </button>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
