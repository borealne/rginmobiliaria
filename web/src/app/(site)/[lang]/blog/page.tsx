import type { Lang } from "@/lib/types";
import { BlogCatalogClient } from "./BlogCatalogClient";

export const metadata = {
  title: "Blog & Tendencias Inmobiliarias",
  description:
    "Análisis de mercado, crédito VIP, arquitectura bioclimática y guías legales para comprar y construir en Cuenca.",
};

export default async function BlogPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  return <BlogCatalogClient lang={lang} />;
}
