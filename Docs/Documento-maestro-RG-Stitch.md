# Documento maestro · RG Inmobiliaria y Constructora (versión para Stitch)

Versión 1.0-Stitch · 14 de noviembre de 2026 · Resumen del documento maestro completo (rev. 159, hasta la ronda 22), pensado para **diseñar pantallas** y no para construir la plataforma.

> **Para qué sirve este archivo.** Stitch crea pantallas de diseño; no crea una aplicación que funcione. Por eso aquí se dejó solo lo que cambia cómo se ve y cómo se recorre la web: el negocio, las personas, las reglas que el diseño no puede romper, la identidad visual y qué hace cada parte del panel. La base de datos, las integraciones y las fases de construcción quedaron en el documento maestro completo. Úsalo junto con `PRD-RG-Stitch.md` (qué lleva cada pantalla) y `Prompts-Stitch-RG-Diseno.md` (los textos para pegar).

---

## 1. El negocio en cinco líneas

- RG Inmobiliaria y Constructora **vende y alquila propiedades** y también **construye**. Está en Cuenca (su base), y tiene propiedades en Manta, Guayaquil, el Oriente y Miami.
- La web funciona en **español e inglés**, en **dólares**.
- Tiene un **sitio público** para quien busca y un **panel** para que el dueño y su equipo lo manejen solos, sin programador.
- Quien busca puede escribir con sus palabras (**Buscar con IA**) o usar filtros, y dar el siguiente paso por **WhatsApp**, **formulario** o **agendando una visita**.
- Un **asistente de IA** atiende por WhatsApp y en la web, sin inventar datos, y pasa a una persona cuando hace falta.

## 2. Para quién se diseña (y qué les duele)

| Persona | Qué quiere | Qué le duele | Qué debe resolver el diseño |
| --- | --- | --- | --- |
| Comprador o inquilino en Ecuador | Ver propiedades por ciudad y zona, saber si le alcanza, agendar una visita | Fichas incompletas; no saber cuántos metros son de construcción y cuántos de terreno; llenar diez filtros en el celular | Datos completos y a la vista; escribir como se habla; la cuota estimada en la misma ficha |
| Comprador desde Estados Unidos | Ver Miami en inglés y escribir rápido | Textos solo en español; no saber si sigue disponible | Selector ES \| EN siempre visible; estado claro de cada propiedad |
| Propietario | Vender o alquilar con RG | No saber cómo empezar | Una página simple "Vende o alquila con nosotros" que solo pide datos de contacto |
| Dueño y equipo de RG | Subir, ocultar o cerrar propiedades y cambiar textos | Depender de un programador; perder un contacto que llegó de un anuncio | Un panel claro, con pocas pantallas y botones "Agregar..." |

Alan Cooper (*The Inmates Are Running the Asylum*) recomienda diseñar para personas concretas y no para "el usuario" en general. Estas cuatro son hipótesis de trabajo que se afinan con el dueño.

## 3. Qué debe sentir quien entra

- **Confianza.** Es una compra grande. La web debe verse sobria, ordenada y seria, no llamativa.
- **Claridad.** Steve Krug (*No me hagas pensar*): cada pantalla tiene un solo objetivo y la acción principal se ve de inmediato.
- **Control.** Jakob Nielsen (heurísticas de usabilidad): cuando la IA interpreta una búsqueda, la persona ve "Entendí esto:" y puede quitar cualquier criterio.
- **Cercanía.** Textos cortos, en lenguaje de todos los días, tratando de "tú". Sin tecnicismos ni frases de catálogo.

**Tono de voz.** Cálido, claro y directo. Ejemplo bueno: "Cuéntanos qué buscas." Ejemplo malo: "Ingrese los parámetros de su requerimiento inmobiliario."

## 4. Los cuatro caminos del visitante

