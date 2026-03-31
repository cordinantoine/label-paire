"use client";

import Link from "next/link";
import Image from "next/image";
import { useT } from "@/hooks/useT";
import { tr } from "@/lib/i18n";

export default function Footer() {
  const { t } = useT();

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
            {t(tr.footer_desc)}
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="font-playfair text-base font-semibold mb-4">{t(tr.footer_nav)}</h3>
          <nav className="flex flex-col gap-3 text-sm text-gray-400">
            <Link href="/"         className="hover:text-[#ff9ed5] transition-colors">{t(tr.nav_home)}</Link>
            <Link href="/boutique" className="hover:text-[#ff9ed5] transition-colors">{t(tr.nav_shop)}</Link>
            <Link href="/contact"  className="hover:text-[#ff9ed5] transition-colors">{t(tr.nav_contact)}</Link>
            <Link href="/panier"   className="hover:text-[#ff9ed5] transition-colors">{t(tr.nav_cart)}</Link>
          </nav>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-playfair text-base font-semibold mb-4">{t(tr.nav_contact)}</h3>
          <div className="flex flex-col gap-3 text-sm text-gray-400">
            <p>contact@labelpaire.fr</p>
            <p>{t(tr.footer_ship)}</p>
            <p>{t(tr.footer_support)}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 py-5 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} Label Paire — {t(tr.footer_rights)}
      </div>
    </footer>
  );
}
