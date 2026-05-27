"use client";

import { usePayments, type ApiPayment, useProfile, useDeposit } from "@/lib/hooks";
import { 
  CreditCard, 
  Download, 
  Search, 
  Clock,
  Plus,
  Smartphone,
  Wallet as WalletIcon,
  Filter,
  Loader2,
  X,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const getStatusStyles = (status: string) => {
  switch (status) {
    case "paid": return { text: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Successful" };
    case "pending": return { text: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", label: "Pending" };
    case "failed": return { text: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", label: "Failed" };
    case "refunded": return { text: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Refunded" };
    default: return { text: "text-slate-400", bg: "bg-slate-100", border: "border-slate-200", label: status };
  }
};

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("500");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { data: payments = [], isLoading: isPaymentsLoading } = usePayments();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const depositMutation = useDeposit();
  const queryClient = useQueryClient();

  const filtered = payments.filter(txn => 
    (activeTab === "all" || (activeTab === "payments" && txn.booking_id) || (activeTab === "deposits" && !txn.booking_id)) &&
    (txn.id.toLowerCase().includes(search.toLowerCase()) || 
    (txn.booking_id || "").toLowerCase().includes(search.toLowerCase()) ||
    (txn.razorpay_order_id || "").toLowerCase().includes(search.toLowerCase()))
  );

  const totalSpent = payments.filter(p => p.status === "paid" && p.booking_id).reduce((sum, p) => sum + p.total_amount, 0);

  const handleDeposit = async () => {
    const amountPaise = parseInt(depositAmount) * 100;
    if (isNaN(amountPaise) || amountPaise < 100) { // Min ₹1
      alert("Please enter at least ₹1");
      return;
    }

    try {
      setIsProcessing(true);
      const order = await depositMutation.mutateAsync(amountPaise);
      
      const loadScript = () => {
        return new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const scriptLoaded = await loadScript();
      if (!scriptLoaded) throw new Error("Razorpay SDK failed to load.");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SYtud8bQx2VFGp",
        amount: order.amount,
        currency: order.currency,
        name: "MeddyNet Wallet",
        description: "Wallet Top-up",
        order_id: order.razorpay_order_id,
        handler: async (response: any) => {
          try {
            const { apiClient } = await import("@/lib/api");
            await apiClient.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            
            setIsDepositModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['payments'] });
          } catch (err) {
            alert("Verification failed. Please check with support.");
          }
        },
        prefill: {
          name: profile?.name,
          email: profile?.email,
          contact: profile?.phone,
        },
        theme: { color: "#00A86B" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const axiosErr = err as { message?: string };
      alert(axiosErr.message || "Failed to initiate deposit.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isPaymentsLoading || isProfileLoading) {
    return (
      <div className="max-w-[1240px] mx-auto space-y-12">
        <div className="flex justify-between items-center gap-10">
           <div className="space-y-4">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-10 w-64 rounded-xl" />
           </div>
           <div className="flex gap-4">
              <Skeleton className="h-16 w-40 rounded-3xl" />
              <Skeleton className="h-16 w-32 rounded-3xl" />
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-[32px]" />
           ))}
        </div>
        <div className="space-y-6">
           <Skeleton className="h-16 w-full rounded-3xl" />
           <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                 <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1240px] mx-auto space-y-10 pb-20">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <CreditCard className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">My Payments</span>
          </div>
          <h1 className="text-4xl font-black text-dark-light tracking-tight">Financial Health</h1>
          <p className="text-text-secondary font-medium max-w-sm">Manage your MeddyNet Wallet and view transaction history.</p>
        </div>

        <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-black text-dark-light">{payments.length} Transactions</span>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total Spent: ₹{(totalSpent / 100).toLocaleString()}</span>
            </div>
            <button 
              onClick={() => setIsDepositModalOpen(true)}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-dark-light text-white rounded-3xl font-black text-sm shadow-2xl shadow-dark/20 hover:scale-105 transition-all group"
            >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                Add Money
            </button>
        </div>
      </div>

      {/* Wallet Highlights */}
      <div className="grid md:grid-cols-2 gap-6">
          {/* Main Wallet Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-[40px] bg-linear-to-br from-dark to-slate-800 p-8 text-white shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px]">
                <div className="flex justify-between items-start">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-inner">
                        <WalletIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-right">
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Available Balance</p>
                        <h2 className="text-4xl font-black tracking-tight">₹{( (profile?.wallet_balance || 0) / 100).toLocaleString()}</h2>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-6">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-400 capitalize tracking-widest">Active Meddy Wallet</span>
                    </div>
                    <button 
                      onClick={() => setIsDepositModalOpen(true)}
                      className="px-6 py-2 bg-white text-dark font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-50 transition-all active:scale-95"
                    >
                      Instant Top-up
                    </button>
                </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-[40px] bg-surface border border-border p-8 flex flex-col justify-between"
          >
            <div className="space-y-1">
                <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">Test Spending</p>
                <h3 className="text-3xl font-black text-dark-light">₹{(totalSpent / 100).toLocaleString()}</h3>
                <p className="text-xs text-text-secondary font-medium italic">Across {payments.filter(p => p.booking_id).length} lab bookings</p>
            </div>
            
            <div className="flex gap-2 pt-6">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex-1 h-8 rounded-lg bg-surface-dark border border-border animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
            </div>
          </motion.div>
      </div>

      {/* Transaction List */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-[32px] border border-border shadow-sm">
            <div className="flex items-center gap-1 bg-surface p-1 rounded-2xl w-full sm:w-auto overflow-x-auto custom-scrollbar">
                <button onClick={() => setActiveTab('all')} className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-white text-dark-light shadow-sm ring-1 ring-border' : 'text-text-muted hover:text-dark-light'}`}>All Activity</button>
                <button onClick={() => setActiveTab('payments')} className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'payments' ? 'bg-white text-dark-light shadow-sm ring-1 ring-border' : 'text-text-muted hover:text-dark-light'}`}>Payments</button>
                <button onClick={() => setActiveTab('deposits')} className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'deposits' ? 'bg-white text-dark-light shadow-sm ring-1 ring-border' : 'text-text-muted hover:text-dark-light'}`}>Deposits</button>
            </div>
            
            <div className="relative flex-1 group w-full sm:ml-4">
                <Search className="w-4.5 h-4.5 text-text-light absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-all" />
                <input 
                    type="text" 
                    placeholder="Search transactions..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-surface/50 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm font-black placeholder:text-text-light outline-none transition-all focus:ring-4 focus:ring-primary/10"
                />
            </div>

            <button className="hidden sm:flex h-12 w-12 bg-surface border border-border-dark rounded-2xl items-center justify-center text-text-muted hover:text-primary hover:bg-primary/5 transition-all">
                <Filter className="w-5 h-5" />
            </button>
        </div>

        {/* Transaction Cards */}
        <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
                {filtered.map((txn, i) => {
                    const styles = getStatusStyles(txn.status);
                    const isDeposit = !txn.booking_id;
                    return (
                        <motion.div 
                            key={txn.id}
                            layout
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.05 }}
                            className="bg-white border border-border rounded-[32px] p-6 sm:p-7 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500 overflow-hidden relative group"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="flex items-center gap-5 sm:gap-7 flex-1">
                                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[24px] bg-surface flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-border shadow-xs`}>
                                        {isDeposit ? <Plus className="w-5 h-5 text-emerald-500" /> : <CreditCard className="w-5 h-5 text-text-muted" />}
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black text-dark-light truncate">{isDeposit ? "Wallet Top-up" : `Payment: ${txn.id.slice(0, 8)}...`}</p>
                                            {txn.booking_id && (
                                              <span className="px-2 py-0.5 bg-surface text-[9px] font-black text-text-muted rounded uppercase tracking-widest border border-border-dark">
                                                Booking: {txn.booking_id.slice(0, 8)}...
                                              </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-bold text-text-secondary">
                                            <span className="flex items-center gap-1.5 font-medium">
                                              <Clock className="w-3.5 h-3.5" /> 
                                              {txn.created_at ? new Date(txn.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                            <span className="flex items-center gap-1.5 uppercase tracking-widest text-[10px] font-black text-text-muted">
                                              {txn.razorpay_payment_id ? "Razorpay" : "Direct"} Secure
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center sm:items-end flex-row-reverse sm:flex-col justify-between sm:justify-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className={`text-xl font-black ${isDeposit ? 'text-emerald-500' : 'text-dark-light'}`}>
                                              {isDeposit ? '+' : ''}₹{(txn.total_amount / 100).toFixed(2)}
                                            </p>
                                            <span className="text-[10px] font-black tracking-widest uppercase text-text-muted">{isDeposit ? "Added to Wallet" : "Total Paid"}</span>
                                        </div>
                                        <button 
                                            disabled={txn.status !== "paid"}
                                            className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all ${
                                                txn.status === "paid" 
                                                ? "bg-dark-light text-white border-dark hover:bg-dark shadow-xl shadow-dark/10" 
                                                : "bg-surface text-slate-200 border-border-dark cursor-not-allowed"
                                            }`}
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-black text-[9px] uppercase tracking-widest ${styles.text} ${styles.bg} ${styles.border}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${txn.status === 'paid' ? 'bg-emerald-500' : txn.status === 'pending' ? 'bg-orange-500' : 'bg-rose-500'}`} />
                                        {styles.label}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {filtered.length === 0 && (
                <div className="py-24 text-center space-y-4 bg-white border-2 border-dashed border-border rounded-[48px]">
                    <div className="w-20 h-20 bg-surface rounded-[28px] flex items-center justify-center mx-auto mb-6">
                        <CreditCard className="w-10 h-10 text-border-dark" />
                    </div>
                    <h3 className="text-2xl font-black text-dark-light">
                      {payments.length === 0 ? "No Transactions Yet" : "Transaction Not Found"}
                    </h3>
                    <p className="text-text-secondary font-medium">
                      {payments.length === 0 ? "Start using your MeddyNet Wallet or book a test to see activity here." : "Verify your search or try different filters."}
                    </p>
                </div>
            )}
        </div>
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {isDepositModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setIsDepositModalOpen(false)}
              className="absolute inset-0 bg-dark/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl overflow-hidden border border-border"
            >
              <div className="p-8 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                  </div>
                  <button 
                    onClick={() => setIsDepositModalOpen(false)}
                    className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-surface transition-colors"
                  >
                    <X className="w-4 h-4 text-text-muted" />
                  </button>
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-dark-light tracking-tight">Add Money</h2>
                  <p className="text-sm font-medium text-text-secondary italic">Top-up your wallet for instant test bookings.</p>
                </div>

                <div className="space-y-6">
                  <div className="relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-text-muted group-focus-within:text-emerald-500 transition-colors">₹</span>
                    <input 
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full h-20 bg-surface border-2 border-border rounded-3xl pl-12 pr-6 text-3xl font-black outline-none focus:border-emerald-500 focus:bg-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {["500", "1000", "2000"].map(amt => (
                      <button 
                        key={amt}
                        onClick={() => setDepositAmount(amt)}
                        className={`py-3 rounded-xl border-2 font-black text-xs uppercase tracking-widest transition-all ${depositAmount === amt ? 'bg-emerald-50 text-emerald-600 border-emerald-500' : 'bg-surface border-border hover:border-emerald-300'}`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-600 leading-relaxed italic">
                      Protected by 256-bit encryption. Funds are securely handled via Razorpay.
                    </p>
                  </div>

                  <button 
                    onClick={handleDeposit}
                    disabled={isProcessing}
                    className="w-full h-16 bg-dark text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-dark/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        Proceed to Pay ₹{depositAmount}
                        <Plus className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
