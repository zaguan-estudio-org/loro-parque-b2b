/**
 * PanelShell — Contenedor del panel con sidebar + área de contenido.
 * Las vistas internas se montan en el slot #panel-content.
 */
import { Icons } from '../utils/icons.js';

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',      icon: Icons.dashboard },
  { id: 'reservas',     label: 'Reservas',        icon: Icons.reservas },
  { id: 'nuevaReserva', label: 'Nueva Reserva',   icon: Icons.nuevaReserva },
];

export class PanelShell {
  #el;
  #onNavClick;

  constructor({ onNavClick }) {
    this.#onNavClick = onNavClick;
    this.#el = document.createElement('div');
    this.#el.className = 'view panel-shell';
    this.#el.id = 'view-panel';
    this.#el.innerHTML = this.#template();
    this.#bindEvents();
  }

  #template() {
    const navItems = NAV_ITEMS.map(item => `
      <button class="nav-item" data-view="${item.id}" aria-label="${item.label}">
        ${item.icon}
        <span class="nav-item__label">${item.label}</span>
      </button>
    `).join('');

    return `
      <aside class="sidebar">
        <div class="sidebar__header">
          <div class="sidebar__logo">BAHÍA DEL DUQUE</div>
          <div class="sidebar__tagline">Portal B2B · Gestión</div>
        </div>
        <nav class="sidebar__nav" aria-label="Navegación principal">
          ${navItems}
        </nav>
        <div class="sidebar__footer">
          <div class="sidebar__avatar">AG</div>
          <div>
            <div class="sidebar__user-name">Agencia Operadora</div>
            <div class="sidebar__user-role">Operador B2B</div>
          </div>
        </div>
      </aside>

      <div class="main-content">
        <header class="topbar">
          <h1 class="topbar__title js-topbar-title">Dashboard</h1>
          <div class="topbar__actions">
            <button class="topbar__icon-btn" aria-label="Notificaciones">
              ${Icons.bell}
            </button>
            <div class="topbar__avatar" title="Agencia Operadora">AG</div>
          </div>
        </header>
        <main id="panel-content" class="page-content"></main>
      </div>
    `;
  }

  #bindEvents() {
    this.#el.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        this.#onNavClick(btn.dataset.view);
      });
    });
  }

  setActiveNav(viewId) {
    const COMPRA_VIEWS = new Set(['compra0', 'compra1', 'compra2', 'compra3', 'nuevaReserva']);
    const activeId = COMPRA_VIEWS.has(viewId) ? 'nuevaReserva' : viewId;
    this.#el.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('nav-item--active', btn.dataset.view === activeId);
    });
  }

  setTopbarTitle(title) {
    this.#el.querySelector('.js-topbar-title').textContent = title;
  }

  getContentSlot() {
    return this.#el.querySelector('#panel-content');
  }

  getElement() {
    return this.#el;
  }
}
