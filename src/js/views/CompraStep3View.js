/**
 * CompraStep3View — Paso 3: confirmación de reserva emitida
 * Muestra localizador, barcode ficticio y resumen final
 */
import { Icons } from '../utils/icons.js';
import { Formatters } from '../utils/formatters.js';

const STEP_INDICATOR = `
  <div class="steps">
    <div class="step step--done">
      <div class="step__number">${Icons.check}</div>
      <span class="step__label">Selección</span>
    </div>
    <div class="step__connector"></div>
    <div class="step step--done">
      <div class="step__number">${Icons.check}</div>
      <span class="step__label">Resumen</span>
    </div>
    <div class="step__connector"></div>
    <div class="step step--active">
      <div class="step__number">3</div>
      <span class="step__label">Confirmación</span>
    </div>
  </div>
`;

export class CompraStep3View {
  #el;
  #onVerReservas;
  #onNuevaReserva;
  #purchase;

  constructor({ onVerReservas, onNuevaReserva }) {
    this.#onVerReservas  = onVerReservas;
    this.#onNuevaReserva = onNuevaReserva;
    this.#el = document.createElement('div');
  }

  setPurchase(purchase) {
    this.#purchase = purchase;
    this.#render();
  }

  #render() {
    const { localizador, pedido, fecha, productos, importeTotal } = this.#purchase;
    const totalEntradas = productos.reduce((acc, p) => acc + p.cantidad, 0);

    const lineas = productos.map(p => `
      <div class="summary-row">
        <span class="summary-row__label">${p.cantidad}× ${p.nombreProducto}</span>
        <span class="summary-row__value">${Formatters.currency(p.pvpInternet * p.cantidad)}</span>
      </div>
    `).join('');

    this.#el.innerHTML = `
      ${STEP_INDICATOR}

      <div class="confirmation-layout">
        <div style="display:flex;align-items:center;gap:16px">
          <div class="confirmation-icon">
            ${Icons.check}
          </div>
          <div>
            <h2 style="font-family:var(--font-display);font-size:28px;color:var(--foreground)">Reserva emitida</h2>
            <p style="font-size:13px;color:var(--muted-foreground);margin-top:4px">La reserva se ha procesado correctamente</p>
          </div>
        </div>

        <div class="card">
          <div class="card__body">
            <div class="localizador-box">
              <div class="localizador-box__label">Localizador de reserva</div>
              <div class="localizador-box__code">${localizador}</div>
              <div class="barcode js-barcode"></div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card__header">
            <div class="card__title">Detalle de la reserva</div>
          </div>
          <div class="card__body">
            <div class="detalle-fields-grid" style="margin-bottom:20px">
              <div class="detalle-field">
                <span class="detalle-field__label">Localizador</span>
                <span class="detalle-field__value" style="color:var(--primary);font-weight:600">${localizador}</span>
              </div>
              <div class="detalle-field">
                <span class="detalle-field__label">Nº Pedido</span>
                <span class="detalle-field__value">${pedido}</span>
              </div>
              <div class="detalle-field">
                <span class="detalle-field__label">Fecha de visita</span>
                <span class="detalle-field__value">${Formatters.date(fecha)}</span>
              </div>
              <div class="detalle-field">
                <span class="detalle-field__label">Parque</span>
                <span class="detalle-field__value">Loro Parque</span>
              </div>
              <div class="detalle-field">
                <span class="detalle-field__label">Total entradas</span>
                <span class="detalle-field__value">${totalEntradas}</span>
              </div>
              <div class="detalle-field">
                <span class="detalle-field__label">Forma de pago</span>
                <span class="detalle-field__value">Diferido (DP)</span>
              </div>
            </div>
            <div class="divider" style="margin-bottom:16px"></div>
            ${lineas}
            <div class="summary-row summary-row--total">
              <span class="summary-row__label">Total</span>
              <span class="summary-row__value">${Formatters.currency(importeTotal)}</span>
            </div>
          </div>
        </div>

        <div class="alert alert--success">
          ${Icons.check}
          <div>
            <strong>Estado: Activa.</strong> La reserva aparece ahora en el listado de reservas y puede consultarse en cualquier momento por el localizador <strong>${localizador}</strong>.
          </div>
        </div>

        <div style="display:flex;gap:12px;justify-content:flex-end">
          <button class="btn btn--secondary js-nueva-reserva">
            ${Icons.plus}
            Nueva Reserva
          </button>
          <button class="btn btn--primary js-ver-reservas">
            ${Icons.reservas}
            Ver todas las reservas
          </button>
        </div>
      </div>
    `;

    this.#generateBarcode();

    this.#el.querySelector('.js-nueva-reserva').addEventListener('click', () => this.#onNuevaReserva());
    this.#el.querySelector('.js-ver-reservas').addEventListener('click', () => this.#onVerReservas());
  }

  #generateBarcode() {
    const container = this.#el.querySelector('.js-barcode');
    if (!container) return;
    const heights = [40,28,40,20,36,28,40,20,40,28,32,40,20,36,28,40,20,28,40,32,20,40,28,36];
    container.innerHTML = heights.map(h =>
      `<div class="barcode__bar" style="height:${h}px"></div>`
    ).join('');
  }

  getElement() { return this.#el; }
}
