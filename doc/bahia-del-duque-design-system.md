# Design System — Bahía del Duque
**The Tais Hotels** · Tema: `Tais v2.0` · Rediseño 2022

---

## 1. Tipografía

### Familias

| Rol | Familia | Uso |
|-----|---------|-----|
| **Display / Headings** | `DomaineDisplay-Regular` (serif) | H1–H6 globalmente |
| **Script / Accent** | `BrushineCollection-Script` (serif) | Clase `.brushine`, títulos especiales |
| **Display Alt** | `shelby` (sans-serif) | Hero titles (`.header-big-title h1`, `.tais-title-hand h2`) |
| **Caps / UI** | `Oswald` (sans-serif) | Elementos uppercase, secciones especiales |
| **Body** | `Open Sans` 300, 400 (sans-serif) | Texto corrido, UI general |

### Escala tipográfica

| Token | Valor | Uso |
|-------|-------|-----|
| `--text-xs` | 9px | Micro labels |
| `--text-sm` | 11–12px | Captions, metadata |
| `--text-base` | 13–14px | Body text, UI |
| `--text-md` | 15–16px | Body destacado |
| `--text-lg` | 18–20px | Subtítulos, intro |
| `--text-xl` | 22–24px | Sección titles |
| `--text-2xl` | 28–30px | H3/H4 |
| `--text-3xl` | 40–46px | H1/H2 hero |
| `--text-4xl` | 70–80px | Display hero full |

---

## 2. Paleta de color

### Colores de marca — Dorado (Pantone 871)

> Comentario en código: *"Pantone dorado 871, gris Warm Gray 8"*

| Token | Hex | Uso |
|-------|-----|-----|
| `--gold-100` | `#807451` | Color dorado principal, títulos `.tais-title-hand` |
| `--gold-80` | `#999174` | Variante media |
| `--gold-60` | `#bfbaa8` | Variante clara, navbar scroll |
| `--gold-accent` | `#a08f6b` | CTAs sobre fondo oscuro (newsletter submit) |
| `--gold-light` | `#cab684` | Textos destacados sobre fondos claros |

### Colores neutros — Warm Gray

| Token | Hex | Uso |
|-------|-----|-----|
| `--gray-900` | `#212121` | Texto muy oscuro |
| `--gray-800` | `#333333` | Fondo oscuro, footer |
| `--gray-700` | `#3b3b3b` | Fondo botones oscuros |
| `--gray-600` | `#555555` | Texto secundario |
| `--gray-500` | `#676666` | Texto medio |
| `--gray-400` | `#848484` | Texto apagado, iconos |
| `--gray-350` | `#8a8078` | Navbar background (scroll) |
| `--gray-300` | `#8b8683` | Elementos UI |
| `--gray-250` | `#8d8f91` | Texto nav |
| `--gray-200` | `#9c9c9c` | Placeholders |
| `--gray-150` | `#bfbaa8` | Bordes, separadores |
| `--gray-100` | `#d1d0cc` | Fondos claros |
| `--gray-50` | `#eaeae5` | Fondos casi blancos |
| `--gray-25` | `#f9f8f6` | Background general |
| `--white` | `#ffffff` | Base |

### Colores funcionales

| Token | Hex | Uso |
|-------|-----|-----|
| `--overlay-dark` | `rgba(0,0,0,0.55)` | Overlay sobre imágenes |
| `--overlay-medium` | `rgba(0,0,0,0.30)` | Overlay suave |
| `--overlay-warm` | `rgba(147,138,130,0.75)` | Overlay cálido de marca |
| `--overlay-white` | `rgba(255,255,255,0.50)` | Overlay blanco |
| `--navbar-scroll` | `#bfbaa8de` | Navbar en scroll (con alfa) |

---

## 3. Tokens CSS — Variables

