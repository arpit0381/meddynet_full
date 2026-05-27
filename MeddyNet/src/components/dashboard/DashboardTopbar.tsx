"use client";

import { 
  Bell, 
  Menu, 
  Search, 
  X, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  Zap,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Settings,
  LogOut,
  MapPin,
  Heart,
  FileImage,
  Smartphone,
  BellOff,
  MessageCircle,
  SlidersHorizontal,
  Map as MapIcon,
  List
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useAuthStore } from "@/store/authStore";
import { useSearchStore } from "@/store/searchStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { haptics } from "@/lib/haptics";

const navGroups = [
  {
    label: "Explore",
    items: [
      { href: "/dashboard", label: "Overview", icon: Zap },
      { href: "/search", label: "Find Tests", icon: Search },
      { href: "/map", label: "Nearby Labs", icon: MapPin },
    ],
  },
  {
    label: "My Health",
    items: [
      { href: "/dashboard/reports", label: "My Reports", icon: FileText },
      { href: "/dashboard/health-records", label: "Health Records", icon: Heart },
      { href: "/dashboard/vault", label: "Safe Vault", icon: ShieldCheck },
      { href: "/dashboard/prescriptions", label: "Prescriptions", icon: FileImage },
    ],
  },
  {
    label: "Services",
    items: [
      { href: "/dashboard/bookings", label: "Bookings", icon: Calendar },
      { href: "/dashboard/chat", label: "Messages", icon: MessageCircle },
      { href: "/dashboard/payments", label: "Payments", icon: Smartphone },
      { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
      { href: "/dashboard/profile", label: "Settings", icon: Settings },
    ],
  },
];

function TimeAgo({ timestamp }: { timestamp: string }) {
  const [mounted, setMounted] = useState(false);
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
    const updateTime = () => {
      const diff = Date.now() - new Date(timestamp).getTime();
      const min = Math.floor(diff / 60000);
      let s = "";
      if (min < 60) s = `${min}m`;
      else {
        const hr = Math.floor(min / 60);
        if (hr < 24) s = `${hr}h`;
        else s = `${Math.floor(hr / 24)}d`;
      }
      setTimeStr(s);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [timestamp]);

  if (!mounted) return <span className="text-[10px] text-text-muted font-black uppercase tracking-widest">...</span>;

  return <span className="text-[10px] text-text-muted font-black uppercase tracking-widest">{timeStr}</span>;
}

export default function DashboardTopbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { 
    user, 
    notificationItems, 
    markAllNotificationsRead, 
    markNotificationRead, 
    deleteNotification,
    isLoadingNotifications,
    isLoadingProfile
  } = useUser();
  const { query, setQuery } = useSearchStore();
  const { logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const unreadCount = notificationItems.filter(n => !n.read).length;

  return (
    <>
      <div className={`bg-white/80 backdrop-blur-xl px-4 sm:px-8 flex flex-col sticky top-0 transition-all duration-300 border-b ${isScrolled ? 'border-border shadow-2xl shadow-dark/5' : 'border-transparent'} ${pathname === "/search" ? 'h-auto py-3' : 'h-20 justify-center'} ${notifOpen ? 'z-9999' : 'z-40'}`}>
        <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="lg:hidden p-3 -ml-2 text-dark-light hover:bg-surface rounded-2xl transition-all active:scale-90 shrink-0 border border-transparent active:border-border-dark active:shadow-inner"
                >
                    <Menu className="w-6 h-6" />
                </button>
                
                <div className="flex items-center bg-surface border border-border-dark rounded-[20px] px-4 py-2.5 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all w-full md:w-80 group max-w-[400px] shrink-0">
                    <Search className="w-4 h-4 text-text-light mr-3 group-focus-within:text-primary transition-colors shrink-0" />
                    <input
                    type="text"
                    name="global-search"
                    id="global-search"
                    autoComplete="off"
                    placeholder={pathname === "/search" ? "Search labs or tests..." : pathname === "/map" ? "Search labs by name..." : "Search records..."}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (pathname !== "/search" && pathname !== "/map") {
                            router.push(`/search?q=${e.target.value}`);
                        }
                    }}
                    className="bg-transparent border-none outline-none text-sm font-bold text-dark-light placeholder:text-text-muted w-full min-w-0"
                    />
                </div>

                {pathname === "/map" && (
                    <div className="hidden sm:flex bg-surface rounded-xl p-1 border border-border ml-2">
                        <button
                            onClick={() => useSearchStore.getState().setViewMode("split")}
                            className={`p-2 rounded-lg transition-all ${
                            useSearchStore.getState().viewMode === "split"
                                ? "bg-white text-primary shadow-sm"
                                : "text-text-muted hover:text-primary"
                            }`}
                        >
                            <MapIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => useSearchStore.getState().setViewMode("list")}
                            className={`p-2 rounded-lg transition-all ${
                            useSearchStore.getState().viewMode === "list"
                                ? "bg-white text-primary shadow-sm"
                                : "text-text-muted hover:text-primary"
                            }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 sm:gap-6 shrink-0">
                {/* Notifications */}
                <div className="relative">
                    <button 
                    onClick={() => { haptics.medium(); setNotifOpen(!notifOpen); }}
                    className={`relative h-12 w-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${notifOpen ? 'bg-dark text-white shadow-xl shadow-dark/20 rotate-12 scale-110' : 'bg-surface text-text-secondary hover:bg-border hover:scale-105 active:scale-95'}`}
                    >
                    <Bell className={`w-6 h-6 ${notifOpen ? 'fill-current' : ''}`} />
                    {unreadCount > 0 && (
                        <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white animate-pulse" />
                    )}
                    </button>

                    <AnimatePresence>
                    {notifOpen && (
                        <>
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={(e) => { e.stopPropagation(); setNotifOpen(false); }}
                            className="fixed inset-0 z-9998 bg-transparent cursor-default pointer-events-auto"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20, rotateX: -15 }}
                            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20, rotateX: -15 }}
                            className="fixed sm:absolute left-1/2 sm:left-auto sm:right-0 top-20 sm:top-full -translate-x-1/2 sm:translate-x-0 mt-2 sm:mt-4 w-[calc(100vw-32px)] sm:w-[420px] bg-white border border-border shadow-[0_25px_100px_-15px_rgba(0,0,0,0.3)] rounded-[32px] sm:rounded-[40px] z-9999 overflow-hidden origin-top-right ring-1 ring-border-dark pointer-events-auto"
                        >
                            <div className="p-5 sm:p-8 pb-4 sm:pb-6 border-b border-border bg-linear-to-br from-primary/3 to-surface flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-[10px] sm:text-sm font-black text-dark-light uppercase tracking-widest">Notifications</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <p className="text-[9px] sm:text-[10px] text-text-muted font-black uppercase tracking-widest leading-none">{unreadCount} New Update</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={markAllNotificationsRead} className="w-10 h-10 flex items-center justify-center bg-white border border-border rounded-xl text-primary hover:bg-primary/5 transition-all shadow-sm" title="Read All">
                                        <CheckCircle2 className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => notificationItems.forEach(n => deleteNotification(n.id))} className="w-10 h-10 flex items-center justify-center bg-white border border-border rounded-xl text-rose-500 hover:bg-rose-50 transition-all shadow-sm" title="Delete All">
                                        <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="max-h-[440px] overflow-y-auto no-scrollbar scroll-smooth p-3 space-y-2">
                            {isLoadingNotifications ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="p-4 rounded-[28px] bg-surface/50 border border-border flex gap-4 animate-pulse">
                                        <div className="w-14 h-14 rounded-2xl bg-white/50 shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-white/50 w-3/4 rounded" />
                                            <div className="h-3 bg-white/50 w-1/2 rounded" />
                                        </div>
                                    </div>
                                ))
                            ) : notificationItems.length > 0 ? (
                                <>
                                {notificationItems.slice(0, 6).map((notif, i) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                        key={notif.id} 
                                        onClick={() => { markNotificationRead(notif.id); setNotifOpen(false); }}
                                        className={`p-3.5 sm:p-4 rounded-[24px] sm:rounded-[28px] flex gap-3 sm:gap-4 cursor-pointer transition-all duration-500 relative group border ${!notif.read ? 'bg-primary/2 border-primary/20 shadow-xl shadow-primary/5' : 'bg-white border-transparent hover:bg-surface hover:border-border'}`}
                                    >
                                    {!notif.read && (
                                        <div className="absolute right-4 sm:right-6 top-4 sm:top-6 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary" />
                                    )}
                                    <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                                        notif.type === 'report' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        notif.type === 'booking' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    }`}>
                                        {notif.type === 'report' ? <FileText className="w-5 h-5 sm:w-6 sm:h-6" /> :
                                        notif.type === 'booking' ? <Calendar className="w-5 h-5 sm:w-6 sm:h-6" /> :
                                        <Zap className="w-5 h-5 sm:w-6 sm:h-6" />}
                                    </div>
                                    <div className="flex-1 space-y-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                        <h4 className={`text-xs sm:text-sm tracking-tight truncate ${notif.read ? 'font-bold text-text-secondary' : 'font-black text-dark-light'}`}>
                                            {notif.title}
                                        </h4>
                                        <TimeAgo timestamp={notif.timestamp} />
                                        </div>
                                        <p className={`text-[10px] sm:text-xs leading-relaxed line-clamp-2 ${notif.read ? 'text-text-muted font-medium italic' : 'text-text-secondary font-bold'}`}>
                                        {notif.message}
                                        </p>
                                    </div>
                                    </motion.div>
                                ))}
                                </>
                            ) : (
                                <div className="py-20 text-center space-y-4">
                                <div className="w-20 h-20 rounded-[32px] bg-surface flex items-center justify-center mx-auto border-2 border-dashed border-border group">
                                    <BellOff className="w-10 h-10 text-border-dark group-hover:rotate-12 transition-transform" />
                                </div>
                                <div>
                                    <h4 className="text-base font-black text-dark-light mb-1 uppercase tracking-tight">No Alerts</h4>
                                    <p className="text-xs text-text-muted font-medium italic">You&apos;re all caught up.</p>
                                </div>
                                </div>
                            )}
                            </div>

                            <div className="p-6 bg-surface/50 border-t border-border mt-2">
                            <Link 
                                href="/dashboard/notifications"
                                onClick={() => setNotifOpen(false)}
                                className="w-full h-14 bg-dark text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-dark/10"
                                >
                                See All <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                        </motion.div>
                        </>
                    )}
                    </AnimatePresence>
                </div>
                
                <Link href="/dashboard/profile" className="flex items-center gap-4 pl-6 border-l border-border hover:opacity-80 transition-opacity">
                    <div className="hidden lg:block text-right">
                    {isLoadingProfile || !user.name ? (
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-surface rounded-lg animate-pulse ml-auto" />
                        <div className="h-3 w-16 bg-surface rounded-lg animate-pulse ml-auto" />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-black text-dark-light tracking-tight leading-tight">{user.name}</p>
                        <div className="flex items-center gap-2 justify-end">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">{user.bloodGroup || "—"} Sync</p>
                        </div>
                      </>
                    )}
                    </div>
                    <div className="relative group">
                    <div className="absolute -inset-1.5 bg-linear-to-tr from-primary/40 to-primary/0 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-linear-to-br from-dark to-dark-light flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-2xl ring-4 ring-white group-hover:scale-105 transition-all duration-500">
                        {user.avatar || user.name?.charAt(0)?.toUpperCase() || "•"}
                    </div>
                    </div>
                </Link>
            </div>
        </div>

        {/* Second Row for Search Page */}
        {pathname === "/search" && (
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-4 w-full mt-3 pt-3 border-t border-border/50"
            >
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                    <div className="flex bg-surface-dark/40 rounded-xl p-1 border border-border">
                        {['All', 'Hematology', 'Thyroid', 'Cardiology', 'Vitamins'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => useSearchStore.getState().setCategory(cat)}
                            className={`px-5 py-2 rounded-[10px] text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                            useSearchStore.getState().category === cat
                                ? "bg-white text-primary shadow-sm"
                                : "text-text-muted hover:text-primary"
                            }`}
                        >
                            {cat}
                        </button>
                        ))}
                    </div>
                </div>
                
                <button
                    onClick={() => useSearchStore.getState().setShowFilters(!useSearchStore.getState().showFilters)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border transition-all duration-300 shrink-0 ${
                    useSearchStore.getState().showFilters
                        ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5"
                        : "border-border-dark text-text-muted bg-white hover:border-primary"
                    }`}
                >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-tight">Advanced Filters</span>
                </button>
            </motion.div>
        )}
      </div>

      {/* Mobile Menu - Stunning Redesign */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark/20 backdrop-blur-2xl"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="relative w-[85%] max-w-[340px] bg-white h-full shadow-[20px_0_100px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
            >
              {/* Complex Background Elements */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/2 blur-[100px] rounded-full -mr-64 -mt-64" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/2 blur-[80px] rounded-full -ml-40 -mb-40" />
              
              <div className="p-8 pb-10 relative z-10 space-y-10 flex flex-col h-full bg-white/40 backdrop-blur-md">
                
                {/* Header Profile Section */}
                <div className="flex items-start justify-between">
                   <div className="space-y-5">
                      <div className="w-20 h-20 rounded-[32px] bg-linear-to-br from-primary to-accent text-white flex items-center justify-center text-3xl font-black shadow-2xl shadow-primary/20 p-[1.5px] group">
                          <div className="w-full h-full bg-linear-to-br from-primary to-accent rounded-[30.5px] flex items-center justify-center border-4 border-white/20">
                            {user.avatar}
                          </div>
                      </div>
                      <div>
                          {isLoadingProfile || !user.name ? (
                            <>
                              <div className="h-6 w-32 bg-surface rounded-lg animate-pulse mb-2" />
                              <div className="h-3 w-24 bg-surface rounded-lg animate-pulse" />
                            </>
                          ) : (
                            <>
                              <h4 className="text-2xl font-black text-dark-light tracking-tight">{user.name}</h4>
                              <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mt-1 border-l-2 border-primary pl-2 ml-0.5">Patient Profile • <span className="text-primary italic">Syncing</span></p>
                            </>
                          )}
                      </div>
                   </div>
                   <button 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="w-12 h-12 flex items-center justify-center bg-white border border-border-dark rounded-2xl shadow-xl shadow-dark/5 active:scale-90 transition-all hover:bg-surface"
                   >
                      <X className="w-6 h-6 text-dark-light" />
                   </button>
                </div>

                {/* Navigation Section */}
                <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar pr-2 -mr-2 pb-10">
                   {navGroups.map((group, gIdx) => (
                     <div key={group.label} className="space-y-4">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] ml-2 opacity-60">{group.label}</p>
                        <nav className="space-y-3">
                            {group.items.map((item, idx) => {
                                const Icon = item.icon;
                                const active = pathname === item.href;
                                return (
                                    <motion.div
                                        key={item.href}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + (gIdx * 3 + idx) * 0.05 }}
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-5 p-4 rounded-[24px] transition-all group ${
                                                active 
                                                ? "bg-dark text-white shadow-xl shadow-dark/10" 
                                                : "hover:bg-surface text-text-muted hover:text-dark-light border border-transparent hover:border-border"
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-white/10 ring-1 ring-white/20' : 'bg-white border border-border-dark group-hover:border-primary/30 group-hover:bg-primary/5'}`}>
                                                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-text-light group-hover:text-primary transition-colors'}`} />
                                            </div>
                                            <span className={`text-sm font-black tracking-tight ${active ? 'text-white' : 'text-dark-light'}`}>{item.label}</span>
                                            {active && (
                                                <motion.div layoutId="m-active-dot" className="w-1.5 h-1.5 rounded-full bg-primary ml-auto mr-2 shadow-[0_0_10px_rgba(0,168,107,0.8)]" />
                                            )}
                                        </Link>
                                    </motion.div>
                                )
                            })}
                        </nav>
                     </div>
                   ))}
                </div>
                
                {/* Bottom Sign Out Area - Extra Compact */}
                <div className="pt-4 mt-auto">
                   <button 
                      onClick={() => {
                         if (confirm("Are you sure you want to sign out safely from MeddyNet?")) {
                            logout();
                            localStorage.removeItem("meddynet_user");
                            window.location.href = "/login";
                         }
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95 group"
                   >
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center group-hover:bg-white/10 shrink-0 shadow-sm border border-rose-100/50">
                        <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                      </div>
                      Sign Out Account
                   </button>
                   <p className="text-[9px] text-center text-text-muted font-bold tracking-widest uppercase mt-6 opacity-40">MeddyNet v2.4.0 • Safe & Secure</p>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
