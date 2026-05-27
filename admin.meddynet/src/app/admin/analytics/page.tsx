"use client";
import { useState } from "react";
import { StatCard } from "@/components/admin/ui/StatCard";
import { TrendingUp, Users, Download} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

// Mock datasets for analytics
const signupData = [
  { date: "Jan", signups: 42 }, { date: "Feb", signups: 65 }, { date: "Mar", signups: 38 },
  { date: "Apr", signups: 89 }, { date: "May", signups: 72 }, { date: "Jun", signups: 95 },
  { date: "Jul", signups: 58 }, { date: "Aug", signups: 110 },
];

const cityUsers = [
  { city: "Mumbai", users: 18200 }, { city: "Delhi", users: 12400 }, { city: "Bangalore", users: 14500 },
  { city: "Hyderabad", users: 11200 }, { date: "Pune", users: 7600 }, { city: "Chennai", users: 9800 },
  { city: "Kolkata", users: 6200 }, { city: "Ahmedabad", users: 7100 },
];

const funnelData = [
  { stage: "Visited", count: 48000, drop: null },
  { stage: "Searched", count: 32000, drop: 33 },
  { stage: "Viewed Lab", count: 21000, drop: 34 },
  { stage: "Initiated Booking", count: 12000, drop: 43 },
  { stage: "Completed", count: 9500, drop: 21 },
  { stage: "Reviewed", count: 4200, drop: 56 },
];

// Revenue heatmap data (day-of-week × hour)
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = ["6AM", "8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM"];
const heatmapData = DAYS.map((day) => ({
  day,
  hours: HOURS.map((hour) => ({
    hour,
    value: Math.floor(Math.random() * 100000) + 5000,
  })),
}));

// Cohort retention (6 months × 6 months since signup)
const COHORT_MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const cohortData = COHORT_MONTHS.map((month, i) => ({
  month,
  retention: Array.from({ length: 6 - i }, (_, j) => ({
    monthsSince: j,
    pct: Math.max(20, 100 - j * 18 - Math.floor(Math.random() * 8)),
  })),
}));

// Geographic table
const geoTable = [
  { city: "Mumbai", users: 18200, labs: 52, bookings: 3100, revenue: 4200000, rating: 4.6 },
  { city: "Delhi", users: 12400, labs: 45, bookings: 2340, revenue: 3100000, rating: 4.5 },
  { city: "Bangalore", users: 14500, labs: 38, bookings: 2780, revenue: 3800000, rating: 4.7 },
  { city: "Hyderabad", users: 11200, labs: 33, bookings: 1920, revenue: 2500000, rating: 4.5 },
  { city: "Chennai", users: 9800, labs: 28, bookings: 1650, revenue: 2100000, rating: 4.4 },
  { city: "Pune", users: 7600, labs: 22, bookings: 1280, revenue: 1600000, rating: 4.3 },
  { city: "Kolkata", users: 6200, labs: 18, bookings: 980, revenue: 1200000, rating: 4.2 },
  { city: "Ahmedabad", users: 7100, labs: 20, bookings: 1150, revenue: 1450000, rating: 4.4 },
];

function getHeatColor(value: number): string {
  const max = 100000;
  const pct = value / max;
  if (pct < 0.2) return "bg-green-950/60 dark:bg-green-950/80";
  if (pct < 0.4) return "bg-green-800/60 dark:bg-green-800/80";
  if (pct < 0.6) return "bg-green-600/60 dark:bg-green-600/80";
  if (pct < 0.8) return "bg-green-500/60 dark:bg-green-500/80";
  return "bg-green-400/60 dark:bg-green-400/80";
}

function getCohortColor(pct: number): string {
  if (pct >= 80) return "bg-green-500 text-white dark:bg-green-600";
  if (pct >= 60) return "bg-green-300 text-gray-900 dark:bg-green-700 dark:text-white";
  if (pct >= 40) return "bg-yellow-300 text-gray-900 dark:bg-yellow-600 dark:text-white";
  if (pct >= 20) return "bg-orange-300 text-gray-900 dark:bg-orange-600 dark:text-white";
  return "bg-red-400 text-white dark:bg-red-600";
}

