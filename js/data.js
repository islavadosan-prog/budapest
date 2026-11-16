/* ==========================================================================
   BUDAPEST TRIP 2026 — Datos del viaje
   Edita este archivo para cambiar textos, horarios o lugares.
   Todas las horas están en hora local de Budapest (CET, UTC+01:00).
   ========================================================================== */
window.TRIP = (function () {
  'use strict';

  const TZ = '+01:00';
  const at = (date, time) => `2026-11-${date}T${time}:00${TZ}`;

  const ADDRESS = 'Szondi utca 55, 3.º piso, 1064 Budapest, Hungría';
  const ADDRESS_MAPS = 'Szondi utca 55, 1064 Budapest, Hungary';

  /* ---------- Lugares del mapa ----------
     Coordenadas obtenidas de OpenStreetMap (Nominatim).
     "q" es el texto que se envía a Google Maps al abrir / pedir indicaciones. */
  const places = [
    { id: 'apartamento', name: 'Apartamento', icon: 'home', color: 'gold',
      lat: 47.51245, lng: 19.06786, q: ADDRESS_MAPS,
      desc: 'Nuestro alojamiento: Szondi utca 55, 3.º piso.',
      day: 'Todos los días', days: [0, 1, 2, 3, 4] },
    { id: 'parlamento', name: 'Parlamento de Budapest', icon: 'landmark', color: 'orange',
      lat: 47.50705, lng: 19.04592, q: 'Hungarian Parliament Building, Budapest',
      desc: 'Edificio neogótico del Parlamento húngaro, a orillas del Danubio.',
      day: 'Jueves 19 · día de Pest', days: [1] },
    { id: 'kossuth', name: 'Plaza Kossuth Lajos tér', icon: 'landmark', color: 'orange',
      lat: 47.50572, lng: 19.04498, q: 'Kossuth Lajos tér, Budapest',
      desc: 'Plaza frente a la fachada principal del Parlamento.',
      day: 'Jueves 19 · día de Pest', days: [1] },
    { id: 'crucero', name: 'Punto de salida del crucero', icon: 'ship', color: 'orange',
      lat: null, lng: null, q: null, pendingKey: 'crucero',
      desc: 'Embarque del crucero nocturno por el Danubio (18:40).',
      day: 'Jueves 19 · 18:40', days: [1] },
    { id: 'bastion', name: 'Bastión de los Pescadores', icon: 'castle', color: 'blue',
      lat: 47.50231, lng: 19.03470, q: "Fisherman's Bastion, Budapest",
      desc: 'Mirador neorrománico sobre el Danubio, junto a la iglesia de Matías.',
      day: 'Viernes 20 · 13:00', days: [2] },
    { id: 'castillo', name: 'Castillo de Buda', icon: 'castle', color: 'blue',
      lat: 47.49599, lng: 19.03980, q: 'Buda Castle, Budapest',
      desc: 'Antiguo palacio real en la colina del Castillo.',
      day: 'Viernes 20 · día de Buda', days: [2] },
    { id: 'szechenyi', name: 'Termas Széchenyi', icon: 'waves', color: 'blue',
      lat: 47.51844, lng: 19.08252, q: 'Széchenyi Thermal Bath, Állatkerti körút 9-11, Budapest',
      desc: 'Balneario termal con piscinas exteriores en el parque Városliget.',
      day: 'Viernes 20 · 19:00–22:00', days: [2], photo: 'img/szechenyi.jpg' },
    { id: 'szimpla', name: 'Szimpla Kert', icon: 'music', color: 'blue',
      lat: 47.49693, lng: 19.06331, q: 'Szimpla Kert, Kazinczy utca 14, Budapest',
      desc: 'El ruin bar más conocido de Budapest, en el barrio judío.',
      day: 'Viernes 20 · 22:15', days: [2], photo: 'img/szimpla.jpg' },
    { id: 'instant', name: 'Instant-Fogas', icon: 'music', color: 'blue',
      lat: 47.50053, lng: 19.06552, q: 'Instant-Fogas, Akácfa utca 49-51, Budapest',
      desc: 'Gran complejo de bares y discotecas en Akácfa utca.',
      day: 'Viernes 20 · noche', days: [2] },
    { id: 'heroes', name: 'Plaza de los Héroes', icon: 'landmark', color: 'green',
      lat: 47.51502, lng: 19.07652, q: 'Heroes Square, Budapest',
      desc: 'Gran plaza con el Monumento del Milenio, al final de Andrássy.',
      day: 'Sábado 21 · 10:00', days: [3], photo: 'img/plaza-heroes.jpg' },
    { id: 'varosliget', name: 'Parque Városliget', icon: 'tree', color: 'green',
      lat: 47.51487, lng: 19.08437, q: 'Városliget, Budapest',
      desc: 'El gran parque urbano de Budapest.',
      day: 'Sábado 21 · 10:00', days: [3] },
    { id: 'vajdahunyad', name: 'Castillo Vajdahunyad', icon: 'castle', color: 'green',
      lat: 47.51535, lng: 19.08188, q: 'Vajdahunyad Castle, Budapest',
      desc: 'Castillo de cuento junto al lago del parque Városliget.',
      day: 'Sábado 21 · mañana', days: [3] },
    { id: 'mcdonalds', name: "McDonald's Nyugati", icon: 'burger', color: 'green',
      lat: 47.51061, lng: 19.05669, q: "McDonald's, Teréz körút 55, Budapest",
      desc: "El McDonald's de la estación Nyugati, famoso por su decoración.",
      day: 'Sábado 21 · 16:00', days: [3] },
    { id: 'basilica', name: 'Basílica de San Esteban', icon: 'landmark', color: 'green',
      lat: 47.50078, lng: 19.05397, q: "St. Stephen's Basilica, Budapest",
      desc: 'Basílica principal de la ciudad, con mercado navideño en su plaza.',
      day: 'Sábado 21 · 17:00', days: [3] },
    { id: 'vorosmarty', name: 'Mercado Vörösmarty', icon: 'gift', color: 'green',
      lat: 47.49637, lng: 19.05041, q: 'Vörösmarty tér, Budapest',
      desc: 'Mercado navideño en la plaza Vörösmarty tér.',
      day: 'Sábado 21 · 17:00', days: [3], photo: 'img/mercado-navideno.jpg' },

    /* ---- Escala en Alicante (domingo 22) ---- */
    { id: 'alc-aeropuerto', region: 'alc', name: 'Aeropuerto de Alicante-Elche', icon: 'plane', color: 'red',
      lat: 38.28442, lng: -0.56575, q: 'Aeropuerto de Alicante-Elche Miguel Hernández',
      desc: 'Llegada a las 14:25 y salida del siguiente vuelo a las 20:55.',
      day: 'Domingo 22 · 14:25 y 19:00', days: [4] },
    { id: 'alc-c6', region: 'alc', name: 'Parada C6 · Plaza Puerta del Mar', icon: 'bus', color: 'red',
      lat: 38.34429, lng: -0.48038, q: 'Plaza Puerta del Mar, Alicante',
      desc: 'Parada del autobús C6 en el centro. Desde aquí, andando hasta la consigna.',
      day: 'Domingo 22 · 15:35 y 18:35 (aprox.)', days: [4] },
    { id: 'alc-lockers', region: 'alc', name: 'Lockers Stop Alicante', icon: 'luggage', color: 'red',
      lat: 38.34325, lng: -0.48677, q: 'Lockers Stop Alicante Calle Antonio Galdo Chapuli 10',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Lockers+Stop+Alicante+Calle+Antonio+Galdo+Chapuli+10',
      desc: 'Consigna de taquillas automáticas, abierta 24 h. Calle Antonio Galdó Chápuli 10.',
      day: 'Domingo 22 · 15:35 y 18:20 (aprox.)', days: [4] },
    { id: 'alc-explanada', region: 'alc', name: 'Explanada de España', icon: 'walk', color: 'red',
      lat: 38.34314, lng: -0.48329, q: 'Explanada de España, Alicante',
      desc: 'Paseo con mosaicos y palmeras junto al mar.',
      day: 'Domingo 22 · 16:40 (aprox.)', days: [4] },
    { id: 'alc-puerto', region: 'alc', name: 'Puerto deportivo de Alicante', icon: 'ship', color: 'red',
      lat: 38.3405, lng: -0.4822, q: 'Puerto deportivo de Alicante',
      desc: 'Puerto deportivo junto a la Explanada.',
      day: 'Domingo 22 · 16:40 (aprox.)', days: [4] },
    { id: 'alc-santacruz', region: 'alc', name: 'Barrio de Santa Cruz', icon: 'camera', color: 'red',
      lat: 38.34773, lng: -0.48261, q: 'Barrio de Santa Cruz, Alicante',
      desc: 'Calles de casas blancas, macetas de colores y miradores.',
      day: 'Domingo 22 · 17:15 (aprox.)', days: [4] }
  ];

  /* ---------- Itinerario ----------
     start/end: para calcular "próxima actividad". Las actividades sin hora no los llevan.
     res: id de la reserva asociada (el estado se toma de la reserva). */
  const days = [
    {
      id: 'd18', short: 'Mié 18', dow: 'Miércoles', num: 18, title: 'Llegada',
      photo: 'img/hero-parlamento.jpg', date: '2026-11-18',
      items: [
        { id: 'd18-1', time: '23:05', start: at(18, '23:05'), icon: 'plane',
          title: 'Llegada al aeropuerto', desc: 'Aterrizaje en el aeropuerto de Budapest.',
          loc: { name: 'Aeropuerto de Budapest', q: 'Budapest Ferenc Liszt International Airport' } },
        { id: 'd18-2', time: '23:45–00:00', start: at(18, '23:45'), end: at(19, '00:00'), icon: 'luggage',
          title: 'Salida del aeropuerto', desc: 'Recoger equipaje y salir hacia la parada del 100E.',
          loc: { name: 'Aeropuerto de Budapest', q: 'Budapest Ferenc Liszt International Airport' } },
        { id: 'd18-3', time: '', icon: 'bus',
          title: 'Autobús 100E', desc: 'Del aeropuerto hasta Deák Ferenc tér.',
          more: 'Requiere billete específico para el 100E (precio orientativo: 2.500 HUF por persona). No está incluido en los bonos normales.',
          loc: { name: 'Deák Ferenc tér', q: 'Deák Ferenc tér, Budapest' } },
        { id: 'd18-4', time: '', icon: 'car',
          title: 'Bolt hasta el apartamento', desc: 'Desde Deák Ferenc tér hasta Szondi utca 55.',
          loc: { name: 'Apartamento', q: ADDRESS_MAPS } },
        { id: 'd18-5', time: '00:30–01:00', start: at(19, '00:30'), end: at(19, '01:00'), icon: 'home',
          title: 'Llegada al alojamiento', desc: 'Llegada aproximada al apartamento.',
          loc: { name: 'Apartamento', q: ADDRESS_MAPS } },
        { id: 'd18-6', time: '', icon: 'utensils',
          title: 'Cena rápida', desc: 'Solo si hace falta.' },
        { id: 'd18-7', time: '', icon: 'moon',
          title: 'Descanso', desc: 'A dormir: mañana empieza el viaje.' }
      ]
    },
    {
      id: 'd19', short: 'Jue 19', dow: 'Jueves', num: 19, title: 'Pest + Cumpleaños + Crucero',
      photo: 'img/puente-cadenas.jpg', date: '2026-11-19',
      items: [
        { id: 'd19-1', time: '09:00', start: at(19, '09:00'), end: at(19, '10:00'), icon: 'coffee',
          title: 'Desayuno', desc: 'Empezar el día con calma.' },
        { id: 'd19-2', time: '10:30–13:00', start: at(19, '10:30'), end: at(19, '13:00'), icon: 'users',
          title: 'Free Tour de Pest', desc: 'Visita guiada a pie por Pest.', res: 'free-pest' },
        { id: 'd19-3', time: '13:00–14:00', start: at(19, '13:00'), end: at(19, '14:00'), icon: 'utensils',
          title: 'Comida', desc: 'Pausa para comer.' },
        { id: 'd19-4', time: '14:00–16:00', start: at(19, '14:00'), end: at(19, '16:00'), icon: 'walk',
          title: 'Paseo por Pest', desc: 'Parlamento, Kossuth Lajos tér y alrededores.',
          loc: { name: 'Parlamento de Budapest', q: 'Hungarian Parliament Building, Budapest' } },
        { id: 'd19-5', time: '16:00–17:15', start: at(19, '16:00'), end: at(19, '17:15'), icon: 'gift',
          title: 'Mercado navideño y café', desc: 'Primer contacto con los mercados de Navidad.' },
        { id: 'd19-6', time: '17:15–18:15', start: at(19, '17:15'), end: at(19, '18:15'), icon: 'home',
          title: 'Descanso y prepararse', desc: 'Pasar por el apartamento antes de la noche.',
          loc: { name: 'Apartamento', q: ADDRESS_MAPS } },
        { id: 'd19-7', time: '18:40', start: at(19, '18:40'), end: at(19, '19:40'), icon: 'ship',
          title: 'Crucero nocturno por el Danubio', desc: 'Salida desde Pest. Crucero nocturno sin cena.', res: 'crucero' },
        { id: 'd19-8', time: '19:40–20:00', start: at(19, '19:40'), end: at(19, '20:00'), icon: 'ship',
          title: 'Final del crucero', desc: 'Desembarque.' },
        { id: 'd19-9', time: '20:00–22:00', start: at(19, '20:00'), end: at(19, '22:00'), icon: 'cake',
          title: 'Cena especial de cumpleaños', desc: '¡La cena del cumpleaños!' },
        { id: 'd19-10', time: '22:00 →', start: at(19, '22:00'), end: at(19, '23:59'), icon: 'glass',
          title: 'Copas o paseo', desc: 'Terminar la noche por el centro.' }
      ]
    },
    {
      id: 'd20', short: 'Vie 20', dow: 'Viernes', num: 20, title: 'Buda + Termas + Ruin bars',
      photo: 'img/bastion.jpg', date: '2026-11-20',
      items: [
        { id: 'd20-1', time: '09:00', start: at(20, '09:00'), end: at(20, '10:00'), icon: 'coffee',
          title: 'Desayuno', desc: 'Desayuno antes de cruzar a Buda.' },
        { id: 'd20-2', time: '10:30–13:00', start: at(20, '10:30'), end: at(20, '13:00'), icon: 'users',
          title: 'Free Tour de Buda', desc: 'Visita guiada a pie por Buda.', res: 'free-buda' },
        { id: 'd20-3', time: '13:00–14:00', start: at(20, '13:00'), end: at(20, '14:00'), icon: 'camera',
          title: 'Bastión de los Pescadores', desc: 'Vistas del Danubio y fotografías.',
          loc: { name: 'Bastión de los Pescadores', q: "Fisherman's Bastion, Budapest" } },
        { id: 'd20-4', time: '14:00–15:00', start: at(20, '14:00'), end: at(20, '15:00'), icon: 'utensils',
          title: 'Comida', desc: 'Pausa para comer en Buda.' },
        { id: 'd20-5', time: '15:00–17:00', start: at(20, '15:00'), end: at(20, '17:00'), icon: 'walk',
          title: 'Paseo por Buda', desc: 'Castillo de Buda y barrio del Castillo.',
          loc: { name: 'Castillo de Buda', q: 'Buda Castle, Budapest' } },
        { id: 'd20-6', time: '17:00–18:15', start: at(20, '17:00'), end: at(20, '18:15'), icon: 'coffee',
          title: 'Café y descanso', desc: 'Recargar pilas antes de las termas.' },
        { id: 'd20-7', time: '18:15', start: at(20, '18:15'), end: at(20, '19:00'), icon: 'bus',
          title: 'Salida hacia Széchenyi', desc: 'Desplazamiento a las termas.',
          loc: { name: 'Termas Széchenyi', q: 'Széchenyi Thermal Bath, Állatkerti körút 9-11, Budapest' } },
        { id: 'd20-8', time: '19:00–22:00', start: at(20, '19:00'), end: at(20, '22:00'), icon: 'waves',
          title: 'Termas Széchenyi', desc: '30 € por persona, incluye taquilla.',
          more: 'Llevar bañador, chanclas y toalla.', res: 'termas' },
        { id: 'd20-9', time: '22:15 →', start: at(20, '22:15'), end: at(20, '23:59'), icon: 'music',
          title: 'Szimpla Kert e Instant-Fogas', desc: 'Noche de ruin bars.',
          loc: { name: 'Szimpla Kert', q: 'Szimpla Kert, Kazinczy utca 14, Budapest' } }
      ]
    },
    {
      id: 'd21', short: 'Sáb 21', dow: 'Sábado', num: 21, title: 'Városliget + Andrássy + Mercados',
      photo: 'img/plaza-heroes.jpg', date: '2026-11-21',
      items: [
        { id: 'd21-1', time: '09:00', start: at(21, '09:00'), end: at(21, '10:00'), icon: 'coffee',
          title: 'Desayuno', desc: 'Último día completo.' },
        { id: 'd21-2', time: '10:00–12:30', start: at(21, '10:00'), end: at(21, '12:30'), icon: 'tree',
          title: 'Városliget, Héroes y Vajdahunyad', desc: 'Parque Városliget, Plaza de los Héroes y Castillo Vajdahunyad.',
          loc: { name: 'Plaza de los Héroes', q: 'Heroes Square, Budapest' } },
        { id: 'd21-3', time: '12:30–13:30', start: at(21, '12:30'), end: at(21, '13:30'), icon: 'walk',
          title: 'Paseo por la zona', desc: 'Alrededores del parque.' },
        { id: 'd21-4', time: '13:30–14:30', start: at(21, '13:30'), end: at(21, '14:30'), icon: 'utensils',
          title: 'Comida', desc: 'Pausa para comer.' },
        { id: 'd21-5', time: '14:30–16:00', start: at(21, '14:30'), end: at(21, '16:00'), icon: 'walk',
          title: 'Avenida Andrássy', desc: 'Paseo por la gran avenida de Budapest.',
          loc: { name: 'Andrássy út', q: 'Andrássy út, Budapest' } },
        { id: 'd21-6', time: '16:00–16:30', start: at(21, '16:00'), end: at(21, '16:30'), icon: 'burger',
          title: "McDonald's de Nyugati", desc: 'Parada en la estación Nyugati.',
          loc: { name: "McDonald's Nyugati", q: "McDonald's, Teréz körút 55, Budapest" } },
        { id: 'd21-7', time: '16:30–17:00', start: at(21, '16:30'), end: at(21, '17:00'), icon: 'bus',
          title: 'Desplazamiento al centro', desc: 'Hacia la Basílica.' },
        { id: 'd21-8', time: '17:00–19:00', start: at(21, '17:00'), end: at(21, '19:00'), icon: 'gift',
          title: 'Mercados navideños', desc: 'Basílica de San Esteban y Vörösmarty tér.',
          loc: { name: 'Basílica de San Esteban', q: "St. Stephen's Basilica, Budapest" } },
        { id: 'd21-9', time: '19:30–21:00', start: at(21, '19:30'), end: at(21, '21:00'), icon: 'utensils',
          title: 'Cena', desc: 'Última cena en Budapest.' },
        { id: 'd21-10', time: '21:00 →', start: at(21, '21:00'), end: at(21, '23:59'), icon: 'glass',
          title: 'Último paseo y copas', desc: 'Despedida de la ciudad.' }
      ]
    },
    {
      id: 'd22', short: 'Dom 22', dow: 'Domingo', num: 22, title: 'Regreso + Escala en Alicante',
      photo: 'img/mercado-navideno.jpg', date: '2026-11-22', tag: 'Escala en Alicante',
      items: [
        { id: 'd22-1', time: '', icon: 'coffee', title: 'Desayuno rápido', desc: 'Algo ligero antes de salir.' },
        { id: 'd22-2', time: '', icon: 'home', title: 'Check-out', desc: 'Dejar el apartamento.',
          loc: { name: 'Apartamento', q: ADDRESS_MAPS } },
        { id: 'd22-3', time: '', icon: 'car', title: 'Hasta Deák Ferenc tér', desc: 'Desplazamiento a la parada del 100E.',
          loc: { name: 'Deák Ferenc tér', q: 'Deák Ferenc tér, Budapest' } },
        { id: 'd22-4', time: '', icon: 'bus', title: 'Autobús 100E al aeropuerto', desc: 'Billete específico para el 100E.',
          more: 'Precio orientativo: 2.500 HUF por persona. No incluido en los bonos normales.',
          loc: { name: 'Aeropuerto de Budapest', q: 'Budapest Ferenc Liszt International Airport' } },
        { id: 'd22-5', time: '', icon: 'plane', title: 'Vuelo Budapest → Alicante', desc: 'Hora de salida pendiente de completar.', editableTime: true },

        /* ---- Escala en Alicante (horarios orientativos) ---- */
        { id: 'd22-a1', time: '14:25–15:00', start: at(22, '14:25'), end: at(22, '15:00'), icon: 'plane', alc: true,
          title: 'Llegada a Alicante', desc: 'Aterrizar, salir del avión y recoger equipaje si procede.',
          loc: { name: 'Aeropuerto de Alicante-Elche', q: 'Aeropuerto de Alicante-Elche Miguel Hernández' } },
        { id: 'd22-a2', time: '15:00–15:35', start: at(22, '15:00'), end: at(22, '15:35'), icon: 'bus', alc: true, approx: true,
          title: 'Autobús C6', desc: 'Del aeropuerto hasta Plaza Puerta del Mar.',
          more: 'Duración estimada: 20–30 minutos. Precio orientativo: 4,70 € por persona (9,40 € los dos).',
          link: { href: 'https://alicante.vectalia.es/', label: 'Horarios oficiales (Vectalia)' },
          loc: { name: 'Plaza Puerta del Mar', q: 'Plaza Puerta del Mar, Alicante' } },
        { id: 'd22-a3', time: '15:35–15:50', start: at(22, '15:35'), end: at(22, '15:50'), icon: 'luggage', alc: true, approx: true,
          title: 'Dejar mochilas', desc: 'Caminar hasta Lockers Stop y guardar las mochilas.',
          more: 'Calle Antonio Galdó Chápuli 10. La reserva es por taquilla, no por mochila.',
          link: { href: 'https://www.lockersstop.com/', label: 'Web de Lockers Stop' },
          loc: { name: 'Lockers Stop Alicante', q: 'Lockers Stop Alicante Calle Antonio Galdo Chapuli 10' } },
        { id: 'd22-a4', time: '15:50–16:40', start: at(22, '15:50'), end: at(22, '16:40'), icon: 'utensils', alc: true, approx: true,
          title: 'Comida', desc: 'Comer tranquilamente por la zona de la Explanada y el centro.' },
        { id: 'd22-a5', time: '16:40–17:15', start: at(22, '16:40'), end: at(22, '17:15'), icon: 'walk', alc: true, approx: true,
          title: 'Explanada de España y puerto', desc: 'Pasear por la Explanada, ver sus mosaicos y palmeras y acercarse al puerto deportivo.',
          loc: { name: 'Explanada de España', q: 'Explanada de España, Alicante' } },
        { id: 'd22-a6', time: '17:15–18:00', start: at(22, '17:15'), end: at(22, '18:00'), icon: 'camera', alc: true, approx: true,
          title: 'Barrio de Santa Cruz', desc: 'Recorrer sus calles, casas blancas, macetas de colores y miradores.',
          loc: { name: 'Barrio de Santa Cruz', q: 'Barrio de Santa Cruz, Alicante' } },
        { id: 'd22-a7', time: '18:00–18:20', start: at(22, '18:00'), end: at(22, '18:20'), icon: 'walk', alc: true, approx: true,
          title: 'Regreso al centro', desc: 'Bajar tranquilamente hacia la zona de la consigna.' },
        { id: 'd22-a8', time: '18:20–18:35', start: at(22, '18:20'), end: at(22, '18:35'), icon: 'luggage', alc: true, approx: true,
          title: 'Recoger mochilas', desc: 'Recuperar las mochilas y comprobar que llevamos todo.',
          loc: { name: 'Lockers Stop Alicante', q: 'Lockers Stop Alicante Calle Antonio Galdo Chapuli 10' } },
        { id: 'd22-a9', time: '18:35–19:00', start: at(22, '18:35'), end: at(22, '19:00'), icon: 'bus', alc: true, approx: true,
          title: 'Autobús C6 al aeropuerto', desc: 'Regresar al aeropuerto de Alicante.',
          link: { href: 'https://alicante.vectalia.es/', label: 'Horarios oficiales (Vectalia)' },
          loc: { name: 'Plaza Puerta del Mar', q: 'Plaza Puerta del Mar, Alicante' } },
        { id: 'd22-a10', time: '19:00–19:35', start: at(22, '19:00'), end: at(22, '19:35'), icon: 'clock', alc: true, approx: true,
          title: 'Llegada estimada al aeropuerto', desc: 'Con margen antes del vuelo de las 20:55.',
          loc: { name: 'Aeropuerto de Alicante-Elche', q: 'Aeropuerto de Alicante-Elche Miguel Hernández' } },
        { id: 'd22-a11', time: '20:55', start: at(22, '20:55'), end: at(22, '21:25'), icon: 'plane', alc: true,
          title: 'Salida del vuelo desde Alicante', desc: 'Siguiente vuelo tras la escala.' }
      ],
      /* Tarjetas de la escala (se muestran en el itinerario del domingo) */
      stopover: {
        title: 'Escala en Alicante',
        summary: 'Llegada 14:25 · salida 20:55 · 6 h 30 min para visitar el centro sin ir cargados con las mochilas.',
        transport: {
          name: 'Autobús C6 – Aeropuerto de Alicante',
          rows: [['Trayecto', 'Aeropuerto Alicante-Elche → centro'], ['Duración', '20–30 min (estimada)'],
            ['Precio', '4,70 € por persona · 9,40 € los dos'], ['Parada', 'Plaza Puerta del Mar'], ['Después', 'Andando hasta la consigna']],
          link: { href: 'https://alicante.vectalia.es/', label: 'Horarios oficiales' },
          q: 'Plaza Puerta del Mar, Alicante'
        },
        lockers: {
          name: 'Lockers Stop Alicante',
          rows: [['Dirección', 'Calle Antonio Galdó Chápuli 10, 03001 Alicante'], ['Servicio', 'Taquillas automáticas · abierto 24 h'],
            ['Precio', 'Taquilla M desde 7,95 € por día (orientativo)'], ['Reserva', 'Por taquilla, no por mochila']],
          warn: 'Comprobar las dimensiones antes de reservar para que quepan las dos mochilas.',
          link: { href: 'https://www.lockersstop.com/', label: 'Web de la consigna' },
          mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Lockers+Stop+Alicante+Calle+Antonio+Galdo+Chapuli+10',
          q: 'Lockers Stop Alicante Calle Antonio Galdo Chapuli 10'
        },
        visits: [
          { name: 'Explanada de España', desc: 'Mosaicos y palmeras junto al mar.', q: 'Explanada de España, Alicante' },
          { name: 'Puerto deportivo', desc: 'Junto a la Explanada.', q: 'Puerto deportivo de Alicante' },
          { name: 'Barrio de Santa Cruz', desc: 'Casas blancas, macetas de colores y miradores.', q: 'Barrio de Santa Cruz, Alicante' }
        ],
        budget: {
          rows: [['C6 aeropuerto → centro', '9,40 €'], ['Consigna M', 'Desde 7,95 €'], ['C6 centro → aeropuerto', '9,40 €']],
          total: '26,75 €',
          note: 'Precio para dos. El precio de la consigna es orientativo y la comida no está incluida.'
        }
      }
    }
  ];

  /* ---------- Reservas (valores iniciales; se pueden editar en la app) ---------- */
  const reservations = [
    { id: 'free-pest', title: 'Free Tour Pest', icon: 'users', date: 'Jueves 19 de noviembre', time: '10:30',
      type: '', price: '', includes: '', status: 'RESERVADO', place: '', code: '', link: '', notes: '', photos: [] },
    { id: 'crucero', title: 'Crucero por el Danubio', icon: 'ship', date: 'Jueves 19 de noviembre', time: '18:40',
      type: 'Crucero nocturno sin cena', price: '', includes: '', status: 'RESERVADO', place: '', code: '', link: '', notes: '', photos: [] },
    { id: 'free-buda', title: 'Free Tour Buda', icon: 'users', date: 'Viernes 20 de noviembre', time: '10:30',
      type: '', price: '', includes: '', status: 'RESERVADO', place: '', code: '', link: '', notes: '', photos: [] },
    { id: 'termas', title: 'Termas Széchenyi', icon: 'waves', date: 'Viernes 20 de noviembre', time: '19:00–22:00',
      type: '', price: '30 € por persona', includes: 'Incluye taquilla', status: 'ENTRADA LOCALIZADA',
      place: 'Széchenyi Thermal Bath, Állatkerti körút 9-11, Budapest', code: '', link: '', notes: '', photos: [] }
  ];

  const packing = [
    'DNI/pasaporte', 'Móvil y cargador', 'Bañador', 'Chanclas', 'Toalla', 'Ropa interior',
    'Calcetines', 'Vaquero oscuro', 'Pantalón negro', 'Camisetas', 'Jersey', 'Sudadera',
    'Chaqueta', 'Bufanda', 'Guantes', 'Neceser', 'Reservar taquilla para las dos mochilas'
  ].map((name, i) => ({ id: 'p' + i, name }));

  return {
    title: 'BUDAPEST TRIP 2026',
    dates: '18–22 noviembre 2026',
    travelers: 2,
    address: ADDRESS,
    addressMaps: ADDRESS_MAPS,
    arrival: at(18, '23:05'),
    tripEnd: at(22, '23:59'),
    city: { lat: 47.4979, lng: 19.0402 },
    places, days, reservations, packing
  };
})();
