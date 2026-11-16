/* Utilidades de interfaz: escape, enlaces de Google Maps, hoja inferior, toast, imágenes */
window.UI = (function () {
  'use strict';
  const icon = window.ICONS;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* Enlaces oficiales de Google Maps (gratuitos, sin API key) */
  const gmaps = (q) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
  const gdir = (q) => 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(q);

  function mapButtons(q, compact, searchUrl) {
    if (!q) return '';
    return '<div class="btn-row' + (compact ? ' compact' : '') + '">' +
      '<a class="btn btn-ghost" href="' + esc(searchUrl || gmaps(q)) + '" target="_blank" rel="noopener">' + icon('map', 18) + '<span>Google Maps</span></a>' +
      '<a class="btn btn-primary" href="' + esc(gdir(q)) + '" target="_blank" rel="noopener">' + icon('nav', 18) + '<span>Cómo llegar</span></a>' +
      '</div>';
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    let el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  /* ---------- Hoja inferior (bottom sheet) ---------- */
  let current = null;
  function openSheet(html, opts) {
    closeSheet(true);
    const wrap = document.createElement('div');
    wrap.className = 'sheet-wrap';
    wrap.innerHTML = '<div class="sheet-backdrop" data-close></div>' +
      '<div class="sheet" role="dialog" aria-modal="true">' +
      '<div class="sheet-handle"></div>' +
      '<button class="sheet-x" data-close aria-label="Cerrar">' + icon('x', 20) + '</button>' +
      '<div class="sheet-body">' + html + '</div></div>';
    document.body.appendChild(wrap);
    document.body.classList.add('no-scroll');
    requestAnimationFrame(() => wrap.classList.add('open'));
    wrap.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeSheet(); });
    const onKey = (e) => { if (e.key === 'Escape') closeSheet(); };
    document.addEventListener('keydown', onKey);
    current = { wrap, onKey, onClose: opts && opts.onClose };
    return wrap.querySelector('.sheet-body');
  }
  function closeSheet(immediate) {
    if (!current) return;
    const c = current; current = null;
    document.removeEventListener('keydown', c.onKey);
    document.body.classList.remove('no-scroll');
    if (c.onClose) c.onClose();
    if (immediate) { c.wrap.remove(); return; }
    c.wrap.classList.remove('open');
    setTimeout(() => c.wrap.remove(), 260);
  }

  /* ---------- Diálogo de confirmación propio (sustituye a confirm()) ---------- */
  function ask(message, okLabel, danger) {
    return new Promise((resolve) => {
      const el = document.createElement('div');
      el.className = 'ask';
      el.innerHTML = '<div class="ask-box" role="alertdialog" aria-modal="true">' +
        '<p>' + esc(message) + '</p>' +
        '<div class="btn-row"><button class="btn btn-ghost" data-no>Cancelar</button>' +
        '<button class="btn ' + (danger ? 'btn-danger' : 'btn-primary') + '" data-yes>' + esc(okLabel || 'Aceptar') + '</button></div></div>';
      document.body.appendChild(el);
      requestAnimationFrame(() => el.classList.add('open'));
      const done = (v) => { el.classList.remove('open'); setTimeout(() => el.remove(), 180); document.removeEventListener('keydown', onKey, true); resolve(v); };
      const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); done(false); } };
      document.addEventListener('keydown', onKey, true);
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-yes]')) done(true);
        else if (e.target.closest('[data-no]') || e.target === el) done(false);
      });
      el.querySelector('[data-yes]').focus();
    });
  }

  /* ---------- Visor de imágenes a pantalla completa ---------- */
  function viewImage(src, onDelete) {
    const el = document.createElement('div');
    el.className = 'viewer';
    el.innerHTML = '<img src="' + esc(src) + '" alt="Imagen del ticket">' +
      '<div class="viewer-bar">' +
      (onDelete ? '<button class="btn btn-danger" data-del>' + icon('trash', 18) + '<span>Eliminar</span></button>' : '') +
      '<button class="btn btn-ghost" data-close>' + icon('x', 18) + '<span>Cerrar</span></button></div>';
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('open'));
    const close = () => { el.classList.remove('open'); setTimeout(() => el.remove(), 200); };
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-del]')) { ask('¿Eliminar esta imagen?', 'Eliminar', true).then(ok => { if (ok) { onDelete(); close(); } }); return; }
      if (e.target.closest('[data-close]') || e.target === el) close();
    });
  }

  /* ---------- Compresión de imágenes antes de guardarlas en localStorage ---------- */
  function compressImage(file, maxSide, quality) {
    maxSide = maxSide || 1400; quality = quality || 0.8;
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, maxSide / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen')); };
      img.src = url;
    });
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } finally { ta.remove(); }
    return Promise.resolve();
  }

  return { ask, esc, gmaps, gdir, mapButtons, toast, openSheet, closeSheet, viewImage, compressImage, copyText, icon };
})();
