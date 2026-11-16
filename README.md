# Budapest Trip 2026 🇭🇺

Web app para organizar y consultar nuestro viaje a Budapest (18–22 noviembre 2026), pensada para usarla desde el móvil durante el viaje.

- **Inicio**: portada, cuenta atrás, próxima actividad, tiempo real en Budapest, resumen por días, alojamiento y reservas.
- **Itinerario**: 5 pestañas (una por día) con tarjetas desplegables, estado de cada actividad, casilla de completado y notas.
- **Mapa**: todos los puntos del viaje sobre un mapa interactivo, con filtros por día y botones para abrir en Google Maps o pedir indicaciones.
- **Reservas**: tarjetas editables; se pueden añadir enlaces, códigos, notas y fotos de los tickets o códigos QR.
- **Información**: alojamiento, transporte, consejos, checklist de equipaje y copia de seguridad de los datos.

Es una **web 100 % estática** (HTML + CSS + JavaScript, sin frameworks ni compilación). No necesita servidor propio, base de datos ni ningún servicio de pago. Todo lo que marcas o editas se guarda en el propio navegador (`localStorage`).

---

## Publicar en GitHub Pages (gratis)

### Opción A — Desde la web de GitHub (sin instalar nada)

1. Entra en [github.com](https://github.com) e inicia sesión (o crea una cuenta gratuita).
2. Arriba a la derecha pulsa **+ → New repository**.
   - Nombre: por ejemplo `budapest-trip-2026`.
   - Visibilidad: **Public** (GitHub Pages gratuito requiere repositorio público).
   - Pulsa **Create repository**.
3. En el repositorio vacío pulsa **uploading an existing file**.
4. Descomprime el `.zip` del proyecto en tu ordenador, abre la carpeta y **arrastra todo su contenido** (no la carpeta en sí) a la ventana de GitHub: `index.html`, `README.md`, `manifest.webmanifest`, `sw.js`, `.nojekyll` y las carpetas `css`, `js`, `img` y `vendor`.
   - El archivo `.nojekyll` está oculto en macOS/Windows. En macOS pulsa `Cmd + Shift + .` para verlo; en Windows activa «Elementos ocultos» en el Explorador. No es imprescindible, pero es recomendable.
5. Pulsa **Commit changes**.
6. Ve a **Settings → Pages**.
   - En **Source** elige **Deploy from a branch**.
   - En **Branch** elige **main** y la carpeta **/ (root)**. Pulsa **Save**.
7. Espera 1–2 minutos y recarga la página de Settings → Pages. Aparecerá la dirección:

   ```
   https://TU-USUARIO.github.io/budapest-trip-2026/
   ```

### Opción B — Con Git desde la terminal

```bash
cd budapest-trip-2026
git init
git add .
git commit -m "Budapest Trip 2026"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/budapest-trip-2026.git
git push -u origin main
```

Después activa GitHub Pages igual que en el paso 6 de la opción A.

### Instalarla en el móvil como si fuera una app

Abre la URL en el móvil y:

- **iPhone (Safari)**: botón Compartir → **Añadir a pantalla de inicio**.
- **Android (Chrome)**: menú ⋮ → **Instalar aplicación** / **Añadir a pantalla de inicio**.

Tras la primera visita, la app (textos, fotos e itinerario) funciona **sin conexión**. El mapa necesita conexión para descargar las zonas que no hayas visto antes, y el tiempo se actualiza solo cuando hay internet.

---

## Por qué funciona en un subdirectorio

GitHub Pages publica los proyectos en `https://usuario.github.io/nombre-del-repositorio/`. Para que nada se rompa:

- Todas las rutas son **relativas** (`css/styles.css`, `img/…`, `sw.js`), nunca empiezan por `/`.
- La navegación interna usa **hash** (`#/inicio`, `#/itinerario/2`, `#/mapa`…), así que no hace falta configurar redirecciones ni un `404.html`.
- El `manifest.webmanifest` usa `start_url` y `scope` relativos (`./`).
- El proyecto **no usa Vite** ni ningún empaquetador, así que **no hay que configurar `base`**: se sube tal cual.
- `.nojekyll` evita que GitHub procese los archivos con Jekyll.

Funciona igual en cualquier hosting estático o VPS (Nginx, Apache…): basta con copiar la carpeta.

---

## Probarla en local

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
python3 -m http.server 8000
```

Y entra en `http://localhost:8000`. (También se puede abrir `index.html` directamente con doble clic, aunque así no se activa el modo sin conexión.)

---

## Datos guardados y copia de seguridad

- Las actividades completadas, las notas, el checklist de equipaje y los cambios en las reservas (incluidas las fotos de los tickets) se guardan en el **navegador de cada móvil**. No se sincronizan entre dispositivos.
- En **Información → Tus datos** puedes **Exportar** un archivo `.json` y **Importarlo** en el otro móvil.
- Las fotos se comprimen antes de guardarlas, pero `localStorage` tiene un límite (≈5 MB). Si ves el aviso «No hay espacio suficiente», borra alguna imagen o usa el campo **Enlace** para apuntar al ticket.
- Borrar los datos del navegador borra también el progreso guardado.

---

## Editar el contenido

| Quiero cambiar… | Archivo |
|---|---|
| Horarios, actividades, lugares, coordenadas, reservas iniciales, equipaje | `js/data.js` |
| Colores, tipografías, tamaños | `css/styles.css` (variables al principio) |
| Fotos | carpeta `img/` (mantén el mismo nombre de archivo, ~900–1400 px de ancho) |

Las reservas también se pueden editar directamente desde la app (botón **Editar**).

Si cambias archivos después de publicar, sube la versión en la primera línea de `sw.js` (por ejemplo `bp26-v1` → `bp26-v2`) para que los móviles descarguen la versión nueva. La actualización se aplica al abrir la app por segunda vez.

---

## Servicios externos (todos gratuitos y sin clave)

- **Google Maps**: solo mediante enlaces oficiales (`google.com/maps/search` y `google.com/maps/dir`). No se usa la API de pago.
- **Mapa interactivo**: [Leaflet](https://leafletjs.com) (incluido en `vendor/`) con mapas base gratuitos y sin clave: Esri Dark Gray (modo «Oscuro») y © OpenStreetMap (modo «Callejero»), seleccionables en el mapa.
- **Tiempo**: [Open-Meteo](https://open-meteo.com). Si no hay conexión se muestra el último dato descargado con su hora; nunca se inventan datos.
- **Tipografías**: Google Fonts (Inter y Fraunces). Si no cargan, se usan las del sistema.

## Créditos de las fotografías (Wikimedia Commons)

- Parlamento al amanecer — Andrew Shiva, CC BY-SA 4.0
- Puente de las Cadenas de noche — Wilfredor, CC0
- Bastión de los Pescadores — Perituss, CC0
- Plaza de los Héroes y Termas Széchenyi — Slyronit, CC BY-SA 4.0
- Mercado navideño de Vörösmarty — Elekes Andor, CC BY 4.0
- Szimpla Kert — Random photos 1989, CC0

Las imágenes se han redimensionado y comprimido para móvil.
