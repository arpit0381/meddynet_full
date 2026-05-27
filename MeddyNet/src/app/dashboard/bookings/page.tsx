"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  MapPin,
  X,
  Plus,
  ArrowUpRight,
  Zap,
  ArrowRight,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { useBookings, type ApiBooking } from "@/lib/hooks";
import { haptics } from "@/lib/haptics";
import { Skeleton } from "@/components/ui/Skeleton";

// Map backend status to display status
const mapStatus = (status: string) => {
  switch (status) {
    case "pending": return "Upcoming";
    case "confirmed": return "Upcoming";
    case "assigned": return "In-Progress";
    case "on_the_way": return "In-Progress";
    case "arrived": return "In-Progress";
    case "sample_collected": return "In-Progress";
    case "report_ready": return "Completed";
    case "completed": return "Completed";
    case "cancelled": return "Cancelled";
    default: return status;
  }
};

const getLabColor = (name: string) => {
  const colors = [
    "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600",
    "from-purple-500 to-purple-600",
    "from-rose-500 to-rose-600",
    "from-amber-500 to-amber-600",
    "from-teal-500 to-teal-600",
    "from-indigo-500 to-indigo-600",
  ];
  return colors[(name?.length || 0) % colors.length];
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case "Upcoming": return { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-100" };
    case "Completed": return { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-100" };
    case "Cancelled": return { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-100" };
    case "In-Progress": return { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-100" };
    default: return { bg: "bg-slate-400", text: "text-slate-500", light: "bg-slate-50", border: "border-slate-100" };
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Upcoming": return <Clock className="w-4 h-4" />;
    case "Completed": return <CheckCircle className="w-4 h-4" />;
    case "Cancelled": return <XCircle className="w-4 h-4" />;
    case "In-Progress": return <Activity className="w-4 h-4 animate-pulse" />;
    default: return null;
  }
};

const statusFilters = ["All", "Upcoming", "Completed", "Cancelled", "In-Progress"];

export default function MyBookingsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const { data: bookings = [], isLoading } = useBookings();

  const mapped = bookings.map(b => ({
    ...b,
    displayStatus: mapStatus(b.status),
    labName: b.lab?.name || "Lab",
    labInitials: (b.lab?.name || "LB").slice(0, 2).toUpperCase(),
    labColor: getLabColor(b.lab?.name || ""),
    tests: b.items?.map(i => i.name) || ["Diagnostic Test"],
    date: b.scheduled_at || b.created_at || "",
    time: b.scheduled_at ? new Date(b.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
    totalAmount: b.total_amount / 100, // paise to rupees
    payment_status: b.payment_status || "pending",
  }));

  const filtered = mapped.filter(b => {
    const matchesSearch =
      b.labName.toLowerCase().includes(search.toLowerCase()) ||
      b.tests.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
      b.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "All" || b.displayStatus === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const counts: Record<string, number> = {
    All: mapped.length,
    Upcoming: mapped.filter(b => b.displayStatus === "Upcoming").length,
    Completed: mapped.filter(b => b.displayStatus === "Completed").length,
    Cancelled: mapped.filter(b => b.displayStatus === "Cancelled").length,
    "In-Progress": mapped.filter(b => b.displayStatus === "In-Progress").length,
  };

  if (isLoading) {
    return (
      <div className="max-w-[1240px] mx-auto space-y-10">
        <div className="flex justify-between items-end gap-10">
           <div className="space-y-4">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-10 w-64 rounded-xl" />
              <Skeleton className="h-4 w-48 rounded-full" />
           </div>
           <Skeleton className="h-14 w-48 rounded-[28px]" />
        </div>
        <Skeleton className="h-16 w-full rounded-[32px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-[40px]" />
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1240px] mx-auto space-y-10 pb-20">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-4 sm:px-0">
        <div className="space-y-3 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Fast Booking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-dark-light tracking-tight">My Bookings</h1>
          <p className="text-sm text-text-secondary font-medium max-w-sm mx-auto lg:mx-0 italic">Check your past and upcoming health test appointments easily.</p>
        </div>

        <Link
          href="/search"
          onClick={() => haptics.medium()}
          className="w-full lg:w-auto flex items-center justify-center gap-4 px-10 py-5 min-h-[52px] bg-dark text-white rounded-[28px] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-dark/20 hover:scale-105 active:scale-95 transition-all group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Book New Test
        </Link>
      </div>

      {/* Filter Center */}
      <div className="bg-white p-3 rounded-[32px] border border-border flex flex-col xl:flex-row items-center gap-4 shadow-sm">
        <div className="flex items-center gap-1 bg-surface p-1 rounded-2xl w-full xl:w-auto overflow-x-auto no-scrollbar">
          {statusFilters.map((f) => (
            <button
              key={f}
              onClick={() => { haptics.selection(); setActiveFilter(f); }}
              className={`shrink-0 flex items-center gap-2.5 px-6 py-2.5 min-h-[40px] rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeFilter === f
                  ? "bg-white text-dark-light shadow-sm ring-1 ring-border"
                  : "text-text-muted hover:text-dark-light"
              }`}
            >
              {f}
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${activeFilter === f ? "bg-dark-light text-white" : "bg-slate-200 text-text-muted"}`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
        
        <div className="relative flex-1 group w-full">
          <Search className="w-4.5 h-4.5 text-text-light absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-all" />
          <input
            type="text"
            placeholder="Search by ID, Patient, or Lab..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface/50 border-none rounded-3xl pl-12 pr-10 py-3.5 text-base font-bold placeholder:text-text-light outline-none transition-all focus:ring-4 focus:ring-primary/10"
          />
          {search && (
            <button onClick={() => { haptics.light(); setSearch(""); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-border transition-colors text-text-light hover:text-error">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Bookings Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filtered.map((booking, i) => {
            const styles = getStatusStyles(booking.displayStatus);
            return (
              <motion.div
                key={booking.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-white border border-border rounded-[44px] p-6 sm:p-8 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 group transition-all duration-500 relative flex flex-col"
              >
                {/* Header Row */}
                <div className="flex flex-col xs:flex-row items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4 self-start">
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[24px] sm:rounded-[28px] bg-linear-to-br ${booking.labColor} text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-xl shadow-dark/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shrink-0`}>
                            {booking.labInitials}
                        </div>
                        <div>
                            <p className="text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{booking.id.slice(0, 8)}...</p>
                            <h3 className="text-base sm:text-lg font-black text-dark-light tracking-tight group-hover:text-primary transition-colors leading-tight">{booking.labName}</h3>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`sm:absolute sm:top-8 sm:right-8 px-4 py-1.5 rounded-2xl flex items-center self-end sm:self-auto gap-2 border-[1.5px] font-black text-[9px] sm:text-[10px] uppercase tracking-widest whitespace-nowrap ${styles.text} ${styles.light} ${styles.border}`}>
                        {getStatusIcon(booking.displayStatus)}
                        {booking.displayStatus}
                    </div>
                </div>

                <div className="flex-1 space-y-6">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Tests Included</span>
                        <div className="flex flex-wrap gap-2">
                            {booking.tests.map(test => (
                                <span key={test} className="px-3 py-1 bg-surface border border-border-dark rounded-xl text-[11px] font-bold text-dark-light group-hover:border-primary/20 transition-all">
                                    {test}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Date</span>
                            <div className="flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-primary" />
                                <span className="text-xs font-black text-dark-light">
                                    {booking.date ? new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : "TBD"}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Time</span>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-black text-dark-light">{booking.time || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t border-dashed border-border flex items-center justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                           <span className="text-[11px] font-bold text-text-secondary line-through opacity-40">₹{booking.totalAmount + 400}</span>
                           <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${booking.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600 animate-pulse'}`}>
                              {booking.payment_status === 'paid' ? 'Paid' : 'Pending'}
                           </span>
                        </div>
                        <span className="text-2xl font-black text-dark-light tracking-tight">₹{booking.totalAmount}</span>
                    </div>
                    <Link 
                        href={`/dashboard/bookings/${booking.id}`} 
                        onClick={() => haptics.medium()}
                        className="h-14 px-8 bg-dark-light text-white rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-dark shadow-xl shadow-dark/10 transition-all flex items-center gap-2 group/btn active:scale-95"
                    >
                        See Details <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-24 text-center space-y-4">
            <div className="w-24 h-24 bg-surface rounded-[40px] flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-border group">
                <ClipboardList className="w-10 h-10 text-text-light group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-black text-dark-light">
              {bookings.length === 0 ? "No Bookings Yet" : "Booking Not Found"}
            </h3>
            <p className="text-text-secondary font-medium max-w-xs mx-auto mb-8">
              {bookings.length === 0 ? "Book your first health test to get started!" : "Try searching for something else or change your filters."}
            </p>
            <button 
                onClick={() => { haptics.medium(); setSearch(""); setActiveFilter("All"); }}
                className="px-8 py-4 min-h-[48px] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-3xl shadow-[0_20px_50px_rgba(0,168,107,0.3)] hover:scale-105 transition-all active:scale-95"
            >
                {bookings.length === 0 ? "Book Now" : "View All Bookings"}
            </button>
          </motion.div>
        )}
      </div>

      {/* Lab Network Highlight */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="bg-white border border-border rounded-[48px] p-12 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden group shadow-sm"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32" />
        <div className="w-24 h-24 bg-primary/10 rounded-[40px] flex items-center justify-center shrink-0 border border-primary/20 rotate-3 group-hover:rotate-6 transition-transform">
           <MapPin className="w-10 h-10 text-primary" />
        </div>
        <div className="flex-1 space-y-4 text-center lg:text-left relative z-10">
            <h3 className="text-3xl font-black text-dark-light tracking-tight">Choose from 500+ Labs</h3>
            <p className="text-lg text-text-secondary font-medium italic">We work with the best labs across India to give you accurate and fast health test results.</p>
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-4">
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-primary">10M+</span>
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Tests Done</span>
                </div>
                <div className="w-px h-10 bg-border hidden sm:block" />
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-accent">99.9%</span>
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Accuracy</span>
                </div>
            </div>
        </div>
        <Link href="/search" className="shrink-0 flex flex-col items-center gap-3 group/labs active:scale-95 transition-all relative z-20 cursor-pointer">
            <div className="w-16 h-16 rounded-[24px] bg-dark text-white flex items-center justify-center shadow-2xl shadow-dark/20 group-hover/labs:scale-110 group-hover/labs:rotate-6 transition-all ring-4 ring-transparent group-hover/labs:ring-primary/10">
                <ArrowUpRight className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted group-hover/labs:text-primary transition-colors">See Labs</span>
        </Link>
      </motion.div>
    </div>
  );
}
