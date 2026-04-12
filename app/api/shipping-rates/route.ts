import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export type ShippingRate = {
  id: number;
  name: string;
  carrier: string;
  price: number; // EUR TTC
  min_days: number;
  max_days: number;
};

// Pays livrables en domicile via tarifs DB
const SUPPORTED_COUNTRIES = ["FR", "BE", "LU", "NL", "DE", "ES", "PT", "IT", "AT"];

async function getHomeRate(weightKg: number, country: string): Promise<ShippingRate | null> {
  const rate = await prisma.shippingRate.findFirst({
    where: {
      country,
      maxWeightKg: { gte: weightKg },
    },
    orderBy: { maxWeightKg: "asc" },
  });

  if (!rate) return null;

  return {
    id: -1,
    name: country === "FR" ? "Chronopost — Livraison à domicile" : "Livraison à domicile",
    carrier: "chronopost",
    price: rate.priceEur,
    min_days: rate.minDays,
    max_days: rate.maxDays,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { weightKg, toCountry = "FR" } = await req.json();

    if (!SUPPORTED_COUNTRIES.includes(toCountry)) {
      return NextResponse.json({ rates: [] });
    }

    const homeRate = await getHomeRate(weightKg, toCountry);
    return NextResponse.json({ rates: homeRate ? [homeRate] : [] });
  } catch (err) {
    console.error("Shipping rates error:", err);
    return NextResponse.json({ rates: [] });
  }
}
