/**
 * LoginView — Pantalla de acceso al portal B2B.
 * Credenciales pre-rellenadas para la demo.
 */
export class LoginView {
  #el;
  #onLogin;

  constructor({ onLogin }) {
    this.#onLogin = onLogin;
    this.#el = document.createElement('div');
    this.#el.className = 'view login-view';
    this.#el.id = 'view-login';
    this.#el.innerHTML = this.#template();
    this.#bindEvents();
  }

  #template() {
    return `
      <div class="login-card">
        <div class="login-card__header">
          <img src="src/assets/bahia-logo.png" alt="Bahía del Duque" class="login-card__logo-img" />
          <div class="login-card__tagline">Portal B2B · Acceso de agencias</div>
        </div>
        <div class="login-card__body">
          <h2 class="login-card__title">Iniciar sesión</h2>
          <div class="login-card__fields">
            <div class="field">
              <label class="field__label" for="login-email">Email</label>
              <input
                id="login-email"
                class="field__input"
                type="email"
                value="agencia@bahiaduque.com"
                autocomplete="email"
              />
            </div>
            <div class="field">
              <label class="field__label" for="login-pass">Contraseña</label>
              <input
                id="login-pass"
                class="field__input"
                type="password"
                value="12345678"
                autocomplete="current-password"
              />
            </div>
          </div>
          <button class="btn btn--primary btn--full js-login-btn">
            Acceder al portal
          </button>
          <p class="login-card__footer">
            Acceso restringido a agencias autorizadas por el Grupo CIO
          </p>
        </div>
      </div>
    `;
  }

  #bindEvents() {
    this.#el.querySelector('.js-login-btn').addEventListener('click', () => {
      this.#onLogin();
    });

    // Enter en cualquier campo lanza el login
    this.#el.querySelectorAll('.field__input').forEach(input => {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') this.#onLogin();
      });
    });
  }

  getElement() { return this.#el; }
}
