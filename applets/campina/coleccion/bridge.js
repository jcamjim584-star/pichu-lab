/* =====================================================================
   GALOIS LEGACY · puente de recompensas (cosméticas)
   ---------------------------------------------------------------------
   No altera puntuaciones, preguntas ni calificaciones. Todo se guarda en
   localStorage, por alias, sin datos personales.

   API (compatible con la versión anterior):
     GaloisColeccion.registrarResultado({mundo, reto, superado, excelencia})
       La primera victoria en un reto distinto de un mundo concede una carta
       ALEATORIA de las cinco normales de ese mundo que aún no se tengan
       (hasta cinco). Con cinco retos distintos y una victoria excelente se
       concede la legendaria. Repetir un reto no da más cartas.
     GaloisColeccion.rpg.estado()           -> experiencia, nivel, monedas...
     GaloisColeccion.rpg.completarAventura({mundo, etapa, errores, dificultad})
     GaloisColeccion.registrarHito(id)
       Hitos propios (por ejemplo los opcionales de Fuentes: 'm1-lardero' y
       'm1-romeria'). Cada hito se registra UNA sola vez y concede la carta
       que lo declara en coleccion/datos.js. Repetirlo no da nada más.
     GaloisColeccion.rpg.abrirCofre(id, monedas)   (cofres del mapa, una vez)
     GaloisColeccion.rpg.usarPocion() / comprarPocion(precio)
   ===================================================================== */
