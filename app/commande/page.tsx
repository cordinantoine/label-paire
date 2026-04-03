"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cartStore";
import { getProductBySlug } from "@/lib/products";
import { useT } from "@/hooks/useT";
import { tr } from "@/lib/i18n";
import type { ShippingRate } from "@/app/api/shipping-rates/route";
import type { ServicePoint } from "@/app/api/service-points/route";
import dynamic from "next/dynamic";

const RelayPointPicker = dynamic(() => import("@/components/RelayPointPicker"), { ssr: false });

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

const EU_COUNTRIES = ["BE", "CH", "LU", "DE", "ES", "IT", "NL", "PT"];

const RELAY_CARRIERS = ["mondial_relay"];

function isRelayCarrier(rate: ShippingRate | null) {
  if (!rate) return false;
  return RELAY_CARRIERS.includes(rate.carrier) || rate.name.toLowerCase().includes("relais") || rate.name.toLowerCase().includes("relay");
}

// Fallback rates when Sendcloud has no carrier contracts configured
function getFallbackRates(country: string): ShippingRate[] {
  if (country === "FR") {
    return [
      { id: -2, name: "Mondial Relay - Point Relais", carrier: "mondial_relay", price: 3.90, min_days: 3, max_days: 5 },
      { id: -1, name: "Colissimo Domicile", carrier: "colissimo", price: 4.90, min_days: 2, max_days: 3 },
      { id: -3, name: "Colissimo Signature", carrier: "colissimo", price: 6.90, min_days: 2, max_days: 3 },
    ];
  }
  if (EU_COUNTRIES.includes(country) || country === "GB") {
    return [
      { id: -10, name: "Colissimo International", carrier: "colissimo", price: 9.90, min_days: 3, max_days: 7 },
      { id: -11, name: "Colissimo International Signature", carrier: "colissimo", price: 12.90, min_days: 3, max_days: 7 },
    ];
  }
  return [
    { id: -20, name: "Colissimo International", carrier: "colissimo", price: 19.90, min_days: 5, max_days: 12 },
  ];
}

type Step = "address" | "shipping" | "confirm";

