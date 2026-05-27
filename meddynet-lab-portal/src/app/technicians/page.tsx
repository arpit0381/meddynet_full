"use client";

import { validateFullName, validatePhone } from "@/utils/validation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  MapPin, 
  Phone, 
  Star, 
  Plus, 
  Search, 
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import { useLabTechnicians, useAddTechnician, useToggleTechStatus } from "@/lib/hooks";
import { Loader2 } from "lucide-react";

export default function TechnicianManagementPage() {
  const { data: techniciansArray, isLoading } = useLabTechnicians();
  const addTechMutation = useAddTechnician();
  const toggleStatusMutation = useToggleTechStatus();

  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<{message: string, type: "success" | "error"} | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [newTech, setNewTech] = useState({ 
    name: "", 
    phone: "", 
    email: "",
    idNumber: "",
    vehicle: "",
    shift: "morning"
  });

  const techs = useMemo(() => {
    if (!techniciansArray) return [];
    return techniciansArray.map((t: any) => ({
      id: t.id.slice(0, 8),
      name: t.name,
      status: t.status === "on_duty" ? "On Duty" : t.status === "off_duty" ? "Idle" : "On Break",
      location: "Active Fleet",
      rating: 4.9, // In production this would be calculated from booking ratings
      collections: t.total_bookings || 0, // In production this would be tracked from bookings
      vehicle: t.vehicle || "Not Assigned",
      phone: t.phone || "",
      shift: t.shift,
      rawId: t.id,
      isActiveStatus: t.status === "on_duty"
    }));
  }, [techniciansArray]);

  const filteredTechs = useMemo(() => {
    return techs.filter((t: any) => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [techs, searchTerm]);

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatusMutation.mutateAsync(id);
      setToast({ message: "Technician status toggled successfully", type: "success" });
    } catch {
      setToast({ message: "Failed to update technician status", type: "error" });
    }
  };

  const handleAddTech = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTech.name || newTech.phone.length !== 10) {
      setToast({ message: "Please enter a valid 10-digit phone number", type: "error" });
      return;
    }
    
    try {
      await addTechMutation.mutateAsync({
        name: newTech.name,
        phone: newTech.phone,
        email: newTech.email,
        vehicle: newTech.vehicle,
        shift: newTech.shift
      });
      setToast({ message: `${newTech.name} successfully onboarded!`, type: "success" });
      setIsAddModalOpen(false);
      setNewTech({ name: "", phone: "", email: "", idNumber: "", vehicle: "", shift: "morning" });
    } catch {
      setToast({ message: "Onboarding failed. Phone number might be duplicated.", type: "error" });
    }
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-black text-text-muted uppercase tracking-widest animate-pulse">Syncing Active Fleet...</p>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-dark-light tracking-tight mb-2">Technician Management</h1>
          <p className="text-text-muted font-bold">Monitor your active phlebotomy fleet and manage shifts.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary text-white font-black text-sm shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all"
        >
          <Plus className="w-5 h-5" /> Onboard Phlebotomist
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
         {[
           { label: "Total Fleet", value: techs.length.toString(), icon: Users, color: "bg-blue-600" },
           { label: "Active Now", value: techs.filter((t: any) => t.isActiveStatus).length.toString(), icon: Zap, color: "bg-amber-500" },
           { label: "Avg Rating", value: "4.9", icon: Star, color: "bg-emerald-500" },
           { label: "Collections", value: techs.reduce((acc: number, t: any) => acc + (t.collections || 0), 0).toString(), icon: ShieldCheck, color: "bg-indigo-600" },
         ].map((stat) => (
           <div key={stat.label} className="bg-white rounded-5xl p-6 border border-border-dark/20 shadow-xl shadow-black/2 flex items-center gap-4 text-left">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                 <stat.icon className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                 <p className="text-lg font-black text-dark-light">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

      {/* Search & Fleet List */}
      <div className="bg-white rounded-[3rem] p-8 border border-border-dark/20 shadow-2xl overflow-hidden min-h-[400px]">
         <div className="flex items-center justify-between mb-8 gap-6">
            <div className="relative group flex-1 max-w-md">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search by name or ID..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-surface border-2 border-border-dark rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm" 
               />
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
               {filteredTechs.map((tech: any) => (
                <motion.div
                  key={tech.rawId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group p-6 rounded-5xl border border-border-dark/20 bg-surface/30 hover:bg-white hover:shadow-2xl hover:border-primary/20 transition-all text-left"
                >
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                            {tech.name.split(' ').map((n: string)=>n[0]).join('')}
                         </div>
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <span className="text-[10px] font-black text-primary uppercase tracking-widest">{tech.id}</span>
                               <div className={`w-2 h-2 rounded-full ${
                                 tech.isActiveStatus ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                               }`} />
                               <span className="text-[10px] font-black text-dark-light uppercase tracking-widest">{tech.status}</span>
                            </div>
                            <h3 className="text-lg font-black text-dark-light tracking-tight">{tech.name}</h3>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="flex items-center gap-1.5 justify-end mb-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-sm font-black text-dark-light">{tech.rating}</span>
                         </div>
                         <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{tech.collections} Done</p>
                      </div>
                   </div>

                   <div className="space-y-3 pt-4 border-t border-border-dark/10">
                      <div className="flex items-center gap-3 text-xs font-bold text-text-muted">
                         <MapPin className="w-3.5 h-3.5 text-primary" />
                         <span className="truncate">{tech.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-text-muted">
                         <Phone className="w-3.5 h-3.5 text-primary" />
                         {tech.vehicle}
                      </div>
                   </div>

                   <div className="mt-8 flex items-stretch gap-3">
                      <button 
                        onClick={() => handleToggleStatus(tech.rawId)}
                        className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 ${
                          tech.isActiveStatus 
                          ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600' 
                          : 'bg-dark text-white shadow-dark/20 hover:bg-dark-light'
                        }`}
                      >
                        {tech.isActiveStatus ? (
                          <span className="flex items-center justify-center gap-2">
                             <CheckCircle2 className="w-4 h-4" /> Go Offline
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                             <Zap className="w-4 h-4" /> Go Online
                          </span>
                        )}
                      </button>
                      <Link 
                        href={`/technicians/${tech.rawId}`}
                        className="aspect-square px-4 flex items-center justify-center rounded-2xl bg-white border border-border-dark text-text-muted hover:text-primary transition-all shadow-sm"
                      >
                         <ChevronRight className="w-4 h-4" />
                      </Link>
                   </div>
                </motion.div>
               ))}
               {filteredTechs.length === 0 && (
                <div className="col-span-1 md:col-span-2 py-20 text-center">
                   <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-text-muted opacity-20" />
                   </div>
                   <p className="text-text-muted font-bold">No phlebotomists found in current fleet.</p>
                </div>
               )}
            </AnimatePresence>
         </div>
      </div>

      {/* Onboard Technician Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard Fleet Member"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAddTech} className="p-8 space-y-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-5">
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2 text-left block">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={newTech.name}
                      onChange={e => setNewTech({...newTech, name: validateFullName(e.target.value)})}
                      placeholder="Rahul Singh" 
                      className="w-full bg-surface border-2 border-border-dark rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-primary transition-all"
                    />
                 </div>
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2 text-left block">Mobile Number</label>
                    <input 
                      type="tel" 
                      required
                      value={newTech.phone}
                      onChange={e => setNewTech({...newTech, phone: validatePhone(e.target.value)})}
                      placeholder="10-digit mobile" 
                      className="w-full bg-surface border-2 border-border-dark rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-primary transition-all"
                    />
                 </div>
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2 text-left block">Email (Optional)</label>
                    <input 
                      type="email" 
                      value={newTech.email}
                      onChange={e => setNewTech({...newTech, email: e.target.value})}
                      placeholder="rahul@meddynet.com" 
                      className="w-full bg-surface border-2 border-border-dark rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-primary transition-all"
                    />
                 </div>
              </div>

              <div className="space-y-5">
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2 text-left block">Vehicle Plate No.</label>
                    <input 
                      type="text" 
                      required
                      value={newTech.vehicle}
                      onChange={e => setNewTech({...newTech, vehicle: e.target.value})}
                      placeholder="DL 01 AA 1111" 
                      className="w-full bg-surface border-2 border-border-dark rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-primary transition-all"
                    />
                 </div>
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2 text-left block">Shift Duty</label>
                    <select 
                      value={newTech.shift}
                      onChange={e => setNewTech({...newTech, shift: e.target.value})}
                      className="w-full bg-surface border-2 border-border-dark rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-primary appearance-none transition-all"
                    >
                       <option value="morning">Morning (8 AM - 2 PM)</option>
                       <option value="evening">Evening (2 PM - 8 PM)</option>
                       <option value="full_day">Full Day (8 AM - 8 PM)</option>
                    </select>
                 </div>
                 <div className="pt-2">
                     <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">Technician will be onboarded with a default password. They must reset it upon first login.</p>
                     </div>
                 </div>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border-dark/10">
              <button 
                type="submit"
                className="flex-1 py-5 rounded-full bg-primary text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                 Confirm Onboarding
              </button>
           </div>
        </form>
      </Modal>

      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
