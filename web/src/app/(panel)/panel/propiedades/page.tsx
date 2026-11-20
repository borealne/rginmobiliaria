"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/panel/Shell";
import { usePanel } from "@/components/panel/PanelProvider";
import { StatusChip } from "@/components/ui/Badges";
import { CloseButton, Modal } from "@/components/ui/Modal";
import { privateOf } from "@/lib/data/private";
import { isClosed, isPublic, priceText, STATUS_META } from "@/lib/properties";
import type { Property, Status } from "@/lib/types";

const PER_PAGE = 10;
const SLIDER_MAX = 5;

function Kpi({ label, icon, value, sub, dot }: { label: string; icon: string; value: number | string; sub: string; dot: string }) {
  return (
    <div className="group p-6 rounded-xl bg-surface-container-lowest border border-[#141414]/10 shadow-sm flex flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-md hover:border-[#141414]/25">
      <div className="flex items-center justify-between">
        <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">{label}</span>
        <div className="w-9 h-9 rounded-lg bg-[#F5F3EE] text-[#141414] flex items-center justify-center transition-colors duration-300 group-hover:bg-[#141414] group-hover:text-white">
          <span className="material-symbols-outlined text-[20px]" aria-hidden>
            {icon}
          </span>
        </div>
      </div>
      <div className="mt-4">
        <span className="font-display-xl text-display-xl-mobile md:text-display-xl text-primary font-bold tracking-tight transition-colors duration-300 group-hover:text-[#D9381E]">
          {value}
        </span>
        <div className="flex items-center gap-1.5 mt-1 text-secondary font-body-sm text-body-sm">
          <span className={`inline-block w-2 h-2 rounded-full ${dot}`} aria-hidden />
          <span>{sub}</span>
        </div>
      </div>
    </div>
  );
}

