import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rates = await prisma.shippingRate.findMany({
    orderBy: [{ country: "asc" }, { maxWeightKg: "asc" }],
  });
  return NextResponse.json(rates);
}

export async function PATCH(req: NextRequest) {
  const { id, priceEur, minDays, maxDays } = await req.json();

  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const rate = await prisma.shippingRate.update({
    where: { id },
    data: {
      ...(priceEur !== undefined && { priceEur: Number(priceEur) }),
      ...(minDays  !== undefined && { minDays:  Number(minDays)  }),
      ...(maxDays  !== undefined && { maxDays:  Number(maxDays)  }),
    },
  });

  return NextResponse.json({ ok: true, rate });
}
