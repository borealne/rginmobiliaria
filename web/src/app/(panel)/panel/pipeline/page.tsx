"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AddLeadDrawer } from "@/components/panel/AddLeadDrawer";
import { timeAgo, usePanel } from "@/components/panel/PanelProvider";
import { PageHeader } from "@/components/panel/Shell";
import { CloseButton, Modal } from "@/components/ui/Modal";
import { ADVISORS, ORIGIN_LABEL, ORIGIN_STYLE, STAGES, type Lead, type OriginKey } from "@/lib/data/leads";
import { WHATSAPP } from "@/lib/data/content";
import { priceText } from "@/lib/properties";

const NO_REPLY_MIN = 120;

function KindBadge({ kind, label }: { kind: string; label: string }) {
  const cls =
    kind === "propietario"
      ? "bg-st-available-bg text-st-available"
      : kind === "arrendatario"
        ? "bg-st-building-bg text-st-building"
        : "bg-secondary-container text-on-secondary-fixed-variant";
  return <span className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-medium whitespace-nowrap ${cls}`}>{label}</span>;
}

function OriginBadge({ l }: { l: Lead }) {
  const s = ORIGIN_STYLE[l.origin];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded font-label-sm text-[12px] ${s.cls}`}>
      <span className="material-symbols-outlined text-[14px]" aria-hidden>
        {s.icon}
      </span>
      <span>
        {ORIGIN_LABEL[l.origin]}
        {l.campaign && ` · ${l.campaign}`}
      </span>
    </span>
  );
}

