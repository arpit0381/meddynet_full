"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IndianRupee, 
  TrendingUp, 
  Download,
  Calendar,
  Wallet,
  PieChart,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  Receipt
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";

import { useLabEarnings } from "@/lib/hooks";
import { Loader2 } from "lucide-react";

interface StatItem {
  label: string;
  value: string;
  delta: string;
  icon: React.ElementType;
  color: string;
}

export default function EarningsDashboardPage() {
  const [dateRange, setDateRange] = useState("This Month");
  const [isExporting, setIsExporting] = useState(false);
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  const [selectedTx, setSelectedTx] = useState<{ id: string; date: string; type: string; amount: string; status: string; breakdown: string[] } | null>(null);
  const [toast, setToast] = useState<{message: string, type: "success" | "error"} | null>(null);
  const [showFullLedger, setShowFullLedger] = useState(false);

  const { data: earningsData, isLoading } = useLabEarnings();

  const wallet = earningsData?.wallet || { balance: 0, total_earned: 0, pending_payout: 0 };
  const ledger = earningsData?.ledger || [];

  const recentTransactions = ledger.map((tx: { id: string; created_at: string; action: string; amount: number; description: string }) => ({
    id: tx.id.slice(0, 8),
    date: new Date(tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    type: tx.action === "credit" ? "Booking Payout" : "Commission Deduction",
    amount: `${tx.action === "credit" ? "+" : "-"}₹${(tx.amount / 100).toLocaleString()}`,
    status: "Settled",
    breakdown: [tx.description]
  }));

  const stats: StatItem[] = [
    { label: "Gross Revenue", value: `₹${(wallet.total_earned / 100).toLocaleString()}`, delta: "Total", icon: TrendingUp, color: "bg-blue-600" },
    { label: "Net Wallet Balance", value: `₹${(wallet.balance / 100).toLocaleString()}`, delta: "Available", icon: Wallet, color: "bg-emerald-600" },
    { label: "Pending Payout", value: `₹${(wallet.pending_payout / 100).toLocaleString()}`, delta: "Processing", icon: PieChart, color: "bg-amber-600" },
    { label: "Next Settlement", value: "Every Wednesday", delta: "Auto", icon: IndianRupee, color: "bg-indigo-600" },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setToast({ message: "Financial ledger exported successfully as PDF", type: "success" });
    }, 2000);
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-black text-text-muted uppercase tracking-widest animate-pulse">Computing Ledgers...</p>
        </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-dark-light tracking-tight mb-2">Earnings Dashboard</h1>
          <p className="text-text-muted font-bold">Monitor your revenue flow, commissions, and upcoming payouts.</p>
        </div>
        <div className="flex items-center gap-3 relative">
           <div className="relative">
              <button
                onClick={() => setShowRangeDropdown(!showRangeDropdown)}
                className="flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-white border-2 border-border-dark text-dark-light font-black text-sm hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all group"
              >
                 <Calendar className="w-5 h-5 text-primary" /> {dateRange} <ChevronDown className={`w-4 h-4 transition-transform duration-500 group-hover:translate-y-0.5 ${showRangeDropdown ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showRangeDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-48 bg-white rounded-2xl border border-border-dark shadow-2xl z-50 overflow-hidden p-1.5"
                  >
                    {["This Month", "Last 30 Days", "This Quarter", "Last 12 Months"].map(range => (
                       <button
                         key={range}
                         onClick={() => { setDateRange(range); setShowRangeDropdown(false); }}
                         className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                           dateRange === range ? 'bg-primary text-white' : 'hover:bg-surface text-text-muted'
                         }`}
                       >
                        {range}
                       </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
           <button
             onClick={handleExport}
             disabled={isExporting}
             className="flex items-center justify-center gap-3 px-10 py-4 rounded-3xl bg-dark text-white font-black text-sm shadow-2xl shadow-dark/20 hover:-translate-y-1 hover:bg-dark-light transition-all disabled:opacity-50 disabled:translate-y-0"
           >
              {isExporting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> <span>Export Ledger</span>
                </>
              )}
           </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {stats.map((stat: StatItem, i: number) => (
           <motion.div
             key={stat.label}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="bg-white rounded-5xl p-6 border border-border-dark/20 shadow-xl shadow-black/2 group"
           >
              <div className="flex items-center justify-between mb-4">
                 <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6" />
                 </div>
                 <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                   stat.delta.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-primary/5 text-primary'
                 }`}>
                    {stat.delta}
                 </div>
              </div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-dark-light tracking-tight">{stat.value}</p>
           </motion.div>
         ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         {/* Monthly Revenue Analysis */}
         <div className="lg:col-span-2 bg-white rounded-5xl p-8 border border-border-dark/20 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-12">
               <div>
                  <h3 className="text-xl font-black text-dark-light tracking-tight">Revenue Analysis</h3>
                  <p className="text-sm font-bold text-text-muted">Monthly growth and commission patterns</p>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-primary" />
                     <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Net Profit</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-primary/20" />
                     <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Fees</span>
                  </div>
               </div>
            </div>

            {/* Custom SVG Data Visualization */}
            {/* Premium SVG Area Chart */}
            <div className="h-72 relative mt-4">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 300">
                <defs>
                   <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                   </linearGradient>
                   <linearGradient id="feesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                   </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 75, 150, 225, 300].map(y => (
                  <line key={y} x1="0" y1={y} x2="700" y2={y} stroke="currentColor" strokeOpacity="0.05" />
                ))}

                {/* Fees Area (Primary/20) */}
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  d="M0,250 C100,230 200,240 300,180 C400,200 500,120 600,150 L700,160 L700,300 L0,300 Z"
                  fill="url(#feesGradient)"
                />
                
                {/* Profit Area (Primary) */}
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
                  d="M0,220 C100,180 200,210 300,120 C400,150 500,60 600,80 L700,70 L700,300 L0,300 Z"
                  fill="url(#profitGradient)"
                />

                {/* Lines */}
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
                  d="M0,220 C100,180 200,210 300,120 C400,150 500,60 600,80 L700,70"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  d="M0,250 C100,230 200,240 300,180 C400,200 500,120 600,150 L700,160"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                  strokeOpacity="0.4"
                />

                {/* Data Points */}
                {[
                  { x: 0, y: 220 }, { x: 100, y: 180 }, { x: 200, y: 210 }, { x: 300, y: 120 }, 
                  { x: 400, y: 150 }, { x: 500, y: 60 }, { x: 600, y: 80 }, { x: 700, y: 70 }
                ].map((pt, idx) => (
                  <motion.circle
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.5 + idx * 0.1 }}
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    fill="#2563eb"
                    stroke="white"
                    strokeWidth="2"
                  />
                ))}
              </svg>

              {/* X-Axis Labels */}
              <div className="absolute -bottom-8 left-0 right-0 flex justify-between px-2">
                 {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map(m => (
                    <span key={m} className="text-[10px] font-black text-text-muted uppercase tracking-widest">{m}</span>
                 ))}
              </div>
            </div>
         </div>

         {/* Transaction History */}
         <div className="bg-white rounded-5xl p-8 border border-border-dark/20 shadow-2xl">
            <h3 className="text-xl font-black text-dark-light tracking-tight mb-8">Recent Payouts</h3>
            <div className="space-y-6">
               {recentTransactions.map((tx: { id: string; date: string; type: string; amount: string; status: string; breakdown: string[] }) => (
                 <div 
                   key={tx.id} 
                   onClick={() => setSelectedTx(tx)}
                   className="flex items-center justify-between group cursor-pointer p-4 -mx-4 rounded-2xl hover:bg-surface transition-all"
                 >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center group-hover:bg-primary/10 transition-colors text-primary">
                          <IndianRupee className="w-4 h-4" />
                       </div>
                       <div>
                          <p className="text-sm font-black text-dark-light mb-0.5">{tx.amount}</p>
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{tx.type}</p>
                       </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                       <div>
                          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                            tx.status === 'Settled' ? 'text-emerald-500' : 'text-primary'
                          }`}>{tx.status}</p>
                          <p className="text-[10px] font-bold text-text-muted uppercase">{tx.date}</p>
                       </div>
                       <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-all group-hover:translate-x-1" />
                    </div>
                 </div>
               ))}
            </div>
            <button 
              onClick={() => setShowFullLedger(true)}
              className="w-full mt-10 py-5 rounded-full bg-surface border border-border-dark/30 text-xs font-black text-dark-light hover:bg-white hover:shadow-xl hover:shadow-black/5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
             >
                Full Payout Ledger <ArrowRight className="w-4 h-4 text-primary" />
             </button>
         </div>
      </div>

      <Modal
        isOpen={showFullLedger}
        onClose={() => setShowFullLedger(false)}
        title="Full Financial Ledger"
      >
        <div className="p-8 space-y-6">
           <div className="flex items-center gap-4 bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-3xl mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                 <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Bank Verified Statement</p>
                 <p className="text-xs font-bold text-text-muted mt-0.5 text-balance">All payouts are automatically settled via Razorpay Route every Wednesday.</p>
              </div>
           </div>
           
           <div className="space-y-3">
              {[...recentTransactions, ...recentTransactions].map((tx, idx) => (
                <div key={`${tx.id}-${idx}`} className="flex items-center justify-between p-5 rounded-3xl border border-border-dark/20 bg-surface/30 hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-border-dark/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                         <IndianRupee className="w-4 h-4" />
                      </div>
                      <div>
                         <p className="text-sm font-black text-dark-light">{tx.amount}</p>
                         <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{tx.date}</p>
                      </div>
                   </div>
                   <div className="text-right flex items-center gap-4">
                      <div>
                         <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 px-3 py-1 rounded-full ${tx.status === 'Settled' ? 'bg-emerald-100 text-emerald-600' : 'bg-primary/10 text-primary'}`}>{tx.status}</p>
                         <p className="text-[10px] font-black text-dark-light italic uppercase tracking-widest">{tx.id}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-all group-hover:translate-x-1" />
                   </div>
                </div>
              ))}
           </div>
           
           <button 
             onClick={() => setShowFullLedger(false)}
             className="w-full py-5 rounded-full bg-dark text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-dark/20 hover:bg-dark-light hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 group"
           >
              Back to Dashboard
           </button>
        </div>
      </Modal>

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        title="Transaction Breakdown"
      >
        {selectedTx && (
          <div className="p-8 space-y-8">
             <div className="flex items-center gap-6 p-6 rounded-4xl bg-surface border border-border-dark/10 relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16 transition-all duration-700 ${selectedTx.status === 'Settled' ? 'bg-emerald-500/10' : 'bg-primary/10'}`} />
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-xl ${selectedTx.status === 'Settled' ? 'bg-emerald-500' : 'bg-primary'} relative z-10 shadow-primary/20`}>
                   <Receipt className="w-8 h-8" />
                </div>
                <div className="relative z-10">
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Transaction ID</p>
                   <h3 className="text-xl font-black text-dark-light tracking-tight">{selectedTx.id}</h3>
                </div>
             </div>

             <div className="space-y-6">
                <div>
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mb-4">Payout Details</p>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-3xl border border-border-dark/20 bg-white">
                         <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Net Amount</p>
                         <p className="text-lg font-black text-dark-light leading-none">{selectedTx.amount}</p>
                      </div>
                      <div className="p-4 rounded-3xl border border-border-dark/20 bg-white">
                         <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Date Processed</p>
                         <p className="text-lg font-black text-dark-light leading-none">{selectedTx.date}</p>
                      </div>
                   </div>
                </div>

                <div>
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mb-4">Breakdown Items</p>
                   <div className="space-y-2.5">
                      {selectedTx.breakdown.map((item: string, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-full border border-border-dark/10 bg-surface/50 px-6 font-bold text-sm text-dark-light">
                           <span>{item.split(': ')[0]}</span>
                           <span className="text-primary font-black uppercase tracking-widest text-[10px]">{item.split(': ')[1] || 'Included'}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="pt-2 flex flex-col gap-3">
                <button className="w-full py-4.5 rounded-full bg-dark text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-dark/20 hover:bg-dark-light hover:-translate-y-1 active:scale-95 transition-all">
                   Download Receipt
                </button>
                <button 
                  onClick={() => setSelectedTx(null)}
                  className="w-full py-4.5 rounded-full bg-surface text-text-muted font-black text-xs uppercase tracking-[0.2em] hover:bg-border-dark/10 transition-all"
                >
                   Close Details
                </button>
             </div>
          </div>
        )}
      </Modal>

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
