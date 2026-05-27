"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/admin/ui/Modal";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { 
  Server, Database, Mail, MessageSquare, 
  CreditCard, Map, CheckCircle2, AlertCircle, XCircle, 
  RefreshCw, Clock, Zap, Activity as PulseIcon 
} from "lucide-react";

interface ServiceStatus {
  name: string;
  icon: React.ElementType;
  status: "operational" | "degraded" | "down";
  uptime: number;
  responseTime: number;
  history: number[]; // Last 24 response times
  lastChecked: string;
  incidents: { time: string; message: string; duration: string }[];
}

interface PerfMetric { label: string; value: number; unit: string; max: number; color: string }
interface ErrorLog { id: string; service: string; code: string; message: string; count: number; time: string }
interface ScheduledJob { name: string; lastRun: string; nextRun: string; status: "Success" | "Running" | "Failed" }

function generateInitialHistory() {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 150) + 50);
}

function simulateHealthData(prevServices?: ServiceStatus[]): { services: ServiceStatus[]; errors: ErrorLog[]; perf: PerfMetric[] } {
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const statuses: ServiceStatus["status"][] = ["operational", "operational", "operational", "operational", "degraded", "down"];

  const serviceNodes = [
    { name: "API Server", icon: Server },
    { name: "Database", icon: Database },
    { name: "File Storage (S3)", icon: Server },
    { name: "Email Service", icon: Mail },
    { name: "SMS Gateway", icon: MessageSquare },
    { name: "Payment Gateway", icon: CreditCard },
    { name: "Map Service", icon: Map },
  ];

  const services: ServiceStatus[] = serviceNodes.map((node, i) => {
    const prev = prevServices?.find(s => s.name === node.name);
    const currentResponse = rand(80, 250);
    const newHistory = prev ? [...prev.history.slice(1), currentResponse] : generateInitialHistory();
    
    return {
      ...node,
      status: i === 3 && rand(0, 10) > 8 ? "degraded" : statuses[rand(0, 3)],
      uptime: 99.5 + Math.random() * 0.5,
      responseTime: currentResponse,
      history: newHistory,
      lastChecked: new Date().toISOString(),
      incidents: prev?.incidents || (i === 0 ? [{ time: "2026-03-20 02:15 AM", message: "High latency spike detected", duration: "12 min" }] : [])
    };
  });

  const perf: PerfMetric[] = [
    { label: "API Response", value: services[0].responseTime, unit: "ms", max: 500, color: "#00A86B" },
    { label: "DB Query Avg", value: services[1].responseTime, unit: "ms", max: 200, color: "#1E88E5" },
    { label: "File Upload Avg", value: services[2].responseTime, unit: "ms", max: 1000, color: "#9333EA" },
  ];

  const errorCodes = ["ERR_TIMEOUT", "ERR_DB_CONN", "ERR_AUTH_FAIL", "ERR_RATE_LIMIT", "ERR_STORAGE"];
  const errors: ErrorLog[] = Array.from({ length: 6 }, (_, i) => ({
    id: `ERR-${1000 + i}`,
    service: ["API Server", "Database", "Email Service", "Payment Gateway"][i % 4],
    code: errorCodes[i % 5],
    message: ["Connection timeout after 30s", "Max connections exceeded", "JWT verification failed", "Rate limit hit: 100 req/min", "S3 bucket write failed"][i % 5],
    count: rand(1, 45),
    time: new Date(Date.now() - i * 1800000).toISOString(),
  }));

  return { services, errors, perf };
}

const scheduledJobs: ScheduledJob[] = [
  { name: "Daily Report Generation", lastRun: "2026-03-23T02:00:00Z", nextRun: "2026-03-24T02:00:00Z", status: "Success" },
  { name: "Payout Processing", lastRun: "2026-03-23T00:00:00Z", nextRun: "2026-03-24T00:00:00Z", status: "Success" },
  { name: "Audit Log Archival", lastRun: "2026-03-22T23:00:00Z", nextRun: "2026-03-23T23:00:00Z", status: "Success" },
  { name: "Email Digest Sender", lastRun: "2026-03-23T08:00:00Z", nextRun: "2026-03-23T20:00:00Z", status: "Success" },
  { name: "DB Backup", lastRun: "2026-03-23T02:30:00Z", nextRun: "2026-03-24T02:30:00Z", status: "Success" },
  { name: "Coupon Expiry Checker", lastRun: "2026-03-23T06:00:00Z", nextRun: "2026-03-24T06:00:00Z", status: "Failed" },
];

