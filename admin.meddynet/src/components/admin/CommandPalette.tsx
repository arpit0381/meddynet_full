"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, BarChart3, Users, FlaskConical, Calendar, FileText, CreditCard,
  Truck, Bell, LifeBuoy, FileEdit, Settings, History, Activity, 
  TrendingUp, Tag, RotateCcw, Star, MessageSquare, Map, GitMerge,
  Key, Database, Server, Zap, ChevronRight
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  category: "Navigation" | "Action" | "Recent";
  href?: string;
  shortcut?: string;
  icon: React.ElementType;
  description?: string;
}

const NAV_COMMANDS: CommandItem[] = [
  { id: "overview", label: "Overview", category: "Navigation", href: "/admin/overview", icon: BarChart3, description: "Platform overview and live feed" },
  { id: "analytics", label: "Analytics", category: "Navigation", href: "/admin/analytics", icon: TrendingUp, description: "Deep analytics and reports" },
  { id: "users", label: "Users", category: "Navigation", href: "/admin/users", icon: Users, description: "Manage platform users" },
  { id: "labs", label: "Labs", category: "Navigation", href: "/admin/labs", icon: FlaskConical, description: "Lab partners and verification" },
  { id: "bookings", label: "Bookings", category: "Navigation", href: "/admin/bookings", icon: Calendar, description: "All patient bookings" },
  { id: "tests", label: "Test Catalog", category: "Navigation", href: "/admin/tests", icon: FileText, description: "Global test catalog" },
  { id: "financials", label: "Financials", category: "Navigation", href: "/admin/financials", icon: CreditCard, description: "Revenue and payouts" },
  { id: "refunds", label: "Refunds", category: "Navigation", href: "/admin/refunds", icon: RotateCcw, description: "Refund management" },
  { id: "subscriptions", label: "Subscriptions", category: "Navigation", href: "/admin/subscriptions", icon: Zap, description: "Lab subscription plans" },
  { id: "coupons", label: "Coupons", category: "Navigation", href: "/admin/coupons", icon: Tag, description: "Coupon and promo codes" },
  { id: "technicians", label: "Technicians", category: "Navigation", href: "/admin/technicians", icon: Truck, description: "Field technicians" },
  { id: "support", label: "Support", category: "Navigation", href: "/admin/support", icon: LifeBuoy, description: "Support tickets" },
  { id: "reviews", label: "Reviews", category: "Navigation", href: "/admin/reviews", icon: Star, description: "Review moderation" },
  { id: "feedback", label: "Feedback / NPS", category: "Navigation", href: "/admin/feedback", icon: MessageSquare, description: "Patient NPS and feedback" },
  { id: "notifications", label: "Notifications", category: "Navigation", href: "/admin/notifications", icon: Bell, description: "Broadcast notifications" },
  { id: "blog", label: "Blog", category: "Navigation", href: "/admin/blog", icon: FileEdit, description: "Content management" },
  { id: "cities", label: "Cities & Zones", category: "Navigation", href: "/admin/cities", icon: Map, description: "City and zone management" },
  { id: "onboarding", label: "Onboarding", category: "Navigation", href: "/admin/onboarding", icon: GitMerge, description: "Lab onboarding pipeline" },
  { id: "api-keys", label: "API Keys", category: "Navigation", href: "/admin/api-keys", icon: Key, description: "API key management" },
  { id: "reports", label: "Reports", category: "Navigation", href: "/admin/reports", icon: Activity, description: "Diagnostic reports audit" },
  { id: "audit-log", label: "Audit Log", category: "Navigation", href: "/admin/audit-log", icon: History, description: "Admin action history" },
  { id: "data-export", label: "Data Export", category: "Navigation", href: "/admin/data-export", icon: Database, description: "Export platform data" },
  { id: "platform-health", label: "Platform Health", category: "Navigation", href: "/admin/platform-health", icon: Server, description: "System health monitor" },
  { id: "settings", label: "Settings", category: "Navigation", href: "/admin/settings", icon: Settings, description: "Platform configuration" },
];

