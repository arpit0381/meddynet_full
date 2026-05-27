"use client";

import { motion, AnimatePresence } from "framer-motion";
import { use, useState, useEffect } from "react";
import {
    CheckCircle2,
    Clock,
    ArrowLeft,
    Phone,
    FlaskConical,
    FileText,
    User,
    Truck,
    Zap,
    ShieldCheck,
    Navigation,
    ExternalLink,
    CircleDashed,
    Loader2,
    MessageCircle,
    MapPin
} from "lucide-react";
import Link from "next/link";
import { useBooking, useCancelBooking } from "@/lib/hooks";
import Toast from "@/components/ui/Toast";
import MapComponent from "@/components/dashboard/MapComponent";
import { Skeleton } from "@/components/ui/Skeleton";

interface TrackingPayload {
  lat: number;
  lng: number;
  job_id: string;
}

const statusToSteps = (status: string) => {
    const allSteps = [
        { id: "1", label: "Booking Confirmed", description: "Your booking has been confirmed and payment processed.", status: "pending" as string },
        { id: "2", label: "Technician Assigned", description: "A qualified phlebotomist has been assigned to your booking.", status: "pending" as string },
        { id: "3", label: "Technician En Route", description: "Your phlebotomist is on the way to your location.", status: "pending" as string },
        { id: "4", label: "Sample Collected", description: "Blood sample has been collected and sealed for transport.", status: "pending" as string },
        { id: "5", label: "Lab Processing", description: "Your sample is being analyzed at the diagnostic lab.", status: "pending" as string },
        { id: "6", label: "Report Ready", description: "Your diagnostic report is ready for viewing.", status: "pending" as string },
    ];

    const statusOrder = ["pending", "confirmed", "assigned", "on_the_way", "arrived", "sample_collected", "report_ready", "completed"];
    const idx = statusOrder.indexOf(status);

    return allSteps.map((step, i) => {
        if (i < idx) return { ...step, status: "completed" };
        if (i === idx) return { ...step, status: "active" };
        return step;
    });
};

const stepIcons: Record<string, React.ElementType> = {
    "Booking Confirmed": CheckCircle2,
    "Technician Assigned": User,
    "Technician En Route": Truck,
    "Sample Collected": FlaskConical,
    "Lab Processing": Clock,
    "Report Ready": FileText,
};

const getLabColor = (name: string) => {
    const colors = [
        "from-blue-500 to-blue-600",
        "from-emerald-500 to-emerald-600",
        "from-purple-500 to-purple-600",
        "from-rose-500 to-rose-600",
        "from-amber-500 to-amber-600",
        "from-teal-500 to-teal-600",
    ];
    return colors[(name?.length || 0) % colors.length];
};

