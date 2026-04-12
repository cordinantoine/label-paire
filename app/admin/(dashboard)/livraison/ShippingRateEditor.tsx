"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Rate = {
  id: string;
  country: string;
  maxWeightKg: number;
  priceEur: number;
  minDays: number;
  maxDays: number;
};

const COUNTRY_LABELS: Record<string, string> = {
  FR: "France",
  BE: "Belgique / Luxembourg",
  LU: "Luxembourg",
  NL: "Pays-Bas",
  DE: "Allemagne",
  ES: "Espagne",
  PT: "Portugal",
  IT: "Italie",
  AT: "Autriche",
};

const COUNTRY_ORDER = ["FR", "BE", "LU", "NL", "DE", "ES", "PT", "IT", "AT"];

function formatWeight(kg: number) {
  return kg < 1 ? `${kg * 1000} g` : `${kg} kg`;
}

function RateRow({ rate }: { rate: Rate }) {
  const router = useRouter();
  const [price, setPrice] = useState(rate.priceEur.toFixed(2));
  const [minDays, setMinDays] = useState(String(rate.minDays));
  const [maxDays, setMaxDays] = useState(String(rate.maxDays));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  const inputCls =
    "bg-black border border-white/[0.12] rounded px-2 py-1 text-white text-sm w-full focus:outline-none focus:border-[#ff9ed5]/50 transition-colors";

  async function save() {
    setSaving(true);
    await fetch("/api/admin/shipping-rates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: rate.id,
        priceEur: parseFloat(price),
        minDays: parseInt(minDays),
        maxDays: parseInt(maxDays),
      }),
    });
    setSaving(false);
    setSaved(true);
    setDirty(false);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <tr className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
      <td className="px-5 py-3 text-gray-400 text-sm tabular-nums">
        ≤ {formatWeight(rate.maxWeightKg)}
      </td>
      <td className="px-5 py-3 w-28">
        <div className="flex items-center gap-1">
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => { setPrice(e.target.value); setDirty(true); }}
            className={inputCls}
          />
          <span className="text-gray-500 text-xs whitespace-nowrap">€</span>
        </div>
      </td>
      <td className="px-5 py-3 w-20">
        <input
          type="number"
          min="1"
          value={minDays}
          onChange={(e) => { setMinDays(e.target.value); setDirty(true); }}
          className={inputCls}
        />
      </td>
      <td className="px-5 py-3 w-20">
        <input
          type="number"
          min="1"
          value={maxDays}
          onChange={(e) => { setMaxDays(e.target.value); setDirty(true); }}
          className={inputCls}
        />
      </td>
      <td className="px-5 py-3 w-24 text-right">
        {dirty && (
          <button
            onClick={save}
            disabled={saving}
            className="text-xs px-3 py-1.5 bg-[#ff9ed5] text-black font-semibold rounded hover:bg-[#ffb3de] transition-colors disabled:opacity-50"
          >
            {saving ? "…" : "Sauver"}
          </button>
        )}
        {saved && !dirty && (
          <span className="text-green-400 text-xs">✓</span>
        )}
      </td>
    </tr>
  );
}

function CountryTable({ country, rates }: { country: string; rates: Rate[] }) {
  return (
    <div className="bg-[#111] border border-white/[0.08] rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <h2 className="font-semibold text-white text-sm">{COUNTRY_LABELS[country] ?? country}</h2>
        <span className="text-xs text-gray-500">{rates.length} paliers</span>
      </div>
      <table className="w-full">
        <thead>
          <tr className="text-xs text-gray-600 uppercase tracking-wide">
            <th className="px-5 py-2 text-left font-medium">Poids max</th>
            <th className="px-5 py-2 text-left font-medium">Prix TTC</th>
            <th className="px-5 py-2 text-left font-medium">J. min</th>
            <th className="px-5 py-2 text-left font-medium">J. max</th>
            <th className="px-5 py-2" />
          </tr>
        </thead>
        <tbody>
          {rates.map((r) => (
            <RateRow key={r.id} rate={r} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ShippingRateEditor({ rates }: { rates: Rate[] }) {
  const grouped = COUNTRY_ORDER.reduce<Record<string, Rate[]>>((acc, c) => {
    const r = rates.filter((x) => x.country === c);
    if (r.length) acc[c] = r;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([country, r]) => (
        <CountryTable key={country} country={country} rates={r} />
      ))}
    </div>
  );
}
