"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  Users, 
  ClipboardCheck, 
  Activity,
  ArrowUpRight,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  Wallet,
  ArrowRight,
  Zap,
  Target,
  FlaskConical,
  CreditCard,
  History
} from "lucide-react";
import { useState, useMemo } from "react";
import HydrationGuard from "@/components/ui/HydrationGuard";
import { useLabStats, useLabEarnings } from "@/lib/hooks";
import { useAuthStore } from "@/store/authStore";

// --- Premium Chart Components (Manual SVG for maximum control & performance) ---

const AreaChart = ({ data, color, height = 200 }: { data: number[], color: string, height?: number }) => {
    const max = Math.max(...data, 1);
    const points = useMemo(() => {
        return data.map((val, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 80 - (val / max) * 60; // 80 is bottom, 60 is span
            return `${x},${y}`;
        }).join(" ");
    }, [data, max]);

    const fillPoints = `${points} 100,100 0,100`;

    return (
        <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                    <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
                        <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
                    </linearGradient>
                </defs>
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    d={`M ${points}`}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <motion.polygon
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    points={fillPoints}
                    fill={`url(#grad-${color})`}
                />
            </svg>
        </div>
    );
};

const BarChart = ({ data, color }: { data: number[], color: string }) => {
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end justify-between gap-1 h-32 px-2">
            {data.map((val: number, i: number) => (
                <motion.div
                    key={i}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${(val / max) * 100}%`, opacity: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.8, ease: "circOut" }}
                    className={`w-full rounded-t-lg ${color} relative group`}
                >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-dark text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                        {val} Orders
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

const DonutChart = ({ tests }: { tests?: { name: string; value: number }[] }) => {
    const data = tests?.length ? tests : [{ name: "General", value: 100 }];
    const colors = ["#00A86B", "#1E88E5", "#6366F1", "#F59E0B"];
    
    return (
        <div className="relative w-48 h-48 mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {data.map((item: { name: string; value: number }, i: number) => {
                    const total = data.reduce((sum, d) => sum + d.value, 0);
                    const prevTotal = data.slice(0, i).reduce((sum, d) => sum + d.value, 0);
                    const startAngle = (prevTotal / total) * 100;
                    const dashArray = `${(item.value / total) * 100} 100`;
                    
                    return (
                        <motion.circle
                            key={i}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke={colors[i % colors.length]}
                            strokeWidth="12"
                            strokeDasharray={dashArray}
                            strokeDashoffset={-startAngle}
                            initial={{ strokeDasharray: "0 100" }}
                            animate={{ strokeDasharray: dashArray }}
                            transition={{ duration: 1.5, ease: "circOut", delay: i * 0.1 }}
                            strokeLinecap="round"
                        />
                    );
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-dark-light">100%</span>
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Distributed</span>
            </div>
        </div>
    );
};

export default function LabAnalyticsPage() {
  const { data: statsData, isLoading: isStatsLoading } = useLabStats();
  const { data: earningsData, isLoading: isEarningsLoading } = useLabEarnings();
  const user = useAuthStore(state => state.user);

  const stats = statsData?.stats || [];
  const popularTests = statsData?.popular_tests || [];
  const wallet = earningsData?.wallet || { pending_balance: 0, total_earned: 0, total_paid_out: 0 };
  const ledger = earningsData?.ledger || [];

  const loading = isStatsLoading || isEarningsLoading;

  // Mock trend data for charts (since real historical API might not exist yet)
  const revenueTrend = [20, 25, 40, 35, 50, 65, 55, 75, 90, 85, 100];
  const orderVolumeTrend = [12, 15, 8, 10, 22, 18, 25, 30, 28, 35, 40, 32, 28, 30];

  return (
    <HydrationGuard>
      <div className="space-y-10 pb-20">
        
        {/* Flagship Header */}
        <div className="relative pt-4 overflow-hidden rounded-[3.5rem] bg-linear-to-b from-surface via-white/40 to-transparent p-1">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/3 blur-[120px] rounded-full -mr-48 -mt-48" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
             <div>
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
                >
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Biometric Intelligence Console</span>
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-black text-dark-light tracking-tight leading-none">
                    Performance <span className="text-primary italic">Analytics</span>
                </h1>
                <p className="text-text-muted font-bold text-lg mt-4 max-w-xl">
                    Real-time operational insights and financial distribution intelligence.
                </p>
             </div>
             
             <div className="flex items-center gap-4">
                 <button className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white border border-border shadow-sm text-xs font-black uppercase tracking-widest hover:border-primary/20 transition-all">
                    <Calendar className="w-4 h-4" /> Last 30 Days
                 </button>
                 <button className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-dark text-white shadow-xl shadow-dark/20 text-xs font-black uppercase tracking-widest hover:bg-dark-light transition-all">
                    <Download className="w-4 h-4" /> Export Data
                 </button>
             </div>
          </div>
        </div>

        {/* Global Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {loading ? Array(4).fill(0).map((_, i) => (
               <div key={i} className="h-44 bg-white rounded-5xl border border-border animate-pulse" />
           )) : stats.map((stat: { label: string; value: number | string; delta: string; icon: string; color: string }, i: number) => (
               <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-white/80 backdrop-blur-3xl rounded-5xl p-8 border-2 border-white/50 shadow-2xl shadow-black/2 hover:shadow-primary/10 hover:-translate-y-1 transition-all overflow-hidden relative"
               >
                  <div className="relative z-10 flex flex-col justify-between h-full">
                     <div className="flex items-center justify-between mb-8">
                        <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform`}>
                            {stat.icon === 'TrendingUp' ? <TrendingUp className="w-7 h-7" /> : 
                             stat.icon === 'Users' ? <Users className="w-7 h-7" /> : 
                             stat.icon === 'ClipboardCheck' ? <ClipboardCheck className="w-7 h-7" /> : <Activity className="w-7 h-7" />}
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black">
                            <ArrowUpRight className="w-3.5 h-3.5" /> {stat.delta}
                        </div>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.25em] mb-2">{stat.label}</p>
                        <p className="text-4xl font-black text-dark-light tracking-tighter leading-none">{stat.value}</p>
                     </div>
                  </div>
                  {/* Subtle Background Icon */}
                  <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                    {stat.icon === 'TrendingUp' ? <TrendingUp className="w-32 h-32" /> : <Activity className="w-32 h-32" />}
                  </div>
               </motion.div>
           ))}
        </div>

        {/* Deep Analytics Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
           
           {/* Revenue Growth Trend */}
           <div className="lg:col-span-8 bg-white/80 backdrop-blur-3xl rounded-[3.5rem] p-10 border-2 border-white/50 shadow-2xl shadow-black/2 relative group">
              <div className="flex items-center justify-between mb-12">
                 <div className="space-y-1">
                    <h2 className="text-2xl font-black text-dark-light tracking-tight leading-none group-hover:text-primary transition-colors">Financial Growth Trend</h2>
                    <p className="text-[11px] font-black text-text-muted uppercase tracking-widest italic">Daily gross revenue distribution</p>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        <span className="text-[10px] font-black text-dark-light uppercase">Gross Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-border" />
                        <span className="text-[10px] font-black text-text-muted uppercase">Avg. Benchmark</span>
                    </div>
                 </div>
              </div>
              
              <div className="mb-10 text-center">
                 <p className="text-5xl font-black text-dark-light tracking-tighter mb-2">₹{((wallet.total_earned || 0) / 100).toLocaleString()}</p>
                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Total Value Generated</p>
              </div>

              <AreaChart data={revenueTrend} color="#00A86B" height={280} />
              
              <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t border-border/40">
                 {['01 May', '10 May', '20 May', '30 May'].map(date => (
                     <div key={date} className="text-center">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{date}</p>
                     </div>
                 ))}
              </div>
           </div>

           {/* Wallet & Payout Stats */}
           <div className="lg:col-span-4 space-y-8">
              <div className="bg-dark rounded-[3.5rem] p-10 text-white shadow-2xl shadow-dark/40 border border-white/10 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16 animate-pulse" />
                 <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-10">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary border border-white/10">
                          <Wallet className="w-6 h-6" />
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Partner Wallet</span>
                    </div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Available for Payout</p>
                    <h3 className="text-5xl font-black text-white tracking-tighter mb-8 italic">
                        ₹{((wallet.pending_balance || 0) / 100).toLocaleString()}
                    </h3>
                    
                    <div className="space-y-4 mb-10">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[10px] font-black uppercase text-white/40">Lifetime Earnings</span>
                            <span className="text-sm font-black text-white">₹{((wallet.total_earned || 0) / 100).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[10px] font-black uppercase text-white/40">Total Settled</span>
                            <span className="text-sm font-black text-white">₹{((wallet.total_paid_out || 0) / 100).toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <button className="w-full bg-primary text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                        Withdraw Funds <ArrowRight className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              {/* Quick Intelligence Feed */}
              <div className="bg-white rounded-[3rem] p-10 border border-border shadow-sm">
                 <h3 className="text-sm font-black text-dark-light uppercase tracking-widest mb-8 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" /> Active Efficiency
                 </h3>
                 <div className="space-y-8">
                    {[
                        { label: "Successful Collections", value: "98.4%", color: "bg-emerald-500" },
                        { label: "Avg. Turnaround Time", value: "18.2 Hrs", color: "bg-blue-500" },
                        { label: "Patient Satisfaction", value: "4.9/5.0", color: "bg-amber-500" },
                    ].map((item, i) => (
                        <div key={item.label} className="space-y-3">
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{item.label}</span>
                              <span className="text-sm font-black text-dark-light">{item.value}</span>
                           </div>
                           <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                              <div className={`h-full ${item.color} rounded-full`} style={{ width: i === 0 ? '98%' : i === 1 ? '75%' : '90%' }} />
                           </div>
                        </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Secondary Analytics Strip */}
        <div className="grid lg:grid-cols-12 gap-8">
           
           {/* Booking Volume Heatmap */}
           <div className="lg:col-span-4 bg-white/80 backdrop-blur-3xl rounded-[3rem] p-10 border border-border shadow-sm group">
              <h3 className="text-sm font-black text-dark-light uppercase tracking-widest mb-10 leading-relaxed group-hover:text-primary transition-colors italic">Booking Load Density</h3>
              <BarChart data={orderVolumeTrend} color="bg-indigo-500" />
              <div className="mt-8 flex items-center justify-between text-[10px] font-black text-text-muted uppercase tracking-widest">
                 <span>May 01</span>
                 <span>Today</span>
              </div>
           </div>

           {/* Test Mix Distribution */}
           <div className="lg:col-span-4 bg-white/80 backdrop-blur-3xl rounded-[3rem] p-10 border border-border shadow-sm flex flex-col items-center">
              <h3 className="text-sm font-black text-dark-light uppercase tracking-widest mb-8 self-start italic">Diagnostic Test Distribution</h3>
              <DonutChart tests={popularTests} />
              <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                 {popularTests.slice(0, 4).map((t: { name: string; value: number }, i: number) => (
                     <div key={t.name} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-blue-500' : 'bg-indigo-500'}`} />
                        <span className="text-[9px] font-black text-text-muted uppercase truncate">{t.name}</span>
                     </div>
                 ))}
              </div>
           </div>

           {/* Financial Log (Ledger) */}
           <div className="lg:col-span-4 bg-white/80 backdrop-blur-3xl rounded-[3rem] p-10 border border-border shadow-sm group">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-dark-light uppercase tracking-widest group-hover:text-primary transition-colors italic">Recent Settlements</h3>
                    <History className="w-4 h-4 text-text-muted" />
                </div>
                <div className="space-y-5">
                    {ledger.length > 0 ? ledger.slice(0, 5).map((log: { id: string; description?: string; created_at: string; type: string; amount?: number }) => (
                        <div key={log.id} className="flex items-center justify-between pb-4 border-b border-border/60 last:border-0 last:pb-0">
                            <div className="space-y-1">
                                <p className="text-xs font-black text-dark-light tracking-tight">{log.description || "Order Settlement"}</p>
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">{new Date(log.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-xs font-black ${log.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {log.type === 'credit' ? '+' : '-'} ₹{((log.amount || 0) / 100).toLocaleString()}
                                </p>
                                <p className="text-[8px] font-black text-emerald-600/60 uppercase tracking-widest">Confirmed</p>
                            </div>
                        </div>
                    )) : (
                        <div className="py-10 text-center">
                            <CreditCard className="w-10 h-10 text-border mx-auto mb-4" />
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">No Recent Log</p>
                        </div>
                    )}
                </div>
                <button className="w-full mt-10 py-5 rounded-2xl bg-surface hover:bg-border/30 text-[10px] font-black text-text-muted uppercase tracking-widest transition-all">
                    View Financial Transcript
                </button>
           </div>

        </div>

      </div>
    </HydrationGuard>
  );
}
