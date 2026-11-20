import type { Lang } from "@/lib/types";
import { FaqClient } from "./FaqClient";

export const metadata = {
  title: "Preguntas frecuentes",
  description:
    "Respuestas verificadas sobre compra, venta, alquiler, crédito VIP, BIESS y garantías constructivas en RG Inmobiliaria.",
};

export default async function FaqPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  return <FaqClient lang={lang} />;
}
