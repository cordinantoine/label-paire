import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  // ── Check env vars (masked) ──────────────────────────────────────────────
  const envCheck = {
    BOXTAL_LOGIN:        process.env.BOXTAL_LOGIN    ? `✅ ${process.env.BOXTAL_LOGIN.slice(0, 4)}...` : "❌ MANQUANT",
    BOXTAL_PASSWORD:     process.env.BOXTAL_PASSWORD ? "✅ défini" : "❌ MANQUANT",
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? "✅ défini" : "❌ MANQUANT",
  };

  // ── Test Boxtal v1 cotation ──────────────────────────────────────────────
  let boxtalV1: { ok: boolean; status?: number; preview?: string; error?: string } = { ok: false };
  try {
    const login = (process.env.BOXTAL_LOGIN    ?? "").trim();
    const pass  = (process.env.BOXTAL_PASSWORD ?? "").trim();
    const auth  = Buffer.from(`${login}:${pass}`).toString("base64");
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const collecte = tomorrow.toISOString().split("T")[0];
    const url = `https://www.envoimoinscher.com/api/v1/cotation?expediteur.type=entreprise&expediteur.pays=FR&expediteur.code_postal=78400&expediteur.ville=Chatou&destinataire.type=particulier&destinataire.pays=FR&destinataire.code_postal=75001&destinataire.ville=Paris&colis_0.poids=0.5&colis_0.longueur=30&colis_0.largeur=20&colis_0.hauteur=5&code_contenu=40110&collecte=${collecte}`;
    const res = await fetch(url, { headers: { Authorization: `Basic ${auth}`, "Api-Version": "1.3.7" } });
    const text = await res.text();
    boxtalV1 = { ok: res.ok, status: res.status, preview: text.slice(0, 200) };
  } catch (err) { boxtalV1 = { ok: false, error: String(err) }; }

  // ── Test Boxtal v3 OAuth token ───────────────────────────────────────────
  let boxtalV3Token: { ok: boolean; status?: number; hasToken?: boolean; error?: string } = { ok: false };
  let tokenValue = "";
  try {
    const login = (process.env.BOXTAL_LOGIN    ?? "").trim();
    const pass  = (process.env.BOXTAL_PASSWORD ?? "").trim();
    const auth  = Buffer.from(`${login}:${pass}`).toString("base64");
    const res = await fetch("https://api.boxtal.com/iam/account-app/token", {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Basic ${auth}` },
      body: "",
    });
    const text = await res.text();
    let data: Record<string, unknown> = {};
    try { data = JSON.parse(text); } catch { /* ignore */ }
    tokenValue = (data.accessToken as string) ?? "";
    boxtalV3Token = { ok: res.ok, status: res.status, hasToken: !!tokenValue };
  } catch (err) { boxtalV3Token = { ok: false, error: String(err) }; }

  // ── Test Boxtal v3 order creation (si token ok) ──────────────────────────
  let boxtalV3Order: { ok: boolean; status?: number; preview?: string; error?: string } = { ok: false, error: "token manquant" };
  if (tokenValue) {
    try {
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      const body = {
        insured: false,
        shipment: {
          externalId: `DEBUG-${Date.now()}`,
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
        shippingOfferCode: "POFR-ColissimoAccess",
        expectedTakingOverDate: tomorrow.toISOString().split("T")[0],
      };
      const res = await fetch("https://api.boxtal.com/shipping/v3.1/shipping-order", {
        method: "POST",
        headers: { Authorization: `Bearer ${tokenValue}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      boxtalV3Order = { ok: res.ok, status: res.status, preview: text.slice(0, 400) };
    } catch (err) { boxtalV3Order = { ok: false, error: String(err) }; }
  }

  // ── DB stats ─────────────────────────────────────────────────────────────
  let dbStats = null;
  try {
    const orderCount    = await prisma.order.count();
    const customerCount = await prisma.customer.count();
    dbStats = { ok: true, orderCount, customerCount };
  } catch (err) { dbStats = { ok: false, error: String(err) }; }

  return NextResponse.json({ envCheck, boxtalV1, boxtalV3Token, boxtalV3Order, dbStats });
}
