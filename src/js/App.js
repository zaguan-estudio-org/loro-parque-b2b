/**
 * App — Controlador principal. Orquesta navegación, estado y llamadas a la API.
 * Sigue el patrón: vista notifica intención → App decide → actualiza estado → monta vista.
 */

import { MockApiService }    from './services/MockApiService.js';
import { AppState }          from './services/AppState.js';
import { Spinner }           from './components/Spinner.js';
import { Modal }             from './components/Modal.js';
import { PanelShell }        from './components/PanelShell.js';
import { LoginView }         from './views/LoginView.js';
import { DashboardView }     from './views/DashboardView.js';
import { ReservasView }      from './views/ReservasView.js';
import { DetalleReservaView} from './views/DetalleReservaView.js';
import { CompraStep0View }   from './views/CompraStep0View.js';
import { CompraStep1View }   from './views/CompraStep1View.js';
import { CompraStep2View }   from './views/CompraStep2View.js';
import { CompraStep3View }   from './views/CompraStep3View.js';

export class App {
  #root;
  #api;
  #state;
  #spinner;
  #modal;
  #shell;

  // Vistas instanciadas (lazy)
  #loginView;
  #dashboardView;
  #reservasView;
  #detalleView;
  #step0View;
  #step1View;
  #step2View;
  #step3View;

  constructor(rootElement) {
    this.#root    = rootElement;
    this.#api     = new MockApiService();
    this.#state   = new AppState();
    this.#spinner = new Spinner();
    this.#modal   = new Modal();
  }

  async init() {
    this.#mountLogin();
  }

  // ── LOGIN ─────────────────────────────────────────────────────────────────

