import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  TestTube2,
  PlusCircle,
  ClipboardList,
  Calendar,
  UploadCloud,
  Users,
  IndianRupee,
  Settings,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Store,
  CreditCard,
  Bell,
  MessageSquare,
  Activity,
  History,
  TrendingUp,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { useNotifications } from "@/lib/hooks";

const navGroups = [
  {
    label: "Management Console",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Overview" },
      { href: "/bookings", label: "Bookings", icon: ClipboardList, desc: "Incoming Bookings" },
      { href: "/calendar", label: "Calendar", icon: Calendar, desc: "Appointments" },
      { href: "/tests", label: "My Tests", icon: TestTube2, desc: "Diagnostic Catalog" },
      { href: "/tests/add", label: "Add New Test", icon: PlusCircle, desc: "Add to Catalog" },
      { href: "/reports", label: "Upload Reports", icon: UploadCloud, desc: "Deliveries" },
      { href: "/patients", label: "Patient Records", icon: History, desc: "Ledger" },
      { href: "/technicians", label: "Technicians", icon: Users, desc: "Field Staff" },
      { href: "/queries", label: "Patient Queries", icon: MessageSquare, desc: "Support" },
      { href: "/earnings", label: "Earnings", icon: IndianRupee, desc: "Revenue Breakdown" },
      { href: "/profile", label: "Lab Profile", icon: Store, desc: "Setup" },
      { href: "/subscription", label: "Subscription", icon: CreditCard, desc: "Plans" },
      { href: "/settings", label: "Settings", icon: Settings, desc: "Preferences" },
    ],
  }
];

export default function LabSidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  const handleLogout = () => {
    if (confirm("Are you sure you want to sign out safely?")) {
      logout();
      router.push("/login");
    }
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : "AD";

  return (
    <aside className={`
      bg-white/70 backdrop-blur-2xl border-r border-border/80 flex flex-col transition-all duration-500 ease-[0.23,1,0.32,1] z-60
      ${isOpen 
        ? "fixed inset-y-0 left-0 w-[85%] sm:w-80 h-full top-0 translate-x-0 shadow-[0_0_80px_rgba(0,0,0,0.1)]" 
        : "w-72 hidden lg:flex h-screen sticky top-0 -translate-x-full lg:translate-x-0"}
    `}>
      {/* Branding Section */}
      <div className="p-7">
        <Link href="/dashboard" className="flex items-center gap-5 group/br">
            <div className="w-16 h-16 bg-dark rounded-[24px] flex items-center justify-center shadow-xl shadow-dark/20 overflow-hidden group/logo relative shrink-0">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                <div className="w-full h-full bg-primary rounded-xl flex items-center justify-center text-white font-black text-2xl group-hover:scale-105 transition-transform">M</div>
            </div>
            <div className="space-y-0.5 min-w-0 text-left">
                <h2 className="text-3xl font-black text-dark-light tracking-tighter leading-none group-hover:text-primary transition-colors truncate">MeddyNet</h2>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-text-muted group-hover/br:text-primary/70 transition-colors truncate">Partner Console</span>
                </div>
            </div>
        </Link>
      </div>

       {/* Verify Status Banner */}
       <div className="px-5 mb-4">
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-4 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 blur-2xl rounded-full -mr-10 -mt-10" />
          <div className="flex items-center gap-2 text-emerald-600 relative z-10">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest text-left">
              Partner Verified
            </span>
          </div>
          <p className="text-[10px] text-text-muted font-bold relative z-10 leading-relaxed text-left">
            Your lab services are live and receiving bookings on the MeddyNet network.
          </p>
        </div>
      </div>

      {/* Navigation Layer */}
      <nav className="flex-1 overflow-y-auto px-5 space-y-7 no-scrollbar pb-10">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/60 pl-3 mb-1 text-left">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item: any) => {
                const isActive = item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : item.href === "/tests"
                  ? pathname === "/tests"
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-4 px-4 py-2.5 rounded-[22px] transition-all group relative overflow-hidden ${
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
                    <div className="flex-1 min-w-0 text-left">
                        <p className={`text-[13px] font-black tracking-tight leading-none ${isActive ? 'text-white' : 'text-dark-light'}`}>{item.label}</p>
                        <p className={`text-[9px] font-bold mt-1 uppercase tracking-widest ${isActive ? 'text-white/40' : 'text-text-muted/60 group-hover:text-text-muted'}`}>{item.desc}</p>
                    </div>
                    {item.showBadge && unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-lg bg-primary text-[9px] font-black text-white shadow-lg shadow-primary/20">
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

      {/* Footer / Logout */}
      <div className="p-5 border-t border-border/60 bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface/50 border border-border-dark/20 mb-3 overflow-hidden group/profile">
           <div className="w-10 h-10 rounded-xl bg-dark flex items-center justify-center text-white font-black shadow-lg shrink-0 group-hover/profile:scale-110 transition-transform">
              {initials}
           </div>
           <div className="flex-1 min-w-0 text-left">
              <p className="text-[11px] font-black text-dark-light truncate">{user?.name || "Partner Admin"}</p>
              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Active Partner</p>
           </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[10px] font-black text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all uppercase tracking-[0.2em] shadow-sm active:scale-95 group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Partner Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

