import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { trackingNumber, shippingStatus } = await req.json();

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(trackingNumber !== undefined && { trackingNumber }),
      ...(shippingStatus !== undefined && { shippingStatus }),
    },
  });

  return NextResponse.json({ ok: true, order });
}
