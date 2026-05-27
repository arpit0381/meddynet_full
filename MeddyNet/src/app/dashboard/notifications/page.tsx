"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Calendar,
  FileText,
  Clock,
  Gift,
  CheckCheck,
  ChevronRight,
  BellOff,
  CheckCircle2,
  Trash2,
  Sparkles,
  LucideIcon
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { Skeleton } from "@/components/ui/Skeleton";

const typeConfig: Record<string, { icon: LucideIcon; color: string; bg: string; border: string; label: string }> = {
  booking: { icon: Calendar, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", label: "Booking" },
  report: { icon: FileText, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", label: "Report" },
  reminder: { icon: Clock, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", label: "Reminder" },
  offer: { icon: Gift, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", label: "Offer" },
};

const tabs = ["All", "Bookings", "Reports", "Reminders", "Offers"];

function TimeAgo({ timestamp }: { timestamp: string }) {
  const [mounted, setMounted] = useState(false);
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
    
    const updateTime = () => {
      const diff = Date.now() - new Date(timestamp).getTime();
      const min = Math.floor(diff / 60000);
      let s = "";
      if (min < 60) s = `${min}m ago`;
      else {
        const hr = Math.floor(min / 60);
        if (hr < 24) s = `${hr}h ago`;
        else s = `${Math.floor(hr / 24)}d ago`;
      }
      setTimeStr(s);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [timestamp]);

  if (!mounted) return <span className="text-[10px] font-black text-text-light shrink-0 uppercase tracking-widest">...</span>;

  return <span className="text-[10px] font-black text-text-light shrink-0 uppercase tracking-widest">{timeStr}</span>;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const { 
    notificationItems: notifications, 
    markAllNotificationsRead: markAllRead, 
    markNotificationRead: markRead, 
    deleteNotification: dismiss 
  } = useUser();

  const filteredTab = activeTab === "All" ? notifications
    : activeTab === "Bookings" ? notifications.filter((n) => n.type === "booking")
    : activeTab === "Reports" ? notifications.filter((n) => n.type === "report")
    : activeTab === "Reminders" ? notifications.filter((n) => n.type === "reminder")
    : notifications.filter((n) => n.type === "offer");

  const unread = notifications.filter((n) => !n.read).length;

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  return (
    <div className="max-w-[900px] mx-auto space-y-10 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Bell className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Notifications</span>
          </div>
          <h1 className="text-4xl font-black text-dark-light tracking-tight">Recent Alerts</h1>
          <p className="text-text-secondary font-medium max-w-sm">Keep track of your bookings, reports, and all your health updates.</p>
        </div>

        {unread > 0 && (
          <button 
            onClick={markAllRead} 
            className="flex items-center justify-center gap-3 px-8 py-4 bg-dark-light text-white rounded-[28px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-dark/20 hover:scale-105 active:scale-95 transition-all"
          >
            <CheckCheck className="w-4 h-4" /> Read All
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white p-3 rounded-[32px] border border-border flex items-center gap-2 shadow-sm overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const count = tab === "All" ? notifications.filter((n) => !n.read).length
            : tab === "Bookings" ? notifications.filter((n) => n.type === "booking" && !n.read).length
            : tab === "Reports" ? notifications.filter((n) => n.type === "report" && !n.read).length
            : tab === "Reminders" ? notifications.filter((n) => n.type === "reminder" && !n.read).length
            : notifications.filter((n) => n.type === "offer" && !n.read).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? "bg-dark text-white shadow-xl shadow-dark/10 ring-1 ring-border" 
                  : "text-text-muted hover:text-dark-light hover:bg-surface"
              }`}
            >
              {tab}
              {count > 0 && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${activeTab === tab ? "bg-white/20 text-white" : "bg-primary text-white"}`}>
                    {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {useUser().isLoadingNotifications ? (
           Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[40px] border border-border p-8 flex gap-8">
                 <Skeleton className="w-16 h-16 rounded-[28px] shrink-0" />
                 <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                 </div>
              </div>
           ))
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredTab.length > 0 ? filteredTab.map((notif, i) => {
              const config = typeConfig[notif.type] || typeConfig.reminder;
              const Icon = config.icon;
              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, x: -30 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, scale: 0.95, x: 50 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  onClick={() => markRead(notif.id)}
                  className={`relative bg-white rounded-[40px] border p-8 cursor-pointer transition-all group ${
                    !notif.read ? "border-primary/20 bg-primary/2 shadow-2xl shadow-primary/5" : "border-border"
                  } hover:shadow-2xl hover:shadow-dark/5 hover:-translate-y-1`}
                >
                  {!notif.read && (
                      <div className="absolute top-8 right-8">
                          <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(0,168,107,0.5)]" />
                      </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-start gap-8 pr-10">
                      <div className={`w-16 h-16 rounded-[28px] flex items-center justify-center shrink-0 shadow-inner border transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${config.bg} ${config.color} ${config.border}`}>
                          <Icon className="w-8 h-8" />
                      </div>
                      <div className="flex-1 space-y-2">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                             <div className="flex items-center gap-3">
                                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${config.color}`}>{config.label} Update</span>
                                  <TimeAgo timestamp={notif.timestamp} />
                             </div>
                          </div>
                          <h3 className={`text-xl font-black tracking-tight leading-tight ${notif.read ? "text-text-secondary" : "text-dark-light group-hover:text-primary transition-colors"}`}>{notif.title}</h3>
                          <p className={`text-sm font-medium leading-relaxed max-w-2xl ${notif.read ? "text-text-muted" : "text-text-secondary"}`}>{notif.message}</p>
                          
                          {notif.actionLabel && notif.actionHref && (
                              <div className="pt-4 flex items-center gap-4">
                                  <Link
                                      href={notif.actionHref}
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-2 h-12 px-6 bg-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-dark-light transition-all shadow-xl shadow-dark/10"
                                  >
                                      {notif.actionLabel} <ChevronRight className="w-4 h-4" />
                                  </Link>
                                  <button className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-dark transition-colors">Details</button>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Dismiss Button */}
                  <div className="absolute right-8 bottom-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                          onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                          className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-all"
                      >
                          <Trash2 className="w-5 h-5" />
                      </button>
                  </div>
                </motion.div>
              );
            }) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center space-y-6 bg-white border-2 border-dashed border-border rounded-[48px]">
                <div className="w-24 h-24 bg-surface rounded-[40px] flex items-center justify-center mx-auto mb-6 group">
                  <BellOff className="w-10 h-10 text-border-dark group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-black text-dark-light tracking-tight">No Notifications</h3>
                <p className="text-text-secondary font-medium max-w-xs mx-auto">
                  {activeTab === "All" ? "Everything is up to date. You don't have any new alerts." : `No new ${activeTab.toLowerCase()} notifications found.`}
                </p>
                <button 
                  onClick={() => setActiveTab("All")}
                  className="px-8 py-4 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all"
                >
                  Show All
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Push Notification Banner */}
      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
         className={`bg-linear-to-br transition-all duration-700 rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20 ${notificationsEnabled ? 'from-emerald-600 to-teal-800' : 'from-indigo-700 via-blue-800 to-indigo-900'}`}
      >
        <div className="absolute inset-0 bg-white/5 opacity-40 mix-blend-overlay" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 blur-3xl rounded-full -mr-32 -mb-32" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Stay Notified</span>
                </div>
                <h3 className="text-3xl font-black tracking-tight leading-loose">
                  {notificationsEnabled ? "Notifications Active!" : "Never Miss an Update"}
                </h3>
                <p className="text-white/70 text-base font-medium italic">
                  {notificationsEnabled ? "You're all set! We'll alert you about reports and bookings." : "Turn on notifications for your phone or browser to stay updated even when you're away."}
                </p>
            </div>
            <button 
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`shrink-0 h-16 px-10 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl active:scale-95 flex items-center gap-3 ${
                notificationsEnabled 
                  ? "bg-white/20 text-white border border-white/30 backdrop-blur-xl" 
                  : "bg-white text-indigo-700 hover:bg-emerald-50"
              }`}
            >
              {notificationsEnabled ? (
                <><CheckCircle2 className="w-5 h-5 text-emerald-400" /> All Good!</>
              ) : (
                "Turn On Now"
              )}
            </button>
        </div>
      </motion.div>
    </div>
  );
}
