"use client";

import { useEffect, useState } from "react";
import { AboutInstitutionalBlock } from "@/components/site/AboutInstitutionalBlock";
import {
  getDefaultAboutSection,
  loadSiteSections,
  type SiteSectionBlock,
} from "@/lib/data/content";
import type { Lang } from "@/lib/types";

export function QuienesSomosClient({ lang }: { lang: Lang }) {
  // Inicialización determinista SSR === primer render cliente (cero Hydration Mismatch)
  const [aboutSec, setAboutSec] = useState<SiteSectionBlock>(() => getDefaultAboutSection());

  useEffect(() => {
    const sync = () => {
      const sections = loadSiteSections();
      const found =
        sections.find((s) => s.id === "sec-editorial-about") ??
        sections.find((s) => s.type === "editorial_split" && s.aboutData);
      if (found) {
        setAboutSec(found);
      } else {
        setAboutSec(getDefaultAboutSection());
      }
    };
    sync();
    window.addEventListener("rg-panel-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("rg-panel-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <div className="w-full min-h-[70vh] bg-[#F5F3EE]">
      <AboutInstitutionalBlock sec={aboutSec} lang={lang} asPageHero />
    </div>
  );
}
