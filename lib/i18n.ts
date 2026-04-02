export type Lang = "fr" | "en";
export type T = { fr: string; en: string };

export const tr = {
  // ─── ANNOUNCEMENT BAR ────────────────────────────────────────────
  announcement: {
    fr: "🚚 Livraison offerte dès 50€  ·  Expédition sous 48h",
    en: "🚚 Free shipping from €50  ·  Ships within 48h",
  },

  // ─── NAVBAR ──────────────────────────────────────────────────────
  nav_home:    { fr: "Accueil",  en: "Home"    },
  nav_shop:    { fr: "Boutique", en: "Shop"    },
  nav_contact: { fr: "Contact",  en: "Contact" },
  nav_cart:    { fr: "Panier",   en: "Cart"    },

  // ─── HOME ────────────────────────────────────────────────────────
  home_tagline: {
    fr: "L'entretien à la hauteur de vos sneakers",
    en: "Care that matches your sneakers",
  },
  home_hero_title: {
    fr: "Vos sneakers méritent le meilleur",
    en: "Your sneakers deserve the best",
  },
  home_hero_sub: {
    fr: "Des produits d'entretien premium pour garder chaque paire impeccable. Nettoyage, protection, réparation — tout ce dont vous avez besoin.",
    en: "Premium care products to keep every pair looking immaculate. Cleaning, protection, repair — everything you need.",
  },
  home_cta_shop:       { fr: "Découvrir la boutique", en: "Discover the shop"  },
  home_cta_bestseller: { fr: "Notre bestseller →",    en: "Our bestseller →"   },

  home_stat_clients:   { fr: "clients satisfaits",  en: "happy customers"   },
  home_stat_views:     { fr: "Views",               en: "Views"             },
  home_stat_followers: { fr: "Abonnés",             en: "Followers"         },
  home_stat_reviews:   { fr: "avis clients",        en: "customer reviews"  },

  home_bestsellers_title: { fr: "Nos bestsellers",                       en: "Our bestsellers"       },
  home_bestsellers_sub:   { fr: "Les produits préférés de notre communauté", en: "Community favorites" },
  home_see_all:           { fr: "Voir tous les produits →",              en: "View all products →"   },

  home_newsletter_title: { fr: "Restez informé",  en: "Stay in the loop" },
  home_newsletter_sub: {
    fr: "Nouveautés, conseils d'entretien et offres exclusives — directement dans votre boîte mail.",
    en: "New drops, care tips and exclusive offers — straight to your inbox.",
  },
  home_newsletter_placeholder: { fr: "votre@email.fr",               en: "your@email.com"          },
  home_newsletter_cta:         { fr: "S'inscrire",                    en: "Subscribe"               },
  home_newsletter_success:     { fr: "Merci ! Vous êtes bien inscrit(e) !", en: "Thank you! You're subscribed!" },

  // ─── SHOP ────────────────────────────────────────────────────────
  shop_title:      { fr: "Boutique",          en: "Shop"        },
  shop_count:      { fr: "produits disponibles", en: "products available" },
  shop_sort_label: { fr: "Trier par prix :",  en: "Sort by price:" },
  shop_sort_asc:   { fr: "Croissant",         en: "Ascending"   },
  shop_sort_desc:  { fr: "Décroissant",       en: "Descending"  },

  // ─── PRODUCT PAGE ────────────────────────────────────────────────
  product_add:          { fr: "Ajouter au panier",          en: "Add to cart"              },
  product_added:        { fr: "Ajouté au panier ✓",         en: "Added to cart ✓"          },
  product_delivery_free:{ fr: "✓ Livraison offerte dès 50€",en: "✓ Free shipping from €50" },
  product_delivery_time:{ fr: "✓ Expédition sous 48h ouvrées", en: "✓ Ships within 48 business hours" },
  product_returns:      { fr: "✓ Retours gratuits sous 30 jours", en: "✓ Free returns within 30 days" },
  product_reviews:      { fr: "Avis clients",               en: "Customer reviews"         },
  product_see:          { fr: "Voir →",                     en: "View →"                   },

  // ─── CART ────────────────────────────────────────────────────────
  cart_title:         { fr: "Votre panier",          en: "Your cart"          },
  cart_empty:         { fr: "Votre panier est vide.", en: "Your cart is empty." },
  cart_discover:      { fr: "Découvrir nos produits", en: "Discover our products" },
  cart_unit:          { fr: "€ / unité",             en: "€ / unit"           },
  cart_summary:       { fr: "Récapitulatif",          en: "Summary"            },
  cart_subtotal:      { fr: "Sous-total",             en: "Subtotal"           },
  cart_shipping:      { fr: "Livraison",              en: "Shipping"           },
  cart_shipping_free: { fr: "Offerte",                en: "Free"               },
  cart_total:         { fr: "Total",                  en: "Total"              },
  cart_checkout:      { fr: "Commander →",            en: "Checkout →"         },
  cart_continue:      { fr: "Continuer mes achats",   en: "Continue shopping"  },

  // ─── CONTACT ─────────────────────────────────────────────────────
  contact_title:    { fr: "Contactez-nous",                           en: "Contact us"                        },
  contact_subtitle: { fr: "Une question ? Notre équipe vous répond sous 24h.", en: "Any questions? Our team replies within 24h." },
  contact_name_label:    { fr: "Nom",     en: "Name"    },
  contact_name_ph:       { fr: "Votre nom", en: "Your name" },
  contact_email_label:   { fr: "Email",   en: "Email"   },
  contact_msg_label:     { fr: "Message", en: "Message" },
  contact_msg_ph:        { fr: "Comment pouvons-nous vous aider ?", en: "How can we help you?" },
  contact_submit:        { fr: "Envoyer le message",  en: "Send message"  },
  contact_submitting:    { fr: "Envoi en cours...",   en: "Sending..."    },
  contact_success_title: { fr: "Message envoyé !",   en: "Message sent!" },
  contact_success_sub:   { fr: "Nous vous répondrons dans les plus brefs délais.", en: "We'll get back to you as soon as possible." },
  contact_error:         { fr: "Une erreur est survenue. Veuillez réessayer.", en: "An error occurred. Please try again." },
  contact_info_email:    { fr: "Email",    en: "Email"    },
  contact_info_reply:    { fr: "Réponse",  en: "Response" },
  contact_info_reply_val:{ fr: "Sous 24h", en: "Within 24h" },
  contact_info_ship:     { fr: "Livraison", en: "Shipping" },
  contact_info_ship_val: { fr: "48h ouvrées", en: "48 business hours" },

  // ─── CHECKOUT ────────────────────────────────────────────────────
  checkout_title:       { fr: "Commander",             en: "Checkout"              },
  checkout_empty:       { fr: "Votre panier est vide.", en: "Your cart is empty."  },
  checkout_name_label:  { fr: "Nom complet",            en: "Full name"            },
  checkout_name_ph:     { fr: "Marie Dupont",           en: "John Smith"           },
  checkout_email_ph:    { fr: "marie@email.fr",         en: "john@email.com"       },
  checkout_addr_label:  { fr: "Adresse",                en: "Address"              },
  checkout_addr_ph:     { fr: "12 rue de la Paix",      en: "12 Main Street"       },
  checkout_zip_label:   { fr: "Code postal",            en: "Zip code"             },
  checkout_zip_ph:      { fr: "75001",                  en: "10001"                },
  checkout_city_label:  { fr: "Ville",                  en: "City"                 },
  checkout_city_ph:     { fr: "Paris",                  en: "New York"             },
  checkout_pay:         { fr: "Payer par carte →",      en: "Pay by card →"        },
  checkout_paying:      { fr: "Redirection vers Stripe...", en: "Redirecting to Stripe..." },
  checkout_secure:      { fr: "Paiement sécurisé via Stripe. Vos données sont protégées.", en: "Secure payment via Stripe. Your data is protected." },
  checkout_order_title: { fr: "Votre commande",         en: "Your order"           },

  // ─── SUCCESS ─────────────────────────────────────────────────────
  success_title: { fr: "Commande confirmée !",   en: "Order confirmed!"     },
  success_msg: {
    fr: "Merci pour votre commande. Un email de confirmation vous a été envoyé. Votre colis sera expédié sous 48h ouvrées.",
    en: "Thank you for your order. A confirmation email has been sent. Your package will be shipped within 48 business hours.",
  },
  success_back: { fr: "Retour à la boutique", en: "Back to the shop" },

  // ─── FOOTER ──────────────────────────────────────────────────────
  footer_desc: {
    fr: "Des produits d'entretien premium pour garder vos sneakers impeccables. Made in France, expédition 48h.",
    en: "Premium care products to keep your sneakers immaculate. Made in France, shipped in 48h.",
  },
  footer_nav:           { fr: "Navigation",                      en: "Navigation"                     },
  footer_ship:          { fr: "Expédition sous 48h ouvrées",     en: "Ships within 48 business hours" },
  footer_support:       { fr: "Service client disponible 7j/7",  en: "Customer service available 7/7" },
  footer_rights:        { fr: "Tous droits réservés",            en: "All rights reserved"            },

  // ─── PRODUCTS ────────────────────────────────────────────────────
} as const;

