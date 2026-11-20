import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ mode: "local", settings: {} });
  }
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ mode: "local", settings: {} });

  const { data, error } = await supabase.from("site_settings").select("key, value");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const settings = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
  return NextResponse.json({ mode: "supabase", settings });
}

export async function PUT(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mode: "local" });
  }
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ ok: true, mode: "local" });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = (await req.json()) as { key?: string; value?: unknown };
  if (!body.key) {
    return NextResponse.json({ error: "key requerida" }, { status: 400 });
  }

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: body.key, value: body.value ?? {}, updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, mode: "supabase" });
}