1. **Buscar.** En el inicio hay un buscador con dos modos: **"Buscar con IA"** (una caja de texto, con frases de ejemplo) y **"Usar filtros"** (país, provincia o estado, ciudad, parroquia, tipo, precio, habitaciones, baños y características). Los resultados muestran propiedades; si no hay coincidencia exacta, aparecen **"Parecidas"** y se dice qué cambió.
2. **Decidir en la ficha.** Galería de fotos, datos técnicos, video, **simulador de crédito**, preguntas frecuentes, ficha en PDF y mapa de la zona.
3. **Dar el siguiente paso.** Tres vías: **agendar una visita** (la más valiosa), **WhatsApp** o **formulario**. Las tres terminan como una tarjeta en el pipeline del asesor.
4. **Si es propietario:** "Vende o alquila con nosotros", un formulario de contacto. Nadie sube propiedades desde la web pública.

## 5. Reglas que el diseño nunca rompe

1. **Solo RG publica.** No existe "Publicar propiedad" ni subir fotos en el sitio público.
2. **No hay cuentas de visitantes.** Ni "Iniciar sesión" ni "Crear cuenta". Los favoritos se guardan en el dispositivo y se avisa: "Guardado en este dispositivo".
3. **Ubicación solo por zona.** Nunca una dirección exacta, calle, coordenadas ni chincheta de una propiedad. El mapa pinta una **zona sombreada**. Texto fijo: "Ubicación aproximada. La dirección exacta te la damos al coordinar la visita."
4. **Etiqueta "Exclusiva RG".** Aparece sola cuando la propiedad es exclusiva; es negra con dorado. Con qué inmobiliaria se comparte una propiedad y la comisión son datos internos y no se ven en la web.
5. **Estados con ícono y texto**, nunca solo color: Disponible, Reservada, En construcción, Sobre planos, Vendida, Alquilada. Una propiedad vendida se ve 30 días con la etiqueta "Vendida" y después se oculta de la web (no se borra).
6. **Operación y estado son cosas distintas.** Operación: Venta o Alquiler. Estado: Disponible, Reservada, Vendida o Alquilada.
7. **Las ventanas emergentes anuncian una propiedad o un proyecto.** Nunca descuentos, porcentajes, "oferta" ni cuentas regresivas. Salen a los 5 segundos, una vez por visita, y se cierran con una X clara o con Esc.
8. **El simulador de crédito es una referencia.** Siempre dice "Resultado referencial" y "Valores referenciales. Una entidad financiera puede darte otros valores." No promete aprobación.
9. **El asistente no inventa.** Se presenta como asistente virtual, responde con datos de la ficha y pasa a una persona si la persona lo pide o si se habla de negociar precio, temas legales o financiamiento.
10. **Las búsquedas con IA no guardan datos personales.** Al pie del buscador: "Buscamos solo entre las propiedades de RG. No escribas datos personales."

Las reglas 3, 9 y 10 se apoyan en Ann Cavoukian (privacidad desde el diseño) y en la lista de riesgos de aplicaciones con IA de OWASP: la IA solo traduce lo escrito a criterios de búsqueda; no ve direcciones exactas ni datos de contactos.

## 6. Identidad visual

**Logo.** Círculo blanco con un lobo negro que aúlla, las letras RG en trazo fino, el texto "Inmobiliaria Constructora" y una media luna rojo anaranjada en el borde derecho, sobre fondo negro. Stitch no puede reproducirlo: se dibuja un marcador (círculo negro con "RG") y después se reemplaza con el logo original. Para el encabezado conviene una versión horizontal, porque el círculo con borde negro se ve mal sobre fondo blanco.

| Color | Valor | Uso |
| --- | --- | --- |
| Negro lobo | `#111111` | Textos, encabezado, pie de página y **botones principales** (texto blanco) |
| Blanco | `#FFFFFF` | Fondos y tarjetas |
| Gris cálido claro | `#F5F3F1` | Fondos de secciones alternas |
| Gris cálido medio | `#6B6560` | Textos secundarios |
| Rojo RG | `#D93A21` | **Solo detalles pequeños**: una línea de 3 px bajo los títulos, un punto. Nunca botones ni áreas grandes |
| Rojo profundo | `#A82A1B` | Enlace al pasar el cursor |
| Bronce (propuesta) | `#C9A25C` | Texto de la etiqueta "Exclusiva RG" sobre negro. **Falta aprobar** |
| Verde, ámbar, azul de apoyo (propuesta) | `#2F6B57`, `#8F5F10`, `#3A5F8A` | Estados Disponible, Reservada y En construcción. **Faltan aprobar** |

