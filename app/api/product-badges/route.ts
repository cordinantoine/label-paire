import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const metas = await prisma.productMeta.findMany();
  const badgeMap: Record<string, string | null> = {};
  for (const m of metas) {
    badgeMap[m.slug] = m.badge;
  }
  return NextResponse.json(badgeMap);
}
