# PRD · Diseño de pantallas en Stitch · RG Inmobiliaria y Constructora

| Campo | Valor |
| --- | --- |
| Versión | 1.0-Stitch |
| Fecha | 14 de noviembre de 2026 |
| Cliente | RG Inmobiliaria y Constructora |
| Responsable | Fabián (Boreal · Norte Estratégico) |
| Herramienta | **Stitch** (Google): crea pantallas de diseño, las pasa a Figma y exporta HTML y Tailwind. No crea una aplicación que funcione |
| Documentos relacionados | `Documento-maestro-RG-Stitch.md` (contexto y reglas), `Prompts-Stitch-RG-Diseno.md` (prompts por pantalla, v1.1), documento maestro completo (rev. 159) |
| Origen de este PRD | Reconstruido a partir del documento maestro (hasta la ronda 22), el PRD técnico 0.1 del 11 de octubre y los prompts de Stitch v1.1. Incluye solo lo que afecta al **diseño**; el modelo de datos, las integraciones y las fases de construcción no van aquí |
| Idioma | Los textos de las pantallas van en **español** (versión en inglés después, con el selector ES \| EN). Los prompts van en inglés porque suele dar resultados más precisos |

> **Cómo leer este PRD.** Dice **qué lleva cada pantalla, en qué orden, con qué textos y qué estados**. Lo que aún no decidió el cliente está marcado como **[ABIERTO]** (sección 11). Las pantallas son maquetas: los botones y formularios pueden no hacer nada.

---

## 1. Objetivo del diseño

Entregar las pantallas del **sitio público**, del **agente de IA** y del **panel del equipo** de RG, con un sistema visual coherente (logo, paleta, tipografía, componentes), listas para pasar a Figma y de ahí a construcción.

**Cómo sabremos que el diseño sirve** (Doerr, *Measure What Matters*: cada objetivo con su medida):

| Objetivo | Medida |
| --- | --- |
| Que una persona llegue a una propiedad rápido | Se llega a una ficha en máximo 3 clics (con filtros) o con 1 búsqueda escrita |
| Que dé el siguiente paso sin pensar | En la ficha, la acción principal ("Agendar una visita") se identifica en menos de 5 segundos en una prueba con 5 personas |
| Que el equipo maneje todo solo | Subir una propiedad completa en menos de 10 minutos desde el panel |
| Que se vea una marca seria | El dueño aprueba el sistema visual en la primera ronda |
| Que sea usable en celular | Las pantallas M1, M2 y C1 pasan la lista de revisión (sección 10) |

## 2. Alcance del diseño

**Entra:** sitio público (inicio, resultados con IA y con filtros, ficha, agendar visita, propietarios, ventana emergente), versión de celular del inicio, de los resultados y del agente, ventana de chat del agente y panel (inventario, editor, ficha técnica y fotos, pipeline, agregar lead, Buscar con IA, asistente de IA).

**Entra en una segunda tanda de diseño** (se piden después de aprobar la primera): blog (listado y artículo), página de preguntas frecuentes, lista de favoritos, páginas legales, acceso al panel, slider de inicio y ventanas emergentes en el panel, contenido web (contadores, preguntas, testimonios), usuarios y roles, programas de crédito.

**No entra:** cuentas de compradores, pagos, reservas en línea, comparador, búsqueda con pines en un mapa, recorridos 360°, app móvil, solicitud de crédito en línea.

## 3. Sistema visual (tokens)

### 3.1 Color

