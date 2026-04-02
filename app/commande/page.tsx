"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cartStore";
import { useT } from "@/hooks/useT";
import { tr } from "@/lib/i18n";

const COUNTRIES = [
  { code: "FR", label: "France" },
  { code: "BE", label: "Belgique / België" },
  { code: "CH", label: "Suisse / Schweiz" },
  { code: "LU", label: "Luxembourg" },
  { code: "DE", label: "Deutschland" },
  { code: "ES", label: "España" },
  { code: "IT", label: "Italia" },
  { code: "NL", label: "Nederland" },
  { code: "PT", label: "Portugal" },
  { code: "GB", label: "United Kingdom" },
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
];

export default function Commande() {
  const { items, total } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: "", email: "", adresse: "", ville: "", cp: "", pays: "FR",
  });
  const { t } = useT();

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-white/10 bg-[#1a1a1a] text-white text-sm focus:outline-none focus:border-[#ff9ed5] placeholder-gray-600";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          email:   form.email,
          nom:     form.nom,
          adresse: form.adresse,
          ville:   form.ville,
          cp:      form.cp,
          pays:    form.pays,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erreur lors de la redirection vers Stripe.");
        setLoading(false);
      }
    } catch {
      alert("Une erreur est survenue.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <h1 className="font-playfair text-4xl font-bold text-white mb-4">{t(tr.checkout_title)}</h1>
        <p className="text-gray-500">{t(tr.checkout_empty)}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="font-playfair text-4xl font-bold text-white mb-10">{t(tr.checkout_title)}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>{t(tr.checkout_name_label)}</label>
            <input type="text" required value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className={inputClass} placeholder={t(tr.checkout_name_ph)} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass} placeholder={t(tr.checkout_email_ph)} />
          </div>
          <div>
            <label className={labelClass}>{t(tr.checkout_addr_label)}</label>
            <input type="text" required value={form.adresse}
              onChange={(e) => setForm({ ...form, adresse: e.target.value })}
              className={inputClass} placeholder={t(tr.checkout_addr_ph)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t(tr.checkout_zip_label)}</label>
              <input type="text" required value={form.cp}
                onChange={(e) => setForm({ ...form, cp: e.target.value })}
                className={inputClass} placeholder={t(tr.checkout_zip_ph)} />
            </div>
            <div>
              <label className={labelClass}>{t(tr.checkout_city_label)}</label>
              <input type="text" required value={form.ville}
                onChange={(e) => setForm({ ...form, ville: e.target.value })}
                className={inputClass} placeholder={t(tr.checkout_city_ph)} />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className={labelClass}>
              {t({ fr: "Pays", en: "Country" })}
            </label>
            <select
              value={form.pays}
              onChange={(e) => setForm({ ...form, pays: e.target.value })}
              className={inputClass + " cursor-pointer"}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={loading}
            className="mt-2 btn-shimmer text-[#0a0a0a] font-semibold py-4 rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? t(tr.checkout_paying) : t(tr.checkout_pay)}
          </button>
          <p className="text-xs text-gray-500 text-center">{t(tr.checkout_secure)}</p>
        </form>

        {/* Order summary */}
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-6 h-fit">
          <h2 className="font-playfair text-xl font-bold text-white mb-5">{t(tr.checkout_order_title)}</h2>
          <div className="flex flex-col gap-3 mb-5">
            {items.map((item) => (
              <div key={item.slug} className="flex justify-between text-sm">
                <span className="text-gray-400">{item.nom} × {item.quantity}</span>
                <span className="font-medium text-white">{(item.prix * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.08] pt-4 flex justify-between font-semibold text-white">
            <span>{t(tr.cart_total)}</span>
            <span>{total() >= 50 ? total().toFixed(2) : (total() + 4.9).toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </div>
  );
}
