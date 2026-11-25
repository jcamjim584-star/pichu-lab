/* GALOIS LEGACY · Fondo de la portada (pixel art dibujado con código, sin imágenes externas)
   Atardecer en la Campiña: cielo por bandas, sol poniente, estrellas, lomas, un pueblo blanco
   con su campanario, un molino, olivos y un trigal que se mece. El héroe elegido espera en el camino.
   GaloisPortada.dibujar(ctx, ancho, alto, t, heroeId)  — t en segundos (0 si se pide menos movimiento). */
(function () {
  'use strict';
  var S = window.GaloisSprites;

  // número pseudoaleatorio estable (el mismo dibujo en cada fotograma)
  function h(a, b) { var x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); }
  function r(c, x, y, w, hh, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(hh)); }

  var CIELO = ['#16122C', '#211a45', '#2e215c', '#47286e', '#6A4BB8', '#9a4f9a', '#c8607a', '#e8845a', '#f2a94a', '#E8B53A'];

  function cielo(c, W, H, hor) {
    var n = CIELO.length, bh = hor / n;
    for (var i = 0; i < n; i++) r(c, 0, Math.floor(i * bh), W, Math.ceil(bh) + 1, CIELO[i]);
    // líneas de tramado entre bandas (aspecto 16 bits)
    for (i = 1; i < n; i++) { var y = Math.floor(i * bh); c.fillStyle = CIELO[i - 1]; for (var x = (i % 2); x < W; x += 2) c.fillRect(x, y, 1, 1); }
  }
  function estrellas(c, W, hor, t) {
    for (var k = 0; k < 70; k++) {
      var x = Math.floor(h(k, 1) * W), y = Math.floor(h(k, 2) * hor * .45);
      var brillo = .5 + .5 * Math.sin(t * (1 + h(k, 3) * 2) + k);
      if (brillo < .35) continue;
      c.fillStyle = brillo > .85 ? '#ffffff' : '#F3ECD6'; c.fillRect(x, y, 1, 1);
      if (brillo > .95 && k % 4 === 0) { c.fillRect(x - 1, y, 3, 1); c.fillRect(x, y - 1, 1, 3); }
    }
  }
  function sol(c, W, hor) {
    var cx = Math.floor(W * .68), cy = hor - 2, R = Math.max(10, Math.floor(hor * .2));
    for (var y = -R; y <= 0; y++) {
      var w = Math.floor(Math.sqrt(R * R - y * y));
      var col = y < -R * .6 ? '#fff1b0' : y < -R * .3 ? '#ffe28a' : '#f2c14e';
      if (y % 3 === 0 && y > -R * .5) continue;  // franjas del sol poniente
      r(c, cx - w, cy + y, w * 2, 1, col);
    }
  }
  function lomas(c, W, base, alt, col, semilla, t, vel) {
    c.fillStyle = col;
    var off = (t || 0) * (vel || 0);
    for (var x = 0; x < W; x++) {
      var u = (x + off) / W;
      var y = base - alt * (.55 + .25 * Math.sin(u * 6.3 + semilla) + .2 * Math.sin(u * 15 + semilla * 2));
      c.fillRect(x, Math.round(y), 1, base - Math.round(y) + 400);
    }
  }
  function casa(c, x, y, w, hh, tejado) {
    r(c, x, y, w, hh, '#F3ECD6'); r(c, x, y + hh - 1, w, 1, '#c9bfa6');
    r(c, x - 1, y - 2, w + 2, 2, tejado); r(c, x, y - 3, w, 1, tejado);
    if (w > 5) r(c, x + Math.floor(w / 2) - 1, y + hh - 3, 2, 3, '#5a3a2a');
    if (w > 8) { r(c, x + 1, y + 2, 1, 2, '#3a4a6a'); r(c, x + w - 2, y + 2, 1, 2, '#3a4a6a'); }
  }
  function campanario(c, x, base) {
    r(c, x, base - 30, 7, 30, '#F3ECD6'); r(c, x + 6, base - 30, 1, 30, '#d8cdb2');
    r(c, x + 2, base - 26, 3, 4, '#3a2a40');  // hueco de la campana
    r(c, x + 3, base - 24, 1, 2, '#E8B53A');
    r(c, x - 1, base - 31, 9, 2, '#c8902a');
    r(c, x + 1, base - 35, 5, 4, '#F3ECD6'); r(c, x + 2, base - 38, 3, 3, '#c0623a'); r(c, x + 3, base - 41, 1, 3, '#E8B53A');
  }
  function molino(c, x, base, t) {
    r(c, x, base - 18, 8, 18, '#F3ECD6'); r(c, x + 7, base - 18, 1, 18, '#d8cdb2');
    r(c, x - 1, base - 21, 10, 3, '#7a4a2a'); r(c, x + 3, base - 6, 2, 6, '#5a3a2a');
    var cx = x + 4, cy = base - 17, a = t * .8;
    for (var k = 0; k < 4; k++) {
      var ang = a + k * Math.PI / 2, dx = Math.cos(ang), dy = Math.sin(ang);
      for (var s = 2; s < 13; s++) { c.fillStyle = s > 5 ? '#e8dcc0' : '#6b4a2a'; c.fillRect(Math.round(cx + dx * s), Math.round(cy + dy * s), 1, 1); if (s > 5) c.fillRect(Math.round(cx + dx * s - dy * 1.5), Math.round(cy + dy * s + dx * 1.5), 1, 1); }
    }
    r(c, cx - 1, cy - 1, 2, 2, '#3a2a20');
  }
  function olivo(c, x, base, k) {
    r(c, x, base - 4, 2, 4, '#5a3a2a');
    var col = ['#3f6a3a', '#4f7a42', '#36583a'][k % 3];
    c.fillStyle = col;
    c.fillRect(x - 3, base - 8, 8, 4); c.fillRect(x - 2, base - 10, 6, 2); c.fillRect(x - 4, base - 6, 10, 2);
    c.fillStyle = '#6a9a52'; c.fillRect(x - 1, base - 10, 2, 1); c.fillRect(x - 3, base - 7, 2, 1);
  }
  function trigal(c, W, H, top, t) {
    r(c, 0, top, W, H - top, '#b8862a');
    for (var y = top; y < H; y += 2) {
      var prof = (y - top) / Math.max(1, H - top);
      for (var x = 0; x < W; x += 3) {
        var ola = Math.sin(t * 1.6 + x * .06 - y * .15) * (1 + prof * 1.5);
        var xx = Math.round(x + ola + (y % 4 ? 1 : 0));
        c.fillStyle = h(x, y) > .5 ? '#E8B53A' : '#d39a2e'; c.fillRect(xx, y - Math.round(1 + prof * 2), 1, Math.round(2 + prof * 2));
        if (h(y, x) > .93) { c.fillStyle = '#fff1b0'; c.fillRect(xx, y - Math.round(2 + prof * 2), 1, 1); }
      }
    }
  }
  function camino(c, W, H, top) {
    for (var y = top; y < H; y++) {
      var u = (y - top) / Math.max(1, H - top), w = 4 + u * W * .22, cx = W * .5 + Math.sin(u * 2.2) * W * .06;
      r(c, cx - w / 2, y, w, 1, y % 3 ? '#d8b98a' : '#c8a676');
    }
  }

  function dibujar(c, W, H, t, heroeId, op) {
    op = op || {};
    c.imageSmoothingEnabled = false;
    var hor = Math.floor(H * (op.campo ? .5 : H > W ? .64 : .58));   // en vertical, el título va en el cielo
    cielo(c, W, H, hor);
    estrellas(c, W, hor, t);
    sol(c, W, hor);
    // nubes alargadas
    for (var k = 0; k < 4; k++) {
      var nx = ((h(k, 9) * W + t * (2 + k)) % (W + 60)) - 40, ny = hor * (.25 + h(k, 7) * .35);
      r(c, nx, ny, 30 + k * 6, 2, 'rgba(243,236,214,.18)'); r(c, nx + 6, ny - 2, 16, 2, 'rgba(243,236,214,.12)');
    }
    lomas(c, W, hor + 4, hor * .22, '#3a2a5c', 1.3, t, 0);
    lomas(c, W, hor + 10, hor * .14, '#2f4a5c', 4.1, t, 0);
    // pueblo blanco sobre la loma
    var px = Math.floor(W * (H > W ? .06 : .1)), base = hor + 6;
    if (!op.campo) for (k = 0; k < 9; k++) casa(c, px + k * 8 + Math.floor(h(k, 4) * 3), base - 6 - Math.floor(h(k, 5) * 4), 7 + Math.floor(h(k, 6) * 3), 6, k % 3 ? '#c0623a' : '#a8502e');
    if (!op.campo) { campanario(c, px + 30, base - 4); molino(c, Math.floor(W * .82), hor + 9, t); }
    lomas(c, W, hor + 22, 10, '#3E9A5E', 7.7, t, 0);
    lomas(c, W, hor + 26, 6, '#2f7d45', 2.2, t, 0);
    for (k = 0; k < 14; k++) olivo(c, Math.floor(h(k, 11) * W), hor + 20 + Math.floor(h(k, 12) * 6), k);
    var top = hor + 26;
    trigal(c, W, H, top, t);
    camino(c, W, H, top);
    // el héroe elegido espera en el camino
    if (S && heroeId) {
      try {
        var hoja = S.hojaHeroe(heroeId), anim = 'idle';
        var u = .62, y = top + (H - top) * u, cx = W * .5 + Math.sin(u * 2.2) * W * .06;
        c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(Math.round(cx - 7), Math.round(y - 1), 14, 3);
        S.pintar(c, hoja, anim, 'down', S.indice(hoja, anim, t), cx, y + 1, .75);
      } catch (e) { /* si el sprite no existe, la portada sigue sin él */ }
    }
    // viñeta suave
    c.fillStyle = 'rgba(22,18,44,.35)'; c.fillRect(0, 0, W, 2); c.fillRect(0, H - 2, W, 2);
  }

  window.GaloisPortada = { dibujar: dibujar };
})();
