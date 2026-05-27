"use client";

import { motion, type Variants, AnimatePresence } from "framer-motion";
import {
  Calendar,
  FileText,
  Wallet,
  ChevronRight,
  Activity,
  ArrowUpRight,
  Clock,
  MapPin,
  Search,
  Bell,
  FlaskConical,
  ArrowRight,
  BrainCircuit,
  ShieldCheck,
  User,
  Sparkles,
  Check,
  Navigation,
  Crown,
  MessageCircle
} from "lucide-react";
import Link from "next/link";
import { Lab } from "@/lib/labs";
import MapModal from "@/components/modals/MapModal";

import { useUser } from "@/context/UserContext";
import { useState, useEffect, useRef } from "react";
import { haptics } from "@/lib/haptics";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const item: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

const searchDropdown: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.15, ease: "easeIn" } }
};

function MiniGraph({ color }: { color: string }) {
  return (
    <svg className="w-20 h-10 opacity-60 shrink-0" viewBox="0 0 100 40">
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        d="M0 35 Q 20 10 40 30 T 70 15 T 100 25"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Upcoming":
    case "confirmed": return "text-blue-600 bg-blue-50/80 border-blue-100";
    case "Completed":
    case "report_ready":
    case "completed": return "text-emerald-600 bg-emerald-50/80 border-emerald-100";
    case "Cancelled": return "text-rose-600 bg-rose-50/80 border-rose-100";
    case "In-Progress":
    case "assigned":
    case "on_the_way":
    case "collection_done": return "text-amber-600 bg-amber-50/80 border border-amber-200";
    default: return "text-slate-400 bg-slate-50 border-slate-100";
  }
};

const healthTips = [
  { id: 1, icon: <BrainCircuit className="w-5 h-5" />, text: "Your Vitamin D levels could be better. Try spending 15 minutes in the morning sun.", tag: "Tip" },
  { id: 2, icon: <Activity className="w-5 h-5" />, text: "You've finished 85% of your health goals this month. Keep it up!", tag: "Done" },
  { id: 3, icon: <ShieldCheck className="w-5 h-5" />, text: "Your Thyroid checkup is due in 14 days. Book early for your preferred time.", tag: "Alert" },
];

