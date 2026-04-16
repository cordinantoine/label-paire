"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/products";
import { useT } from "@/hooks/useT";
import { tr } from "@/lib/i18n";

export default function BoutiqueClient({ products }: { products: Product[] }) {
  const [sort, setSort] = useState<"default" | "asc" | "desc">("default");
  const { t } = useT();

  const sorted = [...products].sort((a, b) => {
    if (sort === "asc") return a.prix - b.prix;
    if (sort === "desc") return b.prix - a.prix;
    return 0;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="font-playfair text-4xl font-bold text-white">{t(tr.shop_title)}</h1>
          <p className="text-gray-500 mt-2 text-sm">{products.length} {t(tr.shop_count)}</p>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{t(tr.shop_sort_label)}</span>
          <button
            onClick={() => setSort("default")}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              sort === "default"
                ? "bg-[#ff9ed5] text-[#0a0a0a] border-[#ff9ed5]"
                : "bg-transparent text-gray-400 border-white/10 hover:border-[#ff9ed5]/50 hover:text-[#ff9ed5]"
            }`}
          >
            Par défaut
          </button>
          <button
            onClick={() => setSort("asc")}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              sort === "asc"
                ? "bg-[#ff9ed5] text-[#0a0a0a] border-[#ff9ed5]"
                : "bg-transparent text-gray-400 border-white/10 hover:border-[#ff9ed5]/50 hover:text-[#ff9ed5]"
            }`}
          >
            {t(tr.shop_sort_asc)}
          </button>
          <button
            onClick={() => setSort("desc")}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              sort === "desc"
                ? "bg-[#ff9ed5] text-[#0a0a0a] border-[#ff9ed5]"
                : "bg-transparent text-gray-400 border-white/10 hover:border-[#ff9ed5]/50 hover:text-[#ff9ed5]"
            }`}
          >
            {t(tr.shop_sort_desc)}
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
