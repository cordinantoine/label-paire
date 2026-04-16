"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";
import ProductCard from "@/components/ProductCard";
import { products, type Product } from "@/lib/products";
import { useState, useEffect } from "react";
import { useT } from "@/hooks/useT";
import { tr } from "@/lib/i18n";

const featuredSlugs = ["kit-reparation-premium", "kit-reparation", "la-belle-mousse", "spray-impermeabilisant"];
const staticFeatured = featuredSlugs.map((s) => products.find((p) => p.slug === s)!).filter(Boolean);

// ─── Platform badge icons ─────────────────────────────────────────────────────
function YouTubeBadge() {
  return (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#FF0000] shadow-[0_0_12px_rgba(255,0,0,0.5)]">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
        <path d="M21.8 8a2.75 2.75 0 0 0-1.93-1.95C18.2 5.6 12 5.6 12 5.6s-6.2 0-7.87.45A2.75 2.75 0 0 0 2.2 8 28.8 28.8 0 0 0 1.75 12a28.8 28.8 0 0 0 .45 4 2.75 2.75 0 0 0 1.93 1.95C5.8 18.4 12 18.4 12 18.4s6.2 0 7.87-.45A2.75 2.75 0 0 0 21.8 16a28.8 28.8 0 0 0 .45-4 28.8 28.8 0 0 0-.45-4zM9.75 15V9l5.75 3-5.75 3z" />
      </svg>
    </span>
  );
}

function TikTokBadge() {
  return (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#010101] border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.1)]">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.23 8.23 0 0 0 4.83 1.56V6.8a4.85 4.85 0 0 1-1.06-.11z" />
      </svg>
    </span>
  );
}

function GoogleBadge() {
  return (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.2)]">
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    </span>
  );
}

function ClientsBadge() {
  return (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#ff9ed5] shadow-[0_0_12px_rgba(255,158,213,0.5)]">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>
  );
}

// ─── Ticker items ─────────────────────────────────────────────────────────────
const tickerItemsFr = [
  { icon: "▶", text: "100M VUES" },
  { icon: "◆", text: "500+ CLIENTS" },
  { icon: "★", text: "AVIS 4.9" },
  { icon: "◆", text: "ENTREPRISE FRANÇAISE" },
  { icon: "◆", text: "LABEL PAIRE" },
  { icon: "▶", text: "100k ABONNÉS" },
  { icon: "◆", text: "LIVRAISON 48H" },
  { icon: "★", text: "MADE IN FRANCE" },
];
const tickerItemsEn = [
  { icon: "▶", text: "100M VIEWS" },
  { icon: "◆", text: "500+ CUSTOMERS" },
  { icon: "★", text: "RATED 4.9" },
  { icon: "◆", text: "FRENCH BRAND" },
  { icon: "◆", text: "LABEL PAIRE" },
  { icon: "▶", text: "100k FOLLOWERS" },
  { icon: "◆", text: "SHIPS IN 48H" },
  { icon: "★", text: "MADE IN FRANCE" },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(staticFeatured);
  const { t, lang } = useT();

  useEffect(() => {
    fetch("/api/product-badges")
      .then((r) => r.json())
      .then((badgeMap: Record<string, string | null>) => {
        setFeaturedProducts(
          staticFeatured.map((p) =>
            Object.prototype.hasOwnProperty.call(badgeMap, p.slug)
              ? { ...p, badge: badgeMap[p.slug] }
              : p
          )
        );
      })
      .catch(() => {});
  }, []);

  const tickerItems = lang === "fr" ? tickerItemsFr : tickerItemsEn;

  const stats = [
    {
      label: t(tr.home_stat_clients),
      target: 500, prefix: "+", suffix: "",
      badge: <ClientsBadge />,
      color: "text-[#ff9ed5]",
    },
    {
      label: t(tr.home_stat_views),
      target: 100, prefix: "+", suffix: "M",
      badge: <YouTubeBadge />,
      color: "text-[#FF4444]",
    },
    {
      label: t(tr.home_stat_followers),
      target: 100, prefix: "+", suffix: "k",
      badge: <TikTokBadge />,
      color: "text-[#a9dbf1]",
    },
    {
      label: t(tr.home_stat_reviews),
      target: 4.9, prefix: "", suffix: "★",
      badge: <GoogleBadge />,
      color: "text-[#FBBC05]",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section
        className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)" }}
      >
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "#ff9ed5", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "#a9dbf1", filter: "blur(80px)" }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl"
        >
          <span className="inline-block text-[#ff9ed5] text-sm font-medium tracking-widest uppercase mb-4">
            {t(tr.home_tagline)}
          </span>
          <h1 className="font-playfair text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            {t(tr.home_hero_title)}
          </h1>
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto">
            {t(tr.home_hero_sub)}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/boutique"
              className="bg-[#ff9ed5] text-[#1a1a1a] font-semibold px-8 py-3.5 rounded-lg hover:bg-[#ffb3de] transition-colors text-sm"
            >
              {t(tr.home_cta_shop)}
            </Link>
            <Link
              href="/produit/kit-reparation-premium"
              className="border border-white/30 text-white font-medium px-8 py-3.5 rounded-lg hover:bg-white/10 transition-colors text-sm"
            >
              {t(tr.home_cta_bestseller)}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="bg-[#0d0d0d] border-y border-white/[0.06] py-14">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-2">
              {stat.badge}
              <div className={`font-playfair text-4xl font-bold ${stat.color}`}>
                <AnimatedCounter target={stat.target} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-4xl font-bold text-white">{t(tr.home_bestsellers_title)}</h2>
          <p className="text-gray-500 mt-3 text-base">{t(tr.home_bestsellers_sub)}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/boutique"
            className="inline-block border border-[#ff9ed5]/40 text-[#ff9ed5] font-medium px-8 py-3 rounded-lg hover:bg-[#ff9ed5]/10 transition-colors text-sm"
          >
            {t(tr.home_see_all)}
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[#1a1a1a] py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-playfair text-3xl font-bold text-white mb-3">{t(tr.home_newsletter_title)}</h2>
          <p className="text-gray-400 text-sm mb-8">{t(tr.home_newsletter_sub)}</p>
          {subscribed ? (
            <p className="text-[#ff9ed5] font-medium">{t(tr.home_newsletter_success)}</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email) setSubscribed(true);
              }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder={t(tr.home_newsletter_placeholder)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#ff9ed5]"
              />
              <button
                type="submit"
                className="bg-[#ff9ed5] text-[#1a1a1a] font-semibold px-6 py-3 rounded-lg hover:bg-[#ffb3de] transition-colors text-sm whitespace-nowrap"
              >
                {t(tr.home_newsletter_cta)}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ─── Infinite ticker band ─────────────────────────────────────── */}
      <div className="bg-[#ff9ed5] overflow-hidden py-3 border-y border-[#ffb3de]">
        <div className="marquee-track flex whitespace-nowrap w-max">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 px-6 text-[#0a0a0a] font-bold text-sm tracking-widest uppercase">
              <span className="text-[#0a0a0a]/50 text-xs">{item.icon}</span>
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
