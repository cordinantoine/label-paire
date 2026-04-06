"use client";

import { useEffect, useRef, useState } from "react";

export type RelayPoint = {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
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
  interface Window {
    $: any;
    jQuery: any;
  }
}

const MR_BRAND = "CC22X0UA";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject();
    document.body.appendChild(s);
  });
}

function loadCSS(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  document.head.appendChild(l);
}

export default function RelayPointPicker({ postalCode, country, onSelect, selectedPoint, t }: Props) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const initialized = useRef(false);
  const currentPostal = useRef(postalCode);

  const initWidget = (postal: string) => {
    if (!window.$ || !document.getElementById("Zone_Widget")) return;
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
  };

  // Load scripts once
  useEffect(() => {
    loadCSS("https://widget.mondialrelay.com/parcelshop-picker/v4_1/css/widget-v4_1.css");

    loadScript("https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js")
      .then(() => loadScript("https://widget.mondialrelay.com/parcelshop-picker/v4_1/widget-v4_1.min.js"))
      .then(() => {
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  // Init widget once scripts are ready
  useEffect(() => {
    if (status !== "ready" || initialized.current) return;
    initialized.current = true;
    currentPostal.current = postalCode;
    setTimeout(() => initWidget(postalCode), 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Reinit when postal code changes
  useEffect(() => {
    if (status !== "ready" || !initialized.current) return;
    if (postalCode === currentPostal.current) return;
    currentPostal.current = postalCode;
    initWidget(postalCode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postalCode, status]);

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" id="MR_SelectedPoint" />

      {/* Loading state */}
      {status === "loading" && (
        <div className="flex items-center justify-center py-10 text-gray-500 text-sm gap-2">
          <svg className="animate-spin h-4 w-4 text-[#ff9ed5]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {t({ fr: "Chargement du sélecteur de points relais...", en: "Loading relay point picker..." })}
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="text-red-400 text-xs py-4 text-center">
          {t({ fr: "Impossible de charger le widget. Choisissez un autre mode de livraison.", en: "Unable to load widget. Please choose another shipping method." })}
        </div>
      )}

      {/* Widget container — always in DOM so MRWWidget can mount */}
      <div
        id="Zone_Widget"
        className="rounded-xl overflow-hidden bg-white"
        style={{ minHeight: status === "ready" ? 420 : 0 }}
      />

      {/* Selected relay point confirmation */}
      {selectedPoint && (
        <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/25 rounded-lg px-3 py-2.5">
          <span className="text-green-400 text-sm mt-0.5">✓</span>
          <div>
            <p className="text-green-400 text-xs font-semibold">{selectedPoint.name}</p>
            <p className="text-green-400/70 text-xs">{selectedPoint.address}, {selectedPoint.postalCode} {selectedPoint.city}</p>
          </div>
        </div>
      )}
    </div>
  );
}
