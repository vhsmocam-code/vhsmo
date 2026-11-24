import { easyEcomConfig } from "./config";
import type { EasyEcomCreds } from "./core";

let cached: { jwt: string; expiresAt: number } | null = null;

async function login(): Promise<string | null> {
  const c = easyEcomConfig();
  if (!c.email || !c.password || !c.apiKey || !c.authUrl.startsWith("https://")) return null;
  try {
    const res = await fetch(c.authUrl, {
      method: "POST",
      headers: { "x-api-key": c.apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: c.email, password: c.password, location_key: c.locationKey }),
      signal: AbortSignal.timeout(c.timeoutMs),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: { token?: { jwt_token?: string; expires_in?: number } } };
    const token = body?.data?.token?.jwt_token;
    if (!token) return null;
    const ttl = (body?.data?.token?.expires_in ?? 3600) * 1000;
    cached = { jwt: token, expiresAt: Date.now() + Math.max(60_000, ttl - 120_000) };
    return token;
  } catch {
    return null; // never log the request: it contains the password
  }
}

/** Fresh JWT via login (cached), falling back to the static token from env. */
export async function getCreds(forceRefresh = false): Promise<EasyEcomCreds | null> {
  const c = easyEcomConfig();
  if (!c.apiKey || !c.endpoint.startsWith("https://")) return null;
  let jwt: string | null = null;
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) jwt = cached.jwt;
  if (!jwt) jwt = await login();
  if (!jwt) jwt = c.staticJwt || null;
  return jwt ? { endpoint: c.endpoint, apiKey: c.apiKey, jwt } : null;
}
