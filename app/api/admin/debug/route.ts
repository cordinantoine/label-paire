import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  // ── OAuth token ──────────────────────────────────────────────────────────
  let tokenValue = "";
  let tokenStatus = 0;
  try {
    const login = (process.env.BOXTAL_LOGIN    ?? "").trim();
    const pass  = (process.env.BOXTAL_PASSWORD ?? "").trim();
    const auth  = Buffer.from(`${login}:${pass}`).toString("base64");
    const res = await fetch("https://api.boxtal.com/iam/account-app/token", {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Basic ${auth}` },
      body: "",
    });
    tokenStatus = res.status;
    if (res.ok) {
      const data = await res.json();
      tokenValue = data.accessToken ?? "";
    }
  } catch { /* ignore */ }

  if (!tokenValue) {
    return NextResponse.json({ error: `Impossible d'obtenir un token OAuth v3 (HTTP ${tokenStatus})` });
  }

  // ── Lister les offres disponibles pour Paris → Chatou ────────────────────
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const collecte = tomorrow.toISOString().split("T")[0];

  let offers: unknown[] = [];
  let offersStatus = 0;
  let offersRaw = "";
  try {
    const params = new URLSearchParams({
      "fromAddress.countryIsoCode":   "FR",
      "fromAddress.postalCode":       "78400",
      "fromAddress.city":             "Chatou",
      "toAddress.countryIsoCode":     "FR",
      "toAddress.postalCode":         "75001",
      "toAddress.city":               "Paris",
      "packages[0].type":             "PARCEL",
      "packages[0].weight":           "0.3",
      "packages[0].length":           "30",
      "packages[0].width":            "20",
      "packages[0].height":           "5",
      "packages[0].value":            "30",
      "expectedTakingOverDate":       collecte,
    });
    const res = await fetch(`https://api.boxtal.com/shipping/v3.1/shipping-offer?${params}`, {
      headers: { Authorization: `Bearer ${tokenValue}`, Accept: "application/json" },
    });
    offersStatus = res.status;
    offersRaw = await res.text();
    if (res.ok) {
      const data = JSON.parse(offersRaw);
      const list = data.content ?? data ?? [];
      offers = (Array.isArray(list) ? list : []).map((o: Record<string, unknown>) => ({
        code:    o.shippingOfferCode ?? o.code,
        carrier: (o.carrier as Record<string,unknown>)?.label ?? o.carrier,
        label:   o.label ?? o.name,
        price:   o.price ?? o.totalPrice,
      }));
    }
  } catch { /* ignore */ }

  // ── DB stats ─────────────────────────────────────────────────────────────
  let dbStats = { orderCount: 0, customerCount: 0 };
  try {
    dbStats = {
      orderCount:    await prisma.order.count(),
      customerCount: await prisma.customer.count(),
    };
  } catch { /* ignore */ }

  return NextResponse.json({
    tokenOk: !!tokenValue,
    offersStatus,
    offersCount: offers.length,
    offers,
    offersRawPreview: offersRaw.slice(0, 500),
    dbStats,
  });
}
