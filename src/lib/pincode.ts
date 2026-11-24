const DELHIVERY_URL = "https://track.delhivery.com/c/api/pin-codes/json/";

type PostalCode = {
  pin: number;
  city?: string;
  state_code?: string;
  district?: string;
  country_code?: string;
  pre_paid?: string;
  cash?: string;
  cod?: string;
  pickup?: string;
  repl?: string;
  is_oda?: string;
  remarks?: string;
};

export function isValidPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode);
}

export type Serviceability =
  | { kind: "not-configured" }
  | { kind: "invalid" }
  | { kind: "error" }
  | { kind: "unserviceable" }
  | {
      kind: "serviceable";
      city: string | null;
      district: string | null;
      state: string | null;
      cod: boolean;
      prepaid: boolean;
      pickup: boolean;
    };

/** Delhivery serviceability for one PIN. Never throws. */
export async function lookupPincode(pincode: string): Promise<Serviceability> {
  const token = process.env.DELHIVERY_TOKEN;
  if (!token) return { kind: "not-configured" };
  if (!isValidPincode(pincode)) return { kind: "invalid" };

  try {
    const res = await fetch(`${DELHIVERY_URL}?filter_codes=${encodeURIComponent(pincode)}`, {
      headers: { Authorization: `Token ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { kind: "error" };

    const data = (await res.json()) as { delivery_codes?: { postal_code: PostalCode }[] };
    const entry = data.delivery_codes?.[0]?.postal_code;
    if (!entry) return { kind: "unserviceable" };

    return {
      kind: "serviceable",
      city: entry.city ?? null,
      district: entry.district ?? null,
      state: entry.state_code ?? null,
      cod: entry.cod === "Y",
      prepaid: entry.pre_paid === "Y",
      pickup: entry.pickup === "Y",
    };
  } catch (error) {
    console.error("Delhivery serviceability error:", error);
    return { kind: "error" };
  }
}
