"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCartStore } from "@/lib/cartStore";
import { useT } from "@/hooks/useT";
import { tr } from "@/lib/i18n";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const totalItems = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
  const { t, lang, setLang } = useT();

  return (
    <header className="sticky top-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/Logo Label Paire rond.png"
            alt="Label Paire"
            width={44}
            height={44}
            className="rounded-full"
          />
          <span className="font-playfair text-xl font-semibold tracking-tight text-white">Label Paire</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-inter font-medium text-gray-400">
          <Link href="/" className="hover:text-[#ff9ed5] transition-colors">{t(tr.nav_home)}</Link>
          <Link href="/boutique" className="hover:text-[#ff9ed5] transition-colors">{t(tr.nav_shop)}</Link>
          <Link href="/blog" className="hover:text-[#ff9ed5] transition-colors">{t(tr.nav_blog)}</Link>
          <Link href="/contact" className="hover:text-[#ff9ed5] transition-colors">{t(tr.nav_contact)}</Link>
        </nav>

        {/* Right side: lang switcher + cart + hamburger */}
        <div className="flex items-center gap-3">

          {/* Language switcher */}
          <div className="flex items-center rounded-lg overflow-hidden border border-white/10 text-xs font-semibold">
            <button
              onClick={() => setLang("fr")}
              className={`px-2.5 py-1.5 transition-colors ${
                lang === "fr"
                  ? "bg-[#ff9ed5] text-[#0a0a0a]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              FR
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1.5 transition-colors ${
                lang === "en"
                  ? "bg-[#ff9ed5] text-[#0a0a0a]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              EN
            </button>
          </div>

          {/* Cart */}
          <Link
            href="/panier"
            className="relative flex items-center gap-1.5 bg-[#ff9ed5] text-[#0a0a0a] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#ffb3de] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {t(tr.nav_cart)}
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#0a0a0a] text-[#ff9ed5] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-[#ff9ed5]/50">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-black/95 border-t border-white/[0.08] px-4 py-4 flex flex-col gap-4 text-sm font-medium text-gray-400">
          <Link href="/" onClick={() => setMenuOpen(false)} className="hover:text-[#ff9ed5]">{t(tr.nav_home)}</Link>
          <Link href="/boutique" onClick={() => setMenuOpen(false)} className="hover:text-[#ff9ed5]">{t(tr.nav_shop)}</Link>
          <Link href="/blog" onClick={() => setMenuOpen(false)} className="hover:text-[#ff9ed5]">{t(tr.nav_blog)}</Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)} className="hover:text-[#ff9ed5]">{t(tr.nav_contact)}</Link>
        </div>
      )}
    </header>
  );
}