export default function Commande() {
  const { items, total } = useCartStore();
  const [step, setStep]   = useState<Step>("address");
  const [loading, setLoading]   = useState(false);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [rates, setRates]       = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);

  // Relay point state
  const [selectedServicePoint, setSelectedServicePoint] = useState<ServicePoint | null>(null);

  const [form, setForm] = useState({
    nom: "", email: "", adresse: "", ville: "", cp: "", pays: "FR",
  });
  const { t } = useT();

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-white/10 bg-[#1a1a1a] text-white text-sm focus:outline-none focus:border-[#ff9ed5] placeholder-gray-600";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  // Total weight of cart
  const totalWeight = items.reduce((acc, item) => {
    const product = getProductBySlug(item.slug);
    return acc + (product?.poids ?? 0.2) * item.quantity;
  }, 0);

  // Free shipping threshold — France métropolitaine only
  const orderTotal = total();
  const freeShipping = orderTotal >= 50 && form.pays === "FR";

  const handleRateSelect = (rate: ShippingRate) => {
    setSelectedRate(rate);
    setSelectedServicePoint(null);
  };

  const fetchRates = async () => {
    setRatesLoading(true);
    try {
      const res = await fetch("/api/shipping-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightKg: totalWeight, toCountry: form.pays }),
      });
      const data = await res.json();
      let fetchedRates: ShippingRate[] = data.rates ?? [];

      if (fetchedRates.length === 0) {
        fetchedRates = getFallbackRates(form.pays);
      }

      setRates(fetchedRates);
      if (fetchedRates.length > 0) {
        handleRateSelect(fetchedRates[0]);
      }
    } catch {
      const fallback = getFallbackRates(form.pays);
      setRates(fallback);
      if (fallback.length > 0) handleRateSelect(fallback[0]);
    } finally {
      setRatesLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isFreeShipping = orderTotal >= 50 && form.pays === "FR";
    if (isFreeShipping) {
      setSelectedRate({ id: 0, name: t({ fr: "Livraison standard offerte", en: "Free standard shipping" }), carrier: "", price: 0, min_days: 2, max_days: 4 });
      setRates([]);
      setStep("shipping");
    } else {
      await fetchRates();
      setStep("shipping");
    }
  };

  // Can proceed to confirm?
  const canConfirm = freeShipping || (
    selectedRate !== null && (!isRelayCarrier(selectedRate) || selectedServicePoint !== null)
  );

  const handlePayment = async () => {
    setLoading(true);
    try {
      const shippingCost = freeShipping ? 0 : (selectedRate?.price ?? 4.9);
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
          shippingMethodId:   selectedRate?.id,
          shippingMethodName: selectedRate?.name,
          shippingCost,
          servicePointId:   selectedServicePoint?.id ?? null,
          servicePointName: selectedServicePoint
            ? `${selectedServicePoint.name} — ${selectedServicePoint.street} ${selectedServicePoint.house_number}, ${selectedServicePoint.city}`
            : null,
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

  const shippingCost = freeShipping ? 0 : (selectedRate?.price ?? null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="font-playfair text-4xl font-bold text-white mb-2">{t(tr.checkout_title)}</h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-10 text-sm">
        {(["address", "shipping", "confirm"] as Step[]).map((s, i) => {
          const labels = { address: t({ fr: "Adresse", en: "Address" }), shipping: t({ fr: "Livraison", en: "Shipping" }), confirm: t({ fr: "Paiement", en: "Payment" }) };
          const active = s === step;
          const done   = (step === "shipping" && s === "address") || (step === "confirm" && s !== "confirm");
          return (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className="w-8 h-px bg-white/20" />}
              <span className={`flex items-center gap-1.5 font-medium ${active ? "text-[#ff9ed5]" : done ? "text-gray-400" : "text-gray-600"}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${active ? "border-[#ff9ed5] text-[#ff9ed5]" : done ? "border-gray-400 text-gray-400" : "border-gray-600 text-gray-600"}`}>
                  {done ? "✓" : i + 1}
                </span>
                {labels[s]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: form */}
        <div className="lg:col-span-2">

          {/* ── STEP 1: Address ── */}
          {step === "address" && (
            <form onSubmit={handleAddressSubmit} className="flex flex-col gap-5">
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
              <div>
                <label className={labelClass}>{t({ fr: "Pays", en: "Country" })}</label>
                <select value={form.pays} onChange={(e) => setForm({ ...form, pays: e.target.value })}
                  className={inputClass + " cursor-pointer"}>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
              <button type="submit"
                className="mt-2 btn-shimmer text-[#0a0a0a] font-semibold py-4 rounded-lg text-sm">
                {t({ fr: "Choisir la livraison →", en: "Choose shipping →" })}
              </button>
            </form>
          )}

          {/* ── STEP 2: Shipping ── */}
          {step === "shipping" && (
            <div className="flex flex-col gap-4">
              {freeShipping ? (
                <>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-400 text-sm font-medium">
                    🎉 {t({ fr: "Livraison offerte pour cette commande !", en: "Free shipping on this order!" })}
                  </div>
                  <div className="w-full text-left bg-[#111] border border-[#ff9ed5] rounded-xl p-4 shadow-[0_0_15px_rgba(255,158,213,0.15)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 border-[#ff9ed5] bg-[#ff9ed5]" />
                        <div>
                          <p className="text-white font-medium text-sm">
                            {t({ fr: "Livraison standard offerte", en: "Free standard shipping" })}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {t({ fr: "2–4 jours ouvrés", en: "2–4 business days" })}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-sm text-green-400">
                        {t({ fr: "Gratuit", en: "Free" })}
                      </span>
                    </div>
                  </div>
                </>
              ) : ratesLoading ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  {t({ fr: "Chargement des options de livraison...", en: "Loading shipping options..." })}
                </div>
              ) : (
                <>
                  {rates.map((rate) => (
                    <div key={rate.id} className="flex flex-col gap-0">
                      <button
                        onClick={() => handleRateSelect(rate)}
                        className={`w-full text-left bg-[#111] border rounded-xl p-4 transition-all ${
                          selectedRate?.id === rate.id
                            ? "border-[#ff9ed5] shadow-[0_0_15px_rgba(255,158,213,0.15)]"
                            : "border-[#1f1f1f] hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                              selectedRate?.id === rate.id ? "border-[#ff9ed5] bg-[#ff9ed5]" : "border-white/30"
                            }`} />
                            <div>
                              <p className="text-white font-medium text-sm">{rate.name}</p>
                              <p className="text-gray-500 text-xs mt-0.5">
                                {rate.min_days === rate.max_days
                                  ? `${rate.min_days} ${t({ fr: "jour(s)", en: "day(s)" })}`
                                  : `${rate.min_days}–${rate.max_days} ${t({ fr: "jours", en: "days" })}`}
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-sm text-white">
                            {rate.price.toFixed(2)} €
                          </span>
                        </div>
                      </button>

                      {/* ── Relay point picker with map ── */}
                      {selectedRate?.id === rate.id && isRelayCarrier(rate) && (
                        <div className="bg-[#0d0d0d] border border-t-0 border-[#ff9ed5]/40 rounded-b-xl px-4 pb-4 pt-3">
                          <RelayPointPicker
                            postalCode={form.cp}
                            country={form.pays}
                            carrier={rate.carrier}
                            selectedPoint={selectedServicePoint}
                            onSelect={setSelectedServicePoint}
                            t={t}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep("address")}
                  className="flex-1 border border-white/10 text-gray-400 font-medium py-3.5 rounded-lg text-sm hover:border-white/30 transition-colors">
                  ← {t({ fr: "Retour", en: "Back" })}
                </button>
                <button
                  onClick={() => setStep("confirm")}
                  disabled={!canConfirm}
                  className="flex-1 btn-shimmer text-[#0a0a0a] font-semibold py-3.5 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                  {t({ fr: "Confirmer →", en: "Confirm →" })}
                </button>
              </div>

              {/* Hint when relay is selected but no point chosen yet */}
              {selectedRate && isRelayCarrier(selectedRate) && !selectedServicePoint && (
                <p className="text-xs text-amber-400/80 text-center -mt-1">
                  {t({ fr: "Veuillez sélectionner un point relais pour continuer.", en: "Please select a relay point to continue." })}
                </p>
              )}
            </div>
          )}

          {/* ── STEP 3: Confirm & pay ── */}
          {step === "confirm" && (
            <div className="flex flex-col gap-5">
              {/* Address recap */}
              <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium text-sm">{t({ fr: "Adresse de livraison", en: "Delivery address" })}</h3>
                  <button onClick={() => setStep("address")} className="text-[#ff9ed5] text-xs hover:underline">
                    {t({ fr: "Modifier", en: "Edit" })}
                  </button>
                </div>
                <p className="text-gray-400 text-sm">{form.nom}</p>
                <p className="text-gray-400 text-sm">{form.adresse}</p>
                <p className="text-gray-400 text-sm">{form.cp} {form.ville}</p>
                <p className="text-gray-400 text-sm">{COUNTRIES.find(c => c.code === form.pays)?.label}</p>
              </div>

              {/* Shipping recap */}
              {selectedRate && (
                <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium text-sm">{t({ fr: "Mode de livraison", en: "Shipping method" })}</h3>
                    <button onClick={() => setStep("shipping")} className="text-[#ff9ed5] text-xs hover:underline">
                      {t({ fr: "Modifier", en: "Edit" })}
                    </button>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{selectedRate.name}</span>
                    <span className={freeShipping ? "text-green-400" : "text-white"}>
                      {freeShipping ? t({ fr: "Gratuit", en: "Free" }) : `${selectedRate.price.toFixed(2)} €`}
                    </span>
                  </div>
                  {selectedServicePoint && (
                    <div className="mt-2 pt-2 border-t border-white/[0.06]">
                      <p className="text-xs text-gray-500">{t({ fr: "Point relais", en: "Relay point" })}</p>
                      <p className="text-xs text-gray-300 mt-0.5 font-medium">{selectedServicePoint.name}</p>
                      <p className="text-xs text-gray-500">{selectedServicePoint.street} {selectedServicePoint.house_number}, {selectedServicePoint.postal_code} {selectedServicePoint.city}</p>
                    </div>
                  )}
                </div>
              )}

              <button onClick={handlePayment} disabled={loading}
                className="btn-shimmer text-[#0a0a0a] font-semibold py-4 rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? t(tr.checkout_paying) : t(tr.checkout_pay)}
              </button>
              <p className="text-xs text-gray-500 text-center">{t(tr.checkout_secure)}</p>
            </div>
          )}
        </div>

        {/* Right: order summary */}
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-6 h-fit sticky top-24">
          <h2 className="font-playfair text-xl font-bold text-white mb-5">{t(tr.checkout_order_title)}</h2>
          <div className="flex flex-col gap-3 mb-4">
            {items.map((item) => (
              <div key={item.slug} className="flex justify-between text-sm">
                <span className="text-gray-400">{item.nom} × {item.quantity}</span>
                <span className="font-medium text-white">{(item.prix * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.08] pt-3 flex flex-col gap-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>{t(tr.cart_subtotal)}</span>
              <span>{orderTotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>{t(tr.cart_shipping)}</span>
              <span className={freeShipping ? "text-green-400" : "text-white"}>
                {freeShipping
                  ? t(tr.cart_shipping_free)
                  : shippingCost !== null
                    ? `${shippingCost.toFixed(2)} €`
                    : "—"}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-white pt-1 border-t border-white/[0.08]">
              <span>{t(tr.cart_total)}</span>
              <span>
                {(freeShipping
                  ? orderTotal
                  : orderTotal + (shippingCost ?? 0)
                ).toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
