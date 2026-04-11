import { NextRequest, NextResponse } from "next/server";
import { signJwt } from "@/lib/admin-auth";

// Rate limiting simple : 5 tentatives / 15 min par IP
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const now = Date.now();

  // Nettoyage et vérification du rate limit
  const record = attempts.get(ip);
  if (record) {
    if (now < record.resetAt && record.count >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessaie dans 15 minutes." },
        { status: 429 }
      );
    }
    if (now >= record.resetAt) attempts.delete(ip);
  }

  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    const current = attempts.get(ip);
    attempts.set(ip, {
      count: (current?.count ?? 0) + 1,
      resetAt: current?.resetAt ?? now + WINDOW_MS,
    });
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  // Succès — réinitialise le compteur
  attempts.delete(ip);

  const token = await signJwt({ admin: true });
  const isProduction = process.env.NODE_ENV === "production";

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60, // 8h
  });
  return res;
}
