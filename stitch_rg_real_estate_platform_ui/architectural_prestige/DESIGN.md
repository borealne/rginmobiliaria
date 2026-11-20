---
name: Architectural Prestige
colors:
  surface: '#fbf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#fbf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f0'
  surface-container: '#f0edea'
  surface-container-high: '#eae8e5'
  surface-container-highest: '#e4e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#444748'
  inverse-surface: '#30312f'
  inverse-on-surface: '#f2f0ed'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#635d58'
  on-secondary: '#ffffff'
  secondary-container: '#eae1da'
  on-secondary-container: '#69635e'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#3f0300'
  on-tertiary-container: '#ed482e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#eae1da'
  secondary-fixed-dim: '#cdc5bf'
  on-secondary-fixed: '#1f1b17'
  on-secondary-fixed-variant: '#4b4641'
  tertiary-fixed: '#ffdad3'
  tertiary-fixed-dim: '#ffb4a6'
  on-tertiary-fixed: '#3f0300'
  on-tertiary-fixed-variant: '#8f1000'
  background: '#fbf9f6'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2df'
typography:
  display-xl:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-xl-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.005em
  headline-sm:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0em
  title-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  price-display:
    fontFamily: Montserrat
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  margin-tablet: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes a disciplined, architectural identity tailored for prime real estate and premium construction operations across Cuenca and Miami. The aesthetic combines corporate sobriety, structural permanence, and understated luxury. 

The visual language draws heavily from high-end architectural monographs: ample white space, disciplined grid alignments, strict monochromatic baseline tones, and exact typographic hierarchy. Interactions must evoke trust, institutional solidity, and precision engineering. 

Color discipline is paramount. The system avoids loud marketing gradients or saturated callouts. Primary black anchors structural elements, warm neutrals soften large surface planes, and the signature red is restricted strictly to structural punctuation lines or subtle indicators—never applied as a button fill or interactive wash.

## Colors

The palette balances stark architectural contrast with tactile warmth:

- **Primary Canvas & Contrast**: Pure white (`#FFFFFF`) forms the primary base, punctuated by primary architectural black (`#111111`) for primary actions, structural strokes, and prominent headings. Alternate sections utilize warm bone (`#F5F3F1`) to create soft architectural zoning.
- **Typography & Structural Lines**: Primary text uses `#111111`, while metadata, technical specs, and subtext use slate warm gray (`#6B6560`). Dividers, containment borders, and structural grids use `#ECEAE7`.
- **Brand Accent Protocol**: Brand Red (`#D93A21`) serves exclusively as an architectural grounding element (e.g., a 3px horizontal line under major section headings or a precise 6px indicator dot). It must never be applied to buttons, cards, or primary interactive surfaces.
- **Prestige Token**: Exclusive properties feature an elite tag: metallic gold/bronze (`#C9A25C`) over an architectural black (`#111111`) badge.
- **Functional Status Palette**:
  - *Available*: Pine `#2F6B57` on `#E4F0EB`
  - *Reserved*: Amber Bronze `#8F5F10` on `#F7EBD3`
  - *In Construction*: Blueprint Navy `#3A5F8A` on `#E3EBF4`
  - *Sold / Rented*: Slate Gray `#6B6560` on `#ECEAE7`

## Typography

Typography delivers institutional authority and crisp, structural rhythm:

- **Headlines (Montserrat)**: Geometric, confident, and clean. Used in weights `600` (SemiBold) and `700` (Bold). Section headers emphasize architectural proportion; primary section headings frequently pair with a signature 3px Brand Red grounding line placed directly underneath.
- **Body & Controls (Inter)**: Objective, legible, and balanced. Used across property descriptions, data points, labels, and microcopy in `400` (Regular) and `500` (Medium).
- **Price Hierarchy**: Prices take prominence in property summaries using `Montserrat 700`, ensuring critical valuation figures remain distinct from narrative copy.
- **Case Conventions**: Status labels and property badge chips should be formatted in Title Case or clean Uppercase with gentle letter-spacing (`0.02em`) for heightened legibility across physical dimensions.

## Layout & Spacing

The layout is built upon a standard 12-column responsive fluid grid anchored within a maximum containment width of 1280px to preserve editorial balance.

- **Breakpoints**:
  - `Desktop`: ≥ 1024px (12 columns, 24px gutter, 48px outer margins)
  - `Tablet`: 640px – 1023px (8 columns, 20px gutter, 32px outer margins)
  - `Mobile`: < 640px (4 columns, 16px gutter, 20px outer margins)
- **Rhythm & Cadence**: Component internals follow an 8px architectural module (`8px`, `16px`, `24px`, `40px`). Section spacing is deliberately generous (`space-xl` / 80px to 120px vertical margin between landing sections) to communicate gallery-like prestige.
- **Alternating Sections**: Surface switches between `#FFFFFF` and `#F5F3F1` occur at full bleed, with internal content strictly aligned to the 12-column bounding box.

## Elevation & Depth

To maintain architectural purity, this design system avoids heavy shadows, glossy skeuomorphism, and blurred layers.

