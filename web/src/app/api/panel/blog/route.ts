import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ mode: "local", posts: [] });
  }
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ mode: "local", posts: [] });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ mode: "supabase", posts: data ?? [] });
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mode: "local" });
  }
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ ok: true, mode: "local" });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = (await req.json()) as {
    slug: string;
    category: string;
    categoryLabel?: string;
    title: string;
    excerpt: string;
    body?: string;
    author: string;
    authorRole: string;
    status: "Publicado" | "Borrador" | "Programado";
  };

  if (!body.slug || !body.title) {
    return NextResponse.json({ error: "Slug y título son obligatorios" }, { status: 400 });
  }

  const { error } = await supabase.from("blog_posts").upsert(
    {
      slug: body.slug,
      category: body.category || "credito",
      tag_es: body.categoryLabel || "Guías RG",
      tag_en: body.categoryLabel || "RG Guides",
      title_es: body.title,
      title_en: body.title,
      excerpt_es: body.excerpt || "",
      excerpt_en: body.excerpt || "",
      sections_es: body.body ? [{ heading: body.title, paragraphs: body.body.split("\n\n") }] : [],
      sections_en: body.body ? [{ heading: body.title, paragraphs: body.body.split("\n\n") }] : [],
      image_url: "/img/p/01.jpg",
      author_name: body.author || "Equipo RG",
      author_role_es: body.authorRole || "Asesoría RG",
      author_role_en: body.authorRole || "RG Advisory",
      status: body.status || "Borrador",
      published_at: body.status === "Publicado" ? new Date().toISOString() : null,
    },
    { onConflict: "slug" },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, mode: "supabase" });
}
