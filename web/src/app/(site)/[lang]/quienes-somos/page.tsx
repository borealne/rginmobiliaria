import type { Metadata } from "next";
import type { Lang } from "@/lib/types";
import { QuienesSomosClient } from "./QuienesSomosClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title:
      lang === "en"
        ? "About Us & Team | RG Real Estate & Construction"
        : "Quiénes Somos y Equipo | RG Inmobiliaria y Constructora",
    description:
      lang === "en"
        ? "Meet the RG Inmobiliaria & Constructora leadership and specialist team in Cuenca and Miami."
        : "Conoce la identidad institucional, misión, visión y equipo especialista de RG Inmobiliaria y Constructora en Cuenca y Miami.",
  };
}

export default async function QuienesSomosPage({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  return <QuienesSomosClient lang={lang} />;
}
