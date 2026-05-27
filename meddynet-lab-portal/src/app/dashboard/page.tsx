"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  Users, 
  ClipboardCheck, 
  Activity,
  ArrowUpRight,
  Clock,
  ClipboardList,
  Sparkles,
  Target,
  Zap,
  Filter,
  TestTube2
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import BookingActions from "@/components/dashboard/BookingActions";
import Toast from "@/components/ui/Toast";
import { useLabStats, useLabBookings, useUpdateBookingStatus } from "@/lib/hooks";
import { useAuthStore } from "@/store/authStore";

const ICON_MAP: Record<string, React.ElementType> = {
  TrendingUp: TrendingUp,
  Users: Users,
  ClipboardCheck: ClipboardCheck,
  Activity: Activity,
};

interface Stat {
  label: string;
  value: string;
  icon: React.ElementType | string;
  delta: string;
  color: string;
  glowColor?: string;
}

interface DashboardBooking {
  id: string;
  patient_name: string;
  scheduled_at: string;
  status: string;
  type: string;
}

const PopularTests = ({ tests }: { tests?: { name: string; percentage?: number; value?: number }[] }) => {
  const displayTests = tests?.length ? tests.map(t => ({
    name: t.name,
    value: t.percentage || t.value || 0
  })) : [
    { name: "Full Body Checkup", value: 45 },
    { name: "CBC + ESR", value: 32 },
    { name: "HbA1c Glycated", value: 18 },
  ];

  const colors = ["bg-primary", "bg-accent", "bg-indigo-500", "bg-rose-500"];

  return (
    <div className="space-y-6">
      {displayTests.map((test, i) => (
        <div key={test.name} className="space-y-2.5">
          <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-dark-light/70">
            <span className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${colors[i % colors.length]}`} />
              {test.name}
            </span>
            <span className="font-inter">{test.value}%</span>
          </div>
          <div className="h-2 w-full bg-surface-white/50 rounded-full overflow-hidden border border-border/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${test.value}%` }}
              transition={{ delay: 0.5 + i * 0.1, duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
              className={`h-full ${colors[i % colors.length]} rounded-full shadow-lg`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default function LabDashboardHome() {
  const [toast, setToast] = useState<{message: string, type: "success" | "error"} | null>(null);
  const user = useAuthStore(state => state.user);
  
  const { data: statsData, isLoading: isStatsLoading } = useLabStats();
  const { data: bookingsData, isLoading: isBookingsLoading } = useLabBookings();
  const updateStatusMutation = useUpdateBookingStatus();

  const rawStats = statsData?.stats || [];
  const loading = isStatsLoading || isBookingsLoading;

  // Enhance stats with glow colors and premium labels
  const stats: Stat[] = rawStats.length > 0 ? rawStats.map((s: Omit<Stat, 'glowColor'>, i: number) => ({
    ...s,
    glowColor: i === 0 ? "rgba(0,168,107,0.1)" : i === 1 ? "rgba(30,136,229,0.1)" : i === 2 ? "rgba(99,102,241,0.1)" : "rgba(245,158,11,0.1)"
  })) : [
    { label: "Daily Revenue", value: "₹0", icon: TrendingUp, delta: "0%", color: "bg-primary", glowColor: "rgba(0,168,107,0.1)" },
    { label: "Active Samples", value: "0", icon: Activity, delta: "0%", color: "bg-accent", glowColor: "rgba(30,136,229,0.1)" },
    { label: "Total Patients", value: "0", icon: Users, delta: "0%", color: "bg-indigo-500", glowColor: "rgba(99,102,241,0.1)" },
    { label: "Success Rate", value: "100%", icon: ClipboardCheck, delta: "0%", color: "bg-emerald-500", glowColor: "rgba(16,185,129,0.1)" }
  ];

  const labName = user?.name || "Premium Lab Partner";
  const recentBookings = (bookingsData || []).slice(0, 5) as DashboardBooking[];

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ bookingId: id, status: newStatus.toLowerCase().replace(/ /g, '_') });
      setToast({ message: `Status updated successfully`, type: "success" });
    } catch {
      setToast({ message: `Failed to update status`, type: "error" });
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await updateStatusMutation.mutateAsync({ bookingId: id, status: "cancelled" });
      setToast({ message: `Booking cancelled successfully`, type: "success" });
    } catch {
      setToast({ message: `Failed to cancel booking`, type: "error" });
    }
  };

  return (
    <div className="space-y-12 pb-20">
        {/* Flagship Hero Header */}
        <div className="relative pt-4 overflow-hidden rounded-[3.5rem]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full -ml-48 -mb-48" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8 py-2">
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-xl border border-border/80 shadow-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Lab IQ • Live Intelligence</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-4xl md:text-5xl font-black text-dark-light tracking-tight leading-[1.1] mb-3">
                  Welcome back, <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-accent to-indigo-600 animate-gradient pb-2 block">{labName}</span>
                </h1>
                <p className="text-text-muted font-bold text-lg md:text-xl max-w-xl leading-relaxed">
                  Analyze performance, track collections, and manage diagnostics with real-time MeddyNet precision.
                </p>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex bg-white/80 backdrop-blur-2xl rounded-4xl p-2 shadow-2xl shadow-dark/5 border border-white/50 lg:mb-2 overflow-hidden relative group"
            >
               <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative z-10 flex items-center px-4 py-3 gap-6">
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Today</span>
                   <span className="text-base font-black text-dark-light whitespace-nowrap">
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                   </span>
                 </div>
                 <div className="h-10 w-px bg-border/80" />
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Network Status</span>
                   <div className="flex items-center gap-2 text-base font-black text-dark-light">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      Optimized
                   </div>
                 </div>
               </div>
            </motion.div>
          </div>
        </div>

        {/* Dynamic Metric Grid - Flagship Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
             Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-44 bg-white/80 backdrop-blur-xl rounded-5xl p-8 border border-white animate-pulse" />
             ))
          ) : (
            stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="group relative bg-white/80 backdrop-blur-3xl rounded-5xl p-8 border-2 border-white/50 shadow-2xl shadow-black/5 hover:shadow-primary/10 transition-all hover:-translate-y-2 overflow-hidden"
              >
                <div 
                   className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" 
                   style={{ background: `radial-gradient(circle at 100% 0%, ${stat.glowColor}, transparent 70%)` }}
                />
                
                <div className="relative z-10 flex items-start justify-between mb-8">
                  <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {(() => {
                      const Icon = typeof stat.icon === 'string' ? ICON_MAP[stat.icon] || ClipboardCheck : stat.icon;
                      return <Icon className="w-7 h-7" />;
                    })()}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-white/80 border border-border shadow-sm text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {stat.delta}
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-text-muted text-[11px] font-black uppercase tracking-[0.25em] mb-2">{stat.label}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-dark-light tracking-tighter leading-none">{stat.value}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Central Operations Area */}
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Main Collection Queue - High Fidelity */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white/80 backdrop-blur-3xl rounded-[3.5rem] p-8 md:p-12 border-2 border-white/50 shadow-2xl shadow-black/3 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-6 relative z-10">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-dark-light tracking-tight leading-none mb-3">Collection Queue</h2>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                       <Target className="w-4 h-4 text-primary" />
                       Real-time operational stream
                    </span>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-xs font-black text-primary uppercase tracking-widest">Live Updates</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <button className="p-3 bg-surface hover:bg-border/30 rounded-2xl border border-border/80 transition-all text-text-muted group/btn">
                      <Filter className="w-5 h-5 group-hover/btn:text-primary transition-colors" />
                   </button>
                   <Link 
                     href="/bookings"
                     className="px-8 py-4 rounded-3xl bg-dark text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-dark/20 hover:scale-[1.02] hover:shadow-dark/40 active:scale-[0.98] transition-all flex items-center gap-3"
                   >
                     View All <ArrowUpRight className="w-4 h-4" />
                   </Link>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                     <div className="flex flex-col gap-6">
                        {Array(3).fill(0).map((_, i) => (
                           <div key={i} className="h-28 bg-surface/50 rounded-4xl animate-pulse" />
                        ))}
                     </div>
                  ) : recentBookings.length > 0 ? recentBookings.map((booking, idx) => (
                    <motion.div 
                      key={booking.id} 
                      layout
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-5xl border-2 border-transparent hover:border-white hover:bg-surface/50 hover:shadow-2xl hover:shadow-black/2 transition-all duration-500 gap-6"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white font-black shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative overflow-hidden ${booking.type?.toLowerCase().includes('home') ? 'bg-orange-500' : 'bg-primary'}`}>
                           <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                           {booking.type?.toLowerCase().includes('home') ? <Zap className="w-8 h-8" /> : <TestTube2 className="w-8 h-8" />}
                        </div>
                        <div className="text-left">
                          <h4 className="font-black text-dark-light text-xl leading-none mb-2 tracking-tight">{booking.patient_name}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">ID: #{booking.id.slice(0, 8)}</span>
                            <div className="w-1 h-1 rounded-full bg-border" />
                            <span className="text-xs font-bold text-text-muted">{booking.type?.replace('_', ' ') || "Clinic"} Visit</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-10">
                        <div className="flex flex-col items-start md:items-end">
                          <div className="flex items-center gap-2 text-base font-black text-dark-light mb-1">
                            <Clock className="w-4.5 h-4.5 text-primary" />
                            {booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                          </div>
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Scheduled Slot</span>
                        </div>
                        
                        <div className="flex items-center gap-5">
                          <div className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all duration-500 shadow-sm ${
                            booking.status?.toLowerCase() === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50' :
                            booking.status?.toLowerCase() === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100/50' :
                            'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50'
                          }`}>
                            {booking.status?.replace('_', ' ')}
                          </div>
                          <BookingActions 
                            bookingId={booking.id} 
                            patientName={booking.patient_name}
                            booking={booking}
                            onStatusUpdate={handleStatusUpdate}
                            onCancel={handleCancel}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-32 text-center"
                    >
                      <div className="w-24 h-24 bg-surface rounded-4xl flex items-center justify-center mx-auto mb-8 shadow-inner overflow-hidden relative group">
                         <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                         <ClipboardList className="w-12 h-12 text-primary/30 relative z-10" />
                      </div>
                      <h3 className="text-2xl font-black text-dark-light mb-2 tracking-tight">System All Caught Up</h3>
                      <p className="text-text-muted font-bold max-w-sm mx-auto leading-relaxed">No pending lab collections found in your live operational workstream.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Operational Intelligence Sidebar - Flagship Visuals */}
          <div className="lg:col-span-4 space-y-10">
            
            {/* Market Performance */}
            <div className="bg-white/80 backdrop-blur-3xl rounded-[3rem] p-10 border-2 border-white/50 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
              <div className="relative z-10 mb-10">
                <h2 className="text-2xl font-black text-dark-light tracking-tight mb-2">Demand Analytics</h2>
                <p className="text-text-muted font-bold text-sm tracking-tight">Most requested diagnostic services</p>
              </div>
              <PopularTests tests={statsData?.popular_tests} />
              
              <div className="mt-12 pt-8 border-t border-border/60">
                 <div className="flex items-center justify-between p-5 bg-surface/50 rounded-4xl border border-border/80 group/card transition-all hover:bg-white">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Market Leader</p>
                      <p className="text-sm font-black text-dark-light tracking-tight group-hover:text-primary transition-colors">Lab Efficiency Plus</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                       98%
                    </div>
                 </div>
              </div>
            </div>

            {/* Premium Professional CTA */}
            <div className="bg-dark rounded-[3.5rem] p-12 text-white shadow-[0_30px_60px_rgba(0,0,0,0.2)] relative overflow-hidden group border border-white/10">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 animate-pulse" />
              <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-accent/20 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2 animate-glow-pulse" />
              
              <div className="relative z-10 flex flex-col h-full">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-8 w-fit">
                   <Target className="w-3 h-3" /> Partner Excellence
                </span>
                
                <h2 className="text-3xl font-black tracking-tight mb-4 leading-none">
                  Drive Your <br />
                  <span className="text-primary italic">Lab Business</span> <br />
                  Forward.
                </h2>
                <p className="text-white/40 text-sm font-bold mb-10 leading-relaxed max-w-[220px]">
                   Access advanced analytics, financial reports, and patient feedback.
                </p>
                
                <Link 
                  href="/reports"
                  className="w-full flex items-center justify-center py-5 rounded-4xl bg-white text-dark font-black text-sm shadow-xl hover:-translate-y-2 active:scale-[0.98] transition-all duration-300 group/link"
                >
                  Download Market Insights <ArrowUpRight className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
                </Link>
              </div>
            </div>

          </div>
        </div>

        <AnimatePresence>
          {toast && (
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => setToast(null)} 
            />
          )}
        </AnimatePresence>
      </div>
  );
}