"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatCard } from "@/components/admin/ui/StatCard";
import { DataTable, Column } from "@/components/admin/ui/DataTable";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { mockCoupons, Coupon } from "@/data/coupons";
import { Tag, Plus, Edit2, Trash2, Copy, Users, Percent, TrendingDown, BarChart2 } from "lucide-react";

function generateCode() {
  return "PROMO" + Math.random().toString(36).substring(2, 7).toUpperCase();
}

const emptyForm: Omit<Coupon, "id" | "usedCount"> = {
  code: "", type: "Flat", value: 0, minOrder: 0, maxDiscount: null,
  maxUses: 100, perUserLimit: 1, validFrom: new Date().toISOString().split("T")[0],
  validUntil: "", applicableTo: "All", labId: null, testName: null, status: "Active",
};

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface Redemption {
  id: string;
  couponCode: string;
  user: string;
  bookingId: string;
  discount: string;
  time: string;
}

const mockRedemptions: Redemption[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `RED-${3000 + i}`,
  couponCode: ["SAVE20", "HEALTH10", "WELCOME50"][i % 3],
  user: `User ${i + 100}`,
  bookingId: `BKG-${25000 + i}`,
  discount: `₹${(100 + i * 10)}`,
  time: "23 Mar 2026, 02:30 PM",
}));

