import { NextRequest, NextResponse } from "next/server";

// Proxy Mondial Relay parcelshop API to avoid CORS issues on client
export async function POST(req: NextRequest) {
  try {
    const { postalCode, country = "FR", nbResults = 10 } = await req.json();
    const brand = "CC22X0UA";

    // Try Mondial Relay widget API (JSON endpoint used internally by their widget)
    const url = new URL("https://widget.mondialrelay.com/parcelshop-picker/v4_1/api/parcelshops");
    url.searchParams.set("Brand", brand);
    url.searchParams.set("Country", country);
    url.searchParams.set("PostCode", postalCode);
    url.searchParams.set("NbResults", String(nbResults));

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      // Response shape: { Rd: [ { ID, Nom, Adresse1, Adresse2, CP, Ville, Pays, Latitude, Longitude, ... } ] }
      const points = (data?.Rd ?? []).map((p: {
        ID: string; Nom: string; Adresse1: string; Adresse2?: string;
        CP: string; Ville: string; Pays: string; Latitude: string; Longitude: string;
      }) => ({
        id: p.ID,
        name: p.Nom,
        address: [p.Adresse1, p.Adresse2].filter(Boolean).join(" "),
        city: p.Ville,
        postalCode: p.CP,
        country: p.Pays,
        lat: parseFloat(p.Latitude?.replace(",", ".")),
        lng: parseFloat(p.Longitude?.replace(",", ".")),
      }));
      return NextResponse.json({ points });
    }

    return NextResponse.json({ points: [] });
  } catch (err) {
    console.error("MR parcelshops error:", err);
    return NextResponse.json({ points: [] });
  }
}
