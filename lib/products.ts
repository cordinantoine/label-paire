export type Product = {
  slug: string;
  nom: string;
  prix: number;
  description: string;
  badge: string | null;
  image?: string;
  poids: number; // kg
};

export const products: Product[] = [
  {
    slug: "kit-reparation-premium",
    nom: "Kit de Réparation Premium",
    prix: 99,
    poids: 1.25,
    description:
      "Notre kit complet présenté dans sa trousse en cuir élégante. Contient : La Belle Mousse, deux brosses (douce et dure), un chiffon microfibre, un chausse-pieds, des embauchoirs, Le Tampon Blanc et La Belle Crème. Tout le nécessaire pour garder vos sneakers en parfait état.",
    badge: "Bestseller",
    image: "/products/kit-reparation-premium.png",
  },
  {
    slug: "kit-reparation",
    nom: "Kit de Réparation",
    prix: 69,
    poids: 1.05,
    description:
      "Le kit essentiel dans sa trousse en cuir : La Belle Mousse, une brosse, un chiffon microfibre, Le Tampon Blanc et La Belle Crème. Pratique et complet pour entretenir votre collection.",
    badge: null,
    image: "/products/kit-de-reparation.png",
  },
  {
    slug: "kit-nettoyage",
    nom: "Kit de Nettoyage",
    prix: 35,
    poids: 0.65,
    description:
      "Le kit idéal pour débuter. Contient La Belle Mousse et une brosse. La mousse ne nécessite pas d'ajout d'eau — pratique et efficace pour un nettoyage rapide.",
    badge: null,
  },
  {
    slug: "la-belle-mousse",
    nom: "La Belle Mousse",
    prix: 15,
    poids: 0.35,
    description:
      "Mousse nettoyante 200 mL conçue pour l'intérieur et l'extérieur des chaussures, sacs et casquettes. Agit en profondeur sur tous les tissus et matériaux. Ne nécessite pas d'eau.",
    badge: null,
    image: "/products/la-belle-mousse.jpg",
  },
  {
    slug: "la-belle-creme",
    nom: "La Belle Crème",
    prix: 12,
    poids: 0.3,
    description:
      "Crème oxydante 150 mL pour reblanchir les semelles jaunies et vieillies. Restaure l'éclat d'origine de vos semelles en quelques applications.",
    badge: null,
    image: "/products/la-belle-creme.jpg",
  },
  {
    slug: "la-peinture-blanche",
    nom: "La Peinture Blanche",
    prix: 15,
    poids: 0.15,
    description:
      "Rénovateur blanchissant pour chaussures. Redonne vie aux zones décolorées et égratignées sur cuir, synthétique et autres matières. Finition propre et homogène.",
    badge: "Nouveauté",
    image: "/products/la-peinture-blanche.jpg",
  },
  {
    slug: "la-peinture-noire",
    nom: "La Peinture Noire",
    prix: 15,
    poids: 0.15,
    description:
      "Peinture rénovatrice noire pour recolorer et couvrir les zones abîmées de vos sneakers. Compatible avec le cuir, le synthétique et les matières textiles.",
    badge: "Nouveauté",
    image: "/products/la-peinture-noire.jpg",
  },
  {
    slug: "paire-embauchoirs",
    nom: "Paire d'Embauchoirs",
    prix: 15,
    poids: 0.25,
    description:
      "Embauchoirs en bois pour maintenir la forme de vos sneakers entre les portés. Absorbent l'humidité et préviennent les plis. Compatible toutes pointures.",
    badge: null,
    image: "/products/paire-embauchoirs.jpeg",
  },
  {
    slug: "spray-impermeabilisant",
    nom: "Le Spray Imperméabilisant",
    prix: 15,
    poids: 0.2,
    description:
      "Spray protecteur pour imperméabiliser vos sneakers et les protéger des taches et de l'humidité. Compatible cuir, daim, nubuck et textile.",
    badge: "Nouveauté",
    image: "/products/spray-impermeabilisant.jpg",
  },
  {
    slug: "le-tampon-blanc",
    nom: "Le Tampon Blanc",
    prix: 15,
    poids: 0.25,
    description:
      "Permet de nettoyer les matières délicates (cuir, tissu, daim, nubuck) et de nettoyer en profondeur la semelle. Idéal pour essuyer et sécher les chaussures pendant le nettoyage.",
    badge: null,
    image: "/products/le-tampon-blanc.jpg",
  },
  {
    slug: "patch-reparation-talon",
    nom: "Patch de Réparation Talon",
    prix: 12,
    poids: 0.099,
    description:
      "Patchs adhésifs pour réparer et protéger le talon intérieur de vos chaussures. Prévient l'usure et prolonge la durée de vie de vos paires préférées.",
    badge: null,
    image: "/products/patchs.png",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
