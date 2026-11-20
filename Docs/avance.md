# Avance del Proyecto · RG Inmobiliaria y Constructora

**Fecha de actualización:** 15 de noviembre de 2026  
**Estado de verificación técnica:** `npx tsc --noEmit` y `npm run lint` con **0 errores** y **0 advertencias**.

---

## 1. Pantallas integradas desde Google Stitch (`web/src/app/`)

### Sitio público (`(site)/[lang]/`)
- **Portada (`/[lang]`)**: Hero rediseñado *above the fold* (`100vh`) con escenario Negro Tinta (`#141414`), textura arquitectónica y resplandor radial, carrusel **Coverflow 3D de 5 slides** (`COVERFLOW_CONFIG`, 60 FPS en `transform`/`opacity`, arrastre con mouse > 8px, autoplay configurable 1–10s con pausa/reinicio y `prefers-reduced-motion` + carrusel táctil *peek* en móvil 390 px + modal expandido accesible WCAG) y buscador inferior flotante (`#F5F3EE`, `shadow-2xl`) con IA y filtros; secciones de servicios, zonas, Quiénes somos, próximos proyectos, contadores, testimonios, preguntas frecuentes y popup informativo.
- **Catálogo y resultados (`/[lang]/propiedades`)**: Búsqueda con IA y filtros, tarjetas de propiedades y propiedades parecidas cuando no hay coincidencia exacta.
- **Ficha de propiedad (`/[lang]/propiedades/[slug]`) y ficha imprimible (`/[lang]/propiedades/[slug]/ficha`)**: Galería interactiva **"Expanding Flex Cards"** (`ExpandingPhotoGallery.tsx`, acordeón horizontal en escritorio con transición `cubic-bezier(0.05, 0.61, 0.41, 0.95)` y acordeón vertical calibrado en móvil `390px` sin desborde, círculo blanco de `40px` con icono personalizable o SVG/PNG propio, y control por ojito `showCaption` para mostrar/ocultar texto y sombra oscura), bloque **«Características y detalles»** (`FeatureTabs`) sincronizado con categorías e iconos dinámicos bilingües (`ES`/`EN`), datos técnicos, reproductor de video 16:9, simulador de crédito referencial, FAQs y mapa aproximado de zona (sin direcciones exactas).
- **Propietarios (`/[lang]/vende-o-alquila`)**: Formulario simple de captación conectado a `/api/leads`.
- **Blog público (`/[lang]/blog` y `/[lang]/blog/[slug]`)**: Listado con filtro por categoría y buscador, artículo destacado, vista editorial completa con `next/image` optimizado y datos bilingües (`es`/`en`) en `web/src/lib/data/blog.ts`.
- **Preguntas frecuentes (`/[lang]/preguntas-frecuentes`)**: Buscador, filtros por categoría y acordeón accesible reutilizando `Accordion.tsx`.
- **Legal (`/[lang]/legal/[doc]`)**: Política de privacidad (`privacidad`), Términos y condiciones (`terminos`) y Transparencia (`transparencia`) conforme a LODP y reglas de privacidad RG.
- **Favoritos locales (`/[lang]/favoritos`)**: Lista persistida en `localStorage` sin cuentas de usuario, reutilizando `PropertyCard` y `useVisit()`.

### Panel interno (`(panel)/panel/`)
- **Identidad y Navegación Global (`Shell.tsx` y `PanelProvider.tsx`)**:
  - Super Admin oficial unificado en todo el sistema como **`Ec. Raúl García`** (iniciales `RG`, rol `Super admin`).
  - Cero enlaces hacia `/panel` o `/panel/login` en el sitio público (`Header.tsx` y `Footer.tsx`).
  - **Buscador global instantáneo** en el encabezado del panel (*"Buscar propiedades, contactos, códigos…"*), con desplegable en vivo para abrir cualquier propiedad o el modal de detalle de un contacto.
  - Selector `"Ver como (prueba)"` oculto automáticamente cuando `isSupabaseConfigured()` es `true`.
  - Microinteracciones unificadas en las 5 secciones (elevación `hover:-translate-y-1`, sombra sutil, número principal en rojo `#D9381E` e ícono superior derecho en `#141414` con texto blanco).
