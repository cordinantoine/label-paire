import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { blogPosts, getBlogPost, categoryColors, type BlogSection } from "@/lib/blog";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: { canonical: `https://labelpaire.fr/blog/${post.slug}` },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: `https://labelpaire.fr/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function renderSection(section: BlogSection, idx: number) {
  switch (section.type) {
    case "h2":
      return (
        <h2
          key={idx}
          className="font-playfair text-2xl md:text-3xl font-bold text-white mt-12 mb-5"
        >
          {section.text}
        </h2>
      );
    case "h3":
      return (
        <h3
          key={idx}
          className="font-playfair text-xl font-semibold text-white mt-8 mb-3"
        >
          {section.text}
        </h3>
      );
    case "paragraph":
      return (
        <p key={idx} className="text-gray-300 leading-relaxed text-base md:text-[17px]">
          {section.text}
        </p>
      );
    case "list":
      return (
        <ul key={idx} className="space-y-2.5 my-2">
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-300 text-base">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#ff9ed5] flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      );
    case "tip":
      return (
        <div
          key={idx}
          className="my-2 flex gap-4 bg-[#ff9ed5]/10 border border-[#ff9ed5]/20 rounded-xl px-5 py-4"
        >
          <span className="text-[#ff9ed5] text-lg flex-shrink-0 mt-0.5">💡</span>
          <p className="text-[#ff9ed5]/90 text-sm leading-relaxed">{section.text}</p>
        </div>
      );
    case "cta":
      return (
        <div
          key={idx}
          className="my-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-6 py-5"
        >
          <p className="text-white font-medium text-base">{section.text}</p>
          <Link
            href={section.href}
            className="flex-shrink-0 bg-[#ff9ed5] text-[#0a0a0a] font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-[#ffb3de] transition-colors whitespace-nowrap"
          >
            {section.label}
          </Link>
        </div>
      );
    default:
      return null;
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.metaTitle,
    description: post.metaDescription,
    datePublished: post.publishedAt,
    publisher: {
      "@type": "Organization",
      name: "Label Paire",
      url: "https://labelpaire.fr",
    },
    url: `https://labelpaire.fr/blog/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#0a0a0a]">
        {/* Article header */}
        <header className="border-b border-white/[0.06] py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-500 text-sm hover:text-[#ff9ed5] transition-colors mb-8"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Le Mag
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  categoryColors[post.category] ?? "bg-white/10 text-gray-300 border-white/10"
                }`}
              >
                {post.category}
              </span>
              <span className="text-gray-600 text-sm">{post.readTime} min de lecture</span>
              <span className="text-gray-600 text-sm">{formatDate(post.publishedAt)}</span>
            </div>

            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              {post.title}
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">{post.excerpt}</p>
          </div>
        </header>

        {/* Article body */}
        <article className="max-w-3xl mx-auto px-4 py-12 space-y-5">
          {post.content.map((section, i) => renderSection(section, i))}
        </article>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="border-t border-white/[0.06] py-14 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="font-playfair text-2xl font-bold text-white mb-8">
                Articles similaires
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {related.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    className="group bg-[#141414] border border-white/[0.07] rounded-xl p-5 hover:border-[#ff9ed5]/30 transition-colors"
                  >
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        categoryColors[p.category] ?? "bg-white/10 text-gray-300 border-white/10"
                      }`}
                    >
                      {p.category}
                    </span>
                    <h3 className="font-playfair text-lg font-bold text-white group-hover:text-[#ff9ed5] transition-colors mt-3 mb-2 leading-snug">
                      {p.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{p.readTime} min de lecture</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
