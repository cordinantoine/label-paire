import { NextRequest, NextResponse } from "next/server";

/* ── Types ── */
export type DayHours = {
  open1?: string;   // "09:00"
  close1?: string;  // "12:30"
  open2?: string;   // "14:00"
  close2?: string;  // "19:30"
};

export type ParcelShop = {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
  distance: number;       // metres
  isLocker: boolean;
  hours: Record<string, DayHours>;   // lundi, mardi, …
};

const MR_ENSEIGNE = "CC22X0UA";
const SOAP_URL = "https://api.mondialrelay.com/Web_Services.asmx";

const DAYS = [
  "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche",
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

function extractStrings(hoursXml: string): string[] {
  return extractAll(hoursXml, "string");
}

function fmtTime(raw: string): string | undefined {
  if (!raw || raw.length < 4) return undefined;
  return raw.slice(0, 2) + ":" + raw.slice(2);
}

function parseHours(dayXml: string): DayHours {
  const s = extractStrings(dayXml);
  return {
    open1: fmtTime(s[0] ?? ""),
    close1: fmtTime(s[1] ?? ""),
    open2: fmtTime(s[2] ?? ""),
    close2: fmtTime(s[3] ?? ""),
  };
}

/* ── Route handler ── */
export async function POST(req: NextRequest) {
  try {
    const { postalCode, country = "FR" } = await req.json();

    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://www.mondialrelay.fr/webservice/">
  <soap:Body>
    <web:WSI4_PointRelais_Recherche>
      <web:Enseigne>${MR_ENSEIGNE}</web:Enseigne>
      <web:Pays>${country}</web:Pays>
      <web:CP>${postalCode}</web:CP>
      <web:NombreResultats>10</web:NombreResultats>
      <web:Security></web:Security>
    </web:WSI4_PointRelais_Recherche>
  </soap:Body>
</soap:Envelope>`;

    const res = await fetch(SOAP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "http://www.mondialrelay.fr/webservice/WSI4_PointRelais_Recherche",
      },
      body: soapBody,
    });

    const xml = await res.text();

    // Check STAT code (0 = ok)
    const stat = extractTag(xml, "STAT");
    if (stat !== "0") {
      console.error("MR API STAT:", stat);
      return NextResponse.json({ points: [] });
    }

    // Parse each <PointRelais_Details>
    const detailsBlocks = extractAll(xml, "PointRelais_Details");
    const points: ParcelShop[] = detailsBlocks.map(block => {
      const name = extractTag(block, "LgAdr1");
      const addr = extractTag(block, "LgAdr3");
      const city = extractTag(block, "Ville");
      const cp = extractTag(block, "CP");
      const num = extractTag(block, "Num");
      const info = extractTag(block, "Information");

      const latRaw = extractTag(block, "Latitude").replace(",", ".");
      const lngRaw = extractTag(block, "Longitude").replace(",", ".");
      const distRaw = extractTag(block, "Distance");

      const hours: Record<string, DayHours> = {};
      for (const day of DAYS) {
        const dayXml = extractTag(block, `Horaires_${day}`);
        if (dayXml) hours[day.toLowerCase()] = parseHours(dayXml);
      }

      return {
        id: num,
        name: titleCase(name),
        address: titleCase(addr),
        city: titleCase(city),
        postalCode: cp,
        lat: parseFloat(latRaw) || 0,
        lng: parseFloat(lngRaw) || 0,
        distance: parseInt(distRaw) || 0,
        isLocker: info.toUpperCase().includes("LOCKER"),
        hours,
      };
    });

    return NextResponse.json({ points });
  } catch (err) {
    console.error("MR parcelshops error:", err);
    return NextResponse.json({ points: [] });
  }
}

/* Turn "GNK MINI ALIMENTATION" → "Gnk Mini Alimentation" */
function titleCase(s: string): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
