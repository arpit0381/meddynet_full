"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Users, FlaskConical, Calendar, CreditCard, Banknote, LifeBuoy,
  CheckCircle2, RefreshCw, Bell, Tag, FileText,
  Pause, Play, ArrowUpRight, Server, Building2
} from "lucide-react";
import { StatCard } from "@/components/admin/ui/StatCard";
import { useAdminStats } from "@/lib/hooks";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

// Trend data constants removed, now using live stats from backend

// Booking type constants removed, now using live stats from backend

interface FeedEvent {
  id: string;
  type: string;
  title: string;
  detail: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  time: Date;
}

const EVENT_TEMPLATES = [
  { type: "new_booking", title: "New booking created", details: ["CBC for Ramesh Kumar at Apex Diagnostics", "Lipid Profile for Priya Sharma at CityLab", "Thyroid Panel for Arun Patel at HealthPlus"], icon: Calendar, color: "text-blue-600", bgColor: "bg-blue-50" },
  { type: "new_user", title: "New user registered", details: ["Kavita Singh from Delhi", "Deepak Verma from Pune", "Anita Nair from Kochi"], icon: Users, color: "text-purple-600", bgColor: "bg-purple-50" },
  { type: "report_uploaded", title: "Report uploaded", details: ["Apex Diagnostics: HbA1c report ready", "HealthPlus: Blood Panel report ready", "Acme Labs: Lipid report ready"], icon: FileText, color: "text-amber-600", bgColor: "bg-amber-50" },
  { type: "lab_verified", title: "Lab verified", details: ["VitaLab Diagnostics is now live", "MetroScan Labs approved", "BioTest Diagnostics verified"], icon: CheckCircle2, color: "text-green-600", bgColor: "bg-green-50" },
  { type: "support_ticket", title: "Support ticket opened", details: ["High priority: 'App crash on payment'", "Medium: 'Report not received'", "High: 'Technician didn't arrive'"], icon: LifeBuoy, color: "text-red-500", bgColor: "bg-red-50" },
  { type: "refund_requested", title: "Refund requested", details: ["₹1,200 - Booking BKG-20042", "₹850 - Booking BKG-20078", "₹2,100 - Booking BKG-20015"], icon: RefreshCw, color: "text-orange-500", bgColor: "bg-orange-50" },
  { type: "coupon_used", title: "Coupon redeemed", details: ["WELCOME100 used by Nikita Choudhary", "SAVE20 used by Rohit Kapoor", "THYROID15 used by Lalitha Subramanian"], icon: Tag, color: "text-indigo-500", bgColor: "bg-indigo-50" },
  { type: "notification_sent", title: "Notification sent", details: ["Broadcast to 4,850 users", "SMS to 120 pending booking patients", "Email digest sent to 220 labs"], icon: Bell, color: "text-teal-500", bgColor: "bg-teal-50" },
];

let eventCounter = 0;
function generateEvent(): FeedEvent {
  const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
  const detail = template.details[Math.floor(Math.random() * template.details.length)];
  eventCounter++;
  return { id: `evt-${Date.now()}-${eventCounter}`, type: template.type, title: template.title, detail, icon: template.icon, color: template.color, bgColor: template.bgColor, time: new Date() };
}

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

const INITIAL_EVENTS: FeedEvent[] = Array.from({ length: 8 }, (_, i) => {
  const e = generateEvent();
  e.time = new Date(Date.now() - i * 45000);
  return e;
});

interface ActivityEntry {
  _id: string;
  action: string;
  resource?: string;
  message?: string;
  created_at?: string;
  timestamp?: string;
}

