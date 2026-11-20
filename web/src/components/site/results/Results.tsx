"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PropertyCard, PropertyCardSkeleton } from "@/components/site/PropertyCard";
import { SearchBox } from "@/components/site/SearchBox";
import { ZoneMapOverview } from "@/components/site/ZoneMap";
import { aiSearch, criteriaToFilters, interpret, type Criterion } from "@/lib/ai-search";
import { applyFilters, isClosed, money, PAGE_SIZE, publicProperties, TYPE_LABEL, type Filters } from "@/lib/properties";
import type { Lang, Operation, Property } from "@/lib/types";
import { FilterPanel } from "./FilterPanel";
import { LeadSearchCard } from "./LeadSearchCard";
import { FEATURE_OPTIONS, filtersFromParams, filtersToParams } from "./params";

type Sort = NonNullable<Filters["sort"]>;

function ResultsBar({
  count,
  sort,
  onSort,
  view,
  onView,
  extra,
  big,
}: {
  count: number;
  sort: Sort;
  onSort: (s: Sort) => void;
  view: "lista" | "mapa";
  onView: (v: "lista" | "mapa") => void;
  extra?: string;
  big?: boolean;
}) {
  return (
    <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h1 className={`${big ? "font-headline-md text-headline-md" : "font-headline-sm text-headline-sm font-bold"} text-on-surface tracking-tight`} aria-live="polite">
            {count} {count === 1 ? "propiedad encontrada" : "propiedades encontradas"}
          </h1>
          {extra && <span className="font-body-sm text-body-sm text-on-surface-variant hidden md:inline">{extra}</span>}
        </div>
        <div className="w-12 h-[3px] bg-rg-red mt-1.5" aria-hidden />
      </div>
      <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between">
        <div className="flex items-center gap-2">
          <label className="font-label-sm text-label-sm text-secondary hidden md:inline" htmlFor="sort-select">
            Ordenar por:
          </label>
          <div className="relative bg-surface-container-lowest rounded-lg shadow-sm">
            <select
              id="sort-select"
              aria-label="Ordenar por"
              value={sort}
              onChange={(e) => onSort(e.target.value as Sort)}
              className="appearance-none bg-transparent font-label-md text-label-md text-on-surface pl-3 pr-8 min-h-11 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="recientes">Más recientes</option>
              <option value="menor">Menor precio</option>
              <option value="mayor">Mayor precio</option>
            </select>
            <span className="material-symbols-outlined text-secondary text-[18px] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
          </div>
        </div>
        <div className="inline-flex p-1 bg-surface-container rounded-lg" role="radiogroup" aria-label="Vista">
          {(
            [
              ["lista", "view_agenda", "Lista"],
              ["mapa", "map", "Mapa"],
            ] as const
          ).map(([v, icon, label]) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={view === v}
              onClick={() => onView(v)}
              className={`px-3.5 min-h-10 rounded-lg font-label-md text-label-md flex items-center gap-1.5 transition-all ${view === v ? "bg-primary text-on-primary" : "text-secondary hover:text-primary"}`}
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden>
                {icon}
              </span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Navegación de resultados" className="w-full py-8 flex justify-center items-center gap-2">
      <button
        type="button"
        aria-label="Página anterior"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="w-11 h-11 rounded-lg bg-surface-container-lowest text-on-surface flex items-center justify-center hover:bg-surface-container transition-colors shadow-sm disabled:opacity-40"
      >
        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
      </button>
      {Array.from({ length: pages }, (_, k) => k + 1).map((n) => (
        <button
          key={n}
          type="button"
          aria-current={n === page ? "page" : undefined}
          aria-label={`Página ${n}`}
          onClick={() => onPage(n)}
          className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors ${
            n === page ? "bg-primary text-on-primary font-headline-sm text-headline-sm font-bold" : "bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container shadow-sm"
          }`}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        aria-label="Página siguiente"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
        className="w-11 h-11 rounded-lg bg-surface-container-lowest text-on-surface flex items-center justify-center hover:bg-surface-container transition-colors shadow-sm disabled:opacity-40"
      >
        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
      </button>
    </nav>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="h-9 pl-3.5 pr-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center gap-0.5">
      <span>{label}</span>
      <button
        type="button"
        aria-label={`Quitar ${label}`}
        onClick={onRemove}
        className="w-11 h-11 -my-1 flex items-center justify-center rounded-full hover:bg-surface-variant/60 transition-colors text-secondary hover:text-primary"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </span>
  );
}

function activeChips(f: Filters): { label: string; patch: Partial<Filters> }[] {
  const out: { label: string; patch: Partial<Filters> }[] = [];
  out.push({ label: "Cuenca", patch: {} });
  if (f.operation) out.push({ label: f.operation === "venta" ? "Venta" : "Alquiler", patch: { operation: undefined } });
  if (f.zone) out.push({ label: f.zone, patch: { zone: undefined } });
  for (const t of f.types ?? []) out.push({ label: TYPE_LABEL[t], patch: { types: f.types!.filter((x) => x !== t) } });
  if (f.minPrice != null) out.push({ label: `Desde ${money(f.minPrice)}`, patch: { minPrice: undefined } });
  if (f.maxPrice != null) out.push({ label: `Hasta ${money(f.maxPrice)}`, patch: { maxPrice: undefined } });
  if (f.bedrooms) out.push({ label: `${f.bedrooms}+ habitaciones`, patch: { bedrooms: undefined } });
  if (f.bathrooms) out.push({ label: `${f.bathrooms}+ baños`, patch: { bathrooms: undefined } });
  for (const c of f.features ?? []) out.push({ label: FEATURE_OPTIONS.find((o) => o.value === c)?.label ?? c, patch: { features: f.features!.filter((x) => x !== c) } });
  for (const s of f.stage ?? [])
    out.push({ label: s === "terminada" ? "Terminada" : s === "en-construccion" ? "En construcción" : "Sobre planos", patch: { stage: f.stage!.filter((x) => x !== s) } });
  if (f.housing) out.push({ label: `Vivienda ${f.housing}`, patch: { housing: undefined } });
  if (f.exclusiveOnly) out.push({ label: "Solo Exclusivas RG", patch: { exclusiveOnly: undefined } });
  if (f.q) out.push({ label: `“${f.q}”`, patch: { q: undefined } });
  return out;
}

function Grid({ items, lang, similar }: { items: Property[] | { p: Property; change: string }[]; lang: Lang; similar?: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.map((x) => {
        const p = "p" in x ? x.p : x;
        return <PropertyCard key={p.code} p={p} lang={lang} similar={similar} change={"change" in x ? x.change : undefined} showSummary />;
      })}
    </div>
  );
}

export function Results({ lang }: { lang: Lang }) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const base = useMemo(() => publicProperties(), []);

  const q = sp.get("q") ?? "";
  const mode: "ia" | "filtros" = sp.get("modo") === "ia" || (q && sp.get("modo") !== "filtros") ? "ia" : "filtros";
  const op = (sp.get("op") as Operation) || undefined;
  const view = sp.get("vista") === "mapa" ? "mapa" : "lista";
  const page = Math.max(1, Number(sp.get("pag") ?? 1));
  const sort = (sp.get("orden") as Sort) || "recientes";
  const removed = useMemo(() => new Set((sp.get("quitar") ?? "").split(",").filter(Boolean)), [sp]);

  const push = (next: URLSearchParams, scroll = false) => router.push(`${pathname}?${next}`, { scroll });
  const update = (patch: Record<string, string | undefined>, scroll = false) => {
    const next = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === "") next.delete(k);
      else next.set(k, v);
    }
    if (!("pag" in patch)) next.delete("pag");
    push(next, scroll);
  };

  // "Buscando…" breve al cambiar la búsqueda con IA (estado de carga del PRD 9)
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (mode !== "ia") return;
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, [q, op, mode]);

  // Avisa a los botones flotantes que hay una barra fija abajo (celular).
  useEffect(() => {
    if (mode !== "ia") return;
    document.body.dataset.bottomBar = "1";
    return () => {
      delete document.body.dataset.bottomBar;
    };
  }, [mode]);

  /* ---------------- Modo IA ---------------- */
  const criteria: Criterion[] = useMemo(() => {
    if (mode !== "ia") return [];
    const cs = interpret(q);
    if (op && !cs.some((c) => c.key === "operation")) cs.push({ id: `operation:${op}`, key: "operation", label: op === "venta" ? "Comprar" : "Alquilar", value: op });
    return cs;
  }, [q, op, mode]);
  const activeCriteria = criteria.filter((c) => !removed.has(c.id));
  const ai = useMemo(() => (mode === "ia" ? aiSearch(base, activeCriteria, sort) : null), [mode, base, activeCriteria, sort]);
  const understood = criteria.some((c) => c.key !== "operation");

  /* ---------------- Modo filtros ---------------- */
  const filters = useMemo(() => filtersFromParams(sp), [sp]);
  const filtered = useMemo(() => (mode === "filtros" ? applyFilters(base, { ...filters, sort }) : []), [mode, base, filters, sort]);
  const [drawer, setDrawer] = useState(false);

  const list = mode === "ia" ? (ai?.exact ?? []) : filtered;
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const pageItems = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isRent = (mode === "ia" ? activeCriteria.find((c) => c.key === "operation")?.value : filters.operation) === "alquiler";

  const zoneCountsFor = (items: Property[]) => {
    const m = new Map<string, number>();
    for (const p of items) if (!isClosed(p)) m.set(p.zone, (m.get(p.zone) ?? 0) + 1);
    return m;
  };

  const toFilters = () => {
    const f = criteriaToFilters(activeCriteria);
    push(filtersToParams({ ...f, sort }), true);
  };

  const summary = mode === "ia" ? q : activeChips(filters).map((c) => c.label).join(", ");

  return (
    <div className="pb-24 sm:pb-0">
      {mode === "ia" ? (
        <>
          <section className="w-full px-gutter-mobile md:px-gutter py-space-md">
            <div className="max-w-[1100px] mx-auto flex flex-col gap-0">
              <SearchBox
                lang={lang}
                variant="results"
                initialMode="ia"
                initialOp={op ?? "venta"}
                initialQuery={q}
                onModeChange={(m) => m === "filtros" && toFilters()}
              >
              {/* Entendí esto: */}
              <div className="flex flex-col gap-3">
                {understood ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-label-sm text-label-sm text-secondary font-medium mr-1 uppercase tracking-wider">Entendí esto:</span>
                        {criteria.map((c) =>
                          removed.has(c.id) ? null : (
                            <Chip key={c.id} label={c.label} onRemove={() => update({ quitar: [...removed, c.id].join(",") })} />
                          ),
                        )}
                        {removed.size > 0 && (
                          <button type="button" className="min-h-9 px-2 font-label-sm text-label-sm text-secondary underline" onClick={() => update({ quitar: undefined })}>
                            Restaurar criterios
                          </button>
                        )}
                      </div>
                      <button type="button" onClick={toFilters} className="inline-flex items-center gap-1.5 min-h-11 font-label-md text-label-md text-primary hover:underline flex-shrink-0">
                        <span className="material-symbols-outlined text-[18px]">tune</span>
                        <span>Ajustar con filtros</span>
                      </button>
                    </div>
                    <p className="font-body-sm text-body-sm text-secondary">Si algo no es lo que querías, quita un criterio o ajusta con filtros.</p>
                  </>
                ) : (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low" role="status">
                    <span className="material-symbols-outlined text-primary">help</span>
                    <p className="font-body-md text-body-md text-on-surface">No entendí tu búsqueda. Prueba con tipo, zona y presupuesto.</p>
                  </div>
                )}
              </div>
              </SearchBox>

              {!loading && ai && ai.exact.length === 0 && understood && (
                <div className="mt-space-md p-space-md bg-surface-container-low rounded-r-xl relative overflow-hidden shadow-sm flex items-start gap-space-md" style={{ boxShadow: "inset 4px 0 0 0 #111111" }} role="status">
                  <span className="material-symbols-outlined text-primary text-[24px] pt-0.5" aria-hidden>
                    info
                  </span>
                  <div className="flex flex-col gap-space-xs">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">No encontramos propiedades con todos esos criterios.</h2>
                    <p className="font-body-md text-body-md text-secondary">
                      {ai.similar.length ? "Te mostramos parecidas. En cada una te decimos qué cambió." : "Quita un criterio o deja tu búsqueda y un asesor te ayuda."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className={`w-full px-gutter-mobile md:px-gutter ${ai && !ai.exact.length ? "bg-surface-container-low py-space-lg" : ""}`}>
            <div className="max-w-[1200px] mx-auto">
              {loading ? (
                <div>
                  <p className="py-4 font-headline-sm text-headline-sm text-on-surface flex items-center gap-2" role="status">
                    Buscando…
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[0, 1, 2].map((k) => (
                      <PropertyCardSkeleton key={k} />
                    ))}
                  </div>
                </div>
              ) : ai && ai.exact.length > 0 ? (
                <>
                  <ResultsBar count={ai.exact.length} sort={sort} onSort={(s) => update({ orden: s === "recientes" ? undefined : s })} view={view} onView={(v) => update({ vista: v === "mapa" ? "mapa" : undefined })} />
                  {isRent && <p className="mb-4 font-body-sm text-body-sm text-secondary">El precio es la mensualidad y no incluye gastos adicionales.</p>}
                  {view === "mapa" ? (
                    <ZoneMapOverview counts={zoneCountsFor(ai.exact)} onPick={(z) => push(filtersToParams({ ...criteriaToFilters(activeCriteria), zone: z }), true)} />
                  ) : (
                    <Grid items={pageItems} lang={lang} />
                  )}
                  {view === "lista" && <Pagination page={page} pages={pages} onPage={(n) => update({ pag: String(n) }, true)} />}
                </>
              ) : ai && ai.similar.length > 0 ? (
                <>
                  <div className="flex items-baseline justify-between pb-4">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Parecidas</h2>
                    <span className="font-body-sm text-body-sm text-secondary">{ai.similar.length} sugerencias</span>
                  </div>
                  <Grid items={ai.similar} lang={lang} similar />
                </>
              ) : null}

              <div className="mt-space-xl pb-space-xl">
                {!loading && ai && ai.exact.length === 0 ? (
                  <LeadSearchCard lang={lang} summary={summary} operation={op} />
                ) : (
                  <NotFoundBand mode="ia" lang={lang} summary={summary} operation={op} />
                )}
              </div>
            </div>
          </section>

          {/* Celular: barra fija (M2) */}
          <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-surface-container-lowest/95 backdrop-blur border-t border-[#ECEAE7]">
            <a href="#dejar-busqueda" className="h-12 w-full rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">real_estate_agent</span>
              Dejar mi búsqueda a un asesor
            </a>
          </div>
        </>
      ) : (
        <>
          <section className="w-full bg-surface-container-low py-space-sm">
            <div className="max-w-7xl mx-auto px-gutter-mobile md:px-gutter flex items-center justify-between gap-4">
              <nav aria-label="Ruta de navegación" className="flex items-center gap-2 font-body-sm text-body-sm text-secondary">
                <Link href={`/${lang}`} className="hover:text-primary min-h-9 inline-flex items-center">
                  Inicio
                </Link>
                <span aria-hidden>/</span>
                <span className="text-primary font-medium" aria-current="page">
                  {filters.operation === "alquiler" ? "Alquilar" : filters.operation === "venta" ? "Comprar" : "Propiedades"}
                </span>
              </nav>
              <span className="hidden sm:flex items-center gap-1.5 font-label-sm text-label-sm text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-st-available" aria-hidden />
                Inventario de RG · Cuenca
              </span>
            </div>
          </section>

          <div className="w-full max-w-7xl mx-auto px-gutter-mobile md:px-gutter py-space-lg">
            <CompactBar lang={lang} filters={filters} onSubmit={(f) => push(filtersToParams({ ...f, sort }, sp), false)} />

            <div className="flex flex-col lg:flex-row items-start gap-space-lg">
              <aside className="hidden lg:block w-[300px] shrink-0 sticky top-24 z-10 max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar rounded-xl">
                <FilterPanel key={sp.toString()} value={filters} onApply={(f) => push(filtersToParams({ ...f, sort }, sp), true)} />
              </aside>

              <div className="flex-1 w-full min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDrawer(true)}
                      className="lg:hidden h-11 px-4 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] font-label-md text-label-md flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">tune</span> Filtros
                    </button>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium mr-1 hidden sm:inline">Filtros activos:</span>
                    {activeChips(filters).map((c, k) =>
                      k === 0 ? (
                        <span key="cuenca" className="h-9 px-3.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center">
                          {c.label}
                        </span>
                      ) : (
                        <Chip key={c.label} label={c.label} onRemove={() => push(filtersToParams({ ...filters, ...c.patch, sort }, sp))} />
                      ),
                    )}
                    {activeChips(filters).length > 1 && (
                      <button
                        className="min-h-9 font-label-sm text-label-sm text-secondary hover:text-primary transition-colors underline decoration-secondary/30 ml-1"
                        type="button"
                        onClick={() => push(filtersToParams({ sort }, sp))}
                      >
                        Quitar todos
                      </button>
                    )}
                  </div>
                  {filtered.length > 0 && (
                    <div className="hidden sm:flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden />
                      <span>Promedio: {money(Math.round(filtered.reduce((a, p) => a + p.price, 0) / filtered.length / 500) * 500)} USD</span>
                    </div>
                  )}
                </div>

                <div className="border-b border-surface-container mb-space-md">
                  <ResultsBar
                    big
                    count={filtered.length}
                    sort={sort}
                    onSort={(s) => update({ orden: s === "recientes" ? undefined : s })}
                    view={view}
                    onView={(v) => update({ vista: v === "mapa" ? "mapa" : undefined })}
                    extra="en Cuenca, Azuay"
                  />
                </div>
                {filters.operation === "alquiler" && <p className="mb-4 font-body-sm text-body-sm text-secondary">El precio es la mensualidad y no incluye gastos adicionales.</p>}

                {filtered.length === 0 ? (
                  <EmptyState lang={lang} onClear={() => push(filtersToParams({ operation: filters.operation, sort }, sp))} />
                ) : view === "mapa" ? (
                  <ZoneMapOverview counts={zoneCountsFor(filtered)} active={filters.zone} onPick={(z) => push(filtersToParams({ ...filters, zone: z, sort }, new URLSearchParams()), true)} />
                ) : (
                  <>
                    <Grid items={pageItems} lang={lang} />
                    <Pagination page={page} pages={pages} onPage={(n) => update({ pag: String(n) }, true)} />
                  </>
                )}
              </div>
            </div>
          </div>
          <section className="w-full px-gutter-mobile md:px-gutter pb-space-xl">
            <NotFoundBand mode="filtros" lang={lang} summary={summary} operation={filters.operation} />
          </section>

          {drawer && (
            <div className="lg:hidden fixed inset-0 z-[70] flex justify-end">
              <div className="absolute inset-0 bg-primary/40" onClick={() => setDrawer(false)} aria-hidden />
              <div role="dialog" aria-modal="true" aria-label="Filtros" className="relative w-full max-w-sm h-full overflow-y-auto bg-surface p-3 animate-fade-in">
                <FilterPanel
                  value={filters}
                  onClose={() => setDrawer(false)}
                  onApply={(f) => {
                    setDrawer(false);
                    push(filtersToParams({ ...f, sort }, sp), true);
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CompactBar({ lang, filters, onSubmit }: { lang: Lang; filters: Filters; onSubmit: (f: Filters) => void }) {
  const router = useRouter();
  const [text, setText] = useState(filters.q ?? "");
  useEffect(() => setText(filters.q ?? ""), [filters.q]);
  const op = filters.operation ?? "venta";
  return (
    <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-lg">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
        <div className="flex flex-wrap items-center gap-space-md">
          <div className="inline-flex p-1 bg-surface-container rounded-lg" role="radiogroup" aria-label="Operación">
            {(["venta", "alquiler"] as Operation[]).map((o) => (
              <button
                key={o}
                type="button"
                role="radio"
                aria-checked={op === o}
                onClick={() => onSubmit({ ...filters, operation: o, minPrice: undefined, maxPrice: undefined })}
                className={`px-space-md min-h-10 rounded font-label-md text-label-md transition-all ${op === o ? "bg-primary text-on-primary font-semibold shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                {o === "venta" ? "Comprar" : "Alquilar"}
              </button>
            ))}
          </div>
          <div className="hidden sm:block h-7 w-px bg-surface-variant" aria-hidden />
          <div className="inline-flex p-1 bg-surface-container rounded-lg" role="tablist" aria-label="Modo de búsqueda">
            <button
              type="button"
              role="tab"
              aria-selected={false}
              onClick={() => router.push(`/${lang}/propiedades?modo=ia&op=${op}`)}
              className="flex items-center gap-1.5 px-space-md min-h-10 rounded font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-all"
            >
              <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
              <span>Buscar con IA</span>
            </button>
            <button type="button" role="tab" aria-selected className="flex items-center gap-1.5 px-space-md min-h-10 rounded font-label-md text-label-md bg-primary text-on-primary font-semibold shadow-sm">
              <span className="material-symbols-outlined text-[17px]">tune</span>
              <span>Usar filtros</span>
            </button>
          </div>
        </div>
        <form
          className="flex-1 max-w-xl relative flex items-center"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ ...filters, q: text.trim() || undefined });
          }}
        >
          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none" aria-hidden>
            search
          </span>
          <label htmlFor="compact-q" className="sr-only">
            Buscar por nombre o código
          </label>
          <input
            id="compact-q"
            className="w-full h-12 pl-10 pr-28 rounded-lg bg-surface font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            placeholder="Buscar por nombre o código (ej. CA-001)"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="absolute right-1.5 flex items-center gap-1">
            {text && (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                onClick={() => {
                  setText("");
                  onSubmit({ ...filters, q: undefined });
                }}
                className="w-9 h-9 flex items-center justify-center rounded text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
            <button className="h-9 px-space-sm bg-primary text-on-primary rounded font-label-sm text-label-sm hover:opacity-90" type="submit">
              Buscar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmptyState({ lang, onClear }: { lang: Lang; onClear: () => void }) {
  void lang;
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-[#ECEAE7] p-8 md:p-12 flex flex-col items-center text-center" role="status">
      <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[28px] text-primary">search_off</span>
      </div>
      <h2 className="font-headline-sm text-headline-sm text-on-surface">No encontramos propiedades con esos criterios</h2>
      <p className="font-body-md text-body-md text-secondary mt-2 max-w-md">Prueba quitando un filtro o ampliando el precio. También puedes pedirle ayuda a un asesor.</p>
      <button type="button" onClick={onClear} className="mt-6 h-12 px-6 rounded-lg bg-primary text-on-primary font-label-md text-label-md">
        Quitar filtros
      </button>
    </div>
  );
}

function NotFoundBand({ mode, lang, summary, operation }: { mode: "ia" | "filtros"; lang: Lang; summary: string; operation?: Operation }) {
  const [open, setOpen] = useState(false);
  if (open) return <LeadSearchCard lang={lang} summary={summary} operation={operation} title="Cuéntale a un asesor qué buscas" />;
  return (
    <div className="max-w-[1200px] mx-auto bg-surface-container-low rounded-xl p-8 md:p-12 text-center shadow-[0_2px_16px_rgba(17,17,17,0.03)] flex flex-col items-center">
      <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-4 text-primary">
        <span className="material-symbols-outlined text-[28px]" aria-hidden>
          support_agent
        </span>
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">¿No encuentras lo que buscas?</h3>
      <p className="font-body-md text-body-md text-secondary max-w-lg mt-2 mb-6">Nuestros asesores conocen el mercado de Cuenca y pueden buscar la opción ideal para ti.</p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-12 px-8 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-medium transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden>
          real_estate_agent
        </span>
        <span>{mode === "ia" ? "Dejar mi búsqueda a un asesor" : "Contactar con un asesor"}</span>
      </button>
    </div>
  );
}
