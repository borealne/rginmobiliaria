import { publicProperties } from "@/lib/properties";
import type { Lang } from "@/lib/types";
import { FavoritesClient } from "./FavoritesClient";

export const metadata = {
  title: "Tus propiedades favoritas",
  description: "Lista de propiedades guardadas localmente en tu dispositivo sin crear cuenta.",
};

export default async function FavoritosPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const properties = publicProperties();
  return <FavoritesClient lang={lang} properties={properties} />;
}
