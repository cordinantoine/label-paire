import { NextRequest, NextResponse } from "next/server";

export type ParcelShop = {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
};

export async function POST(req: NextRequest) {
  try {
    const { postalCode, country = "FR" } = await req.json();

    // 1. Geocode postal code → coordinates (Nominatim, free, no key)
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(postalCode)}&country=${country === "FR" ? "France" : country}&format=json&limit=1`;
    const geoRes = await fetch(geocodeUrl, {
      headers: { "User-Agent": "LabelPaire/1.0 contact@labelpaire.fr" },
    });
    const geoData = await geoRes.json();
    if (!geoData || geoData.length === 0) {
      return NextResponse.json({ points: [] });
    }
    const { lat, lon } = geoData[0];

    // 2. Find Mondial Relay points nearby (Overpass API, free, no key)
    const overpassQuery = `[out:json][timeout:20];
(
  node["brand"="Mondial Relay"](around:6000,${lat},${lon});
  node["operator"="Mondial Relay"](around:6000,${lat},${lon});
  node["name"~"Mondial Relay",i](around:6000,${lat},${lon});
);
out body;`;

    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
    const overpassRes = await fetch(overpassUrl, {
      headers: { "Accept": "application/json" },
    });

    const overpassData = await overpassRes.json();
    const elements: {
      id: number; lat: number; lon: number;
      tags?: { name?: string; addr_street?: string; "addr:street"?: string; "addr:housenumber"?: string; "addr:city"?: string; "addr:postcode"?: string; };
    }[] = overpassData?.elements ?? [];

    // Deduplicate by proximity and build result
    const seen = new Set<string>();
    const points: ParcelShop[] = [];

    for (const el of elements) {
      const key = `${el.lat.toFixed(4)},${el.lon.toFixed(4)}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const tags = el.tags ?? {};
      const street = tags["addr:street"] ?? tags["addr_street"] ?? "";
      const houseNum = tags["addr:housenumber"] ?? "";
      const city = tags["addr:city"] ?? "";
      const pc = tags["addr:postcode"] ?? postalCode;
      const name = tags["name"] ?? "Point Relais Mondial Relay";

      points.push({
        id: String(el.id),
        name,
        address: [street, houseNum].filter(Boolean).join(" "),
        city,
        postalCode: pc,
        lat: el.lat,
        lng: el.lon,
      });

      if (points.length >= 10) break;
    }

    return NextResponse.json({ points });
  } catch (err) {
    console.error("MR parcelshops error:", err);
    return NextResponse.json({ points: [] });
  }
}
