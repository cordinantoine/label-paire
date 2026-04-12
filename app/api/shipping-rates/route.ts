import { NextRequest, NextResponse } from "next/server";

export type ShippingRate = {
  id: number;
  name: string;
  carrier: string;
  price: number; // EUR TTC
  min_days: number;
  max_days: number;
};

const BOXTAL_QUOTE_URL = "https://www.envoimoinscher.com/api/v1/cotation";

function mapCarrier(operatorCode: string): string {
  const c = operatorCode.toUpperCase();
  if (c.includes("MONR") || c.includes("MONDIAL"))  return "mondial_relay";
  if (c.includes("CHRONO"))                          return "chronopost";
  if (c.includes("COLI"))                            return "colissimo";
  if (c.includes("DPD"))                             return "dpd";
  if (c.includes("GLS"))                             return "gls";
  if (c.includes("UPS"))                             return "ups";
  return c.toLowerCase();
}

function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  return xml.match(re)?.[1]?.trim() ?? "";
}

function extractAll(xml: string, tag: string): string[] {
  return xml.match(new RegExp(`<${tag}[^>]*>[\\s\\S]*?</${tag}>`, "gi")) ?? [];
}

async function getBoxtalRates(
  weightKg: number,
  toCountry: string,
  toZip: string,
  toCity: string
): Promise<ShippingRate[]> {
  const login    = process.env.BOXTAL_LOGIN;
  const password = process.env.BOXTAL_PASSWORD;

  if (!login || !password) return [];

  const auth = Buffer.from(`${login}:${password}`).toString("base64");

  const params = new URLSearchParams({
    "expediteur.pays":           "FR",
    "expediteur.code_postal":    "78400",
    "expediteur.ville":          "Chatou",
    "expediteur.type":           "entreprise",
    "destinataire.pays":         toCountry,
    "destinataire.code_postal":  toZip,
    "destinataire.ville":        toCity,
    "destinataire.type":         "particulier",
    "colis_1.poids":             String(Math.max(0.1, weightKg)),
    "colis_1.longueur":          "30",
    "colis_1.largeur":           "20",
    "colis_1.hauteur":           String(Math.max(5, Math.round(weightKg * 10))),
  });

  const res = await fetch(`${BOXTAL_QUOTE_URL}?${params.toString()}`, {
    headers: { Authorization: `Basic ${auth}`, Accept: "application/xml" },
  });

  if (!res.ok) {
    console.error("Boxtal cotation error:", res.status);
    return [];
  }

  const xml = await res.text();
  const offerBlocks = extractAll(xml, "offer");

  return offerBlocks
    .map((block, idx) => {
      const operatorCode  = extractTag(block, "operator>[\\s\\S]*?<code");
      const operatorLabel = extractTag(block, "operator>[\\s\\S]*?<label");
      const serviceLabel  = extractTag(block, "service>[\\s\\S]*?<label");
      const priceTTC      = parseFloat(extractTag(block, "tax-inclusive") || extractTag(block, "tax-exclusive") || "0");
      const deliveryDate  = extractTag(block, "delivery>[\\s\\S]*?<date");
      const collectionDate = extractTag(block, "collection>[\\s\\S]*?<date");

      let minDays = 2, maxDays = 5;
      if (collectionDate && deliveryDate) {
        const days = Math.round(
          (new Date(deliveryDate).getTime() - new Date(collectionDate).getTime()) / 86_400_000
        );
        minDays = Math.max(1, days);
        maxDays = minDays + 1;
      }

      const carrier = mapCarrier(operatorCode || operatorLabel);
      const name    = serviceLabel
        ? `${operatorLabel} — ${serviceLabel}`
        : operatorLabel;

      return { id: -(100 + idx), name: name.trim(), carrier, price: priceTTC, min_days: minDays, max_days: maxDays };
    })
    .filter((r) => {
      if (!r.price || !r.name) return false;
      // Exclure les offres point relais (gérées séparément via BoxtalRelayPicker)
      if (r.carrier === "mondial_relay") return false;
      const n = r.name.toLowerCase();
      if (n.includes("relais") || n.includes("relay") || n.includes("shop2shop")) return false;
      return true;
    })
    .sort((a, b) => a.price - b.price);
}

export async function POST(req: NextRequest) {
  try {
    const { weightKg, toCountry = "FR", toZip = "75001", toCity = "Paris" } = await req.json();

    const rates = await getBoxtalRates(weightKg, toCountry, toZip, toCity);
    // Retourner la meilleure offre domicile (la moins chère)
    return NextResponse.json({ rates: rates.slice(0, 1) });
  } catch (err) {
    console.error("Shipping rates error:", err);
    return NextResponse.json({ rates: [] });
  }
}
