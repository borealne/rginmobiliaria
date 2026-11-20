import { NextResponse } from "next/server";
import { priceText, publicProperties, zoneLabel } from "@/lib/properties";

const HANDOFF_MSG =
  "Te paso con un asesor de RG para que te ayude con esto. Te escribirá en nuestro horario de atención (lunes a viernes de 9:00 a 18:00).";

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export async function POST(req: Request) {
  let body: { message?: string; propertyCode?: string; lang?: "es" | "en" };
  try {
    body = (await req.json()) as { message?: string; propertyCode?: string; lang?: "es" | "en" };
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  const message = String(body.message ?? "").trim().slice(0, 600);
  if (!message) {
    return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
  }

  const t = norm(message);

  // Regla 9: Nunca negociar precio, dar asesoría legal/crédito ni suplantar al asesor
  if (
    /descuent|rebaj|negociab|negociar|precio final|oferta|mejor precio|abogad|legal|escritur|contrato|credit|financ|hipotec|biess|asesor|persona|humano|llamar/.test(
      t,
    )
  ) {
    return NextResponse.json({ handoff: true, kind: "handoff", reply: HANDOFF_MSG });
  }

  const all = publicProperties();
  const ctx = body.propertyCode ? all.find((p) => p.code === body.propertyCode) : undefined;

  // Regla 3: Ubicación solo por zona aproximada
  if (/direcci|calle|ubicacion exacta|donde queda exact|coordenad|numero de casa|como llego/.test(t)) {
    const zone = ctx ? zoneLabel(ctx) : "la zona referencial de la propiedad";
    return NextResponse.json({
      handoff: false,
      kind: "privacy",
      reply: `Por seguridad y privacidad de los propietarios, la ubicación es aproximada (${zone}). La dirección exacta te la damos al coordinar tu visita con un asesor. ¿Te gustaría agendar una visita?`,
    });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (apiKey) {
    const model = process.env.AI_MODEL?.trim() || "gemini-2.5-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const catalogSummary = (ctx ? [ctx] : all.slice(0, 8)).map((p) => ({
      code: p.code,
      title: p.title,
      operation: p.operation,
      status: p.status,
      zone: zoneLabel(p),
      price: priceText(p),
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      areaBuilt: p.areaBuilt,
      areaLand: p.areaLand,
      summary: p.summary,
    }));

    const systemPrompt = [
      "Eres el asistente virtual de RG Inmobiliaria y Constructora (Cuenca, Ecuador y Miami).",
      "Trata al visitante de 'tú', con tono cálido, claro y directo.",
      "NUNCA inventes propiedades, precios, medidas, tasas ni direcciones exactas.",
      "NUNCA prometas descuentos, aprobación de crédito ni asesoría legal.",
      "Responde únicamente con los datos públicos proporcionados abajo y ofrece agendar una visita si aplica.",
      `Catálogo público: ${JSON.stringify(catalogSummary)}`,
    ].join("\n");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nPregunta del visitante: ${message}` }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 320 },
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (reply) {
          return NextResponse.json({ handoff: false, kind: "text", reply, engine: "gemini" });
        }
      }
    } catch {
      /* Continúa con respuesta de respaldo */
    }
  }

  const fallback = ctx
    ? `${ctx.title} está en ${zoneLabel(ctx)} con un valor de ${priceText(ctx)}. Si deseas conocerla o resolver un detalle puntual, podemos agendar una visita.`
    : "Puedo ayudarte a buscar propiedades disponibles en Cuenca o Miami, o coordinar una visita con un asesor. ¿Qué tipo de inmueble buscas?";

  return NextResponse.json({ handoff: false, kind: "text", reply: fallback, engine: "local" });
}
