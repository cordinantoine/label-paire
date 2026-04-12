import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/admin-auth";
import { getBoxtalToken } from "@/lib/boxtalToken";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  const payload = token ? await verifyJwt(token) : null;
  if (!payload) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const bearerToken = await getBoxtalToken();

  const res = await fetch("https://api.boxtal.com/shipping/v3.1/networks", {
    headers: { Authorization: `Bearer ${bearerToken}`, Accept: "application/json" },
  });

  const text = await res.text();
  return NextResponse.json({ status: res.status, body: text });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  const payload = token ? await verifyJwt(token) : null;
  if (!payload) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const bearerToken = await getBoxtalToken();

  const shipment = {
    orderReference: `TEST-${Date.now()}`,
    fromAddress: {
      company:        "Label Paire",
      contact:        "Label Paire",
      email:          "commandes@labelpaire.fr",
      phone:          "0600000000",
      street:         "9 Boulevard du Temple",
      city:           "Chatou",
      postalCode:     "78400",
      countryIsoCode: "FR",
    },
    toAddress: {
      contact:        "Jean Dupont",
      email:          "test@labelpaire.fr",
      street:         "10 Rue de Rivoli",
      city:           "Paris",
      postalCode:     "75001",
      countryIsoCode: "FR",
    },
    parcels: [
      { weight: 0.3, length: 30, width: 20, height: 5 },
    ],
    network: "CHRB",  // Chronopost home delivery
  };

  const body = { shipment };

  const res = await fetch("https://api.boxtal.com/shipping/v3.1/shipping-order", {
    method: "POST",
    headers: {
      Authorization:  `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
      Accept:         "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseText = await res.text();
  return NextResponse.json({ status: res.status, requestBody: body, responseBody: responseText });
}
