"use client";
import { useState } from "react";
import { DataTable, Column } from "@/components/admin/ui/DataTable";
import { StatCard } from "@/components/admin/ui/StatCard";
import { Modal } from "@/components/admin/ui/Modal";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { PermissionGate } from "@/components/admin/ui/PermissionGate";
import { Key, Plus, Eye, RotateCcw, Ban, Copy, Activity, AlertCircle, CheckCircle2, Zap } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  lab: string;
  plan: "Advanced" | "Premium";
  createdAt: string;
  lastUsed: string | null;
  status: "Active" | "Revoked";
  permissions: string[];
  keyPreview: string;
  expiry: string | null;
  callsToday: number;
}

const initialKeys: ApiKey[] = [
  { id: "KEY-001", name: "Booking Integration", lab: "Apex Diagnostics", plan: "Premium", createdAt: "2026-01-10T10:00:00Z", lastUsed: "2026-03-23T11:30:00Z", status: "Active", permissions: ["read:bookings", "write:bookings", "read:reports"], keyPreview: "mk_live_apex_***************xyz1", expiry: null, callsToday: 342 },
  { id: "KEY-002", name: "Report Sync", lab: "HealthPlus Diagnostics", plan: "Premium", createdAt: "2026-02-05T09:00:00Z", lastUsed: "2026-03-23T10:15:00Z", status: "Active", permissions: ["read:reports", "write:reports", "read:tests"], keyPreview: "mk_live_hlth_***************abc2", expiry: "2026-05-05T23:59:59Z", callsToday: 128 },
  { id: "KEY-003", name: "Test Catalog Sync", lab: "Acme Labs", plan: "Advanced", createdAt: "2025-12-15T10:00:00Z", lastUsed: "2026-03-22T16:00:00Z", status: "Active", permissions: ["read:tests", "read:bookings"], keyPreview: "mk_live_acme_***************def3", expiry: null, callsToday: 67 },
  { id: "KEY-004", name: "Old Integration", lab: "CityLab Diagnostics", plan: "Advanced", createdAt: "2025-09-01T10:00:00Z", lastUsed: "2025-11-20T09:00:00Z", status: "Revoked", permissions: ["read:bookings"], keyPreview: "mk_live_city_***************ghi4", expiry: null, callsToday: 0 },
  { id: "KEY-005", name: "Finance API", lab: "LifeCare Diagnostics", plan: "Premium", createdAt: "2026-03-01T10:00:00Z", lastUsed: "2026-03-23T08:00:00Z", status: "Active", permissions: ["read:bookings", "read:reports", "write:bookings"], keyPreview: "mk_live_life_***************jkl5", expiry: "2027-03-01T23:59:59Z", callsToday: 215 },
];

