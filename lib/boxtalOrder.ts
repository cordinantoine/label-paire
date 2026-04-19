/**
 * Boxtal API v1 — shipping order creation
 * Base URL : https://www.envoimoinscher.com
 * Auth     : HTTP Basic (BOXTAL_LOGIN:BOXTAL_PASSWORD)
 * Flow     : 1. GET cotation → pick offer  2. GET order → create label
 */

const BOXTAL_BASE = "https://www.envoimoinscher.com";

export type BoxtalOrderInput = {
  orderReference: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  recipientStreet: string;
  recipientCity: string;
  recipientPostalCode: string;
  recipientCountry: string;
  weightKg: number;
  network: string;         // "MONR", "CHRP", "" (home delivery)
  parcelPointCode?: string; // relay point code for recipient
};

export type BoxtalOrderResult =
  | { ok: true; orderCode: string }
  | { ok: false; error: string };

// ── XML helpers ────────────────────────────────────────────────────────────────

function xmlTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`));
  return m ? m[1].trim() : "";
}

function xmlAllTags(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "g");
  const results: string[] = [];
  let m;
  while ((m = re.exec(xml)) !== null) results.push(m[1]);
  return results;
}

// ── Auth ───────────────────────────────────────────────────────────────────────

function getAuth(): string {
  const login    = process.env.BOXTAL_LOGIN    ?? "";
  const password = process.env.BOXTAL_PASSWORD ?? "";
  return "Basic " + Buffer.from(`${login}:${password}`).toString("base64");
}

// ── Cotation → pick best offer ─────────────────────────────────────────────────

type BoxtalOffer = { operator: string; service: string };

async function getCotation(input: BoxtalOrderInput): Promise<BoxtalOffer | null> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const collecte = tomorrow.toISOString().split("T")[0];

  const params = new URLSearchParams({
    "expediteur.type":            "entreprise",
    "expediteur.pays":            "FR",
    "expediteur.code_postal":     process.env.SENDER_POSTAL_CODE ?? "78400",
    "expediteur.ville":           process.env.SENDER_CITY        ?? "Chatou",
    "expediteur.adresse":         process.env.SENDER_STREET      ?? "9 Boulevard du Temple",
    "destinataire.type":          "particulier",
    "destinataire.pays":          input.recipientCountry || "FR",
    "destinataire.code_postal":   input.recipientPostalCode,
    "destinataire.ville":         input.recipientCity,
    "destinataire.adresse":       input.recipientStreet,
    "colis_0.poids":    String(Math.max(0.1, input.weightKg)),
    "colis_0.longueur": "30",
    "colis_0.largeur":  "20",
    "colis_0.hauteur":  String(Math.max(5, Math.round(input.weightKg * 10))),
    "code_contenu":               "40110",  // Tissus, vêtements neufs
    "collecte":                   collecte,
  });

  const url = `${BOXTAL_BASE}/api/v1/cotation?${params.toString()}`;
  const res = await fetch(url, {
    headers: { Authorization: getAuth(), "Api-Version": "1.3.7" },
  });
  const xml = await res.text();
  console.log("Boxtal cotation response:", res.status, xml.slice(0, 500));

  if (!res.ok && res.status !== 400) {
    console.error("Boxtal cotation error:", res.status, xml.slice(0, 300));
    return null;
  }

  // Parse offers from XML
  // <offer> blocks contain <operator><code>MONR</code></operator><service><code>CpourToi</code></service>
  const offerBlocks = xmlAllTags(xml, "offer");
  if (!offerBlocks.length) {
    console.error("Boxtal cotation: no offers found. XML:", xml.slice(0, 500));
    return null;
  }

  const isRelay = ["MONR", "CHRP"].includes(input.network.toUpperCase());

  // Try to find an offer matching the requested network
  for (const block of offerBlocks) {
    const opCode  = xmlTag(xmlAllTags(block, "operator")[0] ?? "", "code");
    const svcCode = xmlTag(xmlAllTags(block, "service")[0]  ?? "", "code");
    const deliveryType = xmlTag(block, "type"); // PICKUP_POINT or HOME_DELIVERY

    const blockIsRelay = deliveryType === "PICKUP_POINT";

    if (isRelay && blockIsRelay && (!input.network || opCode === input.network)) {
      return { operator: opCode, service: svcCode };
    }
    if (!isRelay && !blockIsRelay) {
      return { operator: opCode, service: svcCode };
    }
  }

  // Fallback: first offer
  const firstBlock = offerBlocks[0];
  const opCode  = xmlTag(xmlAllTags(firstBlock, "operator")[0] ?? "", "code");
  const svcCode = xmlTag(xmlAllTags(firstBlock, "service")[0]  ?? "", "code");
  return { operator: opCode, service: svcCode };
}

// ── Create order ───────────────────────────────────────────────────────────────

export async function createBoxtalOrder(input: BoxtalOrderInput): Promise<BoxtalOrderResult> {
  try {
    const offer = await getCotation(input);
    if (!offer) {
      return { ok: false, error: "Aucune offre Boxtal disponible pour ce colis" };
    }

    console.log("Boxtal selected offer:", offer);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const collecte = tomorrow.toISOString().split("T")[0];

    const nameParts     = input.recipientName.trim().split(" ");
    const recipientFirst = nameParts[0] ?? "Client";
    const recipientLast  = nameParts.slice(1).join(" ") || recipientFirst;

    const params = new URLSearchParams({
      "expediteur.type":        "entreprise",
      "expediteur.pays":        "FR",
      "expediteur.code_postal": process.env.SENDER_POSTAL_CODE ?? "78400",
      "expediteur.ville":       process.env.SENDER_CITY        ?? "Chatou",
      "expediteur.adresse":     process.env.SENDER_STREET      ?? "9 Boulevard du Temple",
      "expediteur.civilite":    "M",
      "expediteur.prenom":      "Label",
      "expediteur.nom":         "Paire",
      "expediteur.societe":     "Label Paire",
      "expediteur.email":       process.env.SENDER_EMAIL ?? "commandes@labelpaire.fr",
      "expediteur.tel":         process.env.SENDER_PHONE ?? "0600000000",

      "destinataire.type":        "particulier",
      "destinataire.pays":        input.recipientCountry || "FR",
      "destinataire.code_postal": input.recipientPostalCode,
      "destinataire.ville":       input.recipientCity,
      "destinataire.adresse":     input.recipientStreet,
      "destinataire.civilite":    "M",
      "destinataire.prenom":      recipientFirst,
      "destinataire.nom":         recipientLast,
      "destinataire.email":       input.recipientEmail,
      "destinataire.tel":         input.recipientPhone ?? "0600000000",

      "colis_0.poids":       String(Math.max(0.1, input.weightKg)),
      "colis_0.longueur":    "30",
      "colis_0.largeur":     "20",
      "colis_0.hauteur":     String(Math.max(5, Math.round(input.weightKg * 10))),
      "colis_0.valeur":      "30",
      "colis_0.description": "Vêtements neufs",

      "code_contenu":          "40110",
      "collecte":              collecte,
      "delay":                 "aucun",
      "assurance.selection":   "false",
      "operator":              offer.operator,
      "service":               offer.service,
      "raison":                "VENTE",
    });

    // Add relay point code if relay delivery
    if (input.parcelPointCode) {
      params.set("retrait.pointrelais", input.parcelPointCode);
    }

    const url = `${BOXTAL_BASE}/api/v1/order?${params.toString()}`;
    console.log("Boxtal order URL:", url.slice(0, 300));

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization:   getAuth(),
        "Api-Version":   "1.3.7",
      },
    });

    const xml = await res.text();
    console.log("Boxtal order response:", res.status, xml.slice(0, 600));

    if (!res.ok) {
      const errCode = xmlTag(xml, "code");
      const errMsg  = xmlTag(xml, "message");
      return { ok: false, error: `HTTP ${res.status}: ${errCode} — ${errMsg}` };
    }

    // Extract order reference from XML response
    const orderRef = xmlTag(xml, "reference") || xmlTag(xml, "ref") || input.orderReference;
    return { ok: true, orderCode: orderRef };

  } catch (err) {
    console.error("Boxtal v1 exception:", err);
    return { ok: false, error: String(err) };
  }
}
