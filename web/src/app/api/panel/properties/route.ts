import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Property } from "@/lib/types";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ mode: "local", properties: [] });
  }
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ mode: "local", properties: [] });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ mode: "supabase", properties: data ?? [] });
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

  const p = (await req.json()) as Property;
  if (!p?.code || !p?.slug || !p?.title) {
    return NextResponse.json({ error: "Código, slug y título son obligatorios" }, { status: 400 });
  }

  const row = {
    code: p.code,
    slug: p.slug,
    title: p.title,
    operation: p.operation,
    status: p.status,
    type: p.type,
    housing: p.housing ?? null,
    exclusive: Boolean(p.exclusive),
    country: p.country,
    province: p.province,
    city: p.city,
    zone: p.zone,
    price: p.price,
    price_from: Boolean(p.priceFrom),
    area_built: p.areaBuilt ?? null,
    area_land: p.areaLand ?? null,
    bedrooms: p.bedrooms ?? null,
    bathrooms: p.bathrooms ?? null,
    parking: p.parking ?? null,
    progress: p.progress ?? null,
    delivery: p.delivery ?? null,
    summary: p.summary,
    description: Array.isArray(p.description) ? p.description.join("\n\n") : p.description,
    youtube_url: p.videoThumb ?? null,
    video_url: p.videoUrl ?? null,
    photos: p.photos ?? [],
    gallery_autoplay_seconds:
      typeof p.galleryAutoplaySeconds === "number" && Number.isFinite(p.galleryAutoplaySeconds)
        ? Math.min(10, Math.max(0, Math.round(p.galleryAutoplaySeconds)))
        : 4,
    units: p.units ?? [],
    features: p.features ?? [],
    feature_groups: p.featureGroups ?? [],
    faqs: p.faqs ?? [],
    featured_hero: Boolean(p.slider),
    published: Boolean(p.published),
    sold_at: p.status === "vendida" ? (p.closedAt ?? new Date().toISOString()) : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("properties").upsert(row, { onConflict: "code" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, mode: "supabase" });
}
