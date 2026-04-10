"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { ChronoParcelShop, DayHours } from "@/app/api/chronopost-parcelshops/route";

export type { ChronoParcelShop };

type Props = {
  postalCode: string;
  city: string;
  address: string;
  onSelect: (point: ChronoParcelShop) => void;
  selectedPoint: ChronoParcelShop | null;
  t: (v: { fr: string; en: string }) => string;
};

// Leaflet components (client-only)
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer    = dynamic(() => import("react-leaflet").then(m => m.TileLayer),    { ssr: false });
const Marker       = dynamic(() => import("react-leaflet").then(m => m.Marker),       { ssr: false });
const Popup        = dynamic(() => import("react-leaflet").then(m => m.Popup),        { ssr: false });

const DAYS_FR      = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"] as const;
const DAYS_EN      = ["Mon",   "Tue",   "Wed",      "Thu",   "Fri",      "Sat",    "Sun"      ] as const;
const DAYS_FR_SHORT = ["Lun",  "Mar",   "Mer",      "Jeu",   "Ven",      "Sam",    "Dim"      ] as const;

/* ── Hour formatting ── */
function formatSlot(h: DayHours | undefined): string {
  if (!h || !h.open1) return "Fermé";
  let s = `${h.open1}–${h.close1}`;
  if (h.open2) s += ` / ${h.open2}–${h.close2}`;
  return s;
}

function isOpenNow(hours: ChronoParcelShop["hours"]): boolean {
  const now = new Date();
  const dayIdx = (now.getDay() + 6) % 7; // Mon=0
  const dayKey = DAYS_FR[dayIdx];
  const h = hours[dayKey];
  if (!h?.open1) return false;

  const mins = now.getHours() * 60 + now.getMinutes();
  const toMin = (t: string) => { const [hh, mm] = t.split(":").map(Number); return hh * 60 + mm; };

  if (mins >= toMin(h.open1) && mins <= toMin(h.close1!)) return true;
  if (h.open2 && mins >= toMin(h.open2) && mins <= toMin(h.close2!)) return true;
  return false;
}

