/**
 * Boxtal API v3.1 — shipping order creation
 * Base URL : https://api.boxtal.com
 * Auth     : OAuth Bearer token (BOXTAL_LOGIN:BOXTAL_PASSWORD via /iam/account-app/token)
 * Spec     : https://developer.boxtal.com/fr/fr/apiv3 (slug: api-v3)
 *
 * Flow : POST /shipping/v3.1/shipping-order (no separate offer fetch)
 *
 * NOTE: L'API v1 (www.envoimoinscher.com) bloque les IPs cloud/Vercel.
 * L'API v3 (api.boxtal.com) utilise OAuth et fonctionne depuis n'importe quelle IP.
 */

import { getBoxtalToken } from "./boxtalToken";

const BOXTAL_API = "https://api.boxtal.com";

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

// ── Helpers ────────────────────────────────────────────────────────────────────

// Convertit un numéro FR "0612345678" en format E.164 "+33612345678".
// Accepte aussi déjà au format international.
function toE164(phone: string | undefined, fallback = "+33600000000"): string {
  if (!phone) return fallback;
  const trimmed = phone.trim().replace(/[\s.-]/g, "");
  if (trimmed.startsWith("+")) return trimmed;
  if (trimmed.startsWith("00")) return "+" + trimmed.slice(2);
  if (trimmed.startsWith("0") && trimmed.length === 10) return "+33" + trimmed.slice(1);
  return fallback;
}

function senderAddress() {
  return {
    type: "BUSINESS" as const,
    contact: {
      firstName: "Label",
      lastName:  "Paire",
      email:     process.env.SENDER_EMAIL ?? "commandes@labelpaire.fr",
      phone:     toE164(process.env.SENDER_PHONE, "+33600000000"),
    },
    location: {
      countryIsoCode: "FR",
      city:           process.env.SENDER_CITY        ?? "Chatou",
      postalCode:     process.env.SENDER_POSTAL_CODE ?? "78400",
      number:         process.env.SENDER_STREET_NUM  ?? "9",
      street:         process.env.SENDER_STREET      ?? "Boulevard du Temple",
    },
  };
}

// ── Sélection du code d'offre ──────────────────────────────────────────────────
// L'API v3 n'a pas d'endpoint de cotation public, on mappe les réseaux sur les
// offer codes connus. À ajuster selon les offres activées sur le compte Boxtal.
// Offres activées sur le compte (vérifiées via /api/admin/debug):
//   POFR-ColissimoAccess  ✅  (domicile, La Poste)
//   MONR-CpourToi         ✅  (relais Mondial Relay — requiert pickupPointCode)
//   CHRP-ChronoRelais     ✅  (relais Chronopost — requiert pickupPointCode)
function pickOfferCode(input: BoxtalOrderInput): string {
  const prefix = input.network.split("-")[0].toUpperCase();
  switch (prefix) {
    case "MONR": return process.env.BOXTAL_OFFER_MONR ?? "MONR-CpourToi";
    case "CHRP": return process.env.BOXTAL_OFFER_CHRP ?? "CHRP-ChronoRelais";
    case "COPR": return process.env.BOXTAL_OFFER_COPR ?? "POFR-ColissimoAccess";
    case "POFR": return process.env.BOXTAL_OFFER_POFR ?? "POFR-ColissimoAccess";
    default:     return process.env.BOXTAL_OFFER_DEFAULT ?? "POFR-ColissimoAccess";
  }
}

// ── Création de la commande ────────────────────────────────────────────────────

export async function createBoxtalOrder(input: BoxtalOrderInput): Promise<BoxtalOrderResult> {
  try {
    const token = await getBoxtalToken();

    const offerCode = pickOfferCode(input);
    console.log("Boxtal v3 selected offer:", offerCode, "for network:", input.network);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const collecte = tomorrow.toISOString().split("T")[0];

    const nameParts      = input.recipientName.trim().split(" ");
    const recipientFirst = nameParts[0] ?? "Client";
    const recipientLast  = nameParts.slice(1).join(" ") || recipientFirst;

    // Split recipient street into number + street name
    const streetMatch    = input.recipientStreet.match(/^(\d+[a-zA-Z]?)\s+(.+)$/);
    const streetNumber   = streetMatch ? streetMatch[1] : "1";
    const streetName     = streetMatch ? streetMatch[2] : input.recipientStreet;

    const toAddress = {
      type: "RESIDENTIAL" as const,
      contact: {
        firstName: recipientFirst,
        lastName:  recipientLast,
        email:     input.recipientEmail,
        phone:     toE164(input.recipientPhone, "+33600000000"),
      },
      location: {
        countryIsoCode: input.recipientCountry || "FR",
        city:           input.recipientCity,
        postalCode:     input.recipientPostalCode,
        number:         streetNumber,
        street:         streetName,
      },
    };

    const shipment: Record<string, unknown> = {
      externalId:    input.orderReference,
      fromAddress:   senderAddress(),
      toAddress,
      returnAddress: senderAddress(),
      packages: [{
        type:       "PARCEL",
        weight:     Math.max(0.1, input.weightKg),
        length:     30,
        width:      20,
        height:     Math.max(5, Math.round(input.weightKg * 10)),
        stackable:  true,
        externalId: "pkg-1",
        value:      { value: 30, currency: "EUR" },
        content: {
          id:          "content:v1:40110",
          description: "Vêtements neufs",
        },
      }],
    };

    // Point relais : c'est pickupPointCode au niveau Shipment (pas toAddress.parcelPoint)
    if (input.parcelPointCode) {
      shipment.pickupPointCode = input.parcelPointCode;
    }

    const body = {
      insured: false,
      shipment,
      labelType:              "PDF_A4",
      shippingOfferCode:      offerCode,
      expectedTakingOverDate: collecte,
    };

    console.log("Boxtal v3 order body:", JSON.stringify(body).slice(0, 500));

    const res = await fetch(`${BOXTAL_API}/shipping/v3.1/shipping-order`, {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept:         "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    console.log("Boxtal v3 order response:", res.status, text.slice(0, 600));

    if (!res.ok) {
      let errMsg = text.slice(0, 400);
      try {
        const errData = JSON.parse(text);
        const errs = errData.errors ?? [];
        const detailed = errs.map((e: { code: string; message?: string; parameters?: unknown }) =>
          `${e.code}${e.message ? ": " + e.message : ""}${e.parameters ? " " + JSON.stringify(e.parameters) : ""}`
        ).join(", ");
        errMsg = detailed || errData.message || errMsg;
      } catch { /* keep raw */ }
      return { ok: false, error: `HTTP ${res.status}: ${errMsg}` };
    }

    let orderCode = input.orderReference;
    try {
      const resData = JSON.parse(text);
      orderCode = resData.reference ?? resData.id ?? resData.orderCode ?? input.orderReference;
    } catch { /* keep default */ }

    return { ok: true, orderCode };

  } catch (err) {
    console.error("Boxtal v3 exception:", err);
    return { ok: false, error: String(err) };
  }
}
