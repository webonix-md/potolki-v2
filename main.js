(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Данные ---------- */
  var D = JSON.parse($('#calc-data').textContent);
  var T = D.i18n;
  var RO = document.documentElement.lang === 'ro';
  var fmt = function (n) { return Math.round(n).toLocaleString(RO ? 'ro-RO' : 'ru-RU').replace(/[\s.]/g, ' '); };
  var tpl = function (s, o) { return s.replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? o[k] : ''; }); };
  var round10 = function (n) { return Math.round(n / 10) * 10; };
  var index = function (arr) { var o = {}; arr.forEach(function (x) { o[x.id] = x; }); return o; };
  var CANVAS = index(D.canvases), PROFILE = index(D.profiles), LIGHT = index(D.lights), RTYPE = index(D.roomTypes);
  var wa = function (text) { return 'https://wa.me/' + D.phone + (text ? '?text=' + encodeURIComponent(text) : ''); };

  // цены из JSON в карточки и прайс
  $$('[data-price]').forEach(function (el) { var c = CANVAS[el.getAttribute('data-price')]; if (c) el.textContent = fmt(c.price); });
  $$('[data-extra]').forEach(function (el) { var k = el.getAttribute('data-extra'); var v = k === 'min' ? D.minOrder : D.extras[k]; if (v != null) el.textContent = fmt(v); });
  $$('[data-profile]').forEach(function (el) { var p = PROFILE[el.getAttribute('data-profile')]; if (p) el.textContent = fmt(p.perM); });
  $$('[data-light]').forEach(function (el) { var l = LIGHT[el.getAttribute('data-light')]; if (l) el.textContent = fmt(l.perM); });
  // ссылки WhatsApp с готовым текстом
  $$('[data-wa]').forEach(function (el) { var t = T.wa[el.getAttribute('data-wa')]; if (t) el.href = wa(t); });
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Общие контролы ---------- */
  function paintRange(r) { r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%'); }
  function stepper(el, min, max, get, set) {
    $$('[data-step]', el).forEach(function (b) {
      b.addEventListener('click', function () { set(Math.min(max, Math.max(min, get() + +b.getAttribute('data-step')))); });
    });
  }
  function chipGroup(box, attr, onPick) {
    $$('[' + attr + ']', box).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[' + attr + ']', box).forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-checked', on ? 'true' : 'false'); });
        onPick(b.getAttribute(attr));
      });
    });
  }

  /* ---------- Мини-расчёт в первом экране ---------- */
  var quick = $('[data-quick]');
  if (quick) {
    var qs = { area: 18, canvas: 'matte', lamps: 4 };
    var qArea = $('[data-quick-area]', quick), qOut = $('[data-quick-area-out]', quick);
    var qLamps = $('[data-quick-lamps]', quick), qTotal = $('[data-quick-total]', quick), qWa = $('[data-quick-wa]', quick);
    var qCalc = function () {
      var sum = Math.max(D.minOrder, qs.area * CANVAS[qs.canvas].price + qs.lamps * D.extras.lamp);
      var total = round10(sum);
      qOut.textContent = qs.area + ' ' + T.m2;
      qLamps.textContent = qs.lamps;
      qTotal.textContent = fmt(total) + ' ' + D.currency;
      qWa.href = wa(tpl(T.quickWa, { area: qs.area, canvas: CANVAS[qs.canvas].name.toLowerCase(), lamps: qs.lamps, total: fmt(total), cur: D.currency }));
      paintRange(qArea);
    };
    qArea.addEventListener('input', function () { qs.area = +qArea.value; qCalc(); });
    chipGroup($('[data-quick-canvas]', quick), 'data-canvas', function (id) { qs.canvas = id; qCalc(); });
    stepper($('[data-stepper]', quick), 0, 30, function () { return qs.lamps; }, function (v) { qs.lamps = v; qCalc(); });
    qCalc();
  }

  /* ---------- День / Вечер ---------- */
  var scene = $('[data-scene]'), dn = $('[data-daynight]');
  if (scene && dn) {
    var setNight = function (on) { scene.classList.toggle('is-night', on); dn.setAttribute('aria-checked', on ? 'true' : 'false'); };
    dn.addEventListener('click', function () { setNight(!scene.classList.contains('is-night')); dn.classList.remove('is-hint'); });
    // подсказка: тумблер «моргает», пока его не нажали
    setTimeout(function () { if (!scene.classList.contains('is-night')) dn.classList.add('is-hint'); }, 1800);
  }

  /* ---------- Калькулятор квартиры ---------- */
  var roomsBox = $('[data-rooms]');
  var rooms = [], uid = 0, openId = null;

  function perimeter(r) { return Math.round(D.perimeterK * Math.sqrt(r.area)); }
  function roomCalc(r) {
    var c = CANVAS[r.canvas], p = perimeter(r);
    var sum = r.area * c.price + r.lamps * D.extras.lamp + r.pipes * D.extras.pipe + (r.chandelier ? D.extras.chandelier : 0);
    sum += p * PROFILE[r.profile].perM;
    if (r.tile) sum += p * D.extras.tile;
    D.lights.forEach(function (l) { sum += (r.lights[l.id] || 0) * l.perM; });
    return sum;
  }
  function makeRoom(typeId) {
    var t = RTYPE[typeId];
    var lights = {}; D.lights.forEach(function (l) { lights[l.id] = (t.lights && t.lights[l.id]) || 0; });
    return { id: ++uid, type: typeId, name: t.name, area: t.area, canvas: t.canvas, lamps: t.lamps, pipes: t.pipes, chandelier: !!t.chandelier, profile: t.profile, tile: !!t.tile, lights: lights };
  }
  function countName(r) {
    var same = rooms.filter(function (x) { return x.type === r.type; });
    return same.length > 1 ? r.name + ' ' + (same.indexOf(r) + 1) : r.name;
  }

  function canvasOptions(sel) {
    return D.canvases.map(function (c) { return '<option value="' + c.id + '"' + (c.id === sel ? ' selected' : '') + '>' + c.name + ' · ' + fmt(c.price) + ' ' + D.currency + '/' + T.m2 + '</option>'; }).join('');
  }
  function stepHTML(key, val, label) {
    return '<div class="stepper" data-key="' + key + '"><button type="button" aria-label="−" data-step="-1"><svg><use href="#i-minus"/></svg></button>' +
      '<input type="number" inputmode="numeric" min="0" max="99" value="' + val + '" aria-label="' + label + '"><button type="button" aria-label="+" data-step="1"><svg><use href="#i-plus"/></svg></button></div>';
  }

  function roomHTML(r) {
    var lightsHTML = D.lights.map(function (l) {
      var v = r.lights[l.id] || 0;
      return '<div class="lightctl' + (v ? ' is-on' : '') + '" data-light-id="' + l.id + '"><span class="lightctl__name">' + l.name + '</span>' + stepHTML('light:' + l.id, v, l.name + ', ' + T.pm) + '</div>';
    }).join('');
    var profHTML = D.profiles.map(function (p) {
      return '<button type="button" class="chip' + (p.id === r.profile ? ' is-on' : '') + '" role="radio" aria-checked="' + (p.id === r.profile) + '" data-prof="' + p.id + '">' + p.name + (p.perM ? ' +' + fmt(p.perM) + '/' + T.pm : '') + '</button>';
    }).join('');
    return '<button class="room__head" type="button" aria-expanded="false"><span class="room__name"></span><span class="room__meta"></span><span class="room__sum"></span><span class="room__chev"><svg><use href="#i-chevron"/></svg></span></button>' +
      '<div class="room__body">' +
        '<div class="room__grid">' +
          '<div class="field"><span class="field__label">' + T.area + '<output data-o="area"></output></span><input class="range" type="range" min="2" max="80" step="1" value="' + r.area + '" data-k="area" aria-label="' + T.area + '"></div>' +
          '<div class="field"><span class="field__label">' + T.canvas + '</span><div class="select"><select data-k="canvas" aria-label="' + T.canvas + '">' + canvasOptions(r.canvas) + '</select><svg><use href="#i-chevron"/></svg></div></div>' +
          '<div class="field field--wide"><span class="field__label">' + T.profile + '<output data-o="perim"></output></span><div class="field__chips" role="radiogroup" aria-label="' + T.profile + '">' + profHTML + '</div></div>' +
        '</div>' +
        '<div class="room__counters">' +
          '<span class="counter">' + T.lamps + stepHTML('lamps', r.lamps, T.lamps) + '</span>' +
          '<span class="counter">' + T.pipes + stepHTML('pipes', r.pipes, T.pipes) + '</span>' +
          '<label class="switch"><input type="checkbox" data-k="chandelier"' + (r.chandelier ? ' checked' : '') + '><span class="switch__track"></span>' + T.chandelier + '</label>' +
          '<label class="switch"><input type="checkbox" data-k="tile"' + (r.tile ? ' checked' : '') + '><span class="switch__track"></span>' + T.tile + '</label>' +
        '</div>' +
        '<div class="field"><span class="field__label">' + T.light + ', ' + T.pm + '</span><div class="lights-row">' + lightsHTML + '</div></div>' +
        '<div class="room__foot"><button type="button" class="room__remove" data-remove><svg><use href="#i-trash"/></svg>' + T.remove + '</button></div>' +
      '</div>';
  }

  function bindRoom(el, r) {
    var head = $('.room__head', el);
    head.addEventListener('click', function () { toggleOpen(r.id); });
    var area = $('[data-k="area"]', el);
    area.addEventListener('input', function () { r.area = +area.value; update(); });
    $('[data-k="canvas"]', el).addEventListener('change', function (e) { r.canvas = e.target.value; update(); });
    $$('[data-prof]', el).forEach(function (b) {
      b.addEventListener('click', function () {
        r.profile = b.getAttribute('data-prof');
        $$('[data-prof]', el).forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-checked', on); });
        update();
      });
    });
    $$('input[type="checkbox"]', el).forEach(function (cb) { cb.addEventListener('change', function () { r[cb.getAttribute('data-k')] = cb.checked; update(); }); });
    $$('.stepper[data-key]', el).forEach(function (st) {
      var key = st.getAttribute('data-key'), inp = $('input', st);
      var get = function () { return key.indexOf('light:') === 0 ? r.lights[key.slice(6)] : r[key]; };
      var set = function (v) {
        v = Math.max(0, Math.min(99, Math.round(+v || 0)));
        if (key.indexOf('light:') === 0) { r.lights[key.slice(6)] = v; st.closest('.lightctl').classList.toggle('is-on', v > 0); } else r[key] = v;
        inp.value = v; update();
      };
      stepper(st, 0, 99, get, set);
      inp.addEventListener('change', function () { set(inp.value); });
    });
    $('[data-remove]', el).addEventListener('click', function () { removeRoom(r.id); });
  }

  function addRoom(typeId, open) {
    var r = makeRoom(typeId);
    rooms.push(r);
    var el = document.createElement('div');
    el.className = 'room'; el.setAttribute('data-room', r.id);
    el.innerHTML = roomHTML(r);
    roomsBox.appendChild(el);
    bindRoom(el, r);
    if (open) toggleOpen(r.id, true);
    update();
    return el;
  }
  function removeRoom(id) {
    rooms = rooms.filter(function (r) { return r.id !== id; });
    var el = $('[data-room="' + id + '"]', roomsBox); if (el) el.remove();
    if (openId === id) openId = null;
    update();
  }
  function toggleOpen(id, force) {
    openId = (openId === id && !force) ? null : id;
    $$('.room', roomsBox).forEach(function (el) {
      var on = +el.getAttribute('data-room') === openId;
      el.classList.toggle('is-open', on);
      $('.room__head', el).setAttribute('aria-expanded', on);
    });
  }

  var sumLines = $('[data-sum-lines]'), sumTotal = $('[data-sum-total]'), sumNote = $('[data-sum-note]'), sumWa = $('[data-sum-wa]');
  var noteDefault = sumNote ? sumNote.textContent : '';
  var lastText = '';

  function extrasText(r) {
    var bits = [];
    if (r.lamps) bits.push(T.lamps.toLowerCase() + ' ' + r.lamps);
    if (r.chandelier) bits.push(T.chandelier.toLowerCase());
    if (r.pipes) bits.push(T.pipes.toLowerCase() + ' ' + r.pipes);
    if (r.tile) bits.push(T.tile.toLowerCase());
    if (r.profile !== 'std') bits.push(T.profile.toLowerCase() + ' ' + PROFILE[r.profile].name.toLowerCase());
    D.lights.forEach(function (l) { if (r.lights[l.id]) bits.push(l.name.toLowerCase() + ' ' + r.lights[l.id] + ' ' + T.pm); });
    return bits.length ? ', ' + bits.join(', ') : '';
  }

  function update() {
    if (!roomsBox) return;
    var total = 0, lines = [];
    rooms.forEach(function (r) {
      var s = round10(roomCalc(r)); total += s;
      var el = $('[data-room="' + r.id + '"]', roomsBox);
      var nm = countName(r);
      $('.room__name', el).textContent = nm;
      $('.room__meta', el).textContent = r.area + ' ' + T.m2 + ' · ' + CANVAS[r.canvas].name;
      $('.room__sum', el).textContent = fmt(s) + ' ' + D.currency;
      $('[data-o="area"]', el).textContent = r.area + ' ' + T.m2;
      $('[data-o="perim"]', el).textContent = '≈ ' + perimeter(r) + ' ' + T.pm;
      paintRange($('[data-k="area"]', el));
      lines.push({ nm: nm, s: s, r: r });
    });
    var short = total > 0 && total < D.minOrder;
    if (short) total = D.minOrder;
    sumLines.innerHTML = lines.length
      ? lines.map(function (l) { return '<li><span>' + l.nm + ', ' + l.r.area + ' ' + T.m2 + '</span><b>' + fmt(l.s) + '</b></li>'; }).join('')
      : '<li class="is-empty">' + T.empty + '</li>';
    sumTotal.textContent = lines.length ? fmt(total) + ' ' + D.currency : '—';
    sumNote.textContent = short ? tpl(T.minNote, { min: fmt(D.minOrder), cur: D.currency }) : noteDefault;
    lastText = [T.waHead].concat(lines.map(function (l) {
      return tpl(T.waLine, { name: l.nm, area: l.r.area, canvas: CANVAS[l.r.canvas].name.toLowerCase(), extra: extrasText(l.r), sum: fmt(l.s), cur: D.currency });
    })).concat([tpl(T.waTail, { total: fmt(total), cur: D.currency })]).join('\n');
    sumWa.href = lines.length ? wa(lastText) : wa(T.wa.measure);
  }

  if (roomsBox) {
    var addBox = $('[data-add-room]');
    D.roomTypes.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.textContent = t.name;
      b.addEventListener('click', function () { var el = addRoom(t.id, true); el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
      addBox.appendChild(b);
    });
    D.start.forEach(function (id) { addRoom(id, false); });
    toggleOpen(rooms[0].id, true);

    var toast = $('[data-toast]'), tt;
    var say = function (m) { toast.textContent = m; clearTimeout(tt); tt = setTimeout(function () { toast.textContent = ''; }, 3500); };
    $('[data-sum-copy]').addEventListener('click', function () {
      var ok = function () { say(T.copied); }, fail = function () { say(T.copyFail); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(lastText).then(ok, fail);
      else {
        var ta = document.createElement('textarea'); ta.value = lastText; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy') ? ok() : fail(); } catch (e) { fail(); }
        ta.remove();
      }
    });
  }

  /* ---------- Комнаты: вкладки + «добавить в расчёт» ---------- */
  var tabs = $$('[data-room-tab]');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var id = t.getAttribute('data-room-tab');
      tabs.forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
      $$('[data-room-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-room-panel') !== id; });
    });
  });
  $$('[data-room-add]').forEach(function (b) {
    b.addEventListener('click', function () {
      var el = addRoom(b.getAttribute('data-room-add'), true);
      $('#calc').scrollIntoView({ behavior: 'smooth' });
      el.classList.add('is-new'); setTimeout(function () { el.classList.remove('is-new'); }, 1600);
    });
  });

  /* ---------- Галерея: фильтр ---------- */
  var filters = $('[data-filters]');
  if (filters) chipGroup(filters, 'data-filter', function (f) {
    $$('[data-gallery] .tile').forEach(function (t) { t.classList.toggle('is-hidden', f !== 'all' && (' ' + t.getAttribute('data-tags') + ' ').indexOf(' ' + f + ' ') < 0); });
  });

  /* ---------- Шапка, меню, активный пункт ---------- */
  var hdr = $('[data-hdr]'), nav = $('[data-nav]'), burger = $('[data-burger]');
  var onScroll = function () { hdr.classList.toggle('is-scrolled', window.scrollY > 10); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var closeNav = function () { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', function () { var o = nav.classList.toggle('is-open'); burger.setAttribute('aria-expanded', o); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', closeNav); });
  document.addEventListener('click', function (e) { if (!hdr.contains(e.target)) closeNav(); });

  if ('IntersectionObserver' in window) {
    var links = {}; $$('a[href^="#"]', nav).forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && links[e.target.id]) { $$('a', nav).forEach(function (a) { a.classList.remove('is-active'); }); links[e.target.id].classList.add('is-active'); } });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });

    // свет в тёмном разделе «включается» при прокрутке
    var lo = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('is-lit', e.isIntersecting); }); }, { rootMargin: '-35% 0px -35% 0px' });
    $$('.light').forEach(function (l) { lo.observe(l); });

    // мягкое появление блоков
    var targets = $$('.sec__head, .canvas, .extras__col, .estimate, .step, .why__card, .review, .light, .room-panel, .compare__table, .compare__photo, .faq__item, .stat');
    targets.forEach(function (el) { el.classList.add('reveal'); });
    var ro = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); ro.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { ro.observe(el); });
  }
})();
