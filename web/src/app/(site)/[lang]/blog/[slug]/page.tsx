import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getBlogPost } from "@/lib/data/blog";
import { LANGS } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

export function generateStaticParams() {
  return LANGS.flatMap((lang) => BLOG_POSTS.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang; slug: string }> }) {
  const { lang, slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Artículo" };
  return { title: post.title[lang], description: post.excerpt[lang] };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ lang: Lang; slug: string }> }) {
  const { lang, slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <article className="bg-surface text-on-surface">
      {/* Breadcrumbs y cabecera */}
      <header className="border-b border-outline-variant bg-surface-container-low">
        <div className="max-w-5xl mx-auto px-gutter py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-label-sm text-on-surface-variant mb-6">
            <Link href={`/${lang}`} className="hover:text-on-surface inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">home</span>
              {lang === "en" ? "Home" : "Inicio"}
            </Link>
            <span>/</span>
            <Link href={`/${lang}/blog`} className="hover:text-on-surface">
              Blog
            </Link>
            <span>/</span>
            <span className="text-on-surface font-medium">{post.categoryLabel[lang]}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="h-[3px] w-7 bg-rg-red" aria-hidden="true" />
            <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">
              {post.categoryLabel[lang]}
            </span>
          </div>

          <h1 className="font-display text-display-xl text-on-surface leading-tight">{post.title[lang]}</h1>
          <p className="mt-4 text-body-lg text-on-surface-variant max-w-3xl">{post.excerpt[lang]}</p>

          <div className="mt-8 pt-6 border-t border-outline-variant flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-full bg-primary text-on-primary font-display font-bold text-label-md grid place-items-center">
                {post.authorInitials}
              </span>
              <div>
                <p className="text-body-md font-semibold text-on-surface inline-flex items-center gap-1.5">
                  {post.author}
                  <span className="material-symbols-outlined text-[16px] text-rg-gold" aria-hidden="true">
                    verified
                  </span>
                </p>
                <p className="text-label-sm text-on-surface-variant">
                  {post.authorRole[lang]} • {post.date[lang]}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-label-md text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant">
                <span className="material-symbols-outlined text-[16px]">timer</span>
                {post.readTime[lang]}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant">
                <span className="material-symbols-outlined text-[16px]">policy</span>
                {lang === "en" ? "RG Editorial Review" : "Revisión Legal RG"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Imagen principal + Cuerpo */}
      <div className="max-w-5xl mx-auto px-gutter py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <figure className="rounded-2xl overflow-hidden border border-outline-variant bg-surface-container-high">
            <div className="relative w-full aspect-[16/9]">
              <Image
                src={post.image}
                alt={post.title[lang]}
                fill
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
            <figcaption className="px-4 py-3 text-label-sm text-on-surface-variant bg-surface-container-lowest border-t border-outline-variant">
              {post.tagLabel[lang]} — RG Inmobiliaria & Constructora · Cuenca
            </figcaption>
          </figure>

          <div className="space-y-8">
            {post.sections[lang].map((sec, idx) => (
              <section key={idx} className="space-y-4">
                <h2 className="font-display text-headline-md text-on-surface">{sec.heading}</h2>
                {sec.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-body-lg text-on-surface-variant leading-relaxed">
                    {p}
                  </p>
                ))}
                {sec.bullets && (
                  <ul className="space-y-2.5 pl-1">
                    {sec.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-3 text-body-md text-on-surface">
                        <span className="w-2 h-2 rounded-full bg-rg-red mt-2 shrink-0" aria-hidden="true" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {sec.callout && (
                  <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5 flex items-start gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant shrink-0">info</span>
                    <p className="text-body-sm text-on-surface-variant">{sec.callout}</p>
                  </div>
                )}
              </section>
            ))}
          </div>

          <div className="pt-6 border-t border-outline-variant flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/${lang}/blog`}
              className="inline-flex items-center gap-2 text-label-md font-semibold text-primary hover:underline"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              {lang === "en" ? "Back to all articles" : "Volver al listado del blog"}
            </Link>
            <Link
              href={`/${lang}/preguntas-frecuentes`}
              className="inline-flex items-center gap-2 text-label-md font-semibold text-on-surface-variant hover:text-on-surface"
            >
              {lang === "en" ? "Frequently asked questions" : "Preguntas frecuentes"}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Barra lateral */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl bg-primary text-on-primary p-6 space-y-4 sticky top-24">
            <span className="text-label-sm uppercase tracking-widest text-rg-gold font-semibold">
              {lang === "en" ? "RG Advisory" : "Asesoría RG"}
            </span>
            <h3 className="font-display text-title-md">
              {lang === "en" ? "Looking for qualified properties in Cuenca?" : "¿Buscas propiedades calificadas en Cuenca?"}
            </h3>
            <p className="text-body-sm text-on-primary/80">
              {lang === "en"
                ? "Browse our verified catalog or ask for a tailored visit with our technical team."
                : "Explora nuestro portafolio verificado o agenda una visita guiada con nuestro equipo técnico."}
            </p>
            <div className="flex flex-col gap-2.5 pt-2">
              <Link
                href={`/${lang}/propiedades`}
                className="w-full text-center px-4 py-2.5 rounded-xl bg-on-primary text-primary text-label-md font-semibold hover:bg-on-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-primary transition-all motion-reduce:transition-none"
              >
                {lang === "en" ? "View properties" : "Ver propiedades"}
              </Link>
              <Link
                href={`/${lang}/vende-o-alquila`}
                className="w-full text-center px-4 py-2.5 rounded-xl border border-on-primary/30 text-on-primary text-label-md font-semibold hover:bg-on-primary/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-primary transition-all motion-reduce:transition-none"
              >
                {lang === "en" ? "Sell or rent with RG" : "Vende o alquila con RG"}
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Artículos relacionados */}
      <section className="border-t border-outline-variant bg-surface-container-low py-12">
        <div className="max-w-5xl mx-auto px-gutter">
          <h2 className="font-display text-headline-sm text-on-surface mb-6">
            {lang === "en" ? "Related reading" : "También te puede interesar"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/${lang}/blog/${item.slug}`}
                className="group rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-primary/40 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0 flex flex-col justify-between gap-3"
              >
                <div>
                  <span className="text-label-sm text-on-surface-variant">{item.tagLabel[lang]}</span>
                  <h3 className="font-display text-title-md text-on-surface mt-1 leading-snug group-hover:text-primary transition-colors">
                    {item.title[lang]}
                  </h3>
                </div>
                <span className="text-label-md font-semibold text-primary inline-flex items-center gap-1">
                  {lang === "en" ? "Read" : "Leer artículo"}
                  <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:translate-x-0.5">arrow_forward</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
