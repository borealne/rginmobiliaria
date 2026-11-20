import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface LeadPayload {
  origin: string;
  kind?: "comprador" | "arrendatario" | "propietario";
  name: string;
  phone: string;
  email?: string;
  propertyCode?: string;
  note?: string;
  campaign?: string;
  source?: string;
  stage?: string;
}

export async function POST(req: Request) {
  let body: LeadPayload;
  try {
    body = (await req.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  if (name.length < 2 || phone.length < 7) {
    return NextResponse.json({ error: "Nombre y teléfono son obligatorios" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mode: "local", id: `L-${Date.now().toString(36)}` });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, mode: "local", id: `L-${Date.now().toString(36)}` });
  }

  // Asignación automática Round-Robin básica entre asesores activos
  let advisorId: string | null = null;
  const { data: advisors } = await supabase
    .from("profiles")
    .select("id, round_robin_weight")
    .eq("active", true);

  if (advisors && advisors.length > 0) {
    const total = advisors.reduce((s, a) => s + (a.round_robin_weight || 1), 0);
    let r = Math.random() * total;
    for (const adv of advisors) {
      r -= adv.round_robin_weight || 1;
      if (r <= 0) {
        advisorId = adv.id;
        break;
      }
    }
    if (!advisorId) advisorId = advisors[0].id;
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      origin: body.origin || "web-formulario",
      kind: body.kind || "comprador",
      stage: body.stage || "nuevo",
      name,
      phone,
      email: body.email?.trim() || null,
      property_code: body.propertyCode || null,
      advisor_id: advisorId,
      campaign: body.campaign || null,
      source: body.source || null,
      note: body.note?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, mode: "supabase", id: data.id });
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ mode: "local", leads: [] });
  }
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ mode: "local", leads: [] });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ mode: "supabase", leads: data ?? [] });
}

export async function PATCH(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mode: "local" });
  }
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ ok: true, mode: "local" });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await req.json()) as { id?: string; stage?: string; markReplied?: boolean };
  if (!body.id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.stage) patch.stage = body.stage;
  if (body.markReplied) patch.replied_at = new Date().toISOString();

  const { error } = await supabase.from("leads").update(patch).eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, mode: "supabase" });
}
