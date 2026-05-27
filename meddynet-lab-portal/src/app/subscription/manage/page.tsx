"use client";

import { motion } from "framer-motion";
import { 
  ChevronRight, 
  ArrowUpRight, 
  History, 
  Download, 
  Clock, 
  ShieldCheck,
  Zap,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Database,
  Rocket,
  Crown,
  Microscope,
  Mail,
  RefreshCcw,
  Receipt,
  Printer,
  Wallet,
  ExternalLink
} from "lucide-react";
import Image from "next/image";
import { useState, useMemo } from "react";
import Toast from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import { AnimatePresence } from "framer-motion";

const initialBillingHistory = [
  { id: "INV-2024-003", date: "Mar 12, 2024", amount: "₹4,999", status: "Paid", method: "Razorpay Gateway" },
  { id: "INV-2024-002", date: "Feb 12, 2024", amount: "₹4,999", status: "Paid", method: "Razorpay Gateway" },
  { id: "INV-2024-001", date: "Jan 12, 2024", amount: "₹4,999", status: "Paid", method: "Razorpay Gateway" },
];

const plansData = [
  { 
    id: "starter",
    name: "Starter", 
    price: "₹0", 
    duration: "/forever",
    description: "Perfect for new laboratories starting their digital journey.",
    icon: Microscope,
    color: "bg-slate-400",
    commission: "22%",
    support: "Community",
    analytics: "Basic",
    features: ["Listed on MeddyNet Map", "10 Tests Management", "22% Commission", "Community Support"]
  },
  { 
    id: "basic",
    name: "Basic", 
    price: "₹1,999", 
    duration: "/month",
    description: "Ideal for small independent labs entering the digital space.",
    icon: Rocket,
    color: "bg-blue-500",
    commission: "18%",
    support: "Standard",
    analytics: "Pro Reports",
    features: ["Discovery on Map", "50 Tests Management", "18% Commission", "Standard Support"]
  },
  { 
    id: "advanced",
    name: "Advanced", 
    price: "₹4,999", 
    duration: "/month",
    description: "Best for growing labs with high daily booking volume.",
    icon: Zap,
    color: "bg-amber-500",
    commission: "15%",
    support: "24/7 Priority",
    analytics: "Enterprise AI",
    features: ["Priority in Search", "Unlimited Tests", "15% Commission", "24/7 Priority Support"]
  },
  { 
    id: "premium",
    name: "Premium", 
    price: "₹9,999", 
    duration: "/month",
    description: "Complete SaaS solution for large diagnostics chains.",
    icon: Crown,
    color: "bg-indigo-600",
    commission: "12%",
    support: "Dedicated Manager",
    analytics: "Custom Revenue AI",
    features: ["Top Rank in City", "API Integration", "12% Commission", "Account Manager"]
  },
];

