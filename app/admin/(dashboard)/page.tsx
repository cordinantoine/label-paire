import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
  }).format(date);
}

const SHIPPING_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  label_created: { label: "Étiquette créée", color: "text-yellow-400 bg-yellow-400/10" },
  shipped:       { label: "Expédié",         color: "text-blue-400 bg-blue-400/10" },
  delivered:     { label: "Livré",            color: "text-green-400 bg-green-400/10" },
};

export default async function AdminDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Requêtes parallèles
  const [allOrders, monthOrders, expenses, expensesMonth, shippingCounts, recentOrders] =
    await Promise.all([
      prisma.order.aggregate({
        where: { paymentStatus: "paid" },
        _sum: { amountTotal: true, shippingCost: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { paymentStatus: "paid", createdAt: { gte: startOfMonth } },
        _sum: { amountTotal: true },
        _count: true,
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.order.groupBy({
        by: ["shippingStatus"],
        _count: { id: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: { select: { nom: true, email: true } } },
      }),
    ]);

  const totalRevenue = allOrders._sum.amountTotal ?? 0;
  const totalShipping = allOrders._sum.shippingCost ?? 0;
  const totalExpenses = expenses._sum.amount ?? 0;
  const totalOrders = allOrders._count;
  const monthRevenue = monthOrders._sum.amountTotal ?? 0;
  const monthOrderCount = monthOrders._count;
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const netMargin = totalRevenue - totalShipping - totalExpenses;
  const monthExpenses = expensesMonth._sum.amount ?? 0;
  const monthMargin = monthRevenue - monthExpenses;

  const shippingMap = Object.fromEntries(
    shippingCounts.map((s) => [s.shippingStatus, s._count.id])
  );

  // Produit le plus vendu
  const allOrdersItems = await prisma.order.findMany({
    select: { items: true },
    where: { paymentStatus: "paid" },
  });
  const slugCounts: Record<string, { nom: string; qty: number }> = {};
  for (const order of allOrdersItems) {
    const items = order.items as { slug: string; nom: string; quantity: number }[];
    for (const item of items) {
      if (!slugCounts[item.slug]) slugCounts[item.slug] = { nom: item.nom, qty: 0 };
      slugCounts[item.slug].qty += item.quantity;
    }
  }
  const topProduct = Object.values(slugCounts).sort((a, b) => b.qty - a.qty)[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d&apos;ensemble de votre activité</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="CA total" value={formatEur(totalRevenue)} sub="toutes commandes" />
        <StatCard label="CA ce mois" value={formatEur(monthRevenue)} sub={`${monthOrderCount} commande${monthOrderCount > 1 ? "s" : ""}`} />
        <StatCard label="Panier moyen" value={formatEur(avgOrder)} sub={`sur ${totalOrders} commandes`} />
        <StatCard label="Marge nette totale" value={formatEur(netMargin)} sub={`après frais & expéditions`} accent="text-[#a9dbf1]" />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Marge nette ce mois" value={formatEur(monthMargin)} sub={`dépenses: ${formatEur(monthExpenses)}`} accent="text-[#a9dbf1]" />
        <StatCard label="Dépenses totales" value={formatEur(totalExpenses)} sub="achats & frais" accent="text-red-400" />
        <StatCard label="Commandes ce mois" value={String(monthOrderCount)} sub="commandes payées" />
        {topProduct && (
          <StatCard label="Top produit" value={topProduct.nom} sub={`${topProduct.qty} unité${topProduct.qty > 1 ? "s" : ""} vendues`} />
        )}
      </div>

      {/* Expéditions */}
      <div className="bg-[#111] border border-white/[0.08] rounded-xl p-6">
        <h2 className="font-semibold text-white mb-4">Suivi des expéditions</h2>
        <div className="grid grid-cols-3 gap-4">
          {(["label_created", "shipped", "delivered"] as const).map((status) => {
            const info = SHIPPING_STATUS_LABELS[status];
            return (
              <div key={status} className="text-center">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${info.color}`}>
                  {info.label}
                </div>
                <p className="text-2xl font-bold text-white font-playfair">
                  {shippingMap[status] ?? 0}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Commandes récentes */}
      <div className="bg-[#111] border border-white/[0.08] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Commandes récentes</h2>
          <Link
            href="/admin/commandes"
            className="text-sm text-[#ff9ed5] hover:underline"
          >
            Voir tout →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-white/[0.06]">
                <th className="text-left pb-3 font-normal">Date</th>
                <th className="text-left pb-3 font-normal">Client</th>
                <th className="text-left pb-3 font-normal">Montant</th>
                <th className="text-left pb-3 font-normal">Statut</th>
                <th className="text-left pb-3 font-normal"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {recentOrders.map((order) => {
                const shipping = SHIPPING_STATUS_LABELS[order.shippingStatus];
                return (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 text-gray-400">{formatDate(order.createdAt)}</td>
                    <td className="py-3">
                      <p className="text-white">{order.customer.nom}</p>
                      <p className="text-gray-500 text-xs">{order.customer.email}</p>
                    </td>
                    <td className="py-3 text-[#ff9ed5] font-medium">
                      {formatEur(order.amountTotal)}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${shipping?.color ?? ""}`}>
                        {shipping?.label ?? order.shippingStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/admin/commandes/${order.id}`}
                        className="text-gray-500 hover:text-[#ff9ed5] transition-colors text-xs"
                      >
                        Détail →
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-600">
                    Aucune commande pour le moment
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent = "text-[#ff9ed5]",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-[#111] border border-white/[0.08] rounded-xl p-5">
      <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">{label}</p>
      <p className={`font-playfair text-2xl font-bold ${accent} leading-tight`}>{value}</p>
      {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
    </div>
  );
}
