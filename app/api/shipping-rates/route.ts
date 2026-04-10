import { NextRequest, NextResponse } from "next/server";

export type ShippingRate = {
  id: number;
  name: string;
  carrier: string;
  price: number; // EUR
  min_days: number;
  max_days: number;
};

export async function POST(req: NextRequest) {
  try {
    const { weightKg, toCountry } = await req.json();

    const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
    const secretKey = process.env.SENDCLOUD_SECRET_KEY;

    if (!publicKey || !secretKey) {
      return NextResponse.json({ error: "Sendcloud not configured" }, { status: 500 });
    }

    const auth = Buffer.from(`${publicKey}:${secretKey}`).toString("base64");

    // Weight in grams for the API
    const weightG = Math.round(weightKg * 1000);

    const url = new URL("https://panel.sendcloud.sc/api/v2/shipping_methods");
    url.searchParams.set("to_country", toCountry ?? "FR");
    url.searchParams.set("from_country", "FR");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Sendcloud API error" }, { status: 500 });
    }

    const data = await res.json();
    const methods = data.shipping_methods ?? [];

    // Filter by weight range and map to simple format
    const rates: ShippingRate[] = methods
      .filter((m: {
        min_weight: string;
        max_weight: string;
        price: string | number;
      }) => {
        const minW = parseFloat(m.min_weight) * 1000; // to grams
        const maxW = parseFloat(m.max_weight) * 1000;
        const price = parseFloat(String(m.price));
        // Ignore methods with no real price — account not contracted
        return weightG >= minW && weightG <= maxW && price > 0;
      })
      .map((m: {
        id: number;
        name: string;
        carrier: string;
        price: string | number;
        min_days: number;
        max_days: number;
      }) => ({
        id: m.id,
        name: m.name,
        carrier: m.carrier,
        price: parseFloat(String(m.price)),
        min_days: m.min_days ?? 1,
        max_days: m.max_days ?? 5,
      }))
      // Remove duplicates by name, keep cheapest
      .reduce((acc: ShippingRate[], rate: ShippingRate) => {
        const existing = acc.find((r) => r.name === rate.name);
        if (!existing || rate.price < existing.price) {
          return [...acc.filter((r) => r.name !== rate.name), rate];
        }
        return acc;
      }, [])
      .sort((a: ShippingRate, b: ShippingRate) => a.price - b.price)
      .slice(0, 6); // max 6 options

    return NextResponse.json({ rates });
  } catch (err) {
    console.error("Shipping rates error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
