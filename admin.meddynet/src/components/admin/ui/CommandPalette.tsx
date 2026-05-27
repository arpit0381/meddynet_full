"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, X, ArrowRight, Zap, Settings, Users, BookOpen, Shield, CreditCard, Bell, Tag } from "lucide-react";

const actions = [
  { id: '1', title: "Search Bookings", desc: "View and manage recent bookings", icon: BookOpen, href: "/admin/bookings", shortcut: "G B" },
  { id: '2', title: "Manage Users", desc: "View patient profiles and history", icon: Users, href: "/admin/users", shortcut: "G U" },
  { id: '3', title: "Platform Health", desc: "Check system uptime and logs", icon: Shield, href: "/admin/platform-health", shortcut: "G H" },
  { id: '4', title: "Financial Reports", desc: "Payouts, revenue and tax", icon: CreditCard, href: "/admin/financials", shortcut: "G F" },
  { id: '5', title: "System Settings", desc: "Configure platform behavior", icon: Settings, href: "/admin/settings", shortcut: "G S" },
  { id: '6', title: "Promotions", desc: "Create and edit coupon codes", icon: Tag, href: "/admin/coupons", shortcut: "G P" },
  { id: '7', title: "Notifications", desc: "Send global alerts", icon: Bell, href: "/admin/notifications", shortcut: "G N" },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(open => !open);
      }
      if (e.key === "Escape") setIsOpen(false);
    };

    const handleOpen = () => setIsOpen(true);

    document.addEventListener("keydown", down);
    window.addEventListener("open-command-palette", handleOpen);
    
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("open-command-palette", handleOpen);
    };
  }, []);

  const filtered = actions.filter(a => 
    a.title.toLowerCase().includes(query.toLowerCase()) || 
    a.desc.toLowerCase().includes(query.toLowerCase())
  );

  const navigate = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100]" 
          />
          <div className="fixed inset-0 flex items-start justify-center pt-[15vh] pointer-events-none z-[101]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="w-full max-w-2xl bg-card rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-border-dim mx-4 transition-colors"
            >
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted" size={20} />
                <input 
                  autoFocus
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full h-16 pl-16 pr-20 text-lg font-bold text-main-text bg-transparent outline-none placeholder:text-muted placeholder:font-black placeholder:uppercase placeholder:tracking-widest"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <div className="flex items-center gap-1 bg-surface border border-border-dim/50 px-2 py-1 rounded-lg transition-colors">
                    <Command size={10} className="text-muted" />
                    <span className="text-[10px] font-black text-muted">K</span>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800/50 rounded-lg text-muted transition-all active:scale-90"><X size={18} /></button>
                </div>
              </div>

              <div className="p-3 max-h-[60vh] overflow-y-auto border-t border-border-dim bg-gray-50/30 dark:bg-slate-900/40">
                {filtered.length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest px-3 py-2">Quick Actions</p>
                    {filtered.map(a => (
                      <button 
                        key={a.id} 
                        onClick={() => navigate(a.href)}
                        className="w-full flex items-center justify-between p-4 hover:bg-surface hover:shadow-lg rounded-2xl transition-all group text-left border border-transparent hover:border-primary/20"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-surface dark:bg-slate-900/50 rounded-xl flex items-center justify-center text-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <a.icon size={20} />
                          </div>
                          <div>
                            <p className="font-black text-main-text text-sm uppercase tracking-tight">{a.title}</p>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{a.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-gray-300 dark:text-slate-600 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest">{a.shortcut}</span>
                          <ArrowRight size={16} className="text-gray-300 group-hover:text-primary translate-x-[-4px] group-hover:translate-x-0 transition-all opacity-0 group-hover:opacity-100" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-muted">
                    <Zap size={40} strokeWidth={1} className="mb-4 opacity-20" />
                    <p className="text-sm font-black uppercase tracking-widest px-10 text-center">No interference detected for &quot;<span className="text-primary">{query}</span>&quot;</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border-dim flex items-center justify-between bg-card transition-colors">
                 <div className="flex gap-4">
                    <div className="flex items-center gap-1.5"><kbd className="bg-surface border border-border-dim/50 px-1.5 py-0.5 rounded text-[10px] font-black text-muted transition-colors">↑↓</kbd><span className="text-[10px] font-bold text-muted uppercase uppercase tracking-tighter">Navigate</span></div>
                    <div className="flex items-center gap-1.5"><kbd className="bg-surface border border-border-dim/50 px-1.5 py-0.5 rounded text-[10px] font-black text-muted transition-colors">↵</kbd><span className="text-[10px] font-bold text-muted uppercase uppercase tracking-tighter">Execute</span></div>
                 </div>
                 <div className="flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Hydra Search Active</span>
                 </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
