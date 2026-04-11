"use client";

import { useState } from "react";
import { useT } from "@/hooks/useT";
import { tr } from "@/lib/i18n";

export default function Contact() {
  const [form, setForm] = useState({ nom: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const { t } = useT();

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
        <h1 className="font-playfair text-4xl font-bold text-white mb-3">{t(tr.contact_title)}</h1>
        <p className="text-gray-500 text-base">{t(tr.contact_subtitle)}</p>
      </div>

      {status === "success" ? (
        <div className="text-center py-10">
          <div className="w-16 h-16 rounded-full bg-[#ff9ed5]/20 border border-[#ff9ed5]/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#ff9ed5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-playfair text-2xl font-bold text-white mb-2">{t(tr.contact_success_title)}</h2>
          <p className="text-gray-500">{t(tr.contact_success_sub)}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-[#111] border border-[#1f1f1f] rounded-2xl p-8">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">{t(tr.contact_name_label)}</label>
            <input
              type="text"
              required
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-white/10 bg-[#1a1a1a] text-white text-sm focus:outline-none focus:border-[#ff9ed5] placeholder-gray-600"
              placeholder={t(tr.contact_name_ph)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">{t(tr.contact_email_label)}</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-white/10 bg-[#1a1a1a] text-white text-sm focus:outline-none focus:border-[#ff9ed5] placeholder-gray-600"
              placeholder="contact@labelpaire.fr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">{t(tr.contact_msg_label)}</label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-white/10 bg-[#1a1a1a] text-white text-sm focus:outline-none focus:border-[#ff9ed5] placeholder-gray-600 resize-none"
              placeholder={t(tr.contact_msg_ph)}
            />
          </div>
          {status === "error" && (
            <p className="text-red-400 text-sm">{t(tr.contact_error)}</p>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-shimmer text-[#0a0a0a] font-semibold py-3.5 rounded-lg text-sm disabled:opacity-60"
          >
            {status === "loading" ? t(tr.contact_submitting) : t(tr.contact_submit)}
          </button>
        </form>
      )}

      {/* Info */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        {[
          { icon: "✉️", label: t(tr.contact_info_email),  value: "contact@labelpaire.fr" },
          { icon: "⏱️", label: t(tr.contact_info_reply),  value: t(tr.contact_info_reply_val) },
          { icon: "📦", label: t(tr.contact_info_ship),   value: t(tr.contact_info_ship_val) },
        ].map((info) => (
          <div key={info.label} className="flex flex-col items-center gap-2">
            <span className="text-2xl">{info.icon}</span>
            <span className="font-medium text-gray-300 text-sm">{info.label}</span>
            <span className="text-gray-500 text-sm">{info.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
