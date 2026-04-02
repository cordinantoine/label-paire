import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getProductBySlug } from "@/lib/products";

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
      apiVersion: "2026-02-25.clover",
    });

    const { items, email, nom, adresse, ville, cp, pays } = await req.json();

    const lineItems = items.map(
      (item: { nom: string; prix: number; quantity: number }) => ({
        price_data: {
          currency: "eur",
          product_data: { name: item.nom },
          unit_amount: Math.round(item.prix * 100),
        },
        quantity: item.quantity,
      })
    );

    // Build items metadata with weight for Sendcloud
    const itemsWithPoids = items.map(
      (item: { slug: string; quantity: number }) => {
        const product = getProductBySlug(item.slug);
        return { slug: item.slug, quantity: item.quantity, poids: product?.poids ?? 0.2 };
      }
    );

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      ...(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? { customer_email: email } : {}),
      line_items: lineItems,
      metadata: {
        nom:     nom     ?? "",
        email:   email   ?? "",
        adresse: adresse ?? "",
        ville:   ville   ?? "",
        cp:      cp      ?? "",
        pays:    pays    ?? "FR",
        items:   JSON.stringify(itemsWithPoids),
      },
      success_url: `${baseUrl}/commande/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/panier`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur Stripe" }, { status: 500 });
  }
}
