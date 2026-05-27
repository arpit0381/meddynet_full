"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Filter, 
  ClipboardList, 
  UploadCloud, 
  Users, 
  Clock, 
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/lib/hooks";
import Toast from "@/components/ui/Toast";

const categories = ["All", "Booking", "Report", "Tech", "System"];

export default function NotificationsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [toast, setToast] = useState<{message: string, type: "success" | "error"} | null>(null);
  
  const { data: notifications = [], isLoading } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const filteredNotifications = activeCategory === "All" 
    ? notifications 
    : notifications.filter((n: { type?: string }) => n.type?.toLowerCase().includes(activeCategory.toLowerCase()));

  const handleMarkAllAsRead = async () => {
    try {
      await markAllReadMutation.mutateAsync();
      setToast({ message: "All notifications marked as read", type: "success" });
    } catch {
      setToast({ message: "Failed to update notifications", type: "error" });
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markReadMutation.mutateAsync(id);
    } catch {
      setToast({ message: "Failed to update notification", type: "error" });
    }
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
            <Bell className="w-4 h-4" /> Activity Logs
          </div>
          <h1 className="text-4xl font-black text-dark-light tracking-tight mb-2">
            Notifications Hub
          </h1>
          <p className="text-text-muted font-bold text-lg">Stay updated with your lab&apos;s real-time events.</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleMarkAllAsRead}
             disabled={markAllReadMutation.isPending}
             className="px-6 py-3 rounded-full bg-white border border-border-dark flex items-center gap-3 shadow-sm hover:bg-surface transition-all text-xs font-black text-dark-light disabled:opacity-50"
           >
              {markAllReadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              Mark all as read
           </button>
           <div className="px-5 py-3 rounded-full bg-dark text-white flex items-center gap-3 shadow-lg cursor-pointer hover:bg-dark-light transition-all">
              <Filter className="w-4 h-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-widest">Filter</span>
           </div>
        </div>
      </div>

      {/* Categories / Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-8 py-3.5 rounded-full text-xs font-black transition-all border shrink-0 ${
              activeCategory === category 
              ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
              : 'bg-white text-text-muted border-border-dark hover:border-primary/30 hover:text-dark-light shadow-sm'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-[3rem] p-1 border border-border-dark/20 shadow-2xl overflow-hidden min-h-[400px] relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        )}
        
        <div className="p-10 pb-0">
           <h2 className="text-xl font-black text-dark-light tracking-tight mb-8">Recent Activity</h2>
        </div>

        <div className="divide-y divide-border-dark/10">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length > 0 ? filteredNotifications.map((notif: { id: string; type?: string; title: string; message: string; created_at: string; is_read: boolean }, i: number) => (
              <motion.div 
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between p-8 hover:bg-surface transition-all gap-4 sm:gap-0 cursor-pointer ${!notif.is_read ? 'bg-primary/2' : ''}`}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black shadow-lg group-hover:scale-110 transition-transform ${
                    notif.type?.toLowerCase().includes('booking') ? 'bg-orange-500' : 
                    notif.type?.toLowerCase().includes('report') ? 'bg-blue-500' : 
                    notif.type?.toLowerCase().includes('tech') ? 'bg-indigo-500' : 
                    'bg-slate-700'
                  }`}>
                    {notif.type?.toLowerCase().includes('booking') && <ClipboardList className="w-6 h-6" />}
                    {notif.type?.toLowerCase().includes('report') && <UploadCloud className="w-6 h-6" />}
                    {notif.type?.toLowerCase().includes('tech') && <Users className="w-6 h-6" />}
                    {notif.type?.toLowerCase().includes('system') || !['booking','report','tech'].some(t => notif.type?.toLowerCase().includes(t)) ? <Bell className="w-6 h-6" /> : null}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <h4 className={`font-black text-lg transition-colors ${!notif.is_read ? 'text-primary' : 'text-dark-light'}`}>{notif.title}</h4>
                      {!notif.is_read && <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,168,107,0.4)]" />}
                    </div>
                    <p className="text-sm text-text-muted font-bold tracking-tight leading-relaxed max-w-xl">{notif.message}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-10">
                  <div className="flex flex-col items-start sm:items-end">
                    <div className="flex items-center gap-2 text-xs font-black text-dark-light mb-1">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {notif.created_at ? new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                    </div>
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                      {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : "Today"}
                    </span>
                  </div>
                  <button className="p-3 rounded-full hover:bg-white border border-transparent hover:border-border-dark transition-all group/btn">
                    <ChevronRight className="w-5 h-5 text-text-muted group-hover/btn:text-primary transition-colors" />
                  </button>
                </div>
              </motion.div>
            )) : !isLoading && (
              <div className="py-20 text-center">
                <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
                   <AlertCircle className="w-12 h-12 text-text-muted opacity-20" />
                </div>
                <h3 className="text-xl font-black text-dark-light mb-2">No activity logs</h3>
                <p className="text-sm font-bold text-text-muted">You will see life alerts here as they arrive.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
