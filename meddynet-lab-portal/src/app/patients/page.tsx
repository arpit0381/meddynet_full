"use client";

import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  Calendar, 
  Phone, 
  Mail,
  ArrowUpRight,
  ClipboardList,
  ShieldCheck,
  Lock,
  EyeOff,
  Loader2
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLabBookings } from "@/lib/hooks";

export default function PatientsListingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: bookings = [], isLoading } = useLabBookings();

  const patients = useMemo(() => {
    const pMap = new Map();
    
    bookings.forEach((b: any) => {
      const pid = b.user_id || `GUEST-${b.patient_name}`;
      if (!pMap.has(pid)) {
        pMap.set(pid, {
          id: pid.slice(0, 8),
          rawId: pid,
          name: b.patient_name || "Unknown Patient",
          age: b.patient_age || "N/A",
          gender: b.patient_gender || "N/A",
          phone: b.patient_phone || "Hidden",
          email: "Hidden",
          lastVisit: new Date(b.scheduled_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          bookings: 1,
          status: 'Active',
          isVerified: !!b.user_id 
        });
      } else {
        const existing = pMap.get(pid);
        existing.bookings += 1;
        // Keep the latest date
        const d1 = new Date(b.scheduled_at);
        const d2 = new Date(existing.lastVisit);
        if (d1 > d2) {
          existing.lastVisit = d1.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }
      }
    });

    return Array.from(pMap.values());
  }, [bookings]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-4 mb-2">
             <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner group">
                <Users className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
             </div>
             <h1 className="text-4xl font-black text-dark-light tracking-tight italic">Lab <span className="text-primary not-italic">Patients</span></h1>
          </div>
          <p className="text-sm font-bold text-text-muted max-w-xl leading-relaxed">
             Manage and track all patients who have booked tests with your laboratory. View their history and status.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-80 group">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
             <input
               type="text"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search by name or PID..."
               className="w-full pl-12 pr-6 py-4 rounded-4xl bg-surface border-2 border-transparent focus:border-primary/20 focus:bg-white text-sm font-bold text-dark-light shadow-inner transition-all outline-none"
             />
          </div>
          <button className="flex items-center justify-center gap-3 px-8 py-4 rounded-4xl bg-white border-2 border-border-dark/30 text-text-muted hover:border-primary/20 hover:text-primary transition-all font-black text-[11px] uppercase tracking-widest w-full sm:w-auto group">
             <Filter className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> Filter
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-6">
           <Loader2 className="w-12 h-12 text-primary animate-spin" />
           <p className="text-xs font-black text-text-muted uppercase tracking-widest animate-pulse">Retrieving Patient Directory...</p>
        </div>
      ) : (
        <>
          {/* Privacy Guard Banner */}
          <div className="bg-linear-to-r from-emerald-500/5 to-primary/5 border border-emerald-500/10 rounded-5xl p-6 px-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
             <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-left">
                   <h4 className="text-sm font-black text-dark-light uppercase tracking-tight">Privacy <span className="text-emerald-600">Locked Access</span></h4>
                   <p className="text-[11px] font-bold text-text-muted max-w-sm">Patient contact data only becomes visible to you once they complete a booking at your lab.</p>
                </div>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border-dark/30 text-[10px] font-black text-text-muted uppercase tracking-widest">
                <Lock className="w-3 h-3" /> Data Guard Active
             </div>
          </div>

          {/* Grid Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
             {filteredPatients.map((patient, index) => (
               <motion.div
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.1 }}
                 key={patient.rawId}
                 className="group relative bg-white border border-border-dark/30 rounded-[3.5rem] p-1 shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden"
               >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[6rem] -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-700" />
                  
                  <div className="relative p-8 px-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
                     <div className="shrink-0 relative">
                        <div className="w-24 h-24 rounded-5xl bg-surface flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform duration-500 overflow-hidden border border-border-dark/10">
                           <div className="w-full h-full bg-linear-to-br from-primary/20 to-indigo-600/20 flex items-center justify-center text-primary text-3xl font-black">
                             {patient.name.charAt(0)}
                           </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white border border-border-dark/20 flex items-center justify-center shadow-lg">
                           <div className={`w-3 h-3 rounded-full ${patient.status === 'Active' ? 'bg-emerald-500' : 'bg-text-muted'} shadow-[0_0_10px] ${patient.status === 'Active' ? 'shadow-emerald-500/50' : 'shadow-text-muted/50'}`} />
                        </div>
                     </div>

                     <div className="flex-1 space-y-6 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                           <div className="space-y-2">
                              <h3 className="text-2xl font-black text-dark-light tracking-tight flex items-center gap-3">
                                 {patient.name}
                                 {!patient.isVerified && <EyeOff className="w-4 h-4 text-amber-500" />}
                              </h3>
                              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                 <span className="px-3 py-1 rounded-full bg-surface text-[10px] font-black text-text-muted uppercase tracking-widest">{patient.id}</span>
                                 <span className="px-3 py-1 rounded-full bg-surface text-[10px] font-black text-text-muted uppercase tracking-widest">{patient.age} • {patient.gender}</span>
                                 {!patient.isVerified && (
                                    <span className="px-3 py-1 rounded-full bg-amber-50 text-[9px] font-black text-amber-600 uppercase tracking-widest border border-amber-100 flex items-center gap-1.5">
                                       <Lock className="w-2.5 h-2.5" /> Pending Booking
                                    </span>
                                 )}
                              </div>
                           </div>
                           <Link 
                             href={patient.isVerified ? `/bookings?patient=${patient.name}` : '#'}
                             onClick={(e) => !patient.isVerified && e.preventDefault()}
                             className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-opacity ${patient.isVerified ? 'text-primary hover:opacity-70' : 'text-text-muted cursor-not-allowed'}`}
                           >
                             {patient.isVerified ? 'Full History' : 'History Locked'} <ArrowUpRight className="w-3.5 h-3.5" />
                           </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pb-2">
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Last Visit</p>
                              <p className="text-xs font-bold text-dark-light flex items-center justify-center sm:justify-start gap-2">
                                 <Calendar className="w-3.5 h-3.5 text-text-muted" /> {patient.lastVisit}
                              </p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Bookings</p>
                              <p className="text-xs font-bold text-dark-light flex items-center justify-center sm:justify-start gap-2">
                                 <ClipboardList className="w-3.5 h-3.5 text-text-muted" /> {patient.bookings} Total
                              </p>
                           </div>
                        </div>

                        <div className="pt-6 border-t border-border-dark/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                           <div className="flex items-center gap-3">
                              <button 
                                disabled={!patient.isVerified}
                                className={`w-10 h-10 rounded-2xl bg-surface flex items-center justify-center text-text-muted transition-all shadow-inner ${patient.isVerified ? 'hover:text-primary' : 'opacity-30 cursor-not-allowed'}`}
                              >
                                 <Phone className="w-4 h-4" />
                              </button>
                              <button 
                                disabled={!patient.isVerified}
                                className={`w-10 h-10 rounded-2xl bg-surface flex items-center justify-center text-text-muted transition-all shadow-inner ${patient.isVerified ? 'hover:text-primary' : 'opacity-30 cursor-not-allowed'}`}
                              >
                                 <Mail className="w-4 h-4" />
                              </button>
                           </div>
                           <Link 
                             href={patient.isVerified ? `/reports` : '#'}
                             onClick={(e) => !patient.isVerified && e.preventDefault()}
                             className={`px-8 py-3.5 rounded-[1.75rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl ${
                               patient.isVerified 
                               ? 'bg-dark text-white hover:bg-dark-light shadow-dark/20' 
                               : 'bg-surface text-text-muted cursor-not-allowed shadow-none border border-border-dark/20'
                             }`}
                           >
                              {patient.isVerified ? 'View Reports' : 'Reports Locked'} <ChevronRight className="w-3.5 h-3.5" />
                           </Link>
                        </div>
                     </div>
                  </div>
               </motion.div>
             ))}
          </div>

          {filteredPatients.length === 0 && (
            <div className="py-32 text-center bg-surface/30 rounded-[4rem] border-2 border-dashed border-border-dark/30">
              <div className="w-20 h-20 bg-white border border-border-dark/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl text-text-muted/20">
                 <Search className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-dark mb-1">No patients found</h3>
              <p className="text-sm font-bold text-text-muted">No result matches &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </>
      )}

      {/* Footer Info */}
      <div className="bg-dark rounded-[3.5rem] p-10 py-12 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-20 translate-x-20" />
         <div className="relative space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black italic">Patient <span className="text-primary not-italic">Privacy Center</span></h3>
            <p className="text-xs font-bold text-white/50 max-w-sm">
               All patient data is encrypted and HIPAA compliant. Access is logged and monitored for security.
            </p>
         </div>
         <button className="relative px-10 py-4 rounded-full bg-white text-dark font-black text-xs uppercase tracking-widest hover:bg-surface hover:-translate-y-1 transition-all shadow-2xl">
            Download Security Audit
         </button>
      </div>
    </div>
  );
}
