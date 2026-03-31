"use client";

import Image from "next/image";
import type { Product } from "@/lib/products";
import AddToCartButton from "@/components/AddToCartButton";
import { useT } from "@/hooks/useT";
import { tr, productTranslations, mockReviews } from "@/lib/i18n";

const productColors: Record<string, string> = {
  "kit-reparation-premium": "#ff9ed5",
  "kit-reparation": "#a9dbf1",
  "kit-nettoyage": "#ffd6a5",
  "la-belle-mousse": "#a9dbf1",
  "la-belle-creme": "#ffeaa7",
  "la-peinture-blanche": "#dfe6e9",
  "la-peinture-noire": "#636e72",
  "paire-embauchoirs": "#d4a574",
  "spray-impermeabilisant": "#a9dbf1",
  "le-tampon-blanc": "#f0f0f0",
  "patch-reparation-talon": "#fdcb6e",
};

export default function ProductDetail({ product }: { product: Product }) {
  const { t, lang } = useT();
  const pt = productTranslations[product.slug];
  const name = pt ? t(pt.nom) : product.nom;
  const description = pt ? t(pt.description) : product.description;
  const bgColor = productColors[product.slug] ?? "#f0f0f0";
  const reviews = mockReviews[lang];

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <div
          className="rounded-2xl flex items-center justify-center h-96 relative overflow-hidden"
          style={{ backgroundColor: product.image ? "#1a1a1a" : bgColor }}
        >
          {product.badge && (
            <span className="absolute top-4 left-4 z-10 bg-[#1a1a1a] text-white text-xs font-medium px-3 py-1.5 rounded-lg">
              {product.badge}
            </span>
          )}
          {product.image ? (
            <Image
              src={product.image}
              alt={name}
              fill
              className="object-contain p-8"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <svg className="w-24 h-24 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <h1 className="font-playfair text-4xl font-bold text-white mb-4">{name}</h1>
          <p className="text-3xl font-semibold text-[#ff9ed5] mb-6">{product.prix} €</p>
          <p className="text-gray-400 leading-relaxed mb-8">{description}</p>

          <AddToCartButton product={product} />

          <div className="mt-6 flex flex-col gap-2 text-sm text-gray-500">
            <span>{t(tr.product_delivery_free)}</span>
            <span>{t(tr.product_delivery_time)}</span>
            <span>{t(tr.product_returns)}</span>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-20">
        <h2 className="font-playfair text-2xl font-bold text-white mb-8">{t(tr.product_reviews)}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div key={i} className="bg-[#111] border border-[#1f1f1f] rounded-xl p-6">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <span key={j} className="text-[#ff9ed5]">★</span>
                ))}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-3">{review.comment}</p>
              <p className="text-gray-500 text-xs font-medium">{review.author}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
