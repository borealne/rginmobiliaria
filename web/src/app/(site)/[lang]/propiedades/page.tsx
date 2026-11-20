import type { Metadata } from "next";
import { Suspense } from "react";
import { Results } from "@/components/site/results/Results";
import type { Lang } from "@/lib/types";

export const metadata: Metadata = { title: "Propiedades en Cuenca" };

export default async function PropertiesPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <Results lang={lang} />
    </Suspense>
  );
}
