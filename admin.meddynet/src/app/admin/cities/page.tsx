"use client";
import { useState, useRef } from "react";
import { StatCard } from "@/components/admin/ui/StatCard";
import { DataTable, Column } from "@/components/admin/ui/DataTable";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { Map, Plus, Edit2, Trash2, Users, FlaskConical, Calendar, Activity } from "lucide-react";
import { useAdminCities } from "@/lib/hooks";
import { useEffect } from "react";

interface City {
  id: string;
  name: string;
  state: string;
  totalLabs: number;
  totalUsers: number;
  bookingsMTD: number;
  status: "Active" | "Inactive" | "Coming Soon";
  launchDate: string;
  pincodeRange: string;
}

const mockCities: City[] = [
  { id: "CTY-001", name: "Delhi", state: "Delhi", totalLabs: 45, totalUsers: 12400, bookingsMTD: 2340, status: "Active", launchDate: "2024-01-15", pincodeRange: "110001-110096" },
  { id: "CTY-002", name: "Mumbai", state: "Maharashtra", totalLabs: 52, totalUsers: 18200, bookingsMTD: 3100, status: "Active", launchDate: "2024-02-01", pincodeRange: "400001-400107" },
  { id: "CTY-003", name: "Bangalore", state: "Karnataka", totalLabs: 38, totalUsers: 14500, bookingsMTD: 2780, status: "Active", launchDate: "2024-03-10", pincodeRange: "560001-560100" },
  { id: "CTY-004", name: "Chennai", state: "Tamil Nadu", totalLabs: 28, totalUsers: 9800, bookingsMTD: 1650, status: "Active", launchDate: "2024-04-05", pincodeRange: "600001-600119" },
  { id: "CTY-005", name: "Hyderabad", state: "Telangana", totalLabs: 33, totalUsers: 11200, bookingsMTD: 1920, status: "Active", launchDate: "2024-05-20", pincodeRange: "500001-500100" },
  { id: "CTY-006", name: "Pune", state: "Maharashtra", totalLabs: 22, totalUsers: 7600, bookingsMTD: 1280, status: "Active", launchDate: "2024-06-15", pincodeRange: "411001-411062" },
  { id: "CTY-007", name: "Kolkata", state: "West Bengal", totalLabs: 18, totalUsers: 6200, bookingsMTD: 980, status: "Active", launchDate: "2024-07-01", pincodeRange: "700001-700107" },
  { id: "CTY-008", name: "Ahmedabad", state: "Gujarat", totalLabs: 20, totalUsers: 7100, bookingsMTD: 1150, status: "Active", launchDate: "2024-08-10", pincodeRange: "380001-380061" },
  { id: "CTY-009", name: "Jaipur", state: "Rajasthan", totalLabs: 12, totalUsers: 4200, bookingsMTD: 680, status: "Active", launchDate: "2024-09-15", pincodeRange: "302001-302040" },
  { id: "CTY-010", name: "Kochi", state: "Kerala", totalLabs: 15, totalUsers: 5100, bookingsMTD: 820, status: "Active", launchDate: "2024-10-01", pincodeRange: "682001-682040" },
  { id: "CTY-011", name: "Lucknow", state: "Uttar Pradesh", totalLabs: 9, totalUsers: 3200, bookingsMTD: 510, status: "Active", launchDate: "2025-01-15", pincodeRange: "226001-226028" },
  { id: "CTY-012", name: "Chandigarh", state: "Punjab", totalLabs: 7, totalUsers: 2800, bookingsMTD: 420, status: "Active", launchDate: "2025-03-01", pincodeRange: "160001-160036" },
  { id: "CTY-013", name: "Bhopal", state: "Madhya Pradesh", totalLabs: 5, totalUsers: 1900, bookingsMTD: 290, status: "Inactive", launchDate: "2025-06-01", pincodeRange: "462001-462046" },
  { id: "CTY-014", name: "Nagpur", state: "Maharashtra", totalLabs: 4, totalUsers: 1400, bookingsMTD: 220, status: "Active", launchDate: "2025-09-01", pincodeRange: "440001-440035" },
  { id: "CTY-015", name: "Surat", state: "Gujarat", totalLabs: 3, totalUsers: 0, bookingsMTD: 0, status: "Coming Soon", launchDate: "2026-04-01", pincodeRange: "395001-395023" },
];

