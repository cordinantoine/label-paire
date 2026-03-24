import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/commande/"] },
    sitemap: "https://labelpaire.fr/sitemap.xml",
  };
}