const ALL_PERMISSIONS = ["read:bookings", "write:bookings", "read:reports", "write:reports", "read:tests"];
const ELIGIBLE_LABS = ["Apex Diagnostics", "HealthPlus Diagnostics", "Acme Labs", "CityLab Diagnostics", "LifeCare Diagnostics", "VitaLab Diagnostics"];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [modal, setModal] = useState<{ isOpen: boolean; newKey: string | null }>({ isOpen: false, newKey: null });
  const [createForm, setCreateForm] = useState({ name: "", lab: ELIGIBLE_LABS[0], permissions: new Set<string>(["read:bookings"]), expiry: "never" });
  const [createOpen, setCreateOpen] = useState(false);
  const [revokeDialog, setRevokeDialog] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [copied, setCopied] = useState(false);

  const handleCreate = () => {
    const newKey = `mk_live_${createForm.lab.slice(0,4).toLowerCase().replace(/\s/g,'_')}_${Math.random().toString(36).slice(2)}`;
    const key: ApiKey = {
      id: `KEY-${Date.now()}`, name: createForm.name, lab: createForm.lab, plan: "Advanced",
      createdAt: new Date().toISOString(), lastUsed: null, status: "Active",
      permissions: Array.from(createForm.permissions),
      keyPreview: newKey.slice(0, 20) + "***", expiry: createForm.expiry === "never" ? null : new Date(Date.now() + parseInt(createForm.expiry) * 86400000).toISOString(),
      callsToday: 0,
    };
    setKeys([key, ...keys]);
    setCreateOpen(false);
    setModal({ isOpen: true, newKey });
  };

  const handleRevoke = (id: string) => {
    setKeys(keys.map(k => k.id === id ? { ...k, status: "Revoked" } : k));
    setRevokeDialog({ isOpen: false, id: null });
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const columns: Column<ApiKey>[] = [
    { 
      header: "Key Identification", 
      accessor: (k) => (
        <div className="flex flex-col gap-1 py-1">
          <p className="font-black text-main-text text-[13px] uppercase tracking-tight leading-none group-hover:text-primary transition-colors">{k.name}</p>
          <p className="font-mono text-[10px] text-muted opacity-60 uppercase tracking-widest">{k.keyPreview}</p>
        </div>
      ) 
    },
    { 
      header: "Origin Entity (Lab)", 
      accessor: (k) => (
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-black text-main-text uppercase tracking-tighter opacity-90">{k.lab}</p>
          <div className="flex"><StatusBadge status={k.plan === "Premium" ? "success" : "info"} label={k.plan.toUpperCase()} /></div>
        </div>
      ) 
    },
    { header: "Deployment", accessor: (k) => <span className="font-mono text-[10px] text-muted/70 uppercase">{new Date(k.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span> },
    { header: "Last Activity", accessor: (k) => k.lastUsed ? <span className="font-mono text-[10px] text-main-text font-black uppercase opacity-80 italic">{new Date(k.lastUsed).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span> : <span className="text-[9px] font-black text-muted/30 uppercase tracking-widest">INITIALIZED_ONLY</span> },
    { header: "Telemetry (24h)", accessor: (k) => <div className="flex items-center gap-2 text-main-text font-black text-xs uppercase italic"><Zap size={14} className={k.callsToday > 200 ? "text-primary animate-pulse" : "text-muted opacity-40"}/> {k.callsToday.toLocaleString()} CALLS</div> },
    { header: "Scopes", accessor: (k) => <div className="flex flex-wrap gap-1.5 max-w-[200px]">{k.permissions.map(p => <span key={p} className="text-[8px] font-black px-2 py-1 bg-primary/5 text-primary rounded-lg border border-primary/20 uppercase tracking-widest group-hover:bg-primary/10 transition-all">{p.split(':')[1]}</span>)}</div> },
    { header: "Operational State", accessor: (k) => <StatusBadge status={k.status === "Active" ? "success" : "error"} label={k.status.toUpperCase()} /> },
    {
      header: "Actions",
      accessor: (k) => (
        <div className="flex items-center justify-end gap-1.5 text-muted">
          <button className="p-2 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all active:scale-90" title="Inspect Protocol"><Eye size={16}/></button>
          {k.status === "Active" && (
            <>
              <button className="p-2 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all active:scale-90" title="Rotate Credentials"><RotateCcw size={16}/></button>
              <PermissionGate permission="can_revoke_api_key">
                <button onClick={(e) => { e.stopPropagation(); setRevokeDialog({ isOpen: true, id: k.id }); }} className="p-2 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90" title="Purge Key"><Ban size={16}/></button>
              </PermissionGate>
            </>
          )}
        </div>
      )
    },
  ];

  const activeKeys = keys.filter(k => k.status === "Active");
  const totalCalls = keys.reduce((s, k) => s + k.callsToday, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-dim pb-6">
        <div>
          <h1 className="text-2xl font-black text-main-text tracking-tight uppercase italic">Access Key Orchestration</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1.5 opacity-80">Manage secure cryptographic channels for ADVANCED & PREMIUM entities</p>
        </div>
        <PermissionGate permission="can_create_api_key">
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2.5 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
            <Plus size={18}/> Initialize Access Key
          </button>
        </PermissionGate>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Keys" value={String(activeKeys.length)} icon={Key} />
        <StatCard title="API Calls Today" value={totalCalls.toLocaleString()} icon={Activity} />
        <StatCard title="Failed Calls Today" value="12" icon={AlertCircle} />
        <StatCard title="Rate Limited" value="3" icon={Zap} />
      </div>

      <DataTable data={keys} columns={columns} searchable />

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Initialize Access Credential"
        footer={<div className="flex justify-end gap-4 w-full">
          <button onClick={() => setCreateOpen(false)} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border border-border-dim rounded-xl text-muted hover:text-main-text hover:bg-surface transition-all">Abort Protocol</button>
          <button onClick={handleCreate} disabled={!createForm.name} className="px-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95">Generate Matrix</button>
        </div>}
      >
        <div className="space-y-6">
          <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-muted opacity-80">Credential Designation</label><input value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} className="w-full p-4 bg-input border border-border-dim rounded-2xl text-xs font-bold text-main-text outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all shadow-inner" placeholder="E.G. BOOKING INTEGRATION V2" /></div>
          <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-muted opacity-80">Select Authorizing Entity (Lab)</label>
            <select value={createForm.lab} onChange={e => setCreateForm({ ...createForm, lab: e.target.value })} className="w-full p-4 bg-input border border-border-dim rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 text-main-text appearance-none cursor-pointer transition-all hover:border-primary/30 shadow-inner">{ELIGIBLE_LABS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}</select>
          </div>
          <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted opacity-80">Authorization Scopes (Permissions)</label>
            <div className="grid grid-cols-2 gap-3 p-4 bg-surface rounded-3xl border border-border-dim/50 shadow-inner">
              {ALL_PERMISSIONS.map(p => (
                <label key={p} className="flex items-center gap-3 cursor-pointer group py-1.5 px-3 rounded-xl hover:bg-primary/5 transition-all">
                  <input type="checkbox" checked={createForm.permissions.has(p)} onChange={() => {
                    const next = new Set(createForm.permissions);
                    if (next.has(p)) next.delete(p); else next.add(p);
                    setCreateForm({ ...createForm, permissions: next });
                  }} className="w-4 h-4 rounded-lg bg-input border-border-dim text-primary focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer" />
                  <span className="font-mono text-[9px] font-black uppercase tracking-widest text-muted group-hover:text-primary transition-colors">{p}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-muted opacity-80">Lifecycle Duration (Expiry)</label>
            <select value={createForm.expiry} onChange={e => setCreateForm({ ...createForm, expiry: e.target.value })} className="w-full p-4 bg-input border border-border-dim rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 text-main-text appearance-none cursor-pointer transition-all hover:border-primary/30 shadow-inner">
              <option value="never">PERPETUAL ACCESS (NEVER EXPIRES)</option>
              <option value="30">30-DAY OPERATIONAL CYCLE</option>
              <option value="90">QUARTERLY RE-AUTHENTICATION (90 DAYS)</option>
              <option value="365">ANNUAL SECURITY REFRESH (1 YEAR)</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Key Reveal Modal */}
      <Modal isOpen={modal.isOpen} onClose={() => setModal({ isOpen: false, newKey: null })} title="Access Key Genesis Complete">
        <div className="space-y-6">
          <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-4 shadow-lg shadow-amber-500/5">
            <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 italic leading-relaxed">This key sequence is <strong>cryptographically transient</strong> and will not be displayed again. Commit to secure storage immediately.</p>
          </div>
          <div className="relative group">
            <input readOnly value={modal.newKey || ""} className="w-full p-5 font-mono text-[11px] bg-gray-950 text-green-400 rounded-2xl border border-border-dim/50 pr-28 outline-none shadow-inner group-hover:border-primary/30 transition-all" />
            <button onClick={() => copyKey(modal.newKey || "")} className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
              {copied ? <><CheckCircle2 size={14}/> COPIED</> : <><Copy size={14}/> CLONE</>}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={revokeDialog.isOpen} onClose={() => setRevokeDialog({ isOpen: false, id: null })} title="Revoke API Key" description="This key will immediately stop working. This action cannot be undone." confirmText="Revoke Key" isDestructive onConfirm={() => handleRevoke(revokeDialog.id!)} />
    </div>
  );
}
