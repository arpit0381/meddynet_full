"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Camera, 
  Save, 
  Clock3,
  Globe,
  Plus,
  Trash2,
  Phone,
  Loader2,
  Lock,
  FileText,
  Microscope,
  User as LucideUser
} from "lucide-react";
import { useState, useEffect } from "react";
import Toast from "@/components/ui/Toast";
import { useLabProfile, useUpdateLabProfile } from "@/lib/hooks";
import { useAuthStore } from "@/store/authStore";

export default function LabProfileEditPage() {
  const [toast, setToast] = useState<{message: string, type: "success" | "error"} | null>(null);
  const { data: profile, isLoading } = useLabProfile();
  const updateProfileMutation = useUpdateLabProfile();
  const user = useAuthStore(state => state.user);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    website: "",
    state: "",
    pincode: "",
    registration_number: "",
    lab_category: "",
    pathologist_name: "",
    pathologist_reg_no: "",
    city: "",
    branches: "1"
  });

  const [accreditations, setAccreditations] = useState<string[]>([]);
  const [newAccreditation, setNewAccreditation] = useState("");

  const [operatingHours, setOperatingHours] = useState<{day: string, time: string}[]>([]);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [newFacility, setNewFacility] = useState("");

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        website: profile.website || "",
        state: profile.state || "",
        pincode: profile.pincode || "",
        registration_number: profile.registration_number || "",
        lab_category: profile.lab_category || "",
        pathologist_name: profile.pathologist_name || "",
        pathologist_reg_no: profile.pathologist_reg_no || "",
        city: profile.city || "",
        branches: profile.branches || "1"
      });
      setAccreditations(profile.accreditations || []);
      setFacilities(profile.facilities || []);
      setOperatingHours(profile.operating_hours || [
        { day: "Mon - Sat", time: "08:00 AM - 08:30 PM" },
        { day: "Sunday", time: "09:00 AM - 02:00 PM" }
      ]);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        ...formData,
        accreditations,
        facilities,
        operating_hours: operatingHours
      });
      setToast({ message: "Lab Profile updated 10000% successfully!", type: "success" });
    } catch {
      setToast({ message: "Failed to update profile", type: "error" });
    }
  };

  const removeFacility = (item: string) => {
    setFacilities(prev => prev.filter(f => f !== item));
  };

  const addFacility = () => {
    if (newFacility.trim() && !facilities.includes(newFacility.trim())) {
      setFacilities([...facilities, newFacility.trim()]);
      setNewFacility("");
    }
  };

  const updateTiming = (index: number, newTime: string) => {
    setOperatingHours(prev => prev.map((item, i) => i === index ? { ...item, time: newTime } : item));
  };

  const addAccreditation = () => {
    if (newAccreditation.trim() && !accreditations.includes(newAccreditation.trim())) {
      setAccreditations([...accreditations, newAccreditation.trim()]);
      setNewAccreditation("");
    }
  };

  const removeAccreditation = (item: string) => {
    setAccreditations(prev => prev.filter(a => a !== item));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-black text-text-muted uppercase tracking-widest animate-pulse">Fetching Lab DNA...</p>
      </div>
    );
  }

  const initials = formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : "ND";

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-dark-light tracking-tight mb-2">Lab Profile Center</h1>
          <p className="text-text-muted font-bold text-sm sm:text-base">Configure your professional identity across the MeddyNet ecosystem.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={updateProfileMutation.isPending}
          className="flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-5 rounded-full bg-primary text-white font-black text-sm shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all group disabled:opacity-50"
        >
          {updateProfileMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
          )}
          Save Changes
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-10">
        {/* Profile Branding */}
        <div className="lg:col-span-1 space-y-6 sm:space-y-8 text-left">
           <div className="bg-white rounded-5xl p-6 sm:p-10 border border-border-dark/20 shadow-2xl text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative mb-8">
                 <div className="relative h-48 bg-linear-to-br from-primary to-primary-light flex items-center justify-center text-white font-black text-5xl rounded-3xl shadow-inner group-hover:scale-[1.02] transition-transform duration-500 overflow-hidden">
                    <span className="relative z-10">{initials}</span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
                 <button className="absolute -bottom-4 right-1/2 translate-x-12 p-3.5 rounded-2xl bg-dark text-white shadow-xl hover:scale-110 active:scale-95 transition-all">
                    <Camera className="w-4 h-4" />
                 </button>
              </div>
              <h3 className="text-xl font-black text-dark-light tracking-tight mb-1 truncate">{formData.name}</h3>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-6 font-inter underline">Lab ID: #{profile?.id?.slice(0, 8)}</p>
              <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                 <ShieldCheck className="w-4 h-4" /> Verified Partner
              </div>
           </div>

           <div className="bg-white rounded-5xl p-6 sm:p-10 border border-border-dark/20 shadow-2xl text-left">
              <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-6 border-b border-surface pb-4">Operating Pulse</h4>
              <div className="space-y-6">
                 {operatingHours.map((item, i) => (
                    <div key={i} className="flex flex-col gap-2">
                       <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{item.day}</span>
                       <div className="flex items-center gap-2 group/time">
                          <div className="relative flex-1">
                             <Clock3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                             <input 
                                type="text" 
                                value={item.time}
                                onChange={(e) => updateTiming(i, e.target.value)}
                                className="w-full bg-surface border-2 border-border-dark rounded-2xl pl-12 pr-4 py-3.5 text-[11px] font-black text-dark-light outline-none focus:border-primary transition-all shadow-sm"
                             />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Business Details Form */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8 text-left">
           <div className="bg-white rounded-5xl p-6 sm:p-10 shadow-2xl border border-border-dark/20">
              <h2 className="text-2xl font-black text-dark-light tracking-tight mb-10 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Building2 className="w-5 h-5" /></div>
                 Business Intelligence
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 text-left">
                 <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-3">Official Laboratory Name</label>
                    <div className="relative group">
                       <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                       <input 
                         type="text" 
                         value={formData.name}
                         onChange={e => setFormData({...formData, name: e.target.value})}
                         className="w-full bg-surface border-2 border-border-dark rounded-3xl pl-14 pr-6 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm" 
                       />
                    </div>
                 </div>
                 <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-3">Direct Contact</label>
                    <div className="relative group">
                       <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                       <input 
                         type="text" 
                         value={formData.phone}
                         onChange={e => setFormData({...formData, phone: e.target.value})}
                         className="w-full bg-surface border-2 border-border-dark rounded-3xl pl-14 pr-6 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm" 
                       />
                    </div>
                    <div className="mt-4">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">LAB ID: #{profile?.id?.slice(0, 8)}</p>
                    </div>
                 </div>
                 <div className="col-span-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-3">On-Ground HQ Address</label>
                    <div className="relative group">
                       <MapPin className="absolute left-6 top-6 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                       <textarea 
                         value={formData.address}
                         onChange={e => setFormData({...formData, address: e.target.value})}
                         className="w-full bg-surface border-2 border-border-dark rounded-3xl pl-14 pr-6 py-5 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm h-36 resize-none" 
                       />
                    </div>
                 </div>
                  <div className="col-span-2 sm:col-span-1">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-3">City</label>
                     <div className="relative group">
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input 
                          type="text" 
                          value={formData.city}
                          onChange={e => setFormData({...formData, city: e.target.value})}
                          placeholder="Mumbai" 
                          className="w-full bg-surface border-2 border-border-dark rounded-3xl pl-14 pr-6 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm" 
                        />
                     </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-3">State</label>
                     <div className="relative group">
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input 
                          type="text" 
                          value={formData.state}
                          onChange={e => setFormData({...formData, state: e.target.value})}
                          placeholder="Maharashtra" 
                          className="w-full bg-surface border-2 border-border-dark rounded-3xl pl-14 pr-6 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm" 
                        />
                     </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-3">Pincode</label>
                     <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input 
                          type="text" 
                          value={formData.pincode}
                          onChange={e => setFormData({...formData, pincode: e.target.value})}
                          placeholder="400001" 
                          className="w-full bg-surface border-2 border-border-dark rounded-3xl pl-14 pr-6 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm" 
                        />
                     </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-3">Registration Number</label>
                     <div className="relative group">
                        <FileText className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input 
                          type="text" 
                          value={formData.registration_number}
                          onChange={e => setFormData({...formData, registration_number: e.target.value})}
                          className="w-full bg-surface border-2 border-border-dark rounded-3xl pl-14 pr-6 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm" 
                        />
                     </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-3">Lab Category</label>
                     <div className="relative group">
                        <Microscope className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input 
                          type="text" 
                          value={formData.lab_category}
                          onChange={e => setFormData({...formData, lab_category: e.target.value})}
                          className="w-full bg-surface border-2 border-border-dark rounded-3xl pl-14 pr-6 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm" 
                        />
                     </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-3">Network Size (Branches)</label>
                     <div className="relative group">
                        <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <select 
                          value={formData.branches}
                          onChange={e => setFormData({...formData, branches: e.target.value})}
                          className="w-full bg-surface border-2 border-border-dark rounded-3xl pl-14 pr-6 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm appearance-none cursor-pointer"
                        >
                           <option value="1">1 (Single Center)</option>
                           <option value="2-5">2 to 5 Branches</option>
                           <option value="6-10">6 to 10 Branches</option>
                           <option value="10+">More than 10</option>
                        </select>
                     </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-3">Chief Pathologist</label>
                     <div className="relative group">
                        <LucideUser className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input 
                          type="text" 
                          value={formData.pathologist_name}
                          onChange={e => setFormData({...formData, pathologist_name: e.target.value})}
                          className="w-full bg-surface border-2 border-border-dark rounded-3xl pl-14 pr-6 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm" 
                        />
                     </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-3">Pathologist Reg. No</label>
                     <div className="relative group">
                        <FileText className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input 
                          type="text" 
                          value={formData.pathologist_reg_no}
                          onChange={e => setFormData({...formData, pathologist_reg_no: e.target.value})}
                          placeholder="MCI-123456"
                          className="w-full bg-surface border-2 border-border-dark rounded-3xl pl-14 pr-6 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm" 
                        />
                     </div>
                  </div>
                 <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-3">Web Gateway (Optional)</label>
                    <div className="relative group">
                       <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                       <input 
                         type="text" 
                         value={formData.website}
                         onChange={e => setFormData({...formData, website: e.target.value})}
                         placeholder="https://www.yourlab.com" 
                         className="w-full bg-surface border-2 border-border-dark rounded-3xl pl-14 pr-6 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm" 
                       />
                    </div>
                 </div>
                  <div className="col-span-2 sm:col-span-1">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-3">Industry Credentials</label>
                     <div className="flex items-center gap-3 mb-5">
                        <input 
                          type="text" 
                          value={newAccreditation}
                          onChange={e => setNewAccreditation(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addAccreditation()}
                          placeholder="e.g. NABL, CAP..." 
                          className="flex-1 bg-surface border-2 border-border-dark rounded-2xl px-6 py-3.5 text-xs font-bold outline-none focus:border-primary transition-all shadow-sm"
                        />
                        <button onClick={addAccreditation} className="p-3.5 rounded-2xl bg-dark text-white hover:bg-primary transition-all shadow-lg active:scale-95 shrink-0">
                           <Plus className="w-4 h-4" />
                        </button>
                     </div>
                     <div className="flex flex-wrap gap-2.5">
                        {accreditations.map(acc => (
                           <div key={acc} className="px-4 py-2 rounded-2xl bg-primary/5 border border-primary/20 text-[10px] font-black text-primary uppercase flex items-center gap-2.5 group/chip hover:bg-primary/10 transition-all">
                              {acc}
                              <button onClick={() => removeAccreditation(acc)} className="text-primary/40 hover:text-red-500 transition-colors">
                                 <Trash2 className="w-3.5 h-3.5" />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
              </div>
           </div>

           <div className="bg-white rounded-5xl p-6 sm:p-10 shadow-2xl border border-border-dark/20 overflow-hidden text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                 <h2 className="text-2xl font-black text-dark-light tracking-tight">Active Pulse & Facilities</h2>
                 <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-60">
                       <input 
                         type="text" 
                         placeholder="New amenity..." 
                         value={newFacility}
                         onChange={e => setNewFacility(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && addFacility()}
                         className="w-full bg-surface border-2 border-border-dark rounded-2xl px-6 py-3.5 text-xs font-bold outline-none focus:border-primary transition-all shadow-sm"
                       />
                    </div>
                    <button 
                      onClick={addFacility}
                      className="p-4 rounded-2xl bg-primary text-white hover:shadow-2xl shadow-primary/30 transition-all active:scale-95 shrink-0"
                    >
                       <Plus className="w-4 h-4" />
                    </button>
                 </div>
              </div>
              <div className="flex flex-wrap gap-4">
                 <AnimatePresence mode="popLayout">
                   {facilities.map((facility) => (
                     <motion.div 
                       key={facility} 
                       layout
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.9 }}
                       className="px-6 py-4 rounded-3xl bg-surface border-2 border-border-dark font-black text-xs text-dark-light flex items-center gap-4 group hover:border-primary transition-all cursor-default shadow-sm hover:shadow-md"
                     >
                        {facility}
                        <button 
                          onClick={() => removeFacility(facility)}
                          className="text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </motion.div>
                   ))}
                 </AnimatePresence>
                 {facilities.length === 0 && <p className="text-xs font-bold text-text-muted italic px-4">No active facilities cataloged.</p>}
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
