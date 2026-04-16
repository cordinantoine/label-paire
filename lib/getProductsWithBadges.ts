import { prisma } from "./prisma";
import { products, type Product } from "./products";

export async function getProductsWithBadges(): Promise<Product[]> {
  try {
    const metas = await prisma.productMeta.findMany();
    const badgeMap = new Map(metas.map((m) => [m.slug, m.badge]));
    return products.map((p) => ({
      ...p,
      badge: badgeMap.has(p.slug) ? (badgeMap.get(p.slug) ?? null) : p.badge,
    }));
  } catch {
    return products;
  }
}