const emptyForm = { name: "", state: "", pincodeRange: "", launchDate: "", status: "Active" as City["status"] };

export default function CitiesPage() {
  const { data: rawCities = [], isLoading } = useAdminCities();
  const cities: City[] = rawCities.map((c: Record<string, unknown>) => ({
    id: c.id as string,
    name: c.name as string,
    state: c.state as string,
    totalLabs: (c.lab_count as number) || 0,
    totalUsers: 0, // Not returned by API yet
    bookingsMTD: 0, // Not returned by API yet
    status: c.is_active ? "Active" : "Inactive",
    launchDate: (c.created_at as string) || "2024-01-01",
    pincodeRange: c.pincode_prefix ? `${c.pincode_prefix}xxx` : "N/A"
  }));
  const [modal, setModal] = useState<{ isOpen: boolean; type: "create" | "edit"; city: City | null }>({ isOpen: false, type: "create", city: null });
  const [form, setForm] = useState(emptyForm);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const idCounter = useRef(0);

  const handleSave = () => {
    if (modal.type === "create") {
      setCities([{ ...form, id: `CTY-${++idCounter.current}`, totalLabs: 0, totalUsers: 0, bookingsMTD: 0 }, ...cities]);
    } else if (modal.city) {
      setCities(cities.map(c => c.id === modal.city!.id ? { ...c, ...form } : c));
    }
    setModal({ isOpen: false, type: "create", city: null });
  };

  const toggleStatus = (id: string) => {
    setCities(cities.map(c => c.id === id ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" } : c));
  };

  const columns: Column<City>[] = [
    { 
      header: "Strategic Unit (City)", 
      accessor: (c) => (
        <div className="flex flex-col gap-1 py-1">
          <p className="font-black text-main-text text-[13px] uppercase tracking-tight leading-none group-hover:text-primary transition-colors">{c.name}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted opacity-60 leading-none">{c.state}</p>
        </div>
      ) 
    },
    { header: "Lab Infrastructure", accessor: (c) => <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10 shadow-sm italic"><FlaskConical size={14}/> {c.totalLabs} UNITS</div> },
    { header: "User Population", accessor: (c) => <div className="flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-widest bg-blue-500/5 px-2.5 py-1.5 rounded-lg border border-blue-500/10 shadow-sm italic"><Users size={14}/> {c.totalUsers.toLocaleString()} ENTITIES</div> },
    { header: "Mtd Velocity", accessor: (c) => <div className="flex items-center gap-2 text-main-text font-black text-xs uppercase tracking-widest bg-surface px-2.5 py-1.5 rounded-lg border border-border-dim shadow-inner italic opacity-80"><Calendar size={14} className="text-muted"/> {c.bookingsMTD.toLocaleString()}</div> },
    { header: "Deployment", accessor: (c) => <span className="font-mono text-[10px] text-muted/70 uppercase tracking-tighter">{new Date(c.launchDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span> },
    { header: "Operational State", accessor: (c) => <StatusBadge status={c.status === "Active" ? "success" : c.status === "Coming Soon" ? "warning" : "error"} label={c.status.toUpperCase()} /> },
    {
      header: "Actions",
      accessor: (c) => (
        <div className="flex items-center justify-end gap-2 text-muted">
          <button onClick={(e) => { e.stopPropagation(); toggleStatus(c.id); }} className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all active:scale-95 shadow-lg ${c.status === "Active" ? "text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500 hover:text-white" : "text-green-500 bg-green-500/10 border-green-500/20 hover:bg-green-500 hover:text-white"}`}>{c.status === "Active" ? "Suspend" : "Initialize"}</button>
          <button onClick={(e) => { e.stopPropagation(); setForm({ name: c.name, state: c.state, pincodeRange: c.pincodeRange, launchDate: c.launchDate, status: c.status }); setModal({ isOpen: true, type: "edit", city: c }); }} className="p-2 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="Refactor City"><Edit2 size={16} /></button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteDialog({ isOpen: true, id: c.id }); }} className="p-2 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Purge Zone"><Trash2 size={16} /></button>
        </div>
      )
    },
  ];

  const activeCities = cities.filter(c => c.status === "Active").length;
  const totalLabs = cities.reduce((s, c) => s + c.totalLabs, 0);
  const totalBookings = cities.reduce((s, c) => s + c.bookingsMTD, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-dim pb-6">
        <div>
          <h1 className="text-2xl font-black text-main-text tracking-tight uppercase italic">Geographic Presence Control</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1.5 opacity-80">Strategic Zone orchestration & Operational unit management</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setModal({ isOpen: true, type: "create", city: null }); }} className="flex items-center gap-2.5 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
          <Plus size={18}/> Initialize New Zone
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Cities" value={String(activeCities)} icon={Map} />
        <StatCard title="Total Labs" value={String(totalLabs)} icon={FlaskConical} />
        <StatCard title="Bookings MTD" value={totalBookings.toLocaleString()} icon={Calendar} />
        <StatCard title="Coming Soon" value={String(cities.filter(c => c.status === "Coming Soon").length)} icon={Activity} />
      </div>

      {isLoading ? <div className="text-center p-10 text-muted">Loading cities...</div> : <DataTable data={cities} columns={columns} searchable />}

      <Modal isOpen={modal.isOpen} onClose={() => setModal({ isOpen: false, type: "create", city: null })} title={modal.type === "create" ? "Initialize Strategic Zone" : "Refactor Zone Configuration"}
        footer={<div className="flex justify-end gap-4 w-full">
          <button onClick={() => setModal({ isOpen: false, type: "create", city: null })} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border border-border-dim rounded-xl text-muted hover:text-main-text hover:bg-surface transition-all">Abort Protocol</button>
          <button onClick={handleSave} className="px-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Commit Configuration</button>
        </div>}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-muted opacity-80">Zone Designation (City)</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-4 bg-input border border-border-dim rounded-2xl text-xs font-bold text-main-text outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all shadow-inner" placeholder="E.G. PUNE" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-muted opacity-80">Territory (State)</label><input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="w-full p-4 bg-input border border-border-dim rounded-2xl text-xs font-bold text-main-text outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all shadow-inner" placeholder="E.G. MAHARASHTRA" /></div>
          </div>
          <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-muted opacity-80">Operational Pincode Matrix</label><input value={form.pincodeRange} onChange={e => setForm({ ...form, pincodeRange: e.target.value })} className="w-full p-4 bg-input border border-border-dim rounded-2xl text-xs font-bold text-main-text outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all shadow-inner" placeholder="E.G. 411001-411062" /></div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-muted opacity-80">Deployment Sequence Date</label><input type="date" value={form.launchDate} onChange={e => setForm({ ...form, launchDate: e.target.value })} className="w-full p-4 bg-input border border-border-dim rounded-2xl text-xs font-bold text-main-text outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all shadow-inner" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-muted opacity-80">Operational Lifecycle State</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as City["status"] })} className="w-full p-4 bg-input border border-border-dim rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 text-main-text appearance-none cursor-pointer transition-all hover:border-primary/30 shadow-inner">
                <option value="Active">ACTIVE PROTOCOL</option>
                <option value="Inactive">INACTIVE SCOPE</option>
                <option value="Coming Soon">UPCOMING DEPLOYMENT</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, id: null })} title="Remove City" description="Are you sure? This will remove the city from the platform. All associated data will be preserved." confirmText="Remove" isDestructive onConfirm={() => { setCities(cities.filter(c => c.id !== deleteDialog.id)); setDeleteDialog({ isOpen: false, id: null }); }} />
    </div>
  );
}
