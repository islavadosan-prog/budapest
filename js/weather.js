/* Tiempo real de Budapest con Open-Meteo (API gratuita, sin clave).
   Si no hay conexión se muestra el último dato guardado con su hora; nunca se inventan datos. */
window.WEATHER = (function () {
  'use strict';
  const S = window.STORE;
  const MAX_AGE = 30 * 60 * 1000;
  const URL = 'https://api.open-meteo.com/v1/forecast?latitude=47.4979&longitude=19.0402' +
    '&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min' +
    '&timezone=Europe%2FBudapest&forecast_days=16';

  function describe(code) {
    if (code == null) return { label: '—', icon: 'thermo' };
    if (code === 0) return { label: 'Despejado', icon: 'sun' };
    if (code <= 2) return { label: 'Poco nuboso', icon: 'cloudSun' };
    if (code === 3) return { label: 'Nublado', icon: 'cloud' };
    if (code === 45 || code === 48) return { label: 'Niebla', icon: 'fog' };
    if (code >= 51 && code <= 57) return { label: 'Llovizna', icon: 'rain' };
    if (code >= 61 && code <= 67) return { label: 'Lluvia', icon: 'rain' };
    if (code >= 71 && code <= 77) return { label: 'Nieve', icon: 'snow' };
    if (code >= 80 && code <= 82) return { label: 'Chubascos', icon: 'rain' };
    if (code === 85 || code === 86) return { label: 'Chubascos de nieve', icon: 'snow' };
    if (code >= 95) return { label: 'Tormenta', icon: 'storm' };
    return { label: '—', icon: 'cloud' };
  }

  let inflight = null, lastFail = 0;
  function load() {
    const cached = S.weather();
    if (cached && Date.now() - cached.ts < MAX_AGE) return Promise.resolve(cached);
    if (Date.now() - lastFail < 60000) return Promise.resolve(cached || null);
    if (inflight) return inflight;
    inflight = fetch(URL, { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(j => {
        const daily = Object.assign({}, cached && cached.daily);
        (j.daily && j.daily.time || []).forEach((d, i) => {
          daily[d] = { max: j.daily.temperature_2m_max[i], min: j.daily.temperature_2m_min[i], code: j.daily.weather_code[i] };
        });
        const w = { ts: Date.now(), current: j.current ? { t: j.current.temperature_2m, code: j.current.weather_code } : null, daily };
        S.setWeather(w);
        return w;
      })
      .catch(() => { lastFail = Date.now(); return cached || null; })
      .finally(() => { inflight = null; });
    return inflight;
  }

  return { load, describe };
})();
