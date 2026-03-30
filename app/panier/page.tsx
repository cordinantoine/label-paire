"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cartStore";

export default function Panier() {
  const { items, removeItem, updateQuantity, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <h1 className="font-playfair text-4xl font-bold text-white mb-4">Votre panier</h1>
        <p className="text-gray-500 mb-8">Votre panier est vide.</p>
        <Link
          href="/boutique"
          className="inline-block btn-shimmer text-[#0a0a0a] font-semibold px-8 py-3.5 rounded-lg text-sm"
        >
          Découvrir nos produits
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="font-playfair text-4xl font-bold text-white mb-10">Votre panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.slug} className="flex items-center gap-4 bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
              {/* Color block */}
              <div className="w-16 h-16 rounded-lg bg-[#ff9ed5]/10 border border-[#ff9ed5]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-[#ff9ed5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm truncate">{item.nom}</h3>
                <p className="text-gray-500 text-sm">{item.prix} € / unité</p>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                  className="w-7 h-7 rounded-lg border border-white/10 text-white flex items-center justify-center text-sm hover:border-[#ff9ed5]/50 transition-colors"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-medium text-white">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                  className="w-7 h-7 rounded-lg border border-white/10 text-white flex items-center justify-center text-sm hover:border-[#ff9ed5]/50 transition-colors"
                >
                  +
                </button>
              </div>

              <span className="font-semibold text-sm w-16 text-right text-white">
                {(item.prix * item.quantity).toFixed(2)} €
              </span>

              <button
                onClick={() => removeItem(item.slug)}
                className="text-gray-600 hover:text-red-400 transition-colors ml-1"
                aria-label="Supprimer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-6 h-fit sticky top-24">
          <h2 className="font-playfair text-xl font-bold text-white mb-4">Récapitulatif</h2>
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Sous-total</span>
            <span>{total().toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400 mb-4">
            <span>Livraison</span>
            <span className={total() >= 50 ? "text-green-400" : ""}>{total() >= 50 ? "Offerte" : "4,90 €"}</span>
          </div>
          <div className="border-t border-white/[0.08] pt-4 flex justify-between font-semibold text-white">
            <span>Total</span>
            <span>{total() >= 50 ? total().toFixed(2) : (total() + 4.9).toFixed(2)} €</span>
          </div>
          <Link
            href="/commande"
            className="block w-full mt-6 btn-shimmer text-[#0a0a0a] text-center font-semibold py-3.5 rounded-lg text-sm"
          >
            Commander →
          </Link>
          <Link
            href="/boutique"
            className="block w-full mt-3 text-center text-sm text-gray-500 hover:text-[#ff9ed5] transition-colors"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}
