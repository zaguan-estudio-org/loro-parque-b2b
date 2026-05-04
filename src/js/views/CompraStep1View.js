/**
 * CompraStep1View — Paso 1: selección de fecha y cantidades
 * Simula HIBDisponible al cambiar la fecha
 */
import { Icons } from '../utils/icons.js';
import { Formatters } from '../utils/formatters.js';

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const WEEK_DAYS = ['Lu','Ma','Mi','Ju','Vi','Sa','Do'];

const STEP_INDICATOR = `
  <div class="steps">
    <div class="step step--active">
      <div class="step__number">1</div>
      <span class="step__label">Selección</span>
    </div>
    <div class="step__connector"></div>
    <div class="step">
      <div class="step__number">2</div>
      <span class="step__label">Resumen</span>
    </div>
    <div class="step__connector"></div>
    <div class="step">
      <div class="step__number">3</div>
      <span class="step__label">Confirmación</span>
    </div>
  </div>
`;

export class CompraStep1View {
  #el;
  #onSiguiente;
  #onVolver;
  #api;
  #spinner;
  #parque;
  #productos = [];
  #cantidades = {};
  #fecha = Formatters.tomorrowISO();
  #calYear;
  #calMonth;

  constructor({ api, spinner, parque, onSiguiente, onVolver }) {
    this.#api         = api;
    this.#spinner     = spinner;
    this.#parque      = parque;
    this.#onSiguiente = onSiguiente;
    this.#onVolver    = onVolver;

    const d = new Date(this.#fecha + 'T00:00:00');
    this.#calYear  = d.getFullYear();
    this.#calMonth = d.getMonth();

    this.#el = document.createElement('div');
    this.#el.innerHTML = this.#skeleton();
    this.#renderCalendar();
    this.#bindStaticEvents();
    this.#loadProductos();
  }

  #skeleton() {
    const weekdaysHtml = WEEK_DAYS.map(d =>
      `<span class="cal__weekday">${d}</span>`
    ).join('');

    return `
      ${STEP_INDICATOR}

      <div class="page-header" style="margin-top:8px">
        <div>
          <h2 class="page-header__title">Nueva Venta — ${this.#parque.nombre}</h2>
          <p class="page-header__subtitle">Selecciona la fecha de visita y el número de entradas</p>
        </div>
        <button class="btn btn--ghost js-volver">${Icons.arrowLeft} Volver</button>
      </div>

      <div class="compra-layout">
        <div style="display:flex;flex-direction:column;gap:var(--space-5)">

          <div class="cal">
            <div class="cal__header">
              <button class="cal__nav js-cal-prev" aria-label="Mes anterior">
                ${Icons.arrowLeft}
              </button>
              <span class="cal__month-label js-cal-label"></span>
              <button class="cal__nav js-cal-next" aria-label="Mes siguiente">
                ${Icons.arrowRight}
              </button>
            </div>
            <div class="cal__weekdays">${weekdaysHtml}</div>
            <div class="cal__grid js-cal-grid"></div>
            <div class="cal__status js-fecha-status"></div>
          </div>

          <div class="compra-products js-products">
            <div style="text-align:center;padding:40px;color:var(--muted-foreground)">
              Consultando disponibilidad...
            </div>
          </div>
        </div>

        <div>
          <div class="compra-sidebar-card">
            <div class="compra-sidebar-card__header">
              <div class="compra-sidebar-card__title">Resumen</div>
            </div>
            <div class="compra-sidebar-card__body js-resumen-body">
              <p style="font-size:13px;color:var(--muted-foreground)">Selecciona entradas para ver el resumen</p>
            </div>
            <div class="compra-sidebar-card__footer">
              <div class="summary-row summary-row--total" style="padding-top:8px">
                <span class="summary-row__label" style="font-size:16px">Total</span>
                <span class="summary-row__value js-total" style="font-size:22px;color:var(--primary)">0,00 €</span>
              </div>
              <button class="btn btn--primary btn--full js-siguiente" disabled>
                Siguiente — Revisar pedido
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  #renderCalendar() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const year  = this.#calYear;
    const month = this.#calMonth;

    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth  = new Date(year, month + 1, 0);

    // Monday-based offset (getDay: 0=Sun → put at end)
    let startOffset = firstOfMonth.getDay();
    startOffset = startOffset === 0 ? 6 : startOffset - 1;

    const selectedDate = new Date(this.#fecha + 'T00:00:00');

    // Label
    const label = this.#el.querySelector('.js-cal-label');
    if (label) label.textContent = `${MONTH_NAMES[month]} ${year}`;

    // Prev button — disable if already on current month
    const prevBtn = this.#el.querySelector('.js-cal-prev');
    if (prevBtn) {
      const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
      prevBtn.disabled = isCurrentMonth;
    }

    const grid = this.#el.querySelector('.js-cal-grid');
    if (!grid) return;

    let html = '';

    // Leading days from previous month
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      html += `<button class="cal__day cal__day--other-month" disabled>${d.getDate()}</button>`;
    }

    // Current month days
    for (let d = 1; d <= lastOfMonth.getDate(); d++) {
      const date = new Date(year, month, d);
      const isDisabled   = date < tomorrow;
      const isToday      = date.getTime() === today.getTime();
      const isSelected   = date.getTime() === selectedDate.getTime();
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      const classes = [
        'cal__day',
        isToday    ? 'cal__day--today'    : '',
        isSelected ? 'cal__day--selected' : '',
        isDisabled ? 'cal__day--disabled' : '',
      ].filter(Boolean).join(' ');

      html += `<button class="${classes}" data-date="${iso}" ${isDisabled ? 'disabled' : ''}>${d}</button>`;
    }

    // Trailing days from next month to complete last row
    const totalCells   = startOffset + lastOfMonth.getDate();
    const trailingDays = (7 - (totalCells % 7)) % 7;
    for (let d = 1; d <= trailingDays; d++) {
      html += `<button class="cal__day cal__day--other-month" disabled>${d}</button>`;
    }

    grid.innerHTML = html;

    // Day click
    grid.querySelectorAll('.cal__day:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        this.#fecha = btn.dataset.date;
        this.#renderCalendar();
        this.#loadProductos();
      });
    });
  }

  #bindStaticEvents() {
    this.#el.querySelector('.js-volver')?.addEventListener('click', () => this.#onVolver());

    this.#el.addEventListener('click', e => {
      if (e.target.classList.contains('js-siguiente') && !e.target.disabled) {
        this.#onSiguiente(this.#buildCart());
      }
    });

    this.#el.querySelector('.js-cal-prev')?.addEventListener('click', () => {
      if (this.#calMonth === 0) { this.#calMonth = 11; this.#calYear--; }
      else { this.#calMonth--; }
      this.#renderCalendar();
    });

    this.#el.querySelector('.js-cal-next')?.addEventListener('click', () => {
      if (this.#calMonth === 11) { this.#calMonth = 0; this.#calYear++; }
      else { this.#calMonth++; }
      this.#renderCalendar();
    });
  }

  async #loadProductos() {
    const statusEl  = this.#el.querySelector('.js-fecha-status');
    const productsEl = this.#el.querySelector('.js-products');
    if (!productsEl) return;

    if (statusEl) {
      statusEl.className = 'cal__status';
      statusEl.textContent = 'Consultando disponibilidad…';
    }

    productsEl.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--muted-foreground)">
        <div class="spinner" style="margin:0 auto 12px"></div>
        Consultando disponibilidad...
      </div>`;

    try {
      const result = await this.#api.hibDisponible(this.#fecha);
      this.#productos = result.productos;
      const ids = new Set(this.#productos.map(p => p.productoId));
      Object.keys(this.#cantidades).forEach(k => { if (!ids.has(k)) delete this.#cantidades[k]; });
      if (statusEl) {
        statusEl.className = 'cal__status cal__status--ok';
        const d = new Date(this.#fecha + 'T00:00:00');
        statusEl.textContent = `✓ Disponible · ${Formatters.date(this.#fecha)}`;
      }
      this.#renderProductos();
    } catch {
      if (statusEl) {
        statusEl.className = 'cal__status';
        statusEl.textContent = 'Sin disponibilidad para esta fecha';
      }
      productsEl.innerHTML = `<div style="text-align:center;padding:40px;color:var(--color-error)">Sin disponibilidad para la fecha seleccionada</div>`;
    }
  }

  #renderProductos() {
    const container = this.#el.querySelector('.js-products');
    if (!container) return;

    const sorted = [...this.#productos].sort((a, b) => a.ordenTarifa - b.ordenTarifa);
    container.innerHTML = sorted.map(p => {
      const qty    = this.#cantidades[p.productoId] || 0;
      const isFree = p.pvpInternet === 0;
      return `
        <div class="product-card" data-pid="${p.productoId}">
          <div class="product-card__info">
            <div class="product-card__name">${p.nombreProducto}</div>
            <div class="product-card__desc">${p.descripcion}</div>
          </div>
          <div style="display:flex;align-items:center;gap:20px">
            ${isFree
              ? `<span class="product-card__price-free">Gratuita</span>`
              : `<span class="product-card__price">${Formatters.currency(p.pvpInternet)}</span>`
            }
            <div class="qty-selector">
              <button class="qty-selector__btn js-qty-minus" data-pid="${p.productoId}" ${qty === 0 ? 'disabled' : ''}>−</button>
              <div class="qty-selector__value js-qty-val-${p.productoId}">${qty}</div>
              <button class="qty-selector__btn js-qty-plus" data-pid="${p.productoId}" ${qty >= p.maximoTarifa ? 'disabled' : ''}>+</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.#bindQtyEvents();
    this.#updateSidebar();
  }

  #bindQtyEvents() {
    this.#el.querySelectorAll('.js-qty-minus, .js-qty-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid     = btn.dataset.pid;
        const producto = this.#productos.find(p => p.productoId === pid);
        if (!producto) return;
        const current = this.#cantidades[pid] || 0;
        const delta   = btn.classList.contains('js-qty-plus') ? 1 : -1;
        const next    = Math.max(0, Math.min(producto.maximoTarifa, current + delta));
        this.#cantidades[pid] = next;
        this.#el.querySelector(`.js-qty-val-${pid}`).textContent = next;
        btn.closest('.qty-selector').querySelector('.js-qty-minus').disabled = next === 0;
        btn.closest('.qty-selector').querySelector('.js-qty-plus').disabled  = next >= producto.maximoTarifa;
        this.#updateSidebar();
      });
    });
  }

  #updateSidebar() {
    const selectedItems = this.#productos
      .filter(p => (this.#cantidades[p.productoId] || 0) > 0)
      .map(p => ({ ...p, cantidad: this.#cantidades[p.productoId] }));

    const total = selectedItems.reduce((acc, p) => acc + p.pvpInternet * p.cantidad, 0);

    const resumenEl    = this.#el.querySelector('.js-resumen-body');
    const totalEl      = this.#el.querySelector('.js-total');
    const siguienteBtn = this.#el.querySelector('.js-siguiente');

    if (resumenEl) {
      resumenEl.innerHTML = selectedItems.length === 0
        ? `<p style="font-size:13px;color:var(--muted-foreground)">Selecciona entradas para ver el resumen</p>`
        : selectedItems.map(p => `
            <div class="summary-row">
              <span class="summary-row__label">${p.cantidad}× ${p.nombreProducto}</span>
              <span class="summary-row__value">${Formatters.currency(p.pvpInternet * p.cantidad)}</span>
            </div>
          `).join('');
    }

    if (totalEl) totalEl.textContent = Formatters.currency(total);
    if (siguienteBtn) siguienteBtn.disabled = selectedItems.length === 0;
  }

  #buildCart() {
    const productos = this.#productos
      .filter(p => (this.#cantidades[p.productoId] || 0) > 0)
      .map(p => ({ ...p, cantidad: this.#cantidades[p.productoId] }));
    return { fecha: this.#fecha, parque: this.#parque, productos };
  }

  getElement() { return this.#el; }
}
