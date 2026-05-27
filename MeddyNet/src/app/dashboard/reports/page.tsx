"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReports, type ApiReport } from "@/lib/hooks";
import { 
  FileText, 
  Search, 
  Download, 
  Filter,
  CheckCircle,
  Activity,
  AlertCircle,
  Eye,
  ChevronRight,
  TrendingUp,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { haptics } from "@/lib/haptics";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Ready" | "Processing">("All");
  const { data: reports = [], isLoading } = useReports();

  const filteredReports = reports.filter(report => {
    const matchesSearch = (report.test_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (report.lab?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "All" || report.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = [
    { label: "Total", count: reports.length, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Ready", count: reports.filter(r => r.status === "Ready").length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Coming Soon", count: reports.filter(r => r.status === "Processing").length, icon: Activity, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  if (isLoading) {
    return (
      <div className="max-w-[1240px] mx-auto space-y-12">
        <div className="flex justify-between items-end gap-10">
           <div className="space-y-4">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-10 w-64 rounded-xl" />
              <Skeleton className="h-4 w-48 rounded-full" />
           </div>
           <div className="flex gap-3">
              <Skeleton className="h-16 w-24 rounded-2xl" />
              <Skeleton className="h-16 w-24 rounded-2xl" />
              <Skeleton className="h-16 w-24 rounded-2xl" />
           </div>
        </div>
        <Skeleton className="h-14 w-full rounded-[24px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-border rounded-[32px] p-7 shadow-sm space-y-6 relative overflow-hidden">
                 <div className="flex justify-between items-start">
                    <Skeleton className="w-14 h-14 rounded-2xl" />
                    <div className="space-y-2 text-right">
                       <Skeleton className="h-2 w-16 rounded bg-slate-50 ml-auto" />
                       <Skeleton className="h-6 w-24 rounded-lg bg-slate-100" />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4 rounded-lg" />
                    <Skeleton className="h-3 w-1/2 rounded bg-slate-50" />
                 </div>
                 <div className="pt-6 border-t border-dashed border-border flex gap-3">
                    <Skeleton className="h-12 flex-1 rounded-2xl bg-slate-50" />
                    <Skeleton className="h-12 flex-1 rounded-2xl" />
                 </div>
              </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 pb-20">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-1 bg-primary rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">My Records</span>
          </div>
          <h1 className="text-4xl font-black text-dark-light tracking-tight">My Reports</h1>
          <p className="text-text-secondary font-medium max-w-md">All your health test results from our labs.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {stats.map(s => (
            <div key={s.label} className={`${s.bg} px-5 py-3 rounded-2xl border border-border-dark/30 flex flex-col items-center sm:items-start`}>
               <span className="text-lg font-black text-dark-light">{s.count}</span>
               <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider text-center sm:text-left">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-2 rounded-[24px] border border-border shadow-sm flex flex-col sm:flex-row items-center gap-2">
        <div className="flex items-center gap-1 bg-surface p-1 rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar">
          {(["All", "Ready", "Processing"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { haptics.selection(); setActiveTab(tab); }}
              className={`px-5 py-2.5 min-h-[40px] rounded-xl text-xs font-black transition-all ${
                activeTab === tab 
                ? "bg-white text-dark-light shadow-sm ring-1 ring-border" 
                : "text-text-muted hover:text-dark-light hover:bg-white/50"
              }`}
            >
              {tab === 'Processing' ? 'In Progress' : tab}
            </button>
          ))}
        </div>
        
        <div className="relative flex-1 w-full sm:ml-4 group">
          <Search className="w-4 h-4 text-text-light absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary" />
          <input 
            type="text" 
            placeholder="Search for reports..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface border-none rounded-2xl pl-11 pr-4 py-3 text-base focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-text-light font-medium"
          />
        </div>

        <button className="hidden sm:flex items-center justify-center h-12 w-12 bg-surface text-text-muted hover:text-primary hover:bg-primary/5 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Reports Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredReports.map((report, i) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              key={report.id} 
              className="group bg-white rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all flex flex-col"
            >
              <div className={`h-2 w-full ${report.status === "Ready" ? "bg-emerald-500" : "bg-orange-400 animate-pulse"}`} />
              
              <div className="p-7 space-y-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm ${
                    report.status === "Ready" ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-orange-50 border-orange-100 text-orange-600"
                  }`}>
                    <FileText className="w-7 h-7" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{report.id.slice(0, 8)}...</p>
                    {report.status === "Ready" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[9px] font-black uppercase">
                        Verified <CheckCircle className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 text-orange-600 rounded-lg text-[9px] font-black uppercase">
                        Running <Activity className="w-3 h-3 animate-spin-slow" />
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-black text-dark-light leading-tight group-hover:text-primary transition-colors">{report.test_name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-text-secondary font-bold">{report.lab?.name || "Lab"}</p>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <p className="text-[11px] text-text-light font-medium">
                      {report.uploaded_at ? new Date(report.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                    </p>
                  </div>
                </div>
                
                {report.is_abnormal && (
                  <div className="p-3.5 bg-rose-50 border border-rose-100/50 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-rose-600 uppercase tracking-wider">Note</p>
                      <p className="text-[11px] text-rose-600/80 font-bold leading-relaxed">Some things need attention. Please talk to a doctor about this report.</p>
                    </div>
                  </div>
                )}

                {!report.is_abnormal && report.status === "Ready" && (
                  <div className="p-3.5 bg-emerald-50/50 border border-emerald-100/30 rounded-2xl flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span className="text-[11px] font-bold text-emerald-700">Everything looks good</span>
                     </div>
                     <span className="text-[10px] font-black text-emerald-500">PERFECT</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 pt-4 border-t border-dashed border-border mt-auto">
                    {report.status === "Ready" && report.cloud_url ? (
                      <a
                        href={report.cloud_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => haptics.medium()}
                        className="flex-1 h-12 min-h-[44px] flex items-center justify-center gap-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.97] bg-surface text-dark-light hover:bg-border border border-border"
                      >
                        <Download className="w-4 h-4" /> Save
                      </a>
                    ) : (
                      <button 
                        disabled
                        className="flex-1 h-12 min-h-[44px] flex items-center justify-center gap-2 rounded-2xl font-black text-xs uppercase tracking-widest bg-surface text-text-light border border-dashed border-border"
                      >
                        <Download className="w-4 h-4" /> Save
                      </button>
                    )}
                    <button 
                        className="flex-1 h-12 min-h-[44px] flex items-center justify-center gap-2 rounded-2xl font-black text-xs uppercase tracking-widest bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all outline-none"
                    >
                        <Activity className="w-4 h-4 mr-2" /> AI Analysis
                    </button>
                    <Link 
                        href={`/dashboard/reports/${report.id}`}
                        onClick={() => haptics.light()}
                        className={`w-12 h-12 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl border transition-all ${
                        report.status === "Ready" 
                            ? "border-border text-text-secondary hover:border-primary hover:text-primary hover:bg-primary/5" 
                            : "border-border-dark text-slate-200 cursor-not-allowed pointer-events-none"
                        }`}
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredReports.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="col-span-full py-24 text-center space-y-4"
          >
            <div className="w-24 h-24 bg-surface rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-border group">
              <FileText className="w-10 h-10 text-text-light group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-black text-dark-light">No Reports Found</h3>
            <p className="text-text-secondary font-medium max-w-xs mx-auto mb-8">
              {reports.length === 0 ? "Your reports will appear here after lab processes your samples." : "No results match your current search. Try clearing filters or search terms."}
            </p>
            <button 
                onClick={() => { haptics.medium(); setSearchQuery(""); setActiveTab("All"); }}
                className="px-8 py-3 min-h-[44px] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-[0.97] transition-all"
            >
                Show All
            </button>
          </motion.div>
        )}
      </div>

      {/* Suggestion Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="bg-linear-to-br from-primary to-emerald-600 rounded-[40px] p-10 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
           <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                 <ShieldCheckIcon className="w-3 h-3" />
                 <span className="text-[9px] font-black uppercase tracking-widest">Private & Secure</span>
              </div>
              <h2 className="text-3xl font-black leading-tight">Can&apos;t find a report?</h2>
              <p className="text-text-muted text-sm font-medium italic">Everything looks clear. You don&apos;t have any pending reports at the moment.</p>
           </div>
           <Link href="/dashboard/vault" onClick={() => haptics.medium()} className="shrink-0 bg-white text-primary px-8 py-4 min-h-[52px] rounded-3xl font-black text-sm hover:bg-emerald-50 hover:scale-105 active:scale-[0.97] transition-all shadow-2xl flex items-center gap-2">
              Open Vault <ChevronRight className="w-5 h-5" />
           </Link>
        </div>
      </motion.div>
    </div>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
