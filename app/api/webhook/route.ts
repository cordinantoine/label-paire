import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSendcloudParcel } from "@/lib/sendcloud";

// Disable body parsing — Stripe needs the raw body for signature verification
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
    apiVersion: "2026-02-25.clover",
  });

  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch (err: unknown) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handlePaymentSuccess(session);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(session: Stripe.Checkout.Session) {
  const meta = session.metadata ?? {};

  // Compute total weight from items stored in metadata
  let weightKg = 0;
  try {
    const items: { slug: string; quantity: number; poids: number }[] =
      JSON.parse(meta.items ?? "[]");
    weightKg = items.reduce((acc, i) => acc + i.poids * i.quantity, 0);
  } catch {
    weightKg = 0.5; // fallback
  }

  // Minimum weight for carriers
  if (weightKg < 0.1) weightKg = 0.1;

  const result = await createSendcloudParcel({
    name:        meta.nom      ?? "Client",
    address:     meta.adresse  ?? "",
    city:        meta.ville    ?? "",
    postalCode:  meta.cp       ?? "",
    country:     meta.pays     ?? "FR",
    email:       meta.email    ?? "",
    orderNumber: session.id,
    weightKg,
    requestLabel: false, // set to true to auto-generate label
  });

  if (result.ok) {
    console.log(`✅ Sendcloud parcel created — tracking: ${result.parcel.tracking_number}`);
  } else {
    console.error(`❌ Sendcloud error: ${result.error}`);
  }
}
