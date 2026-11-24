/**
 * Message Central VerifyNow: pure parsing, no network or framework imports, so
 * it can be unit-tested with `node --test`. Response codes are from
 * Message_Central_Verify_Now_API_Doc.pdf.
 */

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/** The token endpoint's response shape isn't in the doc: accept the known variants. */
export function parseTokenResponse(body: unknown): string | null {
  if (!isObject(body)) return null;
  const direct = body.token;
  if (typeof direct === "string" && direct.length > 10) return direct;
  const data = body.data;
  if (isObject(data) && typeof data.token === "string" && data.token.length > 10) return data.token;
  if (isObject(data) && typeof data.authToken === "string" && data.authToken.length > 10) return data.authToken;
  return null;
}

/** Expiry (ms epoch) from a JWT's `exp` claim, or null when unreadable. */
export function jwtExpiryMs(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof json?.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** How long to trust a freshly fetched token. */
export function tokenValidUntil(token: string, now: number = Date.now()): number {
  const exp = jwtExpiryMs(token);
  const fallback = now + 10 * 60_000;
  if (exp == null) return fallback;
  // Leave a minute of slack; never trust beyond 6 hours.
  return Math.min(exp - 60_000, now + 6 * 3_600_000);
}

export type SendOutcome =
  | { ok: true; verificationId: string }
  | { ok: false; reason: "invalid-number" | "rate-limited" | "auth" | "error"; code: string };

const codeOf = (body: unknown): string => {
  if (!isObject(body)) return "";
  const inner = isObject(body.data) ? body.data.responseCode : undefined;
  return String(body.responseCode ?? inner ?? "");
};

export function parseSendResponse(httpStatus: number, body: unknown): SendOutcome {
  const code = codeOf(body);
  const data = isObject(body) && isObject(body.data) ? body.data : null;
  const id = data?.verificationId;
  const verificationId =
    typeof id === "string" || typeof id === "number" ? String(id).trim() : "";

  if (httpStatus >= 200 && httpStatus < 300 && code === "200" && /^\d+$/.test(verificationId)) {
    return { ok: true, verificationId };
  }
  if (httpStatus === 401 || httpStatus === 403 || code === "501") return { ok: false, reason: "auth", code };
  if (code === "511") return { ok: false, reason: "invalid-number", code };
  if (code === "506" || code === "800" || httpStatus === 429) return { ok: false, reason: "rate-limited", code };
  return { ok: false, reason: "error", code };
}

export type ValidateOutcome =
  | "verified"
  | "wrong"
  | "expired"
  | "already-verified"
  | "limit"
  | "unknown-request"
  | "auth"
  | "error";

export function parseValidateResponse(httpStatus: number, body: unknown): ValidateOutcome {
  const code = codeOf(body);
  const data = isObject(body) && isObject(body.data) ? body.data : null;
  const status = typeof data?.verificationStatus === "string" ? data.verificationStatus : "";

  if (httpStatus >= 200 && httpStatus < 300 && code === "200" && status === "VERIFICATION_COMPLETED") {
    return "verified";
  }
  if (httpStatus === 401 || httpStatus === 403) return "auth";
  switch (code) {
    case "702": return "wrong";
    case "705": return "expired";
    case "703": return "already-verified";
    case "800": return "limit";
    case "505": return "unknown-request";
    case "501": return "auth";
    default: return "error";
  }
}
