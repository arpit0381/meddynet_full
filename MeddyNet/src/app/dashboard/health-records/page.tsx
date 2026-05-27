"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  FileText,
  FlaskConical,
  Pill,
  Scan,
  Download,
  Tag,
  User,
  Activity,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  LucideIcon
} from "lucide-react";
import Link from "next/link";
import { healthRecords as initialRecords } from "@/data/dashboard";
import { useProfile } from "@/lib/hooks";
import { useEffect } from "react";
import apiClient from "@/lib/api";

const typeConfig: Record<string, { icon: LucideIcon; color: string; bg: string; border: string; label: string }> = {
  test: { icon: FlaskConical, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", label: "Lab Test" },
  prescription: { icon: Pill, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", label: "Prescription" },
  report: { icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", label: "Medical Report" },
  scan: { icon: Scan, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", label: "Scan / X-Ray" },
};

const statusColors: Record<string, string> = {
  Normal: "text-emerald-600 bg-emerald-50 border-emerald-100",
  Abnormal: "text-rose-600 bg-rose-50 border-rose-100",
};

export default function HealthRecordsPage() {
  const [filter, setFilter] = useState<string>("All");
  const [records, setRecords] = useState<any[]>([]);
  const filters = ["All", "Test", "Prescription", "Report", "Scan"];
  
  const { data: profile } = useProfile();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data } = await apiClient.get("/health-records");
        if (data && Array.isArray(data)) {
           const mapped = data.map((r: any) => ({
             id: r.id,
             type: r.record_type,
             title: r.title,
             date: r.created_at,
             details: r.doctor_name ? `From ${r.doctor_name}` : "Medical document",
             doctor: r.doctor_name,
             labName: r.hospital_name,
             status: "Ready",
             fileAvailable: true,
             fileUrl: r.file_url,
             tags: r.metadata?.tags || []
           }));
           setRecords(mapped);
        } else {
           setRecords(initialRecords);
        }
      } catch (err) {
        console.error("Failed to fetch records:", err);
        setRecords(initialRecords);
      }
    };
    fetchRecords();
  }, []);

  const filtered = records.filter((r) => filter === "All" || r.type === filter.toLowerCase());
  const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Health metrics
  const metrics = [
    { label: "Status", value: "Active", icon: Activity, color: "bg-emerald-50 text-emerald-600" },
    { label: "Blood", value: profile?.blood_group || "N/A", icon: Heart, color: "bg-rose-50 text-rose-600" },
    { label: "Age", value: profile?.age || "N/A", icon: User, color: "bg-blue-50 text-blue-600" },
    { label: "Total", value: records.length, icon: ShieldCheck, color: "bg-dark text-white" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-12 pb-24">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(0,168,107,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">History</span>
            </div>
            <h1 className="text-4xl font-black text-dark-light tracking-tight">My History</h1>
            <p className="text-text-secondary font-medium max-w-sm italic">A simple, day-by-day record of your health tests and doctor visits.</p>
        </div>

        <div className="flex items-center gap-4">
            <Link href="/dashboard/prescriptions" className="h-16 px-10 bg-dark text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-dark/20 hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95 group">
                <FlaskConical className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Add Record
            </Link>
        </div>
      </div>

      {/* Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div key={m.label} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-[24px] border border-border p-4 shadow-sm hover:shadow-2xl transition-all group flex items-center gap-5 overflow-hidden relative active:scale-95 cursor-pointer`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${m.color} shadow-inner shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
              </div>
              <div className="relative z-10 pt-1">
                <p className="text-2xl font-black text-dark-light tracking-tighter leading-none mb-1">{m.value}</p>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest shrink-0">{m.label}</p>
              </div>
              <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="w-4 h-4 text-text-light" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col xl:flex-row gap-12">
        
        {/* Filters Sidebar */}
        <div className="w-full xl:w-72 shrink-0 space-y-8">
            <div className="bg-white border border-border rounded-[40px] p-4 shadow-sm flex flex-col gap-2">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-4 py-2">Filter</p>
                {filters.map((f) => (
                    <button 
                        key={f} 
                        onClick={() => setFilter(f)} 
                        className={`flex items-center justify-between px-6 py-4 rounded-[24px] text-sm font-black transition-all group ${
                            filter === f 
                            ? "bg-dark text-white shadow-2xl shadow-dark/20 scale-[1.02]" 
                            : "text-text-muted hover:bg-surface hover:text-dark-light"
                        }`}
                    >
                        <span className="tracking-tight">{f}</span>
                        {filter === f ? <div className="w-1.5 h-1.5 rounded-full bg-primary" /> : <ChevronRight className="w-4 h-4 opacity-30" />}
                    </button>
                ))}
            </div>

            {/* AI Insight Card */}
            <div className="bg-linear-to-br from-indigo-600 to-blue-800 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full -mr-16 -mt-16" />
                <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center border border-white/20">
                        <Zap className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black tracking-tight leading-tight">AI Analysis</h4>
                    <p className="text-white/70 text-sm font-medium italic">Our AI reads your reports to find any health risks early.</p>
                </div>
            </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between px-4">
                <h3 className="text-2xl font-black text-dark-light tracking-tight">Timeline</h3>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-surface border border-border-dark rounded-full">
                    <Clock className="w-3.5 h-3.5 text-text-light" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Updating Live</span>
                </div>
            </div>

            <div className="relative">
                <div className="absolute left-10 top-0 bottom-0 w-px bg-border-dark/50 hidden md:block" />

                <div className="space-y-8">
                    {sorted.map((record, i) => {
                        const config = typeConfig[record.type as keyof typeof typeConfig] || typeConfig.test;
                        const RecordIcon = config.icon;

                        return (
                        <motion.div
                            key={record.id}
                            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
                            className="relative lg:pl-24"
                        >
                            {/* Visual Marker - Desktop Only */}
                            <div className="absolute left-6 top-6 w-14 h-14 rounded-2xl bg-white border-4 border-surface shadow-2xl items-center justify-center z-10 hidden lg:flex">
                                <div className={`w-full h-full rounded-xl flex items-center justify-center ${config.bg} ${config.color}`}>
                                    <RecordIcon className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="bg-white rounded-[40px] border border-border p-6 sm:p-10 hover:border-primary/20 hover:shadow-2xl hover:shadow-dark/5 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
                                {/* Mobile Icon */}
                                <div className={`lg:hidden w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${config.bg} ${config.color} mb-2`}>
                                    <RecordIcon className="w-5 h-5" />
                                </div>
                                <div className="space-y-4 relative z-10 flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${config.color}`}>{config.label}</p>
                                        <div className="w-1 h-1 rounded-full bg-border-dark" />
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{new Date(record.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-dark-light tracking-tight group-hover:text-primary transition-colors">{record.title}</h3>
                                        <p className="text-sm text-text-secondary font-medium italic mt-1">{record.details}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 pt-2">
                                        {(record.doctor || record.labName) && (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-surface border border-border-dark rounded-xl text-[10px] font-black uppercase text-text-muted">
                                                <User className="w-3.5 h-3.5" /> {record.doctor || record.labName}
                                            </div>
                                        )}
                                        {record.status && (
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase border ${statusColors[record.status] || "text-text-muted bg-border border-border"}`}>
                                                <Activity className="w-3.5 h-3.5" /> {record.status}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 relative z-10">
                                    {record.fileAvailable && (
                                        <a href={record.fileUrl} target="_blank" rel="noopener noreferrer" className="h-14 w-14 bg-white border-2 border-border/50 text-dark-light rounded-2xl flex items-center justify-center hover:bg-surface transition-all active:scale-90 group/dl shadow-sm">
                                            <Download className="w-6 h-6 group-hover/dl:scale-110 transition-transform" />
                                        </a>
                                    )}
                                    <Link href="/dashboard/reports">
                                        <button className="h-14 px-8 bg-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-dark-light transition-all flex items-center justify-center gap-2 group/go active:scale-95 shadow-xl shadow-dark/10">
                                            Open <ArrowRight className="w-4 h-4 group-hover/go:translate-x-1 transition-transform" />
                                        </button>
                                    </Link>
                                </div>

                                {/* Abstract Design Element */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary/5 to-transparent rotate-45 translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700" />
                            </div>

                            {/* Tags layer */}
                            {record.tags && record.tags.length > 0 && (
                                <div className="md:pl-8 flex items-center gap-2 flex-wrap mt-4 opacity-60 hover:opacity-100 transition-opacity">
                                    <Tag className="w-3.5 h-3.5 text-text-light" />
                                    {record.tags.map((tag: string) => (
                                        <span key={tag} className="text-[9px] font-black text-text-muted uppercase tracking-widest h-6 flex items-center px-3 bg-surface rounded-full border border-border-dark">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                        );
                    })}
                </div>

                {sorted.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center bg-white border-2 border-dashed border-border rounded-[48px] m-4">
                    <div className="w-24 h-24 bg-surface rounded-[40px] flex items-center justify-center mx-auto mb-6 group">
                        <Heart className="w-12 h-12 text-border-dark group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-2xl font-black text-dark-light tracking-tight">No Records Found</h3>
                    <p className="text-text-secondary font-medium max-w-xs mx-auto italic mt-2">Try changing your filters or searching for something else.</p>
                </motion.div>
                )}
            </div>
        </div>
      </div>

      {/* Trust Banner */}
      <div className="bg-surface border border-border-dark rounded-[48px] p-12 flex flex-col md:flex-row items-center gap-10 text-center md:text-left group">
          <div className="w-20 h-20 bg-white rounded-[30px] border border-border-dark flex items-center justify-center text-primary shadow-sm shrink-0 group-hover:rotate-12 transition-transform duration-500">
             <ShieldCheck className="w-10 h-10" />
          </div>
          <div className="space-y-2 flex-1">
             <h4 className="text-2xl font-black text-dark-light tracking-tight">Safe Files</h4>
             <p className="text-text-secondary font-medium max-w-2xl italic leading-relaxed">Your records are kept in a safe place. Every file is private and for you only.</p>
          </div>
          <Link href="/dashboard/profile?tab=security">
            <button className="h-16 px-10 bg-dark text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-dark-light transition-all shadow-2xl shadow-dark/20 active:scale-95">View Security</button>
          </Link>
      </div>
    </div>
  );
}
