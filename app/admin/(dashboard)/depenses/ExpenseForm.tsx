"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { value: "stock",     label: "Stock" },
  { value: "frais",     label: "Frais" },
  { value: "marketing", label: "Marketing" },
  { value: "autre",     label: "Autre" },
];

export default function ExpenseForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "stock",
    date: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await fetch("/api/admin/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: form.description,
        amount: Math.round(parseFloat(form.amount) * 100),
        category: form.category,
        date: form.date,
      }),
    });

    setSaving(false);
    setSaved(true);
    setForm({ description: "", amount: "", category: "stock", date: new Date().toISOString().split("T")[0] });
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-gray-500 mb-2">Description</label>
        <input
          type="text"
          required
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="ex: Achat mousses nettoyantes"
          className="w-full bg-black border border-white/[0.12] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#ff9ed5]/50 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-2">Montant (€)</label>
        <input
          type="number"
          required
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(e) => update("amount", e.target.value)}
          placeholder="0.00"
          className="w-full bg-black border border-white/[0.12] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#ff9ed5]/50 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-2">Catégorie</label>
        <select
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
          className="w-full bg-black border border-white/[0.12] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ff9ed5]/50 transition-colors"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-2">Date</label>
        <input
          type="date"
          required
          value={form.date}
          onChange={(e) => update("date", e.target.value)}
          className="w-full bg-black border border-white/[0.12] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ff9ed5]/50 transition-colors [color-scheme:dark]"
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-[#ff9ed5] text-black text-sm font-semibold rounded-lg hover:bg-[#ffb3de] transition-colors disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Ajouter"}
        </button>
        {saved && <span className="text-green-400 text-sm">Ajouté ✓</span>}
      </div>
    </form>
  );
}
