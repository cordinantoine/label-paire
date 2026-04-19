// Brevo (ex-Sendinblue) — synchronisation contacts via API REST

const BREVO_API = "https://api.brevo.com/v3";

// ID de la liste "Clients Label Paire" dans Brevo
// Si elle n'existe pas encore, elle sera créée automatiquement au premier appel
let cachedListId: number | null = null;

async function brevoRequest(
  path: string,
  method: "GET" | "POST" | "PUT",
  body?: object
): Promise<Response> {
  return fetch(`${BREVO_API}${path}`, {
    method,
    headers: {
      "api-key": process.env.BREVO_API_KEY ?? "",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function getOrCreateList(): Promise<number> {
  if (cachedListId) return cachedListId;

  // Cherche la liste "Clients Label Paire"
  const res = await brevoRequest("/contacts/lists?limit=50&offset=0", "GET");
  if (res.ok) {
    const data = await res.json();
    const existing = data.lists?.find(
      (l: { name: string; id: number }) => l.name === "Clients Label Paire"
    );
    if (existing) {
      cachedListId = existing.id;
      return existing.id;
    }
  }

  // Crée la liste si elle n'existe pas
  const createRes = await brevoRequest("/contacts/lists", "POST", {
    name: "Clients Label Paire",
    folderId: 1, // dossier "My contacts" par défaut
  });

  if (createRes.ok) {
    const created = await createRes.json();
    cachedListId = created.id;
    return created.id;
  }

  throw new Error("Impossible de créer la liste Brevo");
}

export type OrderEmailData = {
  to: string;
  nom: string;
  subject: string;
  htmlContent: string;
  textContent: string;
};

export async function sendTransactionalEmail(data: OrderEmailData): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ BREVO_API_KEY manquante — email ignoré");
    return;
  }

  const res = await brevoRequest("/smtp/email", "POST", {
    sender: { name: "Label Paire", email: "contact.labelpaire@gmail.com" },
    to: [{ email: data.to, name: data.nom }],
    subject: data.subject,
    htmlContent: data.htmlContent,
    textContent: data.textContent,
  });

  if (res.ok) {
    console.log(`✅ Brevo — email envoyé à ${data.to}`);
  } else {
    const err = await res.text();
    console.error(`❌ Brevo — erreur envoi email: ${err}`);
  }
}

export type BrevoContactData = {
  email: string;
  nom: string;
  ville?: string;
  pays?: string;
  marketingConsent: boolean;
  orderTotal: number; // centimes
  orderId: string;
};

export async function syncBrevoContact(data: BrevoContactData): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ BREVO_API_KEY manquante — sync ignorée");
    return;
  }

  try {
    const listId = await getOrCreateList();

    // Sépare le nom complet en prénom / nom
    const parts = data.nom.trim().split(" ");
    const prenom = parts[0] ?? "";
    const nomFamille = parts.slice(1).join(" ") || prenom;

    const payload = {
      email: data.email,
      attributes: {
        PRENOM: prenom,
        NOM: nomFamille,
        VILLE: data.ville ?? "",
        PAYS: data.pays ?? "FR",
        DERNIERE_COMMANDE_DATE: new Date().toISOString().split("T")[0],
        DERNIERE_COMMANDE_MONTANT: (data.orderTotal / 100).toFixed(2),
        DERNIERE_COMMANDE_ID: data.orderId.slice(-12).toUpperCase(),
      },
      // Ajoute à la liste uniquement si consentement donné
      listIds: data.marketingConsent ? [listId] : [],
      // updateEnabled : met à jour si le contact existe déjà
      updateEnabled: true,
    };

    const res = await brevoRequest("/contacts", "POST", payload);

    if (res.ok || res.status === 204) {
      console.log(`✅ Brevo — contact ${data.email} synchronisé (consent: ${data.marketingConsent})`);
    } else {
      const err = await res.text();
      console.error(`❌ Brevo — erreur sync contact: ${err}`);
    }
  } catch (err) {
    console.error("❌ Brevo — exception:", err);
  }
}
