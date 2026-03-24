import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { nom, email, message } = await req.json();

    await resend.emails.send({
      from: "Label Paire <contact@labelpaire.fr>",
      to: "contact@labelpaire.fr",
      subject: `Nouveau message de ${nom}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${nom}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Message :</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    // Confirmation to sender
    await resend.emails.send({
      from: "Label Paire <contact@labelpaire.fr>",
      to: email,
      subject: "Nous avons bien reçu votre message",
      html: `
        <h2>Bonjour ${nom},</h2>
        <p>Merci de nous avoir contacté. Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.</p>
        <p>À bientôt,<br/>L'équipe Label Paire</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur d'envoi" }, { status: 500 });
  }
}
