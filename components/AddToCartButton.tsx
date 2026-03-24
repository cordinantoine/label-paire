"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cartStore";
import type { Product } from "@/lib/products";

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

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
          ? "bg-green-500 text-white"
          : "bg-[#1a1a1a] text-white hover:bg-[#333]"
      }`}
    >
      {added ? "Ajouté au panier ✓" : "Ajouter au panier"}
    </button>
  );
}
