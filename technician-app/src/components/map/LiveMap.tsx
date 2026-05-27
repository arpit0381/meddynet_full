'use client';

import { useEffect, useState, useRef } from 'react';
import Map, { Marker, NavigationControl, ScaleControl, MapRef, ViewStateChangeEvent } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLocation } from '@/hooks/useLocation';
import { MapPin, Navigation } from 'lucide-react';

// Public token - In production, this should be in .env.local
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface LiveMapProps {
  center?: [number, number];
  markerPos?: [number, number];
}

export default function LiveMap({ center, markerPos }: LiveMapProps) {
  const { location, error } = useLocation();
  const [mounted, setMounted] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const mapRef = useRef<MapRef>(null);

  const defaultCenter = {
    latitude: 28.6139,
    longitude: 77.2090,
    zoom: 14
  };

  const [viewState, setViewState] = useState(defaultCenter);

  useEffect(() => {
    setMounted(true);
    
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (!navigator.onLine) setIsOffline(true);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync viewState when location or props change
  useEffect(() => {
    if (markerPos) {
        setViewState(prev => ({
            ...prev,
            latitude: markerPos[0],
            longitude: markerPos[1]
        }));
    } else if (location) {
        setViewState(prev => ({
            ...prev,
            latitude: location.lat,
            longitude: location.lng
        }));
    }
  }, [location, markerPos]);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-slate-900 animate-pulse flex flex-col items-center justify-center gap-4">
        <div className="relative">
             <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
             <Navigation className="absolute inset-0 m-auto w-6 h-6 text-primary" />
        </div>
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Initializing Tactical Map...</p>
      </div>
    );
  }

  const currentLat = markerPos ? markerPos[0] : (location?.lat || defaultCenter.latitude);
  const currentLng = markerPos ? markerPos[1] : (location?.lng || defaultCenter.longitude);

  return (
    <div className="w-full h-full relative group overflow-hidden">
      <Map
        {...viewState}
        ref={mapRef}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        antialias={true}
      >
        {/* Navigation Controls */}
        <div className="absolute top-4 left-4 z-20">
           <NavigationControl visualizePitch={true} />
        </div>
        
        <div className="absolute bottom-10 left-4 z-20">
           <ScaleControl unit="metric" />
        </div>

        {/* Current Location / Target Marker */}
        <Marker 
            latitude={currentLat} 
            longitude={currentLng} 
            anchor="bottom"
        >
            <div className="relative group/pin cursor-pointer">
                {/* Visual Ping Effect */}
                <div className="absolute inset-0 m-auto w-10 h-10 bg-primary/30 rounded-full animate-ping scale-150" />
                <div className="absolute inset-0 m-auto w-6 h-6 bg-primary/20 rounded-full blur-md" />
                
                {/* Premium Marker Design */}
                <div className="relative w-8 h-8 bg-slate-900 border-2 border-primary rounded-2xl rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all group-hover/pin:scale-110 group-hover/pin:-translate-y-1">
                    <MapPin className="w-4 h-4 text-primary -rotate-45" />
                </div>
                
                {/* Floating Label */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-lg opacity-0 group-hover/pin:opacity-100 transition-all pointer-events-none whitespace-nowrap">
                    <span className="text-[8px] font-black text-white uppercase tracking-widest leading-none">Payload Location</span>
                </div>
            </div>
        </Marker>

        {/* Error State Overlay */}
        {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-6 py-2 bg-red-500/90 backdrop-blur-xl border border-red-400/50 rounded-full shadow-2xl">
                <p className="text-[9px] font-black text-white uppercase tracking-widest">{error}</p>
            </div>
        )}

        {/* Offline Interaction Shield */}
        {isOffline && (
            <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-8 pointer-events-none">
                 <div className="bg-slate-900 border-2 border-red-500/20 rounded-[2.5rem] p-10 text-center max-w-sm shadow-2xl relative overflow-hidden pointer-events-auto">
                      <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
                      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                           <MapPin className="w-10 h-10 text-red-500" />
                      </div>
                      <h3 className="text-xl font-black text-white tracking-tighter uppercase italic mb-3">Offline <span className="not-italic text-red-500">Maps Restricted</span></h3>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] leading-relaxed">Tactical telemetry connection lost. Map tiles restricted. Core status reporting will sync automatically on reconnect.</p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="mt-8 px-8 py-3 bg-white text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                      >
                        Force Resync
                      </button>
                 </div>
            </div>
        )}
      </Map>

      {/* Map Decorative Overlay (Corners) */}
      <div className="absolute inset-0 pointer-events-none border border-white/5 z-10" />
      <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-primary/20 rounded-tl-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-primary/20 rounded-br-3xl pointer-events-none" />
    </div>
  );
}
