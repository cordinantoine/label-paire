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
  distance?: number;
  phone?: string;
  formatted_opening_times?: Record<string, string>;
};

export async function POST(req: NextRequest) {
  try {
    const { postalCode, country = "FR", carrier } = await req.json();

    const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
    const secretKey = process.env.SENDCLOUD_SECRET_KEY;

    if (!publicKey || !secretKey) {
      return NextResponse.json({ points: [] });
    }

    const auth = Buffer.from(`${publicKey}:${secretKey}`).toString("base64");

    // Try multiple approaches to get service points
    const attempts = [
      // 1. With carrier filter + Basic auth
      ...(carrier ? [buildUrl(country, postalCode, carrier)] : []),
      // 2. Without carrier filter (returns all carriers) + Basic auth
      buildUrl(country, postalCode),
    ];

    for (const url of attempts) {
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Basic ${auth}` },
        });

        if (!res.ok) continue;

        const data = await res.json();
        const points = Array.isArray(data) ? data : [];

        if (points.length > 0) {
          return NextResponse.json({ points: points.slice(0, 10) });
        }
      } catch {
        continue;
      }
    }

    // 3. Try with api_key query param (public access)
    const pubUrl = new URL("https://servicepoints.sendcloud.sc/api/v2/service-points/");
    pubUrl.searchParams.set("country", country);
    pubUrl.searchParams.set("postal_code", postalCode);
    pubUrl.searchParams.set("api_key", publicKey);
    if (carrier) pubUrl.searchParams.set("carrier", carrier);

    try {
      const res = await fetch(pubUrl.toString());
      if (res.ok) {
        const data = await res.json();
        const points = Array.isArray(data) ? data : [];
        if (points.length > 0) {
          return NextResponse.json({ points: points.slice(0, 10) });
        }
      }
    } catch { /* continue */ }

    return NextResponse.json({ points: [] });
  } catch (err) {
    console.error("Service points error:", err);
    return NextResponse.json({ points: [] });
  }
}

function buildUrl(country: string, postalCode: string, carrier?: string) {
  const url = new URL("https://servicepoints.sendcloud.sc/api/v2/service-points/");
  url.searchParams.set("country", country);
  url.searchParams.set("postal_code", postalCode);
  if (carrier) url.searchParams.set("carrier", carrier);
  return url.toString();
}
