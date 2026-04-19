import Link from "next/link";
import type { Metadata } from "next";
import { blogPosts, categoryColors } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Le Mag — Conseils entretien sneakers | Label Paire",
  description:
    "Guides et conseils pour entretenir, nettoyer et protéger vos sneakers. Air Force 1, Jordan 1, baskets blanches — nos experts vous expliquent tout.",
  alternates: { canonical: "https://labelpaire.fr/blog" },
  openGraph: {
    title: "Le Mag Label Paire — Conseils entretien sneakers",
    description:
      "Guides pratiques pour garder vos sneakers impeccables. Nettoyage, protection, réparation.",
    url: "https://labelpaire.fr/blog",
    type: "website",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogIndexPage() {
  const featured = blogPosts[0];
  const rest = blogPosts.slice(1);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06] py-20 px-4">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, #ff9ed5 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <span className="inline-block text-[#ff9ed5] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Le Mag
          </span>
          <h1 className="font-playfair text-5xl md:text-6xl font-bold text-white leading-tight mb-5">
            Conseils &amp; Guides<br />
            <span className="text-[#ff9ed5]">Sneakers</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Tout ce qu&apos;il faut savoir pour garder vos paires impeccables —
            nettoyage, protection, réparation.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-14">
        {/* Featured article */}
        <div className="mb-14">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-500 mb-5">
            Article à la une
          </p>
          <Link
            href={`/blog/${featured.slug}`}
            className="group block bg-[#141414] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-[#ff9ed5]/30 transition-colors"
          >
            <div className="p-8 md:p-10">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                    categoryColors[featured.category] ??
                    "bg-white/10 text-gray-300 border-white/10"
                  }`}
                >
                  {featured.category}
                </span>
                <span className="text-gray-600 text-xs">{featured.readTime} min de lecture</span>
                <span className="text-gray-600 text-xs">{formatDate(featured.publishedAt)}</span>
              </div>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-white group-hover:text-[#ff9ed5] transition-colors mb-4 leading-snug">
                {featured.title}
              </h2>
              <p className="text-gray-400 text-base leading-relaxed max-w-2xl">
                {featured.excerpt}
              </p>
              <span className="inline-block mt-6 text-[#ff9ed5] text-sm font-semibold group-hover:translate-x-1 transition-transform">
                Lire l&apos;article →
              </span>
            </div>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col bg-[#141414] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-[#ff9ed5]/30 transition-colors"
            >
              <div className="flex-1 p-6">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                      categoryColors[post.category] ??
                      "bg-white/10 text-gray-300 border-white/10"
                    }`}
                  >
                    {post.category}
                  </span>
                  <span className="text-gray-600 text-xs">{post.readTime} min</span>
                </div>
                <h2 className="font-playfair text-xl font-bold text-white group-hover:text-[#ff9ed5] transition-colors mb-3 leading-snug">
                  {post.title}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>
              <div className="px-6 pb-6 flex items-center justify-between">
                <span className="text-gray-600 text-xs">{formatDate(post.publishedAt)}</span>
                <span className="text-[#ff9ed5] text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Lire →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
