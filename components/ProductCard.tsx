import Link from "next/link";
import type { Product } from "@/lib/products";

type Props = {
  product: Product;
};

const productColors: Record<string, string> = {
  "kit-reparation-premium": "#ff9ed5",
  "kit-reparation": "#a9dbf1",
  "kit-nettoyage": "#ffd6a5",
  "la-belle-mousse": "#b5ead7",
  "la-belle-creme": "#ffeaa7",
  "la-peinture-blanche": "#dfe6e9",
  "la-peinture-noire": "#636e72",
  "paire-embauchoirs": "#d4a574",
  "spray-impermeabilisant": "#a9dbf1",
  "le-tampon-blanc": "#f0f0f0",
  "patch-reparation-talon": "#fdcb6e",
};

export default function ProductCard({ product }: Props) {
  const bgColor = productColors[product.slug] ?? "#f0f0f0";

  return (
    <Link href={`/produit/${product.slug}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
        {/* Image placeholder */}
        <div
          className="relative h-52 flex items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          {product.badge && (
            <span className="absolute top-3 left-3 bg-[#1a1a1a] text-white text-xs font-medium px-2.5 py-1 rounded-lg">
              {product.badge}
            </span>
          )}
          <svg className="w-16 h-16 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-playfair font-semibold text-[#1a1a1a] text-base group-hover:text-[#ff9ed5] transition-colors line-clamp-1">
            {product.nom}
          </h3>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-[#1a1a1a] font-semibold text-lg">{product.prix} €</span>
            <span className="text-xs text-[#ff9ed5] font-medium group-hover:underline">Voir →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
