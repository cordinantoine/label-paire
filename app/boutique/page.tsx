"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";

export default function Boutique() {
  const [sort, setSort] = useState<"asc" | "desc">("asc");

  const sorted = [...products].sort((a, b) =>
    sort === "asc" ? a.prix - b.prix : b.prix - a.prix
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="font-playfair text-4xl font-bold text-[#1a1a1a]">Boutique</h1>
          <p className="text-gray-500 mt-2 text-sm">{products.length} produits disponibles</p>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Trier par prix :</span>
          <button
            onClick={() => setSort("asc")}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              sort === "asc"
                ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            Croissant
          </button>
          <button
            onClick={() => setSort("desc")}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              sort === "desc"
                ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            Décroissant
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sorted.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
