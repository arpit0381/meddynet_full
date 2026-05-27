"use client";
import { useState } from "react";
import { User, Mail, Phone, Lock, Camera, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@meddynet.com",
    phone: "+91 9876543210",
    role: "Super Administrator"
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border-dim pb-8">
        <div>
          <h1 className="text-2xl font-black text-main-text tracking-tight uppercase italic">Identity Management</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1.5 opacity-80">Authenticate & Configure Administrative Entity Parameters</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2.5 px-8 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95">
          {isSaving ? "Synchronizing..." : "Commit Entity Update"}
        </button>
      </div>

      {showToast && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-6 py-4 rounded-[2rem] flex items-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-500/5 animate-in slide-in-from-top-2 duration-300">
          <CheckCircle2 size={18}/> Protocol update synchronization complete.
        </div>
      )}

      <div className="bg-card rounded-[2.5rem] border border-border-dim shadow-sm overflow-hidden flex flex-col md:flex-row transition-all hover:border-primary/20">
        <div className="p-10 md:w-1/3 border-b md:border-b-0 md:border-r border-border-dim flex flex-col items-center justify-center text-center bg-surface/30">
          <div className="relative group cursor-pointer mb-8">
            <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-primary to-blue-600 p-1 shadow-2xl transition-transform group-hover:scale-105 duration-500">
              <div className="w-full h-full rounded-[2.8rem] bg-card flex items-center justify-center text-primary text-5xl font-black italic tracking-tighter border-4 border-card">
                {profile.name.charAt(0)}
              </div>
            </div>
            <div className="absolute inset-0 bg-primary/20 rounded-[3rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm border-2 border-primary/50">
              <Camera className="text-white scale-125" size={28}/>
            </div>
          </div>
          <h2 className="text-xl font-black text-main-text uppercase tracking-tight italic">{profile.name}</h2>
          <span className="mt-4 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 text-[9px] font-black uppercase rounded-xl tracking-widest shadow-sm">{profile.role}</span>
        </div>

        <div className="p-10 md:w-2/3 space-y-8 bg-card/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2 opacity-60"><User size={14} className="text-primary"/> ENTITY DESIGNATION</label>
              <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full p-4 bg-input border border-border-dim rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 text-main-text font-bold text-sm transition-all shadow-inner" placeholder="ADMIN USER" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2 opacity-60"><Mail size={14} className="text-primary"/> DIGITAL CORRESPONDENCE</label>
              <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full p-4 bg-input border border-border-dim rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 text-main-text font-bold text-sm transition-all shadow-inner" placeholder="ADMIN@MEDDYNET.COM" />
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2 opacity-60"><Phone size={14} className="text-primary"/> TELEMETRY CHANNEL</label>
              <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full p-4 bg-input border border-border-dim rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 text-main-text font-bold text-sm transition-all shadow-inner" placeholder="+91 9876543210" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-[2.5rem] border border-border-dim shadow-sm overflow-hidden p-10 space-y-10 transition-all hover:border-primary/20">
        <div className="border-b border-border-dim pb-6">
          <h3 className="text-lg font-black text-main-text flex items-center gap-3 uppercase tracking-tight italic"><Lock size={20} className="text-primary opacity-80"/> Cryptographic Security Reset</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-2 opacity-60">Cycle administrative access credentials</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest opacity-60">Current Access Key</label>
            <input type="password" placeholder="••••••••" className="w-full p-4 bg-input border border-border-dim rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 text-main-text text-sm transition-all shadow-inner" />
          </div>
          <div></div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest opacity-60">New Access Matrix</label>
            <input type="password" placeholder="••••••••" className="w-full p-4 bg-input border border-border-dim rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 text-main-text text-sm transition-all shadow-inner" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest opacity-60">Validate Key Sequence</label>
            <input type="password" placeholder="••••••••" className="w-full p-4 bg-input border border-border-dim rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 text-main-text text-sm transition-all shadow-inner" />
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <button className="px-8 py-3 bg-surface border border-border-dim text-muted font-black text-[10px] uppercase tracking-widest rounded-2xl hover:text-main-text hover:border-primary/30 transition-all shadow-sm active:scale-95">Update Authorization Logic</button>
        </div>
      </div>
    </div>
  );
}
