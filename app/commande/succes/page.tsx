"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCartStore } from "@/lib/cartStore";

export default function CommandeSucces() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-32 text-center">
      <div className="w-20 h-20 rounded-full bg-[#ff9ed5]/10 border border-[#ff9ed5]/30 flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-[#ff9ed5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="font-playfair text-4xl font-bold text-white mb-4">Commande confirmée !</h1>
      <p className="text-gray-400 text-base leading-relaxed mb-8">
        Merci pour votre commande. Un email de confirmation vous a été envoyé.
        Votre colis sera expédié sous 48h ouvrées.
      </p>
      <Link
        href="/boutique"
        className="inline-block btn-shimmer text-[#0a0a0a] font-semibold px-8 py-3.5 rounded-lg text-sm"
      >
        Retour à la boutique
      </Link>
    </div>
  );
}
