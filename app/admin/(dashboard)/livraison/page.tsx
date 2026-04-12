import { prisma } from "@/lib/prisma";
import ShippingRateEditor from "./ShippingRateEditor";

export default async function LivraisonPage() {
  const rates = await prisma.shippingRate.findMany({
    orderBy: [{ country: "asc" }, { maxWeightKg: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-white">Tarifs livraison domicile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Les tarifs s&apos;appliquent en temps réel à la commande. Modifiez un champ puis cliquez sur{" "}
          <span className="text-[#ff9ed5]">Sauver</span>.
        </p>
      </div>

      <ShippingRateEditor rates={rates} />
    </div>
  );
}
