"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BLOG_CATEGORIES, BLOG_POSTS, type BlogPost } from "@/lib/data/blog";
import type { Lang } from "@/lib/types";

export function BlogCatalogClient({ lang }: { lang: Lang }) {
  const [category, setCategory] = useState<"all" | BlogPost["category"]>("all");
  const [query, setQuery] = useState("");

  const featured = BLOG_POSTS.find((p) => p.featured) ?? BLOG_POSTS[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BLOG_POSTS.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      return (
        p.title[lang].toLowerCase().includes(q) ||
        p.excerpt[lang].toLowerCase().includes(q) ||
        p.tagLabel[lang].toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)
      );
    });
  }, [category, query, lang]);

  return (
    <div className="bg-surface text-on-surface">
      {/* Encabezado editorial */}
      <section className="border-b border-outline-variant bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-gutter py-12 md:py-16">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="h-[3px] w-8 bg-rg-red" aria-hidden="true" />
            <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">
              {lang === "en" ? "Knowledge & Insights · 2026 Edition" : "Centro de Conocimiento & Perspectivas · Edición 2026"}
            </span>
          </div>
          <h1 className="font-display text-display-xl text-on-surface max-w-3xl">
            {lang === "en" ? "Blog & Real Estate Trends" : "Blog & Tendencias Inmobiliarias"}
          </h1>
          <p className="mt-4 text-body-lg text-on-surface-variant max-w-2xl">
            {lang === "en"
              ? "Market analysis, patrimonial investment insights, bioclimatic architecture, and legal guides for buying and building in Cuenca."
              : "Análisis de mercado, consejos de inversión patrimonial, arquitectura bioclimática y guías legales para comprar y construir en Cuenca y el Austro ecuatoriano."}
          </p>

          {/* Filtros + Búsqueda */}
          <div className="mt-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label={lang === "en" ? "Categories" : "Categorías"}>
              {BLOG_CATEGORIES.map((c) => {
                const active = category === c.id;
                const count = c.id === "all" ? BLOG_POSTS.length : BLOG_POSTS.filter((p) => p.category === c.id).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCategory(c.id)}
                    className={`px-4 py-2 rounded-full text-label-md font-medium transition-all duration-200 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none ${
                      active
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container-lowest border border-outline-variant text-on-surface hover:border-primary"
                    }`}
                  >
                    {c.label[lang]} ({count})
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:w-72">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                search
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={lang === "en" ? "Search articles..." : "Buscar artículos..."}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-lowest border border-outline-variant text-body-md focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-gutter py-10 md:py-14 space-y-12">
        {/* Artículo destacado (solo cuando no hay búsqueda ni filtro específico) */}
        {category === "all" && !query.trim() && featured && (
          <article className="group grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden border border-outline-variant bg-surface-container-lowest shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-primary/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
            <div className="lg:col-span-6 relative min-h-[260px] lg:min-h-[380px] bg-surface-container-high">
              <Image
                src={featured.image}
                alt={featured.title[lang]}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-primary text-rg-gold text-label-sm font-bold uppercase tracking-wider">
                  {lang === "en" ? "Featured" : "Destacado"}
                </span>
                <span className="px-3 py-1 rounded-full bg-surface/95 text-on-surface text-label-sm font-semibold">
                  {featured.tagLabel[lang]}
                </span>
              </div>
            </div>

            <div className="lg:col-span-6 p-6 md:p-10 flex flex-col justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-3 text-label-md text-on-surface-variant mb-3">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    {featured.date[lang]}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    {featured.readTime[lang]}
                  </span>
                </div>

                <h2 className="font-display text-headline-lg text-on-surface leading-tight">
                  <Link href={`/${lang}/blog/${featured.slug}`} className="hover:underline">
                    {featured.title[lang]}
                  </Link>
                </h2>
                <p className="mt-3 text-body-md text-on-surface-variant">{featured.excerpt[lang]}</p>

                {featured.highlightStat && (
                  <div className="mt-5 p-4 rounded-xl bg-surface-container-low border border-outline-variant flex items-center justify-between gap-4">
                    <div>
                      <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                        {featured.highlightStat.label[lang]}
                      </p>
                      <p className="font-display text-title-md text-on-surface mt-0.5">
                        {featured.highlightStat.value[lang]}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-rg-red text-[28px]">trending_down</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-outline-variant">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-primary text-on-primary font-display font-bold text-label-md grid place-items-center">
                    {featured.authorInitials}
                  </span>
                  <div>
                    <p className="text-body-md font-semibold text-on-surface">{featured.author}</p>
                    <p className="text-label-sm text-on-surface-variant">{featured.authorRole[lang]}</p>
                  </div>
                </div>
                <Link
                  href={`/${lang}/blog/${featured.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-label-md font-semibold hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all motion-reduce:transition-none"
                >
                  {lang === "en" ? "Read full article" : "Leer artículo completo"}
                  <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-0.5">arrow_forward</span>
                </Link>
              </div>
            </div>
          </article>
        )}

        {/* Listado de artículos */}
        <div>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">
                {lang === "en" ? "Chronicles & Analysis" : "Crónicas & Análisis"}
              </p>
              <h2 className="font-display text-headline-md text-on-surface mt-1">
                {lang === "en" ? "Recent Articles" : "Artículos Recientes"}
              </h2>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              {lang === "en"
                ? `Showing ${filtered.length} of ${BLOG_POSTS.length} articles`
                : `Mostrando ${filtered.length} de ${BLOG_POSTS.length} publicaciones`}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-10 text-center">
              <p className="font-display text-title-md text-on-surface">
                {lang === "en" ? "No articles match your search" : "No encontramos artículos con ese filtro"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setCategory("all");
                  setQuery("");
                }}
                className="mt-4 px-4 py-2 rounded-xl border border-outline-variant text-label-md font-semibold hover:border-primary cursor-pointer"
              >
                {lang === "en" ? "Reset filters" : "Ver todos los artículos"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <article
                  key={post.slug}
                  className="group rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-primary/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <div>
                    <Link href={`/${lang}/blog/${post.slug}`} className="block relative aspect-[16/10] bg-surface-container-high overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title[lang]}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-surface/95 text-on-surface text-label-sm font-semibold">
                        {post.tagLabel[lang]}
                      </span>
                    </Link>

                    <div className="p-5">
                      <div className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-2">
                        <span>{post.date[lang]}</span>
                        <span>•</span>
                        <span>{post.readTime[lang]}</span>
                      </div>
                      <h3 className="font-display text-title-md text-on-surface leading-snug">
                        <Link href={`/${lang}/blog/${post.slug}`} className="hover:underline">
                          {post.title[lang]}
                        </Link>
                      </h3>
                      <p className="mt-2.5 text-body-sm text-on-surface-variant line-clamp-3">
                        {post.excerpt[lang]}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-4 border-t border-outline-variant flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface font-display font-bold text-label-sm grid place-items-center shrink-0 transition-colors duration-300 group-hover:bg-primary group-hover:text-on-primary motion-reduce:transition-none">
                        {post.authorInitials}
                      </span>
                      <span className="text-label-md font-medium text-on-surface truncate">{post.author}</span>
                    </div>
                    <Link
                      href={`/${lang}/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-label-md font-semibold text-primary hover:underline shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                    >
                      {lang === "en" ? "Read more" : "Leer más"}
                      <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:translate-x-0.5">arrow_forward</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Banner informativo inferior */}
        <section className="rounded-2xl bg-primary text-on-primary p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-label-sm uppercase tracking-widest text-rg-gold font-semibold">
              {lang === "en" ? "Direct Advisory" : "Asesoría Directa RG"}
            </span>
            <h2 className="font-display text-headline-md mt-2">
              {lang === "en"
                ? "Questions about VIP credit, pre-construction or Cuenca zones?"
                : "¿Tienes dudas sobre crédito VIP, preventa o sectores de Cuenca?"}
            </h2>
            <p className="mt-2 text-body-md text-on-primary/80">
              {lang === "en"
                ? "Explore our verified FAQ center or schedule a private consultation with an RG advisor."
                : "Consulta nuestras respuestas verificadas o agenda una asesoría personalizada sin compromiso."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href={`/${lang}/preguntas-frecuentes`}
              className="px-5 py-3 rounded-xl bg-on-primary text-primary text-label-md font-semibold hover:bg-on-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-primary transition-all motion-reduce:transition-none"
            >
              {lang === "en" ? "View FAQ" : "Ver preguntas frecuentes"}
            </Link>
            <Link
              href={`/${lang}/propiedades`}
              className="px-5 py-3 rounded-xl border border-on-primary/30 text-on-primary text-label-md font-semibold hover:bg-on-primary/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-primary transition-all motion-reduce:transition-none"
            >
              {lang === "en" ? "Explore properties" : "Explorar propiedades"}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
