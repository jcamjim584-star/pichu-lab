/* =====================================================================
   GALOIS LEGACY · motor de aventuras
   ---------------------------------------------------------------------
   Exploración libre (teclado y controles táctiles), diálogos, cofres del
   saber, combates matemáticos animados, construcción de monumentos y
   jefes en tres fases. Las recompensas solo se conceden cuando el motor
   ha validado todas las respuestas de una aventura.
   Depende de: galois-sprites, galois-escenarios, coleccion/datos.js,
   coleccion/bridge.js, coleccion/arte.js, aventura/retos.js y mundos.js.
   ===================================================================== */
(function () {
  'use strict';
  var S = window.GaloisSprites, E = window.GaloisEscenarios, D = window.GALOIS_CAMPINA, C = window.GaloisColeccion, RT = window.GaloisRetos, MW = window.GaloisMundos, GD = window.GALOIS;
  var T = 16, $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(location.search), PRUEBA = params.get('prueba') === '1';
  var REDUCIDO = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  var NOMBRE_ENEMIGO = { potenciator: 'Potenciator', radicosmico: 'Radicósmico', multiplax: 'Múltiplax', primox: 'Prímox', negatron: 'Negatrón', parentesis_maldito: 'Paréntesis Maldito', denominadoron: 'Denominadorón', simplifract: 'Simplifract', senor_escala: 'Señor Escala', porcentajin: 'Porcentajín', incognita_x: 'Incógnita X', polinomio_mutante: 'Polinomio Mutante', equilibrius: 'Equilibrius', despejador_oscuro: 'Despejador Oscuro', pendientor: 'Pendientor', parabola_vortice: 'Parábola Vórtice', mediana_traviesa: 'Mediana Traviesa', grafico_tramposo: 'Gráfico Tramposo', dado_caotico: 'Dado Caótico', ruleta_imposible: 'Ruleta Imposible' };
  var HABILIDAD = { galois: 'eliminar', sophie_germain: 'eliminar', al_juarismi: 'eliminar', gauss: 'doble', fibonacci: 'doble', hipatia: 'escudo', euler: 'pista', emmy_noether: 'pista', ada_lovelace: 'pista', ramanujan: 'pista', fermat: 'pista' };
  var DESC_HAB = { eliminar: 'descarta una respuesta incorrecta', doble: 'tu próximo acierto vale doble', escudo: 'el próximo fallo no te quita vida', pista: 'muestra una pista del reto' };
  var MUS = window.GaloisMusica || { tocar: function () {}, fase: function () {}, parar: function () {}, activar: function () {}, activa: function () { return false; }, volumen: function () { return 0; } };
  var DIF = { explorador: 0, aventurero: 1, maestro: 2 };
  var FASES = ['', 'Descubrir la regla', 'Resolver el desafío', 'Explicar y transferir'];

  /* ---------- Estado global ---------- */
  var G = {
    heroeId: 'galois', dif: 'aventurero', mundo: null, modo: 'campina', t: 0,
    jug: { x: 0, y: 0, dir: 'down', anim: 'idle', t0: 0 }, cam: { x: 0, y: 0 },
    teclas: {}, tactil: { dx: 0, dy: 0 }, correr: false, sonido: true,
    recogidos: {}, hablado: {}, batalla: null, dialogo: null
  };
  function heroesTodos() { return GD.heroes.concat(GD.aliados); }
  function estado() { return C.rpg.estado(); }
  var pruebaHechas = {};
  function hecha(m, e) { if (PRUEBA && pruebaHechas[m + '-' + e]) return true; var a = estado().aventuras[m + '-' + e]; return !!(a && a.hecha); }
  function docente() { try { return localStorage.getItem('galoisLegacy.docente') === '1'; } catch (e) { return false; } }
  function desbloqueado(m) { return m === 1 || hecha(m - 1, 5) || docente(); }
  function pendiente(m) { for (var e = 1; e <= 5; e++) if (!hecha(m, e)) return e; return 0; }
  /* ---------- Etapas paralelas ----------
     Un mundo puede declarar en coleccion/datos.js un grupo de etapas paralelas
     (en Fuentes, el Silo y la calle Carrera: [3, 4]). Esas etapas se abren a la
     vez y se pueden jugar en cualquier orden; el jefe sigue exigiendo las cuatro. */
  function paralelas(m) { var wd = D.mundos[m - 1]; return wd && Array.isArray(wd.paralelas) ? wd.paralelas : []; }
  function faltan(m) { var out = []; for (var e = 1; e <= 5; e++) if (!hecha(m, e)) out.push(e); return out; }
  function disponible(m, e) {
    if (hecha(m, e)) return false;
    var par = paralelas(m), tope = par.indexOf(e) >= 0 ? Math.min.apply(null, par) : e;
    for (var k = 1; k < tope; k++) if (!hecha(m, k)) return false;
    if (par.indexOf(e) < 0) for (var j = tope; j < e; j++) if (!hecha(m, j)) return false;
    return true;
  }
  function abiertas(m) { return faltan(m).filter(function (e) { return disponible(m, e); }); }
  function nombreEnemigo(id) { var n = W && W.datos && W.datos.nombres; return (n && n[id]) || NOMBRE_ENEMIGO[id] || id; }

  /* ---------- Sonido (sintetizado, sin archivos) ---------- */
  var AC = null;
  function tono(f, d, tipo, v, cuando) {
    if (!G.sonido) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    var o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + (cuando || 0);
    o.type = tipo || 'square'; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(v || .06, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d);
  }
  var SFX = {
    ok: function () { tono(660, .1); tono(880, .12, 'square', .06, .09); tono(1320, .15, 'square', .05, .18); },
    mal: function () { tono(220, .18, 'sawtooth', .05); tono(160, .25, 'sawtooth', .05, .12); },
    golpe: function () { tono(120, .12, 'triangle', .1); },
    cofre: function () { [523, 659, 784, 1046].forEach(function (f, i) { tono(f, .14, 'square', .05, i * .09); }); },
    paso: function () { tono(90, .03, 'triangle', .02); },
    habla: function () { tono(440 + Math.random() * 80, .03, 'square', .02); },
    victoria: function () { [523, 659, 784, 659, 784, 1046].forEach(function (f, i) { tono(f, .16, 'square', .05, i * .12); }); }
  };

  /* ---------- Lienzo ---------- */
  var cv = $('lienzo'), ctx = cv.getContext('2d'), ESC = 3, VW = 320, VH = 200;
  /* Parpadeo en iPhone y tableta (1.1): al andar con la cruceta, la barra del navegador
     aparece y desaparece y cada cambio de tamaño de la ventana borraba el lienzo. Ahora:
     1) solo se toca el lienzo si su tamaño en píxeles cambia de verdad;
     2) si cambia, se vuelve a pintar en ese mismo instante (nunca se ve vacío). */
  var tamPrevio = '';
  function ajustar() {
    var w = innerWidth, h = innerHeight;
    var esc = Math.max(2, Math.floor(Math.min(w, h) / 210)), vw = Math.ceil(w / esc), vh = Math.ceil(h / esc);
    var clave = vw + 'x' + vh + '@' + esc;
    if (clave === tamPrevio) return;
    tamPrevio = clave; ESC = esc; VW = vw; VH = vh;
    cv.width = VW; cv.height = VH; cv.style.width = VW * ESC + 'px'; cv.style.height = VH * ESC + 'px';
    ctx.imageSmoothingEnabled = false;
    pintarFotograma();
  }
  addEventListener('resize', ajustar);
  if (window.visualViewport) visualViewport.addEventListener('resize', ajustar);
  addEventListener('orientationchange', function () { setTimeout(ajustar, 250); });
  /* Mientras se juega, el dedo no debe arrastrar la página (eso es lo que mueve la barra
     del navegador). Los paneles con texto largo sí pueden desplazarse. */
  document.addEventListener('touchmove', function (e) {
    if (e.target.closest && e.target.closest('.reto,.menu,.campina,.premio,.portada,.eleccion')) return;
    e.preventDefault();
  }, { passive: false });
  function pintarFotograma() {
    if (W && !G.enRuta && (G.modo === 'mapa' || G.modo === 'dialogo')) dibujarMapa();
    else if (G.modo === 'batalla' && G.batalla) { try { dibujarBatalla(); } catch (e) {} }
  }

  /* ---------- Mundo cargado ---------- */
  var W = null, capas = [], solidos = null, edificios = [], vecinos = [], cofres = [], enemigos = [], fragmentos = [], jefe = null;
  function cargarMundo(id) {
    var def = MW.lista.find(function (m) { return m.id === id; }), wd = D.mundos[id - 1];
    W = { def: def, datos: wd, id: id };
    G.mundo = id; G.recogidos = {}; G.hablado = {};
    // capas de tiles (dos fotogramas para agua y trigo)
    // la capa 1 solo difiere en los tiles animados (agua y trigo): se copia la 0 y se repintan esos
    capas = [0, 1].map(function (f, k, arr) {
      var c = document.createElement('canvas'); c.width = MW.W * T; c.height = MW.H * T; var x = c.getContext('2d');
      if (f === 1) x.drawImage(arr.c0, 0, 0);
      for (var j = 0; j < MW.H; j++) for (var i = 0; i < MW.W; i++) { var ch = def.mapa.t[j][i]; if (f === 0 || (E.TILES[ch] && E.TILES[ch].anim)) x.drawImage(E.tile(ch, i, j, f), i * T, j * T); }
      if (f === 0) arr.c0 = c;
      return c;
    });
    solidos = []; for (var j = 0; j < MW.H; j++) { solidos.push([]); for (var i = 0; i < MW.W; i++) solidos[j].push(E.solido(def.mapa.t[j][i])); }
    edificios = def.edificios.map(function (b, k) {
      var ed = E.edificio(b.t, b.o); for (var j2 = b.y; j2 < b.y + ed.h; j2++) for (var i2 = b.x; i2 < b.x + ed.w; i2++) if (solidos[j2]) solidos[j2][i2] = !(b.paso && b.paso.indexOf(i2 - b.x) >= 0);
      return Object.assign({ k: k, w: ed.w, h: ed.h }, b);
    });
    var fsal = def.salida; solidos[fsal[1]][fsal[0]] = false;
    vecinos = def.vecinos.map(function (v) { return Object.assign({ hoja: E.hojaVecino(v.v), px: v.x * T + 8, py: v.y * T + 14, dirA: v.dir || 'down' }, v); });
    cofres = def.cofres.map(function (c) { return Object.assign({ abierto: estado().cofres.indexOf(c.id) >= 0, anim: 0 }, c); });
    fragmentos = def.fragmentos.map(function (p, i) { return { i: i, x: p[0] * T + 8, y: p[1] * T + 10 }; });
    G.jug.x = def.inicio[0] * T + 8; G.jug.y = def.inicio[1] * T + 14; G.jug.dir = 'up'; G.jug.salto = null; G.jug.golpe = 0; G.jug.alto = 0; particulas = [];
    prepararEnemigos();
    G.modo = 'mapa'; MUS.tocar('mundo', { mundo: id });
    $('campina').hidden = true; $('hud').hidden = false; $('controles').hidden = !tactilVisible();
    actualizarHUD();
    var ab = abiertas(id);
    if (rutaDe(id)) { entrarRuta(id); return; }
    mostrarAviso(wd.nombre + ' · ' + wd.lugar, ab.length ? (ab.length > 1 ? 'Rutas abiertas: ' + ab.map(function (e) { return wd.aventuras[e - 1].nombre; }).join(' · ') : 'Aventura ' + ab[0] + ': ' + wd.aventuras[ab[0] - 1].nombre) : '¡Mundo completado! Puedes repetir los retos para practicar.');
  }
  function prepararEnemigos() {
    var def = W.def, wd = W.datos, todo = faltan(W.id).length === 0;
    var sin = Array.isArray(wd.sinEnemigo) ? wd.sinEnemigo : [];   // etapas sin enemigo (encuentros)
    enemigos = [];
    if (sin.indexOf(2) < 0 && (todo || disponible(W.id, 2))) enemigos.push(nuevoEnemigo(wd.enemigos[0], def.enemigo2, 2, false));
    if (sin.indexOf(4) < 0 && (todo || disponible(W.id, 4))) enemigos.push(nuevoEnemigo(wd.enemigos[1], def.minijefe, 4, false));
    jefe = nuevoEnemigo(wd.jefe, def.jefe, 5, true);
  }
  function nuevoEnemigo(id, pos, etapa, esJefe) {
    return { id: id, etapa: etapa, jefe: esJefe, hoja: S.hojaEnemigo(id, esJefe ? { jefe: true, fase: 1 } : null), x0: pos[0] * T + 8, y0: pos[1] * T + 14, x: pos[0] * T + 8, y: pos[1] * T + 14, vx: 0, vy: 0, cambio: 0 };
  }

  /* ---------- Colisiones ---------- */
  function libre(x, y) {
    var pts = [[x - 5, y - 4], [x + 5, y - 4], [x - 5, y], [x + 5, y]];
    for (var k = 0; k < 4; k++) { var i = Math.floor(pts[k][0] / T), j = Math.floor(pts[k][1] / T); if (i < 0 || j < 0 || i >= MW.W || j >= MW.H) return false; if (solidos[j][i]) return false; }
    for (var v = 0; v < vecinos.length; v++) if (Math.abs(vecinos[v].px - x) < 10 && Math.abs(vecinos[v].py - y) < 7) return false;
    for (var c = 0; c < cofres.length; c++) if (Math.abs(cofres[c].x * T + 8 - x) < 11 && Math.abs(cofres[c].y * T + 12 - y) < 8) return false;
    if (jefe && Math.abs(jefe.x - x) < 18 && Math.abs(jefe.y - y) < 9) return false;
    return true;
  }

  /* ---------- Entrada ---------- */
  var MAPA_TECLAS = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
  addEventListener('keydown', function (e) {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (MAPA_TECLAS[e.code]) { G.teclas[MAPA_TECLAS[e.code]] = true; if (G.modo === 'mapa') e.preventDefault(); }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') G.correr = true;
    if ((e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') && !e.repeat) { if (G.modo === 'mapa') { e.preventDefault(); accion(); } else if (G.modo === 'dialogo') { e.preventDefault(); avanzarDialogo(); } }
    if ((e.code === 'KeyX' || e.code === 'KeyJ') && !e.repeat && G.modo === 'mapa') atacar();
    if ((e.code === 'KeyC' || e.code === 'KeyK') && !e.repeat && G.modo === 'mapa') saltar();
    if (e.code === 'Escape' && G.modo === 'mapa') abrirMenu('misiones');
  });
  addEventListener('keyup', function (e) { if (MAPA_TECLAS[e.code]) G.teclas[MAPA_TECLAS[e.code]] = false; if (/Shift/.test(e.code)) G.correr = false; });
  function tactilVisible() { try { var v = localStorage.getItem('galoisLegacy.tactil'); if (v) return v === '1'; } catch (e) {} return matchMedia('(pointer: coarse)').matches; }
  // cruceta táctil
  (function () {
    var pad = $('cruceta'), activo = null;
    function mover(ev) {
      var r = pad.getBoundingClientRect(), t = ev.touches ? ev.touches[0] : ev, dx = t.clientX - (r.left + r.width / 2), dy = t.clientY - (r.top + r.height / 2), n = Math.hypot(dx, dy);
      if (n < 8) { G.tactil.dx = G.tactil.dy = 0; return; }
      G.tactil.dx = dx / n; G.tactil.dy = dy / n; G.correr = n > r.width * .42;
    }
    function fin() { G.tactil.dx = G.tactil.dy = 0; G.correr = false; activo = null; }
    pad.addEventListener('pointerdown', function (e) { activo = e.pointerId; pad.setPointerCapture(e.pointerId); mover(e); e.preventDefault(); });
    pad.addEventListener('pointermove', function (e) { if (activo === e.pointerId) mover(e); });
    pad.addEventListener('pointerup', fin); pad.addEventListener('pointercancel', fin);
    $('botonB').addEventListener('pointerdown', function (e) { e.preventDefault(); if (G.modo === 'mapa') atacar(); });
    $('botonS').addEventListener('pointerdown', function (e) { e.preventDefault(); if (G.modo === 'mapa') saltar(); });
    $('botonA').addEventListener('pointerdown', function (e) { e.preventDefault(); if (G.modo === 'mapa') accion(); else if (G.modo === 'dialogo') avanzarDialogo(); });
  })();
  cv.addEventListener('pointerdown', function () { if (G.modo === 'dialogo') avanzarDialogo(); });

  /* ---------- Bucle ---------- */
  var ultimo = performance.now(), modoDentro = null;
  function bucle(ahora) {
    ajustar();   // por si el navegador cambió el tamaño sin avisar (Safari en iOS)
    // «en-juego»: dentro de un pueblo o combate (la insignia «◀ Mapa» de πCHU LAB se esconde para no tapar la cruceta)
    var dentro = !/^(portada|eleccion|campina)$/.test(G.modo || '');
    if (dentro !== modoDentro) { modoDentro = dentro; document.documentElement.classList.toggle('en-juego', dentro); }
    var dt = Math.min(.05, (ahora - ultimo) / 1000); ultimo = ahora; G.t += dt;
    if (G.enRuta && G.modo === 'mapa') volverARuta();
    if (G.enRuta) { var rh = G.modo === 'batalla'; if ($('ruta').hidden !== rh) $('ruta').hidden = rh; }
    if (G.enRuta && G.modo !== 'batalla') { /* en el recorrido no hay exploración libre */ }
    else if (G.modo === 'mapa' || G.modo === 'dialogo') { if (G.modo === 'mapa') actualizarMapa(dt); actualizarEnemigos(dt); dibujarMapa(); }
    else if (G.modo === 'batalla') { actualizarBatalla(dt); dibujarBatalla(); }
    else if (G.modo === 'campina') { ctx.fillStyle = '#0c1424'; ctx.fillRect(0, 0, VW, VH); }
    requestAnimationFrame(bucle);
  }

  var pasoT = 0;
  function actualizarMapa(dt) {
    var dx = (G.teclas.right ? 1 : 0) - (G.teclas.left ? 1 : 0) + G.tactil.dx, dy = (G.teclas.down ? 1 : 0) - (G.teclas.up ? 1 : 0) + G.tactil.dy;
    var n = Math.hypot(dx, dy), J = G.jug, anim = 'idle';
    if (J.salto) { var u = Math.min(1, (G.t - J.salto.t) / .5); J.x = J.salto.x0 + (J.salto.x1 - J.salto.x0) * u; J.y = J.salto.y0 + (J.salto.y1 - J.salto.y0) * u; J.alto = Math.sin(u * Math.PI) * (J.salto.x1 === J.salto.x0 && J.salto.y1 === J.salto.y0 ? 5 : 12); if (u >= 1) { J.salto = null; J.alto = 0; J.anim = 'idle'; } }
    else if (J.golpe && G.t - J.golpe < .5) { /* atacando: quieto */ }
    else if (n > .2) {
      dx /= Math.max(1, n); dy /= Math.max(1, n);
      var v = (G.correr ? 105 : 62) * dt;
      if (Math.abs(dx) > Math.abs(dy)) J.dir = dx > 0 ? 'right' : 'left'; else J.dir = dy > 0 ? 'down' : 'up';
      var nx = J.x + dx * v, ny = J.y + dy * v;
      if (libre(nx, J.y)) J.x = nx; if (libre(J.x, ny)) J.y = ny;
      anim = G.correr ? 'run' : 'walk';
      pasoT += dt; if (pasoT > (G.correr ? .18 : .28)) { pasoT = 0; SFX.paso(); }
    }
    if (!J.salto && !(J.golpe && G.t - J.golpe < .5) && anim !== J.anim) { J.anim = anim; J.t0 = G.t; }
    particulas = particulas.filter(function (q) { return G.t - q.t < .5; });
    // recoger fragmentos (solo si la aventura 1 está activa y ya se habló con el vecino)
    if (pendiente(W.id) === 1 && G.hablado.mision1) fragmentos.forEach(function (f) { if (!G.recogidos[f.i] && Math.abs(f.x - J.x) < 10 && Math.abs(f.y - J.y) < 12) { G.recogidos[f.i] = true; SFX.cofre(); var n2 = Object.keys(G.recogidos).length; mostrarAviso('Fragmento ' + n2 + ' de 3', n2 === 3 ? 'Vuelve con ' + vecinoMision().nombre : ''); actualizarHUD(); } });
    // salida
    var s = W.def.salida; if (Math.abs(J.x - (s[0] * T + 8)) < 12 && J.y > s[1] * T + 6) { abrirCampina(); return; }
    // enemigos
    if (!J.salto) enemigos.forEach(function (e) { if (Math.abs(e.x - J.x) < 13 && Math.abs(e.y - J.y) < 10) iniciarAventura(e.etapa, e); });
    // cámara
    G.cam.x = Math.max(0, Math.min(MW.W * T - VW, J.x - VW / 2)); G.cam.y = Math.max(0, Math.min(MW.H * T - VH, J.y - VH / 2));
    if (MW.W * T < VW) G.cam.x = (MW.W * T - VW) / 2; if (MW.H * T < VH) G.cam.y = (MW.H * T - VH) / 2;
  }
  function actualizarEnemigos(dt) {
    enemigos.forEach(function (e) {
      if (e.aturdido > G.t) return;
      e.cambio -= dt;
      if (e.cambio <= 0) { e.cambio = 1 + Math.random() * 1.5; var a = Math.random() * Math.PI * 2; e.vx = Math.random() < .3 ? 0 : Math.cos(a) * 22; e.vy = Math.random() < .3 ? 0 : Math.sin(a) * 22; }
      var nx = e.x + e.vx * dt, ny = e.y + e.vy * dt;
      if (Math.hypot(nx - e.x0, ny - e.y0) < 34 && libre(nx, ny)) { e.x = nx; e.y = ny; } else e.cambio = 0;
    });
  }

  /* ---------- Atacar y saltar en la exploración ---------- */
  var particulas = [];
  function atacar() {
    var J = G.jug; if (J.salto || (J.golpe && G.t - J.golpe < .5)) return;
    J.golpe = G.t; J.anim = 'attack'; J.t0 = G.t; SFX.golpe();
    var p = delante();
    enemigos.forEach(function (e) { if (Math.abs(e.x - p.x) < 18 && Math.abs(e.y - 6 - p.y) < 18 && !(e.aturdido > G.t)) { e.aturdido = G.t + 3; e.sorpresa = true; e.vx = e.vy = 0; mostrarAviso('¡Enemigo aturdido!', 'Tócalo ahora: empezarás el combate con un escudo.'); SFX.ok(); } });
    var i = Math.floor(p.x / T), j = Math.floor((p.y + 2) / T), ch = W.def.mapa.t[j] && W.def.mapa.t[j][i];
    if (ch && E.TILES[ch] && E.TILES[ch].cortable) {
      W.def.mapa.t[j][i] = '.'; solidos[j][i] = false;
      capas.forEach(function (c, f) { c.getContext('2d').drawImage(E.tile('.', i, j, f), i * T, j * T); });
      for (var k = 0; k < 10; k++) particulas.push({ x: i * T + 8, y: j * T + 8, vx: (Math.random() - .5) * 30, vy: -Math.random() * 25, t: G.t, c: k % 2 ? '#3f7a2a' : '#87c45a' });
      SFX.paso();
    }
  }
  function saltar() {
    var J = G.jug; if (J.salto || (J.golpe && G.t - J.golpe < .5)) return;
    var d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[J.dir], x1 = J.x + d[0] * 32, y1 = J.y + d[1] * 32;
    // se puede saltar por encima de obstáculos bajos (vallas, rocas, macetas) si se cae en sitio libre
    var ok = libre(x1, y1);
    for (var s = 4; ok && s < 32; s += 4) { var x = J.x + d[0] * s, y = J.y + d[1] * s - 2, i = Math.floor(x / T), j = Math.floor(y / T), ch = W.def.mapa.t[j] && W.def.mapa.t[j][i]; if (solidos[j] && solidos[j][i] && !E.saltable(ch)) ok = false; }
    if (!ok) { x1 = J.x; y1 = J.y; }
    J.salto = { t: G.t, x0: J.x, y0: J.y, x1: x1, y1: y1 }; J.anim = 'jump'; J.t0 = G.t; tono(330, .08, 'square', .04); tono(495, .1, 'square', .04, .06);
  }

  /* ---------- Interacción ---------- */
  function delante() { var J = G.jug, d = { up: [0, -12], down: [0, 12], left: [-12, 0], right: [12, 0] }[J.dir]; return { x: J.x + d[0], y: J.y - 4 + d[1] }; }
  function vecinoMision() { return vecinos.find(function (v) { return v.aventura === 1; }); }
  function accion() {
    var p = delante(), J = G.jug;
    var v = vecinos.find(function (v) { return Math.abs(v.px - p.x) < 12 && Math.abs(v.py - 6 - p.y) < 14; });
    if (v) { v.dirA = { up: 'down', down: 'up', left: 'right', right: 'left' }[J.dir]; return hablar(v); }
    var c = cofres.find(function (c) { return Math.abs(c.x * T + 8 - p.x) < 12 && Math.abs(c.y * T + 8 - p.y) < 12; });
    if (c) return abrirCofre(c);
    if (jefe && Math.abs(jefe.x - p.x) < 22 && Math.abs(jefe.y - 10 - p.y) < 22) return hablarJefe();
    var i = Math.floor(p.x / T), j = Math.floor((p.y + 2) / T);
    var b = edificios.find(function (b) { return i >= b.x && i < b.x + b.w && j >= b.y && j < b.y + b.h; });
    if (b) {
      if (b.obra && (disponible(W.id, 3) || faltan(W.id).length === 0)) return dialogo([{ quien: b.nombre, txt: W.datos.aventuras[2].historia + ' Resuelve los retos para ponerlo a punto.' }], function () { iniciarAventura(3); });
      if (b.obra && !hecha(W.id, 3)) return dialogo([{ quien: b.nombre, txt: 'Está en obras: hay andamios y piezas por colocar. Vuelve cuando hayas avanzado en las aventuras anteriores.' }]);
      return dialogo([{ quien: b.nombre || 'Edificio', txt: b.texto || 'Una casa encalada con rejas de forja y macetas.' }]);
    }
  }
  function lineas(v) { return v.dialogo.map(function (t) { return { quien: v.nombre, txt: t, v: v }; }); }
  /* Encargos opcionales: siguen disponibles también después de cerrar la historia
     y conceden su carta una sola vez (el control lo lleva GaloisColeccion). */
  function hablarEncargo(v) {
    var enc = (W.datos.opcionales || []).find(function (o) { return o.hito === v.encargo; }) || {};
    if (C.hitoHecho && C.hitoHecho(v.encargo)) return dialogo([{ quien: v.nombre, txt: v.hecho || 'Esto ya está hecho. ¡Gracias!', v: v }]);
    dialogo(lineas(v), function () { iniciarAventura(0, null, v, { encargo: v.encargo, nombre: enc.nombre || 'Encargo del pueblo', etapa: enc.retoEtapa || 1, preguntas: 2, monedas: 10 }); });
  }
  function hablar(v) {
    var wd = W.datos, p = pendiente(W.id);
    if (v.tienda) return dialogo(lineas(v), function () { abrirMenu('tienda'); });
    if (v.encargo) return hablarEncargo(v);
    if (v.aventura === 1 && disponible(W.id, 1)) {
      var n = Object.keys(G.recogidos).length;
      if (!G.hablado.mision1) { G.hablado.mision1 = true; return dialogo(lineas(v), function () { actualizarHUD(); }); }
      if (n < 3) return dialogo([{ quien: v.nombre, txt: v.pedido + ' (' + n + '/3)', v: v }]);
      return dialogo([{ quien: v.nombre, txt: v.listo, v: v }], function () { iniciarAventura(1, null, v); });
    }
    if (v.aventura > 1 && (disponible(W.id, v.aventura) || faltan(W.id).length === 0)) {
      return dialogo(lineas(v).concat(v.listo ? [{ quien: v.nombre, txt: v.listo, v: v }] : []), function () { iniciarAventura(v.aventura, null, v); });
    }
    if (v.aventura && !hecha(W.id, v.aventura)) {
      var antes = faltan(W.id).filter(function (e) { return e < v.aventura && paralelas(W.id).indexOf(e) < 0; });
      return dialogo([{ quien: v.nombre, txt: 'Todavía no puede ser: antes hay que terminar «' + wd.aventuras[(antes[0] || 1) - 1].nombre + '».', v: v }]);
    }
    if (v.aventura) return dialogo([{ quien: v.nombre, txt: p === 0 ? '¡Has restaurado la pieza del Compás de este mundo! Gracias, ' + heroe().corto + '.' : 'Sigue adelante: ' + wd.aventuras[p - 1].historia, v: v }]);
    dialogo(lineas(v));
  }
  function hablarJefe() {
    var pend = faltan(W.id).filter(function (e) { return e < 5; });
    if (pend.length) return dialogo([{ quien: nombreEnemigo(W.datos.jefe), txt: '¡Ja! Aún no puedes desafiarme. Te falta' + (pend.length > 1 ? 'n' : '') + ': ' + pend.map(function (e) { return '«' + W.datos.aventuras[e - 1].nombre + '»'; }).join(' y ') + '.' }]);
    dialogo([{ quien: nombreEnemigo(W.datos.jefe), txt: W.datos.aventuras[4].historia + ' ¡Prepárate para un combate en tres fases!' }], function () { iniciarAventura(5, jefe); });
  }
  function abrirCofre(c) {
    if (c.abierto) return dialogo([{ quien: 'Cofre', txt: 'Este cofre ya está vacío.' }]);
    dialogo([{ quien: 'Cofre del saber', txt: 'Un cofre cerrado con un candado numérico. Resuelve un reto para abrirlo.' }], function () { iniciarAventura(0, null, null, c); });
  }

  /* ---------- Diálogos ---------- */
  function dialogo(lineas, alFinal) { G.dialogo = { l: lineas, i: 0, fin: alFinal, letras: 0 }; G.modo = 'dialogo'; pintarDialogo(); }
  function pintarDialogo() {
    var d = G.dialogo, l = d.l[d.i];
    $('dialogo').hidden = false; $('dQuien').textContent = l.quien; $('dTexto').textContent = '';
    var txt = l.txt, k = 0; clearInterval(d.int);
    if (REDUCIDO) { $('dTexto').textContent = txt; return; }
    d.int = setInterval(function () { k += 2; $('dTexto').textContent = txt.slice(0, k); if (k % 6 === 0) SFX.habla(); if (k >= txt.length) clearInterval(d.int); }, 22);
  }
  function avanzarDialogo() {
    var d = G.dialogo; if (!d) return;
    var l = d.l[d.i]; if ($('dTexto').textContent.length < l.txt.length) { clearInterval(d.int); $('dTexto').textContent = l.txt; return; }
    d.i++; if (d.i < d.l.length) return pintarDialogo();
    $('dialogo').hidden = true; G.dialogo = null; G.modo = 'mapa'; if (d.fin) d.fin();
  }
  $('dialogo').addEventListener('click', avanzarDialogo);

  /* ---------- Avisos ---------- */
  var avisoT = null;
  function mostrarAviso(t, sub) { var a = $('aviso'); a.innerHTML = '<b>' + esc(t) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : ''); a.hidden = false; a.classList.remove('sale'); void a.offsetWidth; a.classList.add('sale'); clearTimeout(avisoT); avisoT = setTimeout(function () { a.hidden = true; }, 3800); }

  /* =====================================================================
     AVENTURAS Y COMBATES
     ===================================================================== */
  function heroe() { return heroesTodos().find(function (h) { return h.id === G.heroeId; }) || GD.heroes[0]; }
  function vidasMax() { return Math.min(6, 3 + Math.floor((estado().nivel - 1) / 3)); }
  function iniciarAventura(etapa, enem, vecino, cofre) {
    var wd = W.datos, dif = DIF[G.dif], qs;
    if (cofre) qs = RT.preguntas(W.id, cofre.etapa || (1 + Math.floor(Math.random() * 3)), dif).slice(0, cofre.preguntas || 1);
    else qs = RT.preguntas(W.id, etapa, dif);
    var sinEnem = Array.isArray(wd.sinEnemigo) ? wd.sinEnemigo : [];
    var enemigoId = cofre || sinEnem.indexOf(etapa) >= 0 ? null : etapa === 2 ? wd.enemigos[0] : etapa === 4 ? wd.enemigos[1] : etapa === 5 ? wd.jefe : null;
    var tipo = cofre ? 'cofre' : etapa === 3 ? 'construccion' : enemigoId ? 'combate' : 'exploracion';
    var B = G.batalla = {
      etapa: etapa, tipo: tipo, cofre: cofre, preguntas: qs, i: 0, errores: 0, aciertos: 0, necesarios: qs.length,
      vidas: vidasMax(), vidasMax: vidasMax(), fase: etapa === 5 ? 1 : 0, enemigoId: enemigoId, jefe: etapa === 5,
      hojaE: enemigoId ? S.hojaEnemigo(enemigoId, etapa === 5 ? { jefe: true, fase: 1 } : null) : null,
      hojaV: vecino ? vecino.hoja : null, vecino: vecino || null, encargo: cofre && cofre.encargo ? cofre.encargo : null,
      hA: 'idle', hT: 0, eA: 'idle', eT: 0, proy: [], textos: [], sacudir: 0,
      escudo: false, doble: false, habUsada: false, pistasUsadas: 0, ent: enem, terminado: false
    };
    if (enem && enem.sorpresa && !enem.jefe) { B.escudo = true; B.textos.push({ txt: '¡SORPRESA! 🛡', t: G.t, lado: 'c' }); enem.sorpresa = false; }
    G.modo = 'batalla'; G.teclas = {}; MUS.tocar(etapa === 5 ? 'jefe' : tipo === 'combate' ? 'combate' : 'reto', { mundo: W.id }); G.tactil.dx = G.tactil.dy = 0;
    $('controles').hidden = true; $('hud').hidden = true; $('aviso').hidden = true; $('reto').hidden = false;
    var titulo = cofre ? (cofre.encargo ? cofre.nombre : 'Cofre del saber') : 'Aventura ' + etapa + ' · ' + wd.aventuras[etapa - 1].nombre;
    $('rTitulo').textContent = titulo;
    $('rTipo').textContent = cofre ? (cofre.encargo ? 'Encargo opcional del pueblo' : 'Reto del candado') : wd.aventuras[etapa - 1].tipo + (enemigoId ? ' contra ' + nombreEnemigo(enemigoId) : '');
    siguientePregunta();
  }

  function siguientePregunta() {
    var B = G.batalla, q = B.preguntas[B.i];
    if (!q) return victoria();
    if (B.jefe && q.fase !== B.fase) cambiarFase(q.fase);
    B.q = q; B.opciones = construirOpciones(q); B.respondida = false;
    pintarPregunta();
  }
  function construirOpciones(q) {
    var n = G.dif === 'explorador' ? 3 : 4, ds = q.distractores.slice();
    for (var i = ds.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = ds[i]; ds[i] = ds[j]; ds[j] = t; }
    var ops = [q.respuesta].concat(ds.slice(0, n - 1));
    for (var k = ops.length - 1; k > 0; k--) { var m = Math.floor(Math.random() * (k + 1)); var u = ops[k]; ops[k] = ops[m]; ops[m] = u; }
    return ops;
  }
  // En pantallas táctiles (tableta y móvil) nunca se muestra teclado: el modo Maestro usa 4 opciones.
  var SIN_TECLADO = matchMedia('(pointer: coarse)').matches || matchMedia('(hover: none)').matches;
  function escribir() { return !SIN_TECLADO && G.dif === 'maestro' && G.batalla.q.numerica; }
  function pintarPregunta() {
    var B = G.batalla, q = B.q;
    $('rFase').textContent = B.jefe ? 'Fase ' + B.fase + ' de 3 · ' + FASES[B.fase] : '';
    $('rProgreso').textContent = (B.tipo === 'combate' ? 'Vida del enemigo: ' : 'Progreso: ') + (B.necesarios - B.aciertos) + ' / ' + B.necesarios;
    $('rTexto').textContent = q.texto;
    $('rVisual').innerHTML = q.visual ? visual(q.visual) : '';
    $('rExpl').hidden = true; $('rPista').hidden = true;
    var o = $('rOpciones'); o.innerHTML = '';
    if (escribir()) {
      o.innerHTML = '<div class="teclado"><output id="rEntrada" aria-live="polite"></output><div class="teclas">' + ['7', '8', '9', '4', '5', '6', '1', '2', '3', '−', '0', '/'].map(function (k) { return '<button type="button" data-k="' + k + '">' + k + '</button>'; }).join('') + '<button type="button" data-k="⌫" aria-label="Borrar">⌫</button><button type="button" class="ok" data-k="ok">Comprobar ✔</button></div></div>';
      o.querySelectorAll('[data-k]').forEach(function (b) { b.onclick = function () { var k = b.dataset.k, out = $('rEntrada'); if (k === 'ok') return responder(out.textContent); if (k === '⌫') out.textContent = out.textContent.slice(0, -1); else if (out.textContent.length < 8) out.textContent += k; }; });
    } else {
      B.opciones.forEach(function (op, i) { var b = document.createElement('button'); b.type = 'button'; b.className = 'op'; b.textContent = op; b.dataset.op = op; b.onclick = function () { responder(op, b); }; o.appendChild(b); });
    }
    var h = heroe(), hab = HABILIDAD[h.id] || 'pista';
    $('rHab').hidden = B.tipo === 'cofre'; $('rHab').disabled = B.habUsada; $('rHab').textContent = '✦ ' + h.habilidad + ' (' + DESC_HAB[hab] + ')';
    var maxPistas = G.dif === 'explorador' ? 99 : G.dif === 'aventurero' ? 2 : 0;
    $('rPistaBtn').hidden = maxPistas === 0; $('rPistaBtn').disabled = B.pistasUsadas >= maxPistas;
    $('rPocion').textContent = '🧪 Poción (' + estado().inv.pocion + ')'; $('rPocion').disabled = estado().inv.pocion < 1 || B.vidas >= B.vidasMax || B.tipo === 'cofre';
    pintarVidas();
    var first = o.querySelector('button'); if (first && !('ontouchstart' in window)) first.focus({ preventScroll: true });
  }
  function visual(v) {
    if (v.tipo === 'barra') { var s = '<div class="vis-barra" aria-hidden="true">'; for (var i = 0; i < v.partes; i++) s += '<i class="' + (i < v.marcadas ? 'on' : '') + '"></i>'; return s + '</div>'; }
    if (v.tipo === 'barras' || v.tipo === 'frecuencias') {
      var datos = v.datos, cuenta = {}; if (v.tipo === 'frecuencias') { datos.forEach(function (d) { cuenta[d] = (cuenta[d] || 0) + 1; }); }
      var ks = v.tipo === 'frecuencias' ? Object.keys(cuenta).sort() : datos.map(function (_, i) { return i; }), mx = Math.max.apply(null, v.tipo === 'frecuencias' ? ks.map(function (k) { return cuenta[k]; }) : datos);
      if (v.tipo === 'frecuencias') return '<div class="vis-graf" aria-hidden="true">' + ks.map(function (k) { return '<span><i style="height:0"></i><b>' + k + '</b></span>'; }).join('') + '</div><small>Completa tú las alturas: cuenta los datos.</small>';
      return '<div class="vis-graf" aria-hidden="true">' + ks.map(function (k) { return '<span><i style="height:' + Math.round(datos[k] / mx * 100) + '%"></i><b>' + k + '</b></span>'; }).join('') + '</div>';
    }
    if (v.tipo === 'truncado') return '<div class="vis-graf trunc" aria-hidden="true"><span><i style="height:' + ((v.a - 95) / (v.b - 95 + 1) * 100) + '%"></i><b>A</b></span><span><i style="height:' + ((v.b - 95) / (v.b - 95 + 1) * 100) + '%"></i><b>B</b></span><em>95</em></div>';
    if (v.tipo === 'plano') { var cx = 50 + v.x * 7, cy = 50 - v.y * 7; return '<svg class="vis-plano" viewBox="0 0 100 100" aria-hidden="true"><path d="M0 50H100M50 0V100" stroke="#fbf0d6" stroke-width="1.5"/><path d="' + [10, 20, 30, 40, 60, 70, 80, 90].map(function (k) { return 'M' + k + ' 0V100M0 ' + k + 'H100'; }).join('') + '" stroke="#fff3" stroke-width=".5"/><text x="74" y="22" fill="#f2c14e" font-size="10">I</text><text x="20" y="22" fill="#f2c14e" font-size="10">II</text><text x="18" y="86" fill="#f2c14e" font-size="10">III</text><text x="72" y="86" fill="#f2c14e" font-size="10">IV</text><rect x="' + (cx - 3) + '" y="' + (cy - 3) + '" width="6" height="6" fill="#ff6a6a"/></svg>'; }
    return '';
  }
  function pintarVidas() {
    var B = G.batalla, s = ''; for (var i = 0; i < B.vidasMax; i++) s += '<i class="' + (B.vidas >= i + 1 ? 'on' : B.vidas > i ? 'medio' : '') + '"></i>';
    $('rVidas').innerHTML = s; $('rVidas').setAttribute('aria-label', 'Vida: ' + B.vidas + ' de ' + B.vidasMax);
  }
  function animH(a) { var B = G.batalla; B.hA = a; B.hT = G.t; }
  function animE(a) { var B = G.batalla; B.eA = a; B.eT = G.t; }

  function responder(valor, boton) {
    var B = G.batalla; if (B.respondida || B.terminado) return;
    if (escribir() && !String(valor).trim()) return;
    B.respondida = true;
    var ok = RT.igual(valor, B.q.respuesta);
    $('rOpciones').querySelectorAll('button').forEach(function (b) { b.disabled = true; if (b.dataset.op != null && RT.igual(b.dataset.op, B.q.respuesta)) b.classList.add('bien'); });
    if (ok) {
      SFX.ok(); var dmg = B.doble ? 2 : 1; B.doble = false; B.aciertos = Math.min(B.necesarios, B.aciertos + dmg);
      animH(B.tipo === 'combate' ? 'attack' : 'cast');
      // Con enemigo se lanza el símbolo; sin enemigo el personaje hace un gesto
      // (nada de «tirar una piedra» a un vecino o a un monumento).
      if (B.enemigoId) setTimeout(function () { B.proy.push({ de: 'h', t: G.t, txt: '✦' }); }, 250);
      else setTimeout(chispear, 180);
      setTimeout(function () {
        if (B.enemigoId) { animE('hurt'); SFX.golpe(); B.sacudir = .25; }
        else { animH('jump'); SFX.cofre(); }
        B.textos.push({ txt: dmg > 1 ? '¡DOBLE!' : '¡BIEN!', t: G.t, lado: B.enemigoId ? 'e' : 'h' });
      }, 520);
      $('rExpl').hidden = false; $('rExpl').className = 'expl ok'; $('rExpl').innerHTML = '<b>✔ ¡Correcto!</b> ' + esc(B.q.explicacion) + '<button type="button" id="rSeguir">Continuar ▶</button>';
      if (boton) boton.classList.add('bien');
      B.i++;
      // si el «doble» completa antes la fase del jefe, se salta a la siguiente fase
      if (B.jefe) { var vistos = B.preguntas.slice(0, B.i).length; if (B.aciertos >= vistos + 0 && dmg > 1) { var faseAct = B.q.fase; while (B.preguntas[B.i] && B.preguntas[B.i].fase === faseAct) B.i++; } }
      else if (dmg > 1 && B.aciertos >= B.necesarios) B.i = B.preguntas.length;
    } else {
      SFX.mal(); B.errores++;
      if (boton) boton.classList.add('mal');
      var dano = B.escudo ? 0 : G.dif === 'explorador' ? .5 : 1; B.escudo = false;
      if (B.tipo === 'cofre') dano = 0;
      if (B.enemigoId) { animE('attack'); setTimeout(function () { var tok = (S.enemigos[B.enemigoId].ataque || ['?'])[Math.floor(Math.random() * 3) % (S.enemigos[B.enemigoId].ataque || ['?']).length]; B.proy.push({ de: 'e', t: G.t, txt: tok.replace('^', '²').replace('v', '√') }); }, 250); }
      setTimeout(function () { if (dano) { animH('hurt'); B.sacudir = .3; } B.textos.push({ txt: dano ? '−' + (dano === .5 ? '½' : '1') + ' ♥' : '¡Protegido!', t: G.t, lado: 'h' }); B.vidas = Math.max(0, B.vidas - dano); pintarVidas(); }, 560);
      $('rExpl').hidden = false; $('rExpl').className = 'expl mal';
      $('rExpl').innerHTML = '<b>✘ No es correcto.</b> Respuesta correcta: <strong>' + esc(B.q.respuesta) + '</strong>. ' + esc(B.q.explicacion) + '<button type="button" id="rSeguir">Entendido: otro reto ▶</button>';
      // la pregunta fallada se sustituye por otra parecida (no se puede ganar memorizando)
      var yaVistas = B.preguntas.map(function (p) { return p && p.texto; });
      var nueva = RT.preguntas(W.id, B.etapa || 1, DIF[G.dif], null, yaVistas).filter(function (x) { return !B.jefe || x.fase === B.q.fase; })[0];
      if (nueva) { if (B.jefe) nueva.fase = B.q.fase; B.preguntas[B.i] = nueva; }
    }
    $('rSeguir').onclick = function () { if (B.vidas <= 0) return derrota(); siguientePregunta(); };
    $('rSeguir').focus({ preventScroll: true });
    PRUEBA && (window.__GL.ultima = ok);
  }
  function cambiarFase(f) {
    var B = G.batalla; B.fase = f; MUS.fase(f); B.hojaE = S.hojaEnemigo(B.enemigoId, { jefe: true, fase: f });
    B.sacudir = .6; B.textos.push({ txt: 'FASE ' + f + ': ' + FASES[f].toUpperCase(), t: G.t, lado: 'c' }); animE('attack'); SFX.mal();
  }
  $('rHab').onclick = function () {
    var B = G.batalla; if (B.habUsada) return; B.habUsada = true; $('rHab').disabled = true;
    var hab = HABILIDAD[heroe().id] || 'pista'; animH('cast'); SFX.ok();
    if (hab === 'eliminar' && !escribir()) { var malas = [].slice.call($('rOpciones').querySelectorAll('.op')).filter(function (b) { return !RT.igual(b.dataset.op, B.q.respuesta) && !b.disabled; }); if (malas[0]) { malas[0].disabled = true; malas[0].classList.add('tachada'); } }
    else if (hab === 'doble') { B.doble = true; B.textos.push({ txt: '×2', t: G.t, lado: 'h' }); }
    else if (hab === 'escudo') { B.escudo = true; B.textos.push({ txt: '🛡', t: G.t, lado: 'h' }); }
    else { $('rPista').hidden = false; $('rPista').textContent = '💡 ' + B.q.pista; }
  };
  $('rPistaBtn').onclick = function () { var B = G.batalla; B.pistasUsadas++; $('rPista').hidden = false; $('rPista').textContent = '💡 ' + B.q.pista; var max = G.dif === 'explorador' ? 99 : 2; $('rPistaBtn').disabled = B.pistasUsadas >= max; };
  $('rPocion').onclick = function () { var B = G.batalla; if (B.vidas >= B.vidasMax) return; if (C.rpg.usarPocion()) { B.vidas = Math.min(B.vidasMax, B.vidas + 2); pintarVidas(); B.textos.push({ txt: '+2 ♥', t: G.t, lado: 'h' }); SFX.cofre(); $('rPocion').textContent = '🧪 Poción (' + estado().inv.pocion + ')'; $('rPocion').disabled = estado().inv.pocion < 1 || B.vidas >= B.vidasMax; actualizarHUD(); } };
  $('rHuir').onclick = function () { cerrarReto(); mostrarAviso('Has salido del reto', 'Puedes volver a intentarlo cuando quieras.'); };

  function derrota() {
    var B = G.batalla; B.terminado = true; MUS.tocar('derrota'); animH('defeat');
    $('rOpciones').innerHTML = ''; $('rExpl').hidden = false; $('rExpl').className = 'expl mal';
    $('rExpl').innerHTML = '<b>¡Ánimo, ' + esc(heroe().corto) + '!</b> Te has quedado sin vida, pero no pierdes nada: ni monedas ni cartas. Repasa las explicaciones y vuelve a intentarlo.' + '<button type="button" id="rSeguir">Reintentar ▶</button> <button type="button" id="rSalir" class="sec">Volver al mapa</button>';
    $('rSeguir').onclick = function () { var e = B.etapa, en = B.ent, cf = B.cofre, vc = B.vecino; cerrarReto(); if (cf) iniciarAventura(0, null, vc, cf); else iniciarAventura(e, en, vc || (B.tipo === 'exploracion' ? vecinoMision() : null)); };
    $('rSalir').onclick = cerrarReto;
  }
  function cerrarReto() { $('reto').hidden = true; $('hud').hidden = false; MUS.tocar('mundo', { mundo: W.id }); G.batalla = null; G.modo = 'mapa'; $('controles').hidden = !tactilVisible(); prepararEnemigos(); empujarJugador(); actualizarHUD(); }
  function empujarJugador() { var J = G.jug; for (var r = 0; r < 60; r += 4) { var ok = enemigos.every(function (e) { return Math.hypot(e.x - J.x, e.y - J.y) > 26; }); if (ok) return; J.y += 4; if (!libre(J.x, J.y)) J.y -= 8; } }

  function victoria() {
    var B = G.batalla; B.terminado = true; MUS.tocar('victoria'); animH('victory'); if (B.enemigoId) animE('defeat');
    $('rOpciones').innerHTML = ''; $('rFase').textContent = '';
    var res = null;
    if (B.cofre && B.cofre.encargo) {
      res = PRUEBA ? { cartas: [], logros: [], xp: 0, monedas: 0 } : (C.registrarHito ? C.registrarHito(B.cofre.encargo, { silencio: true, xp: 30, monedas: B.cofre.monedas || 10 }) : null);
      setTimeout(function () { mostrarPremio({ encargo: true, xp: res ? res.xp : 0, monedas: res ? res.monedas : 0, cartas: res ? res.cartas : [], logros: res ? res.logros : [] }); }, 900);
      return;
    }
    if (B.cofre) {
      res = PRUEBA ? { monedas: 0, logros: [] } : C.rpg.abrirCofre(B.cofre.id, B.cofre.monedas);
      B.cofre.abierto = true; B.cofre.anim = G.t;
      setTimeout(function () { mostrarPremio({ cofre: true, monedas: res ? res.monedas : 0, logros: res ? res.logros : [] }); }, 900);
      return;
    }
    if (!PRUEBA) res = C.rpg.completarAventura({ mundo: W.id, etapa: B.etapa, errores: B.errores, dificultad: G.dif });
    else pruebaHechas[W.id + '-' + B.etapa] = true;
    setTimeout(function () { mostrarPremio(res || { xp: 0, monedas: 0, cartas: [], logros: [], prueba: true }, B); }, 1400);
  }

  /* ---------- Pantalla de recompensa (cofre animado + cartas) ---------- */
  function mostrarPremio(r, B) {
    $('reto').hidden = true;
    var p = $('premio'), leg = r.cartas && r.cartas.some(function (c) { return c.rareza === 'legendaria'; });
    var cartas = (r.cartas || []).map(function (c) { return '<div class="pc"><div class="pc-i"><img ' + (c.foto ? 'referrerpolicy="no-referrer" ' : '') + 'src="' + (c.foto || GaloisArte.carta(c)) + '" alt="' + esc(c.alt || c.nombre) + '"><img src="' + GaloisArte.reverso(c.mundo) + '" alt=""></div><b>' + esc(c.nombre) + '</b><small>' + esc(D.rarezas[c.rareza]) + ' · ' + esc(D.categorias[c.categoria]) + '</small></div>'; }).join('');
    var titulo = r.encargo ? '¡Encargo cumplido!' : r.cofre ? '¡Cofre abierto!' : B && B.etapa === 5 ? '¡Jefe derrotado! Pieza del Compás recuperada' : '¡Aventura superada!';
    $('pTitulo').textContent = titulo;
    $('pCofre').className = 'cofre-anim' + (leg ? ' legendario' : '');
    $('pCuerpo').innerHTML =
      (r.prueba ? '<p class="nota">Modo de prueba: no se guardan recompensas.</p>' : '') +
      '<ul class="botin">' + (r.xp ? '<li>⭐ +' + r.xp + ' XP</li>' : '') + (r.monedas ? '<li><span class="moneda"></span> +' + r.monedas + ' monedas</li>' : '') + (r.subeNivel ? '<li class="sube">⬆ ¡Nivel ' + r.nivel + '!</li>' : '') + (r.insignia ? '<li>🏅 Insignia del mundo ' + r.insignia + '</li>' : '') + '</ul>' +
      (cartas ? '<h3>' + ((r.cartas.length > 1) ? 'Cartas nuevas' : 'Carta nueva') + '</h3><div class="pcartas">' + cartas + '</div>' : (r.cofre || r.prueba ? '' : '<p class="nota">' + (r.encargo ? 'Este encargo ya estaba hecho: su carta se entrega una sola vez.' : r.primera === false ? 'Ya habías superado esta aventura: repetirla da un poco de experiencia, pero no más cartas.' : 'Ya tienes todas las cartas de este mundo.') + '</p>')) +
      (r.logros && r.logros.length ? '<h3>Logros</h3><ul class="botin">' + r.logros.map(function (l) { return '<li>' + l.icono + ' ' + esc(l.nombre) + '</li>'; }).join('') + '</ul>' : '') +
      (B && B.etapa === 5 && W.id < 10 ? '<p class="nota">Se ha abierto el camino hacia ' + esc(D.mundos[W.id].lugar) + '.</p>' : '') +
      (B && B.etapa === 5 && W.id === 10 ? '<p class="nota">¡Has reunido las diez piezas! El Compás de los Alarifes vuelve a brillar sobre la Campiña.</p>' : '');
    p.hidden = false; SFX.cofre();
    var cc = $('pCofre'), x2 = cc.getContext('2d'), fr = 0; x2.imageSmoothingEnabled = false; clearInterval(G.cofreInt);
    G.cofreInt = setInterval(function () { x2.clearRect(0, 0, 64, 64); x2.drawImage(E.objeto('cofre', Math.min(3, fr), leg ? 'legendaria' : (r.cartas && r.cartas.some(function (c) { return c.rareza === 'epica'; }) ? 'epica' : '')), 0, 0, 64, 64); if (++fr > 3) clearInterval(G.cofreInt); }, REDUCIDO ? 0 : 180);
    $('pSeguir').focus({ preventScroll: true });
  }
  $('pSeguir').onclick = function () { $('premio').hidden = true; $('hud').hidden = false; MUS.tocar('mundo', { mundo: W.id }); G.batalla = null; G.modo = 'mapa'; $('controles').hidden = !tactilVisible(); prepararEnemigos(); empujarJugador(); actualizarHUD(); if (G.enRuta) return; var ab = abiertas(W.id); mostrarAviso(ab.length ? (ab.length > 1 ? 'Puedes seguir por dos rutas' : 'Siguiente: aventura ' + ab[0]) : '¡Mundo completado!', ab.length ? ab.map(function (e) { return W.datos.aventuras[e - 1].nombre; }).join(' · ') : 'Sal por el camino del sur para volver a la Campiña.'); };

  /* =====================================================================
     DIBUJO
     ===================================================================== */
  function dibujarMapa() {
    var cx = Math.round(G.cam.x), cy = Math.round(G.cam.y), f = Math.floor(G.t * 2) % 2;
    ctx.fillStyle = '#1a2a1a'; ctx.fillRect(0, 0, VW, VH);
    ctx.drawImage(capas[f], -cx, -cy);
    // fragmentos
    if (pendiente(W.id) === 1 && G.hablado.mision1) fragmentos.forEach(function (fr) { if (!G.recogidos[fr.i]) ctx.drawImage(E.objeto('brillo', Math.floor(G.t * 8)), fr.x - 8 - cx, fr.y - 12 - cy + Math.round(Math.sin(G.t * 4) * 2)); });
    // lista ordenada por profundidad
    var L = [];
    edificios.forEach(function (b) { L.push({ y: (b.y + b.h) * T, d: function () { var ed = E.edificio(b.t, b.o, b.t === 'molino' ? Math.floor(G.t * 6) % 16 : 0); ctx.drawImage(ed.canvas, b.x * T - cx, b.y * T - cy); if (b.obra && !hecha(W.id, 3)) andamio(b, cx, cy); } }); });
    cofres.forEach(function (c) { L.push({ y: c.y * T + 14, d: function () { var fr = c.abierto ? (c.anim && G.t - c.anim < .4 ? Math.min(3, Math.floor((G.t - c.anim) * 10)) : 3) : 0; ctx.drawImage(E.objeto('cofre', fr), c.x * T - cx, c.y * T - cy); } }); });
    vecinos.forEach(function (v) { L.push({ y: v.py, d: function () { sombra(v.px - cx, v.py - cy); S.pintar(ctx, v.hoja, 'idle', v.dirA, S.indice(v.hoja, 'idle', G.t + v.x), v.px - cx, v.py - cy + 2, .5); } }); });
    enemigos.forEach(function (e) { L.push({ y: e.y, d: function () { sombra(e.x - cx, e.y - cy); var aturd = e.aturdido > G.t, a = aturd ? 'hurt' : (e.vx || e.vy) ? 'move' : 'idle'; if (aturd && Math.floor(G.t * 10) % 2) return; S.pintar(ctx, e.hoja, a, 'left', aturd ? 2 : S.indice(e.hoja, a, G.t), e.x - cx, e.y - cy + 3, e.etapa === 4 ? .75 : .6); } }); });
    if (jefe) L.push({ y: jefe.y, d: function () { sombra(jefe.x - cx, jefe.y - cy, 14); S.pintar(ctx, jefe.hoja, 'idle', 'left', S.indice(jefe.hoja, 'idle', G.t), jefe.x - cx, jefe.y - cy + 3, .55); } });
    var J = G.jug, hoja = S.hojaHeroe(G.heroeId);
    L.push({ y: J.y, d: function () { sombra(J.x - cx, J.y - cy); S.pintar(ctx, hoja, J.anim, J.dir, S.indice(hoja, J.anim, G.t - J.t0), J.x - cx, J.y - cy + 2 - (J.alto || 0), .5); } });
    particulas.forEach(function (q) { L.push({ y: 9999, d: function () { var u = (G.t - q.t) / .5; ctx.fillStyle = q.c; ctx.fillRect(Math.round(q.x + q.vx * u - cx), Math.round(q.y + q.vy * u + 20 * u * u - cy), 2, 2); } }); });
    L.sort(function (a, b) { return a.y - b.y; }).forEach(function (o) { o.d(); });
    // marcador de misión
    var obj = objetivo();
    if (obj) { var bob = Math.round(Math.sin(G.t * 5) * 2); marcador(obj.x - cx, obj.y - cy + bob); }
    // salida
    var s = W.def.salida; ctx.fillStyle = '#fbf0d6'; S.texto && textoPx('▼', s[0] * T + 8 - cx, s[1] * T + 2 - cy);
  }
  function textoPx(t, x, y) { ctx.font = '8px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#1a1124'; ctx.fillText(t, x + 1, y + 1); ctx.fillStyle = '#ffe28a'; ctx.fillText(t, x, y); }
  function sombra(x, y, r) { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(Math.round(x - (r || 5)), Math.round(y - 1), (r || 5) * 2, 2); ctx.fillRect(Math.round(x - (r || 5) + 2), Math.round(y - 2), (r || 5) * 2 - 4, 4); }
  function andamio(b, cx, cy) {
    var x0 = b.x * T - cx, y0 = b.y * T - cy, w = b.w * T, h = b.h * T;
    ctx.fillStyle = 'rgba(30,20,40,.35)'; ctx.fillRect(x0, y0, w, h * .5);
    ctx.fillStyle = '#8a6a3a'; for (var i = 4; i < w; i += 14) ctx.fillRect(x0 + i, y0 + 4, 2, h - 4); for (var j = 10; j < h; j += 14) ctx.fillRect(x0, y0 + j, w, 2);
  }
  function marcador(x, y) { ctx.fillStyle = '#1a1124'; ctx.fillRect(Math.round(x) - 3, Math.round(y) - 13, 7, 11); ctx.fillStyle = '#ffe28a'; ctx.fillRect(Math.round(x) - 2, Math.round(y) - 12, 5, 6); ctx.fillRect(Math.round(x) - 2, Math.round(y) - 5, 5, 2); }
  function objetivo() {
    var ab = abiertas(W.id); if (!ab.length) return null;
    var p = ab[0];
    if (p === 1) { var v = vecinoMision(); if (G.hablado.mision1 && Object.keys(G.recogidos).length < 3) return null; return { x: v.px, y: v.py - 22 }; }
    if (p === 5) return { x: jefe.x, y: jefe.y - 34 };
    if (p === 3) { var b = edificios.find(function (b) { return b.obra; }); if (b) return { x: (b.x + b.w / 2) * T, y: b.y * T + 6 }; }
    var e = enemigos.find(function (e) { return e.etapa === p; }); if (e) return { x: e.x, y: e.y - 20 };
    var vc = vecinos.find(function (x) { return x.aventura === p; });
    return vc ? { x: vc.px, y: vc.py - 22 } : null;
  }

  /* ---------- Fondo de los combates ----------
     Escena por capas con la paleta de cada mundo: cielo, sol, nubes, dos líneas
     de lomas, el monumento y el suelo, más una franja de vegetación en primer
     plano. Un mundo puede traer su propia ilustración declarando "fondo" en
     coleccion/datos.js (ruta dentro del artefacto, por ejemplo
     "assets/galois/fondos/fuentes.png"): si carga, se dibuja esa en su lugar. */
  var PALETA = {
    1: { alto: '#1b2a63', medio: '#6a84c4', bajo: '#f7b76e', loma: ['#6f9550', '#55793f'], suelo: '.', campo: 'w', sol: '#ffe6a0' },
    2: { alto: '#20265e', medio: '#7083b8', bajo: '#f0a878', loma: ['#a89066', '#7a6a4a'], suelo: '.', campo: 'o', sol: '#ffe0a0' },
    3: { alto: '#2a2a6a', medio: '#8a7ab8', bajo: '#f7c07a', loma: ['#c09868', '#8a6b46'], suelo: 's', campo: 's', sol: '#ffd890' },
    4: { alto: '#1e3a5e', medio: '#6f9cbc', bajo: '#eac47e', loma: ['#6f8a4a', '#4f6a36'], suelo: '.', campo: 'o', sol: '#ffe6a0' },
    5: { alto: '#243a70', medio: '#7f95c8', bajo: '#f2bc7c', loma: ['#93a05e', '#616f42'], suelo: '.', campo: 'o', sol: '#ffe0a0' },
    6: { alto: '#2a2a5e', medio: '#8080b4', bajo: '#eeba84', loma: ['#a89066', '#6f6248'], suelo: '.', campo: 'T', sol: '#ffe6a0' },
    7: { alto: '#1e2a52', medio: '#6180ac', bajo: '#eaa878', loma: ['#5f80a0', '#425e78'], suelo: '=', campo: '~', sol: '#ffd8a0' },
    8: { alto: '#1a3050', medio: '#5f8cae', bajo: '#eac48c', loma: ['#5f8a5a', '#43663f'], suelo: '.', campo: 'T', sol: '#ffe6a8' },
    9: { alto: '#243058', medio: '#8189b4', bajo: '#f2c48c', loma: ['#b4a278', '#857450'], suelo: 's', campo: 'r', sol: '#ffe6a8' },
    10: { alto: '#1c2450', medio: '#6f7cb4', bajo: '#f0a884', loma: ['#9a7a9a', '#6a5276'], suelo: '=', campo: 'P', sol: '#ffdca8' }
  };
  var imgFondo = {};
  function fondoImagen(id) {
    var wd = D.mundos[id - 1];
    if (!wd || !wd.fondo) return null;
    if (!(id in imgFondo)) { var im = new Image(); im.onerror = function () { imgFondo[id] = null; }; im.src = wd.fondo; imgFondo[id] = im; }
    var g = imgFondo[id];
    return g && g.complete && g.naturalWidth ? g : null;
  }
  function circulo(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill(); }
  function loma(base, amp, color, frec, desfase) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, VH);
    for (var x = 0; x <= VW; x += 4) ctx.lineTo(x, base - Math.sin(x / Math.max(1, VW) * Math.PI * frec * 2 + desfase) * amp - Math.sin(x / 37) * 2);
    ctx.lineTo(VW, VH); ctx.closePath(); ctx.fill();
  }
  function escena(B, altoEsc, suelo, sh) {
    var P = PALETA[W.id] || PALETA[1], noche = !!B.jefe, im = fondoImagen(W.id);
    if (im) {
      var k = Math.max(VW / im.naturalWidth, VH / im.naturalHeight);
      ctx.drawImage(im, Math.round((VW - im.naturalWidth * k) / 2) + sh, Math.round((VH - im.naturalHeight * k) / 2), Math.round(im.naturalWidth * k), Math.round(im.naturalHeight * k));
      return;
    }
    var alto = noche ? S.dark(P.alto, .3) : P.alto, medio = noche ? S.dark(P.medio, .35) : P.medio, bajo = noche ? S.dark(P.bajo, .3) : P.bajo;
    var g = ctx.createLinearGradient(0, 0, 0, suelo);
    g.addColorStop(0, alto); g.addColorStop(.58, medio); g.addColorStop(1, bajo);
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    var sx = VW * .85, sy = altoEsc * .18, r = Math.max(6, VW * .03);
    ctx.globalAlpha = .3; ctx.fillStyle = P.sol; circulo(sx, sy, r * 2.3);
    ctx.globalAlpha = 1; ctx.fillStyle = noche ? '#e6ecff' : P.sol; circulo(sx, sy, r);
    ctx.globalAlpha = noche ? .16 : .32; ctx.fillStyle = '#ffffff';
    for (var n = 0; n < 4; n++) {
      var an = VW * (.16 + n * .05), xn = ((G.t * (3 + n * 2) + n * 91) % (VW + an)) - an, yn = Math.round(altoEsc * (.12 + n * .1));
      ctx.fillRect(Math.round(xn), yn, Math.round(an), 3);
      ctx.fillRect(Math.round(xn + an * .22), yn - 3, Math.round(an * .45), 3);
    }
    ctx.globalAlpha = 1;
    loma(suelo - 24, 13, noche ? S.dark(P.loma[0], .45) : P.loma[0], .6, 0);
    loma(suelo - 10, 8, noche ? S.dark(P.loma[1], .45) : P.loma[1], 1.1, 2.3);
  }
  function chispear() {
    var B = G.batalla; if (!B) return; B.chispas = B.chispas || [];
    for (var i = 0; i < 12; i++) B.chispas.push({ t: G.t + i * .02, dx: (Math.random() - .5) * 36, dy: (Math.random() - .5) * 22 });
  }

  function dibujarBatalla() {
    var B = G.batalla; if (!B) return;
    var panel = $('reto').getBoundingClientRect(), altoEsc = Math.max(90, Math.min(VH, panel.top / ESC));
    var sh = B.sacudir > 0 ? Math.round((Math.random() - .5) * 4) : 0;
    // cielo, lomas y suelo del mundo
    var suelo = Math.round(altoEsc * .78), P = PALETA[W.id] || PALETA[1];
    escena(B, altoEsc, suelo, sh);
    for (var x = 0; x < VW; x += T) for (var y = suelo; y < VH; y += T) ctx.drawImage(E.tile(P.suelo || '.', x / T | 0, y / T | 0, 0), x + sh, y);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(0, suelo, VW, 3);
    // monumento de fondo, con su silueta para dar profundidad
    var obra = edificios.find(function (b) { return b.obra; }) || edificios[0];
    var ed = E.edificio(obra.t, obra.o), k = Math.min(1, (suelo - 8) / ed.canvas.height);
    var ancho = ed.canvas.width * k, altoM = ed.canvas.height * k;
    var mx = Math.round((B.tipo === 'construccion' ? VW * .62 : VW * .5) - ancho / 2), my = Math.round(suelo - altoM);
    if (B.tipo === 'construccion') {
      var prog = B.aciertos / B.necesarios, hh = Math.round(ed.canvas.height * (0.25 + .75 * prog));
      ctx.globalAlpha = .22; ctx.drawImage(ed.canvas, mx, my, ancho, altoM); ctx.globalAlpha = 1;
      ctx.drawImage(ed.canvas, 0, ed.canvas.height - hh, ed.canvas.width, hh, mx, Math.round(suelo - hh * k), ancho, Math.round(hh * k));
    } else {
      ctx.globalAlpha = .18; ctx.drawImage(ed.canvas, mx + 4, my + 2, ancho, altoM);
      ctx.globalAlpha = .55; ctx.drawImage(ed.canvas, mx, my, ancho, altoM); ctx.globalAlpha = 1;
    }
    // héroe
    var hoja = S.hojaHeroe(G.heroeId), hx = Math.round(VW * .24), hk = Math.max(1, Math.min(2, Math.floor(altoEsc / 70)));
    if (B.hA !== 'idle' && B.hA !== 'victory' && B.hA !== 'defeat' && G.t - B.hT > S.duracion(hoja, B.hA) + .1) B.hA = 'idle';
    sombra(hx + sh, suelo + 4, 10); S.pintar(ctx, hoja, B.hA, 'right', S.indice(hoja, B.hA, G.t - B.hT), hx + sh, suelo + 4, hk);
    // enemigo o vecino
    if (B.hojaE) {
      var ex = Math.round(VW * .74), ek = B.jefe ? hk : hk * 1.2, hE = B.hojaE;
      if (B.eA !== 'idle' && B.eA !== 'defeat' && G.t - B.eT > S.duracion(hE, B.eA) + .1) B.eA = 'idle';
      sombra(ex + sh, suelo + 4, 14 * hk); S.pintar(ctx, hE, B.eA, 'left', S.indice(hE, B.eA, G.t - B.eT), ex + sh, suelo + 4, ek);
      // barra de vida del enemigo
      var bw = 60 * hk / 1.5, vida = 1 - B.aciertos / B.necesarios;
      ctx.fillStyle = '#1a1124'; ctx.fillRect(ex - bw / 2 - 1, 6, bw + 2, 6); ctx.fillStyle = '#5a1a2a'; ctx.fillRect(ex - bw / 2, 7, bw, 4); ctx.fillStyle = '#e0565b'; ctx.fillRect(ex - bw / 2, 7, Math.round(bw * vida), 4);
    } else if (B.tipo === 'exploracion' || B.tipo === 'cofre') {
      if (B.tipo === 'cofre' && !B.encargo) { var fr = B.terminado ? Math.min(3, Math.floor((G.t - (B.cofre.anim || G.t)) * 8)) : 0; ctx.save(); ctx.translate(Math.round(VW * .72), suelo - 32); ctx.scale(2, 2); ctx.drawImage(E.objeto('cofre', fr), 0, 0); ctx.restore(); }
      else { var v = B.vecino || vecinoMision(); if (v && v.hoja) S.pintar(ctx, v.hoja, 'idle', 'left', S.indice(v.hoja, 'idle', G.t), Math.round(VW * .74), suelo + 4, hk); }
    }
    // chispas del acierto cuando no hay enemigo
    B.chispas = (B.chispas || []).filter(function (c) {
      var u = (G.t - c.t) / .8; if (u < 0) return true; if (u > 1) return false;
      var cx2 = hx + c.dx + Math.sin(u * 6 + c.dx) * 2, cy2 = suelo - 12 * hk + c.dy - u * 24 * hk;
      var lado = Math.max(1, Math.round(hk));
      ctx.globalAlpha = 1 - u;
      ctx.fillStyle = u < .5 ? '#fff6d2' : (S.heroes[G.heroeId] ? S.heroes[G.heroeId].magia : '#ffe28a');
      ctx.fillRect(Math.round(cx2) + sh, Math.round(cy2), lado, lado);
      ctx.fillRect(Math.round(cx2) - lado + sh, Math.round(cy2) + lado, lado, lado);
      ctx.globalAlpha = 1; return true;
    });
    // vegetación en primer plano
    if (P.campo) { var fy = Math.round(altoEsc) - T; for (var fx = -T; fx < VW + T; fx += T) ctx.drawImage(E.tile(P.campo, (fx / T | 0), 3, Math.floor(G.t * 2) % 2), fx + sh * 2, fy); }
    // proyectiles
    B.proy = B.proy.filter(function (p) { var u = (G.t - p.t) / .45; if (u > 1) return false; var x0 = p.de === 'h' ? hx + 14 : VW * .74 - 14, x1 = p.de === 'h' ? VW * .74 : hx, xx = x0 + (x1 - x0) * u, yy = suelo - 20 * hk - Math.sin(u * Math.PI) * 14; ctx.font = 'bold ' + (8 * hk) + 'px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#1a1124'; ctx.fillText(p.txt, xx + 1, yy + 1); ctx.fillStyle = p.de === 'h' ? S.heroes[G.heroeId] ? S.heroes[G.heroeId].magia : '#7fd8ff' : '#ff8a6a'; ctx.fillText(p.txt, xx, yy); return true; });
    // textos flotantes
    B.textos = B.textos.filter(function (t) { var u = G.t - t.t; if (u > 1.4) return false; var x = t.lado === 'h' ? hx : t.lado === 'e' ? VW * .74 : VW / 2; ctx.font = 'bold ' + (t.lado === 'c' ? 9 : 8) * hk / 1.2 + 'px monospace'; ctx.textAlign = 'center'; var y = (t.lado === 'c' ? altoEsc * .35 : suelo - 44 * hk) - u * 10; ctx.fillStyle = '#1a1124'; ctx.fillText(t.txt, x + 1, y + 1); ctx.fillStyle = '#ffe28a'; ctx.fillText(t.txt, x, y); return true; });
    B.sacudir = Math.max(0, B.sacudir - 1 / 60);
  }
  function actualizarBatalla() {}

  /* =====================================================================
     INTERFAZ: HUD, Campiña, menús
     ===================================================================== */
  function actualizarHUD() {
    var e = estado(), h = heroe();
    $('hNivel').textContent = 'Nv ' + e.nivel; $('hXp').style.width = Math.round(100 * (e.xp - e.xpNivel) / Math.max(1, e.xpSiguiente - e.xpNivel)) + '%';
    $('hMonedas').textContent = e.monedas; $('hPociones').textContent = e.inv.pocion; $('hHeroe').textContent = h.corto;
    if (W) {
      var wd = W.datos, ab = abiertas(W.id);
      var txt = !ab.length ? '¡Mundo completado!' : ab[0] === 1 ? (G.hablado.mision1 ? 'Reúne los azulejos ✦ (' + Object.keys(G.recogidos).length + '/3)' : 'Habla con ' + vecinoMision().nombre) : ab.length > 1 ? 'Rutas abiertas: ' + ab.map(function (e) { return wd.aventuras[e - 1].nombre; }).join(' · ') : 'Aventura ' + ab[0] + ': ' + wd.aventuras[ab[0] - 1].nombre;
      $('hMision').textContent = txt; $('hMundo').textContent = wd.id + ' · ' + wd.lugar;
    }
  }
  function abrirCampina() {
    salirRuta(); G.modo = 'campina'; MUS.tocar('campina'); $('hud').hidden = true; $('controles').hidden = true; $('campina').hidden = false;
    var cont = $('cMarcas'); cont.innerHTML = '';
    D.mundos.forEach(function (w) {
      var ok = desbloqueado(w.id), p = pendiente(w.id), n = 5 - (p === 0 ? 0 : 6 - p) ;
      var hechas = [1, 2, 3, 4, 5].filter(function (e) { return hecha(w.id, e); }).length;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'cm' + (ok ? '' : ' bloq') + (hechas === 5 ? ' hecho' : '');
      b.style.left = w.x + '%'; b.style.top = w.y + '%';
      b.innerHTML = '<span class="num">' + w.id + '</span><span class="nom">' + esc(w.lugar) + '</span><span class="pr">' + (ok ? hechas + '/5' : '🔒') + '</span>';
      b.setAttribute('aria-label', 'Mundo ' + w.id + ': ' + w.lugar + ', ' + w.tema + (ok ? ', ' + hechas + ' de 5 aventuras' : ', bloqueado'));
      b.onclick = function () { fichaMundo(w); };
      cont.appendChild(b);
    });
    fichaMundo(D.mundos[(G.mundo || 1) - 1]);
    actualizarHUD();
  }
  function fichaMundo(w) {
    var ok = desbloqueado(w.id), hechas = [1, 2, 3, 4, 5].filter(function (e) { return hecha(w.id, e); }).length;
    $('cFicha').innerHTML = '<h2>' + w.id + ' · ' + esc(w.nombre) + '</h2><p class="lugar">' + esc(w.lugar) + ' · <b>' + esc(w.tema) + '</b></p><p>' + esc(w.sinopsis) + '</p>' +
      '<div class="enem">' + w.enemigos.map(function (e) { return '<img src="assets/pichu-royale/enemigos/' + e + '.png" alt="" width="48" height="48"><span>' + ((w.nombres && w.nombres[e]) || NOMBRE_ENEMIGO[e]) + '</span>'; }).join('') + '</div>' +
      '<ol class="avs">' + w.aventuras.map(function (a, i) { return '<li class="' + (hecha(w.id, i + 1) ? 'ok' : '') + '">' + esc(a.nombre) + ' <small>' + esc(a.tipo) + '</small></li>'; }).join('') + '</ol>' +
      (ok ? '<button type="button" class="gl-btn" id="cEntrar">▶ ' + (hechas ? 'Volver a ' : 'Entrar en ') + esc(w.lugar) + '</button>' : '<p class="bloqueo">🔒 Derrota al jefe del mundo ' + (w.id - 1) + ' (' + esc(D.mundos[w.id - 2].lugar) + ') para abrir este camino.</p>');
    var b = $('cEntrar'); if (b) b.onclick = function () { cargarMundo(w.id); };
    document.querySelectorAll('.cm').forEach(function (m, i) { m.setAttribute('aria-current', String(i + 1 === w.id)); });
  }

  /* ---------- Menús (misiones, inventario, tienda, ajustes) ---------- */
  function abrirMenu(cual) {
    var e = estado(), h = heroe(), m = $('menu'), cuerpo = $('mCuerpo');
    G.modoPrevio = G.modo === 'menu' ? G.modoPrevio : G.modo; G.modo = 'menu';
    document.querySelectorAll('#menu [data-pest]').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.pest === cual)); });
    if (cual === 'misiones') {
      cuerpo.innerHTML = '<h2>Misiones</h2>' + D.mundos.map(function (w) { var ok = desbloqueado(w.id); return '<details' + (W && w.id === W.id ? ' open' : '') + '><summary>' + (ok ? '' : '🔒 ') + w.id + ' · ' + esc(w.lugar) + ' — ' + [1, 2, 3, 4, 5].filter(function (k) { return hecha(w.id, k); }).length + '/5</summary><ol class="avs">' + w.aventuras.map(function (a, i) { return '<li class="' + (hecha(w.id, i + 1) ? 'ok' : '') + '"><b>' + esc(a.nombre) + '</b> <small>' + esc(a.tipo) + '</small><br><small>' + esc(a.historia) + '</small></li>'; }).join('') + '</ol></details>'; }).join('');
    } else if (cual === 'inventario') {
      cuerpo.innerHTML = '<h2>Inventario de ' + esc(h.corto) + '</h2><div class="inv"><div><span class="moneda"></span><b>' + e.monedas + '</b> monedas</div><div>🧪 <b>' + e.inv.pocion + '</b> pociones (+2 ♥ en combate)</div><div>⭐ Nivel <b>' + e.nivel + '</b> · ' + e.xp + ' XP</div><div>♥ Vida máxima: <b>' + vidasMax() + '</b></div><div>🃏 <b>' + e.cartas.length + '</b> / 60 cartas</div><div>🗝️ <b>' + e.cofres.length + '</b> cofres abiertos</div></div>' +
        '<h3>Piezas del Compás e insignias</h3><div class="insignias">' + D.mundos.map(function (w) { var ok = e.insignias.indexOf(w.id) >= 0; return '<span class="ins' + (ok ? ' ok' : '') + '" title="' + esc(w.lugar) + '">' + w.id + '</span>'; }).join('') + '</div>' +
        '<h3>Habilidad</h3><p>✦ <b>' + esc(h.habilidad) + '</b>: ' + DESC_HAB[HABILIDAD[h.id] || 'pista'] + ' (una vez por combate).</p><p><a class="gl-btn azul" href="coleccion/index.html">🃏 Abrir el álbum</a></p>';
    } else if (cual === 'tienda') {
      cuerpo.innerHTML = '<h2>Puesto de la plaza</h2><p>Tienes <span class="moneda"></span><b id="tM">' + e.monedas + '</b> monedas y 🧪 <b id="tP">' + e.inv.pocion + '</b> pociones.</p><button type="button" class="gl-btn" id="comprar">Comprar poción · 15 monedas</button><p class="nota" id="tMsg">Las monedas solo sirven dentro del juego y no cambian ninguna nota.</p>';
      $('comprar').onclick = function () { var ok = C.rpg.comprarPocion(15); $('tMsg').textContent = ok ? '¡Poción comprada!' : 'No tienes monedas suficientes. Abre cofres del saber o supera aventuras.'; if (ok) SFX.cofre(); var e2 = estado(); $('tM').textContent = e2.monedas; $('tP').textContent = e2.inv.pocion; actualizarHUD(); };
    } else if (cual === 'ajustes') {
      cuerpo.innerHTML = '<h2>Ajustes</h2><h3>Matemático</h3><div class="heroes" id="aHeroes"></div>' +
        '<h3>Dificultad</h3><div class="difs">' + [['explorador', 'Explorador', '3 opciones, pistas ilimitadas, los fallos quitan medio corazón'], ['aventurero', 'Aventurero', '4 opciones, 2 pistas por reto'], ['maestro', 'Maestro', 'escribes las respuestas numéricas (en tableta y móvil eliges entre 4 opciones), sin pistas']].map(function (d) { return '<label><input type="radio" name="dif" value="' + d[0] + '"' + (G.dif === d[0] ? ' checked' : '') + '> <b>' + d[1] + '</b> <small>' + d[2] + '</small></label>'; }).join('') + '</div>' +
        '<h3>Opciones</h3><label><input type="checkbox" id="aMus"' + (MUS.activa() ? ' checked' : '') + '> Música</label> <label>Volumen <input type="range" id="aVol" min="0" max="1" step="0.05" value="' + MUS.volumen() + '"></label><br><label><input type="checkbox" id="aSon"' + (G.sonido ? ' checked' : '') + '> Efectos de sonido</label> ' +
        '<h3>Perfil</h3><p>Alias: <b>' + esc(C.activo()) + '</b>. Cambia de alias o exporta tu progreso desde el <a href="coleccion/index.html">álbum</a>.</p>' +
        '<details><summary>Modo docente</summary><p>Permite abrir todos los mundos para revisarlos en clase. No concede cartas ni recompensas: hay que superar las aventuras igualmente.</p><input id="aCod" placeholder="Código docente" autocomplete="off"> <button type="button" id="aDoc">' + (docente() ? 'Desactivar' : 'Activar') + '</button> <span id="aDocMsg"></span></details>';
      var hs = heroesTodos(); $('aHeroes').innerHTML = hs.map(function (x) { return '<button type="button" data-h="' + x.id + '" aria-pressed="' + (x.id === G.heroeId) + '"><canvas width="32" height="44"></canvas><b>' + esc(x.corto) + '</b></button>'; }).join('');
      $('aHeroes').querySelectorAll('button').forEach(function (b) { var c2 = b.querySelector('canvas').getContext('2d'); S.pintar(c2, S.hojaHeroe(b.dataset.h), 'idle', 'down', 0, 16, 42, 1); b.onclick = function () { G.heroeId = b.dataset.h; try { localStorage.setItem('galoisLegacy.heroe', G.heroeId); } catch (e2) {} C.rpg.preferencias({ heroe: G.heroeId }); abrirMenu('ajustes'); actualizarHUD(); }; });
      cuerpo.querySelectorAll('[name=dif]').forEach(function (r) { r.onchange = function () { G.dif = r.value; C.rpg.preferencias({ dificultad: G.dif }); }; });
      $('aMus').onchange = function () { MUS.activar(this.checked); pintarBotonMusica(); };
      $('aVol').oninput = function () { MUS.volumen(this.value); };
      $('aSon').onchange = function () { G.sonido = this.checked; try { localStorage.setItem('galoisLegacy.sonido', G.sonido ? '1' : '0'); } catch (e2) {} };
      // (1.7.0) Sin opción de controles táctiles: todos los pueblos se recorren por paradas
      $('aDoc').onclick = function () { try { if (docente()) { localStorage.removeItem('galoisLegacy.docente'); $('aDocMsg').textContent = 'Desactivado.'; } else if ($('aCod').value.trim().toUpperCase() === 'ALARIFES') { localStorage.setItem('galoisLegacy.docente', '1'); $('aDocMsg').textContent = 'Todos los mundos abiertos.'; } else $('aDocMsg').textContent = 'Código incorrecto.'; } catch (e2) {} };
    } else if (cual === 'ayuda') {
      cuerpo.innerHTML = '<h2>Cómo se juega</h2><ul class="ayuda"><li><b>El camino:</b> cada pueblo es un recorrido por sus monumentos. Tu matemático va de parada en parada; con los números de arriba vuelves a cualquier parada ya visitada.</li><li><b>En cada parada:</b> lee el texto del monumento, habla con los vecinos y supera su reto. «Siguiente parada» se enciende cuando lo consigues.</li><li><b>Preguntas de los monumentos:</b> son cortas y no cuentan para nada; si fallas, vuelve a leer el texto.</li><li><b>Cruces:</b> en Fuentes de Andalucía, el Silo y la calle Carrera se pueden hacer en el orden que elijas. Los encargos (el horno y la romería) son opcionales.</li><li><b>Combates:</b> cada acierto daña al enemigo. Si fallas, verás por qué y recibirás otro reto parecido. Nunca pierdes monedas ni cartas.</li><li><b>Habilidad:</b> cada matemático tiene una habilidad que puedes usar una vez por combate.</li><li><b>Cofres del saber:</b> resuélvelos para ganar monedas; con ellas compras pociones en el puesto.</li><li><b>Teclado:</b> Tab para moverte por los botones, Intro para pulsar y para pasar los diálogos.</li><li><b>Recompensas:</b> XP, niveles, monedas, insignias y cartas son del juego y <b>no cambian tus notas</b>.</li></ul>';
    }
    m.hidden = false;
  }
  document.querySelectorAll('#menu [data-pest]').forEach(function (b) { b.onclick = function () { abrirMenu(b.dataset.pest); }; });
  $('mCerrar').onclick = function () { $('menu').hidden = true; G.modo = G.modoPrevio || 'mapa'; if (G.modo === 'campina') abrirCampina(); else actualizarHUD(); };
  $('bMenu').onclick = function () { abrirMenu('misiones'); };
  $('bAjustes').onclick = function () { abrirMenu('ajustes'); };
  $('bInv').onclick = function () { abrirMenu('inventario'); };
  $('bCampina').onclick = function () { abrirCampina(); };
  function pintarBotonMusica() { ['bMusica', 'cMusica'].forEach(function (id) { var b = $(id); if (!b) return; b.setAttribute('aria-pressed', String(MUS.activa())); b.title = MUS.activa() ? 'Silenciar música' : 'Activar música'; b.firstChild.textContent = MUS.activa() ? '🎵' : '🔇'; }); }
  ['bMusica', 'cMusica'].forEach(function (id) { var b = $(id); if (b) b.onclick = function () { MUS.activar(!MUS.activa()); pintarBotonMusica(); }; });
  pintarBotonMusica();
  $('cAjustes').onclick = function () { abrirMenu('ajustes'); };
  $('cAyuda').onclick = function () { abrirMenu('ayuda'); };

  /* ---------- Recorrido por paradas (1.7.0) ----------
     En los pueblos que tienen ruta en aventura/rutas.js ya no se anda libremente (sin cruceta,
     salto ni ataque): se va de parada en parada. Las aventuras, cofres, encargos y la tienda
     son los mismos de siempre; solo cambia cómo se llega a ellos. */
  var RUTAS = window.GaloisRutas || {}, RUTA_CLAVE = 'galoisLegacy.ruta.v1';
  function rutaDe(id) { return Array.isArray(RUTAS[id]) && RUTAS[id].length ? RUTAS[id] : null; }
  function rutaLeer() { try { var d = JSON.parse(localStorage.getItem(RUTA_CLAVE) || '{}'); return d && typeof d === 'object' ? d : {}; } catch (e) { return {}; } }
  function rutaVistas() { var d = rutaLeer(), a = d[C.activo()] || {}; return a['m' + G.rutaId] || {}; }
  function rutaMarcar(id) { var d = rutaLeer(), al = C.activo(); d[al] = d[al] || {}; var m = d[al]['m' + G.rutaId] = d[al]['m' + G.rutaId] || {}; m[id] = true; try { localStorage.setItem(RUTA_CLAVE, JSON.stringify(d)); } catch (e) {} }
  function paradaHecha(p) { return (!p.aventura || hecha(G.rutaId, p.aventura)) && (!p.pregunta || !!rutaVistas()[p.id]); }
  // una parada se puede visitar si todas las anteriores obligatorias están hechas (los cruces no se bloquean entre sí)
  function paradaAlcanzable(i) {
    var R = rutaDe(G.rutaId), g = R[i].grupo;
    for (var k = 0; k < i; k++) { if (g && R[k].grupo === g) continue; if (!paradaHecha(R[k])) return false; }
    return true;
  }
  function frontera() { var R = rutaDe(G.rutaId); for (var i = 0; i < R.length; i++) if (!paradaHecha(R[i]) && paradaAlcanzable(i)) return i; return R.length - 1; }
  // siguientes posibles desde la parada i: varias si hay un cruce por delante
  function siguientes(i) {
    var R = rutaDe(G.rutaId), g = R[i].grupo;
    if (g) { var otras = []; R.forEach(function (p, k) { if (k !== i && p.grupo === g && !paradaHecha(p)) otras.push(k); }); if (otras.length) return otras; }
    var j = i + 1; while (j < R.length && g && R[j].grupo === g) j++;
    if (j >= R.length) return [];
    var g2 = R[j].grupo;
    if (g2) { var grupo = []; for (var k2 = j; k2 < R.length && R[k2].grupo === g2; k2++) if (!paradaHecha(R[k2])) grupo.push(k2); if (grupo.length) return grupo; while (j < R.length && R[j].grupo === g2) j++; return j < R.length ? [j] : []; }
    return [j];
  }
  function vecinoLlamado(n) { return vecinos.find(function (v) { return v.nombre === n; }); }
  function entrarRuta(id) {
    document.documentElement.classList.add('en-ruta');
    G.enRuta = true; G.rutaId = id; G.modo = 'ruta'; G.rutaPos = frontera();
    $('controles').hidden = true; $('ruta').hidden = false; pintarFondoRuta(); mostrarParada(G.rutaPos, false);
  }
  function salirRuta() { document.documentElement.classList.remove('en-ruta'); G.enRuta = false; $('ruta').hidden = true; }
  function verNav() { setTimeout(function () { try { $('ruNav').scrollIntoView({ block: 'nearest', behavior: REDUCIDO ? 'auto' : 'smooth' }); } catch (e) {} }, 60); }
  function volverARuta() { G.modo = 'ruta'; $('controles').hidden = true; mostrarParada(G.rutaPos, false); if (paradaHecha(rutaDe(G.rutaId)[G.rutaPos])) verNav(); }
  function pintarFondoRuta() {
    var c = $('ruFondo'), r = c.getBoundingClientRect(), k = 3, w = Math.max(80, Math.ceil(r.width / k)), h = Math.max(60, Math.ceil(r.height / k));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    window.GaloisPortada.dibujar(c.getContext('2d'), w, h, 0, null, { campo: true });
  }
  addEventListener('resize', function () { if (G.enRuta && !$('ruta').hidden) pintarFondoRuta(); });
  function pintarSprite(canvas, hoja, anim, dir, t) { var x = canvas.getContext('2d'); x.imageSmoothingEnabled = false; x.clearRect(0, 0, canvas.width, canvas.height); S.pintar(x, hoja, anim, dir, t, canvas.width / 2, canvas.height - 2, canvas.width / hoja.fw); }
  var ruAnim = null;
  function mostrarParada(i, andando) {
    var R = rutaDe(G.rutaId), p = R[i], wd = W.datos; G.rutaPos = i;
    // monumento: PNG del patrimonio o edificio pixel del juego
    var img = $('ruImg'), sp = $('ruSprite');
    if (p.img) { img.src = p.img; img.alt = p.nombre; img.hidden = false; sp.hidden = true; }
    else { img.hidden = true; sp.hidden = false; var ed = E.edificio(p.sprite || 'casa', p.o || {}); sp.width = ed.canvas.width; sp.height = ed.canvas.height; var sx = sp.getContext('2d'); sx.imageSmoothingEnabled = false; sx.clearRect(0, 0, sp.width, sp.height); sx.drawImage(ed.canvas, 0, 0); sp.setAttribute('aria-label', p.nombre); }
    // personajes: vecino y, si la aventura tiene enemigo pendiente, el enemigo
    var v = p.vecino && vecinoLlamado(p.vecino), cv = $('ruVecino'), ce = $('ruEnemigo');
    if (v) { cv.hidden = false; pintarSprite(cv, v.hoja, 'idle', 'down', 0); } else cv.hidden = true;
    var enemId = null;
    if (p.aventura && !hecha(G.rutaId, p.aventura)) { var sin = Array.isArray(wd.sinEnemigo) ? wd.sinEnemigo : []; if (sin.indexOf(p.aventura) < 0) enemId = p.aventura === 2 ? wd.enemigos[0] : p.aventura === 4 ? wd.enemigos[1] : p.aventura === 5 ? wd.jefe : null; }
    if (enemId) { ce.hidden = false; pintarSprite(ce, S.hojaEnemigo(enemId, p.aventura === 5 ? { jefe: true, fase: 1 } : null), 'idle', 'left', 0); ce.title = nombreEnemigo(enemId); } else ce.hidden = true;
    // pasos
    $('ruPasos').innerHTML = R.map(function (q, k) { var ok = paradaHecha(q), al = paradaAlcanzable(k); return '<li><button type="button" data-k="' + k + '"' + (al ? '' : ' disabled') + (k === i ? ' aria-current="step"' : '') + ' class="' + (ok ? 'ok' : '') + '" aria-label="Parada ' + (k + 1) + ': ' + esc(q.nombre) + (ok ? ', hecha' : al ? '' : ', bloqueada') + '">' + (ok ? '✔' : k + 1) + '</button></li>'; }).join('');
    $('ruPasos').querySelectorAll('button').forEach(function (b) { b.onclick = function () { irA(+b.dataset.k); }; });
    $('ruLugar').textContent = wd.lugar + ' · parada ' + (i + 1) + ' de ' + R.length + (p.grupo ? ' · cruce de caminos' : '');
    $('ruNombre').textContent = p.nombre; $('ruTexto').textContent = p.texto;
    pintarPreguntaRuta(p); pintarAccionesRuta(p, v); pintarNavRuta(i);
    // héroe: llega andando por el camino
    var h = $('ruHeroe'), hoja = S.hojaHeroe(G.heroeId), t0 = performance.now(), dur = (andando && !REDUCIDO) ? 1100 : 0;
    cancelAnimationFrame(ruAnim);
    $('ruMon').classList.remove('llega'); void $('ruMon').offsetWidth; if (dur) $('ruMon').classList.add('llega');
    (function paso(ahora) {
      var u = dur ? Math.min(1, (ahora - t0) / dur) : 1;
      h.style.setProperty('--avance', String(u));
      pintarSprite(h, hoja, u < 1 ? 'walk' : 'idle', u < 1 ? 'right' : 'down', u < 1 ? S.indice(hoja, 'walk', (ahora - t0) / 1000) : 0);
      if (u < 1) ruAnim = requestAnimationFrame(paso);
    })(t0);
    actualizarHUD();
  }
  function irA(k) { if (!paradaAlcanzable(k)) return; mostrarParada(k, k !== G.rutaPos); var t = $('ruNombre'); try { t.focus({ preventScroll: true }); } catch (e) {} }
  function pintarPreguntaRuta(p) {
    var caja = $('ruPregunta');
    if (!p.pregunta) { caja.hidden = true; caja.innerHTML = ''; return; }
    caja.hidden = false; var q = p.pregunta;
    if (rutaVistas()[p.id]) { caja.innerHTML = '<p class="ru-q ok">✔ ' + esc(q.q) + ' <b>' + esc(q.ok) + '</b></p>'; return; }
    var ops = [q.ok].concat(q.mal), orden = ops.map(function (o, k) { return { o: o, k: (k * 7 + p.id.length) % 5 }; }).sort(function (a, b) { return a.k - b.k; });
    caja.innerHTML = '<p class="ru-q">❓ ' + esc(q.q) + '</p><div class="ru-ops">' + orden.map(function (x) { return '<button type="button" class="op">' + esc(x.o) + '</button>'; }).join('') + '</div><p class="ru-por" role="status"></p>';
    caja.querySelectorAll('.op').forEach(function (b) {
      b.onclick = function () {
        if (b.textContent === q.ok) { SFX.ok(); rutaMarcar(p.id); mostrarAviso('¡Bien visto!', q.por); mostrarParada(G.rutaPos, false); verNav(); }
        else { SFX.mal(); b.classList.add('mal', 'tachada'); b.disabled = true; caja.querySelector('.ru-por').textContent = '✖ No es eso. Vuelve a leer el texto de la parada.'; }
      };
    });
  }
  function boton(txt, fn, cls) { var b = document.createElement('button'); b.type = 'button'; b.className = 'ru-acc ' + (cls || ''); b.innerHTML = txt; b.onclick = fn; return b; }
  function pintarAccionesRuta(p, v) {
    var box = $('ruAcciones'), wd = W.datos; box.innerHTML = ''; $('ruAzulejos').innerHTML = '';
    if (p.aventura === 5) {
      if (!hecha(G.rutaId, 5)) box.appendChild(boton('⚔ Desafiar a <b>' + esc(nombreEnemigo(wd.jefe)) + '</b> · Jefe', function () { hablarJefe(); }, 'prin'));
      else box.appendChild(boton('✔ Jefe vencido · repetir el combate para practicar', function () { hablarJefe(); }));
    } else if (p.aventura && !v) {
      // reto sin vecino: combate contra el enemigo de la etapa o construcción en el edificio en obras
      var av = wd.aventuras[p.aventura - 1], sinE = Array.isArray(wd.sinEnemigo) ? wd.sinEnemigo : [];
      var enemN = p.aventura === 3 || sinE.indexOf(p.aventura) >= 0 ? null : (p.aventura === 2 ? wd.enemigos[0] : wd.enemigos[1]);
      var lanzar = function () {
        if (p.aventura === 3) return dialogo([{ quien: p.nombre, txt: av.historia + ' Resuelve los retos para ponerlo a punto.' }], function () { iniciarAventura(3); });
        var ent = enemigos.find(function (e) { return e.etapa === p.aventura; }) || null;
        dialogo([{ quien: enemN ? nombreEnemigo(enemN) : p.nombre, txt: av.historia }], function () { iniciarAventura(p.aventura, ent); });
      };
      if (!hecha(G.rutaId, p.aventura)) box.appendChild(boton((p.aventura === 3 ? '🔨 ' : '⚔ ') + 'Aventura ' + p.aventura + ': <b>' + esc(av.nombre) + '</b> <small>(' + esc(av.tipo) + (enemN ? ' contra ' + esc(nombreEnemigo(enemN)) : '') + ')</small>', lanzar, 'prin'));
      else box.appendChild(boton('✔ Aventura ' + p.aventura + ' superada · repetirla para practicar', lanzar, 'hecho'));
    } else if (v) {
      var etq = '💬 Hablar con ' + esc(v.nombre);
      if (p.aventura && !hecha(G.rutaId, p.aventura)) etq = '▶ Aventura ' + p.aventura + ': <b>' + esc(wd.aventuras[p.aventura - 1].nombre) + '</b> <small>(' + esc(v.nombre) + ')</small>';
      box.appendChild(boton(etq, function () { hablar(v); }, p.aventura && !hecha(G.rutaId, p.aventura) ? 'prin' : ''));
    }
    // aventura 1: los tres azulejos aparecen en la escena después de hablar con Inés
    if (p.aventura === 1 && !hecha(G.rutaId, 1) && G.hablado.mision1 && Object.keys(G.recogidos).length < 3) {
      [[18, 70], [52, 82], [80, 66]].forEach(function (pos, k) {
        if (G.recogidos[k]) return;
        var b = document.createElement('button'); b.type = 'button'; b.className = 'azulejo'; b.style.left = pos[0] + '%'; b.style.top = pos[1] + '%';
        b.setAttribute('aria-label', 'Azulejo suelto ' + (k + 1)); b.textContent = '✦';
        b.onclick = function () { G.recogidos[k] = true; SFX.cofre(); var n = Object.keys(G.recogidos).length; mostrarAviso('Azulejo ' + n + ' de 3', n === 3 ? 'Vuelve a hablar con ' + v.nombre : ''); mostrarParada(G.rutaPos, false); };
        $('ruAzulejos').appendChild(b);
      });
      var n = Object.keys(G.recogidos).length; box.insertBefore(Object.assign(document.createElement('p'), { className: 'ru-nota', textContent: 'Toca los azulejos brillantes ✦ de la escena (' + n + '/3).' }), box.firstChild);
    }
    (p.cofres || []).forEach(function (id) {
      var c = cofres.find(function (x) { return x.id === id; }); if (!c) return;
      box.appendChild(c.abierto ? boton('🗝 Cofre del saber · abierto ✔', function () {}, 'hecho') : boton('🗝 Cofre del saber <small>(opcional, da monedas)</small>', function () { abrirCofre(c); }));
    });
    if (p.encargo) {
      var ve = vecinos.find(function (x) { return x.encargo === p.encargo; }), enc = (wd.opcionales || []).find(function (o) { return o.hito === p.encargo; }) || {};
      if (ve) { var hecho = C.hitoHecho && C.hitoHecho(p.encargo); box.appendChild(boton('⭐ ' + (hecho ? 'Encargo hecho ✔: ' : 'Encargo opcional: ') + esc(enc.nombre || ve.nombre) + ' <small>(' + esc(ve.nombre) + ')</small>', function () { hablarEncargo(ve); }, hecho ? 'hecho' : '')); }
    }
    (p.charla || []).forEach(function (n) {
      var vc = vecinoLlamado(n); if (!vc) return;
      var ls = vc.dialogo.filter(function (t) { return !/botón|⤴|cruceta/.test(t); });
      if (ls.length) box.appendChild(boton('💬 Hablar con ' + esc(vc.nombre), function () { dialogo(ls.map(function (t) { return { quien: vc.nombre, txt: t, v: vc }; })); }));
    });
    if (p.tienda) { var vt = vecinos.find(function (x) { return x.tienda; }); box.appendChild(boton('🧪 Puesto de pociones', function () { if (vt) hablar(vt); else abrirMenu('tienda'); })); }
    if (p.aventura && v && hecha(G.rutaId, p.aventura) && p.aventura !== 5) box.appendChild(boton('✔ Aventura ' + p.aventura + ' superada · repetirla para practicar', function () { iniciarAventura(p.aventura, null, v); }, 'hecho'));
    box.querySelectorAll('.hecho').forEach(function (b) { if (/abierto/.test(b.textContent)) b.disabled = true; });
  }
  function pintarNavRuta(i) {
    var R = rutaDe(G.rutaId), nav = $('ruNav'), p = R[i]; nav.innerHTML = '';
    var prev = -1; for (var k = i - 1; k >= 0; k--) if (paradaAlcanzable(k)) { prev = k; break; }
    var bA = boton('◀ Anterior', function () { irA(prev); }, 'sec'); bA.disabled = prev < 0; nav.appendChild(bA);
    var sig = siguientes(i), listo = paradaHecha(p);
    if (!sig.length) {
      nav.appendChild(boton(faltan(G.rutaId).length ? (p.aventura === 5 ? 'Vence al jefe para terminar ' + W.datos.lugar : 'Te falta terminar alguna parada') : '🗺 Volver a la Campiña ▶', function () { if (!faltan(G.rutaId).length) abrirCampina(); }, 'gl-btn'));
      if (faltan(G.rutaId).length) nav.lastChild.disabled = true;
      return;
    }
    if (!listo) { var b0 = boton('Siguiente parada ▶', function () {}, 'gl-btn'); b0.disabled = true; nav.appendChild(b0); nav.appendChild(Object.assign(document.createElement('p'), { className: 'ru-nota', textContent: p.aventura && !hecha(G.rutaId, p.aventura) ? 'Supera la aventura de esta parada para seguir.' : 'Responde la pregunta para seguir.' })); return; }
    if (sig.length > 1) { nav.appendChild(Object.assign(document.createElement('p'), { className: 'ru-nota', textContent: '🔀 Cruce de caminos: elige por dónde seguir (después harás el otro).' })); }
    sig.forEach(function (k) { nav.appendChild(boton((sig.length > 1 ? '➜ ' : 'Siguiente: ') + esc(R[k].nombre) + ' ▶', function () { irA(k); }, 'gl-btn')); });
  }

  /* ---------- Portada y elección de personaje (1.1) ---------- */
  var ptAnim = null, elAnim = null, elegido = null;
  function hayProgreso() {
    try { if (localStorage.getItem('galoisLegacy.heroe')) return true; } catch (e) {}
    var e = estado(); return !!(e && (e.xp > 0 || Object.keys(e.aventuras || {}).length));
  }
  function ocultarJuego() { salirRuta(); $('hud').hidden = true; $('controles').hidden = true; $('campina').hidden = true; $('menu').hidden = true; }
  function abrirPortada() {
    G.modo = 'portada'; ocultarJuego(); $('eleccion').hidden = true; $('portada').hidden = false;
    var sigue = hayProgreso();
    $('ptContinuar').hidden = !sigue; $('ptCambiar').hidden = !sigue; $('ptEmpezar').hidden = sigue;
    $('ptPie').textContent = sigue ? 'Te espera ' + heroe().nombre + '.' : 'Un juego de πCHU LAB · 1.º ESO';
    var lc = $('ptLienzo'), c = lc.getContext('2d'), t0 = performance.now();
    function tam() { var k = Math.max(2, Math.floor(Math.min(innerWidth, innerHeight * 1.6) / 240)); var w = Math.ceil(innerWidth / k), h = Math.ceil(innerHeight / k); if (lc.width !== w || lc.height !== h) { lc.width = w; lc.height = h; } }
    function cuadro(ahora) {
      if ($('portada').hidden) { ptAnim = null; return; }
      tam(); window.GaloisPortada.dibujar(c, lc.width, lc.height, REDUCIDO ? 0 : (ahora - t0) / 1000, G.heroeId);
      ptAnim = REDUCIDO ? null : requestAnimationFrame(cuadro);
    }
    if (ptAnim) cancelAnimationFrame(ptAnim);
    cuadro(performance.now());
    if (REDUCIDO) addEventListener('resize', function re() { if ($('portada').hidden) return removeEventListener('resize', re); cuadro(performance.now()); });
    if (!matchMedia('(pointer: coarse)').matches) setTimeout(function () { var b = sigue ? $('ptContinuar') : $('ptEmpezar'); try { b.focus({ preventScroll: true }); } catch (e) {} }, 50);
  }
  function aLaCampina() { $('portada').hidden = true; $('eleccion').hidden = true; try { sessionStorage.setItem('galoisLegacy.portadaVista', '1'); } catch (e) {} abrirCampina(); }
  function abrirEleccion() {
    G.modo = 'eleccion'; ocultarJuego(); $('portada').hidden = true; $('eleccion').hidden = false;
    elegido = G.heroeId;
    var lista = $('elLista'), hs = heroesTodos();
    lista.innerHTML = hs.map(function (x) { return '<button type="button" role="radio" data-h="' + x.id + '" aria-checked="' + (x.id === elegido) + '"><canvas width="32" height="44"></canvas>' + esc(x.corto) + '<small>' + esc(x.periodo) + '</small></button>'; }).join('');
    lista.querySelectorAll('button').forEach(function (b) {
      var c2 = b.querySelector('canvas').getContext('2d'); S.pintar(c2, S.hojaHeroe(b.dataset.h), 'idle', 'down', 0, 16, 42, 1);
      b.onclick = function () { elegir(b.dataset.h); if (innerWidth <= 760) $('eleccion').scrollTo({ top: 0, behavior: REDUCIDO ? 'auto' : 'smooth' }); };
    });
    // flechas para moverse por la lista (grupo de opciones)
    lista.onkeydown = function (e) {
      var bs = [].slice.call(lista.querySelectorAll('button')), i = bs.indexOf(document.activeElement); if (i < 0) return;
      var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return;
      e.preventDefault(); var n = bs[(i + d + bs.length) % bs.length]; n.focus(); elegir(n.dataset.h);
    };
    elegir(elegido);
    setTimeout(function () { var b = lista.querySelector('[aria-checked="true"]'); if (b) try { b.focus({ preventScroll: true }); } catch (e) {} }, 50);
    var sc = $('elSprite').getContext('2d'), t0 = performance.now();
    function cuadro(ahora) {
      if ($('eleccion').hidden) { elAnim = null; return; }
      var hoja = S.hojaHeroe(elegido), t = (ahora - t0) / 1000, anim = REDUCIDO ? 'idle' : (Math.floor(t / 2.5) % 2 ? 'idle' : 'walk');
      sc.imageSmoothingEnabled = false; sc.clearRect(0, 0, 64, 88); S.pintar(sc, hoja, anim, 'down', REDUCIDO ? 0 : S.indice(hoja, anim, t), 32, 84, 1.5);
      elAnim = requestAnimationFrame(cuadro);
    }
    if (elAnim) cancelAnimationFrame(elAnim);
    elAnim = requestAnimationFrame(cuadro);
  }
  function elegir(id) {
    var x = heroesTodos().find(function (h) { return h.id === id; }); if (!x || !S.heroes[id]) return;
    elegido = id;
    $('elLista').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.h === id)); b.tabIndex = b.dataset.h === id ? 0 : -1; });
    $('elTexto').innerHTML = '<h2>' + esc(x.nombre) + '</h2><p class="dato">' + esc(x.periodo) + ' · ' + esc(x.origen) + '</p>' +
      '<p>' + esc(x.aporte) + '</p><p class="hab">✦ <b>' + esc(x.habilidad) + '</b>: ' + DESC_HAB[HABILIDAD[x.id] || 'pista'] + ' (una vez por combate).</p>';
  }
  function confirmarHeroe() {
    G.heroeId = elegido; try { localStorage.setItem('galoisLegacy.heroe', G.heroeId); } catch (e) {} C.rpg.preferencias({ heroe: G.heroeId });
    SFX.ok(); aLaCampina();
  }
  $('ptEmpezar').onclick = function () { MUS.tocar('campina'); abrirEleccion(); };
  $('ptCambiar').onclick = function () { MUS.tocar('campina'); abrirEleccion(); };
  $('ptContinuar').onclick = function () { aLaCampina(); };
  $('elVolver').onclick = function () { abrirPortada(); };
  $('elListo').onclick = confirmarHeroe;
  $('cPortada').onclick = function () { abrirPortada(); };

  /* ---------- Arranque ---------- */
  function iniciar() {
    ajustar();
    try { G.heroeId = localStorage.getItem('galoisLegacy.heroe') || estado().heroe || 'galois'; G.sonido = localStorage.getItem('galoisLegacy.sonido') !== '0'; } catch (e) {}
    if (!S.heroes[G.heroeId]) G.heroeId = 'galois';
    G.dif = estado().dificultad || 'aventurero';
    var m = +params.get('mundo');
    var vista = false; try { vista = sessionStorage.getItem('galoisLegacy.portadaVista') === '1'; } catch (e) {}
    if (m >= 1 && m <= 10 && desbloqueado(m)) cargarMundo(m);
    else if (vista || PRUEBA) abrirCampina();   // al volver del álbum no se repite la portada
    else abrirPortada();
    if (m && !desbloqueado(m)) mostrarAviso('Ese mundo aún está bloqueado', 'Supera antes al jefe del mundo anterior.');
    requestAnimationFrame(bucle);
    if (PRUEBA) window.__GL = { G: G, respuesta: function () { return G.batalla && G.batalla.q && G.batalla.q.respuesta; }, cargarMundo: cargarMundo, atacar: atacar, saltar: saltar, tile: function (i, j) { return W.def.mapa.t[j][i]; }, enemigos: function () { return enemigos; }, iniciarAventura: function (e) { iniciarAventura(e, e === 5 ? jefe : null, e === 1 ? vecinoMision() : null); }, pendiente: function () { return pendiente(G.mundo); } };
  }
  iniciar();
})();
