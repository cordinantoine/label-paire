"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cartStore";
import { getProductBySlug } from "@/lib/products";
import { useT } from "@/hooks/useT";
import { tr } from "@/lib/i18n";
import dynamic from "next/dynamic";
import type { BoxtalParcelShop } from "@/components/BoxtalRelayPicker";

const BoxtalRelayPicker = dynamic(() => import("@/components/BoxtalRelayPicker"), { ssr: false });

const COUNTRIES = [
  { code: "FR", label: "France" },
  { code: "BE", label: "Belgique / België" },
  { code: "LU", label: "Luxembourg" },
  { code: "NL", label: "Nederland" },
  { code: "DE", label: "Deutschland" },
  { code: "ES", label: "España" },
  { code: "PT", label: "Portugal" },
  { code: "IT", label: "Italia" },
  { code: "AT", label: "Österreich" },
];

// Relay only available for France
const RELAY_COUNTRIES = ["FR"];

type DeliveryType = "domicile" | "relais";
type Step = "address" | "shipping" | "confirm";

function getHomeDays(country: string): string {
  if (country === "FR") return "3–5";
  return "3–7"; // EU : Belgique, Luxembourg, Pays-Bas, Allemagne, Espagne, Portugal, Italie, Autriche
}

export default function Commande() {
  const { items, total } = useCartStore();
  const [step, setStep]         = useState<Step>("address");
  const [loading, setLoading]   = useState(false);
  const [loadingRate, setLoadingRate] = useState(false);
  const [homePrice, setHomePrice] = useState<number>(0);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("domicile");
  const [selectedRelayPoint, setSelectedRelayPoint] = useState<BoxtalParcelShop | null>(null);

  const [form, setForm] = useState({
    nom: "", email: "", adresse: "", ville: "", cp: "", pays: "FR",
  });
  const [marketingConsent, setMarketingConsent] = useState(false);
  const { t } = useT();

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-white/10 bg-[#1a1a1a] text-white text-sm focus:outline-none focus:border-[#ff9ed5] placeholder-gray-600";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  const totalWeight = items.reduce((acc, item) => {
    const product = getProductBySlug(item.slug);
    return acc + (product?.poids ?? 0.2) * item.quantity;
  }, 0);

  const orderTotal = total();
  const freeShipping = orderTotal >= 50 && form.pays === "FR";
  const relayAvailable = RELAY_COUNTRIES.includes(form.pays);

  const homePriceDisplay = freeShipping ? 0 : homePrice;
  const relayPrice = freeShipping ? 0 : 3.90;

  const shippingCost = deliveryType === "relais" ? relayPrice : homePriceDisplay;

  const canConfirm =
    deliveryType === "domicile" ||
    (deliveryType === "relais" && selectedRelayPoint !== null);

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!relayAvailable) setDeliveryType("domicile");
    setLoadingRate(true);
    try {
      const res = await fetch("/api/shipping-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weightKg: totalWeight,
          toCountry: form.pays,
          toZip: form.cp || "75001",
          toCity: form.ville || "Paris",
        }),
      });
      const data = await res.json();
      const rate = data.rates?.[0];
      if (rate) setHomePrice(rate.price);
    } catch {
      // Fallback statique si l'API échoue
      const fallback = form.pays === "FR" ? 9.49 : 14.90;
      setHomePrice(fallback);
    } finally {
      setLoadingRate(false);
    }
    setStep("shipping");
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const shippingMethodName = deliveryType === "relais"
        ? (selectedRelayPoint?.network === "MONR"
            ? "Mondial Relay - Point Relais"
            : "Chronopost Shop2Shop - Point Relais")
        : "Livraison à domicile";

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
          shippingMethodName,
          shippingCost,
          totalWeight,
          servicePointId:      selectedRelayPoint?.id ?? null,
          servicePointName:    selectedRelayPoint
            ? `${selectedRelayPoint.name} — ${selectedRelayPoint.address}, ${selectedRelayPoint.postalCode} ${selectedRelayPoint.city}`
            : null,
          servicePointNetwork: selectedRelayPoint?.network ?? null,
          marketingConsent,
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
      <h1 className="font-playfair text-4xl font-bold text-white mb-2">{t(tr.checkout_title)}</h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-10 text-sm">
        {(["address", "shipping", "confirm"] as Step[]).map((s, i) => {
          const labels = {
            address:  t({ fr: "Adresse",   en: "Address"  }),
            shipping: t({ fr: "Livraison", en: "Shipping" }),
            confirm:  t({ fr: "Paiement",  en: "Payment"  }),
          };
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

              {freeShipping && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-green-400 text-sm font-medium">
                  🎉 {t({ fr: "Livraison offerte pour cette commande !", en: "Free shipping on this order!" })}
                </div>
              )}

              {/* Option 1 — Domicile */}
              <button
                onClick={() => setDeliveryType("domicile")}
                className={`w-full text-left bg-[#111] border rounded-xl p-4 transition-all ${
                  deliveryType === "domicile"
                    ? "border-[#ff9ed5] shadow-[0_0_15px_rgba(255,158,213,0.15)]"
                    : "border-[#1f1f1f] hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      deliveryType === "domicile" ? "border-[#ff9ed5] bg-[#ff9ed5]" : "border-white/30"
                    }`} />
                    <div>
                      <p className="text-white font-medium text-sm">
                        {t({ fr: "Livraison à domicile", en: "Home delivery" })}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {getHomeDays(form.pays)} {t({ fr: "jours ouvrés", en: "business days" })}
                      </p>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${freeShipping ? "text-green-400" : "text-white"}`}>
                    {freeShipping ? t({ fr: "Gratuit", en: "Free" }) : loadingRate ? "…" : `${homePriceDisplay.toFixed(2)} €`}
                  </span>
                </div>
              </button>

              {/* Option 2 — Point Relais (France only) */}
              {relayAvailable && (
                <div className="flex flex-col">
                  <button
                    onClick={() => setDeliveryType("relais")}
                    className={`w-full text-left bg-[#111] border rounded-xl p-4 transition-all ${
                      deliveryType === "relais"
                        ? "border-[#ff9ed5] shadow-[0_0_15px_rgba(255,158,213,0.15)] rounded-b-none"
                        : "border-[#1f1f1f] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                          deliveryType === "relais" ? "border-[#ff9ed5] bg-[#ff9ed5]" : "border-white/30"
                        }`} />
                        <div>
                          <p className="text-white font-medium text-sm">
                            {t({ fr: "Point Relais", en: "Relay Point" })}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {t({ fr: "Mondial Relay ou Chronopost — 2–5 jours", en: "Mondial Relay or Chronopost — 2–5 days" })}
                          </p>
                        </div>
                      </div>
                      <span className={`font-semibold text-sm ${freeShipping ? "text-green-400" : "text-white"}`}>
                        {freeShipping ? t({ fr: "Gratuit", en: "Free" }) : `${relayPrice.toFixed(2)} €`}
                      </span>
                    </div>
                  </button>

                  {deliveryType === "relais" && (
                    <div className="border border-t-0 border-[#ff9ed5]/40 rounded-b-xl px-4 pb-4 pt-3 bg-[#0d0d0d]">
                      <BoxtalRelayPicker
                        postalCode={form.cp}
                        onSelect={setSelectedRelayPoint}
                        selectedPoint={selectedRelayPoint}
                        t={t}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Hint */}
              {deliveryType === "relais" && !selectedRelayPoint && (
                <p className="text-xs text-amber-400/80 text-center -mt-1">
                  {t({ fr: "Veuillez sélectionner un point relais pour continuer.", en: "Please select a relay point to continue." })}
                </p>
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
              <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium text-sm">{t({ fr: "Mode de livraison", en: "Shipping method" })}</h3>
                  <button onClick={() => setStep("shipping")} className="text-[#ff9ed5] text-xs hover:underline">
                    {t({ fr: "Modifier", en: "Edit" })}
                  </button>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    {deliveryType === "domicile"
                      ? t({ fr: "Livraison à domicile", en: "Home delivery" })
                      : t({ fr: "Point Relais", en: "Relay Point" })}
                  </span>
                  <span className={freeShipping ? "text-green-400" : "text-white"}>
                    {freeShipping ? t({ fr: "Gratuit", en: "Free" }) : `${shippingCost.toFixed(2)} €`}
                  </span>
                </div>
                {selectedRelayPoint && (
                  <div className="mt-2 pt-2 border-t border-white/[0.06]">
                    <p className="text-xs text-gray-500">{t({ fr: "Point relais sélectionné", en: "Selected relay point" })}</p>
                    <p className="text-xs text-gray-300 mt-0.5 font-medium">{selectedRelayPoint.name}</p>
                    <p className="text-xs text-gray-500">{selectedRelayPoint.address}, {selectedRelayPoint.postalCode} {selectedRelayPoint.city}</p>
                  </div>
                )}
              </div>

              {/* RGPD — consentement marketing */}
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className="w-4 h-4 border border-white/20 rounded bg-[#1a1a1a] transition-colors flex items-center justify-center"
                    style={marketingConsent ? { background: "#ff9ed5", borderColor: "#ff9ed5" } : {}}
                  >
                    {marketingConsent && (
                      <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 10 10">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500 leading-relaxed">
                  J&apos;accepte de recevoir des offres et nouveautés de Label Paire par email. Désinscription possible à tout moment.
                </span>
              </label>

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
              <span className={freeShipping ? "text-green-400" : step === "address" ? "" : "text-white"}>
                {step === "address"
                  ? "—"
                  : freeShipping
                    ? t(tr.cart_shipping_free)
                    : `${shippingCost.toFixed(2)} €`}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-white pt-1 border-t border-white/[0.08]">
              <span>{t(tr.cart_total)}</span>
              <span>
                {step === "address"
                  ? `${orderTotal.toFixed(2)} €`
                  : `${(orderTotal + (freeShipping ? 0 : shippingCost)).toFixed(2)} €`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
