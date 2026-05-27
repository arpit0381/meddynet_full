"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Lab {
  id: string;
  name: string;
  address: string;
  rating?: number;
  distance?: number;
  lat?: number;
  lng?: number;
}

interface MapComponentProps {
  labs: Lab[];
  selectedLab: string | null;
  onSelectLab?: (id: string) => void;
  userLocation?: { lat: number; lng: number } | null;
  mapMode?: 'light' | 'dark' | 'satellite';
  zoom?: number;
  interactive?: boolean;
}

// Map Tile URLs
const TILE_URLS = {
  light: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

// Helper to center map when selected lab changes
function ChangeView({ center, zoom = 15 }: { center: [number, number], zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, map, zoom]);
  return null;
}

// Fix for map not showing correctly in modals
function ResizeHandler() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);
  return null;
}

const UserIcon = L.divIcon({
  className: 'user-marker',
  html: `<div class="w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow-xl animate-pulse"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function MapComponent({ labs, selectedLab, onSelectLab, userLocation, mapMode = 'light', zoom = 12, interactive = true }: MapComponentProps) {
  const defaultCenter: [number, number] = [28.6139, 77.2090];
  
  const selectedLabObj = labs.find(l => l.id === selectedLab);
  const selectedCoord: [number, number] | null = selectedLabObj?.lat && selectedLabObj?.lng 
    ? [selectedLabObj.lat, selectedLabObj.lng] 
    : (userLocation ? [userLocation.lat, userLocation.lng] : null);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={selectedCoord || defaultCenter}
        zoom={zoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={false}
        touchZoom={interactive}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={TILE_URLS[mapMode]}
        />

        {/* Labels overlay for Satellite mode to show streets/cities */}
        {mapMode === 'satellite' && (
          <TileLayer
            attribution='&copy; CartoDB'
            url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
            zIndex={10}
          />
        )}

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={UserIcon}>
            <Popup>
              <div className="text-center font-bold p-1">Your Location</div>
            </Popup>
          </Marker>
        )}

        {labs.map((lab) => {
          if (!lab.lat || !lab.lng) return null;
          const pos: [number, number] = [lab.lat, lab.lng];
          return (
            <Marker
              key={lab.id}
              position={pos}
              eventHandlers={{
                click: () => onSelectLab && onSelectLab(lab.id),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[150px]">
                  <h4 className="font-black text-dark text-sm m-0 leading-tight">{lab.name}</h4>
                  <p className="text-[10px] font-bold text-text-muted m-0 mt-1 uppercase tracking-widest">{lab.address}</p>
                  <div className="flex items-center gap-1 mt-2">
                      <span className="text-[10px] font-black text-primary">★ {lab.rating || 4.5}</span>
                      <span className="text-[10px] text-text-muted">· {lab.distance} km</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        {selectedCoord && <ChangeView center={selectedCoord} zoom={zoom} />}
        <ResizeHandler />
      </MapContainer>
      
      <style jsx global>{`
        .leaflet-container {
          background: #f8fafc;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 16px;
          padding: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .custom-popup .leaflet-popup-tip {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
