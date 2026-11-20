"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { PageHeader } from "@/components/panel/Shell";
import { usePanel } from "@/components/panel/PanelProvider";
import { Card, PField, Segmented, Toggle, pInput } from "@/components/panel/ui";
import { CloseButton, Modal } from "@/components/ui/Modal";
import { ADVISORS } from "@/lib/data/leads";

type ConfigTab = "integrations" | "ai-search" | "users-credit";

const ADS_CREDENTIALS_KEY = "rg_ads_credentials_v1";
const TEAM_STORAGE_KEY = "rg_team_members_v1";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  title: string;
  systemRole: "Super admin" | "Asesor comercial";
  status: "Activo" | "Suspendido";
  protected?: boolean;
}

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: "raul",
    name: "Ec. Raúl García",
    email: "raul@rginmobiliaria.ec",
    title: "Director General · Super admin",
    systemRole: "Super admin",
    status: "Activo",
    protected: true,
  },
  {
    id: "mateo",
    name: "Arq. Mateo Silva",
    email: "mateo@rginmobiliaria.ec",
    title: "Asesor Comercial Senior",
    systemRole: "Asesor comercial",
    status: "Activo",
  },
  {
    id: "andrea",
    name: "Ing. Andrea Vega",
    email: "andrea@rginmobiliaria.ec",
    title: "Asesora de Inversiones",
    systemRole: "Asesor comercial",
    status: "Activo",
  },
];

const UNMET_DEMAND = [
  {
    query: "Departamento 3 dormitorios VIP cerca del Tranvía ≤ $105.000",
    count: 68,
    zone: "El Batán / Av. Américas",
    avgBudget: "$98.500 USD",
    gap: "$1.9M USD",
    action: "Captar unidades VIP o nueva torre",
  },
  {
    query: "Terreno con vista panorámica y servicios en Turi ≤ $85.000",
    count: 54,
    zone: "Turi",
    avgBudget: "$76.000 USD",
    gap: "$920K USD",
    action: "Priorizar captación de lotes",
  },
  {
    query: "Suite amoblada en alquiler ejecutivo Centro Histórico",
    count: 41,
    zone: "Centro Histórico",
    avgBudget: "$480 / mes",
    gap: "$310K / año",
    action: "Alianzas con propietarios",
  },
  {
    query: "Casa unifamiliar con jardín amplio en Challuabamba",
    count: 29,
    zone: "Challuabamba",
    avgBudget: "$215.000 USD",
    gap: "$1.2M USD",
    action: "Prospección de residencias exclusivas",
  },
];

