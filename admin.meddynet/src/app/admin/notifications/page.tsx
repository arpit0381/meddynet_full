"use client";
import { useState } from "react";
import { Send, Clock, Mail, Smartphone } from "lucide-react";

export default function NotificationsPage() {
  const [history, setHistory] = useState([
    { id: 1, title: "System Update 1.5", date: "12 Mar, 10:00 AM", target: "All Users", channels: ["Email", "In-App"], body: "We are rolling out a new update to improve system stability and performance across all regions." },
    { id: 2, title: "Maintenance Alert", date: "10 Mar, 02:00 PM", target: "All Labs", channels: ["Email", "SMS"], body: "Scheduled maintenance for the lab portal tonight between 2 AM and 4 AM." }
  ]);

  const [form, setForm] = useState({
    target: "All Users",
    inApp: true,
    email: true,
    sms: false,
    title: "",
    body: ""
  });

  const handleSend = () => {
    if (!form.title || !form.body) return;
    const channels = [];
    if (form.inApp) channels.push("In-App");
    if (form.email) channels.push("Email");
    if (form.sms) channels.push("SMS");
    
    setHistory([{
      id: Date.now(),
      title: form.title,
      date: "Just Now",
      target: form.target,
      channels,
      body: form.body
    }, ...history]);
    
    setForm({...form, title: "", body: ""});
  };
  return (
    <div className="space-y-6 max-w-full">
      <h1 className="text-2xl font-black text-main-text tracking-tight uppercase">Notification Center</h1>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 bg-card rounded-2xl border border-border-dim shadow-sm overflow-hidden flex flex-col h-[700px] transition-all">
          <div className="p-6 border-b border-border-dim bg-surface/50"><h2 className="text-lg font-black text-main-text uppercase tracking-tight">Compose Notification</h2></div>
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-3">Target Audience</label>
              <div className="grid grid-cols-2 gap-3">
                {["All Users", "All Labs", "Specific City", "Specific Lab"].map(t => (
                  <label key={t} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${form.target === t ? 'bg-primary/5 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' : 'border-border-dim hover:bg-surface'}`}>
                    <input type="radio" name="target" checked={form.target === t} onChange={() => setForm({...form, target: t})} className="text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                    <span className="text-xs font-black uppercase tracking-widest">{t}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-3">Channels</label>
              <div className="flex gap-8">
                <label className="flex items-center gap-2.5 text-xs text-main-text font-black uppercase tracking-widest cursor-pointer opacity-80 hover:opacity-100 transition-opacity"><input type="checkbox" checked={form.inApp} onChange={e => setForm({...form, inApp: e.target.checked})} className="text-primary rounded-md focus:ring-primary w-4 h-4" /> In-App</label>
                <label className="flex items-center gap-2.5 text-xs text-main-text font-black uppercase tracking-widest cursor-pointer opacity-80 hover:opacity-100 transition-opacity"><input type="checkbox" checked={form.email} onChange={e => setForm({...form, email: e.target.checked})} className="text-primary rounded-md focus:ring-primary w-4 h-4" /> Email</label>
                <label className="flex items-center gap-2.5 text-xs text-main-text font-black uppercase tracking-widest cursor-pointer opacity-80 hover:opacity-100 transition-opacity"><input type="checkbox" checked={form.sms} onChange={e => setForm({...form, sms: e.target.checked})} className="text-primary rounded-md focus:ring-primary w-4 h-4" /> SMS</label>
              </div>
            </div>
            <div><label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-2">Subject / Title</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full p-4 bg-input border border-border-dim rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-main-text font-bold transition-all" placeholder="e.g. System Maintenance Notice" /></div>
            <div><label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-2">Message Body</label><textarea rows={6} value={form.body} onChange={e => setForm({...form, body: e.target.value})} className="w-full p-4 bg-input border border-border-dim rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-main-text resize-none font-bold transition-all leading-relaxed" placeholder="Write your notification message here..." /></div>
          </div>
          <div className="p-6 border-t border-border-dim bg-surface/50 shrink-0 flex justify-between items-center">
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted hover:text-main-text bg-card border border-border-dim px-6 py-3 rounded-xl shadow-sm transition-all hover:translate-y-[-1px]"><Clock size={16}/> Schedule for Later</button>
            <button onClick={handleSend} className="flex items-center gap-2 px-10 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-lg active:scale-95"><Send size={16}/> Send Now</button>
          </div>
        </div>

        <div className="xl:col-span-5 bg-card rounded-2xl border border-border-dim shadow-sm flex flex-col h-[700px] overflow-hidden transition-all">
           <div className="p-6 border-b border-border-dim bg-surface/50"><h2 className="text-lg font-black text-main-text uppercase tracking-tight">Notification History</h2></div>
           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface/30">
             {history.map(item => (
               <div key={item.id} className="p-5 border border-border-dim rounded-2xl hover:border-primary/30 hover:shadow-xl transition-all bg-card group cursor-pointer relative ring-1 ring-black/5 dark:ring-white/5">
                 <button onClick={() => setHistory(history.filter(h => h.id !== item.id))} className="absolute top-4 right-4 text-muted hover:text-red-500 transition-colors"><span className="text-lg font-bold leading-none">&times;</span></button>
                 <div className="flex justify-between items-start mb-3 pr-8"><h4 className="font-black text-main-text text-sm uppercase tracking-tight group-hover:text-primary transition-colors">{item.title}</h4><span className="text-[10px] font-black uppercase tracking-widest text-muted">{item.date}</span></div>
                 <p className="text-xs text-muted font-bold line-clamp-2 mb-4 leading-relaxed whitespace-pre-wrap">{item.body}</p>
                 <div className="flex items-center justify-between"><div className="flex flex-wrap gap-2"><span className="bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-blue-500/20"><Smartphone size={10}/> {item.target}</span>{item.channels.map(c => <span key={c} className="bg-muted/10 text-muted px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-border-dim"><Mail size={10}/> {c}</span>)}</div>
                 <span className="text-[9px] font-black text-green-500 bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20 uppercase tracking-widest">DELIVERED</span></div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
