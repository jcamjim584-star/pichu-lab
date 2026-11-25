/* =====================================================================
   GALOIS LEGACY · retos matemáticos de las 50 aventuras
   ---------------------------------------------------------------------
   Basados en coleccion/BIBLIA_50_AVENTURAS.md. Cada generador devuelve:
     { texto, respuesta, distractores[], explicacion, pista, numerica, visual }
   dif: 0 Explorador · 1 Aventurero · 2 Maestro.
   fase (solo jefes, etapa 5): 1 descubrir la regla · 2 resolver · 3 explicar y transferir.
   Se pueden comprobar en Node: node pruebas/retos.test.js
   ===================================================================== */
(function (root) {
  'use strict';
  var R = Math.random;
  function ri(a, b) { return a + Math.floor(R() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(R() * a.length)]; }
  function mcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function mcm(a, b) { return a / mcd(a, b) * b; }
  function esPrimo(n) { if (n < 2) return false; for (var i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
  function z(n) { return n < 0 ? '−' + Math.abs(n) : String(n); }          // entero con signo menos tipográfico
  function zp(n) { return n < 0 ? '(−' + Math.abs(n) + ')' : String(n); }   // entre paréntesis si es negativo
  function fr(a, b) { var g = mcd(a, b); a /= g; b /= g; if (b < 0) { a = -a; b = -b; } return b === 1 ? z(a) : z(a) + '/' + b; }
  function sup(n) { return String(n).split('').map(function (d) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]; }).join(''); }
  function miles(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function fact(n) { if (n !== Math.floor(n) || n < 2) return String(n); var f = {}, d = 2; while (n > 1) { while (n % d === 0) { f[d] = (f[d] || 0) + 1; n /= d; } d++; } return Object.keys(f).map(function (p) { return f[p] > 1 ? p + sup(f[p]) : p; }).join('·'); }
  function valor(s) { s = String(s).replace(/−/g, '-').replace(/\s/g, '').replace(',', '.'); var m = s.match(/^(-?\d+(?:\.\d+)?)(?:\/(-?\d+))?$/); if (!m) return null; return m[2] ? +m[1] / +m[2] : +m[1]; }
  function igual(a, b) { var x = valor(a), y = valor(b); if (x !== null && y !== null) return Math.abs(x - y) < 1e-9; return String(a).trim() === String(b).trim(); }
  var SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  function vecinos(r) {
    var v = valor(r), out = [];
    if (v !== null) {
      var m = String(r).replace(/−/g, '-').match(/^(-?\d+)\/(\d+)$/);
      if (m) { var a = +m[1], b = +m[2]; out = [fr(a + 1, b), fr(a, b + 1), fr(Math.max(1, a - 1), b), fr(a + 1, b + 1), fr(a * 2, b)]; }
      else out = [v + 1, v - 1, v + 2, v * 2, v + 10].map(function (x) { return z(Math.round(x * 100) / 100); });
    } else {
      var p = String(r).match(new RegExp('^(\\d+)([' + SUP + ']+)$'));
      if (p) { var e = +p[2].split('').map(function (c) { return SUP.indexOf(c); }).join(''); out = [p[1] + sup(e + 1), p[1] + sup(Math.max(1, e - 1)), p[1] + sup(e + 2)]; }
    }
    return out;
  }
  function q(texto, respuesta, distractores, explicacion, pista, extra) {
    var r = String(respuesta), ds = [];
    function add(d) { d = String(d); if (!igual(d, r) && !ds.some(function (x) { return igual(x, d); })) ds.push(d); }
    distractores.forEach(add);
    if (ds.length < 2) vecinos(r).forEach(function (d) { if (ds.length < 3) add(d); });
    var o = { texto: texto, respuesta: r, distractores: ds.slice(0, 5), explicacion: explicacion, pista: pista };
    for (var k in extra || {}) o[k] = extra[k];
    return o;
  }
  function num(texto, n, cerca, explicacion, pista, extra) {
    var ds = [], tries = 0; cerca = cerca || [];
    cerca.forEach(function (d) { if (d !== n && ds.indexOf(d) < 0) ds.push(d); });
    while (ds.length < 5 && tries++ < 60) { var d = n + pick([-3, -2, -1, 1, 2, 3, 10, -10]) * (Math.abs(n) > 40 ? ri(1, 3) : 1); if (d !== n && ds.indexOf(d) < 0) ds.push(d); }
    return q(texto, z(n), ds.map(z), explicacion, pista, Object.assign({ numerica: true }, extra || {}));
  }

  var G = {};
  /* ===================== MUNDO 1 · Fuentes de Andalucía: naturales, potencias y raíces ====
     El capítulo recorre el patio del IES, la Forja de los Alarifes, el Silo y la calle
     Carrera (estas dos en cualquier orden) y termina en la Compuerta del Revés, en la
     Fuente de la Reina. Cada etapa conserva el número ancla del guion (49, 68, 3×4,
     30, 16, 9) y añade variantes del mismo tipo para que no se gane memorizando. */
  G['1-1'] = function (d) {
    if (R() < .45) {
      var k0 = d === 0 ? ri(2, 5) : ri(3, 7), n0 = k0 * k0;
      return num('Inés te da ' + n0 + ' azulejos para un paño cuadrado de la maqueta. ¿Cuántos azulejos lleva cada lado?', k0, [k0 + 1, k0 - 1, k0 * 2], 'Un cuadrado de ' + n0 + ' azulejos tiene ' + k0 + ' por lado, porque ' + k0 + '·' + k0 + ' = ' + n0 + '. Es la raíz cuadrada de ' + n0 + '.', '¿Qué número multiplicado por sí mismo da ' + n0 + '?');
    }
    var base = ri(100, 900) * 1000, a = base + ri(0, 9) * 100 + ri(0, 9) * 10 + ri(0, 9), digs = String(a).split('');
    var p = digs.length - 3 + ri(0, 1), v = [a], tries = 0;
    while (v.length < 3 && tries++ < 50) { var dd = digs.slice(); var x = ri(0, 9); dd[p] = x; dd[p + 1] = ri(0, 9); var n = +dd.join(''); if (v.indexOf(n) < 0) v.push(n); }
    var s = v.slice().sort(function (x, y) { return x - y; }), f = function (arr) { return arr.map(miles).join(' < '); };
    var perms = [[0, 2, 1], [1, 0, 2], [2, 1, 0], [1, 2, 0], [2, 0, 1]].map(function (pp) { return f(pp.map(function (i) { return s[i]; })); });
    if (d === 0) return q('Las piezas de la conducción están numeradas: ' + v.map(miles).join(', ') + '. ¿Cuál lleva el número MAYOR?', miles(s[2]), [miles(s[0]), miles(s[1])], 'Se comparan las cifras de izquierda a derecha. Las primeras coinciden; decide la primera cifra distinta: ' + miles(s[2]) + '.', 'Fíjate en la primera cifra en la que se diferencian.');
    return q('Ordena de menor a mayor las piezas de la maqueta: ' + v.map(miles).join(', '), f(s), perms, 'Comparamos cifra a cifra desde la izquierda (centenas de millar, decenas de millar...). La primera cifra distinta decide: ' + f(s) + '.', 'Las cifras de la izquierda valen más. Busca la primera posición en la que cambian.');
  };
  G['1-2'] = function (d) {
    var r = R();
    if (r < .32) return q('El paño del taller lleva 49 azulejos y tiene que quedar cuadrado. ¿Cómo se colocan?', '7 filas de 7', ['6 filas de 8', '8 filas de 6', '9 filas de 7', '7 filas de 9'], 'Un paño cuadrado necesita tantas filas como columnas: √49 = 7, así que 7 filas de 7, porque 7² = 49. El diablillo de barro había desplazado una hilera.', '¿Qué número multiplicado por sí mismo da 49?');
    if (r < .6) { var b = ri(2, 5), e = ri(3, 4 + d); return q('Potenciator dice que ' + b + sup(e) + ' es una suma. ¿Cómo se escribe realmente como producto?', Array(e).fill(b).join('·'), [b + '·' + e, Array(b).fill(e).join('·'), Array(e).fill(b).join('+')], 'Una potencia es un producto de factores iguales: la base (' + b + ') se multiplica por sí misma tantas veces como indica el exponente (' + e + ').', 'El exponente cuenta cuántas veces se repite la base como factor.'); }
    var b2 = d === 0 ? ri(2, 3) : ri(2, 5), e2 = d === 0 ? ri(2, 4) : ri(3, 5); if (b2 >= 4) e2 = Math.min(e2, 4); var v = Math.pow(b2, e2);
    return num('Alonso marca en el papel un paño de ' + b2 + sup(e2) + ' azulejos. ¿Cuántos azulejos son?', v, [b2 * e2, Math.pow(b2, e2 - 1), Math.pow(e2, b2)], b2 + sup(e2) + ' = ' + Array(e2).fill(b2).join('·') + ' = ' + v + '. No es ' + b2 + '·' + e2 + ' = ' + b2 * e2 + '.', 'Multiplica ' + b2 + ' por sí mismo ' + e2 + ' veces.');
  };
  G['1-3'] = function (d) {
    var rr = R();
    if (rr < .3) return num('La báscula del Silo: pasan 5 vagonetas con 12 sacos cada una y se apuntan las 8 entregas del patio. ¿Cuánto debe marcar?', 68, [60, 65, 72, 25], '5 vagonetas · 12 sacos = 60 sacos. Con las 8 entregas del patio: 60 + 8 = 68. Primero el producto y después la suma.', 'Cuenta por grupos: 5 grupos de 12 y luego añade las 8 entregas.');
    if (rr < .62) { var vg = ri(3, d ? 9 : 6), sc = ri(8, d ? 15 : 12), ex = ri(2, 12), t = vg * sc + ex;
      return num('Lola apunta ' + vg + ' vagonetas de ' + sc + ' sacos y ' + ex + ' sacos sueltos. ¿Cuánto marca la báscula?', t, [vg * sc, vg + sc + ex, (vg + ex) * sc], vg + '·' + sc + ' = ' + vg * sc + ' sacos en las vagonetas; con los ' + ex + ' sueltos, ' + vg * sc + ' + ' + ex + ' = ' + t + '. Conviene ver el subtotal antes de enviar.', 'Primero los grupos (multiplica) y después la suma.'); }
    var b = ri(2, 7), m = ri(2, 6), n = ri(2, 6);
    if (d === 2 && R() < .5) { var M = m + n; return q('Para repartir la carga del almacén: ¿cómo se simplifica ' + b + sup(M) + ' : ' + b + sup(n) + '?', b + sup(m), [b + sup(M + n), b + sup(Math.round(M / n) || 1) , '1' + sup(m)], 'Al dividir potencias de la misma base se conserva la base y se RESTAN los exponentes: ' + M + ' − ' + n + ' = ' + m + '.', 'Misma base: en la división, los exponentes se restan.'); }
    if (d >= 1 && R() < .3) return q('Una torre de sacos: ¿cómo se simplifica (' + b + sup(m) + ')' + sup(n) + '?', b + sup(m * n), [b + sup(m + n), (b * n) + sup(m), b + sup(Math.pow(m, n) > 99 ? m + n + 1 : Math.pow(m, n))], 'Potencia de una potencia: se conserva la base y se MULTIPLICAN los exponentes: ' + m + '·' + n + ' = ' + m * n + '.', 'Es repetir ' + n + ' veces el bloque ' + b + sup(m) + '.');
    return q('Los sacos se apilan en bloques iguales: ¿cómo se simplifica ' + b + sup(m) + '·' + b + sup(n) + '?', b + sup(m + n), [b + sup(m * n), (b * b) + sup(m + n), (2 * b) + sup(m * n)], 'Al multiplicar potencias de la misma base se conserva la base y se SUMAN los exponentes: ' + m + ' + ' + n + ' = ' + (m + n) + '.', 'Cuenta cuántos factores ' + b + ' hay en total.');
  };
  G['1-4'] = function (d) {
    var rc = R();
    if (rc < .26) return q('La Máscara del Reverso habla en falsete. ¿En qué te fijas para reconocerla?', 'En la colcha de cuadros y en la pausa tras el tercer paso', ['En su voz, que suena distinta', 'En lo que ella cuenta de sí misma', 'En el color de los farolillos'], 'La voz está cambiada a propósito: no sirve como pista. Lo que se puede observar es la ropa (la colcha de cuadros) y su manera de andar (la pausa después del tercer paso).', 'Fíjate en lo que puedes ver, no en lo que oyes.');
    if (rc < .5) return num('Acompañas la copla de la murga con 3 grupos de 4 pulsos. ¿Cuántos pulsos das en total?', 12, [7, 9, 16, 34], '3 grupos de 4 pulsos son 3·4 = 12. Multiplicar es sumar grupos iguales: 4 + 4 + 4 = 12.', 'Suma 4 tres veces o multiplica 3·4.');
    if (rc < .74) { var bj = d === 0 ? ri(4, 6) : ri(5, 8), pb = 4, tt = bj * pb;
      return num('En la Carrera se reparten ' + tt + ' entornaos en bandejas de ' + pb + '. ¿Cuántas bandejas salen?', bj, [tt - pb, pb, tt], tt + ' : ' + pb + ' = ' + bj + ' bandejas. Repartir en grupos iguales es dividir.', '¿Cuántas veces cabe ' + pb + ' en ' + tt + '?'); }
    var k = d === 0 ? ri(3, 9) : d === 1 ? ri(6, 13) : ri(11, 20), n = k * k;
    if (R() < .5) return num('El tablao de la Carrera es un cuadrado de ' + n + ' baldosas. ¿Cuántas baldosas mide cada lado?', k, [k + 1, k - 1, k * 2], 'El lado de un cuadrado es la raíz cuadrada de su superficie: √' + n + ' = ' + k + ', porque ' + k + '·' + k + ' = ' + n + '.', '¿Qué número multiplicado por sí mismo da ' + n + '?');
    return num('Descifra la medida cosida al forro del plano: √' + n + ' = ?', k, [k + 1, k - 1, k * 2], '√' + n + ' = ' + k + ' porque ' + k + '² = ' + n + '. La raíz cuadrada «deshace» el cuadrado.', 'Busca un número que al cuadrado dé ' + n + '.');
  };
  G['1-5'] = function (d, fase) {
    if (fase === 1) return pick([
      function () { return q('La Compuerta del Revés escribe 4² + √81. ¿Qué se calcula PRIMERO?', 'Las potencias y las raíces', ['La suma', 'Lo que esté más a la izquierda', 'Da igual el orden'], 'Jerarquía de operaciones: paréntesis → potencias y raíces → multiplicaciones y divisiones → sumas y restas.', 'Recuerda el orden: paréntesis, potencias y raíces, productos, sumas.'); },
      function () { return q('La rueda de entrada suma y resta fichas: 36 + 18 − 24. ¿Cómo se resuelve?', 'De izquierda a derecha: primero la suma y después la resta', ['Primero la resta, que manda más', 'Primero 18 − 24 y luego se suma 36', 'En cualquier orden, porque siempre da lo mismo'], 'Sumas y restas tienen la misma prioridad: se hacen en el orden en que aparecen, de izquierda a derecha. Aquí 36 + 18 = 54 y 54 − 24 = 30.', 'Suma y resta están al mismo nivel: de izquierda a derecha.'); }
    ])();
    if (fase === 2) {
      var rf = R();
      if (rf < .34) { var ini = d === 0 ? 36 : ri(30, 48), lleg = ri(10, 20), gast = ri(12, 26), res = ini + lleg - gast;
        return num('Rueda de entrada: el mecanismo empieza con ' + ini + ' fichas, llegan ' + lleg + ' y se consumen ' + gast + '. ¿Cuántas quedan?', res, [ini - lleg + gast, ini + lleg + gast, lleg + gast], ini + ' + ' + lleg + ' = ' + (ini + lleg) + ' y ' + (ini + lleg) + ' − ' + gast + ' = ' + res + '. Se opera de izquierda a derecha, como en una recta numérica.', 'Primero lo que llega y después lo que se consume.'); }
      if (rf < .67) { var L = d === 0 ? 4 : ri(3, 7);
        return num('Tramo central: ' + L + ' filas de ' + L + ' azulejos forman el fondo del canal. Escríbelo como potencia y calcúlalo.', L * L, [L * 2, L * L * L, L + L], L + ' filas de ' + L + ' azulejos es ' + L + '² = ' + L + '·' + L + ' = ' + L * L + '. El exponente 2 indica un cuadrado.', 'Dibuja la cuadrícula de ' + L + ' × ' + L + '.'); }
      var kk = d === 0 ? 9 : pick([7, 8, 9, 11, 12]), nn = kk * kk;
      return num('Rueda de salida: con ' + nn + ' losas se cubre una plataforma cuadrada. ¿Cuántas losas hay por lado?', kk, [kk + 1, kk - 1, kk * 2], '√' + nn + ' = ' + kk + ', porque ' + kk + '² = ' + nn + '. La raíz cuadrada deshace el cuadrado.', 'Prueba lados y mira cuánto sobra o falta.');
    }
    var lado = pick([6, 7, 8, 9, 10]), j = ri(2, 3), area = lado * lado, juntas = Math.pow(2, j);
    return num('Transfiere: el abrevadero es un cuadrado de ' + area + ' losas y la compuerta tiene 2' + sup(j) + ' juntas. ¿Cuánto suman el lado del abrevadero y el número de juntas?', lado + juntas, [area + juntas, lado + 2 * j, lado * juntas], '√' + area + ' = ' + lado + ' y 2' + sup(j) + ' = ' + juntas + '; después ' + lado + ' + ' + juntas + ' = ' + (lado + juntas) + '. Primero raíces y potencias, después la suma.', 'Lado = raíz de las losas. Juntas = potencia. Luego suma.');
  };

  /* ===================== MUNDO 2 · Divisibilidad ===================== */
  var CRIT = { 2: 'termina en cifra par', 3: 'la suma de sus cifras es múltiplo de 3', 5: 'termina en 0 o en 5', 9: 'la suma de sus cifras es múltiplo de 9', 10: 'termina en 0' };
  function sumaCifras(n) { return String(n).split('').reduce(function (s, c) { return s + +c; }, 0); }
  G['2-1'] = function (d) {
    var div = pick(d === 0 ? [2, 5, 10] : [3, 9, 5, 2]), si = R() < .5, n;
    do { n = ri(d === 0 ? 20 : 100, d === 2 ? 9999 : 999); } while ((n % div === 0) !== si);
    var exp = 'Un número es divisible entre ' + div + ' si ' + CRIT[div] + '. ' + (div === 3 || div === 9 ? 'Aquí ' + String(n).split('').join(' + ') + ' = ' + sumaCifras(n) + ', ' : '') + (si ? 'así que ' + n + ' SÍ es divisible: ' + n + ' : ' + div + ' = ' + n / div + '.' : 'así que ' + n + ' NO es divisible entre ' + div + '.');
    return q('La Puerta de Sevilla solo deja pasar grupos de ' + n + ' viajeros si se pueden repartir en filas de ' + div + '. ¿' + n + ' es divisible entre ' + div + '?', si ? 'Sí' : 'No', [si ? 'No' : 'Sí', 'Solo si es par'], exp, 'Criterio del ' + div + ': ' + CRIT[div] + '.');
  };
  G['2-2'] = function (d) {
    var primos = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97], comps = [21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93, 99, 15, 25, 35, 45, 55];
    var p = pick(d === 0 ? primos.slice(0, 8) : primos), cs = []; while (cs.length < 4) { var c = pick(comps); if (cs.indexOf(c) < 0) cs.push(c); }
    var expl = cs.slice(0, 3).map(function (c) { for (var k = 3; k < c; k++) if (c % k === 0) return c + ' = ' + k + '·' + c / k; return c; }).join('; ');
    return q('Múltiplax ha colado números intrusos. ¿Cuál de estos números es PRIMO?', p, cs.map(String), 'Un número primo solo tiene dos divisores: 1 y él mismo. ' + p + ' no se puede dividir exactamente entre ningún número menor que él (salvo 1). En cambio: ' + expl + '.', 'Prueba a dividir entre 3, 7 y 11: los compuestos se «rompen».');
  };
  G['2-3'] = function (d) {
    var pool = d === 0 ? [12, 18, 20, 28, 30, 45, 50] : d === 1 ? [36, 48, 60, 72, 84, 90, 100] : [120, 126, 150, 168, 180, 196, 210, 252];
    var n = pick(pool), ok = fact(n), m1 = fact(n * 2), m2 = fact(n % 2 ? n * 3 : n / 2), sp = n % 2 ? 5 : 2;
    var bad = ok.replace(/·/, '+');
    return q('Recompón la muralla con piedras-factores. ¿Cuál es la descomposición en factores primos de ' + n + '?', ok, [m1, m2, bad, String(n / sp) + '·' + sp], 'Dividimos sucesivamente entre primos (2, 3, 5, 7...) hasta llegar a 1: ' + n + ' = ' + ok + '. Todos los factores deben ser primos: por eso no vale «' + (n / sp) + '·' + sp + '», porque ' + n / sp + ' no es primo.', 'Empieza dividiendo entre 2 todas las veces que puedas, luego entre 3...');
  };
  G['2-4'] = function (d) {
    var g = pick(d === 0 ? [2, 3, 4, 5] : [4, 6, 8, 9, 12]), a, b; do { a = g * ri(2, 6); b = g * ri(2, 7); } while (a === b || mcd(a, b) !== g);
    return num('Dos guardias de Carmona hacen grupos de ' + a + ' y de ' + b + ' piedras. Para sincronizar los engranajes necesitan el MCD(' + a + ', ' + b + '). ¿Cuál es?', g, [mcm(a, b), g * 2, Math.min(a, b), 1], 'Divisores comunes de ' + a + ' y ' + b + ': el mayor de todos es ' + g + '. Con factores: ' + a + ' = ' + fact(a) + ', ' + b + ' = ' + fact(b) + '; el MCD toma los factores COMUNES con el menor exponente.', 'Busca el número más grande que divide a los dos.');
  };
  G['2-5'] = function (d, fase) {
    if (fase === 1) return pick([
      function () { return q('Dos campanas suenan cada 12 y cada 18 minutos. Para saber CUÁNDO vuelven a sonar juntas, ¿qué calculamos?', 'El mcm', ['El MCD', 'La suma 12 + 18', 'La resta 18 − 12'], 'Buscamos el primer múltiplo común (un momento futuro en que coinciden): eso es el mínimo común múltiplo.', '¿Buscamos un número que divide o un número al que se llega contando de 12 en 12 y de 18 en 18?'); },
      function () { return q('Queremos cortar cintas de 24 y 36 cm en trozos iguales lo más largos posible. ¿Qué calculamos?', 'El MCD', ['El mcm', 'El producto 24·36', 'La suma 24 + 36'], 'El trozo debe DIVIDIR a las dos longitudes y ser el mayor posible: máximo común divisor.', 'El trozo tiene que caber un número exacto de veces en cada cinta.'); }
    ])();
    if (fase === 2) { var a = pick([4, 6, 8, 9, 10, 12, 15]), b; do { b = pick([6, 8, 9, 10, 12, 14, 15, 18, 20]); } while (b === a); var m = mcm(a, b); return num('Rompe el sello: mcm(' + a + ', ' + b + ') = ?', m, [a * b, mcd(a, b), m * 2, a + b], 'Múltiplos de ' + a + ': ' + [1, 2, 3, 4, 5, 6].map(function (k) { return a * k; }).join(', ') + '... El primero que también es múltiplo de ' + b + ' es ' + m + '. Con factores: comunes y no comunes con el mayor exponente.', 'Escribe los múltiplos de ' + Math.max(a, b) + ' y busca el primero que sea múltiplo de ' + Math.min(a, b) + '.'); }
    var x = pick([10, 12, 15]), y = pick([20, 18, 25]), mm = mcm(x, y);
    return num('Un autobús sale de Carmona cada ' + x + ' minutos y otro cada ' + y + '. Salen juntos a las 9:00. ¿Cuántos minutos después vuelven a coincidir?', mm, [mcd(x, y), x * y, x + y], 'Coincidir de nuevo = primer múltiplo común: mcm(' + x + ', ' + y + ') = ' + mm + ' minutos.', 'Es un problema de «volver a coincidir».');
  };

  /* ===================== MUNDO 3 · Números enteros ===================== */
  G['3-1'] = function (d) {
    var a = -ri(1, 12), b = d === 0 ? ri(-12, 6) : -ri(1, 12); while (b === a) b = -ri(1, 15);
    var mayor = Math.max(a, b);
    return q('El ascensor mágico de la torre se para en las plantas ' + z(a) + ' y ' + z(b) + '. ¿Cuál está MÁS ALTA?', z(mayor), [z(Math.min(a, b)), 'Están a la misma altura'], 'En la recta numérica, está más arriba (es mayor) el número situado más a la derecha. Entre negativos, es mayor el que está más cerca del cero: ' + z(mayor) + ' > ' + z(Math.min(a, b)) + '.', 'Piensa en un termómetro: ¿hace más frío a −7 °C o a −3 °C?');
  };
  G['3-2'] = function (d) {
    var a = ri(-9, 9) || 4, b = -ri(2, 12), r = a + b;
    if (d >= 1 && R() < .5) { a = -ri(2, 15); b = -ri(2, 9); r = a + b; }
    return num('Negatrón cambia los pedidos. Calcula ' + z(a) + ' ' + (b < 0 ? '− ' + Math.abs(b) : '+ ' + b) + ' = ?', r, [a - b, -r, Math.abs(a) + Math.abs(b)], (a < 0 && b < 0 ? 'Dos números del mismo signo: se suman sus valores absolutos y se pone el signo común: ' : 'Signos distintos: se restan los valores absolutos y se pone el signo del de mayor valor absoluto: ') + z(r) + '.', 'Sitúate en ' + z(a) + ' en la recta y muévete ' + Math.abs(b) + ' pasos hacia la ' + (b < 0 ? 'izquierda' : 'derecha') + '.');
  };
  G['3-3'] = function (d) {
    var s = -ri(2, d ? 12 : 8), m = ri(4, d ? 18 : 12) * (d === 2 && R() < .4 ? -1 : 1), r = s + m;
    return num('Construye la escalera: estás en la planta ' + z(s) + ' de la torre y ' + (m > 0 ? 'subes ' + m : 'bajas ' + (-m)) + ' plantas. ¿En qué planta acabas?', r, [s - m, m, -r], z(s) + ' ' + (m > 0 ? '+ ' + m : '− ' + (-m)) + ' = ' + z(r) + '. Subir es sumar; bajar es restar.', 'Subir = sumar, bajar = restar. Usa la recta numérica.');
  };
  G['3-4'] = function (d) {
    var a = -ri(2, d ? 6 : 4), b = ri(1, 6), c = ri(b + 1, b + 7), r = a * (b - c);
    return num('Los paréntesis del campanario: ' + z(a) + '·(' + b + ' − ' + c + ') = ?', r, [-r, a * b - c, a + (b - c)], 'Primero el paréntesis: ' + b + ' − ' + c + ' = ' + z(b - c) + '. Después ' + z(a) + '·' + zp(b - c) + ' = ' + z(r) + ' (menos por menos, más).', 'Resuelve el paréntesis y aplica la regla de los signos.');
  };
  G['3-5'] = function (d, fase) {
    if (fase === 1) { var s1 = pick(['+', '−']), s2 = pick(['+', '−']), res = s1 === s2 ? 'Positivo (+)' : 'Negativo (−)'; return q('Regla del reloj de los signos: el producto de un número ' + (s1 === '+' ? 'positivo' : 'negativo') + ' por otro ' + (s2 === '+' ? 'positivo' : 'negativo') + ' es...', res, [s1 === s2 ? 'Negativo (−)' : 'Positivo (+)', 'Depende de cuál sea mayor'], 'Signos iguales dan resultado positivo; signos distintos, negativo: (+)·(+) = +, (−)·(−) = +, (+)·(−) = −, (−)·(+) = −.', 'Iguales → +. Distintos → −.'); }
    if (fase === 2) { var a = ri(1, 5), b = ri(a + 2, a + 8), c = ri(1, 4), r = -(a - b) + c * c; return num('Desarma la trampa: −(' + a + ' − ' + b + ') + (−' + c + ')² = ?', r, [-(a - b) - c * c, (a - b) + c * c, -(a - b) + 2 * c], 'Paréntesis: ' + a + ' − ' + b + ' = ' + z(a - b) + ', y su opuesto es ' + z(-(a - b)) + '. Potencia: (−' + c + ')² = ' + c * c + ' (base negativa, exponente par → positivo). Total: ' + z(-(a - b)) + ' + ' + c * c + ' = ' + z(r) + '.', 'Ojo: (−' + c + ')² no es lo mismo que −' + c + '².'); }
    var t1 = -ri(2, 9), t2 = ri(3, 15);
    return num('En Écija, una noche de enero el termómetro marcó ' + z(t1) + ' °C y a mediodía ' + t2 + ' °C. ¿Cuántos grados subió la temperatura?', t2 - t1, [t2 + t1, t1 - t2, t2], 'Variación = final − inicial = ' + t2 + ' − ' + zp(t1) + ' = ' + t2 + ' + ' + Math.abs(t1) + ' = ' + (t2 - t1) + ' grados.', 'Restar un negativo es sumar su opuesto.');
  };

  /* ===================== MUNDO 4 · Fracciones ===================== */
  G['4-1'] = function (d) {
    var b = pick(d === 0 ? [3, 4, 5, 6] : [5, 6, 8, 10, 12]), a = ri(1, b - 1);
    return q('Una parcela del olivar de Marchena está dividida en ' + b + ' partes iguales y se han cosechado ' + a + '. ¿Qué fracción se ha cosechado?', a + '/' + b, [b + '/' + a, a + '/' + (b - a), (b - a) + '/' + b], 'El denominador (' + b + ') indica en cuántas partes iguales se divide el todo y el numerador (' + a + '), cuántas se toman: ' + a + '/' + b + '.', 'Abajo: partes totales. Arriba: partes coloreadas.', { visual: { tipo: 'barra', partes: b, marcadas: a } });
  };
  G['4-2'] = function (d) {
    var b = pick([2, 3, 4, 5]), a = ri(1, b - 1); while (mcd(a, b) !== 1) a = ri(1, b - 1); var k = ri(2, d ? 6 : 4);
    return q('Denominadorón duplica las parcelas. ¿Qué fracción es EQUIVALENTE a ' + a + '/' + b + '?', (a * k) + '/' + (b * k), [(a * k) + '/' + (b + k), (a + k) + '/' + (b + k), (a * k) + '/' + b, a + '/' + (b * k)], 'Si multiplicamos numerador y denominador por el mismo número (' + k + '), obtenemos una fracción equivalente: ' + a + '/' + b + ' = ' + a * k + '/' + b * k + '. Sumar el mismo número NO da equivalentes.', 'Multiplica arriba y abajo por el mismo número.', { visual: { tipo: 'barra', partes: b, marcadas: a } });
  };
  G['4-3'] = function (d) {
    var p; do { p = [ri(1, 6), ri(2, 9), ri(1, 6), ri(2, 9)]; } while (p[0] >= p[1] || p[2] >= p[3] || p[0] * p[3] === p[2] * p[1] || (d === 0 && p[1] !== p[3] && p[0] !== p[2]));
    var a = p[0], b = p[1], c = p[2], e = p[3], m = mcm(b, e), mayor = a * e > c * b ? a + '/' + b : c + '/' + e;
    return q('¿Qué recipiente de aceite tiene MÁS: el de ' + a + '/' + b + ' de litro o el de ' + c + '/' + e + '?', mayor, [mayor === a + '/' + b ? c + '/' + e : a + '/' + b, 'Tienen lo mismo'], 'Reducimos a común denominador (' + m + '): ' + a + '/' + b + ' = ' + a * m / b + '/' + m + ' y ' + c + '/' + e + ' = ' + c * m / e + '/' + m + '. Es mayor la de mayor numerador: ' + mayor + '.', 'Pon las dos fracciones con el mismo denominador.');
  };
  G['4-4'] = function (d) {
    var b = pick([2, 3, 4, 5]), e = b * pick([2, 3]), a = 1, c = ri(1, e - 1), m = e, s = a * (m / b) + c;
    if (d === 0) { e = b; c = ri(1, b - 1); m = b; s = a + c; }
    var res = fr(s, m);
    return q('La almazara mezcla ' + a + '/' + b + ' y ' + c + '/' + e + ' de tinaja. ¿Cuánto aceite hay en total?', res, [fr(a + c, b + e), fr(a + c, m), fr(s, m * 2)], 'Común denominador ' + m + ': ' + a + '/' + b + ' = ' + a * m / b + '/' + m + '. Sumamos numeradores: ' + a * m / b + ' + ' + c * m / e + ' = ' + s + ' → ' + s + '/' + m + (res !== s + '/' + m ? ' = ' + res + ' (simplificada)' : '') + '. Nunca se suman los denominadores.', 'Busca un denominador común antes de sumar.', { numerica: true });
  };
  G['4-5'] = function (d, fase) {
    if (fase === 1) return q('Simplifract esconde la regla. Para MULTIPLICAR dos fracciones...', 'Se multiplican los numeradores entre sí y los denominadores entre sí', ['Se busca común denominador y se suman', 'Se multiplica en cruz', 'Se suman numeradores y denominadores'], 'a/b · c/d = (a·c)/(b·d). Para multiplicar no hace falta común denominador.', 'Arriba con arriba, abajo con abajo.');
    if (fase === 2) { var a = ri(1, 5), b = ri(a + 1, 9), c = ri(1, 7), e = ri(c + 1, 10), res = fr(a * c, b * e); return q('Recupera el libro: (' + a + '/' + b + ')·(' + c + '/' + e + ') = ? (simplificada)', res, [fr(a * e, b * c), fr(a + c, b + e), (a * c) + '/' + (b + e)], '(' + a + '·' + c + ')/(' + b + '·' + e + ') = ' + a * c + '/' + b * e + (res !== a * c + '/' + b * e ? ' = ' + res + ' al simplificar (dividiendo entre ' + mcd(a * c, b * e) + ')' : '') + '.', 'Multiplica arriba con arriba y abajo con abajo; luego simplifica.', { numerica: true }); }
    var dd = pick([3, 4, 5, 6]), nn = ri(1, dd - 1), tot = dd * ri(3, 8), r = tot / dd * nn;
    return num('Transfiere: en Marchena hay ' + tot + ' olivos y se varean los ' + nn + '/' + dd + '. ¿Cuántos olivos se varean?', r, [tot / dd, tot - r, nn * tot], nn + '/' + dd + ' de ' + tot + ' = ' + tot + ' : ' + dd + ' · ' + nn + ' = ' + tot / dd + ' · ' + nn + ' = ' + r + '.', 'Divide entre el denominador y multiplica por el numerador.');
  };

  /* ===================== MUNDO 5 · Proporcionalidad ===================== */
  G['5-1'] = function (d) {
    var u = ri(2, d ? 6 : 4), p = ri(2, 5) * (d ? ri(1, 3) : 1), a = ri(2, 4), b = ri(a + 1, a + 6);
    return num('Si ' + a + ' cajas de mantecados cuestan ' + a * p + ' €, ¿cuánto cuestan ' + b + ' cajas?', b * p, [a * p + (b - a), b * a, a * p * b], 'Magnitudes directamente proporcionales: 1 caja cuesta ' + a * p + ' : ' + a + ' = ' + p + ' €, así que ' + b + ' cajas cuestan ' + b + '·' + p + ' = ' + b * p + ' €.', 'Calcula primero el precio de una caja (reducción a la unidad).');
  };
  G['5-2'] = function (d) {
    var a = ri(1, 6), b = ri(a + 1, 9), k = ri(2, d ? 6 : 4), c = b * k;
    return num('Señor Escala altera el plano. Halla x en ' + a + '/' + b + ' = x/' + c, a * k, [c - b + a, a * c, b * k], 'En una proporción, si el denominador pasa de ' + b + ' a ' + c + ' (×' + k + '), el numerador también se multiplica por ' + k + ': x = ' + a + '·' + k + ' = ' + a * k + '. También: x = ' + a + '·' + c + ' : ' + b + '.', '¿Por cuánto se ha multiplicado el denominador?');
  };
  G['5-3'] = function (d) {
    var k = pick([2, 5, 10, 20]), cm = ri(2, 9);
    return num('En el plano del Balcón de Estepa la escala es 1 cm : ' + k + ' km. Si dos pueblos están a ' + cm + ' cm en el mapa, ¿cuántos km hay en la realidad?', cm * k, [cm + k, k, cm * k * 10], 'Cada centímetro del mapa son ' + k + ' km reales: ' + cm + '·' + k + ' = ' + cm * k + ' km.', 'Multiplica los centímetros por lo que vale cada centímetro.');
  };
  G['5-4'] = function (d) {
    var a = ri(1, 3), b = ri(a + 1, 5), k = ri(2, d ? 8 : 5), tot = (a + b) * k;
    return num('Hay que repartir ' + tot + ' mantecados entre dos grupos en proporción ' + a + ':' + b + '. ¿Cuántos recibe el PRIMER grupo?', a * k, [b * k, tot / 2, tot - a], 'Partes totales: ' + a + ' + ' + b + ' = ' + (a + b) + '. Cada parte vale ' + tot + ' : ' + (a + b) + ' = ' + k + '. El primer grupo recibe ' + a + '·' + k + ' = ' + a * k + '.', 'Suma las partes y averigua cuánto vale una parte.');
  };
  G['5-5'] = function (d, fase) {
    if (fase === 1) { var pp = pick([[25, '1/4'], [50, '1/2'], [10, '1/10'], [20, '1/5'], [75, '3/4']]); return q('Porcentajín confunde el mercado. El ' + pp[0] + ' % de una cantidad equivale a tomar...', pp[1], ['1/' + pp[0], pp[0] + '/10', '1/' + (100 - pp[0])].filter(function (x) { return x !== pp[1]; }), pp[0] + ' % = ' + pp[0] + '/100 = ' + pp[1] + '. Un porcentaje es una fracción de denominador 100.', 'Escribe ' + pp[0] + '/100 y simplifica.'); }
    if (fase === 2) { var p = pick([10, 20, 25, 50, 75]), n = pick([40, 60, 80, 120, 200]); return num('Calcula el ' + p + ' % de ' + n + ' €.', n * p / 100, [n - n * p / 100, p, n / p], p + ' % de ' + n + ' = ' + n + '·' + p + '/100 = ' + n * p / 100 + ' €.', 'Multiplica por ' + p + ' y divide entre 100.'); }
    var p2 = pick([10, 20, 25, 50]), n2 = pick([40, 60, 80, 120]), fin = n2 - n2 * p2 / 100;
    return num('Una caja de polvorones cuesta ' + n2 + ' € y tiene un descuento del ' + p2 + ' %. ¿Cuál es el precio final?', fin, [n2 * p2 / 100, n2 - p2, n2 + n2 * p2 / 100], 'Descuento: ' + p2 + ' % de ' + n2 + ' = ' + n2 * p2 / 100 + ' €. Precio final: ' + n2 + ' − ' + n2 * p2 / 100 + ' = ' + fin + ' €. (También: ' + n2 + '·' + (100 - p2) / 100 + ').', 'Calcula el descuento y réstalo al precio.');
  };

  /* ===================== MUNDO 6 · Álgebra ===================== */
  G['6-1'] = function (d) {
    var L = pick([
      ['el doble de un número más tres', '2n + 3', ['2(n + 3)', 'n + 2 + 3', '2 + n + 3']],
      ['el triple de un número menos cinco', '3n − 5', ['3(n − 5)', 'n − 3·5', '5 − 3n']],
      ['la mitad de un número', 'n/2', ['2n', 'n − 2', 'n²']],
      ['un número al cuadrado más uno', 'n² + 1', ['2n + 1', '(n + 1)²', 'n + 1²']],
      ['el siguiente de un número', 'n + 1', ['n − 1', '2n', '1n']],
      ['la suma de un número y su doble', 'n + 2n', ['2n + 2', 'n · 2n', 'n + 2']]
    ]);
    return q('Descifra la inscripción de la Universidad de Osuna: «' + L[0] + '»', L[1], L[2], 'Traducimos palabra a palabra: «doble» = 2·n, «triple» = 3·n, «mitad» = n/2, «cuadrado» = n². La expresión correcta es ' + L[1] + '.', 'Llama n al número y traduce cada palabra.');
  };
  G['6-2'] = function (d) {
    var a = ri(2, 6), b = ri(1, 9), x = d === 2 ? -ri(1, 5) : ri(1, 6), r = a * x + b;
    return num('Activa la columna: calcula ' + a + 'x + ' + b + ' para x = ' + z(x), r, [a + x + b, a * (x + b), a * x - b], 'Sustituimos x por ' + z(x) + ': ' + a + '·' + zp(x) + ' + ' + b + ' = ' + z(a * x) + ' + ' + b + ' = ' + z(r) + '.', 'Cambia la x por ' + z(x) + ' y respeta la jerarquía.');
  };
  G['6-3'] = function (d) {
    var a = ri(2, 7), b = ri(2, 7), c = ri(1, a + b - 1), r = a + b - c;
    return q('Agrupa las piedras semejantes: ' + a + 'x + ' + b + 'x − ' + c + 'x = ?', (r === 1 ? '' : r) + 'x', [(a + b + c) + 'x', r + 'x³', (a * b - c) + 'x'], 'Los términos semejantes tienen la misma parte literal (x). Se operan los coeficientes: ' + a + ' + ' + b + ' − ' + c + ' = ' + r + ', y la parte literal se mantiene: ' + r + 'x.', 'Suma y resta los números que acompañan a la x.');
  };
  G['6-4'] = function (d) {
    var a = ri(2, 6), b = ri(1, 9), neg = d === 2 && R() < .5;
    return q('Despliega la puerta: ' + a + '(x ' + (neg ? '−' : '+') + ' ' + b + ') = ?', a + 'x ' + (neg ? '−' : '+') + ' ' + a * b, [a + 'x ' + (neg ? '−' : '+') + ' ' + b, 'x ' + (neg ? '−' : '+') + ' ' + a * b, (a + b) + 'x'], 'Propiedad distributiva: el ' + a + ' multiplica a TODOS los términos del paréntesis: ' + a + '·x ' + (neg ? '−' : '+') + ' ' + a + '·' + b + ' = ' + a + 'x ' + (neg ? '−' : '+') + ' ' + a * b + '.', 'El número de fuera multiplica a cada término de dentro.');
  };
  G['6-5'] = function (d, fase) {
    if (fase === 1) return q('¿Cuál de estos pares son términos SEMEJANTES?', '3x y −5x', ['3x y 3x²', '2x y 2y', '4 y 4x'], 'Son semejantes los términos con la misma parte literal (mismas letras con los mismos exponentes): 3x y −5x. 3x y 3x² no lo son (distinto exponente).', 'Mira las letras y sus exponentes, no los números.');
    if (fase === 2) { var a = ri(2, 5), b = ri(2, 5), c = ri(2, 9), r = a + b - 1; return q('Rompe el sello: ' + a + 'x + ' + b + 'x − (x − ' + c + ') = ?', r + 'x + ' + c, [r + 'x − ' + c, (a + b + 1) + 'x − ' + c, (a + b) + 'x + ' + c], 'El signo menos delante del paréntesis cambia el signo de todo lo de dentro: −(x − ' + c + ') = −x + ' + c + '. Agrupando: ' + a + 'x + ' + b + 'x − x = ' + r + 'x. Resultado: ' + r + 'x + ' + c + '.', 'Quita el paréntesis cambiando los signos de dentro.'); }
    var a2 = ri(2, 5), c2 = ri(1, 9), x = ri(1, 5), v = a2 * x + c2;
    return num('Comprueba la transformación: si la expresión simplificada es ' + a2 + 'x + ' + c2 + ', ¿cuánto vale para x = ' + x + '?', v, [a2 + x + c2, a2 * (x + c2), a2 * x], a2 + '·' + x + ' + ' + c2 + ' = ' + a2 * x + ' + ' + c2 + ' = ' + v + '. Sustituir en la expresión original debe dar lo mismo: así se comprueba.', 'Sustituye x = ' + x + '.');
  };

  /* ===================== MUNDO 7 · Ecuaciones ===================== */
  G['7-1'] = function (d) { var x = ri(1, d ? 20 : 9), a = ri(1, 9); return num('Equilibra la balanza de Triana: x + ' + a + ' = ' + (x + a), x, [x + 2 * a, x + a, a], 'Restamos ' + a + ' en los dos lados para dejar la x sola: x = ' + (x + a) + ' − ' + a + ' = ' + x + '. Comprobación: ' + x + ' + ' + a + ' = ' + (x + a) + '.', 'Haz la misma operación en los dos platillos.'); };
  G['7-2'] = function (d) { var x = ri(d === 2 ? -9 : 1, 20) || 3, a = ri(1, 9); return num('La alfarería: x − ' + a + ' = ' + z(x - a), x, [x - 2 * a, x - a, a], 'Sumamos ' + a + ' en los dos lados: x = ' + z(x - a) + ' + ' + a + ' = ' + z(x) + '. Comprobación: ' + z(x) + ' − ' + a + ' = ' + z(x - a) + '.', 'Lo contrario de restar ' + a + ' es sumar ' + a + '.'); };
  G['7-3'] = function (d) {
    var x = ri(1, 8), c = ri(1, 3), a = c + ri(1, 3), b = ri(1, 9), dd = (a - c) * x + b;
    return num('Ajusta los cables del puente: ' + a + 'x + ' + b + ' = ' + (c === 1 ? '' : c) + 'x + ' + dd, x, [dd - b, (dd - b) / a | 0, x + 1], 'Pasamos las x a un lado y los números al otro: ' + a + 'x − ' + c + 'x = ' + dd + ' − ' + b + ' → ' + (a - c) + 'x = ' + (dd - b) + ' → x = ' + x + '. Comprobación: ' + (a * x + b) + ' = ' + (c * x + dd) + '.', 'Resta ' + c + 'x en los dos lados.');
  };
  G['7-4'] = function (d) {
    var k = pick([2, 3, 4, 5]), x = ri(3, 12), nom = { 2: 'el doble', 3: 'el triple', 4: 'el cuádruple', 5: 'el quíntuple' }[k];
    if (d >= 1 && R() < .5) { var b = ri(2, 9); return num('Los ceramistas: «' + nom + ' de los platos que tengo, más ' + b + ', es ' + (k * x + b) + '». ¿Cuántos platos tengo?', x, [k * x + b, (k * x + b) / k | 0, x + b], 'Ecuación: ' + k + 'x + ' + b + ' = ' + (k * x + b) + ' → ' + k + 'x = ' + k * x + ' → x = ' + x + '.', 'Escribe la ecuación con x = número de platos.'); }
    return num('Un encargo enigmático: «' + nom + ' de una cantidad es ' + k * x + '». ¿Cuál es la cantidad?', x, [k * x, k * x - k, x * 2 + 1], 'Ecuación: ' + k + 'x = ' + k * x + '. Dividimos entre ' + k + ': x = ' + x + '.', 'Escribe ' + k + '·x = ' + k * x + '.');
  };
  G['7-5'] = function (d, fase) {
    if (fase === 1) return q('Despejador Oscuro pregunta: para resolver una ecuación, ¿qué operación es VÁLIDA?', 'Hacer la misma operación en los dos miembros', ['Sumar un número solo en el miembro izquierdo', 'Cambiar el signo solo a la x', 'Multiplicar solo el miembro derecho'], 'Una ecuación es una balanza: se mantiene el equilibrio si hacemos exactamente lo mismo en los dos lados.', 'Piensa en una balanza equilibrada.');
    if (fase === 2) { var a = ri(2, 4), x = ri(1, 7), b = ri(1, 5), c = a * (x + b); return num('El último torno: ' + a + '(x + ' + b + ') = ' + c, x, [c / a, c - b, x + b], 'Dividimos entre ' + a + ': x + ' + b + ' = ' + c / a + '. Restamos ' + b + ': x = ' + x + '. (También vale aplicar la distributiva: ' + a + 'x + ' + a * b + ' = ' + c + '.)', 'Divide primero los dos lados entre ' + a + '.'); }
    var a2 = ri(2, 4), x2 = ri(1, 8), b2 = ri(1, 5), wrong = x2 + 1;
    return q('Comprueba: ¿es x = ' + wrong + ' solución de ' + a2 + '(x + ' + b2 + ') = ' + a2 * (x2 + b2) + '?', 'No, porque ' + a2 + '·(' + wrong + ' + ' + b2 + ') = ' + a2 * (wrong + b2), ['Sí, porque es un número positivo', 'Sí, porque ' + wrong + ' es mayor que ' + b2, 'No se puede comprobar'], 'Para comprobar una solución se sustituye: ' + a2 + '·(' + wrong + ' + ' + b2 + ') = ' + a2 * (wrong + b2) + ' ≠ ' + a2 * (x2 + b2) + '. La solución correcta es x = ' + x2 + '.', 'Sustituye x = ' + wrong + ' en la ecuación.');
  };

  /* ===================== MUNDO 8 · Funciones ===================== */
  G['8-1'] = function (d) {
    var x = ri(1, 6) * pick([-1, 1]), y = ri(1, 6) * pick([-1, 1]), c = x > 0 ? (y > 0 ? 'I' : 'IV') : (y > 0 ? 'II' : 'III');
    return q('Sitúa el molino A(' + z(x) + ', ' + z(y) + ') en el plano. ¿En qué cuadrante está?', 'Cuadrante ' + c, ['Cuadrante I', 'Cuadrante II', 'Cuadrante III', 'Cuadrante IV'], 'Primera coordenada (x) ' + (x > 0 ? 'positiva → derecha' : 'negativa → izquierda') + '; segunda (y) ' + (y > 0 ? 'positiva → arriba' : 'negativa → abajo') + '. Los cuadrantes se numeran I, II, III, IV en sentido contrario a las agujas del reloj, empezando arriba a la derecha.', 'I: (+,+) · II: (−,+) · III: (−,−) · IV: (+,−).', { visual: { tipo: 'plano', x: x, y: y } });
  };
  G['8-2'] = function (d) { var m = ri(1, 4) * (d === 2 && R() < .5 ? -1 : 1), n = ri(-3, 5), x = ri(d ? -3 : 0, 5), y = m * x + n; return num('Tabla de caudales: si y = ' + (m === 1 ? '' : m === -1 ? '−' : m) + 'x ' + (n < 0 ? '− ' + (-n) : '+ ' + n) + ', ¿cuánto vale y para x = ' + z(x) + '?', y, [m + x + n, m * (x + n), m * x - n], 'Sustituimos: y = ' + m + '·' + zp(x) + (n < 0 ? ' − ' + (-n) : ' + ' + n) + ' = ' + z(y) + '.', 'Cambia x por ' + z(x) + '.'); };
  G['8-3'] = function (d) {
    var m = ri(1, 3), n = ri(0, 4), x = ri(0, 4), ok = '(' + x + ', ' + (m * x + n) + ')';
    return q('¿Qué punto está sobre la gráfica del río y = ' + (m === 1 ? '' : m) + 'x + ' + n + '?', ok, ['(' + x + ', ' + (m * x + n + 1) + ')', '(' + (m * x + n) + ', ' + x + ')', '(' + (x + 1) + ', ' + (m * x + n) + ')'], 'Un punto (a, b) pertenece a la gráfica si al sustituir x = a obtenemos y = b: ' + m + '·' + x + ' + ' + n + ' = ' + (m * x + n) + '. Por eso ' + ok + ' sí está.', 'Sustituye la x de cada punto y mira si sale su y.');
  };
  G['8-4'] = function (d) {
    var tipo = pick(['crece', 'decrece', 'constante']), a = ri(1, 9), s = ri(1, 4), vals = [0, 1, 2, 3].map(function (i) { return tipo === 'crece' ? a + s * i : tipo === 'decrece' ? a + 12 - s * i : a; });
    var nom = { crece: 'Creciente', decrece: 'Decreciente', constante: 'Constante' }[tipo];
    return q('Gira la compuerta: el caudal del Guadaíra por horas es ' + vals.join(', ') + ' (x = 0, 1, 2, 3). ¿Cómo es la función?', nom, ['Creciente', 'Decreciente', 'Constante'].filter(function (t) { return t !== nom; }), 'Si al aumentar x aumenta y, la función es creciente; si y disminuye, decreciente; si no cambia, constante. Aquí los valores ' + (tipo === 'crece' ? 'aumentan' : tipo === 'decrece' ? 'disminuyen' : 'no cambian') + '.', 'Mira cómo cambian los valores de izquierda a derecha.', { visual: { tipo: 'barras', datos: vals } });
  };
  G['8-5'] = function (d, fase) {
    if (fase === 1) return q('En y = mx + n, si m es NEGATIVA, la gráfica...', 'Baja de izquierda a derecha (decrece)', ['Sube de izquierda a derecha (crece)', 'Es horizontal', 'Pasa siempre por (1, 1)'], 'La pendiente m indica cuánto cambia y por cada unidad de x. Si m < 0, y disminuye al aumentar x: la recta baja.', 'Prueba con y = −2x: calcula y para x = 0 y x = 1.');
    if (fase === 2) { var x = ri(-4, 4), y = R() < .5 ? x * x : x * x + ri(1, 3); return q('¿El punto (' + z(x) + ', ' + y + ') pertenece a la parábola y = x²?', y === x * x ? 'Sí' : 'No', [y === x * x ? 'No' : 'Sí', 'Solo si x es positivo'], 'Sustituimos: ' + zp(x) + '² = ' + x * x + '. ' + (y === x * x ? 'Coincide con ' + y + ': pertenece.' : 'No coincide con ' + y + ': no pertenece.') + ' Recuerda que un número negativo al cuadrado es positivo.', 'Eleva la x al cuadrado y compara con la y.'); }
    var m = ri(2, 3);
    return q('Parábola Vórtice enseña dos tablas. A: 1→' + m + ', 2→' + 2 * m + ', 3→' + 3 * m + '. B: 1→1, 2→4, 3→9. ¿Cuál representa una función LINEAL (recta)?', 'La tabla A', ['La tabla B', 'Las dos', 'Ninguna'], 'En A, y aumenta siempre lo mismo (+' + m + ') por cada unidad de x: es y = ' + m + 'x, una recta. En B los aumentos cambian (+3, +5): es y = x², una parábola.', 'Calcula cuánto aumenta y cada vez.');
  };

  /* ===================== MUNDO 9 · Estadística ===================== */
  function datos(n, max) { var a = []; for (var i = 0; i < n; i++) a.push(ri(1, max)); return a; }
  G['9-1'] = function (d) {
    var a = datos(d ? 7 : 5, 9), cnt = {}; a.forEach(function (v) { cnt[v] = (cnt[v] || 0) + 1; });
    var top = Object.keys(cnt).sort(function (x, y) { return cnt[y] - cnt[x]; }); if (cnt[top[0]] === (cnt[top[1]] || 0)) { a.push(+top[0]); cnt[top[0]]++; }
    var moda = top[0];
    return q('Censo de Itálica. Espectadores por grada: ' + a.join(', ') + '. ¿Cuál es la MODA?', moda, Object.keys(cnt).filter(function (k) { return k !== moda; }).concat([String(a.length)]), 'La moda es el dato que más se repite: ' + moda + ' aparece ' + cnt[moda] + ' veces. Ordenados: ' + a.slice().sort(function (x, y) { return x - y; }).join(', ') + '.', 'Ordena los datos y cuenta cuántas veces sale cada uno.');
  };
  G['9-2'] = function (d) {
    var n = d ? 5 : 4, m = ri(3, 9), a = datos(n - 1, 12), s = m * n - a.reduce(function (x, y) { return x + y; }, 0);
    while (s < 1 || s > 20) { a = datos(n - 1, 12); s = m * n - a.reduce(function (x, y) { return x + y; }, 0); }
    a.push(s);
    return num('Ajusta el marcador: ¿cuál es la MEDIA de ' + a.join(', ') + '?', m, [m + 1, a.slice().sort(function (x, y) { return x - y; })[Math.floor(n / 2)], m * n], 'Media = suma de los datos : número de datos = ' + a.join(' + ') + ' = ' + m * n + ' ; ' + m * n + ' : ' + n + ' = ' + m + '.', 'Suma todo y divide entre cuántos datos hay.');
  };
  G['9-3'] = function (d) {
    var a = datos(d ? 9 : 6, 4), v = pick(a), f = a.filter(function (x) { return x === v; }).length;
    return num('Mosaico de barras con los datos ' + a.join(', ') + '. ¿Qué altura (frecuencia absoluta) tiene la barra del valor ' + v + '?', f, [f + 1, v, a.length], 'La frecuencia absoluta es el número de veces que aparece un valor: ' + v + ' aparece ' + f + ' ' + (f === 1 ? 'vez' : 'veces') + '.', 'Cuenta cuántas veces aparece el ' + v + '.', { visual: { tipo: 'frecuencias', datos: a } });
  };
  G['9-4'] = function (d) {
    var a = ri(96, 98), b = a + ri(1, 2);
    return q('Un mensajero muestra un gráfico de votos: A = ' + a + ', B = ' + b + '. El eje vertical empieza en 95 y la barra B parece el TRIPLE de alta. ¿Qué ocurre?', 'La escala truncada exagera una diferencia pequeña', ['B tiene el triple de votos que A', 'El gráfico es correcto porque los números son ciertos', 'A tiene más votos que B'], 'Si el eje no empieza en 0, las barras no son proporcionales a los datos. La diferencia real es ' + (b - a) + ' voto' + (b - a > 1 ? 's' : '') + ' sobre unos ' + a + ': muy pequeña.', 'Compara las barras con los números reales, no con su altura.', { visual: { tipo: 'truncado', a: a, b: b } });
  };
  G['9-5'] = function (d, fase) {
    if (fase === 1) return q('Gráfico Tramposo esconde la regla: la MEDIANA de un conjunto de datos es...', 'El valor central cuando los datos están ordenados', ['El dato que más se repite', 'La suma de los datos dividida entre su número', 'La diferencia entre el mayor y el menor'], 'Mediana: valor que queda en el centro con los datos ordenados. (La moda es el más repetido; la media, suma : número; el rango, mayor − menor.)', 'Ordena y busca el del medio.');
    if (fase === 2) { var a = [ri(1, 3), ri(2, 4), ri(3, 5), ri(4, 6)]; a.sort(function (x, y) { return x - y; }); var big = ri(12, 20); a.push(big); var suma = a.reduce(function (x, y) { return x + y; }, 0); while (suma % 5) { a[0]++; a.sort(function (x, y) { return x - y; }); suma = a.reduce(function (x, y) { return x + y; }, 0); } var med = a[2]; return num('Debate del anfiteatro. Datos: ' + a.join(', ') + '. ¿Cuál es la MEDIANA?', med, [suma / 5, a[4], a[1]], 'Ordenados: ' + a.join(', ') + '. Hay 5 datos: el central es el 3.º, ' + med + '. (La media sería ' + suma + ' : 5 = ' + suma / 5 + ', muy afectada por el ' + big + '.)', 'Con 5 datos ordenados, la mediana es el tercero.'); }
    return q('En los datos 2, 2, 3, 3, 30 la media es 8 y la mediana es 3. ¿Qué medida describe mejor un valor «típico»?', 'La mediana, porque el 30 es un valor extremo', ['La media, porque usa todos los datos', 'Las dos son igual de buenas', 'Ninguna'], 'Un valor atípico (30) arrastra la media hacia arriba. La mediana no se ve afectada y representa mejor a la mayoría de los datos.', '¿Cuántos datos están cerca de 8? ¿Y cerca de 3?');
  };

  /* ===================== MUNDO 10 · Probabilidad ===================== */
  G['10-1'] = function (d) {
    var o = pick([['un dado de seis caras', 6, '{1, 2, 3, 4, 5, 6}'], ['una moneda', 2, '{cara, cruz}'], ['una ruleta de 8 sectores numerados', 8, '{1, 2, ..., 8}'], ['un dado de 4 caras', 4, '{1, 2, 3, 4}']]);
    return num('En los jardines del Alcázar aparece ' + o[0] + '. ¿Cuántos resultados tiene su espacio muestral?', o[1], [o[1] + 1, o[1] / 2, o[1] * 2], 'El espacio muestral es el conjunto de todos los resultados posibles: E = ' + o[2] + ', con ' + o[1] + ' elementos.', 'Escribe todos los resultados posibles.');
  };
  G['10-2'] = function (d) {
    var s = pick([['sacar un 7 con un dado normal', 'Imposible'], ['sacar un número menor que 7 con un dado normal', 'Seguro'], ['sacar un número par con un dado', 'Posible'], ['sacar cara al lanzar una moneda', 'Posible'], ['sacar una bola azul de una bolsa con solo bolas rojas', 'Imposible'], ['sacar una bola roja de una bolsa con solo bolas rojas', 'Seguro']]);
    return q('Dado Caótico inventa resultados. El suceso «' + s[0] + '» es...', s[1], ['Seguro', 'Posible', 'Imposible'].filter(function (x) { return x !== s[1]; }), 'Seguro: ocurre siempre. Imposible: no puede ocurrir nunca. Posible: puede ocurrir o no. «' + s[0] + '» es ' + s[1].toLowerCase() + '.', '¿Ocurre siempre, a veces o nunca?');
  };
  G['10-3'] = function (d) {
    var e = pick([['un número par', 3], ['un múltiplo de 3', 2], ['un número mayor que 4', 2], ['un número primo', 3], ['un 6', 1]]);
    return q('Reparte los azulejos: con un dado equilibrado, ¿cuál es la probabilidad de sacar ' + e[0] + '?', fr(e[1], 6), [e[1] + '/' + (6 - e[1]), fr(1, e[1] + 1), fr(6 - e[1], 6)].filter(function (x) { return x !== fr(e[1], 6); }), 'Regla de Laplace: casos favorables / casos posibles = ' + e[1] + '/6' + (fr(e[1], 6) !== e[1] + '/6' ? ' = ' + fr(e[1], 6) : '') + '.', 'Cuenta los resultados favorables y divide entre 6.', { numerica: true });
  };
  G['10-4'] = function (d) {
    if (d >= 1 && R() < .5) return q('Dos monedas marcan el camino. ¿Cuál es la probabilidad de obtener DOS CARAS?', '1/4', ['1/2', '1/3', '2/4'], 'Resultados: CC, CX, XC, XX (4 casos igual de probables). Solo uno es favorable (CC): P = 1/4. (CX y XC son resultados distintos).', 'Dibuja el árbol: primera moneda, luego segunda.', { numerica: true });
    return num('Dibuja el árbol de dos lanzamientos de moneda. ¿Cuántos resultados posibles hay?', 4, [2, 3, 6], 'Primera moneda: cara o cruz (2). Para cada una, la segunda: cara o cruz (2). En total 2·2 = 4: CC, CX, XC, XX.', 'Para cada resultado de la primera moneda hay dos de la segunda.');
  };
  G['10-5'] = function (d, fase) {
    if (fase === 1) return q('Ruleta Imposible pregunta: según la regla de Laplace, la probabilidad de un suceso es...', 'Casos favorables entre casos posibles', ['Casos posibles entre casos favorables', 'Casos favorables menos casos posibles', 'Siempre 1/2'], 'Si todos los resultados son igual de probables, P(A) = nº de casos favorables / nº de casos posibles. Siempre está entre 0 y 1.', 'La probabilidad nunca es mayor que 1.');
    if (fase === 2) { var r = ri(2, 6), a = ri(1, 5); return q('En una bolsa hay ' + r + ' bolas rojas y ' + a + ' azules. ¿Cuál es P(roja)?', fr(r, r + a), [fr(r, a), fr(a, r + a), fr(1, 2) === fr(r, r + a) ? fr(r + 1, r + a + 1) : fr(1, 2)], 'Favorables: ' + r + ' rojas. Posibles: ' + r + ' + ' + a + ' = ' + (r + a) + '. P(roja) = ' + r + '/' + (r + a) + (fr(r, r + a) !== r + '/' + (r + a) ? ' = ' + fr(r, r + a) : '') + '.', 'Divide las rojas entre el total de bolas.', { numerica: true }); }
    var r1 = ri(1, 3), a1 = ri(2, 5), r2 = r1 + 1, a2 = a1 + ri(2, 4); while (r1 * (r2 + a2) === r2 * (r1 + a1)) a2++;
    var mejor = r1 / (r1 + a1) > r2 / (r2 + a2) ? 'La bolsa A' : 'La bolsa B';
    return q('Para abrir el laberinto hay que sacar bola roja. Bolsa A: ' + r1 + ' rojas y ' + a1 + ' azules. Bolsa B: ' + r2 + ' rojas y ' + a2 + ' azules. ¿Qué bolsa conviene?', mejor, [mejor === 'La bolsa A' ? 'La bolsa B' : 'La bolsa A', 'Da igual', 'La que tenga más bolas rojas'], 'P(roja en A) = ' + r1 + '/' + (r1 + a1) + ' ≈ ' + (r1 / (r1 + a1)).toFixed(2) + '; P(roja en B) = ' + r2 + '/' + (r2 + a2) + ' ≈ ' + (r2 / (r2 + a2)).toFixed(2) + '. No basta con contar las rojas: hay que compararlas con el total.', 'Calcula la probabilidad en cada bolsa.');
  };

  /* ---------- API ---------- */
  /* Genera las preguntas de una aventura SIN repetir enunciado: cada generador
     se vuelve a llamar hasta que salga uno distinto (con un tope de intentos,
     porque algunas etapas tienen pocas variantes posibles).
     evitar: enunciados ya vistos en el combate, para sustituir una fallada. */
  function preguntas(mundo, etapa, dif, rnd, evitar) {
    if (rnd) R = rnd;
    var g = G[mundo + '-' + etapa], out = [], vistos = {};
    if (!g) return out;
    (evitar || []).forEach(function (t) { if (t) vistos[String(t)] = true; });
    function nueva(fase) {
      var q2 = null;
      for (var intento = 0; intento < 14; intento++) {
        q2 = fase ? Object.assign(g(dif, fase), { fase: fase }) : g(dif, 0);
        if (!vistos[q2.texto]) break;
      }
      if (q2) { vistos[q2.texto] = true; out.push(q2); }
    }
    if (etapa === 5) { [1, 1, 2, 2, 3, 3].forEach(function (f, i) { if (dif === 0 && i % 2) return; nueva(f); }); }
    else { var n = etapa === 4 ? 4 : 3; for (var i = 0; i < n; i++) nueva(0); }
    return out;
  }
  /* Comparación de respuestas escritas: acepta fracciones equivalentes y el guion como signo menos. */
  root.GaloisRetos = { preguntas: preguntas, generadores: G, igual: igual, valor: valor, mcd: mcd, mcm: mcm, esPrimo: esPrimo };
  if (typeof module !== 'undefined') module.exports = root.GaloisRetos;
})(typeof window !== 'undefined' ? window : globalThis);
