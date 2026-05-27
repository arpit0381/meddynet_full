"use client";
import { useState, useMemo } from "react";
import { ThumbsUp, Minus, ThumbsDown, TrendingUp, Download } from "lucide-react";
import { mockReviews } from "@/data/reviews";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const KEYWORDS = ["fast", "accurate", "professional", "clean", "late", "wrong", "excellent", "helpful", "recommend", "error", "delay", "good", "bad", "outstanding", "poor", "rude", "friendly", "detailed", "quick", "slow"];

function extractKeywords(reviews: typeof mockReviews) {
  const freq: Record<string, number> = {};
  reviews.forEach(r => {
    KEYWORDS.forEach(kw => {
      if (r.text.toLowerCase().includes(kw)) freq[kw] = (freq[kw] || 0) + 1;
    });
  });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]);
}

const npsMonthly = [
  { month: "Apr", nps: 58 }, { month: "May", nps: 61 }, { month: "Jun", nps: 63 },
  { month: "Jul", nps: 68 }, { month: "Aug", nps: 65 }, { month: "Sep", nps: 70 },
  { month: "Oct", nps: 72 }, { month: "Nov", nps: 69 }, { month: "Dec", nps: 74 },
  { month: "Jan", nps: 71 }, { month: "Feb", nps: 75 }, { month: "Mar", nps: 72 },
];

function NpsGauge({ score }: { score: number }) {
  const angle = -140 + (score / 100) * 280;
  const color = score < 30 ? "#EF4444" : score < 60 ? "#F59E0B" : "#10B981";
  const label = score < 30 ? "Critical Scope" : score < 60 ? "Stable Protocol" : "Optimal Efficiency";
  return (
    <div className="flex flex-col items-center">
      <svg width="220" height="140" viewBox="0 0 200 130">
        <path d="M20 110 A80 80 0 0 1 180 110" fill="none" stroke="var(--border-color)" strokeWidth="16" strokeLinecap="round" opacity="0.2" />
        <path d="M20 110 A80 80 0 0 1 180 110" fill="none" stroke={color} strokeWidth="16" strokeDasharray={`${(score / 100) * 251} 251`} strokeLinecap="round" opacity="0.8" />
        <g transform={`rotate(${angle}, 100, 110)`}><line x1="100" y1="110" x2="100" y2="42" stroke="var(--main-text)" strokeWidth="3" strokeLinecap="round" /></g>
        <circle cx="100" cy="110" r="7" fill="var(--main-text)" stroke="var(--card-bg)" strokeWidth="2" />
        <text x="100" y="95" textAnchor="middle" fontSize="32" fontWeight="900" fill="var(--main-text)" className="italic italic tracking-tighter">{score}</text>
      </svg>
      <p className="text-[10px] font-black uppercase tracking-widest mt-2 px-3 py-1 bg-surface border border-border-dim rounded-lg shadow-sm" style={{ color }}>{label}</p>
    </div>
  );
}

