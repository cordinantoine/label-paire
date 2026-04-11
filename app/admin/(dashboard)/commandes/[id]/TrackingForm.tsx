"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "label_created", label: "Étiquette créée" },
  { value: "shipped",       label: "Expédié" },
  { value: "delivered",     label: "Livré" },
];

export default function TrackingForm({
  orderId,
  currentTracking,
  currentStatus,
}: {
  orderId: string;
  currentTracking: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [tracking, setTracking] = useState(currentTracking);
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingNumber: tracking, shippingStatus: status }),
    });

    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-2">Numéro de suivi</label>
          <input
            type="text"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="ex: 1Z999AA10123456784"
            className="w-full bg-black border border-white/[0.12] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#ff9ed5]/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-2">Statut expédition</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-black border border-white/[0.12] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ff9ed5]/50 transition-colors"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-[#ff9ed5] text-black text-sm font-semibold rounded-lg hover:bg-[#ffb3de] transition-colors disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        {saved && (
          <span className="text-green-400 text-sm">Mis à jour ✓</span>
        )}
      </div>
    </form>
  );
}
