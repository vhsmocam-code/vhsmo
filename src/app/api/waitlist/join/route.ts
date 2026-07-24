import { NextResponse } from "next/server";

/**
 * Waitlist is closed - no new signups are accepted. The floating "Join
 * Waitlist" modal has been removed from the site; this endpoint stays as a
 * guard so any stray or deep-linked POSTs can't write new rows. The previous
 * Supabase-insert implementation lives in git history if the waitlist reopens.
 */
export async function POST() {
  return NextResponse.json(
    { success: false, closed: true, message: "The waitlist is closed." },
    { status: 403 },
  );
}
