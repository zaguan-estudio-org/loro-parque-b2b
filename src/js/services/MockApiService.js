/**
 * MockApiService — Simula la API B2B de Loro Parque.
 * Cada método reproduce el comportamiento documentado en Notion
 * con latencia artificial para fidelidad en la demo.
 */

import { Formatters } from '../utils/formatters.js';

const LATENCY = {
  fast:   400,
  normal: 900,
  slow:   1400,
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Catálogo de productos — Block 1 (entradas generales LP)
const PRODUCTS_CATALOG = [
  {
    productoId:    '327',
    nombreProducto: 'Entrada Adulto',
    descripcion:   'Mayores de 12 años',
    pvpInternet:   30.80,
    baseImponible: 28.7850437164307,
    maximoTarifa:  20,
    minimoTarifa:  0,
    ordenTarifa:   1,
    grupoInternetId: '46',
    tipoReservaId:   '36',
    tipo:          'adulto',
  },
  {
    productoId:    '328',
    nombreProducto: 'Entrada Niño',
    descripcion:   '3 a 12 años',
    pvpInternet:   22.50,
    baseImponible: 21.028037383177,
    maximoTarifa:  20,
    minimoTarifa:  0,
    ordenTarifa:   2,
    grupoInternetId: '46',
    tipoReservaId:   '36',
    tipo:          'nino',
  },
  {
    productoId:    '329',
    nombreProducto: 'Entrada Free',
    descripcion:   '0 a 2 años (gratuita)',
    pvpInternet:   0.00,
    baseImponible: 0.00,
    maximoTarifa:  10,
    minimoTarifa:  0,
    ordenTarifa:   3,
    grupoInternetId: '46',
    tipoReservaId:   '36',
    tipo:          'free',
  },
  {
    productoId:    '330',
    nombreProducto: 'Entrada Residente',
    descripcion:   'Residentes en Canarias',
    pvpInternet:   15.00,
    baseImponible: 14.018691588785,
    maximoTarifa:  20,
    minimoTarifa:  0,
    ordenTarifa:   4,
    grupoInternetId: '46',
    tipoReservaId:   '36',
    tipo:          'residente',
  },
];

// Reservas seed para el histórico
const SEED_RESERVAS = [
  {
    localizador:  'TEST847291',
    fecha:        '2026-05-02',
    parque:       'Loro Parque',
    productos:    [{ nombre: 'Entrada Adulto', cantidad: 2 }, { nombre: 'Entrada Niño', cantidad: 1 }],
    importeTotal: 84.10,
    estado:       'active',
    pedido:       '151616847291',
  },
  {
    localizador:  'TEST821063',
    fecha:        '2026-05-01',
    parque:       'Siam Park',
    productos:    [{ nombre: 'Entrada Adulto', cantidad: 4 }, { nombre: 'Entrada Niño', cantidad: 2 }, { nombre: 'Entrada Free', cantidad: 1 }],
    importeTotal: 167.40,
    estado:       'pending',
    pedido:       '151616821063',
  },
  {
    localizador:  'TEST809442',
    fecha:        '2026-04-30',
    parque:       'Loro Parque',
    productos:    [{ nombre: 'Entrada Residente', cantidad: 1 }, { nombre: 'Entrada Niño', cantidad: 1 }],
    importeTotal: 37.50,
    estado:       'cancelled',
    pedido:       '151616809442',
  },
  {
    localizador:  'TEST798316',
    fecha:        '2026-04-29',
    parque:       'Siam Park',
    productos:    [{ nombre: 'Entrada Adulto', cantidad: 3 }],
    importeTotal: 92.70,
    estado:       'active',
    pedido:       '151616798316',
  },
];

export class MockApiService {
  #reservas = [...SEED_RESERVAS];

  // IniciarLog — obtiene token de sesión
  async iniciarLog(_credenciales) {
    await delay(LATENCY.fast);
    return {
      token:     'mock_token_' + Date.now(),
      sessionId: String(Math.floor(Date.now() / 1000)),
    };
  }

  // HIBDisponible — catálogo de productos disponibles para una fecha
  async hibDisponible(_fecha) {
    await delay(LATENCY.normal);
    // Simula que todos los productos están disponibles en cualquier fecha futura
    return {
      sesionId:  '77543',
      productos: PRODUCTS_CATALOG,
    };
  }

  // ReservaAforo — reserva temporal de plazas
  async reservaAforo(_params) {
    await delay(LATENCY.fast);
    return { ok: true, mensaje: 'OK' };
  }

  // Insercion — cierre de reserva y emisión de localizador
  async insercion(params) {
    await delay(LATENCY.slow);
    const localizador = Formatters.localizador();
    const pedido = '151616' + localizador.replace('TEST', '');
    const nuevaReserva = {
      localizador,
      fecha:        params.fecha,
      parque:       params.parque || 'Loro Parque',
      productos:    params.productos,
      importeTotal: params.importeTotal,
      estado:       'active',
      pedido,
    };
    this.#reservas.unshift(nuevaReserva);
    return { localizador, pedido };
  }

  // TraerReservaEstado — consulta el estado de una reserva
  async traerReservaEstado(localizador) {
    await delay(LATENCY.fast);
    const reserva = this.#reservas.find(r => r.localizador === localizador);
    if (!reserva) throw new Error('Reserva no encontrada');
    return reserva;
  }

  // AnularVentaReserva — anula una reserva activa
  async anularVentaReserva(localizador) {
    await delay(LATENCY.normal);
    const reserva = this.#reservas.find(r => r.localizador === localizador);
    if (!reserva) throw new Error('Reserva no encontrada');
    reserva.estado = 'cancelled';
    return { ok: true };
  }

  // Listado completo para la tabla de reservas
  async getReservas() {
    await delay(LATENCY.fast);
    return [...this.#reservas];
  }
}
