/* =====================================================================
   GALOIS LEGACY · ilustraciones pixel art de las 60 cartas
   ---------------------------------------------------------------------
   Anverso (128×176 px) y reverso, dibujados por código. Sin fotografías,
   escudos, logotipos ni retratos: los futbolistas aparecen de espaldas y
   sin dorsal; las advocaciones, como paso de palio con candelería y manto,
   sin rostro, como patrimonio artístico.
   Requiere shared/galois-sprites.js y shared/galois-escenarios.js.
   GaloisArte.carta(carta) -> dataURL PNG · GaloisArte.reverso(mundo)
   ===================================================================== */
(function (root) {
  'use strict';
  var S = root.GaloisSprites, E = root.GaloisEscenarios;
  if (!S || !E) return;
  var Buf = S.Buf, dark = S.dark, light = S.light, mix = S.mix, hash = S.hash;
  var CW = 128, CH = 176, AX = 8, AY = 8, AW = 112, AH = 124;

  var MARCO = { comun: ['#b8bccb', '#6a6e80'], rara: ['#6ab4f0', '#2a5aa8'], epica: ['#c49af0', '#5a2a9a'], legendaria: ['#ffe28a', '#b07a1c'] };
  var CIELO = { dia: ['#7ab8f0', '#cfe8ff'], tarde: ['#f0a060', '#ffe0a0'], noche: ['#1a1838', '#4a3a78'], oro: ['#f2a03a', '#fff0b0'] };

  /* Motivo de cada carta: [tipo, opciones] */
  var M = {
    'campina-1-1': ['edif', { t: 'castillo', cielo: 'tarde' }], 'campina-1-2': ['devocion', { manto: '#f4f4ff', palio: '#7aa0d8', nieve: true }],
    'campina-1-3': ['alarifes', {}], 'campina-1-4': ['trigo', {}], 'campina-1-5': ['edif', { t: 'iglesia' }], 'campina-1-6': ['edif', { t: 'palacio', cielo: 'oro' }],
    'campina-2-1': ['edif', { t: 'puerta' }], 'campina-2-2': ['muralla', {}], 'campina-2-3': ['edif', { t: 'puerta', cielo: 'noche', o: { piedra: '#b8946a' } }],
    'campina-2-4': ['edif', { t: 'necropolis', cielo: 'tarde', esc: 2 }], 'campina-2-5': ['futbol', { kit: 'blanco' }], 'campina-2-6': ['edif', { t: 'castillo', cielo: 'oro' }],
    'campina-3-1': ['edif', { t: 'torre_barroca', esc: .85 }], 'campina-3-2': ['edif', { t: 'torre_barroca', cielo: 'tarde', esc: .85 }], 'campina-3-3': ['plaza', {}],
    'campina-3-4': ['mosaico', { c: ['#c85a3a', '#2a4a7a', '#d9a441', '#e8dcc0'] }], 'campina-3-5': ['futbol', { kit: 'blanco' }], 'campina-3-6': ['torres', {}],
    'campina-4-1': ['edif', { t: 'puerta', cielo: 'tarde' }], 'campina-4-2': ['muralla', { cielo: 'tarde' }], 'campina-4-3': ['olivar', {}],
    'campina-4-4': ['edif', { t: 'almazara' }], 'campina-4-5': ['azulejo', {}], 'campina-4-6': ['trigo', { cielo: 'oro', gente: true }],
    'campina-5-1': ['edif', { t: 'torre_homenaje' }], 'campina-5-2': ['cerro', {}], 'campina-5-3': ['dulces', { c: '#e8c890' }],
    'campina-5-4': ['dulces', { c: '#f4ece0', polvo: true }], 'campina-5-5': ['olivar', { cielo: 'tarde', colinas: true }], 'campina-5-6': ['plano', {}],
    'campina-6-1': ['edif', { t: 'universidad', esc: .9 }], 'campina-6-2': ['edif', { t: 'colegiata', cielo: 'tarde', esc: .9 }], 'campina-6-3': ['calle', {}],
    'campina-6-4': ['cantera', {}], 'campina-6-5': ['edif', { t: 'palacio', cielo: 'tarde' }], 'campina-6-6': ['pergamino', {}],
    'campina-7-1': ['puente', {}], 'campina-7-2': ['devocion', { manto: '#2f8a4a', palio: '#2a5a3a' }], 'campina-7-3': ['devocion', { manto: '#2a4aa8', palio: '#1a2a6a', estrella: true }],
    'campina-7-4': ['ceramica', {}], 'campina-7-5': ['futbol', { kit: 'verde' }], 'campina-7-6': ['futbol', { kit: 'verde', cielo: 'oro' }],
    'campina-8-1': ['edif', { t: 'castillo' }], 'campina-8-2': ['edif', { t: 'molino' }], 'campina-8-3': ['rio', {}],
    'campina-8-4': ['dragon', {}], 'campina-8-5': ['pan', {}], 'campina-8-6': ['rueda', {}],
    'campina-9-1': ['edif', { t: 'anfiteatro', esc: .8 }], 'campina-9-2': ['mosaico', { c: ['#2a2a34', '#e8dcc0', '#a8503a', '#d9a441'] }], 'campina-9-3': ['teatro', {}],
    'campina-9-4': ['busto', {}], 'campina-9-5': ['busto', { barba: true }], 'campina-9-6': ['edif', { t: 'columnas', cielo: 'oro', esc: 2 }],
    'campina-10-1': ['devocion', { manto: '#2f9a5a', palio: '#3a7a4a' }], 'campina-10-2': ['devocion', { manto: '#3a5ac8', palio: '#f2c14e', rayos: true }],
    'campina-10-3': ['edif', { t: 'giralda', esc: .75 }], 'campina-10-4': ['edif', { t: 'alcazar', jardin: true }], 'campina-10-5': ['futbol', { kit: 'blanco' }],
    'campina-10-6': ['edif', { t: 'plaza_espana', cielo: 'oro', esc: .75 }]
  };

  function cieloDe(b, tipo, seed) {
    var c = CIELO[tipo] || CIELO.dia;
    for (var y = 0; y < AH; y++) { var t = y / AH, col = mix(c[0], c[1], Math.min(1, t * 1.3)); var band = Math.floor(t * 8) / 8; b.rect(0, y, AW, 1, mix(c[0], c[1], Math.min(1, band * 1.3))); }
    if (tipo === 'noche') for (var i = 0; i < 26; i++) b.set(hash(i, seed, 1) * AW, hash(seed, i, 2) * 70, i % 4 ? '#c8c0ff' : '#ffffff');
    if (tipo === 'dia') { b.ellipse(92, 18, 9, 9, '#fff4c0'); [[14, 22], [60, 12]].forEach(function (n) { b.ellipse(n[0], n[1], 10, 3, '#ffffff'); b.ellipse(n[0] + 6, n[1] - 2, 6, 3, '#ffffff'); }); }
    if (tipo === 'tarde' || tipo === 'oro') { b.ellipse(86, 60, 14, 14, '#fff0b0'); b.ellipse(86, 60, 10, 10, '#ffffff'); }
  }
  function suelo(b, y, c) { b.rect(0, y, AW, AH - y, c || '#6aa84a'); for (var i = 0; i < 40; i++) b.set(hash(i, y, 5) * AW, y + hash(y, i, 6) * (AH - y), dark(c || '#6aa84a', .15)); }
  function pegarCanvas(ctx, cv, x, y, k) { ctx.imageSmoothingEnabled = false; ctx.drawImage(cv, Math.round(x), Math.round(y), Math.round(cv.width * k), Math.round(cv.height * k)); }

  /* ---------- Motivos dibujados píxel a píxel ---------- */
  var DIB = {
    devocion: function (b, o) {
      cieloDe(b, 'noche', 3); b.rect(0, 100, AW, 24, '#3a2a3a'); for (var i = 0; i < AW; i += 8) b.rect(i, 100, 7, 3, '#5a4050');
      var cx = 56;
      // palio (techo) y bambalinas
      b.rect(18, 22, 76, 8, o.palio); for (var k = 0; k < 76; k += 4) b.rect(18 + k, 30, 2, 4 + (k % 8 ? 0 : 2), light(o.palio, .2)); b.rect(18, 22, 76, 1, '#f2c14e'); b.rect(18, 29, 76, 1, '#f2c14e');
      // varales
      [20, 38, 74, 92].forEach(function (x) { b.rect(x, 30, 2, 64, '#d8d8e0'); b.set(x, 30 + (x % 3) * 9, '#ffffff'); });
      // manto (sin rostro): silueta triangular con bordado
      for (var y = 0; y < 52; y++) { var w = 6 + y * .9; b.rect(cx - w / 2, 42 + y, w, 1, o.manto); }
      for (var y2 = 4; y2 < 52; y2 += 6) for (var x2 = -y2 * .4; x2 < y2 * .4; x2 += 5) b.set(cx + x2, 42 + y2, '#f2c14e');
      b.rect(cx - 25, 92, 50, 2, '#f2c14e');
      // corona y aureola (ráfaga) — símbolo, sin rasgos faciales
      if (o.rayos) for (var a = 0; a < 16; a++) { var t = a / 16 * Math.PI * 2; b.line(cx + Math.cos(t) * 8, 40 + Math.sin(t) * 8, cx + Math.cos(t) * 15, 40 + Math.sin(t) * 15, '#ffe28a'); }
      b.ellipse(cx, 40, 9, 9, '#ffe28a'); b.ellipse(cx, 40, 7, 7, null); for (var yy = -7; yy <= 7; yy++) for (var xx = -7; xx <= 7; xx++) if (xx * xx + yy * yy < 49) b.clear(cx + xx, 40 + yy);
      b.ellipse(cx, 41, 5, 6, mix(o.manto, '#fff8e6', .5)); b.rect(cx - 5, 32, 11, 4, '#f2c14e'); [-5, -2, 1, 4].forEach(function (d, i) { b.rect(cx + d, 29 - (i % 2), 2, 3, '#f2c14e'); });
      if (o.estrella) { b.line(cx - 6, 58, cx + 6, 58, '#ffe28a'); b.line(cx, 52, cx, 64, '#ffe28a'); b.line(cx - 4, 54, cx + 4, 62, '#ffe28a'); b.line(cx + 4, 54, cx - 4, 62, '#ffe28a'); }
      // candelería
      for (var r = 0; r < 3; r++) for (var c = 0; c < 9 - r * 2; c++) { var x = cx - (8 - r * 2) * 3 + c * 6, y3 = 92 - r * 7; b.rect(x, y3, 2, 6, '#f4efe0'); b.set(x, y3 - 1, '#ffd84a'); b.set(x + 1, y3 - 2, '#ff9a3a'); }
      if (o.nieve) for (var n = 0; n < 18; n++) b.set(hash(n, 4, 1) * AW, hash(4, n, 2) * 100, '#ffffff');
      b.rect(10, 94, 92, 8, '#c8a24a'); b.rect(10, 94, 92, 1, '#ffe28a'); for (var m = 14; m < 100; m += 10) b.rect(m, 96, 4, 4, '#8a6a2a');
      // Vecinos a ambos lados de la calle, de espaldas al lector.
      b.paste(S.dibujarHeroe(E.VECINOS.abuela, 'idle', 0, 'up'), -10, 81);
      b.paste(S.dibujarHeroe(E.VECINOS.alfarero, 'idle', 0, 'up'), 89, 81);
    },
    futbol: function (b, o) {
      cieloDe(b, o.cielo || 'noche', 7);
      // grada con público
      for (var y = 30; y < 70; y++) b.rect(0, y, AW, 1, y % 6 < 3 ? '#3a3a4a' : '#2a2a38');
      for (var i = 0; i < 160; i++) b.set(hash(i, 1, 3) * AW, 30 + hash(1, i, 4) * 38, ['#f4f4f4', '#d83a3a', '#3aa05a', '#f2c14e', '#e8b090'][i % 5]);
      // focos
      [10, 100].forEach(function (x) { b.rect(x, 4, 3, 26, '#8a8a9a'); b.rect(x - 4, 2, 11, 5, '#e8e8f0'); b.rect(x - 3, 3, 9, 3, '#ffffc0'); });
      suelo(b, 70, '#3a9a4a'); for (var s = 0; s < AW; s += 16) b.rect(s, 70, 8, AH - 70, '#45a858'); b.rect(0, 92, AW, 1, '#e8f4e8');
      // jugador de espaldas, sin dorsal ni escudo
      var cx = 56, kit = o.kit === 'verde' ? ['#ffffff', '#2a9a5a'] : ['#ffffff', '#ffffff'];
      b.rect(cx - 4, 103, 4, 10, '#e0a878'); b.rect(cx + 2, 103, 4, 10, '#e0a878'); b.rect(cx - 5, 107, 5, 5, o.kit === 'verde' ? '#2a9a5a' : '#ffffff'); b.rect(cx + 1, 107, 5, 5, o.kit === 'verde' ? '#2a9a5a' : '#ffffff');
      b.rect(cx - 5, 113, 5, 3, '#1a1a1a'); b.rect(cx + 1, 113, 5, 3, '#1a1a1a');
      b.rect(cx - 6, 95, 13, 9, o.kit === 'verde' ? '#ffffff' : '#1a1a2a');
      b.rect(cx - 8, 76, 17, 20, kit[0]); if (o.kit === 'verde') for (var k = 0; k < 17; k += 4) b.rect(cx - 8 + k, 76, 2, 20, '#2a9a5a'); else { b.rect(cx - 8, 76, 17, 2, '#d83a3a'); b.rect(cx - 8, 94, 17, 2, '#d83a3a'); }
      b.rect(cx - 12, 77, 4, 10, kit[0]); b.rect(cx + 9, 77, 4, 10, kit[0]); b.rect(cx - 12, 87, 4, 4, '#e0a878'); b.rect(cx + 9, 87, 4, 4, '#e0a878');
      b.ellipse(cx, 70, 6, 6, '#3a2a20'); b.rect(cx - 4, 74, 9, 3, '#e0a878');
      // balón
      b.ellipse(cx + 22, 112, 5, 5, '#ffffff'); b.rect(cx + 21, 110, 3, 3, '#1a1a1a');
    },
    trigo: function (b, o) {
      cieloDe(b, o.cielo || 'dia', 1); suelo(b, 58, '#c9a446');
      for (var r = 0; r < 6; r++) for (var i = 0; i < 28; i++) { var x = i * 4 + (r % 2) * 2, y = 58 + r * 11; b.rect(x, y, 1, 9, '#b08a32'); b.rect(x - 1, y - 2, 3, 4, '#f0cc5a'); b.set(x, y - 2, '#fff09a'); }
      b.rect(0, 52, AW, 7, '#8aa45a'); for (var k = 0; k < 6; k++) b.ellipse(10 + k * 20, 52, 5, 3, '#6f8a52');
      if (o.gente) { [30, 70].forEach(function (x, i) { var P = i ? E.VECINOS.agricultor : E.VECINOS.molinera; var h = S.dibujarHeroe(P, 'idle', 0, 'down'); b.paste(h, x - 16, 60); }); }
    },
    olivar: function (b, o) {
      cieloDe(b, o.cielo || 'dia', 2);
      if (o.colinas) { b.ellipse(30, 70, 50, 20, '#8aa45a'); b.ellipse(90, 74, 50, 20, '#7a9a4a'); }
      suelo(b, 66, '#c8a876');
      for (var r = 0; r < 4; r++) for (var i = 0; i < 4; i++) { var x = 14 + i * 28 + (r % 2) * 14, y = 64 + r * 15, s = 1 + r * .25; b.rect(x - 1, y, 3, 6 * s, '#7a5a3a'); b.ellipse(x, y - 3, 9 * s, 6 * s, '#6f8a52'); b.ellipse(x - 2, y - 5, 6 * s, 3 * s, '#87a466'); for (var k = 0; k < 4; k++) b.set(x - 6 + hash(i, r, k) * 12, y - 6 + hash(r, i, k) * 6, '#2a3a1a'); }
    },
    muralla: function (b, o) {
      cieloDe(b, o.cielo || 'dia', 5); suelo(b, 96, '#c8a876');
      var c = '#c8a26a';
      for (var x = 0; x < AW; x++) { var top = 50 + Math.round(Math.sin(x / 18) * 3); b.rect(x, top, 1, 96 - top, c); if (x % 6 < 3) b.rect(x, top - 4, 1, 4, c); }
      [8, 52, 96].forEach(function (x) { b.rect(x, 36, 16, 60, light(c, .1)); for (var k = 0; k < 16; k += 5) b.rect(x + k, 32, 3, 4, light(c, .1)); b.rect(x + 6, 50, 3, 8, '#2a2a3a'); });
      for (var j = 56; j < 96; j += 5) for (var i = (j % 10 ? 3 : 0); i < AW; i += 8) b.rect(i, j, 6, 1, dark(c, .2));
    },
    alarifes: function (b) {
      b.rect(0, 0, AW, AH, '#5a3a24'); for (var y = 0; y < AH; y += 6) b.rect(0, y, AW, 1, '#4a2e1c');
      b.rect(10, 12, 92, 80, '#f0dcae'); b.rect(10, 12, 92, 2, '#d8bc86');
      // plano del edificio (cuadrícula y arco)
      for (var x = 14; x < 100; x += 8) b.rect(x, 16, 1, 72, '#c8b088'); for (var y2 = 16; y2 < 88; y2 += 8) b.rect(14, y2, 86, 1, '#c8b088');
      b.rect(30, 40, 52, 40, null); b.line(30, 80, 30, 44, '#2a4a8a'); b.line(82, 80, 82, 44, '#2a4a8a'); b.line(30, 44, 82, 44, '#2a4a8a');
      for (var a = 0; a <= 20; a++) { var t = Math.PI * a / 20; b.set(56 - Math.cos(t) * 14, 66 - Math.sin(t) * 14, '#2a4a8a'); } b.line(42, 80, 42, 66, '#2a4a8a'); b.line(70, 80, 70, 66, '#2a4a8a');
      b.line(30, 44, 56, 26, '#2a4a8a'); b.line(82, 44, 56, 26, '#2a4a8a');
      // compás, escuadra y paleta de albañil
      b.line(84, 96, 100, 70, '#f2c14e', 2); b.line(84, 96, 76, 70, '#b07a1c', 2); b.ellipse(84, 96, 2, 2, '#f2c14e');
      b.rect(14, 98, 34, 4, '#c8c8d0'); b.rect(14, 82, 4, 20, '#c8c8d0');
      b.rect(56, 104, 18, 8, '#a8a8b8'); b.rect(72, 106, 14, 3, '#7a5a3a');
    },
    plaza: function (b) {
      cieloDe(b, 'dia', 6); b.paste(edBuf('casa'), 2, 30); b.paste(edBuf('palacio'), 40, 34); suelo(b, 96, '#cfc3b0');
      for (var j = 96; j < AH; j += 4) for (var i = (j % 8 ? 2 : 0); i < AW; i += 6) b.rect(i, j, 4, 3, '#ddd3c2');
      b.paste(edBuf('fuente'), 40, 88); b.paste(edBuf('fuente'), 76, 92);
    },
    torres: function (b) {
      cieloDe(b, 'oro', 9); suelo(b, 104, '#e8d29a');
      var t = edBuf('torre_barroca');
      [[2, 40, .55], [24, 30, .7], [46, 16, .9], [72, 34, .6], [90, 44, .5]].forEach(function (q) { b.paste(escalar(t, q[2]), q[0], q[1]); });
    },
    mosaico: function (b, o) {
      var c = o.c; b.rect(0, 0, AW, AH, c[3]);
      for (var y = 0; y < AH; y += 4) for (var x = 0; x < AW; x += 4) { var dx = x - 56, dy = y - 62, d = Math.sqrt(dx * dx + dy * dy), k = Math.floor(d / 8) % 4; var ang = Math.atan2(dy, dx); if (d < 48) b.rect(x, y, 3, 3, c[(k + (Math.floor(ang * 4 / Math.PI) & 1)) % 3]); else b.rect(x, y, 3, 3, (x / 4 + y / 4) % 2 ? c[0] : c[3]); }
      b.rect(0, 0, AW, 4, c[1]); b.rect(0, AH - 4, AW, 4, c[1]);
    },
    azulejo: function (b) {
      b.rect(0, 0, AW, AH, '#f4efe0');
      for (var j = 0; j < 4; j++) for (var i = 0; i < 4; i++) { var x = i * 28, y = j * 31; b.rect(x, y, 28, 1, '#2a5aa8'); b.rect(x, y, 1, 31, '#2a5aa8'); b.ellipse(x + 14, y + 15, 6, 6, '#e0a020'); b.ellipse(x + 14, y + 15, 3, 3, '#2a5aa8'); for (var k = 0; k < 4; k++) { var t = k * Math.PI / 2 + Math.PI / 4; b.ellipse(x + 14 + Math.cos(t) * 10, y + 15 + Math.sin(t) * 10, 2, 2, '#3a9a4a'); } }
      b.rect(30, 46, 52, 30, '#f4efe0'); b.rect(30, 46, 52, 2, '#2a5aa8'); b.rect(30, 74, 52, 2, '#2a5aa8');
      for (var w = 0; w < 6; w++) { b.rect(36 + w * 7, 52, 1, 20, '#b08a32'); b.rect(35 + w * 7, 50, 3, 5, '#e0a020'); }
    },
    ceramica: function (b) {
      b.rect(0, 0, AW, AH, '#f6f1e6'); for (var x = 0; x < AW; x += 14) for (var y = 0; y < 50; y += 14) { b.rect(x, y, 13, 13, (x + y) % 28 ? '#e8f0fa' : '#f4efe0'); b.ellipse(x + 6, y + 6, 3, 3, (x / 14 + y / 14) % 2 ? '#2a5aa8' : '#e0a020'); }
      b.rect(0, 96, AW, 28, '#8a5a36'); b.rect(0, 96, AW, 2, '#a87a4a');
      [[20, 80, 12, 16, '#2a5aa8'], [52, 74, 16, 22, '#e0a020'], [88, 82, 11, 14, '#3a9a4a']].forEach(function (v) { b.ellipse(v[0], v[1], v[2], v[3], v[4]); b.ellipse(v[0], v[1], v[2] - 3, v[3] - 4, '#f4efe0'); b.ellipse(v[0], v[1], v[2] - 6, v[3] - 8, v[4]); b.rect(v[0] - 4, v[1] - v[3] - 2, 8, 4, v[4]); });
    },
    dulces: function (b, o) {
      b.rect(0, 0, AW, AH, '#7a3a2a'); for (var y = 0; y < AH; y += 8) for (var x = (y % 16 ? 4 : 0); x < AW; x += 8) b.rect(x, y, 4, 4, '#8a4a3a');
      b.ellipse(56, 76, 50, 30, '#f4f4f8'); b.ellipse(56, 74, 44, 25, '#e0e0ea'); b.ellipse(56, 72, 40, 22, '#f4f4f8');
      [[34, 64], [56, 60], [78, 64], [44, 80], [68, 80]].forEach(function (p, i) { b.ellipse(p[0], p[1], 10, 7, o.c); b.ellipse(p[0], p[1] - 1, 8, 5, light(o.c, .2)); if (o.polvo) for (var k = 0; k < 6; k++) b.set(p[0] - 6 + hash(i, k, 1) * 12, p[1] - 4 + hash(k, i, 2) * 6, '#ffffff'); else { b.rect(p[0] - 5, p[1] + 3, 10, 2, dark(o.c, .2)); } });
      b.rect(16, 18, 80, 14, '#f4efe0'); b.rect(16, 18, 80, 2, '#d83a3a'); b.rect(16, 30, 80, 2, '#d83a3a'); for (var w = 0; w < 6; w++) b.rect(24 + w * 12, 23, 6, 4, '#b08a32');
    },
    pan: function (b) {
      b.rect(0, 0, AW, AH, '#5a3a24'); b.rect(0, 90, AW, 34, '#8a5a36');
      for (var i = 0; i < 3; i++) { var x = 22 + i * 34, y = 78; b.ellipse(x, y, 15, 10, '#d8a050'); b.ellipse(x, y - 2, 13, 7, '#e8b868'); b.line(x - 7, y - 4, x - 2, y + 2, '#a8702a'); b.line(x + 1, y - 4, x + 6, y + 2, '#a8702a'); }
      b.ellipse(56, 50, 22, 14, '#c88a40'); b.ellipse(56, 47, 19, 10, '#e0a858'); for (var k = 0; k < 5; k++) b.line(40 + k * 8, 44, 44 + k * 8, 52, '#a8702a');
      b.rect(10, 10, 92, 14, '#3a2418'); b.rect(14, 12, 84, 10, '#ff8a3a'); b.rect(18, 14, 76, 6, '#ffd84a');
    },
    rueda: function (b) {
      cieloDe(b, 'oro', 8); suelo(b, 100, '#3a7fd0');
      var cx = 56, cy = 60, r = 38; b.ellipse(cx, cy, r, r, '#7a5a3a'); for (var y = -r + 5; y <= r - 5; y++) for (var x = -r + 5; x <= r - 5; x++) if (x * x + y * y < (r - 5) * (r - 5)) b.clear(cx + x, cy + y);
      for (var k = 0; k < 12; k++) { var t = k / 12 * Math.PI * 2; b.line(cx, cy, cx + Math.cos(t) * r, cy + Math.sin(t) * r, '#5a3a24', 2); b.rect(cx + Math.cos(t) * r - 3, cy + Math.sin(t) * r - 3, 6, 6, '#8a6a4a'); }
      b.ellipse(cx, cy, 7, 7, '#3a2418'); for (var w = 0; w < 10; w++) b.rect(hash(w, 1, 1) * AW, 102 + hash(1, w, 2) * 20, 6, 1, '#8ac4f4');
    },
    rio: function (b) {
      cieloDe(b, 'tarde', 4); b.rect(0, 50, AW, 20, '#5a9a4a');
      for (var y = 66; y < AH; y++) { var w = 20 + (y - 66) * 1.6, cx = 56 + Math.sin(y / 12) * 8; b.rect(0, y, AW, 1, '#5aa34a'); b.rect(cx - w / 2, y, w, 1, '#3a7fd0'); if (y % 5 === 0) b.rect(cx - w / 4 + hash(y, 0, 1) * w / 2, y, 5, 1, '#8ac4f4'); }
      for (var i = 0; i < 8; i++) { var x = hash(i, 2, 1) * AW; if (Math.abs(x - 56) > 30) { b.rect(x, 50, 2, 14, '#5a3a24'); b.ellipse(x, 48, 6, 8, '#2f7a3a'); } }
      b.paste(escalar(edBuf('molino'), .7), 4, 44);
    },
    dragon: function (b) {
      cieloDe(b, 'dia', 11); suelo(b, 98, '#3a7fd0');
      b.rect(0, 80, AW, 6, '#c8b8a0'); for (var i = 0; i < 4; i++) { b.ellipse(14 + i * 28, 98, 11, 12, null); b.rect(2 + i * 28, 86, 4, 30, '#b8a890'); }
      // dragón decorativo de cerámica sobre el puente
      for (var x = 10; x < 104; x++) { var y = 64 + Math.round(Math.sin(x / 9) * 7); b.rect(x, y, 1, 6, '#2f9a5a'); if (x % 4 === 0) b.set(x, y - 1, '#f2c14e'); b.set(x, y + 4, '#a8e8b8'); }
      b.rect(96, 52, 12, 10, '#2f9a5a'); b.rect(104, 56, 6, 3, '#d83a3a'); b.set(99, 54, '#ffe04a'); b.line(96, 52, 92, 46, '#f2c14e'); b.line(100, 52, 100, 45, '#f2c14e');
      for (var t = 0; t < 6; t++) b.set(4 + t, 60 + t, '#2f9a5a');
    },
    puente: function (b) {
      cieloDe(b, 'tarde', 12); b.paste(escalar(edBuf('casa'), .7), 0, 44); b.paste(escalar(edBuf('alfareria'), .7), 76, 44); suelo(b, 78, '#3a7fd0');
      b.rect(0, 70, AW, 6, '#3a4a4a'); for (var i = 0; i < 3; i++) { var cx = 20 + i * 36; for (var a = 0; a <= 30; a++) { var t = Math.PI * a / 30; b.rect(cx - Math.cos(t) * 16, 76 + Math.sin(t) * 18, 2, 2, '#3a4a4a'); } for (var k = 0; k < 5; k++) b.ellipse(cx - 12 + k * 6, 66, 2, 2, '#3a4a4a'); b.rect(cx + 17, 76, 3, 30, '#c8b8a0'); }
      for (var w = 0; w < 14; w++) b.rect(hash(w, 3, 1) * AW, 96 + hash(3, w, 2) * 26, 6, 1, '#8ac4f4');
    },
    cerro: function (b) {
      cieloDe(b, 'dia', 13); b.ellipse(56, 124, 70, 60, '#8aa45a'); b.ellipse(56, 124, 64, 52, '#9ab46a');
      for (var i = 0; i < 9; i++) { var x = 12 + i * 11, y = 96 + (i % 3) * 6; b.rect(x, y, 2, 4, '#7a5a3a'); b.ellipse(x, y - 2, 4, 3, '#6f8a52'); }
      b.paste(edBuf('torre_homenaje'), 34, 4);
    },
    cantera: function (b) {
      cieloDe(b, 'tarde', 14); b.rect(0, 30, AW, 94, '#d8c49a');
      for (var j = 0; j < 6; j++) for (var i = 0; i < 6; i++) { var x = i * 20 + (j % 2) * 10 - 6, y = 34 + j * 15; b.rect(x, y, 18, 13, hash(i, j, 3) > .5 ? '#e8d8b0' : '#c8b48a'); b.rect(x, y, 18, 1, '#f4ecd0'); }
      b.rect(30, 70, 50, 54, '#a8946a'); b.rect(34, 74, 42, 50, '#8a7650');
      b.line(20, 120, 30, 100, '#7a5a3a', 2); b.rect(26, 96, 10, 4, '#a8a8b8');
    },
    plano: function (b) {
      b.rect(0, 0, AW, AH, '#2a3a6a'); for (var x = 0; x < AW; x += 8) b.rect(x, 0, 1, AH, '#3a4a7a'); for (var y = 0; y < AH; y += 8) b.rect(0, y, AW, 1, '#3a4a7a');
      var c = '#e8f0ff'; b.line(20, 30, 92, 30, c); b.line(92, 30, 92, 96, c); b.line(92, 96, 20, 96, c); b.line(20, 96, 20, 30, c);
      [[20, 30], [92, 30], [92, 96], [20, 96]].forEach(function (p) { b.rect(p[0] - 6, p[1] - 6, 12, 12, '#2a3a6a'); b.line(p[0] - 6, p[1] - 6, p[0] + 6, p[1] - 6, c); b.line(p[0] + 6, p[1] - 6, p[0] + 6, p[1] + 6, c); b.line(p[0] + 6, p[1] + 6, p[0] - 6, p[1] + 6, c); b.line(p[0] - 6, p[1] + 6, p[0] - 6, p[1] - 6, c); });
      b.rect(46, 52, 20, 24, '#2a3a6a'); b.line(46, 52, 66, 52, c); b.line(66, 52, 66, 76, c); b.line(66, 76, 46, 76, c); b.line(46, 76, 46, 52, c);
      S.texto(b, '1:500', 34, 106, '#f2c14e'); b.line(20, 116, 92, 116, '#f2c14e'); for (var k = 20; k <= 92; k += 18) b.rect(k, 114, 1, 4, '#f2c14e');
    },
    pergamino: function (b) {
      b.rect(0, 0, AW, AH, '#3a2a4a'); b.rect(16, 14, 80, 96, '#f0dcae'); b.ellipse(16, 14, 6, 6, '#d8bc86'); b.ellipse(96, 110, 6, 6, '#d8bc86'); b.rect(16, 8, 80, 8, '#d8bc86'); b.rect(16, 108, 80, 8, '#d8bc86');
      S.texto(b, '2x+3', 30, 34, '#5a3a24', 3); S.texto(b, 'x=4', 36, 62, '#8a2b3a', 3);
      for (var y = 88; y < 104; y += 4) b.rect(26, y, 60 - (y % 8) * 2, 1, '#a1795a');
      b.ellipse(84, 96, 7, 7, '#a83a3a'); b.ellipse(84, 96, 4, 4, '#c85a5a');
    },
    teatro: function (b) {
      cieloDe(b, 'tarde', 15); suelo(b, 100, '#e8d29a');
      for (var k = 0; k < 7; k++) { var r = 52 - k * 6; for (var a = 0; a <= 40; a++) { var t = Math.PI * a / 40; b.rect(56 - Math.cos(t) * r, 100 - Math.sin(t) * r * .7, 3, 3, k % 2 ? '#d8c8a8' : '#b8a888'); } }
      b.rect(16, 96, 80, 8, '#e8e2d4'); [20, 36, 52, 68, 84].forEach(function (x) { b.rect(x, 74, 6, 24, '#f4efe4'); b.rect(x - 1, 72, 8, 3, '#e8e2d4'); });
    },
    busto: function (b, o) {
      b.rect(0, 0, AW, AH, '#5a2a3a'); for (var y = 0; y < AH; y += 10) b.rect(0, y, AW, 2, '#6a3444');
      var m = '#ece6da', ms = '#c8c0b0', cx = 56;
      b.rect(cx - 18, 100, 36, 20, ms); b.rect(cx - 22, 116, 44, 6, '#d8d0c0');
      for (var y2 = 0; y2 < 22; y2++) b.rect(cx - 14 - y2 * .8, 78 + y2, 28 + y2 * 1.6, 1, m); b.line(cx - 20, 84, cx + 12, 98, ms, 2);
      b.ellipse(cx, 52, 16, 20, m); b.rect(cx - 6, 68, 12, 12, m); b.ellipse(cx + 5, 54, 6, 12, ms);
      b.rect(cx - 9, 48, 5, 2, ms); b.rect(cx + 3, 48, 5, 2, ms); b.rect(cx - 2, 52, 3, 8, ms); b.rect(cx - 5, 63, 10, 1, ms);
      if (o.barba) { b.ellipse(cx, 64, 12, 8, '#dcd4c6'); for (var k = 0; k < 8; k++) b.set(cx - 9 + k * 2.5, 62 + (k % 2) * 4, ms); }
      b.ellipse(cx, 36, 17, 7, '#d8d0c0');
      for (var a = 0; a < 9; a++) { var t = Math.PI + a / 8 * Math.PI; b.ellipse(cx + Math.cos(t) * 17, 40 + Math.sin(t) * 9, 3, 2, '#5a9a3a'); b.set(cx + Math.cos(t) * 17, 39 + Math.sin(t) * 9, '#8aca5a'); }
    },
    calle: function (b) {
      cieloDe(b, 'dia', 16); b.paste(edBuf('palacio'), -16, 36); b.paste(edBuf('palacio', { }), 56, 30); b.paste(edBuf('casa'), 34, 52); suelo(b, 100, '#cfc3b0');
      for (var j = 100; j < AH; j += 4) for (var i = (j % 8 ? 2 : 0); i < AW; i += 6) b.rect(i, j, 4, 3, '#ddd3c2');
    }
  };

  var cacheEd = {};
  function edBuf(t, o, f) { var k = t + JSON.stringify(o || {}); if (cacheEd[k]) return cacheEd[k]; var d = E.EDIF[t], W = d[0] * 16, H = d[1] * 16, b = new Buf(W, H); d[2](b, W, H, o || {}, f || 0); b.outline(); return (cacheEd[k] = b); }
  function escalar(src, k) { var w = Math.max(1, Math.round(src.w * k)), h = Math.max(1, Math.round(src.h * k)), b = new Buf(w, h); for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) b.p[y * w + x] = src.p[Math.min(src.h - 1, Math.floor(y / k)) * src.w + Math.min(src.w - 1, Math.floor(x / k))]; return b; }

  function ilustracion(c) {
    var m = M[c.id] || ['edif', { t: 'casa' }], tipo = m[0], o = m[1], b = new Buf(AW, AH);
    if (tipo === 'edif') {
      cieloDe(b, o.cielo || 'dia', c.etapa * 7 + c.mundo);
      var src = edBuf(o.t, o.o), k = o.esc || (src.w > AW - 8 || src.h > AH - 26 ? .5 : 1), ed = escalar(src, k);
      var groundY = AH - 18;
      suelo(b, groundY, o.jardin ? '#3f8a3a' : o.t === 'giralda' || o.t === 'plaza_espana' || o.t === 'alcazar' ? '#cfc3b0' : '#6aa84a');
      if (o.jardin) for (var i = 0; i < 6; i++) { b.rect(4 + i * 20, groundY + 2, 2, 8, '#6a4a2a'); b.ellipse(5 + i * 20, groundY, 6, 6, '#2f7a3a'); b.set(3 + i * 20, groundY - 2, '#f09a2a'); }
      b.paste(ed, Math.round((AW - ed.w) / 2), Math.min(groundY + 6, AH) - ed.h);
    } else DIB[tipo](b, o);
    return b;
  }

  var cache = {};
  function carta(c) {
    if (cache[c.id]) return cache[c.id];
    var cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; var x = cv.getContext('2d');
    var mc = MARCO[c.rareza] || MARCO.comun;
    x.fillStyle = '#1a1124'; x.fillRect(0, 0, CW, CH);
    x.fillStyle = mc[1]; x.fillRect(2, 2, CW - 4, CH - 4); x.fillStyle = mc[0]; x.fillRect(4, 4, CW - 8, CH - 8);
    x.fillStyle = '#1a1124'; x.fillRect(AX - 2, AY - 2, AW + 4, AH + 4);
    ilustracion(c).toCanvas(cv, AX, AY);
    // cartela inferior: mundo, estrellas de rareza
    x.fillStyle = '#241930'; x.fillRect(8, 138, 112, 30); x.fillStyle = mc[1]; x.fillRect(8, 138, 112, 2);
    var b = new Buf(112, 30), n = { comun: 1, rara: 2, epica: 3, legendaria: 4 }[c.rareza] || 1;
    for (var s = 0; s < n; s++) { var sx = 56 - n * 6 + s * 12 + 2; b.rect(sx + 2, 18, 3, 7, mc[0]); b.rect(sx, 20, 7, 3, mc[0]); b.set(sx + 3, 21, '#ffffff'); }
    S.texto(b, 'M' + c.mundo, 4, 4, '#fbf0d6'); S.texto(b, String(c.etapa) + '/6', 86, 4, '#fbf0d6');
    b.toCanvas(cv, 8, 138);
    // esquinas
    x.fillStyle = '#1a1124'; [[0, 0], [CW - 2, 0], [0, CH - 2], [CW - 2, CH - 2]].forEach(function (p) { x.fillRect(p[0], p[1], 2, 2); });
    return (cache[c.id] = cv.toDataURL('image/png'));
  }

  var cacheR = {};
  function reverso(mundo) {
    mundo = mundo || 0; if (cacheR[mundo]) return cacheR[mundo];
    var cv = document.createElement('canvas'); cv.width = CW; cv.height = CH;
    var b = new Buf(CW, CH), base = '#3a2266', acento = '#f2c14e';
    b.rect(0, 0, CW, CH, '#1a1124'); b.rect(2, 2, CW - 4, CH - 4, acento); b.rect(5, 5, CW - 10, CH - 10, base);
    for (var y = 8; y < CH - 8; y += 8) for (var x = 8; x < CW - 8; x += 8) if ((x + y) % 16 === 0) { b.set(x, y, '#4a3280'); b.set(x + 1, y + 1, '#5a3a96'); }
    // emblema: el compás de los alarifes dentro de una estrella de ocho puntas
    var cx = 64, cy = 80;
    for (var a = 0; a < 8; a++) { var t = a / 8 * Math.PI * 2; b.line(cx, cy, cx + Math.cos(t) * 34, cy + Math.sin(t) * 34, a % 2 ? '#b07a1c' : acento, 3); }
    b.ellipse(cx, cy, 24, 24, '#2a1a4a'); b.ellipse(cx, cy, 21, 21, base);
    b.line(cx, cy - 16, cx - 11, cy + 14, acento, 3); b.line(cx, cy - 16, cx + 11, cy + 14, '#ffe28a', 3); b.ellipse(cx, cy - 16, 4, 4, acento); b.ellipse(cx, cy - 16, 2, 2, '#7fd8ff');
    for (var k = 0; k < 24; k++) { var tt = k / 24 * Math.PI * 2; b.set(cx + Math.cos(tt) * 30, cy + Math.sin(tt) * 30, '#ffe28a'); }
    S.texto(b, 'GALOIS', 40, 18, acento, 2); S.texto(b, 'LEGACY', 40, 132, acento, 2);
    if (mundo) S.texto(b, 'M' + mundo, 56, 152, '#fbf0d6');
    b.toCanvas(cv, 0, 0);
    return (cacheR[mundo] = cv.toDataURL('image/png'));
  }

  root.GaloisArte = { carta: carta, reverso: reverso, motivos: M };
})(window);
