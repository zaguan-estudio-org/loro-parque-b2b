/**
 * Utilidades de formato — moneda, fechas, localizador
 */

export const Formatters = {
  currency(amount) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  },

  date(isoString) {
    const d = new Date(isoString + 'T00:00:00');
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  },

  localizador() {
    const digits = Math.floor(100000 + Math.random() * 900000);
    return `TEST${digits}`;
  },

  tomorrowISO() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  },

  todayISO() {
    return new Date().toISOString().split('T')[0];
  },
};
