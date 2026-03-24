"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cartStore";

export default function Commande() {
  const { items, total } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nom: "", email: "", adresse: "", ville: "", cp: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, email: form.email, nom: form.nom }),
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
        <h1 className="font-playfair text-4xl font-bold text-[#1a1a1a] mb-4">Commander</h1>
        <p className="text-gray-500">Votre panier est vide.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="font-playfair text-4xl font-bold text-[#1a1a1a] mb-10">Commander</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
            <input
              type="text"
              required
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#ff9ed5]"
              placeholder="Marie Dupont"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#ff9ed5]"
              placeholder="marie@email.fr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
            <input
              type="text"
              required
              value={form.adresse}
              onChange={(e) => setForm({ ...form, adresse: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#ff9ed5]"
              placeholder="12 rue de la Paix"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Code postal</label>
              <input
                type="text"
                required
                value={form.cp}
                onChange={(e) => setForm({ ...form, cp: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#ff9ed5]"
                placeholder="75001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
              <input
                type="text"
                required
                value={form.ville}
                onChange={(e) => setForm({ ...form, ville: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#ff9ed5]"
                placeholder="Paris"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-[#1a1a1a] text-white font-semibold py-4 rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Redirection vers Stripe..." : "Payer par carte →"}
          </button>
          <p className="text-xs text-gray-400 text-center">Paiement sécurisé via Stripe. Vos données sont protégées.</p>
        </form>

        {/* Order summary */}
        <div className="bg-[#f9f9f9] rounded-xl p-6 h-fit">
          <h2 className="font-playfair text-xl font-bold text-[#1a1a1a] mb-5">Votre commande</h2>
          <div className="flex flex-col gap-3 mb-5">
            {items.map((item) => (
              <div key={item.slug} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.nom} × {item.quantity}</span>
                <span className="font-medium">{(item.prix * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4 flex justify-between font-semibold text-[#1a1a1a]">
            <span>Total</span>
            <span>{total() >= 50 ? total().toFixed(2) : (total() + 4.9).toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </div>
  );
}