// ─── Per-product translations ─────────────────────────────────────────────────
export const productTranslations: Record<string, { nom: T; description: T }> = {
  "kit-reparation-premium": {
    nom: { fr: "Kit de Réparation Premium", en: "Premium Repair Kit" },
    description: {
      fr: "Notre kit complet présenté dans sa trousse en cuir élégante. Contient : La Belle Mousse, deux brosses (douce et dure), un chiffon microfibre, un chausse-pieds, des embauchoirs, Le Tampon Blanc et La Belle Crème. Tout le nécessaire pour garder vos sneakers en parfait état.",
      en: "Our complete kit presented in an elegant leather pouch. Includes: La Belle Mousse, two brushes (soft and hard), a microfiber cloth, a shoehorn, shoe trees, Le Tampon Blanc and La Belle Crème. Everything you need to keep your sneakers in perfect condition.",
    },
  },
  "kit-reparation": {
    nom: { fr: "Kit de Réparation", en: "Repair Kit" },
    description: {
      fr: "Le kit essentiel dans sa trousse en cuir : La Belle Mousse, une brosse, un chiffon microfibre, Le Tampon Blanc et La Belle Crème. Pratique et complet pour entretenir votre collection.",
      en: "The essential kit in its leather pouch: La Belle Mousse, a brush, a microfiber cloth, Le Tampon Blanc and La Belle Crème. Practical and complete for maintaining your collection.",
    },
  },
  "kit-nettoyage": {
    nom: { fr: "Kit de Nettoyage", en: "Cleaning Kit" },
    description: {
      fr: "Le kit idéal pour débuter. Contient La Belle Mousse et une brosse. La mousse ne nécessite pas d'ajout d'eau — pratique et efficace pour un nettoyage rapide.",
      en: "The ideal starter kit. Includes La Belle Mousse and a brush. The foam requires no added water — practical and effective for a quick clean.",
    },
  },
  "la-belle-mousse": {
    nom: { fr: "La Belle Mousse", en: "La Belle Mousse" },
    description: {
      fr: "Mousse nettoyante 200 mL conçue pour l'intérieur et l'extérieur des chaussures, sacs et casquettes. Agit en profondeur sur tous les tissus et matériaux. Ne nécessite pas d'eau.",
      en: "200 mL cleaning foam designed for the interior and exterior of shoes, bags and caps. Works deep into all fabrics and materials. No water required.",
    },
  },
  "la-belle-creme": {
    nom: { fr: "La Belle Crème", en: "La Belle Crème" },
    description: {
      fr: "Crème oxydante 150 mL pour reblanchir les semelles jaunies et vieillies. Restaure l'éclat d'origine de vos semelles en quelques applications.",
      en: "150 mL oxidising cream to re-whiten yellowed and aged soles. Restores the original brightness of your soles in just a few applications.",
    },
  },
  "la-peinture-blanche": {
    nom: { fr: "La Peinture Blanche", en: "La Peinture Blanche" },
    description: {
      fr: "Rénovateur blanchissant pour chaussures. Redonne vie aux zones décolorées et égratignées sur cuir, synthétique et autres matières. Finition propre et homogène.",
      en: "Whitening shoe renovator. Restores discoloured and scuffed areas on leather, synthetic and other materials. Clean and even finish.",
    },
  },
  "la-peinture-noire": {
    nom: { fr: "La Peinture Noire", en: "La Peinture Noire" },
    description: {
      fr: "Peinture rénovatrice noire pour recolorer et couvrir les zones abîmées de vos sneakers. Compatible avec le cuir, le synthétique et les matières textiles.",
      en: "Black renovating paint to recolour and cover damaged areas on your sneakers. Compatible with leather, synthetic and textile materials.",
    },
  },
  "paire-embauchoirs": {
    nom: { fr: "Paire d'Embauchoirs", en: "Shoe Trees" },
    description: {
      fr: "Embauchoirs en bois pour maintenir la forme de vos sneakers entre les portés. Absorbent l'humidité et préviennent les plis. Compatible toutes pointures.",
      en: "Wooden shoe trees to maintain the shape of your sneakers between wears. Absorbs moisture and prevents creasing. Fits all sizes.",
    },
  },
  "spray-impermeabilisant": {
    nom: { fr: "Le Spray Imperméabilisant", en: "Waterproofing Spray" },
    description: {
      fr: "Spray protecteur pour imperméabiliser vos sneakers et les protéger des taches et de l'humidité. Compatible cuir, daim, nubuck et textile.",
      en: "Protective spray to waterproof your sneakers and shield them from stains and moisture. Compatible with leather, suede, nubuck and textile.",
    },
  },
  "le-tampon-blanc": {
    nom: { fr: "Le Tampon Blanc", en: "Le Tampon Blanc" },
    description: {
      fr: "Permet de nettoyer les matières délicates (cuir, tissu, daim, nubuck) et de nettoyer en profondeur la semelle. Idéal pour essuyer et sécher les chaussures pendant le nettoyage.",
      en: "Designed to clean delicate materials (leather, fabric, suede, nubuck) and deep-clean the sole. Ideal for wiping and drying shoes during cleaning.",
    },
  },
  "patch-reparation-talon": {
    nom: { fr: "Patch de Réparation Talon", en: "Heel Repair Patch" },
    description: {
      fr: "Patchs adhésifs pour réparer et protéger le talon intérieur de vos chaussures. Prévient l'usure et prolonge la durée de vie de vos paires préférées.",
      en: "Adhesive patches to repair and protect the inner heel of your shoes. Prevents wear and extends the life of your favourite pairs.",
    },
  },
};

// ─── Mock reviews ─────────────────────────────────────────────────────────────
export const mockReviews = {
  fr: [
    { author: "Sophie M.", rating: 5, comment: "Produit incroyable, mes sneakers ont retrouvé leur éclat d'origine !" },
    { author: "Lucas R.",  rating: 5, comment: "Très efficace, je recommande sans hésiter. Livraison rapide." },
    { author: "Camille D.",rating: 4, comment: "Bon produit, facile à utiliser. Résultats visibles dès la première utilisation." },
  ],
  en: [
    { author: "Sarah M.", rating: 5, comment: "Amazing product, my sneakers look brand new again!" },
    { author: "James R.", rating: 5, comment: "Super effective, definitely recommend. Fast shipping too." },
    { author: "Emma D.",  rating: 4, comment: "Great product, easy to use. Results visible from the very first use." },
  ],
};