```css
:root {
  /* === TIPOGRAFÍA === */
  --font-display:     'DomaineDisplay-Regular', serif;
  --font-script:      'BrushineCollection-Script', serif;
  --font-display-alt: shelby, sans-serif;
  --font-caps:        'Oswald', sans-serif;
  --font-body:        'Open Sans', sans-serif;

  --text-xs:   9px;
  --text-sm:   12px;
  --text-base: 14px;
  --text-md:   16px;
  --text-lg:   20px;
  --text-xl:   24px;
  --text-2xl:  30px;
  --text-3xl:  46px;
  --text-4xl:  80px;

  /* === PALETA DORADO (Pantone 871) === */
  --gold-100:    #807451;
  --gold-80:     #999174;
  --gold-60:     #bfbaa8;
  --gold-accent: #a08f6b;
  --gold-light:  #cab684;

  /* === PALETA WARM GRAY === */
  --gray-900: #212121;
  --gray-800: #333333;
  --gray-700: #3b3b3b;
  --gray-500: #676666;
  --gray-400: #848484;
  --gray-350: #8a8078;
  --gray-250: #8d8f91;
  --gray-200: #9c9c9c;
  --gray-150: #bfbaa8;
  --gray-100: #d1d0cc;
  --gray-50:  #eaeae5;
  --gray-25:  #f9f8f6;
  --white:    #ffffff;

  /* === OVERLAYS === */
  --overlay-dark:   rgba(0, 0, 0, 0.55);
  --overlay-medium: rgba(0, 0, 0, 0.30);
  --overlay-warm:   rgba(147, 138, 130, 0.75);
  --overlay-white:  rgba(255, 255, 255, 0.50);
  --navbar-scroll-bg: #bfbaa8de;

  /* === SPACING === */
  --space-xs:   5px;
  --space-sm:   10px;
  --space-md:   20px;
  --space-lg:   40px;
  --space-xl:   60px;
  --space-2xl:  90px;
  --space-hero: 240px;

  /* === BORDER === */
  --radius-sm: 3px;
  --radius-md: 0px; /* estilo cuadrado, sin redondeos */
}
```

---

## 4. Componentes

### Navbar

- Transparente por defecto sobre hero (fondo imagen)
- Al scroll: `background-color: #bfbaa8de` (warm gray con alfa)
- Logo: `.logo-main` sobre hero / `.logo-scroll` al hacer scroll
- Texto nav: `#8d8f91`, `font-size: 13px`, Open Sans
- Mobile: menú hamburguesa

### Botones

```css
/* Primario — sobre fondos oscuros */
.btn-primary {
  background-color: var(--gray-700);  /* #3b3b3b */
  color: var(--gold-accent);          /* #a08f6b */
  font-family: var(--font-body);
  font-weight: 100;
  padding: 6px 12px;
  border: 0;
  border-radius: var(--radius-sm);    /* 3px */
}

/* Secundario — sobre fondos claros */
.btn-secondary {
  background: transparent;
  border: 1px solid var(--gray-400);
  color: var(--gray-400);
}
```

### Headings

```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display); /* DomaineDisplay-Regular */
}

/* Hero display */
.header-big-title h1,
.tais-title-hand h2 {
  font-family: var(--font-display-alt); /* shelby */
  font-size: var(--text-3xl);           /* 46px */
  color: var(--gold-100);               /* #807451 */
}

/* Accent script */
.brushine {
  font-family: var(--font-script); /* BrushineCollection-Script */
}
```

### Hero / Fullscreen sections

- Padding vertical: `240px` desktop / `180px` tablet / `60px` mobile
- Overlay: `rgba(0,0,0,0.30–0.55)` sobre imagen
- Texto: `#ffffff`

### Footer

- Background: `#333333`
- Texto: `#848484` / `#d1d0cc`
- Links: `#eaeae5`

### Newsletter / Forms

- Submit button: fondo `#3b3b3b`, texto `#a08f6b`
- Inputs: `font-size: 14px`, fondo `#f8f7f7`

---

## 5. Resumen de paleta (para Claude Design)

```
Primario:    #807451  — Dorado Pantone 871
Secundario:  #8a8078  — Warm Gray 8
Acento:      #a08f6b  — Dorado medio
Fondo:       #f9f8f6  — Warm White
Texto dark:  #3b3b3b
Texto light: #848484
```

**Estilo**: luxury hotel · warm minimalism · editorial serif · sin azules ni morados

---

## 6. Grid y layout

- Max-width: `1170px`
- Bootstrap grid (`.container`, `.row`, `.col-*`)
- Breakpoints: `< 768px` / `768–1169px` / `≥ 1170px`
- Page builder: WPBakery / Visual Composer

---

## 7. Iconografía

- Font Awesome 4.7 + Font Awesome 5 Free
- Slick Slider para carruseles

---

## 8. Instrucciones para Claude Design

1. Ir a `claude.ai/design` → crear organización **Zaguán Estudio**
2. En onboarding, subir este documento `.md`
3. Adjuntar capturas de pantalla de la home y páginas interiores del hotel
4. Describir el sistema como: *"Luxury hotel brand, warm editorial aesthetic, serif display typography, gold and warm gray palette, no borders/radius"*
5. Validar con prompt de prueba: *"Crea una página de habitaciones para Bahía del Duque"*
