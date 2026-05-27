"use client";
import { useState } from "react";
import { Settings, ShieldCheck, ToggleLeft, Save, LogOut, Globe, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const [platformName, setPlatformName] = useState("MeddyNet");
  const [supportEmail, setSupportEmail] = useState("support@meddynet.com");
  
  const [flags, setFlags] = useState([
    { id: '1', name: "Home Collection Enabled", desc: "Allow users to book home collections platform-wide", active: true },
    { id: '2', name: "New User Registration", desc: "Allow new patient signups", active: true },
    { id: '3', name: "Maintenance Mode", desc: "Show maintenance banner and disable public site", active: false }
  ]);

  const [sessions, setSessions] = useState([
    { id: 's1', device: "MacBook Pro 14\"", location: "Mumbai, India", ip: "103.44.52.18", current: true, time: "Active now" },
    { id: 's2', device: "iPhone 15 Pro", location: "Bangalore, India", ip: "49.206.12.5", current: false, time: "2 hours ago" },
    { id: 's3', device: "iPad Air", location: "Delhi, India", ip: "106.51.22.10", current: false, time: "Yesterday" },
  ]);

  const [ipAllowlistActive, setIpAllowlistActive] = useState(true);
  const [allowedIps, setAllowedIps] = useState("103.44.52.18, 49.206.12.5");
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  const revokeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const logoutAll = () => {
    setSessions(prev => prev.filter(s => s.current));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-main-text italic uppercase tracking-tighter">System Configuration</h1>
          <p className="text-muted text-[10px] font-black uppercase tracking-widest mt-1.5 opacity-80">Global Overrides & Security Protocols</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
           <ShieldAlert size={14} className="text-amber-500" />
           <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-tight">Root Access Level</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border-dim rounded-3xl overflow-hidden shadow-sm transition-all">
            <div className="p-6 border-b border-border-dim bg-surface/50 flex items-center gap-3"><Settings size={18} className="text-muted"/><h2 className="text-sm font-black text-main-text uppercase tracking-widest">Metadata</h2></div>
            <div className="p-6 space-y-6">
              <div><label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-1.5 opacity-80">Platform Name</label><input type="text" value={platformName} onChange={(e) => setPlatformName(e.target.value)} className="w-full p-3.5 bg-input border border-border-dim rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-xs font-black text-main-text transition-all" /></div>
              <div><label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-1.5 opacity-80">Technical Support</label><input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="w-full p-3.5 bg-input border border-border-dim rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-xs font-black text-main-text transition-all" /></div>
            </div>
          </div>

          <div className="bg-card border border-border-dim rounded-3xl overflow-hidden shadow-sm transition-all">
            <div className="p-6 border-b border-border-dim bg-surface/50 flex items-center gap-3"><ToggleLeft size={18} className="text-muted"/><h2 className="text-sm font-black text-main-text uppercase tracking-widest">Logic Flags</h2></div>
            <div className="p-0">
              {flags.map((f) => (
                <div 
                  key={f.id} 
                  onClick={() => setFlags(flags.map(flag => flag.id === f.id ? {...flag, active: !flag.active} : flag))}
                  className="p-6 flex items-center justify-between border-b border-border-dim last:border-0 hover:bg-surface/50 transition-all cursor-pointer group"
                >
                  <div className="flex-1 pr-6"><p className="text-[11px] font-black text-main-text group-hover:text-primary transition-colors uppercase tracking-tight">{f.name}</p><p className="text-[9px] font-bold text-muted mt-1.5 leading-relaxed line-clamp-2 uppercase tracking-tighter opacity-60">{f.desc}</p></div>
                  <div className={`w-10 h-5 rounded-full relative transition-all shrink-0 ${f.active ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]' : 'bg-surface border border-border-dim'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${f.active ? 'left-6' : 'left-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border-dim rounded-3xl overflow-hidden shadow-sm px-8 py-10 transition-all">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3"><ShieldCheck size={20} className="text-primary"/><h2 className="text-sm font-black text-main-text uppercase tracking-widest">Security & Access Control</h2></div>
              {sessions.length > 1 && (
                <button onClick={logoutAll} className="flex items-center gap-2 text-[9px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all border border-red-500/20 active:scale-95"><LogOut size={12}/> Terminate All Sessions</button>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-black text-muted uppercase tracking-widest mb-5 flex items-center gap-2 opacity-60">Authorized Live Sessions <span className="bg-surface text-main-text/80 px-2 py-0.5 rounded-lg border border-border-dim">{sessions.length}</span></h3>
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {sessions.map((s) => (
                      <motion.div 
                        key={s.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        className="flex items-center justify-between p-5 bg-surface/30 rounded-2xl border border-border-dim group hover:bg-surface/50 transition-all"
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs transition-all border ${s.current ? 'bg-primary text-white border-primary shadow-lg' : 'bg-card border-border-dim text-muted'}`}>
                            {s.device.includes("Mac") ? "MB" : s.device.includes("iPad") ? "TB" : "PH"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5">
                              <span className="text-[11px] font-black text-main-text uppercase tracking-tight">{s.device}</span>
                              {s.current && <span className="text-[8px] bg-green-500 text-white font-black px-2 py-0.5 rounded-md uppercase tracking-widest shadow-sm">Current</span>}
                            </div>
                            <p className="text-[9px] font-bold text-muted mt-1.5 uppercase tracking-tighter opacity-70 leading-none">{s.location} • <span className="font-mono text-main-text/80">{s.ip}</span> • {s.time}</p>
                          </div>
                        </div>
                        {!s.current && (
                          <button 
                            onClick={() => revokeSession(s.id)}
                            className="opacity-0 group-hover:opacity-100 text-[9px] font-black text-red-500 uppercase tracking-widest bg-card border border-red-500/20 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-xl transition-all shadow-lg active:scale-95"
                          >
                            Revoke access
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="pt-8 border-t border-border-dim">
                <div className="flex items-center justify-between mb-5">
                   <h3 className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2 opacity-60"><Globe size={14}/> IP Allowlist Protocol</h3>
                   <div 
                    onClick={() => setIpAllowlistActive(!ipAllowlistActive)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border cursor-pointer transition-all ${ipAllowlistActive ? 'border-primary bg-primary/5 text-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]' : 'border-border-dim text-muted'}`}
                   >
                     <span className="text-[9px] font-black uppercase tracking-widest">{ipAllowlistActive ? 'Enforced' : 'Disabled'}</span>
                     <div className={`w-7 h-3.5 rounded-full relative transition-all ${ipAllowlistActive ? 'bg-primary' : 'bg-surface border border-border-dim'}`}>
                        <div className={`w-2.5 h-2.5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${ipAllowlistActive ? 'left-4' : 'left-0.5'}`} />
                     </div>
                   </div>
                </div>
                <div className={`transition-all duration-300 ${ipAllowlistActive ? 'opacity-100 scale-100' : 'opacity-40 scale-[0.98] pointer-events-none grayscale'}`}>
                  <textarea 
                    className="w-full h-28 p-5 bg-input border border-border-dim rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-main-text text-xs font-mono font-black placeholder:text-muted/40 resize-none shadow-inner leading-relaxed"
                    placeholder="e.g. 192.168.1.1, 10.0.0.0/24"
                    value={allowedIps}
                    onChange={(e) => setAllowedIps(e.target.value)}
                  />
                  <p className="text-[9px] font-bold text-muted mt-3 uppercase tracking-tight italic opacity-60">Separate target blocks with commas. Unauthorized IPs will receive a 403 Forbidden response.</p>
                </div>
              </div>

              <div className="pt-8 border-t border-border-dim">
                <h3 className="text-[10px] font-black text-muted uppercase tracking-widest mb-5 opacity-60">Authentication Audit Logs</h3>
                <div className="overflow-hidden border border-border-dim rounded-2xl bg-surface/20">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-surface/50 text-muted font-black uppercase tracking-widest border-b border-border-dim">
                      <tr>
                        <th className="px-6 py-4">Timestamp</th>
                        <th className="px-6 py-4">Vector</th>
                        <th className="px-6 py-4 text-right">Gateway Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-dim">
                      {[
                        { date: "Oct 24, 14:22", status: "Success", ip: "103.44.52.18", loc: "Mumbai" },
                        { date: "Oct 24, 09:15", status: "Success", ip: "49.206.12.5", loc: "Bangalore" },
                        { date: "Oct 23, 22:45", status: "Blocked", ip: "185.220.101.44", loc: "Frankfurt (VPN)" },
                      ].map((h, i) => (
                        <tr key={i} className="hover:bg-surface/50 transition-colors">
                          <td className="px-6 py-4 text-main-text font-black uppercase tracking-tight">{h.date}</td>
                          <td className="px-6 py-4 text-muted/80 font-bold uppercase tracking-tighter">{h.loc} • <span className="font-mono text-[9px] text-primary">{h.ip}</span></td>
                          <td className="px-6 py-4 text-right">
                            <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${h.status === 'Success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                              {h.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-8">
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="flex items-center gap-3 px-10 py-4 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary/90 transition-all shadow-glow active:scale-95 disabled:opacity-75 disabled:scale-100"
        >
          {isSaving ? <span className="animate-pulse">Writing to Vault...</span> : <><Save size={16}/> Commit Infrastructure Changes</>}
        </button>
      </div>
    </div>
  );
}