const statusConfig = {
  operational: { color: "bg-green-500", label: "Operational", badge: "text-green-500 bg-green-500/10 border-green-500/20" },
  degraded: { color: "bg-amber-400", label: "Degraded", badge: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  down: { color: "bg-red-500", label: "Down", badge: "text-red-500 bg-red-500/10 border-red-500/20" },
};

function Sparkline({ data, color }: { data: number[], color: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 60},${30 - ((v - min) / range) * 20}`).join(' ');

  return (
    <svg width="60" height="30" className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function ArcGauge({ value, max, color, label, unit }: { value: number; max: number; color: string; label: string; unit: string }) {
  const pct = Math.min(value / max, 1);
  const r = 40;
  const circ = Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="100" height="60" viewBox="0 0 100 60">
        <path d="M10 55 A40 40 0 0 1 90 55" fill="none" stroke="currentColor" className="text-border-dim" strokeWidth="8" strokeLinecap="round" />
        <path d="M10 55 A40 40 0 0 1 90 55" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.8s ease" }} />
        <text x="50" y="52" textAnchor="middle" className="text-sm font-black fill-main-text italic tracking-tighter" fontSize="14">{value}</text>
      </svg>
      <p className="text-[10px] font-black text-muted uppercase tracking-widest text-center">{label} <span className="opacity-40 italic">({unit})</span></p>
    </div>
  );
}

export default function PlatformHealthPage() {
  const [data, setData] = useState(() => simulateHealthData());
  const [liveLogs, setLiveLogs] = useState<ErrorLog[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceStatus | null>(null);

  const refresh = useCallback(async () => {
    setData(prev => simulateHealthData(prev.services));
    
    try {
      const response = await api.get("/admin/platform-health");
      const mappedLogs: ErrorLog[] = response.data.logs.map((log: { _id?: string, level: string, event: string, message: string, timestamp: string }, i: number) => ({
        id: log._id || `log-${i}`,
        service: log.level.toUpperCase(),
        code: log.event,
        message: log.message,
        count: 1,
        time: log.timestamp
      }));
      setLiveLogs(mappedLogs);
    } catch (error) {
      console.error("Failed to fetch live logs:", error);
    }
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(refresh, 5000); // Faster refresh for real-time feel
    return () => clearInterval(interval);
  }, [refresh, isPaused]);

  const degradedCount = data.services.filter(s => s.status === "degraded").length;
  const downCount = data.services.filter(s => s.status === "down").length;
  const allOk = degradedCount === 0 && downCount === 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <PulseIcon size={24} className={!isPaused ? "animate-pulse" : ""} />
            </div>
            {!isPaused && <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full animate-ping" />}
          </div>
          <div>
            <h1 className="text-2xl font-black text-main-text tracking-tight italic uppercase">System Pulse</h1>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{isPaused ? "Monitoring Paused" : "Live Diagnostics · Intercepting Packets"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsPaused(p => !p)} className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 ${isPaused ? "border-primary text-primary bg-primary/5 shadow-lg shadow-primary/5" : "border-border-dim text-muted hover:text-main-text hover:border-primary/30"}`}>
            {isPaused ? <Zap size={16} /> : <Clock size={16} />} {isPaused ? "Resume Live Monitoring" : "Pause Pulse Feed"}
          </button>
          <button onClick={refresh} className="flex items-center gap-2.5 px-6 py-3 bg-surface border border-border-dim rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted hover:text-main-text hover:border-primary/30 shadow-sm transition-all active:scale-95"><RefreshCw size={16} /> Force Protocol Sync</button>
        </div>
      </div>

      {allOk ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 rounded-xl border bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 shadow-sm">
          <CheckCircle2 size={18} />
          <p className="text-sm font-bold uppercase tracking-wider">All systems operational · Performance within SLA</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 rounded-xl border bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 shadow-sm">
          <AlertCircle size={18} className="animate-bounce" />
          <p className="text-sm font-bold uppercase tracking-wider">{downCount > 0 ? `${downCount} MISSION CRITICAL SERVICES DOWN` : `${degradedCount} SERVICES IN DEGRADED STATE`}</p>
        </motion.div>
      )}

      {/* Service Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.services.map(svc => {
          const cfg = statusConfig[svc.status];
          return (
            <button key={svc.name} onClick={() => setSelectedService(svc)} className="bg-card rounded-4xl border border-border-dim shadow-sm p-6 text-left hover:shadow-glow hover:border-primary/50 transition-all group relative overflow-hidden">
              <div className="flex items-start justify-between mb-6">
                <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 ${svc.status === 'operational' ? 'bg-surface/50 text-muted group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-hover:rotate-3 shadow-inner' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  <svc.icon size={24} />
                </div>
                <div className="flex flex-col items-end">
                   <div className={`w-2.5 h-2.5 rounded-full ${cfg.color} ${svc.status !== 'operational' ? 'animate-ping' : ''} shadow-lg`} />
                   <span className="text-[9px] font-black text-muted uppercase mt-2 tracking-widest opacity-60 italic">{cfg.label}</span>
                </div>
              </div>
              <p className="font-black text-main-text text-sm mb-1 uppercase tracking-tight italic">{svc.name}</p>
              <div className="flex items-end justify-between mt-4 border-t border-border-dim/30 pt-4">
                <div>
                  <p className="text-[9px] font-black text-muted uppercase tracking-[0.2em] opacity-40">{svc.uptime.toFixed(2)}% LIVE_UPTIME</p>
                  <p className="text-xl font-black text-main-text italic mt-0.5">{svc.responseTime}<span className="text-[10px] font-black text-muted ml-0.5 opacity-60">ms</span></p>
                </div>
                <Sparkline data={svc.history} color={svc.status === 'operational' ? '#10b981' : '#ef4444'} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6">
            <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">Real-time Performance Analysis</h3>
            <div className="grid grid-cols-3 gap-4">
              {data.perf.map(m => (
                <div key={m.label} className="p-4 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 flex flex-col items-center">
                   <ArcGauge value={m.value} max={m.max} color={m.color} label={m.label} unit={m.unit} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Active Incident Logs</h3>
              <span className="text-[10px] bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-black px-2 py-0.5 rounded uppercase">{data.errors.length} Anomalies</span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-slate-800">
              {liveLogs.map(e => (
                <div key={e.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${e.service === 'ERROR' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}><XCircle size={18} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-mono text-xs font-black ${e.service === 'ERROR' ? 'text-red-600' : 'text-blue-600'}`}>{e.code}</span>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{e.service}</span>
                    </div>
                    <p className="text-sm font-medium text-main-text truncate">{e.message}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{new Date(e.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-5 border-b border-gray-100 dark:border-slate-800"><h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Job Scheduler</h3></div>
            <div className="divide-y divide-gray-50 dark:divide-slate-800 flex-1 overflow-y-auto">
              {scheduledJobs.map(job => (
                <div key={job.name} className="px-5 py-4 flex items-center gap-4">
                  <div className={`w-2 h-10 rounded-full ${job.status === 'Success' ? 'bg-green-500' : job.status === 'Running' ? 'bg-blue-500' : 'bg-red-500'}`} title={job.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-main-text leading-tight">{job.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter mt-1">Next: {new Date(job.nextRun).toLocaleDateString()} · {new Date(job.nextRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <StatusBadge status={job.status === 'Success' ? 'success' : job.status === 'Running' ? 'warning' : 'error'} label={job.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <Modal isOpen={!!selectedService} onClose={() => setSelectedService(null)} title={selectedService.name}>
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-5 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800">
                <div className={`w-3 h-3 rounded-full ${statusConfig[selectedService.status].color} ${selectedService.status !== 'operational' ? 'animate-ping' : ''}`} />
                <span className={`text-xs font-black px-3 py-1 rounded-lg border uppercase tracking-wider ${statusConfig[selectedService.status].badge}`}>{statusConfig[selectedService.status].label}</span>
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-auto uppercase">{selectedService.uptime.toFixed(3)}% 30D AVG</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-800">
                  <p className="text-2xl font-black text-main-text">{selectedService.responseTime}<span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">ms</span></p>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Latency</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-800">
                  <p className="text-2xl font-black text-main-text">{selectedService.incidents.length}</p>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Incidents</p>
                </div>
              </div>
              {selectedService.incidents.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Event Timeline</h4>
                  <div className="space-y-3">
                    {selectedService.incidents.map((inc, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl text-sm">
                        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        <div><p className="font-bold text-amber-900 dark:text-amber-200">{inc.message}</p><p className="text-[10px] font-bold text-amber-700/60 dark:text-amber-400/60 uppercase tracking-tighter mt-1">{inc.time} · {inc.duration} Resolution</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
