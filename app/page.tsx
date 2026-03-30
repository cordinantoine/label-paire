"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import { useState } from "react";

const featuredSlugs = ["kit-reparation-premium", "kit-reparation", "la-belle-mousse", "spray-impermeabilisant"];
const featuredProducts = featuredSlugs.map((s) => products.find((p) => p.slug === s)!).filter(Boolean);

const stats = [
  { label: "clients satisfaits", target: 500, prefix: "+", suffix: "" },
  { label: "Views", target: 100, prefix: "+", suffix: "M" },
  { label: "Abonnés", target: 100, prefix: "+", suffix: "k" },
  { label: "avis clients", target: 4.9, prefix: "", suffix: "★" },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <>
      {/* Hero */}
      <section
        className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
        }}
      >
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "#ff9ed5", filter: "blur(80px)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "#a9dbf1", filter: "blur(80px)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl"
        >
          <span className="inline-block text-[#ff9ed5] text-sm font-medium tracking-widest uppercase mb-4">
            L&apos;entretien à la hauteur de vos sneakers
          </span>
          <h1 className="font-playfair text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Vos sneakers méritent le meilleur
          </h1>
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto">
            Des produits d&apos;entretien premium pour garder chaque paire impeccable.
            Nettoyage, protection, réparation — tout ce dont vous avez besoin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/boutique"
              className="bg-[#ff9ed5] text-[#1a1a1a] font-semibold px-8 py-3.5 rounded-lg hover:bg-[#ffb3de] transition-colors text-sm"
            >
              Découvrir la boutique
            </Link>
            <Link
              href="/produit/kit-reparation-premium"
              className="border border-white/30 text-white font-medium px-8 py-3.5 rounded-lg hover:bg-white/10 transition-colors text-sm"
            >
              Notre bestseller →
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="bg-[#0d0d0d] border-y border-white/[0.06] py-14">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div key={stat.label}>
              <div className={`font-playfair text-4xl font-bold ${i % 2 === 0 ? "text-[#ff9ed5]" : "text-[#a9dbf1]"}`}>
                <AnimatedCounter target={stat.target} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-4xl font-bold text-white">Nos bestsellers</h2>
          <p className="text-gray-500 mt-3 text-base">Les produits préférés de notre communauté</p>
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
            Voir tous les produits →
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[#1a1a1a] py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-playfair text-3xl font-bold text-white mb-3">Restez informé</h2>
          <p className="text-gray-400 text-sm mb-8">
            Nouveautés, conseils d&apos;entretien et offres exclusives — directement dans votre boîte mail.
          </p>
          {subscribed ? (
            <p className="text-[#ff9ed5] font-medium">Merci ! Vous êtes bien inscrit(e) !</p>
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
                placeholder="votre@email.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#ff9ed5]"
              />
              <button
                type="submit"
                className="bg-[#ff9ed5] text-[#1a1a1a] font-semibold px-6 py-3 rounded-lg hover:bg-[#ffb3de] transition-colors text-sm whitespace-nowrap"
              >
                S&apos;inscrire
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