const analyticsData = [
  { day: 'Mon', usage: 12 },
  { day: 'Tue', usage: 18 },
  { day: 'Wed', usage: 15 },
  { day: 'Thu', usage: 22 },
  { day: 'Fri', usage: 30 },
  { day: 'Sat', usage: 25 },
  { day: 'Sun', usage: 20 },
];

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [modal, setModal] = useState<{ isOpen: boolean; type: "create" | "edit"; coupon: Coupon | null }>({ isOpen: false, type: "create", coupon: null });
  const [analyticsModal, setAnalyticsModal] = useState<{ isOpen: boolean; coupon: Coupon | null }>({ isOpen: false, coupon: null });
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [activeTab, setActiveTab] = useState<"coupons" | "history">("coupons");

  const openCreate = () => { setForm(emptyForm); setModal({ isOpen: true, type: "create", coupon: null }); };
  const openEdit = (c: Coupon) => { setForm({ ...c }); setModal({ isOpen: true, type: "edit", coupon: c }); };
  const openDuplicate = (c: Coupon) => { setForm({ ...c, code: generateCode(), status: "Paused" }); setModal({ isOpen: true, type: "create", coupon: null }); };

  const handleSave = () => {
    if (modal.type === "create") {
      setCoupons([{ ...form, id: `CPN-${Date.now()}`, usedCount: 0 } as Coupon, ...coupons]);
    } else if (modal.coupon) {
      setCoupons(coupons.map(c => c.id === modal.coupon!.id ? { ...modal.coupon!, ...form } : c));
    }
    setModal({ isOpen: false, type: "create", coupon: null });
  };

  const columns: Column<Coupon>[] = [
    {
      header: "Code", accessor: (c) => (
        <span className="font-mono font-bold text-primary text-sm tracking-wider">{c.code}</span>
      )
    },
    { header: "Type", accessor: (c) => <StatusBadge status={c.type === "Flat" ? "neutral" : "info"} label={c.type === "Flat" ? `₹${c.value} Off` : `${c.value}% Off`} /> },
    { header: "Min Order", accessor: (c) => `₹${c.minOrder.toLocaleString()}` },
    {
      header: "Usage",
      accessor: (c) => (
        <div className="w-32 group/progress">
          <div className="flex justify-between text-[10px] font-black text-muted mb-1.5 uppercase tracking-widest opacity-60">
            <span>{c.usedCount} used</span><span>{c.maxUses} max</span>
          </div>
          <div className="h-1.5 bg-surface border border-border-dim rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-primary rounded-full transition-all group-hover/progress:shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]" style={{ width: `${Math.min((c.usedCount / c.maxUses) * 100, 100)}%` }} />
          </div>
        </div>
      )
    },
    { header: "Valid Until", accessor: (c) => <span className="font-mono text-[11px] text-main-text/70 uppercase">{new Date(c.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span> },
    { header: "Applies To", accessor: (c) => <span className="text-[10px] font-black uppercase tracking-widest text-muted bg-surface px-2.5 py-1 rounded-lg border border-border-dim transition-all group-hover:border-primary/20">{c.applicableTo}{c.testName ? `: ${c.testName}` : ""}</span> },
    { header: "Status", accessor: (c) => <StatusBadge status={c.status === "Active" ? "success" : c.status === "Expired" ? "error" : "warning"} label={c.status} /> },
    {
      header: "Actions",
      accessor: (c) => (
        <div className="flex items-center justify-end gap-1 text-muted">
          <button onClick={(e) => { e.stopPropagation(); setAnalyticsModal({ isOpen: true, coupon: c }); }} className="p-1.5 hover:text-accent hover:bg-accent/10 rounded-lg transition-all" title="Analytics"><BarChart2 size={15} /></button>
          <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="p-1.5 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Edit"><Edit2 size={15} /></button>
          <button onClick={(e) => { e.stopPropagation(); openDuplicate(c); }} className="p-1.5 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all" title="Duplicate"><Copy size={15} /></button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteDialog({ isOpen: true, id: c.id }); }} className="p-1.5 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Delete"><Trash2 size={15} /></button>
        </div>
      )
    },
  ];

  const historyColumns: Column<Redemption>[] = [
    { header: "ID", accessor: (r) => <span className="font-black text-xs uppercase tracking-widest text-muted/60">{r.id}</span> },
    { header: "Coupon", accessor: (r) => <span className="font-mono font-black text-primary uppercase tracking-widest text-xs px-2.5 py-1 bg-primary/10 rounded-lg border border-primary/20">{r.couponCode}</span> },
    { header: "Customer", accessor: (r) => <span className="font-bold text-main-text uppercase tracking-tight">{r.user}</span> },
    { header: "Booking", accessor: (r) => <span className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-primary transition-all underline decoration-primary/30 underline-offset-4 cursor-pointer">{r.bookingId}</span> },
    { header: "Discount", accessor: (r) => <span className="font-black text-green-500 text-sm">-{r.discount}</span> },
    { header: "Timestamp", accessor: (r) => <span className="font-mono text-[10px] text-muted/80">{r.time}</span> },
  ];

  const activeCount = coupons.filter(c => c.status === "Active").length;
  const totalRedemptions = coupons.reduce((s, c) => s + c.usedCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/5">
            <Tag size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-main-text italic uppercase tracking-tighter">Promotions Engine</h1>
            <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-1 opacity-80 leading-none">Manage discounts, referrals & campaigns</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all shadow-glow active:scale-95"><Plus size={18} /> Create Campaign</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Campaigns" value={String(activeCount)} icon={Tag} />
        <StatCard title="Global Redemptions" value={totalRedemptions.toLocaleString()} icon={Users} subtext="Total uses across all codes" />
        <StatCard title="Cost of Discounts" value="₹1.2L" icon={TrendingDown} subtext="Revenue forgone this month" delta={{ value: "+12%", trend: "up" }} />
        <StatCard title="Engagement Rate" value="18.4%" icon={Percent} delta={{ value: "+2.1%", trend: "up" }} />
      </div>

      <div className="flex gap-6 border-b border-border-dim">
        {(["coupons", "history"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 px-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all active:scale-95 ${activeTab === tab ? "border-primary text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]" : "border-transparent text-muted hover:text-main-text opacity-60 hover:opacity-100"}`}>{tab === "coupons" ? "Active Codes" : "Redemption Audit"}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "coupons" ? (
          <motion.div key="coupons" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <DataTable data={coupons} columns={columns} searchable />
          </motion.div>
        ) : (
          <motion.div key="history" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <DataTable data={mockRedemptions} columns={historyColumns} searchable />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics Modal */}
      <Modal isOpen={analyticsModal.isOpen} onClose={() => setAnalyticsModal({ isOpen: false, coupon: null })} title={`Performance: ${analyticsModal.coupon?.code}`}>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-5 bg-surface/50 rounded-2xl border border-border-dim shadow-inner">
              <p className="text-2xl font-black text-main-text italic line-height-none">{analyticsModal.coupon?.usedCount}</p>
              <p className="text-[9px] font-black text-muted uppercase tracking-widest mt-1 opacity-60">Total Uses</p>
            </div>
            <div className="p-5 bg-surface/50 rounded-2xl border border-border-dim shadow-inner">
              <p className="text-2xl font-black text-main-text italic line-height-none">₹24.5k</p>
              <p className="text-[9px] font-black text-muted uppercase tracking-widest mt-1 opacity-60">Revenue Impact</p>
            </div>
            <div className="p-5 bg-surface/50 rounded-2xl border border-border-dim shadow-inner">
              <p className="text-2xl font-black text-main-text italic line-height-none">14.2%</p>
              <p className="text-[9px] font-black text-muted uppercase tracking-widest mt-1 opacity-60">Conv. Rate</p>
            </div>
          </div>
          
          <div className="h-72 bg-surface/30 rounded-3xl border border-border-dim p-6 shadow-inner">
            <h4 className="text-[10px] font-black text-muted uppercase tracking-widest mb-6 opacity-60">Redemption Velocity (7 Days)</h4>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'var(--muted-text)', opacity: 0.8 }} />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'var(--surface)', opacity: 0.3 }} contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)' }} labelStyle={{ fontWeight: 900, color: 'var(--main-text)', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }} />
                <Bar dataKey="usage" fill="var(--primary-color)" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-5 border border-primary/20 bg-primary/5 rounded-2xl flex items-start gap-4 transition-all hover:bg-primary/10">
             <BarChart2 size={20} className="text-primary shrink-0 mt-0.5" />
             <p className="text-[11px] font-bold text-main-text leading-relaxed opacity-80 uppercase tracking-tight">This campaign is performing <b className="text-primary">24% better</b> than the seasonal average. High engagement noted among new users in Mumbai Metro.</p>
          </div>
        </div>
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={modal.isOpen} onClose={() => setModal({ isOpen: false, type: "create", coupon: null })} title={modal.type === "create" ? "Configure New Campaign" : "Edit Campaign Parameters"}
        footer={(
          <div className="flex justify-between w-full border-t border-border-dim pt-6 mt-4">
            <button onClick={() => setForm({ ...form, code: generateCode() })} className="text-[10px] font-black text-primary uppercase tracking-widest hover:translate-y-[-1px] transition-all flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl border border-primary/20"><Tag size={14} /> Generate Protocol Code</button>
            <div className="flex gap-4">
              <button onClick={() => setModal({ isOpen: false, type: "create", coupon: null })} className="px-6 py-3 text-[10px] font-black text-muted uppercase tracking-widest hover:text-main-text transition-all">Discard</button>
              <button onClick={handleSave} className="px-8 py-3 text-[10px] text-white bg-primary rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">Publish Campaign</button>
            </div>
          </div>
        )}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <div><label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2 opacity-60">Protocol Identity (Code)</label><input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full p-4 bg-input border border-border-dim rounded-2xl text-xs outline-none focus:ring-2 focus:ring-primary/50 font-mono font-black uppercase tracking-widest text-primary shadow-inner" placeholder="E.G. SAVE20" /></div>
            <div><label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2 opacity-60">Discount Configuration</label>
              <div className="flex gap-3">
                {(["Flat", "Percentage"] as const).map(t => (
                  <label key={t} className={`flex-1 text-center py-3.5 text-[10px] font-black uppercase tracking-widest rounded-2xl border cursor-pointer transition-all ${form.type === t ? "border-primary bg-primary/5 text-primary shadow-md shadow-primary/5" : "border-border-dim text-muted hover:bg-surface"}`}>
                    <input type="radio" className="sr-only" checked={form.type === t} onChange={() => setForm({ ...form, type: t })} />
                    {t === "Flat" ? "₹ Fixed" : "% Relative"}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-5">
            <div><label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2 opacity-60">Value</label><input type="number" value={form.value} onChange={e => setForm({ ...form, value: +e.target.value })} className="w-full p-4 bg-input border border-border-dim rounded-2xl text-xs font-black outline-none focus:ring-2 focus:ring-primary/50 shadow-inner" /></div>
            <div><label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2 opacity-60">Min Order Gate</label><input type="number" value={form.minOrder} onChange={e => setForm({ ...form, minOrder: +e.target.value })} className="w-full p-4 bg-input border border-border-dim rounded-2xl text-xs font-black outline-none focus:ring-2 focus:ring-primary/50 shadow-inner" /></div>
            <div><label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2 opacity-60">Global Velocity Limit</label><input type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: +e.target.value })} className="w-full p-4 bg-input border border-border-dim rounded-2xl text-xs font-black outline-none focus:ring-2 focus:ring-primary/50 shadow-inner" /></div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div><label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2 opacity-60">Activation Sequence</label><input type="date" value={form.validFrom?.split("T")[0]} onChange={e => setForm({ ...form, validFrom: e.target.value })} className="w-full p-4 bg-input border border-border-dim rounded-2xl text-xs font-black outline-none focus:ring-2 focus:ring-primary/50 shadow-inner text-main-text" /></div>
            <div><label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2 opacity-60">Termination Protocol (Expiry)</label><input type="date" value={form.validUntil?.split("T")[0]} onChange={e => setForm({ ...form, validUntil: e.target.value })} className="w-full p-4 bg-input border border-border-dim rounded-2xl text-xs font-black outline-none focus:ring-2 focus:ring-primary/50 shadow-inner text-main-text" /></div>
          </div>
          <div><label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2 opacity-60">Distribution Taxonomy</label>
            <select value={form.applicableTo} onChange={e => setForm({ ...form, applicableTo: e.target.value as Coupon["applicableTo"] })} className="w-full p-4 bg-input border border-border-dim rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/50 text-main-text shadow-inner appearance-none transition-all">
              <option value="All">Global Platform Protocol</option>
              <option value="New Users">Acquisition Stream (New Entities)</option>
              <option value="Specific Lab">Partner Sub-Network (Lab)</option>
              <option value="Specific Test">service-Specific Cluster (Test)</option>
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, id: null })} title="Terminate Campaign" description="This action will immediately disable this coupon code across the platform. Future redemptions will fail." confirmText="Terminate" isDestructive onConfirm={() => { setCoupons(coupons.filter(c => c.id !== deleteDialog.id)); setDeleteDialog({ isOpen: false, id: null }); }} />
    </div>
  );
}
