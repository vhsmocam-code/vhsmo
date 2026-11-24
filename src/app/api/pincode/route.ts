import { NextResponse } from "next/server";
import { lookupPincode } from "@/lib/pincode";

async function checkServiceability(pincode: string) {
  const r = await lookupPincode(pincode);

  switch (r.kind) {
    case "not-configured":
      return NextResponse.json({ error: "Serviceability check is not configured" }, { status: 500 });
    case "invalid":
      return NextResponse.json({ serviceable: false, error: "Enter a valid 6-digit pincode" }, { status: 400 });
    case "error":
      return NextResponse.json({ serviceable: false, error: "Could not verify pincode right now" }, { status: 502 });
    case "unserviceable":
      return NextResponse.json({ serviceable: false, pincode, message: "We don't deliver to this pincode yet" });
    case "serviceable":
      return NextResponse.json({
        serviceable: true,
        pincode,
        city: r.city,
        district: r.district,
        state: r.state,
        cod: r.cod,
        prepaid: r.prepaid,
        pickup: r.pickup,
        message: `Delivery available to ${r.city ?? pincode}`,
      });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pincode = (searchParams.get("pincode") ?? "").trim();
  return checkServiceability(pincode);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const pincode = String(body?.pincode ?? "").trim();
  return checkServiceability(pincode);
}
