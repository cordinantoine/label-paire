import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  // ── Check env vars (masked) ──────────────────────────────────────────────
  const envCheck = {
    BOXTAL_LOGIN:        process.env.BOXTAL_LOGIN    ? `✅ ${process.env.BOXTAL_LOGIN.slice(0, 4)}...` : "❌ MANQUANT",
    BOXTAL_PASSWORD:     process.env.BOXTAL_PASSWORD ? "✅ défini" : "❌ MANQUANT",
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? "✅ défini" : "❌ MANQUANT",
    SENDER_EMAIL:        process.env.SENDER_EMAIL    ?? "(défaut: commandes@labelpaire.fr)",
    SENDER_POSTAL_CODE:  process.env.SENDER_POSTAL_CODE ?? "(défaut: 78400)",
    SENDER_CITY:         process.env.SENDER_CITY        ?? "(défaut: Chatou)",
  };

  // ── Test Boxtal cotation ─────────────────────────────────────────────────
  let boxtalTest: { ok: boolean; status?: number; error?: string; preview?: string } = { ok: false };
  try {
    const login    = process.env.BOXTAL_LOGIN    ?? "";
    const password = process.env.BOXTAL_PASSWORD ?? "";
    const auth     = Buffer.from(`${login}:${password}`).toString("base64");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const collecte = tomorrow.toISOString().split("T")[0];

    const url =
      `https://www.envoimoinscher.com/api/v1/cotation?` +
      `expediteur.type=entreprise&expediteur.pays=FR` +
      `&expediteur.code_postal=${process.env.SENDER_POSTAL_CODE ?? "78400"}` +
      `&expediteur.ville=${encodeURIComponent(process.env.SENDER_CITY ?? "Chatou")}` +
      `&destinataire.type=particulier&destinataire.pays=FR` +
      `&destinataire.code_postal=75001&destinataire.ville=Paris` +
      `&colis_0.poids=0.5&colis_0.longueur=30&colis_0.largeur=20&colis_0.hauteur=5` +
      `&code_contenu=40110&collecte=${collecte}`;

    const res = await fetch(url, {
      headers: { Authorization: `Basic ${auth}`, "Api-Version": "1.3.7" },
    });
    const text = await res.text();
    boxtalTest = {
      ok: res.ok || res.status === 400,
      status: res.status,
      preview: text.slice(0, 300),
    };
  } catch (err) {
    boxtalTest = { ok: false, error: String(err) };
  }

  // ── DB stats ─────────────────────────────────────────────────────────────
  let dbStats = null;
  try {
    const [orderCount, customerCount, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.customer.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: { select: { email: true, nom: true } } },
      }),
    ]);
    dbStats = {
      ok: true,
      orderCount,
      customerCount,
      recentOrders: recentOrders.map((o) => ({
        id: o.id.slice(0, 30) + "…",
        createdAt: o.createdAt,
        shippingMethod: o.shippingMethod,
        shippingStatus: o.shippingStatus,
        customer: o.customer,
      })),
    };
  } catch (err) {
    dbStats = { ok: false, error: String(err) };
  }

  return NextResponse.json({ envCheck, boxtalTest, dbStats });
}