| Token | Valor | Uso |
| --- | --- | --- |
| `color-primary` | `#111111` | Botones principales, encabezado, pie, textos fuertes |
| `color-on-primary` | `#FFFFFF` | Texto sobre negro |
| `color-bg` | `#FFFFFF` | Fondo de página y tarjetas |
| `color-bg-alt` | `#F5F3F1` | Secciones alternas y fondo del panel |
| `color-text` | `#111111` | Texto principal |
| `color-text-2` | `#6B6560` | Texto secundario (contraste 5,7 a 1 sobre blanco) |
| `color-border` | `#ECEAE7` | Bordes finos y fondo de chips grises |
| `color-brand-red` | `#D93A21` | **Solo** línea de 3 px bajo títulos y un punto "en línea". Nunca botones |
| `color-brand-red-hover` | `#A82A1B` | Enlace al pasar el cursor |
| `color-exclusive` | `#C9A25C` sobre `#111111` | Etiqueta "Exclusiva RG" con estrella **[ABIERTO]** |
| `status-available` | `#2F6B57` sobre `#E4F0EB` | Disponible **[ABIERTO]** |
| `status-reserved` | `#8F5F10` sobre `#F7EBD3` | Reservada **[ABIERTO]** |
| `status-building` | `#3A5F8A` sobre `#E3EBF4` | En construcción y Sobre planos **[ABIERTO]** |
| `status-closed` | `#6B6560` sobre `#ECEAE7` | Vendida y Alquilada |
| `feedback-error` | rojo de alerta distinto del rojo de marca (ejemplo `#B3261E`) | Errores de formulario, siempre con texto |

### 3.2 Tipografía

| Estilo | Fuente | Tamaño / peso |
| --- | --- | --- |
| H1 | Montserrat | 44 px / 700 |
| H2 | Montserrat | 32 px / 700 |
| H3 | Montserrat | 22 px / 600 |
| Cuerpo | Inter | 16 px / 400, interlineado 1,5 |
| Énfasis | Inter | 16 px / 500 |
| Texto pequeño | Inter | 14 px / 400 |
| Precio en tarjeta | Montserrat | 22 px / 700 |
| Número de contador | Montserrat | 56 px / 700 |

En celular: H1 30 px, H2 24 px, contador 40 px.

### 3.3 Espacio, forma y movimiento

- Cuadrícula de 12 columnas, contenedor de 1200 px en un marco de 1440 px; en celular, marco de 390 px con márgenes de 16 px.
- Escala de espacio de 8 px.
- Esquinas: tarjetas 12 px, ventanas 16 px, botones y campos 8 px.
- Altura de botones y campos: 48 px. Área táctil mínima: 44 px.
- Sombra única y suave en tarjetas; sin degradados fuertes salvo la sombra oscura sobre fotos del hero.
- Movimiento: solo contadores (una vez al entrar en pantalla) y slider; con "reducir movimiento" activado, los números aparecen ya terminados y el slider no avanza solo.

### 3.4 Logo

Marcador de posición (círculo negro con "RG") en todas las pantallas; se reemplaza con el logo original en Figma. Encabezado: marcador + texto "Inmobiliaria Constructora".

## 4. Estructura del sitio y navegación

```
Sitio público
├── Inicio
├── Resultados (modo "Buscar con IA" y modo "Usar filtros")
├── Ficha de propiedad
├── Vende o alquila con nosotros (formulario de propietarios)
├── Blog · Preguntas frecuentes · Quiénes somos · Servicios · Páginas legales
└── Asistente de IA (burbuja flotante en todas las páginas)

Panel (solo equipo)
├── Propiedades · Contenido web · Blog · Contactos y pipeline · Configuración
```

**Encabezado público (todas las páginas):** marcador + "Inmobiliaria Constructora"; menú "Comprar", "Alquilar", "Zonas", "Servicios", "Blog", "Quiénes somos", "Contacto"; a la derecha, selector **"ES | EN"** siempre visible y botón negro **"Agendar una visita"**. No hay "Iniciar sesión" ni "Publicar propiedad".

**Pie (todas las páginas):** fondo negro, logo, texto corto, columnas "Propiedades", "Empresa", "Legal", teléfono, correo, redes, enlaces "Política de privacidad" y "Términos".

**Panel:** barra lateral negra de 260 px con "Propiedades", "Contenido web", "Blog", "Contactos y pipeline", "Configuración"; abajo el usuario ("Ec. Raúl García · Super admin") y "Cerrar sesión". El asesor no ve "Configuración".

