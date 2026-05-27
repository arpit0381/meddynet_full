"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, Users, FlaskConical, Calendar, FileText, CreditCard, 
  Truck, Bell, LifeBuoy, FileEdit, Settings, History, Activity, LogOut, X,
  ChevronDown, TrendingUp, Tag, GitMerge, Key, Database, Server, 
  MessageSquare, Star, Map, RotateCcw, Zap
} from "lucide-react";
import { clsx } from "clsx";
import { useAdmin } from "@/contexts/AdminContext";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/permissions";

interface NavItem { name: string; href: string; icon: React.ElementType; badge?: number }
interface NavGroup { label: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Core",
    items: [
      { name: "Overview", href: "/admin/overview", icon: BarChart3 },
      { name: "Analytics", href: "/admin/analytics", icon: TrendingUp },
      { name: "Platform Health", href: "/admin/platform-health", icon: Server },
    ],
  },
  {
    label: "Entities",
    items: [
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Labs", href: "/admin/labs", icon: FlaskConical, badge: 3 },
      { name: "Bookings", href: "/admin/bookings", icon: Calendar },
      { name: "Test Catalog", href: "/admin/tests", icon: FileText },
      { name: "Technicians", href: "/admin/technicians", icon: Truck },
    ],
  },
  {
    label: "Operations",
    items: [
      { name: "Financials", href: "/admin/financials", icon: CreditCard },
      { name: "Refunds", href: "/admin/refunds", icon: RotateCcw, badge: 4 },
      { name: "Subscriptions", href: "/admin/subscriptions", icon: Zap },
      { name: "Coupons", href: "/admin/coupons", icon: Tag },
    ],
  },
  {
    label: "Platform",
    items: [
      { name: "Notifications", href: "/admin/notifications", icon: Bell },
      { name: "Support", href: "/admin/support", icon: LifeBuoy, badge: 7 },
      { name: "Reviews", href: "/admin/reviews", icon: Star },
      { name: "Feedback", href: "/admin/feedback", icon: MessageSquare },
    ],
  },
  {
    label: "Content & Config",  
    items: [
      { name: "Blog", href: "/admin/blog", icon: FileEdit },
      { name: "Cities", href: "/admin/cities", icon: Map },
      { name: "Onboarding", href: "/admin/onboarding", icon: GitMerge },
      { name: "API Keys", href: "/admin/api-keys", icon: Key },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Reports", href: "/admin/reports", icon: Activity },
      { name: "Audit Log", href: "/admin/audit-log", icon: History },
      { name: "Data Export", href: "/admin/data-export", icon: Database },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

type CollapsedState = Record<string, boolean>;

function getInitialCollapsed(): CollapsedState {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("sidebar-collapsed") || "{}");
  } catch {
    return {};
  }
}

export function AdminSidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const pathname = usePathname();
  const { role, name, email } = useAdmin();
  const [collapsed, setCollapsed] = useState<CollapsedState>(getInitialCollapsed);

  const toggleGroup = (label: string) => {
    setCollapsed(prev => {
      const next = { ...prev, [label]: !prev[label] };
      localStorage.setItem("sidebar-collapsed", JSON.stringify(next));
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    window.location.href = "/admin/login";
  };

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-30 w-[256px] bg-dark text-white transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5 font-bold text-xl tracking-tight leading-none">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-glow">
            <span className="text-white text-sm font-black">M</span>
          </div>
          <span className="flex items-center gap-1.5">
            MeddyNet
            <span className="text-primary text-[9px] uppercase tracking-widest bg-primary/20 px-1.5 py-0.5 rounded font-bold">Admin</span>
          </span>
        </div>
        <button className="lg:hidden text-white/70 hover:text-white p-1" onClick={() => setIsOpen(false)} aria-label="Close sidebar">
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {NAV_GROUPS.map((group) => {
          const isCollapsed = collapsed[group.label];
          const isGroupActive = group.items.some(item => pathname.startsWith(item.href));

          return (
            <div key={group.label} className="mb-3">
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-3 py-1.5 mb-1 group"
                aria-expanded={!isCollapsed}
              >
                <span className={clsx(
                  "text-[10px] font-bold uppercase tracking-widest transition-colors",
                  isGroupActive ? "text-primary/80" : "text-white/30 group-hover:text-white/50"
                )}>
                  {group.label}
                </span>
                <ChevronDown
                  size={12}
                  className={clsx("text-white/30 group-hover:text-white/50 transition-transform duration-200", isCollapsed && "-rotate-90")}
                />
              </button>

              {!isCollapsed && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={clsx(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group/item",
                          isActive
                            ? "bg-primary/15 text-white border-l-[3px] border-primary rounded-l-none pl-[calc(0.75rem-3px)]"
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <item.icon size={17} className={clsx("shrink-0 transition-transform group-hover/item:scale-110", isActive && "text-primary")} />
                        <span className="flex-1 truncate">{item.name}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[18px] text-center">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer with role badge */}
      <div className="shrink-0 border-t border-white/10 p-4">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex shrink-0 items-center justify-center text-primary font-bold text-sm">
            {name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{name}</p>
            <p className="text-xs text-white/40 truncate">{email}</p>
          </div>
        </div>
        <div className="mb-3 px-1">
          <span className={clsx("text-xs font-bold px-2.5 py-1 rounded-md", ROLE_COLORS[role])}>
            {ROLE_LABELS[role]}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
          aria-label="Logout"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}
