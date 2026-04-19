export type BlogSection =
  | { type: "paragraph"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "list"; items: string[] }
  | { type: "tip"; text: string }
  | { type: "cta"; text: string; href: string; label: string };

export type BlogPost = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  publishedAt: string; // ISO date
  category: string;
  readTime: number; // minutes
  excerpt: string;
  content: BlogSection[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "comment-nettoyer-air-force-1",
    title: "Comment nettoyer ses Air Force 1 : guide complet",
    metaTitle: "Comment nettoyer ses Air Force 1 — Guide pas à pas | Label Paire",
    metaDescription:
      "Découvrez comment nettoyer vos Nike Air Force 1 en cuir blanc facilement et sans les abîmer. Produits, étapes et astuces pour des AF1 comme neuves.",
    publishedAt: "2025-09-10",
    category: "Nettoyage",
    readTime: 6,
    excerpt:
      "Les Air Force 1 blanches sont les sneakers les plus populaires au monde — et aussi les plus salissantes. On vous explique comment les nettoyer efficacement en quelques étapes simples.",
    content: [
      {
        type: "paragraph",
        text: "La Nike Air Force 1 est sans doute la sneaker la plus iconique de l'histoire. Sortie en 1982, elle n'a jamais quitté les charts de vente. Mais garder une paire d'AF1 blanches impeccable, c'est un vrai défi. Voici comment faire.",
      },
      { type: "h2", text: "Ce dont vous avez besoin" },
      {
        type: "list",
        items: [
          "Une mousse nettoyante adaptée aux sneakers (type La Belle Mousse)",
          "Une brosse à poils souples",
          "Un chiffon microfibre ou Le Tampon Blanc",
          "De l'eau tiède (optionnel)",
          "Un rénovateur pour les semelles jaunies (La Belle Crème)",
        ],
      },
      { type: "h2", text: "Étape 1 — Dépoussiérer à sec" },
      {
        type: "paragraph",
        text: "Avant d'appliquer quoi que ce soit, retirez les lacets et tapotez les semelles ensemble pour faire tomber la saleté superficielle. Passez la brosse sèche sur toute la surface pour enlever la poussière et les dépôts légers. Cette étape évite d'incruster la saleté lors du nettoyage humide.",
      },
      { type: "h2", text: "Étape 2 — Appliquer la mousse nettoyante" },
      {
        type: "paragraph",
        text: "Appliquez une noisette de mousse nettoyante sur toute la surface en cuir de la chaussure. Travaillez par zones en faisant des mouvements circulaires avec la brosse douce. La mousse va s'activer au contact du cuir et encapsuler les salissures.",
      },
      {
        type: "tip",
        text: "Astuce : insistez particulièrement sur les zones de pli à l'avant de la chaussure et autour de la semelle intermédiaire blanche, qui sont les premières à jaunir.",
      },
      { type: "h2", text: "Étape 3 — Nettoyer la semelle" },
      {
        type: "paragraph",
        text: "La semelle blanche des AF1 est la partie qui salit le plus vite. Utilisez une brosse à poils durs ou une vieille brosse à dents avec de la mousse pour frotter les rainures de la semelle extérieure. Pour la semelle intermédiaire (le flanc blanc), travaillez avec le Tampon Blanc pour un résultat net.",
      },
      { type: "h2", text: "Étape 4 — Essuyer et sécher" },
      {
        type: "paragraph",
        text: "Essuyez le surplus de mousse avec un chiffon microfibre propre et laissez sécher à l'air libre, à l'abri du soleil direct et de la chaleur. Ne mettez jamais vos AF1 dans le sèche-linge — cela décolle la semelle et dégrade le cuir.",
      },
      { type: "h2", text: "Étape 5 — Traiter les semelles jaunies (si besoin)" },
      {
        type: "paragraph",
        text: "Si vos semelles ont viré au jaune avec le temps, c'est de l'oxydation naturelle du caoutchouc. Appliquez La Belle Crème (crème oxydante) en couche uniforme sur la semelle intermédiaire, exposez à la lumière UV (soleil ou lampe) pendant 30 à 60 minutes, puis essuyez. Répétez si nécessaire.",
      },
      {
        type: "cta",
        text: "Besoin des bons produits pour nettoyer vos AF1 ?",
        href: "/boutique",
        label: "Voir nos kits de nettoyage →",
      },
      { type: "h2", text: "Nettoyer les lacets" },
      {
        type: "paragraph",
        text: "Les lacets blancs sont souvent négligés mais ils font toute la différence. Deux options : les mettre en machine dans un filet à 30°C, ou les faire tremper 15 minutes dans de l'eau chaude avec un peu de mousse nettoyante, puis rincer et laisser sécher.",
      },
      { type: "h2", text: "Comment protéger ses Air Force 1 après nettoyage" },
      {
        type: "paragraph",
        text: "Une fois vos AF1 propres et sèches, appliquez un spray imperméabilisant pour créer une barrière protectrice contre l'eau, les taches et la saleté. Cette étape simple multiplie le temps entre deux nettoyages et préserve le cuir sur le long terme.",
      },
      {
        type: "list",
        items: [
          "Protégez vos AF1 dès l'achat avec un spray imperméabilisant",
          "Nettoyez-les après chaque port intense",
          "Stockez-les avec des embauchoirs pour éviter les plis",
          "Évitez la machine à laver qui dégrade la colle",
        ],
      },
      { type: "h2", text: "FAQ — Air Force 1" },
      { type: "h3", text: "Peut-on mettre les Air Force 1 en machine ?" },
      {
        type: "paragraph",
        text: "Techniquement oui, mais ce n'est pas recommandé. La chaleur et l'agitation abîment la colle, déforment la semelle et vieillissent le cuir prématurément. Le nettoyage manuel avec une mousse adaptée donne de bien meilleurs résultats.",
      },
      { type: "h3", text: "Comment enlever les taches jaunes sur les semelles ?" },
      {
        type: "paragraph",
        text: "Les taches jaunes sont dues à l'oxydation du caoutchouc. Elles ne disparaissent pas avec un nettoyage classique. Il faut une crème oxydante (comme La Belle Crème) qui inverse chimiquement ce processus en combinaison avec des UV.",
      },
      { type: "h3", text: "Combien de temps dure le nettoyage ?" },
      {
        type: "paragraph",
        text: "Comptez 15 à 20 minutes pour un nettoyage complet (hors séchage). Avec un kit adapté et un peu d'habitude, vous pouvez faire ça pendant une pub.",
      },
    ],
  },
  {
    slug: "comment-nettoyer-jordan-1",
    title: "Comment nettoyer ses Jordan 1 sans les abîmer",
    metaTitle: "Comment nettoyer ses Jordan 1 — Cuir, daim et semelles | Label Paire",
    metaDescription:
      "Guide complet pour nettoyer vos Nike Air Jordan 1 en cuir ou en daim. Méthodes, produits recommandés et erreurs à éviter pour garder vos Jordan 1 en parfait état.",
    publishedAt: "2025-09-24",
    category: "Nettoyage",
    readTime: 7,
    excerpt:
      "Jordan 1 en cuir ou en daim, chaque matière a ses règles. Voici le guide pour nettoyer votre paire préférée sans prendre de risques.",
    content: [
      {
        type: "paragraph",
        text: "Les Air Jordan 1 existent depuis 1985 et sont toujours aussi désirées. Qu'il s'agisse de colorways iconiques comme le Chicago, le Bred ou le Royal, les Jordan 1 méritent un entretien régulier et adapté à leur matière. Cuir, daim, nubuck — chaque version a ses spécificités.",
      },
      { type: "h2", text: "Jordan 1 en cuir — la méthode classique" },
      {
        type: "paragraph",
        text: "La majorité des Jordan 1 sont en cuir lisse ou en cuir perforé. C'est la matière la plus facile à entretenir et la plus résistante aux nettoyages.",
      },
      {
        type: "list",
        items: [
          "Retirez les lacets et brossez à sec pour enlever la poussière",
          "Appliquez de la mousse nettoyante sur l'ensemble de la tige",
          "Frottez en circulaire avec une brosse souple, zone par zone",
          "Insistez sur les coutures et les zones de superposition (mudguard, wings)",
          "Essuyez au chiffon microfibre et laissez sécher à l'air",
        ],
      },
      {
        type: "tip",
        text: "Les Jordan 1 ont souvent du cuir sur plusieurs niveaux qui se superposent. N'oubliez pas de glisser la brosse entre les panneaux pour enlever la saleté accumulée dans les coutures.",
      },
      { type: "h2", text: "Jordan 1 en daim ou nubuck — attention aux détails" },
      {
        type: "paragraph",
        text: "Certains colorways premium (Jordan 1 Mocha, UNC, etc.) utilisent du daim ou du nubuck. Ces matières sont plus délicates et nécessitent une approche différente.",
      },
      {
        type: "list",
        items: [
          "Utilisez exclusivement une brosse à poils très doux (pas de brosse dure)",
          "Appliquez la mousse en petite quantité et brossez dans le sens du grain",
          "Évitez de saturer le daim en humidité",
          "Laissez sécher lentement et redonnez le grain avec une brosse à daim sèche",
          "Protégez toujours avec un spray imperméabilisant après nettoyage",
        ],
      },
      { type: "h2", text: "Nettoyer la semelle des Jordan 1" },
      {
        type: "paragraph",
        text: "La semelle des Jordan 1 est généralement blanche avec un insert coloré (rouge, bleu, noir selon le colorway). Nettoyez la semelle extérieure avec une brosse dure et de la mousse. Pour la semelle intermédiaire blanche, utilisez le Tampon Blanc pour éviter les traces.",
      },
      {
        type: "cta",
        text: "Découvrez le kit complet pour nettoyer vos Jordan 1",
        href: "/produit/kit-reparation-premium",
        label: "Kit de Réparation Premium →",
      },
      { type: "h2", text: "Les erreurs à ne pas faire avec ses Jordan 1" },
      {
        type: "list",
        items: [
          "Ne jamais mettre en machine à laver (colle et cuir dégradés)",
          "Ne pas utiliser du liquide vaisselle ou du savon de ménage (trop agressif)",
          "Ne pas sécher au sèche-cheveux ou au soleil direct (craquelures)",
          "Ne pas frotter le daim dans tous les sens (marques permanentes)",
          "Ne pas oublier les lacets — souvent jaunis ou gris",
        ],
      },
      { type: "h2", text: "Fréquence d'entretien recommandée" },
      {
        type: "paragraph",
        text: "Pour une paire portée régulièrement (2-3 fois par semaine), un nettoyage complet tous les mois est idéal. Entre les nettoyages, un passage rapide à la brosse sèche après chaque port suffit à maintenir un bon état général. La protection imperméabilisante doit être renouvelée tous les 2 mois.",
      },
      { type: "h2", text: "Restaurer une paire ancienne" },
      {
        type: "paragraph",
        text: "Si vos Jordan 1 n'ont pas été entretenues depuis longtemps, une restauration complète est possible. Commencez par un nettoyage en profondeur, traitez les semelles jaunies avec La Belle Crème, et si le cuir est griffé ou décoloré, La Peinture Blanche ou La Peinture Noire peut redonner une couleur uniforme.",
      },
    ],
  },
  {
    slug: "comment-impermeabiliser-ses-sneakers",
    title: "Comment imperméabiliser ses sneakers : tout ce qu'il faut savoir",
    metaTitle: "Imperméabiliser ses sneakers : guide complet 2025 | Label Paire",
    metaDescription:
      "Comment imperméabiliser ses baskets pour les protéger de la pluie et des taches ? Découvrez notre guide complet sur le spray imperméabilisant pour sneakers.",
    publishedAt: "2025-10-08",
    category: "Protection",
    readTime: 5,
    excerpt:
      "Un spray imperméabilisant est l'investissement le plus intelligent pour vos sneakers. On vous explique comment l'utiliser correctement et sur quelles matières.",
    content: [
      {
        type: "paragraph",
        text: "Imperméabiliser ses sneakers, c'est l'étape que tout le monde oublie — jusqu'au premier jour de pluie. Un spray protecteur appliqué correctement peut faire une différence spectaculaire sur la durée de vie de vos paires et le temps passé à les nettoyer.",
      },
      { type: "h2", text: "Pourquoi imperméabiliser ses sneakers ?" },
      {
        type: "list",
        items: [
          "Protège contre l'eau et la pluie (repousse les gouttes)",
          "Crée une barrière anti-taches (café, boue, huile)",
          "Facilite le nettoyage (les salissures n'adhèrent plus autant)",
          "Préserve les couleurs plus longtemps",
          "Compatible avec toutes les matières principales",
        ],
      },
      { type: "h2", text: "Sur quelles matières utiliser le spray ?" },
      {
        type: "paragraph",
        text: "Un spray imperméabilisant de qualité est compatible avec la grande majorité des matières sneakers. Voici un tour d'horizon :",
      },
      { type: "h3", text: "Cuir lisse" },
      {
        type: "paragraph",
        text: "Le cuir est naturellement résistant mais une protection supplémentaire prolonge sa souplesse et évite les auréoles d'eau. Appliquez à distance de 20 cm en couche légère.",
      },
      { type: "h3", text: "Daim et nubuck" },
      {
        type: "paragraph",
        text: "Ces matières sont très poreuses et absorbent l'eau et les taches facilement. L'imperméabilisation est INDISPENSABLE dès l'achat. Plusieurs couches légères valent mieux qu'une seule couche épaisse.",
      },
      { type: "h3", text: "Textile / mesh" },
      {
        type: "paragraph",
        text: "Les sneakers running ou lifestyle en tissu sont particulièrement vulnérables. Le spray crée un film invisible qui repousse l'humidité sans altérer la respirabilité.",
      },
      { type: "h3", text: "Toile (canvas)" },
      {
        type: "paragraph",
        text: "Converse, Vans Old Skool en toile — ces paires absorbent tellement vite ! Un bon spray imperméabilisant change radicalement leur comportement face aux éclaboussures.",
      },
      {
        type: "tip",
        text: "Attention : n'imperméabilisez pas le cuir verni (Air Jordan 11, par exemple). Le vernis forme déjà une barrière naturelle et le spray peut créer des traces.",
      },
      { type: "h2", text: "Comment appliquer le spray imperméabilisant" },
      {
        type: "list",
        items: [
          "Nettoyez et séchez parfaitement la chaussure avant d'appliquer",
          "Retirez les lacets pour ne pas les tacher",
          "Agitez le spray 10 secondes avant utilisation",
          "Pulvérisez à 20-25 cm de distance en mouvements réguliers",
          "Couvrez toute la surface uniformément (tige + semelle intermédiaire)",
          "Laissez sécher 30 minutes à l'air libre",
          "Appliquez une deuxième couche pour une protection optimale",
          "Attendez 2h avant de porter la paire",
        ],
      },
      {
        type: "cta",
        text: "Protégez vos sneakers avec notre spray imperméabilisant",
        href: "/produit/spray-impermeabilisant",
        label: "Découvrir le spray →",
      },
      { type: "h2", text: "Quelle fréquence d'application ?" },
      {
        type: "paragraph",
        text: "La protection diminue progressivement avec l'usure et les nettoyages. En règle générale, réappliquez le spray tous les 6 à 8 portés, ou après chaque nettoyage complet de vos sneakers. Si vous portez vos paires par mauvais temps, augmentez la fréquence.",
      },
      { type: "h2", text: "Test de l'imperméabilisation" },
      {
        type: "paragraph",
        text: "Pour vérifier que votre protection est active, versez quelques gouttes d'eau sur la chaussure. Si elles perlent et roulent sans être absorbées, la protection fonctionne. Si elles s'absorbent, il est temps de réappliquer.",
      },
    ],
  },
  {
    slug: "entretenir-baskets-blanches",
    title: "Comment entretenir ses baskets blanches au quotidien",
    metaTitle: "Entretenir ses baskets blanches : astuces et produits 2025 | Label Paire",
    metaDescription:
      "Nos meilleures astuces pour garder vos sneakers blanches impeccables au quotidien. Nettoyage, protection et restauration des semelles jaunies.",
    publishedAt: "2025-10-22",
    category: "Entretien",
    readTime: 5,
    excerpt:
      "Les baskets blanches sont belles mais demandent de l'attention. Voici comment maintenir leur éclat semaine après semaine sans y passer des heures.",
    content: [
      {
        type: "paragraph",
        text: "Les baskets blanches sont les pièces les plus polyvalentes du dressing sneakers. Elles vont avec tout, mais elles montrent le moindre grain de poussière. Voici notre routine d'entretien pour les garder éclatantes.",
      },
      { type: "h2", text: "La routine après chaque port" },
      {
        type: "paragraph",
        text: "L'entretien le plus efficace est préventif. Après chaque port, prenez 2 minutes pour passer une brosse sèche sur vos baskets pour enlever la saleté fraîche avant qu'elle ne s'incruste. C'est le geste le plus simple et le plus impactant.",
      },
      { type: "h2", text: "Le nettoyage hebdomadaire" },
      {
        type: "list",
        items: [
          "Brossez à sec pour enlever la poussière et la saleté superficielle",
          "Appliquez de la mousse nettoyante sur la tige",
          "Brossez en mouvements circulaires avec une brosse souple",
          "Nettoyez les semelles avec une brosse plus ferme",
          "Essuyez au chiffon microfibre ou Tampon Blanc",
          "Laissez sécher à l'air libre (pas au soleil direct)",
        ],
      },
      {
        type: "tip",
        text: "Nettoyez vos baskets blanches le soir pour qu'elles aient toute la nuit pour sécher. Évitez de les porter encore humides.",
      },
      { type: "h2", text: "Traiter les semelles jaunies" },
      {
        type: "paragraph",
        text: "Le jaunissement des semelles blanches est inévitable avec le temps — c'est une réaction chimique naturelle du caoutchouc (oxydation). La bonne nouvelle : c'est réversible. La Belle Crème est une crème oxydante qui, combinée avec de la lumière UV, reblanchit les semelles en une à deux applications.",
      },
      {
        type: "cta",
        text: "Reblanchissez vos semelles jaunies",
        href: "/produit/la-belle-creme",
        label: "Découvrir La Belle Crème →",
      },
      { type: "h2", text: "Protéger ses baskets blanches" },
      {
        type: "paragraph",
        text: "Après chaque nettoyage, appliquez un spray imperméabilisant. Cela crée une couche protectrice invisible qui repousse l'eau et les taches. Résultat : vos baskets restent propres beaucoup plus longtemps entre deux nettoyages.",
      },
      { type: "h2", text: "Bien stocker ses baskets blanches" },
      {
        type: "list",
        items: [
          "Utilisez des embauchoirs en bois pour maintenir la forme et absorber l'humidité",
          "Rangez dans leur boîte d'origine ou dans des sacs à sneakers",
          "Évitez le stockage sous lumière directe (jaunissement accéléré)",
          "Insérez du papier de soie blanc (pas journal — les encres tachent) pour éviter les plis",
          "Ne les stockez jamais humides",
        ],
      },
      { type: "h2", text: "Restaurer une paire très sale" },
      {
        type: "paragraph",
        text: "Si vos baskets blanches sont dans un état avancé de saleté, faites un nettoyage en profondeur : appliquez généreusement la mousse, laissez agir 2-3 minutes avant de brosser. Pour les griffures sur le cuir blanc, La Peinture Blanche permet de couvrir les zones décolorées et de retrouver une surface uniforme.",
      },
      { type: "h2", text: "Les erreurs classiques à éviter" },
      {
        type: "list",
        items: [
          "La machine à laver : dégrade la colle et déforme la chaussure",
          "L'eau de Javel : jaunit le caoutchouc au lieu de le blanchir",
          "Le dentifrice : mythe populaire, mais raye le cuir et laisse des résidus",
          "Le sèche-cheveux : rétrécit les matières et craquelle le cuir",
          "Les lingettes bébé : contiennent des huiles qui font des taches sur le daim",
        ],
      },
    ],
  },
  {
    slug: "reparer-semelles-decollees-sneakers",
    title: "Comment réparer une semelle décollée sur ses sneakers",
    metaTitle: "Réparer une semelle décollée sur ses sneakers | Label Paire",
    metaDescription:
      "Votre semelle se décolle ? Pas de panique. Découvrez comment réparer une semelle décollée sur vos sneakers vous-même avec les bons produits.",
    publishedAt: "2025-11-05",
    category: "Réparation",
    readTime: 4,
    excerpt:
      "Une semelle qui se décolle, ça arrive même sur les paires premium. Avec les bons produits, c'est une réparation simple à faire soi-même en moins de 30 minutes.",
    content: [
      {
        type: "paragraph",
        text: "La délamination (décollement de la semelle) est l'un des problèmes les plus fréquents sur les sneakers, quelle que soit leur gamme de prix. Heureusement, c'est aussi l'une des réparations les plus simples à faire soi-même.",
      },
      { type: "h2", text: "Identifier le type de décollement" },
      {
        type: "list",
        items: [
          "Décollement partiel : seule une zone (souvent l'avant ou le talon) se soulève",
          "Décollement complet : toute la semelle se détache",
          "Délamination interne : les couches de la semelle se séparent entre elles",
        ],
      },
      {
        type: "paragraph",
        text: "Les deux premiers cas sont facilement réparables à la maison. La délamination interne est plus complexe et peut nécessiter un cordonnier professionnel.",
      },
      { type: "h2", text: "Ce qu'il vous faut" },
      {
        type: "list",
        items: [
          "Une colle spéciale chaussures (colle néoprène ou colle contact)",
          "Du papier de verre grain 180 (pour abraser les surfaces)",
          "Des pinces ou élastiques forts",
          "Un chiffon propre",
          "De l'alcool isopropylique pour dégraisser",
        ],
      },
      { type: "h2", text: "Étapes de réparation" },
      { type: "h3", text: "1 — Nettoyer et préparer les surfaces" },
      {
        type: "paragraph",
        text: "Nettoyez soigneusement les deux surfaces à coller (la semelle et la tige). Passez un chiffon imbibé d'alcool pour dégraisser. Si l'ancienne colle est présente, grattez-la délicatement. Puis passez légèrement le papier de verre sur les deux surfaces pour créer une accroche mécanique.",
      },
      { type: "h3", text: "2 — Appliquer la colle" },
      {
        type: "paragraph",
        text: "Appliquez la colle en couche fine et uniforme sur les DEUX surfaces (semelle et tige). Laissez sécher 5 à 10 minutes jusqu'à ce que la colle devienne collante au toucher mais ne colle plus aux doigts (c'est ce qu'on appelle le temps de contact).",
      },
      {
        type: "tip",
        text: "Important : avec la colle contact, les deux surfaces doivent être enduites. Le collage se fait par contact instantané entre les deux couches de colle — pas entre la colle et la surface.",
      },
      { type: "h3", text: "3 — Positionner et presser" },
      {
        type: "paragraph",
        text: "Une fois les deux surfaces prêtes, alignez soigneusement et appuyez fermement. Vous n'aurez pas de deuxième chance avec la colle contact. Maintenez la pression avec des pinces ou des élastiques pendant au moins 30 minutes.",
      },
      { type: "h3", text: "4 — Laisser sécher" },
      {
        type: "paragraph",
        text: "Laissez reposer 24h à température ambiante avant de porter à nouveau la paire. La colle continue de durcir pendant plusieurs heures après la prise initiale.",
      },
      { type: "h2", text: "Prévenir le décollement à l'avenir" },
      {
        type: "list",
        items: [
          "Évitez de laver vos sneakers à grande eau ou en machine",
          "Séchez toujours à l'air libre, jamais à la chaleur directe",
          "Utilisez des embauchoirs pour répartir les contraintes",
          "Rangez vos paires dans un endroit sec et aéré",
        ],
      },
      {
        type: "cta",
        text: "Entretenez vos sneakers pour éviter les dégâts prématurés",
        href: "/boutique",
        label: "Voir tous nos produits →",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export const categoryColors: Record<string, string> = {
  Nettoyage: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Protection: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Entretien: "bg-[#ff9ed5]/20 text-[#ff9ed5] border-[#ff9ed5]/30",
  Réparation: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};
