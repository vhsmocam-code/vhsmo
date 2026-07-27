import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { sessionId, source } = await req.json();

  const { error } = await supabase.from("analytics_visits").upsert(
    {
      session_id: sessionId,
      source,
    },
    {
      onConflict: "session_id,source",
    },
  );

  if (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
