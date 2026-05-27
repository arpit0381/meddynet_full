"use client";

import { motion } from "framer-motion";
import {
    MessageCircle,
    Search,
    ChevronRight,
    ArrowLeft,
    Zap,
    ShieldCheck,
    Sparkles,
    Calendar,
    Filter
} from "lucide-react";
import Link from "next/link";
import { recentBookings } from "@/data/dashboard";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ChatHubPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const activeChats = recentBookings.filter(b => 
        b.status !== "Cancelled" && 
        (b.labName.toLowerCase().includes(searchQuery.toLowerCase()) || 
         b.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="max-w-[1000px] mx-auto space-y-6 md:space-y-10 pb-20 md:pb-24 px-4 sm:px-0">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
                <div className="flex items-center gap-4 md:gap-6">
                    <button 
                        onClick={() => router.back()}
                        className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white border border-border rounded-xl md:rounded-2xl text-text-muted hover:text-primary transition-all shadow-sm active:scale-95 shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-primary underline underline-offset-4 decoration-2 decoration-primary/30">Secure Console</span>
                            <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5 text-primary" />
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black text-dark-light tracking-tight">Messaging Hub</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                    <div className="relative group flex-1 md:flex-none">
                        <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-3.5 md:w-4 h-3.5 md:h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                        <input 
                            type="text" 
                            placeholder="Search channels..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-border rounded-full pl-10 md:pl-14 pr-6 md:pr-8 py-3 md:py-4 text-xs md:text-sm font-bold text-dark-light outline-none ring-4 ring-transparent focus:ring-primary/5 focus:border-primary transition-all shadow-sm w-full md:w-64"
                        />
                    </div>
                    <button className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center bg-white border border-border rounded-xl md:rounded-2xl text-text-muted hover:text-primary transition-all shadow-sm active:scale-95 shrink-0">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Global Support Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-linear-to-br from-dark to-slate-900 rounded-[32px] md:rounded-[48px] p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 relative overflow-hidden group shadow-2xl shadow-dark/20"
            >
                <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-primary/10 blur-[80px] md:blur-[100px] rounded-full -mr-24 md:-mr-32 -mt-24 md:-mt-32" />
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl flex items-center justify-center shrink-0 relative z-10">
                    <Zap className="w-8 md:w-10 h-8 md:h-10 text-primary animate-pulse" />
                </div>
                <div className="flex-1 space-y-2 md:space-y-3 text-center md:text-left relative z-10">
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">MeddyNet LifeLine</h3>
                    <p className="text-[11px] md:text-sm font-medium text-white/50 max-w-md italic">24/7 Priority support for emergencies, booking modifications, or general medical queries.</p>
                </div>
                <Link href="/chat" className="h-14 md:h-16 px-8 md:px-10 bg-white text-dark rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-widest flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95 shrink-0 relative z-10 w-full md:w-auto">
                    Chat with Expert
                </Link>
            </motion.div>

            {/* Active Lab Chats Section */}
            <div className="space-y-6 md:space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3">
                        <MessageCircle className="w-4 md:w-5 h-4 md:h-5 text-dark-light" />
                        <h2 className="text-sm md:text-xl font-black text-dark-light tracking-tight uppercase tracking-wider">Lab Channels</h2>
                    </div>
                    <span className="text-[8px] md:text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-3 md:px-4 py-1 md:py-1.5 bg-surface border border-border rounded-full">{activeChats.length} Active Records</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {activeChats.length > 0 ? activeChats.map((booking, i) => (
                        <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link href={`/dashboard/chat/${booking.id}`} className="block h-full group">
                                <div className="p-6 md:p-8 bg-white border border-border rounded-[32px] md:rounded-[40px] hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 h-full flex flex-col justify-between group-hover:-translate-y-1 relative overflow-hidden">
                                     <div className="absolute bottom-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-surface rounded-full translate-x-12 md:translate-x-16 translate-y-12 md:translate-y-16 opacity-30 group-hover:bg-primary/5 group-hover:scale-150 transition-all duration-1000" />
                                     
                                     <div className="relative z-10">
                                         <div className="flex items-start justify-between mb-6 md:mb-8">
                                             <div className="flex items-center gap-4 md:gap-5">
                                                 <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[24px] bg-linear-to-br ${booking.labColor} text-white flex items-center justify-center font-black text-lg md:text-xl shadow-xl shadow-dark/5 group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0`}>
                                                     {booking.labInitials}
                                                 </div>
                                                 <div className="min-w-0">
                                                     <p className="text-[8px] md:text-[10px] font-black text-text-muted uppercase tracking-[0.2em] md:tracking-[0.3em] mb-1 md:mb-1.5">{booking.id}</p>
                                                     <h3 className="text-lg md:text-xl font-black text-dark-light tracking-tight leading-tight truncate max-w-[140px] md:max-w-[180px]">{booking.labName}</h3>
                                                 </div>
                                             </div>
                                             <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-lg shadow-xs shrink-0">
                                                 <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                 <span className="text-[8px] md:text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
                                             </div>
                                         </div>

                                         <div className="space-y-3 md:space-y-4 mb-6 md:mb-10">
                                             <div className="flex items-center gap-2 md:gap-3">
                                                 <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-surface flex items-center justify-center text-text-muted shrink-0">
                                                     <Calendar className="w-3.5 md:w-4 h-3.5 md:h-4" />
                                                 </div>
                                                 <span className="text-[11px] md:text-xs font-bold text-dark-light italic opacity-70">Appt: {booking.date}</span>
                                             </div>
                                             <div className="flex items-center gap-2 md:gap-3">
                                                 <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-surface flex items-center justify-center text-text-muted shrink-0">
                                                     <ShieldCheck className="w-3.5 md:w-4 h-3.5 md:h-4" />
                                                 </div>
                                                 <span className="text-[11px] md:text-xs font-bold text-dark-light italic opacity-70 truncate">Tests: {booking.tests[0]}...</span>
                                             </div>
                                         </div>
                                     </div>

                                     <div className="relative z-10 flex items-center justify-between border-t border-dashed border-border-dark pt-4 md:pt-6 mt-auto">
                                         <div className="flex items-center gap-2">
                                             <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-dark text-white flex items-center justify-center text-[8px] md:text-[10px] font-black border-2 border-white shadow-lg overflow-hidden shrink-0">
                                                 {booking.technician ? booking.technician[0] : "L"}
                                             </div>
                                             <p className="text-[8px] md:text-[10px] font-black text-text-muted uppercase tracking-widest truncate max-w-[80px] md:max-w-none">Replied 10m ago</p>
                                         </div>
                                         <div className="flex items-center gap-1.5 md:gap-2 text-primary font-black text-[9px] md:text-[10px] uppercase tracking-widest group-hover:gap-3 md:group-hover:gap-4 transition-all pb-0.5">
                                             Open Channel <ChevronRight className="w-3.5 md:w-4 h-3.5 md:h-4" />
                                         </div>
                                     </div>
                                </div>
                            </Link>
                        </motion.div>
                    )) : (
                        <div className="col-span-1 md:col-span-2 py-20 md:py-24 text-center bg-surface/50 border border-dashed border-border rounded-[32px] md:rounded-[48px] px-6">
                            <p className="text-text-muted font-bold italic text-sm md:text-base">No secure channels found for your query.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Assistance Card */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 p-6 md:p-10 bg-white border border-border rounded-[32px] md:rounded-[48px] shadow-sm group">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-surface rounded-2xl md:rounded-3xl flex items-center justify-center text-blue-600 group-hover:rotate-12 transition-transform shadow-inner shrink-0">
                        <MessageCircle className="w-6 md:w-7 h-6 md:h-7" />
                    </div>
                    <div>
                        <h4 className="text-lg md:text-xl font-black text-dark-light tracking-tight">Need Support?</h4>
                        <p className="text-[10px] md:text-[11px] font-bold text-text-muted uppercase tracking-widest mt-1">Chat and resolve queries instantly.</p>
                    </div>
                </div>
                <Link href="/chat" className="h-12 md:h-14 px-8 bg-surface border border-border text-dark-light rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-primary/20 hover:text-primary hover:bg-white transition-all shadow-xs active:scale-95 w-full md:w-auto flex items-center justify-center">
                    Start Chat
                </Link>
            </div>
        </div>
    );
}