**Tipografía:** Montserrat para títulos (700 y 600) e Inter para textos (400 y 500). Tamaño base 16 px.

**Forma:** esquinas de 12 px en tarjetas y 8 px en botones y campos; sombras muy suaves; mucho espacio en blanco; fotos de inmuebles con luz natural cálida.

**Constructora.** El nombre incluye "Constructora": en el inicio hay "Quiénes somos" con la trayectoria de obras y "Próximos proyectos" (obras en construcción o por lanzar).

## 7. El panel del equipo (solo para RG)

| Módulo | Qué hace el equipo ahí |
| --- | --- |
| **Propiedades** | Inventario con KPIs interactivos, editor de propiedad (datos principales, ficha técnica flexible con "Agregar campo" y "Agregar categoría", 10 fotos con nombre del ambiente, **video horizontal 16:9 multi-plataforma YouTube, Vimeo, TikTok o MP4 con validación, vista previa en vivo y botón para quitar**, simulador y preguntas), slider Hero de inicio (máximo **5 propiedades** en abanico 3D sobre fondo `#141414` + carrusel táctil móvil + buscador inferior en `#F5F3EE`, con autoplay configurable de 1 a 10 s), exclusiva o compartida, marcar como vendida |
| **Contenido web** | Vitrina Hero 3D (5 slides bilingües ES/EN y control de velocidad 1-10s), contadores y métricas, preguntas frecuentes, **ventanas emergentes (Popups S9) con carga/reemplazo de imagen (JPG/PNG/WEBP máx. 5 MB) y vista previa en vivo**, reglas operativas y auditoría de conversaciones del asistente de IA |
| **Blog** | Artículos y publicaciones con tabla de alta escaneabilidad (zebra striping cálido `#F5F3EE`, encabezados estructurados y píldoras de categoría diferenciadas: *Guías de Compra & Crédito VIP*, *Arquitectura & Obras*, *Inversión & Mercado*) y editor modal SEO |
| **Contactos y pipeline** | Tablero Kanban y vista Lista con **Modal de Detalle del Contacto (*Progressive Disclosure*)** al hacer clic en cualquier tarjeta/fila, **Bitácora y Seguimientos interactiva** (notas con fecha, hora y autor automático), cambio de etapa/asesor, origen/campaña y botón **"Agregar lead"** |
| **Configuración** | Exclusivo del **Super admin (`Ec. Raúl García`)**: credenciales e IDs de pauta (**Meta Business / Meta Ads**, **Google Ads** y **TikTok Ads** con tokens enmascarados), cola **Round-Robin**, **Buscar con IA & Informe de Demanda Insatisfecha** (con zona, presupuesto promedio y exportación CSV/JSON), **Gestión de Equipo** (`+ Agregar colaborador`, suspender/reactivar acceso y eliminar) y programas/tasas de crédito |

**Roles:** *super admin* (**`Ec. Raúl García`**, iniciales `RG`, ve y administra todo) y *asesor comercial* (ve solo sus contactos asignados y no accede a Configuración). En el encabezado del panel hay un **buscador global instantáneo** de propiedades y contactos. El sitio público (`Header` y `Footer`) no contiene ningún enlace hacia `/panel`.

**Regla de oro del panel:** si el visitante lo ve en la web, el equipo lo cambia desde el panel. Por eso todo lo que es una lista lleva un botón "Agregar..." (tipos de propiedad, categorías, contadores, preguntas, etapas del pipeline).

**Leads de pauta.** RG pauta con dos anuncios: formulario de Meta y mensaje directo a WhatsApp. Los dos crean la tarjeta solos, con la campaña de origen. Lo demás (TikTok, Instagram, llamadas, referidos) se carga con "Agregar lead", y el origen es obligatorio.

