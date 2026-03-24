import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/Logo Label Paire rond.png"
              alt="Label Paire"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-playfair text-lg font-semibold">Label Paire</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Des produits d&apos;entretien premium pour garder vos sneakers impeccables.
            Made in France, expédition 48h.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="font-playfair text-base font-semibold mb-4">Navigation</h3>
          <nav className="flex flex-col gap-3 text-sm text-gray-400">
            <Link href="/" className="hover:text-[#ff9ed5] transition-colors">Accueil</Link>
            <Link href="/boutique" className="hover:text-[#ff9ed5] transition-colors">Boutique</Link>
            <Link href="/contact" className="hover:text-[#ff9ed5] transition-colors">Contact</Link>
            <Link href="/panier" className="hover:text-[#ff9ed5] transition-colors">Panier</Link>
          </nav>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-playfair text-base font-semibold mb-4">Contact</h3>
          <div className="flex flex-col gap-3 text-sm text-gray-400">
            <p>contact@labelpaire.fr</p>
            <p>Expédition sous 48h ouvrées</p>
            <p>Service client disponible 7j/7</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 py-5 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} Label Paire — Tous droits réservés
      </div>
    </footer>
  );
}
