import { NextResponse } from "next/server";
import { getBoxtalToken } from "@/lib/boxtalToken";

export const dynamic = "force-dynamic";

// Essaie de créer une commande avec un offer code donné et retourne le résultat COMPLET
async function tryOrder(token: string, offerCode: string) {
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const body = {
    insured: false,
    shipment: {
      externalId: `DEBUG-${offerCode}-${Date.now()}`,
      fromAddress: {
        type: "PROFESSIONAL",
        contact: { firstName: "Label", lastName: "Paire", email: "commandes@labelpaire.fr", phone: "0600000000" },
        location: { countryIsoCode: "FR", city: "Chatou", postalCode: "78400", number: "9", street: "Boulevard du Temple" },
      },
      toAddress: {
        type: "RESIDENTIAL",
        contact: { firstName: "Antoine", lastName: "Cordin", email: "cordin.antoine@gmail.com", phone: "0600000000" },
        location: { countryIsoCode: "FR", city: "Paris", postalCode: "75001", number: "1", street: "Rue de Rivoli" },
      },
      returnAddress: {
        type: "PROFESSIONAL",
        contact: { firstName: "Label", lastName: "Paire", email: "commandes@labelpaire.fr", phone: "0600000000" },
        location: { countryIsoCode: "FR", city: "Chatou", postalCode: "78400", number: "9", street: "Boulevard du Temple" },
      },
      packages: [{
        type: "PARCEL", weight: 0.3, length: 30, width: 20, height: 5,
        stackable: true, externalId: "pkg-1", value: 30,
        content: { id: "content:v1:40110", description: "Vêtements neufs" },
      }],
    },
    labelType: "PDF_A4",
    shippingOfferCode: offerCode,
    expectedTakingOverDate: tomorrow.toISOString().split("T")[0],
  };

  const res = await fetch("https://api.boxtal.com/shipping/v3.1/shipping-order", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let parsed: unknown = null;
  try { parsed = JSON.parse(text); } catch { /* raw */ }
  return { offerCode, status: res.status, response: parsed ?? text, bodySent: body };
}

// Tente GET /shipping-offer avec différentes combinaisons de paramètres
async function tryOffers(token: string) {
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const collecte = tomorrow.toISOString().split("T")[0];

  const attempts = [
    {
      name: "v3.1 basic",
      url: "https://api.boxtal.com/shipping/v3.1/shipping-offer",
      params: {
        "fromAddress.countryIsoCode": "FR",
        "fromAddress.postalCode": "78400",
        "fromAddress.city": "Chatou",
        "toAddress.countryIsoCode": "FR",
        "toAddress.postalCode": "75001",
        "toAddress.city": "Paris",
        "packages[0].type": "PARCEL",
        "packages[0].weight": "0.3",
        "packages[0].length": "30",
        "packages[0].width": "20",
        "packages[0].height": "5",
        "packages[0].value": "30",
        "expectedTakingOverDate": collecte,
      },
    },
    {
      name: "v3.1 minimal",
      url: "https://api.boxtal.com/shipping/v3.1/shipping-offer",
      params: {
        "fromAddress.countryIsoCode": "FR",
        "fromAddress.postalCode": "78400",
        "toAddress.countryIsoCode": "FR",
        "toAddress.postalCode": "75001",
        "packages[0].weight": "0.3",
        "packages[0].length": "30",
        "packages[0].width": "20",
        "packages[0].height": "5",
      },
    },
    {
      name: "v3 (no .1)",
      url: "https://api.boxtal.com/shipping/v3/shipping-offer",
      params: {
        "fromAddress.countryIsoCode": "FR",
        "fromAddress.postalCode": "78400",
        "toAddress.countryIsoCode": "FR",
        "toAddress.postalCode": "75001",
        "packages[0].weight": "0.3",
        "packages[0].length": "30",
        "packages[0].width": "20",
        "packages[0].height": "5",
      },
    },
    {
      name: "shipping-offers (plural)",
      url: "https://api.boxtal.com/shipping/v3.1/shipping-offers",
      params: {
        "fromAddress.countryIsoCode": "FR",
        "fromAddress.postalCode": "78400",
        "toAddress.countryIsoCode": "FR",
        "toAddress.postalCode": "75001",
        "packages[0].weight": "0.3",
        "packages[0].length": "30",
        "packages[0].width": "20",
        "packages[0].height": "5",
      },
    },
  ];

  const results = [];
  for (const attempt of attempts) {
    const qs = new URLSearchParams(attempt.params as Record<string, string>);
    const res = await fetch(`${attempt.url}?${qs}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const text = await res.text();
    let parsed: unknown = null;
    try { parsed = JSON.parse(text); } catch { /* raw */ }
    results.push({ name: attempt.name, url: attempt.url, status: res.status, response: parsed ?? text.slice(0, 500) });
  }
  return results;
}

export async function GET() {
  let token = "";
  try { token = await getBoxtalToken(); } catch (err) {
    return NextResponse.json({ error: `Token failed: ${err}` });
  }

  // 1. Essayer plusieurs variantes de GET /shipping-offer
  const offersAttempts = await tryOffers(token);

  // 2. Essayer une seule commande mais avec réponse COMPLETE pour voir l'erreur réelle
  const orderAttempt = await tryOrder(token, "MONR-Standard");

  return NextResponse.json({ tokenOk: true, offersAttempts, orderAttempt });
}
