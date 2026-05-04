/**
 * DashboardView — KPIs del mes y acceso rápido a nueva reserva
 */
import { Icons } from '../utils/icons.js';

const ULTIMAS_RESERVAS = [
  { localizador: 'TEST847291', fecha: '2 may 2026', parque: 'Loro Parque', entradas: '2 Ad · 1 Ni', importe: '84,10 €', estado: 'active',    estadoLabel: 'Activa' },
  { localizador: 'TEST821063', fecha: '1 may 2026', parque: 'Siam Park',   entradas: '4 Ad · 2 Ni · 1 Fr', importe: '167,40 €', estado: 'pending',   estadoLabel: 'Pendiente' },
  { localizador: 'TEST809442', fecha: '30 abr 2026', parque: 'Loro Parque', entradas: '1 Re · 1 Ni', importe: '37,50 €',  estado: 'cancelled', estadoLabel: 'Cancelada' },
  { localizador: 'TEST798316', fecha: '29 abr 2026', parque: 'Siam Park',  entradas: '3 Ad', importe: '92,70 €',  estado: 'active',    estadoLabel: 'Activa' },
];

const BADGE_MAP = {
  active:    'badge--active',
  pending:   'badge--pending',
  cancelled: 'badge--cancelled',
};

export class DashboardView {
  #el;
  #onNuevaReserva;
  #onReservas;

  constructor({ onNuevaReserva, onReservas }) {
    this.#onNuevaReserva = onNuevaReserva;
    this.#onReservas = onReservas;
    this.#el = document.createElement('div');
    this.#el.innerHTML = this.#template();
    this.#el.querySelectorAll('.js-nueva-reserva-btn')
      .forEach(btn => btn.addEventListener('click', () => this.#onNuevaReserva()));
    this.#el.querySelectorAll('.js-ver-reservas-btn')
      .forEach(btn => btn.addEventListener('click', () => this.#onReservas()));
  }

  #template() {
    const filas = ULTIMAS_RESERVAS.map(r => `
      <tr>
        <td><span class="mono">${r.localizador}</span></td>
        <td>${r.fecha}</td>
        <td>${r.parque}</td>
        <td style="color:var(--muted-foreground)">${r.entradas}</td>
        <td style="font-weight:600">${r.importe}</td>
        <td><span class="badge ${BADGE_MAP[r.estado]}">${r.estadoLabel}</span></td>
      </tr>
    `).join('');

    return `
      <div class="page-header">
        <div>
          <h2 class="page-header__title">Venta de Tickets</h2>
          <p class="page-header__subtitle">Portal B2B · Entradas Loro Parque &amp; Siam Park</p>
        </div>
        <div class="page-header__actions">
          <button class="btn btn--secondary js-ver-reservas-btn">
            ${Icons.reservas}
            Ver tickets
          </button>
          <button class="btn btn--primary js-nueva-reserva-btn">
            ${Icons.plus}
            Nueva Venta
          </button>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-card__label">Tickets este mes</div>
          <div class="kpi-card__value">249</div>
          <div class="kpi-card__sub kpi-card__sub--positive">+12% vs mes anterior</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card__label">Importe total (neto)</div>
          <div class="kpi-card__value">18.872 €</div>
          <div class="kpi-card__sub">Pago diferido</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card__label">Entradas emitidas</div>
          <div class="kpi-card__value">584</div>
          <div class="kpi-card__sub">LP: 414 · SP: 170</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card__label">Pendientes de pago</div>
          <div class="kpi-card__value">7</div>
          <div class="kpi-card__sub kpi-card__sub--warning">Requieren revisión</div>
        </div>
      </div>

      <div class="table-wrapper">
        <div class="table-toolbar">
          <div class="table-toolbar__left">
            <span class="table-toolbar__title">Últimas ventas</span>
          </div>
          <div class="table-toolbar__right">
            <button class="btn btn--ghost js-ver-reservas-btn">Ver todas ${Icons.arrowRight}</button>
          </div>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Localizador</th>
              <th>Fecha visita</th>
              <th>Parque</th>
              <th>Entradas</th>
              <th>Importe</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
          </tbody>
        </table>
      </div>

      <div class="alert alert--info">
        ${Icons.info}
        <div>
          <strong>Sistema en fase de validación.</strong>
          Los datos corresponden al entorno de preproducción. Las credenciales de agencia real están pendientes de activación por parte de Loro Parque.
        </div>
      </div>
    `;
  }

  getElement() { return this.#el; }
}
