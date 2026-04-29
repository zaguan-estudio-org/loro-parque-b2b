/**
 * CompraStep0View — Paso 0: selección de parque (Loro Parque / Siam Park)
 */
import { Icons } from '../utils/icons.js';

const PARQUES = [
  {
    id:     'loro-parque',
    nombre: 'Loro Parque',
    logo:   'https://upload.wikimedia.org/wikipedia/fr/6/6d/Loro_Parque_logo.png',
    desc:   'Puerto de la Cruz, Tenerife Norte',
  },
  {
    id:     'siam-park',
    nombre: 'Siam Park',
    logo:   'https://siampark.net/images/media/subfooter-logo-siam-park-tenerife-water-park-new.svg',
    desc:   'Costa Adeje, Tenerife Sur',
  },
];

export class CompraStep0View {
  #el;
  #onSeleccionar;
  #onVolver;

  constructor({ onSeleccionar, onVolver }) {
    this.#onSeleccionar = onSeleccionar;
    this.#onVolver      = onVolver;
    this.#el = document.createElement('div');
    this.#el.innerHTML = this.#template();
    this.#bindEvents();
  }

  #template() {
    const cards = PARQUES.map(p => `
      <button class="park-selector-card js-park" data-park-id="${p.id}" data-park-nombre="${p.nombre}">
        <div class="park-selector-card__logo-wrap">
          <img src="${p.logo}" alt="Logo ${p.nombre}" class="park-selector-card__logo" />
        </div>
        <div class="park-selector-card__info">
          <div class="park-selector-card__name">${p.nombre}</div>
          <div class="park-selector-card__desc">${p.desc}</div>
        </div>
        <div class="park-selector-card__arrow">${Icons.arrowRight}</div>
      </button>
    `).join('');

    return `
      <div class="page-header" style="margin-top:8px">
        <div>
          <h2 class="page-header__title">Nueva Reserva</h2>
          <p class="page-header__subtitle">Selecciona el parque para el que deseas hacer la reserva</p>
        </div>
        <button class="btn btn--ghost js-volver">${Icons.arrowLeft} Cancelar</button>
      </div>

      <div class="park-selector">
        ${cards}
      </div>
    `;
  }

  #bindEvents() {
    this.#el.querySelector('.js-volver')?.addEventListener('click', () => this.#onVolver());
    this.#el.querySelectorAll('.js-park').forEach(btn => {
      btn.addEventListener('click', () => {
        this.#onSeleccionar({
          id:     btn.dataset.parkId,
          nombre: btn.dataset.parkNombre,
        });
      });
    });
  }

  getElement() { return this.#el; }
}
