"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cartStore";
import { useT } from "@/hooks/useT";
import { tr } from "@/lib/i18n";
import type { Product } from "@/lib/products";

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const { t } = useT();

  const handleAdd = () => {
    addItem({ slug: product.slug, nom: product.nom, prix: product.prix });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      className={`w-full py-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
        added
          ? "bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]"
          : "btn-shimmer text-[#0a0a0a] shadow-[0_0_20px_rgba(255,158,213,0.3)] hover:shadow-[0_0_35px_rgba(255,158,213,0.5)]"
      }`}
    >
      {added ? t(tr.product_added) : t(tr.product_add)}
    </button>
  );
}
