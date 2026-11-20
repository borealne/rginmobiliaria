"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { FieldError, validatePhone } from "@/components/ui/Field";
import { aiSearch, interpret } from "@/lib/ai-search";
import { PHONE, WHATSAPP } from "@/lib/data/content";
import { submitLead } from "@/lib/leads-local";
import { getProperty, isClosed, priceText, propertyHref, publicProperties, zoneLabel } from "@/lib/properties";
import type { Lang, Property } from "@/lib/types";
import { useVisit } from "./VisitProvider";

/**
 * Asistente de IA (C1 / C2), simulado en el navegador.
 * Reglas (documento maestro 9 y PRD 7.4): se presenta como asistente virtual; un mensaje
 * por turno con una sola pregunta; máximo 3 propiedades; nunca dirección exacta, descuentos
 * ni plazos; no ofrece vendidas ni reservadas; pide permiso antes de guardar datos; pasa
 * a un asesor si se habla de precio, temas legales o financiamiento, o si la persona lo pide.
 */

const HANDOFF = "Te paso con un asesor de RG para que te ayude con esto. Te escribirá en nuestro horario de atención (lunes a viernes de 9:00 a 18:00).";
const PERMISSION = "¿Me permites guardar tu nombre y tu número para que un asesor te contacte? Los usaremos solo para eso, según nuestra Política de privacidad.";
const NO_DATA = "Ese dato no lo tengo a la mano. Un asesor te lo confirma.";

type Msg =
  | { id: number; from: "user"; text: string; time: string }
  | { id: number; from: "bot"; text: string; time: string; props?: { p: Property; similar: boolean }[]; replies?: string[]; kind?: "privacy" | "handoff" | "permission" };

const now = () => new Intl.DateTimeFormat("es-EC", { hour: "2-digit", minute: "2-digit" }).format(new Date());
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function reply(text: string, ctx?: Property): Omit<Extract<Msg, { from: "bot" }>, "id" | "time"> {
  const t = norm(text);
  if (/descuent|rebaj|negociab|negociar|precio final|oferta|mejor precio|abogad|legal|escritur|contrato|credit|financ|hipotec|biess|asesor|persona|humano|llamar/.test(t)) {
    return { from: "bot", kind: "handoff", text: HANDOFF };
  }
  if (/direcci|calle|ubicacion exacta|donde queda exact|coordenad|numero de casa|como llego/.test(t)) {
    const zone = ctx ? zoneLabel(ctx) : "la zona de la propiedad";
    return {
      from: "bot",
      kind: "privacy",
      text: `Por seguridad y privacidad de los propietarios, la ubicación es aproximada (${zone}). La dirección exacta te la damos al coordinar tu visita con un asesor. ¿Te gustaría agendar una visita?`,
      replies: ["Sí, agendar visita", "Mañana en la mañana", "Tarde (14:00 - 18:00)"],
    };
  }
  if (/^(comprar|alquilar)$/.test(t.trim())) {
    return { from: "bot", text: `Perfecto. ¿Qué tipo de propiedad buscas y cuál es tu presupuesto aproximado?` };
  }
  if (ctx && /(cuantos|cuantas|tiene|habitacion|bano|metro|m2|parqueadero|area|terreno|construccion|precio|cuesta|vale)/.test(t)) {
    const parts: string[] = [];
    if (/habitacion|dormitor|cuarto/.test(t) && ctx.bedrooms != null) parts.push(`${ctx.bedrooms} habitaciones`);
    if (/bano/.test(t) && ctx.bathrooms != null) parts.push(`${ctx.bathrooms} baños`);
    if (/parqueadero|garaje/.test(t) && ctx.parking != null) parts.push(`${ctx.parking} parqueaderos`);
    if (/construccion|metro|m2|area/.test(t) && ctx.areaBuilt) parts.push(`${ctx.areaBuilt} m² de construcción`);
    if (/terreno|lote|metro|m2|area/.test(t) && ctx.areaLand) parts.push(`${ctx.areaLand} m² de terreno`);
    if (/precio|cuesta|vale/.test(t)) parts.push(`un precio de ${priceText(ctx)}`);
    if (parts.length) return { from: "bot", text: `${ctx.title} tiene ${parts.join(", ")}. ¿Te gustaría agendar una visita para conocerla?`, replies: ["Sí, agendar visita"] };
    return { from: "bot", text: NO_DATA };
  }
  const cs = interpret(text);
  if (cs.some((c) => c.key !== "operation")) {
    const list = publicProperties().filter((p) => !isClosed(p) && p.status !== "reservada");
    const r = aiSearch(list, cs, "menor");
    const items = (r.exact.length ? r.exact.map((p) => ({ p, similar: false })) : r.similar.map((s) => ({ p: s.p, similar: true }))).slice(0, 3);
    if (!items.length) return { from: "bot", text: "Por ahora no tengo una propiedad con esos criterios. ¿Quieres que un asesor te avise cuando tengamos una?", replies: ["Sí, que me contacten"] };
    return {
      from: "bot",
      text: r.exact.length ? "Encontré estas opciones que se ajustan a lo que buscas:" : "No tengo una coincidencia exacta, pero esta se parece mucho a lo que buscas:",
      props: items,
      replies: ["Sí, agendar visita", "Ver más opciones"],
    };
  }
  if (/si, que me contacten|que me contacten/.test(t)) return { from: "bot", kind: "permission", text: PERMISSION };
  return { from: "bot", text: "Cuéntame qué buscas: el tipo de propiedad, la zona y tu presupuesto. ¿Buscas comprar o alquilar?", replies: ["Comprar", "Alquilar"] };
}

