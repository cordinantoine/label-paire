"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json();
      setError(data.error ?? "Erreur de connexion");
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-playfair text-3xl font-bold text-white mb-2">
            Label Paire
          </h1>
          <p className="text-gray-500 text-sm">Espace administrateur</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#111] border border-white/[0.08] rounded-xl p-8 space-y-5"
        >
          <div>
            <label
              htmlFor="password"
              className="block text-sm text-gray-400 mb-2"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="w-full bg-black border border-white/[0.12] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff9ed5]/50 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff9ed5] text-black font-semibold py-3 rounded-lg hover:bg-[#ffb3de] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
