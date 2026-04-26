import Link from "next/link";

export const metadata = { title: "Admin — Label Paire" };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0] font-inter">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-white/[0.08] px-6 py-3 flex items-center justify-between">
        <span className="font-playfair text-lg font-semibold text-white tracking-wide">
          Label Paire <span className="text-[#ff9ed5] text-sm font-inter font-normal ml-2">Admin</span>
        </span>
        <nav className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/admin" className="hover:text-[#ff9ed5] transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/commandes" className="hover:text-[#ff9ed5] transition-colors">
            Commandes
          </Link>
          <Link href="/admin/produits" className="hover:text-[#ff9ed5] transition-colors">
            Produits
          </Link>
          <Link href="/admin/livraison" className="hover:text-[#ff9ed5] transition-colors">
            Livraison
          </Link>
          <Link href="/admin/depenses" className="hover:text-[#ff9ed5] transition-colors">
            Dépenses
          </Link>
          <Link href="/admin/videos" className="hover:text-[#ff9ed5] transition-colors">
            Vidéos
          </Link>
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="hover:text-[#ff9ed5] transition-colors cursor-pointer"
            >
              Déconnexion
            </button>
          </form>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
