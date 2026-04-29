/**
 * ReservasView — Histórico de reservas con buscador y filtros
 */
import { Icons } from '../utils/icons.js';
import { Formatters } from '../utils/formatters.js';

const ESTADO_MAP = {
  active:    { label: 'Activa',    cls: 'badge--active' },
  pending:   { label: 'Pendiente', cls: 'badge--pending' },
  cancelled: { label: 'Cancelada', cls: 'badge--cancelled' },
};

const FILTER_OPTIONS = [
  { value: 'all',  label: 'Todos' },
  { value: 'LP',   label: 'Loro Parque' },
  { value: 'SP',   label: 'Siam Park' },
];

const ESTADO_OPTIONS = [
  { value: 'all',       label: 'Todos los estados' },
  { value: 'active',    label: 'Activa' },
  { value: 'pending',   label: 'Pendiente' },
  { value: 'cancelled', label: 'Cancelada' },
];

export class ReservasView {
  #el;
  #onVerDetalle;
  #allReservas = [];
  #filterParque = 'all';
  #filterEstado = 'all';
  #searchQuery  = '';

  constructor({ onVerDetalle }) {
    this.#onVerDetalle = onVerDetalle;
    this.#el = document.createElement('div');
    this.#el.innerHTML = this.#template();
    this.#bindEvents();
  }

  #template() {
    const filterPills = FILTER_OPTIONS.map(opt => `
      <button class="filter-pill ${opt.value === 'all' ? 'filter-pill--active' : ''}"
              data-filter-parque="${opt.value}">
        ${opt.label}
      </button>
    `).join('');

    const estadoPills = ESTADO_OPTIONS.map(opt => `
      <button class="filter-pill ${opt.value === 'all' ? 'filter-pill--active' : ''}"
              data-filter-estado="${opt.value}">
        ${opt.label}
      </button>
    `).join('');

    return `
      <div class="page-header">
        <div>
          <h2 class="page-header__title">Reservas</h2>
          <p class="page-header__subtitle">Histórico de reservas realizadas por la agencia</p>
        </div>
        <div class="page-header__actions">
          <button class="btn btn--secondary">
            ${Icons.download}
            Exportar CSV
          </button>
        </div>
      </div>

      <div class="table-wrapper">
        <div class="table-toolbar">
          <div class="table-toolbar__left">
            <span class="table-toolbar__title">Últimas reservas</span>
          </div>
          <div class="table-toolbar__right" style="flex-wrap:wrap; gap:12px;">
            <div class="search-bar">
              ${Icons.search}
              <input type="text" placeholder="Buscar por localizador..." class="js-search" />
            </div>
            <div class="filter-pills js-filter-parque">${filterPills}</div>
            <div class="filter-pills js-filter-estado">${estadoPills}</div>
          </div>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:140px">Localizador</th>
              <th style="width:120px">Fecha visita</th>
              <th style="width:130px">Parque</th>
              <th>Productos</th>
              <th style="width:110px;text-align:right">Importe</th>
              <th style="width:120px">Estado</th>
              <th style="width:60px"></th>
            </tr>
          </thead>
          <tbody class="js-tbody">
            <tr><td colspan="7" style="text-align:center;padding:32px;color:var(--muted-foreground)">Cargando reservas...</td></tr>
          </tbody>
        </table>
      </div>
    `;
  }

  #bindEvents() {
    this.#el.querySelector('.js-search').addEventListener('input', e => {
      this.#searchQuery = e.target.value.toLowerCase();
      this.#renderRows();
    });

    this.#el.querySelector('.js-filter-parque').addEventListener('click', e => {
      const btn = e.target.closest('[data-filter-parque]');
      if (!btn) return;
      this.#filterParque = btn.dataset.filterParque;
      this.#el.querySelectorAll('[data-filter-parque]').forEach(b =>
        b.classList.toggle('filter-pill--active', b === btn)
      );
      this.#renderRows();
    });

    this.#el.querySelector('.js-filter-estado').addEventListener('click', e => {
      const btn = e.target.closest('[data-filter-estado]');
      if (!btn) return;
      this.#filterEstado = btn.dataset.filterEstado;
      this.#el.querySelectorAll('[data-filter-estado]').forEach(b =>
        b.classList.toggle('filter-pill--active', b === btn)
      );
      this.#renderRows();
    });

    this.#el.querySelector('.js-tbody').addEventListener('click', e => {
      const btn = e.target.closest('[data-localizador]');
      if (btn) this.#onVerDetalle(btn.dataset.localizador);
    });
  }

  setReservas(reservas) {
    this.#allReservas = reservas;
    this.#renderRows();
  }

  #filtered() {
    return this.#allReservas.filter(r => {
      const matchSearch = !this.#searchQuery ||
        r.localizador.toLowerCase().includes(this.#searchQuery);
      const matchParque = this.#filterParque === 'all' ||
        (this.#filterParque === 'LP' && r.parque === 'Loro Parque') ||
        (this.#filterParque === 'SP' && r.parque === 'Siam Park');
      const matchEstado = this.#filterEstado === 'all' || r.estado === this.#filterEstado;
      return matchSearch && matchParque && matchEstado;
    });
  }

  #renderRows() {
    const tbody = this.#el.querySelector('.js-tbody');
    const rows = this.#filtered();

    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--muted-foreground)">No se encontraron reservas</td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map(r => {
      const estado = ESTADO_MAP[r.estado] || ESTADO_MAP.active;
      const productos = r.productos.map(p => `${p.cantidad}× ${p.nombre}`).join(' · ');
      return `
        <tr>
          <td>
            <span class="localizador-link" data-localizador="${r.localizador}">
              ${r.localizador}
            </span>
          </td>
          <td>${Formatters.date(r.fecha)}</td>
          <td>${r.parque}</td>
          <td style="color:var(--muted-foreground)">${productos}</td>
          <td style="text-align:right;font-weight:600">${Formatters.currency(r.importeTotal)}</td>
          <td><span class="badge ${estado.cls}">${estado.label}</span></td>
          <td>
            <button class="btn btn--ghost" style="padding:6px 8px" data-localizador="${r.localizador}" aria-label="Ver detalle">
              ${Icons.eye}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  getElement() { return this.#el; }
}
