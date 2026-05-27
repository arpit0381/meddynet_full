"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Star, 
  Clock, 
  ShieldCheck, 
  TrendingUp,
  Settings,
  Edit3,
  CheckCircle2,
  Trash2,
  Bike,
  Navigation2,
  FileText,
  Download,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Toast from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import { useParams } from "next/navigation";

export default function TechnicianProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [isSaving, setIsSaving] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isLiveMapOpen, setIsLiveMapOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: "success" | "error"} | null>(null);
  
  const [tech, setTech] = useState({
    id: id || "T-501",
    name: "Ramesh Kumar",
    phone: "+91 98765 43210",
    vehicle: "Honda Activa (DL-3S-BK-1022)",
    status: "On Duty",
    rating: 4.8,
    collections: 154,
    joinDate: "Jan 12, 2023",
    zone: "Vasant Kunj & Saket",
    email: "ramesh.k@meddynet.lab",
    idNumber: "4500 1234 5678",
    shift: "Full Day"
  });

  const stats = [
    { label: "Total Collections", value: tech.collections, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "On-Time Rate", value: "98.2%", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Avg Rating", value: tech.rating, icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" }
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setToast({ message: "Phlebotomist profile updated!", type: "success" });
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Navigation */}
      <Link 
        href="/technicians"
        className="inline-flex items-center gap-2 text-sm font-black text-text-muted hover:text-primary transition-colors group"
      >
        <div className="p-2.5 rounded-xl bg-white border border-border-dark group-hover:border-primary shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Back to Fleet
      </Link>

      {/* Profile Header Card */}
      <div className="bg-white rounded-[3rem] p-8 sm:p-12 border border-border-dark/20 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-20 -mt-20" />
         
         <div className="flex flex-col lg:flex-row gap-10 relative z-10">
            <div className="shrink-0">
               <div className="relative group">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-5xl bg-linear-to-br from-primary to-primary-light flex items-center justify-center text-white text-5xl font-black shadow-2xl group-hover:scale-[1.02] transition-transform duration-500">
                     {tech.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg ${
                    tech.status === 'On Duty' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}>
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  </div>
               </div>
            </div>

            <div className="flex-1 space-y-6">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                     <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="text-xs font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-lg"># {tech.id}</span>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg flex items-center gap-1.5">
                           <ShieldCheck className="w-3.5 h-3.5" /> Verified Tech
                        </span>
                     </div>
                     <h1 className="text-3xl sm:text-4xl font-black text-dark-light tracking-tight">{tech.name}</h1>
                  </div>
                  <div className="flex items-center gap-3">
                     <button 
                        onClick={() => setIsLiveMapOpen(true)}
                        className="flex-1 sm:flex-none px-8 py-4 rounded-full bg-dark text-white font-black text-xs hover:bg-dark-light hover:-translate-y-1 transition-all shadow-xl shadow-dark/20 flex items-center justify-center gap-2 group"
                     >
                        <Navigation2 className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" /> Live Tracking
                     </button>
                     <button className="p-4 rounded-2xl bg-primary/5 border-2 border-primary/20 text-primary hover:bg-primary hover:text-white hover:-translate-y-1 transition-all shadow-xl shadow-primary/10 active:scale-95">
                        <Settings className="w-5 h-5" />
                     </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {stats.map(stat => (
                    <div key={stat.label} className="p-6 rounded-3xl bg-surface border border-border-dark/10 group hover:border-primary/20 transition-all shadow-sm">
                       <div className="flex items-center gap-3 mb-3">
                          <div className={`w-8 h-8 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                             <stat.icon className="w-4 h-4" />
                          </div>
                          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{stat.label}</p>
                       </div>
                       <p className="text-2xl font-black text-dark-light">{stat.value}</p>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
         {/* Edit Form */}
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3rem] p-8 sm:p-12 border border-border-dark/20 shadow-2xl">
               <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                     <Edit3 className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-dark-light tracking-tight">Edit Phlebotomist Profile</h2>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-2">Phone Number</label>
                     <div className="relative group">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input 
                           type="text" 
                           value={tech.phone}
                           onChange={e => setTech({...tech, phone: e.target.value})}
                           className="w-full bg-surface border-2 border-border-dark rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm" 
                        />
                     </div>
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-2">Email Identity</label>
                     <div className="relative group">
                        <FileText className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input 
                           type="email" 
                           value={tech.email}
                           onChange={e => setTech({...tech, email: e.target.value})}
                           className="w-full bg-surface border-2 border-border-dark rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm" 
                        />
                     </div>
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-2">Assigned Zone</label>
                     <div className="relative group">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input 
                           type="text" 
                           value={tech.zone}
                           onChange={e => setTech({...tech, zone: e.target.value})}
                           className="w-full bg-surface border-2 border-border-dark rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm" 
                        />
                     </div>
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-2">Shift Preference</label>
                     <select 
                       value={tech.shift}
                       onChange={e => setTech({...tech, shift: e.target.value})}
                       className="w-full bg-surface border-2 border-border-dark rounded-2xl px-5 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm appearance-none"
                     >
                        <option value="Morning">Morning (8 AM - 2 PM)</option>
                        <option value="Evening">Evening (2 PM - 8 PM)</option>
                        <option value="Full Day">Full Day (8 AM - 8 PM)</option>
                     </select>
                  </div>
                  <div className="sm:col-span-2">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-2">Vehicle Details</label>
                     <div className="relative group">
                        <Bike className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input 
                           type="text" 
                           value={tech.vehicle}
                           onChange={e => setTech({...tech, vehicle: e.target.value})}
                           className="w-full bg-surface border-2 border-border-dark rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm" 
                        />
                     </div>
                  </div>
               </div>

               <div className="mt-12 pt-10 border-t border-border-dark/10 flex flex-col sm:flex-row items-center gap-4">
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-10 py-4 rounded-3xl bg-primary text-white font-black text-sm shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
                  >
                     {isSaving ? (
                        <>
                           <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                           />
                           Saving...
                        </>
                     ) : (
                        <>
                           <CheckCircle2 className="w-5 h-5" /> Save Changes
                        </>
                     )}
                  </button>
                  <button className="w-full sm:w-auto px-10 py-4 rounded-3xl bg-red-50 text-red-500 font-black text-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2">
                     <Trash2 className="w-5 h-5" /> Deactivate
                  </button>
               </div>
            </div>

            {/* Documents Section */}
            <div className="bg-white rounded-[3rem] p-8 sm:p-12 border border-border-dark/20 shadow-2xl">
               <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="w-5 h-5" />
                     </div>
                     <h2 className="text-xl font-black text-dark-light tracking-tight">Documents & Compliance</h2>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">All Verified</span>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                     { name: "Aadhar Card", status: "Verified", date: "Jan 12, 2023" },
                     { name: "Driving License", status: "Verified", date: "Jan 15, 2023" },
                     { name: "NABL Certification", status: "Verified", date: "Feb 02, 2023" },
                     { name: "Police Verification", status: "Renew in 45 days", date: "Feb 10, 2023", warning: true }
                  ].map((doc) => (
                     <div key={doc.name} className="flex items-center justify-between p-5 rounded-2xl bg-surface border border-border-dark/10 hover:border-primary/20 transition-all group">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${doc.warning ? 'bg-amber-100 text-amber-600' : 'bg-primary/5 text-primary'}`}>
                              {doc.warning ? <AlertCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                           </div>
                           <div>
                              <p className="text-sm font-black text-dark-light">{doc.name}</p>
                              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{doc.date}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className={`text-[9px] font-black uppercase tracking-widest ${doc.warning ? 'text-amber-600' : 'text-emerald-500'}`}>{doc.status}</span>
                           <button className="p-2 rounded-lg hover:bg-primary/5 text-text-muted hover:text-primary transition-all opacity-0 group-hover:opacity-100">
                              <Download className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Recent Collections */}
            <div className="bg-white rounded-[3rem] p-8 sm:p-12 border border-border-dark/20 shadow-2xl">
               <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                     <TrendingUp className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-dark-light tracking-tight">Recent Collections</h2>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-border-dark/10">
                           <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest px-4 text-left">Booking ID</th>
                           <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest px-4 text-left">Customer</th>
                           <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest px-4 text-left hidden sm:table-cell">Location</th>
                           <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest px-4 text-left">Earnings</th>
                           <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest px-4 text-right">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-border-dark/5">
                        {[
                           { id: "BK-9022", name: "Sunita Verma", loc: "Saket, Block J", earn: "₹450", status: "Success" },
                           { id: "BK-8981", name: "Rajiv Gupta", loc: "Vasant Kunj, Sec 4", earn: "₹380", status: "Success" },
                           { id: "BK-8854", name: "Anita Rao", loc: "Vigyan Vihar", earn: "₹420", status: "Success" },
                        ].map((item) => (
                           <tr key={item.id} className="group hover:bg-surface/50 transition-colors">
                              <td className="py-5 px-4 text-sm font-black text-primary">{item.id}</td>
                              <td className="py-5 px-4">
                                 <p className="text-sm font-bold text-dark-light">{item.name}</p>
                              </td>
                              <td className="py-5 px-4 text-xs font-bold text-text-muted hidden sm:table-cell">{item.loc}</td>
                              <td className="py-5 px-4 text-sm font-black text-dark-light">{item.earn}</td>
                              <td className="py-5 px-4 text-right">
                                 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                    <CheckCircle2 className="w-3 h-3" /> {item.status}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Meta Actions Section */}
         <div className="space-y-8">
            <div className="bg-primary/5 rounded-[3rem] p-10 border-2 border-primary/20 relative overflow-hidden group shadow-xl">
               <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/10 blur-3xl rounded-full" />
               <div className="relative z-10">
                  <h3 className="text-xl font-black text-dark-light tracking-tight mb-4">Onboarding Info</h3>
                  <div className="space-y-6">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                           <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-text-muted uppercase">NABL Status</p>
                           <p className="text-sm font-bold text-dark-light">Certified Expert</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                           <Clock className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-text-muted uppercase">Member Since</p>
                           <p className="text-sm font-bold text-dark-light">{tech.joinDate}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-dark rounded-[3.5rem] p-10 shadow-2xl text-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
               <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-6 relative z-10">Incentive Tier</p>
               <h2 className="text-2xl font-black text-white mb-2 relative z-10 tracking-tight italic">Diamond Fleet</h2>
               <p className="text-xs font-bold text-primary mb-10 relative z-10">+₹50 Bonus per Home Sample</p>
               <button 
                 onClick={() => setIsPayoutModalOpen(true)}
                 className="w-full py-5 rounded-3xl bg-white text-dark font-black text-sm shadow-xl hover:-translate-y-1 transition-all relative z-10"
               >
                  View Payouts
               </button>
            </div>
         </div>
      </div>

      {/* Live Map Modal */}
      <Modal
        isOpen={isLiveMapOpen}
        onClose={() => setIsLiveMapOpen(false)}
        title="Live Fleet Tracking"
        maxWidth="max-w-4xl"
      >
         <div className="p-8 space-y-8">
            <div className="relative h-[400px] bg-slate-100 rounded-5xl overflow-hidden border border-border-dark/20 flex items-center justify-center group shadow-inner">
               <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,#3b82f6_1px,transparent_1px)] bg-size-[24px_24px]" />
               <motion.div 
                 animate={{ 
                    x: [0, 40, 20, 60, 0],
                    y: [0, -30, -50, -10, 0]
                 }}
                 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                 className="relative z-10 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/40"
               >
                  <Navigation2 className="w-6 h-6 rotate-45" />
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-dark text-white text-[8px] px-2 py-1 rounded-md whitespace-nowrap font-black uppercase">
                     {tech.id} • Moving
                  </div>
               </motion.div>
               <div className="absolute top-6 left-6 p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white shadow-lg z-20">
                  <p className="text-[10px] font-black text-text-muted uppercase mb-1">Current Speed</p>
                  <p className="text-xl font-black text-dark-light">32 km/h</p>
               </div>
               <div className="absolute top-6 right-6 p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white shadow-lg z-20">
                  <p className="text-[10px] font-black text-text-muted uppercase mb-1">Signal Status</p>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <p className="text-xs font-black text-dark-light">GPS: Excellent</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="p-6 rounded-3xl bg-surface border border-border-dark/10">
                  <p className="text-[10px] font-black text-text-muted uppercase mb-2">ETA to Next Hub</p>
                  <p className="text-xl font-black text-dark-light tracking-tight">14 Minutes <span className="text-xs text-text-muted ml-2 font-bold">(Vasant Kunj Lab)</span></p>
               </div>
               <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">Completed Today</p>
                  <p className="text-xl font-black text-dark-light tracking-tight">8 / 12 Collections</p>
               </div>
            </div>

            <button 
               onClick={() => setIsLiveMapOpen(false)}
               className="w-full py-4 rounded-3xl bg-dark text-white font-black text-sm shadow-xl hover:bg-dark-light transition-all"
            >
               Exit Live Tracking
            </button>
         </div>
      </Modal>

      {/* Payout Modal */}
      <Modal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        title="Payout History"
        maxWidth="max-w-2xl"
      >
         <div className="p-8">
            <div className="space-y-4">
               {[
                  { date: "Mar 15, 2024", amount: "₹8,450", status: "Paid", items: 42 },
                  { date: "Mar 08, 2024", amount: "₹7,600", status: "Paid", items: 38 },
                  { date: "Mar 01, 2024", amount: "₹9,100", status: "Processing", items: 45 },
                  { date: "Feb 22, 2024", amount: "₹6,800", status: "Paid", items: 34 },
               ].map((payout, i) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-surface border border-border-dark/10 hover:border-primary/20 transition-all">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${payout.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                           <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-sm font-black text-dark-light">{payout.date}</p>
                           <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{payout.items} Collections Managed</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-black text-dark-light tracking-tight">{payout.amount}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${payout.status === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>{payout.status}</p>
                     </div>
                  </div>
               ))}
            </div>
            <button 
               onClick={() => setIsPayoutModalOpen(false)}
               className="w-full mt-8 py-4 rounded-3xl bg-dark text-white font-black text-sm shadow-xl hover:bg-dark-light transition-all"
            >
               Close History
            </button>
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
    </div>
  );
}
