import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ANDROID_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.vhsmo.app&hl=en";
const IOS_STORE_URL = "https://apps.apple.com/us/app/vhsmo/id6768032672";

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
