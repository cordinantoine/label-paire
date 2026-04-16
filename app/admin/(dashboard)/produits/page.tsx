"use client";

import { useEffect, useState } from "react";
import { products } from "@/lib/products";

type BadgeMap = Record<string, string | null>;

const BADGE_OPTIONS = [
  { value: "", label: "Aucun" },
  { value: "Bestseller", label: "Bestseller" },
  { value: "Nouveauté", label: "Nouveauté" },
];

export default function ProduitsPage() {
  const [badges, setBadges] = useState<BadgeMap>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/product-meta")
      .then((r) => r.json())
      .then((metas: { slug: string; badge: string | null }[]) => {
        const map: BadgeMap = {};
        for (const m of metas) map[m.slug] = m.badge;
        setBadges(map);
      });
  }, []);

  function getBadge(slug: string): string {
    if (Object.prototype.hasOwnProperty.call(badges, slug)) {
      return badges[slug] ?? "";
    }
    // fallback to static default
    return products.find((p) => p.slug === slug)?.badge ?? "";
  }

  async function handleChange(slug: string, value: string) {
    setSaving(slug);
    setSaved(null);
    const badge = value === "" ? null : value;
    setBadges((prev) => ({ ...prev, [slug]: badge }));
    await fetch("/api/admin/product-meta", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, badge }),
    });
    setSaving(null);
    setSaved(slug);
    setTimeout(() => setSaved(null), 2000);
  }

  return (
    <div>
      <h1 className="font-playfair text-2xl font-semibold text-white mb-2">
        Produits
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Modifiez le badge affiché sur chaque produit. La modification est instantanée.
      </p>

      <div className="rounded-xl border border-white/[0.08] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.04] text-gray-400 text-left">
              <th className="px-5 py-3 font-medium">Produit</th>
              <th className="px-5 py-3 font-medium">Slug</th>
              <th className="px-5 py-3 font-medium text-right">Prix</th>
              <th className="px-5 py-3 font-medium text-right">Poids (kg)</th>
              <th className="px-5 py-3 font-medium text-center">Badge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {products.map((p) => (
              <tr key={p.slug} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4 text-white font-medium">{p.nom}</td>
                <td className="px-5 py-4 text-gray-400 font-mono text-xs">{p.slug}</td>
                <td className="px-5 py-4 text-right text-white">{p.prix} €</td>
                <td className="px-5 py-4 text-right">
                  <span className="inline-block bg-white/[0.06] text-[#ff9ed5] px-2 py-0.5 rounded text-xs font-mono">
                    {p.poids} kg
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <select
                      value={getBadge(p.slug)}
                      onChange={(e) => handleChange(p.slug, e.target.value)}
                      disabled={saving === p.slug}
                      className="bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#ff9ed5]/50 disabled:opacity-50 cursor-pointer"
                    >
                      {BADGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {saving === p.slug && (
                      <span className="text-xs text-gray-500">...</span>
                    )}
                    {saved === p.slug && (
                      <span className="text-xs text-[#ff9ed5]">✓</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-600">
        Les badges sont stockés en base de données et s&apos;appliquent immédiatement sur le site.
      </p>
    </div>
  );
}
