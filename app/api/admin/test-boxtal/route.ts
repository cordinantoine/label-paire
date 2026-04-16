import { NextRequest, NextResponse } from "next/server";
import { createBoxtalOrder } from "@/lib/boxtalOrder";
import { getBoxtalToken } from "@/lib/boxtalToken";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const login    = process.env.BOXTAL_LOGIN    ?? "";
    const password = process.env.BOXTAL_PASSWORD ?? "";
    const auth     = Buffer.from(`${login}:${password}`).toString("base64");

    // Test Boxtal v1 cotation avec Basic auth
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const collecte = tomorrow.toISOString().split("T")[0];

    const url =
      `https://www.envoimoinscher.com/api/v1/cotation?` +
      `expediteur.type=entreprise&expediteur.pays=FR&expediteur.code_postal=78400&expediteur.ville=Chatou&` +
      `destinataire.type=particulier&destinataire.pays=FR&destinataire.code_postal=75001&destinataire.ville=Paris&` +
      `colis_0.poids=0.5&colis_0.longueur=30&colis_0.largeur=20&colis_0.hauteur=5&` +
      `code_contenu=40110&collecte=${collecte}`;

    const res = await fetch(url, {
      headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
    });
    const text = await res.text();
    let body: unknown;
    try { body = JSON.parse(text); } catch { body = text.slice(0, 1000); }
    return NextResponse.json({ status: res.status, body: typeof body === 'string' ? body : JSON.stringify(body) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const result = await createBoxtalOrder({
    orderReference:      body.orderReference      ?? `TEST-${Date.now()}`,
    recipientName:       body.recipientName       ?? "Antoine Cordin",
    recipientEmail:      body.recipientEmail      ?? (process.env.SENDER_EMAIL ?? "test@labelpaire.fr"),
    recipientPhone:      body.recipientPhone      ?? "0600000000",
    recipientStreet:     body.recipientStreet     ?? "9 Boulevard du Temple",
    recipientCity:       body.recipientCity       ?? "Chatou",
    recipientPostalCode: body.recipientPostalCode ?? "78400",
    recipientCountry:    body.recipientCountry    ?? "FR",
    weightKg:            body.weightKg            ?? 0.3,
    network:             body.network             ?? "COPR",
    parcelPointCode:     body.parcelPointCode,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
