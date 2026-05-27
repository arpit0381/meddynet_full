"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic import for Leaflet because it relies on 'window'
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface TechnicianLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: string;
}

export default function FleetMap({ technicians }: { technicians: TechnicianLocation[] }) {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  if (!L) return <div className="h-full w-full bg-surface animate-pulse" />;

  const customIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <MapContainer
      center={[28.6139, 77.209]}
      zoom={11}
      className="h-full w-full rounded-2xl z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {technicians.map((tech) => (
        <Marker
          key={tech.id}
          position={[tech.lat, tech.lng]}
          icon={customIcon}
        >
          <Popup>
            <div className="p-2">
              <p className="font-bold text-sm uppercase">{tech.name}</p>
              <p className="text-xs text-muted">ID: {tech.id}</p>
              <div className="flex items-center gap-2 mt-2">
                 <span className={`w-2 h-2 rounded-full ${tech.status === 'On Duty' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                 <span className="text-[10px] font-bold uppercase tracking-widest">{tech.status}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
