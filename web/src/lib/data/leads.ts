/** Datos de prueba del pipeline (inventados). */

export type LeadKind = "comprador" | "arrendatario" | "propietario";
export type OriginKey = "meta-form" | "wa-ad" | "web" | "manual";

export interface Advisor {
  id: string;
  name: string;
  short: string;
  initials: string;
  role: "super" | "asesor";
  email?: string;
  title?: string;
  status?: "Activo" | "Suspendido";
}

export const ADVISORS: Advisor[] = [
  { id: "raul", name: "Ec. Raúl García", short: "Ec. Raúl García", initials: "RG", role: "super", email: "raul@rginmobiliaria.ec", title: "Director General · Super admin", status: "Activo" },
  { id: "mateo", name: "Arq. Mateo Silva", short: "Mateo S.", initials: "MS", role: "asesor", email: "mateo@rginmobiliaria.ec", title: "Asesor Comercial Senior", status: "Activo" },
  { id: "andrea", name: "Ing. Andrea Vega", short: "Andrea V.", initials: "AV", role: "asesor", email: "andrea@rginmobiliaria.ec", title: "Asesora de Inversiones", status: "Activo" },
];

export const STAGES = [
  { id: "nuevo", label: "Nuevo lead", dot: "bg-rg-red" },
  { id: "contacto", label: "Primer contacto", dot: "bg-st-building" },
  { id: "visita", label: "Visita agendada", dot: "bg-st-reserved" },
  { id: "visitado", label: "Visita realizada", dot: "bg-st-reserved" },
  { id: "negociacion", label: "Negociación", dot: "bg-secondary" },
  { id: "reserva", label: "Reserva o promesa", dot: "bg-secondary" },
  { id: "tramites", label: "En trámites / Crédito", dot: "bg-st-building" },
  { id: "ganado", label: "Cierre exitoso", dot: "bg-st-available" },
];

export const ORIGIN_LABEL: Record<OriginKey, string> = {
  "meta-form": "Formulario Meta",
  "wa-ad": "WhatsApp anuncio",
  web: "Web",
  manual: "Cargada a mano",
};

export const ORIGIN_STYLE: Record<OriginKey, { icon: string; cls: string }> = {
  "meta-form": { icon: "campaign", cls: "bg-st-building-bg text-st-building" },
  "wa-ad": { icon: "chat", cls: "bg-st-available-bg text-st-available" },
  web: { icon: "language", cls: "bg-surface-container text-on-surface" },
  manual: { icon: "edit_note", cls: "bg-primary text-on-primary" },
};

/** Fuentes que se cargan a mano con "Agregar lead" (el origen es obligatorio). */
export const MANUAL_SOURCES = ["TikTok", "Instagram", "Facebook (orgánico)", "Llamada", "Referido", "Feria de la Vivienda", "Visita a la oficina", "Otro"];

export interface LeadNote {
  id: string;
  text: string;
  author: string;
  date: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  kind: LeadKind;
  origin: OriginKey;
  /** Campaña (pauta) o fuente (cargada a mano) o canal web. */
  campaign?: string;
  propertyCode?: string;
  interest?: string;
  budget?: string;
  note?: string;
  notes?: LeadNote[];
  simulated?: string;
  advisor: string;
  stage: string;
  /** Minutos desde que llegó. */
  minutesAgo: number;
  /** Sin respuesta del asesor todavía. */
  noReply?: boolean;
  appointment?: string;
}

