import { products } from "@/lib/products";

export const metadata = { title: "Produits — Admin Label Paire" };

export default function ProduitsPage() {
  return (
    <div>
      <h1 className="font-playfair text-2xl font-semibold text-white mb-6">
        Produits
      </h1>

      <div className="rounded-xl border border-white/[0.08] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.04] text-gray-400 text-left">
              <th className="px-5 py-3 font-medium">Produit</th>
              <th className="px-5 py-3 font-medium">Slug</th>
              <th className="px-5 py-3 font-medium text-right">Prix</th>
              <th className="px-5 py-3 font-medium text-right">Poids (kg)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {products.map((p) => (
              <tr key={p.slug} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4 text-white font-medium">{p.nom}</td>
                <td className="px-5 py-4 text-gray-400 font-mono text-xs">{p.slug}</td>
                <td className="px-5 py-4 text-right text-white">{p.prix} €</td>
                <td className="px-5 py-4 text-right">
                  <span className="inline-block bg-white/[0.06] text-[#ff9ed5] px-2 py-0.5 rounded text-xs font-mono">
                    {p.poids} kg
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-600">
        Les poids sont définis dans <code className="text-gray-500">lib/products.ts</code>.
      </p>
    </div>
  );
}
