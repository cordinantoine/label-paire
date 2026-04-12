# Label Paire

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma 7 + Neon PostgreSQL · Zustand · Stripe · Brevo · Vercel

## Structure
app/           (routes App Router : public, admin, api)
components/    (UI réutilisables : 10 composants)
lib/           (intégrations, stores, logique métier)
hooks/         (useT i18n)
prisma/        (schema + migrations)

## Scripts
npm run dev           dev server
npm run build         prisma generate + next build
npm run lint          ESLint

## Architecture & Décisions Clés
- DB : Neon serverless via Prisma adapter (POSTGRES_PRISMA_URL pooled, DATABASE_URL_UNPOOLED migrations)
- Auth admin : JWT middleware (middleware.ts + lib/admin-auth.ts)
- Cart : Zustand (lib/cartStore.ts)
- Emails : Brevo (lib/brevo.ts)
- Shipping : Boxtal + Chronopost + SendCloud + relay points Leaflet
- Modèles : Customer, Order, Expense

## Pièges & Solutions
- prisma.config.ts : charge .env.local avant .env (ordre important)
- Neon adapter requis à runtime : @prisma/adapter-neon + @neondatabase/serverless
- Brevo sync contacts déclenché post-commande (webhook Stripe)
