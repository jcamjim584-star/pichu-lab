/* =====================================================================
   GALOIS LEGACY · música chiptune original (Web Audio, sin archivos)
   ---------------------------------------------------------------------
   Todas las melodías se componen aquí por reglas (motivos que se repiten
   y varían sobre progresiones de acordes), con sabor andaluz en varios
   mundos (modo frigio con tercera mayor y cadencia andaluza). No se usa
   ninguna melodía existente.

   API (window.GaloisMusica):
     tocar(pista, {mundo, fase})   pistas: campina, mundo, reto, combate,
                                   jefe, victoria, derrota
     fase(n)       intensifica la música del jefe (1-3)
     parar()       detiene con un fundido
     activar(bool), activa(), volumen(0..1), desbloquear()
   El navegador solo permite sonar tras un toque o una tecla: la pista
   pedida se guarda y empieza en la primera interacción.
   ===================================================================== */
(function (root) {
  'use strict';
  var CLAVE = 'galoisLegacy.musica', CLAVE_VOL = 'galoisLegacy.musica.vol';
  var AC = null, master = null, bus = null, ruido = null;
  var activa = leer(CLAVE, '1') === '1', vol = Math.max(0, Math.min(1, +leer(CLAVE_VOL, '0.5')));
  var actual = null, pedida = null, paso = 0, siguiente = 0, timer = null, faseJefe = 1;
  function leer(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ---------- Azar con semilla (cada mundo suena siempre igual) ---------- */
  function semilla(s) { return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  /* ---------- Escalas y progresiones ---------- */
  var ESC = {
    mayor: [0, 2, 4, 5, 7, 9, 11], menor: [0, 2, 3, 5, 7, 8, 10], dorico: [0, 2, 3, 5, 7, 9, 10],
    andaluz: [0, 1, 4, 5, 7, 8, 10], mixolidio: [0, 2, 4, 5, 7, 9, 10], lidio: [0, 2, 4, 6, 7, 9, 11]
  };
  // grados (0 = tónica) por compás
  var PROG = {
    luminosa: [0, 4, 5, 3, 0, 4, 3, 4], cadencia: [3, 2, 1, 0, 3, 2, 1, 0], // cadencia andaluza (Lam-Sol-Fa-Mi) sobre el modo andaluz desde Mi
    epica: [0, 5, 3, 4, 0, 5, 6, 4], viaje: [0, 3, 4, 0, 5, 3, 4, 4], tension: [0, 0, 5, 4, 0, 0, 1, 0]
  };
  // carácter de cada mundo: escala, raíz MIDI, tempo, progresión, ritmo del bajo
  var MUNDOS = {
    1: ['mayor', 62, 104, 'luminosa'],   // Fuentes: alegre, campos de cereal
    2: ['dorico', 57, 100, 'viaje'],     // Carmona: murallas antiguas
    3: ['andaluz', 64, 112, 'cadencia'], // Écija: calor y torres
    4: ['mixolidio', 60, 98, 'luminosa'],// Marchena: olivares
    5: ['mayor', 65, 108, 'viaje'],      // Estepa: dulce y luminoso
    6: ['dorico', 62, 96, 'epica'],      // Osuna: universidad, misterio
    7: ['andaluz', 64, 118, 'cadencia'], // Triana: aire flamenco
    8: ['lidio', 60, 102, 'viaje'],      // Alcalá: agua y molinos
    9: ['menor', 57, 94, 'epica'],       // Itálica: ruinas romanas
    10: ['andaluz', 62, 110, 'cadencia'] // Sevilla: final
  };

  function nota(esc, raiz, grado, oct) {
    var n = esc.length, o = Math.floor(grado / n), g = ((grado % n) + n) % n;
    return raiz + esc[g] + 12 * (o + (oct || 0));
  }
  function acorde(esc, raiz, g) { return [nota(esc, raiz, g), nota(esc, raiz, g + 2), nota(esc, raiz, g + 4)]; }

  /* ---------- Compositor: motivo de 2 compases, forma A A' B A'' ---------- */
  var RITMOS = [
    [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0], [1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0], [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0]
  ];
  function componer(cfg) {
    var r = semilla(cfg.seed), esc = ESC[cfg.escala], raiz = cfg.raiz, prog = PROG[cfg.prog], compases = prog.length;
    function frase(base, variar) {
      var notas = [], g = base, rit1 = RITMOS[Math.floor(r() * RITMOS.length)], rit2 = RITMOS[Math.floor(r() * RITMOS.length)];
      for (var c = 0; c < 2; c++) {
        var rit = c ? rit2 : rit1;
        for (var s = 0; s < 16; s++) {
          if (!rit[s]) { notas.push(null); continue; }
          var fuerte = s % 4 === 0;
          if (fuerte) { var tonos = [0, 2, 4, 7]; g = base + tonos[Math.floor(r() * tonos.length)]; }
          else g += [-1, 1, 1, -2, 2, -1][Math.floor(r() * 6)];
          g = Math.max(-2, Math.min(9, g));
          notas.push(g + (variar && s > 11 && c === 1 ? 1 : 0));
        }
      }
      if (variar === 'cierre') notas[notas.length - 4] = 0;
      return notas;
    }
    var A = frase(0), A2 = frase(0, true), B = frase(3), A3 = A.slice(0, 16).concat(frase(0, 'cierre').slice(16));
    var mel = A.concat(A2, B, A3).slice(0, compases * 16);
    return { esc: esc, raiz: raiz, prog: prog, mel: mel, bpm: cfg.bpm, compases: compases };
  }

  /* ---------- Pistas ---------- */
  var cache = {};
  function pista(nombre, op) {
    var k = nombre + (op && op.mundo || '');
    if (cache[k]) return cache[k];
    var t;
    if (nombre === 'campina') t = Object.assign(componer({ seed: 1811, escala: 'mayor', raiz: 62, bpm: 92, prog: 'viaje' }), { arpegio: true, bateria: 'suave', bajo: 'largo' });
    else if (nombre === 'mundo' || nombre === 'reto') {
      var m = MUNDOS[(op && op.mundo) || 1];
      t = componer({ seed: 1000 + ((op && op.mundo) || 1) * 37, escala: m[0], raiz: m[1], bpm: m[2], prog: m[3] });
      t.bateria = m[0] === 'andaluz' ? 'palmas' : 'paseo'; t.bajo = 'paseo'; t.arpegio = nombre === 'reto';
      if (nombre === 'reto') { t.bpm = Math.round(t.bpm * .9); t.soloEco = true; }
    }
    else if (nombre === 'combate') t = Object.assign(componer({ seed: 1777, escala: 'menor', raiz: 57, bpm: 138, prog: 'epica' }), { arpegio: true, bateria: 'combate', bajo: 'galope' });
    else if (nombre === 'jefe') t = Object.assign(componer({ seed: 1832, escala: 'andaluz', raiz: 52, bpm: 146, prog: 'tension' }), { arpegio: true, bateria: 'combate', bajo: 'galope', jefe: true });
    else if (nombre === 'victoria') t = { jingle: [[72, 1], [76, 1], [79, 1], [84, 3], [null, 1], [79, 1], [84, 4]], bpm: 150 };
    else if (nombre === 'derrota') t = { jingle: [[67, 2], [66, 2], [65, 2], [64, 6]], bpm: 110 };
    return (cache[k] = t);
  }

  /* ---------- Síntesis ---------- */
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function iniciarAudio() {
    if (AC) return true;
    try { AC = new (root.AudioContext || root.webkitAudioContext)(); } catch (e) { return false; }
    master = AC.createGain(); master.gain.value = activa ? vol * .5 : 0;
    var comp = AC.createDynamicsCompressor(); master.connect(comp); comp.connect(AC.destination);
    bus = master;
    var len = AC.sampleRate * .5, buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    ruido = buf; return true;
  }
  function osc(tipo, m, t, dur, v, desliz) {
    var o = AC.createOscillator(), g = AC.createGain();
    o.type = tipo; o.frequency.setValueAtTime(hz(m), t); if (desliz) o.frequency.exponentialRampToValueAtTime(hz(m + desliz), t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .008); g.gain.setValueAtTime(v, t + dur * .6); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + .02);
  }
  function golpe(tipo, t, v) {
    if (tipo === 'bombo') { var o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + .12); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .14); o.connect(g); g.connect(bus); o.start(t); o.stop(t + .16); return; }
    var s = AC.createBufferSource(), f = AC.createBiquadFilter(), g2 = AC.createGain();
    s.buffer = ruido; f.type = tipo === 'charles' ? 'highpass' : 'bandpass'; f.frequency.value = tipo === 'charles' ? 7000 : tipo === 'palma' ? 1500 : 1800;
    var d = tipo === 'charles' ? .04 : tipo === 'palma' ? .07 : .12;
    g2.gain.setValueAtTime(v, t); g2.gain.exponentialRampToValueAtTime(.0001, t + d);
    s.connect(f); f.connect(g2); g2.connect(bus); s.start(t); s.stop(t + d + .02);
  }
  var BAT = {
    suave:   { bombo: [0, 8], caja: [], charles: [4, 12], palma: [] },
    paseo:   { bombo: [0, 6, 8], caja: [4, 12], charles: [0, 2, 4, 6, 8, 10, 12, 14], palma: [] },
    palmas:  { bombo: [0, 8], caja: [], charles: [2, 6, 10, 14], palma: [0, 3, 6, 8, 10] }, // acento de 12 tiempos repartido (sabor flamenco)
    combate: { bombo: [0, 3, 6, 8, 11, 14], caja: [4, 12], charles: [0, 2, 4, 6, 8, 10, 12, 14], palma: [] }
  };

  function programarPaso(t, s) {
    var P = actual; if (!P) return;
    var dur16 = 60 / P.bpm / 4;
    if (P.jingle) {
      var acc = 0; for (var i = 0; i < P.jingle.length; i++) { var j = P.jingle[i]; if (j[0] != null) { osc('square', j[0], t + acc * dur16 * 2, j[1] * dur16 * 2 * .95, .11); osc('triangle', j[0] - 12, t + acc * dur16 * 2, j[1] * dur16 * 2, .13); } acc += j[1]; }
      actual = null; if (pedida) pedida.hecha = true; return;
    }
    var total = P.compases * 16, st = s % total, comp = Math.floor(st / 16), b = st % 16;
    var grado = P.prog[comp], ac = acorde(P.esc, P.raiz - 12, grado), intens = P.jefe ? faseJefe : 1;
    // melodía
    var g = P.mel[st];
    if (g != null && !P.soloEco) {
      var largo = 1; while (largo < 4 && P.mel[(st + largo) % total] == null) largo++;
      osc('square', nota(P.esc, P.raiz, g), t, dur16 * largo * .92, .07);
      if (P.jefe && intens >= 3) osc('square', nota(P.esc, P.raiz, g) + 12, t, dur16 * largo * .5, .025);
    }
    if (P.soloEco && g != null && b % 4 === 0) osc('triangle', nota(P.esc, P.raiz, g) + 12, t, dur16 * 3, .05);
    // bajo
    var raizB = ac[0] - 12;
    if (P.bajo === 'largo' && b % 8 === 0) osc('triangle', raizB, t, dur16 * 7.5, .16);
    if (P.bajo === 'paseo' && b % 4 === 0) osc('triangle', b % 8 === 0 ? raizB : raizB + 7, t, dur16 * 3.5, .15);
    if (P.bajo === 'galope' && b % 2 === 0) osc('triangle', b % 4 === 0 ? raizB : raizB + 12, t, dur16 * 1.6, .16);
    // arpegio
    if (P.arpegio && (b % 2 === 0 || intens >= 2)) osc('square', ac[b % 3] + 12, t, dur16 * .8, P.jefe ? .025 + .01 * intens : .022);
    // batería
    var D = BAT[P.bateria] || BAT.suave;
    if (D.bombo.indexOf(b) >= 0) golpe('bombo', t, .35);
    if (D.caja.indexOf(b) >= 0) golpe('caja', t, .14);
    if (D.charles.indexOf(b) >= 0 || (intens >= 2 && b % 2)) golpe('charles', t, .05);
    if (D.palma.indexOf(b) >= 0) golpe('palma', t, .12);
  }
  function planificador() {
    if (!AC || !actual) return;
    var dur16 = 60 / (actual.bpm * (actual.jefe ? 1 + (faseJefe - 1) * .06 : 1)) / 4;
    while (siguiente < AC.currentTime + .15) { programarPaso(siguiente, paso); paso++; siguiente += dur16; if (!actual) break; }
  }

  function arrancar(nombre, op) {
    if (!iniciarAudio()) return;
    if (AC.state === 'suspended') AC.resume();
    actual = pista(nombre, op); paso = 0; siguiente = AC.currentTime + .08;
    if (nombre === 'jefe') faseJefe = 1;
    master.gain.cancelScheduledValues(AC.currentTime); master.gain.setValueAtTime(activa ? vol * .5 : 0, AC.currentTime);
    clearInterval(timer); timer = setInterval(planificador, 25);
  }

  var API = {
    tocar: function (nombre, op) {
      var clave = nombre + ':' + (op && op.mundo || '');
      if (pedida && pedida.clave === clave && actual && !actual.jingle) return; // ya suena
      pedida = { nombre: nombre, op: op, clave: clave };
      if (!AC || AC.state !== 'running') { if (AC) AC.resume().then(function () { arrancar(nombre, op); }).catch(function () {}); return; }
      arrancar(nombre, op);
    },
    fase: function (n) { faseJefe = Math.max(1, Math.min(3, n)); },
    parar: function () { pedida = null; if (!AC) return; master.gain.setTargetAtTime(0, AC.currentTime, .15); setTimeout(function () { if (!pedida) { actual = null; clearInterval(timer); } }, 500); },
    activar: function (on) { activa = !!on; guardar(CLAVE, activa ? '1' : '0'); if (master) master.gain.setTargetAtTime(activa ? vol * .5 : 0, AC.currentTime, .1); if (activa && pedida && !actual && !pedida.hecha) arrancar(pedida.nombre, pedida.op); },
    activa: function () { return activa; },
    volumen: function (v) { if (v == null) return vol; vol = Math.max(0, Math.min(1, +v)); guardar(CLAVE_VOL, String(vol)); if (master && activa) master.gain.setTargetAtTime(vol * .5, AC.currentTime, .1); },
    desbloquear: function () { if (!activa) return; if (!AC) { iniciarAudio(); } if (AC && AC.state === 'suspended') AC.resume(); if (pedida && !actual && !pedida.hecha) arrancar(pedida.nombre, pedida.op); },
    _pista: pista, _componer: componer,
    /* Render sin conexión para pruebas: devuelve el nivel RMS de la pista */
    _renderizar: function (nombre, op, seg) {
      var guard = [AC, master, bus, ruido, actual, activa, vol, faseJefe];
      var sr = 22050; AC = new OfflineAudioContext(1, Math.round(sr * seg), sr); master = null; activa = true; vol = 1; faseJefe = op && op.fase || 1;
      var oac = AC; master = AC.createGain(); master.gain.value = .5; master.connect(AC.destination); bus = master;
      var len = sr * .5, buf = AC.createBuffer(1, len, sr), d = buf.getChannelData(0); for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; ruido = buf;
      actual = pista(nombre, op); var t = 0, st = 0; var dur16 = 60 / actual.bpm / 4;
      while (t < seg && actual) { programarPaso(t, st++); t += dur16; }
      AC = guard[0]; master = guard[1]; bus = guard[2]; ruido = guard[3]; actual = guard[4]; activa = guard[5]; vol = guard[6]; faseJefe = guard[7];
      return oac.startRendering().then(function (b) { var x = b.getChannelData(0), sum = 0, pico = 0; for (var k = 0; k < x.length; k++) { sum += x[k] * x[k]; pico = Math.max(pico, Math.abs(x[k])); } return { rms: Math.sqrt(sum / x.length), pico: pico }; });
    }
  };
  // primera interacción: el navegador permite empezar a sonar
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { root.addEventListener(ev, function () { API.desbloquear(); }, { passive: true }); });
  root.document && document.addEventListener('visibilitychange', function () { if (!AC) return; if (document.hidden) AC.suspend(); else if (activa) AC.resume(); });
  root.GaloisMusica = API;
})(window);
