import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Charge .env.local en priorité (Next.js convention), puis .env comme fallback
config({ path: ".env.local", override: true });
config({ path: ".env" });

// Pour les migrations on utilise la connexion directe (non-poolée)
// Pour les requêtes runtime, Next.js injecte POSTGRES_PRISMA_URL automatiquement
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      process.env["POSTGRES_URL_NON_POOLING"] ??
      process.env["POSTGRES_PRISMA_URL"] ??
      process.env["DATABASE_URL"],
  },
});