## 5. Componentes reutilizables

| Componente | Qué lleva | Estados que hay que diseñar |
| --- | --- | --- |
| **Tarjeta de propiedad** | Foto 16:10; etiqueta de operación ("Venta" o "Alquiler") arriba a la izquierda; corazón de favorito arriba a la derecha; etiqueta "Exclusiva RG" si aplica; precio ("$145.000" o "$450 / mes"); título; **zona solo** ("Cuenca · Ricaurte"); tres datos con íconos (habitaciones, baños, m²); una línea de descripción; chip de estado si no es "Disponible"; etiqueta "Parecida" cuando es sugerencia | Normal, favorita, vendida (gris, con "Vendida"), reservada, exclusiva, parecida, cargando (esqueleto gris) |
| **Buscador de dos modos** | Pestañas "Comprar" / "Alquilar"; interruptor "Buscar con IA" / "Usar filtros"; en IA: campo de texto de 2 líneas, botón "Buscar", chips "Prueba con:" y nota "Buscamos solo entre las propiedades de RG. No escribas datos personales."; en filtros: barra con nombre o código | IA, filtros, escribiendo, enviando (puntos animados), error |
| **Chips "Entendí esto:"** | Un chip por criterio, con "x" de 44 px de área táctil, y enlace "Ajustar con filtros" | Normal, chip quitado, sin criterios entendidos ("No entendí tu búsqueda. Prueba con tipo, zona y presupuesto.") |
| **Panel de filtros** | Grupos plegables: Ubicación (País, Provincia, Ciudad, Parroquia solo en Ecuador), Tipo, Precio (control deslizante + "Mínimo" y "Máximo"), Habitaciones, Baños, Características, Etapa de la obra, Vivienda (Todas, VIP, VIS), "Solo Exclusivas RG"; "Limpiar" y botón "Ver N propiedades" | Cerrado, abierto, con filtros activos |
| **Mapa de zona** | Polígono sombreado (`#111111` al 15 % con borde de 2 px), sin pin ni calles, texto "Ubicación aproximada…" | Normal |
| **Simulador de crédito** | Campos "Valor de la vivienda", "Entrada", "Plazo (años)", "Ingresos mensuales"; botón "Simular"; resultado "Resultado referencial" con cuota, chip de semáforo con texto ("Cuota cómoda", "Cuota alta") y aviso fijo | Vacío, con resultado, error de dato |
| **Acordeón de preguntas** | Pregunta, respuesta, enlace opcional | Cerrado, abierto |
| **Formulario de contacto** | Campos con etiqueta visible; casilla de consentimiento; botón negro | Vacío, con error por campo, enviando, éxito |
| **Ventana de agendar visita** | Resumen de la propiedad, día, franja (Mañana, Tarde, Cualquiera), consentimiento | Formulario, éxito ("Recibimos tu solicitud") |
| **Ventana emergente de anuncio** | Foto, etiqueta, título, precio, botón "Ver propiedad", enlace "Ahora no", X de 44 px | Escritorio, celular |
| **Chat del agente** | Burbujas, tarjeta de propiedad dentro del chat, respuestas rápidas, campo de texto, aviso "Estás hablando con un asistente virtual" | Cerrado (burbuja flotante), abierto, escribiendo, traspaso a asesor |
| **Tarjeta del pipeline** | Nombre, teléfono, insignia de origen ("Formulario Meta", "WhatsApp anuncio", "Cargada a mano"), campaña, interés, asesor, etiqueta "Simuló crédito", reloj ámbar si no hay respuesta | Normal, arrastrando, con alerta |
| **Tabla del panel** | Columnas, filtros, paginación, acciones "Editar" y "Marcar como vendida" | Normal, fila vendida bloqueada, vacía |
| **Aviso** | Ícono + título + texto (información, éxito, advertencia, error) | Los cuatro |

## 6. Pantallas: qué lleva cada una

La columna **Prompt** indica dónde está el texto para pegar en `Prompts-Stitch-RG-Diseno.md`.

