"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/panel/Shell";
import { usePanel } from "@/components/panel/PanelProvider";
import { Card, PField, Segmented, pInput } from "@/components/panel/ui";
import { CloseButton, Modal } from "@/components/ui/Modal";
import { BLOG_CATEGORIES, BLOG_POSTS, type BlogPost } from "@/lib/data/blog";

const BLOG_STORAGE_KEY = "rg_blog_posts_v1";

function categoryBadgeStyle(category: BlogPost["category"]): string {
  if (category === "credito") {
    return "bg-[#D9381E]/10 text-[#D9381E] border border-[#D9381E]/25";
  }
  if (category === "arquitectura") {
    return "bg-[#141414] text-[#F5F3EE] border border-[#141414]";
  }
  return "bg-amber-900/10 text-amber-900 border border-amber-900/25";
}

interface PanelArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogPost["category"];
  categoryLabel: string;
  author: string;
  authorRole: string;
  date: string;
  status: "Publicado" | "Borrador";
  reads: number;
  metaDesc: string;
  body: string;
}

type ModalTab = "content" | "seo" | "publish";

export default function PanelBlogPage() {
  const { toast } = usePanel();
  const [articles, setArticles] = useState<PanelArticle[]>(() =>
    BLOG_POSTS.map((p, idx) => ({
      slug: p.slug,
      title: p.title.es,
      excerpt: p.excerpt.es,
      category: p.category,
      categoryLabel: p.categoryLabel.es,
      author: p.author,
      authorRole: p.authorRole.es,
      date: p.date.es,
      status: idx === 5 ? "Borrador" : "Publicado",
      reads: 420 - idx * 45,
      metaDesc: p.excerpt.es.slice(0, 155),
      body: p.sections.es.flatMap((s) => [s.heading, ...s.paragraphs]).join("\n\n"),
    })),
  );

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<ModalTab>("content");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<PanelArticle>({
    slug: "",
    title: "",
    excerpt: "",
    category: "credito",
    categoryLabel: "Guías de Compra & Crédito VIP",
    author: "Ec. Raúl García",
    authorRole: "Director General · Super admin",
    date: "Hoy",
    status: "Borrador",
    reads: 0,
    metaDesc: "",
    body: "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BLOG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setArticles(parsed);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!q) return true;
      return a.title.toLowerCase().includes(q) || a.author.toLowerCase().includes(q);
    });
  }, [articles, query, statusFilter]);

  const openNew = () => {
    setEditingSlug(null);
    setModalTab("content");
    setDraft({
      slug: "nuevo-articulo-rg-2026",
      title: "",
      excerpt: "",
      category: "credito",
      categoryLabel: "Guías de Compra & Crédito VIP",
      author: "Ec. Raúl García",
      authorRole: "Director General · Super admin",
      date: "Hoy",
      status: "Borrador",
      reads: 0,
      metaDesc: "",
      body: "",
    });
    setModalOpen(true);
  };

  const openEdit = (article: PanelArticle) => {
    setEditingSlug(article.slug);
    setModalTab("content");
    setDraft({ ...article });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!draft.title.trim()) {
      toast("Ingresa un título para el artículo");
      return;
    }
    const cleanSlug =
      draft.slug.trim() ||
      draft.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const cat = BLOG_CATEGORIES.find((c) => c.id === draft.category);
    const updated: PanelArticle = {
      ...draft,
      slug: cleanSlug,
      categoryLabel: cat ? cat.label.es : draft.categoryLabel,
    };

    setArticles((prev) => {
      const next = editingSlug ? prev.map((a) => (a.slug === editingSlug ? updated : a)) : [updated, ...prev];
      try {
        localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event("rg-panel-updated"));
      } catch {
        /* ignore */
      }
      return next;
    });
    setModalOpen(false);
    fetch("/api/panel/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch(() => {});
    toast(editingSlug ? "Artículo actualizado" : "Artículo guardado en el catálogo del blog");
  };

  const publishedCount = articles.filter((a) => a.status === "Publicado").length;
  const totalReads = articles.reduce((sum, a) => sum + a.reads, 0);

  return (
    <div>
      <PageHeader
        crumbs={["Panel", "Blog", "Artículos y publicaciones"]}
        title="Artículos del Blog y Publicaciones"
        text="Administra artículos educativos sobre crédito VIP, guías de compra en Cuenca y avances de obra de la constructora."
        actions={
          <button
            type="button"
            onClick={openNew}
            className="h-10 px-4 rounded-xl bg-primary text-on-primary text-label-md font-semibold inline-flex items-center gap-1.5 hover:bg-primary/90 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all motion-reduce:transition-none"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Redactar nuevo artículo
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Lecturas del Mes", value: totalReads.toLocaleString("es-EC"), icon: "trending_up" },
          { label: "Publicados", value: String(publishedCount), icon: "article" },
          { label: "Borradores", value: String(articles.length - publishedCount), icon: "edit_note" },
          { label: "Lectura Promedio", value: "5.4 min", icon: "schedule" },
        ].map((kpi) => (
          <div key={kpi.label} className="group rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-primary/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
            <div className="flex items-center justify-between text-on-surface-variant mb-2">
              <span className="text-label-sm uppercase tracking-wider font-semibold">{kpi.label}</span>
              <span className="w-8 h-8 rounded-lg bg-surface-container text-primary flex items-center justify-center transition-colors duration-300 group-hover:bg-primary group-hover:text-on-primary motion-reduce:transition-none">
                <span className="material-symbols-outlined text-[18px]">{kpi.icon}</span>
              </span>
            </div>
            <p className="font-display text-headline-md text-on-surface transition-colors duration-300 group-hover:text-rg-red motion-reduce:transition-none">{kpi.value}</p>
          </div>
        ))}
      </div>

      <Card
        icon="article"
        title="Listado de Publicaciones"
        subtitle={`${filtered.length} artículos visibles`}
        aside={
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar título o autor..."
              className={`${pInput} w-full sm:w-52`}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtrar por estado"
              className={`${pInput} w-full sm:w-40`}
            >
              <option value="all">Todos los estados</option>
              <option value="Publicado">Publicado</option>
              <option value="Borrador">Borrador</option>
            </select>
          </div>
        }
      >
        <div className="overflow-x-auto rounded-xl border border-[#141414]/10">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="bg-[#141414]/[0.04] border-b-2 border-[#141414]/15 text-label-sm uppercase tracking-wider font-bold text-[#141414]">
                <th className="py-3.5 px-4">Artículo</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Autor</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Lecturas</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/10">
              {filtered.map((a) => (
                <tr key={a.slug} className="odd:bg-white even:bg-[#F5F3EE]/60 hover:bg-[#F5F3EE] transition-colors duration-200">
                  <td className="py-4 px-4 max-w-md">
                    <p className="font-semibold text-[#141414]">{a.title}</p>
                    <p className="text-label-sm text-on-surface-variant line-clamp-1 mt-0.5">{a.excerpt}</p>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-label-sm font-semibold hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 ${categoryBadgeStyle(a.category)}`}>
                      {a.categoryLabel}
                    </span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap font-medium text-[#141414]">{a.author}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-label-sm font-semibold hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 ${
                        a.status === "Publicado"
                          ? "bg-st-available/15 text-st-available border border-st-available/25"
                          : "bg-surface-container-high text-on-surface-variant border border-outline-variant"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap font-mono font-semibold text-[#141414]">{a.reads}</td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/es/blog/${a.slug}`}
                        target="_blank"
                        className="px-2.5 py-1.5 rounded-lg border border-outline-variant bg-white text-label-sm font-medium hover:border-[#141414] transition-colors"
                      >
                        Ver
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEdit(a)}
                        className="px-3 py-1.5 rounded-lg bg-[#141414] text-[#F5F3EE] text-label-sm font-semibold hover:bg-[#D9381E] transition-colors cursor-pointer active:scale-[0.98]"
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} labelledBy="blog-modal-title" className="max-w-[760px]">
        <div className="p-6 md:p-7 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="blog-modal-title" className="font-display text-headline-sm text-on-surface">
                {editingSlug ? "Editar artículo" : "Redactar nuevo artículo"}
              </h2>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Contenido editorial, ajustes SEO y atribución institucional.
              </p>
            </div>
            <CloseButton onClick={() => setModalOpen(false)} />
          </div>

          <Segmented
            label="Secciones del editor de artículo"
            value={modalTab}
            onChange={(v) => setModalTab(v)}
            options={[
              { v: "content", l: "Contenido (B2.1)" },
              { v: "seo", l: "SEO & Enlaces (B2.2)" },
              { v: "publish", l: "Publicación & Atribución (B2.3)" },
            ]}
          />

          {modalTab === "content" && (
            <div className="space-y-4">
              <PField label="Título del artículo">
                {(id) => (
                  <input
                    id={id}
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="Ej. Guía para acceder al crédito VIP 4.99% en Cuenca"
                    className={pInput}
                  />
                )}
              </PField>
              <PField label="Categoría">
                {(id) => (
                  <select
                    id={id}
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value as BlogPost["category"] })}
                    className={pInput}
                  >
                    {BLOG_CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label.es}
                      </option>
                    ))}
                  </select>
                )}
              </PField>
              <PField label="Extracto / Bajada">
                {(id) => (
                  <textarea
                    id={id}
                    rows={2}
                    value={draft.excerpt}
                    onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                    className={`${pInput} h-auto py-2`}
                  />
                )}
              </PField>
              <PField label="Cuerpo del artículo">
                {(id) => (
                  <textarea
                    id={id}
                    rows={5}
                    value={draft.body}
                    onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                    className={`${pInput} h-auto py-2`}
                  />
                )}
              </PField>
            </div>
          )}

          {modalTab === "seo" && (
            <div className="space-y-4">
              <PField label="Slug URL (/es/blog/...)">
                {(id) => (
                  <input
                    id={id}
                    value={draft.slug}
                    onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                    className={`${pInput} font-mono`}
                  />
                )}
              </PField>
              <PField label="Meta descripción (máx. 160 caracteres)">
                {(id) => (
                  <textarea
                    id={id}
                    rows={3}
                    maxLength={160}
                    value={draft.metaDesc}
                    onChange={(e) => setDraft({ ...draft, metaDesc: e.target.value })}
                    className={`${pInput} h-auto py-2`}
                  />
                )}
              </PField>
            </div>
          )}

          {modalTab === "publish" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PField label="Autor">
                {(id) => (
                  <input
                    id={id}
                    value={draft.author}
                    onChange={(e) => setDraft({ ...draft, author: e.target.value })}
                    className={pInput}
                  />
                )}
              </PField>
              <PField label="Cargo / Atribución">
                {(id) => (
                  <input
                    id={id}
                    value={draft.authorRole}
                    onChange={(e) => setDraft({ ...draft, authorRole: e.target.value })}
                    className={pInput}
                  />
                )}
              </PField>
              <PField label="Estado de publicación">
                {(id) => (
                  <select
                    id={id}
                    value={draft.status}
                    onChange={(e) => setDraft({ ...draft, status: e.target.value as "Publicado" | "Borrador" })}
                    className={pInput}
                  >
                    <option value="Publicado">Publicado</option>
                    <option value="Borrador">Borrador</option>
                  </select>
                )}
              </PField>
              <PField label="Fecha visible">
                {(id) => (
                  <input
                    id={id}
                    value={draft.date}
                    onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                    className={pInput}
                  />
                )}
              </PField>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="h-10 px-4 rounded-xl border border-outline-variant text-label-md font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-10 px-5 rounded-xl bg-primary text-on-primary text-label-md font-semibold cursor-pointer"
            >
              Guardar artículo
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