- **Primary Structure**: Hierarchy is achieved through flat, hairline borders (`1px solid #ECEAE7`) and crisp surface differentiation between `#FFFFFF` and `#F5F3F1`.
- **Card Rest & Hover**: Property cards rest flat on the page with a clean 1px border. On desktop hover, cards transition with an ultra-subtle ambient lift: `box-shadow: 0 8px 24px rgba(17, 17, 17, 0.06)`, maintaining a stable, physical presence without floating disconnectedly.
- **Overlay & Popovers**: Contextual menus and dropdowns utilize a crisp background fill (`#FFFFFF`), a hairline outline (`1px solid #ECEAE7`), and an architectural grounding shadow: `0 12px 32px rgba(17, 17, 17, 0.08)`.

## Shapes

The shape system expresses restrained modernism—softening structural sharpness without drifting into playful or consumer-casual circular geometry:

- **Cards & Major Modules**: Fixed at `12px` border radius, delivering refined containment for property photography while maintaining structural alignment.
- **Interactive Controls (Buttons, Inputs, Selects)**: Fixed at `8px` border radius with a uniform height of `48px`, satisfying the 44px minimum touch target requirement while enforcing visual consistency across interactive lines.
- **Filter Chips & Status Badges**: Set to pill curvature (`9999px`) or `6px` subtle bevel depending on context: operation tags and search filter chips adopt the pill format, while technical status indicators (Available, Reserved, etc.) use `6px` architectural chips.

## Components

### Header
- **Layout**: Full-width header with `#FFFFFF` background, subtle bottom border (`1px solid #ECEAE7`), height 80px.
- **Identity**: Circular "RG" monogram emblem paired with typographic logotype "Inmobiliaria Constructora" in `Montserrat 600`.
- **Navigation**: Clean horizontal text links (Propiedades, Proyectos, Constructora, Nosotros, Contacto). No client login portal or public property submission button.
- **Language Switch**: Architectural text toggle: `ES | EN` in `Inter 500` (14px). Active language highlighted in `#111111`, inactive in `#6B6560`.
- **Primary CTA**: Button filled in `#111111` with white text: "Agendar una visita". Height 48px, radius 8px, minimum touch target 44px.

### Dual Search Bar
- **Operation Selector**: Segmented pill controls for "Comprar" vs. "Alquilar".
- **Dual Mode Switcher**:
  1. *Buscar con IA*: Multiline natural language input box (placeholder: "Busco un penthouse en Cuenca con vista al río y 3 dormitorios..."), height auto (min 48px), 8px radius, border `1px solid #ECEAE7`.
  2. *Usar filtros*: Traditional filter bar with structured dropdowns (Tipo de propiedad, Ubicación, Rango de precio) accompanied by pill chips for quick selection (e.g., Casas, Departamentos, En planos, Suites).
- **Search Execution**: High-contrast black button (`#111111`), 48px height, 8px radius.

### Standard Property Card
- **Image Container**: Aspect ratio 16:10 with 12px top-corner clipping.
- **Badges & Overlays**:
  - *Operation Label*: Semi-transparent dark pill or white pill top-left (e.g., "Venta").
  - *Exclusive Tag*: Top-left underneath operation tag: Gold text (`#C9A25C`) on solid architectural black (`#111111`) reading "Exclusiva RG".
  - *Favorite Action*: Circular 36px white button with subtle heart outline top-right.
  - *Status Badge*: Positioned over image or card header using functional semantic tokens (e.g., "Disponible" `#2F6B57` on `#E4F0EB`; "En Construcción" `#3A5F8A` on `#E3EBF4`).
- **Card Body**:
  - *Valuation*: Prominent price in `Montserrat 700` (`price-display`).
  - *Title & Zone*: Listing title in `Montserrat 600`, followed strictly by the broad zone/neighborhood (no precise street address) in `Inter 400` (`#6B6560`).
  - *Specs Row*: 3 feature metrics with crisp monochrome icons (Bedrooms, Bathrooms, Total m²).
  - *Description*: 2-line clamped summary in `Inter 400` (`#6B6560`).

### Buttons & Inputs
- **Primary Button**: Solid `#111111` fill, `#FFFFFF` text, 48px height, 8px radius, padding `0 24px`, font `Inter 500`. Hover subtle fade (`opacity: 0.92`).
- **Secondary / Outline Button**: Transparent fill, `#111111` text, border `1px solid #ECEAE7`, hover border `#111111`.
- **Form Inputs**: 48px height, 8px radius, border `1px solid #ECEAE7`, background `#FFFFFF`, text `#111111`, placeholder `#6B6560`. Focus state: `1.5px solid #111111`.

### Checkboxes & Radio Buttons
- Custom 20x20px square controls (checkbox) or circles (radios) with `1.5px solid #6B6560`. Checked state fills `#111111` with white checkmark/dot.

### Footer
- High-integrity architectural multi-column footer over background `#F5F3F1` with top border `1px solid #ECEAE7`.
- Columns: Corporate presentation & RG circular mark, Cuenca office headquarters, Miami representative office, Property types, and Legal / Licensure compliance. Bottom copyright line in `#6B6560`.