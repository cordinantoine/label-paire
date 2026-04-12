import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/admin-auth";
import { createBoxtalOrder } from "@/lib/boxtalOrder";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  const payload = token ? await verifyJwt(token) : null;
  if (!payload) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const result = await createBoxtalOrder({
    orderReference: `TEST-${Date.now()}`,
    recipientName: "Jean Dupont",
    recipientEmail: "test@labelpaire.fr",
    recipientStreet: "10 Rue de Rivoli",
    recipientCity: "Paris",
    recipientPostalCode: "75001",
    recipientCountry: "FR",
    weightKg: 0.3,
    network: "",  // livraison domicile (COPR)
  });

  return NextResponse.json(result);
}