function formatEntryDateTime(minutesAgo: number): string {
  const entryDate = new Date(Date.now() - minutesAgo * 60000);
  return entryDate.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PipelinePage() {
  const { leads, moveLead, markReplied, addLeadNote, assignLeadAdvisor, properties, role, user, toast } = usePanel();
  const [kinds, setKinds] = useState([
    { id: "comprador", label: "Comprador", plural: "Compradores" },
    { id: "arrendatario", label: "Arrendatario", plural: "Arrendatarios" },
    { id: "propietario", label: "Propietario", plural: "Propietarios" },
  ]);
  const [stages, setStages] = useState(STAGES);
  const [tab, setTab] = useState("todos");
  const [q, setQ] = useState("");
  const [advisor, setAdvisor] = useState("");
  const [origin, setOrigin] = useState("");
  const [onlyAlert, setOnlyAlert] = useState(false);
  const [view, setView] = useState<"kanban" | "lista">("kanban");
  const [drawer, setDrawer] = useState(false);
  const [kindModal, setKindModal] = useState(false);
  const [stageModal, setStageModal] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const leadParam = params.get("lead");
    if (leadParam) {
      setSelectedLeadId(leadParam);
    }
  }, []);

  const selectedLead = useMemo(
    () => (selectedLeadId ? leads.find((l) => l.id === selectedLeadId) ?? null : null),
    [leads, selectedLeadId],
  );

  const alert = (l: Lead) => !!l.noReply && l.minutesAgo >= NO_REPLY_MIN && l.stage === "nuevo";
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (tab !== "todos" && l.kind !== tab) return false;
      if (t && !`${l.name} ${l.phone} ${l.campaign ?? ""} ${l.propertyCode ?? ""}`.toLowerCase().includes(t)) return false;
      if (advisor && l.advisor !== advisor) return false;
      if (origin && l.origin !== origin) return false;
      if (onlyAlert && !alert(l)) return false;
      return true;
    });
  }, [leads, tab, q, advisor, origin, onlyAlert]);

  const active = leads.filter((l) => l.stage !== "ganado");
  const simulated = leads.filter((l) => l.simulated).length;
  const alerts = leads.filter(alert).length;
  const originShare = (["meta-form", "wa-ad", "manual", "web"] as OriginKey[]).map((o) => ({
    o,
    n: leads.filter((l) => l.origin === o).length,
  }));
  const totalO = Math.max(1, originShare.reduce((a, b) => a + b.n, 0));
  const ORIGIN_BAR: Record<OriginKey, string> = {
    "meta-form": "bg-st-building",
    "wa-ad": "bg-st-available",
    manual: "bg-primary",
    web: "bg-outline",
  };

  const propOf = (code?: string) => (code ? properties.find((p) => p.code === code) : undefined);
  const propTitle = (code?: string) => propOf(code)?.title;
  const adv = (id: string) => ADVISORS.find((a) => a.id === id) ?? ADVISORS[0];
  const kindLabel = (k: string) => kinds.find((x) => x.id === k)?.label ?? k;

  const move = (id: string, stage: string) => {
    moveLead(id, stage);
    toast(`Movido a “${stages.find((s) => s.id === stage)?.label}”`);
  };

  const handleSaveNote = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !noteDraft.trim()) return;
    addLeadNote(selectedLead.id, noteDraft);
    setNoteDraft("");
    toast(`Seguimiento registrado en la bitácora de ${selectedLead.name}`);
  };

  const exportCsv = () => {
    const rows = [
      ["Nombre", "Teléfono", "Tipo", "Origen", "Campaña", "Propiedad", "Asesor", "Etapa", "Notas en bitácora"],
      ...filtered.map((l) => [
        l.name,
        l.phone,
        l.kind,
        ORIGIN_LABEL[l.origin],
        l.campaign ?? "",
        l.propertyCode ?? "",
        adv(l.advisor).name,
        stages.find((s) => s.id === l.stage)?.label ?? l.stage,
        String((l.notes?.length ?? 0) + (l.note ? 1 : 0)),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "pipeline-rg.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const Card = ({ l }: { l: Lead }) => {
    const pt = propTitle(l.propertyCode);
    const a = adv(l.advisor);
    const warn = alert(l);
    const notesCount = l.notes?.length ?? 0;
    return (
      <article
        draggable
        onDragStart={(e) => {
          setDragging(l.id);
          e.dataTransfer.setData("text/plain", l.id);
        }}
        onDragEnd={() => (setDragging(null), setOver(null))}
        onClick={() => setSelectedLeadId(l.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setSelectedLeadId(l.id);
          }
        }}
        tabIndex={0}
        role="button"
        className={`group bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-3 cursor-pointer active:cursor-grabbing border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
          warn ? "border-2 border-st-reserved" : "border-[#141414]/10 hover:border-[#141414]/25"
        } ${dragging === l.id ? "opacity-50 rotate-1" : ""}`}
        aria-label={`Ver detalle y bitácora de ${l.name}, ${kindLabel(l.kind)}`}
      >
        {warn && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-st-reserved-bg text-st-reserved font-label-sm text-[12px] font-semibold">
            <span className="material-symbols-outlined text-[16px]" aria-hidden>
              schedule
            </span>
            Atención · Sin respuesta {timeAgo(l.minutesAgo).toLowerCase()}
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-title-md text-[16px] text-on-surface group-hover:text-[#D9381E] transition-colors truncate">{l.name}</h3>
            <p className="font-body-sm text-body-sm text-secondary">{l.appointment ? `Cita: ${l.appointment}` : timeAgo(l.minutesAgo)}</p>
          </div>
          <KindBadge kind={l.kind} label={kindLabel(l.kind)} />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <OriginBadge l={l} />
          {notesCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#141414] text-[#F5F3EE] font-label-sm text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[13px]">forum</span>
              {notesCount} {notesCount === 1 ? "seguimiento" : "seguimientos"}
            </span>
          )}
        </div>
        {(pt || l.interest) && (
          <div className="pt-2 border-t border-surface-container font-body-sm text-body-sm">
            <p className="flex items-start gap-1.5 text-on-surface">
              <span className="material-symbols-outlined text-[16px] mt-0.5" aria-hidden>
                home
              </span>
              <span>{pt ? `${l.propertyCode} · ${pt}` : l.interest}</span>
            </p>
            {l.budget && <p className="mt-1 font-semibold">{l.budget}</p>}
          </div>
        )}
        {l.note && <p className="p-2 rounded-lg bg-surface-container-low font-body-sm text-[12px] text-on-surface-variant line-clamp-2">{l.note}</p>}
        {l.simulated && (
          <span className="inline-flex items-center gap-1 self-start px-2 py-1 rounded bg-st-available-bg text-st-available font-label-sm text-[12px]">
            <span className="material-symbols-outlined text-[14px]">calculate</span>
            {l.simulated}
          </span>
        )}
        <div
          className="flex items-center justify-between gap-2 pt-2 border-t border-surface-container"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant min-w-0">
            <span className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-[10px] shrink-0">
              {a.initials}
            </span>
            <span className="truncate">{a.short}</span>
          </span>
          <div className="flex items-center gap-1">
            <a
              href={`https://wa.me/${l.phone.replace(/\D/g, "") || WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => markReplied(l.id)}
              aria-label={`Escribir a ${l.name} por WhatsApp`}
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-st-available-bg text-st-available hover:scale-105 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
            </a>
            <label className="sr-only" htmlFor={`mv-${l.id}`}>
              Mover a otra etapa
            </label>
            <select
              id={`mv-${l.id}`}
              value=""
              onChange={(e) => e.target.value && move(l.id, e.target.value)}
              className="h-9 max-w-[96px] pl-2 pr-1 rounded-lg bg-surface-container font-label-sm text-label-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Mover a…</option>
              {stages
                .filter((s) => s.id !== l.stage)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </article>
    );
  };

  const sel =
    "h-11 pl-3 pr-9 rounded-lg bg-surface-container-low font-body-sm text-body-sm appearance-none focus:outline-none focus:ring-1 focus:ring-primary w-full";

  return (
    <div className="flex flex-col w-full">
      <PageHeader
        crumbs={["Panel", "Contactos y pipeline", "Tablero"]}
        title="Pipeline de contactos"
        text="Cada contacto con su origen, campaña y bitácora de seguimiento. Haz clic en cualquier tarjeta o fila para abrir su ficha completa."
        actions={
          <>
            <button
              type="button"
              onClick={exportCsv}
              className="h-12 px-5 rounded-lg bg-surface-container-low font-label-md text-label-md flex items-center gap-2 hover:bg-surface-container transition-colors cursor-pointer active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>Exportar CSV
            </button>
            {role === "super" && (
              <button
                type="button"
                onClick={() => setKindModal(true)}
                className="h-12 px-5 rounded-lg border border-[#ECEAE7] bg-surface-container-lowest font-label-md text-label-md flex items-center gap-2 hover:border-primary transition-colors cursor-pointer active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">label</span>+ Agregar tipo de tarjeta
              </button>
            )}
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="h-12 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-2 hover:bg-primary-container transition-colors cursor-pointer active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>+ Agregar lead
            </button>
          </>
        }
      />

      {/* 4 KPIs Superiores con Microinteracciones Unificadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 pb-6">
        <div className="group p-5 rounded-xl bg-surface-container-lowest border border-[#141414]/10 shadow-sm flex flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-md hover:border-[#141414]/25">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Contactos activos</span>
            <div className="w-9 h-9 rounded-lg bg-[#F5F3EE] text-[#141414] flex items-center justify-center transition-colors duration-300 group-hover:bg-[#141414] group-hover:text-white">
              <span className="material-symbols-outlined text-[20px]" aria-hidden>
                groups
              </span>
            </div>
          </div>
          <div>
            <p className="font-display-xl text-display-xl-mobile text-primary font-bold mt-3 transition-colors duration-300 group-hover:text-[#D9381E]">
              {active.length}
            </p>
            <p className="font-body-sm text-body-sm text-secondary">En proceso, sin contar cierres</p>
          </div>
        </div>

        <div className="group p-5 rounded-xl bg-surface-container-lowest border border-[#141414]/10 shadow-sm flex flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-md hover:border-[#141414]/25">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Respuesta promedio</span>
            <div className="w-9 h-9 rounded-lg bg-[#F5F3EE] text-[#141414] flex items-center justify-center transition-colors duration-300 group-hover:bg-[#141414] group-hover:text-white">
              <span className="material-symbols-outlined text-[20px]" aria-hidden>
                schedule
              </span>
            </div>
          </div>
          <div>
            <p className="font-display-xl text-display-xl-mobile text-primary font-bold mt-3 transition-colors duration-300 group-hover:text-[#D9381E]">
              14 min
            </p>
            <p className="font-body-sm text-body-sm text-secondary">Meta: menos de 30 min</p>
          </div>
        </div>

        <div className="group p-5 rounded-xl bg-surface-container-lowest border border-[#141414]/10 shadow-sm flex flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-md hover:border-[#141414]/25">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Simularon crédito</span>
            <div className="w-9 h-9 rounded-lg bg-[#F5F3EE] text-[#141414] flex items-center justify-center transition-colors duration-300 group-hover:bg-[#141414] group-hover:text-white">
              <span className="material-symbols-outlined text-[20px]" aria-hidden>
                calculate
              </span>
            </div>
          </div>
          <div>
            <p className="font-display-xl text-display-xl-mobile text-primary font-bold mt-3 transition-colors duration-300 group-hover:text-[#D9381E]">
              {simulated} <span className="font-body-md text-body-md text-secondary font-normal">de {leads.length}</span>
            </p>
            <p className="font-body-sm text-body-sm text-secondary">Usaron el simulador en la web</p>
          </div>
        </div>

        <div className="group p-5 rounded-xl bg-surface-container-lowest border border-[#141414]/10 shadow-sm flex flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-md hover:border-[#141414]/25">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Origen de los contactos</span>
            <div className="w-9 h-9 rounded-lg bg-[#F5F3EE] text-[#141414] flex items-center justify-center transition-colors duration-300 group-hover:bg-[#141414] group-hover:text-white">
              <span className="material-symbols-outlined text-[20px]" aria-hidden>
                pie_chart
              </span>
            </div>
          </div>
          <div>
            <div className="flex h-2.5 rounded-full overflow-hidden mt-4" aria-hidden>
              {originShare.map((x) => (
                <div key={x.o} className={ORIGIN_BAR[x.o]} style={{ width: `${(x.n / totalO) * 100}%` }} />
              ))}
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 font-body-sm text-[12px] text-on-surface-variant">
              {originShare.map((x) => (
                <li key={x.o} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${ORIGIN_BAR[x.o]}`} aria-hidden />
                  <span className="truncate">
                    {ORIGIN_LABEL[x.o]}: <strong className="group-hover:text-[#D9381E] transition-colors">{Math.round((x.n / totalO) * 100)}%</strong>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm mb-6 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Tipo de tarjeta">
            {[{ id: "todos", plural: "Todos" }, ...kinds].map((k) => {
              const n = k.id === "todos" ? leads.length : leads.filter((l) => l.kind === k.id).length;
              return (
                <button
                  key={k.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === k.id}
                  onClick={() => setTab(k.id)}
                  className={`min-h-11 px-4 rounded-lg font-label-md text-label-md whitespace-nowrap transition-all cursor-pointer active:scale-[0.98] ${
                    tab === k.id ? "bg-primary text-on-primary" : "bg-surface-container-low hover:bg-surface-container"
                  }`}
                >
                  {k.plural} ({n})
                </button>
              );
            })}
          </div>
          <div className="inline-flex p-1 bg-surface-container-low rounded-lg self-start" role="radiogroup" aria-label="Vista">
            {(
              [
                ["kanban", "view_kanban", "Tablero"],
                ["lista", "table_rows", "Lista"],
              ] as const
            ).map(([v, icon, label]) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={view === v}
                onClick={() => setView(v)}
                className={`min-h-10 px-3 rounded-md flex items-center gap-1.5 font-label-md text-label-md transition-all cursor-pointer active:scale-[0.98] ${
                  view === v ? "bg-surface-container-lowest shadow-sm font-semibold text-primary" : "text-secondary hover:text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">search</span>
            <label htmlFor="pl-q" className="sr-only">
              Buscar contactos
            </label>
            <input
              id="pl-q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre, teléfono o campaña"
              className="w-full h-11 pl-9 pr-3 rounded-lg bg-surface-container-low font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="relative">
            <label htmlFor="pl-adv" className="sr-only">
              Asesor
            </label>
            <select id="pl-adv" className={sel} value={advisor} onChange={(e) => setAdvisor(e.target.value)} disabled={role !== "super"}>
              <option value="">{role === "super" ? "Asesor: todos" : "Solo mis contactos"}</option>
              {role === "super" &&
                ADVISORS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-secondary pointer-events-none">
              expand_more
            </span>
          </div>
          <div className="relative">
            <label htmlFor="pl-or" className="sr-only">
              Origen
            </label>
            <select id="pl-or" className={sel} value={origin} onChange={(e) => setOrigin(e.target.value)}>
              <option value="">Origen: todos</option>
              {Object.entries(ORIGIN_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-secondary pointer-events-none">
              expand_more
            </span>
          </div>
          <button
            type="button"
            aria-pressed={onlyAlert}
            onClick={() => setOnlyAlert((v) => !v)}
            className={`min-h-11 px-3 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 border transition-colors cursor-pointer ${
              onlyAlert ? "bg-st-reserved text-white border-st-reserved" : "bg-st-reserved-bg text-st-reserved border-st-reserved/30"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">timer</span>
            Sin respuesta (más de 2 h): {alerts}
          </button>
        </div>
      </div>

      {view === "kanban" ? (
        <div
          key="view-kanban"
          className="flex gap-4 overflow-x-auto pb-4 -mx-gutter-mobile px-gutter-mobile md:mx-0 md:px-0 snap-x animate-fade-in"
          aria-label="Tablero por etapas"
        >
          {stages.map((s, colIdx) => {
            const items = filtered.filter((l) => l.stage === s.id);
            return (
              <section
                key={s.id}
                style={{ animationDelay: `${colIdx * 35}ms` }}
                aria-label={`${s.label}: ${items.length}`}
                onDragOver={(e) => (e.preventDefault(), setOver(s.id))}
                onDragLeave={() => setOver((o) => (o === s.id ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/plain");
                  if (id) move(id, s.id);
                  setOver(null);
                }}
                className={`w-[300px] shrink-0 snap-start rounded-xl p-3 flex flex-col gap-3 transition-colors animate-fade-in ${
                  over === s.id ? "bg-surface-container-high ring-2 ring-primary/30" : "bg-surface-container-low"
                }`}
              >
                <header className="flex items-center justify-between px-1 pt-1">
                  <h2 className="flex items-center gap-2 font-title-md text-[16px] text-on-surface">
                    <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} aria-hidden />
                    {s.label}
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-label-sm text-label-sm">{items.length}</span>
                  </h2>
                </header>
                {items.length === 0 ? (
                  <p className="p-4 rounded-lg border-2 border-dashed border-outline-variant text-center font-body-sm text-body-sm text-secondary">
                    Aún no hay contactos en esta etapa.
                  </p>
                ) : (
                  items.map((l) => <Card key={l.id} l={l} />)
                )}
              </section>
            );
          })}
          {role === "super" && (
            <button
              type="button"
              onClick={() => setStageModal(true)}
              className="w-[220px] shrink-0 rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-1 text-secondary hover:border-primary hover:text-primary min-h-40 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">add</span>
              <span className="font-label-md text-label-md">+ Agregar etapa</span>
            </button>
          )}
        </div>
      ) : (
        <div key="view-lista" className="rounded-xl bg-surface-container-lowest border border-[#141414]/10 shadow-sm overflow-x-auto animate-fade-in">
          <table className="w-full text-left min-w-[960px] font-body-sm text-body-sm">
            <caption className="sr-only">Contactos</caption>
            <thead className="bg-[#141414]/[0.04] border-b-2 border-[#141414]/15 text-[#141414] font-label-sm text-label-sm uppercase tracking-wider font-bold">
              <tr>
                {["Contacto", "Tipo", "Origen", "Interés", "Asesor", "Etapa", "Llegó", "Bitácora"].map((h) => (
                  <th key={h} scope="col" className="py-3.5 px-4 font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/10">
              {filtered.map((l, rowIdx) => (
                <tr
                  key={l.id}
                  style={{ animationDelay: `${rowIdx * 25}ms` }}
                  onClick={() => setSelectedLeadId(l.id)}
                  className={`cursor-pointer transition-colors duration-200 animate-fade-in ${
                    alert(l) ? "bg-st-reserved-bg/40 hover:bg-st-reserved-bg/60" : "odd:bg-white even:bg-[#F5F3EE]/60 hover:bg-[#F5F3EE]"
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <span className="block font-semibold text-primary hover:text-[#D9381E] transition-colors">{l.name}</span>
                    <span className="text-secondary">{l.phone}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <KindBadge kind={l.kind} label={kindLabel(l.kind)} />
                  </td>
                  <td className="py-3.5 px-4">
                    <OriginBadge l={l} />
                  </td>
                  <td className="py-3.5 px-4">{l.propertyCode ? `${l.propertyCode} · ${propTitle(l.propertyCode) ?? ""}` : (l.interest ?? "—")}</td>
                  <td className="py-3.5 px-4">{adv(l.advisor).short}</td>
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <label className="sr-only" htmlFor={`ls-${l.id}`}>
                      Etapa
                    </label>
                    <select id={`ls-${l.id}`} value={l.stage} onChange={(e) => move(l.id, e.target.value)} className="h-10 px-2 rounded-lg bg-surface-container-low">
                      {stages.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-secondary whitespace-nowrap">
                    {alert(l) && <span className="material-symbols-outlined text-[16px] text-st-reserved align-middle mr-1">schedule</span>}
                    {timeAgo(l.minutesAgo)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLeadId(l.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] text-[#F5F3EE] text-label-sm font-semibold hover:bg-[#D9381E] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">forum</span>
                      Ver ({(l.notes?.length ?? 0) + (l.note ? 1 : 0)})
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-secondary">
                    No hay contactos con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Detalle del Contacto (Progressive Disclosure) + Bitácora de Seguimientos */}
      {selectedLead && (
        <Modal
          open
          onClose={() => {
            setSelectedLeadId(null);
            setNoteDraft("");
          }}
          labelledBy="lead-detail-modal-title"
          className="max-w-[740px]"
        >
          <div className="p-6 md:p-7 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-[#141414]/10 pb-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <KindBadge kind={selectedLead.kind} label={kindLabel(selectedLead.kind)} />
                  <OriginBadge l={selectedLead} />
                  <span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[11px] text-secondary">
                    ID: {selectedLead.id}
                  </span>
                </div>
                <h2 id="lead-detail-modal-title" className="font-display text-headline-md text-[#141414] font-bold">
                  {selectedLead.name}
                </h2>
                <p className="text-body-sm text-secondary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">calendar_clock</span>
                  Ingreso: <strong className="text-[#141414]">{formatEntryDateTime(selectedLead.minutesAgo)}</strong> ({timeAgo(selectedLead.minutesAgo)})
                </p>
              </div>
              <CloseButton
                onClick={() => {
                  setSelectedLeadId(null);
                  setNoteDraft("");
                }}
              />
            </div>

            {/* Información de Contacto y Propiedad de Interés */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#141414]/10 bg-[#F5F3EE]/50 p-4 space-y-3">
                <p className="text-label-sm uppercase tracking-wider text-secondary font-bold">Datos de Contacto</p>
                <div className="space-y-2 text-body-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-[#141414] font-semibold">
                      <span className="material-symbols-outlined text-[18px] text-st-available">call</span>
                      {selectedLead.phone}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(selectedLead.phone).catch(() => {});
                          toast("Teléfono copiado al portapapeles");
                        }}
                        className="px-2 py-1 rounded bg-white border border-[#141414]/15 text-[11px] font-semibold hover:border-[#141414] cursor-pointer"
                      >
                        Copiar
                      </button>
                      <a
                        href={`https://wa.me/${selectedLead.phone.replace(/\D/g, "") || WHATSAPP}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => markReplied(selectedLead.id)}
                        className="px-2.5 py-1 rounded bg-st-available text-white text-[11px] font-semibold inline-flex items-center gap-1 hover:opacity-90"
                      >
                        <span className="material-symbols-outlined text-[13px]">chat</span>
                        WhatsApp
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px] text-secondary">mail</span>
                    <span>{selectedLead.email || "Correo no registrado"}</span>
                  </div>
                  {selectedLead.appointment && (
                    <div className="flex items-center gap-2 text-[#D9381E] font-semibold">
                      <span className="material-symbols-outlined text-[18px]">event</span>
                      <span>Cita programada: {selectedLead.appointment}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-[#141414]/10 bg-[#F5F3EE]/50 p-4 space-y-3">
                <p className="text-label-sm uppercase tracking-wider text-secondary font-bold">Propiedad e Interés Comercial</p>
                {(() => {
                  const prop = propOf(selectedLead.propertyCode);
                  return (
                    <div className="space-y-2 text-body-sm">
                      {prop ? (
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="px-1.5 py-0.5 rounded bg-[#141414] text-[#F5F3EE] font-mono text-[11px] font-semibold">
                              {prop.code}
                            </span>
                            <p className="font-semibold text-[#141414] mt-1">{prop.title}</p>
                            <p className="text-label-sm text-secondary">
                              {prop.zone} · <strong className="text-[#D9381E]">{priceText(prop)}</strong>
                            </p>
                          </div>
                          <Link
                            href={`/panel/propiedades/${prop.code}`}
                            className="px-2.5 py-1 rounded-lg border border-[#141414]/20 bg-white text-[11px] font-semibold hover:border-[#141414] shrink-0"
                          >
                            Ver propiedad
                          </Link>
                        </div>
                      ) : (
                        <p className="font-medium text-[#141414]">{selectedLead.interest || "Interés general de cartera RG"}</p>
                      )}
                      {selectedLead.budget && (
                        <p className="text-label-sm text-on-surface-variant">
                          Presupuesto estimado: <strong className="text-[#141414]">{selectedLead.budget}</strong>
                        </p>
                      )}
                      {selectedLead.simulated && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-st-available-bg text-st-available font-label-sm text-[12px] font-semibold">
                          <span className="material-symbols-outlined text-[14px]">calculate</span>
                          {selectedLead.simulated}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Etapa actual y Asesor asignado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-label-sm uppercase tracking-wider text-secondary font-bold">Etapa actual en el Pipeline</span>
                <select
                  value={selectedLead.stage}
                  onChange={(e) => move(selectedLead.id, e.target.value)}
                  className="h-11 px-3 rounded-xl border border-[#141414]/20 bg-white font-body-sm text-body-sm font-semibold text-[#141414] focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-label-sm uppercase tracking-wider text-secondary font-bold">Asesor responsable</span>
                <select
                  value={selectedLead.advisor}
                  disabled={role !== "super"}
                  onChange={(e) => {
                    assignLeadAdvisor(selectedLead.id, e.target.value);
                    toast(`Contacto asignado a ${adv(e.target.value).name}`);
                  }}
                  className="h-11 px-3 rounded-xl border border-[#141414]/20 bg-white font-body-sm text-body-sm font-semibold text-[#141414] disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {ADVISORS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.role === "super" ? "Super admin" : "Asesor comercial"})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Bitácora y Seguimientos */}
            <div className="rounded-2xl border border-[#141414]/15 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#141414] text-[#F5F3EE] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">history_edu</span>
                  </span>
                  <div>
                    <h3 className="font-title-md text-title-md font-bold text-[#141414]">Bitácora y Seguimientos</h3>
                    <p className="text-label-sm text-secondary">
                      Historial cronológico de llamadas, visitas y acuerdos con el cliente
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#F5F3EE] text-[#141414] text-label-sm font-semibold">
                  {(selectedLead.notes?.length ?? 0) + (selectedLead.note ? 1 : 0)} registros
                </span>
              </div>

              <form onSubmit={handleSaveNote} className="space-y-2.5">
                <label htmlFor="lead-note-input" className="sr-only">
                  Escribir nueva nota de seguimiento
                </label>
                <textarea
                  id="lead-note-input"
                  rows={2}
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder={`Escribe un acuerdo, llamada o comentario de seguimiento (se firmará como ${user.name})…`}
                  className="w-full p-3 rounded-xl border border-[#141414]/20 bg-[#F5F3EE]/40 font-body-sm text-body-sm text-[#141414] placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-[#141414]"
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] text-secondary">
                    Autor activo: <strong className="text-[#141414]">{user.name}</strong>
                  </span>
                  <button
                    type="submit"
                    disabled={!noteDraft.trim()}
                    className="h-10 px-4 rounded-xl bg-[#141414] text-[#F5F3EE] text-label-sm font-semibold inline-flex items-center gap-1.5 hover:bg-[#D9381E] transition-colors cursor-pointer active:scale-[0.98] disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_comment</span>
                    Guardar en bitácora
                  </button>
                </div>
              </form>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 pt-2 border-t border-[#141414]/10">
                {(selectedLead.notes ?? []).map((n) => (
                  <div key={n.id} className="p-3.5 rounded-xl bg-[#F5F3EE]/70 border border-[#141414]/10 space-y-1">
                    <div className="flex items-center justify-between gap-2 text-[12px]">
                      <span className="font-semibold text-[#141414] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#D9381E]" aria-hidden />
                        {n.author}
                      </span>
                      <span className="font-mono text-secondary">{n.date}</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-[#141414] leading-relaxed">{n.text}</p>
                  </div>
                ))}

                {selectedLead.note && (
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 space-y-1">
                    <div className="flex items-center justify-between gap-2 text-[12px]">
                      <span className="font-semibold text-on-surface-variant flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">info</span>
                        Nota inicial de ingreso ({ORIGIN_LABEL[selectedLead.origin]})
                      </span>
                      <span className="font-mono text-secondary">{formatEntryDateTime(selectedLead.minutesAgo)}</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface">{selectedLead.note}</p>
                  </div>
                )}

                {(!selectedLead.notes || selectedLead.notes.length === 0) && !selectedLead.note && (
                  <p className="py-4 text-center text-body-sm text-secondary">
                    Aún no hay notas registradas en la bitácora de este contacto.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {drawer && <AddLeadDrawer onClose={() => setDrawer(false)} kinds={kinds} />}
      {kindModal && (
        <NameModal
          title="Agregar tipo de tarjeta"
          label="Nombre del tipo"
          placeholder="Ej. Inversionista"
          onClose={() => setKindModal(false)}
          onSave={(name) => {
            setKinds((k) => [...k, { id: name.toLowerCase(), label: name, plural: name }]);
            setKindModal(false);
            toast(`Tipo “${name}” agregado`);
          }}
        />
      )}
      {stageModal && (
        <NameModal
          title="Agregar etapa"
          label="Nombre de la etapa"
          placeholder="Ej. Segunda visita"
          onClose={() => setStageModal(false)}
          onSave={(name) => {
            setStages((s) => [...s.slice(0, -1), { id: name.toLowerCase().replace(/\s+/g, "-"), label: name, dot: "bg-outline" }, s[s.length - 1]]);
            setStageModal(false);
            toast(`Etapa “${name}” agregada`);
          }}
        />
      )}
    </div>
  );
}

function NameModal({
  title,
  label,
  placeholder,
  onClose,
  onSave,
}: {
  title: string;
  label: string;
  placeholder: string;
  onClose: () => void;
  onSave: (v: string) => void;
}) {
  const [v, setV] = useState("");
  return (
    <Modal open onClose={onClose} labelledBy="nm-title" className="max-w-md">
      <form
        className="p-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (v.trim().length > 1) onSave(v.trim());
        }}
      >
        <div className="flex items-start justify-between">
          <h2 id="nm-title" className="font-headline-sm text-headline-sm text-primary">
            {title}
          </h2>
          <CloseButton onClick={onClose} />
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">{label}</span>
          <input
            value={v}
            onChange={(e) => setV(e.target.value)}
            placeholder={placeholder}
            className="h-12 px-4 rounded-lg border border-[#ECEAE7] focus:outline-none focus:border-primary"
          />
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-12 px-5 rounded-lg bg-surface-container font-label-md text-label-md">
            Cancelar
          </button>
          <button type="submit" className="h-12 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md">
            Agregar
          </button>
        </div>
      </form>
    </Modal>
  );
}
