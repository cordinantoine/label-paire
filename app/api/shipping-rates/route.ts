import { NextRequest, NextResponse } from "next/server";

export type ShippingRate = {
  id: number;
  name: string;
  carrier: string;
  price: number; // EUR TTC
  min_days: number;
  max_days: number;
};

// Carrier mapping from Boxtal operator codes
function mapCarrier(operatorCode: string, serviceCode: string): string {
  const code = operatorCode.toUpperCase();
  if (code.includes("MONR") || code.includes("MONDIAL")) return "mondial_relay";
  if (code.includes("CHRONO")) {
    // Shop2Shop = point relais Chronopost
    if (serviceCode.toUpperCase().includes("S2S") || serviceCode.toUpperCase().includes("SHOP"))
      return "chronopost_relay";
    return "chronopost";
  }
  if (code.includes("COLI")) return "colissimo";
  if (code.includes("DPD")) return "dpd";
  if (code.includes("GLS")) return "gls";
  return code.toLowerCase();
}

// Extract text content from a simple XML tag
function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = xml.match(re);
  return m ? m[1].trim() : "";
}

function extractAll(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>[\\s\\S]*?</${tag}>`, "gi");
  return xml.match(re) ?? [];
}

export async function POST(req: NextRequest) {
  try {
    const { weightKg, toCountry, toZip = "", toCity = "" } = await req.json();

    const login    = process.env.BOXTAL_LOGIN;
    const password = process.env.BOXTAL_PASSWORD;

    if (!login || !password) {
      return NextResponse.json({ rates: [] });
    }

    const auth = Buffer.from(`${login}:${password}`).toString("base64");

    // Dimensions estimées selon le poids (pour la cotation)
    const longueur = 30;
    const largeur  = 20;
    const hauteur  = Math.max(5, Math.round(weightKg * 10));

    const params = new URLSearchParams({
      "expediteur.pays":         "FR",
      "expediteur.code_postal":  "78400",  // entrepôt Label Paire
      "expediteur.ville":        "Chatou",
      "expediteur.type":         "entreprise",
      "destinataire.pays":       toCountry ?? "FR",
      "destinataire.code_postal": toZip || "75001",
      "destinataire.ville":      toCity || "Paris",
      "destinataire.type":       "particulier",
      "colis_1.poids":           String(Math.max(0.1, weightKg)),
      "colis_1.longueur":        String(longueur),
      "colis_1.largeur":         String(largeur),
      "colis_1.hauteur":         String(hauteur),
    });

    const res = await fetch(
      `https://www.envoimoinscher.com/api/v1/cotation?${params.toString()}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/xml",
        },
      }
    );

    if (!res.ok) {
      console.error("Boxtal API error:", res.status, await res.text());
      return NextResponse.json({ rates: [] });
    }

    const xml = await res.text();

    // Parse <offer> blocks
    const offerBlocks = extractAll(xml, "offer");

    const rates: ShippingRate[] = offerBlocks
      .map((block, idx) => {
        const operatorLabel = extractTag(block, "operator>[\\s\\S]*?<label");
        const serviceCode  = extractTag(block, "service>[\\s\\S]*?<code");
        const serviceLabel = extractTag(block, "service>[\\s\\S]*?<label");
        const priceTTC     = parseFloat(extractTag(block, "tax-inclusive") || extractTag(block, "tax-exclusive") || "0");
        const deliveryDate = extractTag(block, "delivery>[\\s\\S]*?<date");
        const collectionDate = extractTag(block, "collection>[\\s\\S]*?<date");

        // Estimate days from dates
        let minDays = 2, maxDays = 5;
        if (collectionDate && deliveryDate) {
          const col = new Date(collectionDate);
          const del = new Date(deliveryDate);
          const days = Math.round((del.getTime() - col.getTime()) / 86400000);
          minDays = Math.max(1, days);
          maxDays = minDays + 1;
        }

        const opCode = extractTag(block, "code");
        const carrier = mapCarrier(opCode, serviceCode || "");

        const name = serviceLabel
          ? `${operatorLabel || opCode} — ${serviceLabel}`
          : (operatorLabel || opCode);

        return {
          id: -(100 + idx),
          name: name.trim(),
          carrier,
          price: priceTTC,
          min_days: minDays,
          max_days: maxDays,
        };
      })
      .filter((r) => r.price > 0)
      .sort((a, b) => a.price - b.price)
      .slice(0, 6);

    return NextResponse.json({ rates });
  } catch (err) {
    console.error("Boxtal shipping rates error:", err);
    return NextResponse.json({ rates: [] });
  }
}
