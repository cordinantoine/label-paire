import { getBoxtalToken } from "@/lib/boxtalToken";

const BOXTAL_ORDER_URL = "https://api.boxtal.com/shipping/v3.1/shipping-order";

export type BoxtalOrderInput = {
  orderReference: string;
  recipientName: string;
  recipientEmail: string;
  recipientStreet: string;
  recipientCity: string;
  recipientPostalCode: string;
  recipientCountry: string;
  weightKg: number;
  network: string;        // "MONR" | "CHRP" | "" (empty = home)
  parcelPointCode?: string; // relay point code, required when network is MONR/CHRP
};

export type BoxtalOrderResult =
  | { ok: true; orderCode: string }
  | { ok: false; error: string };

export async function createBoxtalOrder(input: BoxtalOrderInput): Promise<BoxtalOrderResult> {
  try {
    const token = await getBoxtalToken();

    const isRelay = input.network === "MONR" || input.network === "CHRP";

    const shipment: Record<string, unknown> = {
      orderReference: input.orderReference,
      sender: {
        company: "Label Paire",
        contactName: "Label Paire",
        email: process.env.SENDER_EMAIL ?? "commandes@labelpaire.fr",
        phone: process.env.SENDER_PHONE ?? "",
        address: {
          street:         process.env.SENDER_STREET      ?? "9 Boulevard du Temple",
          city:           process.env.SENDER_CITY        ?? "Chatou",
          postalCode:     process.env.SENDER_POSTAL_CODE ?? "78400",
          countryIsoCode: "FR",
        },
      },
      recipient: {
        contactName:  input.recipientName,
        email:        input.recipientEmail,
        address: {
          street:         input.recipientStreet,
          city:           input.recipientCity,
          postalCode:     input.recipientPostalCode,
          countryIsoCode: input.recipientCountry || "FR",
        },
      },
      parcels: [
        {
          weight: Math.max(0.1, input.weightKg),
          length: 30,
          width:  20,
          height: Math.max(5, Math.round(input.weightKg * 10)),
        },
      ],
      network: input.network || "COPR",
    };

    if (isRelay && input.parcelPointCode) {
      shipment.parcelPointCode = input.parcelPointCode;
    }

    const body = { shipment };

    const res = await fetch(BOXTAL_ORDER_URL, {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept:         "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: Record<string, unknown> = {};
    try { data = JSON.parse(text); } catch { /* ignore */ }

    if (!res.ok) {
      console.error("Boxtal order error:", res.status, text);
      return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }

    const orderCode = (data.orderCode as string) ?? (data.code as string) ?? input.orderReference;
    return { ok: true, orderCode };
  } catch (err) {
    console.error("Boxtal order exception:", err);
    return { ok: false, error: String(err) };
  }
}
