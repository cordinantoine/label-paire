import { NextResponse } from "next/server";
import { getBoxtalToken } from "@/lib/boxtalToken";

export const dynamic = "force-dynamic";

// Essaie de créer une commande avec un offer code donné et retourne le résultat
async function tryOrder(token: string, offerCode: string) {
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const body = {
    insured: false,
    shipment: {
      externalId: `DEBUG-${offerCode}-${Date.now()}`,
      fromAddress: {
        type: "PROFESSIONAL",
        contact: { firstName: "Label", lastName: "Paire", email: "commandes@labelpaire.fr", phone: "0600000000" },
        location: { countryIsoCode: "FR", city: "Chatou", postalCode: "78400", street: "Boulevard du Temple" },
      },
      toAddress: {
        type: "RESIDENTIAL",
        contact: { firstName: "Antoine", lastName: "Cordin", email: "cordin.antoine@gmail.com", phone: "0600000000" },
        location: { countryIsoCode: "FR", city: "Paris", postalCode: "75001", street: "Rue de Rivoli" },
      },
      returnAddress: {
        type: "PROFESSIONAL",
        contact: { firstName: "Label", lastName: "Paire", email: "commandes@labelpaire.fr", phone: "0600000000" },
        location: { countryIsoCode: "FR", city: "Chatou", postalCode: "78400", street: "Boulevard du Temple" },
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
  return { offerCode, status: res.status, preview: text.slice(0, 200) };
}

export async function GET() {
  let token = "";
  try { token = await getBoxtalToken(); } catch (err) {
    return NextResponse.json({ error: `Token failed: ${err}` });
  }

  // Codes d'offre connus pour Boxtal v3 — on teste lesquels fonctionnent
  const offerCodes = [
    "CHRP-Chrono2ShopDirect",
    "CHRP-ChronoRelais",
    "CHRP-Chrono13",
    "CHRP-R-S",
    "MONR-Standard",
    "MONR-R-S",
    "COPR-CoprRelaisDomicileNat",
    "COPR-ColissimoAccess",
    "POFR-ColissimoAccess",
    "BDMT-StandarHD",
  ];

  const results = [];
  for (const code of offerCodes) {
    const r = await tryOrder(token, code);
    results.push(r);
    // Stop dès qu'on trouve un succès
    if (r.status === 200 || r.status === 201) break;
  }

  return NextResponse.json({ tokenOk: true, results });
}
