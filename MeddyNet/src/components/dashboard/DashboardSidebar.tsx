"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  CreditCard,
  User,
  LogOut,
  ChevronRight,
  Search,
  MapPin,
  CalendarCheck,
  Bell,
  Heart,
  FileImage,
  ClipboardList
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useAuthStore } from "@/store/authStore";

const navGroups = [
  {
    label: "Explore",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard, desc: "Home" },
      { href: "/search", label: "Find Tests", icon: Search, desc: "Quick Search" },
      { href: "/map", label: "Nearby Labs", icon: MapPin, desc: "Find Labs" },
    ],
  },
  {
    label: "Bookings",
    items: [
      { href: "/dashboard/bookings", label: "My Bookings", icon: ClipboardList, desc: "My Status" },
      { href: "/search", label: "Schedule Test", icon: CalendarCheck, desc: "Bookings" },
    ],
  },
  {
    label: "My Health",
    items: [
      { href: "/dashboard/reports", label: "My Reports", icon: FileText, desc: "Reports" },
      { href: "/dashboard/health-records", label: "Health Records", icon: Heart, desc: "My History" },
      { href: "/dashboard/prescriptions", label: "Prescriptions", icon: FileImage, desc: "Prescriptions" },
      { href: "/dashboard/vault", label: "Health Vault", icon: FolderOpen, desc: "My Vault" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/notifications", label: "Notifications", icon: Bell, desc: "Updates" },
      { href: "/dashboard/payments", label: "Payments", icon: CreditCard, desc: "Payments" },
      { href: "/dashboard/profile", label: "My Profile", icon: User, desc: "Profile" },
    ],
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { notificationItems } = useUser();
  const { logout } = useAuthStore();
  const unreadCount = notificationItems.filter(n => !n.read).length;

  return (
    <aside className="w-72 bg-white/50 backdrop-blur-xl border-r border-border/80 z-30 hidden lg:flex flex-col h-screen sticky top-0">
      
      {/* Branding */}
      <div className="p-7 pt-7">
        <Link href="/dashboard" className="flex items-center gap-5 mb-4 group/br">
            <div className="w-16 h-16 bg-dark rounded-[24px] flex items-center justify-center shadow-xl shadow-dark/20 overflow-hidden group/logo relative shrink-0">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/icon.png" 
                  alt="MeddyNet" 
                  className="w-full h-full object-cover active:scale-90 transition-all duration-500 group-hover/logo:scale-110"
                />
            </div>
            <div className="space-y-0.5">
                <h2 className="text-3xl font-black text-dark-light tracking-tighter leading-none group-hover/br:text-primary transition-colors">MeddyNet</h2>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted group-hover/br:text-primary/70 transition-colors">My Dashboard</span>
                </div>
            </div>
        </Link>
      </div>

      {/* Navigation Layer */}
      <nav className="flex-1 overflow-y-auto px-5 space-y-5 no-scrollbar pb-10">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/60 pl-3 mb-1">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 px-5 py-2.5 rounded-[20px] transition-all group relative overflow-hidden ${
                      isActive
                        ? "bg-dark text-white shadow-2xl shadow-dark/20 scale-[1.02]"
                        : "text-text-muted hover:bg-surface hover:text-dark-light"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isActive ? 'bg-white/10' : 'bg-surface border border-border-dark group-hover:border-primary/20'
                    }`}>
                      <Icon
                        className={`w-5 h-5 ${
                          isActive
                            ? "text-white"
                            : "text-text-light group-hover:text-primary transition-colors"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-black tracking-tight leading-none ${isActive ? 'text-white' : 'text-dark-light'}`}>{item.label}</p>
                        <p className={`text-[9px] font-bold mt-1 uppercase tracking-widest ${isActive ? 'text-white/40' : 'text-text-muted/60 group-hover:text-text-muted'}`}>{item.desc}</p>
                    </div>
                    
                    {item.label === "Notifications" && unreadCount > 0 && (
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ring-1 ${isActive ? 'bg-white/10 text-white ring-white/20' : 'bg-primary text-white ring-primary/20 shadow-lg shadow-primary/20'}`}>
                            {unreadCount}
                        </span>
                    )}
                    {isActive && <ChevronRight className="w-4 h-4 text-white/30" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

      </nav>

      <div className="p-5 pt-3 border-t border-border/80 bg-white/40">
        <button 
          onClick={() => {
            if (confirm("Are you sure you want to sign out safely from MeddyNet?")) {
              logout();
              localStorage.removeItem("meddynet_user");
              window.location.href = "/login";
            }
          }}
          className="flex items-center gap-3 w-full px-4 py-2 rounded-xl text-[10px] font-black text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all uppercase tracking-[0.2em] shadow-sm active:scale-95 group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