export default function PanelConfiguracionPage() {
  const { role, toast } = usePanel();
  const [tab, setTab] = useState<ConfigTab>("integrations");

  // Credenciales e IDs de Pauta Digital (Meta, Google, TikTok)
  const [metaConnected, setMetaConnected] = useState(true);
  const [autoLeadCreate, setAutoLeadCreate] = useState(true);
  const [waNotify, setWaNotify] = useState(true);

  const [metaPixelId, setMetaPixelId] = useState("108492019482019");
  const [metaAccessToken, setMetaAccessToken] = useState("EAAGm0PX4ZCpsBAJ9x849201948201948RGToken");
  const [metaAdAccountId, setMetaAdAccountId] = useState("act_8492019482");
  const [showMetaToken, setShowMetaToken] = useState(false);

  const [googleConversionId, setGoogleConversionId] = useState("AW-948201948");
  const [googleConversionLabel, setGoogleConversionLabel] = useState("kL9xCM_849201948_RG");

  const [tiktokPixelId, setTiktokPixelId] = useState("C948201948201948RG");
  const [tiktokEventsToken, setTiktokEventsToken] = useState("ttk_live_948201948201948_events_rg");
  const [showTiktokToken, setShowTiktokToken] = useState(false);

  // Round-Robin
  const [rrOpen, setRrOpen] = useState(false);
  const [rrMode, setRrMode] = useState<"weighted" | "sequential" | "zone">("weighted");
  const [weights, setWeights] = useState<Record<string, number>>(() =>
    Object.fromEntries(ADVISORS.map((a, idx) => [a.id, idx === 0 ? 40 : 30])),
  );

  // Buscar con IA & Demanda
  const [chips, setChips] = useState([
    "Casa de 3 habitaciones en Ricaurte con patio y parqueadero",
    "Departamento cerca del tranvía o El Batán menor a $100.000",
    "Terreno con vista en Turi o Challuabamba para construir",
    "Suite amoblada en alquiler para ejecutivo en El Centro",
  ]);
  const [newChip, setNewChip] = useState("");
  const [maxSimilar, setMaxSimilar] = useState(4);
  const [period, setPeriod] = useState("30d");

  // Equipo y Crédito
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEFAULT_TEAM);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    title: "Asesor Comercial",
    systemRole: "Asesor comercial" as "Super admin" | "Asesor comercial",
    status: "Activo" as "Activo" | "Suspendido",
  });
  const [memberError, setMemberError] = useState("");

  const [creditPrograms, setCreditPrograms] = useState([
    { id: "vip", name: "Crédito VIP / VIS", rate: "4.99" },
    { id: "biess", name: "BIESS", rate: "6.50" },
    { id: "bank", name: "Banca Privada", rate: "8.95" },
  ]);

  useEffect(() => {
    try {
      const rawAds = localStorage.getItem(ADS_CREDENTIALS_KEY);
      if (rawAds) {
        const p = JSON.parse(rawAds);
        if (typeof p.metaConnected === "boolean") setMetaConnected(p.metaConnected);
        if (typeof p.autoLeadCreate === "boolean") setAutoLeadCreate(p.autoLeadCreate);
        if (typeof p.waNotify === "boolean") setWaNotify(p.waNotify);
        if (typeof p.metaPixelId === "string") setMetaPixelId(p.metaPixelId);
        if (typeof p.metaAccessToken === "string") setMetaAccessToken(p.metaAccessToken);
        if (typeof p.metaAdAccountId === "string") setMetaAdAccountId(p.metaAdAccountId);
        if (typeof p.googleConversionId === "string") setGoogleConversionId(p.googleConversionId);
        if (typeof p.googleConversionLabel === "string") setGoogleConversionLabel(p.googleConversionLabel);
        if (typeof p.tiktokPixelId === "string") setTiktokPixelId(p.tiktokPixelId);
        if (typeof p.tiktokEventsToken === "string") setTiktokEventsToken(p.tiktokEventsToken);
      }
      const rawTeam = localStorage.getItem(TEAM_STORAGE_KEY);
      if (rawTeam) {
        const parsedTeam = JSON.parse(rawTeam) as TeamMember[];
        if (Array.isArray(parsedTeam) && parsedTeam.length > 0) {
          // Garantiza siempre que el Super Admin sea Ec. Raúl García
          const normalized = parsedTeam.map((m) =>
            m.id === "raul"
              ? { ...m, name: "Ec. Raúl García", systemRole: "Super admin" as const, protected: true }
              : m,
          );
          setTeamMembers(normalized);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persistTeam = (next: TeamMember[]) => {
    setTeamMembers(next);
    try {
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("rg-panel-updated"));
    } catch {
      /* ignore */
    }
  };

  const saveAdsCredentials = () => {
    const payload = {
      metaConnected,
      autoLeadCreate,
      waNotify,
      metaPixelId: metaPixelId.trim(),
      metaAccessToken: metaAccessToken.trim(),
      metaAdAccountId: metaAdAccountId.trim(),
      googleConversionId: googleConversionId.trim(),
      googleConversionLabel: googleConversionLabel.trim(),
      tiktokPixelId: tiktokPixelId.trim(),
      tiktokEventsToken: tiktokEventsToken.trim(),
    };
    try {
      localStorage.setItem(ADS_CREDENTIALS_KEY, JSON.stringify(payload));
      window.dispatchEvent(new Event("rg-panel-updated"));
    } catch {
      /* ignore */
    }
    fetch("/api/panel/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "ads_credentials", value: payload }),
    }).catch(() => {});
    toast("Credenciales de Meta, Google Ads y TikTok Ads guardadas");
  };

  const handleAddCollaborator = (e: FormEvent) => {
    e.preventDefault();
    if (newMember.name.trim().length < 3) {
      setMemberError("Ingresa el nombre completo del colaborador.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMember.email.trim())) {
      setMemberError("Ingresa un correo electrónico institucional válido.");
      return;
    }
    const id = `col-${Date.now().toString(36)}`;
    const created: TeamMember = {
      id,
      name: newMember.name.trim(),
      email: newMember.email.trim().toLowerCase(),
      title: newMember.title.trim() || "Asesor Comercial",
      systemRole: newMember.systemRole,
      status: newMember.status,
    };
    const next = [...teamMembers, created];
    persistTeam(next);
    setWeights((prev) => ({ ...prev, [id]: 20 }));
    setAddMemberOpen(false);
    setNewMember({
      name: "",
      email: "",
      title: "Asesor Comercial",
      systemRole: "Asesor comercial",
      status: "Activo",
    });
    setMemberError("");
    toast(`Colaborador ${created.name} agregado al equipo`);
  };

  const toggleMemberStatus = (member: TeamMember) => {
    if (member.protected) {
      toast("El Super admin principal (Ec. Raúl García) no puede suspenderse.");
      return;
    }
    const nextStatus: "Activo" | "Suspendido" = member.status === "Activo" ? "Suspendido" : "Activo";
    const next = teamMembers.map((m) => (m.id === member.id ? { ...m, status: nextStatus } : m));
    persistTeam(next);
    toast(
      nextStatus === "Suspendido"
        ? `Acceso de ${member.name} suspendido temporalmente`
        : `Acceso de ${member.name} reactivado`,
    );
  };

  const confirmDeleteMember = () => {
    if (!deleteTarget || deleteTarget.protected) return;
    const next = teamMembers.filter((m) => m.id !== deleteTarget.id);
    persistTeam(next);
    setWeights((prev) => {
      const copy = { ...prev };
      delete copy[deleteTarget.id];
      return copy;
    });
    toast(`Colaborador ${deleteTarget.name} eliminado del sistema`);
    setDeleteTarget(null);
  };

  const exportUnmetDemandCsv = () => {
    const head = ["Búsqueda frecuente sin inventario", "Búsquedas", "Zona buscada", "Presupuesto promedio", "Brecha estimada", "Oportunidad de captación"];
    const body = UNMET_DEMAND.map((r) => [r.query, String(r.count), r.zone, r.avgBudget, r.gap, r.action]);
    const csv = [head, ...body].map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `demanda-insatisfecha-rg-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Informe de Demanda Insatisfecha exportado en CSV");
  };

  const exportUnmetDemandJson = () => {
    const json = JSON.stringify({ period, exportedBy: "Ec. Raúl García", items: UNMET_DEMAND }, null, 2);
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `demanda-insatisfecha-rg-${period}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Informe de Demanda Insatisfecha exportado en JSON");
  };

  if (role !== "super") {
    return (
      <div>
        <PageHeader crumbs={["Panel", "Configuración"]} title="Acceso restringido" />
        <Card icon="lock" title="Solo Super admin (Ec. Raúl García)" subtitle="Esta sección requiere permisos de administración global.">
          <p className="text-body-md text-on-surface-variant">
            Tu rol actual es <strong>Asesor comercial</strong>. Solo el <strong>Super admin (Ec. Raúl García)</strong> puede administrar credenciales de pauta, parámetros de IA, usuarios y tasas del simulador.
          </p>
          <div className="pt-2">
            <Link
              href="/panel/propiedades"
              className="h-10 px-4 rounded-xl bg-primary text-on-primary text-label-md font-semibold inline-flex items-center gap-1.5"
            >
              Volver a Propiedades
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const totalWeight = teamMembers.reduce((s, m) => s + (weights[m.id] ?? 0), 0);
  const activeAdminsCount = teamMembers.filter((m) => m.systemRole === "Super admin" && m.status === "Activo").length;
  const activeAdvisorsCount = teamMembers.filter((m) => m.systemRole === "Asesor comercial" && m.status === "Activo").length;

  return (
    <div>
      <PageHeader
        crumbs={["Panel", "Configuración"]}
        title="Configuración, IA, Usuarios y Crédito"
        text="Credenciales de pauta (Meta, Google Ads, TikTok), buscador con IA, demanda insatisfecha, gestión de equipo y tasas del simulador."
        actions={
          <button
            type="button"
            onClick={async () => {
              saveAdsCredentials();
              persistTeam(teamMembers);
              await Promise.all([
                fetch("/api/panel/settings", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ key: "ai_chips", value: chips }),
                }),
                fetch("/api/panel/settings", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ key: "credit_programs", value: creditPrograms }),
                }),
              ]).catch(() => {});
              toast("Configuración global y credenciales guardadas");
            }}
            className="h-10 px-4 rounded-xl bg-primary text-on-primary text-label-md font-semibold inline-flex items-center gap-1.5 hover:bg-primary/90 cursor-pointer active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Guardar cambios
          </button>
        }
      />

      <div className="mb-6">
        <Segmented
          label="Secciones de configuración"
          value={tab}
          onChange={(v) => setTab(v)}
          options={[
            { v: "integrations", l: "Integraciones & Round-Robin (A8)" },
            { v: "ai-search", l: "Buscar con IA & Demanda (A6)" },
            { v: "users-credit", l: "Usuarios, Roles & Crédito (B3)" },
          ]}
        />
      </div>

      {tab === "integrations" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Integraciones Activas", value: "4 / 5", sub: "Meta · Google · TikTok · WA", icon: "power" },
              { label: "Eventos Hoy", value: "148", sub: "Sincronizados en tiempo real", icon: "sync" },
              { label: "Entrega Webhooks", value: "99.8%", sub: "Respuestas 200 OK", icon: "bolt" },
              { label: "Latencia Lead Ads", value: "1.4s", sub: "Meta -> Pipeline", icon: "speed" },
            ].map((k) => (
              <div
                key={k.label}
                className="group rounded-2xl border border-[#141414]/10 bg-surface-container-lowest p-5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-md hover:border-[#141414]/25"
              >
                <div className="flex items-center justify-between text-on-surface-variant mb-2">
                  <span className="text-label-sm uppercase tracking-wider font-semibold">{k.label}</span>
                  <span className="w-9 h-9 rounded-lg bg-[#F5F3EE] text-[#141414] flex items-center justify-center transition-colors duration-300 group-hover:bg-[#141414] group-hover:text-white">
                    <span className="material-symbols-outlined text-[18px]">{k.icon}</span>
                  </span>
                </div>
                <p className="font-display text-headline-md text-on-surface transition-colors duration-300 group-hover:text-[#D9381E]">
                  {k.value}
                </p>
                <p className="text-body-sm text-on-surface-variant mt-1">{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              {/* Meta Business / Meta Ads */}
              <Card
                icon="campaign"
                title="Meta Business / Meta Ads (Conversions API)"
                subtitle="Facebook Lead Ads, Instagram Instant Forms & Pixel"
                aside={
                  <span className="px-2.5 py-1 rounded-full bg-st-available/15 text-st-available text-label-sm font-semibold">
                    {metaConnected ? "Conectado" : "Pausado"}
                  </span>
                }
              >
                <div className="space-y-4">
                  <Toggle
                    checked={metaConnected}
                    onChange={setMetaConnected}
                    label="Sincronización activa con Business Manager RG"
                  />
                  <Toggle
                    checked={autoLeadCreate}
                    onChange={setAutoLeadCreate}
                    label="Crear lead inmediatamente en estado 'Nuevo Lead'"
                  />
                  <Toggle
                    checked={waNotify}
                    onChange={setWaNotify}
                    label="Notificar al asesor asignado por WhatsApp en < 30s"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-outline-variant">
                    <PField label="Meta Pixel ID">
                      {(id) => (
                        <input
                          id={id}
                          value={metaPixelId}
                          onChange={(e) => setMetaPixelId(e.target.value)}
                          placeholder="Ej. 108492019482019"
                          className={`${pInput} font-mono`}
                        />
                      )}
                    </PField>
                    <PField label="Ad Account ID">
                      {(id) => (
                        <input
                          id={id}
                          value={metaAdAccountId}
                          onChange={(e) => setMetaAdAccountId(e.target.value)}
                          placeholder="Ej. act_8492019482"
                          className={`${pInput} font-mono`}
                        />
                      )}
                    </PField>
                  </div>

                  <PField label="Access Token (Conversions API)">
                    {(id) => (
                      <div className="relative">
                        <input
                          id={id}
                          type={showMetaToken ? "text" : "password"}
                          value={metaAccessToken}
                          onChange={(e) => setMetaAccessToken(e.target.value)}
                          placeholder="EAAGm0PX4ZCpsBA..."
                          className={`${pInput} pr-11 font-mono`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowMetaToken((v) => !v)}
                          aria-label={showMetaToken ? "Ocultar token de Meta" : "Mostrar token de Meta"}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:text-primary cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showMetaToken ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    )}
                  </PField>

                  <div className="rounded-xl bg-surface p-4 border border-outline-variant text-body-sm space-y-1">
                    <p className="font-semibold text-on-surface">Campañas activas mapeadas (2)</p>
                    <p className="text-on-surface-variant">• Campaña Torre San Joaquín 2026</p>
                    <p className="text-on-surface-variant">• Campaña Terrenos Turi VIP</p>
                  </div>
                </div>
              </Card>

              {/* Google Ads & TikTok Ads */}
              <Card
                icon="ads_click"
                title="Google Ads & TikTok Ads (Tracking y Eventos)"
                subtitle="Identificadores de conversión y tokens de atribución"
                aside={
                  <button
                    type="button"
                    onClick={saveAdsCredentials}
                    className="h-9 px-3.5 rounded-lg bg-[#141414] text-[#F5F3EE] text-label-sm font-semibold hover:bg-[#D9381E] transition-colors cursor-pointer active:scale-[0.98]"
                  >
                    Guardar IDs
                  </button>
                }
              >
                <div className="space-y-5">
                  <div>
                    <p className="text-label-sm uppercase tracking-wider font-bold text-[#141414] mb-3 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#D9381E]">travel_explore</span>
                      Google Ads
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PField label="Conversion ID (AW-)">
                        {(id) => (
                          <input
                            id={id}
                            value={googleConversionId}
                            onChange={(e) => setGoogleConversionId(e.target.value)}
                            placeholder="AW-948201948"
                            className={`${pInput} font-mono`}
                          />
                        )}
                      </PField>
                      <PField label="Conversion Label">
                        {(id) => (
                          <input
                            id={id}
                            value={googleConversionLabel}
                            onChange={(e) => setGoogleConversionLabel(e.target.value)}
                            placeholder="kL9xCM_849201948"
                            className={`${pInput} font-mono`}
                          />
                        )}
                      </PField>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant">
                    <p className="text-label-sm uppercase tracking-wider font-bold text-[#141414] mb-3 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#D9381E]">smart_display</span>
                      TikTok Ads
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PField label="TikTok Pixel ID">
                        {(id) => (
                          <input
                            id={id}
                            value={tiktokPixelId}
                            onChange={(e) => setTiktokPixelId(e.target.value)}
                            placeholder="C948201948201948"
                            className={`${pInput} font-mono`}
                          />
                        )}
                      </PField>
                      <PField label="Events API Token">
                        {(id) => (
                          <div className="relative">
                            <input
                              id={id}
                              type={showTiktokToken ? "text" : "password"}
                              value={tiktokEventsToken}
                              onChange={(e) => setTiktokEventsToken(e.target.value)}
                              placeholder="ttk_live_..."
                              className={`${pInput} pr-11 font-mono`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowTiktokToken((v) => !v)}
                              aria-label={showTiktokToken ? "Ocultar token de TikTok" : "Mostrar token de TikTok"}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:text-primary cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {showTiktokToken ? "visibility_off" : "visibility"}
                              </span>
                            </button>
                          </div>
                        )}
                      </PField>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-5">
              <Card
                icon="alt_route"
                title="Cola y Ponderaciones Round-Robin"
                subtitle="Distribución equitativa de prospectos entrantes"
                aside={
                  <button
                    type="button"
                    onClick={() => setRrOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-label-sm font-semibold cursor-pointer active:scale-[0.98]"
                  >
                    Editar Reglas (A8.1)
                  </button>
                }
              >
                <div className="space-y-3">
                  {teamMembers.map((adv) => (
                    <div
                      key={adv.id}
                      className="rounded-xl border border-outline-variant bg-surface p-3.5 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-semibold text-on-surface text-body-md">{adv.name}</p>
                        <p className="text-label-sm text-on-surface-variant">
                          {adv.systemRole} · {adv.status}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-title-md text-primary">{weights[adv.id] ?? 30}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {tab === "ai-search" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <Card
                icon="label_important"
                title="Frases de Ejemplo y Sugerencias (Chips A6)"
                subtitle="Aparecen bajo el buscador inteligente"
              >
                <div className="space-y-2.5">
                  {chips.map((c, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-outline-variant bg-surface px-3.5 py-2.5 flex items-center justify-between gap-3"
                    >
                      <span className="text-body-sm text-on-surface">&ldquo;{c}&rdquo;</span>
                      <button
                        type="button"
                        onClick={() => setChips((prev) => prev.filter((_, i) => i !== idx))}
                        aria-label="Eliminar frase"
                        className="text-on-surface-variant hover:text-rg-red cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <input
                      value={newChip}
                      onChange={(e) => setNewChip(e.target.value)}
                      placeholder="Agregar nueva frase sugerida..."
                      className={pInput}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newChip.trim()) return;
                        setChips((prev) => [...prev, newChip.trim()]);
                        setNewChip("");
                      }}
                      className="h-10 px-4 rounded-xl bg-primary text-on-primary text-label-md font-semibold shrink-0 cursor-pointer"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-5">
              <Card
                icon="auto_awesome_motion"
                title="Reglas de Propiedades Parecidas (S4)"
                subtitle="Cuando no hay coincidencia 100% exacta"
              >
                <PField label="Cantidad máxima de tarjetas recomendadas">
                  {() => (
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {[2, 3, 4, 6].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setMaxSimilar(n)}
                          className={`h-10 rounded-xl text-label-md font-semibold border cursor-pointer ${
                            maxSimilar === n
                              ? "bg-primary text-on-primary border-primary"
                              : "bg-surface border-outline-variant text-on-surface"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                </PField>
              </Card>
            </div>
          </div>

          <Card
            icon="psychology"
            title="Informe de Demanda Insatisfecha (A6.2)"
            subtitle="Inteligencia comercial para priorizar captación de inventario"
            aside={
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={exportUnmetDemandCsv}
                  className="h-10 px-3.5 rounded-xl border border-outline-variant bg-white text-label-sm font-semibold inline-flex items-center gap-1.5 hover:border-[#141414] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Exportar CSV
                </button>
                <button
                  type="button"
                  onClick={exportUnmetDemandJson}
                  className="h-10 px-3.5 rounded-xl bg-[#141414] text-[#F5F3EE] text-label-sm font-semibold inline-flex items-center gap-1.5 hover:bg-[#D9381E] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">data_object</span>
                  Exportar JSON
                </button>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  aria-label="Periodo del informe"
                  className={`${pInput} w-full sm:w-40`}
                >
                  <option value="7d">Últimos 7 días</option>
                  <option value="30d">Últimos 30 días</option>
                  <option value="90d">Últimos 90 días</option>
                </select>
              </div>
            }
          >
            {/* Explicación de negocio accionable */}
            <div className="p-4 rounded-xl bg-[#F5F3EE] border border-[#141414]/15 flex items-start gap-3 mb-5">
              <span className="material-symbols-outlined text-[#D9381E] text-[22px] mt-0.5">lightbulb</span>
              <div>
                <p className="font-title-md text-body-md font-bold text-[#141414]">
                  ¿Para qué sirve este informe?
                </p>
                <p className="text-body-sm text-on-surface-variant mt-0.5">
                  Búsquedas realizadas por clientes en la web donde no hubo propiedades exactas disponibles; úsalo para detectar oportunidades de captación por zona y presupuesto promedio.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Consultas Semánticas", value: "1.240", sub: "84% con match · 16% sin match", icon: "manage_search" },
                { label: "Déficit Estimado", value: "$3.4M", sub: "Venta $3.1M · Renta $310k/año", icon: "Request_quote" },
                { label: "Presupuesto Medio", value: "$108.5K", sub: "Ticket promedio buscado", icon: "payments" },
                { label: "Rescate a Asesor", value: "42", sub: "21.2% convertidos a lead", icon: "support_agent" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="group rounded-xl border border-[#141414]/10 bg-surface p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#141414]/25"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-label-sm uppercase text-on-surface-variant font-semibold">{m.label}</p>
                    <span className="w-8 h-8 rounded-lg bg-[#F5F3EE] text-[#141414] flex items-center justify-center transition-colors group-hover:bg-[#141414] group-hover:text-white">
                      <span className="material-symbols-outlined text-[16px]">{m.icon.toLowerCase()}</span>
                    </span>
                  </div>
                  <p className="font-display text-headline-sm text-on-surface mt-2 transition-colors group-hover:text-[#D9381E]">
                    {m.value}
                  </p>
                  <p className="text-body-sm text-on-surface-variant mt-0.5">{m.sub}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#141414]/10">
              <table className="w-full text-left border-collapse text-body-sm">
                <thead>
                  <tr className="bg-[#141414]/[0.04] border-b-2 border-[#141414]/15 text-label-sm uppercase tracking-wider font-bold text-[#141414]">
                    <th className="py-3.5 px-4">Búsqueda frecuente sin inventario</th>
                    <th className="py-3.5 px-4">Búsquedas</th>
                    <th className="py-3.5 px-4">Zona buscada</th>
                    <th className="py-3.5 px-4">Presupuesto promedio</th>
                    <th className="py-3.5 px-4">Brecha est.</th>
                    <th className="py-3.5 px-4">Oportunidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141414]/10">
                  {UNMET_DEMAND.map((row) => (
                    <tr key={row.query} className="odd:bg-white even:bg-[#F5F3EE]/60 hover:bg-[#F5F3EE] transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#141414]">{row.query}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#141414]">{row.count}</td>
                      <td className="py-3.5 px-4">{row.zone}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#D9381E]">{row.avgBudget}</td>
                      <td className="py-3.5 px-4 font-semibold">{row.gap}</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">{row.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {tab === "users-credit" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <Card
              icon="badge"
              title="Equipo y Permisos de Acceso (B3)"
              subtitle="Gestión de colaboradores, roles y aislamiento de cartera"
              aside={
                <button
                  type="button"
                  onClick={() => {
                    setMemberError("");
                    setAddMemberOpen(true);
                  }}
                  className="h-10 px-4 rounded-xl bg-[#141414] text-[#F5F3EE] text-label-sm font-semibold inline-flex items-center gap-1.5 hover:bg-[#D9381E] transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  + Agregar colaborador
                </button>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="rounded-xl border border-outline-variant bg-surface p-4 space-y-1">
                  <p className="text-label-md font-bold text-on-surface">
                    Super admin ({activeAdminsCount} {activeAdminsCount === 1 ? "activo" : "activos"})
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    Acceso global a inventario, configuración, credenciales de pauta, usuarios y tasas del simulador.
                  </p>
                </div>
                <div className="rounded-xl border border-outline-variant bg-surface p-4 space-y-1">
                  <p className="text-label-md font-bold text-on-surface">
                    Asesor Comercial ({activeAdvisorsCount} {activeAdvisorsCount === 1 ? "activo" : "activos"} · Aislado)
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    Acceso restringido únicamente a sus propios prospectos asignados, bitácora y visitas.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#141414]/10">
                <table className="w-full text-left border-collapse text-body-sm">
                  <thead>
                    <tr className="bg-[#141414]/[0.04] border-b-2 border-[#141414]/15 text-label-sm uppercase tracking-wider font-bold text-[#141414]">
                      <th className="py-3 px-4">Colaborador</th>
                      <th className="py-3 px-4">Rol</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141414]/10">
                    {teamMembers.map((m) => (
                      <tr key={m.id} className="odd:bg-white even:bg-[#F5F3EE]/60 hover:bg-[#F5F3EE] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#141414]">{m.name}</p>
                            {m.protected && (
                              <span className="px-2 py-0.5 rounded bg-[#141414] text-[#F5F3EE] text-[10px] font-bold uppercase tracking-wider">
                                Principal
                              </span>
                            )}
                          </div>
                          <p className="text-label-sm text-on-surface-variant">
                            {m.email} · {m.title}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 font-medium">{m.systemRole}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-semibold ${
                              m.status === "Activo"
                                ? "bg-st-available/15 text-st-available border border-st-available/25"
                                : "bg-st-reserved-bg text-st-reserved border border-st-reserved/25"
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {m.protected ? (
                            <span className="text-label-sm text-secondary italic">Protegido</span>
                          ) : (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => toggleMemberStatus(m)}
                                className="px-2.5 py-1.5 rounded-lg border border-outline-variant bg-white text-label-sm font-semibold hover:border-[#141414] transition-colors cursor-pointer"
                              >
                                {m.status === "Activo" ? "Suspender" : "Reactivar"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(m)}
                                aria-label={`Eliminar a ${m.name}`}
                                className="w-8 h-8 rounded-lg border border-outline-variant bg-white text-secondary hover:text-[#D9381E] hover:border-[#D9381E] inline-flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <Card
              icon="account_balance"
              title="Programas y Tasas de Crédito (Simulador S6)"
              subtitle="Tasas referenciales anuales (%)"
              aside={
                <button
                  type="button"
                  onClick={() =>
                    setCreditPrograms((prev) => [
                      ...prev,
                      { id: `prog-${Date.now()}`, name: "Nuevo programa", rate: "7.50" },
                    ])
                  }
                  className="h-9 px-3 rounded-lg bg-primary text-on-primary text-label-sm font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Agregar programa
                </button>
              }
            >
              <div className="space-y-4">
                {creditPrograms.map((prog, idx) => (
                  <div key={prog.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-7">
                      <PField label={`Programa #${idx + 1}`}>
                        {(id) => (
                          <input
                            id={id}
                            value={prog.name}
                            onChange={(e) => {
                              const next = [...creditPrograms];
                              next[idx] = { ...next[idx], name: e.target.value };
                              setCreditPrograms(next);
                            }}
                            className={pInput}
                          />
                        )}
                      </PField>
                    </div>
                    <div className="col-span-4">
                      <PField label="Tasa (%)">
                        {(id) => (
                          <input
                            id={id}
                            value={prog.rate}
                            onChange={(e) => {
                              const next = [...creditPrograms];
                              next[idx] = { ...next[idx], rate: e.target.value };
                              setCreditPrograms(next);
                            }}
                            className={`${pInput} font-mono`}
                          />
                        )}
                      </PField>
                    </div>
                    <div className="col-span-1 flex justify-end pb-1">
                      <button
                        type="button"
                        onClick={() => setCreditPrograms((prev) => prev.filter((_, i) => i !== idx))}
                        aria-label={`Eliminar ${prog.name}`}
                        className="w-9 h-9 rounded-lg text-on-surface-variant hover:text-rg-red grid place-items-center cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                <p className="text-body-sm text-on-surface-variant">
                  Estas tasas alimentan el simulador referencial en las fichas públicas sin constituir preaprobación bancaria.
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Modal: Agregar Colaborador */}
      <Modal open={addMemberOpen} onClose={() => setAddMemberOpen(false)} labelledBy="add-member-modal-title" className="max-w-[540px]">
        <form onSubmit={handleAddCollaborator} className="p-6 md:p-7 space-y-4" noValidate>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="add-member-modal-title" className="font-display text-headline-sm text-on-surface">
                Agregar nuevo colaborador
              </h2>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Crea un acceso para un asesor comercial o administrador del equipo RG.
              </p>
            </div>
            <CloseButton onClick={() => setAddMemberOpen(false)} />
          </div>

          {memberError && (
            <div role="alert" className="p-3 rounded-xl bg-error-container text-on-error-container text-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{memberError}</span>
            </div>
          )}

          <PField label="Nombre completo" required>
            {(id) => (
              <input
                id={id}
                value={newMember.name}
                onChange={(e) => {
                  setNewMember({ ...newMember, name: e.target.value });
                  setMemberError("");
                }}
                placeholder="Ej. Ing. Sofía Cordero"
                className={pInput}
              />
            )}
          </PField>

          <PField label="Correo electrónico institucional" required>
            {(id) => (
              <input
                id={id}
                type="email"
                value={newMember.email}
                onChange={(e) => {
                  setNewMember({ ...newMember, email: e.target.value });
                  setMemberError("");
                }}
                placeholder="sofia@rginmobiliaria.ec"
                className={pInput}
              />
            )}
          </PField>

          <PField label="Cargo / Especialidad">
            {(id) => (
              <input
                id={id}
                value={newMember.title}
                onChange={(e) => setNewMember({ ...newMember, title: e.target.value })}
                placeholder="Ej. Asesora Comercial · Proyectos VIP"
                className={pInput}
              />
            )}
          </PField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PField label="Rol en el sistema">
              {(id) => (
                <select
                  id={id}
                  value={newMember.systemRole}
                  onChange={(e) => setNewMember({ ...newMember, systemRole: e.target.value as "Super admin" | "Asesor comercial" })}
                  className={pInput}
                >
                  <option value="Asesor comercial">Asesor comercial (Aislado)</option>
                  <option value="Super admin">Super admin (Global)</option>
                </select>
              )}
            </PField>

            <PField label="Estado inicial">
              {(id) => (
                <select
                  id={id}
                  value={newMember.status}
                  onChange={(e) => setNewMember({ ...newMember, status: e.target.value as "Activo" | "Suspendido" })}
                  className={pInput}
                >
                  <option value="Activo">Activo</option>
                  <option value="Suspendido">Suspendido</option>
                </select>
              )}
            </PField>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
            <button
              type="button"
              onClick={() => setAddMemberOpen(false)}
              className="h-10 px-4 rounded-xl border border-outline-variant text-label-md font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-[#141414] text-[#F5F3EE] text-label-md font-semibold hover:bg-[#D9381E] transition-colors cursor-pointer"
            >
              Guardar colaborador
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirmar Eliminación de Colaborador */}
      {deleteTarget && (
        <Modal open onClose={() => setDeleteTarget(null)} labelledBy="del-member-title" className="max-w-md">
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h2 id="del-member-title" className="font-display text-headline-sm text-on-surface">
                Eliminar colaborador
              </h2>
              <CloseButton onClick={() => setDeleteTarget(null)} />
            </div>
            <p className="text-body-md text-on-surface-variant">
              ¿Estás seguro de eliminar a <strong className="text-on-surface">{deleteTarget.name}</strong> ({deleteTarget.email}) del equipo de RG Inmobiliaria?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="h-10 px-4 rounded-xl border border-outline-variant text-label-md font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteMember}
                className="h-10 px-5 rounded-xl bg-[#D9381E] text-white text-label-md font-semibold hover:opacity-90 cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Round-Robin */}
      <Modal open={rrOpen} onClose={() => setRrOpen(false)} labelledBy="rr-modal-title" className="max-w-[640px]">
        <div className="p-6 md:p-7 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="rr-modal-title" className="font-display text-headline-sm text-on-surface">
                Configuración de Cola y Ponderaciones Round-Robin
              </h2>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Define cuotas porcentuales para asignación de prospectos entrantes (Meta Ads y WhatsApp).
              </p>
            </div>
            <CloseButton onClick={() => setRrOpen(false)} />
          </div>

          <Segmented
            label="Criterio de asignación Round-Robin"
            value={rrMode}
            onChange={(v) => setRrMode(v)}
            options={[
              { v: "weighted", l: "Ponderación por asesor" },
              { v: "sequential", l: "1:1 Rotativo" },
              { v: "zone", l: "Enrutamiento zonal" },
            ]}
          />

          <div className="space-y-3">
            {teamMembers.map((adv) => (
              <div key={adv.id} className="rounded-xl border border-outline-variant p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-on-surface">{adv.name}</p>
                  <p className="text-label-sm text-on-surface-variant">
                    {adv.systemRole} · {adv.status}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={weights[adv.id] ?? 0}
                    onChange={(e) =>
                      setWeights((prev) => ({
                        ...prev,
                        [adv.id]: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                      }))
                    }
                    className={`${pInput} w-20 text-center font-mono`}
                  />
                  <span className="text-body-sm text-on-surface-variant">%</span>
                </div>
              </div>
            ))}
            <p className={`text-label-md font-semibold ${totalWeight === 100 ? "text-st-available" : "text-rg-red"}`}>
              Total asignado: {totalWeight}% (recomendado 100%)
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
            <button
              type="button"
              onClick={() => setRrOpen(false)}
              className="h-10 px-4 rounded-xl border border-outline-variant text-label-md font-semibold cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => {
                setRrOpen(false);
                toast("Reglas Round-Robin actualizadas");
              }}
              className="h-10 px-5 rounded-xl bg-primary text-on-primary text-label-md font-semibold cursor-pointer"
            >
              Aplicar ponderaciones
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
