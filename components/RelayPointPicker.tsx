"use client";

import { useEffect, useState, useMemo } from "react";
import type { ServicePoint } from "@/app/api/service-points/route";

// Dynamically import react-leaflet (client-only)
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

type Props = {
  postalCode: string;
  country: string;
  carrier: string;
  selectedPoint: ServicePoint | null;
  onSelect: (point: ServicePoint) => void;
  t: (v: { fr: string; en: string }) => string;
};

export default function RelayPointPicker({ postalCode, country, carrier, selectedPoint, onSelect, t }: Props) {
  const [points, setPoints] = useState<ServicePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [leafletReady, setLeafletReady] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Load leaflet CSS + fix default icon
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Fix Leaflet default icon paths
    import("leaflet").then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setLeafletReady(true);
    });
  }, []);

  // Fetch service points
  useEffect(() => {
    if (!postalCode) return;
    setLoading(true);
    fetch("/api/service-points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postalCode, country, carrier }),
    })
      .then((r) => r.json())
      .then((data) => setPoints(data.points ?? []))
      .catch(() => setPoints([]))
      .finally(() => setLoading(false));
  }, [postalCode, country, carrier]);

  // Map center
  const center = useMemo(() => {
    if (points.length > 0) {
      return {
        lat: points.reduce((s, p) => s + p.latitude, 0) / points.length,
        lng: points.reduce((s, p) => s + p.longitude, 0) / points.length,
      };
    }
    // Default center (France)
    return { lat: 48.85, lng: 2.35 };
  }, [points]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
        <svg className="animate-spin h-4 w-4 mr-2 text-[#ff9ed5]" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {t({ fr: "Recherche des points relais...", en: "Searching relay points..." })}
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        {t({ fr: "Aucun point relais trouvé pour ce code postal. Essayez un autre mode de livraison.", en: "No relay points found for this postal code. Try another shipping method." })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-400 font-medium">
        📍 {t({ fr: `${points.length} points relais trouvés près de ${postalCode}`, en: `${points.length} relay points found near ${postalCode}` })}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Map */}
        <div className="rounded-xl overflow-hidden border border-white/10 h-[280px] md:h-[320px] relative bg-[#1a1a1a]">
          {leafletReady && (
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
              {points.map((sp) => (
                <Marker
                  key={sp.id}
                  position={[sp.latitude, sp.longitude]}
                  eventHandlers={{
                    click: () => onSelect(sp),
                  }}
                >
                  <Popup>
                    <div className="text-xs">
                      <strong>{sp.name}</strong><br />
                      {sp.street} {sp.house_number}<br />
                      {sp.postal_code} {sp.city}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
          {!leafletReady && (
            <div className="flex items-center justify-center h-full text-gray-600 text-xs">
              {t({ fr: "Chargement de la carte...", en: "Loading map..." })}
            </div>
          )}
        </div>

        {/* List */}
        <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
          {points.map((sp, i) => {
            const isSelected = selectedPoint?.id === sp.id;
            const isHovered = hoveredId === sp.id;
            return (
              <button
                key={sp.id}
                onClick={() => onSelect(sp)}
                onMouseEnter={() => setHoveredId(sp.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`w-full text-left rounded-lg px-3 py-2.5 border transition-all ${
                  isSelected
                    ? "border-[#ff9ed5] bg-[#ff9ed5]/10"
                    : isHovered
                      ? "border-white/20 bg-white/[0.03]"
                      : "border-white/[0.06] bg-transparent"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                    isSelected ? "bg-[#ff9ed5] text-black" : "bg-white/10 text-gray-400"
                  }`}>
                    {isSelected ? "✓" : i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${isSelected ? "text-[#ff9ed5]" : "text-white"}`}>
                      {sp.name}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {sp.street} {sp.house_number}
                    </p>
                    <p className="text-[11px] text-gray-600">
                      {sp.postal_code} {sp.city}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedPoint && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
          <span className="text-green-400 text-xs">✓</span>
          <span className="text-green-400 text-xs font-medium">
            {t({ fr: "Point relais sélectionné :", en: "Selected relay point:" })} {selectedPoint.name}
          </span>
        </div>
      )}
    </div>
  );
}
