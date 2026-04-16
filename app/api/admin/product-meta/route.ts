import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const metas = await prisma.productMeta.findMany();
  return NextResponse.json(metas);
}

export async function PATCH(req: NextRequest) {
  const { slug, badge } = await req.json();

  if (!slug) return NextResponse.json({ error: "slug requis" }, { status: 400 });

  const meta = await prisma.productMeta.upsert({
    where: { slug },
    update: { badge: badge ?? null },
    create: { slug, badge: badge ?? null },
  });

  return NextResponse.json({ ok: true, meta });
}