export default function ChronopostPointPicker({ postalCode, city, address, onSelect, selectedPoint, t }: Props) {
  const [points, setPoints]             = useState<ChronoParcelShop[]>([]);
  const [loading, setLoading]           = useState(true);
  const [leafletReady, setLeafletReady] = useState(false);
  const [expandedId, setExpandedId]     = useState<string | null>(null);

  const isFr = () => t({ fr: "fr", en: "en" }) === "fr";

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

  // Fetch Chronopost Shop2Shop relay points via Boxtal API
  useEffect(() => {
    if (!postalCode) return;
    setLoading(true);
    fetch("/api/boxtal-parcelshops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postalCode, city, address, networks: "CHRP" }),
    })
      .then(r => r.json())
      .then(d => setPoints(d.points ?? []))
      .catch(() => setPoints([]))
      .finally(() => setLoading(false));
  }, [postalCode, city, address]);

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
        {t({ fr: "Recherche des points Shop2Shop...", en: "Searching Shop2Shop points..." })}
      </div>
    );
  }

  if (!points.length) {
    return (
      <p className="text-center py-4 text-gray-500 text-xs">
        {t({ fr: "Aucun point Chronopost Shop2Shop trouvé pour ce code postal.", en: "No Chronopost Shop2Shop point found for this postal code." })}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 mt-1">
      <p className="text-xs text-gray-400 font-medium">
        {t({ fr: `${points.length} points Shop2Shop proches`, en: `${points.length} nearby Shop2Shop points` })}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* ── Map ── */}
        <div className="rounded-xl overflow-hidden border border-white/10 h-[280px] bg-[#1a1a1a]">
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
              {points.filter(p => p.lat && p.lng).map((sp) => (
                <Marker
                  key={sp.id}
                  position={[sp.lat, sp.lng]}
                  eventHandlers={{ click: () => onSelect(sp) }}
                >
                  <Popup>
                    <div className="text-xs">
                      <p className="font-bold">{sp.name}</p>
                      <p className="text-gray-600">{sp.address}</p>
                      <p className="text-gray-600">{sp.postalCode} {sp.city}</p>
                    </div>
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

        {/* ── List ── */}
        <div className="flex flex-col gap-1.5 max-h-[280px] overflow-y-auto pr-0.5 custom-scrollbar">
          {points.map((sp, i) => {
            const isSel     = selectedPoint?.id === sp.id;
            const isExpanded = expandedId === sp.id;
            const open      = isOpenNow(sp.hours);

            return (
              <div key={sp.id} className="flex flex-col">
                <button
                  onClick={() => {
                    onSelect(sp);
                    setExpandedId(isExpanded ? null : sp.id);
                  }}
                  className={`w-full text-left rounded-lg px-3 py-2.5 border transition-all ${
                    isSel
                      ? "border-[#ff9ed5] bg-[#ff9ed5]/10"
                      : "border-white/[0.06] hover:border-white/20 bg-transparent"
                  } ${isExpanded && !isSel ? "rounded-b-none" : ""}`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                      isSel ? "bg-[#ff9ed5] text-black" : "bg-white/10 text-gray-400"
                    }`}>
                      {isSel ? "✓" : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold truncate ${isSel ? "text-[#ff9ed5]" : "text-white"}`}>
                        {sp.name}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">{sp.address}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-gray-600">{sp.postalCode} {sp.city}</p>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                          open ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                        }`}>
                          {open
                            ? t({ fr: "Ouvert", en: "Open" })
                            : t({ fr: "Fermé", en: "Closed" })}
                        </span>
                      </div>
                      {sp.distance > 0 && (
                        <p className="text-[10px] text-gray-600 mt-0.5">
                          {sp.distance >= 1000
                            ? `${(sp.distance / 1000).toFixed(1)} km`
                            : `${sp.distance} m`}
                        </p>
                      )}
                    </div>
                    {/* Expand chevron */}
                    <svg
                      className={`w-3.5 h-3.5 text-gray-500 mt-1 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* ── Opening hours (expanded) ── */}
                {isExpanded && (
                  <div className={`border border-t-0 rounded-b-lg px-3 py-2 ${
                    isSel ? "border-[#ff9ed5] bg-[#ff9ed5]/5" : "border-white/[0.06] bg-white/[0.02]"
                  }`}>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1.5">
                      {t({ fr: "Horaires d'ouverture", en: "Opening hours" })}
                    </p>
                    <div className="grid grid-cols-1 gap-0.5">
                      {DAYS_FR.map((day, di) => {
                        const h = sp.hours[day];
                        const today = (new Date().getDay() + 6) % 7 === di;
                        const slot = formatSlot(h);
                        const closed = slot === "Fermé";
                        return (
                          <div key={day} className={`flex justify-between text-[10px] py-0.5 px-1 rounded ${
                            today ? "bg-white/[0.04]" : ""
                          }`}>
                            <span className={`${today ? "text-white font-semibold" : "text-gray-500"}`}>
                              {isFr() ? DAYS_FR_SHORT[di] : DAYS_EN[di]}
                              {today && " •"}
                            </span>
                            <span className={closed ? "text-red-400/70" : today ? "text-white" : "text-gray-400"}>
                              {closed ? t({ fr: "Fermé", en: "Closed" }) : slot}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Confirmation banner ── */}
      {selectedPoint && (
        <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/25 rounded-lg px-3 py-2.5">
          <span className="text-green-400 text-sm mt-0.5">✓</span>
          <div>
            <p className="text-green-400 text-xs font-semibold">{selectedPoint.name}</p>
            <p className="text-green-400/70 text-xs">
              {selectedPoint.address}{selectedPoint.address ? ", " : ""}
              {selectedPoint.postalCode} {selectedPoint.city}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
