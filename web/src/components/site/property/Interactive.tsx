"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { Consent, FieldError, validateEmail, validatePhone } from "@/components/ui/Field";
import { useFavorites } from "@/components/site/Favorites";
import { useVisit } from "@/components/site/VisitProvider";
import { WHATSAPP } from "@/lib/data/content";
import { submitLead } from "@/lib/leads-local";
import { parseVideoUrl } from "@/lib/video";
import type { FeatureGroup, Lang, Property } from "@/lib/types";

/* ------------------------------ Guardar / Compartir ------------------------------ */
export function SaveShare({ p }: { p: Property }) {
  const { has, toggle } = useFavorites();
  const [copied, setCopied] = useState(false);
  const on = has(p.code);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: p.title, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* cancelado */
    }
  };
  const cls =
    "h-11 px-5 rounded-lg border border-[#ECEAE7] bg-surface-container-lowest hover:border-primary text-primary font-label-md text-label-md flex items-center gap-2 transition-colors";
  return (
    <div className="flex items-center gap-3">
      <button type="button" className={cls} aria-pressed={on} onClick={() => toggle(p.code)}>
        <span className={`material-symbols-outlined text-[20px] ${on ? "icon-fill" : ""}`}>favorite</span>
        <span>{on ? "Guardada" : "Guardar"}</span>
      </button>
      <button type="button" className={cls} onClick={share}>
        <span className="material-symbols-outlined text-[20px]">{copied ? "check" : "share"}</span>
        <span aria-live="polite">{copied ? "Enlace copiado" : "Compartir"}</span>
      </button>
    </div>
  );
}

/* ------------------------------ Menú fijo de secciones ------------------------------ */
export function SectionNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-140px 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);
  return (
    <nav aria-label="Secciones de la ficha" className="sticky top-16 md:top-20 z-30 bg-surface-container-lowest/95 backdrop-blur py-2 border-b border-surface-variant flex items-center gap-6 overflow-x-auto no-scrollbar -mx-gutter-mobile px-gutter-mobile lg:mx-0 lg:px-0">
      {items.map((i) => (
        <a
          key={i.id}
          href={`#${i.id}`}
          aria-current={active === i.id ? "true" : undefined}
          className={`min-h-11 inline-flex items-center font-label-md text-label-md whitespace-nowrap border-b-2 transition-colors ${
            active === i.id ? "font-semibold text-primary border-primary" : "text-secondary hover:text-primary border-transparent"
          }`}
        >
          {i.label}
        </a>
      ))}
    </nav>
  );
}

