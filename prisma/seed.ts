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

async function main() {
  // Supprimer les tarifs FR domicile existants avant de re-seeder
  await prisma.shippingRate.deleteMany({ where: { country: "FR", type: "home" } });

  for (const rate of FR_HOME_RATES) {
    await prisma.shippingRate.create({
      data: {
        country: "FR",
        type: "home",
        maxWeightKg: rate.maxWeightKg,
        priceEur: rate.priceEur,
        minDays: 3,
        maxDays: 5,
      },
    });
  }

  console.log(`✓ ${FR_HOME_RATES.length} tarifs livraison domicile FR insérés.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
