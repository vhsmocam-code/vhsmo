import { NextResponse } from "next/server";
import { ANDROID_STORE_URL, IOS_STORE_URL } from "@/lib/app-links";

export const dynamic = "force-dynamic";


// "0.0.0" means nobody is blocked. Raise these in Vercel only AFTER the new
// build is live on the respective store.
function minVersion(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed && /^\d+(\.\d+){0,2}$/.test(trimmed) ? trimmed : "0.0.0";
}

export async function GET() {
  return NextResponse.json(
    {
      android: {
        minVersion: minVersion(process.env.MIN_APP_VERSION_ANDROID),
        storeUrl: ANDROID_STORE_URL,
      },
      ios: {
        minVersion: minVersion(process.env.MIN_APP_VERSION_IOS),
        storeUrl: IOS_STORE_URL,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