export function Assistant({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const ctx = useMemo(() => {
    const m = pathname.match(/\/propiedades\/([^/]+)$/);
    const p = m ? getProperty(m[1]) : undefined;
    return p && !isClosed(p) ? p : undefined;
  }, [pathname]);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [slow, setSlow] = useState(false);
  const [text, setText] = useState("");
  const [teaser, setTeaser] = useState(true);
  const idRef = useRef(1);
  const scroller = useRef<HTMLDivElement>(null);
  const { openVisit } = useVisit();

  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([
        {
          id: idRef.current++,
          from: "bot",
          time: now(),
          text: ctx
            ? `¡Hola! Soy el asistente virtual de RG Inmobiliaria y Constructora. ¿Qué te gustaría saber de ${ctx.title}?`
            : "¡Hola! Soy el asistente virtual de RG Inmobiliaria y Constructora. ¿Buscas comprar o alquilar en Cuenca?",
          replies: ctx ? ["¿Cuántos metros tiene?", "¿Cuál es la dirección exacta?", "¿Aceptan crédito?"] : ["Comprar", "Alquilar"],
        },
      ]);
    }
  }, [open, msgs.length, ctx]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const send = (raw: string) => {
    const value = raw.trim();
    if (!value || typing) return;
    if (/^s[ií], agendar visita$/i.test(value)) {
      openVisit(ctx);
    }
    setMsgs((m) => [...m, { id: idRef.current++, from: "user", text: value, time: now() }]);
    setText("");
    setTyping(true);
    const slowTimer = setTimeout(() => setSlow(true), 8000);
    setTimeout(
      () => {
        clearTimeout(slowTimer);
        setSlow(false);
        setTyping(false);
        if (/^s[ií], agendar visita$/i.test(value)) {
          setMsgs((m) => [...m, { id: idRef.current++, from: "bot", time: now(), text: "Te abrí el formulario para agendar la visita. Un asesor te confirmará el día y la hora." }]);
          return;
        }
        if (/manana en la manana|tarde \(14/.test(norm(value))) {
          setMsgs((m) => [...m, { id: idRef.current++, from: "bot", time: now(), kind: "permission", text: PERMISSION }]);
          return;
        }
        if (/ver mas opciones/.test(norm(value))) {
          setMsgs((m) => [...m, { id: idRef.current++, from: "bot", time: now(), text: "Puedes ver todas las opciones en la búsqueda. ¿Quieres que te ayude a afinar por zona o presupuesto?", replies: ["Comprar", "Alquilar"] }]);
          return;
        }
        const r = reply(value, ctx);
        const next: Msg[] = [{ ...r, id: idRef.current++, time: now() }];
        if (r.kind === "handoff") next.push({ id: idRef.current++, from: "bot", time: now(), kind: "permission", text: PERMISSION });
        setMsgs((m) => [...m, ...next]);
      },
      900 + Math.random() * 600,
    );
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    send(text);
  };

  return (
    <div className="fab-lift print:hidden fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] flex flex-col items-end gap-space-sm">
      {open && (
        <div
          role="dialog"
          aria-label="Asistente RG"
          className="fixed inset-0 sm:static sm:w-[430px] sm:h-[640px] sm:max-h-[calc(100vh-110px)] bg-surface-container-lowest sm:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in"
        >
          <div className="w-full h-[3px] bg-primary flex" aria-hidden>
            <div className="w-16 h-full bg-rg-red" />
          </div>
          <div className="px-space-md py-3 bg-surface-container-lowest flex items-center justify-between gap-space-md shadow-[0_1px_0_0_rgba(0,0,0,0.06)] shrink-0">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-headline-sm text-sm font-bold">RG</div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-st-available ring-2 ring-surface-container-lowest" aria-hidden />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-title-md text-title-md text-on-surface truncate">Asistente RG</span>
                <span className="font-label-sm text-[11px] text-secondary truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rg-red" aria-hidden />
                  En línea · Te pasa con un asesor cuando lo necesites
                </span>
              </div>
            </div>
            <button aria-label="Cerrar chat" onClick={() => setOpen(false)} className="w-11 h-11 rounded-md flex items-center justify-center hover:bg-surface-container text-on-surface transition-colors" type="button">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div className="px-space-md py-2 bg-surface-container-high/70 flex items-center gap-2 text-secondary font-label-sm text-label-sm shrink-0">
            <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden>
              smart_toy
            </span>
            <span>Estás hablando con un asistente virtual</span>
          </div>
          {ctx && (
            <div className="px-space-md py-2 bg-surface-container-low flex items-center justify-between gap-space-sm shrink-0">
              <div className="flex items-center gap-space-xs min-w-0 text-secondary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px] text-primary shrink-0" aria-hidden>
                  home_work
                </span>
                <span className="truncate">
                  Consultando:{" "}
                  <strong className="text-on-surface font-title-md text-[13px]">
                    {ctx.title} ({ctx.code})
                  </strong>
                </span>
              </div>
              <span className="text-on-surface font-title-md text-[12px] shrink-0">{priceText(ctx)}</span>
            </div>
          )}

          <div ref={scroller} className="flex-1 overflow-y-auto px-space-md py-space-md flex flex-col gap-space-md bg-surface-bright" aria-live="polite">
            <div className="flex justify-center">
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary bg-surface-container px-space-sm py-0.5 rounded-full">Hoy</span>
            </div>
            {msgs.map((m) =>
              m.from === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] bg-primary text-on-primary rounded-2xl rounded-tr-sm px-space-md py-3 shadow-sm">
                    <p className="font-body-md text-body-md leading-snug">{m.text}</p>
                    <span className="block text-right text-[11px] text-surface-variant font-label-sm mt-1">{m.time}</span>
                  </div>
                </div>
              ) : (
                <BotMessage key={m.id} m={m} lang={lang} onReply={send} />
              ),
            )}
            {typing && (
              <div className="flex items-start gap-space-sm" role="status" aria-label="El asistente está escribiendo">
                <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-[11px] font-bold shrink-0">RG</div>
                <div className="bg-surface-container-low rounded-2xl rounded-tl-sm px-4 py-3 flex flex-col gap-1">
                  <span className="flex items-center gap-1">
                    {[0, 1, 2].map((k) => (
                      <span key={k} className="w-1.5 h-1.5 rounded-full bg-secondary animate-dot" style={{ animationDelay: `${k * 0.15}s` }} />
                    ))}
                  </span>
                  {slow && <span className="font-body-sm text-body-sm text-secondary">Estoy tardando más de lo normal. Un asesor te escribirá en breve.</span>}
                </div>
              </div>
            )}
          </div>

          <div className="px-space-md pt-space-sm pb-space-md bg-surface-container-lowest shrink-0 shadow-[0_-1px_0_0_rgba(0,0,0,0.06)] flex flex-col gap-space-xs">
            <form className="flex items-center gap-space-xs" onSubmit={submit}>
              <label htmlFor="chat-input" className="sr-only">
                Escribe tu mensaje
              </label>
              <input
                id="chat-input"
                autoComplete="off"
                maxLength={400}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 h-11 px-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder={ctx ? "Escribe tu consulta sobre la propiedad…" : "Escribe lo que buscas…"}
              />
              <button aria-label="Enviar mensaje" disabled={!text.trim() || typing} className="w-11 h-11 rounded-lg bg-primary text-on-primary flex items-center justify-center hover:opacity-90 transition-all shrink-0 disabled:opacity-40" type="submit">
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </form>
            <p className="text-secondary font-label-sm text-[11px] px-1">Respondo con los datos publicados por RG. No escribas datos personales en el chat.</p>
          </div>
        </div>
      )}

      {!open && (
        <div className="flex items-center gap-space-sm">
          {teaser && (
            <div className="hidden sm:flex items-center gap-1 bg-surface-container-lowest text-on-surface pl-4 pr-1 rounded-full shadow-lg">
              <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2 min-h-11 font-label-md text-label-md">
                <span className="w-2 h-2 rounded-full bg-st-available" aria-hidden />
                {ctx ? `¿Preguntas sobre ${ctx.title}?` : "¿Te ayudo?"}
              </button>
              <button type="button" aria-label="Ocultar mensaje" onClick={() => setTeaser(false)} className="w-9 h-9 rounded-full flex items-center justify-center text-secondary hover:bg-surface-container">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}
          <button
            aria-label="Abrir el asistente RG"
            onClick={() => setOpen(true)}
            className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform relative"
            type="button"
          >
            <span className="font-headline-sm text-sm font-bold tracking-tight">RG</span>
            <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-st-available ring-2 ring-surface-container-lowest" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

function BotMessage({ m, lang, onReply }: { m: Extract<Msg, { from: "bot" }>; lang: Lang; onReply: (t: string) => void }) {
  return (
    <div className="flex items-start gap-space-sm">
      <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-[11px] font-title-md font-bold text-on-surface shrink-0 mt-1" aria-hidden>
        RG
      </div>
      <div className="max-w-[88%] flex flex-col gap-2">
        {m.kind === "permission" ? (
          <PermissionCard />
        ) : (
          <div className={`${m.kind === "handoff" ? "bg-surface-container" : "bg-surface-container-low"} text-on-surface rounded-2xl rounded-tl-sm p-space-md shadow-sm flex flex-col gap-2`}>
            {m.kind === "handoff" && (
              <span className="flex items-center gap-space-xs text-primary font-title-md text-[13px]">
                <span className="material-symbols-outlined text-[18px]" aria-hidden>
                  support_agent
                </span>
                Te paso con un asesor
              </span>
            )}
            {m.kind === "privacy" && (
              <span className="flex items-center gap-space-xs text-primary font-title-md text-[13px]">
                <span className="material-symbols-outlined text-[18px]" aria-hidden>
                  verified_user
                </span>
                Cuidamos tu seguridad
              </span>
            )}
            <p className="font-body-md text-body-md leading-relaxed">{m.text}</p>
            <span className="text-[11px] text-secondary font-label-sm">{m.time} · Asistente RG</span>
          </div>
        )}
        {m.props?.map(({ p, similar }) => (
          <ChatCard key={p.code} p={p} similar={similar} lang={lang} />
        ))}
        {m.kind === "handoff" && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            <a className="inline-flex items-center gap-1.5 px-3 min-h-9 rounded-full bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-label-sm text-[12px]" href="tel:+59372840000">
              <span className="material-symbols-outlined text-[14px]">call</span>
              Llamar ({PHONE})
            </a>
            <a className="inline-flex items-center gap-1.5 px-3 min-h-9 rounded-full bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-label-sm text-[12px]" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">
              <span className="material-symbols-outlined text-[14px]">chat</span>
              Escribir por WhatsApp
            </a>
          </div>
        )}
        {m.replies && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {m.replies.map((r) => (
              <button key={r} type="button" onClick={() => onReply(r)} className="px-3.5 min-h-10 rounded-full border border-primary text-primary bg-surface-container-lowest hover:bg-primary hover:text-on-primary font-label-md text-label-md transition-colors">
                {r}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatCard({ p, similar, lang }: { p: Property; similar: boolean; lang: Lang }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-[#ECEAE7] overflow-hidden shadow-sm">
      <div className="relative aspect-[16/9]">
        <Image src={p.photos[0].src} alt={`${p.title}: ${p.photos[0].room}`} fill sizes="360px" className="object-cover" />
        <div className="absolute top-2 left-2 flex gap-1">
          <span className="px-2 py-0.5 rounded bg-[#111111]/85 text-white font-label-sm text-[11px]">{p.operation === "venta" ? "Venta" : "Alquiler"}</span>
          {similar && <span className="px-2 py-0.5 rounded bg-white text-[#111111] font-label-sm text-[11px] font-semibold">Parecida</span>}
          {p.exclusive && <span className="px-2 py-0.5 rounded bg-[#111111] text-rg-gold font-label-sm text-[11px] font-semibold">★ Exclusiva RG</span>}
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-price-display text-[18px] font-bold">{priceText(p)}</span>
          <span className="font-label-sm text-[11px] text-secondary">CÓD. {p.code}</span>
        </div>
        <span className="font-title-md text-title-md">{p.title}</span>
        <span className="font-body-sm text-body-sm text-secondary">{zoneLabel(p)}</span>
        <Link href={propertyHref(lang, p)} className="mt-1 min-h-10 inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-primary">
          Ver ficha completa <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}

function PermissionCard() {
  const uid = useId();
  const nameId = `${uid}-name`;
  const phoneId = `${uid}-phone`;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "declined">("idle");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (name.trim().length < 3) er.name = "Escribe tu nombre.";
    if (!validatePhone(phone)) er.phone = "Revisa el número.";
    if (!ok) er.ok = "Marca la casilla para darnos tu permiso.";
    setErr(er);
    if (Object.keys(er).length) return;
    setState("sending");
    await submitLead({ origin: "web-asistente", kind: "comprador", name: name.trim(), phone: `+593 ${phone}`, note: "Pidió hablar con un asesor desde el asistente.", stage: "nuevo" });
    setState("done");
  };
  if (state === "done")
    return (
      <div className="flex items-center gap-space-xs p-3 bg-st-available-bg text-st-available rounded-lg font-label-md text-label-md" role="status">
        <span className="material-symbols-outlined icon-fill text-[18px]">check_circle</span>
        Listo. Un asesor te escribirá en nuestro horario de atención.
      </div>
    );
  if (state === "declined")
    return <div className="p-3 bg-surface-container-low rounded-lg font-body-md text-body-md">Entendido, no guardamos tus datos. Puedes escribirnos por WhatsApp cuando quieras.</div>;
  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md flex flex-col gap-space-sm border border-[#ECEAE7]">
      <div className="flex items-start gap-space-xs">
        <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5" aria-hidden>
          verified_user
        </span>
        <p className="font-body-md text-body-md text-on-surface leading-snug">{PERMISSION}</p>
      </div>
      <form className="flex flex-col gap-space-sm mt-1" onSubmit={submit} noValidate>
        <div className="flex flex-col gap-1">
          <label className="font-label-sm text-[12px] text-secondary" htmlFor={nameId}>
            Nombre
          </label>
          <input id={nameId} value={name} onChange={(e) => setName(e.target.value)} className="h-11 px-3 rounded-lg bg-surface-bright text-on-surface font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary shadow-sm" placeholder="Ej. Andrés Vintimilla" aria-invalid={err.name ? true : undefined} />
          <FieldError id={`${nameId}-err`}>{err.name}</FieldError>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-label-sm text-[12px] text-secondary" htmlFor={phoneId}>
            Teléfono (WhatsApp)
          </label>
          <div className="flex items-center bg-surface-bright rounded-lg overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-primary">
            <span className="px-3 h-11 flex items-center text-secondary font-label-md text-label-md bg-surface-container-high shrink-0">+593</span>
            <input id={phoneId} type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11 px-3 w-full bg-transparent text-on-surface font-body-md text-body-md focus:outline-none" placeholder="099 876 5432" aria-invalid={err.phone ? true : undefined} />
          </div>
          <FieldError id={`${phoneId}-err`}>{err.phone}</FieldError>
        </div>
        <label className="flex items-start gap-space-sm cursor-pointer mt-1 min-h-11">
          <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-1 w-4 h-4 rounded accent-primary" />
          <span className="font-body-sm text-[12px] text-secondary leading-tight">Sí, acepto que RG me contacte según la Política de privacidad.</span>
        </label>
        <FieldError id="perm-ok-err">{err.ok}</FieldError>
        <button type="submit" disabled={state === "sending"} className="w-full mt-1 h-11 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-space-xs hover:opacity-90 disabled:opacity-70">
          {state === "sending" ? "Enviando…" : "Conectar con un asesor"}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
        <button type="button" onClick={() => setState("declined")} className="min-h-10 font-label-md text-label-md text-secondary hover:text-primary">
          No, gracias
        </button>
      </form>
    </div>
  );
}
