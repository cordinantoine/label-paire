const BOXTAL_TOKEN_URL = "https://api.boxtal.com/iam/account-app/token";

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getBoxtalToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 300_000) {
    return cachedToken.token;
  }

  const login    = process.env.BOXTAL_LOGIN;
  const password = process.env.BOXTAL_PASSWORD;
  const auth     = Buffer.from(`${login}:${password}`).toString("base64");

  const res = await fetch(BOXTAL_TOKEN_URL, {
    method: "POST",
    headers: { Accept: "application/json", Authorization: `Basic ${auth}` },
    body: "",
  });

  if (!res.ok) throw new Error(`Boxtal token error: ${res.status}`);

  const data = await res.json();
  const token = data.accessToken as string;

  cachedToken = { token, expiresAt: Date.now() + 3_600_000 };
  return token;
}
