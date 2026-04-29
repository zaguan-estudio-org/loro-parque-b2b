# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Contexto del proyecto

Prototipo interactivo de demostración para el cliente **Loro Parque / Grupo CIO**. Simula un portal B2B de venta de entradas (Loro Parque y Siam Park) para agencias de viaje del hotel **Bahía del Duque** (The Tais Hotels). No hay backend real: toda la lógica usa un `MockApiService` con latencia artificial.

El diseño sigue el **design system de Bahía del Duque** documentado en `doc/bahia-del-duque-design-system.md` y el archivo Pencil de referencia en `design/design-system.pen`.

---

## Cómo ejecutar

Requiere servidor HTTP (los ES Modules no funcionan con `file://`):

```bash
python3 -m http.server 3030
# → http://localhost:3030
```

No hay proceso de build, bundler ni dependencias npm. Todo es HTML/CSS/JS nativo con `type="module"`.

**Credenciales de demo:** `agencia@bahiaduque.com` / cualquier contraseña.

---

## Arquitectura

### Patrón general
`App.js` es el controlador central. Las vistas son renderizadores tontos: reciben callbacks, nunca navegan solas. El flujo es: **vista notifica intención → App decide → actualiza estado → monta nueva vista**.

### CSS — 4 capas en orden de carga
| Archivo | Contenido |
|---|---|
| `src/css/tokens.css` | Variables CSS (colores, tipografía, spacing, sombras) |
| `src/css/base.css` | Reset, tipografía global, scrollbar |
| `src/css/components.css` | Botones, badges, inputs, cards, modal, spinner, steps, qty-selector, product-card, table, alert, search-bar, filter-pills, park-selector |
| `src/css/layout.css` | App shell, sidebar, topbar, page-content, kpi-grid, compra-layout, detalle-grid, confirmation-layout |

### JS — estructura
```
src/js/
├── main.js                  # Punto de entrada
├── App.js                   # Controlador principal (navegación + orquestación API)
├── services/
│   ├── AppState.js          # Estado global con observer pattern (set/get/patch/on/off)
│   └── MockApiService.js    # Simula la API B2B con delays (400/900/1400ms)
├── components/
│   ├── PanelShell.js        # Sidebar + topbar + slot de contenido
│   ├── Modal.js             # Diálogo de confirmación (Promise-based)
│   └── Spinner.js           # Overlay de carga
├── utils/
│   ├── icons.js             # SVG inline (lucide-style): dashboard, reservas, nuevaReserva, bell, search, download, plus, eye, check, calendar, arrowLeft, arrowRight, x, alertTriangle, info
│   └── formatters.js        # currency (Intl), date (es-ES), localizador (TEST+6 digits), tomorrowISO, todayISO
└── views/
    ├── LoginView.js          # Formulario pre-rellenado
    ├── DashboardView.js      # KPIs + tabla últimas reservas (datos estáticos mock)
    ├── ReservasView.js       # Tabla con search + filtros parque/estado
    ├── DetalleReservaView.js # Detalle completo + botón Anular (solo si estado === 'active')
    ├── CompraStep0View.js    # Selección de parque (Loro Parque / Siam Park) con logos
    ├── CompraStep1View.js    # Fecha + cantidades por tipo de entrada
    ├── CompraStep2View.js    # Resumen del pedido antes de confirmar
    └── CompraStep3View.js    # Confirmación con localizador y barcode ficticio
```

### Flujo de navegación
```
Login → Dashboard
Dashboard → Nueva Reserva (compra0) → Paso 1 (compra1) → Paso 2 (compra2) → Confirmación (compra3)
Dashboard → Reservas → Detalle → [modal Anular]
Confirmación → Reservas (la nueva reserva aparece en la tabla)
```

`nuevaReserva` y `compra0` apuntan al mismo mount (`#mountCompra0`). El sidebar siempre marca "Nueva Reserva" como activo durante todo el flujo de compra (ver `setActiveNav` en `PanelShell.js`).

### Estado que fluye entre pasos de compra
```
AppState:
  selectedParque   → { id, nombre }  — se guarda en compra0, se lee en compra1
  cart             → { fecha, parque, productos[] } — se guarda en compra1, se lee en compra2
  lastPurchase     → { localizador, pedido, fecha, parque, productos[], importeTotal }
  selectedReserva  → reserva completa del detalle
```

---

## Design system aplicado

**Tipografía:** Playfair Display (display/headings, `var(--font-display)`) + Inter (body/UI, `var(--font-body)`)

**Paleta principal:**
- Dorado primario: `#807451` (`--primary`)
- Dorado acento: `#a08f6b` (`--accent`)
- Dorado claro: `#cab684` (`--accent-light`)
- Sidebar background: `#3b3b3b`
- Background general: `#f9f8f6`
- Card: `#ffffff`
- Border: `#d1d0cc`

**Reglas clave del design system:**
- Sin border-radius en elementos principales (`--radius-none: 0px`)
- Botones: Inter 13px semibold, sin uppercase
- Tipografía de display siempre con `font-weight: 400`
- Labels de campos en uppercase con `letter-spacing` cuando hay jerarquía de información
- El sidebar activo usa `background: var(--sidebar-active-bg)` (#807451) con barra izquierda de 3px en `--accent-light`

---

## API mock simulada

Métodos de `MockApiService` y sus latencias:

| Método | Simula | Latencia |
|---|---|---|
| `iniciarLog(credenciales)` | Autenticación, devuelve `{ token, sessionId }` | 400ms |
| `hibDisponible(fecha)` | Catálogo productos LP Block 1 | 900ms |
| `reservaAforo(params)` | Reserva temporal aforo | 400ms |
| `insercion(params)` | Emite localizador, añade reserva a `#reservas` | 1400ms |
| `traerReservaEstado(localizador)` | Consulta reserva por localizador | 400ms |
| `anularVentaReserva(localizador)` | Cambia estado a `'cancelled'` | 900ms |
| `getReservas()` | Lista completa (seed + nuevas) | 400ms |

**Productos mock (Loro Parque Block 1):**
- Adulto: 30,80 € · ProductoId: 327
- Niño (3-12): 22,50 € · ProductoId: 328
- Free (0-2): 0,00 € · ProductoId: 329
- Residente Canarias: 15,00 € · ProductoId: 330

**ADR-03:** Al cambiar la fecha en paso 1, se limpian del carrito los productos que no devuelva la nueva respuesta de `hibDisponible`.

---

## Flecos pendientes para sesiones futuras

- Revisar espaciados y márgenes en las vistas de compra (paso 1, 2, 3) y detalle de reserva
- Verificar el flujo completo end-to-end: login → compra → confirmación → reservas
- La vista `ReservasView` tiene filtros por parque y estado: comprobar que funcionan correctamente
- `CompraStep3View` muestra un barcode ficticio: revisar presentación visual
- El login tiene las credenciales pre-rellenadas pero el campo password no muestra puntos — revisar
- Ajustar `DetalleReservaView` si hay inconsistencias con el design system
- Logos de parques en `CompraStep0View` cargados desde URLs externas (Wikipedia/Siam Park web) — valorar incluirlos como assets locales para mayor robustez

---

## Archivos de referencia

- `doc/bahia-del-duque-design-system.md` — design system completo del hotel
- `design/design-system.pen` — archivo Pencil con componentes visuales de referencia (leer solo con MCP Pencil, no con Read)