function exportCsv(rows: Property[]) {
  const head = ["Código", "Título", "Tipo", "Operación", "Estado", "Precio", "Zona", "Publicada"];
  const body = rows.map((p) => [p.code, p.title, p.type, p.operation, p.status, p.price, p.zone, p.published ? "Sí" : "Borrador"]);
  const csv = [head, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "inventario-rg.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function InventoryPage() {
  const { properties, updateProperty, toast, role } = usePanel();
  const [q, setQ] = useState("");
  const [op, setOp] = useState("");
  const [st, setSt] = useState("");
  const [pub, setPub] = useState("");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<Property | null>(null);
  const [menu, setMenu] = useState<string | null>(null);

  const sliderCount = properties.filter((p) => p.slider).length;
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return properties.filter((p) => {
      if (t && !`${p.title} ${p.code} ${p.zone}`.toLowerCase().includes(t)) return false;
      if (op && p.operation !== op) return false;
      if (st && p.status !== st) return false;
      if (pub === "exclusiva" && !p.exclusive) return false;
      if (pub === "compartida" && p.exclusive) return false;
      if (pub === "borrador" && p.published) return false;
      return true;
    });
  }, [properties, q, op, st, pub]);
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const rows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const activeFilters = [op, st, pub].filter(Boolean).length + (q ? 1 : 0);

  const toggleSlider = (p: Property) => {
    if (p.slider) {
      updateProperty(p.code, { slider: false });
      toast(`${p.code} salió del slider de inicio`);
    } else if (sliderCount >= SLIDER_MAX) {
      toast(`El slider ya tiene ${SLIDER_MAX} propiedades. Quita una primero.`);
    } else {
      updateProperty(p.code, { slider: true });
      toast(`${p.code} entró al slider de inicio (${sliderCount + 1}/${SLIDER_MAX})`);
    }
  };

  const closeLabel = (p: Property) => (p.operation === "venta" ? "Marcar como vendida" : "Marcar como alquilada");

  const doClose = (p: Property) => {
    const status: Status = p.operation === "venta" ? "vendida" : "alquilada";
    updateProperty(p.code, { status, slider: false, closedAt: new Date().toISOString().slice(0, 10) });
    setConfirm(null);
    toast(`${p.code} marcada como ${STATUS_META[status].label.toLowerCase()}. Se verá 30 días en la web.`);
  };

  const sel = "h-11 pl-3 pr-9 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface appearance-none focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="flex flex-col w-full">
      <PageHeader
        crumbs={["Panel", "Propiedades", "Inventario general"]}
        title="Inventario de propiedades"
        text="Todo el catálogo, su estado de publicación y el slider del inicio."
        actions={
          <>
            <button
              type="button"
              onClick={() => exportCsv(filtered)}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md hover:bg-surface-container transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[19px]">file_download</span>
              Exportar
            </button>
            <Link href="/panel/propiedades/nueva" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-md">
              <span className="material-symbols-outlined text-[20px]">add</span>
              Nueva propiedad
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 pb-8">
        <Kpi label="Total propiedades" icon="domain" value={properties.length} sub={`${properties.filter((p) => isPublic(p)).length} visibles en la web`} dot="bg-st-available" />
        <Kpi label="En venta" icon="sell" value={properties.filter((p) => p.operation === "venta").length} sub={`${properties.filter((p) => p.status === "reservada").length} reservadas`} dot="bg-st-reserved" />
        <Kpi label="En alquiler" icon="key" value={properties.filter((p) => p.operation === "alquiler").length} sub={`${properties.filter((p) => p.operation === "alquiler" && p.status === "disponible").length} disponibles`} dot="bg-st-available" />
        <div className="group p-6 rounded-xl bg-surface-container-lowest border border-[#141414]/10 shadow-sm flex flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-md hover:border-[#141414]/25">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Slider de inicio</span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold bg-st-reserved-bg text-st-reserved whitespace-nowrap">
                Espacios {sliderCount} de {SLIDER_MAX}
              </span>
              <div className="w-9 h-9 rounded-lg bg-[#F5F3EE] text-[#141414] flex items-center justify-center transition-colors duration-300 group-hover:bg-[#141414] group-hover:text-white shrink-0">
                <span className="material-symbols-outlined text-[20px]" aria-hidden>
                  view_carousel
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="font-headline-md text-headline-md text-primary font-bold transition-colors duration-300 group-hover:text-[#D9381E]">
                {sliderCount >= SLIDER_MAX ? "Completo" : `${SLIDER_MAX - sliderCount} libre${SLIDER_MAX - sliderCount > 1 ? "s" : ""}`}
              </span>
              <span className="font-label-sm text-label-sm font-semibold text-secondary">{Math.round((sliderCount / SLIDER_MAX) * 100)} %</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden" role="progressbar" aria-valuenow={sliderCount} aria-valuemax={SLIDER_MAX} aria-label="Espacios del slider usados">
              <div className="h-full bg-rg-gold rounded-full transition-all duration-300" style={{ width: `${(sliderCount / SLIDER_MAX) * 100}%` }} />
            </div>
            <p className="font-body-sm text-body-sm text-secondary mt-3">Máximo 5 propiedades. Se eligen en la tabla.</p>
          </div>
        </div>
      </div>

      <div className="p-4 mb-6 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline" aria-hidden>
              search
            </span>
            <label htmlFor="inv-q" className="sr-only">
              Buscar por nombre, código o zona
            </label>
            <input
              id="inv-q"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre, código o zona"
              className="w-full h-11 pl-9 pr-4 rounded-lg bg-surface-container-low font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {[
            { v: op, set: setOp, label: "Operación", opts: [["venta", "Venta"], ["alquiler", "Alquiler"]] },
            { v: st, set: setSt, label: "Estado", opts: Object.entries(STATUS_META).map(([k, m]) => [k, m.label]) },
            { v: pub, set: setPub, label: "Publicación", opts: [["exclusiva", "Exclusiva RG"], ["compartida", "Compartida"], ["borrador", "Borrador"]] },
          ].map((f) => (
            <div key={f.label} className="relative">
              <label className="sr-only" htmlFor={`inv-${f.label}`}>
                {f.label}
              </label>
              <select
                id={`inv-${f.label}`}
                className={`${sel} w-full lg:w-44`}
                value={f.v}
                onChange={(e) => {
                  f.set(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">{f.label}: todas</option>
                {f.opts.map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-secondary pointer-events-none">expand_more</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between font-body-sm text-body-sm text-secondary">
          <span>
            {filtered.length} {filtered.length === 1 ? "propiedad" : "propiedades"}
            {activeFilters > 0 && ` · ${activeFilters} ${activeFilters === 1 ? "filtro activo" : "filtros activos"}`}
          </span>
          {activeFilters > 0 && (
            <button
              type="button"
              className="min-h-9 underline hover:text-primary"
              onClick={() => {
                setQ("");
                setOp("");
                setSt("");
                setPub("");
                setPage(1);
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[1040px]">
            <caption className="sr-only">Inventario de propiedades</caption>
            <thead>
              <tr className="bg-surface-container-low text-secondary font-label-sm text-label-sm uppercase tracking-wider select-none">
                <th scope="col" className="py-4 pl-6 pr-4 font-semibold">
                  Propiedad / Código
                </th>
                <th scope="col" className="py-4 px-4 font-semibold">
                  Zona
                </th>
                <th scope="col" className="py-4 px-4 font-semibold">
                  Operación y precio
                </th>
                <th scope="col" className="py-4 px-4 font-semibold">
                  Estado
                </th>
                <th scope="col" className="py-4 px-4 font-semibold">
                  Publicación
                </th>
                <th scope="col" className="py-4 px-4 font-semibold text-center">
                  Slider inicio
                </th>
                <th scope="col" className="py-4 pr-6 pl-4 font-semibold text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm text-on-surface">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-secondary">
                    No hay propiedades con esos filtros.
                  </td>
                </tr>
              )}
              {rows.map((p) => {
                const closed = isClosed(p);
                const priv = privateOf(p.code);
                const pos = properties.filter((x) => x.slider).findIndex((x) => x.code === p.code) + 1;
                const sliderDisabled = closed || !p.published || (!p.slider && sliderCount >= SLIDER_MAX);
                return (
                  <tr key={p.code} className={`transition-colors group ${closed ? "bg-surface-container-low/60" : "hover:bg-surface"}`}>
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-16 h-11 rounded-lg overflow-hidden shrink-0 bg-surface-container flex items-center justify-center">
                          {p.photos[0] ? (
                            <Image src={p.photos[0].src} alt="" fill sizes="64px" className={`object-cover ${closed ? "grayscale" : ""}`} unoptimized={p.photos[0].src.startsWith("blob:")} />
                          ) : (
                            <span className="material-symbols-outlined text-[20px] text-secondary" aria-hidden>
                              photo
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <Link href={`/panel/propiedades/${p.code}`} title={p.title} className={`block max-w-[240px] font-title-md text-title-md font-semibold truncate leading-snug hover:underline ${closed ? "text-secondary" : "text-primary"}`}>
                            {p.title}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-label-sm text-label-sm text-secondary bg-surface-container px-1.5 py-0.5 rounded">{p.code}</span>
                            <button
                              className="w-7 h-7 flex items-center justify-center text-secondary hover:text-primary"
                              aria-label={`Copiar código ${p.code}`}
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(p.code).catch(() => {});
                                toast(`Código ${p.code} copiado`);
                              }}
                            >
                              <span className="material-symbols-outlined text-[14px]">content_copy</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-primary">{p.city}</span>
                        <span className="text-secondary font-label-sm text-label-sm">{p.zone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-title-md text-title-md font-bold text-primary">{priceText(p)}</span>
                        <span className="font-label-sm text-label-sm text-secondary">{p.operation === "venta" ? "Venta" : "Alquiler"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <StatusChip status={p.status} progress={p.progress} />
                    </td>
                    <td className="py-4 px-4">
                      {!p.published ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-label-sm font-label-sm font-semibold border border-dashed border-outline text-secondary hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                          <span className="material-symbols-outlined text-[14px]">draft</span> Borrador
                        </span>
                      ) : p.exclusive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-label-sm font-label-sm font-semibold bg-primary text-rg-gold shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                          ★ Exclusiva RG
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-label-sm font-label-sm bg-surface-container text-on-surface hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                          <span className="material-symbols-outlined text-[14px]">handshake</span> Compartida
                        </span>
                      )}
                      {closed && !isPublic(p) && <span className="block mt-1 font-label-sm text-[11px] text-secondary">Oculta en la web</span>}
                      {priv.expires && p.exclusive && !closed && <span className="block mt-1 font-label-sm text-[11px] text-secondary">Vence el {priv.expires.split("-").reverse().join("/")}</span>}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <label className={`relative inline-flex items-center min-h-11 ${sliderDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                          <input
                            type="checkbox"
                            role="switch"
                            className="sr-only peer"
                            checked={!!p.slider}
                            disabled={sliderDisabled}
                            onChange={() => toggleSlider(p)}
                            aria-label={`Mostrar ${p.code} en el slider de inicio`}
                          />
                          <span className="w-10 h-5 bg-surface-variant rounded-full relative transition-colors peer-checked:bg-primary peer-disabled:opacity-50 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                        </label>
                        <span className="font-label-sm text-label-sm text-secondary flex items-center gap-1">
                          {closed ? (
                            <>
                              <span className="material-symbols-outlined text-[14px]">lock</span> Bloqueada
                            </>
                          ) : p.slider ? (
                            `Posición ${pos}`
                          ) : (
                            "No"
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 pr-6 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 relative">
                        <Link href={`/panel/propiedades/${p.code}`} className="px-3 min-h-10 inline-flex items-center rounded-lg bg-surface-container text-primary font-label-sm text-label-sm font-medium hover:bg-surface-variant transition-colors">
                          Editar
                        </Link>
                        <button
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-secondary hover:bg-surface-container hover:text-primary transition-colors"
                          type="button"
                          aria-label={`Más acciones para ${p.code}`}
                          aria-expanded={menu === p.code}
                          onClick={() => setMenu(menu === p.code ? null : p.code)}
                        >
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                        {menu === p.code && (
                          <div className="absolute right-0 top-11 z-20 w-60 bg-surface-container-lowest rounded-lg border border-[#ECEAE7] shadow-[0_12px_32px_rgba(17,17,17,0.08)] py-1 text-left" role="menu" onMouseLeave={() => setMenu(null)}>
                            {!closed && (
                              <button role="menuitem" type="button" className="w-full min-h-11 px-4 flex items-center gap-2 hover:bg-surface-container-low" onClick={() => (setConfirm(p), setMenu(null))}>
                                <span className="material-symbols-outlined text-[18px]">{p.operation === "venta" ? "sell" : "key"}</span>
                                {closeLabel(p)}
                              </button>
                            )}
                            <button
                              role="menuitem"
                              type="button"
                              className="w-full min-h-11 px-4 flex items-center gap-2 hover:bg-surface-container-low"
                              onClick={() => {
                                updateProperty(p.code, { published: !p.published, slider: p.published ? false : p.slider });
                                toast(p.published ? `${p.code} oculta (no se borra)` : `${p.code} publicada`);
                                setMenu(null);
                              }}
                            >
                              <span className="material-symbols-outlined text-[18px]">{p.published ? "visibility_off" : "visibility"}</span>
                              {p.published ? "Ocultar de la web" : "Publicar en la web"}
                            </button>
                            {isPublic(p) && (
                              <a role="menuitem" href={`/es/propiedades/${p.slug}`} target="_blank" className="w-full min-h-11 px-4 flex items-center gap-2 hover:bg-surface-container-low">
                                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                Ver en la web
                              </a>
                            )}
                            {role !== "super" && <p className="px-4 py-2 font-label-sm text-[11px] text-secondary">Algunas acciones necesitan al super admin.</p>}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-surface-container-low font-body-sm text-body-sm text-secondary">
          <span>
            Mostrando {filtered.length ? (page - 1) * PER_PAGE + 1 : 0} a {Math.min(page * PER_PAGE, filtered.length)} de {filtered.length} propiedades
          </span>
          <div className="flex items-center gap-1">
            <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="min-h-10 px-3 rounded-lg flex items-center gap-1 hover:bg-surface-container disabled:opacity-40">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span> Anterior
            </button>
            {Array.from({ length: pages }, (_, k) => k + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-current={n === page ? "page" : undefined}
                onClick={() => setPage(n)}
                className={`w-10 h-10 rounded-lg ${n === page ? "bg-primary text-on-primary font-semibold" : "hover:bg-surface-container"}`}
              >
                {n}
              </button>
            ))}
            <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className="min-h-10 px-3 rounded-lg flex items-center gap-1 hover:bg-surface-container disabled:opacity-40">
              Siguiente <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-surface-container-low flex items-start gap-3 font-body-sm text-body-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-primary" aria-hidden>
          verified_user
        </span>
        <p>
          <strong className="text-on-surface">Regla de RG:</strong> las propiedades marcadas como vendidas o alquiladas salen del slider del inicio y se ocultan de la web a los 30 días. No se borran.
        </p>
      </div>

      {confirm && (
        <Modal open onClose={() => setConfirm(null)} labelledBy="confirm-title" className="max-w-md">
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <h2 id="confirm-title" className="font-headline-sm text-headline-sm text-primary">
                {closeLabel(confirm)}
              </h2>
              <CloseButton onClick={() => setConfirm(null)} />
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              <strong className="text-primary">
                {confirm.code} · {confirm.title}
              </strong>{" "}
              saldrá del slider, se verá 30 días con la etiqueta “{confirm.operation === "venta" ? "Vendida" : "Alquilada"}” y después se ocultará de la web. No se borra.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <button type="button" onClick={() => setConfirm(null)} className="h-12 px-5 rounded-lg bg-surface-container font-label-md text-label-md">
                Cancelar
              </button>
              <button type="button" onClick={() => doClose(confirm)} className="h-12 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md">
                Sí, {closeLabel(confirm).toLowerCase()}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
