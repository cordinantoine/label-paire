import { config } from "dotenv";
config({ path: ".env.local", override: true });
config({ path: ".env" });

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString =
  process.env.POSTGRES_PRISMA_URL ?? process.env.DATABASE_URL ?? "";
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter } as never);

const FR_HOME_RATES = [
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

// Zone 1 : BE, LU, NL, DE (mêmes tarifs)
const EU_ZONE_1_RATES = [
  { maxWeightKg: 0.5,  priceEur: 12.50 },
  { maxWeightKg: 1,    priceEur: 13.80 },
  { maxWeightKg: 2,    priceEur: 14.90 },
  { maxWeightKg: 4,    priceEur: 18.20 },
  { maxWeightKg: 5,    priceEur: 18.50 },
  { maxWeightKg: 10,   priceEur: 28.50 },
  { maxWeightKg: 15,   priceEur: 35.00 },
  { maxWeightKg: 25,   priceEur: 47.90 },
];
const EU_ZONE_1_COUNTRIES = ["BE", "LU", "NL", "DE"];

// Zone 2 : ES, PT, IT (mêmes tarifs)
const EU_ZONE_2_RATES = [
  { maxWeightKg: 0.5,  priceEur: 12.70 },
  { maxWeightKg: 1,    priceEur: 14.00 },
  { maxWeightKg: 2,    priceEur: 15.10 },
  { maxWeightKg: 4,    priceEur: 18.40 },
  { maxWeightKg: 5,    priceEur: 18.80 },
  { maxWeightKg: 10,   priceEur: 28.80 },
  { maxWeightKg: 15,   priceEur: 35.30 },
  { maxWeightKg: 25,   priceEur: 48.10 },
];
const EU_ZONE_2_COUNTRIES = ["ES", "PT", "IT"];

// Zone 3 : AT (tarifs spécifiques)
const AT_HOME_RATES = [
  { maxWeightKg: 0.5,  priceEur: 16.00 },
  { maxWeightKg: 1,    priceEur: 17.70 },
  { maxWeightKg: 2,    priceEur: 18.10 },
  { maxWeightKg: 4,    priceEur: 22.30 },
  { maxWeightKg: 5,    priceEur: 22.70 },
  { maxWeightKg: 10,   priceEur: 31.80 },
  { maxWeightKg: 15,   priceEur: 43.10 },
  { maxWeightKg: 25,   priceEur: 55.80 },
];

async function seedCountry(country: string, rates: { maxWeightKg: number; priceEur: number }[], minDays: number, maxDays: number) {
  await prisma.shippingRate.deleteMany({ where: { country, type: "home" } });
  for (const rate of rates) {
    await prisma.shippingRate.create({
      data: { country, type: "home", maxWeightKg: rate.maxWeightKg, priceEur: rate.priceEur, minDays, maxDays },
    });
  }
  console.log(`✓ ${rates.length} tarifs domicile ${country} insérés.`);
}

async function main() {
  // France
  await seedCountry("FR", FR_HOME_RATES, 3, 5);

  // Zone 1
  for (const country of EU_ZONE_1_COUNTRIES) {
    await seedCountry(country, EU_ZONE_1_RATES, 3, 7);
  }

  // Zone 2
  for (const country of EU_ZONE_2_COUNTRIES) {
    await seedCountry(country, EU_ZONE_2_RATES, 3, 7);
  }

  // Autriche
  await seedCountry("AT", AT_HOME_RATES, 3, 7);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
