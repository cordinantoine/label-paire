export type OrderItem = {
  nom: string;
  prix: number;
  quantity: number;
};

export type OrderConfirmationData = {
  nom: string;
  email: string;
  items: OrderItem[];
  shippingMethod: string;
  amountTotal: number; // centimes
  orderId: string;
};

function formatEur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export function orderConfirmationHtml(data: OrderConfirmationData): string {
  const { nom, items, shippingMethod, amountTotal, orderId } = data;

  const itemsRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #1f1f1f;color:#e0e0e0;font-size:14px;">${item.nom}</td>
        <td style="padding:10px 0;border-bottom:1px solid #1f1f1f;color:#e0e0e0;font-size:14px;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #1f1f1f;color:#ff9ed5;font-size:14px;text-align:right;">${formatEur(item.prix * item.quantity * 100)}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Confirmation de commande — Label Paire</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Label Paire</h1>
              <p style="margin:6px 0 0;font-size:13px;color:#666;">Entretien premium pour sneakers</p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#111;border:1px solid #1f1f1f;border-radius:16px;padding:32px;">

              <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">
                Merci pour ta commande, ${nom.split(" ")[0]} !
              </h2>
              <p style="margin:0 0 24px;font-size:14px;color:#888;">
                Ta commande a bien été reçue et est en cours de préparation.
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #1f1f1f;margin:0 0 24px;" />

              <!-- Items -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <th style="text-align:left;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.08em;padding-bottom:8px;">Produit</th>
                  <th style="text-align:center;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.08em;padding-bottom:8px;">Qté</th>
                  <th style="text-align:right;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.08em;padding-bottom:8px;">Prix</th>
                </tr>
                ${itemsRows}
              </table>

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr>
                  <td style="font-size:15px;font-weight:700;color:#ffffff;">Total</td>
                  <td style="text-align:right;font-size:18px;font-weight:700;color:#ff9ed5;">${formatEur(amountTotal)}</td>
                </tr>
              </table>

              <!-- Shipping -->
              <hr style="border:none;border-top:1px solid #1f1f1f;margin:24px 0;" />
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:13px;color:#888;">Mode de livraison</td>
                  <td style="text-align:right;font-size:13px;color:#e0e0e0;">${shippingMethod || "Standard"}</td>
                </tr>
              </table>

              <!-- CTA -->
              <div style="margin-top:32px;text-align:center;">
                <p style="font-size:13px;color:#666;margin:0 0 16px;">
                  Tu recevras un email avec ton numéro de suivi dès l&apos;expédition de ta commande.
                </p>
                <a href="https://labelpaire.fr/boutique"
                   style="display:inline-block;background:#ff9ed5;color:#0a0a0a;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">
                  Continuer mes achats
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="font-size:12px;color:#444;margin:0;">
                © ${new Date().getFullYear()} Label Paire — <a href="https://labelpaire.fr" style="color:#666;text-decoration:none;">labelpaire.fr</a>
              </p>
              <p style="font-size:11px;color:#333;margin:6px 0 0;">
                Référence commande : ${orderId.slice(-12).toUpperCase()}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function orderConfirmationText(data: OrderConfirmationData): string {
  const { nom, items, shippingMethod, amountTotal, orderId } = data;
  const itemsList = items
    .map((i) => `- ${i.nom} × ${i.quantity} : ${formatEur(i.prix * i.quantity * 100)}`)
    .join("\n");

  return `Bonjour ${nom},

Merci pour ta commande sur Label Paire !

RÉCAPITULATIF
${itemsList}

Total : ${formatEur(amountTotal)}
Livraison : ${shippingMethod || "Standard"}
Référence : ${orderId.slice(-12).toUpperCase()}

Tu recevras un email avec ton numéro de suivi dès l'expédition.

— L'équipe Label Paire
https://labelpaire.fr`;
}
