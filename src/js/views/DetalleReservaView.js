/**
 * DetalleReservaView — Ficha completa de una reserva con opción de anulación
 */
import { Icons } from '../utils/icons.js';
import { Formatters } from '../utils/formatters.js';

const ESTADO_MAP = {
  active:    { label: 'Activa',    cls: 'badge--active' },
  pending:   { label: 'Pendiente', cls: 'badge--pending' },
  cancelled: { label: 'Cancelada', cls: 'badge--cancelled' },
};

export class DetalleReservaView {
  #el;
  #onVolver;
  #onAnular;
  #reserva = null;

  constructor({ onVolver, onAnular }) {
    this.#onVolver = onVolver;
    this.#onAnular = onAnular;
    this.#el = document.createElement('div');
  }

  setReserva(reserva) {
    this.#reserva = reserva;
    this.#render();
  }

  #render() {
    const r = this.#reserva;
    if (!r) return;

    const estado = ESTADO_MAP[r.estado] || ESTADO_MAP.active;
    const productos = r.productos.map(p =>
      `<div class="summary-row">
        <span class="summary-row__label">${p.nombre}</span>
        <span class="summary-row__value">${p.cantidad}× ${Formatters.currency(this.#precioUnitario(p.nombre))}</span>
      </div>`
    ).join('');

    const canAnular = r.estado === 'active';

    this.#el.innerHTML = `
      <div class="page-header">
        <div style="display:flex;align-items:center;gap:12px">
          <button class="btn btn--ghost js-volver" style="padding:8px">
            ${Icons.arrowLeft}
          </button>
          <div>
            <h2 class="page-header__title">${r.localizador}</h2>
            <p class="page-header__subtitle">Detalle del ticket</p>
          </div>
        </div>
        <div class="page-header__actions">
          ${canAnular ? `
            <button class="btn btn--danger js-anular">
              ${Icons.x}
              Anular ticket
            </button>
          ` : ''}
        </div>
      </div>

      <div class="detalle-grid">
        <div style="display:flex;flex-direction:column;gap:20px">
          <div class="card">
            <div class="card__header">
              <div class="card__title">Información del ticket</div>
            </div>
            <div class="card__body">
              <div class="detalle-fields-grid">
                <div class="detalle-field">
                  <span class="detalle-field__label">Localizador</span>
                  <span class="detalle-field__value" style="font-family:var(--font-display);font-size:18px;color:var(--primary)">${r.localizador}</span>
                </div>
                <div class="detalle-field">
                  <span class="detalle-field__label">Estado</span>
                  <span class="badge ${estado.cls}">${estado.label}</span>
                </div>
                <div class="detalle-field">
                  <span class="detalle-field__label">Fecha de visita</span>
                  <span class="detalle-field__value">${Formatters.date(r.fecha)}</span>
                </div>
                <div class="detalle-field">
                  <span class="detalle-field__label">Parque</span>
                  <span class="detalle-field__value">${r.parque}</span>
                </div>
                <div class="detalle-field">
                  <span class="detalle-field__label">Nº Pedido</span>
                  <span class="detalle-field__value">${r.pedido}</span>
                </div>
                <div class="detalle-field">
                  <span class="detalle-field__label">Forma de pago</span>
                  <span class="detalle-field__value">Diferido (DP)</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card__header">
              <div class="card__title">Entradas emitidas</div>
            </div>
            <div class="card__body">
              <div class="alert alert--info" style="margin-bottom:16px">
                ${Icons.info}
                <span>Modalidad: pago diferido. Las entradas se liquidan mensualmente según acuerdo de agencia.</span>
              </div>
              ${productos}
              <div class="summary-row summary-row--total">
                <span class="summary-row__label">Total ticket</span>
                <span class="summary-row__value">${Formatters.currency(r.importeTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:20px">
          <div class="card">
            <div class="card__header">
              <div class="card__title">Código del ticket</div>
            </div>
            <div class="card__body">
              <div class="localizador-box">
                <div class="localizador-box__label">Localizador</div>
                <div class="localizador-box__code">${r.localizador}</div>
                <div class="barcode js-barcode"></div>
              </div>
            </div>
          </div>

          ${canAnular ? `
          <div class="card" style="border-color:var(--color-error)">
            <div class="card__header">
              <div class="card__title" style="color:var(--color-error)">Zona de riesgo</div>
            </div>
            <div class="card__body">
              <p style="font-size:13px;color:var(--muted-foreground);margin-bottom:16px">
                La anulación libera el aforo reservado y no puede deshacerse.
                El proceso invoca <code>AnularVentaReserva</code> en la API.
              </p>
              <button class="btn btn--danger btn--full js-anular">
                ${Icons.x}
                Anular este ticket
              </button>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `;

    this.#generateBarcode();
    this.#bindEvents();
  }

  #generateBarcode() {
    const container = this.#el.querySelector('.js-barcode');
    if (!container) return;
    const heights = [40,28,40,20,36,28,40,20,40,28,32,40,20,36,28,40,20,28,40,32,20,40,28,36];
    container.innerHTML = heights.map(h =>
      `<div class="barcode__bar" style="height:${h}px"></div>`
    ).join('');
  }

  #precioUnitario(nombre) {
    const precios = {
      'Entrada Adulto':    30.80,
      'Entrada Niño':      22.50,
      'Entrada Free':       0.00,
      'Entrada Residente': 15.00,
    };
    return precios[nombre] ?? 0;
  }

  #bindEvents() {
    this.#el.querySelector('.js-volver')?.addEventListener('click', () => this.#onVolver());
    this.#el.querySelectorAll('.js-anular').forEach(btn =>
      btn.addEventListener('click', () => this.#onAnular(this.#reserva.localizador))
    );
  }

  getElement() { return this.#el; }
}
