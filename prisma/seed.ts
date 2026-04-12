import { config } from "dotenv";
config({ path: ".env.local", override: true });
config({ path: ".env" });

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString =
  process.env.POSTGRES_PRISMA_URL ?? process.env.DATABASE_URL ?? "";
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter } as never);

// FR : 10 paliers
const FR = [
  { maxWeightKg: 0.25, priceEur: 4.99 },
  { maxWeightKg: 0.5,  priceEur: 7.49 },
  { maxWeightKg: 1,    priceEur: 9.49 },
  { maxWeightKg: 2,    priceEur: 10.99 },
  { maxWeightKg: 4,    priceEur: 16.39 },
  { maxWeightKg: 5,    priceEur: 16.39 },
  { maxWeightKg: 7,    priceEur: 24.99 },
  { maxWeightKg: 10,   priceEur: 24.99 },
  { maxWeightKg: 15,   priceEur: 31.49 },
  { maxWeightKg: 25,   priceEur: 42.99 },
];

// Zone 1 : BE, LU, NL, DE
const ZONE1 = [
  { maxWeightKg: 0.5,  priceEur: 12.50 },
  { maxWeightKg: 1,    priceEur: 13.80 },
  { maxWeightKg: 2,    priceEur: 14.90 },
  { maxWeightKg: 4,    priceEur: 18.20 },
  { maxWeightKg: 5,    priceEur: 18.50 },
  { maxWeightKg: 10,   priceEur: 28.50 },
  { maxWeightKg: 15,   priceEur: 35.00 },
  { maxWeightKg: 25,   priceEur: 47.90 },
];

// Zone 2 : ES, PT, IT
const ZONE2 = [
  { maxWeightKg: 0.5,  priceEur: 12.70 },
  { maxWeightKg: 1,    priceEur: 14.00 },
  { maxWeightKg: 2,    priceEur: 15.10 },
  { maxWeightKg: 4,    priceEur: 18.40 },
  { maxWeightKg: 5,    priceEur: 18.80 },
  { maxWeightKg: 10,   priceEur: 28.80 },
  { maxWeightKg: 15,   priceEur: 35.30 },
  { maxWeightKg: 25,   priceEur: 48.10 },
];

// AT
const AT = [
  { maxWeightKg: 0.5,  priceEur: 16.00 },
  { maxWeightKg: 1,    priceEur: 17.70 },
  { maxWeightKg: 2,    priceEur: 18.10 },
  { maxWeightKg: 4,    priceEur: 22.30 },
  { maxWeightKg: 5,    priceEur: 22.70 },
  { maxWeightKg: 10,   priceEur: 31.80 },
  { maxWeightKg: 15,   priceEur: 43.10 },
  { maxWeightKg: 25,   priceEur: 55.80 },
];

const ALL = [
  { country: "FR", rates: FR, minDays: 3, maxDays: 5 },
  { country: "BE", rates: ZONE1, minDays: 3, maxDays: 7 },
  { country: "LU", rates: ZONE1, minDays: 3, maxDays: 7 },
  { country: "NL", rates: ZONE1, minDays: 3, maxDays: 7 },
  { country: "DE", rates: ZONE1, minDays: 3, maxDays: 7 },
  { country: "ES", rates: ZONE2, minDays: 3, maxDays: 7 },
  { country: "PT", rates: ZONE2, minDays: 3, maxDays: 7 },
  { country: "IT", rates: ZONE2, minDays: 3, maxDays: 7 },
  { country: "AT", rates: AT,    minDays: 3, maxDays: 7 },
];

async function main() {
  for (const { country, rates, minDays, maxDays } of ALL) {
    await prisma.shippingRate.deleteMany({ where: { country } });
    for (const r of rates) {
      await prisma.shippingRate.create({
        data: { country, maxWeightKg: r.maxWeightKg, priceEur: r.priceEur, minDays, maxDays },
      });
    }
    console.log(`✓ ${rates.length} tarifs ${country} insérés.`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
