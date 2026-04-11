import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import TrackingForm from "./TrackingForm";

function formatEur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const SHIPPING_STATUS: Record<string, { label: string; color: string }> = {
  label_created: { label: "Étiquette créée", color: "text-yellow-400 bg-yellow-400/10" },
  shipped:       { label: "Expédié",         color: "text-blue-400 bg-blue-400/10" },
  delivered:     { label: "Livré",            color: "text-green-400 bg-green-400/10" },
};

export default async function CommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { customer: true },
  });

  if (!order) notFound();

  const items = order.items as {
    slug: string;
    nom: string;
    prix: number;
    quantity: number;
    poids: number;
  }[];

  const shipping = SHIPPING_STATUS[order.shippingStatus];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/commandes"
            className="text-gray-500 hover:text-[#ff9ed5] text-sm transition-colors"
          >
            ← Retour aux commandes
          </Link>
          <h1 className="font-playfair text-2xl font-bold text-white mt-2">
            Commande
          </h1>
          <p className="text-gray-500 text-xs mt-1 font-mono">{order.id}</p>
        </div>
        <div className="text-right">
          <p className="font-playfair text-2xl font-bold text-[#ff9ed5]">
            {formatEur(order.amountTotal)}
          </p>
          <p className="text-gray-500 text-sm mt-1">{formatDate(order.createdAt)}</p>
          <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${shipping?.color ?? ""}`}>
            {shipping?.label ?? order.shippingStatus}
          </span>
        </div>
      </div>

      {/* Client */}
      <Section title="Informations client">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Nom" value={order.customer.nom} />
          <Field label="Email" value={order.customer.email} />
          <Field label="Adresse" value={order.customer.adresse} />
          <Field label="Ville" value={`${order.customer.cp} ${order.customer.ville}`} />
          <Field label="Pays" value={order.customer.pays} />
        </div>
      </Section>

      {/* Articles */}
      <Section title="Articles commandés">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-white/[0.06] text-xs">
              <th className="text-left pb-3 font-normal">Produit</th>
              <th className="text-center pb-3 font-normal">Qté</th>
              <th className="text-right pb-3 font-normal">P.U.</th>
              <th className="text-right pb-3 font-normal">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {items.map((item, i) => (
              <tr key={i}>
                <td className="py-3 text-white">{item.nom}</td>
                <td className="py-3 text-center text-gray-400">{item.quantity}</td>
                <td className="py-3 text-right text-gray-400">{formatEur(item.prix * 100)}</td>
                <td className="py-3 text-right text-[#ff9ed5]">
                  {formatEur(item.prix * item.quantity * 100)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/[0.08]">
              <td colSpan={3} className="pt-3 text-gray-500 text-xs">Total commande</td>
              <td className="pt-3 text-right font-bold text-white">
                {formatEur(order.amountTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </Section>

      {/* Livraison */}
      <Section title="Livraison">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Mode" value={order.shippingMethod || "—"} />
          <Field label="ID méthode" value={order.shippingMethodId || "—"} />
        </div>
      </Section>

      {/* Suivi expédition */}
      <Section title="Suivi expédition">
        <TrackingForm
          orderId={order.id}
          currentTracking={order.trackingNumber ?? ""}
          currentStatus={order.shippingStatus}
        />
      </Section>

      {/* Paiement */}
      {order.paymentIntentId && (
        <Section title="Paiement">
          <div className="text-sm">
            <Field label="Payment Intent" value={order.paymentIntentId} />
            <a
              href={`https://dashboard.stripe.com/payments/${order.paymentIntentId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-xs text-[#ff9ed5] hover:underline"
            >
              Voir dans Stripe Dashboard →
            </a>
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#111] border border-white/[0.08] rounded-xl p-6">
      <h2 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider text-gray-400">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className="text-white">{value}</p>
    </div>
  );
}
