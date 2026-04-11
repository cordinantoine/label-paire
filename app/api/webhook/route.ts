import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { createBoxtalOrder } from "@/lib/boxtalOrder";
import { prisma } from "@/lib/prisma";
import { getProductBySlug } from "@/lib/products";
import { orderConfirmationHtml, orderConfirmationText } from "@/lib/emails/orderConfirmation";
import { syncBrevoContact } from "@/lib/brevo";

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

  // Parse items depuis les métadonnées Stripe
  let rawItems: { slug: string; quantity: number; poids: number }[] = [];
  try {
    rawItems = JSON.parse(meta.items ?? "[]");
  } catch {
    rawItems = [];
  }

  // Enrichir les items avec nom et prix depuis le catalogue produits
  const enrichedItems = rawItems.map((item) => {
    const product = getProductBySlug(item.slug);
    return {
      slug: item.slug,
      nom: product?.nom ?? item.slug,
      prix: product?.prix ?? 0,
      quantity: item.quantity,
      poids: item.poids,
    };
  });

  // Calcul du poids total pour l'expédition
  const weightKg = Math.max(
    rawItems.reduce((acc, i) => acc + i.poids * i.quantity, 0),
    0.1
  );

  // ── Sauvegarde en base de données ──────────────────────────────────────────

  try {
    // Upsert customer (un client peut commander plusieurs fois)
    const hasConsent = meta.marketing_consent === "true";

    const customer = await prisma.customer.upsert({
      where: { email: meta.email ?? "" },
      update: {
        nom:     meta.nom     ?? "",
        adresse: meta.adresse ?? "",
        ville:   meta.ville   ?? "",
        cp:      meta.cp      ?? "",
        pays:    meta.pays    ?? "FR",
        // Ne révoquer le consentement que si explicitement false (pas si absent)
        ...(hasConsent ? { marketingConsent: true } : {}),
      },
      create: {
        email:           meta.email   ?? "",
        nom:             meta.nom     ?? "",
        adresse:         meta.adresse ?? "",
        ville:           meta.ville   ?? "",
        cp:              meta.cp      ?? "",
        pays:            meta.pays    ?? "FR",
        marketingConsent: hasConsent,
      },
    });

    // Créer la commande (idempotent — skip si déjà existante)
    await prisma.order.upsert({
      where: { id: session.id },
      update: {},
      create: {
        id:              session.id,
        amountTotal:     session.amount_total ?? 0,
        currency:        session.currency ?? "eur",
        paymentStatus:   session.payment_status ?? "paid",
        items:           enrichedItems,
        shippingMethod:  meta.shipping_method   ?? "",
        shippingMethodId: meta.shipping_method_id ?? "",
        shippingCost:    0, // will be set below if known
        paymentIntentId: typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
        customerId: customer.id,
      },
    });

    console.log(`✅ DB — Commande ${session.id} sauvegardée`);
  } catch (err) {
    console.error("❌ DB — Erreur sauvegarde commande:", err);
  }

  // ── Email de confirmation commande ────────────────────────────────────────

  if (meta.email) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Label Paire <commandes@labelpaire.fr>",
        to:   meta.email,
        subject: "Ta commande Label Paire est confirmée ✓",
        html: orderConfirmationHtml({
          nom:            meta.nom ?? "Client",
          email:          meta.email,
          items:          enrichedItems,
          shippingMethod: meta.shipping_method ?? "",
          amountTotal:    session.amount_total ?? 0,
          orderId:        session.id,
        }),
        text: orderConfirmationText({
          nom:            meta.nom ?? "Client",
          email:          meta.email,
          items:          enrichedItems,
          shippingMethod: meta.shipping_method ?? "",
          amountTotal:    session.amount_total ?? 0,
          orderId:        session.id,
        }),
      });
      console.log(`✅ Email confirmation envoyé à ${meta.email}`);
    } catch (err) {
      console.error("❌ Erreur envoi email confirmation:", err);
    }
  }

  // ── Sync Brevo ────────────────────────────────────────────────────────────

  await syncBrevoContact({
    email:           meta.email    ?? "",
    nom:             meta.nom      ?? "",
    ville:           meta.ville,
    pays:            meta.pays,
    marketingConsent: meta.marketing_consent === "true",
    orderTotal:      session.amount_total ?? 0,
    orderId:         session.id,
  });

  // ── Création de la commande Boxtal ────────────────────────────────────────

  const boxtalResult = await createBoxtalOrder({
    orderReference:      session.id,
    recipientName:       meta.nom      ?? "Client",
    recipientEmail:      meta.email    ?? "",
    recipientStreet:     meta.adresse  ?? "",
    recipientCity:       meta.ville    ?? "",
    recipientPostalCode: meta.cp       ?? "",
    recipientCountry:    meta.pays     ?? "FR",
    weightKg,
    network:             meta.service_point_network ?? "",
    parcelPointCode:     meta.service_point_id      || undefined,
  });

  if (boxtalResult.ok) {
    console.log(`✅ Boxtal order created — code: ${boxtalResult.orderCode}`);
    try {
      await prisma.order.update({
        where: { id: session.id },
        data: { shippingStatus: "label_created" },
      });
    } catch (err) {
      console.error("❌ DB — Erreur mise à jour shippingStatus:", err);
    }
  } else {
    console.error(`❌ Boxtal order error: ${boxtalResult.error}`);
  }
}
