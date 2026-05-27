"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Search, Bell, ChevronDown, User, Settings, LogOut, CheckCircle2, Clock, Sun, Moon } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/permissions";
import { clsx } from "clsx";

export function AdminTopbar({ onMenuClick, onCmdOpen }: { onMenuClick: () => void; onCmdOpen?: () => void }) {
  const pathname = usePathname();
  const title = pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Dashboard";
  const { role, name, email, theme, setTheme } = useAdmin();

  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "ops" | "sec">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notifications = [
    { id: 1, title: "New Lab: CityLab Diagnostics", type: "ops", time: "2 mins ago", unread: true },
    { id: 2, title: "Failed Login: IP 185.22.1.4", type: "sec", time: "1 hour ago", unread: true },
    { id: 3, title: "System Update: Success", type: "sys", time: "3 hours ago", unread: false },
    { id: 4, title: "High Volume Alert: Pune", type: "ops", time: "5 hours ago", unread: false },
  ];

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === "all") return true;
    if (activeTab === "ops") return n.type === "ops";
    if (activeTab === "sec") return n.type === "sec";
    return true;
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotif(false);
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
    onCmdOpen?.();
  };

  return (
    <header className="h-16 bg-card border-b border-border-dim flex items-center justify-between px-4 lg:px-8 shrink-0 relative z-40 transition-colors">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-main-text dark:text-white capitalize tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4 lg:gap-6" ref={dropdownRef}>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <button 
            onClick={handleOpenSearch}
            className="pl-10 pr-4 py-2 bg-surface dark:bg-slate-800/50 border border-border-dim rounded-lg text-sm text-muted w-64 text-left hover:border-primary/40 hover:bg-card transition-colors"
            aria-label="Open command palette (Ctrl+K)"
          >
            Search... <kbd className="ml-2 text-[10px] font-mono bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-muted">{typeof navigator !== 'undefined' && /Mac/.test(navigator.platform) ? '⌘K' : 'Ctrl+K'}</kbd>
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full active:scale-95 transition-transform"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="relative">
            <button 
              onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
              className={`relative p-2 rounded-full transition-colors ${showNotif ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-gray-100 dark:hover:bg-slate-800'}`}
            >
              <Bell size={20} />
              {notifications.some(n => n.unread) && (
                <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 mt-2 w-80 bg-card rounded-xl shadow-xl border border-border-dim overflow-hidden z-50">
                <div className="p-4 border-b border-border-dim bg-gray-50/50 dark:bg-slate-900/40">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-main-text dark:text-white">Notifications</h3>
                    <button className="text-[10px] text-primary font-black uppercase tracking-wider hover:underline flex items-center gap-1">
                      <CheckCircle2 size={10} /> Mark all read
                    </button>
                  </div>
                  <div className="flex gap-1 p-0.5 bg-gray-100 dark:bg-slate-900 rounded-lg">
                    {["all", "ops", "sec"].map((tab) => (
                      <button
                        key={tab}
                        onClick={(e) => { e.stopPropagation(); setActiveTab(tab as "all" | "ops" | "sec"); }}
                        className={clsx(
                          "flex-1 text-[10px] font-bold py-1 rounded-md transition-all uppercase tracking-tight",
                          activeTab === tab ? "bg-card text-primary shadow-sm" : "text-muted hover:text-main-text"
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {filteredNotifs.length > 0 ? filteredNotifs.map((n) => (
                    <div key={n.id} className="p-4 border-b border-border-dim/50 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group flex gap-3">
                      <div className={clsx(
                        "w-2 h-2 rounded-full mt-1.5 shrink-0",
                        n.type === 'ops' ? 'bg-blue-400' : n.type === 'sec' ? 'bg-red-400' : 'bg-green-400',
                        !n.unread && "opacity-0"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className={clsx("text-sm transition-colors", n.unread ? "font-semibold text-main-text" : "text-muted")}>
                          {n.title}
                        </p>
                        <p className="text-[10px] text-muted mt-1 flex items-center gap-1 uppercase font-bold tracking-tighter">
                          <Clock size={10} /> {n.time} • {n.type}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-muted text-sm">No notifications found</div>
                  )}
                </div>
                <div className="p-3 border-t border-border-dim text-center bg-gray-50/50 dark:bg-slate-900/40">
                  <Link href="/admin/notifications" onClick={() => setShowNotif(false)} className="text-xs text-primary font-bold uppercase tracking-widest hover:underline block w-full">View all activity</Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
            className={`flex items-center gap-3 p-1 rounded-lg transition-colors ${showProfile ? 'bg-primary/5' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase">
                {name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-main-text dark:text-white leading-none">{name}</p>
                <span className={clsx("text-[9px] font-black uppercase tracking-tighter mt-1 block", ROLE_COLORS[role].split(" ")[1])}>
                  {ROLE_LABELS[role]}
                </span>
              </div>
            </div>
            <ChevronDown size={14} className={`text-muted transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-xl border border-border-dim overflow-hidden z-50">
              <div className="p-4 border-b border-border-dim bg-gray-50/50 dark:bg-slate-900/40">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-main-text">{name}</p>
                </div>
                <p className="text-xs text-muted truncate">{email}</p>
                <div className="mt-2 text-[10px] font-bold inline-block px-1.5 py-0.5 rounded uppercase tracking-wider bg-surface border border-border-dim text-muted">
                  {ROLE_LABELS[role]}
                </div>
              </div>
              <div className="p-2 space-y-1">
                <Link href="/admin/profile" onClick={() => setShowProfile(false)} className="w-full text-left px-3 py-2 text-sm text-main-text/80 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-primary rounded-lg transition-colors flex items-center gap-2 font-medium">
                  <User size={16} /> My Profile
                </Link>
                <Link href="/admin/settings" onClick={() => setShowProfile(false)} className="w-full text-left px-3 py-2 text-sm text-main-text/80 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-primary rounded-lg transition-colors flex items-center gap-2 font-medium">
                  <Settings size={16} /> Account Settings
                </Link>
              </div>
              <div className="p-2 border-t border-border-dim">
                <button 
                  onClick={() => { localStorage.removeItem("adminSession"); window.location.href = "/admin/login"; }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2 font-medium"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