- **Login y recuperación (`/panel/login`, `/panel/recuperar`)**: Vistas sin barra lateral, conectadas a Supabase Auth cuando las variables están configuradas (y modo local mientras no hay `.env.local`).
- **1. Propiedades (`/panel/propiedades` y `/panel/propiedades/[code]`)**:
  - KPIs interactivos con límite sincronizado de **5 propiedades en el Slider de Inicio** (*"Máximo 5 propiedades. Se eligen en la tabla."*).
  - Signifiers visuales en etiquetas de tabla (*Disponible*, *Reservada*, *Vendida*, *★ Exclusiva RG*, *Compartida*, *Borrador*).
  - **Pestaña "1. Datos principales" — Códigos Únicos Configurables (`MainData.tsx`)**: Autogeneración inteligente por prefijo según tipo de propiedad (`CA-`, `DP-`, `SU-`, `TR-`, `LC-`, `PR-`), botón **«Generar automático»**, edición manual normalizada a mayúsculas y validación en vivo contra inventario e historial (`rg_used_property_codes_v1`), bloqueando códigos repetidos (`✕ Este código ya fue utilizado y está bloqueado`) y deshabilitando el guardado ante duplicados.
  - **Pestaña "2. Ficha técnica y fotos" — Ficha Técnica Dinámica + Galería Editable (`TechAndPhotos.tsx`)**:
    - Precarga de las 4 categorías base (*1. Interior*, *2. Exterior*, *3. Amenidades y seguridad*, *4. Servicios y eficiencia*), ojito de visibilidad pública por categoría (`visible`), creación de categorías personalizadas y selector de iconos técnicos/inmobiliarios + subida de icono propio (`SVG`/`PNG` en DataURL) con soporte bilingüe (`ES`/`EN`).
    - En **«Fotos y planos»** (`Foto 1` a `Foto 10`): vista previa en vivo del círculo blanco de `40px` (`#FFFFFF` / `#141414`), selector de icono de ambiente o subida de `SVG`/`PNG` propio, campos bilingües de **«Título / Pie de foto»** y **«Subtítulo breve»**, y botón de **Ojito (`showCaption`)** para alternar entre *Texto visible* y *Foto limpia*.
  - **Pestaña "3. Video" Multi-Plataforma Horizontal (`16:9`)**: Soporta **YouTube** (`watch`, `youtu.be`, `shorts`), **Vimeo**, **TikTok** y archivos directos **`.mp4`** (`web/src/lib/video.ts`), con validación en tiempo real, cuadro de vista previa en vivo (`16:9`), botón para quitar video y sincronización inmediata con `VideoBlock` en la ficha pública (`/[lang]/propiedades/[slug]`).
- **2. Contenido Web y Asistente de IA (`/panel/contenido`)**:
  - Gestión de Carrusel Hero 3D (**5 slides bilingües ES/EN** y control de autoplay de 1 a 10 s), contadores y preguntas frecuentes.
  - **Módulo de Carga de Imagen en "4. Ventanas Emergentes (Popups)"**: Subida y reemplazo de imagen (`JPG/PNG/WEBP`, máx. `5 MB`) hacia `/api/panel/upload` con respaldo local en `localStorage` (`rg_popup_cms_v1`), vista previa en vivo, botón de restaurar/quitar y sincronización en tiempo real con `Popup.tsx`.
- **3. Blog (`/panel/blog`)**:
  - Tabla de alta escaneabilidad con *zebra striping* cálido (`odd:bg-white even:bg-[#F5F3EE]/60`), encabezado estructurado y píldoras de categoría con identidad visual propia (*Guías de Compra & Crédito VIP*, *Arquitectura & Obras*, *Inversión & Mercado*).
- **4. Contactos y Pipeline (`/panel/pipeline`)**:
  - 4 KPIs superiores unificados con ícono y microinteracción, más transición escalonada (*staggered fade-in*) entre vistas **«Tablero»** y **«Lista»**.
  - **Modal de Detalle del Contacto (*Progressive Disclosure*) + Bitácora de Seguimiento**: Al hacer clic en cualquier tarjeta o fila se abre el modal accesible (`Esc`, `X`, clic exterior) con toda la información del prospecto y una **Bitácora y Seguimientos** interactiva para registrar notas con fecha, hora y autor automático (`Ec. Raúl García`), persistidas en `localStorage` (`rg-panel-leads`).
- **5. Configuración (`/panel/configuracion`)**:
  - Exclusivo para `role === "super"` (**`Ec. Raúl García`**).
  - **Credenciales e IDs en Integraciones (`A8`)**: Campos persistentes para **Meta Business / Meta Ads** (*Pixel ID*, *Access Token* enmascarado con mostrar/ocultar, *Ad Account ID*), **Google Ads** (*Conversion ID AW-*, *Conversion Label*) y **TikTok Ads** (*TikTok Pixel ID*, *Events API Token* enmascarado).
  - **Buscar con IA & Demanda Insatisfecha (`A6`)**: Explicación de negocio para captación, métricas por zona y presupuesto promedio, y exportación directa en **CSV** y **JSON**.
  - **Gestión de Equipo (`B3`)**: **`Ec. Raúl García`** protegido como Super admin principal, modal **`+ Agregar colaborador`**, acciones por fila para **Suspender / Reactivar acceso** y **Eliminar colaborador**, y programas/tasas de crédito.