const ACTION_COMMANDS: CommandItem[] = [
  { id: "action-add-coupon", label: "Create New Coupon", category: "Action", href: "/admin/coupons", icon: Tag, shortcut: "⌘N" },
  { id: "action-send-notif", label: "Send Notification", category: "Action", href: "/admin/notifications", icon: Bell },
  { id: "action-approve-labs", label: "Review Pending Labs", category: "Action", href: "/admin/onboarding", icon: FlaskConical },
  { id: "action-process-payouts", label: "Process Payouts", category: "Action", href: "/admin/financials", icon: CreditCard },
  { id: "action-refunds", label: "Review Pending Refunds", category: "Action", href: "/admin/refunds", icon: RotateCcw },
];

function fuzzyMatch(str: string, query: string): boolean {
  str = str.toLowerCase();
  query = query.toLowerCase();
  let qi = 0;
  for (let i = 0; i < str.length && qi < query.length; i++) {
    if (str[i] === query[qi]) qi++;
  }
  return qi === query.length;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setQuery("");
        setActiveIdx(0);
        inputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  const results = useCallback((): CommandItem[] => {
    if (!query.trim()) {
      return [...ACTION_COMMANDS.slice(0, 5), ...NAV_COMMANDS.slice(0, 5)];
    }
    const navMatches = NAV_COMMANDS.filter(c => fuzzyMatch(c.label, query) || fuzzyMatch(c.description || "", query));
    const actionMatches = ACTION_COMMANDS.filter(c => fuzzyMatch(c.label, query));
    return [...actionMatches, ...navMatches].slice(0, 10);
  }, [query]);

  const items = results();

  const execute = useCallback((item: CommandItem) => {
    if (item.href) router.push(item.href);
    onClose();
  }, [router, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, items.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && items[activeIdx]) execute(items[activeIdx]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, items, activeIdx, execute, onClose]);

  if (!isOpen) return null;

  const categoryColors: Record<string, string> = {
    Navigation: "bg-blue-50/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    Action: "bg-green-50/10 text-green-600 dark:text-green-400 border border-green-500/20",
    Recent: "bg-surface text-muted border border-border-dim",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Palette */}
      <div className="relative w-full max-w-[600px] mx-4 bg-card rounded-2xl shadow-2xl overflow-hidden border border-border-dim animate-in fade-in zoom-in-95 duration-150 transition-colors">
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-dim bg-surface/30">
          <Search size={20} className="text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIdx(0); }}
            placeholder="Search pages, actions, users, labs..."
            className="flex-1 text-main-text text-base outline-none placeholder-muted/60 bg-transparent"
            aria-label="Command search"
          />
          <kbd className="text-xs text-muted bg-surface px-2 py-1 rounded-md font-mono border border-border-dim shadow-inner">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto py-2 scrollbar-custom bg-card" role="listbox">
          {items.length === 0 ? (
            <div className="px-5 py-8 text-center text-muted text-sm" role="option" aria-selected="false">No results for &quot;{query}&quot;</div>
          ) : (
            items.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => execute(item)}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${activeIdx === idx ? "bg-primary/5 dark:bg-primary/10" : "hover:bg-surface/50"}`}
                aria-selected={activeIdx === idx}
                role="option"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activeIdx === idx ? "bg-primary text-white" : "bg-surface text-muted border border-border-dim"} transition-colors`}>
                  <item.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-main-text truncate uppercase tracking-tight">{item.label}</p>
                  {item.description && <p className="text-[10px] text-muted font-bold uppercase tracking-widest truncate opacity-60">{item.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${categoryColors[item.category]}`}>
                    {item.category}
                  </span>
                  {item.shortcut && <kbd className="text-[9px] text-muted bg-surface px-2 py-0.5 rounded-lg font-mono border border-border-dim shadow-inner font-black">{item.shortcut}</kbd>}
                  <ChevronRight size={14} className="text-muted/40" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 border-t border-border-dim flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-muted/60 bg-surface/30">
          <span className="flex items-center gap-2"><kbd className="bg-surface border border-border-dim px-2 py-0.5 rounded-lg font-mono text-[10px] text-main-text shadow-inner">↑↓</kbd> Navigate</span>
          <span className="flex items-center gap-2"><kbd className="bg-surface border border-border-dim px-2 py-0.5 rounded-lg font-mono text-[10px] text-main-text shadow-inner">↵</kbd> Execute</span>
          <span className="flex items-center gap-2"><kbd className="bg-surface border border-border-dim px-2 py-0.5 rounded-lg font-mono text-[10px] text-main-text shadow-inner">ESC</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
