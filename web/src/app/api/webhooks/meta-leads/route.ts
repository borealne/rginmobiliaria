import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const expected = process.env.META_VERIFY_TOKEN?.trim();

  if (mode === "subscribe" && expected && token === expected && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verificación inválida" }, { status: 403 });
}

interface MetaLeadPayload {
  entry?: {
    changes?: {
      field?: string;
      value?: {
        leadgen_id?: string;
        form_id?: string;
        ad_id?: string;
        campaign_name?: string;
        full_name?: string;
        phone_number?: string;
        email?: string;
      };
    }[];
  }[];
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const appSecret = process.env.META_APP_SECRET?.trim();
  const signature = req.headers.get("x-hub-signature-256") ?? "";

  if (appSecret && signature) {
    const expected = `sha256=${crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }
  }

  let payload: MetaLeadPayload;
  try {
    payload = JSON.parse(rawBody) as MetaLeadPayload;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();
  let created = 0;

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field && change.field !== "leadgen") continue;
      const v = change.value;
      if (!v) continue;

      if (supabase) {
        const { error } = await supabase.from("leads").insert({
          origin: "meta-ads",
          kind: "comprador",
          stage: "nuevo",
          name: v.full_name?.trim() || "Lead Meta Ads",
          phone: v.phone_number?.trim() || "Por confirmar",
          email: v.email?.trim() || null,
          campaign: v.campaign_name || v.ad_id || "Meta Lead Ads",
          source: "Facebook / Instagram Lead Ads",
          note: v.leadgen_id ? `Leadgen ID: ${v.leadgen_id}` : null,
        });
        if (!error) created += 1;
      }
    }
  }

  return NextResponse.json({ ok: true, created });
}
