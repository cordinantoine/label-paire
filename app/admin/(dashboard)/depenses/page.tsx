import { prisma } from "@/lib/prisma";
import ExpenseForm from "./ExpenseForm";

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

const CATEGORIES: Record<string, string> = {
  stock:     "Stock",
  frais:     "Frais",
  marketing: "Marketing",
  autre:     "Autre",
};

const CATEGORY_COLORS: Record<string, string> = {
  stock:     "text-blue-400 bg-blue-400/10",
  frais:     "text-yellow-400 bg-yellow-400/10",
  marketing: "text-purple-400 bg-purple-400/10",
  autre:     "text-gray-400 bg-gray-400/10",
};

export default async function DepensesPage() {
  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({ orderBy: { date: "desc" } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
  ]);

  const totalAmount = total._sum.amount ?? 0;

  // Total par catégorie
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-white">Dépenses</h1>
          <p className="text-gray-500 text-sm mt-1">
            Total : <span className="text-red-400 font-medium">{formatEur(totalAmount)}</span>
          </p>
        </div>
      </div>

      {/* Stats par catégorie */}
      {Object.keys(byCategory).length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(byCategory).map(([cat, amount]) => (
            <div key={cat} className="bg-[#111] border border-white/[0.08] rounded-xl p-4">
              <span className={`text-xs px-2 py-1 rounded-full ${CATEGORY_COLORS[cat] ?? "text-gray-400 bg-gray-400/10"}`}>
                {CATEGORIES[cat] ?? cat}
              </span>
              <p className="text-white font-playfair text-xl font-bold mt-2">
                {formatEur(amount)}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Liste */}
        <div className="lg:col-span-2 bg-[#111] border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <h2 className="font-semibold text-white text-sm">Historique</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {expenses.map((expense) => (
              <div key={expense.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${CATEGORY_COLORS[expense.category] ?? "text-gray-400 bg-gray-400/10"}`}>
                    {CATEGORIES[expense.category] ?? expense.category}
                  </span>
                  <div>
                    <p className="text-white text-sm">{expense.description}</p>
                    <p className="text-gray-500 text-xs">{formatDate(expense.date)}</p>
                  </div>
                </div>
                <p className="text-red-400 font-medium text-sm whitespace-nowrap">
                  {formatEur(expense.amount)}
                </p>
              </div>
            ))}
            {expenses.length === 0 && (
              <div className="px-6 py-12 text-center text-gray-600 text-sm">
                Aucune dépense enregistrée
              </div>
            )}
          </div>
        </div>

        {/* Formulaire d'ajout */}
        <div className="bg-[#111] border border-white/[0.08] rounded-xl p-6">
          <h2 className="font-semibold text-white text-sm mb-4">Ajouter une dépense</h2>
          <ExpenseForm />
        </div>
      </div>
    </div>
  );
}