const FUNNEL_COLORS = ["#00A86B", "#1E88E5", "#9333EA", "#F59E0B", "#EF4444", "#EC4899"];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d");
  const [sortGeo, setSortGeo] = useState<keyof (typeof geoTable)[0]>("bookings");

  const sortedGeo = [...geoTable].sort((a, b) => (b[sortGeo] as number) - (a[sortGeo] as number));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-main-text tracking-tight">Advanced Analytics</h1>
          <p className="text-sm text-muted font-medium mt-1">Deep platform insights across acquisition, engagement, and revenue.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-surface border border-border-dim/50 p-1 rounded-xl">
            {["7d", "30d", "90d", "1y"].map(range => (
              <button key={range} onClick={() => setDateRange(range)} className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all uppercase tracking-tighter ${dateRange === range ? "bg-card shadow-sm text-primary" : "text-muted hover:text-main-text"}`}>{range}</button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border-dim rounded-xl text-sm font-bold text-muted hover:text-main-text hover:bg-gray-50 dark:hover:bg-slate-800 shadow-sm transition-colors"><Download size={15}/> Export PDF</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="New Users" value="4,850" icon={Users} subtext="+12% vs last period" />
        <StatCard title="Avg Bookings/User" value="3.8" icon={TrendingUp} subtext="Repeat rate: 64%" />
        <StatCard title="Revenue (MTD)" value="₹24.8L" icon={TrendingUp} subtext="+8% vs last month" />
        <StatCard title="Platform NPS" value="72" icon={TrendingUp} subtext="Excellent" />
      </div>

      {/* Section A: Acquisition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border-dim shadow-sm p-6 transition-colors">
          <h3 className="font-bold text-main-text mb-4">New User Signups</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={signupData}>
                <defs><linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00A86B" stopOpacity={0.15}/><stop offset="95%" stopColor="#00A86B" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:opacity-10"/>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-text)"}} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-text)"}} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: "12px", 
                    border: "1px solid var(--border-color)", 
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", 
                    backgroundColor: "var(--card-bg)", 
                    color: "var(--foreground)" 
                  }}
                  itemStyle={{ fontWeight: "bold" }}
                />
                <Area type="monotone" dataKey="signups" stroke="#00A86B" strokeWidth={2.5} fill="url(#signupGrad)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border-dim shadow-sm p-6 transition-colors">
          <h3 className="font-bold text-main-text mb-4">City-Wise New Users</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityUsers} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" className="dark:opacity-10"/>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-text)"}} />
                <YAxis dataKey="city" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-text)"}} width={60} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: "12px", 
                    border: "1px solid var(--border-color)", 
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", 
                    backgroundColor: "var(--card-bg)", 
                    color: "var(--foreground)" 
                  }}
                  itemStyle={{ fontWeight: "bold" }}
                />
                <Bar dataKey="users" radius={[0, 6, 6, 0]} fill="#00A86B"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section B: Funnel */}
      <div className="bg-card rounded-xl border border-border-dim shadow-sm p-6 transition-colors">
        <h3 className="font-bold text-main-text mb-6">Conversion Funnel</h3>
        <div className="flex items-end gap-2">
          {funnelData.map((step, i) => {
            const maxCount = funnelData[0].count;
            const pct = (step.count / maxCount) * 100;
            return (
              <div key={step.stage} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-center mb-1">
                  <p className="text-base font-black text-main-text">{(step.count / 1000).toFixed(0)}k</p>
                  {step.drop !== null && <p className="text-xs text-red-500 dark:text-red-400 font-semibold">-{step.drop}%</p>}
                </div>
                <div className="w-full rounded-t-xl transition-all" style={{ height: `${pct * 1.8}px`, backgroundColor: FUNNEL_COLORS[i] }}/>
                <p className="text-[10px] text-muted font-black uppercase tracking-widest text-center leading-tight">{step.stage}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section C: Revenue Heatmap */}
      <div className="bg-card rounded-xl border border-border-dim shadow-sm p-6 transition-colors">
        <h3 className="font-bold text-main-text mb-4">Revenue Heatmap (Day × Hour)</h3>
        <p className="text-xs text-muted mb-4 font-bold uppercase tracking-tight">Darker = higher revenue. Hover for exact amount.</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="w-12 text-xs text-muted font-bold text-left pr-2"></th>
                {HOURS.map(h => <th key={h} className="text-[10px] text-muted font-black uppercase pb-2 text-center">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {heatmapData.map(row => (
                <tr key={row.day}>
                  <td className="text-xs text-muted font-black uppercase pr-3 py-0.5">{row.day}</td>
                  {row.hours.map(cell => (
                    <td key={cell.hour} className="py-0.5 px-0.5" title={`₹${cell.value.toLocaleString()}`}>
                      <div className={`h-8 w-full rounded ${getHeatColor(cell.value)} transition-all hover:scale-110 cursor-pointer`}/>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-[10px] text-muted font-black uppercase tracking-widest">Low</span>
          {["bg-green-950/60", "bg-green-800/60", "bg-green-600/60", "bg-green-500/60", "bg-green-400/60"].map(c => <div key={c} className={`w-6 h-3 rounded ${c}`}/>)}
          <span className="text-[10px] text-muted font-black uppercase tracking-widest">High</span>
        </div>
      </div>

      {/* Section D: Cohort Retention */}
      <div className="bg-card rounded-xl border border-border-dim shadow-sm p-6 transition-colors">
        <h3 className="font-bold text-main-text mb-4">Cohort Retention</h3>
        <p className="text-xs text-muted mb-4 font-bold uppercase tracking-tight">% of users still active N months after signup</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-xs text-muted font-black uppercase text-left pb-2 pr-4 tracking-widest">Signup Month</th>
                {["Month 0", "Month 1", "Month 2", "Month 3", "Month 4", "Month 5"].map(h => <th key={h} className="text-[10px] text-muted font-black uppercase pb-2 text-center px-1 tracking-tighter">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {cohortData.map(row => (
                <tr key={row.month}>
                  <td className="text-sm font-bold text-main-text pr-4 py-1">{row.month}</td>
                  {Array.from({ length: 6 }, (_, j) => {
                    const d = row.retention.find(r => r.monthsSince === j);
                    return (
                      <td key={j} className="py-1 px-1">
                        {d ? (
                          <div className={`h-9 min-w-[60px] rounded-lg flex items-center justify-center text-xs font-bold ${getCohortColor(d.pct)}`}>{d.pct}%</div>
                        ) : (
                          <div className="h-9 min-w-[60px] rounded-lg bg-surface border border-border-dim/30"/>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section E: Geographic Distribution */}
      <div className="bg-card rounded-xl border border-border-dim shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-border-dim flex items-center justify-between bg-gray-50/30 dark:bg-slate-900/40">
          <h3 className="font-bold text-main-text">Geographic Distribution</h3>
          <div className="flex items-center gap-2 text-xs text-muted font-bold uppercase tracking-tighter">
            Sort by:
            {(["users", "labs", "bookings", "revenue", "rating"] as const).map(col => (
              <button key={col} onClick={() => setSortGeo(col)} className={`px-2.5 py-1 rounded-lg font-black capitalize transition-all border ${sortGeo === col ? "bg-primary text-white border-primary shadow-sm" : "border-border-dim text-muted hover:border-primary/50 hover:text-primary bg-card"}`}>{col}</button>
            ))}
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50/50 dark:bg-slate-900/60 border-b border-border-dim">
            <tr>{["City", "Users", "Labs", "Bookings MTD", "Revenue MTD", "Avg Rating"].map(h => <th key={h} className="px-5 py-3 text-[10px] font-black uppercase text-muted text-left tracking-widest">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border-dim/50">
            {sortedGeo.map(row => (
              <tr key={row.city} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-5 py-3 font-bold text-main-text text-sm">{row.city}</td>
                <td className="px-5 py-3 text-sm text-main-text/80">{row.users.toLocaleString()}</td>
                <td className="px-5 py-3 text-sm text-main-text/80">{row.labs}</td>
                <td className="px-5 py-3 text-sm text-main-text/80">{row.bookings.toLocaleString()}</td>
                <td className="px-5 py-3 text-sm font-black text-main-text">₹{(row.revenue / 100000).toFixed(1)}L</td>
                <td className="px-5 py-3 text-sm font-black text-amber-500">{row.rating} ★</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}