"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Navigation, Map as MapIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { Lab } from "@/lib/labs";
import { haptics } from "@/lib/haptics";

const MapComponent = dynamic(() => import("@/components/dashboard/MapComponent"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse rounded-[32px] flex items-center justify-center text-xs font-black text-slate-400 uppercase tracking-widest">Loading Map...</div>
});

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lab: Lab;
}

export default function MapModal({ isOpen, onClose, lab }: MapModalProps) {
  const handleOpenGoogleMaps = () => {
    haptics.medium();
    const query = encodeURIComponent(`${lab.name}, ${lab.address}, ${lab.city}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-200 flex items-end sm:items-center justify-center p-0 sm:p-6 lg:p-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-dark/70 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, y: "100%", scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: "100%", scale: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-6xl h-[92vh] sm:h-[84vh] bg-white rounded-t-[40px] sm:rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border bg-surface shrink-0">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[22px] bg-linear-to-br ${lab.color} flex items-center justify-center text-white text-2xl font-black shadow-xl ring-4 ring-white`}>
                  {lab.initials}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-dark tracking-tighter leading-none mb-2">{lab.name}</h3>
                  <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                     <MapPin className="w-3.5 h-3.5 text-primary" /> {lab.address}, {lab.city}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleOpenGoogleMaps}
                  className="flex-1 sm:flex-none h-14 px-8 bg-dark text-white rounded-[22px] font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-dark/20 hover:bg-dark-light hover:-translate-y-0.5 active:scale-95 transition-all group"
                >
                  <Navigation className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span className="hidden xs:inline">Get Directions</span>
                  <span className="xs:hidden">Navigate</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-14 h-14 flex items-center justify-center rounded-[22px] bg-white border border-border text-text-muted hover:text-dark hover:border-dark transition-all group active:scale-95"
                >
                  <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 min-h-[400px] relative">
              <MapComponent labs={[lab]} selectedLab={lab.id} zoom={15} />
              
              {/* Desktop Floating Action */}
              <div className="absolute right-8 bottom-8 hidden sm:block">
                 <div className="p-4 bg-white/80 backdrop-blur-md rounded-[28px] border border-white/40 shadow-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                       <MapIcon className="w-6 h-6" />
                    </div>
                    <div className="pr-4">
                       <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-0.5">Precise Location</p>
                       <p className="text-sm font-black text-dark leading-none">{lab.distance} km from you</p>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