(function () {
  'use strict';
  var DB = 'galoisLegacy.coleccion.v1', ACTIVE = 'galoisLegacy.coleccion.perfil.v1';
  var BASE = new URL('.', document.currentScript ? document.currentScript.src : document.baseURI).href;
  var ALBUM_URL = BASE + 'index.html';

  function normal(s) { return String(s || 'Explorador').trim().slice(0, 28).replace(/[<>"']/g, '') || 'Explorador'; }
  function activo() { try { return normal(localStorage.getItem(ACTIVE)); } catch (e) { return 'Explorador'; } }
  function leer() { try { var x = JSON.parse(localStorage.getItem(DB) || '{}'); return x && typeof x === 'object' && x.perfiles && typeof x.perfiles === 'object' ? x : { perfiles: {} }; } catch (e) { return { perfiles: {} }; } }
  function guardar(db) { try { localStorage.setItem(DB, JSON.stringify(db)); return true; } catch (e) { return false; } }
  function perfil(db) {
    var a = activo(); if (!db.perfiles[a]) db.perfiles[a] = { retos: {}, cartas: [] };
    var p = db.perfiles[a]; p.retos = p.retos && typeof p.retos === 'object' ? p.retos : {}; p.cartas = Array.isArray(p.cartas) ? p.cartas : [];
    return p;
  }
  function rpgDe(p) {
    var r = p.rpg && typeof p.rpg === 'object' ? p.rpg : {};
    r.xp = Math.max(0, +r.xp || 0); r.monedas = Math.max(0, +r.monedas || 0);
    r.insignias = Array.isArray(r.insignias) ? r.insignias : []; r.logros = Array.isArray(r.logros) ? r.logros : [];
    r.aventuras = r.aventuras && typeof r.aventuras === 'object' ? r.aventuras : {};
    r.cofres = r.cofres && typeof r.cofres === 'object' ? r.cofres : {};
    r.inv = r.inv && typeof r.inv === 'object' ? r.inv : {}; r.inv.pocion = Math.max(0, +r.inv.pocion || 0);
    r.hitos = r.hitos && typeof r.hitos === 'object' ? r.hitos : {};
    p.rpg = r; return r;
  }
  function azar(n) { try { var a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; } catch (e) { return Math.floor(Math.random() * n); } }

  /* ---------- Niveles ---------- */
  function nivelDe(xp) { return Math.max(1, Math.floor((1 + Math.sqrt(1 + 8 * xp / 100)) / 2)); }
  function xpNivel(n) { return 100 * (n - 1) * n / 2; }

  /* ---------- Logros ---------- */
  var LOGROS = {
    'primer-paso': { nombre: 'Primer paso', desc: 'Completa tu primera aventura.', icono: '👣' },
    'primera-carta': { nombre: 'Primera carta', desc: 'Consigue tu primera carta del álbum.', icono: '🃏' },
    'coleccion-10': { nombre: 'Coleccionista', desc: 'Reúne 10 cartas.', icono: '📚' },
    'coleccion-30': { nombre: 'Gran coleccionista', desc: 'Reúne 30 cartas.', icono: '🏛️' },
    'coleccion-60': { nombre: 'Álbum completo', desc: 'Reúne todas las cartas del álbum.', icono: '👑' },
    'sin-errores': { nombre: 'Mente clara', desc: 'Derrota a un jefe sin fallar ninguna pregunta.', icono: '💎' },
    'maestro': { nombre: 'Maestría', desc: 'Completa una aventura en dificultad Maestro.', icono: '🎓' },
    'nivel-5': { nombre: 'Aventurero curtido', desc: 'Alcanza el nivel 5.', icono: '⭐' },
    'nivel-10': { nombre: 'Leyenda de la Campiña', desc: 'Alcanza el nivel 10.', icono: '🌟' },
    'cofres-5': { nombre: 'Buscatesoros', desc: 'Abre 5 cofres del saber.', icono: '🗝️' },
    'compas': { nombre: 'El Compás restaurado', desc: 'Completa los diez mundos.', icono: '🧭' }
  };
  for (var w = 1; w <= 10; w++) LOGROS['mundo-' + w] = { nombre: 'Mundo ' + w + ' superado', desc: 'Derrota al jefe del mundo ' + w + ' y recupera su pieza del Compás.', icono: '🏅' };

  function comprobarLogros(p, r, ctx) {
    var nuevos = [], add = function (id) { if (LOGROS[id] && r.logros.indexOf(id) < 0) { r.logros.push(id); nuevos.push(Object.assign({ id: id }, LOGROS[id])); } };
    var hechas = Object.keys(r.aventuras).filter(function (k) { return r.aventuras[k] && r.aventuras[k].hecha; });
    if (hechas.length) add('primer-paso');
    if (p.cartas.length >= 1) add('primera-carta');
    if (p.cartas.length >= 10) add('coleccion-10');
    if (p.cartas.length >= 30) add('coleccion-30');
    var totalCartas = window.GALOIS_CAMPINA && window.GALOIS_CAMPINA.cartas ? window.GALOIS_CAMPINA.cartas.length : 60;
    if (p.cartas.length >= totalCartas) add('coleccion-60');
    var niv = nivelDe(r.xp); if (niv >= 5) add('nivel-5'); if (niv >= 10) add('nivel-10');
    if (Object.keys(r.cofres).length >= 5) add('cofres-5');
    if (ctx && ctx.jefeSinErrores) add('sin-errores');
    if (ctx && ctx.maestro) add('maestro');
    var completos = 0;
    for (var m = 1; m <= 10; m++) if (r.aventuras[m + '-5'] && r.aventuras[m + '-5'].hecha) { add('mundo-' + m); completos++; if (r.insignias.indexOf(m) < 0) r.insignias.push(m); }
    if (completos === 10) add('compas');
    return nuevos;
  }

  /* ---------- Cartas ---------- */
  /* Un mundo puede repartir sus cartas de dos maneras:
     - al azar entre las cinco normales (comportamiento histórico), o
     - por hitos, si sus cartas declaran "hito": cada hito concede SIEMPRE la
       misma carta y solo la primera vez (Fuentes de Andalucía, mundo 1). */
  function usaHitos(world) {
    var all = window.GALOIS_CAMPINA;
    return !!(all && all.cartas.some(function (c) { return c.mundo === world && c.hito; }));
  }
  function concederPorHito(p, hito) {
    var all = window.GALOIS_CAMPINA; if (!all || !hito) return [];
    var c = all.cartas.find(function (x) { return x.hito === hito; });
    if (!c || p.cartas.indexOf(c.id) >= 0) return [];   // una sola vez
    p.cartas.push(c.id); return [c];
  }
  function concederCartas(p, world, excelencia) {
    var all = window.GALOIS_CAMPINA; if (!all) return [];
    if (usaHitos(world)) return [];                      // ese mundo reparte por hitos
    var key = String(world), cantidad = Math.min(5, Object.keys(p.retos[key] || {}).length), nuevas = [];
    var normales = all.cartas.filter(function (c) { return c.mundo === world && c.etapa <= 5; });
    var tengo = function () { return normales.filter(function (c) { return p.cartas.indexOf(c.id) >= 0; }).length; };
    while (tengo() < cantidad) {
      var libres = normales.filter(function (c) { return p.cartas.indexOf(c.id) < 0; });
      if (!libres.length) break;
      var card = libres[azar(libres.length)]; p.cartas.push(card.id); nuevas.push(card);
    }
    if (cantidad === 5 && excelencia) {
      var extra = all.cartas.find(function (c) { return c.mundo === world && c.etapa === 6; });
      if (extra && p.cartas.indexOf(extra.id) < 0) { p.cartas.push(extra.id); nuevas.push(extra); }
    }
    return nuevas;
  }

  function registrarResultado(a, silencio) {
    var all = window.GALOIS_CAMPINA; if (!all || !a || !a.superado) return [];
    var world = +a.mundo, wd = all.mundos.find(function (x) { return x.id === world; }); if (!wd) return [];
    var reto = String(a.reto || '').trim().slice(0, 70); if (!reto) return [];
    var db = leer(), p = perfil(db), r = rpgDe(p), key = String(world);
    p.retos[key] = p.retos[key] || {};
    var nuevoReto = !p.retos[key][reto];
    p.retos[key][reto] = true;
    if (nuevoReto && !a.sinXp) { r.xp += 20; r.monedas += 5; } // pequeño premio por reto nuevo de los minijuegos
    var nuevas = concederCartas(p, world, a.excelencia);
    var logros = comprobarLogros(p, r);
    guardar(db);
    if (!silencio) avisar(nuevas, logros);
    return nuevas;
  }

  /* ---------- RPG ---------- */
  function estado() {
    var db = leer(), p = perfil(db), r = rpgDe(p), n = nivelDe(r.xp);
    return { alias: activo(), xp: r.xp, nivel: n, xpNivel: xpNivel(n), xpSiguiente: xpNivel(n + 1), monedas: r.monedas, insignias: r.insignias.slice(), logros: r.logros.slice(), aventuras: JSON.parse(JSON.stringify(r.aventuras)), cofres: Object.keys(r.cofres), hitos: Object.keys(r.hitos), inv: Object.assign({}, r.inv), cartas: p.cartas.slice(), heroe: r.heroe || null, dificultad: r.dificultad || 'aventurero' };
  }
  function preferencias(o) { var db = leer(), p = perfil(db), r = rpgDe(p); if (o.heroe) r.heroe = String(o.heroe).slice(0, 30); if (/^(explorador|aventurero|maestro)$/.test(o.dificultad || '')) r.dificultad = o.dificultad; guardar(db); }

  /* Llamada por el motor de aventuras SOLO al terminar con éxito todas las
     preguntas de una aventura (la validación la hace el motor). */
  function completarAventura(o) {
    var all = window.GALOIS_CAMPINA, world = +o.mundo, etapa = +o.etapa;
    if (!all || !(world >= 1 && world <= 10) || !(etapa >= 1 && etapa <= 5)) return null;
    var db = leer(), p = perfil(db), r = rpgDe(p), id = world + '-' + etapa, prev = r.aventuras[id];
    var mult = o.dificultad === 'maestro' ? 1.5 : o.dificultad === 'explorador' ? 1 : 1.25;
    var nivelAntes = nivelDe(r.xp), primera = !(prev && prev.hecha);
    var xp = Math.round((primera ? 40 + 20 * etapa : 10) * mult), monedas = primera ? 15 + 5 * etapa : 2;
    r.xp += xp; r.monedas += monedas;
    var errores = Math.max(0, +o.errores || 0);
    r.aventuras[id] = { hecha: true, mejor: prev && prev.hecha ? Math.min(prev.mejor, errores) : errores, dificultad: o.dificultad || 'aventurero' };
    p.retos[String(world)] = p.retos[String(world)] || {};
    p.retos[String(world)]['aventura-' + etapa] = true;
    var hitoId = 'm' + world + '-a' + etapa;
    r.hitos[hitoId] = true;
    var excelente = etapa === 5 && errores <= 1;
    var cartas = concederCartas(p, world, excelente).concat(concederPorHito(p, hitoId));
    var logros = comprobarLogros(p, r, { jefeSinErrores: etapa === 5 && errores === 0, maestro: o.dificultad === 'maestro' });
    guardar(db);
    return { xp: xp, monedas: monedas, cartas: cartas, logros: logros, primera: primera, nivel: nivelDe(r.xp), subeNivel: nivelDe(r.xp) > nivelAntes, insignia: etapa === 5 ? world : null };
  }
  function abrirCofre(id, monedas) {
    var db = leer(), p = perfil(db), r = rpgDe(p); id = String(id).slice(0, 40);
    if (r.cofres[id]) return null;
    r.cofres[id] = true; var m = Math.max(1, Math.min(30, +monedas || 10)); r.monedas += m;
    var logros = comprobarLogros(p, r); guardar(db); return { monedas: m, logros: logros };
  }
  function comprarPocion(precio) { var db = leer(), p = perfil(db), r = rpgDe(p); precio = precio || 15; if (r.monedas < precio) return false; r.monedas -= precio; r.inv.pocion++; guardar(db); return true; }
  function usarPocion() { var db = leer(), p = perfil(db), r = rpgDe(p); if (r.inv.pocion < 1) return false; r.inv.pocion--; guardar(db); return true; }

  /* ---------- Aviso animado de carta (también desde los minijuegos) ---------- */
  function cargarArte(cb) {
    if (window.GaloisArte) return cb();
    var cola = [];
    if (!window.GaloisSprites) cola.push(BASE + '../shared/galois-sprites.js');
    if (!window.GaloisEscenarios) cola.push(BASE + '../shared/galois-escenarios.js');
    cola.push(BASE + 'arte.js');
    (function sig() { if (!cola.length) return cb(); var s = document.createElement('script'); s.src = cola.shift(); s.onload = sig; s.onerror = cb; document.head.appendChild(s); })();
  }
  function estilos() {
    if (document.getElementById('galois-premio-css')) return;
    var st = document.createElement('style'); st.id = 'galois-premio-css';
    st.textContent = '#galois-premio{position:fixed;z-index:2147483600;bottom:18px;right:18px;max-width:340px;background:#27183d;color:#ffeec5;border:4px solid #f5bf54;box-shadow:6px 6px 0 #151020;padding:14px;font:20px system-ui,sans-serif;animation:gpIn .5s steps(6)}' +
      '#galois-premio .gp-cartas{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}#galois-premio .gp-c{width:72px;height:96px;perspective:400px}#galois-premio .gp-i{position:relative;width:100%;height:100%;transform-style:preserve-3d;animation:gpFlip 1s .3s both}' +
      '#galois-premio .gp-i img{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;backface-visibility:hidden}#galois-premio .gp-i img+img{transform:rotateY(180deg)}' +
      '@keyframes gpFlip{from{transform:rotateY(180deg)}to{transform:rotateY(0)}}@keyframes gpIn{from{transform:translateY(40px);opacity:0}}' +
      '@media (prefers-reduced-motion:reduce){#galois-premio,#galois-premio .gp-i{animation:none}}';
    document.head.appendChild(st);
  }
  function avisar(nuevas, logros) {
    logros = logros || [];
    if ((!nuevas || !nuevas.length) && !logros.length) return;
    if (!document.body) return;
    cargarArte(function () {
      estilos();
      var old = document.getElementById('galois-premio'); if (old) old.remove();
      var box = document.createElement('aside'); box.id = 'galois-premio'; box.setAttribute('role', 'status');
      var top = document.createElement('div'); top.style.fontWeight = 'bold';
      top.textContent = nuevas.length ? (nuevas.length > 1 ? '🃏 ¡' + nuevas.length + ' cartas desbloqueadas!' : '🃏 ¡Carta desbloqueada!') : '🏆 ¡Logro conseguido!';
      box.appendChild(top);
      if (nuevas.length && window.GaloisArte) {
        var row = document.createElement('div'); row.className = 'gp-cartas';
        nuevas.forEach(function (c) { var d = document.createElement('div'); d.className = 'gp-c'; d.innerHTML = '<div class="gp-i"><img alt=""><img alt=""></div>'; var im = d.querySelectorAll('img'); im[0].src = c.foto || window.GaloisArte.carta(c); im[0].alt = c.alt || c.nombre; im[1].src = window.GaloisArte.reverso(c.mundo); row.appendChild(d); });
        box.appendChild(row);
      }
      var p = document.createElement('p'); p.style.margin = '6px 0';
      p.textContent = nuevas.map(function (c) { return c.nombre; }).concat(logros.map(function (l) { return l.icono + ' ' + l.nombre; })).join(' · ');
      box.appendChild(p);
      var link = document.createElement('a'); link.textContent = 'Ver mi álbum ▶'; link.href = ALBUM_URL; link.style.cssText = 'color:#98e8f0;font-weight:bold'; box.appendChild(link);
      var close = document.createElement('button'); close.textContent = ' ×'; close.setAttribute('aria-label', 'Cerrar aviso'); close.style.cssText = 'background:transparent;border:0;color:white;font-size:24px;cursor:pointer'; close.onclick = function () { box.remove(); }; box.appendChild(close);
      document.body.appendChild(box);
    });
  }

  /* ---------- Hitos propios (contenido opcional) ---------- */
  function hitoHecho(id) { var db = leer(), p = perfil(db), r = rpgDe(p); return !!r.hitos[String(id || '').slice(0, 40)]; }
  function registrarHito(id, opts) {
    var all = window.GALOIS_CAMPINA; id = String(id || '').slice(0, 40);
    if (!all || !id) return null;
    opts = opts || {};
    var db = leer(), p = perfil(db), r = rpgDe(p), repetido = !!r.hitos[id];
    r.hitos[id] = true;
    var xp = repetido ? 0 : Math.max(0, Math.min(200, +opts.xp || 25));
    var monedas = repetido ? 0 : Math.max(0, Math.min(99, +opts.monedas || 10));
    r.xp += xp; r.monedas += monedas;
    var cartas = concederPorHito(p, id);
    var logros = comprobarLogros(p, r);
    guardar(db);
    if (!opts.silencio) avisar(cartas, logros);
    return { cartas: cartas, logros: logros, xp: xp, monedas: monedas, repetido: repetido };
  }

  window.GaloisColeccion = {
    activo: activo, seleccionar: function (s) { try { localStorage.setItem(ACTIVE, normal(s)); } catch (e) {} return activo(); },
    leer: leer, perfil: perfil, registrarResultado: registrarResultado, avisar: avisar, LOGROS: LOGROS,
    registrarHito: registrarHito, hitoHecho: hitoHecho,
    rpg: { estado: estado, preferencias: preferencias, completarAventura: completarAventura, abrirCofre: abrirCofre, comprarPocion: comprarPocion, usarPocion: usarPocion, nivelDe: nivelDe, xpNivel: xpNivel }
  };
})();
