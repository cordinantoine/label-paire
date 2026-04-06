"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { ParcelShop } from "@/app/api/mr-parcelshops/route";

export type RelayPoint = {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  lat?: number;
  lng?: number;
};

type Props = {
  postalCode: string;
  country: string;
  onSelect: (point: RelayPoint) => void;
  selectedPoint: RelayPoint | null;
  t: (v: { fr: string; en: string }) => string;
};

// Leaflet components (client-only)
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer    = dynamic(() => import("react-leaflet").then(m => m.TileLayer),    { ssr: false });
const Marker       = dynamic(() => import("react-leaflet").then(m => m.Marker),       { ssr: false });
const Popup        = dynamic(() => import("react-leaflet").then(m => m.Popup),        { ssr: false });

export default function RelayPointPicker({ postalCode, country, onSelect, selectedPoint, t }: Props) {
  const [points, setPoints]   = useState<ParcelShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [leafletReady, setLeafletReady] = useState(false);

  // Load Leaflet CSS + fix default icon paths
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(l);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import("leaflet").then((L: any) => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setLeafletReady(true);
    });
  }, []);

  // Fetch relay points when postal code changes
  useEffect(() => {
    if (!postalCode) return;
    setLoading(true);
    fetch("/api/mr-parcelshops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postalCode, country }),
    })
      .then(r => r.json())
      .then(d => setPoints(d.points ?? []))
      .catch(() => setPoints([]))
      .finally(() => setLoading(false));
  }, [postalCode, country]);

  const center = useMemo(() => {
    const valid = points.filter(p => p.lat && p.lng);
    if (!valid.length) return { lat: 48.85, lng: 2.35 };
    return {
      lat: valid.reduce((s, p) => s + p.lat, 0) / valid.length,
      lng: valid.reduce((s, p) => s + p.lng, 0) / valid.length,
    };
  }, [points]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500 text-sm gap-2">
        <svg className="animate-spin h-4 w-4 text-[#ff9ed5]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {t({ fr: "Recherche des points relais...", en: "Searching relay points..." })}
      </div>
    );
  }

  if (!points.length) {
    return (
      <p className="text-center py-4 text-gray-500 text-xs">
        {t({ fr: "Aucun point Mondial Relay trouvé pour ce code postal. Choisissez Colissimo.", en: "No Mondial Relay point found. Please choose Colissimo." })}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 mt-1">
      <p className="text-xs text-gray-400 font-medium">
        📍 {t({ fr: `${points.length} points relais proches`, en: `${points.length} nearby relay points` })}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* Map */}
        <div className="rounded-xl overflow-hidden border border-white/10 h-[260px] bg-[#1a1a1a]">
          {leafletReady ? (
            <MapContainer
              center={[center.lat, center.lng]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://osm.org">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {points.filter(p => p.lat && p.lng).map(sp => (
                <Marker
                  key={sp.id}
                  position={[sp.lat!, sp.lng!]}
                  eventHandlers={{ click: () => onSelect(sp) }}
                >
                  <Popup>
                    <div className="text-xs font-medium">{sp.name}</div>
                    {sp.address && <div className="text-xs text-gray-500">{sp.address}</div>}
                    <div className="text-xs text-gray-500">{sp.postalCode} {sp.city}</div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600 text-xs">
              {t({ fr: "Chargement de la carte...", en: "Loading map..." })}
            </div>
          )}
        </div>

        {/* List */}
        <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-0.5">
          {points.map((sp, i) => {
            const isSel = selectedPoint?.id === sp.id;
            return (
              <button
                key={sp.id}
                onClick={() => onSelect(sp)}
                className={`w-full text-left rounded-lg px-3 py-2.5 border transition-all ${
                  isSel
                    ? "border-[#ff9ed5] bg-[#ff9ed5]/10"
                    : "border-white/[0.06] hover:border-white/20 bg-transparent"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                    isSel ? "bg-[#ff9ed5] text-black" : "bg-white/10 text-gray-400"
                  }`}>
                    {isSel ? "✓" : i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${isSel ? "text-[#ff9ed5]" : "text-white"}`}>
                      {sp.name}
                    </p>
                    {sp.address && (
                      <p className="text-[11px] text-gray-500 truncate">{sp.address}</p>
                    )}
                    <p className="text-[11px] text-gray-600">{sp.postalCode} {sp.city}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirmation */}
      {selectedPoint && (
        <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/25 rounded-lg px-3 py-2.5">
          <span className="text-green-400 text-sm mt-0.5">✓</span>
          <div>
            <p className="text-green-400 text-xs font-semibold">{selectedPoint.name}</p>
            <p className="text-green-400/70 text-xs">
              {selectedPoint.address}{selectedPoint.address ? ", " : ""}{selectedPoint.postalCode} {selectedPoint.city}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
