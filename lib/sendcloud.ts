export type SendcloudParcelInput = {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string; // ISO 2-letter code: "FR", "BE", "DE"...
  email: string;
  orderNumber: string;
  weightKg: number;
  requestLabel?: boolean;
};

export type SendcloudParcel = {
  id: number;
  tracking_number: string;
  tracking_url: string;
  label?: { normal_printer: string[] };
  status: { id: number; message: string };
};

export async function createSendcloudParcel(
  data: SendcloudParcelInput
): Promise<{ ok: true; parcel: SendcloudParcel } | { ok: false; error: string }> {
  const publicKey  = process.env.SENDCLOUD_PUBLIC_KEY;
  const secretKey  = process.env.SENDCLOUD_SECRET_KEY;
  const methodId   = parseInt(process.env.SENDCLOUD_SHIPPING_METHOD_ID ?? "8");

  if (!publicKey || !secretKey) {
    return { ok: false, error: "Sendcloud credentials missing" };
  }

  const auth = Buffer.from(`${publicKey}:${secretKey}`).toString("base64");

  try {
    const res = await fetch("https://panel.sendcloud.sc/api/v2/parcels", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parcel: {
          name: data.name,
          address: data.address,
          city: data.city,
          postal_code: data.postalCode,
          country: data.country,
          email: data.email,
          order_number: data.orderNumber,
          weight: data.weightKg.toFixed(3),
          request_label: data.requestLabel ?? false,
          shipment: { id: methodId },
        },
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      return { ok: false, error: json?.error?.message ?? "Sendcloud error" };
    }

    return { ok: true, parcel: json.parcel };
  } catch (err: unknown) {
    return { ok: false, error: String(err) };
  }
}
