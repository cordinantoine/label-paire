import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  return (
    <Link href={`/produit/${product.slug}`} className="group block">
      <div className="bg-[#111] rounded-xl overflow-hidden border border-[#1f1f1f] hover:border-[#ff9ed5]/40 hover:shadow-[0_0_30px_rgba(255,158,213,0.1)] transition-all duration-300">
        {/* Image */}
        <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden bg-[#1a1a1a]">
          {product.badge && (
            <span className="absolute top-3 left-3 z-10 bg-[#ff9ed5] text-[#0a0a0a] text-xs font-bold px-2.5 py-1 rounded-lg">
              {product.badge}
            </span>
          )}
          {product.image ? (
            <Image
              src={product.image}
              alt={product.nom}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <svg className="w-16 h-16 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-playfair font-semibold text-white text-base group-hover:text-[#ff9ed5] transition-colors line-clamp-1">
            {product.nom}
          </h3>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-white font-semibold text-lg">{product.prix} €</span>
            <span className="text-xs text-[#ff9ed5] font-medium group-hover:underline">Voir →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
