import { NextResponse } from "next/server";

/**
 * Refund submissions are currently closed. Keep this server-side guard in
 * place so direct requests cannot bypass the closed state shown on the page.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message:
        "Refund requests are currently closed and no longer accepting submissions.",
    },
    { status: 410 },
  );
}
