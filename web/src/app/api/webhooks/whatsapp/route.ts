import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const expected = process.env.WHATSAPP_VERIFY_TOKEN?.trim();

  if (mode === "subscribe" && expected && token === expected && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verificación inválida" }, { status: 403 });
}

interface WaPayload {
  entry?: {
    changes?: {
      value?: {
        contacts?: { wa_id?: string; profile?: { name?: string } }[];
        messages?: { from?: string; text?: { body?: string } }[];
      };
    }[];
  }[];
}

export async function POST(req: Request) {
  let payload: WaPayload;
  try {
    payload = (await req.json()) as WaPayload;
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();
  let created = 0;

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      const contacts = value?.contacts ?? [];
      for (const msg of value?.messages ?? []) {
        const phone = msg.from || contacts[0]?.wa_id || "";
        const name = contacts.find((c) => c.wa_id === phone)?.profile?.name || "Contacto WhatsApp";
        const body = msg.text?.body?.trim() || "Mensaje recibido por WhatsApp";

        if (supabase && phone) {
          const { error } = await supabase.from("leads").insert({
            origin: "whatsapp",
            kind: "comprador",
            stage: "nuevo",
            name,
            phone,
            source: "WhatsApp Cloud API",
            note: body.slice(0, 500),
          });
          if (!error) created += 1;
        }
      }
    }
  }

  return NextResponse.json({ ok: true, created });
}
