import { prisma } from "@/lib/prisma";
import Link from "next/link";

const PAGE_SIZE = 20;

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

export default async function CommandesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { nom: true, email: true, ville: true, pays: true } } },
    }),
    prisma.order.count(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-white">Commandes</h1>
          <p className="text-gray-500 text-sm mt-1">{total} commande{total > 1 ? "s" : ""} au total</p>
        </div>
      </div>

      <div className="bg-[#111] border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-white/[0.06] text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-4 font-normal">Date</th>
                <th className="text-left px-6 py-4 font-normal">Client</th>
                <th className="text-left px-6 py-4 font-normal">Destination</th>
                <th className="text-left px-6 py-4 font-normal">Montant</th>
                <th className="text-left px-6 py-4 font-normal">Livraison</th>
                <th className="text-left px-6 py-4 font-normal">Expédition</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {orders.map((order) => {
                const shipping = SHIPPING_STATUS[order.shippingStatus];
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{order.customer.nom}</p>
                      <p className="text-gray-500 text-xs">{order.customer.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {order.customer.ville}, {order.customer.pays}
                    </td>
                    <td className="px-6 py-4 text-[#ff9ed5] font-medium whitespace-nowrap">
                      {formatEur(order.amountTotal)}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs max-w-[140px] truncate">
                      {order.shippingMethod || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${shipping?.color ?? ""}`}>
                        {shipping?.label ?? order.shippingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/commandes/${order.id}`}
                        className="text-gray-500 hover:text-[#ff9ed5] transition-colors text-xs whitespace-nowrap"
                      >
                        Voir →
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-600">
                    Aucune commande pour le moment
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">
            Page {page} sur {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/commandes?page=${page - 1}`}
                className="px-4 py-2 bg-[#111] border border-white/[0.08] rounded-lg text-gray-400 hover:text-white hover:border-white/20 transition-colors"
              >
                ← Précédent
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/commandes?page=${page + 1}`}
                className="px-4 py-2 bg-[#111] border border-white/[0.08] rounded-lg text-gray-400 hover:text-white hover:border-white/20 transition-colors"
              >
                Suivant →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
