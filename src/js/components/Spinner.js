/**
 * Spinner — overlay de carga con mensaje
 */
export class Spinner {
  #el;

  constructor() {
    this.#el = document.createElement('div');
    this.#el.className = 'spinner-overlay';
    this.#el.style.display = 'none';
    this.#el.innerHTML = `
      <div class="spinner"></div>
      <span class="spinner-label js-spinner-label">Cargando...</span>
    `;
    document.body.appendChild(this.#el);
  }

  show(label = 'Cargando...') {
    this.#el.querySelector('.js-spinner-label').textContent = label;
    this.#el.style.display = 'flex';
  }

  hide() {
    this.#el.style.display = 'none';
  }
}