export default function SubscriptionManagePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "billing" | "plans">("overview");
  const [currentPlanId, setCurrentPlanId] = useState("advanced");
  const [billingHistory, setBillingHistory] = useState(initialBillingHistory);
  const [toast, setToast] = useState<{message: string, type: "success" | "error"} | null>(null);
  
  // Payment States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");

  const currentPlan = useMemo(() => 
    plansData.find(p => p.id === currentPlanId) || plansData[2]
  , [currentPlanId]);

  const handleUpgradeOrRenew = (planId: string) => {
    setSelectedPlanId(planId);
    setPaymentStatus("idle");
    setIsPaymentModalOpen(true);
  };

  const processPayment = () => {
    setPaymentStatus("processing");
    const newTxId = `TXN-${Math.floor(Math.random() * 9000000) + 1000000}`;
    setTransactionId(newTxId);

    setTimeout(() => {
      setPaymentStatus("success");
      const targetPlan = plansData.find(p => p.id === selectedPlanId)!;
      
      const newInvoice = {
        id: `INV-2024-${String(billingHistory.length + 1).padStart(3, '0')}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        amount: targetPlan.price,
        status: "Paid",
        method: "Razorpay Secure"
      };
      
      setBillingHistory([newInvoice, ...billingHistory]);
      setCurrentPlanId(selectedPlanId!);
    }, 2000);
  };

  const handleDownloadInvoice = (id: string) => {
     setToast({ message: `Generating receipt for ${id}...`, type: "success" });
  };

  const selectedPlan = plansData.find(p => p.id === selectedPlanId);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 sm:px-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-dark-light tracking-tight mb-3 italic text-left">Manage <span className="text-primary not-italic">Subscription</span></h1>
          <p className="text-text-muted font-bold text-lg text-left">Central control for your Laboratory&apos;s growth plan and billing.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-border-dark shadow-xl shadow-black/5">
           {(["overview", "plans", "billing"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-text-muted hover:bg-surface hover:text-dark-light"
                }`}
              >
                {tab}
              </button>
           ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Active Plan Card */}
           <div className="lg:col-span-2 space-y-8">
              <motion.div 
                layoutId="plan-card"
                className="relative overflow-hidden bg-linear-to-br from-dark to-slate-800 rounded-[3rem] p-8 sm:p-10 text-white shadow-2xl"
              >
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                 <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-10">
                       <div className="px-4 py-1.5 rounded-full bg-primary text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/40">Active Subscription</div>
                       <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                       <div className="text-left">
                          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 italic truncate max-w-md">{currentPlan.name} <span className="text-primary not-italic">Partner</span></h2>
                          <div className="flex items-center gap-4 text-slate-400 font-bold text-sm uppercase tracking-widest">
                             <span>{currentPlan.price} {currentPlan.duration}</span>
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                             <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Next Invoice: 12 Apr 2024</span>
                          </div>
                       </div>
                       <div className="flex flex-col sm:flex-row gap-4">
                          <button 
                            onClick={() => handleUpgradeOrRenew(currentPlanId)}
                            className="px-8 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
                          >
                             Renew Now <RefreshCcw className="w-4 h-4" />
                          </button>
                          <button onClick={() => setActiveTab("plans")} className="px-8 py-4 rounded-2xl bg-white text-dark font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl shadow-white/5 flex items-center gap-2">
                             Switch Plan <Zap className="w-4 h-4 fill-current" />
                          </button>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-10 border-t border-white/10 text-left">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Commission Rate</p>
                          <p className="text-xl font-black text-primary">{currentPlan.commission}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Support Level</p>
                          <p className="text-xl font-black">{currentPlan.support}</p>
                       </div>
                       <div className="hidden sm:block">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Analytics</p>
                          <p className="text-xl font-black text-emerald-400">{currentPlan.analytics}</p>
                       </div>
                    </div>
                 </div>
              </motion.div>

              {/* Usage Stats Grid */}
              <div className="grid sm:grid-cols-2 gap-6">
                 <div className="bg-white rounded-5xl p-8 border border-border-dark/20 shadow-xl group text-left">
                    <div className="flex items-center justify-between mb-8">
                       <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Database className="w-6 h-6" />
                       </div>
                       <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Listing Capacity</span>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-end justify-between">
                          <p className="text-sm font-black text-dark-light">45 / {currentPlan.id === 'starter' ? '10' : currentPlan.id === 'basic' ? '50' : '1000'} <span className="text-text-muted font-bold ml-1 text-xs">Test Packets</span></p>
                          <p className="text-xs font-black text-primary">{currentPlan.id === 'starter' ? 'Overlimit' : '4.5% Used'}</p>
                       </div>
                       <div className="h-2.5 w-full bg-surface rounded-full overflow-hidden border border-border-dark/5 shadow-inner">
                          <motion.div initial={{ width: 0 }} animate={{ width: currentPlan.id === 'starter' ? "100%" : "4.5%" }} className={`h-full ${currentPlan.id === 'starter' ? 'bg-red-500' : 'bg-primary'}`} />
                       </div>
                    </div>
                 </div>
                 
                 <div className="bg-white rounded-5xl p-10 border border-border-dark/20 shadow-xl group text-left">
                    <div className="flex items-center justify-between mb-8">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                          <TrendingUp className="w-6 h-6" />
                       </div>
                       <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Revenue Impact</span>
                    </div>
                    <div className="space-y-1">
                       <p className="text-3xl font-black text-dark-light tracking-tighter italic text-left">+₹42,350</p>
                       <p className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3" /> 18.5% Growth this month
                       </p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Sidebar Info */}
           <div className="space-y-8">
              <div className="bg-linear-to-br from-white to-surface rounded-5xl p-8 border border-border-dark/20 shadow-xl overflow-hidden relative">
                 <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
                 <h3 className="text-lg font-black text-dark-light mb-6 flex items-center gap-2 relative z-10 text-left">
                    Direct Payment <Wallet className="w-5 h-5 text-primary" />
                 </h3>
                 <p className="text-sm font-bold text-text-muted leading-relaxed mb-8 relative z-10 text-left">Securely renew or upgrade using <span className="text-dark font-black">Razorpay</span> gateway. Supports UPI, Cards, and Netbanking.</p>
                 <button 
                  onClick={() => setActiveTab("plans")}
                  className="w-full py-4 rounded-2xl bg-dark text-white text-[10px] uppercase font-black hover:bg-primary transition-all shadow-xl shadow-dark/10 relative z-10">
                    Go to Payments
                 </button>
              </div>

              <div className="bg-emerald-50/50 rounded-5xl p-8 border border-emerald-100 shadow-xl text-left">
                 <div className="flex items-center gap-3 mb-6 text-emerald-600">
                    <ShieldCheck className="w-6 h-6" />
                    <h3 className="text-lg font-black tracking-tight">Enterprise Shield</h3>
                 </div>
                 <p className="text-xs font-bold text-emerald-700 leading-relaxed mb-6">Your data is secured with AES-256 encryption & compliant with HIPAA healthcare standards.</p>
                 <button className="w-full py-4 rounded-2xl bg-white border border-emerald-200 text-[10px] font-black text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-widest">
                    Security Policy
                 </button>
              </div>
           </div>
        </div>
      )}

      {activeTab === "billing" && (
        <div className="bg-white rounded-[3rem] border border-border-dark/20 shadow-2xl overflow-hidden">
           <div className="p-10 border-b border-border-dark/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-left">
              <div>
                 <h2 className="text-2xl font-black text-dark-light tracking-tight mb-1 flex items-center gap-3">
                    Billing History <History className="w-6 h-6 text-primary" />
                 </h2>
                 <p className="text-sm font-bold text-text-muted italic">Download invoices and track your expenses.</p>
              </div>
              <button 
                onClick={() => handleDownloadInvoice("all")}
                className="px-8 py-4 rounded-2xl bg-dark text-white font-black text-xs uppercase tracking-widest hover:bg-dark-light transition-all flex items-center gap-2">
                 Download All <Download className="w-4 h-4" />
              </button>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                 <thead>
                    <tr className="bg-surface border-b border-border-dark/10">
                       <th className="px-10 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Invoice Date</th>
                       <th className="px-10 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Reference ID</th>
                       <th className="px-10 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Amount</th>
                       <th className="px-10 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Payment Gateway</th>
                       <th className="px-10 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
                       <th className="px-10 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border-dark/10">
                    {billingHistory.map((inv, idx) => (
                       <tr key={idx} className="group hover:bg-surface/50 transition-colors">
                          <td className="px-10 py-6 text-sm font-black text-dark-light">{inv.date}</td>
                          <td className="px-10 py-6 text-sm font-bold text-text-muted">{inv.id}</td>
                          <td className="px-10 py-6 text-sm font-black text-dark-light italic md:text-left text-left">{inv.amount}</td>
                          <td className="px-10 py-6 text-xs font-bold text-text-muted uppercase">{inv.method}</td>
                          <td className="px-10 py-6">
                             <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                <CheckCircle2 className="w-3 h-3" /> {inv.status}
                             </span>
                          </td>
                          <td className="px-10 py-6 text-right">
                             <button 
                              onClick={() => handleDownloadInvoice(inv.id)}
                              className="p-3 rounded-xl bg-surface border border-border-dark text-text-muted hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ml-auto">
                                <Download className="w-3.5 h-3.5" /> PDF
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === "plans" && (
        <div className="space-y-10">
           <div className="text-center max-w-2xl mx-auto mb-16 px-4">
              <h2 className="text-3xl font-black text-dark-light tracking-tight mb-4 italic">Scale your Lab business with <br /> <span className="text-primary not-italic">MeddyNet</span></h2>
              <p className="text-sm font-bold text-text-muted capitalize tracking-wide">Pick a plan that fits your current needs. You can upgrade or downgrade anytime as your laboratory expands.</p>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {plansData.map((plan) => (
                 <div key={plan.id} className={`relative bg-white rounded-5xl p-8 border-2 transition-all duration-500 overflow-hidden flex flex-col items-start ${
                    currentPlanId === plan.id 
                    ? "border-primary shadow-2xl lg:scale-105 z-10" 
                    : "border-border-dark/10 shadow-xl hover:border-primary/20"
                 }`}>
                    {currentPlanId === plan.id && (
                       <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-6 py-2 rounded-bl-3xl">Active</div>
                    )}
                    
                    <div className="mb-8 text-left">
                       <div className={`w-12 h-12 rounded-2xl ${plan.color} flex items-center justify-center text-white shadow-lg mb-6`}>
                          <plan.icon className="w-6 h-6" />
                       </div>
                       <h3 className="text-2xl font-black text-dark-light mb-1 italic">{plan.name}</h3>
                       <p className="text-[10px] font-bold text-text-muted leading-relaxed uppercase tracking-widest">{plan.description}</p>
                    </div>

                    <div className="flex items-baseline gap-1 mb-8 text-left">
                       <span className="text-4xl font-black text-dark-light tracking-tighter">{plan.price}</span>
                       <span className="text-text-muted font-bold text-[10px] uppercase tracking-widest">{plan.duration}</span>
                    </div>
                    
                    <div className="space-y-4 mb-10 pb-8 border-b border-border-dark/10 flex-1 text-left">
                       {plan.features.map(f => (
                          <div key={f} className="flex items-center gap-3 text-[12px] font-bold text-dark-light leading-tight">
                             <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> {f}
                          </div>
                       ))}
                    </div>

                    <button 
                      onClick={() => handleUpgradeOrRenew(plan.id)}
                      className="w-full py-4 rounded-2xl bg-dark text-white font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-dark/10 flex items-center justify-center gap-2"
                    >
                       {currentPlanId === plan.id ? "Renew Now" : `Get ${plan.name} Plan`} <ChevronRight className="w-4 h-4" />
                    </button>
                 </div>
              ))}
           </div>

           <div className="p-8 rounded-5xl bg-indigo-50 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-8 mt-12 text-left">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg text-indigo-500 shrink-0">
                    <HelpCircle className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest">Enterprise Custom Quote</h4>
                    <p className="text-xs font-bold text-indigo-700 opacity-70">Need a unique set of features? Talk to our business scale team.</p>
                 </div>
              </div>
              <button 
                onClick={() => setToast({ message: "Our team will reach out to you within 24 hours.", type: "success" })}
                className="px-8 py-4 rounded-2xl bg-white text-indigo-600 font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl shadow-indigo-600/5 flex items-center gap-2">
                Contact Sales <Mail className="w-4 h-4" />
              </button>
           </div>
        </div>
      )}

      {/* Payment Processing & Receipt Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => paymentStatus !== 'processing' && setIsPaymentModalOpen(false)}
        title={paymentStatus === 'success' ? "Payment Successful" : "Razorpay Checkout"}
        maxWidth="max-w-lg"
      >
        <div className="p-8 pt-0 space-y-8">
           {paymentStatus === "idle" && (
              <div className="animate-in fade-in slide-in-from-bottom-5 duration-500 text-left">
                 <div className="p-6 rounded-3xl bg-surface border border-border-dark/10 mb-8 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Payment for</p>
                       <h4 className="text-2xl font-black text-dark-light">
                          {selectedPlan?.name} <span className="text-primary font-bold italic">Plan</span>
                       </h4>
                    </div>
                    <div className="text-right">
                       <p className="text-3xl font-black text-dark-light tracking-tighter">{selectedPlan?.price}</p>
                       <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Net Amount</p>
                    </div>
                 </div>

                 <div className="space-y-6 mb-10">
                    <h5 className="text-[10px] font-black text-text-muted uppercase tracking-widest px-2">Chosen Gateway</h5>
                    <div className="p-6 rounded-3xl bg-white border-2 border-primary shadow-xl flex items-center justify-between group">
                       <div className="flex items-center gap-6">
                          <Image src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" width={32} height={32} className="group-hover:scale-110 transition-transform" />
                          <div>
                             <p className="text-sm font-black text-dark-light">Razorpay Secure Checkout</p>
                             <p className="text-[10px] font-bold text-text-muted uppercase italic">UPI, Cards, Netbanking Supported</p>
                          </div>
                       </div>
                       <ExternalLink className="w-5 h-5 text-primary" />
                    </div>
                 </div>

                 <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-4 mb-8">
                    <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-blue-700 leading-relaxed">
                       You will be redirected to Razorpay&apos;s secure portal to complete your transaction. Do not refresh this page.
                    </p>
                 </div>

                 <div className="flex gap-4">
                    <button 
                       onClick={() => setIsPaymentModalOpen(false)}
                       className="flex-1 py-4 rounded-2xl bg-surface text-text-muted font-black text-[10px] uppercase tracking-widest hover:bg-border-dark/20 transition-all font-inter"
                    >
                       Back
                    </button>
                    <button 
                       onClick={processPayment}
                       className="flex-2 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
                    >
                       Proceed to Pay <ChevronRight className="w-4 h-4" />
                    </button>
                 </div>
              </div>
           )}

           {paymentStatus === "processing" && (
              <div className="py-20 flex flex-col items-center justify-center text-center gap-8 animate-in fade-in duration-500">
                 <div className="relative">
                    <div className="w-24 h-24 rounded-full border-[6px] border-primary/10 border-t-primary animate-spin" />
                    <Image src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" width={40} height={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                 </div>
                 <div>
                    <h4 className="text-2xl font-black text-dark-light mb-2 italic">Awaiting <span className="text-primary not-italic">Confirmation</span></h4>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest animate-pulse">Communicating with Razorpay servers...</p>
                 </div>
              </div>
           )}

           {paymentStatus === "success" && (
              <div className="animate-in fade-in zoom-in-95 duration-700 text-left">
                 <div className="flex flex-col items-center text-center mb-10">
                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/10 mb-6 scale-animation">
                       <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h3 className="text-3xl font-black text-dark-light tracking-tight italic mb-2">Payment <span className="text-emerald-500 not-italic">Successful</span></h3>
                    <p className="text-sm font-bold text-text-muted">Your subscription has been updated via Razorpay Secure.</p>
                 </div>

                 <div className="bg-surface rounded-4xl p-8 border border-border-dark/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                       <Receipt className="w-12 h-12 text-dark/5" />
                    </div>
                    
                    <div className="space-y-6 relative z-10">
                       <div className="flex justify-between items-start pb-6 border-b border-border-dark/10">
                          <div>
                             <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Receipt Number</p>
                             <p className="text-sm font-black text-dark-light font-mono italic tracking-widest">{transactionId}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Payment Date</p>
                             <p className="text-sm font-black text-dark-light font-inter">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="flex justify-between items-center text-sm font-bold">
                             <span className="text-text-muted font-inter">Subscription Plan:</span>
                             <span className="text-dark-light font-black uppercase tracking-wide">{selectedPlan?.name} Partner</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-bold">
                             <span className="text-text-muted font-inter">Gateway Method:</span>
                             <span className="text-dark-light font-black">Razorpay Secure</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-bold pb-4 border-b border-border-dark/10">
                             <span className="text-text-muted font-inter">Transaction Status:</span>
                             <span className="text-emerald-500 font-black uppercase tracking-widest italic">Confirmed</span>
                          </div>
                       </div>

                       <div className="flex justify-between items-center pt-2">
                          <span className="text-lg font-black text-dark-light uppercase tracking-widest">Total Amount Paid</span>
                          <span className="text-3xl font-black text-primary tracking-tighter">{selectedPlan?.price}</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mt-10">
                    <button 
                       onClick={() => handleDownloadInvoice(transactionId)}
                       className="py-4 rounded-2xl bg-surface border border-border-dark text-text-muted font-black text-[10px] uppercase tracking-widest hover:bg-border-dark/20 transition-all flex items-center justify-center gap-2"
                    >
                       <Printer className="w-4 h-4" /> Download PDF
                    </button>
                    <button 
                       onClick={() => setIsPaymentModalOpen(false)}
                       className="py-4 rounded-2xl bg-dark text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-dark/10"
                    >
                       Dashboard <ChevronRight className="w-4 h-4" />
                    </button>
                 </div>
              </div>
           )}
        </div>
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

      <style jsx global>{`
        @keyframes scale-animation {
          0% { transform: scale(0.9); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .scale-animation {
          animation: scale-animation 0.5s ease-out forwards;
        }
        .font-inter { font-family: var(--font-inter, sans-serif); }
      `}</style>
    </div>
  );
}