### 6.1 Sitio público

| ID | Pantalla | Dispositivo | Bloques, en orden | Prompt |
| --- | --- | --- | --- | --- |
| S1 | Inicio, parte 1 | Computador | Encabezado; hero con buscador de dos modos; "Nuevas propiedades" (carrusel de exactamente 3); "Exclusivas RG" (3 tarjetas); "Propiedades destacadas" (6 tarjetas) | S1 |
| S2 | Inicio, parte 2 | Computador | "Explora por zonas" (6 zonas con conteo); "¿Cómo podemos ayudarte?" (4 servicios); contadores animados; "Tu próximo hogar, paso a paso" (5 pasos); Quiénes somos; testimonios; preguntas frecuentes (6 o más); banda "¿Tienes una propiedad para vender o alquilar?"; pie | S2 |
| S3 | Resultados con IA | Computador | Buscador lleno; "Entendí esto:"; barra de resultados (conteo, orden, Lista/Mapa); 4 tarjetas; paginación; banda "¿No encuentras lo que buscas?" | S3 |
| S4 | Resultados con IA, sin coincidencia exacta | Computador | Igual que S3 más aviso "No encontramos propiedades con todos esos criterios."; 3 tarjetas "Parecida"; tarjeta "¿Prefieres que te ayudemos?" con "Dejar mi búsqueda" | S4 |
| S5 | Resultados con filtros | Computador | Barra compacta; panel de filtros a la izquierda; chips activos; 6 tarjetas; paginación | S5 |
| S6 | Ficha de propiedad | Computador | Migas de pan; título, chips y precio; galería (1 grande + 4 y tira de 6 miniaturas con nombre del ambiente); menú fijo (Descripción, Ficha técnica, Video, Financiación, Preguntas frecuentes); ficha técnica por categorías; "Descargar ficha"; video 16:9; simulador; 3 preguntas; columna fija a la derecha con "Agenda una visita", mapa de zona y "Te acompañamos"; "Otras propiedades para comparar" | S6 |
| S7 | Agendar una visita | Ventana | Resumen, campos, día, franja, consentimiento, botón; segundo estado de éxito | S7 |
| S8 | Vende o alquila con nosotros | Computador | Banda de título; 3 beneficios; formulario de contacto (sin subir fotos ni datos de la propiedad completa); "Así trabajamos" (4 pasos) | S8 |
| S9 | Ventana emergente | Computador | Anuncio de una propiedad: foto, etiqueta, título, precio, "Ver propiedad", "Ahora no" | S9 |
| M1 | Inicio en celular | 390 px | Barra superior con ES \| EN y menú; hero con buscador; carrusel de 3; Exclusivas en columna; zonas en 2 columnas; banda "Vende o alquila con nosotros"; botón flotante de WhatsApp | M1 |
| M2 | Resultados con IA en celular | 390 px | Buscador lleno; chips que bajan a dos líneas; 2 tarjetas; barra fija "Dejar mi búsqueda a un asesor" | M2 |

### 6.2 Agente de IA

| ID | Pantalla | Dispositivo | Bloques, en orden | Prompt |
| --- | --- | --- | --- | --- |
| C1 | Conversación del agente | 390 px | Barra con "Asistente RG"; saludo con respuestas rápidas "Comprar" / "Alquilar"; mensaje de la persona; respuesta con una tarjeta "Parecida"; pregunta por la dirección y respuesta de privacidad; respuestas rápidas de franja; campo de texto | C1 |
| C2 | Chat en la web y traspaso | Computador | Panel de chat sobre la ficha; pregunta de descuento; mensaje de traspaso a asesor; solicitud de permiso para guardar nombre y número; estado cerrado (burbuja "¿Te ayudo?") | C2 |

### 6.3 Panel

