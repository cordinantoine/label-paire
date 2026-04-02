import { NextRequest, NextResponse } from "next/server";

export type ServicePoint = {
  id: number;
  name: string;
  street: string;
  house_number: string;
  city: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  distance?: number; // meters
  phone?: string;
  extra?: {
    formation_flag?: string;
  };
};

export async function POST(req: NextRequest) {
  try {
    const { postalCode, country = "FR", carrier = "mondial_relay" } = await req.json();

    const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
    const secretKey = process.env.SENDCLOUD_SECRET_KEY;

    if (!publicKey || !secretKey) {
      return NextResponse.json({ error: "Sendcloud not configured" }, { status: 500 });
    }

    const auth = Buffer.from(`${publicKey}:${secretKey}`).toString("base64");

    const url = new URL("https://servicepoints.sendcloud.sc/api/v2/service-points/");
    url.searchParams.set("country", country);
    url.searchParams.set("carrier", carrier);
    url.searchParams.set("postal_code", postalCode);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!res.ok) {
      // Fallback: Sendcloud service points API might not need auth for public access
      const url2 = new URL("https://servicepoints.sendcloud.sc/api/v2/service-points/");
      url2.searchParams.set("country", country);
      url2.searchParams.set("carrier", carrier);
      url2.searchParams.set("postal_code", postalCode);
      url2.searchParams.set("api_key", publicKey);

      const res2 = await fetch(url2.toString());
      if (!res2.ok) {
        return NextResponse.json({ points: [] });
      }
      const data2 = await res2.json();
      return NextResponse.json({ points: (data2 ?? []).slice(0, 8) });
    }

    const data = await res.json();
    // Returns array of service points, limit to 8 closest
    return NextResponse.json({ points: (data ?? []).slice(0, 8) });
  } catch (err) {
    console.error("Service points error:", err);
    return NextResponse.json({ points: [] });
  }
}