## 8. Qué NO se diseña en esta etapa

Cuentas de compradores, pagos o reservas en línea, comparador de propiedades, búsqueda con mapa de pines, recorridos 360°, aplicación móvil propia, solicitud de crédito en línea y envío masivo de mensajes. Ryan Singer (*Shape Up*) recomienda decir también lo que no se hace para que el trabajo no crezca sin control.

## 9. Decisiones que aún cambian el diseño

| N.º | Pendiente | Qué se supone mientras tanto |
| --- | --- | --- |
| 1 | ¿"Alquilar" o "arriendo"? | "Alquilar" y "Alquiler" (así está en el Figma) |
| 2 | ¿Aprueban el bronce `#C9A25C` para "Exclusiva RG" y los colores de apoyo? | Sí, como propuesta |
| 3 | ¿Qué modo sale primero en el buscador: IA o filtros? | IA primero; se mide |
| 4 | ¿Se muestra la dirección exacta cuando se coordina la visita? | Sí, la comparte el asesor, nunca la web |
| 5 | ¿Cuántas preguntas se ven abiertas antes de "Ver más"? | Tres |
| 6 | ¿Quiénes somos tiene página propia? | Va en el inicio |
| 7 | Vector del logo y manual de marca | Se usa el marcador hasta tenerlos |
| 8 | ¿El asistente trata de "tú" o de "usted"? | "Tú"; pasa a "usted" si la persona lo usa |

## 10. Datos de ejemplo para las pantallas (inventados, todos en Cuenca)

| Código | Propiedad | Operación | Precio | Zona | Datos |
| --- | --- | --- | --- | --- | --- |
| CA-001 | Casa moderna en Ricaurte (Exclusiva RG) | Venta | $145.000 | Cuenca · Ricaurte | 3 hab, 2 baños, 2 parqueaderos, 180 m² |
| DP-014 | Departamento con balcón en Totoracocha | Venta | $98.500 | Cuenca · Totoracocha | 3 hab, 2 baños, 92 m² |
| DP-021 | Suite amoblada en El Centro (Exclusiva RG) | Alquiler | $450 / mes | Cuenca · El Centro Histórico | 1 hab, 1 baño, 48 m² |
| TE-007 | Terreno con vista en Turi | Venta | $62.000 | Cuenca · Turi | 400 m² |
| ED-003 | Edificio Mirador, en construcción 60 % (Exclusiva RG) | Venta | desde $89.000 | Cuenca · El Batán | 4 unidades, entrega estimada junio de 2027 |
| CA-019 | Casa VIS en Machángara | Venta | $68.000 | Cuenca · Machángara | 3 hab, 1 baño, 85 m² |

La base completa de prueba tiene **25 propiedades, todas en Cuenca** (casas, departamentos, terrenos, locales, una oficina, un edificio con 4 unidades, y casos como reservada, vendida, alquilada y borrador).

## 11. Base de referencias

- Alan Cooper, *The Inmates Are Running the Asylum* (personas).
- Steve Krug, *Don't Make Me Think* (claridad, un objetivo por pantalla).
- Jakob Nielsen, 10 heurísticas de usabilidad (visibilidad del estado del sistema, control del usuario, lenguaje claro).
- Ann Cavoukian, *Privacy by Design* (datos mínimos, permiso explícito).
- OWASP, riesgos de aplicaciones con modelos de lenguaje (la IA no recibe órdenes del texto del visitante).
- Ryan Singer, *Shape Up* (decir qué no entra).
- WCAG 2.1, nivel AA (contraste, teclado, no depender solo del color).
- Oldroyd, McElheran y Elkington, *Harvard Business Review* (2011): responder rápido a un contacto aumenta las posibilidades de calificarlo. Sustenta la alerta inmediata en el pipeline.

---

*Este resumen no reemplaza al documento maestro completo (Claude Docs, rev. 159). Si algo no coincide, manda el documento completo.*
