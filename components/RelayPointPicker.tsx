"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";

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

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window { $: any; jQuery: any; }
}

const MR_BRAND = "CC22X0UA";
const WIDGET_JS = "https://widget.mondialrelay.com/parcelshop-picker/v4_1/widget-v4_1.min.js";
const WIDGET_CSS = "https://widget.mondialrelay.com/parcelshop-picker/v4_1/css/widget-v4_1.css";
const JQUERY_JS = "https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js";

// ── Leaflet map (lazy) ────────────────────────────────────────────────────────
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer    = dynamic(() => import("react-leaflet").then(m => m.TileLayer),    { ssr: false });
const Marker       = dynamic(() => import("react-leaflet").then(m => m.Marker),       { ssr: false });
const Popup        = dynamic(() => import("react-leaflet").then(m => m.Popup),        { ssr: false });

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(s);
  });
}

function loadCSS(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement("link");
  l.rel = "stylesheet"; l.href = href;
  document.head.appendChild(l);
}

// ── Leaflet fallback map ──────────────────────────────────────────────────────
function LeafletPicker({ points, selectedPoint, onSelect, t }: {
  points: RelayPoint[];
  selectedPoint: RelayPoint | null;
  onSelect: (p: RelayPoint) => void;
  t: Props["t"];
}) {
  const [leafletReady, setLeafletReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(l);
    }
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setLeafletReady(true);
    });
  }, []);

  const validPoints = points.filter(p => p.lat && p.lng);

  const center = useMemo(() => {
    if (validPoints.length === 0) return { lat: 48.85, lng: 2.35 };
    return {
      lat: validPoints.reduce((s, p) => s + (p.lat ?? 0), 0) / validPoints.length,
      lng: validPoints.reduce((s, p) => s + (p.lng ?? 0), 0) / validPoints.length,
    };
  }, [validPoints]);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-400 font-medium">
        📍 {t({ fr: `${points.length} points relais trouvés`, en: `${points.length} relay points found` })}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Map */}
        <div className="rounded-xl overflow-hidden border border-white/10 h-[280px] bg-[#1a1a1a]">
          {leafletReady && validPoints.length > 0 && (
            <MapContainer center={[center.lat, center.lng]} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
              <TileLayer attribution='&copy; OSM' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {validPoints.map(sp => (
                <Marker key={sp.id} position={[sp.lat!, sp.lng!]} eventHandlers={{ click: () => onSelect(sp) }}>
                  <Popup><div className="text-xs"><strong>{sp.name}</strong><br />{sp.address}<br />{sp.postalCode} {sp.city}</div></Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
          {(!leafletReady || validPoints.length === 0) && (
            <div className="flex items-center justify-center h-full text-gray-600 text-xs">
              {t({ fr: "Chargement de la carte...", en: "Loading map..." })}
            </div>
          )}
        </div>
        {/* List */}
        <div className="flex flex-col gap-1.5 max-h-[280px] overflow-y-auto">
          {points.map((sp, i) => {
            const isSel = selectedPoint?.id === sp.id;
            return (
              <button key={sp.id} onClick={() => onSelect(sp)}
                className={`w-full text-left rounded-lg px-3 py-2.5 border transition-all ${isSel ? "border-[#ff9ed5] bg-[#ff9ed5]/10" : "border-white/[0.06] hover:border-white/20"}`}>
                <div className="flex items-start gap-2">
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${isSel ? "bg-[#ff9ed5] text-black" : "bg-white/10 text-gray-400"}`}>
                    {isSel ? "✓" : i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${isSel ? "text-[#ff9ed5]" : "text-white"}`}>{sp.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{sp.address}</p>
                    <p className="text-[11px] text-gray-600">{sp.postalCode} {sp.city}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {selectedPoint && (
        <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/25 rounded-lg px-3 py-2.5">
          <span className="text-green-400 text-sm">✓</span>
          <div>
            <p className="text-green-400 text-xs font-semibold">{selectedPoint.name}</p>
            <p className="text-green-400/70 text-xs">{selectedPoint.address}, {selectedPoint.postalCode} {selectedPoint.city}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function RelayPointPicker({ postalCode, country, onSelect, selectedPoint, t }: Props) {
  const [mode, setMode] = useState<"loading" | "jquery-widget" | "leaflet-fallback" | "error">("loading");
  const [apiPoints, setApiPoints] = useState<RelayPoint[]>([]);
  const initialized = useRef(false);
  const currentPostal = useRef(postalCode);

  const initJqueryWidget = (postal: string) => {
    if (!window.$ || !window.$.fn?.MRWWidget) return false;
    const el = document.getElementById("Zone_Widget");
    if (!el) return false;
    window.$("#Zone_Widget").empty();
    window.$("#Zone_Widget").MRWWidget({
      Target: "#MR_SelectedPoint",
      Brand: MR_BRAND,
      Country: country || "FR",
      PostCode: postal,
      OnParcelShopSelected: (data: any) => {
        onSelect({
          id: data.ID,
          name: data.Nom,
          address: [data.Adresse1, data.Adresse2].filter(Boolean).join(" "),
          city: data.Ville,
          postalCode: data.CP,
        });
      },
    });
    return true;
  };

  const fetchApiPoints = async (postal: string) => {
    try {
      const res = await fetch("/api/mr-parcelshops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postalCode: postal, country }),
      });
      const data = await res.json();
      return data.points ?? [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || initialized.current) return;
    initialized.current = true;
    currentPostal.current = postalCode;

    loadCSS(WIDGET_CSS);

    // Try loading jQuery widget first
    loadScript(JQUERY_JS)
      .then(() => loadScript(WIDGET_JS))
      .then(() => {
        // Small delay to let the plugin register
        setTimeout(() => {
          if (window.$.fn?.MRWWidget) {
            setMode("jquery-widget");
            setTimeout(() => initJqueryWidget(postalCode), 50);
          } else {
            // Widget script loaded but didn't register → fall back to API
            switchToFallback(postalCode);
          }
        }, 300);
      })
      .catch(() => switchToFallback(postalCode));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchToFallback = async (postal: string) => {
    const points = await fetchApiPoints(postal);
    setApiPoints(points);
    setMode(points.length > 0 ? "leaflet-fallback" : "error");
  };

  // Reinit when postal code changes
  useEffect(() => {
    if (!initialized.current || postalCode === currentPostal.current) return;
    currentPostal.current = postalCode;
    if (mode === "jquery-widget") {
      initJqueryWidget(postalCode);
    } else if (mode === "leaflet-fallback") {
      fetchApiPoints(postalCode).then(pts => setApiPoints(pts));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postalCode, mode]);

  if (mode === "loading") {
    return (
      <div className="flex items-center justify-center py-10 text-gray-500 text-sm gap-2">
        <svg className="animate-spin h-4 w-4 text-[#ff9ed5]" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {t({ fr: "Chargement des points relais...", en: "Loading relay points..." })}
      </div>
    );
  }

  if (mode === "error") {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        {t({ fr: "Aucun point relais trouvé. Choisissez Colissimo à la place.", en: "No relay points found. Please choose Colissimo instead." })}
      </div>
    );
  }

  if (mode === "leaflet-fallback") {
    return <LeafletPicker points={apiPoints} selectedPoint={selectedPoint} onSelect={onSelect} t={t} />;
  }

  // jQuery widget mode
  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" id="MR_SelectedPoint" />
      <div id="Zone_Widget" className="rounded-xl overflow-hidden bg-white" style={{ minHeight: 420 }} />
      {selectedPoint && (
        <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/25 rounded-lg px-3 py-2.5">
          <span className="text-green-400 text-sm">✓</span>
          <div>
            <p className="text-green-400 text-xs font-semibold">{selectedPoint.name}</p>
            <p className="text-green-400/70 text-xs">{selectedPoint.address}, {selectedPoint.postalCode} {selectedPoint.city}</p>
          </div>
        </div>
      )}
    </div>
  );
}