| ID | Pantalla | Bloques, en orden | Prompt |
| --- | --- | --- | --- |
| A1 | Inventario de propiedades | Título y "Nueva propiedad"; 4 indicadores y "Espacios del slider 3 de 3"; búsqueda y filtros; tabla (propiedad, código, precio, estado, publicación, interruptor de slider, acciones); fila vendida bloqueada | A1 |
| A2 | Editor, datos principales | Migas y chip de estado; pestañas; datos principales con ES / EN; datos base; etapa de la obra; tipo de publicación (Exclusiva RG o Compartida, con fecha de vencimiento y nota interna privada); mapa de zona y dirección exacta privada; destacada y vivienda VIP o VIS | A2 |
| A3 | Ficha técnica y fotos | Categorías con "Agregar campo" y "Agregar categoría"; ventana "Crear campo nuevo"; fotos con contador, errores y aviso de privacidad de ubicación (GPS); enlace del video | A3 |
| A4 | Pipeline | "Agregar lead" y "Agregar tipo de tarjeta"; 4 indicadores; pestañas por tipo; filtros; tablero con 8 etapas y "Agregar etapa" | A4 |
| A5 | Agregar lead | Panel lateral con campos, origen obligatorio y aviso de duplicado | A5 |
| A6 | Buscar con IA (ajustes e informe) | Interruptor; modo de inicio; frases de ejemplo; límites; parecidas; mensajes; privacidad; segunda pestaña "Informe de demanda" | A6 |
| A7 | Asistente de IA | Interruptor; horario; mensaje fuera de horario; qué puede y qué nunca hace; cuándo pasa a un asesor; mensaje de respaldo; segunda pestaña "Conversaciones" | A7 |

## 7. Reglas de cada pantalla (lo que el diseño debe mostrar)

### 7.1 Inicio y buscador

- El selector ES \| EN conserva la página al cambiar.
- El carrusel "Nuevas propiedades" muestra **exactamente 3** propiedades (las elige el equipo) y avanza solo, con puntos y flechas.
- "Exclusivas RG" va **antes** de "Propiedades destacadas".
- "Explora por zonas": cada zona muestra el número de propiedades disponibles. Sin pines.
- Los contadores usan un solo componente. Empiezan con 3 y el equipo puede agregar más.
- Preguntas frecuentes del inicio: mínimo 6 visibles.
- Si el buscador está en modo IA, el campo de texto es lo primero que se ve y los chips de ejemplo se pueden tocar.

### 7.2 Resultados

- Conteo "N propiedades encontradas", orden (Más recientes, Menor precio, Mayor precio), paginación de 6 por página.
- En arriendo se aclara: "El precio es la mensualidad y no incluye gastos adicionales."
- Sin resultados: "¿No encuentras lo que buscas?" con el botón "Contactar con un asesor" (modo filtros) o "Dejar mi búsqueda a un asesor" (modo IA).
- Con IA, siempre "Entendí esto:" arriba de las tarjetas, con chips que se pueden quitar.
- Sin coincidencia exacta: aviso + tarjetas con etiqueta "Parecida" + qué criterio cambió.

### 7.3 Ficha de propiedad

- Chips: operación, estado y, si aplica, "Exclusiva RG"; código pequeño en gris.
- Galería de 10 fotos con nombre del ambiente. "Ver todas las fotos (10)".
- Ficha técnica en categorías con su subtítulo (Datos principales, Interior, Exterior, Amenidades), con las áreas de construcción y de terreno **separadas**.
- Si la propiedad está en construcción o sobre planos: chip, barra de avance y "Entrega estimada".
- Si es un edificio: tabla de unidades con su estado y "N unidades, desde $X".
- Propiedad vendida: etiqueta "Vendida", acciones de contacto deshabilitadas y "Propiedades parecidas". Propiedad ya oculta: aviso amable y parecidas, **nunca** una página de error.
- Columna derecha fija: formulario, tres acciones (Agendar una visita, WhatsApp, Enviar mensaje), mapa de zona, "Ver propiedades en [zona]", horario de atención.

### 7.4 Agente de IA