  #mountLogin() {
    this.#loginView = new LoginView({ onLogin: () => this.#handleLogin() });
    this.#root.innerHTML = '';
    this.#root.appendChild(this.#loginView.getElement());
    this.#loginView.getElement().classList.add('view--active');
  }

  async #handleLogin() {
    this.#spinner.show('Iniciando sesión...');
    try {
      const session = await this.#api.iniciarLog({ user: 'agencia', pass: 'demo' });
      this.#state.set('session', session);
      this.#state.set('isAuthenticated', true);
      await this.#mountPanel();
      this.#navigateTo('dashboard');
    } finally {
      this.#spinner.hide();
    }
  }

  // ── PANEL SHELL ───────────────────────────────────────────────────────────

  async #mountPanel() {
    this.#shell = new PanelShell({ onNavClick: id => this.#navigateTo(id) });
    this.#root.innerHTML = '';
    this.#root.appendChild(this.#shell.getElement());
    this.#shell.getElement().classList.add('view--active');
  }

  // ── NAVEGACIÓN ────────────────────────────────────────────────────────────

  #navigateTo(viewId) {
    this.#state.set('currentView', viewId);
    this.#shell.setActiveNav(viewId);

    const slot = this.#shell.getContentSlot();
    slot.innerHTML = '';

    const titleMap = {
      dashboard:    'Dashboard',
      reservas:     'Reservas',
      nuevaReserva: 'Nueva Reserva',
      detalle:      'Detalle de Reserva',
      compra0:      'Nueva Reserva',
      compra1:      'Nueva Reserva',
      compra2:      'Nueva Reserva',
      compra3:      'Nueva Reserva',
    };
    this.#shell.setTopbarTitle(titleMap[viewId] || viewId);

    switch (viewId) {
      case 'dashboard':    return this.#mountDashboard(slot);
      case 'reservas':     return this.#mountReservas(slot);
      case 'nuevaReserva': return this.#mountCompra0(slot);
      case 'detalle':      return this.#mountDetalle(slot);
      case 'compra0':      return this.#mountCompra0(slot);
      case 'compra1':      return this.#mountCompra1(slot);
      case 'compra2':      return this.#mountCompra2(slot);
      case 'compra3':      return this.#mountCompra3(slot);
    }
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────

  #mountDashboard(slot) {
    this.#dashboardView = new DashboardView({
      onNuevaReserva: () => this.#navigateTo('nuevaReserva'),
      onReservas:     () => this.#navigateTo('reservas'),
    });
    slot.appendChild(this.#dashboardView.getElement());
  }

  // ── RESERVAS ──────────────────────────────────────────────────────────────

  async #mountReservas(slot) {
    this.#reservasView = new ReservasView({
      onVerDetalle: localizador => this.#handleVerDetalle(localizador),
    });
    slot.appendChild(this.#reservasView.getElement());

    this.#spinner.show('Cargando reservas...');
    try {
      const reservas = await this.#api.getReservas();
      this.#reservasView.setReservas(reservas);
    } finally {
      this.#spinner.hide();
    }
  }

  // ── DETALLE RESERVA ───────────────────────────────────────────────────────

  async #handleVerDetalle(localizador) {
    this.#spinner.show('Consultando reserva...');
    try {
      const reserva = await this.#api.traerReservaEstado(localizador);
      this.#state.set('selectedReserva', reserva);
      this.#navigateTo('detalle');
    } finally {
      this.#spinner.hide();
    }
  }

  #mountDetalle(slot) {
    this.#detalleView = new DetalleReservaView({
      onVolver: () => this.#navigateTo('reservas'),
      onAnular: localizador => this.#handleAnular(localizador),
    });
    const reserva = this.#state.get('selectedReserva');
    this.#detalleView.setReserva(reserva);
    slot.appendChild(this.#detalleView.getElement());
  }

  async #handleAnular(localizador) {
    const confirmed = await this.#modal.confirm({
      title:          'Anular reserva',
      body:           `<p>¿Confirmas la anulación de la reserva <strong>${localizador}</strong>?</p>
                       <p style="margin-top:8px">Esta acción libera el aforo y no puede deshacerse.</p>`,
      confirmLabel:   'Sí, anular reserva',
      confirmVariant: 'btn--danger',
    });

    if (!confirmed) return;

    this.#spinner.show('Anulando reserva...');
    try {
      await this.#api.anularVentaReserva(localizador);
      const reserva = this.#state.get('selectedReserva');
      this.#state.set('selectedReserva', { ...reserva, estado: 'cancelled' });
      this.#navigateTo('detalle');
    } finally {
      this.#spinner.hide();
    }
  }

  // ── COMPRA: PASO 0 (selección de parque) ─────────────────────────────────

  #mountCompra0(slot) {
    this.#step0View = new CompraStep0View({
      onSeleccionar: parque => {
        this.#state.set('selectedParque', parque);
        this.#navigateTo('compra1');
      },
      onVolver: () => this.#navigateTo('dashboard'),
    });
    slot.appendChild(this.#step0View.getElement());
  }

  // ── COMPRA: PASO 1 ────────────────────────────────────────────────────────

  #mountCompra1(slot) {
    const parque = this.#state.get('selectedParque');
    this.#step1View = new CompraStep1View({
      api:         this.#api,
      spinner:     this.#spinner,
      parque,
      onSiguiente: cart => {
        this.#state.patch('cart', cart);
        this.#navigateTo('compra2');
      },
      onVolver: () => this.#navigateTo('compra0'),
    });
    slot.appendChild(this.#step1View.getElement());
  }

  // ── COMPRA: PASO 2 ────────────────────────────────────────────────────────

  #mountCompra2(slot) {
    this.#step2View = new CompraStep2View({
      onConfirmar: cart => this.#handleConfirmarCompra(cart),
      onVolver:    ()   => this.#navigateTo('compra1'),
    });
    this.#step2View.setCart(this.#state.get('cart'));
    slot.appendChild(this.#step2View.getElement());
  }

  // ── COMPRA: PASO 3 ────────────────────────────────────────────────────────

  async #handleConfirmarCompra(cart) {
    this.#spinner.show('Reservando aforo...');
    try {
      await this.#api.reservaAforo({ sesionId: '77543', cantidad: cart.productos.reduce((a,p) => a + p.cantidad, 0) });

      this.#spinner.show('Emitiendo reserva...');
      const importeTotal = cart.productos.reduce((acc, p) => acc + p.pvpInternet * p.cantidad, 0);
      const result = await this.#api.insercion({
        fecha:        cart.fecha,
        parque:       cart.parque?.nombre,
        productos:    cart.productos.map(p => ({ nombre: p.nombreProducto, cantidad: p.cantidad })),
        importeTotal,
      });

      const purchase = {
        localizador:  result.localizador,
        pedido:       result.pedido,
        fecha:        cart.fecha,
        parque:       cart.parque,
        productos:    cart.productos,
        importeTotal,
      };
      this.#state.set('lastPurchase', purchase);
      this.#state.resetCart();
      this.#navigateTo('compra3');
    } finally {
      this.#spinner.hide();
    }
  }

  #mountCompra3(slot) {
    this.#step3View = new CompraStep3View({
      onVerReservas:  () => this.#navigateTo('reservas'),
      onNuevaReserva: () => this.#navigateTo('nuevaReserva'),
    });
    this.#step3View.setPurchase(this.#state.get('lastPurchase'));
    slot.appendChild(this.#step3View.getElement());
  }
}
