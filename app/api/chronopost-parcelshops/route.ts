import { NextRequest, NextResponse } from "next/server";

/* ── Types ── */
export type DayHours = {
  open1?: string;   // "09:00"
  close1?: string;  // "12:30"
  open2?: string;   // "14:00"
  close2?: string;  // "19:30"
};

export type ChronoParcelShop = {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
  distance: number; // metres
  hours: Record<string, DayHours>;
};

const SOAP_URL = "https://ws.chronopost.fr/recherchebt-ws-cxf/PointRelaisServiceWS";

const DAYS_API = [
  "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche",
] as const;
const DAYS_KEYS = [
  "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche",
] as const;

/* ── Helpers ── */
function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "s");
  const m = xml.match(re);
  return m ? m[1].trim() : "";
}

function extractAll(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "gs");
  const results: string[] = [];
  let m;
  while ((m = re.exec(xml)) !== null) results.push(m[1].trim());
  return results;
}

// Parse Chronopost hours string: "08:30 12:00 14:30 19:30" or "08:30 19:30" or ""
function parseHours(raw: string): DayHours {
  if (!raw || !raw.trim()) return {};
  const parts = raw.trim().split(/\s+/);
  if (parts.length >= 4) {
    return { open1: parts[0], close1: parts[1], open2: parts[2], close2: parts[3] };
  }
  if (parts.length >= 2) {
    return { open1: parts[0], close1: parts[1] };
  }
  return {};
}

// Geocode a postal code via Nominatim — returns null on failure
async function geocodePostalCode(
  postalCode: string,
  city: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const params = new URLSearchParams({
      postalcode: postalCode,
      country: "FR",
      format: "json",
      limit: "1",
    });
    if (city) params.set("city", city);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      { headers: { "User-Agent": "LabelPaire/1.0 (contact@labelpaire.fr)" } },
    );
    const data = await res.json();
    if (data?.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {
    // silent
  }
  return null;
}

/* ── Route handler ── */
export async function POST(req: NextRequest) {
  try {
    const { postalCode, city = "", address = "" } = await req.json();

    const accountNumber = process.env.CHRONOPOST_ACCOUNT ?? "";
    const password = process.env.CHRONOPOST_PASSWORD ?? "";

    // Shipping date = tomorrow (dd/mm/yyyy)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const shippingDate = tomorrow.toLocaleDateString("fr-FR");

    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cxf="http://cxf.ws.chronopost.fr/">
  <soapenv:Body>
    <cxf:recherchePointChronopostInterParService>
      <accountNumber>${accountNumber}</accountNumber>
      <password>${password}</password>
      <adress>${address}</adress>
      <zipCode>${postalCode}</zipCode>
      <city>${city}</city>
      <countryCode>FR</countryCode>
      <type>T</type>
      <service>T</service>
      <weight>1</weight>
      <shippingDate>${shippingDate}</shippingDate>
      <productCode>86</productCode>
      <maxPointChronopost>10</maxPointChronopost>
      <maxDistanceSearch>10</maxDistanceSearch>
      <holidayTolerant>1</holidayTolerant>
      <language>FR</language>
      <version>2.0</version>
    </cxf:recherchePointChronopostInterParService>
  </soapenv:Body>
</soapenv:Envelope>`;

    const res = await fetch(SOAP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "",
      },
      body: soapBody,
    });

    const xml = await res.text();

    // Error check
    const errorCode = extractTag(xml, "errorCode");
    if (errorCode && errorCode !== "0") {
      const msg = extractTag(xml, "errorMessage");
      console.error("Chronopost API error:", errorCode, msg);
      return NextResponse.json({ points: [] });
    }

    // Parse <pointChronopost> blocks
    const blocks = extractAll(xml, "pointChronopost");
    if (!blocks.length) return NextResponse.json({ points: [] });

    // Collect unique postal codes to minimise Nominatim calls
    type RawBlock = { block: string; cp: string; localite: string };
    const rawBlocks: RawBlock[] = blocks.map((block) => ({
      block,
      cp: extractTag(block, "codePostal"),
      localite: extractTag(block, "localite"),
    }));

    const uniqueCPs = [...new Set(rawBlocks.map((b) => b.cp))];
    const geoCache: Record<string, { lat: number; lng: number }> = {};

    for (const cp of uniqueCPs) {
      const cityName = rawBlocks.find((b) => b.cp === cp)?.localite ?? "";
      const geo = await geocodePostalCode(cp, cityName);
      if (geo) geoCache[cp] = geo;
    }

    // Build final list
    const JITTER = 0.0015; // ~100 m spread so markers don't stack
    const points: ChronoParcelShop[] = rawBlocks.map(({ block, cp, localite }, idx) => {
      const id = extractTag(block, "identifiantChronopost");
      const name = extractTag(block, "nomEnseigne");
      const addr1 = extractTag(block, "adresse1");
      const addr2 = extractTag(block, "adresse2");
      const distance = extractTag(block, "distanceEnMetre");

      const hours: Record<string, DayHours> = {};
      for (let i = 0; i < DAYS_API.length; i++) {
        const raw = extractTag(block, `horairesOuverture${DAYS_API[i]}`);
        hours[DAYS_KEYS[i]] = parseHours(raw);
      }

      const base = geoCache[cp] ?? { lat: 48.85, lng: 2.35 };
      const lat = base.lat + (Math.random() - 0.5) * JITTER;
      const lng = base.lng + (Math.random() - 0.5) * JITTER;

      return {
        id,
        name: titleCase(name),
        address: titleCase([addr1, addr2].filter(Boolean).join(", ")),
        city: titleCase(localite),
        postalCode: cp,
        lat,
        lng,
        distance: parseInt(distance) || idx * 300,
        hours,
      };
    });

    return NextResponse.json({ points });
  } catch (err) {
    console.error("Chronopost parcelshops error:", err);
    return NextResponse.json({ points: [] });
  }
}

function titleCase(s: string): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
