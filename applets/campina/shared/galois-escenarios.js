/* =====================================================================
   GALOIS LEGACY · escenarios pixel art (tiles 16×16 y monumentos)
   ---------------------------------------------------------------------
   Todo se dibuja por código: casas encaladas, olivares, trigales, el
   IES Alarifes Ruiz Florindo, castillos, torres barrocas, la Giralda...
   Son interpretaciones originales y simplificadas, no planos exactos.
   Requiere shared/galois-sprites.js.
   ===================================================================== */
(function (root) {
  'use strict';
  var S = root.GaloisSprites, Buf = S.Buf, dark = S.dark, light = S.light, mix = S.mix, hash = S.hash, OUT = S.OUT;
  var T = 16;

  /* ---------- Tiles ---------- */
  // tipo: {solido, dibujar(b, x, y, frame)}; x, y = posición en el mapa (variación determinista)
  function hierba(b, x, y, flores) {
    b.rect(0, 0, T, T, '#5aa34a');
    for (var i = 0; i < 10; i++) { var px = hash(x, y, i) * 16 | 0, py = hash(y, x, i + 9) * 16 | 0; b.set(px, py, i % 2 ? '#4a8c3e' : '#6cbc58'); b.set(px, py - 1, i % 2 ? '#4a8c3e' : null); }
    if (flores) for (var j = 0; j < 3; j++) { var fx = 2 + hash(x, y, j + 20) * 12 | 0, fy = 2 + hash(x, y, j + 30) * 12 | 0, fc = ['#f4e04a', '#ffffff', '#e86a8a'][j]; b.set(fx, fy, fc); b.set(fx + 1, fy, fc); b.set(fx, fy + 1, fc); b.set(fx + 1, fy + 1, dark(fc, .2)); }
  }
  var TILES = {
    '.': { dibujar: function (b, x, y) { hierba(b, x, y, false); } },
    ',': { dibujar: function (b, x, y) { hierba(b, x, y, true); } },
    ':': { dibujar: function (b, x, y) { b.rect(0, 0, T, T, '#d8b479'); for (var i = 0; i < 9; i++) b.set(hash(x, y, i) * 16, hash(y, x, i) * 16, i % 3 ? '#c39c62' : '#e8cc96'); } },
    '=': { dibujar: function (b, x, y) { b.rect(0, 0, T, T, '#cfc3b0'); for (var j = 0; j < 4; j++) for (var i = 0; i < 4; i++) { var o = j % 2 ? 2 : 0; b.rect(i * 4 + o, j * 4, 3, 3, hash(x * 4 + i, y * 4 + j, 1) > .5 ? '#ddd3c2' : '#c2b5a0'); } } },
    '~': { anim: 2, solido: true, dibujar: function (b, x, y, f) {
      b.rect(0, 0, T, T, '#346eb5');
      for (var i = 0; i < 4; i++) {
        var huella = hash(x, y, i), wx = Math.floor((i * 5 + f * 2 + huella * 5) % T), wy = 2 + i * 4;
        for (var j = 0; j < 8; j++) {
          b.set((wx + j) % T, wy + 1, j < 6 ? '#285a9d' : '#3979be');
          if (j < 6) b.set((wx + j) % T, wy, j < 2 ? '#73b3de' : '#508dcb');
        }
        if (huella > .42) b.set((wx + 1) % T, wy, '#aad6ed');
      }
    } },
    'w': { anim: 2, dibujar: function (b, x, y, f) {
      b.rect(0, 0, T, T, '#ab833d');
      for (var i = 0; i < 6; i++) {
        var tallo = 1 + i * 3, punta = tallo - (f && i % 2 ? 1 : 0);
        var altura = 2 + Math.floor(hash(x * 6 + i, y, 4) * 5);
        b.line(tallo, 15, punta, altura, '#d1aa50');
        b.line(tallo, 11, tallo + 1, 8, '#8f6e38');
        b.rect(punta, altura, 2, 4, '#e5bb5d');
        b.rect(punta, altura + 1, 1, 2, '#f7d687');
        b.set(punta + 1, altura + 3, '#b98a41');
      }
    } },
    'c': { dibujar: function (b, x, y) { b.rect(0, 0, T, T, '#8a5a36'); for (var j = 0; j < 4; j++) b.rect(0, j * 4 + 1, T, 1, '#6e4426'); for (var i = 0; i < 5; i++) b.set(hash(x, y, i) * 16, hash(y, x, i) * 16, '#5aa34a'); } },
    's': { dibujar: function (b, x, y) { b.rect(0, 0, T, T, '#e8d29a'); for (var i = 0; i < 6; i++) b.set(hash(x, y, i) * 16, hash(y, x, i) * 16, '#d4ba7e'); } },
    'x': { dibujar: function (b, x, y) { b.rect(0, 0, T, T, '#e8dcc0'); for (var j = 0; j < 8; j++) for (var i = 0; i < 8; i++) { var k = (i + j + x + y) % 4; b.rect(i * 2, j * 2, 2, 2, ['#c85a3a', '#e8dcc0', '#2a4a7a', '#d9a441'][(i * j + k) % 4 === 0 ? 0 : k]); } } },
    'a': { dibujar: function (b, x, y) { b.rect(0, 0, T, T, '#f4efe0'); b.rect(0, 0, T, 1, '#2a5aa8'); b.rect(0, 0, 1, T, '#2a5aa8'); b.rect(7, 7, 2, 2, '#2a5aa8'); [[3, 3], [12, 3], [3, 12], [12, 12]].forEach(function (q) { b.set(q[0], q[1], '#e0a020'); }); b.line(4, 4, 11, 11, '#4a8ad8'); b.line(11, 4, 4, 11, '#4a8ad8'); } },
    'B': { dibujar: function (b, x, y) { b.rect(0, 0, T, T, '#7a5a3a'); for (var i = 0; i < 4; i++) b.rect(i * 4, 0, 1, T, '#5e4228'); b.rect(0, 0, T, 3, '#3a4a4a'); b.rect(0, 13, T, 3, '#3a4a4a'); for (var k = 0; k < 2; k++) { b.ellipse(4 + k * 8, 1, 2, 1, null); b.set(4 + k * 8, 1, '#7a5a3a'); b.set(4 + k * 8, 14, '#7a5a3a'); } } },
    'o': { solido: true, dibujar: function (b, x, y) { hierba(b, x, y); b.rect(7, 9, 2, 6, '#7a5a3a'); b.set(6, 14, '#7a5a3a'); b.set(9, 14, '#7a5a3a'); b.ellipse(8, 6, 7, 5, '#6f8a52'); b.ellipse(6, 5, 4, 3, '#87a466'); for (var i = 0; i < 5; i++) b.set(3 + hash(x, y, i) * 10, 3 + hash(y, x, i) * 6, '#3a4a2a'); } },
    'T': { solido: true, dibujar: function (b, x, y) { hierba(b, x, y); b.rect(7, 10, 2, 5, '#6a4a2a'); b.ellipse(8, 6, 6, 6, '#2f7a3a'); b.ellipse(7, 5, 4, 4, '#3f9a4a'); for (var i = 0; i < 5; i++) b.rect(3 + hash(x, y, i) * 10, 2 + hash(y, x, i) * 8, 2, 2, '#f09a2a'); } },
    'P': { solido: true, dibujar: function (b, x, y) { hierba(b, x, y); b.rect(7, 4, 2, 11, '#a07a4a'); for (var k = 0; k < 5; k++) b.line(8, 4, 8 + [-7, -5, 0, 5, 7][k], 4 + [3, -2, -4, -2, 3][k], '#3a9a4a', 2); } },
    'M': { solido: true, dibujar: function (b, x, y) { b.rect(0, 0, T, T, '#c8a26a'); for (var j = 0; j < 4; j++) for (var i = 0; i < 2; i++) b.rect(i * 8 + (j % 2) * 4, j * 4, 7, 3, hash(i + x * 2, j + y * 4, 3) > .5 ? '#d8b47c' : '#b88f58'); b.rect(0, 0, T, 2, '#e0c08a'); b.rect(0, 0, 4, 2, null); b.rect(8, 0, 4, 2, null); } },
    'h': { solido: true, dibujar: function (b, x, y) { b.rect(0, 2, T, 13, '#2f7a3a'); for (var i = 0; i < 8; i++) b.set(hash(x, y, i) * 16, 3 + hash(y, x, i) * 11, '#45964e'); b.rect(0, 14, T, 2, '#1f5a2a'); } },
    'f': { solido: true, dibujar: function (b, x, y) { hierba(b, x, y); b.rect(0, 6, T, 2, '#e8e0d0'); b.rect(0, 11, T, 2, '#e8e0d0'); b.rect(2, 4, 2, 11, '#f4efe0'); b.rect(12, 4, 2, 11, '#f4efe0'); } },
    'r': { solido: true, dibujar: function (b, x, y) { hierba(b, x, y); b.ellipse(8, 9, 7, 5, '#8a8a8a'); b.ellipse(7, 8, 5, 3, '#a8a8a8'); b.rect(5, 6, 3, 1, '#c8c8c8'); } },
    'k': { solido: true, dibujar: function (b, x, y) { TILES['='].dibujar(b, x, y); b.rect(5, 1, 6, 14, '#e8e2d4'); b.rect(5, 1, 1, 14, '#c8c0b0'); b.rect(4, 0, 8, 2, '#f4efe4'); b.rect(4, 14, 8, 2, '#c8c0b0'); b.rect(8, 2, 1, 12, '#d8d0c0'); } },
    'F': { solido: true, dibujar: function (b, x, y) { TILES['='].dibujar(b, x, y); b.rect(4, 8, 8, 7, '#c0623a'); b.rect(4, 8, 8, 1, '#e0824a'); b.ellipse(8, 6, 5, 3, '#2f8a3a'); b.set(6, 5, '#e83a4a'); b.set(10, 5, '#e83a4a'); b.set(8, 4, '#f4e04a'); } },
    'm': { solido: true, cortable: true, dibujar: function (b, x, y) { hierba(b, x, y); b.ellipse(8, 9, 7, 6, '#3f7a2a'); b.ellipse(6, 8, 4, 4, '#5a9a3a'); b.ellipse(11, 10, 3, 3, '#4a8a32'); for (var i = 0; i < 6; i++) b.set(3 + hash(x, y, i) * 10, 4 + hash(y, x, i) * 9, '#2a5a1a'); b.set(5, 6, '#e86a8a'); b.set(11, 8, '#f4e04a'); } },
    'L': { solido: true, dibujar: function (b, x, y) { TILES['='].dibujar(b, x, y); b.rect(7, 4, 2, 11, '#2a2a34'); b.rect(5, 14, 6, 2, '#2a2a34'); b.rect(5, 1, 6, 4, '#2a2a34'); b.rect(6, 2, 4, 2, '#ffe28a'); } }
  };
  function solido(ch) { return !!(TILES[ch] && TILES[ch].solido); }
  var BAJOS = 'frF'; // obstáculos bajos que se pueden saltar
  function saltable(ch) { return BAJOS.indexOf(ch) >= 0; }
  var cacheT = {};
  function tile(ch, x, y, f) {
    var def = TILES[ch] || TILES['.'], v = (def.anim ? f % def.anim : 0), key = ch + ':' + (x & 3) + ':' + (y & 3) + ':' + v;
    if (cacheT[key]) return cacheT[key];
    var b = new Buf(T, T); def.dibujar(b, x & 3, y & 3, v);
    var cv = document.createElement('canvas'); cv.width = T; cv.height = T; b.toCanvas(cv, 0, 0);
    return (cacheT[key] = cv);
  }

  /* ---------- Monumentos y edificios ---------- */
  function tejado(b, x, y, w, h, c) { for (var j = 0; j < h; j++) { b.rect(x - (h - j), y + j, w + 2 * (h - j), 1, j % 2 ? c : light(c, .12)); } for (var i = x - h; i < x + w + h; i += 3) b.line(i, y + h - 1, i, y + h - 1, dark(c, .2)); }
  function tejas(b, x, y, w, h, c) {
    var luz = light(c, .23), sombra = dark(c, .26), alero = dark(c, .4);
    b.rect(x, y, w, h, c);
    for (var j = 0; j < h - 1; j++) for (var i = 0; i < w; i++) {
      var modulo = (i + (j % 4 >= 2 ? 2 : 0)) % 4;
      if (j === 0 || modulo === 0) b.set(x + i, y + j, luz);
      else if (modulo === 3 || (j % 2 && modulo === 2)) b.set(x + i, y + j, sombra);
    }
    b.rect(x, y + h - 1, w, 1, alero);
  }
  function ventana(b, x, y, w, h, reja) { b.rect(x, y, w, h, '#2a2a3a'); b.rect(x, y, w, 1, '#4a4a5a'); if (reja) { for (var i = 1; i < w; i += 2) b.rect(x + i, y, 1, h, '#1a1a22'); b.rect(x - 1, y + h, w + 2, 1, '#1a1a22'); } }
  function puertaArco(b, cx, base, w, h, c) { b.rect(cx - w / 2, base - h + w / 2, w, h - w / 2, c); b.ellipse(cx, base - h + w / 2, w / 2, w / 2, c); }
  function almenas(b, x, y, w, c) { for (var i = 0; i < w; i += 4) b.rect(x + i, y - 3, 3, 3, c); }
  function piedra(b, x, y, w, h, c) { b.rect(x, y, w, h, c); for (var j = 0; j < h; j += 3) for (var i = (j % 6 ? 2 : 0); i < w; i += 5) b.set(x + i, y + j, dark(c, .18)); }

  var EDIF = {
    casa: [3, 3, function (b, W, H, o) {
      var cal = o.cal || '#f6f1e6'; b.rect(2, 14, W - 4, H - 14, cal); b.rect(2, H - 3, W - 4, 3, '#e0c070');
      tejas(b, 0, 6, W, 9, o.teja || '#c0583a');
      ventana(b, 8, 22, 6, 8, true); ventana(b, W - 14, 22, 6, 8, true);
      b.rect(W / 2 - 4, H - 15, 8, 12, '#6a3a24'); b.set(W / 2 + 2, H - 9, '#f2c14e');
      b.rect(7, 31, 8, 2, '#c0623a'); b.set(8, 30, '#e83a4a'); b.set(12, 30, '#e83a4a');
    }],
    ies: [7, 4, function (b, W, H) {
      b.rect(2, 16, W - 4, H - 16, '#f6f1e6'); b.rect(2, H - 4, W - 4, 4, '#d9a441'); b.rect(2, 16, W - 4, 3, '#d9a441');
      tejas(b, 0, 8, W, 9, '#b8503a');
      for (var i = 0; i < 6; i++) { ventana(b, 8 + i * 17, 24, 8, 9, false); b.rect(8 + i * 17, 40, 8, 9, '#2a3a5a'); b.rect(8 + i * 17, 40, 8, 1, '#5a7aaa'); }
      b.rect(W / 2 - 18, 2, 36, 10, '#2a5aa8'); b.rect(W / 2 - 17, 3, 34, 8, '#3a6ac8'); S.texto(b, 'IES', W / 2 - 5, 4, '#ffffff');
      b.rect(W / 2 - 6, H - 18, 12, 14, '#5a3a24'); b.rect(W / 2 - 6, H - 18, 12, 2, '#d9a441');
      b.rect(W - 8, 0, 1, 24, '#8a8a8a'); b.rect(W - 7, 0, 8, 5, '#3a9a4a'); b.rect(W - 7, 5, 8, 4, '#f4f4f4');
    }],
    castillo: [6, 5, function (b, W, H) {
      var c = '#c8a26a'; piedra(b, 8, 22, W - 16, H - 22, c); almenas(b, 8, 22, W - 16, c);
      piedra(b, 0, 8, 22, H - 8, light(c, .08)); almenas(b, 0, 8, 22, light(c, .08)); piedra(b, W - 22, 8, 22, H - 8, light(c, .08)); almenas(b, W - 22, 8, 22, light(c, .08));
      ventana(b, 9, 20, 3, 7); ventana(b, W - 12, 20, 3, 7); ventana(b, 9, 40, 3, 7); ventana(b, W - 12, 40, 3, 7);
      puertaArco(b, W / 2, H, 18, 26, '#3a2618'); b.rect(W / 2 - 9, H - 14, 18, 1, '#6a4a2a');
      b.rect(W / 2 - 1, 0, 1, 14, '#6a6a6a'); b.rect(W / 2, 0, 9, 6, '#d83a3a'); b.rect(W / 2, 3, 9, 3, '#f2c14e');
    }],
    torre_homenaje: [3, 5, function (b, W, H) {
      var c = '#d0aa72'; piedra(b, 4, 8, W - 8, H - 8, c); almenas(b, 4, 8, W - 8, c); b.rect(4, 8, 3, H - 8, dark(c, .12));
      ventana(b, W / 2 - 2, 20, 4, 8); ventana(b, W / 2 - 2, 40, 4, 8); puertaArco(b, W / 2, H, 10, 16, '#3a2618');
    }],
    iglesia: [5, 6, function (b, W, H, o) {
      var cal = o.cal || '#f6f1e6', oc = o.ocre || '#d9a441';
      b.rect(6, 34, W - 12, H - 34, cal); tejado(b, 10, 28, W - 20, 6, '#c0583a');
      b.rect(W / 2 - 12, 6, 24, H - 6, cal); b.rect(W / 2 - 12, 6, 24, 3, oc); b.rect(W / 2 - 12, 6, 2, H - 6, oc); b.rect(W / 2 + 10, 6, 2, H - 6, oc);
      // espadaña con campana
      b.rect(W / 2 - 7, 0, 14, 8, cal); b.ellipse(W / 2, 4, 3, 3, '#2a2a3a'); b.rect(W / 2 - 1, 3, 3, 3, '#d9a441');
      b.ellipse(W / 2, 22, 4, 4, '#6a4a8a'); b.ellipse(W / 2, 22, 2, 2, '#e0c060');
      puertaArco(b, W / 2, H, 12, 22, '#5a3018'); b.rect(W / 2 - 8, H - 24, 16, 2, oc);
      ventana(b, 14, 44, 4, 10); ventana(b, W - 18, 44, 4, 10);
    }],
    torre_barroca: [2, 7, function (b, W, H) {
      var c = '#e8b07a'; b.rect(6, 40, W - 12, H - 40, c); b.rect(6, 40, 2, H - 40, dark(c, .15));
      b.rect(4, 26, W - 8, 16, '#f4efe0'); for (var i = 0; i < 3; i++) b.rect(7 + i * 7, 29, 4, 9, '#2a2a3a'); b.rect(11, 33, 2, 3, '#d9a441');
      for (var j = 0; j < 4; j++) for (var k = 0; k < 6; k++) b.set(5 + k * 4 + (j % 2) * 2, 18 + j * 2, '#2a5aa8');
      b.rect(6, 16, W - 12, 10, '#f4efe0'); for (var m = 0; m < 5; m++) b.rect(7 + m * 4, 18 + (m % 2) * 3, 2, 2, m % 2 ? '#2a5aa8' : '#f2c14e');
      b.rect(10, 6, W - 20, 10, '#2a7ab8'); b.rect(11, 7, 2, 8, '#4a9ad8'); b.rect(14, 0, 4, 7, '#d9a441'); b.rect(15, -1, 2, 2, '#f2c14e');
      b.rect(10, 60, W - 20, 12, '#3a2618');
    }],
    palacio: [5, 4, function (b, W, H) {
      b.rect(2, 12, W - 4, H - 12, '#f0e4cc'); tejas(b, 0, 6, W, 7, '#b8503a'); b.rect(2, H - 4, W - 4, 4, '#a85a3a');
      b.rect(W / 2 - 12, 12, 24, H - 12, '#c8783a'); b.rect(W / 2 - 10, 14, 20, 2, '#f2c14e');
      ventana(b, W / 2 - 4, 20, 8, 10, true); b.rect(W / 2 - 8, 30, 16, 2, '#1a1a22');
      puertaArco(b, W / 2, H, 12, 20, '#4a2614'); ventana(b, 8, 22, 6, 10, true); ventana(b, W - 14, 22, 6, 10, true);
      b.rect(W / 2 - 2, 8, 4, 5, '#f2c14e');
    }],
    puerta: [5, 4, function (b, W, H, o) {
      var c = o.piedra || '#c8a26a'; piedra(b, 0, 12, W, H - 12, c); almenas(b, 0, 12, W, c);
      piedra(b, 0, 2, 18, H - 2, light(c, .1)); almenas(b, 0, 2, 18, light(c, .1)); piedra(b, W - 18, 2, 18, H - 2, light(c, .1)); almenas(b, W - 18, 2, 18, light(c, .1));
      puertaArco(b, W / 2, H, 20, 34, '#2a1a10'); b.rect(W / 2 - 11, H - 34, 22, 2, dark(c, .3));
      for (var i = -1; i <= 1; i++) b.rect(W / 2 + i * 6, H - 26, 1, 26, '#4a3424');
    }],
    necropolis: [3, 2, function (b, W, H) {
      for (var i = 0; i < 3; i++) { var x = 3 + i * 15; b.rect(x, 10, 11, 18, '#a8a090'); b.rect(x, 10, 11, 2, '#c8c0b0'); b.rect(x + 3, 14, 5, 8, '#5a5248'); }
      b.rect(0, 28, W, 4, '#8a8272');
    }],
    fuente: [2, 2, function (b, W, H) {
      b.ellipse(W / 2, 22, 14, 7, '#d0c4ac'); b.ellipse(W / 2, 21, 11, 5, '#3a7fd0'); b.ellipse(W / 2 - 3, 20, 4, 1, '#8ac4f4');
      b.rect(W / 2 - 2, 6, 4, 14, '#e0d4bc'); b.ellipse(W / 2, 7, 6, 2, '#d0c4ac'); b.rect(W / 2 - 1, 1, 2, 5, '#8ac4f4'); b.set(W / 2 - 3, 3, '#8ac4f4'); b.set(W / 2 + 3, 3, '#8ac4f4');
    }],
    almazara: [4, 3, function (b, W, H) {
      b.rect(2, 14, W - 4, H - 14, '#f2ead8'); tejas(b, 0, 6, W, 9, '#b8603a');
      b.rect(W / 2 - 5, H - 16, 10, 16, '#5a3a24');
      for (var i = 0; i < 3; i++) { var x = 6 + i * 6; b.ellipse(x + 2, H - 6, 3, 5, '#b8703a'); b.rect(x, H - 12, 4, 2, '#8a4a24'); }
      ventana(b, W - 16, 24, 8, 8, true);
    }],
    universidad: [7, 5, function (b, W, H) {
      var c = '#e8d8b8'; b.rect(14, 20, W - 28, H - 20, c); b.rect(14, 20, W - 28, 3, '#c8a26a');
      [0, W - 22].forEach(function (x) { b.rect(x, 12, 22, H - 12, c); b.ellipse(x + 11, 12, 10, 8, '#2a6ab8'); for (var k = 0; k < 8; k++) b.set(x + 4 + k * 2, 8 + (k % 2) * 2, '#f4efe0'); b.rect(x + 10, 0, 2, 5, '#d9a441'); ventana(b, x + 8, 30, 6, 10, true); });
      for (var i = 0; i < 5; i++) ventana(b, 24 + i * 14, 30, 6, 10, true);
      puertaArco(b, W / 2, H, 14, 24, '#4a2614'); b.rect(W / 2 - 10, H - 28, 20, 3, '#c8a26a');
    }],
    colegiata: [6, 6, function (b, W, H) {
      var c = '#c89a62'; piedra(b, 4, 24, W - 8, H - 24, c); tejado(b, 10, 16, W - 20, 8, '#a8503a');
      piedra(b, W - 26, 2, 20, H - 2, light(c, .1)); b.rect(W - 22, 8, 12, 10, '#2a2a3a'); b.rect(W - 18, 10, 4, 4, '#d9a441'); almenas(b, W - 26, 2, 20, light(c, .1));
      puertaArco(b, W / 2 - 8, H, 16, 28, '#4a2614'); b.ellipse(W / 2 - 8, 32, 5, 5, '#6a4a8a');
    }],
    molino: [4, 3, function (b, W, H, o, f) {
      b.rect(16, 10, W - 18, H - 10, '#e8d8b8'); tejas(b, 14, 4, W - 14, 8, '#b8603a'); ventana(b, 34, 22, 6, 8, true); b.rect(24, H - 14, 8, 14, '#5a3a24');
      var cx = 12, cy = 28, r = 12, a0 = (f || 0) * .4;
      b.ellipse(cx, cy, r, r, '#7a5a3a'); b.ellipse(cx, cy, r - 3, r - 3, null);
      for (var y = -r + 3; y <= r - 3; y++) for (var x = -r + 3; x <= r - 3; x++) if (x * x + y * y < (r - 3) * (r - 3)) b.clear(cx + x, cy + y);
      for (var k = 0; k < 8; k++) { var a = a0 + k / 8 * Math.PI * 2; b.line(cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r, '#5a3a24'); b.rect(cx + Math.cos(a) * r - 1, cy + Math.sin(a) * r - 1, 3, 3, '#8a6a4a'); }
      b.rect(0, H - 6, 24, 6, '#3a7fd0'); b.rect(2 + (f || 0) % 4 * 4, H - 4, 4, 1, '#8ac4f4');
    }],
    anfiteatro: [8, 5, function (b, W, H) {
      b.ellipse(W / 2, H / 2 + 4, W / 2 - 1, H / 2 - 5, '#b8956a');
      for (var k = 0; k < 4; k++) b.ellipse(W / 2, H / 2 + 4, W / 2 - 4 - k * 6, H / 2 - 8 - k * 4, k % 2 ? '#c8a57a' : '#a8855a');
      b.ellipse(W / 2, H / 2 + 4, W / 2 - 30, H / 2 - 24, '#e8d29a');
      for (var a = 0; a < 24; a++) { var t = a / 24 * Math.PI * 2; b.rect(W / 2 + Math.cos(t) * (W / 2 - 3), H / 2 + 4 + Math.sin(t) * (H / 2 - 7), 2, 3, '#7a5a3a'); }
      b.rect(W / 2 - 4, H - 8, 8, 8, '#3a2618');
    }],
    columnas: [3, 3, function (b, W, H) {
      b.rect(0, H - 6, W, 6, '#c8c0b0');
      [4, 18, 32].forEach(function (x, i) { var h = [30, 38, 22][i]; b.rect(x, H - 6 - h, 8, h, '#e8e2d4'); b.rect(x, H - 6 - h, 2, h, '#c8c0b0'); b.rect(x - 1, H - 8 - h, 10, 3, '#f4efe4'); });
      b.rect(2, H - 46, 26, 4, '#e8e2d4');
    }],
    giralda: [3, 9, function (b, W, H) {
      var c = '#d8a070', cs = dark(c, .15);
      b.rect(8, 50, W - 16, H - 50, c); b.rect(8, 50, 3, H - 50, cs);
      for (var j = 0; j < 4; j++) for (var i = 0; i < 4; i++) { var x = 13 + i * 6, y = 60 + j * 18; b.rect(x, y, 4, 8, '#b87a50'); b.ellipse(x + 2, y, 2, 2, '#b87a50'); }
      for (var m = 0; m < 3; m++) ventana(b, W / 2 - 2, 80 + m * 20, 4, 8);
      b.rect(6, 34, W - 12, 18, '#f0e4cc'); for (var k = 0; k < 4; k++) puertaArco(b, 11 + k * 9, 50, 5, 12, '#2a2a3a');
      b.rect(10, 22, W - 20, 13, '#f0e4cc'); b.rect(12, 25, 4, 8, '#2a2a3a'); b.rect(W - 16, 25, 4, 8, '#2a2a3a'); b.rect(10, 22, W - 20, 2, '#d9a441');
      b.rect(14, 12, W - 28, 11, '#f0e4cc'); b.rect(17, 14, 3, 6, '#2a2a3a'); b.rect(W - 20, 14, 3, 6, '#2a2a3a');
      b.ellipse(W / 2, 11, 5, 3, '#d9a441'); b.rect(W / 2 - 1, 2, 2, 8, '#a87a2a');
      b.rect(W / 2 - 3, 0, 6, 4, '#f2c14e'); b.rect(W / 2 + 2, 1, 3, 2, '#e8d48a'); // giraldillo
    }],
    torre_oro: [3, 5, function (b, W, H) {
      var c = '#e0b860'; b.rect(4, 30, W - 8, H - 30, c); b.rect(4, 30, 3, H - 30, dark(c, .15)); almenas(b, 4, 30, W - 8, c);
      b.rect(10, 14, W - 20, 17, light(c, .1)); almenas(b, 10, 14, W - 20, light(c, .1)); b.rect(14, 18, 3, 6, '#2a2a3a'); b.rect(W - 17, 18, 3, 6, '#2a2a3a');
      b.ellipse(W / 2, 10, 6, 4, '#e8c870'); b.rect(W / 2 - 1, 0, 2, 7, '#a87a2a');
      ventana(b, W / 2 - 2, 44, 4, 8); ventana(b, 10, 56, 3, 6); ventana(b, W - 13, 56, 3, 6); puertaArco(b, W / 2, H, 10, 14, '#3a2618');
    }],
    alcazar: [6, 4, function (b, W, H) {
      b.rect(0, 12, W, H - 12, '#f0e4cc'); b.rect(0, 12, W, 4, '#c8783a'); almenas(b, 0, 12, W, '#f0e4cc');
      for (var i = 0; i < 5; i++) { var x = 10 + i * 18; puertaArco(b, x, H, 12, 30, '#3a2a2a'); for (var k = 0; k < 6; k++) b.set(x - 6 + k * 2, H - 30 + (k % 2), '#2a5aa8'); }
      for (var j = 0; j < W; j += 4) b.rect(j, 18, 2, 2, '#2a5aa8');
    }],
    plaza_espana: [9, 5, function (b, W, H) {
      var c = '#c8683a';
      for (var i = 0; i < W - 20; i++) { var t = i / (W - 20), y = 26 - Math.round(Math.sin(t * Math.PI) * 12); b.rect(10 + i, y, 1, H - y, c); b.set(10 + i, y, '#e0884a'); if (i % 8 < 4 && i % 8 > 0) b.rect(10 + i, y + 6, 1, 6, '#2a2a3a'); }
      [0, W - 14].forEach(function (x) { b.rect(x, 4, 14, H - 4, c); b.rect(x + 3, 0, 8, 6, '#e0884a'); b.rect(x + 5, 10, 4, 8, '#2a2a3a'); b.rect(x + 2, 24, 10, 3, '#f4efe0'); });
      for (var k = 0; k < W - 28; k += 6) { b.rect(14 + k, H - 8, 5, 8, '#f4efe0'); b.rect(15 + k, H - 7, 3, 3, '#2a5aa8'); }
      b.rect(0, H - 2, W, 2, '#3a7fd0');
    }],
    alfareria: [3, 3, function (b, W, H) {
      b.rect(2, 14, W - 4, H - 14, '#f6f1e6'); tejas(b, 0, 6, W, 9, '#c0583a');
      for (var i = 0; i < 4; i++) { b.ellipse(8 + i * 10, 22, 4, 4, ['#2a5aa8', '#e0a020', '#3a9a4a', '#2a5aa8'][i]); b.ellipse(8 + i * 10, 22, 2, 2, '#f4efe0'); }
      b.rect(W / 2 - 4, H - 14, 8, 14, '#6a3a24'); b.ellipse(8, H - 5, 3, 4, '#c0623a'); b.ellipse(W - 8, H - 5, 3, 4, '#c0623a');
    }],
    puesto: [2, 2, function (b, W, H, o) {
      var c = o.toldo || '#d83a3a'; b.rect(2, 4, W - 4, 8, c); for (var i = 0; i < W - 4; i += 6) b.rect(2 + i, 4, 3, 8, '#f4efe0');
      b.rect(3, 12, 2, 18, '#6a4a2a'); b.rect(W - 5, 12, 2, 18, '#6a4a2a'); b.rect(2, 20, W - 4, 8, '#8a5a36');
      for (var k = 0; k < 4; k++) b.ellipse(7 + k * 6, 19, 2, 2, o.genero || '#f09a2a');
    }],
    ermita: [3, 3, function (b, W, H) {
      b.rect(6, 16, W - 12, H - 16, '#f6f1e6'); tejado(b, 10, 10, W - 20, 6, '#c0583a'); b.rect(W / 2 - 4, 2, 8, 9, '#f6f1e6'); b.rect(W / 2 - 1, 4, 2, 3, '#d9a441'); puertaArco(b, W / 2, H, 8, 14, '#5a3018');
    }]
  };

  var cacheB = {};
  function edificio(tipo, opt, f) {
    opt = opt || {}; var key = tipo + JSON.stringify(opt) + ':' + (f || 0);
    if (cacheB[key]) return cacheB[key];
    var d = EDIF[tipo] || EDIF.casa, W = d[0] * T, H = d[1] * T, b = new Buf(W, H);
    d[2](b, W, H, opt, f || 0); b.outline();
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H; b.toCanvas(cv, 0, 0);
    return (cacheB[key] = { canvas: cv, w: d[0], h: d[1] });
  }

  /* ---------- Objetos: cofre (4 fotogramas de apertura), objeto brillante, corazón ---------- */
  function cofre(f, rareza) {
    var b = new Buf(T, T), c = rareza === 'legendaria' ? '#f2c14e' : rareza === 'epica' ? '#9a6be0' : '#a8642e', m = '#f2c14e';
    b.rect(2, 8, 12, 7, c); b.rect(2, 13, 12, 2, dark(c, .3)); b.rect(7, 8, 2, 7, m);
    var lift = [0, 2, 4, 5][f || 0];
    b.rect(2, 4 - lift, 12, 4, light(c, .1)); b.rect(2, 4 - lift, 12, 1, light(c, .3)); b.rect(7, 4 - lift, 2, 4, m);
    if (f) { b.rect(3, 8 - lift + 3, 10, 1, '#2a1a10'); if (f >= 2) { b.rect(5, 6, 6, 2, '#ffe28a'); } if (f === 3) { b.set(4, 2, '#ffffff'); b.set(11, 1, '#ffe28a'); b.set(8, 0, '#ffffff'); } }
    b.rect(7, 10, 2, 2, '#3a2a10'); b.outline(); return b;
  }
  function brillo(f, color) { var b = new Buf(T, T), c = color || '#ffe28a', r = [2, 3, 4, 3][f % 4]; b.rect(8 - r, 8, 2 * r + 1, 1, c); b.rect(8, 8 - r, 1, 2 * r + 1, c); b.set(8, 8, '#ffffff'); if (f % 2) { b.set(5, 5, c); b.set(11, 11, c); } return b; }
  function aCanvas(b) { var cv = document.createElement('canvas'); cv.width = b.w; cv.height = b.h; b.toCanvas(cv, 0, 0); return cv; }
  var cacheO = {};
  function objeto(tipo, f, extra) { var k = tipo + f + (extra || ''); if (!cacheO[k]) cacheO[k] = aCanvas(tipo === 'cofre' ? cofre(f, extra) : brillo(f, extra)); return cacheO[k]; }

  /* ---------- Vecinos (NPC): paletas para el mismo motor de personajes ---------- */
  var VECINOS = {
    maestra:   { skin: '#efc19b', hair: '#4a2a1a', pelo: 'melena', coat: '#3a6ab8', shirt: '#f4efe6', vestido: true, shoes: '#2a1d1d', acc: '#f2c14e', gafas: true, magia: '#fff' },
    alarife:   { skin: '#d9a27a', hair: '#3a2a20', pelo: 'corto', hat: 'gorro', hatC: '#8a6a3a', coat: '#8a5a36', shirt: '#e9dcc0', pants: '#4a3a2a', shoes: '#2a1d1d', acc: '#d9a441', barba: '#3a2a20', magia: '#fff' },
    abuela:    { skin: '#f0c6a2', hair: '#e8e4dc', pelo: 'mono', coat: '#2a2a34', shirt: '#f4efe6', vestido: true, shoes: '#1a1a20', acc: '#a8a8b8', magia: '#fff' },
    agricultor:{ skin: '#c8875a', hair: '#2a2020', pelo: 'corto', hat: 'boina', hatC: '#3a3a2a', coat: '#6a8a4a', shirt: '#e9dcc0', pants: '#4a5a7a', shoes: '#3a2418', acc: '#d9a441', magia: '#fff' },
    alumna:    { skin: '#f2c8aa', hair: '#6a3a1a', pelo: 'rizos', coat: '#d84a5a', shirt: '#ffffff', pants: '#2a3a6a', shoes: '#f4f4f4', acc: '#f2c14e', magia: '#fff' },
    alumno:    { skin: '#c48a5f', hair: '#1a1414', pelo: 'rizado', coat: '#3a9a5a', shirt: '#ffffff', pants: '#3a3a4a', shoes: '#f4f4f4', acc: '#f2c14e', magia: '#fff' },
    guardia:   { skin: '#efc19b', hair: '#3a2a20', pelo: 'corto', hat: 'gorro', hatC: '#5a5a6a', coat: '#7a7a8a', shirt: '#c8c8d0', pants: '#4a4a5a', shoes: '#1a1a20', acc: '#d83a3a', magia: '#fff' },
    alfarero:  { skin: '#d9a27a', hair: '#2a1a14', pelo: 'corto', coat: '#e8dcc0', shirt: '#2a5aa8', pants: '#6a4a2a', shoes: '#2a1d1d', acc: '#2a5aa8', barba: '#2a1a14', magia: '#fff' },
    molinera:  { skin: '#f0c4a0', hair: '#8a5a2a', pelo: 'largo', coat: '#e8e0c8', shirt: '#ffffff', vestido: true, shoes: '#5a3a24', acc: '#d83a3a', magia: '#fff' },
    romano:    { skin: '#d9a27a', hair: '#2a2020', pelo: 'corto', coat: '#f4efe6', shirt: '#f4efe6', vestido: true, shoes: '#8a5a32', acc: '#a83a3a', diadema: '#6a9a3a', magia: '#fff' },
    jardinero: { skin: '#c8875a', hair: '#e8e4dc', pelo: 'corto', hat: 'boina', hatC: '#2a5a3a', coat: '#3a7a4a', shirt: '#f4efe6', pants: '#5a4a3a', shoes: '#2a1d1d', acc: '#f09a2a', magia: '#fff' },
    pastelera: { skin: '#efc19b', hair: '#5a3a2a', pelo: 'mono', coat: '#f4efe6', shirt: '#f4efe6', vestido: true, shoes: '#5a3a24', acc: '#e0a020', magia: '#fff' }
  };
  function hojaVecino(id) { return S.hojaHeroe('vecino:' + id, VECINOS[id] || VECINOS.alumno, ['idle']); }

  root.GaloisEscenarios = { T: T, TILES: TILES, solido: solido, saltable: saltable, tile: tile, EDIF: EDIF, edificio: edificio, objeto: objeto, VECINOS: VECINOS, hojaVecino: hojaVecino };
})(window);
