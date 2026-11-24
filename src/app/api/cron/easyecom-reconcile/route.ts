import { NextResponse } from "next/server";
import { reconcile } from "@/lib/easyecom";
import { isAuthorized } from "@/lib/easyecom/auth-guard";

export const maxDuration = 60;

export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, ...(await reconcile(7)) });
  } catch (error) {
    console.error("easyecom-reconcile failed:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
