-- ==============================================================================
-- RG Inmobiliaria y Constructora — Seed inicial de configuración CMS y Crédito
-- Ejecuta este archivo después de schema.sql en el SQL Editor de Supabase.
-- ==============================================================================

insert into public.site_settings (key, value)
values
  (
    'credit_programs',
    '[
      {"id": "vip", "name": "Crédito VIP / VIS", "rate": "4.99"},
      {"id": "biess", "name": "BIESS", "rate": "6.50"},
      {"id": "bank", "name": "Banca Privada", "rate": "8.95"}
    ]'::jsonb
  ),
  (
    'ai_chips',
    '[
      "Casa de 3 habitaciones en Ricaurte con patio y parqueadero",
      "Departamento cerca del tranvía o El Batán menor a $100.000",
      "Terreno con vista en Turi o Challuabamba para construir",
      "Suite amoblada en alquiler para ejecutivo en El Centro"
    ]'::jsonb
  ),
  (
    'counters',
    '[
      {"prefix": "+", "value": 120, "label": "propiedades gestionadas"},
      {"prefix": "+", "value": 14, "label": "años construyendo en Cuenca"},
      {"prefix": "", "value": 4, "label": "ciudades en Ecuador y EE. UU."},
      {"prefix": "", "value": 100, "label": "% verificación legal previa"}
    ]'::jsonb
  )
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into public.hero_slides (id, sort_order, property_code, slug, image_url, operation, exclusive, price, title_es, title_en, zone_es, zone_en, summary_es, summary_en, active)
values
  ('slide-1', 1, null, 'ca-001-casa-moderna-en-ricaurte', '/img/p/55.jpg', 'venta', true, '$145.000', 'Casa moderna en Ricaurte', 'Modern Home in Ricaurte', 'Cuenca · Ricaurte', 'Cuenca · Ricaurte', 'Residencia unifamiliar con jardín privado, terraza panorámica, 3 habitaciones y acabados de primera.', 'Single-family residence with private garden, panoramic terrace, 3 bedrooms and premium finishes.', true),
  ('slide-2', 2, null, 'dp-014-departamento-con-balcon-en-totoracocha', '/img/p/21.jpg', 'venta', false, '$98.500', 'Departamento con balcón en Totoracocha', 'Balcony Apartment in Totoracocha', 'Cuenca · Totoracocha', 'Cuenca · Totoracocha', 'Amplio departamento de 3 habitaciones, 92 m², balcón soleado y parqueadero cubierto.', 'Spacious 3-bedroom apartment, 92 m², sunlit balcony and covered parking.', true),
  ('slide-3', 3, null, 'dp-021-suite-amoblada-en-el-centro', '/img/p/28.jpg', 'alquiler', true, '$450 / mes', 'Suite amoblada en El Centro', 'Furnished Suite in Historic Center', 'Cuenca · El Centro Histórico', 'Cuenca · Historic Center', 'Suite ejecutiva totalmente equipada de 48 m², lista para habitar en zona patrimonial.', 'Fully equipped 48 m² executive suite, move-in ready in the heritage district.', true),
  ('slide-4', 4, null, 'te-007-terreno-con-vista-en-turi', '/img/p/29.jpg', 'venta', false, '$62.000', 'Terreno con vista en Turi', 'Scenic Lot in Turi', 'Cuenca · Turi', 'Cuenca · Turi', 'Lote de 400 m² con vista abierta a la ciudad, servicios básicos listos y fácil acceso.', '400 m² residential lot with panoramic city views, utilities ready and easy access.', true),
  ('slide-5', 5, null, 'ed-003-edificio-mirador', '/img/p/30.jpg', 'venta', true, 'Desde $89.000', 'Edificio Mirador · El Batán', 'Mirador Building · El Batán', 'Cuenca · El Batán', 'Cuenca · El Batán', 'Proyecto boutique en construcción (60%), 4 unidades con terrazas y entrega estimada junio 2027.', 'Boutique development under construction (60%), 4 units with terraces, est. delivery June 2027.', true)
on conflict (id) do update set
  sort_order = excluded.sort_order,
  slug = excluded.slug,
  image_url = excluded.image_url,
  operation = excluded.operation,
  exclusive = excluded.exclusive,
  price = excluded.price,
  title_es = excluded.title_es,
  title_en = excluded.title_en,
  zone_es = excluded.zone_es,
  zone_en = excluded.zone_en,
  summary_es = excluded.summary_es,
  summary_en = excluded.summary_en,
  active = excluded.active,
  updated_at = now();

insert into public.site_settings (key, value)
values (
  'hero_config',
  '{"autoplay_enabled": true, "autoplay_seconds": 4}'::jsonb
)
on conflict (key) do update set value = excluded.value, updated_at = now();

-- Nota para crear el primer Super Admin tras registrar el usuario en Supabase Auth:
-- insert into public.profiles (id, email, full_name, role, job_title, round_robin_weight)
-- values ('<AUTH_USER_UUID>', 'raul@rginmobiliaria.ec', 'Ec. Raúl García', 'super', 'Director General', 40);
