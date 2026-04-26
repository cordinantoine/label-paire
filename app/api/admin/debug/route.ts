import { NextResponse } from "next/server";
import { getBoxtalToken } from "@/lib/boxtalToken";

export const dynamic = "force-dynamic";

// Body corrigé selon la spec officielle api-v3 (récupérée depuis developer.boxtal.com)
// - Address.type: "BUSINESS" (pas "PROFESSIONAL")
// - Package.value: Money object { value, currency }
// - Contact.phone: format E.164 (+33...)
async function tryOrder(token: string, offerCode: string) {
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const body = {
    insured: false,
    shipment: {
      externalId: `DEBUG-${offerCode}-${Date.now()}`,
      fromAddress: {
        type: "BUSINESS",
        contact: { firstName: "Label", lastName: "Paire", email: "commandes@labelpaire.fr", phone: "+33600000000" },
        location: { countryIsoCode: "FR", city: "Chatou", postalCode: "78400", number: "9", street: "Boulevard du Temple" },
      },
      toAddress: {
        type: "RESIDENTIAL",
        contact: { firstName: "Antoine", lastName: "Cordin", email: "cordin.antoine@gmail.com", phone: "+33600000000" },
        location: { countryIsoCode: "FR", city: "Paris", postalCode: "75001", number: "1", street: "Rue de Rivoli" },
      },
      returnAddress: {
        type: "BUSINESS",
        contact: { firstName: "Label", lastName: "Paire", email: "commandes@labelpaire.fr", phone: "+33600000000" },
        location: { countryIsoCode: "FR", city: "Chatou", postalCode: "78400", number: "9", street: "Boulevard du Temple" },
      },
      packages: [{
        type: "PARCEL",
        weight: 0.3,
        length: 30,
        width: 20,
        height: 5,
        stackable: true,
        externalId: "pkg-1",
        value: { value: 30, currency: "EUR" },
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
  return { offerCode, status: res.status, response: parsed ?? text };
}

export async function GET() {
  let token = "";
  try { token = await getBoxtalToken(); } catch (err) {
    return NextResponse.json({ error: `Token failed: ${err}` });
  }

  // Offres testables. Pour ajouter un code à tester ponctuellement,
  // mets-le ici puis redeploie. Garde la liste courte pour éviter
  // de créer des expéditions test inutiles.
  // Offres ACTIVÉES sur le compte (vérifiées) :
  //   POFR-ColissimoAccess  (domicile, La Poste)
  //   MONR-CpourToi         (relais Mondial Relay — requiert pickupPointCode)
  //   CHRP-ChronoRelais     (relais Chronopost — requiert pickupPointCode)
  const offerCodes = (process.env.BOXTAL_DEBUG_OFFERS ?? "POFR-ColissimoAccess").split(",");

  const results = [];
  for (const code of offerCodes) {
    const r = await tryOrder(token, code);
    results.push(r);
    if (r.status === 200 || r.status === 201) break;
  }

  return NextResponse.json({ tokenOk: true, results });
}
