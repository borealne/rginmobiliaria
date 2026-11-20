"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/panel/Shell";
import { usePanel } from "@/components/panel/PanelProvider";
import { Card, PField, Segmented, Toggle, pInput } from "@/components/panel/ui";
import {
  COUNTERS,
  HERO,
  HERO_SLIDES,
  HOME_FAQS,
  POPUP,
  SECTION_ICON_LIBRARY,
  SERVICE_ACTION_PRESETS,
  TEAM_ARCH_PALETTE,
  cloneDefaultAboutInstitutional,
  cloneDefaultSiteSections,
  ensureAboutData,
  getDefaultAboutSection,
  isDarkHexColor,
  loadSiteSections,
  saveSiteSections,
  type AboutInstitutionalData,
  type AboutParagraphItem,
  type ServiceCardItem,
  type SiteSectionBlock,
  type SiteSectionType,
  type TeamMemberItem,
} from "@/lib/data/content";
import { optimizeImageToDataUrl, stripImageExif } from "@/lib/image-sanitize";
import {
  DEFAULT_AUTOPLAY_SECONDS,
  clampAutoplaySeconds,
  loadHeroCmsConfig,
  saveHeroCmsConfig,
} from "@/lib/hero-settings";
import type { HeroSlide, Lang, Operation } from "@/lib/types";

type MainTab = "cms" | "assistant";
type CmsSection = "hero" | "counters" | "faq" | "popup" | "sections";
type AssistantSubTab = "rules" | "audit";

const POPUP_CMS_STORAGE_KEY = "rg_popup_cms_v1";

const CONVERSATION_LOG = [
  {
    id: "CONV-841",
    date: "Hoy, 11:24",
    channel: "Widget Web (C2)",
    visitor: "Visitante · Cuenca",
    topic: "Crédito VIP 4.99% en Torre San Joaquín",
    outcome: "Traspasado a Asesor",
    advisor: "Arq. Mateo Silva",
    shield: "PII Consentido",
  },
  {
    id: "CONV-840",
    date: "Hoy, 10:05",
    channel: "WhatsApp API",
    visitor: "Consulta desde Miami",
    topic: "Visita por video a Casa en Ricaurte (CA-001)",
    outcome: "Visita Agendada",
    advisor: "Ec. Raúl García",
    shield: "Dirección resguardada",
  },
  {
    id: "CONV-839",
    date: "Ayer, 17:42",
    channel: "Widget Web (C2)",
    visitor: "Visitante · El Batán",
    topic: "Solicitud de rebaja directa en ED-003",
    outcome: "Regla de Seguridad Aplicada",
    advisor: "Ec. Raúl García",
    shield: "Freno de oferta",
  },
  {
    id: "CONV-838",
    date: "Ayer, 15:18",
    channel: "Widget Web (C2)",
    visitor: "Visitante · Turi",
    topic: "Metraje y parqueaderos de DP-014",
    outcome: "Completado por IA",
    advisor: "—",
    shield: "Sin PII",
  },
];

