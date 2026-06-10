"use client";
import { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, Phone, Mail, Clock, CheckCircle2, AlertCircle, Plus,
  Send, FileText, X, ChevronDown, Zap
} from "lucide-react";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { StatCard } from "@/components/admin/ui/StatCard";
import { useSupportTickets, useRespondToTicket } from "@/lib/hooks";
import { toast } from "sonner";

export interface SupportTicket {
  id: string;
  user: string;
  userType: "Patient" | "Lab" | "Technician";
  subject: string;
  status: "Open" | "In Progress" | "Resolved";
  priority: "High" | "Medium" | "Low";
  channel: "In-App" | "Email" | "Chat";
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  messages: {
    sender: "user" | "admin";
    text: string;
    time: string;
  }[];
}

const QUICK_TEMPLATES = [
  "We're looking into this issue and will get back to you within 24 hours.",
  "Your booking has been confirmed. Please check your email for details.",
  "We've escalated this to our technical team for immediate resolution.",
  "The refund has been processed and should reflect in 3-5 business days.",
  "We apologize for the inconvenience. As a goodwill gesture, we've added a ₹100 credit to your account.",
];

const ASSIGNEES = ["Unassigned", "Support Agent 1", "Support Agent 2", "Support Agent 3"];

export default function SupportPage() {
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [channel, setChannel] = useState<"In-App" | "Email" | "SMS">("In-App");
  const [showTemplates, setShowTemplates] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: rawTickets, isLoading } = useSupportTickets();
  const respondMutation = useRespondToTicket();

  interface RawTicket {
    id: string;
    user_name?: string;
    subject: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
    messages?: SupportTicket["messages"];
    assigned_to?: string;
  }

  const tickets: SupportTicket[] = (rawTickets || []).map((t: RawTicket) => ({
    id: t.id,
    user: t.user_name || "Patient",
    userType: "Patient",
    subject: t.subject,
    status: (t.status.charAt(0).toUpperCase() + t.status.slice(1).replace('_', ' ')) as SupportTicket["status"],
    priority: (t.priority.charAt(0).toUpperCase() + t.priority.slice(1)) as SupportTicket["priority"],
    channel: "Chat",
    createdAt: t.created_at,
    updatedAt: t.updated_at,
    messages: t.messages || [],
    assignedTo: t.assigned_to
  }));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages]);

  const sendReply = () => {
    if (!reply.trim() || !selected) return;
    respondMutation.mutate(
      { ticketId: selected.id, message: reply },
      {
        onSuccess: () => {
           toast.success("Reply sent successfully.");
           setReply("");
           setShowTemplates(false);
        }
      }
    );
  };

  const closeTicket = (id: string) => {
    respondMutation.mutate(
      { ticketId: id, message: "Ticket resolved by admin.", status: "resolved" },
      {
         onSuccess: () => {
             toast.success("Ticket marked as resolved.");
             if (selected?.id === id) setSelected(null);
         }
      }
    );
  };

  const updateAssignee = (id: string, assignedTo: string) => {
    toast.success(`Assigned to ${assignedTo}`);
  };

  const filtered = filterStatus === "All" ? tickets : tickets.filter(t => t.status === filterStatus);
  
  const openCount = tickets.filter(t => t.status === "Open").length;
  const inProgressCount = tickets.filter(t => t.status === "In Progress").length;
  const resolvedCount = tickets.filter(t => t.status === "Resolved").length;

  const priorityColor = (p: string) => 
    p === "High" 
      ? "bg-red-500/5 border-l-red-500" 
      : p === "Medium" 
        ? "bg-amber-500/5 border-l-amber-500" 
        : "bg-surface/50 border-l-border-dim";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-dim pb-6">
        <div>
          <h1 className="text-2xl font-black text-main-text tracking-tight uppercase italic">Support Intelligence Hub</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1.5 opacity-80">Resolution Protocol & Entity Communication Management</p>
        </div>
        <button className="flex items-center gap-2.5 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg active:scale-95 shadow-primary/20">
          <Plus size={18} /> New Ticket Protocol
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Circuits" value={String(openCount)} icon={AlertCircle} />
        <StatCard title="In Treatment" value={String(inProgressCount)} icon={Clock} />
        <StatCard title="Resolved Units" value={String(resolvedCount)} icon={CheckCircle2} />
        <StatCard title="Latency (Avg)" value="2.4h" icon={Zap} />
      </div>

      {/* Split Layout */}
      <div className={`flex gap-0 bg-card rounded-3xl border border-border-dim shadow-sm overflow-hidden transition-all ${selected ? "h-[700px]" : ""}`}>
        {/* Ticket List */}
        <div className={`flex flex-col border-r border-border-dim transition-all ${selected ? "w-[36%] min-w-0" : "w-full"}`}>
          <div className="p-5 border-b border-border-dim flex items-center gap-3 bg-surface/30">
            <div className="flex gap-1.5 bg-input p-1 rounded-xl flex-1 border border-border-dim shadow-inner">
              {["All", "Open", "In Progress", "Resolved"].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`flex-1 py-1.5 px-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${filterStatus === s ? "bg-card shadow-lg text-primary border border-border-dim" : "text-muted hover:text-main-text"}`}>
                  {s === "All" ? "All" : s.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border-dim scrollbar-custom">
            {filtered.map(t => (
              <button key={t.id} onClick={() => setSelected(t)}
                className={`w-full text-left px-6 py-6 border-l-4 transition-all hover:bg-surface relative group ${priorityColor(t.priority)} ${selected?.id === t.id ? "bg-primary/10 border-l-primary shadow-inner" : "border-l-transparent"}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <p className="font-black text-main-text text-[13px] uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{t.subject}</p>
                  <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shrink-0 border shadow-sm ${t.status === "Open" ? "bg-red-500/10 text-red-500 border-red-500/20" : t.status === "In Progress" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"}`}>
                    {t.status === "In Progress" ? "ACTIVE_TREATMENT" : t.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-muted font-black mb-4 uppercase tracking-widest opacity-60 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse"/> {t.user} <span className="opacity-30">|</span> <span className="text-primary italic">{t.userType.toUpperCase()}</span>
                </p>
                <div className="flex items-center gap-4 text-[9px] font-black text-muted/50 uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-2">
                    {t.channel === "Chat" ? <MessageSquare size={13} className="text-primary"/> : t.channel === "Email" ? <Mail size={13} className="text-accent"/> : <Phone size={13} className="text-green-500"/>}
                    <span className="group-hover:text-muted transition-colors">{t.channel} CHANNEL</span>
                  </div>
                  <span className="opacity-20">||</span>
                  <span className="group-hover:text-muted transition-colors italic">{new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} CYCLE</span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-[10px] font-black uppercase tracking-widest text-muted opacity-40 italic">
                <AlertCircle size={24} className="mb-3 opacity-20"/>
                No tickets in scope
              </div>
            )}
          </div>
        </div>

        {/* Conversation Panel */}
        {selected && (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Conversation Header */}
            <div className="p-5 border-b border-border-dim flex items-center gap-4 bg-surface/30 shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-[9px] font-black text-muted uppercase tracking-widest opacity-60">{selected.id}</span>
                  <StatusBadge status={selected.priority === "High" ? "error" : selected.priority === "Medium" ? "warning" : "info"} label={selected.priority} />
                  <StatusBadge status={selected.status === "Resolved" ? "success" : selected.status === "Open" ? "error" : "warning"} label={selected.status} />
                </div>
                <p className="font-black text-main-text text-sm mt-1.5 uppercase tracking-tight truncate leading-none">{selected.subject}</p>
              </div>
              <div className="flex items-center gap-3">
                <select value={selected.assignedTo || "Unassigned"} onChange={e => updateAssignee(selected.id, e.target.value)}
                  className="text-[10px] font-black uppercase tracking-widest border border-border-dim rounded-xl px-3 py-2 outline-none bg-surface text-muted shadow-sm hover:border-primary/30 transition-all appearance-none cursor-pointer">
                  {ASSIGNEES.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
                </select>
                {selected.status !== "Resolved" && (
                  <button onClick={() => closeTicket(selected.id)} className="flex items-center gap-2 px-4 py-2 text-[9px] font-black text-green-500 bg-green-500/10 hover:bg-green-500 hover:text-white rounded-xl border border-green-500/20 transition-all uppercase tracking-widest active:scale-95">
                    <CheckCircle2 size={14} /> Close
                  </button>
                )}
                <button onClick={() => setSelected(null)} className="p-2 text-muted hover:text-main-text hover:bg-surface rounded-xl transition-all"><X size={20} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-custom bg-surface/30 relative">
              <div className="absolute inset-0 bg-linear-to-b from-surface/20 to-transparent pointer-events-none h-20 z-10"/>
              {selected.messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.sender === "admin" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-[10px] uppercase tracking-widest shadow-lg ${msg.sender === "admin" ? "bg-primary text-white" : "bg-card border border-border-dim text-muted"}`}>
                    {msg.sender === "admin" ? "A" : selected.user.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className={`max-w-[75%] ${msg.sender === "admin" ? "items-end" : "items-start"} flex flex-col gap-2.5`}>
                    <div className={`px-6 py-4 rounded-2xl text-[13px] leading-relaxed font-bold shadow-xl transition-all border ${msg.sender === "admin" ? "bg-primary text-white rounded-tr-none border-primary/20 shadow-primary/10" : "bg-card border-border-dim text-main-text rounded-tl-none hover:border-primary/20"}`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted/40 px-2 italic">{new Date(msg.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} UTC+05:30</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Composer */}
            <div className="p-5 border-t border-border-dim bg-surface/30 shrink-0">
              {/* Controls */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 bg-input p-1 rounded-xl border border-border-dim shadow-inner">
                  {(["In-App", "Email", "SMS"] as const).map(ch => (
                    <button key={ch} onClick={() => setChannel(ch)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${channel === ch ? "bg-card shadow-lg text-primary border border-border-dim" : "text-muted hover:text-main-text opacity-60"}`}>{ch}</button>
                  ))}
                </div>
                <label className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted cursor-pointer group px-4 py-2 bg-input border border-border-dim rounded-2xl shadow-inner hover:border-amber-500/30 transition-all">
                  <div onClick={() => setIsInternalNote(n => !n)} className={`w-10 h-5 rounded-full transition-all relative ring-2 ring-inset ${isInternalNote ? "bg-amber-500 ring-amber-600/20 shadow-[0_0_15px_rgba(245,158,11,0.4)]" : "bg-card ring-border-dim"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-lg transition-all ${isInternalNote ? "translate-x-5.5" : "translate-x-0.5"}`} />
                  </div>
                  <span className={`transition-colors italic ${isInternalNote ? "text-amber-500" : "group-hover:text-main-text"}`}>INTERNAL_AUDIT_PROTOCOL</span>
                </label>
                <div className="relative ml-auto">
                  <button onClick={() => setShowTemplates(s => !s)} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg border ${showTemplates ? "bg-primary/10 text-primary border-primary/20" : "text-muted hover:text-primary border-transparent"}`}>
                    <FileText size={13} /> Responses <ChevronDown size={12} className={showTemplates ? "rotate-180 transition-all" : "transition-all"} />
                  </button>
                  {showTemplates && (
                    <div className="absolute bottom-full right-0 mb-3 w-80 bg-card rounded-2xl border border-border-dim shadow-2xl p-2.5 z-20 transition-all animate-in slide-in-from-bottom-2">
                       <div className="px-3 py-2 text-[8px] font-black uppercase tracking-widest text-muted/60 border-b border-border-dim mb-1">Standard Transmission Protocols</div>
                      {QUICK_TEMPLATES.map((tpl, i) => (
                        <button key={i} onClick={() => { setReply(tpl); setShowTemplates(false); }}
                          className="w-full text-left text-[11px] font-bold text-main-text/70 px-4 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-all line-clamp-2 leading-relaxed mb-1 last:mb-0 border border-transparent hover:border-primary/20">{tpl}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendReply(); }}
                    placeholder={isInternalNote ? "Input internal audit note (non-user visibility)..." : `Compose transmission via ${channel} stream...`}
                    rows={2}
                    className={`w-full p-4 border rounded-2xl text-[13px] font-medium outline-none resize-none transition-all shadow-inner leading-relaxed ${isInternalNote ? "border-amber-500/50 bg-amber-500/5 placeholder-amber-500/40 text-amber-500" : "bg-input border-border-dim focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-main-text"}`}
                  />
                  {isInternalNote && <span className="absolute top-3 right-3 text-[8px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 shadow-sm animate-pulse">Internal Protocol</span>}
                </div>
                <button onClick={sendReply} disabled={!reply.trim()}
                  className="px-6 py-4 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all disabled:opacity-40 flex flex-col items-center justify-center gap-1 self-end font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-lg shadow-primary/20 min-w-[90px]">
                  <Send size={18} />
                  <span>Send</span>
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3 opacity-40">
                <kbd className="px-1.5 py-0.5 bg-surface border border-border-dim rounded-md text-[8px] font-black mono uppercase">Ctrl</kbd>
                <span className="text-[8px]">+</span>
                <kbd className="px-1.5 py-0.5 bg-surface border border-border-dim rounded-md text-[8px] font-black mono uppercase">Enter</kbd>
                <span className="text-[9px] font-black uppercase tracking-tight text-muted ml-1">to execute transmission</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State when no ticket selected */}
        {!selected && filtered.length > 0 && (
          <div className="hidden" />
        )}
      </div>
    </div>
  );
}