- Primer mensaje: aclara que es un asistente virtual.
- Un solo mensaje por turno, máximo 4 oraciones cortas, una sola pregunta.
- Muestra como máximo 3 propiedades por mensaje.
- No da dirección exacta, no promete descuentos ni plazos y no ofrece una propiedad vendida o reservada.
- Antes de guardar nombre y teléfono pide permiso (sección 8).
- Al pasar a un asesor, lo dice en un solo mensaje, con el horario de atención.

### 7.5 Panel

- Operación y estado son campos separados; "Marcar como vendida" (o "Marcar como alquilada" según la operación) bloquea la propiedad del slider.
- Tipo de publicación: dos tarjetas (Exclusiva RG, Compartida). Con Exclusiva aparecen "Vence el" y la nota interna con candado. Esos datos **nunca** salen en la web pública.
- Foto de portada: "Foto de portada · 1920 × 1080 px · JPG, PNG o WebP · máximo 5 MB". Contador "7 de 10 fotos subidas".
- Pipeline: cada contacto muestra su origen. "Agregar lead" exige origen y marca la tarjeta como "Cargada a mano".
- Cada asesor ve solo sus tarjetas; el super admin ve todas.

## 8. Textos fijos y legales (exactos)

| Dónde | Texto |
| --- | --- |
| Buscador con IA | "Buscamos solo entre las propiedades de RG. No escribas datos personales." |
| Mapa | "Ubicación aproximada. La dirección exacta te la damos al coordinar la visita." |
| Simulador, título | "Resultado referencial" |
| Simulador, pie | "Valores referenciales. Una entidad financiera puede darte otros valores." |
| Simulador, aviso | "No garantizamos aprobación ni ofrecemos tasas o cuotas preaprobadas. Las condiciones y la elegibilidad están sujetas a evaluación de la entidad financiera." |
| Simulador, nota | "No incluye gastos legales, impuestos, seguros, avalúo ni comisiones." |
| Formularios | "Acepto que RG me contacte según la Política de privacidad" |
| Visita enviada | "Recibimos tu solicitud. Un asesor te confirmará el día y la hora." |
| Agente, permiso | "¿Me permites guardar tu nombre y tu número para que un asesor te contacte? Los usaremos solo para eso, según nuestra Política de privacidad." |
| Agente, traspaso | "Te paso con un asesor de RG para que te ayude con esto. Te escribirá en nuestro horario de atención (lunes a viernes de 9:00 a 18:00)." |
| Agente, sin datos | "Ese dato no lo tengo a la mano. Un asesor te lo confirma." |
| Favoritos | "Guardado en este dispositivo" |
| Ficha en PDF | "La información puede cambiar" y la fecha de generación |
| Foto muy pesada | "Esta foto pesa 8 MB. El máximo es 5 MB. Redúcela y vuelve a subirla" |
| Fotos | "Borramos de cada foto los datos de ubicación (GPS) para proteger la dirección." |

## 9. Estados vacíos, de carga y de error (a diseñar al menos para S3, S6, A1, A4)

| Situación | Qué se ve |
| --- | --- |
| Cargando resultados | Esqueletos grises con la forma de la tarjeta; el texto "Buscando…" |
| Sin resultados | Ilustración simple o ícono, título "No encontramos propiedades con esos criterios", texto de ayuda y un botón negro |
| Error de conexión | Aviso de error con texto ("No pudimos cargar las propiedades. Intenta de nuevo.") y botón "Reintentar" |
| Campo con error | Borde de color de alerta, **texto** debajo del campo y ícono; nunca solo color |
| Propiedad ya no disponible | "Esta propiedad ya no está disponible." con propiedades parecidas |
| Tablero vacío | "Aún no hay contactos en esta etapa." |
| IA lenta | Tres puntos animados; después de 8 segundos, "Estoy tardando más de lo normal. Un asesor te escribirá en breve." |

## 10. Accesibilidad, celular y criterios de aceptación visual

**Accesibilidad (WCAG 2.1, nivel AA):** contraste de texto de al menos 4,5 a 1; foco visible; etiquetas siempre visibles sobre los campos; todo se puede usar con teclado; nunca depender solo del color; respetar "reducir movimiento".

