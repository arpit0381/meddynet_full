"use client";
import { useState, useEffect, useMemo } from "react";
import { Map, List, Truck, Star, CheckCircle2, Edit2, Trash2, Plus, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
const FleetMap = dynamic(() => import("@/components/admin/ui/FleetMap"), { ssr: false });
import { DataTable, Column } from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { StatCard } from "@/components/admin/ui/StatCard";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useAdminTechnicians } from "@/lib/hooks";
import { toast } from "sonner";

interface Tech {
  id: string;
  name: string;
  phone: string;
  city: string;
  vehicle: string;
  status: "On Duty" | "Idle" | "Off";
  rating: number;
  lat: number;
  lng: number;
}

export default function TechniciansPage() {
  const [view, setView] = useState<"list" | "map">("list");
  const [techModal, setTechModal] = useState<{isOpen: boolean, type: 'create' | 'edit', tech: Tech | null}>({isOpen: false, type: 'create', tech: null});
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, techId: string | null}>({isOpen: false, techId: null});

  const { data: rawTechs, isLoading } = useAdminTechnicians();

  interface RawTech {
    id: string;
    name: string;
    phone: string;
    city?: string;
    vehicle?: string;
    status: string;
    rating?: number;
    current_lat?: number;
    current_lng?: number;
  }

  interface FleetLocation {
    id: string;
    name: string;
    lat: number;
    lng: number;
    status: string;
  }

  const technicians: Tech[] = (rawTechs || []).map((t: RawTech) => ({
    id: t.id,
    name: t.name,
    phone: t.phone,
    city: t.city || "Delhi",
    vehicle: t.vehicle || "Bike",
    status: t.status === "on_duty" ? "On Duty" : t.status === "idle" ? "Idle" : "Off",
    rating: t.rating || 0.0,
    lat: t.current_lat || 28.6139,
    lng: t.current_lng || 77.209,
  }));

  const initialFleetLocations = useMemo(() => 
    technicians.map(t => ({ id: t.id, name: t.name, lat: t.lat, lng: t.lng, status: t.status })),
    [technicians]
  );

  const [fleetLocations, setFleetLocations] = useState<FleetLocation[]>([]);

  useEffect(() => {
    const wsHost = process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, '') || 'localhost:8000';
    const wsProtocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${wsProtocol}://${wsHost}/ws/admin/system`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "location_update") {
        setFleetLocations(prev => prev.map(loc => 
          loc.id === data.tech_id ? { ...loc, lat: data.lat, lng: data.lng } : loc
        ));
      }
    };

    return () => ws.close();
  }, []);

  const columns: Column<Tech>[] = [
    { header: "Tech ID", accessor: (t) => <span className="font-black text-main-text uppercase tracking-widest text-xs">{t.id}</span> },
    { header: "Name", accessor: (t) => <span className="font-bold text-main-text uppercase tracking-tight">{t.name}</span> },
    { header: "Phone", accessor: (t) => <span className="text-sm font-bold text-main-text/80">{t.phone}</span> },
    { header: "City", accessor: "city" },
    { header: "Vehicle", accessor: "vehicle" },
    { header: "Status", accessor: (t) => <StatusBadge pulse={t.status === "On Duty"} status={t.status === "On Duty" ? "success" : t.status === "Idle" ? "warning" : "neutral"} label={t.status} /> },
    { header: "Rating", accessor: (t) => <div className="flex items-center gap-1.5"><Star size={14} className="text-amber-400 fill-current"/> <span className="text-sm font-black text-amber-500">{t.rating}</span></div> },
    {
      header: "Action",
      accessor: (t) => (
        <div className="flex items-center justify-end gap-2 text-muted">
          <button onClick={(e) => { e.stopPropagation(); setTechModal({isOpen: true, type: 'edit', tech: t}); }} className="p-1.5 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all"><Edit2 size={16}/></button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteDialog({isOpen: true, techId: t.id}); }} className="p-1.5 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={16}/></button>
        </div>
      ),
      className: "text-right"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Techs" value={technicians.length.toString()} icon={Truck}/>
        <StatCard title="On Duty Now" value={technicians.filter(t => t.status === "On Duty").length.toString()} icon={CheckCircle2}/>
        <StatCard title="Avg Rating" value="4.8" icon={Star}/>
        <StatCard title="Collections Today" value="8,940" icon={Map}/>
      </div>

      <div className="flex justify-between items-center bg-card border border-border-dim p-4 rounded-2xl shadow-sm transition-colors">
        <h1 className="text-2xl font-black text-main-text tracking-tight uppercase">Technician Fleet</h1>
        <div className="flex items-center gap-4">
          <div className="bg-surface p-1.5 rounded-xl border border-border-dim hidden sm:flex gap-1">
            <button onClick={() => setView("list")} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 transition-all ${view === "list" ? "bg-card text-primary shadow-sm ring-1 ring-border-dim/50" : "text-muted hover:text-main-text"}`}><List size={16}/> List</button>
            <button onClick={() => setView("map")} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 transition-all ${view === "map" ? "bg-card text-primary shadow-sm ring-1 ring-border-dim/50" : "text-muted hover:text-main-text"}`}><Map size={16}/> Live Map</button>
          </div>
          <button onClick={() => setTechModal({isOpen: true, type: 'create', tech: null})} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg active:scale-95"><Plus size={18}/> Add Technician</button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="animate-spin text-primary" size={40} />
        </div>
      ) : view === "list" ? (
         <DataTable data={technicians} columns={columns} searchable />
      ) : (
         <div className="w-full h-[600px] bg-surface rounded-2xl border border-border-dim overflow-hidden transition-all">
            <FleetMap technicians={fleetLocations} />
         </div>
      )}

      <Modal isOpen={techModal.isOpen} onClose={() => setTechModal({isOpen: false, type: 'create', tech: null})} title={techModal.type === 'create' ? "Add New Technician" : "Edit Technician"} footer={
        <div className="flex justify-end gap-3 w-full">
          <button onClick={() => setTechModal({isOpen: false, type: 'create', tech: null})} className="px-5 py-2.5 border border-border-dim rounded-xl text-[10px] font-black uppercase tracking-widest text-muted hover:text-main-text transition-all">Cancel</button>
          <button onClick={() => {
            if (techModal.type === 'create') {
               toast.success("Technician added successfully.");
            } else {
               toast.success("Technician details updated.");
            }
            setTechModal({isOpen: false, type: 'create', tech: null});
          }} className="px-5 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg active:scale-95">Save Details</button>
        </div>
      }>
        <div className="space-y-5">
          <div><label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1.5">Technician Name</label><input type="text" defaultValue={techModal.tech?.name} className="w-full p-3 bg-card border border-border-dim rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-main-text font-bold transition-all" placeholder="e.g. Amit Kumar" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1.5">Phone</label><input type="text" defaultValue={techModal.tech?.phone} className="w-full p-3 bg-card border border-border-dim rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-main-text font-bold transition-all" /></div>
            <div><label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1.5">City</label><input type="text" defaultValue={techModal.tech?.city || 'Delhi'} className="w-full p-3 bg-card border border-border-dim rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-main-text font-bold transition-all" /></div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1.5">Status</label>
            <select defaultValue={techModal.tech?.status || 'Idle'} className="w-full p-3 bg-card border border-border-dim rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-main-text font-bold transition-all appearance-none">
              <option value="On Duty">On Duty</option>
              <option value="Idle">Idle</option>
              <option value="Off">Off</option>
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog 
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({isOpen: false, techId: null})}
        title="Remove Technician"
        description="Are you sure you want to remove this technician? Action cannot be undone."
        confirmText="Remove"
        isDestructive={true}
        onConfirm={() => {
           toast.success("Technician removed");
           setDeleteDialog({isOpen: false, techId: null});
        }}
      />
    </div>
  );
}