export default function PanelContenidoPage() {
  const { properties, toast } = usePanel();
  const [mainTab, setMainTab] = useState<MainTab>("cms");
  const [cmsSection, setCmsSection] = useState<CmsSection>("hero");
  const [assistantTab, setAssistantTab] = useState<AssistantSubTab>("rules");

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() =>
    HERO_SLIDES.map((s) => ({
      ...s,
      title: { ...s.title },
      zone: { ...s.zone },
      summary: { ...s.summary },
    })),
  );
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [autoplaySeconds, setAutoplaySeconds] = useState(DEFAULT_AUTOPLAY_SECONDS);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [editingSlide, setEditingSlide] = useState<string | null>(null);

  useEffect(() => {
    const cfg = loadHeroCmsConfig();
    setHeroSlides(cfg.slides);
    setAutoplayEnabled(cfg.autoplayEnabled);
    setAutoplaySeconds(cfg.autoplaySeconds);
    setHeroLoaded(true);
  }, []);

  useEffect(() => {
    if (!heroLoaded) return;
    saveHeroCmsConfig({
      slides: heroSlides,
      autoplayEnabled,
      autoplaySeconds,
    });
  }, [heroLoaded, heroSlides, autoplayEnabled, autoplaySeconds]);

  const [counters, setCounters] = useState(COUNTERS.map((c) => ({ ...c })));
  const [faqs, setFaqs] = useState(HOME_FAQS.map((f) => ({ ...f })));
  const [siteSections, setSiteSections] = useState<SiteSectionBlock[]>(() => cloneDefaultSiteSections());
  const [sectionsLang, setSectionsLang] = useState<Lang>("es");
  const [collapsedBlocks, setCollapsedBlocks] = useState<Record<string, boolean>>({});
  const [confirmDeleteBlockId, setConfirmDeleteBlockId] = useState<string | null>(null);
  const [confirmResetSections, setConfirmResetSections] = useState(false);
  const [confirmResetAbout, setConfirmResetAbout] = useState(false);
  const [confirmDeleteParagraphId, setConfirmDeleteParagraphId] = useState<string | null>(null);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState<number>(0);
  const [teamUploadingId, setTeamUploadingId] = useState<string | null>(null);
  const [showAddBlockMenu, setShowAddBlockMenu] = useState(false);
  const [blockUploadError, setBlockUploadError] = useState<Record<string, string>>({});
  const blockFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [popupEnabled, setPopupEnabled] = useState(true);
  const [popupCode, setPopupCode] = useState(POPUP.code);
  const [popupKicker, setPopupKicker] = useState(POPUP.kicker);
  const [popupTitle, setPopupTitle] = useState(POPUP.subtitle);
  const [popupText, setPopupText] = useState(POPUP.text);
  const [popupImage, setPopupImage] = useState(POPUP.image);
  const [popupDelay, setPopupDelay] = useState(18);
  const [popupUploading, setPopupUploading] = useState(false);
  const [popupError, setPopupError] = useState<string | null>(null);
  const [popupLoaded, setPopupLoaded] = useState(false);
  const popupFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const rawPopup = localStorage.getItem(POPUP_CMS_STORAGE_KEY);
      if (rawPopup) {
        const parsed = JSON.parse(rawPopup);
        if (typeof parsed.enabled === "boolean") setPopupEnabled(parsed.enabled);
        if (typeof parsed.code === "string") setPopupCode(parsed.code);
        if (typeof parsed.kicker === "string") setPopupKicker(parsed.kicker);
        if (typeof parsed.title === "string") setPopupTitle(parsed.title);
        if (typeof parsed.text === "string") setPopupText(parsed.text);
        if (typeof parsed.image === "string" && parsed.image.trim()) setPopupImage(parsed.image);
        if (typeof parsed.delay === "number") setPopupDelay(parsed.delay);
      }
      const rawCounters = localStorage.getItem("rg_counters_cms_v1");
      if (rawCounters) setCounters(JSON.parse(rawCounters));
      const rawFaqs = localStorage.getItem("rg_faqs_cms_v1");
      if (rawFaqs) setFaqs(JSON.parse(rawFaqs));
      setSiteSections(loadSiteSections());
    } catch {
      /* ignore */
    }
    setPopupLoaded(true);
  }, []);

  useEffect(() => {
    if (!popupLoaded) return;
    saveSiteSections(siteSections);
  }, [popupLoaded, siteSections]);

  useEffect(() => {
    if (!popupLoaded) return;
    try {
      localStorage.setItem(
        POPUP_CMS_STORAGE_KEY,
        JSON.stringify({
          enabled: popupEnabled,
          code: popupCode,
          kicker: popupKicker,
          title: popupTitle,
          text: popupText,
          image: popupImage,
          delay: popupDelay,
        }),
      );
      window.dispatchEvent(new Event("rg-panel-updated"));
    } catch {
      /* ignore */
    }
  }, [popupLoaded, popupEnabled, popupCode, popupKicker, popupTitle, popupText, popupImage, popupDelay]);

  const handlePopupImageUpload = async (file: File | null) => {
    if (!file) return;
    setPopupError(null);
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setPopupError("Formato no permitido. Sube una imagen JPG, PNG o WEBP.");
      return;
    }
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > 5) {
      setPopupError(`El archivo pesa ${sizeMb.toFixed(1)} MB. El tamaño máximo permitido es 5 MB.`);
      return;
    }

    setPopupUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("propertyCode", `popup-${popupCode || "general"}`);
      const res = await fetch("/api/panel/upload", { method: "POST", body: form });
      if (res.ok) {
        const data = await res.json();
        if (data?.url) {
          setPopupImage(data.url);
          toast("Imagen del Popup subida a Supabase Storage y actualizada");
          setPopupUploading(false);
          return;
        }
      }
    } catch {
      /* Fallback local DataURL */
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPopupImage(reader.result);
        toast("Imagen del Popup cargada y guardada en este navegador");
      }
      setPopupUploading(false);
    };
    reader.onerror = () => {
      setPopupError("No se pudo procesar la imagen seleccionada.");
      setPopupUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const [aiOnline, setAiOnline] = useState(true);
  const [webChannel, setWebChannel] = useState(true);
  const [waChannel, setWaChannel] = useState(true);
  const [offHoursMsg, setOffHoursMsg] = useState(
    "Gracias por escribirnos. Nuestro equipo comercial atiende de lunes a viernes de 9:00 a 18:00. Déjanos tu consulta o fecha preferida y un asesor te responderá a primera hora hábil.",
  );
  const [channelFilter, setChannelFilter] = useState("all");

  const moveHero = (index: number, dir: -1 | 1) => {
    const next = [...heroSlides];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setHeroSlides(next.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const linkSlideToProperty = (index: number, code: string) => {
    const prop = properties.find((p) => p.code === code);
    if (!prop) return;
    const formattedPrice = `${prop.priceFrom ? "Desde " : ""}$${prop.price.toLocaleString("es-EC")}${prop.operation === "alquiler" ? " / mes" : ""}`;
    setHeroSlides((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...s,
              propertyCode: prop.code,
              slug: prop.slug,
              image: prop.photos[0]?.src ?? s.image,
              operation: prop.operation,
              exclusive: prop.exclusive,
              price: formattedPrice,
              title: { es: prop.title, en: prop.title },
              zone: { es: `${prop.city} · ${prop.zone}`, en: `${prop.city} · ${prop.zone}` },
              summary: { es: prop.summary, en: prop.summary },
            }
          : s,
      ),
    );
  };

  const filteredLogs = useMemo(() => {
    if (channelFilter === "all") return CONVERSATION_LOG;
    return CONVERSATION_LOG.filter((c) => c.channel === channelFilter);
  }, [channelFilter]);

  const updateSectionBlock = (id: string, patch: Partial<SiteSectionBlock>) => {
    setSiteSections((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const updateAboutData = (
    blockId: string,
    updater: (cur: AboutInstitutionalData) => AboutInstitutionalData,
  ) => {
    setSiteSections((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const current = ensureAboutData(b);
        return { ...b, aboutData: updater(current) };
      }),
    );
  };

  const handleTeamPhotoUpload = async (
    blockId: string,
    memberId: string,
    file: File | null,
  ) => {
    if (!file) return;
    const errKey = `${blockId}-team-${memberId}`;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setBlockUploadError((prev) => ({
        ...prev,
        [errKey]: "Formato no admitido. Sube una fotografía JPG, PNG o WEBP.",
      }));
      return;
    }
    const mb = file.size / (1024 * 1024);
    if (mb > 5) {
      setBlockUploadError((prev) => ({
        ...prev,
        [errKey]: `La fotografía pesa ${mb.toFixed(1)} MB. El máximo permitido es 5 MB.`,
      }));
      return;
    }

    setTeamUploadingId(memberId);
    setBlockUploadError((prev) => {
      const next = { ...prev };
      delete next[errKey];
      return next;
    });

    try {
      const cleanFile = await stripImageExif(file, 800);
      const form = new FormData();
      form.append("file", cleanFile);
      form.append("propertyCode", `team-${memberId}`);
      const res = await fetch("/api/panel/upload", { method: "POST", body: form });
      if (res.ok) {
        const data = await res.json();
        if (data?.url) {
          updateAboutData(blockId, (cur) => ({
            ...cur,
            team: cur.team.map((m) => (m.id === memberId ? { ...m, photo: data.url } : m)),
          }));
          toast("Fotografía del integrante subida y optimizada");
          setTeamUploadingId(null);
          return;
        }
      }
    } catch {
      /* Fallback local comprimido <= 800px WebP/JPEG */
    }

    try {
      const compressedDataUrl = await optimizeImageToDataUrl(file, 800);
      updateAboutData(blockId, (cur) => ({
        ...cur,
        team: cur.team.map((m) => (m.id === memberId ? { ...m, photo: compressedDataUrl } : m)),
      }));
      toast("Fotografía optimizada (máx. 800px) y guardada en este navegador");
    } catch {
      setBlockUploadError((prev) => ({
        ...prev,
        [errKey]: "No se pudo procesar ni optimizar la fotografía seleccionada.",
      }));
    } finally {
      setTeamUploadingId(null);
    }
  };

  const moveSectionBlock = (index: number, dir: -1 | 1) => {
    setSiteSections((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const duplicateSectionBlock = (index: number) => {
    setSiteSections((prev) => {
      const original = prev[index];
      if (!original) return prev;
      const cloned = JSON.parse(JSON.stringify(original)) as SiteSectionBlock;
      const stamp = Date.now().toString(36);
      cloned.id = `${original.type}-${stamp}`;
      cloned.titleEs = `${original.titleEs} (Copia)`;
      cloned.titleEn = `${original.titleEn || original.titleEs} (Copy)`;
      if (cloned.cards) {
        cloned.cards = cloned.cards.map((c, k) => ({ ...c, id: `card-${stamp}-${k}` }));
      }
      if (cloned.steps) {
        cloned.steps = cloned.steps.map((s, k) => ({ ...s, id: `step-${stamp}-${k}` }));
      }
      if (cloned.bullets) {
        cloned.bullets = cloned.bullets.map((b, k) => ({ ...b, id: `bul-${stamp}-${k}` }));
      }
      const next = [...prev];
      next.splice(index + 1, 0, cloned);
      return next;
    });
    toast("Sección duplicada. Puedes editarla y reordenarla libremente.");
  };

  const deleteSectionBlock = (id: string) => {
    setSiteSections((prev) => prev.filter((b) => b.id !== id));
    setConfirmDeleteBlockId(null);
    toast("Sección eliminada de la portada.");
  };

  const addNewSectionBlock = (type: SiteSectionType) => {
    const stamp = Date.now().toString(36);
    let newBlock: SiteSectionBlock;
    if (type === "services_grid") {
      newBlock = {
        id: `sec-grid-${stamp}`,
        type: "services_grid",
        visible: true,
        titleEs: "Nuevos servicios especializados",
        titleEn: "New Specialized Services",
        subtitleEs: "Atención personalizada con respaldo arquitectónico y legal en Cuenca y Miami",
        subtitleEn: "Personalized service backed by architectural and legal expertise in Cuenca and Miami",
        columns: 3,
        cards: [
          {
            id: `srv-${stamp}-1`,
            icon: "verified_user",
            titleEs: "Asesoría Legal y Notarial",
            titleEn: "Legal & Notarial Advisory",
            textEs: "Revisión de escrituras, gravámenes y acompañamiento hasta la firma definitiva.",
            textEn: "Deed review, lien checks, and full support through final closing.",
            linkLabelEs: "Conocer más",
            linkLabelEn: "Learn more",
            actionType: "captacion",
            href: "/vende-o-alquila",
          },
          {
            id: `srv-${stamp}-2`,
            icon: "account_balance",
            titleEs: "Gestión de Crédito Hipotecario",
            titleEn: "Mortgage Financing",
            textEs: "Calificación y estructuración con BIESS, banca privada y cooperativas.",
            textEn: "Pre-qualification and structuring with BIESS, private banks, and credit unions.",
            linkLabelEs: "Conocer más",
            linkLabelEn: "Learn more",
            actionType: "venta",
            href: "/propiedades?op=venta",
          },
          {
            id: `srv-${stamp}-3`,
            icon: "public",
            titleEs: "Inversión desde el Exterior",
            titleEn: "International Investment",
            textEs: "Compra segura desde EE. UU. con representación en Miami y poderes consulares.",
            textEn: "Safe purchasing from the US with Miami representation and consular power of attorney.",
            linkLabelEs: "Conocer más",
            linkLabelEn: "Learn more",
            actionType: "visita",
            href: "#agendar-visita",
          },
        ],
      };
    } else if (type === "steps_timeline") {
      newBlock = {
        id: `sec-steps-${stamp}`,
        type: "steps_timeline",
        visible: true,
        titleEs: "Proceso constructivo e inversión",
        titleEn: "Construction & Investment Process",
        subtitleEs: "Etapas supervisadas por nuestro equipo técnico y financiero",
        subtitleEn: "Stages supervised by our technical and financial team",
        steps: [
          {
            id: `st-${stamp}-1`,
            titleEs: "Diagnóstico y lote",
            titleEn: "Site & Diagnosis",
            textEs: "Evaluamos factibilidad urbana, topografía y presupuesto objetivo.",
            textEn: "We evaluate urban feasibility, topography, and target budget.",
            highlight: false,
          },
          {
            id: `st-${stamp}-2`,
            titleEs: "Diseño arquitectónico",
            titleEn: "Architectural Design",
            textEs: "Planos ejecutivos, renders 3D y aprobación municipal completa.",
            textEn: "Executive plans, 3D renders, and full municipal approval.",
            highlight: true,
          },
          {
            id: `st-${stamp}-3`,
            titleEs: "Ejecución y entrega",
            titleEn: "Build & Handover",
            textEs: "Construcción con reportes de avance y garantía estructural.",
            textEn: "Construction with progress reports and structural warranty.",
            highlight: false,
          },
        ],
      };
    } else if (type === "cta_banner") {
      newBlock = {
        id: `sec-cta-${stamp}`,
        type: "cta_banner",
        visible: true,
        titleEs: "¿Buscas invertir desde Miami o el exterior?",
        titleEn: "Looking to invest from Miami or abroad?",
        subtitleEs: "Agenda una videollamada privada con Ec. Raúl García y nuestro equipo técnico en Cuenca.",
        subtitleEn: "Schedule a private video call with Ec. Raúl García and our technical team in Cuenca.",
        ctaLabelEs: "Contactar a un asesor",
        ctaLabelEn: "Contact an advisor",
        ctaHref: "/vende-o-alquila",
        image: "",
      };
    } else {
      newBlock = {
        id: `sec-edit-${stamp}`,
        type: "editorial_split",
        visible: true,
        kickerEs: "RG Constructora · Cuenca & Miami",
        kickerEn: "RG Construction · Cuenca & Miami",
        titleEs: "Arquitectura contemporánea con valor patrimonial",
        titleEn: "Contemporary architecture with lasting heritage value",
        bodyEs:
          "Desarrollamos proyectos residenciales y comerciales cuidando la nobleza de los materiales, la iluminación natural y la plusvalía de cada ubicación.",
        bodyEn:
          "We develop residential and commercial projects focusing on noble materials, natural lighting, and long-term appreciation.",
        badgeEs: "Garantía técnica y estructural",
        badgeEn: "Technical & structural warranty",
        image: "/img/p/55.jpg",
        ctaLabelEs: "Explorar proyectos",
        ctaLabelEn: "Explore projects",
        ctaHref: "/propiedades?op=venta",
        bullets: [
          {
            id: `bul-${stamp}-1`,
            textEs: "Diseño sismorresistente bajo norma NEC vigente",
            textEn: "Seismic-resistant engineering under current NEC code",
          },
          {
            id: `bul-${stamp}-2`,
            textEs: "Acabados importados y eficiencia térmica",
            textEn: "Imported finishes and thermal efficiency",
          },
        ],
      };
    }

    setSiteSections((prev) => [...prev, newBlock]);
    setShowAddBlockMenu(false);
    toast("Nueva sección agregada al final. Puedes editarla y reordenarla.");
  };

  const handleBlockImageUpload = (blockId: string, file: File | null) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setBlockUploadError((prev) => ({
        ...prev,
        [blockId]: "Formato no admitido. Sube una imagen JPG, PNG o WEBP.",
      }));
      return;
    }
    const mb = file.size / (1024 * 1024);
    if (mb > 5) {
      setBlockUploadError((prev) => ({
        ...prev,
        [blockId]: `El archivo pesa ${mb.toFixed(1)} MB. El máximo permitido para imagen es 5 MB.`,
      }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setBlockUploadError((prev) => {
          const next = { ...prev };
          delete next[blockId];
          return next;
        });
        updateSectionBlock(blockId, { image: reader.result });
        toast("Imagen de la sección actualizada");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleServiceCardIconUpload = (blockId: string, cardId: string, file: File | null) => {
    if (!file) return;
    const errKey = `${blockId}-${cardId}`;
    const allowed = ["image/svg+xml", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setBlockUploadError((prev) => ({
        ...prev,
        [errKey]: "Para icono sube un archivo SVG, PNG o WEBP (máx. 500 KB).",
      }));
      return;
    }
    if (file.size > 500 * 1024) {
      setBlockUploadError((prev) => ({
        ...prev,
        [errKey]: `El archivo supera el máximo de 500 KB para un icono (${Math.round(file.size / 1024)} KB).`,
      }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setBlockUploadError((prev) => {
          const next = { ...prev };
          delete next[errKey];
          return next;
        });
        setSiteSections((prev) =>
          prev.map((b) =>
            b.id === blockId
              ? {
                  ...b,
                  cards: (b.cards ?? []).map((c) =>
                    c.id === cardId ? { ...c, customIcon: reader.result as string } : c,
                  ),
                }
              : b,
          ),
        );
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <PageHeader
        crumbs={["Panel", mainTab === "cms" ? "Contenido web" : "Asistente de IA"]}
        title={mainTab === "cms" ? "Gestión de Contenido Web & Secciones" : "Asistente de IA (Ajustes y Auditoría)"}
        text={
          mainTab === "cms"
            ? "Administración centralizada de vitrina Hero (5 slides en abanico 3D), constructor modular de secciones, contadores, FAQs y popups."
            : "Reglas operativas, mensajes inmutables de privacidad y auditoría de conversaciones del asistente."
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/${sectionsLang}`}
              target="_blank"
              className="h-10 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-label-md font-semibold inline-flex items-center gap-1.5 hover:border-primary"
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              Previsualizar Web ({sectionsLang.toUpperCase()})
            </Link>
            <button
              type="button"
              onClick={async () => {
                const normalized = saveHeroCmsConfig({
                  slides: heroSlides,
                  autoplayEnabled,
                  autoplaySeconds,
                });
                saveSiteSections(siteSections);
                try {
                  localStorage.setItem("rg_counters_cms_v1", JSON.stringify(counters));
                  localStorage.setItem("rg_faqs_cms_v1", JSON.stringify(faqs));
                  localStorage.setItem(
                    POPUP_CMS_STORAGE_KEY,
                    JSON.stringify({
                      enabled: popupEnabled,
                      code: popupCode,
                      kicker: popupKicker,
                      title: popupTitle,
                      text: popupText,
                      image: popupImage,
                      delay: popupDelay,
                    }),
                  );
                  window.dispatchEvent(new Event("rg-panel-updated"));
                } catch {
                  /* ignore */
                }
                await Promise.all([
                  fetch("/api/panel/settings", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      key: "hero_slides",
                      value: {
                        slides: normalized.slides,
                        autoplay_enabled: normalized.autoplayEnabled,
                        autoplay_seconds: normalized.autoplaySeconds,
                      },
                    }),
                  }),
                  fetch("/api/panel/settings", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key: "site_sections", value: siteSections }),
                  }),
                  fetch("/api/panel/settings", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key: "counters", value: counters }),
                  }),
                  fetch("/api/panel/settings", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key: "faqs", value: faqs }),
                  }),
                  fetch("/api/panel/settings", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      key: "popup",
                      value: {
                        enabled: popupEnabled,
                        code: popupCode,
                        kicker: popupKicker,
                        title: popupTitle,
                        text: popupText,
                        image: popupImage,
                        delay: popupDelay,
                      },
                    }),
                  }),
                ]).catch(() => {});
                toast("Cambios de Contenido Web y Secciones publicados y sincronizados");
              }}
              className="h-10 px-4 rounded-xl bg-primary text-on-primary text-label-md font-semibold inline-flex items-center gap-1.5 hover:bg-primary/90 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Publicar Cambios
            </button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setMainTab("cms")}
          className={`px-4 py-2.5 rounded-xl text-label-md font-semibold inline-flex items-center gap-2 cursor-pointer ${
            mainTab === "cms"
              ? "bg-primary text-on-primary"
              : "bg-surface-container-lowest border border-outline-variant text-on-surface hover:border-primary"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">web</span>
          Contenido Web (B1)
        </button>
        <button
          type="button"
          onClick={() => setMainTab("assistant")}
          className={`px-4 py-2.5 rounded-xl text-label-md font-semibold inline-flex items-center gap-2 cursor-pointer ${
            mainTab === "assistant"
              ? "bg-primary text-on-primary"
              : "bg-surface-container-lowest border border-outline-variant text-on-surface hover:border-primary"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">smart_toy</span>
          Asistente de IA (A7 · 84 conv.)
        </button>
      </div>

      {mainTab === "cms" ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "hero" as const, icon: "view_carousel", label: `1. Carrusel Hero 3D · ${heroSlides.filter((s) => s.active).length} de 5` },
              { id: "counters" as const, icon: "analytics", label: "2. Contadores y Métricas" },
              { id: "faq" as const, icon: "help", label: `3. Preguntas Frecuentes (${faqs.length})` },
              { id: "popup" as const, icon: "notifications_active", label: "4. Ventanas Emergentes (Popups)" },
              { id: "sections" as const, icon: "dashboard_customize", label: `5. Constructor de Secciones (Bloques Web · ${siteSections.length})` },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCmsSection(s.id)}
                className={`group px-4 py-2.5 rounded-full text-label-md font-medium cursor-pointer inline-flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${
                  cmsSection === s.id
                    ? "bg-[#141414] text-[#F5F3EE] shadow-sm"
                    : "bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-[#141414]/30"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[18px] transition-colors ${
                    cmsSection === s.id ? "text-[#D9381E]" : "text-secondary group-hover:text-[#141414]"
                  }`}
                >
                  {s.icon}
                </span>
                {s.label}
              </button>
            ))}
          </div>

          {cmsSection === "hero" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3 max-w-2xl">
                  <span className="material-symbols-outlined text-rg-red text-[22px] mt-0.5">view_carousel</span>
                  <div>
                    <p className="text-body-md font-semibold text-on-surface">
                      Vitrina Hero 3D de 5 Slides (ES / EN) · Autoplay Configurable (1 a 10 s)
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      Vincula cada uno de los 5 espacios a una propiedad del catálogo o personaliza los textos bilingües. Si hay menos de 5 activos, la portada completa automáticamente con propiedades destacadas.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0 bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3">
                  <Toggle
                    checked={autoplayEnabled}
                    onChange={setAutoplayEnabled}
                    label="Avance automático"
                  />
                  <div className="flex items-center gap-2.5">
                    <label htmlFor="hero-autoplay-sec" className="text-label-sm text-on-surface-variant whitespace-nowrap">
                      Velocidad (1-10s):
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={autoplaySeconds}
                      disabled={!autoplayEnabled}
                      onChange={(e) => setAutoplaySeconds(clampAutoplaySeconds(Number(e.target.value)))}
                      aria-label="Deslizador de velocidad en segundos"
                      className="w-24 accent-primary disabled:opacity-40 cursor-pointer"
                    />
                    <input
                      id="hero-autoplay-sec"
                      type="number"
                      min={1}
                      max={10}
                      value={autoplaySeconds}
                      disabled={!autoplayEnabled}
                      onChange={(e) => setAutoplaySeconds(clampAutoplaySeconds(Number(e.target.value)))}
                      className={`${pInput} w-16 text-center disabled:opacity-40`}
                    />
                  </div>
                </div>
              </div>

              <Card
                icon="view_carousel"
                title={`Vitrina Hero 3D (${heroSlides.filter((s) => s.active).length} / 5 Slides Activos)`}
                subtitle={`Titular actual: "${HERO.title}"`}
              >
                <div className="space-y-3">
                  {heroSlides.map((slide, idx) => {
                    const isEditing = editingSlide === slide.id;
                    return (
                      <div
                        key={slide.id}
                        className="rounded-xl border border-outline-variant bg-surface p-4 space-y-4"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <span className="w-8 h-8 rounded-lg bg-primary text-on-primary font-display font-bold text-label-md grid place-items-center shrink-0">
                              #{idx + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                {slide.propertyCode && (
                                  <span className="font-mono text-label-sm px-2 py-0.5 rounded bg-surface-container-high">
                                    {slide.propertyCode}
                                  </span>
                                )}
                                <span className="text-label-sm text-on-surface-variant">{slide.zone.es}</span>
                                <span className="text-label-sm font-semibold text-on-surface">{slide.price}</span>
                              </div>
                              <p className="font-display text-title-md text-on-surface truncate mt-0.5">{slide.title.es}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0">
                            <select
                              value={slide.propertyCode ?? ""}
                              onChange={(e) => linkSlideToProperty(idx, e.target.value)}
                              aria-label={`Vincular propiedad al slide ${idx + 1}`}
                              className={`${pInput} w-full sm:w-56`}
                            >
                              <option value="">Personalizado (manual)</option>
                              {properties.map((p) => (
                                <option key={p.code} value={p.code}>
                                  {p.code} · {p.title}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => setEditingSlide(isEditing ? null : slide.id)}
                              className="h-10 px-3 rounded-lg border border-outline-variant text-label-sm font-semibold hover:border-primary cursor-pointer"
                            >
                              {isEditing ? "Cerrar" : "Editar ES/EN"}
                            </button>
                            <button
                              type="button"
                              onClick={() => moveHero(idx, -1)}
                              disabled={idx === 0}
                              aria-label="Subir posición"
                              className="w-10 h-10 rounded-lg border border-outline-variant grid place-items-center disabled:opacity-40 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => moveHero(idx, 1)}
                              disabled={idx === heroSlides.length - 1}
                              aria-label="Bajar posición"
                              className="w-10 h-10 rounded-lg border border-outline-variant grid place-items-center disabled:opacity-40 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                            </button>
                          </div>
                        </div>

                        {isEditing && (
                          <div className="pt-4 border-t border-outline-variant grid grid-cols-1 md:grid-cols-2 gap-3">
                            <PField label="Título (ES)">
                              {(id) => (
                                <input
                                  id={id}
                                  value={slide.title.es}
                                  onChange={(e) =>
                                    setHeroSlides((prev) =>
                                      prev.map((x, i) => (i === idx ? { ...x, title: { ...x.title, es: e.target.value } } : x)),
                                    )
                                  }
                                  className={pInput}
                                />
                              )}
                            </PField>
                            <PField label="Título (EN)">
                              {(id) => (
                                <input
                                  id={id}
                                  value={slide.title.en}
                                  onChange={(e) =>
                                    setHeroSlides((prev) =>
                                      prev.map((x, i) => (i === idx ? { ...x, title: { ...x.title, en: e.target.value } } : x)),
                                    )
                                  }
                                  className={pInput}
                                />
                              )}
                            </PField>
                            <PField label="Zona (ES)">
                              {(id) => (
                                <input
                                  id={id}
                                  value={slide.zone.es}
                                  onChange={(e) =>
                                    setHeroSlides((prev) =>
                                      prev.map((x, i) => (i === idx ? { ...x, zone: { ...x.zone, es: e.target.value } } : x)),
                                    )
                                  }
                                  className={pInput}
                                />
                              )}
                            </PField>
                            <PField label="Zona (EN)">
                              {(id) => (
                                <input
                                  id={id}
                                  value={slide.zone.en}
                                  onChange={(e) =>
                                    setHeroSlides((prev) =>
                                      prev.map((x, i) => (i === idx ? { ...x, zone: { ...x.zone, en: e.target.value } } : x)),
                                    )
                                  }
                                  className={pInput}
                                />
                              )}
                            </PField>
                            <PField label="Precio visible">
                              {(id) => (
                                <input
                                  id={id}
                                  value={slide.price}
                                  onChange={(e) =>
                                    setHeroSlides((prev) =>
                                      prev.map((x, i) => (i === idx ? { ...x, price: e.target.value } : x)),
                                    )
                                  }
                                  className={pInput}
                                />
                              )}
                            </PField>
                            <PField label="Operación">
                              {(id) => (
                                <select
                                  id={id}
                                  value={slide.operation}
                                  onChange={(e) =>
                                    setHeroSlides((prev) =>
                                      prev.map((x, i) => (i === idx ? { ...x, operation: e.target.value as Operation } : x)),
                                    )
                                  }
                                  className={pInput}
                                >
                                  <option value="venta">Venta</option>
                                  <option value="alquiler">Alquiler</option>
                                </select>
                              )}
                            </PField>
                            <PField label="Imagen URL">
                              {(id) => (
                                <input
                                  id={id}
                                  value={slide.image}
                                  onChange={(e) =>
                                    setHeroSlides((prev) =>
                                      prev.map((x, i) => (i === idx ? { ...x, image: e.target.value } : x)),
                                    )
                                  }
                                  className={pInput}
                                />
                              )}
                            </PField>
                            <PField label="Slug destino (/propiedades/[slug])">
                              {(id) => (
                                <input
                                  id={id}
                                  value={slide.slug}
                                  onChange={(e) =>
                                    setHeroSlides((prev) =>
                                      prev.map((x, i) => (i === idx ? { ...x, slug: e.target.value } : x)),
                                    )
                                  }
                                  className={pInput}
                                />
                              )}
                            </PField>
                            <div className="md:col-span-2 flex flex-wrap items-center gap-6 pt-1">
                              <Toggle
                                checked={slide.exclusive}
                                onChange={(val) =>
                                  setHeroSlides((prev) =>
                                    prev.map((x, i) => (i === idx ? { ...x, exclusive: val } : x)),
                                  )
                                }
                                label="Mostrar etiqueta Exclusiva RG"
                              />
                              <Toggle
                                checked={slide.active}
                                onChange={(val) =>
                                  setHeroSlides((prev) =>
                                    prev.map((x, i) => (i === idx ? { ...x, active: val } : x)),
                                  )
                                }
                                label="Slide activo en portada"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {cmsSection === "counters" && (
            <Card
              icon="analytics"
              title="Contadores y Métricas Institucionales"
              subtitle="Cifras visibles en la portada pública"
              aside={
                <button
                  type="button"
                  onClick={() => setCounters((prev) => [...prev, { prefix: "+", value: 0, label: "Nueva métrica" }])}
                  className="h-9 px-3.5 rounded-lg bg-primary text-on-primary text-label-sm font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Agregar contador
                </button>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {counters.map((c, idx) => (
                  <div key={idx} className="rounded-xl border border-outline-variant p-4 space-y-3 bg-surface">
                    <PField label={`Valor #${idx + 1}`}>
                      {(id) => (
                        <input
                          id={id}
                          type="number"
                          value={c.value}
                          onChange={(e) => {
                            const next = [...counters];
                            next[idx] = { ...next[idx], value: Number(e.target.value) || 0 };
                            setCounters(next);
                          }}
                          className={pInput}
                        />
                      )}
                    </PField>
                    <PField label="Etiqueta">
                      {(id) => (
                        <input
                          id={id}
                          value={c.label}
                          onChange={(e) => {
                            const next = [...counters];
                            next[idx] = { ...next[idx], label: e.target.value };
                            setCounters(next);
                          }}
                          className={pInput}
                        />
                      )}
                    </PField>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {cmsSection === "faq" && (
            <Card
              icon="help"
              title="Preguntas Frecuentes en Portada"
              subtitle="Edita las respuestas rápidas mostradas en la página principal"
              aside={
                <button
                  type="button"
                  onClick={() => setFaqs((prev) => [...prev, { q: "Nueva pregunta frecuente", a: "" }])}
                  className="h-9 px-3.5 rounded-lg bg-primary text-on-primary text-label-sm font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Agregar pregunta
                </button>
              }
            >
              <div className="space-y-4">
                {faqs.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-outline-variant p-4 space-y-3 bg-surface">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-label-sm font-semibold text-on-surface-variant">Pregunta #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => setFaqs((prev) => prev.filter((_, i) => i !== idx))}
                        aria-label={`Eliminar pregunta ${idx + 1}`}
                        className="text-label-sm text-on-surface-variant hover:text-rg-red inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        Quitar
                      </button>
                    </div>
                    <PField label="Título de la pregunta">
                      {(id) => (
                        <input
                          id={id}
                          value={item.q}
                          onChange={(e) => {
                            const next = [...faqs];
                            next[idx] = { ...next[idx], q: e.target.value };
                            setFaqs(next);
                          }}
                          className={pInput}
                        />
                      )}
                    </PField>
                    <PField label="Respuesta">
                      {(id) => (
                        <textarea
                          id={id}
                          rows={2}
                          value={item.a}
                          onChange={(e) => {
                            const next = [...faqs];
                            next[idx] = { ...next[idx], a: e.target.value };
                            setFaqs(next);
                          }}
                          className={`${pInput} h-auto py-2`}
                        />
                      )}
                    </PField>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {cmsSection === "popup" && (
            <Card
              icon="notifications_active"
              title="Ventana Emergente Discreta (Popup S9)"
              subtitle="Regla: máximo 1 por visita · Anuncia una propiedad o proyecto (nunca descuentos)"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-4">
                  <Toggle
                    checked={popupEnabled}
                    onChange={setPopupEnabled}
                    label="Activar popup informativo en primera visita"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <PField label="Propiedad o proyecto anunciado">
                      {(id) => (
                        <select
                          id={id}
                          value={popupCode}
                          onChange={(e) => {
                            const code = e.target.value;
                            setPopupCode(code);
                            const found = properties.find((p) => p.code === code);
                            if (found && found.photos[0]?.src) {
                              setPopupImage(found.photos[0].src);
                            }
                          }}
                          className={pInput}
                        >
                          {properties.map((p) => (
                            <option key={p.code} value={p.code}>
                              {p.code} · {p.title}
                            </option>
                          ))}
                        </select>
                      )}
                    </PField>
                    <PField label="Etiqueta superior (Kicker)">
                      {(id) => (
                        <input
                          id={id}
                          value={popupKicker}
                          onChange={(e) => setPopupKicker(e.target.value)}
                          placeholder="Ej. Nueva Exclusiva RG"
                          className={pInput}
                        />
                      )}
                    </PField>
                  </div>

                  <PField label="Subtítulo del popup">
                    {(id) => (
                      <input id={id} value={popupTitle} onChange={(e) => setPopupTitle(e.target.value)} className={pInput} />
                    )}
                  </PField>

                  <PField label="Texto descriptivo breve">
                    {(id) => (
                      <textarea
                        id={id}
                        rows={3}
                        value={popupText}
                        onChange={(e) => setPopupText(e.target.value)}
                        className={`${pInput} h-auto py-2`}
                      />
                    )}
                  </PField>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <PField label="Retraso de aparición (segundos)">
                      {(id) => (
                        <input
                          id={id}
                          type="number"
                          min={5}
                          max={60}
                          value={popupDelay}
                          onChange={(e) => setPopupDelay(Math.max(5, Math.min(60, Number(e.target.value) || 18)))}
                          className={`${pInput} w-36`}
                        />
                      )}
                    </PField>
                    <PField label="URL de imagen (o sube archivo a la derecha)">
                      {(id) => (
                        <input
                          id={id}
                          value={popupImage.startsWith("data:") ? "Archivo local cargado (Base64)" : popupImage}
                          readOnly={popupImage.startsWith("data:")}
                          onChange={(e) => setPopupImage(e.target.value)}
                          placeholder="/img/p/73.jpg"
                          className={pInput}
                        />
                      )}
                    </PField>
                  </div>
                </div>

                {/* Módulo de Carga y Vista Previa de Imagen del Popup */}
                <div className="lg:col-span-5 rounded-2xl border border-[#141414]/15 bg-[#F5F3EE]/60 p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-title-md text-title-md font-bold text-[#141414]">Imagen del Popup</p>
                      <p className="text-label-sm text-secondary">JPG, PNG o WEBP · Máx. 5 MB</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#141414] text-[#F5F3EE] text-[11px] font-semibold uppercase tracking-wider">
                      Vista Previa
                    </span>
                  </div>

                  <input
                    ref={popupFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      handlePopupImageUpload(e.target.files?.[0] ?? null);
                      e.target.value = "";
                    }}
                    aria-label="Subir imagen del popup"
                  />

                  {popupError && (
                    <div role="alert" className="p-3 rounded-xl bg-error-container text-on-error-container text-body-sm flex items-start gap-2">
                      <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                      <span>{popupError}</span>
                    </div>
                  )}

                  <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#141414] border border-[#141414]/15 shadow-md group">
                    <Image
                      src={popupImage || POPUP.image}
                      alt="Vista previa de imagen del Popup"
                      fill
                      sizes="(min-width: 1024px) 400px, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized={(popupImage || "").startsWith("data:") || (popupImage || "").startsWith("blob:")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/95 text-[#141414] text-[11px] font-bold uppercase tracking-wider">
                        {popupKicker || "Exclusiva RG"}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="font-display text-title-md font-bold leading-tight truncate">
                        {properties.find((p) => p.code === popupCode)?.title ?? "Edificio Mirador"}
                      </p>
                      <p className="text-[12px] text-white/80 truncate">{popupTitle}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={popupUploading}
                      onClick={() => popupFileInputRef.current?.click()}
                      className="flex-1 h-11 px-4 rounded-xl bg-[#141414] text-[#F5F3EE] text-label-md font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#D9381E] transition-colors cursor-pointer active:scale-[0.98] disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                      {popupUploading ? "Subiendo…" : "Cambiar imagen"}
                    </button>
                    {popupImage !== POPUP.image && (
                      <button
                        type="button"
                        onClick={() => {
                          setPopupImage(POPUP.image);
                          setPopupError(null);
                          toast("Imagen original del Popup restaurada");
                        }}
                        className="h-11 px-3.5 rounded-xl border border-[#141414]/20 bg-white text-[#141414] text-label-sm font-semibold inline-flex items-center justify-center gap-1.5 hover:border-[#D9381E] hover:text-[#D9381E] transition-colors cursor-pointer active:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        Quitar / Restaurar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {cmsSection === "sections" && (
            <div className="space-y-6">
              {/* Cabecera del Constructor Modular de Secciones */}
              <div className="rounded-2xl border border-[#ECEAE7] bg-surface-container-low p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3 max-w-2xl">
                  <span className="w-10 h-10 rounded-xl bg-[#141414] text-[#F5F3EE] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-[#D9381E]">dashboard_customize</span>
                  </span>
                  <div>
                    <p className="font-title-md text-title-md font-bold text-primary">
                      Constructor Modular de Secciones (Bloques Web · ES / EN)
                    </p>
                    <p className="font-body-sm text-body-sm text-secondary mt-0.5">
                      El núcleo superior (<strong>Hero 3D + Buscador + Catálogo de Propiedades</strong>) está protegido. Administra aquí todas las secciones inferiores: reordena, oculta con el ojito, duplica o agrega nuevos bloques con plantillas RG.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <Segmented
                    label="Idioma de edición de secciones"
                    value={sectionsLang}
                    onChange={setSectionsLang}
                    options={[
                      { v: "es", l: "Español · ES" },
                      { v: "en", l: "English · EN" },
                    ]}
                  />

                  <button
                    type="button"
                    onClick={() => setShowAddBlockMenu((v) => !v)}
                    className="h-10 px-4 rounded-xl bg-[#141414] text-[#F5F3EE] hover:bg-[#D9381E] font-label-md text-label-md font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    + Agregar nueva sección / bloque
                  </button>

                  {confirmResetSections ? (
                    <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-error-container text-on-error-container border border-error/30">
                      <span className="text-[11px] font-semibold px-2">¿Restaurar base?</span>
                      <button
                        type="button"
                        onClick={() => {
                          const fresh = cloneDefaultSiteSections();
                          setSiteSections(fresh);
                          saveSiteSections(fresh);
                          setConfirmResetSections(false);
                          toast("Secciones base de RG restauradas correctamente");
                        }}
                        className="h-8 px-2.5 rounded-lg bg-[#D9381E] text-white text-[11px] font-bold cursor-pointer"
                      >
                        Sí, restaurar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmResetSections(false)}
                        className="h-8 px-2 rounded-lg bg-surface-container-lowest text-primary text-[11px] font-semibold cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmResetSections(true)}
                      className="h-10 px-3.5 rounded-xl border border-[#ECEAE7] bg-surface-container-lowest text-secondary hover:text-primary hover:border-[#141414]/30 font-label-sm text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Restaurar los bloques originales de RG Inmobiliaria"
                    >
                      <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                      Restaurar secciones base
                    </button>
                  )}
                </div>
              </div>

              {/* Selector de las 4 Plantillas Estandarizadas RG */}
              {showAddBlockMenu && (
                <div className="rounded-2xl border-2 border-[#141414] bg-surface-container-lowest p-5 space-y-4 shadow-lg animate-fade-in">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-title-md text-title-md font-bold text-primary">
                        Selecciona una plantilla de sección RG
                      </h3>
                      <p className="font-body-sm text-body-sm text-secondary">
                        Todas las plantillas respetan la paleta Arena (#F5F3EE), Negro Tinta (#141414) y Rojo Terracota (#D9381E), son bilingües (ES/EN) y responsivas en 390px.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddBlockMenu(false)}
                      className="w-9 h-9 rounded-lg hover:bg-surface-container flex items-center justify-center text-secondary hover:text-primary cursor-pointer"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {[
                      {
                        type: "services_grid" as const,
                        icon: "grid_view",
                        title: "1. Grilla de Tarjetas con Icono",
                        desc: "2 a 4 columnas con icono, título, texto y enlace (estilo «¿Cómo podemos ayudarte?»).",
                      },
                      {
                        type: "steps_timeline" as const,
                        icon: "format_list_numbered",
                        title: "2. Pasos / Proceso Numerado",
                        desc: "Línea de tiempo numerada 01..0N con opción de resaltar paso clave en Rojo Terracota.",
                      },
                      {
                        type: "cta_banner" as const,
                        icon: "campaign",
                        title: "3. Banner Destacado / CTA",
                        desc: "Banda de alto contraste con titular, subtítulo, botón de acción e imagen opcional.",
                      },
                      {
                        type: "editorial_split" as const,
                        icon: "view_sidebar",
                        title: "4. Bloque Editorial + Imagen",
                        desc: "2 columnas con fotografía subida desde el panel, viñetas de respaldo y llamado a la acción.",
                      },
                    ].map((tpl) => (
                      <button
                        key={tpl.type}
                        type="button"
                        onClick={() => addNewSectionBlock(tpl.type)}
                        className="group text-left p-4 rounded-xl border border-[#ECEAE7] bg-surface-container-low/60 hover:bg-[#141414] hover:text-[#F5F3EE] hover:border-[#141414] transition-all duration-200 flex flex-col justify-between gap-3 cursor-pointer active:scale-[0.98]"
                      >
                        <div className="space-y-2">
                          <span className="w-10 h-10 rounded-lg bg-white text-[#141414] border border-[#ECEAE7] flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-[20px] group-hover:text-[#D9381E]">
                              {tpl.icon}
                            </span>
                          </span>
                          <p className="font-title-md text-[14px] font-bold">{tpl.title}</p>
                          <p className="font-body-sm text-[12px] opacity-80 leading-relaxed">{tpl.desc}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 font-label-sm text-[11px] font-bold uppercase tracking-wider text-[#D9381E] group-hover:text-[#F5F3EE]">
                          Insertar bloque
                          <span className="material-symbols-outlined text-[14px]">add</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lista de Bloques Modulares de la Portada */}
              <div className="space-y-4">
                {siteSections.map((sec, sIdx) => {
                  const isVisible = sec.visible !== false;
                  const isCollapsed = Boolean(collapsedBlocks[sec.id]);
                  const blockTitle =
                    sectionsLang === "en" ? sec.titleEn || sec.titleEs : sec.titleEs;
                  const typeLabel =
                    sec.type === "services_grid"
                      ? "Grilla de Tarjetas con Icono"
                      : sec.type === "steps_timeline"
                        ? "Línea de Tiempo / Pasos"
                        : sec.type === "cta_banner"
                          ? "Banner Destacado / CTA"
                          : "Bloque Editorial + Imagen";

                  return (
                    <section
                      key={sec.id}
                      aria-label={`Bloque ${sIdx + 1}: ${blockTitle}`}
                      className={`rounded-2xl bg-surface-container-lowest border border-[#ECEAE7] hover:border-[#141414]/25 shadow-sm transition-all duration-200 p-4 sm:p-5 space-y-4 ${
                        !isVisible ? "opacity-75 border-dashed" : ""
                      }`}
                    >
                      {/* Cabecera de Herramientas del Bloque */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#141414]/10">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="px-2.5 py-1 rounded-lg bg-[#141414] text-[#F5F3EE] font-mono text-[12px] font-bold shrink-0">
                            Bloque #{sIdx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-title-md text-[15px] font-bold text-primary truncate">
                                {blockTitle || "Sección sin título"}
                              </h3>
                              <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-label-sm text-[11px] font-semibold text-secondary">
                                {typeLabel}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                          {/* Subir / Bajar Bloque */}
                          <button
                            type="button"
                            disabled={sIdx === 0}
                            onClick={() => moveSectionBlock(sIdx, -1)}
                            aria-label={`Subir bloque ${blockTitle}`}
                            title="Subir posición en la portada"
                            className="w-8 h-8 rounded-lg bg-surface-container-low border border-[#ECEAE7] hover:border-primary flex items-center justify-center text-primary disabled:opacity-35 cursor-pointer active:scale-[0.98]"
                          >
                            <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                          </button>
                          <button
                            type="button"
                            disabled={sIdx === siteSections.length - 1}
                            onClick={() => moveSectionBlock(sIdx, 1)}
                            aria-label={`Bajar bloque ${blockTitle}`}
                            title="Bajar posición en la portada"
                            className="w-8 h-8 rounded-lg bg-surface-container-low border border-[#ECEAE7] hover:border-primary flex items-center justify-center text-primary disabled:opacity-35 cursor-pointer active:scale-[0.98]"
                          >
                            <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                          </button>

                          {/* Ojito Visible / Oculto */}
                          <button
                            type="button"
                            aria-pressed={isVisible}
                            onClick={() => updateSectionBlock(sec.id, { visible: !isVisible })}
                            title={isVisible ? "Ocultar sección en la portada pública" : "Mostrar sección en la portada pública"}
                            className={`h-8 px-3 rounded-lg font-label-sm text-[11px] font-semibold inline-flex items-center gap-1 border transition-colors cursor-pointer active:scale-[0.98] ${
                              isVisible
                                ? "bg-[#141414] text-[#F5F3EE] border-[#141414]"
                                : "bg-surface-container-low text-secondary border-[#ECEAE7] hover:border-primary"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              {isVisible ? "visibility" : "visibility_off"}
                            </span>
                            <span>{isVisible ? "Visible" : "Oculto"}</span>
                          </button>

                          {/* Duplicar Bloque */}
                          <button
                            type="button"
                            onClick={() => duplicateSectionBlock(sIdx)}
                            title="Duplicar sección"
                            className="h-8 px-2.5 rounded-lg bg-surface-container-low border border-[#ECEAE7] hover:border-primary text-secondary hover:text-primary font-label-sm text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer active:scale-[0.98]"
                          >
                            <span className="material-symbols-outlined text-[15px]">content_copy</span>
                            <span className="hidden sm:inline">Duplicar</span>
                          </button>

                          {/* Colapsar / Expandir */}
                          <button
                            type="button"
                            onClick={() =>
                              setCollapsedBlocks((prev) => ({ ...prev, [sec.id]: !prev[sec.id] }))
                            }
                            aria-expanded={!isCollapsed}
                            title={isCollapsed ? "Expandir bloque" : "Colapsar bloque"}
                            className="w-8 h-8 rounded-lg bg-surface-container-low border border-[#ECEAE7] hover:border-primary flex items-center justify-center text-secondary hover:text-primary cursor-pointer active:scale-[0.98]"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {isCollapsed ? "expand_more" : "expand_less"}
                            </span>
                          </button>

                          {/* Eliminar con Confirmación */}
                          {confirmDeleteBlockId === sec.id ? (
                            <div className="inline-flex items-center gap-1 bg-error-container text-on-error-container px-2 py-0.5 rounded-lg border border-error/30">
                              <span className="text-[11px] font-semibold">¿Borrar?</span>
                              <button
                                type="button"
                                onClick={() => deleteSectionBlock(sec.id)}
                                className="h-6 px-2 rounded bg-[#D9381E] text-white text-[10px] font-bold cursor-pointer"
                              >
                                Sí
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteBlockId(null)}
                                className="h-6 px-2 rounded bg-surface-container-lowest text-primary text-[10px] font-semibold cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              aria-label={`Eliminar bloque ${blockTitle}`}
                              onClick={() => setConfirmDeleteBlockId(sec.id)}
                              title="Eliminar sección"
                              className="w-8 h-8 rounded-lg bg-surface-container-low border border-[#ECEAE7] hover:border-error/40 flex items-center justify-center text-secondary hover:text-error cursor-pointer active:scale-[0.98]"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {!isCollapsed && (
                        <div className="space-y-4">
                          {/* Campos comunes de Título y Subtítulo del Bloque (ES / EN) */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                            <div className="md:col-span-5">
                              <label className="block font-label-sm text-[11px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                Título de la sección ({sectionsLang.toUpperCase()})
                              </label>
                              <input
                                className="h-9 text-sm px-3 rounded-lg bg-surface-container-low border border-[#ECEAE7] focus:border-[#141414] focus:outline-none text-primary font-semibold w-full"
                                value={sectionsLang === "es" ? sec.titleEs : sec.titleEn}
                                placeholder={
                                  sectionsLang === "es"
                                    ? "Ej. ¿Cómo podemos ayudarte?"
                                    : "E.g. How can we help you?"
                                }
                                onChange={(e) =>
                                  updateSectionBlock(
                                    sec.id,
                                    sectionsLang === "es"
                                      ? { titleEs: e.target.value }
                                      : { titleEn: e.target.value },
                                  )
                                }
                              />
                            </div>
                            <div className={sec.type === "services_grid" ? "md:col-span-5" : "md:col-span-7"}>
                              <label className="block font-label-sm text-[11px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                Subtítulo opcional ({sectionsLang.toUpperCase()})
                              </label>
                              <input
                                className="h-9 text-sm px-3 rounded-lg bg-surface-container-low border border-[#ECEAE7] focus:border-[#141414] focus:outline-none text-secondary w-full"
                                value={
                                  sectionsLang === "es"
                                    ? (sec.subtitleEs ?? "")
                                    : (sec.subtitleEn ?? "")
                                }
                                placeholder={
                                  sectionsLang === "es"
                                    ? "Descripción breve debajo del título"
                                    : "Short subtitle below the heading"
                                }
                                onChange={(e) =>
                                  updateSectionBlock(
                                    sec.id,
                                    sectionsLang === "es"
                                      ? { subtitleEs: e.target.value }
                                      : { subtitleEn: e.target.value },
                                  )
                                }
                              />
                            </div>
                            {sec.type === "services_grid" && (
                              <div className="md:col-span-2">
                                <label className="block font-label-sm text-[11px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                  Columnas (Desktop)
                                </label>
                                <select
                                  value={sec.columns ?? 4}
                                  onChange={(e) =>
                                    updateSectionBlock(sec.id, {
                                      columns: Number(e.target.value) as 2 | 3 | 4,
                                    })
                                  }
                                  className="h-9 text-sm px-2.5 rounded-lg bg-surface-container-low border border-[#ECEAE7] text-primary font-semibold w-full"
                                >
                                  <option value={2}>2 columnas</option>
                                  <option value={3}>3 columnas</option>
                                  <option value={4}>4 columnas</option>
                                </select>
                              </div>
                            )}
                          </div>

                          {/* TIPO 1: Grilla de Tarjetas de Servicios (¿Cómo podemos ayudarte?) */}
                          {sec.type === "services_grid" && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                                {(sec.cards ?? []).map((card, cIdx) => {
                                  const errKey = `${sec.id}-${card.id}`;
                                  const cardErr = blockUploadError[errKey];
                                  return (
                                    <div
                                      key={card.id}
                                      className="p-3.5 rounded-xl bg-surface-container-low/70 border border-[#ECEAE7] hover:border-[#141414]/25 transition-all space-y-3"
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#141414]/10">
                                        <div className="flex items-center gap-2">
                                          <span className="w-9 h-9 rounded-lg bg-white text-[#141414] border border-[#ECEAE7] shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                                            {card.customIcon ? (
                                              // eslint-disable-next-line @next/next/no-img-element
                                              <img
                                                src={card.customIcon}
                                                alt=""
                                                className="w-5 h-5 object-contain"
                                              />
                                            ) : (
                                              <span className="material-symbols-outlined text-[20px]">
                                                {card.icon || "home"}
                                              </span>
                                            )}
                                          </span>
                                          <span className="font-label-sm text-[12px] font-bold text-primary">
                                            Tarjeta #{cIdx + 1}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <select
                                            aria-label={`Icono de tarjeta ${cIdx + 1}`}
                                            value={card.icon || "home"}
                                            onChange={(e) => {
                                              const nextCards = (sec.cards ?? []).map((c, i) =>
                                                i === cIdx
                                                  ? { ...c, icon: e.target.value, customIcon: undefined }
                                                  : c,
                                              );
                                              updateSectionBlock(sec.id, { cards: nextCards });
                                            }}
                                            className="h-8 px-2 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-[11px] font-medium text-primary"
                                          >
                                            {SECTION_ICON_LIBRARY.map((ic) => (
                                              <option key={ic.id} value={ic.id}>
                                                {ic.label}
                                              </option>
                                            ))}
                                          </select>

                                          <input
                                            ref={(el) => {
                                              blockFileRefs.current[errKey] = el;
                                            }}
                                            type="file"
                                            accept="image/svg+xml,image/png,image/webp"
                                            className="sr-only"
                                            onChange={(e) => {
                                              handleServiceCardIconUpload(
                                                sec.id,
                                                card.id,
                                                e.target.files?.[0] ?? null,
                                              );
                                              e.target.value = "";
                                            }}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => blockFileRefs.current[errKey]?.click()}
                                            className="h-8 px-2.5 rounded-lg bg-[#141414] text-[#F5F3EE] hover:bg-[#D9381E] text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                                            title="Subir icono personalizado (SVG/PNG ≤ 500 KB)"
                                          >
                                            <span className="material-symbols-outlined text-[14px]">
                                              upload
                                            </span>
                                            SVG/PNG
                                          </button>

                                          <button
                                            type="button"
                                            disabled={cIdx === 0}
                                            onClick={() => {
                                              const next = [...(sec.cards ?? [])];
                                              [next[cIdx - 1], next[cIdx]] = [next[cIdx], next[cIdx - 1]];
                                              updateSectionBlock(sec.id, { cards: next });
                                            }}
                                            className="w-7 h-7 rounded-md bg-surface-container-lowest border border-[#ECEAE7] flex items-center justify-center disabled:opacity-35 cursor-pointer"
                                            title="Mover tarjeta antes"
                                          >
                                            <span className="material-symbols-outlined text-[14px]">
                                              arrow_back
                                            </span>
                                          </button>
                                          <button
                                            type="button"
                                            disabled={cIdx === (sec.cards?.length ?? 1) - 1}
                                            onClick={() => {
                                              const next = [...(sec.cards ?? [])];
                                              [next[cIdx + 1], next[cIdx]] = [next[cIdx], next[cIdx + 1]];
                                              updateSectionBlock(sec.id, { cards: next });
                                            }}
                                            className="w-7 h-7 rounded-md bg-surface-container-lowest border border-[#ECEAE7] flex items-center justify-center disabled:opacity-35 cursor-pointer"
                                            title="Mover tarjeta después"
                                          >
                                            <span className="material-symbols-outlined text-[14px]">
                                              arrow_forward
                                            </span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const next = (sec.cards ?? []).filter((_, i) => i !== cIdx);
                                              updateSectionBlock(sec.id, { cards: next });
                                            }}
                                            className="w-7 h-7 rounded-md bg-surface-container-lowest border border-[#ECEAE7] text-secondary hover:text-error flex items-center justify-center cursor-pointer"
                                            title="Eliminar tarjeta"
                                          >
                                            <span className="material-symbols-outlined text-[15px]">
                                              close
                                            </span>
                                          </button>
                                        </div>
                                      </div>

                                      {cardErr && (
                                        <div
                                          role="alert"
                                          className="p-2.5 rounded-lg bg-error-container text-on-error-container flex items-center justify-between gap-2 text-[11px]"
                                        >
                                          <span>{cardErr}</span>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setBlockUploadError((prev) => {
                                                const copy = { ...prev };
                                                delete copy[errKey];
                                                return copy;
                                              })
                                            }
                                            className="w-6 h-6 rounded hover:bg-black/10 flex items-center justify-center cursor-pointer"
                                          >
                                            <span className="material-symbols-outlined text-[14px]">
                                              close
                                            </span>
                                          </button>
                                        </div>
                                      )}

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div>
                                          <label className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                            Título ({sectionsLang.toUpperCase()})
                                          </label>
                                          <input
                                            className="h-9 text-sm px-2.5 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-primary font-medium w-full"
                                            value={sectionsLang === "es" ? card.titleEs : card.titleEn}
                                            onChange={(e) => {
                                              const next = (sec.cards ?? []).map((c, i) =>
                                                i === cIdx
                                                  ? sectionsLang === "es"
                                                    ? { ...c, titleEs: e.target.value }
                                                    : { ...c, titleEn: e.target.value }
                                                  : c,
                                              );
                                              updateSectionBlock(sec.id, { cards: next });
                                            }}
                                          />
                                        </div>
                                        <div>
                                          <label className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                            Texto del enlace ({sectionsLang.toUpperCase()})
                                          </label>
                                          <input
                                            className="h-9 text-sm px-2.5 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-primary w-full"
                                            value={
                                              sectionsLang === "es"
                                                ? card.linkLabelEs
                                                : card.linkLabelEn
                                            }
                                            placeholder={
                                              sectionsLang === "es" ? "Conocer más" : "Learn more"
                                            }
                                            onChange={(e) => {
                                              const next = (sec.cards ?? []).map((c, i) =>
                                                i === cIdx
                                                  ? sectionsLang === "es"
                                                    ? { ...c, linkLabelEs: e.target.value }
                                                    : { ...c, linkLabelEn: e.target.value }
                                                  : c,
                                              );
                                              updateSectionBlock(sec.id, { cards: next });
                                            }}
                                          />
                                        </div>
                                      </div>

                                      <div>
                                        <label className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                          Descripción ({sectionsLang.toUpperCase()})
                                        </label>
                                        <textarea
                                          rows={2}
                                          className="text-sm p-2.5 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-secondary w-full"
                                          value={sectionsLang === "es" ? card.textEs : card.textEn}
                                          onChange={(e) => {
                                            const next = (sec.cards ?? []).map((c, i) =>
                                              i === cIdx
                                                ? sectionsLang === "es"
                                                  ? { ...c, textEs: e.target.value }
                                                  : { ...c, textEn: e.target.value }
                                                : c,
                                            );
                                            updateSectionBlock(sec.id, { cards: next });
                                          }}
                                        />
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div>
                                          <label className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                            Acción / Destino del enlace
                                          </label>
                                          <select
                                            value={card.actionType}
                                            onChange={(e) => {
                                              const act = e.target
                                                .value as ServiceCardItem["actionType"];
                                              const preset = SERVICE_ACTION_PRESETS.find(
                                                (p) => p.id === act,
                                              );
                                              const next = (sec.cards ?? []).map((c, i) =>
                                                i === cIdx
                                                  ? {
                                                      ...c,
                                                      actionType: act,
                                                      href: preset ? preset.defaultHref : c.href,
                                                    }
                                                  : c,
                                              );
                                              updateSectionBlock(sec.id, { cards: next });
                                            }}
                                            className="h-9 text-xs px-2.5 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-primary w-full"
                                          >
                                            {SERVICE_ACTION_PRESETS.map((p) => (
                                              <option key={p.id} value={p.id}>
                                                {p.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                            Ruta / URL destino
                                          </label>
                                          <input
                                            className="h-9 text-sm px-2.5 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] font-mono text-primary w-full"
                                            value={card.href}
                                            onChange={(e) => {
                                              const next = (sec.cards ?? []).map((c, i) =>
                                                i === cIdx ? { ...c, href: e.target.value } : c,
                                              );
                                              updateSectionBlock(sec.id, { cards: next });
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const next: ServiceCardItem[] = [
                                    ...(sec.cards ?? []),
                                    {
                                      id: `srv-${Date.now().toString(36)}`,
                                      icon: "home",
                                      titleEs: "Nuevo servicio",
                                      titleEn: "New service",
                                      textEs: "Descripción breve del servicio inmobiliario o constructivo.",
                                      textEn: "Short description of the real estate or construction service.",
                                      linkLabelEs: "Conocer más",
                                      linkLabelEn: "Learn more",
                                      actionType: "venta",
                                      href: "/propiedades?op=venta",
                                    },
                                  ];
                                  updateSectionBlock(sec.id, { cards: next });
                                }}
                                className="h-9 px-3.5 rounded-lg bg-surface-container-low hover:bg-surface-container border border-[#ECEAE7] font-label-sm text-[12px] font-semibold text-primary inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">add</span>+
                                Agregar tarjeta a la grilla
                              </button>
                            </div>
                          )}

                          {/* TIPO 2: Línea de Tiempo / Pasos Numerados (Tu próximo hogar, paso a paso) */}
                          {sec.type === "steps_timeline" && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {(sec.steps ?? []).map((st, stIdx) => {
                                  return (
                                    <div
                                      key={st.id || `st-${stIdx}`}
                                      className="p-3.5 rounded-xl border transition-all space-y-2.5 bg-surface-container-low/70 border-[#ECEAE7]"
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#141414]/10">
                                        <div className="flex items-center gap-2">
                                          <span className="w-8 h-8 rounded-full font-mono text-[12px] font-bold flex items-center justify-center bg-[#141414] text-[#F5F3EE]">
                                            {String(stIdx + 1).padStart(2, "0")}
                                          </span>
                                          <span className="font-label-sm text-[12px] font-bold text-primary">
                                            Paso {stIdx + 1}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1.5">

                                          <button
                                            type="button"
                                            disabled={stIdx === 0}
                                            onClick={() => {
                                              const next = [...(sec.steps ?? [])];
                                              [next[stIdx - 1], next[stIdx]] = [
                                                next[stIdx],
                                                next[stIdx - 1],
                                              ];
                                              updateSectionBlock(sec.id, { steps: next });
                                            }}
                                            className="w-7 h-7 rounded-md bg-surface-container-lowest border border-[#ECEAE7] flex items-center justify-center disabled:opacity-35 cursor-pointer"
                                            title="Mover paso antes"
                                          >
                                            <span className="material-symbols-outlined text-[14px]">
                                              arrow_upward
                                            </span>
                                          </button>
                                          <button
                                            type="button"
                                            disabled={stIdx === (sec.steps?.length ?? 1) - 1}
                                            onClick={() => {
                                              const next = [...(sec.steps ?? [])];
                                              [next[stIdx + 1], next[stIdx]] = [
                                                next[stIdx],
                                                next[stIdx + 1],
                                              ];
                                              updateSectionBlock(sec.id, { steps: next });
                                            }}
                                            className="w-7 h-7 rounded-md bg-surface-container-lowest border border-[#ECEAE7] flex items-center justify-center disabled:opacity-35 cursor-pointer"
                                            title="Mover paso después"
                                          >
                                            <span className="material-symbols-outlined text-[14px]">
                                              arrow_downward
                                            </span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const next = (sec.steps ?? []).filter(
                                                (_, i) => i !== stIdx,
                                              );
                                              updateSectionBlock(sec.id, { steps: next });
                                            }}
                                            className="w-7 h-7 rounded-md bg-surface-container-lowest border border-[#ECEAE7] text-secondary hover:text-error flex items-center justify-center cursor-pointer"
                                            title="Eliminar paso"
                                          >
                                            <span className="material-symbols-outlined text-[15px]">
                                              close
                                            </span>
                                          </button>
                                        </div>
                                      </div>

                                      <div>
                                        <label className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                          Título del paso ({sectionsLang.toUpperCase()})
                                        </label>
                                        <input
                                          className="h-9 text-sm px-2.5 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-primary font-medium w-full"
                                          value={sectionsLang === "es" ? st.titleEs : st.titleEn}
                                          onChange={(e) => {
                                            const next = (sec.steps ?? []).map((x, i) =>
                                              i === stIdx
                                                ? sectionsLang === "es"
                                                  ? { ...x, titleEs: e.target.value }
                                                  : { ...x, titleEn: e.target.value }
                                                : x,
                                            );
                                            updateSectionBlock(sec.id, { steps: next });
                                          }}
                                        />
                                      </div>

                                      <div>
                                        <label className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                          Descripción ({sectionsLang.toUpperCase()})
                                        </label>
                                        <textarea
                                          rows={2}
                                          className="text-sm p-2.5 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-secondary w-full"
                                          value={sectionsLang === "es" ? st.textEs : st.textEn}
                                          onChange={(e) => {
                                            const next = (sec.steps ?? []).map((x, i) =>
                                              i === stIdx
                                                ? sectionsLang === "es"
                                                  ? { ...x, textEs: e.target.value }
                                                  : { ...x, textEn: e.target.value }
                                                : x,
                                            );
                                            updateSectionBlock(sec.id, { steps: next });
                                          }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const next = [
                                    ...(sec.steps ?? []),
                                    {
                                      id: `step-${Date.now().toString(36)}`,
                                      titleEs: "Nuevo paso del proceso",
                                      titleEn: "New process step",
                                      textEs: "Detalle breve del acompañamiento en esta etapa.",
                                      textEn: "Short description of our guidance in this stage.",
                                      highlight: false,
                                    },
                                  ];
                                  updateSectionBlock(sec.id, { steps: next });
                                }}
                                className="h-9 px-3.5 rounded-lg bg-surface-container-low hover:bg-surface-container border border-[#ECEAE7] font-label-sm text-[12px] font-semibold text-primary inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">add</span>+
                                Agregar paso numerado
                              </button>
                            </div>
                          )}

                          {/* TIPO 3B · BLOQUE 3 ESPECIAL: Quiénes Somos (Identidad + Misión/Visión + Párrafos + Equipo en Arcos) */}
                          {sec.type === "editorial_split" &&
                            (sec.id === "sec-editorial-about" || Boolean(sec.aboutData)) && (() => {
                              const aboutData = ensureAboutData(sec);
                              return (
                                <div className="space-y-6 pt-2 border-t border-[#141414]/10">
                                  {/* Barra de respaldo y enlace directo a /[lang]/quienes-somos */}
                                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F5F3EE] border border-[#ECEAE7]">
                                    <div className="flex items-center gap-2.5">
                                      <span className="w-8 h-8 rounded-lg bg-[#141414] text-[#F5F3EE] flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[18px] text-[#D9381E]">
                                          groups
                                        </span>
                                      </span>
                                      <div>
                                        <p className="font-label-md text-[12px] font-bold text-[#141414]">
                                          Fuente única de verdad: Portada & /{sectionsLang}/quienes-somos
                                        </p>
                                        <p className="text-[11px] text-secondary">
                                          Edita aquí la identidad institucional, Misión/Visión, párrafos a medida y los 6+ arcos del equipo.
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Link
                                        href={`/${sectionsLang}/quienes-somos`}
                                        target="_blank"
                                        className="h-9 px-3 rounded-lg bg-white border border-[#ECEAE7] hover:border-[#141414] text-[#141414] text-[11px] font-semibold inline-flex items-center gap-1"
                                      >
                                        <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                                        Ver /{sectionsLang}/quienes-somos
                                      </Link>
                                      {confirmResetAbout ? (
                                        <div className="inline-flex items-center gap-1 bg-error-container text-on-error-container px-2 py-1 rounded-lg border border-error/30">
                                          <span className="text-[11px] font-semibold">¿Restaurar Quiénes Somos?</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const defSec = getDefaultAboutSection();
                                              updateSectionBlock(sec.id, {
                                                kickerEs: defSec.kickerEs,
                                                kickerEn: defSec.kickerEn,
                                                titleEs: defSec.titleEs,
                                                titleEn: defSec.titleEn,
                                                bodyEs: defSec.bodyEs,
                                                bodyEn: defSec.bodyEn,
                                                ctaLabelEs: defSec.ctaLabelEs,
                                                ctaLabelEn: defSec.ctaLabelEn,
                                                ctaHref: defSec.ctaHref,
                                                bullets: defSec.bullets,
                                                aboutData: cloneDefaultAboutInstitutional(),
                                              });
                                              setConfirmResetAbout(false);
                                              toast("Datos base de Quiénes Somos restaurados");
                                            }}
                                            className="h-7 px-2 rounded bg-[#D9381E] text-white text-[10px] font-bold cursor-pointer"
                                          >
                                            Sí, restaurar
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setConfirmResetAbout(false)}
                                            className="h-7 px-2 rounded bg-white text-primary text-[10px] font-semibold cursor-pointer"
                                          >
                                            No
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => setConfirmResetAbout(true)}
                                          className="h-9 px-3 rounded-lg bg-white border border-[#ECEAE7] text-secondary hover:text-[#D9381E] text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                                        >
                                          <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                                          Restaurar datos base de Quiénes Somos
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* 1. Identidad General de RG Inmobiliaria Constructora */}
                                  <div className="p-4 rounded-xl bg-surface-container-low/60 border border-[#ECEAE7] space-y-3">
                                    <p className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-primary">
                                      1. Identidad General de RG Inmobiliaria Constructora ({sectionsLang.toUpperCase()})
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                          Etiqueta superior / Eyebrow ({sectionsLang.toUpperCase()})
                                        </label>
                                        <input
                                          className="h-9 text-sm px-2.5 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-primary w-full"
                                          value={sectionsLang === "es" ? (sec.kickerEs ?? "") : (sec.kickerEn ?? "")}
                                          onChange={(e) =>
                                            updateSectionBlock(
                                              sec.id,
                                              sectionsLang === "es"
                                                ? { kickerEs: e.target.value }
                                                : { kickerEn: e.target.value },
                                            )
                                          }
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                            Botón CTA ({sectionsLang.toUpperCase()})
                                          </label>
                                          <input
                                            className="h-9 text-sm px-2.5 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-primary w-full"
                                            value={sectionsLang === "es" ? (sec.ctaLabelEs ?? "") : (sec.ctaLabelEn ?? "")}
                                            onChange={(e) =>
                                              updateSectionBlock(
                                                sec.id,
                                                sectionsLang === "es"
                                                  ? { ctaLabelEs: e.target.value }
                                                  : { ctaLabelEn: e.target.value },
                                              )
                                            }
                                          />
                                        </div>
                                        <div>
                                          <label className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                            Ruta CTA
                                          </label>
                                          <input
                                            className="h-9 text-sm px-2.5 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] font-mono text-primary w-full"
                                            value={sec.ctaHref ?? "/vende-o-alquila"}
                                            onChange={(e) => updateSectionBlock(sec.id, { ctaHref: e.target.value })}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                        ¿Qué es RG Inmobiliaria Constructora? — Texto general ({sectionsLang.toUpperCase()})
                                      </label>
                                      <textarea
                                        rows={3}
                                        className="text-sm p-2.5 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-secondary w-full"
                                        value={sectionsLang === "es" ? (sec.bodyEs ?? "") : (sec.bodyEn ?? "")}
                                        onChange={(e) =>
                                          updateSectionBlock(
                                            sec.id,
                                            sectionsLang === "es"
                                              ? { bodyEs: e.target.value }
                                              : { bodyEn: e.target.value },
                                          )
                                        }
                                      />
                                    </div>
                                  </div>

                                  {/* 2. Misión, Visión y Párrafos Institucionales Personalizados */}
                                  <div className="p-4 rounded-xl bg-surface-container-low/60 border border-[#ECEAE7] space-y-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <p className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-primary">
                                        2. Misión, Visión y Párrafos / Pilares Personalizados ({sectionsLang.toUpperCase()})
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newP: AboutParagraphItem = {
                                            id: `para-${Date.now().toString(36)}`,
                                            titleEs: "Valores Corporativos / Garantía Constructiva",
                                            titleEn: "Corporate Values / Construction Warranty",
                                            bodyEs: "Describe aquí un pilar diferencial de RG Inmobiliaria y Constructora.",
                                            bodyEn: "Describe a key pillar of RG Inmobiliaria & Constructora here.",
                                            visible: true,
                                          };
                                          updateAboutData(sec.id, (cur) => ({
                                            ...cur,
                                            extraParagraphs: [...cur.extraParagraphs, newP],
                                          }));
                                        }}
                                        className="h-8 px-3 rounded-lg bg-[#141414] text-[#F5F3EE] hover:bg-[#D9381E] text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                                      >
                                        <span className="material-symbols-outlined text-[15px]">add</span>
                                        + Agregar nuevo párrafo / apartado
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                      {/* Tarjeta Misión */}
                                      <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-[#ECEAE7] space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="font-label-sm text-[12px] font-bold text-[#141414] inline-flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px]">flag</span>
                                            Misión ({sectionsLang.toUpperCase()})
                                          </span>
                                          <button
                                            type="button"
                                            aria-pressed={aboutData.missionVisible}
                                            onClick={() =>
                                              updateAboutData(sec.id, (cur) => ({
                                                ...cur,
                                                missionVisible: !cur.missionVisible,
                                              }))
                                            }
                                            className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 border cursor-pointer ${
                                              aboutData.missionVisible
                                                ? "bg-[#141414] text-[#F5F3EE] border-[#141414]"
                                                : "bg-surface-container-low text-secondary border-[#ECEAE7]"
                                            }`}
                                          >
                                            <span className="material-symbols-outlined text-[14px]">
                                              {aboutData.missionVisible ? "visibility" : "visibility_off"}
                                            </span>
                                            {aboutData.missionVisible ? "Visible" : "Oculto"}
                                          </button>
                                        </div>
                                        <textarea
                                          rows={3}
                                          className="text-sm p-2.5 rounded-lg bg-surface-container-low border border-[#ECEAE7] text-secondary w-full"
                                          value={sectionsLang === "es" ? aboutData.missionEs : aboutData.missionEn}
                                          onChange={(e) =>
                                            updateAboutData(sec.id, (cur) =>
                                              sectionsLang === "es"
                                                ? { ...cur, missionEs: e.target.value }
                                                : { ...cur, missionEn: e.target.value },
                                            )
                                          }
                                        />
                                      </div>

                                      {/* Tarjeta Visión */}
                                      <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-[#ECEAE7] space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="font-label-sm text-[12px] font-bold text-[#141414] inline-flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px] text-[#D9381E]">visibility</span>
                                            Visión ({sectionsLang.toUpperCase()})
                                          </span>
                                          <button
                                            type="button"
                                            aria-pressed={aboutData.visionVisible}
                                            onClick={() =>
                                              updateAboutData(sec.id, (cur) => ({
                                                ...cur,
                                                visionVisible: !cur.visionVisible,
                                              }))
                                            }
                                            className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 border cursor-pointer ${
                                              aboutData.visionVisible
                                                ? "bg-[#141414] text-[#F5F3EE] border-[#141414]"
                                                : "bg-surface-container-low text-secondary border-[#ECEAE7]"
                                            }`}
                                          >
                                            <span className="material-symbols-outlined text-[14px]">
                                              {aboutData.visionVisible ? "visibility" : "visibility_off"}
                                            </span>
                                            {aboutData.visionVisible ? "Visible" : "Oculto"}
                                          </button>
                                        </div>
                                        <textarea
                                          rows={3}
                                          className="text-sm p-2.5 rounded-lg bg-surface-container-low border border-[#ECEAE7] text-secondary w-full"
                                          value={sectionsLang === "es" ? aboutData.visionEs : aboutData.visionEn}
                                          onChange={(e) =>
                                            updateAboutData(sec.id, (cur) =>
                                              sectionsLang === "es"
                                                ? { ...cur, visionEs: e.target.value }
                                                : { ...cur, visionEn: e.target.value },
                                            )
                                          }
                                        />
                                      </div>
                                    </div>

                                    {/* Párrafos personalizados extras */}
                                    {aboutData.extraParagraphs.length > 0 && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                        {aboutData.extraParagraphs.map((para, pIdx) => (
                                          <div
                                            key={para.id}
                                            className="p-3.5 rounded-xl bg-surface-container-lowest border border-[#ECEAE7] space-y-2.5"
                                          >
                                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#ECEAE7]">
                                              <span className="font-label-sm text-[11px] font-bold text-primary">
                                                Apartado extra #{pIdx + 1}
                                              </span>
                                              <div className="flex items-center gap-1">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    updateAboutData(sec.id, (cur) => ({
                                                      ...cur,
                                                      extraParagraphs: cur.extraParagraphs.map((x, i) =>
                                                        i === pIdx ? { ...x, visible: !x.visible } : x,
                                                      ),
                                                    }))
                                                  }
                                                  className={`h-7 px-2 rounded text-[10px] font-semibold inline-flex items-center gap-1 border cursor-pointer ${
                                                    para.visible !== false
                                                      ? "bg-[#141414] text-[#F5F3EE] border-[#141414]"
                                                      : "bg-surface-container-low text-secondary border-[#ECEAE7]"
                                                  }`}
                                                >
                                                  <span className="material-symbols-outlined text-[13px]">
                                                    {para.visible !== false ? "visibility" : "visibility_off"}
                                                  </span>
                                                  {para.visible !== false ? "Visible" : "Oculto"}
                                                </button>
                                                <button
                                                  type="button"
                                                  disabled={pIdx === 0}
                                                  onClick={() =>
                                                    updateAboutData(sec.id, (cur) => {
                                                      const next = [...cur.extraParagraphs];
                                                      [next[pIdx - 1], next[pIdx]] = [next[pIdx], next[pIdx - 1]];
                                                      return { ...cur, extraParagraphs: next };
                                                    })
                                                  }
                                                  className="w-7 h-7 rounded border border-[#ECEAE7] flex items-center justify-center disabled:opacity-35 cursor-pointer"
                                                  title="Subir apartado"
                                                >
                                                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                                                </button>
                                                <button
                                                  type="button"
                                                  disabled={pIdx === aboutData.extraParagraphs.length - 1}
                                                  onClick={() =>
                                                    updateAboutData(sec.id, (cur) => {
                                                      const next = [...cur.extraParagraphs];
                                                      [next[pIdx + 1], next[pIdx]] = [next[pIdx], next[pIdx + 1]];
                                                      return { ...cur, extraParagraphs: next };
                                                    })
                                                  }
                                                  className="w-7 h-7 rounded border border-[#ECEAE7] flex items-center justify-center disabled:opacity-35 cursor-pointer"
                                                  title="Bajar apartado"
                                                >
                                                  <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                                                </button>
                                                {confirmDeleteParagraphId === para.id ? (
                                                  <div className="inline-flex items-center gap-1 bg-error-container px-1.5 py-0.5 rounded">
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        updateAboutData(sec.id, (cur) => ({
                                                          ...cur,
                                                          extraParagraphs: cur.extraParagraphs.filter(
                                                            (x) => x.id !== para.id,
                                                          ),
                                                        }));
                                                        setConfirmDeleteParagraphId(null);
                                                      }}
                                                      className="px-1.5 py-0.5 rounded bg-[#D9381E] text-white text-[10px] font-bold cursor-pointer"
                                                    >
                                                      Sí
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => setConfirmDeleteParagraphId(null)}
                                                      className="px-1.5 py-0.5 rounded bg-white text-primary text-[10px] cursor-pointer"
                                                    >
                                                      No
                                                    </button>
                                                  </div>
                                                ) : (
                                                  <button
                                                    type="button"
                                                    onClick={() => setConfirmDeleteParagraphId(para.id)}
                                                    className="w-7 h-7 rounded border border-[#ECEAE7] text-secondary hover:text-error flex items-center justify-center cursor-pointer"
                                                    title="Eliminar apartado"
                                                  >
                                                    <span className="material-symbols-outlined text-[14px]">delete</span>
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                            <input
                                              className="h-9 text-sm px-2.5 rounded-lg bg-surface-container-low border border-[#ECEAE7] text-primary font-semibold w-full"
                                              value={sectionsLang === "es" ? para.titleEs : para.titleEn}
                                              placeholder={sectionsLang === "es" ? "Título del apartado" : "Section title"}
                                              onChange={(e) =>
                                                updateAboutData(sec.id, (cur) => ({
                                                  ...cur,
                                                  extraParagraphs: cur.extraParagraphs.map((x, i) =>
                                                    i === pIdx
                                                      ? sectionsLang === "es"
                                                        ? { ...x, titleEs: e.target.value }
                                                        : { ...x, titleEn: e.target.value }
                                                      : x,
                                                  ),
                                                }))
                                              }
                                            />
                                            <textarea
                                              rows={2}
                                              className="text-sm p-2.5 rounded-lg bg-surface-container-low border border-[#ECEAE7] text-secondary w-full"
                                              value={sectionsLang === "es" ? para.bodyEs : para.bodyEn}
                                              placeholder={sectionsLang === "es" ? "Contenido del párrafo" : "Paragraph content"}
                                              onChange={(e) =>
                                                updateAboutData(sec.id, (cur) => ({
                                                  ...cur,
                                                  extraParagraphs: cur.extraParagraphs.map((x, i) =>
                                                    i === pIdx
                                                      ? sectionsLang === "es"
                                                        ? { ...x, bodyEs: e.target.value }
                                                        : { ...x, bodyEn: e.target.value }
                                                      : x,
                                                  ),
                                                }))
                                              }
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* 3. Gestor del Equipo en Arcos Arquitectónicos (Master-Detail Compacto) */}
                                  <div className="p-4 rounded-xl bg-surface-container-low/60 border border-[#ECEAE7] space-y-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div>
                                        <p className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-primary">
                                          3. Gestor del Equipo en Arcos Arquitectónicos ({aboutData.team.length} integrantes)
                                        </p>
                                        <p className="text-[11px] text-secondary">
                                          Selecciona un integrante arriba para editar su arco, color, retrato PNG sin fondo y trayectoria.
                                        </p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nextIdx = aboutData.team.length;
                                          const newMember: TeamMemberItem = {
                                            id: `team-${Date.now().toString(36)}`,
                                            name: "Nuevo Integrante",
                                            roleEs: "Asesor Inmobiliario",
                                            roleEn: "Real Estate Advisor",
                                            experienceEs: "5 años · Cuenca",
                                            experienceEn: "5 years · Cuenca",
                                            bioEs: "Especialista en atención personalizada y acompañamiento comercial en Cuenca.",
                                            bioEn: "Specialist in personalized client advisory and property tours in Cuenca.",
                                            photo: "",
                                            archColor: TEAM_ARCH_PALETTE[(nextIdx + 1) % TEAM_ARCH_PALETTE.length].hex,
                                            isDirector: false,
                                            visible: true,
                                          };
                                          updateAboutData(sec.id, (cur) => ({
                                            ...cur,
                                            team: [...cur.team, newMember],
                                          }));
                                          setSelectedMemberIndex(nextIdx);
                                          toast("Nuevo integrante agregado al equipo");
                                        }}
                                        className="h-9 px-3.5 rounded-lg bg-[#141414] text-[#F5F3EE] hover:bg-[#D9381E] text-[12px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">person_add</span>
                                        + Agregar persona
                                      </button>
                                    </div>

                                    {/* Barra superior compacta de selección de integrantes (1 a N) */}
                                    <div
                                      role="tablist"
                                      aria-label="Seleccionar integrante del equipo"
                                      className="flex flex-wrap items-center gap-2"
                                    >
                                      {aboutData.team.map((m, idx) => {
                                        const safeSelected = Math.min(
                                          Math.max(0, selectedMemberIndex),
                                          Math.max(0, aboutData.team.length - 1),
                                        );
                                        const isSelected = idx === safeSelected;
                                        const mColor = m.archColor || (m.isDirector ? "#242424" : "#F5F3EE");
                                        return (
                                          <button
                                            key={m.id}
                                            type="button"
                                            role="tab"
                                            aria-selected={isSelected}
                                            onClick={() => setSelectedMemberIndex(idx)}
                                            className={`h-9 px-3 rounded-full border text-[12px] font-medium inline-flex items-center gap-2 transition-all cursor-pointer ${
                                              isSelected
                                                ? "bg-[#141414] text-[#F5F3EE] border-[#141414] font-semibold shadow-sm"
                                                : "bg-surface-container-lowest text-primary border-[#ECEAE7] hover:border-[#141414]/40"
                                            } ${m.visible === false ? "opacity-60" : ""}`}
                                          >
                                            <span
                                              className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                                              style={{ backgroundColor: mColor }}
                                              aria-hidden
                                            />
                                            <span>
                                              #{idx + 1} {m.name}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>

                                    {/* Panel único de edición compacto para el integrante seleccionado */}
                                    {aboutData.team.length > 0 && (() => {
                                      const safeIdx = Math.min(
                                        Math.max(0, selectedMemberIndex),
                                        aboutData.team.length - 1,
                                      );
                                      const member = aboutData.team[safeIdx];
                                      const errKey = `${sec.id}-team-${member.id}`;
                                      const mErr = blockUploadError[errKey];
                                      const isUploading = teamUploadingId === member.id;
                                      const archHex =
                                        member.archColor ||
                                        (member.isDirector
                                          ? "#242424"
                                          : TEAM_ARCH_PALETTE[(safeIdx + 1) % TEAM_ARCH_PALETTE.length].hex);
                                      const isDarkBg = isDarkHexColor(archHex);
                                      const rolePreview =
                                        sectionsLang === "es" ? member.roleEs : member.roleEn;

                                      return (
                                        <div className="rounded-xl bg-surface-container-lowest border border-[#ECEAE7] p-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                                          {/* Columna izquierda: Vista previa real en vivo del arco + Subida PNG + Paleta de color */}
                                          <div className="lg:col-span-5 flex flex-col items-center gap-3.5 p-3.5 rounded-xl bg-[#141414] text-[#F5F3EE]">
                                            <div
                                              style={{
                                                backgroundColor: archHex,
                                                color: isDarkBg ? "#F5F3EE" : "#141414",
                                              }}
                                              className={`w-44 h-60 rounded-t-full border overflow-hidden flex flex-col justify-between shadow-lg ${
                                                isDarkBg ? "border-white/15" : "border-black/10"
                                              }`}
                                            >
                                              <div className="pt-8 px-4 text-center shrink-0">
                                                <p className="font-display text-[13px] font-bold leading-tight text-balance break-words">
                                                  {member.name || `Integrante #${safeIdx + 1}`}
                                                </p>
                                                <p
                                                  className={`mt-1 text-[10px] leading-snug text-balance break-words ${
                                                    isDarkBg ? "text-[#F5F3EE]/80" : "text-[#141414]/75"
                                                  }`}
                                                >
                                                  {rolePreview}
                                                </p>
                                              </div>

                                              <div className="relative flex-1 w-full flex items-end justify-center overflow-hidden mt-auto">
                                                {member.photo ? (
                                                  <Image
                                                    src={member.photo}
                                                    alt={member.name}
                                                    width={200}
                                                    height={240}
                                                    className="grayscale contrast-110 object-contain object-bottom w-full max-h-[76%] h-auto"
                                                    unoptimized={
                                                      member.photo.startsWith("data:") ||
                                                      member.photo.startsWith("blob:")
                                                    }
                                                  />
                                                ) : (
                                                  <span className="text-[10px] opacity-50 pb-4">
                                                    Sin retrato PNG
                                                  </span>
                                                )}
                                              </div>
                                            </div>

                                            <div className="w-full space-y-2.5">
                                              <input
                                                ref={(el) => {
                                                  blockFileRefs.current[errKey] = el;
                                                }}
                                                type="file"
                                                accept="image/png,image/webp,image/jpeg"
                                                className="sr-only"
                                                onChange={(e) => {
                                                  void handleTeamPhotoUpload(
                                                    sec.id,
                                                    member.id,
                                                    e.target.files?.[0] ?? null,
                                                  );
                                                  e.target.value = "";
                                                }}
                                              />

                                              <div className="flex flex-wrap items-center justify-center gap-2">
                                                <button
                                                  type="button"
                                                  disabled={isUploading}
                                                  onClick={() => blockFileRefs.current[errKey]?.click()}
                                                  className="h-9 px-3.5 rounded-lg bg-[#F5F3EE] text-[#141414] hover:bg-[#D9381E] hover:text-white text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                                                >
                                                  <span className="material-symbols-outlined text-[15px]">
                                                    cloud_upload
                                                  </span>
                                                  {isUploading ? "Procesando…" : "Subir foto PNG sin fondo"}
                                                </button>
                                                {member.photo && (
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      updateAboutData(sec.id, (cur) => ({
                                                        ...cur,
                                                        team: cur.team.map((m) =>
                                                          m.id === member.id ? { ...m, photo: "" } : m,
                                                        ),
                                                      }))
                                                    }
                                                    className="h-9 px-2.5 rounded-lg border border-white/20 text-[#F5F3EE]/80 hover:text-white hover:border-[#D9381E] text-[11px] cursor-pointer"
                                                  >
                                                    Quitar
                                                  </button>
                                                )}
                                              </div>
                                              <p className="text-[10px] text-[#F5F3EE]/65 text-center">
                                                PNG sin fondo transparente · Plano medio · máx. 5 MB (preserva alfa)
                                              </p>

                                              {mErr && (
                                                <div
                                                  role="alert"
                                                  className="p-2 rounded-lg bg-error-container text-on-error-container flex items-center justify-between gap-2 text-[11px]"
                                                >
                                                  <span>{mErr}</span>
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      setBlockUploadError((prev) => {
                                                        const copy = { ...prev };
                                                        delete copy[errKey];
                                                        return copy;
                                                      })
                                                    }
                                                    className="w-5 h-5 rounded flex items-center justify-center cursor-pointer"
                                                  >
                                                    <span className="material-symbols-outlined text-[13px]">close</span>
                                                  </button>
                                                </div>
                                              )}

                                              {/* Selector visual de Paleta de Color del Arco + HEX */}
                                              <div className="pt-2 border-t border-white/10 space-y-2">
                                                <div className="flex items-center justify-between">
                                                  <span className="text-[10px] uppercase tracking-wider text-[#F5F3EE]/70 font-semibold">
                                                    Color del arco
                                                  </span>
                                                  <span className="font-mono text-[10px] text-[#F5F3EE]/80">
                                                    {archHex.toUpperCase()} · {isDarkBg ? "Texto Arena" : "Texto Tinta"}
                                                  </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                  {TEAM_ARCH_PALETTE.map((sw) => {
                                                    const activeSwatch =
                                                      archHex.toLowerCase() === sw.hex.toLowerCase();
                                                    return (
                                                      <button
                                                        key={sw.hex}
                                                        type="button"
                                                        title={`${sw.label} (${sw.hex})`}
                                                        aria-label={`Color ${sw.label}`}
                                                        onClick={() =>
                                                          updateAboutData(sec.id, (cur) => ({
                                                            ...cur,
                                                            team: cur.team.map((m) =>
                                                              m.id === member.id
                                                                ? { ...m, archColor: sw.hex }
                                                                : m,
                                                            ),
                                                          }))
                                                        }
                                                        style={{ backgroundColor: sw.hex }}
                                                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                                                          activeSwatch
                                                            ? "border-[#D9381E] scale-110 shadow"
                                                            : "border-white/30 hover:scale-105"
                                                        }`}
                                                      />
                                                    );
                                                  })}
                                                  <label className="inline-flex items-center gap-1 ml-auto text-[10px] text-[#F5F3EE]/80 cursor-pointer">
                                                    <span>HEX</span>
                                                    <input
                                                      type="color"
                                                      value={/^#[0-9A-Fa-f]{6}$/.test(archHex) ? archHex : "#F5F3EE"}
                                                      onChange={(e) =>
                                                        updateAboutData(sec.id, (cur) => ({
                                                          ...cur,
                                                          team: cur.team.map((m) =>
                                                            m.id === member.id
                                                              ? { ...m, archColor: e.target.value }
                                                              : m,
                                                          ),
                                                        }))
                                                      }
                                                      className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 p-0"
                                                      aria-label="Color personalizado del arco"
                                                    />
                                                  </label>
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Columna derecha: Controles rápidos + Campos bilingües compactos */}
                                          <div className="lg:col-span-7 space-y-3">
                                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#ECEAE7]">
                                              <span className="font-label-sm text-[12px] font-bold text-primary">
                                                Editando integrante #{safeIdx + 1}
                                              </span>
                                              <div className="flex flex-wrap items-center gap-1.5">
                                                <button
                                                  type="button"
                                                  disabled={safeIdx === 0}
                                                  onClick={() => {
                                                    updateAboutData(sec.id, (cur) => {
                                                      const next = [...cur.team];
                                                      [next[safeIdx - 1], next[safeIdx]] = [
                                                        next[safeIdx],
                                                        next[safeIdx - 1],
                                                      ];
                                                      return { ...cur, team: next };
                                                    });
                                                    setSelectedMemberIndex(Math.max(0, safeIdx - 1));
                                                  }}
                                                  className="w-8 h-8 rounded-lg border border-[#ECEAE7] flex items-center justify-center disabled:opacity-35 cursor-pointer"
                                                  title="Mover a la izquierda"
                                                >
                                                  <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                                                </button>
                                                <button
                                                  type="button"
                                                  disabled={safeIdx === aboutData.team.length - 1}
                                                  onClick={() => {
                                                    updateAboutData(sec.id, (cur) => {
                                                      const next = [...cur.team];
                                                      [next[safeIdx + 1], next[safeIdx]] = [
                                                        next[safeIdx],
                                                        next[safeIdx + 1],
                                                      ];
                                                      return { ...cur, team: next };
                                                    });
                                                    setSelectedMemberIndex(
                                                      Math.min(aboutData.team.length - 1, safeIdx + 1),
                                                    );
                                                  }}
                                                  className="w-8 h-8 rounded-lg border border-[#ECEAE7] flex items-center justify-center disabled:opacity-35 cursor-pointer"
                                                  title="Mover a la derecha"
                                                >
                                                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                                                </button>

                                                <button
                                                  type="button"
                                                  aria-pressed={Boolean(member.isDirector)}
                                                  onClick={() =>
                                                    updateAboutData(sec.id, (cur) => ({
                                                      ...cur,
                                                      team: cur.team.map((m) =>
                                                        m.id === member.id
                                                          ? { ...m, isDirector: !m.isDirector }
                                                          : m,
                                                      ),
                                                    }))
                                                  }
                                                  className={`h-8 px-2.5 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 border cursor-pointer ${
                                                    member.isDirector
                                                      ? "bg-[#D9381E] text-white border-[#D9381E]"
                                                      : "bg-surface-container-low text-secondary border-[#ECEAE7]"
                                                  }`}
                                                >
                                                  <span className="material-symbols-outlined text-[14px]">star</span>
                                                  Dirección
                                                </button>

                                                <button
                                                  type="button"
                                                  aria-pressed={member.visible !== false}
                                                  onClick={() =>
                                                    updateAboutData(sec.id, (cur) => ({
                                                      ...cur,
                                                      team: cur.team.map((m) =>
                                                        m.id === member.id ? { ...m, visible: !m.visible } : m,
                                                      ),
                                                    }))
                                                  }
                                                  className={`h-8 px-2.5 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 border cursor-pointer ${
                                                    member.visible !== false
                                                      ? "bg-[#141414] text-[#F5F3EE] border-[#141414]"
                                                      : "bg-surface-container-low text-secondary border-[#ECEAE7]"
                                                  }`}
                                                >
                                                  <span className="material-symbols-outlined text-[14px]">
                                                    {member.visible !== false ? "visibility" : "visibility_off"}
                                                  </span>
                                                  {member.visible !== false ? "Visible" : "Oculto"}
                                                </button>

                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const remaining = aboutData.team.length - 1;
                                                    updateAboutData(sec.id, (cur) => ({
                                                      ...cur,
                                                      team: cur.team.filter((m) => m.id !== member.id),
                                                    }));
                                                    setSelectedMemberIndex(
                                                      Math.max(0, Math.min(safeIdx, remaining - 1)),
                                                    );
                                                  }}
                                                  className="w-8 h-8 rounded-lg border border-[#ECEAE7] text-secondary hover:text-error flex items-center justify-center cursor-pointer"
                                                  title="Eliminar integrante"
                                                >
                                                  <span className="material-symbols-outlined text-[15px]">delete</span>
                                                </button>
                                              </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                              <div>
                                                <label className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                                  Nombre completo
                                                </label>
                                                <input
                                                  className="h-9 text-sm px-2.5 rounded-lg bg-surface-container-low border border-[#ECEAE7] text-primary font-semibold w-full"
                                                  value={member.name}
                                                  onChange={(e) =>
                                                    updateAboutData(sec.id, (cur) => ({
                                                      ...cur,
                                                      team: cur.team.map((m) =>
                                                        m.id === member.id ? { ...m, name: e.target.value } : m,
                                                      ),
                                                    }))
                                                  }
                                                />
                                              </div>
                                              <div>
                                                <label className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                                  Cargo / Rol ({sectionsLang.toUpperCase()})
                                                </label>
                                                <input
                                                  className="h-9 text-sm px-2.5 rounded-lg bg-surface-container-low border border-[#ECEAE7] text-primary w-full"
                                                  value={sectionsLang === "es" ? member.roleEs : member.roleEn}
                                                  onChange={(e) =>
                                                    updateAboutData(sec.id, (cur) => ({
                                                      ...cur,
                                                      team: cur.team.map((m) =>
                                                        m.id === member.id
                                                          ? sectionsLang === "es"
                                                            ? { ...m, roleEs: e.target.value }
                                                            : { ...m, roleEn: e.target.value }
                                                          : m,
                                                      ),
                                                    }))
                                                  }
                                                />
                                              </div>
                                            </div>

                                            <div>
                                              <label className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                                Años de experiencia / Especialidad ({sectionsLang.toUpperCase()})
                                              </label>
                                              <input
                                                className="h-9 text-sm px-2.5 rounded-lg bg-surface-container-low border border-[#ECEAE7] text-primary w-full"
                                                value={
                                                  sectionsLang === "es" ? member.experienceEs : member.experienceEn
                                                }
                                                onChange={(e) =>
                                                  updateAboutData(sec.id, (cur) => ({
                                                    ...cur,
                                                    team: cur.team.map((m) =>
                                                      m.id === member.id
                                                        ? sectionsLang === "es"
                                                          ? { ...m, experienceEs: e.target.value }
                                                          : { ...m, experienceEn: e.target.value }
                                                        : m,
                                                    ),
                                                  }))
                                                }
                                              />
                                            </div>

                                            <div>
                                              <label className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                                Trayectoria / Biografía breve ({sectionsLang.toUpperCase()})
                                              </label>
                                              <textarea
                                                rows={3}
                                                className="text-sm p-2.5 rounded-lg bg-surface-container-low border border-[#ECEAE7] text-secondary w-full"
                                                value={sectionsLang === "es" ? member.bioEs : member.bioEn}
                                                onChange={(e) =>
                                                  updateAboutData(sec.id, (cur) => ({
                                                    ...cur,
                                                    team: cur.team.map((m) =>
                                                      m.id === member.id
                                                        ? sectionsLang === "es"
                                                          ? { ...m, bioEs: e.target.value }
                                                          : { ...m, bioEn: e.target.value }
                                                        : m,
                                                    ),
                                                  }))
                                                }
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              );
                            })()}

                          {/* TIPO 3 y 4: Banner CTA y Bloque Editorial + Imagen genérico */}
                          {(sec.type === "cta_banner" ||
                            (sec.type === "editorial_split" &&
                              sec.id !== "sec-editorial-about" &&
                              !sec.aboutData)) && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                              <div className="lg:col-span-7 space-y-3">
                                {sec.type === "editorial_split" && (
                                  <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                          Etiqueta superior / Kicker ({sectionsLang.toUpperCase()})
                                        </label>
                                        <input
                                          className="h-9 text-sm px-2.5 rounded-lg bg-surface-container-low border border-[#ECEAE7] text-primary w-full"
                                          value={
                                            sectionsLang === "es"
                                              ? (sec.kickerEs ?? "")
                                              : (sec.kickerEn ?? "")
                                          }
                                          onChange={(e) =>
                                            updateSectionBlock(
                                              sec.id,
                                              sectionsLang === "es"
                                                ? { kickerEs: e.target.value }
                                                : { kickerEn: e.target.value },
                                            )
                                          }
                                        />
                                      </div>
                                      <div>
                                        <label className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                          Insignia sobre la foto ({sectionsLang.toUpperCase()})
                                        </label>
                                        <input
                                          className="h-9 text-sm px-2.5 rounded-lg bg-surface-container-low border border-[#ECEAE7] text-primary w-full"
                                          value={
                                            sectionsLang === "es"
                                              ? (sec.badgeEs ?? "")
                                              : (sec.badgeEn ?? "")
                                          }
                                          onChange={(e) =>
                                            updateSectionBlock(
                                              sec.id,
                                              sectionsLang === "es"
                                                ? { badgeEs: e.target.value }
                                                : { badgeEn: e.target.value },
                                            )
                                          }
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                        Párrafo editorial ({sectionsLang.toUpperCase()})
                                      </label>
                                      <textarea
                                        rows={3}
                                        className="text-sm p-2.5 rounded-lg bg-surface-container-low border border-[#ECEAE7] text-secondary w-full"
                                        value={
                                          sectionsLang === "es"
                                            ? (sec.bodyEs ?? "")
                                            : (sec.bodyEn ?? "")
                                        }
                                        onChange={(e) =>
                                          updateSectionBlock(
                                            sec.id,
                                            sectionsLang === "es"
                                              ? { bodyEs: e.target.value }
                                              : { bodyEn: e.target.value },
                                          )
                                        }
                                      />
                                    </div>

                                    {/* Viñetas / Bullets del bloque editorial */}
                                    <div className="space-y-2">
                                      <span className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold">
                                        Viñetas destacadas ({sectionsLang.toUpperCase()})
                                      </span>
                                      {(sec.bullets ?? []).map((b, bIdx) => (
                                        <div key={b.id} className="flex items-center gap-2">
                                          <input
                                            className="h-9 text-sm px-2.5 rounded-lg bg-surface-container-low border border-[#ECEAE7] text-primary flex-1"
                                            value={sectionsLang === "es" ? b.textEs : b.textEn}
                                            onChange={(e) => {
                                              const next = (sec.bullets ?? []).map((item, i) =>
                                                i === bIdx
                                                  ? sectionsLang === "es"
                                                    ? { ...item, textEs: e.target.value }
                                                    : { ...item, textEn: e.target.value }
                                                  : item,
                                              );
                                              updateSectionBlock(sec.id, { bullets: next });
                                            }}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const next = (sec.bullets ?? []).filter(
                                                (_, i) => i !== bIdx,
                                              );
                                              updateSectionBlock(sec.id, { bullets: next });
                                            }}
                                            className="w-8 h-8 rounded-lg bg-surface-container-low border border-[#ECEAE7] text-secondary hover:text-error flex items-center justify-center cursor-pointer"
                                          >
                                            <span className="material-symbols-outlined text-[15px]">
                                              close
                                            </span>
                                          </button>
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const next = [
                                            ...(sec.bullets ?? []),
                                            {
                                              id: `bul-${Date.now().toString(36)}`,
                                              textEs: "Nueva garantía o ventaja diferencial",
                                              textEn: "New warranty or key advantage",
                                            },
                                          ];
                                          updateSectionBlock(sec.id, { bullets: next });
                                        }}
                                        className="h-8 px-3 rounded-lg bg-surface-container-low border border-[#ECEAE7] text-[11px] font-semibold text-primary inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-[14px]">
                                          add
                                        </span>
                                        + Agregar viñeta
                                      </button>
                                    </div>
                                  </>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                      Texto del botón ({sectionsLang.toUpperCase()})
                                    </label>
                                    <input
                                      className="h-9 text-sm px-2.5 rounded-lg bg-surface-container-low border border-[#ECEAE7] text-primary font-medium w-full"
                                      value={
                                        sectionsLang === "es"
                                          ? (sec.ctaLabelEs ?? "")
                                          : (sec.ctaLabelEn ?? "")
                                      }
                                      onChange={(e) =>
                                        updateSectionBlock(
                                          sec.id,
                                          sectionsLang === "es"
                                            ? { ctaLabelEs: e.target.value }
                                            : { ctaLabelEn: e.target.value },
                                        )
                                      }
                                    />
                                  </div>
                                  <div>
                                    <label className="block font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                                      Ruta o enlace del botón
                                    </label>
                                    <input
                                      className="h-9 text-sm px-2.5 rounded-lg bg-surface-container-low border border-[#ECEAE7] font-mono text-primary w-full"
                                      value={sec.ctaHref ?? "/vende-o-alquila"}
                                      onChange={(e) =>
                                        updateSectionBlock(sec.id, { ctaHref: e.target.value })
                                      }
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Subida y vista previa de Imagen del Bloque (JPG/PNG/WEBP ≤ 5 MB) */}
                              <div className="lg:col-span-5 rounded-xl border border-[#ECEAE7] bg-[#F5F3EE]/60 p-4 space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                  <div>
                                    <p className="font-label-md text-[12px] font-bold text-[#141414]">
                                      Imagen del bloque ({sec.type === "cta_banner" ? "Opcional" : "Principal"})
                                    </p>
                                    <p className="text-[11px] text-secondary">
                                      JPG, PNG o WEBP · Máx. 5 MB
                                    </p>
                                  </div>
                                  <input
                                    ref={(el) => {
                                      blockFileRefs.current[sec.id] = el;
                                    }}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="sr-only"
                                    onChange={(e) => {
                                      handleBlockImageUpload(
                                        sec.id,
                                        e.target.files?.[0] ?? null,
                                      );
                                      e.target.value = "";
                                    }}
                                  />
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => blockFileRefs.current[sec.id]?.click()}
                                      className="h-8 px-3 rounded-lg bg-[#141414] text-[#F5F3EE] hover:bg-[#D9381E] text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">
                                        cloud_upload
                                      </span>
                                      Subir imagen
                                    </button>
                                    {sec.image && (
                                      <button
                                        type="button"
                                        onClick={() => updateSectionBlock(sec.id, { image: "" })}
                                        className="h-8 px-2.5 rounded-lg bg-white border border-[#ECEAE7] text-secondary hover:text-error text-[11px] cursor-pointer"
                                      >
                                        Quitar
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {blockUploadError[sec.id] && (
                                  <div
                                    role="alert"
                                    className="p-2.5 rounded-lg bg-error-container text-on-error-container flex items-center justify-between gap-2 text-[11px]"
                                  >
                                    <span>{blockUploadError[sec.id]}</span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setBlockUploadError((prev) => {
                                          const copy = { ...prev };
                                          delete copy[sec.id];
                                          return copy;
                                        })
                                      }
                                      className="w-6 h-6 rounded hover:bg-black/10 flex items-center justify-center cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">
                                        close
                                      </span>
                                    </button>
                                  </div>
                                )}

                                {sec.image ? (
                                  <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-[#141414] border border-[#ECEAE7]">
                                    <Image
                                      src={sec.image}
                                      alt={blockTitle}
                                      fill
                                      sizes="360px"
                                      className="object-cover"
                                      unoptimized={
                                        sec.image.startsWith("data:") ||
                                        sec.image.startsWith("blob:")
                                      }
                                    />
                                  </div>
                                ) : (
                                  <div className="aspect-[16/10] w-full rounded-lg border border-dashed border-[#141414]/20 bg-white/70 flex flex-col items-center justify-center text-center p-4">
                                    <span className="material-symbols-outlined text-[24px] text-secondary mb-1">
                                      image
                                    </span>
                                    <span className="text-[11px] text-secondary">
                                      {sec.type === "cta_banner"
                                        ? "Sin imagen de fondo (usa fondo sólido Negro Tinta #141414)"
                                        : "Haz clic en «Subir imagen» para mostrar una fotografía"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAssistantTab("rules")}
              className={`px-3.5 py-2 rounded-full text-label-md font-medium cursor-pointer ${
                assistantTab === "rules"
                  ? "bg-on-surface text-surface"
                  : "bg-surface-container-lowest border border-outline-variant text-on-surface-variant"
              }`}
            >
              Reglas operativas y comportamiento (A7)
            </button>
            <button
              type="button"
              onClick={() => setAssistantTab("audit")}
              className={`px-3.5 py-2 rounded-full text-label-md font-medium cursor-pointer ${
                assistantTab === "audit"
                  ? "bg-on-surface text-surface"
                  : "bg-surface-container-lowest border border-outline-variant text-on-surface-variant"
              }`}
            >
              Conversaciones y traspasos (A7.2 · 84)
            </button>
          </div>

          {assistantTab === "rules" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-6">
                <Card icon="smart_toy" title="Estado y Canales Activos" subtitle="Horario comercial GMT-5 (Cuenca)">
                  <div className="space-y-4">
                    <Toggle checked={aiOnline} onChange={setAiOnline} label="Asistente de IA en línea" />
                    <Toggle checked={webChannel} onChange={setWebChannel} label="Widget Web (C2) · Portal RG Cuenca / Miami" />
                    <Toggle checked={waChannel} onChange={setWaChannel} label="WhatsApp API · Meta Verified Oficial" />
                    <PField label="Respuesta automática fuera de horario">
                      {(id) => (
                        <textarea
                          id={id}
                          rows={3}
                          value={offHoursMsg}
                          onChange={(e) => setOffHoursMsg(e.target.value)}
                          className={`${pInput} h-auto py-2`}
                        />
                      )}
                    </PField>
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-6 space-y-6">
                <Card
                  icon="policy"
                  title="Mensajes Fijos del Sistema (PRD Sec. 8)"
                  subtitle="Reglas éticas y de privacidad no editables por seguridad"
                >
                  <div className="space-y-4">
                    <div className="rounded-xl border border-outline-variant bg-surface p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-label-md font-semibold text-on-surface">Consentimiento Expreso PII</span>
                        <span className="text-label-sm px-2 py-0.5 rounded bg-surface-container-high">Inmutable</span>
                      </div>
                      <p className="text-body-sm text-on-surface-variant italic">
                        &ldquo;¿Me permites guardar tu nombre y tu número para que un asesor te contacte? Los usaremos solo para eso, según nuestra Política de privacidad.&rdquo;
                      </p>
                    </div>

                    <div className="rounded-xl border border-outline-variant bg-surface p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-label-md font-semibold text-on-surface">Protocolo de Traspaso a Asesor</span>
                        <span className="text-label-sm px-2 py-0.5 rounded bg-surface-container-high">Precio / Legal / Crédito</span>
                      </div>
                      <p className="text-body-sm text-on-surface-variant italic">
                        &ldquo;Te paso con un asesor de RG para que te ayude con esto. Te escribirá en nuestro horario de atención (lunes a viernes de 9:00 a 18:00).&rdquo;
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Conversaciones", value: "84", sub: "+18% este mes · 62 Web / 22 WA", icon: "chat_bubble" },
                  { label: "Resolución Autónoma IA", value: "68%", sub: "57 de 84 resueltos sin asesor", icon: "smart_toy" },
                  { label: "Traspasos a Asesores", value: "27", sub: "32% · Tiempo medio 4.2 min", icon: "support_agent" },
                  { label: "Blindaje Ético / Seguridad", value: "14", sub: "0 alucinaciones · dirección protegida", icon: "verified_user" },
                ].map((kpi) => (
                  <div key={kpi.label} className="group rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-primary/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                    <div className="flex items-center justify-between text-on-surface-variant mb-2">
                      <span className="text-label-sm uppercase tracking-wider font-semibold">{kpi.label}</span>
                      <span className="w-8 h-8 rounded-lg bg-surface-container text-primary flex items-center justify-center transition-colors duration-300 group-hover:bg-primary group-hover:text-on-primary motion-reduce:transition-none">
                        <span className="material-symbols-outlined text-[18px]">{kpi.icon}</span>
                      </span>
                    </div>
                    <p className="font-display text-headline-md text-on-surface transition-colors duration-300 group-hover:text-rg-red motion-reduce:transition-none">{kpi.value}</p>
                    <p className="text-body-sm text-on-surface-variant mt-1">{kpi.sub}</p>
                  </div>
                ))}
              </div>

              <Card
                icon="forum"
                title="Historial y Auditoría de Conversaciones"
                subtitle="Registro de decisiones éticas, consentimiento y traspasos"
                aside={
                  <select
                    value={channelFilter}
                    onChange={(e) => setChannelFilter(e.target.value)}
                    aria-label="Filtrar por canal"
                    className={`${pInput} w-full sm:w-48`}
                  >
                    <option value="all">Todos los canales</option>
                    <option value="Widget Web (C2)">Widget Web (C2)</option>
                    <option value="WhatsApp API">WhatsApp API</option>
                  </select>
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-body-sm">
                    <thead>
                      <tr className="border-b border-outline-variant text-label-sm uppercase text-on-surface-variant">
                        <th className="py-3 pr-4">ID / Fecha</th>
                        <th className="py-3 pr-4">Canal</th>
                        <th className="py-3 pr-4">Consulta</th>
                        <th className="py-3 pr-4">Resultado</th>
                        <th className="py-3 pr-4">Asesor</th>
                        <th className="py-3">Regla Aplicada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {filteredLogs.map((row) => (
                        <tr key={row.id} className="hover:bg-surface-container-low/50">
                          <td className="py-3.5 pr-4 whitespace-nowrap">
                            <p className="font-mono font-semibold text-on-surface">{row.id}</p>
                            <p className="text-label-sm text-on-surface-variant">{row.date}</p>
                          </td>
                          <td className="py-3.5 pr-4 whitespace-nowrap">{row.channel}</td>
                          <td className="py-3.5 pr-4">
                            <p className="font-medium text-on-surface">{row.topic}</p>
                            <p className="text-label-sm text-on-surface-variant">{row.visitor}</p>
                          </td>
                          <td className="py-3.5 pr-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-label-sm font-medium">
                              {row.outcome}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4 whitespace-nowrap">{row.advisor}</td>
                          <td className="py-3.5 whitespace-nowrap text-on-surface-variant">{row.shield}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
