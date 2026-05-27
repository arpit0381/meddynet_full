'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useJobStore, JobStatus } from '@/store/jobStore';
import { ArrowLeft, MapPinned, Info, Navigation, Globe, ShieldCheck, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';

import { JobHeader } from '@/components/job/JobHeader';
import { JobAddress } from '@/components/job/JobAddress';
import { JobActionBtn } from '@/components/job/JobActionBtn';
import { JobProgressTracking } from '@/components/job/JobProgressTracking';
import { SampleChecklist } from '@/components/job/SampleChecklist';
import { useLocation } from '@/hooks/useLocation';

// Dynamically import map with Mapbox to avoid SSR issues
const LiveMap = dynamic(() => import('@/components/map/LiveMap'), { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-950 flex items-center justify-center text-white/20 font-black uppercase text-[10px] tracking-[0.3em]">Calibrating Satellite...</div>
});

export default function JobDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const { jobs, updateJobStatus } = useJobStore();
  const { location, error: locError } = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const job = jobs.find(j => j.id === id) || null;
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("tech_token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      router.push('/login');
    }

    // Connect Real-time Pulse via WebSocket
    if (token && job) {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
      // Using a deterministic ID for session consistency
      const techSid = `tech_${token.slice(-8)}`; 
      const ws = new WebSocket(`${wsUrl}/ws/tech/${techSid}`);
      wsRef.current = ws;

      ws.onopen = () => {
        // Telemetry connected
        toast.success("GPS Telemetry Online", { duration: 2000 });
      };

      ws.onclose = () => { /* disconnected */ };

      return () => ws.close();
    }
  }, [router, job]);

  // Sync REAL Geolocation to WebSocket
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && location && job) {
        wsRef.current.send(JSON.stringify({
            type: "location_update",
            job_id: job.id,
            lat: location.lat,
            lng: location.lng,
            timestamp: new Date().toISOString()
        }));
    }
  }, [location, job]);


  if (!isAuthenticated || !job) return null;

  const handleStatusUpdate = async (newStatus: JobStatus) => {
    if (newStatus === 'report_ready') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/pdf';
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
          setIsUploading(true);
          const formData = new FormData();
          formData.append('report_file', file);
          formData.append('booking_id', id);
          try {
            const api = (await import('@/lib/api')).default;
            await api.post(`/reports`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Lab record synchronized to vault.");
            router.push('/dashboard');
          } catch (err) {
            toast.error("Cloud synchronization failure.");
          } finally {
            setIsUploading(false);
          }
        }
      };
      input.click();
      return;
    }

    if ('vibrate' in navigator) navigator.vibrate([40, 30, 40]);
    await updateJobStatus(job.id, newStatus);
    toast.success(`Protocol Advance: ${newStatus.replace('_', ' ').toUpperCase()}`);

    if (newStatus === 'completed') {
      setTimeout(() => router.push('/dashboard'), 1000);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden relative font-sans selection:bg-primary selection:text-white">
      
      {/* Sidebar - Tactical Command Panel */}
      <div className="md:w-[480px] md:h-full md:bg-white md:shadow-[20px_0_60px_-15px_rgba(0,0,0,0.05)] md:z-30 md:flex md:flex-col md:border-r md:border-slate-100 shrink-0">
        
        {/* Desktop Header Overlay */}
        <div className="hidden md:flex flex-col px-12 pt-14 pb-10 border-b border-slate-50 bg-slate-50/30 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-3 text-slate-400 hover:text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-12 hover:-translate-x-1 transition-all w-fit relative z-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Abort Command
          </button>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              <span className="text-emerald-600 font-black text-[9px] tracking-[0.2em] uppercase">Tactical Feed Active</span>
            </div>
          </div>
          
          <JobHeader job={job} />
        </div>

        {/* Tactical Directives */}
        <div className="hidden md:block flex-1 overflow-y-auto px-12 py-12 space-y-14 no-scrollbar">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
              <div className="w-8 h-8 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                <Navigation className="w-4 h-4 text-primary" />
              </div>
              Operation progress
            </h3>
            <JobProgressTracking currentStatus={job.status} />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
              <div className="w-8 h-8 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                <MapPinned className="w-4 h-4 text-primary" />
              </div>
              Dropzone Coordinates
            </h3>
            <JobAddress address={job.address} />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }} 
            className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/5 flex items-start gap-6 group hover:translate-y-[-2px] transition-all shadow-2xl relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-12 -mt-12" />
             <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-lg relative z-10">
               <ShieldCheck className="w-7 h-7 text-primary" />
             </div>
             <div className="relative z-10">
               <p className="font-black text-white text-[10px] uppercase tracking-widest leading-none mb-3">Tech Directive 102</p>
               <p className="text-xs text-white/50 font-bold leading-relaxed opacity-80">Verify payload integrity markers and ensure tactical sterilization before proceeding with dropzone acquisition.</p>
             </div>
          </motion.div>

          {/* Sample Verification Checklist */}
          <AnimatePresence>
            {(job.status === 'arrived' || job.status === 'sample_collected') && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                className="mt-4"
              >
                <SampleChecklist onComplete={() => {
                  toast.success('Collection Verified!', { icon: '🛡️' });
                  if (job.status === 'arrived') {
                    updateJobStatus(job.id, 'sample_collected');
                  }
                }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Command Controls */}
        <div className="hidden md:block px-12 py-12 border-t border-slate-50 bg-white/80 backdrop-blur-xl relative z-40">
           <JobActionBtn status={job.status} onClick={handleStatusUpdate} />
        </div>
      </div>

      {/* Main Map Arena */}
      <div className="flex-1 w-full bg-slate-900 relative md:h-full h-[calc(100vh-16rem)]">
        {/* Mobile Header Overlay */}
        <div className="md:hidden absolute top-0 w-full z-40 bg-linear-to-b from-slate-950/90 via-slate-950/40 to-transparent pt-safe px-6 pb-16 flex items-center justify-between pointer-events-none">
          <button 
            onClick={() => router.back()} 
            className="pointer-events-auto w-14 h-14 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center justify-center text-white active:scale-90 transition-all shadow-2xl"
          >
            <ArrowLeft size={22} className="drop-shadow-lg" />
          </button>
          <div className="px-6 py-3 bg-primary text-white font-black text-[9px] tracking-[0.4em] uppercase rounded-full shadow-2xl shadow-primary/30 pointer-events-auto active:scale-95 transition-all">
            MOD: {id.slice(-4)}
          </div>
        </div>

        <LiveMap markerPos={[job.lat, job.lng]} />
        
        {/* Tactical HUD Overlays */}
        <div className="hidden md:block absolute top-12 right-12 z-20">
          <Card className="bg-slate-950/80 backdrop-blur-3xl border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] rounded-[3rem] p-10 w-96 text-white group overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[70px] -mr-20 -mt-20 group-hover:bg-primary/30 transition-all duration-1000" />
             
             <div className="flex items-center gap-5 mb-8 relative z-10">
               <div className="w-14 h-14 rounded-[1.5rem] bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl">
                 <Globe className="w-8 h-8 text-primary animate-pulse" />
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">GPS Sync</span>
                  </div>
                  <span className="text-[11px] font-black text-white/40 uppercase tracking-widest block">Accuracy threshold met</span>
               </div>
             </div>

             <div className="space-y-6 relative z-10 mb-10">
                <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Signal strength</span>
                    <span className="text-[10px] font-black text-primary uppercase">99.9% Optimal</span>
                </div>
                <p className="text-[11px] font-bold text-white/30 leading-relaxed group-hover:text-white/50 transition-colors">Satellite telemetry relaying high-fidelity dropzone coordinates. High precision acquisition active.</p>
             </div>

             <button className="w-full bg-primary text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-primary/90 transition-all hover:translate-y-[-2px] shadow-2xl shadow-primary/20 active:scale-95 relative z-10">
                Calibrate Terminal
             </button>
          </Card>
        </div>

        {/* Tactical Status Floating Badge */}
        <div className="hidden md:flex absolute bottom-12 right-12 z-20 items-center gap-4 px-6 py-4 bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl text-white shadow-2xl">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1">Battery critical</span>
                <span className="text-[8px] font-bold text-white/40 uppercase">Optimizing GPS pooling</span>
            </div>
        </div>
      </div>

      {/* Mobile Interaction Sheet */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 bg-[#F9FAFB] rounded-t-[3.5rem] shadow-[0_-30px_80px_-15px_rgba(0,0,0,0.4)] z-40 flex flex-col pt-4 pb-10 px-6 transition-all duration-500 border-t border-white/5 max-h-[75%] overflow-y-auto no-scrollbar">
        <div className="w-14 h-1.5 bg-slate-200/80 rounded-full mx-auto mb-10 shrink-0"></div>
        
        <div className="space-y-10">
          <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}>
            <JobProgressTracking currentStatus={job.status} />
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <JobHeader job={job} />
          </motion.div>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-8">
            <JobAddress address={job.address} />
            
            <AnimatePresence>
              {(job.status === 'arrived' || job.status === 'sample_collected') && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                   <SampleChecklist onComplete={() => {
                      toast.success('Collection Verified!');
                      if (job.status === 'arrived') {
                        updateJobStatus(job.id, 'sample_collected');
                      }
                   }} />
                </motion.div>
              )}
            </AnimatePresence>
            
            <JobActionBtn status={job.status} onClick={handleStatusUpdate} />
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
