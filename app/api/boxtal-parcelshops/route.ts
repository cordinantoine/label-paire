import { NextRequest, NextResponse } from "next/server";
import { getBoxtalToken } from "@/lib/boxtalToken";

export type DayHours = {
  open1?: string;
  close1?: string;
  open2?: string;
  close2?: string;
};

export type BoxtalParcelShop = {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
  distance: number; // metres
  network: string;  // MONR, CHRP, POFR...
  hours: Record<string, DayHours>;
};

const DAYS_MAP: Record<string, string> = {
  MONDAY:    "lundi",
  TUESDAY:   "mardi",
  WEDNESDAY: "mercredi",
  THURSDAY:  "jeudi",
  FRIDAY:    "vendredi",
  SATURDAY:  "samedi",
  SUNDAY:    "dimanche",
};

function parseSlots(slots: { openingTime: string; closingTime: string }[]): DayHours {
  if (!slots?.length) return {};
  return {
    open1:  slots[0]?.openingTime,
    close1: slots[0]?.closingTime,
    open2:  slots[1]?.openingTime,
    close2: slots[1]?.closingTime,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { postalCode, city = "", address = "", networks = "MONR,CHRP" } = await req.json();

    const token = await getBoxtalToken();

    const params = new URLSearchParams({
      postalCode,
      city,
      street:         address,
      countryIsoCode: "FR",
    });

    // Add each network as separate query param
    const networkList = networks.split(",").map((n: string) => n.trim());
    const networkParams = networkList.map((n: string) => `networks=${n}`).join("&");

    const url = `https://api.boxtal.com/shipping/v3.1/parcel-point?${params.toString()}&${networkParams}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept:        "application/json",
      },
    });

    if (!res.ok) {
      console.error("Boxtal parcel-point error:", res.status, await res.text());
      return NextResponse.json({ points: [] });
    }

    const data = await res.json();
    const content = data.content ?? [];

    const points: BoxtalParcelShop[] = content.filter((item: {
      parcelPoint: { network: string };
    }) => networkList.includes(item.parcelPoint.network)).map((item: {
      distanceFromSearchLocation: number;
      parcelPoint: {
        code: string;
        name: string;
        network: string;
        location: {
          street: string;
          city: string;
          postalCode: string;
          position: { latitude: number; longitude: number };
        };
        openingDays: Record<string, { openingTime: string; closingTime: string }[]>;
      };
    }) => {
      const pp = item.parcelPoint;
      const hours: Record<string, DayHours> = {};

      for (const [dayEn, dayFr] of Object.entries(DAYS_MAP)) {
        const slots = pp.openingDays?.[dayEn] ?? [];
        hours[dayFr] = parseSlots(slots);
      }

      return {
        id:         pp.code,
        name:       titleCase(pp.name),
        address:    titleCase(pp.location.street),
        city:       titleCase(pp.location.city),
        postalCode: pp.location.postalCode,
        lat:        pp.location.position.latitude,
        lng:        pp.location.position.longitude,
        distance:   item.distanceFromSearchLocation,
        network:    pp.network,
        hours,
      };
    });

    return NextResponse.json({ points });
  } catch (err) {
    console.error("Boxtal parcelshops error:", err);
    return NextResponse.json({ points: [] });
  }
}

function titleCase(s: string): string {
  if (!s) return "";
  return s.toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
