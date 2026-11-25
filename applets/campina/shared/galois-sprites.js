/* =====================================================================
   GALOIS LEGACY · motor de sprites pixel art 16-bit
   ---------------------------------------------------------------------
   Dibuja por código (sin recursos de terceros) los fotogramas de los
   matemáticos y de los enemigos. Cada fotograma es una pose distinta:
   piernas, brazos, cabeza, ojos y efectos cambian entre fotogramas,
   con la misma ropa, rostro y paleta.

   API (window.GaloisSprites):
     ANIM_HEROE   animaciones de héroe {nombre:{n,fps,loop}}
     ANIM_ENEMIGO animaciones de enemigo
     heroes, enemigos            paletas y formas
     hojaHeroe(id)   -> {canvas, fw, fh, filas:{'walk-down':fila,...}, anims}
     hojaEnemigo(id, {jefe, fase}) -> {canvas, fw, fh, filas, anims}
     frame(hoja, anim, dir, t)   -> {sx, sy} del fotograma a dibujar en t (s)
     pintar(ctx, hoja, anim, dir, i, x, y, escala)
   Las hojas son <canvas> que también se exportan como PNG
   (herramientas/exportar-sprites.js).
   ===================================================================== */
(function (root) {
  'use strict';
  var OUT = '#1a1124';

  /* ---------- Búfer de píxeles ---------- */
  function Buf(w, h) { this.w = w; this.h = h; this.p = new Array(w * h).fill(null); }
  Buf.prototype.set = function (x, y, c) { x = Math.round(x); y = Math.round(y); if (c && x >= 0 && y >= 0 && x < this.w && y < this.h) this.p[y * this.w + x] = c; };
  Buf.prototype.get = function (x, y) { return (x < 0 || y < 0 || x >= this.w || y >= this.h) ? null : this.p[y * this.w + x]; };
  Buf.prototype.rect = function (x, y, w, h, c) {
    if (!c) return;
    x = Math.round(x); y = Math.round(y);
    var ini = Math.max(0, x), fin = Math.min(this.w, x + Math.ceil(w));
    if (fin <= ini) return;
    var fondo = Math.min(this.h, y + Math.ceil(h));
    for (var j = Math.max(0, y); j < fondo; j++) {
      var fila = j * this.w;
      this.p.fill(c, fila + ini, fila + fin);
    }
  };
  Buf.prototype.clear = function (x, y) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.p[y * this.w + x] = null; };
  Buf.prototype.line = function (x0, y0, x1, y1, c, t) {
    t = t || 1; var dx = x1 - x0, dy = y1 - y0, n = Math.max(Math.abs(dx), Math.abs(dy), 1);
    for (var i = 0; i <= n; i++) this.rect(Math.round(x0 + dx * i / n), Math.round(y0 + dy * i / n), t, t, c);
  };
  Buf.prototype.ellipse = function (cx, cy, rx, ry, c) {
    for (var y = -ry; y <= ry; y++) for (var x = -rx; x <= rx; x++) if ((x * x) / (rx * rx + .01) + (y * y) / (ry * ry + .01) <= 1.02) this.set(cx + x, cy + y, c);
  };
  Buf.prototype.outline = function (c) {
    var w = this.w, h = this.h, p = this.p, borde = c || OUT;
    var huecos = [];
    for (var y = 0, i = 0; y < h; y++) for (var x = 0; x < w; x++, i++) {
      if (!p[i] && ((x > 0 && p[i - 1]) || (x + 1 < w && p[i + 1]) ||
          (y > 0 && p[i - w]) || (y + 1 < h && p[i + w]))) huecos.push(i);
    }
    for (var j = 0; j < huecos.length; j++) p[huecos[j]] = borde;
  };
  Buf.prototype.mirror = function () { var b = new Buf(this.w, this.h); for (var y = 0; y < this.h; y++) for (var x = 0; x < this.w; x++) b.p[y * this.w + (this.w - 1 - x)] = this.p[y * this.w + x]; return b; };
  Buf.prototype.map = function (fn) { for (var i = 0; i < this.p.length; i++) if (this.p[i]) this.p[i] = fn(this.p[i], i); return this; };
  Buf.prototype.paste = function (b, dx, dy) { for (var y = 0; y < b.h; y++) for (var x = 0; x < b.w; x++) { var c = b.p[y * b.w + x]; if (c) this.set(dx + x, dy + y, c); } };
  // La caída conserva todos los píxeles de la pose dentro del fotograma.
  Buf.prototype.tumbar = function (suelo, angulo) {
    var b = new Buf(this.w, this.h), sin = Math.sin(angulo), cos = Math.cos(angulo);
    var minX = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (var y = 0; y < this.h; y++) for (var x = 0; x < this.w; x++) {
      var c = this.get(x, y); if (!c) continue;
      var nx = x * cos + y * sin, ny = -x * sin + y * cos;
      minX = Math.min(minX, nx); maxX = Math.max(maxX, nx); maxY = Math.max(maxY, ny);
    }
    var escala = Math.min(1, (this.w - 4) / (maxX - minX));
    var centro = (minX + maxX) / 2;
    // Muestrear desde el destino evita agujeros entre píxeles al girar.
    for (var fy = 0; fy <= suelo; fy++) for (var fx = 0; fx < b.w; fx++) {
      var rx = centro + (fx - (b.w - 1) / 2) / escala;
      var ry = maxY + (fy - suelo) / escala;
      var color = this.get(Math.round(rx * cos - ry * sin), Math.round(rx * sin + ry * cos));
      if (color) b.p[fy * b.w + fx] = color;
    }
    return b;
  };
  // Vuelca el búfer en un lienzo de una sola vez: los píxeles se escriben en un
  // ImageData auxiliar y se componen con drawImage (respeta la transparencia y lo
  // que ya hubiera debajo). Un color que no sea HEX se pinta aparte con fillRect.
  var RGBA = Object.create(null), auxiliar = null;
  function rgbaDe(c) {
    var v = RGBA[c]; if (v !== undefined) return v;
    return (RGBA[c] = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(c) ? hex(c) : null);
  }
  Buf.prototype.toCanvas = function (cv, ox, oy) {
    var ctx = cv.getContext('2d'), w = this.w, h = this.h, p = this.p;
    if (!auxiliar) auxiliar = document.createElement('canvas');
    if (auxiliar.width !== w || auxiliar.height !== h) { auxiliar.width = w; auxiliar.height = h; }
    var actx = auxiliar.getContext('2d'), img = actx.createImageData(w, h), d = img.data, raros = null;
    for (var i = 0, n = w * h; i < n; i++) {
      var c = p[i]; if (!c) continue;
      var v = rgbaDe(c); if (!v) { (raros || (raros = [])).push(i); continue; }
      var k = i * 4; d[k] = v[0]; d[k + 1] = v[1]; d[k + 2] = v[2]; d[k + 3] = 255;
    }
    actx.putImageData(img, 0, 0);
    ctx.drawImage(auxiliar, ox, oy);
    if (raros) for (var r = 0; r < raros.length; r++) { ctx.fillStyle = p[raros[r]]; ctx.fillRect(ox + raros[r] % w, oy + Math.floor(raros[r] / w), 1, 1); }
  };

  /* ---------- Color ---------- */
  function hex(c) { c = c.replace('#', ''); if (c.length === 3) c = c.split('').map(function (k) { return k + k; }).join(''); return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]; }
  function rgb(a) { return '#' + a.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function mix(a, b, t) { var x = hex(a), y = hex(b); return rgb([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); }
  var sombras = Object.create(null), luces = Object.create(null);
  function dark(c, t) {
    t = t == null ? .3 : t;
    var clave = c + ':' + t;
    return sombras[clave] || (sombras[clave] = mix(c, '#140a1e', t));
  }
  function light(c, t) {
    t = t == null ? .3 : t;
    var clave = c + ':' + t;
    return luces[clave] || (luces[clave] = mix(c, '#fff8e6', t));
  }
  function hash(x, y, s) { var h = (x * 374761393 + y * 668265263 + (s || 0) * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

  /* ---------- Fuente de 3×5 para símbolos de los enemigos ---------- */
  var FONT = {
    '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001',
    '5': '111100111001111', '6': '111100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001111',
    'a': '000011101101011', 'n': '000110101101101', 'x': '000101010101000', 'P': '110101110100100', '%': '101001010100101',
    '+': '000010111010000', '-': '000000111000000', '*': '000101010101000', '/': '001001010100100', '=': '000111000111000',
    'v': '000001101101010', '(': '010100100100010', ')': '010001001001010', '?': '111001011000010', 'y': '000101111001110',
    'f': '011010111010010', 'M': '101111101101101', 'e': '000111111100111', 'd': '001001111101111', 'p': '000111101111100',
    ':': '000010000010000', '^': '010101000000000', 'R': '110101110101101', 'E': '111100111100111', 'X': '101101010101101', 'I': '111010010010111', 'S': '111100111001111', 'A': '010101111101101', 'O': '111101101101111', 'C': '111100100100111', 'T': '111010010010010', 'L': '100100100100111', 'N': '101111111111101', 'G': '111100101101111', 'U': '101101101101111', 'D': '110101101101110', 'F': '111100110100100', 'H': '101101111101101', 'B': '110101110101110', 'Y': '101101010010010', 'R': '110101110101101', 'M': '101111101101101', 'P': '110101110100100', 'E': '111100111100111', 'V': '101101101101010', 'K': '101101110101101', 'W': '101101111111101'
  };
  function texto(b, s, x, y, c, k) {
    k = k || 1; for (var n = 0; n < s.length; n++) {
      var g = FONT[s[n]]; if (!g) { x += 2 * k; continue; }
      for (var j = 0; j < 5; j++) for (var i = 0; i < 3; i++) if (g[j * 3 + i] === '1') b.rect(x + i * k, y + j * k, k, k, c);
      x += 4 * k;
    }
  }
  function anchoTexto(s, k) { return s.length * 4 * (k || 1) - (k || 1); }

  /* =====================================================================
     HÉROES
     ===================================================================== */
  var heroes = {
    galois:        { skin: '#f2c39b', hair: '#5a3622', pelo: 'rizado', coat: '#b8323a', shirt: '#f4efe6', pants: '#24305e', shoes: '#2a1d1d', acc: '#24305e', cape: '#1f2c5c', corte: 'levita', magia: '#7fd8ff' },
    gauss:         { skin: '#efc6a6', hair: '#e8e4dc', pelo: 'corto', hat: 'boina', hatC: '#1d1f2b', coat: '#2a2c38', shirt: '#f2f2f2', pants: '#2c2d3a', shoes: '#181820', acc: '#c9a44a', magia: '#ffd86b' },
    euler:         { skin: '#f0c4a0', hair: '#cfc6b8', pelo: 'corto', hat: 'cofia', hatC: '#efe2c4', hatB: '#8a5a32', coat: '#7a4b2a', shirt: '#f2ead8', pants: '#4a3424', shoes: '#2a1d1d', acc: '#d8b45a', magia: '#9df07a' },
    emmy_noether:  { skin: '#f1c7a5', hair: '#3b2a20', pelo: 'melena', gafas: true, coat: '#56607a', shirt: '#e8e8f0', vestido: true, shoes: '#22222c', acc: '#a7b4d8', magia: '#c59bff' },
    hipatia:       { skin: '#d9a27a', hair: '#2b1b14', pelo: 'mono', coat: '#efe9dc', shirt: '#efe9dc', vestido: true, shoes: '#8a5a32', acc: '#d9a441', diadema: '#d9a441', corte: 'tunica', magia: '#ffe9a0' },
    ada_lovelace:  { skin: '#f3cdb0', hair: '#2c1c18', pelo: 'rizos', diadema: '#d9a441', corte: 'encaje', coat: '#6a3f8f', shirt: '#e9dff5', vestido: true, shoes: '#2a1830', acc: '#e9dff5', magia: '#ff9be0' },
    fibonacci:     { skin: '#efc19b', hair: '#6b4226', pelo: 'corto', hat: 'capucha', hatC: '#ac3c37', cape: '#a8322f', coat: '#3f7a3a', shirt: '#e9dcc0', pants: '#7a5a3a', shoes: '#3a2418', acc: '#d9a441', magia: '#b6f56a' },
    fermat:        { skin: '#f0c6a2', hair: '#3a2a24', pelo: 'largo', coat: '#1c1a24', shirt: '#f4f1e8', cuello: '#f4f1e8', corte: 'levita', bigote: true, pants: '#1c1a24', shoes: '#120e14', acc: '#8a2b3a', magia: '#ff7a6a' },
    sophie_germain:{ skin: '#f2c8aa', hair: '#7a4a2a', pelo: 'rizos', diadema: '#76bee9', corte: 'imperio', coat: '#3c6fb4', shirt: '#f2efe8', vestido: true, shoes: '#22222c', acc: '#f2efe8', magia: '#8fd7ff' },
    ramanujan:     { skin: '#a8714f', hair: '#1a1414', pelo: 'corto', coat: '#313949', shirt: '#bac7dd', pants: '#252c39', shoes: '#1c1414', acc: '#7a5a3a', magia: '#ffb45a' },
    al_juarismi:   { skin: '#c48a5f', hair: '#2a2020', pelo: 'corto', hat: 'turbante', hatC: '#f4f1ea', hatB: '#d6be93', corte: 'tunica', barba: '#2a2020', coat: '#2a7a7a', shirt: '#f4f1ea', vestido: true, shoes: '#3a2418', acc: '#d9a441', magia: '#6af5e0' }
  };

  var ANIM_HEROE = {
    idle: { n: 4, fps: 4, loop: true }, walk: { n: 8, fps: 10, loop: true }, run: { n: 8, fps: 14, loop: true },
    jump: { n: 6, fps: 10, loop: false }, attack: { n: 7, fps: 14, loop: false }, cast: { n: 8, fps: 10, loop: false },
    hurt: { n: 3, fps: 9, loop: false }, victory: { n: 6, fps: 8, loop: true }, defeat: { n: 5, fps: 6, loop: false }
  };
  var DIRS = ['down', 'left', 'right', 'up'];
  var FW = 32, FH = 44, OY = 12; // fotograma 32×44; el suelo está en y = 42

  function pose() { return { bx: 0, by: 0, hL: [0, 0], hR: [0, 0], fL: [0, 0], fR: [0, 0], ojos: 'open', boca: 'n', arma: null, fx: [], aire: false, tint: null, cabeza: 0 }; }

  /* Poses de cada fotograma. "L" es la mano/pie izquierdo en vista frontal y el
     cercano en vista lateral. En vista lateral "adelante" es x negativa. */
  function poseHeroe(anim, f, lado) {
    var p = pose(), ph = f / 8 * Math.PI * 2, s = Math.sin(ph), c = Math.cos(ph);
    switch (anim) {
      case 'idle':
        if (f >= 2) { p.by = 1; p.hL = [0, 1]; p.hR = [0, 1]; }
        if (f === 3) p.ojos = 'closed';
        break;
      case 'walk': case 'run':
        var k = anim === 'run' ? 1.7 : 1;
        if (lado) {
          p.fL = [-Math.round(3 * k * s), -Math.max(0, Math.round(2 * k * c))];
          p.fR = [Math.round(3 * k * s), -Math.max(0, Math.round(-2 * k * c))];
          p.hL = [Math.round(3 * k * s), anim === 'run' ? -3 : 0];
          p.hR = [-Math.round(3 * k * s), anim === 'run' ? -3 : 0];
          if (anim === 'run') p.bx = -1;
        } else {
          p.fL = [0, -Math.max(0, Math.round(2 * k * s))];
          p.fR = [0, -Math.max(0, Math.round(-2 * k * s))];
          p.hL = [0, Math.round(1.5 * k * s) + (anim === 'run' ? -2 : 0)];
          p.hR = [0, -Math.round(1.5 * k * s) + (anim === 'run' ? -2 : 0)];
        }
        p.by = Math.abs(s) > .7 ? 1 : 0;
        p.tela = anim === 'run' ? [2, 3, 4, 4, 3, 2, 3, 4][f] : [0, 1, 1, 0, 0, 1, 1, 0][f];
        if (anim === 'run') { p.by = [1, 0, -1, 0][f % 4]; p.aire = p.by < 0; p.boca = 'o'; }
        break;
      case 'jump':
        var J = [[2, 0, 2], [-2, 0, 0], [-6, -3, -6], [-8, -4, -9], [-4, -2, -5], [2, 0, 1]][f];
        p.by = J[0]; p.aire = J[0] < 0;
        p.fL = [lado && p.aire ? -2 : 0, J[1]]; p.fR = [p.aire ? 2 : 0, J[1]];
        p.hL = [-1, J[2]]; p.hR = [1, J[2]];
        p.tela = [0, -1, -2, 0, 3, 2][f];
        if (f === 5) { p.hL = [-2, 0]; p.hR = [2, 0]; }
        p.boca = f >= 2 && f <= 3 ? 'o' : 'n';
        break;
      case 'attack':
        var A = lado ? [[0, -1], [5, -6], [2, -11], [-7, -6], [-8, -3], [-4, -1], [0, 0]][f] : [[0, -2], [1, -12], [2, -13], [-6, -4], [-8, 0], [-3, -1], [0, 0]][f];
        if (lado) p.hL = A; else p.hR = A;
        p.tela = [0, -1, -2, 1, 3, 2, 0][f];
        p.arma = 'compas'; if (f === 3 || f === 4) p.fx.push({ t: 'tajo', f: f - 3 });
        p.bx = lado ? (f === 3 || f === 4 ? -1 : f === 1 ? 1 : 0) : 0; p.by = f === 3 ? 1 : 0; p.boca = f >= 3 && f <= 4 ? 'o' : 'n';
        if (lado) { p.fL = [f >= 3 && f <= 4 ? -2 : 0, 0]; }
        break;
      case 'cast':
        var C = [[0, 0], [2, -3], [3, -7], [2, -10], [2, -11], [2, -12], [-1, -6], [0, -1]][f];
        p.hL = [-C[0], C[1]]; p.hR = [C[0], C[1]];
        if (lado && f === 6) { p.hL = [-7, -6]; p.hR = [-6, -5]; }
        if (f >= 3 && f <= 5) p.fx.push({ t: 'orbe', r: f - 2 });
        if (f === 6) p.fx.push({ t: 'rayo' });
        if (f >= 4 && f <= 6) p.fx.push({ t: 'chispas', f: f });
        p.ojos = f >= 4 && f <= 5 ? 'closed' : 'open'; p.boca = f === 6 ? 'o' : 'n';
        break;
      case 'hurt':
        p.bx = lado ? [3, 1, 0][f] : 0; p.by = lado ? 0 : [-1, 0, 0][f]; p.tint = ['#ffffff', '#ff5a5a', null][f];
        p.hL = [-2, -2]; p.hR = [2, -2]; p.ojos = 'closed'; p.boca = 'o';
        break;
      case 'victory':
        var V = [[2, 0], [-5, -14], [-7, -15], [-4, -14], [0, -13], [0, -11]][f];
        p.by = V[0]; p.aire = true; p.hR = [lado ? 0 : 1, V[1]]; p.hL = [lado ? 1 : -2, f === 0 ? 1 : -1];
        p.boca = 'sonrisa'; if (f === 2 || f === 5) p.fx.push({ t: 'chispas', f: f });
        if (f === 0) p.hR = [1, 0];
        break;
      case 'defeat':
        p.ojos = 'closed'; p.boca = 'o';
        if (f === 0) { p.bx = 1; p.hL = [-2, -1]; p.hR = [2, -1]; }
        if (f === 1) { p.by = 4; p.fL = [-2, -2]; p.fR = [2, -2]; p.hL = [0, 2]; p.hR = [0, 2]; }
        if (f === 2) { p.tumbado = Math.PI / 5; p.hL = [-2, -1]; p.hR = [2, -1]; }
        if (f >= 3) { p.tumbado = Math.PI / 2; p.ojos = 'x'; }
        if (f === 4) p.fx.push({ t: 'mareo' });
        break;
    }
    return p;
  }

  function brazo(b, sx, sy, hx, hy, ropa, piel) {
    var ex = Math.round((sx + hx) / 2), ey = Math.round((sy + hy) / 2) + (hy < sy ? 2 : 0);
    b.line(sx, sy, ex, ey, dark(ropa, .28), 3);
    b.line(ex, ey, hx, hy, dark(ropa, .28), 3);
    b.line(sx, sy, ex, ey, ropa, 2);
    b.line(ex, ey, hx, hy, ropa, 2);
    b.set(sx, sy, light(ropa, .25));
    b.rect(hx, hy + 1, 3, 2, dark(piel, .22));
    b.rect(hx, hy + 1, 2, 1, piel);
    b.set(hx, hy + 1, light(piel, .29));
  }
  function pierna(b, hx, hy, fx, fy, ropa, zap, dir) {
    b.line(hx, hy, fx, fy, dark(ropa, .27), 3);
    b.line(hx, hy, fx, fy, ropa, 2);
    b.line(hx, hy + 1, (hx + fx) / 2, (hy + fy) / 2, light(ropa, .2));
    var punta = fx - (dir === 'R' ? 0 : 1);
    b.rect(punta, fy + 1, 4, 2, dark(zap, .26));
    b.rect(punta, fy + 1, 3, 1, light(zap, .24));
    b.set(punta + 3, fy + 1, zap);
  }

  function pelo(b, P, vista, x, y, tela) {
    var c = P.hair, sombra = dark(c, .35), brillo = light(c, .28);
    var st = P.pelo, espalda = vista === 'up', lado = vista === 'side';
    var longitud = st === 'largo' ? 12 : st === 'rizos' ? 11 : st === 'melena' ? 9 : 5;
    b.rect(x + 2, y - 2, 8, 5, c);
    b.rect(x, y, 12, 3, c);
    if (espalda) {
      b.rect(x, y + 2, 12, 7, c);
      b.rect(x + 3, y + 9, 8, 1, sombra);
      b.line(x + 2, y + 2, x + 2, y + 6, brillo);
      b.line(x + 9, y + 2, x + 9, y + 8, sombra);
    } else {
      b.line(x + 1, y + 2, x + 5, y + 3, sombra);
      b.rect(x + (lado ? 7 : 10), y + 2, lado ? 5 : 2, 3, sombra);
      if (!lado) b.rect(x, y + 2, 2, 3, c);
    }
    if (longitud > 5) {
      var deriva = Math.round((tela || 0) / 2);
      b.line(x + 10, y + 3, x + 10 + deriva, y + longitud, sombra, 2);
      b.line(x + 10, y + 3, x + 10 + deriva, y + longitud - 1, c);
      if (!lado) b.line(x, y + 3, x - deriva, y + longitud - 1, c, 2);
    }
    if (st === 'mono') {
      b.ellipse(x + (lado ? 10 : 6), y - (espalda ? 2 : 3), 4, 3, sombra);
      b.ellipse(x + (lado ? 9 : 5), y - (espalda ? 3 : 4), 3, 2, c);
    }
    if (st === 'rizado' || st === 'rizos') {
      for (var i = 0; i < 4; i++) {
        b.ellipse(x + 1 + i * 3, y - (i === 1 ? 2 : 1), 2, 2, i === 3 ? sombra : c);
        b.set(x + i * 3, y - (i === 1 ? 3 : 2), brillo);
      }
    } else {
      b.line(x + 2, y, x + 5, y - 1, brillo);
      b.set(x + 7, y - 1, brillo);
    }
    if (P.diadema) {
      b.line(x + 1, y + 1, x + (lado ? 9 : 10), y - 1, P.diadema);
      b.set(x + 3, y, light(P.diadema, .56));
    }
  }

  function sombrero(b, P, vista, x, y) {
    if (!P.hat) return;
    var c = P.hatC, sombra = dark(c, .34), brillo = light(c, .3);
    switch (P.hat) {
      case 'boina':
        b.ellipse(x + 6, y - 2, 8, 4, sombra);
        b.ellipse(x + 5, y - 3, 7, 3, c);
        b.line(x, y - 3, x + 6, y - 5, brillo);
        b.rect(x + (vista === 'side' ? -3 : 0), y, 12, 1, sombra);
        break;
      case 'cofia':
        b.ellipse(x + 6, y - 1, 8, 5, sombra);
        b.ellipse(x + 5, y - 2, 7, 4, c);
        b.line(x, y - 2, x + 3, y - 5, brillo);
        b.line(x + 5, y - 4, x + 8, y - 2, sombra);
        b.rect(x, y + 1, 13, 1, light(c, .18));
        break;
      case 'turbante':
        b.ellipse(x + 6, y - 2, 8, 5, c);
        b.line(x - 1, y, x + 10, y - 5, sombra, 2);
        b.line(x - 1, y - 1, x + 9, y - 6, brillo);
        b.line(x + 1, y + 1, x + 12, y - 3, P.hatB);
        b.rect(x + (vista === 'side' ? 10 : 0), y + 2, 2, 8, sombra);
        break;
      case 'capucha':
        b.ellipse(x + 6, y, 8, 6, c);
        b.rect(x - 1, y + 1, 2, 8, sombra);
        b.rect(x + 11, y + 1, 2, 9, sombra);
        if (vista !== 'up') {
          b.ellipse(x + 6, y + 3, 5, 3, sombra);
          b.rect(x + 2, y + 4, 8, 2, P.skin);
        }
        b.line(x - 1, y - 1, x + 5, y - 5, brillo);
        break;
      default:
        b.ellipse(x + 6, y - 2, 7, 4, sombra);
        b.ellipse(x + 5, y - 3, 6, 3, c);
        b.rect(x, y, 12, 1, brillo);
    }
  }

  function ojo(b, x, y, estado, piel) {
    var tinta = '#24162e';
    if (estado === 'open') {
      b.rect(x, y, 2, 2, tinta);
      b.set(x, y, '#ffeed5');
      b.set(x - 1, y - 1, dark(piel, .48));
      b.set(x, y - 1, dark(piel, .48));
    } else if (estado === 'closed') b.rect(x, y + 1, 2, 1, tinta);
    else {
      b.line(x - 1, y, x + 1, y + 2, tinta);
      b.line(x + 1, y, x - 1, y + 2, tinta);
    }
  }

  function lente(b, x, y) {
    var c = '#2a2438';
    b.rect(x, y - 1, 2, 1, c);
    b.rect(x, y + 2, 2, 1, c);
    b.rect(x - 1, y, 1, 2, c);
    b.rect(x + 2, y, 1, 2, c);
  }

  function capa(b, x, y, w, c, tela) {
    var sombra = dark(c, .35), luz = light(c, .3);
    for (var i = 0; i < 14; i++) {
      var vuelo = Math.round(tela * i / 13);
      b.rect(x + Math.min(vuelo, 0), y + i, w + Math.max(vuelo, 0) + (i >> 2), 1, i === 13 ? sombra : c);
      b.set(x + Math.min(vuelo, 0), y + i, luz);
      if (i > 3) b.set(x + w - 2 + vuelo, y + i, sombra);
    }
  }

  function ropaHeroe(b, P, x, y, w, vista) {
    var luz = light(P.coat, .28), sombra = dark(P.coat, .32);
    if (P.corte === 'levita') {
      b.line(x + 1, y + 6, x, y + 13, sombra, 2);
      b.line(x + w - 2, y + 6, x + w - 2, y + 12, P.coat, 2);
      b.line(x + 1, y + 8, x + 1, y + 11, luz);
    }
    if (P.vestido) {
      b.line(x + 2, y + 8, x, y + 14, luz);
      b.line(x + w - 4, y + 8, x + w - 2, y + 14, sombra);
      b.line(x + w - 2, y + 8, x + w, y + 14, P.coat);
    }
    if (vista === 'up') {
      b.line(x + 1, y + 2, x + w - 2, y + 2, luz);
      return;
    }
    if (P.corte === 'tunica') {
      b.line(x + 1, y, x + w - 2, y + 5, sombra, 2);
      b.line(x + 1, y, x + w - 2, y + 5, P.acc);
      b.set(x + 1, y + 1, light(P.acc, .43));
    } else if (P.corte === 'encaje' || P.corte === 'imperio') {
      b.line(x + 1, y + 3, x + w - 2, y + 3, P.shirt);
      b.rect(x + 2, y + 5, w - 4, 1, luz);
      b.set(x + (w >> 1), y + 3, P.acc);
    } else {
      b.line(x + 2, y + 2, x + 4, y + 5, luz);
      b.line(x + w - 2, y + 2, x + w - 4, y + 5, sombra);
      b.set(x + (w >> 1), y + 6, P.acc);
    }
  }

  function dibujarHeroe(P, anim, f, dir) {
    var b = new Buf(FW, FH), lado = dir === 'left' || dir === 'right', vista = lado ? 'side' : dir;
    var p = poseHeroe(anim, f, lado);
    var bx = p.bx, by = p.by, o = OY;
    var coat = P.coat, coatS = dark(coat, .28), coatL = light(coat, .18), skin = P.skin, skinS = dark(skin, .18);
    var pants = P.pants || coatS, shoes = P.shoes;
    var fy0 = 28 + o; // pie
    var afL = p.aire ? by : 0;

    if (vista === 'side') {
      // brazo lejano, pierna lejana, capa, pierna cercana, torso, cabeza, brazo cercano
      var shx = 16 + bx, shy = 14 + by + o;
      brazo(b, shx + 1, shy, 17 + bx + p.hR[0], 19 + by + o + p.hR[1], coatS, skinS);
      if (!P.vestido) pierna(b, 16 + bx, 21 + by + o, 16 + p.fR[0] + bx, fy0 - 1 + p.fR[1] + afL, dark(pants, .25), dark(shoes, .2), 'side');
      if (P.cape) capa(b, 18 + bx, 13 + by + o, 4, P.cape, p.tela || 0);
      if (!P.vestido) pierna(b, 15 + bx, 21 + by + o, 15 + p.fL[0] + bx, fy0 - 1 + p.fL[1] + afL, pants, shoes, 'side');
      else {
        for (var r = 0; r < 9; r++) b.rect(12 + bx - (r >> 2), 20 + r + by + o, 9 + (r >> 1), 1, r === 8 ? coatS : coat);
        b.rect(13 + p.fL[0] + bx, fy0 + p.fL[1] + afL, 4, 2, shoes);
      }
      b.rect(12 + bx, 13 + by + o, 8, 9, coat); b.rect(19 + bx, 13 + by + o, 1, 9, coatS); b.rect(12 + bx, 13 + by + o, 1, 9, coatL);
      b.rect(12 + bx, 13 + by + o, 3, 3, P.shirt); if (P.cuello) b.rect(12 + bx, 13 + by + o, 5, 2, P.cuello);
      if (!P.vestido) b.rect(12 + bx, 20 + by + o, 8, 1, coatS);
      ropaHeroe(b, P, 12 + bx, 13 + by + o, 8, vista);
      var hx = 10 + bx, hy = Math.max(8, 3 + by + o + p.cabeza);
      b.rect(hx, hy, 11, 10, skin); b.clear(hx, hy); b.clear(hx, hy + 9); b.clear(hx + 10, hy + 9);
      b.set(hx - 1, hy + 6, skin); // nariz
      b.rect(hx + 6, hy + 5, 2, 2, skinS); // oreja
      b.rect(hx + 2, hy + 3, 3, 2, light(skin, .32));
      b.line(hx + 5, hy + 9, hx + 10, hy + 6, skinS);
      pelo(b, P, 'side', hx, hy, p.tela); sombrero(b, P, 'side', hx, hy);
      if (P.barba) b.rect(hx + 1, hy + 7, 6, 3, P.barba);
      var ex = hx + 2, ey = hy + 5;
      ojo(b, ex, ey, p.ojos, skin);
      if (P.gafas) { lente(b, ex, ey); b.rect(ex + 2, ey, 4, 1, '#2a2438'); }
      if (P.bigote) b.rect(hx + 1, hy + 7, 4, 1, P.hair);
      b.rect(hx + 1, hy + 8, p.boca === 'n' ? 1 : 2, 1, P.barba ? light(P.barba, .25) : '#8a4c4c');
      brazo(b, shx - 1, shy, 15 + bx + p.hL[0], 19 + by + o + p.hL[1], coatL, skin);
      if (p.arma) arma(b, 15 + bx + p.hL[0], 19 + by + o + p.hL[1], shx - 1, shy, P);
    } else {
      var back = vista === 'up';
      var sLx = 10 + bx, sRx = 20 + bx, sy = 14 + by + o;
      // piernas
      if (!P.vestido) {
        pierna(b, 13 + bx, 21 + by + o, 12 + p.fL[0] + bx, fy0 - 1 + p.fL[1] + afL, pants, shoes, 'L');
        pierna(b, 17 + bx, 21 + by + o, 17 + p.fR[0] + bx, fy0 - 1 + p.fR[1] + afL, dark(pants, .1), shoes, 'R');
      } else {
        for (var r2 = 0; r2 < 9; r2++) b.rect(11 + bx - (r2 >> 2), 20 + r2 + by + o, 10 + 2 * (r2 >> 2), 1, r2 === 8 ? coatS : coat);
        b.rect(20 + bx, 20 + by + o, 1, 9, coatS);
        b.rect(11 + p.fL[0] + bx, fy0 + p.fL[1] + afL, 4, 2, shoes); b.rect(17 + p.fR[0] + bx, fy0 + p.fR[1] + afL, 4, 2, shoes);
      }
      if (P.cape && !back) { b.rect(9 + bx, 13 + by + o, 2, 12, dark(P.cape, .1)); b.rect(21 + bx, 13 + by + o, 2, 12, dark(P.cape, .1)); }
      // torso
      b.rect(11 + bx, 13 + by + o, 10, 9, coat); b.rect(20 + bx, 13 + by + o, 1, 9, coatS); b.rect(11 + bx, 13 + by + o, 1, 9, coatL);
      if (!back) {
        b.rect(14 + bx, 13 + by + o, 4, 3, P.shirt);
        if (P.cuello) b.rect(12 + bx, 13 + by + o, 8, 2, P.cuello);
        if (P.cape) b.rect(11 + bx, 13 + by + o, 10, 1, P.cape);
        b.set(15 + bx, 17 + by + o, P.acc); b.set(16 + bx, 19 + by + o, P.acc);
        if (!P.vestido) b.rect(11 + bx, 20 + by + o, 10, 1, coatS); else b.rect(11 + bx, 19 + by + o, 10, 1, P.acc);
      }
      ropaHeroe(b, P, 11 + bx, 13 + by + o, 10, vista);
      if (back && P.cape) capa(b, 10 + bx, 13 + by + o, 10, P.cape, p.tela || 0);
      // cabeza
      var hx2 = 10 + bx, hy2 = Math.max(8, 3 + by + o + p.cabeza);
      b.rect(hx2, hy2, 12, 10, skin); b.clear(hx2, hy2); b.clear(hx2 + 11, hy2); b.clear(hx2, hy2 + 9); b.clear(hx2 + 11, hy2 + 9);
      b.rect(hx2 + 1, hy2 + 9, 10, 1, skinS);
      b.rect(hx2 + 2, hy2 + 3, 4, 2, light(skin, .27));
      b.rect(hx2 + 10, hy2 + 4, 2, 4, skinS);
      pelo(b, P, back ? 'up' : 'down', hx2, hy2, p.tela); sombrero(b, P, back ? 'up' : 'down', hx2, hy2);
      if (!back) {
        if (P.barba) b.rect(hx2 + 2, hy2 + 7, 8, 3, P.barba);
        var e1 = hx2 + 3, e2 = hx2 + 8, ey2 = hy2 + 5;
        ojo(b, e1, ey2, p.ojos, skin); ojo(b, e2, ey2, p.ojos, skin);
        if (P.gafas) { lente(b, e1, ey2); lente(b, e2, ey2); b.set(e1 + 3, ey2, '#2a2438'); }
        b.set(hx2 + 5, hy2 + 6, light(skin, .4));
        b.set(hx2 + 6, hy2 + 7, skinS);
        if (P.bigote) { b.rect(hx2 + 4, hy2 + 7, 4, 1, P.hair); }
        if (P.barba) b.rect(hx2 + 4, hy2 + 8, 4, 1, light(P.barba, .25));
        b.set(hx2 + 2, hy2 + 7, mix(skin, '#ff6a7a', .35)); b.set(hx2 + 9, hy2 + 7, mix(skin, '#ff6a7a', .35));
        if (!P.barba) { if (p.boca === 'o') b.rect(hx2 + 5, hy2 + 7, 2, 2, '#6a2a3a'); else if (p.boca === 'sonrisa') { b.rect(hx2 + 5, hy2 + 8, 2, 1, '#6a2a3a'); b.set(hx2 + 4, hy2 + 7, '#6a2a3a'); b.set(hx2 + 7, hy2 + 7, '#6a2a3a'); } else b.rect(hx2 + 5, hy2 + 8, 2, 1, skinS); }
      }
      // brazos
      var lHx = 9 + bx + p.hL[0], lHy = 19 + by + o + p.hL[1], rHx = 21 + bx + p.hR[0], rHy = 19 + by + o + p.hR[1];
      brazo(b, sLx, sy, lHx, lHy, back ? coatS : coatL, skin);
      brazo(b, sRx, sy, rHx, rHy, coatS, skin);
      if (p.arma) arma(b, rHx, rHy, sRx, sy, P);
    }
    if (p.tumbado) b = b.tumbar(41, p.tumbado);
    b.outline();
    // efectos (sin contorno, encima)
    p.fx.forEach(function (e) { efecto(b, e, P, lado, bx, by); });
    if (p.tint) {
      var colores = Object.create(null);
      colores[OUT] = p.tint === '#ffffff' ? '#ffffff' : dark(p.tint, .5);
      b.map(function (c) { return colores[c] || (colores[c] = mix(c, p.tint, .65)); });
    }
    if (dir === 'right') b = b.mirror();
    return b;
  }

  function arma(b, hx, hy, sx, sy, P) {
    // El «compás de los alarifes»: dos patas doradas y una gema
    var dx = hx - sx, dy = hy - sy, n = Math.max(1, Math.hypot(dx, dy)), ux = dx / n, uy = dy / n;
    var tx = hx + ux * 7, ty = hy + uy * 7;
    b.line(hx, hy, tx - uy * 2, ty + ux * 2, '#f2c14e', 1);
    b.line(hx, hy, tx + uy * 2, ty - ux * 2, '#b07a1c', 1);
    b.set(hx, hy, P.magia);
  }
  function efecto(b, e, P, lado, bx, by) {
    var M = P.magia, W = '#fffbe8';
    if (e.t === 'tajo') {
      var cx = lado ? 9 + bx : 13, cy = 24 + by;
      for (var a = 0; a < 9; a++) {
        var ang = (lado ? Math.PI * .75 : Math.PI * .1) + (lado ? 1 : 1) * a * .2 + e.f * .5, r = 10 - e.f;
        b.set(cx + Math.cos(ang) * r * (lado ? -1 : 1), cy - Math.sin(ang) * r, a % 2 ? M : W);
        b.set(cx + Math.cos(ang) * (r - 1) * (lado ? -1 : 1), cy - Math.sin(ang) * (r - 1), W);
      }
    } else if (e.t === 'orbe') {
      var ox = lado ? 13 + bx : 16, oy = 5 + by;
      b.ellipse(ox, oy, e.r + 1, e.r + 1, M); b.ellipse(ox, oy, Math.max(0, e.r - 1), Math.max(0, e.r - 1), W);
    } else if (e.t === 'rayo') {
      for (var i = 0; i < 12; i++) b.set((lado ? 6 - i * .4 : 16) + (i % 2), lado ? 26 - i * .3 : 18 - i, i % 3 ? M : W);
    } else if (e.t === 'chispas') {
      for (var j = 0; j < 6; j++) { var hx = hash(j, e.f, 7), hy = hash(e.f, j, 9); b.set(4 + hx * 24, 4 + hy * 20, j % 2 ? M : '#ffe28a'); }
    } else if (e.t === 'mareo') {
      [[6, 30], [10, 28], [14, 30]].forEach(function (q) { b.set(q[0], q[1], '#ffe28a'); b.set(q[0] + 1, q[1], '#ffe28a'); b.set(q[0], q[1] - 1, '#ffffff'); });
    }
  }

  // Una sola escritura en Canvas por hoja. Las paletas del generador son HEX.
  var cacheH = Object.create(null);
  // soloAnims (opcional): lista de animaciones a dibujar; las demás filas quedan
  // vacías. Los vecinos solo necesitan «idle», y así la hoja cuesta 9 veces menos.
  function hojaHeroe(id, paleta, soloAnims) {
    var clave = (paleta ? id + ':' + JSON.stringify(paleta) : id) + (soloAnims ? '|' + soloAnims.join(',') : '');
    if (cacheH[clave]) return cacheH[clave];
    var P = paleta || heroes[id] || heroes.galois, names = Object.keys(ANIM_HEROE);
    var filas = {}, row = 0, w = FW * 8, h = FH * names.length * DIRS.length;
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    var ctx = cv.getContext('2d');
    var datos = ctx.createImageData(w, h), aparte = [];
    names.forEach(function (a) {
      var izquierda = [];
      DIRS.forEach(function (d) {
        filas[a + '-' + d] = row;
        for (var f = 0; f < ANIM_HEROE[a].n; f++) {
          if (soloAnims && soloAnims.indexOf(a) < 0) break;
          var b = d === 'right' ? izquierda[f].mirror() : dibujarHeroe(P, a, f, d);
          if (d === 'left') izquierda[f] = b;
          var raro = false;
          for (var y = 0; y < FH && !raro; y++) {
            var pos = ((row * FH + y) * w + f * FW) * 4;
            for (var x = 0; x < FW; x++, pos += 4) {
              var c = b.p[y * FW + x]; if (!c) continue;
              var rgb = rgbaDe(c); if (!rgb) { raro = true; break; }
              datos.data[pos] = rgb[0]; datos.data[pos + 1] = rgb[1];
              datos.data[pos + 2] = rgb[2]; datos.data[pos + 3] = 255;
            }
          }
          // un fotograma con colores no HEX (paletas externas) se pinta aparte
          if (raro) aparte.push([b, f * FW, row * FH]);
        }
        row++;
      });
    });
    ctx.putImageData(datos, 0, 0);
    aparte.forEach(function (q) { ctx.clearRect(q[1], q[2], FW, FH); q[0].toCanvas(cv, q[1], q[2]); });
    return (cacheH[clave] = { canvas: cv, fw: FW, fh: FH, filas: filas, anims: ANIM_HEROE, pie: 42 });
  }

  /* =====================================================================
     ENEMIGOS (cuerpo, símbolo y ataque propios de cada concepto)
     ===================================================================== */
  var enemigos = {
    potenciator:       { forma: 'bloque', c: '#f2b632', g: 'an', ataque: ['2^', '3^', 'a^'], brazos: true },
    radicosmico:       { forma: 'espina', c: '#7a4fd0', g: 'v', ataque: ['v9', 'v4', 'v16'] },
    multiplax:         { forma: 'espina', c: '#d9483b', g: '*', ataque: ['*2', '*3', '12'] },
    primox:            { forma: 'espina', c: '#8a49c9', g: 'P', ataque: ['2', '3', '5', '7'] },
    negatron:          { forma: 'iman', c: '#d8423f', c2: '#3f6fd8', g: '-', ataque: ['-', '-3', '-7'] },
    parentesis_maldito:{ forma: 'parentesis', c: '#e0a53a', g: '()', ataque: ['(', ')', '-('] },
    denominadoron:     { forma: 'bloque', c: '#4fb0a8', g: '/', ataque: ['1/2', '3/4', '/'] , brazos: true },
    simplifract:       { forma: 'bola', c: '#f0c03c', g: '/', ataque: ['6/8', '2/4', '='] },
    senor_escala:      { forma: 'bloque', c: '#c88f52', g: ':', ataque: ['1:5', ':', 'x2'], brazos: true },
    porcentajin:       { forma: 'bola', c: '#57c25a', g: '%', ataque: ['%', '25%', '50%'] },
    incognita_x:       { forma: 'espectro', c: '#4a5ad8', g: 'x', ataque: ['x', '2x', 'x?'] },
    polinomio_mutante: { forma: 'gota', c: '#6fbf3a', g: 'x', ataque: ['x+1', '3x', '2x'] },
    equilibrius:       { forma: 'balanza', c: '#d0b45a', g: '=', ataque: ['=', '+3', '-3'] },
    despejador_oscuro: { forma: 'espectro', c: '#3a2a5a', g: '=', ataque: ['x=', '=', '-2'] },
    pendientor:        { forma: 'grafica', c: '#3aa0d8', g: '/', ataque: ['y', '/', 'm'] },
    parabola_vortice:  { forma: 'gota', c: '#d84fa0', g: 'y', ataque: ['x^', 'y', 'f'] },
    mediana_traviesa:  { forma: 'grafica', c: '#e07a3a', g: 'M', ataque: ['M', '3', '5'] },
    grafico_tramposo:  { forma: 'grafica', c: '#c43a6a', g: '?', ataque: ['?', '95', '%'] },
    dado_caotico:      { forma: 'dado', c: '#f4efe6', g: '', ataque: ['1', '6', '?'] },
    ruleta_imposible:  { forma: 'ruleta', c: '#c8323a', c2: '#202030', g: '', ataque: ['0', '1/2', 'p'] }
  };
  var ANIM_ENEMIGO = { idle: { n: 4, fps: 5, loop: true }, move: { n: 4, fps: 8, loop: true }, attack: { n: 6, fps: 10, loop: false }, hurt: { n: 3, fps: 9, loop: false }, defeat: { n: 6, fps: 8, loop: false } };

  function poseEnemigo(anim, f) {
    var q = { ox: 0, oy: 0, sx: 1, sy: 1, ojos: 'open', boca: 'n', pies: [0, 0], tint: null, disolver: 0, brazo: 0, proyectil: null };
    if (anim === 'idle') { q.sy = [1, .96, .92, .96][f]; q.sx = [1, 1.02, 1.05, 1.02][f]; if (f === 3) q.ojos = 'closed'; q.brazo = [0, 1, 2, 1][f]; }
    if (anim === 'move') { q.oy = [0, -3, -4, -1][f]; q.sy = [.88, 1.06, 1.04, .94][f]; q.sx = [1.1, .96, .98, 1.04][f]; q.pies = [[0, 0], [-1, 1], [0, 0], [1, -1]][f]; q.brazo = f; }
    if (anim === 'attack') {
      var A = [[1, 1, 1.05, .9], [3, 1, .92, .85], [-3, -2, 1.11, 1.02], [-4, 0, 1.12, .92], [-2, 0, 1.02, .98], [0, 0, 1, 1]][f];
      q.ox = A[0]; q.oy = A[1]; q.sx = A[2]; q.sy = A[3]; q.boca = f >= 2 && f <= 3 ? 'abierta' : 'n'; q.ojos = 'furia'; q.brazo = f === 1 ? 3 : f >= 2 && f <= 3 ? -2 : 0;
      if (f >= 3 && f <= 4) q.proyectil = f - 3;
    }
    if (anim === 'hurt') { q.tint = ['#ffffff', '#ff5050', null][f]; q.ox = [2, 4, 1][f]; q.sx = [1.12, .94, 1][f]; q.sy = [.86, 1.06, 1][f]; q.ojos = 'closed'; q.boca = 'abierta'; }
    if (anim === 'defeat') {
      q.ojos = 'x'; q.boca = 'abierta'; q.sx = [1.1, .85, .8, .78, .72, .66][f]; q.sy = [.9, 1.15, .82, .78, .72, .66][f];
      q.oy = [0, -2, 2, 3, 4, 5][f]; q.tint = f === 0 ? '#ffffff' : null; q.disolver = [0, 0, 0, .3, .6, .85][f];
    }
    return q;
  }

  // Siluetas en una cuadrícula local de 36×36. La pose deforma la criatura
  // completa, incluidos sus rasgos y accesorios, alrededor de su apoyo.
  function poligono(b, puntos, color) {
    var minY = Math.min.apply(null, puntos.map(function (p) { return p[1]; }));
    var maxY = Math.max.apply(null, puntos.map(function (p) { return p[1]; }));
    for (var y = minY; y <= maxY; y++) {
      var cortes = [];
      for (var i = 0; i < puntos.length; i++) {
        var a = puntos[i], d = puntos[(i + 1) % puntos.length];
        if ((a[1] > y) !== (d[1] > y)) cortes.push(a[0] + (y - a[1]) * (d[0] - a[0]) / (d[1] - a[1]));
      }
      cortes.sort(function (a, d) { return a - d; });
      for (var j = 0; j < cortes.length; j += 2) {
        var x = Math.ceil(cortes[j]);
        b.rect(x, y, Math.floor(cortes[j + 1]) - x + 1, 1, color);
      }
    }
  }

  function cuerpoEnemigo(id, E, q, f) {
    var b = new Buf(36, 36), c = E.c, l = light(c, .38), s = dark(c, .38);
    var metal = '#978ea4', blanco = '#fff3d5', oscuro = '#2b2038';
    var cara = [18, 16, 4, 'par'], giro = f + q.brazo;
    function poly(p, color) { poligono(b, p, color); }
    function glifo(t, x, y, color) { texto(b, t, x, y, color || blanco); }
    function gema(x, y, r, color) {
      poly([[x, y - r], [x + r, y], [x, y + r + 1], [x - r, y]], dark(color, .35));
      poly([[x, y - r], [x + 1, y], [x, y + r], [x - r, y]], color);
      b.line(x - r + 1, y, x, y - r + 1, light(color, .5));
    }
    function pata(x, y, d) {
      b.line(x, y, x + d * 3, 31, s, 3);
      b.rect(x + d * 3 - 1, 32, 5, 2, oscuro);
      b.rect(x + d * 3 - 1, 32, 3, 1, l);
    }
    function chispa(x, y, color) {
      b.rect(x - 1, y, 3, 1, color); b.rect(x, y - 1, 1, 3, color);
      b.set(x, y, blanco);
    }
    switch (id) {
      case 'potenciator':
        pata(11, 26 + q.pies[0], -1); pata(23, 26 + q.pies[1], 1);
        b.line(9, 17, 4, 21 + q.brazo, s, 3); b.ellipse(4, 22 + q.brazo, 3, 3, l);
        b.line(24, 16, 29, 19 - q.brazo, s, 3); b.ellipse(30, 20 - q.brazo, 3, 3, c);
        poly([[6, 12], [13, 7], [26, 7], [30, 12], [30, 25], [24, 30], [6, 27]], s);
        poly([[6, 12], [13, 9], [24, 11], [24, 29], [6, 27]], c);
        b.line(7, 13, 7, 24, l); b.line(7, 12, 22, 12, l);
        b.rect(10, 19, 10, 7, oscuro); glifo('2', 13, 20);
        gema(26, 7, 7, l); glifo('n', 27, 3, oscuro);
        cara = [15, 14, 4, 'par'];
        break;
      case 'radicosmico':
        poly([[4, 18], [9, 17], [14, 24], [20, 5], [33, 5], [32, 11], [23, 11], [16, 32], [12, 32]], s);
        b.line(5, 18, 9, 19, l, 2); b.line(9, 19, 14, 28, c, 2);
        b.line(14, 27, 21, 7, c, 3); b.rect(21, 5, 12, 2, l);
        gema(24, 19 + (f % 2), 7, c);
        chispa(8, 11, l); chispa(30, 26, l);
        cara = [24, 17 + (f % 2), 0, 'ojo'];
        break;
      case 'multiplax':
        for (var i = 0; i < 4; i++) {
          var derecha = i % 2, abajo = i > 1;
          var x = derecha ? 30 : 4, y = (abajo ? 31 : 7) + (derecha ? -q.brazo : q.brazo);
          b.line(16, 18, x, y, s, 4); b.ellipse(x + 1, y + 1, 4, 3, c);
          b.line(x - 1, y, x + 1, y - 2, l);
        }
        gema(18, 19, 10, c); glifo('*', 17, 21, l);
        cara = [18, 15, 3, 'par'];
        break;
      case 'primox':
        pata(12, 27, -1); pata(22, 27, 1);
        [[5, 8], [12, 3], [21, 2], [30, 6], [33, 16], [31, 26], [3, 24]].forEach(function (p, i) {
          poly([[17, 20], [p[0], p[1]], [p[0] + (i < 4 ? 3 : -2), p[1] + 7]], i < 3 ? l : s);
        });
        poly([[7, 13], [14, 8], [23, 9], [29, 15], [27, 27], [22, 31], [12, 30], [6, 24]], s);
        poly([[7, 13], [14, 9], [21, 10], [26, 15], [24, 25], [12, 28], [7, 23]], c);
        b.line(8, 14, 13, 11, l); glifo('2', 10, 21); glifo('3', 16, 23); glifo('5', 22, 21);
        cara = [17, 15, 4, 'par'];
        break;
      case 'negatron':
        [[8,c], [24,E.c2]].forEach(function (p, i) {
          var x = p[0], color = p[1];
          b.rect(x, 11, 8, 13, dark(color, .33)); b.rect(x, 11, 6, 13, color);
          b.rect(x, 8, 8, 4, metal); b.rect(x, 8, 6, 1, blanco);
          b.line(x, 21, 18, 31, color, 5); b.line(x, 21, 18, 30, light(color, .27));
          glifo(i ? '+' : '-', x + 1, 1 + (giro % 2), light(color, .65));
        });
        b.ellipse(19, 28, 6, 4, oscuro);
        cara = [19, 26, 3, 'par'];
        break;
      case 'parentesis_maldito':
        for (var j = 0; j < 24; j++) {
          var arco = Math.round(((j - 12) * (j - 12)) / 33);
          var iz = 5 + arco, de = 28 - arco;
          b.rect(iz, 8 + j, 3, 1, c); b.set(iz, 8 + j, l);
          b.rect(de, 8 + j, 3, 1, s); b.set(de, 8 + j, c);
        }
        gema(18, 19, 7, oscuro);
        chispa(18, 7, l); chispa(18, 30, l);
        cara = [18, 17, 0, 'ojo'];
        break;
      case 'denominadoron':
        pata(10, 27, -1); pata(24, 27, 1);
        poly([[7, 9], [12, 6], [24, 6], [28, 11], [25, 16], [10, 16]], s);
        b.rect(9, 9, 15, 6, c); b.rect(10, 9, 13, 1, l); glifo('3', 16, 10, oscuro);
        b.rect(3, 18, 30, 5, s); b.rect(4, 18, 27, 2, l);
        poly([[7, 24], [27, 24], [29, 29], [24, 31], [10, 31]], c);
        glifo('4', 16, 25, oscuro);
        b.set(5, 20, blanco); b.set(30, 20, blanco);
        cara = [17, 18, 7, 'visor'];
        break;
      case 'simplifract':
        b.ellipse(16, 26, 13, 7, s); b.ellipse(13, 24, 10, 6, c);
        b.ellipse(16, 26, 9, 2, l);
        b.ellipse(13, 17, 9, 10, s); b.ellipse(11, 16, 7, 9, c);
        b.line(6, 15, 10, 10, l, 2); glifo('/', 11, 13, oscuro);
        b.line(22, 25, 26, 13 + q.brazo, c, 2); b.line(26, 25, 31, 15 - q.brazo, s, 2);
        b.set(25, 12 + q.brazo, blanco); b.set(31, 14 - q.brazo, blanco);
        cara = [28, 22, 0, 'ojo'];
        break;
      case 'senor_escala':
        pata(11, 26, -1); pata(22, 26, 1);
        poly([[9, 13], [25, 13], [29, 30], [6, 30]], s);
        poly([[10, 13], [21, 13], [24, 29], [7, 29]], c);
        b.line(11, 17, 9, 27, l);
        b.rect(6, 9, 22, 3, s); b.rect(12, 3, 13, 7, c); b.rect(12, 3, 10, 1, l);
        b.rect(12, 7, 13, 2, oscuro);
        b.line(26, 25, 32, 11 + q.brazo, l, 3);
        for (var r = 0; r < 5; r++) b.set(32 - r, 12 + q.brazo + 3 * r, oscuro);
        glifo(':', 16, 23);
        cara = [17, 13, 4, 'par'];
        break;
      case 'porcentajin':
        b.ellipse(18, 22, 6, 10, s); b.ellipse(17, 20, 5, 8, c);
        b.line(10, 27, 25, 10, l, 3);
        b.ellipse(10, 13 - q.brazo, 6, 6, c); b.ellipse(9, 12 - q.brazo, 5, 5, l);
        b.ellipse(26, 27 + q.brazo, 6, 6, s); b.ellipse(25, 26 + q.brazo, 5, 5, c);
        b.ellipse(9, 12 - q.brazo, 2, 2, oscuro); b.ellipse(25, 26 + q.brazo, 2, 2, oscuro);
        cara = [17, 18, 0, 'ojo'];
        break;
      case 'incognita_x':
        poly([[3, 7], [9, 4], [18, 13], [27, 4], [32, 8], [23, 19], [33, 30], [26, 33], [18, 25], [10, 33], [4, 30], [13, 19]], c);
        b.line(5, 7, 15, 17, l, 2); b.line(27, 6, 21, 14, l);
        b.line(21, 23, 29, 31, s, 2); b.line(9, 31, 15, 24, s);
        gema(18, 19, 6, oscuro); chispa(31, 18 + q.brazo, l);
        cara = [18, 17, 0, 'ojo'];
        break;
      case 'polinomio_mutante':
        [8, 18, 28].forEach(function (x, i) {
          var altura = [16, 9, 21][i] + Math.round(Math.sin(giro + i) * 2);
          b.line(18, 31, x, altura, s, 4); b.line(17, 30, x - 1, altura, c, 2);
          b.ellipse(x, altura, 5, 5, c); b.set(x - 2, altura - 3, l);
          glifo(['x','+','1'][i], x - 1, altura - 2, oscuro);
        });
        b.ellipse(18, 29, 12, 5, c); b.rect(12, 33, 14, 1, s);
        cara = [18, 26, 3, 'par'];
        break;
      case 'equilibrius':
        b.rect(10, 31, 16, 3, s); b.rect(12, 30, 12, 1, l);
        b.rect(16, 10, 5, 20, c); b.rect(16, 12, 1, 17, l);
        var inclinacion = Math.max(-2, Math.min(2, q.brazo - 1));
        b.line(5, 12 + inclinacion, 31, 12 - inclinacion, s, 3);
        b.line(5, 12 + inclinacion, 31, 12 - inclinacion, l);
        [6, 29].forEach(function (x, i) {
          var y = 22 + (i ? -inclinacion : inclinacion);
          b.line(x, y - 9, x - 4, y, metal); b.line(x, y - 9, x + 4, y, metal);
          b.ellipse(x, y, 5, 2, c); b.rect(x - 4, y, 8, 1, l);
        });
        gema(18, 9, 7, c); glifo('=', 17, 23, oscuro);
        cara = [18, 7, 0, 'ojo'];
        break;
      case 'despejador_oscuro':
        poly([[5, 32], [10, 19], [10, 10], [17, 2], [24, 6], [27, 17], [31, 31], [26, 34], [21, 30], [17, 34], [12, 31]], s);
        poly([[6, 31], [11, 16], [11, 10], [17, 4], [23, 8], [25, 15], [17, 21], [15, 31]], c);
        b.line(12, 10, 17, 5, l); b.line(8, 30, 13, 21, l);
        b.ellipse(18, 13, 6, 5, oscuro); glifo('=', 17, 23, l);
        b.line(28, 30, 30, 9 + q.brazo, metal, 2); gema(30, 8 + q.brazo, 4, l);
        cara = [18, 12, 3, 'visor'];
        break;
      case 'pendientor':
        pata(9, 26, -1); pata(24, 27, 1);
        poly([[4, 27], [26, 7], [33, 7], [33, 28], [28, 32], [5, 32]], s);
        poly([[4, 27], [26, 7], [29, 8], [29, 28], [5, 30]], c);
        b.line(5, 26, 27, 7, l, 2);
        b.line(9, 27, 25, 27, oscuro); b.line(25, 27, 25, 13, oscuro);
        b.set(9, 27, blanco); b.set(25, 13, blanco);
        cara = [21, 19, 3, 'par'];
        break;
      case 'parabola_vortice':
        for (var k = 2; k <= 32; k++) {
          var py = Math.round(27 - (k - 17) * (k - 17) / 11);
          b.rect(k, py, 1, 4, k < 17 ? l : s); b.set(k, py + 1, c);
        }
        gema(17, 22, 8, c); chispa(17, 8 + q.brazo, l); chispa(17, 33, l);
        cara = [17, 20, 0, 'ojo'];
        break;
      case 'mediana_traviesa':
        [5, 18, 31].forEach(function (x, i) {
          var y = [21, 9, 15][i] + (i === 1 ? -q.brazo : q.brazo);
          b.rect(x - 3, y, 7, 30 - y, i === 1 ? c : s);
          b.rect(x - 3, y, 2, 30 - y, l);
          glifo(['3','5','7'][i], x - 1, y + 1, oscuro);
        });
        b.rect(3, 29, 31, 4, s); b.rect(4, 29, 28, 1, c);
        b.line(5, 27, 30, 26, blanco); b.set(18, 26, oscuro);
        cara = [18, 17 - q.brazo, 0, 'ojo'];
        break;
      case 'grafico_tramposo':
        pata(9, 25, -1); pata(25, 25, 1);
        poly([[4, 12], [12, 7], [29, 9], [33, 13], [32, 25], [25, 29], [5, 26]], s);
        poly([[4, 12], [12, 8], [28, 10], [28, 24], [22, 27], [5, 25]], c);
        b.line(6, 13, 13, 10, l);
        b.rect(10, 18, 4, 6, oscuro); b.rect(16, 18, 4, 6, oscuro); b.rect(22, 18, 4, 6, oscuro);
        b.rect(11, 21, 2, 2, l); b.rect(17, 19, 2, 4, l); b.rect(23, 18, 2, 5, l);
        b.line(6, 25, 27, 5 + q.brazo, blanco, 2); b.rect(24, 5 + q.brazo, 5, 2, l);
        cara = [15, 13, 4, 'visor'];
        break;
      case 'dado_caotico':
        var sesgo = [0, 3, 1, -2][f % 4];
        poly([[5, 12], [15 + sesgo, 5], [32, 8], [32, 26], [23 + sesgo, 33], [5, 29]], s);
        poly([[5, 12], [15 + sesgo, 5], [32, 8], [23 + sesgo, 15]], l);
        poly([[5, 12], [23 + sesgo, 15], [23 + sesgo, 33], [5, 29]], c);
        b.line(6, 13, 22 + sesgo, 15, blanco);
        var puntos = [[[14,22]],[[9,18],[19,26]],[[9,18],[14,22],[19,26]],[[9,18],[18,19],[9,25],[18,26]]];
        puntos[(f + (q.ojos === 'furia' ? 2 : 0)) % 4].forEach(function (p) {
          b.rect(p[0], p[1], 2, 2, oscuro); b.set(p[0], p[1], '#985055');
        });
        b.line(16 + sesgo, 9, 21 + sesgo, 9, metal); b.set(25, 22, blanco); b.set(28, 16, blanco);
        cara = null;
        break;
      case 'ruleta_imposible':
        b.rect(14, 27, 9, 6, s); b.rect(10, 32, 16, 2, c);
        b.ellipse(18, 18, 15, 13, '#81552b'); b.ellipse(17, 17, 14, 12, '#edc267');
        for (var y = -10; y <= 10; y++) for (var x = -12; x <= 12; x++) {
          if (x * x / 144 + y * y / 100 > 1) continue;
          var sector = Math.floor((Math.atan2(y, x) / Math.PI + 1) * 6 + giro / 2);
          b.set(17 + x, 17 + y, sector % 2 ? c : E.c2);
        }
        gema(17, 17, 5, '#dca65b');
        poly([[14, 2], [21, 2], [17, 10]], blanco);
        chispa(26, 23, l);
        cara = [17, 16, 0, 'ojo'];
        break;
    }
    if (cara) caraEnemigo(b, q, cara);
    return b;
  }

  function caraEnemigo(b, q, cara) {
    var x = cara[0], y = cara[1], sep = cara[2], tipo = cara[3];
    var luz = q.ojos === 'furia' ? '#ffab69' : '#fff3d5', pupila = '#25192f';
    var centros = sep ? [x - sep, x + sep] : [x];
    centros.forEach(function (ex) {
      if (q.ojos === 'x') {
        b.line(ex - 1, y, ex + 1, y + 2, pupila);
        b.line(ex + 1, y, ex - 1, y + 2, pupila);
      } else if (q.ojos === 'closed') b.rect(ex - 1, y + 1, 3, 1, pupila);
      else if (tipo === 'visor') {
        b.rect(ex - 2, y, 5, 2, pupila);
        b.rect(ex - 1, y, 3, 1, luz);
      } else {
        b.ellipse(ex, y + 1, tipo === 'ojo' ? 3 : 2, 2, pupila);
        b.rect(ex - 1, y, 2, 2, luz);
        b.set(ex + (q.ojos === 'furia' ? -1 : 1), y + 1, pupila);
        if (q.ojos === 'furia') b.line(ex - 2, y - 1, ex + 1, y, pupila);
      }
    });
    if (tipo === 'par') {
      b.rect(x - 2, y + 4, 5, q.boca === 'abierta' ? 3 : 1, pupila);
      if (q.boca === 'abierta') b.set(x - 1, y + 4, luz);
    }
  }

  function colocarEnemigo(b, local, q, base, escala) {
    var sx = q.sx * escala, sy = q.sy * escala;
    var cx = Math.round(b.w / 2 + q.ox), pie = Math.round(base + q.oy);
    for (var y = 0; y < b.h; y++) for (var x = 0; x < b.w; x++) {
      var color = local.get(18 + Math.round((x - cx) / sx), 33 + Math.round((y - pie) / sy));
      if (color) b.set(x, y, color);
    }
    return { cx: cx, cy: Math.round(pie - 15 * sy), y0: Math.round(pie - 31 * sy), x0: Math.round(cx - 15 * sx), w: Math.round(30 * sx) };
  }

  var FASES_JEFE = [
    { tinte: '#bb893c', metal: '#eabc61', luz: '#fff0b4', sombra: '#815238', aura: '#847357', cuernos: 0, motas: 5 },
    { tinte: '#e05429', metal: '#ec7846', luz: '#ffdb8b', sombra: '#793542', aura: '#cf573f', cuernos: 10, motas: 12 },
    { tinte: '#7139b4', metal: '#a271eb', luz: '#e9c9ff', sombra: '#4d276e', aura: '#9857da', cuernos: 15, motas: 21 }
  ];

  function coronaJefe(b, G, fase, F) {
    var x = G.cx, y = 11;
    // La corona sigue la parte más alta del cuerpo, dejando espacio para sus puntas.
    for (var j = Math.max(2, G.y0 - 5); j < G.cy; j++) {
      if (b.get(x - 3, j) || b.get(x, j) || b.get(x + 3, j)) { y = j; break; }
    }
    y = Math.max(fase === 3 ? 11 : 8, y + 1);
    if (F.cuernos) {
      [-1, 1].forEach(function (d) {
        var hombro = x + d * 6, punta = x + d * F.cuernos, alto = fase === 3 ? 11 : 7;
        poligono(b, [[hombro, y + 3], [hombro + d * 4, y - 1], [punta + d * 3, y - alto + 6], [punta, y - alto], [punta, y - 1], [hombro, y + 6]], F.sombra);
        b.line(hombro, y + 2, punta, y - alto, F.metal, 2);
        b.line(hombro + d * 2, y - 2, punta, y - alto, F.luz);
        if (fase === 3) b.line(hombro + d * 4, y + 2, punta + d * 4, y - 3, F.metal, 2);
      });
    }
    poligono(b, [[x - 8, y - 5], [x - 5, y - 2], [x, y - 7], [x + 5, y - 2], [x + 8, y - 5], [x + 7, y + 3], [x - 7, y + 3]], F.metal);
    b.rect(x - 7, y + 2, 15, 1, F.sombra);
    b.line(x - 7, y - 1, x - 5, y + 1, F.luz);
    b.ellipse(x, y, 2, 2, F.sombra); b.set(x - 1, y - 1, F.luz);
    b.set(x + 5, y + 1, F.luz);
  }

  function auraJefe(b, G, fase, F, f) {
    var pulso = [0, 1, 2, 1][f % 4], cx = G.cx, cy = 34;
    for (var i = 0; i < F.motas; i++) {
      var a = (i + f * .42) / F.motas * Math.PI * 2;
      var rx = 26 - i % 3 + pulso, ry = 22 - i % 4 + pulso;
      var x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
      b.set(x, y, i % 3 ? F.aura : F.luz);
      if (fase > 1) b.set(x - Math.sin(a), y + Math.cos(a), F.sombra);
      if (fase === 3 && i % 4 === 0) {
        b.line(x, y - 2, x, y + 2, F.aura);
        b.set(x, y, F.luz);
      }
    }
    if (fase > 1) {
      for (var k = 0; k < 54; k++) {
        if ((k + f * 2) % 11 > (fase === 3 ? 6 : 3)) continue;
        var angulo = k * Math.PI * 2 / 54;
        b.set(cx + Math.cos(angulo) * (29 + pulso), cy + Math.sin(angulo) * 26, F.sombra);
      }
    }
  }

  function dibujarEnemigo(id, anim, f, opt) {
    opt = opt || {};
    if (!enemigos[id]) id = 'primox';
    var E = Object.assign({}, enemigos[id]);
    var fase = opt.fase || 1, jefe = !!opt.jefe;
    var F = FASES_JEFE[fase - 1] || FASES_JEFE[0];
    if (jefe) {
      E.c = mix(E.c, F.tinte, fase === 1 ? .24 : .72);
      if (E.c2) E.c2 = mix(E.c2, F.sombra, .65);
    }
    var S = jefe ? 64 : 40, base = S - 3;
    var b = new Buf(S, S), q = poseEnemigo(anim, f);
    if (jefe && anim === 'idle') {
      q.sy = [1, .97, .92, .97][f];
      q.sx = [1, 1.03, 1.07, 1.03][f];
      q.ojos = fase > 1 ? 'furia' : 'open';
    }
    var G = colocarEnemigo(b, cuerpoEnemigo(id, E, q, f), q, base, jefe ? 1.43 : .94);
    if (jefe) coronaJefe(b, G, fase, F);
    b.outline();
    if (jefe && anim !== 'defeat') {
      var aura = new Buf(S, S);
      auraJefe(aura, G, fase, F, f);
      aura.paste(b, 0, 0);
      b = aura;
    }
    if (q.proyectil !== null) {
      var tok = E.ataque[f % E.ataque.length];
      texto(b, tok, Math.max(1, G.x0 - anchoTexto(tok) - 2), G.cy - 5 - q.proyectil * 6, '#fffbe8');
    }
    if (q.tint) {
      var colores = Object.create(null);
      b.map(function (c) { return colores[c] || (colores[c] = mix(c, q.tint, .66)); });
    }
    if (q.disolver) {
      // Bloques pequeños salen del cuerpo según la textura inicial.
      var restos = [], paso = f - 2;
      b.map(function (c, indice) {
        var x = indice % S, y = (indice / S) | 0;
        var azar = hash(x >> 1, y >> 1, 3);
        if (azar >= q.disolver) return c;
        if (azar < .19 && c !== OUT) restos.push([x, y, c, azar]);
        return null;
      });
      restos.forEach(function (p) {
        var vx = p[0] < G.cx ? -1 : 1;
        b.set(p[0] + vx * paso * (2 + p[3] * 9), p[1] - paso * (1 + p[3] * 7), light(p[2], .24));
      });
    }
    return b;
  }

  var cacheE = {};
  function hojaEnemigo(id, opt) {
    opt = opt || {}; var key = id + (opt.jefe ? ':j' + (opt.fase || 1) : '');
    if (cacheE[key]) return cacheE[key];
    var names = Object.keys(ANIM_ENEMIGO), S = opt.jefe ? 64 : 40, filas = {};
    var cv = document.createElement('canvas'); cv.width = S * 6; cv.height = S * names.length;
    names.forEach(function (a, row) { filas[a + '-left'] = row; for (var f = 0; f < ANIM_ENEMIGO[a].n; f++) dibujarEnemigo(id, a, f, opt).toCanvas(cv, f * S, row * S); });
    return (cacheE[key] = { canvas: cv, fw: S, fh: S, filas: filas, anims: ANIM_ENEMIGO, pie: S - 3 });
  }

  /* ---------- Reproducción ---------- */
  function indice(hoja, anim, t) {
    var A = hoja.anims[anim]; if (!A) return 0;
    var i = Math.floor(t * A.fps);
    return A.loop ? i % A.n : Math.min(i, A.n - 1);
  }
  function pintar(ctx, hoja, anim, dir, i, x, y, k) {
    var row = hoja.filas[anim + '-' + dir]; if (row == null) row = hoja.filas[anim + '-left'] || 0;
    k = k || 1;
    ctx.drawImage(hoja.canvas, i * hoja.fw, row * hoja.fh, hoja.fw, hoja.fh, Math.round(x - hoja.fw * k / 2), Math.round(y - hoja.pie * k), hoja.fw * k, hoja.fh * k);
  }
  function duracion(hoja, anim) { var A = hoja.anims[anim]; return A ? A.n / A.fps : 0; }

  root.GaloisSprites = {
    Buf: Buf, mix: mix, dark: dark, light: light, hash: hash, texto: texto, anchoTexto: anchoTexto, OUT: OUT,
    heroes: heroes, enemigos: enemigos, ANIM_HEROE: ANIM_HEROE, ANIM_ENEMIGO: ANIM_ENEMIGO, DIRS: DIRS,
    dibujarHeroe: dibujarHeroe, dibujarEnemigo: dibujarEnemigo, hojaHeroe: hojaHeroe, hojaEnemigo: hojaEnemigo,
    indice: indice, pintar: pintar, duracion: duracion
  };
})(window);
