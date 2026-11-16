/* Persistencia local (localStorage). Todo se guarda en el propio dispositivo. */
window.STORE = (function () {
  'use strict';
  const PREFIX = 'bp26:';

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      // Normalmente: almacenamiento lleno (fotos demasiado grandes)
      return false;
    }
  }

  const clone = (o) => JSON.parse(JSON.stringify(o));

  const api = {
    /* Actividades completadas: { id: true } */
    done: () => read('done', {}),
    setDone(id, value) { const d = api.done(); if (value) d[id] = true; else delete d[id]; return write('done', d); },

    /* Notas personales por actividad */
    notes: () => read('notes', {}),
    setNote(id, text) { const n = api.notes(); if (text) n[id] = text; else delete n[id]; return write('notes', n); },

    /* Hora del vuelo de regreso u otros textos editables */
    extra: () => read('extra', {}),
    setExtra(key, value) { const x = api.extra(); x[key] = value; return write('extra', x); },

    /* Equipaje */
    packed: () => read('packed', {}),
    setPacked(id, value) { const p = api.packed(); if (value) p[id] = true; else delete p[id]; return write('packed', p); },
    customItems: () => read('customItems', []),
    setCustomItems(list) { return write('customItems', list); },

    /* Reservas: se guarda la lista completa una vez editada */
    reservations() {
      const saved = read('reservations', null);
      return saved || clone(window.TRIP.reservations);
    },
    saveReservations(list) { return write('reservations', list); },
    reservation(id) { return api.reservations().find(r => r.id === id); },

    /* Caché del tiempo (datos reales de Open-Meteo, con fecha de actualización) */
    weather: () => read('weather', null),
    setWeather(w) { return write('weather', w); },

    /* Copia de seguridad */
    exportAll() {
      const out = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX) && k !== PREFIX + 'weather') out[k] = localStorage.getItem(k);
      }
      return { app: 'budapest-trip-2026', version: 1, exportedAt: new Date().toISOString(), data: out };
    },
    importAll(obj) {
      if (!obj || obj.app !== 'budapest-trip-2026' || !obj.data) throw new Error('Archivo no válido');
      Object.keys(obj.data).forEach(k => { if (k.startsWith(PREFIX)) localStorage.setItem(k, obj.data[k]); });
    },
    resetAll() {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(PREFIX)) keys.push(k); }
      keys.forEach(k => localStorage.removeItem(k));
    }
  };
  return api;
})();
