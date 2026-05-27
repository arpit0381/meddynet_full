"use client";
import { useState, useEffect, useMemo } from "react";
import apiClient from "@/lib/api";
import { 
  DndContext, DragEndEvent, DragOverlay, DragStartEvent, 
  closestCenter, PointerSensor, useSensor, useSensors 
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { GitMerge, List, Plus, User2, Clock, ChevronRight } from "lucide-react";

type Stage = "Applied" | "Documents Submitted" | "Under Review" | "Approved" | "Live" | "Rejected";

interface LabCard {
  id: string;
  name: string;
  city: string;
  plan: "Starter" | "Basic" | "Advanced" | "Premium";
  submittedAt: string;
  assignedTo: string | null;
  stage: Stage;
  nabl_url?: string;
}

const STAGES: Stage[] = ["Applied", "Documents Submitted", "Under Review", "Approved", "Live", "Rejected"];

const STAGE_COLORS: Record<Stage, string> = {
  "Applied": "border-t-blue-500 shadow-[0_-4px_0_rgba(59,130,246,0.3)]",
  "Documents Submitted": "border-t-amber-500 shadow-[0_-4px_0_rgba(245,158,11,0.3)]",
  "Under Review": "border-t-purple-500 shadow-[0_-4px_0_rgba(168,85,247,0.3)]",
  "Approved": "border-t-green-500 shadow-[0_-4px_0_rgba(16,185,129,0.3)]",
  "Live": "border-t-primary shadow-[0_-4px_0_rgba(var(--primary-rgb),0.3)]",
  "Rejected": "border-t-red-500 shadow-[0_-4px_0_rgba(239,68,68,0.3)]",
};

const PLAN_COLORS: Record<string, string> = {
  Starter: "bg-surface border-border-dim text-muted opacity-80",
  Basic: "bg-blue-500/10 border-blue-500/20 text-blue-500",
  Advanced: "bg-purple-500/10 border-purple-500/20 text-purple-500",
  Premium: "bg-amber-500/10 border-amber-500/20 text-amber-500",
};

function KanbanCard({ card, referenceTime }: { card: LabCard, referenceTime: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const daysAgo = Math.floor((referenceTime - new Date(card.submittedAt).getTime()) / 86400000);
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="bg-card rounded-2xl border border-border-dim p-4 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-xl hover:border-primary/30 transition-all select-none group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="font-black text-main-text text-[13px] tracking-tight leading-tight group-hover:text-primary transition-colors">{card.name}</p>
        <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg shrink-0 border uppercase tracking-widest ${PLAN_COLORS[card.plan]}`}>{card.plan}</span>
      </div>
      <p className="text-[10px] text-muted font-bold mb-3 uppercase tracking-tighter opacity-60 leading-none">{card.city}</p>
      
      {card.nabl_url && (
        <a href={card.nabl_url} target="_blank" rel="noopener noreferrer" 
          className="block w-full mb-4 py-2 px-3 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase text-center rounded-xl hover:bg-primary hover:text-white transition-all">
          View NABL Cert
        </a>
      )}

      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-muted/60">
        <span className="flex items-center gap-1.5"><Clock size={12} className="opacity-40"/> {daysAgo}D LATENCY</span>
        {card.assignedTo ? (
          <span className="flex items-center gap-1.5 text-primary opacity-80"><User2 size={12}/>{card.assignedTo.toUpperCase()}</span>
        ) : (
          <span className="text-muted/30 italic">UNASSIGNED</span>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const [cards, setCards] = useState<LabCard[]>([]);
  const [activeCard, setActiveCard] = useState<LabCard | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const fetchOnboardingLabs = async () => {
      try {
        const { data } = await apiClient.get("/admin/onboarding/labs");
        setCards(data);
      } catch (err) {
        console.error("Failed to fetch onboarding labs:", err);
      }
    };
    fetchOnboardingLabs();
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragStart = (e: DragStartEvent) => {
    setActiveCard(cards.find(c => c.id === e.active.id) || null);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveCard(null);
    if (!over || active.id === over.id) return;
    const fromIdx = cards.findIndex(c => c.id === active.id);
    const toIdx = cards.findIndex(c => c.id === over.id);
    if (fromIdx !== -1 && toIdx !== -1) {
      setCards(arrayMove(cards, fromIdx, toIdx));
    }
  };

  const getStageCards = (stage: Stage) => cards.filter(c => c.stage === stage);
  const avgDaysInStage = (stage: Stage) => {
    const stageCards = getStageCards(stage);
    if (!stageCards.length) return 0;
    const avg = stageCards.reduce((s, c) => s + Math.floor((now - new Date(c.submittedAt).getTime()) / 86400000), 0) / stageCards.length;
    return avg.toFixed(1);
  };

  return (
    <div className="space-y-6 min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-dim pb-6">
        <div>
          <h1 className="text-2xl font-black text-main-text tracking-tight uppercase italic">Onboarding Pipeline Protocol</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1.5 opacity-80">Orchestrate Registration → Verification → Operational Live Sequence</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-input p-1 rounded-2xl gap-1 border border-border-dim shadow-inner">
            <button onClick={() => setViewMode("kanban")} className={`p-2.5 rounded-xl transition-all active:scale-90 ${viewMode === "kanban" ? "bg-card shadow-lg text-primary border border-border-dim" : "text-muted hover:text-main-text opacity-40 hover:opacity-100"}`} title="Visual Workflow"><GitMerge size={18}/></button>
            <button onClick={() => setViewMode("list")} className={`p-2.5 rounded-xl transition-all active:scale-90 ${viewMode === "list" ? "bg-card shadow-lg text-primary border border-border-dim" : "text-muted hover:text-main-text opacity-40 hover:opacity-100"}`} title="Audit List"><List size={18}/></button>
          </div>
          <button className="flex items-center gap-2.5 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg active:scale-95 shadow-primary/20">
            <Plus size={18}/> Initialize Lab Onboarding
          </button>
        </div>
      </div>

      {/* Stage stats */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
        {STAGES.map(stage => (
          <div key={stage} className={`bg-card rounded-2xl border border-border-dim p-4 text-center shadow-sm transition-all hover:shadow-md hover:border-primary/20 flex flex-col justify-center items-center group`}>
            <p className="text-2xl font-black text-main-text italic group-hover:text-primary transition-colors">{getStageCards(stage).length}</p>
            <p className="text-[9px] font-black text-muted uppercase tracking-widest mt-1.5 opacity-60 leading-none group-hover:opacity-100 transition-opacity">{stage}</p>
            {getStageCards(stage).length > 0 && <p className="text-[8px] font-black text-muted/30 uppercase tracking-tighter mt-2 group-hover:text-muted/60 transition-colors">LATENCY: {avgDaysInStage(stage)}D</p>}
          </div>
        ))}
      </div>

      {viewMode === "kanban" ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-custom">
            {STAGES.map(stage => {
              const stageCards = getStageCards(stage);
              return (
        <div key={stage} className={`shrink-0 w-[280px] bg-surface/30 rounded-[2.5rem] border-t-4 ${STAGE_COLORS[stage]} border border-border-dim overflow-hidden shadow-sm transition-all hover:bg-surface/50`}>
   <div className="p-5 border-b border-border-dim bg-card/40 backdrop-blur-sm">
     <div className="flex items-center justify-between">
       <h3 className="font-black text-main-text text-[10px] uppercase tracking-widest opacity-80 italic">{stage}</h3>
       <span className="text-[10px] font-black text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg shadow-sm">{stageCards.length}</span>
     </div>
   </div>
                  <SortableContext items={stageCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="p-4 space-y-4 min-h-[150px]">
                      {stageCards.map(card => <KanbanCard key={card.id} card={card} referenceTime={now} />)}
                      {stageCards.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border-dim/40 rounded-3xl group/drop transition-all hover:border-primary/20 bg-card/10">
                          <GitMerge size={20} className="mb-2 opacity-10 group-hover/drop:opacity-30 transition-opacity text-primary"/>
                          <p className="text-[9px] font-black text-muted opacity-20 uppercase tracking-widest group-hover/drop:opacity-50">Drop Entity</p>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>
          <DragOverlay>{activeCard ? (
            <div className="bg-card rounded-2xl border border-primary/50 p-5 shadow-2xl w-[280px] rotate-2 scale-105 backdrop-blur-xl ring-4 ring-primary/5">
              <p className="font-black text-main-text text-sm uppercase tracking-tight mb-2 italic">{activeCard.name}</p>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{activeCard.city} <span className="opacity-30 mx-1">/</span> <span className="text-primary">{activeCard.plan}</span></p>
            </div>
          ) : null}</DragOverlay>
        </DndContext>
      ) : (
        <div className="bg-card rounded-[2.5rem] border border-border-dim shadow-sm overflow-hidden">
          <div className="divide-y divide-border-dim scrollbar-custom">
            {cards.map(card => (
              <div key={card.id} className="px-6 py-5 flex items-center gap-5 hover:bg-surface/50 transition-all cursor-pointer group">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-xs flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform uppercase tracking-widest">{card.name.slice(0,2).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-main-text text-[13px] uppercase tracking-tight leading-none mb-1.5 group-hover:text-primary transition-colors">{card.name}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted/60 transition-colors">{card.city} <span className="opacity-20 mx-1">/</span> <span className="opacity-80 italic">{card.plan} PROVISIONS</span></p>
                </div>
                <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl border uppercase tracking-widest group-hover:shadow-sm transition-all ${PLAN_COLORS[card.plan]}`}>{card.plan}</span>
                <StatusBadge status={card.stage === "Live" ? "success" : card.stage === "Rejected" ? "error" : card.stage === "Approved" ? "info" : "warning"} label={card.stage.toUpperCase()} />
                <div className="flex flex-col items-end gap-1 min-w-[120px]">
                   <span className="text-[10px] font-black text-main-text uppercase tracking-widest opacity-80">{card.assignedTo ? card.assignedTo.toUpperCase() : "UNASSIGNED"}</span>
                   <span className="text-[8px] font-black text-muted uppercase tracking-tighter italic opacity-40">Operational Assignee</span>
                </div>
                <ChevronRight size={18} className="text-muted/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
