/**
 * AppState — Estado global de la aplicación.
 * Single source of truth. Las vistas leen de aquí y notifican cambios.
 */

export class AppState {
  #state;
  #listeners = new Map();

  constructor() {
    this.#state = {
      // Sesión
      session: null,           // { token, sessionId }
      isAuthenticated: false,

      // Carrito de compra
      cart: {
        fecha:     null,       // ISO string
        productos: {},         // { productoId: cantidad }
        sesionId:  null,       // de HIBDisponible
      },

      // Resultado de la última compra
      lastPurchase: null,      // { localizador, pedido, productos, importeTotal, fecha }

      // Reserva actualmente en detalle
      selectedReserva: null,

      // Vista activa
      currentView: 'login',    // login | dashboard | reservas | detalle | compra-paso1 | compra-paso2 | compra-paso3
    };
  }

  get(key) {
    return this.#state[key];
  }

  set(key, value) {
    this.#state[key] = value;
    this.#notify(key, value);
  }

  patch(key, partial) {
    this.#state[key] = { ...this.#state[key], ...partial };
    this.#notify(key, this.#state[key]);
  }

  on(key, listener) {
    if (!this.#listeners.has(key)) this.#listeners.set(key, []);
    this.#listeners.get(key).push(listener);
    return () => this.off(key, listener);
  }

  off(key, listener) {
    if (!this.#listeners.has(key)) return;
    const filtered = this.#listeners.get(key).filter(l => l !== listener);
    this.#listeners.set(key, filtered);
  }

  #notify(key, value) {
    (this.#listeners.get(key) || []).forEach(fn => fn(value));
  }

  resetCart() {
    this.set('cart', {
      fecha:     null,
      productos: {},
      sesionId:  null,
    });
  }
}
