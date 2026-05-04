/**
 * CompraStep2View — Paso 2: resumen del pedido antes de confirmar
 * Simula ReservaAforo al pulsar "Confirmar"
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
    <div class="step step--active">
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

export class CompraStep2View {
  #el;
  #onConfirmar;
  #onVolver;
  #cart;
  #clienteDatos = { nombre: '', email: '', enviarPorEmail: false };

  constructor({ onConfirmar, onVolver }) {
    this.#onConfirmar = onConfirmar;
    this.#onVolver    = onVolver;
    this.#el = document.createElement('div');
  }

  setCart(cart) {
    this.#cart = cart;
    this.#render();
  }

  #render() {
    const { fecha, parque, productos } = this.#cart;
    const total = productos.reduce((acc, p) => acc + p.pvpInternet * p.cantidad, 0);
    const importeInicial = productos.reduce((acc, p) => acc + p.baseImponible * p.cantidad, 0);
    const totalEntradas  = productos.reduce((acc, p) => acc + p.cantidad, 0);

    const lineasProducto = productos.map(p => `
      <div class="summary-row">
        <span class="summary-row__label">${p.cantidad}× ${p.nombreProducto}<br>
          <small style="font-size:11px;color:var(--muted-foreground)">${p.descripcion}</small>
        </span>
        <span class="summary-row__value">${Formatters.currency(p.pvpInternet * p.cantidad)}</span>
      </div>
    `).join('');

    this.#el.innerHTML = `
      ${STEP_INDICATOR}

      <div class="page-header" style="margin-top:8px">
        <div>
          <h2 class="page-header__title">Revisar pedido</h2>
          <p class="page-header__subtitle">Confirma los datos antes de emitir el ticket</p>
        </div>
        <button class="btn btn--ghost js-volver">${Icons.arrowLeft} Modificar selección</button>
      </div>

      <div class="compra-layout">
        <div style="display:flex;flex-direction:column;gap:20px">
          <div class="card">
            <div class="card__header">
              <div class="card__title">Detalle de entradas</div>
              <div class="card__subtitle">${parque.nombre} · ${Formatters.date(fecha)}</div>
            </div>
            <div class="card__body">
              ${lineasProducto}
              <div class="summary-row summary-row--total">
                <span class="summary-row__label">Total</span>
                <span class="summary-row__value">${Formatters.currency(total)}</span>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card__header">
              <div class="card__title">Datos del cliente</div>
              <div class="card__subtitle">Información del viajero o responsable de la compra</div>
            </div>
            <div class="card__body">
              <div style="display:flex;flex-direction:column;gap:16px">
                <div class="field">
                  <label class="field__label" for="cliente-nombre">NOMBRE <span style="color:var(--color-error)">*</span></label>
                  <input class="field__input js-nombre" id="cliente-nombre" type="text" placeholder="Nombre completo del cliente" autocomplete="name" value="${this.#clienteDatos.nombre}">
                </div>
                <div class="field">
                  <label class="field__label" for="cliente-email">EMAIL <span style="color:var(--color-error)">*</span></label>
                  <input class="field__input js-email" id="cliente-email" type="email" placeholder="email@ejemplo.com" autocomplete="email" value="${this.#clienteDatos.email}">
                </div>
                <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:12px;border:1px solid var(--border);background:var(--surface-warm)">
                  <input type="checkbox" class="js-enviar-email" ${this.#clienteDatos.enviarPorEmail ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--primary);cursor:pointer;flex-shrink:0">
                  <span style="font-size:13px;color:var(--foreground)">Enviar entradas por email al cliente</span>
                </label>
              </div>
            </div>
          </div>

          <div class="alert alert--info">
            ${Icons.info}
            <div>
              Al confirmar se ejecutarán <strong>ReservaAforo</strong> e <strong>Insercion</strong> en la API. El localizador se generará de forma inmediata con el prefijo <code>TEST</code>.
            </div>
          </div>
        </div>

        <div>
          <div class="compra-sidebar-card">
            <div class="compra-sidebar-card__header">
              <div class="compra-sidebar-card__title">Resumen del pedido</div>
            </div>
            <div class="compra-sidebar-card__body">
              <div class="detalle-field">
                <span class="detalle-field__label">Fecha de visita</span>
                <span class="detalle-field__value">${Formatters.date(fecha)}</span>
              </div>
              <div class="detalle-field" style="margin-top:12px">
                <span class="detalle-field__label">Total de entradas</span>
                <span class="detalle-field__value">${totalEntradas} entrada${totalEntradas !== 1 ? 's' : ''}</span>
              </div>
              <div class="detalle-field" style="margin-top:12px">
                <span class="detalle-field__label">Base imponible</span>
                <span class="detalle-field__value">${Formatters.currency(importeInicial)}</span>
              </div>
            </div>
            <div class="compra-sidebar-card__footer">
              <div class="summary-row summary-row--total" style="padding-top:8px">
                <span class="summary-row__label" style="font-size:16px">Total PVP</span>
                <span class="summary-row__value js-total" style="font-size:22px;color:var(--primary)">${Formatters.currency(total)}</span>
              </div>
              <button class="btn btn--primary btn--full js-confirmar">
                ${Icons.check}
                Confirmar y emitir
              </button>
              <button class="btn btn--ghost btn--full js-volver">
                Volver a selección
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.#el.querySelectorAll('.js-volver').forEach(btn =>
      btn.addEventListener('click', () => this.#onVolver())
    );

    const inputNombre = this.#el.querySelector('.js-nombre');
    const inputEmail  = this.#el.querySelector('.js-email');
    const checkEmail  = this.#el.querySelector('.js-enviar-email');

    inputNombre.addEventListener('input', () => { this.#clienteDatos.nombre = inputNombre.value.trim(); });
    inputEmail.addEventListener('input',  () => { this.#clienteDatos.email  = inputEmail.value.trim(); });
    checkEmail.addEventListener('change', () => { this.#clienteDatos.enviarPorEmail = checkEmail.checked; });

    this.#el.querySelector('.js-confirmar').addEventListener('click', () => {
      const nombre = inputNombre.value.trim();
      const email  = inputEmail.value.trim();

      if (!nombre) {
        inputNombre.focus();
        inputNombre.style.borderColor = 'var(--color-error)';
        return;
      }
      inputNombre.style.borderColor = '';

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        inputEmail.focus();
        inputEmail.style.borderColor = 'var(--color-error)';
        return;
      }
      inputEmail.style.borderColor = '';

      this.#clienteDatos = { nombre, email, enviarPorEmail: checkEmail.checked };
      this.#onConfirmar(this.#cart, this.#clienteDatos);
    });
  }

  getElement() { return this.#el; }
}