export default function DashboardOverviewPage() {
  const { user, notificationItems } = useUser();
  const unreadCount = notificationItems.filter(n => !n.read).length;
  const [tipIndex, setTipIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedMapLab, setSelectedMapLab] = useState<Lab | null>(null);
  const [realBookings, setRealBookings] = useState<any[]>([]);
  const [realReports, setRealReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [bRes, rRes] = await Promise.all([
          api.get("/bookings"),
          api.get("/reports")
        ]);
        setRealBookings(bRes.data);
        setRealReports(rRes.data);
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();

    const timer = setInterval(() => {
      setTipIndex((p) => (p + 1) % healthTips.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

    // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchFocused(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const upcomingBookingsCount = realBookings.filter(b => ["confirmed", "assigned", "on_the_way"].includes(b.status.toLowerCase())).length;
  const readyReportsCount = realReports.filter(r => r.status.toLowerCase() === "ready").length;
  
  const nextBooking = realBookings.filter(b => ["confirmed", "assigned", "on_the_way"].includes(b.status.toLowerCase()))[0];
  const appointmentText = nextBooking 
    ? `${new Date(nextBooking.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${new Date(nextBooking.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
    : "No Appointments";
  const appointmentLink = nextBooking 
    ? `/dashboard/bookings/${nextBooking.id}`
    : "/search";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  // Search Logic
  const filteredBookings = searchQuery.length > 1 
    ? realBookings.filter(b => 
        (b.lab?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.items?.some((t: any) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 3)
    : [];

  const filteredReports = searchQuery.length > 1
    ? realReports.filter(r => 
        (r.test_name || r.testName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.lab?.name || r.labName || "").toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const hasSearchResults = filteredBookings.length > 0 || filteredReports.length > 0;

  if (isLoading) {
    return (
      <div className="max-w-[1300px] mx-auto space-y-8 pb-20 pt-4">
        {/* Banner Skeleton */}
        <div className="hidden md:block h-32 w-full rounded-[40px] bg-slate-50 relative overflow-hidden">
           <div className="absolute inset-0 bg-shimmer animate-shimmer" />
        </div>
        
        {/* Utility Bar Skeleton */}
        <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
           <Skeleton className="h-16 w-full sm:w-80 lg:w-96 rounded-[32px]" />
           <div className="flex gap-4">
              <Skeleton className="h-12 w-32 rounded-2xl" />
              <Skeleton className="h-12 w-48 rounded-2xl" />
           </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-[32px]" />
           ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-8">
              <Skeleton className="h-[400px] rounded-[40px]" />
              <Skeleton className="h-[300px] rounded-[40px]" />
           </div>
           <div className="lg:col-span-4 space-y-8">
              <Skeleton className="h-[250px] rounded-[40px]" />
              <Skeleton className="h-[450px] rounded-[40px]" />
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1300px] mx-auto space-y-6 pb-20">
      
      {/* Health Tips Slider */}
      {/* Top Banner - Responsive (Desktop only as requested) */}
      <motion.div 
        initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }}
        className="hidden md:block relative overflow-hidden rounded-[40px] group bg-linear-to-r from-dark to-slate-900 p-[1.5px] shadow-2xl shadow-dark/20 mb-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_150%,#00A86B_0%,transparent_40%)] opacity-50 sm:opacity-100" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_-50%,#1E88E5_0%,transparent_40%)] opacity-50 sm:opacity-100" />
        
        <div className="relative bg-[#0A0F1E]/95 backdrop-blur-3xl rounded-[38.5px] px-6 py-5 sm:px-8 flex flex-col xl:flex-row items-center justify-between gap-6 group">
          <div className="flex items-center gap-4 sm:gap-6 flex-1 w-full sm:w-auto">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/3 border border-primary/20 flex items-center justify-center shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/20 animate-pulse" />
                <BrainCircuit className="w-6 h-6 sm:w-7 sm:h-7 text-primary relative z-10" />
            </div>
            <div className="min-h-[40px] flex flex-col justify-center flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tipIndex}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-primary shrink-0" />
                    <span className="text-[8px] sm:text-[9px] uppercase font-black tracking-[0.3em] text-primary truncate max-w-[100px] sm:max-w-none">{healthTips[tipIndex].tag}</span>
                  </div>
                  <p className="text-white text-[11px] sm:text-sm font-medium italic tracking-tight leading-snug line-clamp-2 sm:line-clamp-1 truncate sm:whitespace-normal">&quot;{healthTips[tipIndex].text}&quot;</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center justify-between xl:justify-end gap-6 shrink-0 w-full xl:w-auto border-t xl:border-none border-white/5 pt-4 xl:pt-0">
             <div className="hidden sm:flex items-center -space-x-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-4 border-[#0A0F1E] bg-slate-800 flex items-center justify-center overflow-hidden">
                        <User className="w-4 h-4 text-slate-400" />
                    </div>
                ))}
                <div className="w-8 h-8 rounded-full border-4 border-[#0A0F1E] bg-primary text-white text-[8px] font-black flex items-center justify-center">+4k</div>
             </div>
             <p className="text-[9px] font-black text-white/40 uppercase tracking-widest hidden lg:block">People Online</p>
              <Link href="/search" className="h-10 sm:h-12 px-5 sm:px-6 rounded-2xl bg-white text-dark font-black text-[9px] uppercase tracking-[0.2em] transition-all hover:bg-white/90 active:scale-95 shadow-2xl shrink-0 w-full sm:w-auto flex items-center justify-center">
                Explore Lab
              </Link>
          </div>
        </div>
      </motion.div>
 
      {/* Utility Bar - Mobile Optimized */}
      <motion.div variants={item} className="relative flex flex-col xl:flex-row items-center justify-between gap-6 mb-10 w-full">
        <div className="w-full xl:w-auto flex flex-col sm:flex-row items-center gap-4 flex-1">
          <div ref={searchContainerRef} className="relative w-full sm:w-80 lg:w-96">
            <div className={`flex items-center bg-white border border-border rounded-[32px] px-6 py-4 focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary transition-all group shadow-sm shrink-0 ${isSearchFocused ? 'ring-4 ring-primary/5 border-primary' : ''}`}>
              <Search className="w-5 h-5 text-text-light mr-4 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search appointments, reports..." 
                className="bg-transparent border-none outline-none text-sm font-bold text-dark-light placeholder:text-text-muted w-full"
              />
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {isSearchFocused && searchQuery.length > 1 && (
                <motion.div
                  variants={searchDropdown}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-3xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] overflow-hidden z-100"
                >
                  <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-hide">
                    {!hasSearchResults ? (
                      <div className="py-8 px-6 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Search className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-900 mb-1">No results found</p>
                        <p className="text-xs text-slate-500">We couldn&apos;t find anything matching &quot;{searchQuery}&quot;</p>
                      </div>
                    ) : (
                      <>
                        {filteredBookings.length > 0 && (
                          <div className="mb-4">
                            <h4 className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Appointments</h4>
                            <div className="space-y-1">
                              {filteredBookings.map(booking => (
                                <Link 
                                  key={booking.id}
                                  href={`/dashboard/bookings/${booking.id}`}
                                  className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all group"
                                  onClick={() => {
                                    setSearchQuery("");
                                    setIsSearchFocused(false);
                                  }}
                                >
                                  <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${booking.labColor} flex items-center justify-center text-white shrink-0 shadow-lg`}>
                                    <Calendar className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">{booking.tests.join(" + ")}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{booking.labName}</p>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {filteredReports.length > 0 && (
                          <div>
                            <h4 className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Health Reports</h4>
                            <div className="space-y-1">
                              {filteredReports.map(report => (
                                <Link 
                                  key={report.id}
                                  href={`/dashboard/reports/${report.id}`}
                                  className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all group"
                                  onClick={() => {
                                    setSearchQuery("");
                                    setIsSearchFocused(false);
                                  }}
                                >
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${report.status === 'Ready' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">{report.testName}</p>
                                    <div className="flex items-center gap-2">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{report.labName}</p>
                                      {report.abnormal && (
                                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                      )}
                                    </div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="bg-slate-50 p-3 flex items-center justify-between border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 italic">Pro-tip: Search by test name or lab</p>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                      <span className="text-[9px] font-black text-slate-400">ESC</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link href={appointmentLink} className="w-full sm:flex-1 bg-linear-to-r from-emerald-50 to-emerald-100/30 border border-emerald-200/60 rounded-[32px] sm:rounded-[40px] px-6 h-14 flex items-center justify-between shadow-sm overflow-hidden group hover:border-emerald-300 hover:shadow-emerald-100/50 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${nextBooking ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse' : 'bg-slate-400 opacity-50'}`} />
                  <span className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em] hidden sm:block">Next Appointment</span>
                  <span className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em] sm:hidden">Up Next</span>
                  <span className="w-1 h-1 bg-emerald-300 rounded-full" />
                  {isLoading ? (
                    <Skeleton className="h-4 w-32 bg-emerald-200/50" />
                  ) : (
                    <span className="text-[13px] font-black text-emerald-950 tracking-tight">{appointmentText}</span>
                  )}
              </div>
              <div className="flex items-center gap-2">
                {nextBooking?.type === "Lab Visit" && (
                   <span className="hidden sm:flex px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest items-center gap-1.5 border border-emerald-500/20">
                     <Navigation className="w-3 h-3" /> Track Map
                   </span>
                )}
                <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </div>
          </Link>
        </div>

        <div className="w-full xl:w-auto flex items-center justify-between sm:justify-end gap-3 shrink-0">
           <Link href="/search" className="flex-1 sm:flex-none">
             <button className="h-14 w-full px-6 sm:px-8 rounded-2xl bg-white text-dark-light border border-border font-black text-[10px] uppercase tracking-widest hover:border-primary/20 transition-all active:scale-95 shadow-sm">
                Lab Directory
             </button>
           </Link>
           <Link href="/dashboard/bookings" className="flex-1 sm:flex-none">
             <button className="h-14 w-full px-6 sm:px-8 rounded-2xl bg-dark text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-dark-light active:scale-95 shadow-2xl shadow-dark/20">
                View All
             </button>
           </Link>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-5">
        
        {/* Welcome Block */}
        <motion.div variants={item} className="md:col-span-6 lg:col-span-4 bg-white rounded-[40px] p-7 border border-border/80 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.05)] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/3 rounded-full -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-1000" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-text-muted">{greeting}</span>
            </div>
            <h2 className="text-3xl font-black text-dark-light leading-[1.1] tracking-tight">
              Welcome Back,<br/>{user.name.split(" ")[0]}
            </h2>
            <p className="text-sm text-text-secondary font-medium leading-relaxed italic">
              You&apos;re doing great! Your records are safe.
            </p>
          </div>
          <div className="mt-8 relative z-10 flex flex-col gap-3">
            <Link href="/search" onClick={() => haptics.medium()} className="w-full bg-dark text-white h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-dark-light transition-all shadow-2xl shadow-dark/20 group/btn active:scale-95">
              Book Test <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
            <Link href="/dashboard/notifications" onClick={() => haptics.light()} className="w-full h-14 rounded-2xl bg-surface border border-border flex items-center justify-center gap-3 relative hover:bg-white hover:border-primary/20 hover:shadow-2xl transition-all group/bell active:scale-95">
              <Bell className="w-5 h-5 text-text-secondary group-hover/bell:text-primary transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Notifications</span>
              {unreadCount > 0 && (
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </Link>
          </div>
        </motion.div>

        {/* Real-time Status */}
        <motion.div variants={item} className="md:col-span-6 lg:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Appointments", value: upcomingBookingsCount, icon: Calendar, color: "#3B82F6", href: "/dashboard/bookings", trend: "Perfect" },
            { label: "Reports Ready", value: readyReportsCount, icon: FileText, color: "#10B981", href: "/dashboard/reports", trend: "Check" },
            { label: "Wallet Balance", value: `₹${((user.wallet_balance || 0) / 100).toLocaleString()}`, icon: Wallet, color: "#F59E0B", href: "/dashboard/payments", trend: "Verified" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href} className="bg-white rounded-[32px] p-5 aspect-square border border-border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col justify-between overflow-hidden relative">
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-surface rounded-full translate-x-12 translate-y-12 opacity-50 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10 space-y-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg border border-transparent group-hover:rotate-12 transition-all bg-surface" style={{ color: stat.color }}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        {isLoading ? (
                          <div className="space-y-2">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        ) : (
                          <>
                            <p className="text-2xl font-black text-dark-light tracking-tighter leading-none mb-1">{stat.value}</p>
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">{stat.label}</p>
                          </>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between relative z-10 pt-3 border-t border-dashed border-border-dark/20 h-10 mt-auto">
                    {isLoading ? (
                      <Skeleton className="h-5 w-16" />
                    ) : (
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-surface border border-border rounded-lg text-text-muted group-hover:bg-dark group-hover:text-white transition-colors">{stat.trend}</span>
                    )}
                    <MiniGraph color={stat.color} />
                </div>
              </Link>
            )
          })}
        </motion.div>

        {/* Special Offer Block */}
        <motion.div variants={item} className="hidden md:flex md:col-span-6 lg:col-span-12 bg-linear-to-br from-primary/5 via-white to-primary/2 rounded-[56px] border border-primary/20 p-10 flex-col md:flex-row items-center gap-12 relative overflow-hidden group/featured">
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-primary via-accent to-primary animate-shimmer bg-size-[200%_100%]" />
          <div className="flex-1 space-y-6 text-center md:text-left relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white text-[9px] font-black rounded-full uppercase tracking-[0.2em] mb-4 shadow-lg shadow-primary/20">
                <ShieldCheck className="w-3.5 h-3.5" /> High Quality
              </div>
              <h3 className="text-3xl font-black text-dark-light tracking-tight leading-none mb-3">Body Checkup</h3>
              <p className="text-base text-text-secondary font-medium italic max-w-lg leading-relaxed">Get 85 important health tests in one simple package for total peace of mind.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <span className="text-4xl font-black text-dark-light tracking-tighter">₹1,299</span>
              <span className="text-lg text-text-muted line-through font-bold opacity-40">₹2,499</span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-xl border border-emerald-100 uppercase tracking-widest">48% OFF</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-6">
              <Link href="/search" onClick={() => haptics.medium()} className="h-14 px-10 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-center">Book Now</Link>
              <Link href="/search?q=Body%20Checkup" onClick={() => haptics.light()} className="text-primary font-black text-xs flex items-center gap-2 group/link border-b border-transparent hover:border-primary transition-all pb-1 uppercase tracking-widest">
                See Tests <Navigation className="w-4 h-4 group-hover/link:rotate-45 transition-transform" />
              </Link>
            </div>
          </div>
          <div className="w-56 h-56 bg-white rounded-[40px] shadow-[0_40px_80px_-15px_rgba(0,168,107,0.15)] flex items-center justify-center relative shrink-0 overflow-hidden group-hover/featured:rotate-3 transition-transform duration-1000">
             <div className="absolute inset-2 border-2 border-dashed border-primary/20 rounded-[32px] animate-[spin_20s_linear_infinite]" />
             <div className="absolute inset-8 bg-primary/5 rounded-full blur-2xl" />
             <FlaskConical className="w-24 h-24 text-primary relative z-10 filter drop-shadow-2xl" />
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item} className="md:col-span-6 lg:col-span-8 bg-white rounded-[56px] border border-border/80 shadow-sm overflow-hidden flex flex-col group/stream">
          <div className="p-10 border-b border-border-dark/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-surface/30">
            <div>
              <h2 className="text-2xl font-black text-dark-light tracking-tight">Recent</h2>
              <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1 italic">Your recent tests and updates.</p>
            </div>
            <Link href="/dashboard/bookings" className="h-12 px-6 rounded-2xl bg-white border border-border text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary hover:border-primary/20 transition-all flex items-center justify-center shadow-sm">See All</Link>
          </div>
          <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-6 p-6 rounded-[32px]">
                  <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="w-12 h-12 rounded-xl" />
                </div>
              ))
            ) : realBookings.length > 0 ? (
              realBookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="flex flex-row items-center gap-3 sm:gap-6 p-4 sm:p-6 hover:bg-surface rounded-[24px] sm:rounded-[32px] transition-all group/item relative overflow-hidden">
                   
                   <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-[14px] sm:rounded-2xl bg-linear-to-br from-primary to-primary/80 text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-xl shrink-0 group-hover/item:scale-110 transition-transform`}>
                     {booking.lab?.name?.slice(0, 2).toUpperCase() || "LB"}
                   </div>
                   
                   <div className="flex-1 min-w-0 pr-2">
                      <p className="font-black text-dark-light text-sm sm:text-base tracking-tight leading-snug group-hover/item:text-primary transition-colors line-clamp-2">
                        {booking.items?.map((i: any) => i.name).join(" + ") || "Diagnostic Test"}
                      </p>
                      <p className="text-[9px] sm:text-[11px] text-text-muted font-black uppercase tracking-widest mt-1 leading-relaxed drop-shadow-xs line-clamp-1 sm:line-clamp-2">{booking.lab?.name || "Premium Lab"}</p>
                   </div>
  
                   <div className="hidden md:block text-right px-6 border-l border-border-dark/50 shrink-0">
                      <p className="text-sm font-black text-dark-light tracking-tight">₹{booking.total_amount / 100}</p>
                      <p className="text-[10px] text-text-muted font-medium italic">Amount Paid</p>
                   </div>
                   
                   <div className="shrink-0 flex items-center gap-2 sm:gap-4">
                      <span className={`hidden sm:inline-flex px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest border ${getStatusColor(booking.status)}`}>
                         {booking.status}
                      </span>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {booking.type === "lab_visit" && ["pending", "confirmed", "in-progress", "upcoming"].includes(booking.status.toLowerCase()) && (
                          <button 
                            onClick={() => {
                              haptics.light();
                              if (booking.lab) {
                                  setSelectedMapLab({
                                      id: booking.lab.id,
                                      name: booking.lab.name,
                                      initials: booking.lab.name.substring(0, 2).toUpperCase(),
                                      color: "from-blue-600 to-indigo-700",
                                      rating: 4.5,
                                      reviewCount: 100,
                                      address: booking.lab.address || "",
                                      city: booking.lab.city || "",
                                      operatingHours: "08:00 AM - 08:00 PM",
                                      verified: true,
                                      tests: []
                                  } as Lab);
                              }
                            }}
                            className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/5 text-primary border border-primary/10 rounded-lg sm:rounded-xl hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-xs shrink-0 group/map"
                          >
                             <MapPin className="w-3.5 h-3.5 sm:w-5 sm:h-5 group-hover/map:scale-110 transition-transform" />
                          </button>
                        )}
                        {booking.type === "lab_visit" && ["pending", "confirmed", "in-progress", "upcoming"].includes(booking.status.toLowerCase()) && (
                          <Link 
                            href={`/dashboard/bookings/${booking.id}`}
                            className="w-8 h-8 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg sm:rounded-xl hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center shadow-xs shrink-0 group/nav"
                          >
                            <Navigation className="w-3.5 h-3.5 sm:w-5 sm:h-5 group-hover/nav:-translate-y-0.5 group-hover/nav:translate-x-0.5 transition-transform" />
                          </Link>
                        )}
                        <Link href={`/dashboard/bookings/${booking.id}`} className="w-8 h-8 sm:w-12 sm:h-12 bg-white border border-border rounded-lg sm:rounded-xl text-text-light hover:text-primary hover:border-primary/20 transition-all flex items-center justify-center shadow-xs shrink-0">
                           <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 group-hover/item:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                   </div>
                   
                </div>
              ))
            ) : (
                <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                    <Calendar className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Activity Yet</p>
                </div>
            )}
          </div>
          <div className="p-5 bg-surface/50 border-t border-border-dark/30 mt-auto">
             <Link href="/search" className="flex items-center justify-center gap-3 w-full h-16 rounded-[24px] bg-white border border-border shadow-sm text-dark-light font-black text-[11px] uppercase tracking-widest hover:border-primary hover:text-primary transition-all group/center">
                Search Labs Nearby <MapPin className="w-5 h-5 text-primary group-hover/center:bounce" />
             </Link>
          </div>
        </motion.div>

        {/* Reports Sidebar */}
        <motion.div variants={item} className="md:col-span-6 lg:col-span-4 space-y-8">
          
          <div className="bg-white rounded-[48px] border border-border/80 shadow-sm p-8 space-y-8 overflow-hidden relative group">
            <div className="flex items-center justify-between">
               <h3 className="font-black text-dark-light text-sm uppercase tracking-widest">My Reports</h3>
               <Link href="/dashboard/reports" className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1 group/all">
                  See All <ArrowUpRight className="w-3 h-3 group-hover/all:translate-x-0.5" />
               </Link>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 rounded-[32px]">
                    <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-2">
                       <Skeleton className="h-4 w-3/4" />
                       <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              ) : realReports.length > 0 ? (
                realReports.slice(0, 2).map(r => (
                  <div key={r.id} className="p-4 sm:p-5 bg-surface border border-transparent hover:border-primary/20 hover:bg-white rounded-[24px] sm:rounded-[32px] transition-all duration-500 flex items-center gap-3 sm:gap-4 cursor-pointer group/card">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover/card:scale-110 transition-transform ${r.status === 'Ready' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {r.status === 'Ready' ? <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" /> : <Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                       <p className="text-xs sm:text-sm font-black text-dark-light tracking-tight leading-snug group-hover/card:text-primary transition-colors line-clamp-2">{r.test_name || r.testName}</p>
                       <p className="text-[9px] sm:text-[10px] text-text-muted font-black uppercase tracking-widest mt-1 leading-relaxed line-clamp-1 sm:line-clamp-2">{r.lab?.name || r.labName || "Diagnostic Lab"}</p>
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white border border-border flex items-center justify-center text-text-light opacity-100 sm:opacity-0 group-hover/card:opacity-100 transition-all shrink-0">
                       <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                    <FileText className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Reports Yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Premium Membership Widget */}
          <div className="bg-linear-to-br from-dark to-slate-900 rounded-[56px] p-8 text-white relative overflow-hidden shadow-2xl shadow-dark/40 group/premium border border-white/5">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover/premium:scale-125 transition-transform duration-1000" />
             <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-primary/5 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
             
             <div className="relative z-10">
                 <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl text-primary">
                        <Crown className="w-7 h-7" />
                    </div>
                    <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/20">PREMIUM</div>
                 </div>
                 
                 <h4 className="font-black text-2xl mb-2 tracking-tight">MeddyNet <span className="text-primary italic">Plus</span></h4>
                 <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-6 shadow-sm">Unlock Family Benefits</p>
                 
                 <div className="space-y-4 mb-8">
                    {[
                        { text: "Flat 10% OFF on all tests", active: true },
                        { text: "Priority Home Collection", active: true },
                        { text: "Free Report Consultation", active: true },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3" />
                            </div>
                            <span className="text-xs font-bold text-white/70 italic tracking-tight">{item.text}</span>
                        </div>
                    ))}
                 </div>
                 
                 <Link 
                    href="/dashboard/payments"
                    onClick={() => haptics.medium()} 
                    className="w-full h-14 bg-primary text-white font-black text-[10px] rounded-2xl hover:bg-white hover:text-dark transition-all uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-95 flex items-center justify-center text-center"
                  >
                    Upgrade Now
                  </Link>
             </div>
          </div>

        </motion.div>

      </motion.div>

      {selectedMapLab && (
        <MapModal 
          isOpen={!!selectedMapLab} 
          onClose={() => setSelectedMapLab(null)} 
          lab={selectedMapLab} 
        />
      )}
    </div>
  );
}