export default function BookingTrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: booking, isLoading } = useBooking(id);
    const cancelMutation = useCancelBooking();
    
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [techLocation, setTechLocation] = useState<{lat: number, lng: number} | null>(null);

    useEffect(() => {
        if (!isTracking || !booking?.id) return;
        
        let ws: WebSocket;
        let retryCount = 0;
        let reconnectTimeout: NodeJS.Timeout;

        const connect = () => {
            const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/tracking/${booking.id}`;
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                retryCount = 0;
            };

            ws.onmessage = (event) => {
                try {
                    const data: TrackingPayload = JSON.parse(event.data);
                    if (data.lat && data.lng) {
                        setTechLocation({ lat: data.lat, lng: data.lng });
                        setToast({ message: "Technician location updated.", type: "info" });
                    }
                } catch (e) {
                    console.error("GPS Parse Error", e);
                }
            };

            ws.onclose = () => {
                const timeout = Math.min(30000, Math.pow(2, retryCount) * 1000);
                reconnectTimeout = setTimeout(() => {
                    retryCount++;
                    connect();
                }, timeout);
            };

            ws.onerror = (err) => {
                console.error("WebSocket Error", err);
                ws.close();
            };
        };

        connect();

        return () => {
            if (ws) ws.close();
            clearTimeout(reconnectTimeout);
        };
    }, [isTracking, booking?.id]);

    if (isLoading) {
        return (
            <div className="max-w-[1240px] mx-auto space-y-12 py-10">
                <div className="flex justify-between items-center bg-white p-8 rounded-[40px] border border-border">
                    <div className="flex gap-6 items-center">
                        <Skeleton className="w-16 h-16 rounded-2xl" />
                        <div className="space-y-3">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-8">
                        <Skeleton className="h-[400px] w-full rounded-[40px]" />
                        <div className="space-y-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-4 space-y-8">
                        <Skeleton className="h-[300px] w-full rounded-[40px]" />
                        <Skeleton className="h-[200px] w-full rounded-[40px]" />
                    </div>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="max-w-[700px] mx-auto py-24 text-center space-y-6">
                <div className="w-24 h-24 bg-surface rounded-[40px] flex items-center justify-center mx-auto mb-6 border border-border">
                    <FileText className="w-10 h-10 text-text-light" />
                </div>
                <h2 className="text-3xl font-black text-dark-light tracking-tight">Trace Terminated</h2>
                <p className="text-text-secondary font-medium max-w-xs mx-auto mb-8">Identifier {id.slice(0, 8)}... not found in our global diagnostic ledger.</p>
                <Link href="/dashboard/bookings" className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-primary/20">
                    <ArrowLeft className="w-4 h-4" /> Return to Hub
                </Link>
            </div>
        );
    }

    const steps = statusToSteps(booking.status);
    const completedCount = steps.filter(s => s.status === "completed").length;
    const progress = Math.round((completedCount / steps.length) * 100);
    const labName = booking.lab?.name || "Lab";
    const labInitials = labName.slice(0, 2).toUpperCase();
    const labColor = getLabColor(labName);
    const tests = booking.items?.map(i => i.name) || ["Diagnostic Test"];
    const totalAmount = booking.total_amount / 100;
    const isLabVisit = booking.type === "lab_visit";
    const isCancellable = ["pending", "confirmed"].includes(booking.status);


    const handleLiveTracking = () => {
        setIsTracking(true);
        setToast({ message: "Connecting to live GPS feed... Protocol initialized.", type: "info" });
    };

    const handleCancel = async () => {
        try {
            await cancelMutation.mutateAsync(booking.id);
            setToast({ message: "Booking cancellation request submitted successfully.", type: "success" });
        } catch {
            setToast({ message: "Failed to cancel booking. Please try again.", type: "error" });
        }
    };

    const handleReschedule = () => {
        setIsRescheduling(true);
        setTimeout(() => {
            setIsRescheduling(false);
            setToast({ message: "Rescheduling portal opening... Please select a new slot.", type: "info" });
        }, 1500);
    };

    const handleOpenGoogleMaps = () => {
        if (!booking.lab) return;
        const encodedAddress = encodeURIComponent(`${booking.lab.name}, ${booking.lab.address || ""}, ${booking.lab.city || ""}`);
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, "_blank");
    };

    return (
        <div className="max-w-[900px] mx-auto space-y-10 pb-24">
            <AnimatePresence>
                {toast && (
                    <Toast 
                        message={toast.message} 
                        type={toast.type} 
                        onClose={() => setToast(null)} 
                    />
                )}
            </AnimatePresence>

            {/* Dynamic Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <Link href="/dashboard/bookings" className="w-12 h-12 flex items-center justify-center bg-white border border-border rounded-2xl text-text-muted hover:text-primary hover:border-primary/20 transition-all shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{isLabVisit ? "Direct Visit Protocol" : "Tracking Protocol"}</span>
                            <span className="w-1 h-3 bg-accent rounded-full" />
                        </div>
                        <h1 className="text-3xl font-black text-dark-light tracking-tight">{isLabVisit ? "Lab Locator" : "Journey Tracker"}</h1>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface-dark border border-border-dark rounded-2xl">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Live Endpoint Data</span>
                </div>
            </div>

            {/* Primary Tracking Console */}
            <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[48px] border border-border shadow-2xl shadow-primary/5 p-8 sm:p-10 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-3xl rounded-full" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 border-b border-dashed border-border-dark/30 pb-10 mb-10">
                    <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-[28px] sm:rounded-[32px] bg-linear-to-br ${labColor} text-white flex items-center justify-center font-black text-lg shadow-xl shadow-dark/10 group-hover:scale-105 group-hover:rotate-3 transition-all duration-500`}>
                            {labInitials}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-1">{booking.id.slice(0, 8)}...</p>
                            <h2 className="text-xl sm:text-2xl font-black text-dark-light tracking-tight">{labName}</h2>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {tests.map(t => (
                                    <span key={t} className="px-2 py-0.5 bg-surface-dark rounded-lg text-[10px] font-bold text-text-muted">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-row md:flex-col lg:items-end justify-between items-center gap-4">
                        <div className="flex flex-col lg:items-end">
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Status Magnitude</span>
                            <div className="flex items-center gap-2">
                                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                    <Zap className="w-3.5 h-3.5 fill-current" /> {isLabVisit ? "VISIT SCHEDULED" : `${progress}% SYNCED`}
                                </motion.div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Payable Total</p>
                            <p className="text-2xl sm:text-3xl font-black text-dark-light tracking-tighter leading-none">₹{totalAmount}</p>
                        </div>
                    </div>
                </div>

                {isLabVisit ? (
                    <div className="space-y-8 relative z-10">
                        <div className="h-[400px] w-full rounded-[40px] overflow-hidden relative group shadow-2xl shadow-primary/5">
                             <MapComponent 
                                labs={booking.lab ? [{ id: booking.lab.id, name: booking.lab.name, address: booking.lab.address || "" }] : []}
                                selectedLab={booking.lab?.id || null}
                                zoom={15}
                             />
                             <div className="absolute top-6 left-6 z-10">
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="px-5 py-3 bg-white/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl flex items-center gap-3"
                                >
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Live Status</span>
                                        <span className="text-[11px] font-black text-dark tracking-tight">Lab Open: 07:00 AM - 09:00 PM</span>
                                    </div>
                                </motion.div>
                             </div>
                        </div>
                        
                        <div className="p-8 sm:p-10 bg-surface/50 border border-border-dark/50 rounded-[44px] flex flex-col md:flex-row items-center justify-between gap-8 group/nav">
                            <div className="flex items-center gap-6 text-center md:text-left">
                                <div className="relative">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[28px] bg-linear-to-br from-dark-light to-slate-800 text-white flex items-center justify-center font-black text-xl shadow-xl">
                                        <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-xl border-4 border-surface items-center justify-center flex">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm sm:text-lg font-black text-dark-light leading-tight tracking-tight uppercase line-clamp-2">{booking.lab?.address || booking.address || "Lab Address"}</p>
                                    <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-[0.2em]">{booking.lab?.city || ""} · Official Endpoint</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                <button 
                                    onClick={handleOpenGoogleMaps}
                                    className="w-full sm:w-auto h-14 sm:h-16 px-10 bg-dark text-white rounded-2xl sm:rounded-3xl flex items-center justify-center gap-3 hover:bg-dark-light transition-all active:scale-95 font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-dark/20 group/maps"
                                >
                                    <Navigation className="w-5 h-5 text-primary group-hover/maps:translate-x-1 group-hover/maps:-translate-y-1 transition-transform" />
                                    Navigate
                                </button>
                                <Link 
                                    href={`/dashboard/chat/${booking.id}`}
                                    className="w-full sm:w-auto h-14 sm:h-16 px-10 bg-white border border-border text-dark-light rounded-2xl sm:rounded-3xl flex items-center justify-center gap-3 hover:shadow-xl transition-all active:scale-95 font-black text-[11px] uppercase tracking-widest"
                                >
                                    <MessageCircle className="w-5 h-5 text-primary" />
                                    Chat Support
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Multi-Dimensional Progress Bar */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-black text-text-muted uppercase tracking-widest">
                                <span className="flex items-center gap-2"><CircleDashed className="w-3.5 h-3.5 animate-spin-slow text-primary" /> Synchronization Status</span>
                                <span>Next Update in ~15m</span>
                            </div>
                            <div className="h-6 bg-surface-dark rounded-full p-1 border border-border-dark shadow-inner overflow-hidden relative">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-linear-to-r from-primary via-emerald-500 to-accent rounded-full relative shadow-[0_0_15px_rgba(0,168,107,0.3)]"
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                                </motion.div>
                            </div>
                        </div>

                        {/* Map Component for Home Collection */}
                        {isTracking && (
                            <div className="h-[400px] w-full rounded-[40px] overflow-hidden relative shadow-2xl shadow-primary/5 mt-8 border border-border">
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-dark/5 backdrop-blur-md z-10 flex items-center justify-center p-4 rounded-[40px] opacity-0 pointer-events-none data-[loading=true]:opacity-100 data-[loading=true]:pointer-events-auto transition-opacity" data-loading={!techLocation}>
                                    <div className="bg-white/90 backdrop-blur px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-widest text-primary flex items-center gap-3">
                                        <Loader2 className="w-5 h-5 animate-spin" /> Acquiring GPS Lock...
                                    </div>
                                </motion.div>
                                <MapComponent 
                                    labs={booking.lab ? [{ id: booking.lab.id, name: booking.lab.name, address: booking.lab.address || "", lat: techLocation?.lat, lng: techLocation?.lng }] : []}
                                    selectedLab={null}
                                    userLocation={techLocation}
                                    zoom={16}
                                />
                                <button onClick={() => setIsTracking(false)} className="absolute top-6 right-6 z-20 px-4 py-2 bg-white/90 backdrop-blur rounded-2xl text-xs font-black text-dark-light hover:bg-surface-dark transition-all border border-border shadow-xl">
                                    Close Tracker
                                </button>
                            </div>
                        )}

                        {/* Personnel Insight */}
                        {booking.tech_id && (
                            <div className="mt-10 p-6 bg-surface-dark border border-border-dark rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 group/tech">
                                <div className="flex items-center gap-5 italic text-center md:text-left">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-[24px] bg-linear-to-br from-dark to-slate-800 text-white flex items-center justify-center font-black text-xl shadow-xl">
                                            <User className="w-8 h-8" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg border-4 border-surface-dark flex items-center justify-center">
                                            <CheckCircle2 className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-dark-light uppercase tracking-tight">Assigned Specialist</p>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Phlebotomist En Route</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full md:w-auto max-w-full">
                                    <button 
                                        onClick={handleLiveTracking}
                                        className="h-10 md:h-14 px-1 md:px-6 bg-white border border-border rounded-xl md:rounded-2xl flex items-center justify-center gap-2 text-text-muted hover:text-primary transition-all active:scale-95 font-black text-[8px] md:text-[10px] uppercase tracking-tighter"
                                    >
                                        <Navigation className="w-4 h-4 text-primary shrink-0" />
                                        <span className="truncate">Live GPS</span>
                                    </button>
                                    <Link 
                                        href={`/dashboard/chat/${booking.id}`}
                                        className="h-10 md:h-14 px-1 md:px-6 bg-surface-dark border border-primary/20 text-primary rounded-xl md:rounded-2xl flex items-center justify-center gap-2 hover:bg-white transition-all active:scale-95 font-black text-[8px] md:text-[10px] uppercase tracking-tighter shadow-sm"
                                    >
                                        <MessageCircle className="w-4 h-4 shrink-0" />
                                        <span className="truncate">Chat Lab</span>
                                    </Link>
                                    <a href={`tel:${booking.patient_phone || "+919876543210"}`} className="h-10 md:h-14 px-1 md:px-8 bg-dark-light text-white rounded-xl md:rounded-2xl flex items-center justify-center gap-2 hover:bg-dark shadow-lg shadow-dark/10 transition-all active:scale-95 font-black text-[8px] md:text-[10px] uppercase tracking-tighter">
                                        <Phone className="w-4 h-4 shrink-0" />
                                        <span className="truncate">Call Now</span>
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Report Access (Added for User Request) */}
                        {["report_ready", "completed"].includes(booking.status) && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="mt-10 p-8 sm:p-10 bg-linear-to-br from-emerald-500 to-teal-700 rounded-[44px] shadow-2xl shadow-emerald-500/20 text-white relative overflow-hidden group/report"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32 group-hover/report:scale-125 transition-transform duration-1000" />
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex items-center gap-8 text-center md:text-left">
                                        <div className="w-20 h-20 rounded-[30px] bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl group-hover/report:rotate-12 transition-transform">
                                            <FileText className="w-10 h-10 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black tracking-tight mb-2">Digital Report Ready</h3>
                                            <p className="text-sm text-white/70 font-medium italic">Your health results have been validated and are ready for analysis.</p>
                                        </div>
                                    </div>
                                    <Link 
                                        href="/dashboard/reports" 
                                        className="h-16 px-10 bg-white text-emerald-700 rounded-3xl flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 shadow-2xl transition-all"
                                    >
                                        View Digital Report <ExternalLink className="w-5 h-5" />
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </motion.div>

            {/* Chronological Protocol (Timeline) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
                className="bg-white rounded-[48px] border border-border shadow-sm p-10 md:p-14"
            >
                <div className="flex items-center justify-between mb-12">
                    <h3 className="text-2xl font-black text-dark-light tracking-tight">Protocol Lifecycle</h3>
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest px-4 py-1.5 bg-surface-dark border border-border-dark rounded-full">Automated Logs</span>
                </div>

                <div className="relative">
                    <div className="absolute left-7 top-0 bottom-0 w-px bg-dashed border-l border-border-dark hidden md:block" />
                    <div className="space-y-12">
                        {steps.map((step, i) => {
                            const StepIcon = stepIcons[step.label] || CheckCircle2;
                            const isActive = step.status === "active";
                            const isCompleted = step.status === "completed";

                            return (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="flex gap-8 relative items-start"
                                >
                                    <div className="relative z-10 shrink-0">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-xl ${isCompleted
                                            ? "bg-primary border-primary text-white shadow-primary/20 scale-110"
                                            : isActive
                                                ? "bg-accent border-accent text-white shadow-accent/20 animate-pulse"
                                                : "bg-surface-dark border-border-dark text-slate-300"
                                            }`}>
                                            <StepIcon className="w-6 h-6" />
                                        </div>
                                        {isActive && (
                                            <div className="absolute -inset-2 bg-accent/20 rounded-3xl blur-md -z-10 animate-pulse" />
                                        )}
                                    </div>

                                    <div className="flex-1 pt-1 space-y-3">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                            <h4 className={`text-xl font-black tracking-tight ${!isCompleted && !isActive ? "text-slate-300" : "text-dark-light"}`}>{step.label}</h4>
                                            <div className="flex items-center gap-3">
                                                {isCompleted && <span className="text-[9px] font-black uppercase text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-lg">Validated</span>}
                                                {isActive && <span className="text-[9px] font-black uppercase text-accent px-2 py-0.5 bg-accent/10 rounded-lg animate-pulse">Running</span>}
                                            </div>
                                        </div>
                                        <p className={`text-sm font-medium leading-relaxed max-w-xl ${!isCompleted && !isActive ? "text-slate-200" : "text-text-secondary"}`}>
                                            {step.description}
                                        </p>

                                        {isActive && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-surface-dark border border-border-dark rounded-xl"
                                            >
                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Real-time status updated seconds ago</span>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </motion.div>

            {/* Info Notice card */}
            <div className="bg-surface-dark border border-border-dark rounded-[40px] p-10 flex flex-col items-center text-center gap-4 group">
                <div className="w-16 h-16 bg-white rounded-3xl border border-border shadow-sm flex items-center justify-center text-accent group-hover:rotate-12 transition-transform duration-500">
                    <ExternalLink className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-text-muted max-w-sm italic">
                    {isCancellable
                        ? "Need to update visit schedule or Cancel?"
                        : "Modification disabled. The timeframe has elapsed or the technician has already been dispatched."}
                </p>
                <div className="flex items-center gap-4">
                    {isCancellable && (
                        <button 
                            onClick={handleReschedule}
                            disabled={isRescheduling}
                            className="px-6 py-2.5 bg-white border border-border-dark rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors disabled:opacity-50"
                        >
                            {isRescheduling ? "Processing..." : "Reschedule"}
                        </button>
                    )}
                    <button
                        onClick={handleCancel}
                        disabled={!isCancellable || cancelMutation.isPending}
                        className={`px-6 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-colors ${isCancellable
                            ? "bg-white border-border-dark text-rose-500 hover:bg-rose-50 disabled:opacity-50"
                            : "bg-surface-dark border-border-dark/50 text-text-muted/40 cursor-not-allowed shadow-none"
                            }`}
                    >
                        {cancelMutation.isPending ? "Cancelling..." : "Cancel Booking"}
                    </button>
                </div>
            </div>
        </div>
    );
}
