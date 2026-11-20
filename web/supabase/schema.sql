-- ==============================================================================
-- RG Inmobiliaria y Constructora — Esquema SQL y Políticas RLS (Supabase)
-- ==============================================================================

-- 1. Perfiles del equipo interno (vinculados a auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('super', 'asesor')) default 'asesor',
  job_title text,
  active boolean not null default true,
  round_robin_weight integer not null default 30,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
as $$
  select role from public.profiles where id = auth.uid() and active = true;
$$;

create policy "Equipo autenticado lee perfiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Solo super admin gestiona perfiles"
  on public.profiles for all
  to authenticated
  using (public.current_user_role() = 'super')
  with check (public.current_user_role() = 'super');

-- 2. Propiedades públicas (nunca incluye dirección exacta ni comisiones)
--    - code: identificador único por prefijo (CA-, DP-, SU-, TR-, LC-, PR-) con restricción UNIQUE
--    - photos (jsonb): [{ src, room, caption_es, caption_en, sub_es, sub_en, show_caption, icon, custom_icon }]
--    - feature_groups / features (jsonb): [{ title, title_en, icon, custom_icon, visible, items: [{ icon, custom_icon, label, label_en, detail, detail_en }] }]
create table if not exists public.properties (
  code text primary key unique,
  slug text not null unique,
  title text not null,
  operation text not null check (operation in ('venta', 'alquiler')),
  status text not null check (status in ('disponible', 'reservada', 'en-construccion', 'sobre-planos', 'vendida', 'alquilada')),
  type text not null check (type in ('casa', 'departamento', 'suite', 'terreno', 'edificio', 'local', 'oficina')),
  housing text check (housing is null or housing in ('VIP', 'VIS', 'vip', 'vis', 'ninguna')),
  exclusive boolean not null default false,
  country text not null default 'Ecuador',
  province text not null default 'Azuay',
  city text not null default 'Cuenca',
  zone text not null,
  price numeric(12,2) not null,
  price_from boolean not null default false,
  area_built numeric(10,2),
  area_land numeric(10,2),
  bedrooms integer,
  bathrooms integer,
  parking integer,
  progress integer,
  delivery text,
  summary text not null,
  description text not null,
  youtube_url text,
  video_url text,
  photos jsonb not null default '[]'::jsonb,
  gallery_autoplay_seconds integer not null default 4 check (gallery_autoplay_seconds between 0 and 10),
  units jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  feature_groups jsonb not null default '[]'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  featured_hero boolean not null default false,
  sold_at timestamptz,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.properties.photos is 'Arreglo JSONB de fotografías enriquecidas para Expanding Flex Cards: [{ src, room, captionEs/caption_es, captionEn/caption_en, subEs/sub_es, subEn/sub_en, showCaption/show_caption, icon, customIcon/custom_icon }]';
comment on column public.properties.feature_groups is 'Categorías dinámicas de Ficha Técnica (Interior, Exterior, Amenidades y seguridad, Servicios y eficiencia, etc.) con control de visibilidad (visible) e iconos personalizables (icon, customIcon)';

alter table public.properties enable row level security;

-- Regla 5: Propiedades vendidas se muestran 30 días y luego se ocultan de la web pública
create policy "Lectura pública de propiedades activas"
  on public.properties for select
  to anon
  using (
    published = true
    and (
      status <> 'vendida'
      or sold_at is null
      or sold_at >= now() - interval '30 days'
    )
  );

create policy "Equipo autenticado gestiona propiedades"
  on public.properties for all
  to authenticated
  using (public.current_user_role() in ('super', 'asesor'))
  with check (public.current_user_role() in ('super', 'asesor'));

-- 3. Datos privados de propiedades (solo equipo; nunca expuesto a anon)
create table if not exists public.property_private (
  property_code text primary key references public.properties(code) on delete cascade,
  kind text not null check (kind in ('exclusiva', 'compartida')) default 'compartida',
  expires date,
  shared_with text,
  advisor_id uuid references public.profiles(id),
  note text,
  exact_address text,
  fee text,
  updated_at timestamptz not null default now()
);

alter table public.property_private enable row level security;

create policy "Solo equipo autenticado accede a datos privados"
  on public.property_private for all
  to authenticated
  using (public.current_user_role() in ('super', 'asesor'))
  with check (public.current_user_role() in ('super', 'asesor'));

-- 4. Leads y Pipeline comercial
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  origin text not null check (origin in ('web-visita', 'web-formulario', 'web-propietario', 'web-asistente', 'web-busqueda', 'meta-ads', 'whatsapp', 'manual')),
  kind text not null check (kind in ('comprador', 'arrendatario', 'propietario')) default 'comprador',
  stage text not null default 'nuevo',
  name text not null,
  phone text not null,
  email text,
  property_code text references public.properties(code) on delete set null,
  advisor_id uuid references public.profiles(id) on delete set null,
  campaign text,
  source text,
  note text,
  notes jsonb not null default '[]'::jsonb,
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "Visitantes pueden enviar leads"
  on public.leads for insert
  to anon, authenticated
  with check (true);

create policy "Super admin ve y gestiona todos los leads"
  on public.leads for all
  to authenticated
  using (public.current_user_role() = 'super')
  with check (public.current_user_role() = 'super');

create policy "Asesor ve y actualiza solo sus leads asignados"
  on public.leads for select
  to authenticated
  using (public.current_user_role() = 'asesor' and advisor_id = auth.uid());

create policy "Asesor actualiza solo sus leads asignados"
  on public.leads for update
  to authenticated
  using (public.current_user_role() = 'asesor' and advisor_id = auth.uid())
  with check (public.current_user_role() = 'asesor' and advisor_id = auth.uid());

-- 5. Blog y Artículos
create table if not exists public.blog_posts (
  slug text primary key,
  category text not null,
  tag_es text not null,
  tag_en text not null,
  title_es text not null,
  title_en text not null,
  excerpt_es text not null,
  excerpt_en text not null,
  sections_es jsonb not null default '[]'::jsonb,
  sections_en jsonb not null default '[]'::jsonb,
  image_url text not null,
  author_name text not null,
  author_role_es text not null,
  author_role_en text not null,
  read_time_es text not null default '5 min de lectura',
  read_time_en text not null default '5 min read',
  status text not null check (status in ('Publicado', 'Borrador', 'Programado')) default 'Borrador',
  published_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

create policy "Lectura pública de artículos publicados"
  on public.blog_posts for select
  to anon
  using (status = 'Publicado' and (published_at is null or published_at <= now()));

create policy "Equipo gestiona artículos"
  on public.blog_posts for all
  to authenticated
  using (public.current_user_role() in ('super', 'asesor'))
  with check (public.current_user_role() in ('super', 'asesor'));

-- 6. Configuración del sitio (CMS B1) y Programas de Crédito (B3)
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "Lectura pública de configuración CMS"
  on public.site_settings for select
  to anon, authenticated
  using (key in ('hero', 'hero_config', 'hero_slides', 'counters', 'faqs', 'popup', 'site_sections', 'ai_chips', 'credit_programs'));

create policy "Solo super admin edita configuración"
  on public.site_settings for all
  to authenticated
  using (public.current_user_role() = 'super')
  with check (public.current_user_role() = 'super');

-- 6a. Bloques Modulares de Portada (Constructor de Secciones B1 · ES/EN · JSONB)
create table if not exists public.site_sections (
  id text primary key,
  sort_order integer not null default 1,
  section_type text not null check (section_type in ('services_grid', 'steps_timeline', 'cta_banner', 'editorial_split')),
  visible boolean not null default true,
  title_es text not null,
  title_en text not null,
  subtitle_es text,
  subtitle_en text,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.site_sections is 'Constructor modular de bloques de la portada pública debajo del catálogo fijo: services_grid, steps_timeline, cta_banner, editorial_split (ES/EN)';
comment on column public.site_sections.payload is 'Datos específicos del bloque en JSONB: cards, steps, bullets, cta, image y aboutData ({ missionEs/En, missionVisible, visionEs/En, visionVisible, extraParagraphs[], team[] }) compartido con /[lang]/quienes-somos';

alter table public.site_sections enable row level security;

create policy "Lectura pública de site_sections visibles"
  on public.site_sections for select
  to anon, authenticated
  using (visible = true);

create policy "Solo super admin gestiona site_sections"
  on public.site_sections for all
  to authenticated
  using (public.current_user_role() = 'super')
  with check (public.current_user_role() = 'super');

-- 6b. Slides del Carrusel Hero 3D (5 espacios bilingües ES/EN)
create table if not exists public.hero_slides (
  id text primary key,
  sort_order integer not null default 1,
  property_code text references public.properties(code) on delete set null,
  slug text not null,
  image_url text not null,
  operation text not null check (operation in ('venta', 'alquiler')),
  exclusive boolean not null default false,
  price text not null,
  title_es text not null,
  title_en text not null,
  zone_es text not null,
  zone_en text not null,
  summary_es text not null,
  summary_en text not null,
  active boolean not null default true,
  autoplay_enabled boolean not null default true,
  autoplay_seconds integer not null default 4 check (autoplay_seconds between 1 and 10),
  updated_at timestamptz not null default now()
);

alter table public.hero_slides enable row level security;

create policy "Lectura pública de hero_slides activos"
  on public.hero_slides for select
  to anon, authenticated
  using (active = true);

create policy "Solo super admin gestiona hero_slides"
  on public.hero_slides for all
  to authenticated
  using (public.current_user_role() = 'super')
  with check (public.current_user_role() = 'super');

-- 7. Analítica anónima de búsquedas con IA (sin PII, OWASP / Regla 10)
create table if not exists public.ai_search_logs (
  id uuid primary key default gen_random_uuid(),
  query_text text not null,
  parsed_filters jsonb not null default '{}'::jsonb,
  matched_count integer not null default 0,
  zone text,
  created_at timestamptz not null default now()
);

alter table public.ai_search_logs enable row level security;

create policy "Registro anónimo de consultas IA"
  on public.ai_search_logs for insert
  to anon, authenticated
  with check (true);

create policy "Solo super admin consulta analítica de demanda"
  on public.ai_search_logs for select
  to authenticated
  using (public.current_user_role() = 'super');

-- 8. Storage Bucket ('property-photos') y Políticas RLS sobre storage.objects
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-photos',
  'property-photos',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Lectura pública de fotos de propiedades y popups"
  on storage.objects for select
  to public
  using (bucket_id = 'property-photos');

create policy "Equipo autenticado sube fotos a property-photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'property-photos'
    and public.current_user_role() in ('super', 'asesor')
  );

create policy "Equipo autenticado actualiza fotos en property-photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'property-photos'
    and public.current_user_role() in ('super', 'asesor')
  )
  with check (
    bucket_id = 'property-photos'
    and public.current_user_role() in ('super', 'asesor')
  );

create policy "Equipo autenticado elimina fotos en property-photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'property-photos'
    and public.current_user_role() in ('super', 'asesor')
  );