export default function OverviewPage() {
  const [feedPaused, setFeedPaused] = useState(false);
  
  const { data: stats, isLoading } = useAdminStats();

  const feedEvents = useMemo<FeedEvent[]>(() => {
    if (!stats?.recent_activity) return INITIAL_EVENTS;
    return stats.recent_activity.map((act: ActivityEntry) => {
      let template = EVENT_TEMPLATES.find(t => t.type === act.action) || EVENT_TEMPLATES[1];
      if (act.action === "onboard" && act.resource === "lab") {
        template = { type: "lab_onboard", title: "New Lab Onboarding", details: [act.message || ""], icon: Building2, color: "text-amber-600", bgColor: "bg-amber-50" };
      }
      return {
        id: act._id,
        type: act.action,
        title: template.title,
        detail: act.message || `${act.action} ${act.resource}`,
        icon: template.icon,
        color: template.color,
        bgColor: template.bgColor,
        time: new Date(act.created_at || act.timestamp || Date.now())
      };
    });
  }, [stats]);


  if (isLoading || !stats) return (
    <div className="h-[60vh] flex items-center justify-center">
      <RefreshCw className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Platform Status Banner */}
      <Link href="/admin/platform-health" className="flex items-center gap-3 p-3.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
        <span className="text-sm font-semibold text-green-700 dark:text-green-400">All systems operational</span>
        <ArrowUpRight size={15} className="text-green-500 ml-auto group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </Link>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 border-b border-border-dim pb-6">
        <StatCard title="Total Users" value={stats.total_users.toLocaleString()} delta={{ value: "+12%", trend: "up" }} subtext="vs last month" icon={Users} />
        <StatCard title="Partner Labs" value={stats.total_labs.toString()} subtext={`${stats.pending_labs} pending verification`} icon={FlaskConical} />
        <StatCard title="Bookings Today" value={stats.bookings_today.toString()} delta={{ value: "+5%", trend: "up" }} subtext="vs yesterday" icon={Calendar} />
        <StatCard title="Revenue MTD" value={`₹${stats.revenue_mtd.toLocaleString()}`} delta={{ value: "+18%", trend: "up" }} subtext="vs last month" icon={CreditCard} />
        <StatCard title="Pending Payouts" value="₹3.2L" subtext="45 labs waiting" icon={Banknote} />
        <StatCard title="Open Support" value={stats.open_support_tickets.toString()} subtext="5 high priority" icon={LifeBuoy} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 bg-card p-6 rounded-xl border border-border-dim shadow-sm transition-colors">
          <h3 className="text-lg font-bold mb-6 text-main-text">Bookings & Revenue (Last 30 Days)</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={stats.performance_data || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:opacity-10" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--muted-text)' }} 
                  dy={10} 
                />
                <YAxis 
                  yAxisId="left" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--muted-text)' }} 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--muted-text)' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid var(--border-color)', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                    backgroundColor: 'var(--card-bg)', 
                    color: 'var(--foreground)' 
                  }} 
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconType="circle" />
                <Line yAxisId="left" type="monotone" dataKey="bookings" name="Bookings" stroke="#1E88E5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#00A86B" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-2 bg-card p-6 rounded-xl border border-border-dim shadow-sm flex flex-col transition-colors">
          <h3 className="text-lg font-bold mb-4 text-main-text">Booking Types</h3>
          <div className="flex-1 h-[240px] w-full relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie data={stats.booking_types_data || []} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value">
                  {(stats.booking_types_data || []).map((entry: { name: string; value: number; color: string }, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value}%`} 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid var(--border-color)', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                    backgroundColor: 'var(--card-bg)', 
                    color: 'var(--foreground)' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-3xl font-black text-main-text">12.4k</span>
              <span className="text-sm font-bold text-muted uppercase tracking-tighter">Total Bookings</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {(stats.booking_types_data || []).map((item: { name: string; color: string; value: number }) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted font-bold uppercase tracking-tight text-[10px]">{item.name}</span>
                <span className="font-black text-main-text">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Feed + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Activity Feed */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border-dim shadow-sm overflow-hidden transition-colors">
          <div className="flex items-center justify-between p-5 border-b border-border-dim">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h3 className="font-bold text-main-text">Live Activity Feed</h3>
            </div>
            <button
              onClick={() => setFeedPaused(p => !p)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border transition-colors ${feedPaused ? "border-primary text-primary bg-primary/5" : "border-border-dim text-muted hover:bg-gray-100 dark:hover:bg-slate-800"}`}
            >
              {feedPaused ? <Play size={12} /> : <Pause size={12} />}
              {feedPaused ? "Resume" : "Pause"}
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto divide-y divide-border-dim/50">
            <AnimatePresence initial={false}>
              {feedEvents.map(event => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex items-center gap-4 px-5 py-3.5"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${event.bgColor} dark:bg-opacity-10`}>
                    <event.icon size={17} className={event.color} />
                  </div>
                   <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-main-text">{event.title}</p>
                    <p className="text-xs text-muted font-medium truncate">{event.detail}</p>
                  </div>
                  <span className="text-[10px] text-muted/60 font-black uppercase tracking-tight shrink-0">{timeAgo(event.time)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card p-6 rounded-xl border border-border-dim shadow-sm h-fit transition-colors">
          <h3 className="text-lg font-bold mb-4 text-main-text">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/admin/onboarding" className="w-full flex items-center justify-between p-3 rounded-lg border border-border-dim hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors text-left group">
              <span className="text-sm font-bold text-main-text/80 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">Approve Pending Labs</span>
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-black">3</span>
            </Link>
            <Link href="/admin/reports" className="w-full flex items-center justify-between p-3 rounded-lg border border-border-dim hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left group">
              <span className="text-sm font-bold text-main-text/80 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">View Flagged Reports</span>
              <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2.5 py-0.5 rounded-full text-[10px] font-black">4</span>
            </Link>
            <Link href="/admin/financials" className="w-full flex items-center justify-between p-3 rounded-lg border border-border-dim hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors text-left group">
              <span className="text-sm font-bold text-main-text/80 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Process Payouts</span>
              <span className="bg-surface border border-border-dim/50 text-muted px-2.5 py-0.5 rounded-full text-[10px] font-black">45</span>
            </Link>
            <Link href="/admin/refunds" className="w-full flex items-center justify-between p-3 rounded-lg border border-border-dim hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors text-left group">
              <span className="text-sm font-bold text-main-text/80 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Review Refund Requests</span>
              <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2.5 py-0.5 rounded-full text-[10px] font-black">8</span>
            </Link>
            <Link href="/admin/platform-health" className="w-full flex items-center justify-between p-3 rounded-lg border border-border-dim hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors text-left group">
              <span className="text-sm font-bold text-main-text/80 group-hover:text-primary transition-colors">Platform Health</span>
              <Server size={16} className="text-primary/70" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