/* ------------------------------ Características por categoría ------------------------------ */
export function FeatureTabs({
  groups,
  lang = "es",
  code,
}: {
  groups: FeatureGroup[];
  lang?: Lang;
  code?: string;
}) {
  const [overrideGroups, setOverrideGroups] = useState<FeatureGroup[] | null>(null);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!code) return;
    const sync = () => {
      try {
        const raw = localStorage.getItem("rg-panel-propiedades");
        if (!raw) return;
        const map = JSON.parse(raw) as Record<string, Partial<Property>>;
        const ov = map[code];
        if (ov && Array.isArray(ov.featureGroups)) {
          setOverrideGroups(ov.featureGroups);
        }
      } catch {
        /* ignore */
      }
    };
    sync();
    window.addEventListener("rg-panel-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("rg-panel-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [code]);

  const activeGroups = (overrideGroups ?? groups).filter((g) => g.visible !== false && g.items.length > 0);
  if (activeGroups.length === 0) return null;

  const safeIdx = i < activeGroups.length ? i : 0;
  const g = activeGroups[safeIdx];

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-[#ECEAE7] p-5 sm:p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between flex-wrap gap-4 pb-5 border-b border-surface-variant">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]" aria-hidden>
              tune
            </span>
          </div>
          <div>
            <h3 className="font-title-md text-title-md font-bold text-primary">
              {lang === "en" ? "Features & Details" : "Características y detalles"}
            </h3>
            <p className="font-body-sm text-body-sm text-secondary">
              {lang === "en"
                ? "Explore finishes and installations by category"
                : "Explora los acabados e instalaciones por categoría"}
            </p>
          </div>
        </div>
        <div
          className="flex items-center p-1 rounded-lg bg-surface-container-low border border-[#ECEAE7] overflow-x-auto max-w-full no-scrollbar"
          role="tablist"
          aria-label={lang === "en" ? "Categories" : "Categorías"}
        >
          {activeGroups.map((x, k) => {
            const catTitle = lang === "en" ? x.titleEn || x.title : x.title;
            return (
              <button
                key={`${x.title}-${k}`}
                type="button"
                role="tab"
                id={`ft-tab-${k}`}
                aria-selected={k === safeIdx}
                aria-controls="ft-panel"
                onClick={() => setI(k)}
                className={`px-4 min-h-10 rounded-md font-label-md text-label-md transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  k === safeIdx
                    ? "bg-surface-container-lowest text-primary shadow-sm font-semibold"
                    : "text-secondary hover:text-primary"
                }`}
              >
                {x.customIcon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={x.customIcon} alt="" className="w-4 h-4 object-contain" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]" aria-hidden>
                    {x.icon || "tune"}
                  </span>
                )}
                <span>{catTitle}</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-[11px]">
                  {x.items.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div
        id="ft-panel"
        role="tabpanel"
        aria-labelledby={`ft-tab-${safeIdx}`}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5"
      >
        {g.items.map((it, idx) => {
          const itemLabel = lang === "en" ? it.labelEn || it.label : it.label;
          const itemDetail = lang === "en" ? it.detailEn || it.detail : it.detail;
          return (
            <div
              key={`${it.label}-${idx}`}
              className="flex items-center gap-3.5 p-3.5 rounded-lg bg-surface-container-low/70 border border-[#ECEAE7]"
            >
              <div className="w-10 h-10 rounded-full bg-white text-[#141414] border border-[#ECEAE7] shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                {it.customIcon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.customIcon} alt="" className="w-5 h-5 object-contain" />
                ) : (
                  <span className="material-symbols-outlined text-[20px] text-[#141414]" aria-hidden>
                    {it.icon || "check_circle"}
                  </span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-title-md text-label-md font-semibold text-primary">{itemLabel}</span>
                {itemDetail && <span className="font-body-sm text-[12px] text-secondary">{itemDetail}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ Video ------------------------------ */
export function VideoBlock({
  thumb,
  videoUrl,
  title,
  code,
}: {
  thumb?: string;
  videoUrl?: string;
  title: string;
  code?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [overrideUrl, setOverrideUrl] = useState<string | null | undefined>(undefined);
  const [overrideThumb, setOverrideThumb] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!code) return;
    const sync = () => {
      try {
        const raw = localStorage.getItem("rg-panel-propiedades");
        if (!raw) return;
        const map = JSON.parse(raw) as Record<string, Partial<Property>>;
        const ov = map[code];
        if (ov) {
          if ("videoUrl" in ov) {
            setOverrideUrl(ov.videoUrl ?? null);
          }
          if (ov.videoThumb) {
            setOverrideThumb(ov.videoThumb);
          }
        }
      } catch {
        /* ignore */
      }
    };
    sync();
    window.addEventListener("rg-panel-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("rg-panel-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [code]);

  // Si en el panel se quitó explícitamente el video (overrideUrl === null)
  if (overrideUrl === null) return null;

  const activeUrl = overrideUrl || videoUrl || (thumb ? "https://www.youtube.com/watch?v=ScMzIvxBSi4" : "");
  const activeThumb = overrideThumb || thumb || "/img/p/19.jpg";
  const parsed = parseVideoUrl(activeUrl);

  if (!thumb && !videoUrl && !overrideUrl) return null;

  return (
    <section className="scroll-mt-36" id="video">
      <div className="flex flex-col items-start mb-4">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg font-bold tracking-tight text-[#111111]">
          Video del inmueble
        </h2>
        <div className="w-12 h-[3px] bg-rg-red rounded-full mt-2" aria-hidden />
      </div>

      {!playing ? (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#141414] group shadow-md block cursor-pointer"
          aria-label={`Reproducir video: ${title}`}
        >
          <Image
            src={activeThumb}
            alt=""
            fill
            sizes="(min-width: 1024px) 800px, 100vw"
            className="object-cover opacity-80 group-hover:opacity-65 group-hover:scale-105 transition-all duration-500"
            unoptimized={activeThumb.startsWith("data:") || activeThumb.startsWith("blob:")}
          />
          <span className="absolute inset-0 bg-gradient-to-t from-[#141414]/80 via-[#141414]/20 to-transparent" />
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="w-20 h-20 rounded-full bg-[#141414]/90 text-[#F5F3EE] border border-[#F5F3EE]/20 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-[#D9381E] group-hover:border-[#D9381E] transition-all duration-300">
              <span className="material-symbols-outlined icon-fill text-[40px] ml-1">play_arrow</span>
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-[#141414]/85 backdrop-blur text-[#F5F3EE] font-label-md text-label-md border border-[#F5F3EE]/15">
              Recorrido en video · {parsed.valid ? parsed.label : "YouTube"} (16:9)
            </span>
          </span>
        </button>
      ) : (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#141414] shadow-lg border border-[#141414]/15">
          {parsed.platform === "mp4" && parsed.embedUrl ? (
            <video src={parsed.embedUrl} controls autoPlay playsInline className="w-full h-full object-cover" />
          ) : parsed.platform === "tiktok" ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#141414] text-[#F5F3EE] p-4">
              {parsed.embedUrl ? (
                <iframe
                  src={parsed.embedUrl}
                  title={`Video TikTok: ${title}`}
                  className="w-full max-w-[340px] h-full border-0 bg-[#141414]"
                  allow="encrypted-media; fullscreen"
                />
              ) : (
                <div className="text-center space-y-3 max-w-md">
                  <span className="material-symbols-outlined text-[44px] text-[#D9381E]">smart_display</span>
                  <p className="font-title-md text-title-md font-semibold">{title}</p>
                  <p className="text-body-sm text-[#F5F3EE]/75">
                    Haz clic abajo para ver el recorrido en TikTok si tu navegador bloquea reproductores externos.
                  </p>
                </div>
              )}
              <a
                href={parsed.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 px-3.5 py-2 rounded-lg bg-[#141414]/90 border border-[#F5F3EE]/20 text-[#F5F3EE] text-label-sm font-semibold hover:bg-[#D9381E] hover:border-[#D9381E] transition-colors inline-flex items-center gap-1.5"
              >
                Abrir en TikTok
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            </div>
          ) : parsed.embedUrl ? (
            <iframe
              src={`${parsed.embedUrl}${parsed.embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
              title={`Video: ${title}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#F5F3EE] p-6 text-center gap-3">
              <span className="material-symbols-outlined text-[36px] text-[#D9381E]">videocam</span>
              <p className="font-body-md text-body-md">Recorrido audiovisual de {title}</p>
              {parsed.externalUrl && (
                <a
                  href={parsed.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-[#D9381E] text-white font-label-md text-label-md font-semibold"
                >
                  Abrir video externo
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ------------------------------ Columna de contacto ------------------------------ */
export function ContactCard({ p, lang }: { p: Property; lang: Lang }) {
  const { openVisit } = useVisit();
  const closed = p.status === "vendida" || p.status === "alquilada";
  const [f, setF] = useState({ name: "", phone: "", email: "", msg: `Hola, me interesa la propiedad ${p.code} en ${p.zone}.`, consent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const set = (k: keyof typeof f, v: string | boolean) => setF((x) => ({ ...x, [k]: v }));

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.name.trim().length < 3) er.name = "Escribe tu nombre completo.";
    if (!validatePhone(f.phone)) er.phone = "Escribe un número de 9 a 10 dígitos.";
    if (f.email && !validateEmail(f.email)) er.email = "Revisa el correo.";
    if (!f.consent) er.consent = "Necesitamos tu permiso para contactarte.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setState("sending");
    await submitLead({
      origin: "web-formulario",
      kind: p.operation === "alquiler" ? "arrendatario" : "comprador",
      name: f.name.trim(),
      phone: f.phone,
      email: f.email || undefined,
      propertyCode: p.code,
      propertyTitle: p.title,
      note: f.msg,
      stage: "nuevo",
    });
    setState("done");
  };

  const input =
    "w-full h-11 px-3.5 rounded-lg border border-[#ECEAE7] bg-surface-container-lowest font-body-md text-primary placeholder:text-secondary/70 focus:outline-none focus:ring-1 focus:ring-primary aria-[invalid=true]:border-error aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error disabled:bg-surface-container-low";

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 border border-[#ECEAE7] shadow-sm">
      <div className="mb-4">
        <h3 className="font-headline-sm text-headline-sm font-bold text-primary">{closed ? "Esta propiedad ya no está disponible" : "Agenda una visita"}</h3>
        <p className="font-body-sm text-body-sm text-secondary mt-1">
          {closed ? "Te mostramos propiedades parecidas más abajo. Un asesor puede ayudarte a encontrar otra." : "Un asesor te confirmará el día y la hora de tu recorrido."}
        </p>
      </div>
      {state === "done" ? (
        <div className="p-4 rounded-lg bg-st-available-bg text-st-available flex items-start gap-2" role="status">
          <span className="material-symbols-outlined icon-fill">check_circle</span>
          <p className="font-body-md text-body-md">Recibimos tu mensaje. Un asesor te escribirá pronto.</p>
        </div>
      ) : (
        <form className="flex flex-col gap-3.5" onSubmit={send} noValidate>
          <fieldset disabled={closed} className="flex flex-col gap-3.5 disabled:opacity-60">
            <div>
              <label htmlFor="cc-name" className="block font-label-sm text-label-sm font-medium text-primary mb-1">
                Nombre completo
              </label>
              <input id="cc-name" className={input} placeholder="Ej. Carlos Morales" autoComplete="name" value={f.name} onChange={(e) => set("name", e.target.value)} aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? "cc-name-err" : undefined} />
              <FieldError id="cc-name-err">{errors.name}</FieldError>
            </div>
            <div>
              <label htmlFor="cc-phone" className="block font-label-sm text-label-sm font-medium text-primary mb-1">
                Teléfono (WhatsApp)
              </label>
              <input id="cc-phone" type="tel" inputMode="tel" className={input} placeholder="+593 99 999 9999" autoComplete="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={errors.phone ? true : undefined} aria-describedby={errors.phone ? "cc-phone-err" : undefined} />
              <FieldError id="cc-phone-err">{errors.phone}</FieldError>
            </div>
            <div>
              <label htmlFor="cc-email" className="block font-label-sm text-label-sm font-medium text-primary mb-1">
                Correo electrónico <span className="font-normal text-secondary">(opcional)</span>
              </label>
              <input id="cc-email" type="email" className={input} placeholder="carlos@correo.com" autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? "cc-email-err" : undefined} />
              <FieldError id="cc-email-err">{errors.email}</FieldError>
            </div>
            <div>
              <label htmlFor="cc-msg" className="block font-label-sm text-label-sm font-medium text-primary mb-1">
                Mensaje
              </label>
              <textarea id="cc-msg" rows={3} className={`${input} h-auto py-2.5 resize-none`} value={f.msg} onChange={(e) => set("msg", e.target.value)} />
            </div>
            <Consent lang={lang} id="cc-consent" checked={f.consent} onChange={(v) => set("consent", v)} error={errors.consent} />
          </fieldset>
          <div className="flex flex-col gap-2.5 pt-1">
            <button
              type="button"
              disabled={closed}
              onClick={() => openVisit(p)}
              className="h-12 w-full rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 hover:bg-primary-container transition-colors disabled:bg-surface-container-high disabled:text-secondary"
            >
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
              Agendar una visita
            </button>
            <a
              href={closed ? undefined : `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(f.msg)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={closed}
              className={`h-12 w-full rounded-lg border font-label-md text-label-md font-semibold flex items-center justify-center gap-2 transition-colors ${
                closed ? "border-[#ECEAE7] text-secondary pointer-events-none" : "border-primary text-primary hover:bg-surface-container-low"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              Escribir por WhatsApp
            </a>
            <button
              type="submit"
              disabled={closed || state === "sending"}
              className="min-h-11 w-full rounded-lg font-label-md text-label-md font-semibold text-primary underline underline-offset-4 hover:text-secondary disabled:text-secondary disabled:no-underline"
            >
              {state === "sending" ? "Enviando…" : "Enviar mensaje"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
