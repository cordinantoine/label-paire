import { getProductsWithBadges } from "@/lib/getProductsWithBadges";
import BoutiqueClient from "./BoutiqueClient";

export default async function Boutique() {
  const products = await getProductsWithBadges();
  return <BoutiqueClient products={products} />;
}
