/**
 * CompraStep1View — Paso 1: selección de fecha y cantidades
 * Simula HIBDisponible al cambiar la fecha
 */
import { Icons } from '../utils/icons.js';
import { Formatters } from '../utils/formatters.js';

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

  constructor({ api, spinner, parque, onSiguiente, onVolver }) {
    this.#api      = api;
    this.#spinner  = spinner;
    this.#parque   = parque;
    this.#onSiguiente = onSiguiente;
    this.#onVolver    = onVolver;
    this.#el = document.createElement('div');
    this.#el.innerHTML = this.#skeleton();
    this.#bindStaticEvents();
    this.#loadProductos();
  }

  #skeleton() {
    return `
      ${STEP_INDICATOR}

      <div class="page-header" style="margin-top:8px">
        <div>
          <h2 class="page-header__title">Nueva Reserva — ${this.#parque.nombre}</h2>
          <p class="page-header__subtitle">Selecciona la fecha de visita y el número de entradas</p>
        </div>
        <button class="btn btn--ghost js-volver">${Icons.arrowLeft} Volver</button>
      </div>

      <div class="card" style="padding:20px">
        <div style="display:flex;align-items:center;gap:16px">
          <label style="font-size:13px;font-weight:600;color:var(--foreground)">Fecha de visita</label>
          <div class="date-input-wrap">
            ${Icons.calendar}
            <input type="date" class="js-fecha" value="${this.#fecha}" min="${Formatters.tomorrowISO()}" />
          </div>
          <span class="js-fecha-status" style="font-size:12px;color:var(--muted-foreground)"></span>
        </div>
      </div>

      <div class="compra-layout">
        <div>
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

  #bindStaticEvents() {
    this.#el.querySelector('.js-volver')?.addEventListener('click', () => this.#onVolver());
    this.#el.addEventListener('click', e => {
      if (e.target.classList.contains('js-siguiente') && !e.target.disabled) {
        this.#onSiguiente(this.#buildCart());
      }
    });
    this.#el.querySelector('.js-fecha')?.addEventListener('change', e => {
      this.#fecha = e.target.value;
      this.#loadProductos();
    });
  }

  async #loadProductos() {
    const statusEl = this.#el.querySelector('.js-fecha-status');
    const productsEl = this.#el.querySelector('.js-products');
    if (!productsEl) return;

    if (statusEl) statusEl.textContent = 'Consultando disponibilidad...';
    productsEl.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted-foreground)">
      <div class="spinner" style="margin:0 auto 12px"></div>
      Consultando disponibilidad...
    </div>`;

    try {
      const result = await this.#api.hibDisponible(this.#fecha);
      this.#productos = result.productos;
      // Limpia cantidades de productos que ya no existen (ADR-03)
      const ids = new Set(this.#productos.map(p => p.productoId));
      Object.keys(this.#cantidades).forEach(k => { if (!ids.has(k)) delete this.#cantidades[k]; });
      if (statusEl) statusEl.textContent = '✓ Disponible';
      this.#renderProductos();
    } catch {
      if (statusEl) statusEl.textContent = 'Sin disponibilidad para esta fecha';
      productsEl.innerHTML = `<div style="text-align:center;padding:40px;color:var(--color-error)">Sin disponibilidad para la fecha seleccionada</div>`;
    }
  }

  #renderProductos() {
    const container = this.#el.querySelector('.js-products');
    if (!container) return;

    const sorted = [...this.#productos].sort((a, b) => a.ordenTarifa - b.ordenTarifa);
    container.innerHTML = sorted.map(p => {
      const qty = this.#cantidades[p.productoId] || 0;
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
        const pid = btn.dataset.pid;
        const producto = this.#productos.find(p => p.productoId === pid);
        if (!producto) return;
        const current = this.#cantidades[pid] || 0;
        const delta = btn.classList.contains('js-qty-plus') ? 1 : -1;
        const next = Math.max(0, Math.min(producto.maximoTarifa, current + delta));
        this.#cantidades[pid] = next;
        this.#el.querySelector(`.js-qty-val-${pid}`).textContent = next;
        btn.closest('.qty-selector').querySelector('.js-qty-minus').disabled = next === 0;
        btn.closest('.qty-selector').querySelector('.js-qty-plus').disabled = next >= producto.maximoTarifa;
        this.#updateSidebar();
      });
    });
  }

  #updateSidebar() {
    const selectedItems = this.#productos
      .filter(p => (this.#cantidades[p.productoId] || 0) > 0)
      .map(p => ({ ...p, cantidad: this.#cantidades[p.productoId] }));

    const total = selectedItems.reduce((acc, p) => acc + p.pvpInternet * p.cantidad, 0);

    const resumenEl = this.#el.querySelector('.js-resumen-body');
    const totalEl   = this.#el.querySelector('.js-total');
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
