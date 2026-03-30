import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Label Paire — Entretien Premium pour Sneakers",
    template: "%s | Label Paire",
  },
  description:
    "Label Paire propose des produits d'entretien premium pour sneakers : mousses nettoyantes, crèmes, kits complets et accessoires. Expédition 48h.",
  keywords: ["entretien sneakers", "nettoyage chaussures", "Label Paire", "kit réparation"],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Label Paire",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased font-inter">
        <div className="bg-[#ff9ed5] text-[#0a0a0a] text-xs font-semibold text-center py-2 tracking-wide">
          🚚 Livraison offerte dès 50€ &nbsp;·&nbsp; Expédition sous 48h &nbsp;·&nbsp; Retours gratuits 30 jours
        </div>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