export const SEED_LEADS: Lead[] = [
  {
    id: "S1",
    name: "Carlos Morales",
    phone: "+593 99 845 1209",
    kind: "comprador",
    origin: "meta-form",
    campaign: "Casas Ricaurte Nov",
    propertyCode: "CA-001",
    budget: "$140.000 - $160.000",
    simulated: "Simuló crédito: cuota $890 / mes",
    advisor: "raul",
    stage: "nuevo",
    minutesAgo: 165,
    noReply: true,
  },
  {
    id: "S2",
    name: "Elena Serrano",
    phone: "+593 98 112 3344",
    kind: "arrendatario",
    origin: "web",
    campaign: "Agendar visita",
    propertyCode: "DP-021",
    advisor: "mateo",
    stage: "nuevo",
    minutesAgo: 14,
  },
  {
    id: "S3",
    name: "Sofía Ochoa",
    phone: "+593 96 552 7781",
    kind: "arrendatario",
    origin: "manual",
    campaign: "TikTok",
    interest: "Suite amoblada cerca del Centro",
    budget: "Hasta $500 / mes",
    advisor: "andrea",
    stage: "nuevo",
    minutesAgo: 190,
    noReply: true,
  },
  {
    id: "S4",
    name: "Roberto Crespo",
    phone: "+593 99 300 4410",
    kind: "arrendatario",
    origin: "wa-ad",
    campaign: "Deptos El Batán",
    propertyCode: "DP-060",
    note: "Necesita 2 parqueaderos y mudanza para fin de mes.",
    advisor: "andrea",
    stage: "contacto",
    minutesAgo: 50,
  },
  {
    id: "S5",
    name: "Patricia Vintimilla",
    phone: "+593 98 761 2290",
    kind: "propietario",
    origin: "web",
    campaign: "Vende o alquila con nosotros",
    interest: "Terreno de 1.200 m² con vista en Turi",
    budget: "Valor estimado: $210.000",
    advisor: "raul",
    stage: "contacto",
    minutesAgo: 60 * 20,
  },
  {
    id: "S6",
    name: "Fernando Ordóñez",
    phone: "+593 99 245 8812",
    kind: "comprador",
    origin: "manual",
    campaign: "Feria de la Vivienda",
    propertyCode: "PH-002",
    budget: "$245.000",
    appointment: "Mañana 10:30",
    advisor: "mateo",
    stage: "visita",
    minutesAgo: 60 * 26,
  },
  {
    id: "S7",
    name: "Martín Ullauri",
    phone: "+593 97 410 0021",
    kind: "propietario",
    origin: "manual",
    campaign: "Llamada",
    interest: "Casa en Misicata para valorar",
    appointment: "Viernes 16:00 (valoración)",
    advisor: "mateo",
    stage: "visita",
    minutesAgo: 60 * 30,
  },
  {
    id: "S8",
    name: "Andrés Vintimilla",
    phone: "+593 99 824 1102",
    kind: "comprador",
    origin: "meta-form",
    campaign: "Casas Challuabamba",
    propertyCode: "CA-014",
    budget: "$280.000",
    advisor: "raul",
    stage: "visitado",
    minutesAgo: 60 * 50,
  },
  {
    id: "S9",
    name: "Lucía Peña",
    phone: "+593 98 600 7731",
    kind: "comprador",
    origin: "wa-ad",
    campaign: "Deptos El Batán",
    propertyCode: "DP-052",
    simulated: "Simuló crédito: entrada 30 %",
    advisor: "andrea",
    stage: "negociacion",
    minutesAgo: 60 * 72,
  },
  {
    id: "S10",
    name: "Diego Torres",
    phone: "+593 99 123 9087",
    kind: "comprador",
    origin: "meta-form",
    campaign: "Proyectos en planos",
    propertyCode: "ED-003",
    interest: "Unidad 201",
    note: "Reserva firmada.",
    advisor: "mateo",
    stage: "reserva",
    minutesAgo: 60 * 96,
  },
  {
    id: "S11",
    name: "Familia Cordero",
    phone: "+593 98 450 3321",
    kind: "comprador",
    origin: "manual",
    campaign: "Referido",
    propertyCode: "CA-008",
    note: "Crédito BIESS en trámite.",
    advisor: "raul",
    stage: "tramites",
    minutesAgo: 60 * 24 * 6,
  },
  {
    id: "S12",
    name: "Familia Carrión",
    phone: "+593 99 777 1290",
    kind: "comprador",
    origin: "manual",
    campaign: "Referido",
    propertyCode: "CA-005",
    note: "Escritura firmada.",
    advisor: "raul",
    stage: "ganado",
    minutesAgo: 60 * 24 * 13,
  },
];
