import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { id, url, thumbnailUrl } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400 });
  }

  await prisma.video.delete({ where: { id } });

  if (url) await del(url).catch(() => {});
  if (thumbnailUrl) await del(thumbnailUrl).catch(() => {});

  return NextResponse.json({ success: true });
}