---

## 2. Ajustes de UI, navegación, responsividad móvil (390 px) y regla del panel

- **Navegación pública**: Enlaces directos a `/[lang]/favoritos` (con contador en vivo) y `/[lang]/preguntas-frecuentes` añadidos en `Header.tsx` (menú móvil y barra superior) y `Footer.tsx`.
- **Imágenes y limpieza**: Migración de `<img>` a `next/image` en el blog; eliminación de los marcadores `ComingSoon.tsx` y `ModulePlaceholder.tsx`.
- **Responsividad 390 px**:
  - `Segmented` en `web/src/components/panel/ui.tsx` actualizado con `flex-wrap sm:inline-flex` para evitar desbordes horizontales en pantallas angostas.
  - Selectores y buscadores en `panel/blog`, `panel/contenido` y `panel/configuracion` ajustados a `w-full sm:w-*`.
- **Regla de oro del panel ("Agregar...")**:
  - Botones **Agregar contador** y **Agregar pregunta** (+ quitar) en `panel/contenido`.
  - Botón **Agregar programa** (+ quitar) en tasas de crédito y **Agregar** frase sugerida en `panel/configuracion`.
  - Botones para agregar tipos de lead y etapas en `panel/pipeline`.

---

## 3. Base de datos, Auth y APIs preparadas (Fases 2 y 3)

- **Supabase y configuración**:
  - Instalados `@supabase/supabase-js` y `@supabase/ssr`.
  - Creado `web/.env.example`, `web/next.config.ts` (con `remotePatterns` para `*.supabase.co`) y clientes en `web/src/lib/supabase/` (`config.ts`, `client.ts`, `server.ts`).
  - Creados `web/supabase/schema.sql` (tablas + políticas RLS, soporte de `'suite'` en `properties.type`, `'VIP'`/`'VIS'` en `properties.housing`, columna `video_url`, `notes` JSONB en `leads`, y creación del bucket `property-photos` con políticas RLS sobre `storage.objects`) y `web/supabase/seed.sql` (Super admin `Ec. Raúl García`).
  - Actualizado `web/src/middleware.ts` para proteger `/panel/*` con Supabase Auth cuando las variables de entorno están configuradas.
- **Rutas API implementadas**:
  - `POST / GET / PATCH /api/leads`: Captación desde los 5 formularios públicos (`submitLead()` en `leads-local.ts`) y gestión desde el pipeline.
  - `GET / POST /api/panel/properties`: Persistencia de propiedades con manejo de `sold_at` (regla de 30 días).
  - `GET / POST /api/panel/blog`: Persistencia de artículos del blog.
  - `GET / PUT /api/panel/settings`: Persistencia de `site_settings` (Hero, contadores, FAQs, chips de IA, programas de crédito).
  - `POST /api/panel/upload` + `web/src/lib/image-sanitize.ts`: Limpieza de metadatos EXIF/GPS en navegador antes de subir fotos a Supabase Storage.

---

## 4. Inteligencia Artificial y Webhooks (Fase 4)

- **Buscador con IA (`POST /api/ai/search`)**:
  - Sanitiza accidentalmente correos/teléfonos antes de procesar (OWASP / Regla 10).
  - Usa Gemini (`GEMINI_API_KEY`) cuando está configurado con salida JSON estructurada, o respaldo local `interpret()`, y registra consultas anonimizadas en `public.ai_search_logs` para el informe `A6.2` de demanda insatisfecha.
- **Asistente virtual (`POST /api/ai/assistant`)**:
  - Aplica estrictamente la Regla 9 (traspaso automático a asesor humano si se habla de precio/negociación, temas legales o crédito) y la Regla 3 (ubicación aproximada).
  - Cuando `GEMINI_API_KEY` está activo, responde usando únicamente el catálogo público.
- **Webhooks de pauta y mensajería**:
  - `GET / POST /api/webhooks/whatsapp` (WhatsApp Cloud API).
  - `GET / POST /api/webhooks/meta-leads` (Meta Lead Ads con validación HMAC `x-hub-signature-256`).

---

## 5. Próximos pasos pendientes (Fase 5 — Pre-lanzamiento)

1. **Configurar variables reales en `web/.env.local`** y ejecutar `schema.sql` + `seed.sql` en Supabase.
2. **Pre-lanzamiento**:
   - Reemplazar el marcador en `Logo.tsx` con el vector oficial de RG, configurar `sitemap.xml` / `robots.txt` y ejecutar `next build` en entorno con red.
