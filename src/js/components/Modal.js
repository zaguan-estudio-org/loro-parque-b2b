/**
 * Modal — diálogo de confirmación genérico
 */
export class Modal {
  #el;
  #resolvePromise = null;

  constructor() {
    this.#el = document.createElement('div');
    this.#el.className = 'modal-backdrop';
    this.#el.style.display = 'none';
    this.#el.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal__header">
          <h3 class="modal__title js-modal-title"></h3>
        </div>
        <div class="modal__body js-modal-body"></div>
        <div class="modal__footer">
          <button class="btn btn--secondary js-modal-cancel">Cancelar</button>
          <button class="btn js-modal-confirm">Confirmar</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.#el);

    this.#el.querySelector('.js-modal-cancel').addEventListener('click', () => this.#resolve(false));
    this.#el.querySelector('.js-modal-confirm').addEventListener('click', () => this.#resolve(true));
    this.#el.addEventListener('click', e => {
      if (e.target === this.#el) this.#resolve(false);
    });
  }

  /**
   * Muestra el modal y devuelve una promesa que resuelve con true/false
   */
  confirm({ title, body, confirmLabel = 'Confirmar', confirmVariant = 'btn--primary' }) {
    this.#el.querySelector('.js-modal-title').textContent = title;
    this.#el.querySelector('.js-modal-body').innerHTML = body;

    const confirmBtn = this.#el.querySelector('.js-modal-confirm');
    confirmBtn.textContent = confirmLabel;
    confirmBtn.className = `btn ${confirmVariant} js-modal-confirm`;

    this.#el.style.display = 'flex';

    return new Promise(resolve => {
      this.#resolvePromise = resolve;
    });
  }

  #resolve(value) {
    this.#el.style.display = 'none';
    if (this.#resolvePromise) {
      this.#resolvePromise(value);
      this.#resolvePromise = null;
    }
  }
}