export default function FeedbackPage() {
  const reviews = mockReviews;
  const [filterKw, setFilterKw] = useState<string | null>(null);
  const [filterSentiment, setFilterSentiment] = useState("All");

  const promoters = reviews.filter(r => r.npsScore >= 9).length;
  const passives = reviews.filter(r => r.npsScore >= 7 && r.npsScore <= 8).length;
  const detractors = reviews.filter(r => r.npsScore <= 6).length;
  const total = reviews.length;
  const npsScore = Math.round(((promoters - detractors) / total) * 100);

  const keywords = useMemo(() => extractKeywords(reviews), [reviews]);
  const maxFreq = keywords[0]?.[1] || 1;

  const filteredReviews = useMemo(() => reviews.filter(r => {
    if (filterKw && !r.text.toLowerCase().includes(filterKw)) return false;
    if (filterSentiment !== "All" && r.sentiment !== filterSentiment) return false;
    return true;
  }), [reviews, filterKw, filterSentiment]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-dim pb-6">
        <div>
          <h1 className="text-2xl font-black text-main-text tracking-tight uppercase italic">NPS & Satisfaction Intelligence</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1.5 opacity-80">Audit of Patient Perceptions and Relational Value Metrics</p>
        </div>
        <button className="flex items-center gap-2.5 px-6 py-3 bg-card border border-border-dim rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted hover:text-main-text hover:border-primary/30 transition-all shadow-sm active:scale-95">
          <Download size={18} /> Export perception Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NPS Score Gauge */}
        <div className="bg-card rounded-3xl border border-border-dim shadow-sm p-8 flex flex-col items-center transition-all hover:shadow-xl hover:border-border-bright group">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-6 group-hover:text-primary transition-colors italic">Aggregate NPS Score</h3>
          <NpsGauge score={npsScore} />
          {/* Stacked bar */}
          <div className="w-full mt-10 space-y-3">
            {[
              { label: "Promoters", count: promoters, color: "bg-green-500", pct: Math.round((promoters / total) * 100) },
              { label: "Passives", count: passives, color: "bg-amber-500", pct: Math.round((passives / total) * 100) },
              { label: "Detractors", count: detractors, color: "bg-red-500", pct: Math.round((detractors / total) * 100) },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-4 group/item">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0 group-hover/item:scale-125 transition-transform shadow-[0_0_8px_rgba(var(--primary-rgb),0.2)]`} />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted/60 w-24">{item.label}</span>
                <div className="flex-1 h-1.5 bg-surface border border-border-dim rounded-full overflow-hidden shadow-inner">
                  <div className={`h-full ${item.color} rounded-full transition-all group-hover/item:opacity-100 opacity-80`} style={{ width: `${item.pct}%` }} />
                </div>
                <span className="text-[10px] font-black text-muted w-10 text-right italic">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* NPS Trend */}
        <div className="lg:col-span-2 bg-card rounded-3xl border border-border-dim shadow-sm p-8 flex flex-col transition-all hover:shadow-xl hover:border-border-bright group">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-8 group-hover:text-primary transition-colors italic">Longitudinal NPS Index (12 Month Scope)</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={npsMonthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: "var(--muted-text)", opacity: 0.8 }} />
                <YAxis domain={[40, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: "var(--muted-text)", opacity: 0.8 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)' }} labelStyle={{ fontWeight: 900, color: 'var(--main-text)', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }} />
                <Line type="monotone" dataKey="nps" stroke="var(--primary-color)" strokeWidth={4} dot={{ r: 5, fill: "var(--primary-color)", strokeWidth: 2, stroke: "var(--card-bg)" }} activeDot={{ r: 8, strokeWidth: 0, fill: "var(--primary-color)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Common Themes Word Cloud */}
      <div className="bg-card rounded-3xl border border-border-dim shadow-sm p-8">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-8 italic">Semantic Cluster Identification</h3>
        <div className="flex flex-wrap gap-4 items-center">
          {keywords.map(([kw, freq]) => {
            const size = 10 + Math.round((freq / maxFreq) * 14);
            const isActive = filterKw === kw;
            return (
              <button key={kw} onClick={() => setFilterKw(isActive ? null : kw)}
                className={`px-5 py-2.5 rounded-2xl font-black uppercase tracking-widest border transition-all cursor-pointer shadow-sm active:scale-95 ${isActive ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-surface border-border-dim text-muted hover:text-main-text hover:border-primary/40"}`}
                style={{ fontSize: size }}>
                {kw} <span className={`text-[9px] font-black ml-1.5 ${isActive ? "text-white/60" : "text-muted/40"}`}>{freq}</span>
              </button>
            );
          })}
        </div>
        {filterKw && <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-6 flex items-center gap-2">
          <TrendingUp size={14}/> Isolation active: &quot;{filterKw}&quot; cluster — <button onClick={() => setFilterKw(null)} className="underline decoration-primary/30 underline-offset-4 hover:text-primary/70">Reset dimensionality</button>
        </p>}
      </div>

      {/* Feedback Table */}
      <div className="bg-card rounded-3xl border border-border-dim shadow-sm overflow-hidden transition-all">
        <div className="p-6 border-b border-border-dim flex items-center justify-between bg-surface/30">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-main-text italic">Entity Observations ({filteredReviews.length})</h3>
            <p className="text-[8px] font-black uppercase tracking-widest text-muted/60 mt-1">Raw perception stream audit</p>
          </div>
          <select value={filterSentiment} onChange={e => setFilterSentiment(e.target.value)} className="px-4 py-2 bg-input border border-border-dim rounded-xl text-[10px] font-black uppercase tracking-widest text-muted outline-none hover:text-main-text focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer">
            <option value="All">ALL DIMENSIONS</option>
            <option value="Positive">POSITIVE FEEDBACK</option>
            <option value="Neutral">NEUTRAL SCOPE</option>
            <option value="Negative">NEGATIVE ANOMALY</option>
          </select>
        </div>
        <div className="divide-y divide-border-dim scrollbar-custom">
          {filteredReviews.slice(0, 10).map(r => {
            const Icon = r.sentiment === "Positive" ? ThumbsUp : r.sentiment === "Negative" ? ThumbsDown : Minus;
            const color = r.sentiment === "Positive" ? "text-green-500" : r.sentiment === "Negative" ? "text-red-500" : "text-muted/40";
            return (
              <div key={r.id} className="px-6 py-6 flex items-start gap-5 hover:bg-surface/50 transition-all group">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-xs flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform uppercase tracking-widest">{r.patientName.split(" ").map(n => n[0]).join("").slice(0,2)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-black text-main-text text-xs uppercase tracking-tight leading-none">{r.patientName}</p>
                    <span className="opacity-20 text-muted">/</span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted/60 leading-none">{r.labName}</p>
                  </div>
                  <p className="text-[13px] font-medium text-main-text/70 line-clamp-2 leading-relaxed italic group-hover:text-main-text transition-colors">&quot;{r.text}&quot;</p>
                </div>
                <div className="flex items-center gap-5 shrink-0">
                  <span className="text-[10px] font-black text-main-text bg-input px-3 py-1.5 rounded-xl border border-border-dim shadow-inner italic uppercase tracking-widest">NPS index {r.npsScore}</span>
                  <div className={`p-2 rounded-xl transition-all ${r.sentiment === "Positive" ? "bg-green-500/10" : r.sentiment === "Negative" ? "bg-red-500/10" : "bg-muted/10 opacity-40"}`}>
                    <Icon size={18} className={color} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
