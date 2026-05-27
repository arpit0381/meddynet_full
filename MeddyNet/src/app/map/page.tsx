"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Star,
  Navigation,
  Search,
  X,
  List,
  Map as MapIcon,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getLabs, type Lab } from "@/lib/labs";
import { haptics } from "@/lib/haptics";

import { useLanguage } from "@/context/LanguageContext";
import { Skeleton } from "@/components/ui/Skeleton";

// Dynamic import with SSR disabled to avoid Window errors
const MapComponent = dynamic(() => import("@/components/dashboard/MapComponent"), { ssr: false });

import { useSearchStore } from "@/store/searchStore";

export default function MapPage() {
  const { t } = useLanguage();
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const { query: searchQuery, viewMode } = useSearchStore();
  const [labsData, setLabsData] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapMode, setMapMode] = useState<'light' | 'dark' | 'satellite'>('light');

  useEffect(() => {
    // Get user location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fallback location (e.g., Central Delhi) if user denies permission
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    } else {
      // Fallback if not supported
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    }
  }, []);

  useEffect(() => {
    async function fetchLabs() {
      setLoading(true);
      try {
        const data = await getLabs({
          search: searchQuery,
          lat: userLocation?.lat,
          lng: userLocation?.lng,
        });
        setLabsData(data);
      } catch (error) {
        console.error("Failed to fetch labs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLabs();
  }, [searchQuery, userLocation]);

  const filteredLabs = labsData;

  const selected = labsData.find((l) => l.id === selectedLab);

  return (
    <div className="bg-surface min-h-screen">
      {/* Mobile-only view toggle if needed, or keeping it clean */}

      <div className="max-w-[1400px] mx-auto">
        <div
          className={`flex ${viewMode === "list" ? "flex-col" : ""}`}
          style={{ height: viewMode === "split" ? "calc(100vh - 80px)" : "auto" }}
        >
          {/* Map Area */}
          {viewMode === "split" && (
            <div className="flex-1 relative bg-surface">
              {/* Map Component */}
              <div className="absolute inset-0 z-0">
                <MapComponent 
                  labs={filteredLabs} 
                  selectedLab={selectedLab} 
                  onSelectLab={(id) => setSelectedLab(id)} 
                  userLocation={userLocation}
                  mapMode={mapMode}
                />
              </div>

              {/* Map Mode Switcher */}
              <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-1.5 border border-border shadow-2xl flex gap-1">
                  {(['light', 'dark', 'satellite'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => { haptics.selection(); setMapMode(mode); }}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        mapMode === mode 
                          ? "bg-dark text-white shadow-lg" 
                          : "text-text-muted hover:bg-surface"
                      }`}
                    >
                      {mode === 'light' ? 'Standard' : mode === 'satellite' ? 'Photo' : 'Night'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Overlay */}
              <div className="absolute top-6 left-6 flex flex-col gap-2 z-20 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-border shadow-2xl pointer-events-auto">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 text-center">{t("map.labsOnline")}</p>
                  <h4 className="text-dark font-black text-sm text-center">
                    {loading ? "Updating..." : `${filteredLabs.length} ${t("map.availableLabs")}`}
                  </h4>
                  <div className="w-32 h-1.5 bg-dark/10 rounded-full mt-3 overflow-hidden">
                    <motion.div 
                      animate={{ x: [-100, 100] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-1/2 h-full bg-linear-to-r from-transparent via-primary to-transparent" 
                    />
                  </div>
                </div>
              </div>

              {/* Selected Lab Preview */}
              <AnimatePresence>
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.95 }}
                    className="absolute bottom-10 left-6 right-6 lg:left-10 lg:bottom-10 bg-white rounded-[2.5rem] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.3)] p-6 z-50 max-w-md border border-border-dark/20 overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-bl ${selected.color} opacity-5 blur-2xl pointer-events-none`} />
                    
                    <button
                      onClick={() => setSelectedLab(null)}
                      className="absolute top-5 right-5 p-2 rounded-xl bg-surface hover:bg-border-dark/10 transition-colors z-10"
                    >
                      <X className="w-5 h-5 text-text-muted" />
                    </button>

                    <div className="flex items-center gap-5 mb-6">
                      <div
                        className={`w-16 h-16 rounded-3xl bg-linear-to-br ${selected.color} flex items-center justify-center text-white font-black text-xl shadow-xl shrink-0`}
                      >
                        {selected.initials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-dark-light text-xl tracking-tight truncate pr-8">
                          {selected.name}
                        </h3>
                        <div className="flex items-center gap-3 text-[13px] font-heavy text-text-secondary mt-1">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-star fill-star" />
                            {selected.rating}
                          </span>
                          <div className="w-1 h-1 rounded-full bg-border-dark" />
                          <span>{selected.distance} km {t("map.away")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <Link
                        href={`/labs/${selected.id}`}
                        className="flex-1 text-center py-4 rounded-2xl bg-dark hover:bg-dark-light text-white font-black text-sm shadow-xl shadow-dark/20 transition-all hover:-translate-y-0.5"
                      >
                        {t("map.seeDetails")}
                      </Link>
                      <button 
                        onClick={() => {
                          haptics.medium();
                          const query = encodeURIComponent(`${selected.name}, ${selected.address}, ${selected.city}`);
                          window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                        }}
                        className="px-6 py-4 rounded-2xl border-2 border-border-dark/30 text-sm font-black text-dark hover:border-primary hover:text-primary transition-all flex items-center gap-2"
                      >
                         <Navigation className="w-4 h-4" />
                         {t("map.directions")}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Lab List Panel */}
          <div
            className={`${
              viewMode === "split"
                ? "w-[380px] border-l border-border overflow-y-auto hidden lg:block"
                : "max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 w-full"
            } bg-white`}
          >
            <div className={viewMode === "split" ? "p-4" : ""}>
              <h2 className="text-sm font-bold text-dark-light mb-4 text-center sm:text-left">
                {t("map.labsNearYou")} ({filteredLabs.length})
              </h2>
              <div className={`space-y-3 ${viewMode === "list" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0" : ""}`}>
                {loading ? (
                   Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-xl border-2 border-border flex items-start gap-3">
                        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-3 w-1/4" />
                        </div>
                    </div>
                   ))
                ) : (
                  filteredLabs.map((lab) => (
                    <button
                      key={lab.id}
                      onClick={() => setSelectedLab(lab.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedLab === lab.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/30 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg bg-linear-to-br ${lab.color} flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0`}
                        >
                          {lab.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-dark-light truncate">
                            {lab.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
                            <span className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-star fill-star" />
                              {lab.rating}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" />
                              {lab.distance} km
                            </span>
                          </div>
                          <p className="text-[11px] text-primary font-semibold mt-1">
                            {t("map.from")}{lab.tests[0]?.price || "—"}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
