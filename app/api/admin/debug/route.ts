import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [orderCount, customerCount, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.customer.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: { select: { email: true, nom: true } } },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      orderCount,
      customerCount,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        createdAt: o.createdAt,
        amountTotal: o.amountTotal,
        paymentStatus: o.paymentStatus,
        shippingStatus: o.shippingStatus,
        shippingMethod: o.shippingMethod,
        customer: o.customer,
      })),
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
