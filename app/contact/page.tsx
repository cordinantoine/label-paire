"use client";

import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ nom: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ nom: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="font-playfair text-4xl font-bold text-[#1a1a1a] mb-3">Contactez-nous</h1>
        <p className="text-gray-500 text-base">Une question ? Notre équipe vous répond sous 24h.</p>
      </div>

      {status === "success" ? (
        <div className="text-center py-10">
          <div className="w-16 h-16 rounded-full bg-[#ff9ed5]/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#ff9ed5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-playfair text-2xl font-bold text-[#1a1a1a] mb-2">Message envoyé !</h2>
          <p className="text-gray-500">Nous vous répondrons dans les plus brefs délais.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-[#f9f9f9] rounded-2xl p-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
            <input
              type="text"
              required
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#ff9ed5]"
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#ff9ed5]"
              placeholder="votre@email.fr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#ff9ed5] resize-none"
              placeholder="Comment pouvons-nous vous aider ?"
            />
          </div>
          {status === "error" && (
            <p className="text-red-500 text-sm">Une erreur est survenue. Veuillez réessayer.</p>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-[#1a1a1a] text-white font-semibold py-3.5 rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-60"
          >
            {status === "loading" ? "Envoi en cours..." : "Envoyer le message"}
          </button>
        </form>
      )}

      {/* Info */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        {[
          { icon: "✉️", label: "Email", value: "contact@labelpaire.fr" },
          { icon: "⏱️", label: "Réponse", value: "Sous 24h" },
          { icon: "📦", label: "Livraison", value: "48h ouvrées" },
        ].map((info) => (
          <div key={info.label} className="flex flex-col items-center gap-2">
            <span className="text-2xl">{info.icon}</span>
            <span className="font-medium text-[#1a1a1a] text-sm">{info.label}</span>
            <span className="text-gray-500 text-sm">{info.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