**Celular primero:** el diseño de celular se piensa antes que el de computador. Botones de ancho completo, 16 px de márgenes, un flujo vertical, y botón flotante de WhatsApp de 56 px.

**Lista de revisión de cada pantalla** (la misma de `Prompts-Stitch-RG-Diseno.md`, sección 3):

- [ ] Botones principales negros con texto blanco; ningún botón rojo.
- [ ] El rojo de marca solo en detalles pequeños.
- [ ] Títulos en Montserrat y textos en Inter.
- [ ] Todo el texto visible en español y coincide con este documento.
- [ ] No hay "Publicar propiedad", "Iniciar sesión" ni cuenta de usuario en el sitio público.
- [ ] No hay dirección, calle, coordenadas ni pin; solo una zona sombreada.
- [ ] La ubicación de las tarjetas es solo la zona.
- [ ] "Exclusiva RG" en negro con dorado; los estados con texto e ícono.
- [ ] Las ventanas emergentes anuncian una propiedad; sin descuentos ni "ofertas".
- [ ] El selector ES \| EN se ve en el encabezado.
- [ ] Contraste suficiente y etiquetas visibles.
- [ ] Áreas táctiles de al menos 44 px.
- [ ] Todas las propiedades de ejemplo son de Cuenca y coinciden con la base de prueba.
- [ ] En el agente: sin logo de WhatsApp, sin promesas, sin dirección, una pregunta por mensaje.

## 11. Preguntas abiertas que cambian el diseño

| N.º | Pregunta | Pantallas afectadas |
| --- | --- | --- |
| 1 | ¿"Alquilar" o "arriendo" en toda la web? (mientras tanto, "Alquilar") | Todas |
| 2 | ¿Aprueban el bronce `#C9A25C` y los colores de apoyo de los estados? | S1, S2, S6, A1 |
| 3 | ¿Qué modo del buscador sale primero: "Buscar con IA" o "Usar filtros"? | S1, M1 |
| 4 | ¿Quiénes somos tiene página propia o solo va en el inicio? | S2 |
| 5 | ¿Cuántas preguntas se ven abiertas antes de "Ver más"? | S2, S6 |
| 6 | ¿Cuáles son los tres contadores con que arranca el inicio? | S2 |
| 7 | ¿El simulador va también en propiedades de Miami? | S6 |
| 8 | ¿Qué porcentaje del ingreso se marca como "cuota cómoda" y cuál como "cuota alta"? | S6 |
| 9 | ¿El asistente trata de "tú" o de "usted"? | C1, C2 |
| 10 | Vector del logo, colores oficiales y manual de marca | Todas |
| 11 | ¿Las áreas en Miami van en metros cuadrados o en pies cuadrados? | S6, A2 |
| 12 | ¿Cómo se agendan las visitas y quién las recibe? | S7 |

## 12. Pendientes del Figma que este diseño resuelve

Con las pantallas aprobadas se actualiza el Figma v0.1 (3 de octubre): operación y estado separados; filtro de ubicación en cascada; tramos de precio; quitar "Iniciar sesión"; flujo "Vende o alquila con nosotros"; inicio con slider, exclusivas, zonas, contadores, Quiénes somos, testimonios y preguntas; ficha con áreas separadas, nombre del ambiente, mapa de zona, simulador y "Descargar ficha"; menú con Blog, Quiénes somos y selector de idioma; panel con los cuatro módulos y Configuración; Buscar con IA, Agregar lead y asistente de IA.

## 13. Historial

| Versión | Fecha | Cambio |
| --- | --- | --- |
| 1.0-Stitch | 14 de noviembre de 2026 | Primera versión enfocada en Stitch. Reconstruida desde el documento maestro (rev. 159), el PRD 0.1 y los prompts de Stitch v1.1; suma las pantallas del agente de IA (C1, C2, A7) y los datos de ejemplo de Cuenca |
