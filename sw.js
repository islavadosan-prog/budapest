/* Service worker: guarda la app en caché para que funcione sin conexión.
   Rutas relativas => funciona en cualquier subdirectorio de GitHub Pages.
   Si cambias archivos, sube el número de versión para forzar la actualización. */
const VERSION = 'bp26-v3';
const SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './js/data.js',
  './js/icons.js',
  './js/store.js',
  './js/ui.js',
  './js/weather.js',
  './js/app.js',
  './vendor/leaflet/leaflet.css',
  './vendor/leaflet/leaflet.js',
  './manifest.webmanifest',
  './img/hero-parlamento.jpg',
  './img/puente-cadenas.jpg',
  './img/bastion.jpg',
  './img/plaza-heroes.jpg',
  './img/mercado-navideno.jpg',
  './img/szechenyi.jpg',
  './img/szimpla.jpg',
  './img/icon-192.png',
  './img/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('bp26-') && k !== VERSION && k !== 'bp26-tiles').map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Archivos propios: devuelve caché al instante y actualiza en segundo plano
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.open(VERSION).then(cache =>
        cache.match(req, { ignoreSearch: true }).then(cached => {
          const net = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; })
            .catch(() => cached || (req.mode === 'navigate' ? cache.match('./index.html') : undefined));
          return cached || net;
        })
      )
    );
    return;
  }

  // Teselas del mapa y fuentes: red primero, caché como respaldo (sin conexión)
  if (/server\.arcgisonline\.com|tile\.openstreetmap\.org|fonts\.(googleapis|gstatic)\.com/.test(url.hostname)) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open('bp26-tiles').then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
  }
  // El resto (Open-Meteo, Google Maps…) va directamente a la red.
});
