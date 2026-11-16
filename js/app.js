/* ==========================================================================
   BUDAPEST TRIP 2026 — Aplicación
   Router por hash (#/inicio, #/itinerario/1, #/mapa, #/reservas, #/info):
   funciona en GitHub Pages en cualquier subdirectorio, sin servidor.
   ========================================================================== */
(function () {
  'use strict';
  const T = window.TRIP, S = window.STORE, U = window.UI, W = window.WEATHER;
  const icon = window.ICONS, esc = U.esc;
  const view = document.getElementById('view');
  const DAY_MS = 86400000;

  let cleanup = [];
  const onCleanup = (fn) => cleanup.push(fn);

  /* ---------------------------------------------------------------- helpers */
  const resMap = () => Object.fromEntries(S.reservations().map(r => [r.id, r]));
  const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

  function statusOf(item, done, res) {
    if (done[item.id]) return { key: 'done', label: 'Completado' };
    if (item.res && res[item.res] && res[item.res].status) {
      const st = res[item.res].status.trim().toUpperCase();
      const key = st === 'PENDIENTE' ? 'pending' : st.indexOf('LOCALIZAD') >= 0 ? 'found' : 'booked';
      return { key, label: cap(st) };
    }
    return { key: 'pending', label: 'Pendiente' };
  }

  /* Fecha "de Budapest" (UTC+1 en noviembre) como YYYY-MM-DD */
  const bpDate = (d) => new Date(d.getTime() + 3600000).toISOString().slice(0, 10);

  function phase(now) {
    const a = new Date(T.arrival), end = new Date(T.tripEnd);
    if (now < a) return { phase: 'before', ms: a - now };
    if (now <= end) {
      const today = bpDate(now);
      let idx = T.days.findIndex(d => d.date === today);
      if (idx < 0) idx = 0;
      return { phase: 'during', idx };
    }
    return { phase: 'after' };
  }

  function itemTimeLabel(item) {
    if (item.editableTime) { const t = S.extra().flightTime; return t || 'Pendiente'; }
    return item.time;
  }

  function locationFor(item, res) {
    if (item.loc) return item.loc;
    if (item.res && res[item.res] && res[item.res].place) return { name: res[item.res].place, q: res[item.res].place };
    return null;
  }

  function nextActivity(now) {
    const done = S.done();
    for (const d of T.days) {
      for (const it of d.items) {
        if (done[it.id]) continue;
        if (!it.start) {
          // Tarea sin hora: solo cuenta hoy y mientras no haya empezado la siguiente actividad con hora
          const later = d.items.slice(d.items.indexOf(it) + 1).find(x => x.start);
          if (d.date === bpDate(now) && now >= new Date(T.arrival) && (!later || now < new Date(later.start))) return { item: it, day: d, live: false };
          continue;
        }
        const s = new Date(it.start);
        const e = it.end ? new Date(it.end) : new Date(s.getTime() + 30 * 60000);
        if (now < e) return { item: it, day: d, live: now >= s };
      }
    }
    if (now < new Date(T.tripEnd)) {
      const last = T.days[T.days.length - 1];
      const it = last.items.find(i => !done[i.id]);
      if (it) return { item: it, day: last, live: false };
    }
    return null;
  }

  function dayProgress(day, done) {
    const n = day.items.filter(i => done[i.id]).length;
    return { n, total: day.items.length, pct: Math.round(n / day.items.length * 100) };
  }

  /* ---------------------------------------------------------------- router */
  const routes = { inicio: renderHome, itinerario: renderItinerary, mapa: renderMap, reservas: renderReservations, info: renderInfo };

  function parseHash() {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    return { name: routes[parts[0]] ? parts[0] : 'inicio', arg: parts[1] };
  }

  function navigate() {
    cleanup.forEach(fn => { try { fn(); } catch (e) { /* noop */ } });
    cleanup = [];
    U.closeSheet(true);
    const { name, arg } = parseHash();
    document.querySelectorAll('.tabbar a').forEach(a => {
      const on = a.dataset.route === name;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.body.dataset.route = name;
    view.classList.remove('enter');
    routes[name](arg);
    void view.offsetWidth;
    view.classList.add('enter');
    if (!(name === 'info' && arg)) window.scrollTo(0, 0);
  }

  /* ================================================================= INICIO */
  function renderHome() {
    const now = new Date();
    const done = S.done();
    const res = S.reservations();
    const w = S.weather();

    const dayCards = T.days.map((d, i) => {
      const p = dayProgress(d, done);
      const wd = w && w.daily && w.daily[d.date];
      const wx = wd ? '<span class="wx-mini">' + icon(W.describe(wd.code).icon, 14) + Math.round(wd.max) + '° / ' + Math.round(wd.min) + '°</span>' : '';
      const highlights = d.items.filter(it => it.res).map(it => it.title).slice(0, 2);
      return '<a class="day-card" href="#/itinerario/' + i + '">' +
        '<div class="day-card-bg" style="background-image:url(\'' + esc(d.photo) + '\')"></div>' +
        '<div class="day-card-body">' +
        '<div class="day-card-top"><span class="day-num">' + d.num + '</span><span class="day-dow">' + esc(d.dow) + '</span>' + wx + '</div>' +
        '<h3>' + esc(d.title) + '</h3>' +
        (d.tag ? '<span class="tag-alc">' + icon('plane', 12) + esc(d.tag) + '</span>' : '') +
        (highlights.length ? '<p class="day-hl">' + icon('ticket', 14) + esc(highlights.join(' · ')) + '</p>' : '<p class="day-hl muted">' + d.items.length + ' actividades</p>') +
        '<div class="progress"><span style="width:' + p.pct + '%"></span></div>' +
        '<p class="day-count">' + p.n + '/' + p.total + ' completadas</p>' +
        '</div></a>';
    }).join('');

    const resList = res.map(r =>
      '<a class="mini-res" href="#/reservas">' +
      '<span class="mini-res-ic">' + icon(r.icon || 'ticket', 18) + '</span>' +
      '<span class="mini-res-txt"><strong>' + esc(r.title) + '</strong><small>' + esc([r.date.replace(/ de noviembre/, ''), r.time].filter(Boolean).join(' · ')) + '</small></span>' +
      '<span class="badge ' + badgeClass(r.status) + '">' + esc(cap(r.status)) + '</span></a>').join('');

    view.innerHTML =
      '<section class="hero">' +
        '<img class="hero-img" src="img/hero-parlamento.jpg" alt="Parlamento de Budapest iluminado sobre el Danubio" fetchpriority="high" decoding="async">' +
        '<div class="hero-shade"></div>' +
        '<div class="hero-top">' +
          '<span class="chip glass">' + icon('pin', 14) + 'Budapest · Hungría</span>' +
          '<span class="chip glass" id="wx-now">' + icon('thermo', 14) + '<span class="muted">Tiempo…</span></span>' +
        '</div>' +
        '<div class="hero-body">' +
          '<p class="eyebrow">' + icon('calendar', 14) + esc(T.dates) + ' · ' + icon('users', 14) + T.travelers + ' viajeros</p>' +
          '<h1 class="hero-title">BUDAPEST<span>TRIP 2026</span></h1>' +
          '<div class="countdown" id="countdown"></div>' +
        '</div>' +
      '</section>' +

      '<div class="page">' +
        '<section class="section"><div id="next-act"></div></section>' +

        '<section class="section quick">' +
          quick('#/reservas', 'ticket', 'Reservas', res.length + ' reservas') +
          quick('#/mapa', 'map', 'Mapa', T.places.length + ' lugares') +
          quick(U.gmaps(T.addressMaps), 'home', 'Alojamiento', 'Abrir en Maps', true) +
          quick('#/info/equipaje', 'luggage', 'Equipaje', 'Checklist') +
        '</section>' +

        '<section class="section">' +
          '<div class="section-head"><h2>Día a día</h2><a href="#/itinerario" class="link">Ver itinerario ' + icon('chevronR', 16) + '</a></div>' +
          '<div class="day-grid">' + dayCards + '</div>' +
        '</section>' +

        '<section class="section two-col">' +
          '<div class="card addr-card">' +
            '<div class="card-head"><span class="card-ic gold">' + icon('home', 20) + '</span><div><h2>Alojamiento</h2><p class="muted">' + esc(T.address) + '</p></div></div>' +
            '<div class="btn-row"><button class="btn btn-ghost" data-copy="' + esc(T.address) + '">' + icon('copy', 18) + '<span>Copiar</span></button>' +
            '<a class="btn btn-primary" href="' + esc(U.gdir(T.addressMaps)) + '" target="_blank" rel="noopener">' + icon('nav', 18) + '<span>Cómo llegar</span></a></div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="section-head tight"><h2>Reservas</h2><a href="#/reservas" class="link">Todas ' + icon('chevronR', 16) + '</a></div>' +
            '<div class="mini-res-list">' + resList + '</div>' +
          '</div>' +
        '</section>' +
      '</div>';

    view.querySelector('[data-copy]').addEventListener('click', (e) => {
      U.copyText(e.currentTarget.dataset.copy).then(() => U.toast('Dirección copiada'));
    });

    const tick = () => { renderCountdown(); renderNext(); };
    tick();
    const t = setInterval(tick, 30000);
    onCleanup(() => clearInterval(t));

    W.load().then(wx => {
      const el = document.getElementById('wx-now');
      if (!el) return;
      if (wx && wx.current) {
        const d = W.describe(wx.current.code);
        const stale = Date.now() - wx.ts > 60 * 60000;
        el.innerHTML = icon(d.icon, 14) + '<strong>' + Math.round(wx.current.t) + '°C</strong><span class="muted">' + esc(d.label) +
          (stale ? ' · ' + new Date(wx.ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '') + '</span>';
        el.title = 'Datos de Open-Meteo';
        // pintar previsión por día si aún no estaba
        if (!w && parseHash().name === 'inicio') document.querySelectorAll('.day-card').forEach((card, i) => {
          const wd = wx.daily[T.days[i].date];
          if (wd && !card.querySelector('.wx-mini')) card.querySelector('.day-card-top').insertAdjacentHTML('beforeend',
            '<span class="wx-mini">' + icon(W.describe(wd.code).icon, 14) + Math.round(wd.max) + '° / ' + Math.round(wd.min) + '°</span>');
        });
      } else {
        el.innerHTML = icon('thermo', 14) + '<span class="muted">Tiempo no disponible</span>';
      }
    });
  }

  function quick(href, ic, title, sub, external) {
    return '<a class="quick-tile" href="' + esc(href) + '"' + (external ? ' target="_blank" rel="noopener"' : '') + '>' +
      '<span class="quick-ic">' + icon(ic, 22) + '</span><strong>' + esc(title) + '</strong><small>' + esc(sub) + '</small></a>';
  }

  function renderCountdown() {
    const el = document.getElementById('countdown');
    if (!el) return;
    const p = phase(new Date());
    if (p.phase === 'before') {
      const d = Math.floor(p.ms / DAY_MS), h = Math.floor(p.ms % DAY_MS / 3600000), m = Math.floor(p.ms % 3600000 / 60000);
      el.innerHTML = '<span class="cd-label">Aterrizamos en</span><div class="cd-cells">' +
        cell(d, d === 1 ? 'día' : 'días') + cell(h, 'horas') + cell(m, 'min') + '</div>';
    } else if (p.phase === 'during') {
      const d = T.days[p.idx];
      el.innerHTML = '<div class="cd-live"><span class="dot"></span>Día ' + (p.idx + 1) + ' de ' + T.days.length + ' · ' + esc(d.dow) + ' ' + d.num + '</div>';
    } else {
      el.innerHTML = '<div class="cd-live done">' + icon('check', 16) + 'Viaje completado · ¡Viszontlátásra, Budapest!</div>';
    }
  }
  const cell = (n, l) => '<div class="cd-cell"><strong>' + String(n).padStart(2, '0') + '</strong><span>' + l + '</span></div>';

  function renderNext() {
    const el = document.getElementById('next-act');
    if (!el) return;
    const nx = nextActivity(new Date());
    if (!nx) {
      el.innerHTML = '<div class="card next-card"><p class="eyebrow">Próxima actividad</p><h3>No quedan actividades</h3><p class="muted">¡Esperamos que haya sido un viaje increíble!</p></div>';
      return;
    }
    const res = resMap();
    const st = statusOf(nx.item, S.done(), res);
    const di = T.days.indexOf(nx.day);
    el.innerHTML = '<a class="card next-card" href="#/itinerario/' + di + '">' +
      '<p class="eyebrow">' + (nx.live ? '<span class="dot"></span>Ahora mismo' : 'Próxima actividad') + '</p>' +
      '<div class="next-row"><span class="next-ic">' + icon(nx.item.icon, 26) + '</span>' +
      '<div class="next-txt"><h3>' + esc(nx.item.title) + '</h3>' +
      '<p class="muted">' + esc(nx.day.dow + ' ' + nx.day.num) + (itemTimeLabel(nx.item) ? ' · ' + esc(itemTimeLabel(nx.item)) : '') + '</p></div>' +
      '<span class="badge b-' + st.key + '">' + esc(st.label) + '</span></div>' +
      '</a>';
  }

  function badgeClass(status) {
    const s = (status || '').toUpperCase();
    if (s === 'PENDIENTE') return 'b-pending';
    if (s.indexOf('LOCALIZAD') >= 0) return 'b-found';
    return 'b-booked';
  }

  /* ============================================================= ITINERARIO */
  function renderItinerary(arg) {
    let idx = parseInt(arg, 10);
    if (isNaN(idx) || idx < 0 || idx >= T.days.length) {
      const p = phase(new Date());
      idx = p.phase === 'during' ? p.idx : 0;
    }
    const day = T.days[idx];
    const done = S.done();
    const notes = S.notes();
    const res = resMap();
    const p = dayProgress(day, done);

    const tabs = T.days.map((d, i) =>
      '<a class="day-tab' + (i === idx ? ' active' : '') + '" href="#/itinerario/' + i + '" aria-selected="' + (i === idx) + '" role="tab">' +
      '<small>' + esc(d.short.split(' ')[0]) + '</small><strong>' + d.num + '</strong>' + (d.tag ? '<i class="tab-dot" aria-hidden="true"></i>' : '') + '</a>').join('');

    let firstAlc = true;
    const items = day.items.map(it => {
      let pre = '';
      if (it.alc && firstAlc) {
        firstAlc = false;
        pre = '<div class="tl-divider"><span class="tag-alc">' + icon('plane', 12) + esc(day.tag || 'Escala') + '</span>' +
          '<small>Horarios orientativos, no confirmados</small></div>';
      }
      return pre + activityCard(it, done, notes, res);
    }).join('');

    view.innerHTML =
      '<div class="page page-top">' +
        '<header class="page-head"><p class="eyebrow">Itinerario</p><h1>Día a día</h1></header>' +
        '<nav class="day-tabs" role="tablist">' + tabs + '</nav>' +
        '<section class="day-banner" style="background-image:url(\'' + esc(day.photo) + '\')">' +
          '<div class="day-banner-shade"></div>' +
          '<div class="day-banner-body"><p class="eyebrow">' + esc(day.dow) + ' ' + day.num + ' de noviembre</p>' +
          '<h2>' + esc(day.title) + '</h2>' +
          (day.tag ? '<span class="tag-alc">' + icon('plane', 12) + esc(day.tag) + '</span>' : '') +
          '<div class="progress"><span style="width:' + p.pct + '%"></span></div>' +
          '<p class="day-count" id="day-count">' + p.n + '/' + p.total + ' completadas</p></div>' +
        '</section>' +
        '<div class="timeline">' + items + '</div>' +
        (day.stopover ? stopoverCards(day.stopover) : '') +
        '<div class="day-nav">' +
          (idx > 0 ? '<a class="btn btn-ghost" href="#/itinerario/' + (idx - 1) + '">← ' + esc(T.days[idx - 1].short) + '</a>' : '<span></span>') +
          (idx < T.days.length - 1 ? '<a class="btn btn-ghost" href="#/itinerario/' + (idx + 1) + '">' + esc(T.days[idx + 1].short) + ' →</a>' : '<span></span>') +
        '</div>' +
      '</div>';

    // Tab activa visible
    const activeTab = view.querySelector('.day-tab.active');
    if (activeTab && activeTab.scrollIntoView) activeTab.scrollIntoView({ block: 'nearest', inline: 'center' });

    view.querySelector('.timeline').addEventListener('click', (e) => {
      const card = e.target.closest('.act');
      if (!card) return;
      const id = card.dataset.id;
      if (e.target.closest('.act-check')) {
        const now = !S.done()[id];
        S.setDone(id, now);
        refreshCard(card, day);
        if (now && navigator.vibrate) navigator.vibrate(12);
        return;
      }
      if (e.target.closest('.act-main')) toggleCard(card);
    });
    view.querySelector('.timeline').addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('act-main')) { e.preventDefault(); toggleCard(e.target.closest('.act')); }
    });
    view.querySelector('.timeline').addEventListener('input', (e) => {
      const ta = e.target.closest('textarea[data-note]');
      if (ta) S.setNote(ta.dataset.note, ta.value.trim());
      const ft = e.target.closest('input[data-flight]');
      if (ft) { S.setExtra('flightTime', ft.value); const lbl = ft.closest('.act').querySelector('.act-time'); if (lbl) lbl.textContent = ft.value || 'Pendiente'; }
    });
  }

  function toggleCard(card) {
    const more = card.querySelector('.act-more');
    const main = card.querySelector('.act-main');
    const open = !card.classList.contains('open');
    card.classList.toggle('open', open);
    more.hidden = !open;
    main.setAttribute('aria-expanded', String(open));
  }

  function refreshCard(card, day) {
    const done = S.done(), res = resMap();
    const it = day.items.find(i => i.id === card.dataset.id);
    const st = statusOf(it, done, res);
    card.className = card.className.replace(/\bs-\w+/, 's-' + st.key);
    const b = card.querySelector('.act-head .badge');
    b.className = 'badge b-' + st.key; b.textContent = st.label;
    const chk = card.querySelector('.act-check');
    chk.setAttribute('aria-pressed', String(!!done[it.id]));
    const p = dayProgress(day, done);
    const bar = view.querySelector('.day-banner .progress span');
    if (bar) bar.style.width = p.pct + '%';
    const c = document.getElementById('day-count');
    if (c) c.textContent = p.n + '/' + p.total + ' completadas';
  }

  function activityCard(it, done, notes, res) {
    const st = statusOf(it, done, res);
    const loc = locationFor(it, res);
    const r = it.res ? res[it.res] : null;
    const time = itemTimeLabel(it);

    let more = '';
    if (it.more) more += '<p class="more-txt">' + icon('info', 16) + esc(it.more) + '</p>';
    if (it.link) more += '<a class="btn btn-ghost block ext-link" href="' + esc(it.link.href) + '" target="_blank" rel="noopener">' + icon('external', 18) + '<span>' + esc(it.link.label) + '</span></a>';
    if (r) {
      const rows = [['Fecha', r.date], ['Hora', r.time], ['Tipo', r.type], ['Precio', r.price], ['Incluye', r.includes], ['Lugar', r.place], ['Código', r.code]]
        .filter(x => x[1]).map(x => '<div><dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd></div>').join('');
      more += '<div class="res-inline"><p class="res-inline-title">' + icon('ticket', 16) + 'Reserva</p><dl>' + rows + '</dl>' +
        '<a class="link" href="#/reservas">Ver o editar reserva ' + icon('chevronR', 14) + '</a></div>';
    }
    if (it.editableTime) {
      more += '<label class="field"><span>Hora de salida del vuelo</span><input type="time" data-flight value="' + esc(S.extra().flightTime || '') + '"></label>';
    }
    if (loc) more += '<p class="more-loc">' + icon('pin', 16) + esc(loc.name) + '</p>' + U.mapButtons(loc.q, true);
    more += '<label class="field"><span>Notas</span><textarea rows="2" data-note="' + esc(it.id) + '" placeholder="Añade una nota…">' + esc(notes[it.id] || '') + '</textarea></label>';

    return '<article class="act s-' + st.key + (it.alc ? ' alc' : '') + '" data-id="' + esc(it.id) + '">' +
      '<button class="act-check" aria-pressed="' + (!!done[it.id]) + '" aria-label="Marcar «' + esc(it.title) + '» como completada">' + icon('check', 18) + '</button>' +
      '<div class="act-main" role="button" tabindex="0" aria-expanded="false">' +
        '<div class="act-head"><span class="act-time">' + (time ? esc(time) : '—') + (it.approx ? '<em class="approx">aprox.</em>' : '') + '</span><span class="badge b-' + st.key + '">' + esc(st.label) + '</span></div>' +
        '<div class="act-title"><span class="act-ic">' + icon(it.icon, 18) + '</span><h3>' + esc(it.title) + '</h3><span class="act-chev">' + icon('chevron', 18) + '</span></div>' +
        '<p class="act-desc">' + esc(it.desc) + '</p>' +
        (loc ? '<p class="act-loc">' + icon('pin', 14) + esc(loc.name) + '</p>' : '') +
      '</div>' +
      '<div class="act-more" hidden>' + more + '</div>' +
      '</article>';
  }

  function stopoverCards(so) {
    const rows = (list) => '<ul class="res-rows">' + list.map(r => '<li class="two"><span class="k">' + esc(r[0]) + '</span><span class="v">' + esc(r[1]) + '</span></li>').join('') + '</ul>';
    const ext = (l) => '<a class="btn btn-ghost" href="' + esc(l.href) + '" target="_blank" rel="noopener">' + icon('external', 18) + '<span>' + esc(l.label) + '</span></a>';
    const t = so.transport, l = so.lockers, b = so.budget;
    return '<section class="stopover">' +
      '<div class="section-head"><h2>' + esc(so.title) + '</h2><span class="tag-alc">' + icon('plane', 12) + 'Dom 22</span></div>' +
      '<p class="muted small so-sum">' + esc(so.summary) + '</p>' +
      '<div class="so-grid">' +
        '<article class="card"><div class="card-head"><span class="card-ic">' + icon('bus', 20) + '</span><h3>' + esc(t.name) + '</h3></div>' +
          rows(t.rows) + '<div class="btn-row">' + ext(t.link) +
          '<a class="btn btn-primary" href="' + esc(U.gdir(t.q)) + '" target="_blank" rel="noopener">' + icon('nav', 18) + '<span>Parada</span></a></div></article>' +
        '<article class="card"><div class="card-head"><span class="card-ic gold">' + icon('luggage', 20) + '</span><h3>Consigna · ' + esc(l.name) + '</h3></div>' +
          rows(l.rows) + '<p class="more-txt so-warn">' + icon('info', 16) + esc(l.warn) + '</p>' +
          '<div class="btn-row">' + ext(l.link) +
          '<a class="btn btn-ghost" href="' + esc(l.mapsUrl) + '" target="_blank" rel="noopener">' + icon('map', 18) + '<span>Google Maps</span></a></div>' +
          '<a class="btn btn-primary block" href="' + esc(U.gdir(l.q)) + '" target="_blank" rel="noopener">' + icon('nav', 18) + '<span>Cómo llegar</span></a></article>' +
        '<article class="card"><div class="card-head"><span class="card-ic">' + icon('camera', 20) + '</span><h3>Visitas</h3></div>' +
          '<ul class="so-visits">' + so.visits.map(v => '<li><div><strong>' + esc(v.name) + '</strong><small>' + esc(v.desc) + '</small></div>' +
            '<a class="icon-btn" href="' + esc(U.gmaps(v.q)) + '" target="_blank" rel="noopener" aria-label="Abrir ' + esc(v.name) + ' en Google Maps">' + icon('map', 18) + '</a>' +
            '<a class="icon-btn primary" href="' + esc(U.gdir(v.q)) + '" target="_blank" rel="noopener" aria-label="Cómo llegar a ' + esc(v.name) + '">' + icon('nav', 18) + '</a></li>').join('') + '</ul>' +
          '<a class="link so-maplink" href="#/mapa/alc">Ver en el mapa ' + icon('chevronR', 14) + '</a></article>' +
        '<article class="card"><div class="card-head"><span class="card-ic gold">' + icon('ticket', 20) + '</span><h3>Presupuesto de la escala</h3></div>' +
          '<table class="budget"><thead><tr><th>Concepto</th><th>Para dos</th></tr></thead><tbody>' +
          b.rows.map(r => '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td></tr>').join('') +
          '</tbody><tfoot><tr><td>Total</td><td>' + esc(b.total) + '</td></tr></tfoot></table>' +
          '<p class="muted small">' + esc(b.note) + '</p></article>' +
      '</div></section>';
  }

  /* =================================================================== MAPA */
  const DAY_FILTERS = [{ k: 'all', l: 'Budapest' }, { k: '1', l: 'Jue 19' }, { k: '2', l: 'Vie 20' }, { k: '3', l: 'Sáb 21' }, { k: 'alc', l: 'Alicante · Dom 22' }];
  const inFilter = (p, f) => f === 'alc' ? p.region === 'alc' : p.region !== 'alc' && (f === 'all' || p.days.indexOf(+f) >= 0);

  function placeQuery(p) {
    if (p.pendingKey) { const r = S.reservation(p.pendingKey); return r && r.place ? r.place : null; }
    return p.q;
  }

  function renderMap(arg) {
    const initial = DAY_FILTERS.some(f => f.k === arg) ? arg : 'all';
    view.innerHTML =
      '<div class="page page-top">' +
        '<header class="page-head"><p class="eyebrow">Mapa</p><h1>Lugares del viaje</h1></header>' +
        '<div class="map-card"><div id="map" role="region" aria-label="Mapa interactivo"></div>' +
          '<button class="map-fit" aria-label="Ver todos los lugares">' + icon('map', 18) + '</button>' +
          '<button class="map-layer">' + icon('sparkle', 16) + '<span>Callejero</span></button></div>' +
        '<div class="filters" role="group" aria-label="Filtrar por día">' +
          DAY_FILTERS.map(f => '<button class="filter' + (f.k === initial ? ' active' : '') + (f.k === 'alc' ? ' f-alc' : '') + '" data-f="' + f.k + '">' + f.l + '</button>').join('') +
        '</div>' +
        '<ul class="place-list">' + T.places.map((p, i) =>
          '<li><button class="place-row" data-place="' + esc(p.id) + '" data-days="' + p.days.join(',') + '">' +
          '<span class="place-ic c-' + p.color + '">' + icon(p.icon, 18) + '</span>' +
          '<span class="place-txt"><strong>' + esc(p.name) + '</strong><small>' + esc(p.day) + '</small></span>' +
          icon('chevronR', 18) + '</button></li>').join('') +
        '</ul>' +
      '</div>';

    const markers = {};
    let map = null;
    if (window.L) {
      map = L.map('map', { maxZoom: 19, zoomControl: false, attributionControl: true, tap: true }).setView([47.505, 19.058], 13);
      L.control.zoom({ position: 'topright' }).addTo(map);
      // Mapas base gratuitos y sin clave: Esri (oscuro) y OpenStreetMap (callejero)
      const esriAttr = 'Tiles &copy; <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a> &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap';
      const dark = L.layerGroup([
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', { maxNativeZoom: 16, maxZoom: 19, attribution: esriAttr }),
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', { maxNativeZoom: 16, maxZoom: 19 })
      ]);
      const streets = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
      });
      let mode = S.extra().mapLayer === 'streets' ? 'streets' : 'dark';
      const layerBtn = view.querySelector('.map-layer');
      const applyLayer = () => {
        if (mode === 'streets') { map.removeLayer(dark); streets.addTo(map); } else { map.removeLayer(streets); dark.addTo(map); }
        layerBtn.querySelector('span').textContent = mode === 'streets' ? 'Oscuro' : 'Callejero';
        layerBtn.setAttribute('aria-label', 'Cambiar a mapa ' + (mode === 'streets' ? 'oscuro' : 'callejero'));
      };
      applyLayer();
      layerBtn.addEventListener('click', () => { mode = mode === 'streets' ? 'dark' : 'streets'; S.setExtra('mapLayer', mode); applyLayer(); });
      T.places.forEach(p => {
        if (p.lat == null) return;
        const m = L.marker([p.lat, p.lng], {
          title: p.name, alt: p.name, riseOnHover: true,
          icon: L.divIcon({ className: 'pin c-' + p.color, html: '<span>' + icon(p.icon, 16) + '</span>', iconSize: [36, 42], iconAnchor: [18, 40] })
        }).addTo(map).on('click', () => openPlace(p));
        markers[p.id] = m;
      });
      onCleanup(() => map.remove());
    } else {
      document.getElementById('map').innerHTML = '<div class="map-fallback">' + icon('map', 28) + '<p>No se ha podido cargar el mapa. Usa la lista de abajo para abrir cada lugar en Google Maps.</p></div>';
    }

    function fit(filter) {
      if (!map) return;
      const pts = T.places.filter(p => p.lat != null && inFilter(p, filter || 'all')).map(p => [p.lat, p.lng]);
      if (pts.length) map.fitBounds(pts, { paddingTopLeft: [56, 64], paddingBottomRight: [64, 72], maxZoom: 15 });
    }

    let currentFilter = initial;
    const applyFilter = () => {
      view.querySelectorAll('.filter').forEach(x => x.classList.toggle('active', x.dataset.f === currentFilter));
      T.places.forEach(p => {
        const show = inFilter(p, currentFilter);
        const row = view.querySelector('[data-place="' + p.id + '"]');
        if (row) row.parentElement.hidden = !show;
        const m = markers[p.id];
        if (m && map) { if (show) m.addTo(map); else m.remove(); }
      });
      fit(currentFilter);
    };
    applyFilter();
    view.querySelector('.filters').addEventListener('click', (e) => {
      const b = e.target.closest('.filter'); if (!b) return;
      currentFilter = b.dataset.f;
      applyFilter();
    });
    view.querySelector('.map-fit').addEventListener('click', () => fit(currentFilter));
    view.querySelector('.place-list').addEventListener('click', (e) => {
      const b = e.target.closest('.place-row'); if (!b) return;
      const p = T.places.find(x => x.id === b.dataset.place);
      if (map && p.lat != null) map.flyTo([p.lat, p.lng], 15, { duration: 0.6 });
      openPlace(p);
    });
  }

  function openPlace(p) {
    const q = placeQuery(p);
    const pending = !q;
    U.openSheet(
      (p.photo ? '<div class="sheet-photo" style="background-image:url(\'' + esc(p.photo) + '\')"></div>' : '') +
      '<div class="sheet-title"><span class="place-ic c-' + p.color + '">' + icon(p.icon, 20) + '</span><h2>' + esc(p.name) + '</h2></div>' +
      '<p class="chip-day">' + icon('calendar', 14) + esc(p.day) + '</p>' +
      '<p class="sheet-desc">' + esc(p.desc) + '</p>' +
      (pending
        ? '<div class="notice">' + icon('info', 18) + '<p>Punto de embarque pendiente. Añádelo en la reserva del crucero (campo «Lugar») y aquí aparecerán los botones de Google Maps.</p></div>' +
          '<a class="btn btn-primary block" href="#/reservas" data-close>' + icon('edit', 18) + '<span>Ir a Reservas</span></a>'
        : (p.pendingKey ? '<p class="more-loc">' + icon('pin', 16) + esc(q) + '</p>' : '') + U.mapButtons(q, false, p.mapsUrl))
    );
  }

  /* =============================================================== RESERVAS */
  const STATUS_OPTIONS = ['RESERVADO', 'ENTRADA LOCALIZADA', 'COMPRADO', 'PENDIENTE'];
  const FIELDS = [
    ['title', 'Nombre', 'text'], ['date', 'Fecha', 'text'], ['time', 'Hora', 'text'], ['type', 'Tipo', 'text'],
    ['price', 'Precio', 'text'], ['includes', 'Incluye', 'text'], ['place', 'Lugar / punto de encuentro', 'text'],
    ['code', 'Código o localizador', 'text'], ['link', 'Enlace (web, ticket, email…)', 'url'], ['notes', 'Notas', 'textarea']
  ];

  function renderReservations() {
    drawReservations();
    view.addEventListener('click', onResClick);
    onCleanup(() => view.removeEventListener('click', onResClick));
    view.addEventListener('change', onResFile);
    onCleanup(() => view.removeEventListener('change', onResFile));
  }

  function drawReservations() {
    const list = S.reservations();
    view.innerHTML =
      '<div class="page page-top">' +
        '<header class="page-head"><p class="eyebrow">Reservas</p><h1>Tickets y entradas</h1>' +
        '<p class="muted">Toca «Editar» para completar datos, añadir enlaces o fotos de los tickets y códigos QR. Todo se guarda en este dispositivo.</p></header>' +
        '<div class="res-grid">' + list.map(resCard).join('') + '</div>' +
        '<button class="btn btn-ghost block add-res">' + icon('plus', 18) + '<span>Añadir otra reserva</span></button>' +
      '</div>';
  }

  function resCard(r) {
    const rows = [['calendar', 'Fecha', r.date], ['clock', 'Hora', r.time], ['info', 'Tipo', r.type], ['ticket', 'Precio', r.price],
      ['check', 'Incluye', r.includes], ['pin', 'Lugar', r.place], ['copy', 'Código', r.code]]
      .filter(x => x[2]).map(x => '<li>' + icon(x[0], 16) + '<span class="k">' + x[1] + '</span><span class="v">' + esc(x[2]) + '</span></li>').join('');
    const photos = (r.photos || []).map((src, i) => '<button class="thumb" data-view="' + i + '" aria-label="Ver imagen ' + (i + 1) + '"><img src="' + src + '" alt=""></button>').join('');
    const link = safeLink(r.link);
    return '<article class="card res-card" data-res="' + esc(r.id) + '">' +
      '<div class="res-head"><span class="card-ic">' + icon(r.icon || 'ticket', 20) + '</span>' +
      '<h2>' + esc(r.title) + '</h2><span class="badge ' + badgeClass(r.status) + '">' + esc(cap(r.status)) + '</span></div>' +
      '<ul class="res-rows">' + rows + '</ul>' +
      (r.notes ? '<p class="res-notes">' + esc(r.notes) + '</p>' : '') +
      (photos ? '<div class="thumbs">' + photos + '</div>' : '') +
      '<div class="res-actions">' +
        '<button class="btn btn-ghost" data-edit>' + icon('edit', 18) + '<span>Editar</span></button>' +
        '<label class="btn btn-ghost">' + icon('image', 18) + '<span>Foto / QR</span><input type="file" accept="image/*" data-file hidden></label>' +
        (link ? '<a class="btn btn-ghost" href="' + esc(link) + '" target="_blank" rel="noopener">' + icon('link', 18) + '<span>Abrir enlace</span></a>' : '') +
        (r.place ? '<a class="btn btn-ghost" href="' + esc(U.gdir(r.place)) + '" target="_blank" rel="noopener">' + icon('nav', 18) + '<span>Cómo llegar</span></a>' : '') +
      '</div></article>';
  }

  function safeLink(url) {
    if (!url) return '';
    const u = url.trim();
    if (/^https?:\/\//i.test(u)) return u;
    if (/^(javascript|data|vbscript):/i.test(u)) return '';
    return 'https://' + u;
  }

  function updateRes(id, fn) {
    const list = S.reservations();
    const r = list.find(x => x.id === id);
    if (!r) return false;
    fn(r, list);
    return S.saveReservations(list);
  }

  function onResClick(e) {
    if (e.target.closest('.add-res')) {
      const list = S.reservations();
      const id = 'custom-' + Date.now();
      list.push({ id, custom: true, title: 'Nueva reserva', icon: 'ticket', date: '', time: '', type: '', price: '', includes: '', status: 'PENDIENTE', place: '', code: '', link: '', notes: '', photos: [] });
      S.saveReservations(list);
      drawReservations();
      openEditor(id);
      return;
    }
    const card = e.target.closest('.res-card'); if (!card) return;
    const id = card.dataset.res;
    if (e.target.closest('[data-edit]')) { openEditor(id); return; }
    const th = e.target.closest('[data-view]');
    if (th) {
      const i = +th.dataset.view;
      const r = S.reservation(id);
      U.viewImage(r.photos[i], () => { updateRes(id, x => x.photos.splice(i, 1)); drawReservations(); U.toast('Imagen eliminada'); });
    }
  }

  function onResFile(e) {
    const input = e.target.closest('input[data-file]'); if (!input || !input.files[0]) return;
    const id = input.closest('.res-card').dataset.res;
    U.toast('Procesando imagen…');
    U.compressImage(input.files[0]).then(dataUrl => {
      const ok = updateRes(id, r => { r.photos = r.photos || []; r.photos.push(dataUrl); });
      if (!ok) { U.toast('No hay espacio suficiente para guardar la imagen'); return; }
      drawReservations();
      U.toast('Imagen guardada');
    }).catch(() => U.toast('No se pudo leer la imagen'));
  }

  function openEditor(id) {
    const r = S.reservation(id);
    const original = T.reservations.find(x => x.id === id);
    const statusOpts = STATUS_OPTIONS.indexOf(r.status) < 0 ? STATUS_OPTIONS.concat([r.status]) : STATUS_OPTIONS;
    const body = U.openSheet(
      '<h2 class="sheet-h">Editar reserva</h2>' +
      '<form class="form" novalidate>' +
        FIELDS.map(([k, label, type]) => '<label class="field"><span>' + label + '</span>' +
          (type === 'textarea'
            ? '<textarea name="' + k + '" rows="3">' + esc(r[k]) + '</textarea>'
            : '<input name="' + k + '" type="' + (type === 'url' ? 'url' : 'text') + '" value="' + esc(r[k]) + '"' + (type === 'url' ? ' inputmode="url" placeholder="https://…"' : '') + '>') +
          '</label>').join('') +
        '<label class="field"><span>Estado</span><select name="status">' +
          statusOpts.map(s => '<option' + (s === r.status ? ' selected' : '') + '>' + esc(s) + '</option>').join('') + '</select></label>' +
        '<button class="btn btn-primary block" type="submit">' + icon('check', 18) + '<span>Guardar</span></button>' +
        (original ? '<button class="btn btn-ghost block" type="button" data-restore>Restaurar datos originales</button>' : '') +
        (r.custom ? '<button class="btn btn-danger block" type="button" data-delete>' + icon('trash', 18) + '<span>Eliminar reserva</span></button>' : '') +
      '</form>');

    const form = body.querySelector('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const ok = updateRes(id, x => { FIELDS.forEach(([k]) => { x[k] = String(fd.get(k) || '').trim(); }); x.status = fd.get('status'); if (!x.title) x.title = 'Reserva'; });
      U.closeSheet();
      drawReservations();
      U.toast(ok ? 'Reserva guardada' : 'No se pudo guardar');
    });
    const rest = form.querySelector('[data-restore]');
    if (rest) rest.addEventListener('click', async () => {
      if (!await U.ask('¿Restaurar los datos originales de esta reserva? Se mantendrán las fotos.', 'Restaurar')) return;
      updateRes(id, x => { const photos = x.photos; Object.assign(x, JSON.parse(JSON.stringify(original))); x.photos = photos; });
      U.closeSheet(); drawReservations(); U.toast('Datos restaurados');
    });
    const del = form.querySelector('[data-delete]');
    if (del) del.addEventListener('click', async () => {
      if (!await U.ask('¿Eliminar esta reserva?', 'Eliminar', true)) return;
      const list = S.reservations().filter(x => x.id !== id);
      S.saveReservations(list);
      U.closeSheet(); drawReservations(); U.toast('Reserva eliminada');
    });
  }

  /* ============================================================ INFORMACIÓN */
  function renderInfo(arg) {
    view.innerHTML =
      '<div class="page page-top">' +
        '<header class="page-head"><p class="eyebrow">Información</p><h1>Útil para el viaje</h1></header>' +
        '<div class="info-grid">' +

        '<section class="card">' +
          '<div class="card-head"><span class="card-ic gold">' + icon('home', 20) + '</span><h2>Alojamiento</h2></div>' +
          '<p class="addr">' + esc(T.address) + '</p>' +
          '<div class="btn-row"><button class="btn btn-ghost" data-copy="' + esc(T.address) + '">' + icon('copy', 18) + '<span>Copiar</span></button>' +
          '<a class="btn btn-primary" href="' + esc(U.gmaps(T.addressMaps)) + '" target="_blank" rel="noopener">' + icon('map', 18) + '<span>Abrir en Google Maps</span></a></div>' +
        '</section>' +

        '<section class="card">' +
          '<div class="card-head"><span class="card-ic">' + icon('bus', 20) + '</span><h2>Transporte</h2></div>' +
          '<ul class="facts">' +
            fact('bus', 'Autobús 100E', 'Aeropuerto – Deák Ferenc tér') +
            fact('ticket', 'Precio orientativo 100E', '2.500 HUF por persona') +
            fact('info', 'No incluido en los bonos normales', 'Hay que comprar billete específico para el 100E', true) +
            fact('calendar', 'Bono de transporte 72 horas', '5.750 HUF por persona') +
          '</ul>' +
        '</section>' +

        '<section class="card">' +
          '<div class="card-head"><span class="card-ic">' + icon('phone', 20) + '</span><h2>Contactos y consejos</h2></div>' +
          '<ul class="facts">' +
            fact('car', 'Bolt', 'Para desplazamientos en taxi') +
            fact('bus', 'BudapestGO', 'Para el transporte público') +
            fact('waves', 'Termas', 'Llevar bañador, chanclas y toalla') +
            fact('umbrella', 'Clima', 'Llevar ropa de abrigo y paraguas') +
          '</ul>' +
        '</section>' +

        '<section class="card" id="equipaje">' +
          '<div class="card-head"><span class="card-ic gold">' + icon('luggage', 20) + '</span><div class="grow"><h2>Equipaje</h2><p class="muted" id="pack-count"></p></div></div>' +
          '<div class="progress"><span id="pack-bar"></span></div>' +
          '<ul class="checklist" id="checklist"></ul>' +
          '<form class="add-item" id="add-item"><input name="item" type="text" placeholder="Añadir otro elemento…" aria-label="Añadir elemento" maxlength="60">' +
          '<button class="btn btn-primary icon-only" aria-label="Añadir">' + icon('plus', 20) + '</button></form>' +
          '<button class="btn btn-ghost block" id="pack-reset">Desmarcar todo</button>' +
        '</section>' +

        '<section class="card">' +
          '<div class="card-head"><span class="card-ic">' + icon('download', 20) + '</span><h2>Tus datos</h2></div>' +
          '<p class="muted small">El progreso, el equipaje y las reservas se guardan solo en este navegador. Exporta una copia para pasarla a otro móvil.</p>' +
          '<div class="btn-row"><button class="btn btn-ghost" id="exp">' + icon('download', 18) + '<span>Exportar</span></button>' +
          '<label class="btn btn-ghost">' + icon('upload', 18) + '<span>Importar</span><input type="file" accept="application/json,.json" id="imp" hidden></label></div>' +
          '<button class="btn btn-danger block" id="wipe">' + icon('trash', 18) + '<span>Borrar todos los datos guardados</span></button>' +
        '</section>' +

        '<section class="card credits">' +
          '<h2>Créditos</h2>' +
          '<p class="muted small">Fotografías de Wikimedia Commons: Parlamento — Andrew Shiva (CC BY-SA 4.0); Puente de las Cadenas — Wilfredor (CC0); Bastión de los Pescadores — Perituss (CC0); Plaza de los Héroes y Termas Széchenyi — Slyronit (CC BY-SA 4.0); Mercado de Vörösmarty — Elekes Andor (CC BY 4.0); Szimpla Kert — Random photos 1989 (CC0). ' +
          'Mapa: Leaflet, con mapas base de Esri y © OpenStreetMap. Tiempo: Open-Meteo.</p>' +
        '</section>' +

        '</div></div>';

    renderChecklist();

    view.querySelector('[data-copy]').addEventListener('click', (e) => U.copyText(e.currentTarget.dataset.copy).then(() => U.toast('Dirección copiada')));

    const cl = document.getElementById('checklist');
    cl.addEventListener('change', (e) => {
      const cb = e.target.closest('input[type=checkbox]'); if (!cb) return;
      S.setPacked(cb.dataset.id, cb.checked);
      updatePackCount();
    });
    cl.addEventListener('click', (e) => {
      const del = e.target.closest('[data-remove]'); if (!del) return;
      const id = del.dataset.remove;
      S.setCustomItems(S.customItems().filter(x => x.id !== id));
      S.setPacked(id, false);
      renderChecklist();
    });
    document.getElementById('add-item').addEventListener('submit', (e) => {
      e.preventDefault();
      const inp = e.target.item; const name = inp.value.trim(); if (!name) return;
      S.setCustomItems(S.customItems().concat([{ id: 'c' + Date.now(), name }]));
      inp.value = '';
      renderChecklist();
    });
    document.getElementById('pack-reset').addEventListener('click', async () => {
      if (!await U.ask('¿Desmarcar todos los elementos del equipaje?', 'Desmarcar')) return;
      [...T.packing, ...S.customItems()].forEach(i => S.setPacked(i.id, false));
      renderChecklist();
    });
    document.getElementById('exp').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(S.exportAll(), null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'budapest-trip-2026-datos.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    document.getElementById('imp').addEventListener('change', (e) => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then(t => { S.importAll(JSON.parse(t)); U.toast('Datos importados'); renderInfo(); })
        .catch(() => U.toast('El archivo no es válido'));
    });
    document.getElementById('wipe').addEventListener('click', async () => {
      if (!await U.ask('Se borrarán actividades completadas, notas, equipaje y cambios en reservas (incluidas fotos). ¿Continuar?', 'Borrar todo', true)) return;
      S.resetAll(); U.toast('Datos borrados'); renderInfo();
    });

    if (arg === 'equipaje') {
      const el = document.getElementById('equipaje');
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  }

  const fact = (ic, title, sub, warn) => '<li class="' + (warn ? 'warn' : '') + '">' + icon(ic, 18) + '<div><strong>' + esc(title) + '</strong><small>' + esc(sub) + '</small></div></li>';

  function renderChecklist() {
    const packed = S.packed();
    const custom = S.customItems();
    const items = T.packing.map(i => ({ ...i, custom: false })).concat(custom.map(i => ({ ...i, custom: true })));
    document.getElementById('checklist').innerHTML = items.map(i =>
      '<li><label class="check-row"><input type="checkbox" data-id="' + esc(i.id) + '"' + (packed[i.id] ? ' checked' : '') + '>' +
      '<span class="box">' + icon('check', 16) + '</span><span class="lbl">' + esc(i.name) + '</span></label>' +
      (i.custom ? '<button class="rm" data-remove="' + esc(i.id) + '" aria-label="Quitar ' + esc(i.name) + '">' + icon('x', 16) + '</button>' : '') +
      '</li>').join('');
    updatePackCount();
  }
  function updatePackCount() {
    const packed = S.packed();
    const all = T.packing.concat(S.customItems());
    const n = all.filter(i => packed[i.id]).length;
    const c = document.getElementById('pack-count'); if (c) c.textContent = n + ' de ' + all.length + ' preparados';
    const b = document.getElementById('pack-bar'); if (b) b.style.width = (all.length ? Math.round(n / all.length * 100) : 0) + '%';
  }

  /* ================================================================== init */
  window.addEventListener('hashchange', navigate);
  if (!location.hash) history.replaceState(null, '', '#/inicio');
  navigate();
  W.load(); // precarga del tiempo

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
