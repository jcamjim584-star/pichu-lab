/* =====================================================================
   INTEGER NINJA · EL ATAQUE DE LOS NÚMEROS ENTEROS   (πCHU ARCADE)
   ---------------------------------------------------------------------
   Índice del archivo
     1. Marca y datos del juego (niveles, espadas, logros…)
     2. Guardado (localStorage)
     3. Sonido (Web Audio API, todo sintetizado: sin archivos externos)
     4. Lienzo (canvas) y dibujo de frutas, bombas y jefe
     5. Efectos (partículas, mitades, textos flotantes)
     6. Estado de la partida y modos de juego
     7. Lanzamiento de frutas (oleadas)
     8. Cortes: el gesto del dedo/ratón y sus consecuencias matemáticas
     9. Bucle principal (actualizar + dibujar)
    10. Marcador (HUD) y πCHU
    11. Pantallas y menús
   ===================================================================== */
(function () {
  'use strict';
  const E = window.IntegerEngine;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const rng = E.defaultRng;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const TAU = Math.PI * 2;

  /* =================================================================
     1. MARCA Y DATOS
     ================================================================= */
  const MARCA = {
    nombre: 'πCHU ARCADE',
    colores: { espresso: '#332B2A', salvia: '#5A8A78', salviaOsc: '#3F6E5C', coral: '#E46D4D', coralOsc: '#A8402A', crema: '#F4EDD7', mostaza: '#E8B53A' },
    fuente: "'Lato', system-ui, sans-serif",
  };
  const C = MARCA.colores;

  // Frutas "normales" (llevan un número). Cada una: color de piel, pulpa y forma.
  const FRUITS = {
    apple: { skin: '#D9483B', flesh: '#F7E7B4', juice: '#F2D27A' },
    orange: { skin: '#F29A2E', flesh: '#FFC15E', juice: '#FFB238' },
    strawberry: { skin: '#E0443E', flesh: '#F78B84', juice: '#E8413B' },
    peach: { skin: '#F6A97A', flesh: '#FFD3A3', juice: '#FFC07A' },
    kiwi: { skin: '#8B6B3E', flesh: '#8BC34A', juice: '#9BD15A' },
    plum: { skin: '#7A4E8C', flesh: '#E5B85C', juice: '#B07ACB' },
    lemon: { skin: '#F4D23C', flesh: '#FFF07A', juice: '#FFF27A' },
    pineapple: { skin: '#E8B53A', flesh: '#FFE27A', juice: '#FFE066' },
    grape: { skin: '#7C4DB3', flesh: '#C9A3E6', juice: '#9B6BD6' },
    cherry: { skin: '#C7243A', flesh: '#E6555A', juice: '#D0283E' },
    coconut: { skin: '#7A5534', flesh: '#FFFFFF', juice: '#F5F1E6' },
    melon: { skin: '#3E8E4F', flesh: '#EF5350', juice: '#F25C54' },
    gold: { skin: '#F2C230', flesh: '#FFE680', juice: '#FFE066' },
    bomb: { skin: '#2B2524', flesh: '#2B2524', juice: '#FF8A3D' },
    seed: { skin: '#F4EDD7', flesh: '#FFF8E8', juice: '#9fd6c0' },
  };
  const NORMAL_KINDS = ['apple', 'orange', 'strawberry', 'peach', 'kiwi', 'plum'];
  const SPECIAL_INFO = {
    neg: { kind: 'lemon', name: 'Limón inversor', cap: 'OPUESTO', desc: 'Cambia el signo del acumulador: −8 se convierte en +8.' },
    abs: { kind: 'grape', name: 'Uva de valor absoluto', cap: 'VALOR ABS.', desc: 'Convierte el acumulador en su valor absoluto: |−9| = 9.' },
    mul: { kind: 'pineapple', name: 'Piña multiplicadora', cap: 'MULTIPLICA', desc: 'Multiplica el acumulador: (−4)·(−2) = +8.' },
    div: { kind: 'coconut', name: 'Coco divisor', cap: 'DIVIDE', desc: 'Divide el acumulador solo si la división es exacta.' },
    dbl: { kind: 'cherry', name: 'Cereza doble', cap: 'DOBLE', desc: 'Suma dos veces su número: 2·(+3) = +6.' },
    blast: { kind: 'melon', name: 'Sandía explosiva', cap: '¡BOOM!', desc: 'Corta las frutas cercanas (nunca las bombas), de la más cercana a la más lejana.' },
    gold: { kind: 'gold', name: 'Fruta dorada', cap: '+10 🪙', desc: 'Da monedas y puntos. No cambia el acumulador.' },
    bomb: { kind: 'bomb', name: 'Bomba', cap: '', desc: '¡Evítala! Quita una vida y rompe la racha.' },
  };

  /* Enemigos (ilustraciones de Juan Antonio, incrustadas en el HTML) */
  const ENEMIES = {
    fantasma: { name: 'El Fantasma de la Recta', attack: 'bombs', bombs: 1, intro: '¡Uuuh! ¡Te perderás en mi recta numérica!', hurt: ['¡Uuuh! ¡Me has ordenado!', '¡Ese signo era correcto!'], laugh: '¡Jijiji! ¿Izquierda o derecha del 0?' },
    bajocero: { name: 'El Barón Bajo Cero', attack: 'flip', intro: '¡Congelaré tus objetivos bajo cero!', hurt: ['¡Me derrito!', '¡Esa suma quema!'], laugh: '¡Brrr! ¡Tu objetivo cambia de signo!' },
    menos: { name: 'Don Menos', attack: 'flip', intro: '¡Pondré un menos delante de todo!', hurt: ['¡Has entendido mi menos!', '¡Ay, que me cambias el signo!'], laugh: '¡Un menos delante y todo cambia!' },
    mago: { name: 'El Mago de los Signos', attack: 'mix', intro: '¡Ahora lo ves positivo, ahora negativo!', hurt: ['¡Has descubierto mi truco!', '¡Menos por menos… más!'], laugh: '¡Tachán! ¡Truco de signos!' },
    arlequina: { name: 'Arlequina del Caos', attack: 'mix', intro: '¡Mezclo sumas, signos y valores absolutos!', hurt: ['¡Qué orden tienes!', '¡No me lo esperaba!'], laugh: '¡Caos, caos, caos!' },
    duende: { name: 'Duendecillo Negativo', attack: 'flip', intro: '¡Jiji! ¡Todo lo que toco se vuelve negativo!', hurt: ['¡Ay!', '¡Positivo no!'], laugh: '¡Jijiji!' },
    candado: { name: 'Guardián Candado', attack: 'bombs', bombs: 2, intro: '¡Nadie pasa sin la cuenta correcta!', hurt: ['¡Grrr… cuenta correcta!', '¡Mi candado!'], laugh: '¡Dinamita para los despistados!' },
    rey: { name: 'El Rey de los Signos', attack: 'mix', intro: '¡Soy el Rey de los Signos! ¡Arrodíllate ante el más y el menos!', hurt: ['¡Imposible!', '¡Mi corona!', '¡Eso ha dolido!'], laugh: '¡Jajaja! ¡Cambio de signo!' },
  };
  const ARCADE_RIVALS = ['duende', 'candado', 'fantasma', 'bajocero', 'menos', 'mago', 'arlequina'];
  const IMG = {};
  const ASSETS = window.PICHU_ASSETS || {};
  Object.keys(ASSETS).forEach((k) => { const im = new Image(); im.src = ASSETS[k]; IMG[k] = im; });

  const SWORDS = [
    { id: 'classic', name: 'Espada clásica', icon: '⚔️', cost: 0, core: '#FFFFFF', glow: 'rgba(244,237,215,0.55)' },
    { id: 'electric', name: 'Espada eléctrica', icon: '⚡', cost: 150, core: '#FFFBE0', glow: 'rgba(255,216,74,0.7)', fx: 'spark' },
    { id: 'fire', name: 'Espada de fuego', icon: '🔥', cost: 300, core: '#FFF3C4', glow: 'rgba(255,106,43,0.75)', fx: 'ember' },
    { id: 'ice', name: 'Espada de hielo', icon: '❄️', cost: 300, core: '#EAFFFF', glow: 'rgba(127,216,255,0.7)', fx: 'snow' },
    { id: 'rainbow', name: 'Espada arcoíris', icon: '🌈', cost: 600, core: '#FFFFFF', glow: 'rainbow', fx: 'rainbow' },
    { id: 'galaxy', name: 'Espada galáctica', icon: '🌌', cost: 1000, core: '#F0E6FF', glow: 'rgba(138,92,255,0.75)', fx: 'star' },
  ];
  const BGS = [
    { id: 'dojo', name: 'Dojo retro', cost: 0 },
    { id: 'night', name: 'Noche estrellada', cost: 400 },
    { id: 'lab', name: 'Laboratorio πCHU', cost: 400 },
  ];
  const ACH = [
    { id: 'first_cut', i: '✂️', n: 'Primer tajo', d: 'Corta tu primera fruta' },
    { id: 'first_target', i: '🎯', n: 'Diana', d: 'Consigue tu primer objetivo exacto' },
    { id: 'zero', i: '🌀', n: 'Cero absoluto', d: 'Haz un COMBO CERO (+7 y −7)' },
    { id: 'exact', i: '⚡', n: 'De un solo tajo', d: 'Haz un COMBO EXACTO' },
    { id: 'mega', i: '💥', n: 'Megacombo', d: '4 frutas, un gesto, objetivo exacto' },
    { id: 'streak5', i: '🔥', n: 'En racha', d: 'Llega al multiplicador ×5' },
    { id: 'streak10', i: '🚀', n: 'Imparable', d: 'Llega al multiplicador ×10' },
    { id: 'score1k', i: '🥉', n: 'Mil puntos', d: '1000 puntos en una partida' },
    { id: 'score5k', i: '🥇', n: 'Cinco mil', d: '5000 puntos en una partida' },
    { id: 'survivor', i: '⏱️', n: 'Superviviente', d: 'Aguanta 120 s en el modo arcade' },
    { id: 'perfect', i: '✅', n: 'Sin fallos', d: 'Completa una misión “Corta…” sin errores' },
    { id: 'inverter', i: '🍋', n: 'Mundo al revés', d: 'Usa un limón inversor' },
    { id: 'divider', i: '🥥', n: 'División exacta', d: 'Usa bien un coco divisor' },
    { id: 'lvl3', i: '🥋', n: 'Aprendiz ninja', d: 'Completa el nivel 3 de la aventura' },
    { id: 'king', i: '👑', n: 'Rey destronado', d: 'Derrota al Rey de los Signos' },
    { id: 'collector', i: '🗡️', n: 'Coleccionista', d: 'Consigue 3 espadas' },
    { id: 'rule10', i: '🌱', n: 'Regla de oro', d: '10 decisiones de signo correctas en una partida' },
    { id: 'rivals3', i: '🥊', n: 'Cazarrivales', d: 'Derrota 3 rivales en el modo arcade' },
    { id: 'duelwin', i: '⚔️', n: 'Duelista', d: 'Supera el reto de un compañero' },
  ];

  /* Configuraciones matemáticas por dificultad (cuando no hay configuración docente) */
  const MATH_PRESETS = [
    { min: -10, max: 10, ops: { add: true, sub: false, mul: false, div: false }, targetMin: -10, targetMax: 10, solutionMin: 1, solutionMax: 2, distractors: 2, special: 0.25, bombs: [0, 1] },
    { min: -12, max: 12, ops: { add: true, sub: true, mul: false, div: false }, targetMin: -15, targetMax: 15, solutionMin: 2, solutionMax: 3, distractors: 3, special: 0.35, bombs: [1, 1] },
    { min: -15, max: 15, ops: { add: true, sub: true, mul: true, div: false }, targetMin: -20, targetMax: 20, solutionMin: 2, solutionMax: 3, distractors: 4, special: 0.45, bombs: [1, 2] },
  ];
  const AIRTIME = [3.3, 2.6, 2.1]; // segundos en el aire según la velocidad (lenta, media, rápida)

  /* Niveles del modo aventura. Cada nivel es una secuencia de "pasos":
       { type:'exact', n }                → conseguir n objetivos exactos
       { type:'filter', mission, n }      → n cortes correctos de una misión     */
  const LEVELS = [
    {
      id: 1, name: 'La invasión de los signos', icon: '🍎', guardian: 'fantasma', blurb: 'Positivos, negativos y comparar',
      cfg: { min: -10, max: 10, ops: { add: true }, specials: false, bombs: true },
      steps: [{ type: 'filter', mission: 'neg', n: 5 }, { type: 'filter', mission: 'pos', n: 5 }, { type: 'filter', mission: 'gt', n: 5 }, { type: 'filter', mission: 'lt', n: 5 }],
      bombs: 0, motor: 0,
      say: '¡El Fantasma de la Recta invade el dojo! Fíjate bien en el signo de cada fruta.',
      body: '<p>Los <b>positivos</b> están a la derecha del 0 y los <b>negativos</b> a la izquierda. El <b>0</b> no es ni positivo ni negativo.</p><p>En la recta, el que está más a la izquierda es el menor: <b>−5 &lt; −2</b>, aunque 5 sea mayor que 2.</p><p>Cada corte correcto le quita vida al Fantasma. Si cortas el que no es, pierdes 50 puntos.</p>',
    },
    {
      id: 2, name: 'El poder de la suma', icon: '🍊', guardian: 'bajocero', blurb: 'Suma de enteros del mismo y de distinto signo',
      cfg: { min: -10, max: 10, ops: { add: true }, targetMin: -12, targetMax: 12, solutionMin: 2, solutionMax: 2, distractors: 2, specials: true },
      special: 0.2, specialPool: ['gold', 'blast'],
      steps: [{ type: 'exact', n: 6 }], bombs: 1, motor: 0,
      say: 'El Barón Bajo Cero quiere congelarlo todo. ¡Suma con cabeza y llega exactamente al objetivo!',
      body: '<div class="rule"><span>(+3) + (+4)</span><span>= +7</span><span>(−3) + (−4)</span><span>= −7</span><span>(+8) + (−3)</span><span>= +5</span><span>(−8) + (+3)</span><span>= −5</span></div><p><b>Mismo signo:</b> se suman los valores absolutos y se deja el signo.<br><b>Distinto signo:</b> se restan y se pone el signo del que tiene mayor valor absoluto.</p><p>Piensa en un termómetro: sumar un negativo es <b>bajar</b> grados; sumar un positivo, <b>subir</b>.</p>',
    },
    {
      id: 3, name: 'La venganza de los negativos', icon: '🍓', guardian: 'menos', blurb: 'El signo menos delante del paréntesis, resta y opuestos',
      cfg: { min: -9, max: 9, ops: { add: true, sub: true }, targetMin: -12, targetMax: 12, solutionMin: 2, solutionMax: 2, distractors: 1, specials: false, subChance: 0.7 },
      decide: true, twins: true,
      steps: [{ type: 'filter', mission: 'negparSign', n: 6 }, { type: 'exact', n: 3 }, { type: 'filter', mission: 'negparEq', n: 4 }, { type: 'filter', mission: 'opp', n: 4 }, { type: 'exact', n: 3 }], bombs: 1, motor: 0,
      say: '¡Don Menos pone un − delante de todo! Tienes que saber qué hace ese menos.',
      body: '<div class="rule"><span>−(+4)</span><span>= −4</span><span>−(−4)</span><span>= +4</span><span>+(−4)</span><span>= −4</span><span>+(+4)</span><span>= +4</span></div><p><b>Un − delante del paréntesis CAMBIA el signo de lo de dentro.</b> Un + lo deja igual.</p><p>Por eso restar es sumar el opuesto: <b>(+2) − (−4) = (+2) + (+4) = +6</b>.</p><p>🌱 <b>Semillas de decisión:</b> al cortar una fruta con −( ), el tiempo se ralentiza y salen dos semillas. Corta la que tiene el resultado correcto. ¡No vale cortar al azar!</p>',
    },
    {
      id: 4, name: 'El laboratorio de los signos', icon: '🍍', guardian: 'mago', blurb: 'Regla de los signos: multiplicar y dividir',
      cfg: { min: -6, max: 6, ops: { add: true, mul: true, div: true }, targetMin: -15, targetMax: 15, solutionMin: 1, solutionMax: 2, distractors: 1, specials: false, mulChance: 0.75, divChance: 0.45 },
      decide: true, twins: true,
      steps: [{ type: 'filter', mission: 'mulSign', n: 6 }, { type: 'filter', mission: 'mulEq', n: 4 }, { type: 'exact', n: 3 }, { type: 'filter', mission: 'divSign', n: 5 }, { type: 'filter', mission: 'divEq', n: 4 }, { type: 'exact', n: 3 }], bombs: 1, motor: 0,
      say: 'El Mago de los Signos hace trucos con el más y el menos. ¡Descubre su regla!',
      body: '<div class="rule"><span>(+)·(+) = +</span><span>(−)·(−) = +</span><span>(+)·(−) = −</span><span>(−)·(+) = −</span></div><p><b>Signos iguales → positivo. Signos distintos → negativo.</b> Para dividir es la misma regla: <b>(+12):(−3) = −4</b>.</p><p>Truco: <b>primero decide el signo</b> mirando solo los signos y <b>después</b> multiplica o divide los números.</p><p>Trampas del Mago: frutas que valen lo mismo pero con el signo contrario, como (−3)·(+4) = −12 y (−3)·(−4) = +12. Con la piña y el coco elegirás el resultado con las 🌱 semillas.</p>',
    },
    {
      id: 5, name: 'La tormenta matemática', icon: '🍇', guardian: 'arlequina', blurb: 'Operaciones combinadas, signos y valor absoluto',
      cfg: { min: -9, max: 9, ops: { add: true, sub: true, mul: true }, targetMin: -18, targetMax: 18, solutionMin: 2, solutionMax: 3, distractors: 2, specials: true, mulChance: 0.4, subChance: 0.4 },
      special: 0.45, specialPool: ['neg', 'abs', 'dbl', 'blast', 'gold'], decide: true, twins: true,
      steps: [{ type: 'exact', n: 3 }, { type: 'filter', mission: 'mixSign', n: 6 }, { type: 'filter', mission: 'abs', n: 5 }, { type: 'exact', n: 4 }], bombs: 2, motor: 1,
      say: '¡Arlequina del Caos lo mezcla todo! Piensa antes de cortar.',
      body: '<p>El <b>valor absoluto</b> es la distancia al 0: <b>|−9| = 9</b> y <b>|+9| = 9</b>.</p><p>🍋 El limón cambia el signo del acumulador. 🍇 La uva lo convierte en su valor absoluto. 🍒 La cereza suma dos veces su número.</p><p>Habrá misiones mezcladas: −(−3), (−2)·(+5), (+18):(−6)… ¡Decide el signo de cada una!</p>',
    },
    {
      id: 6, name: 'El maestro de las bombas', icon: '👑', boss: true, guardian: 'rey', blurb: 'Jefe final: el Rey de los Signos',
      cfg: { min: -10, max: 10, ops: { add: true }, targetMin: -12, targetMax: 12, solutionMin: 2, solutionMax: 2, distractors: 2, specials: false, mulChance: 0.4, subChance: 0.4 },
      decide: true, twins: true,
      steps: [{ type: 'exact', n: 10 }], bombs: 0, motor: 1,
      say: '¡Es el Rey de los Signos! Cada objetivo exacto que consigas le quita vida.',
      body: '<p>El Rey tiene <b>tres fases</b>: primero lanza sumas; después añade bombas, frutas especiales y restas con −( ); y al final acelera y usa la piña multiplicadora.</p><p>Cuidado con sus ataques: puede lanzarte bombas o <b>cambiar el signo del objetivo</b>.</p><p>Si se acaba el tiempo de un objetivo, el Rey recupera vida.</p>',
    },
  ];

  /* =================================================================
     2. GUARDADO
     ================================================================= */
  const SAVE_KEY = 'pichu.integerNinja.v1';
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function defaultSave() {
    return {
      alias: '', aliases: [], profiles: {}, seenHowto: false,
      settings: { sound: true, music: true, reduce: prefersReduced, tap: false, relax: false, math: 0, motor: 1, decide: true },
      teacher: { group: '', on: false, add: true, sub: true, mul: false, div: false, exact: true, filter: true, specials: true, bombs: true, hints: true, decide: true, min: -20, max: 20, speed: 1, dur: 90, diff: 1 },
      stats: [],
    };
  }
  function deepMerge(base, extra) {
    if (!extra || typeof extra !== 'object') return base;
    for (const k of Object.keys(extra)) {
      if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) deepMerge(base[k], extra[k]);
      else base[k] = extra[k];
    }
    return base;
  }
  let save = defaultSave();
  try { save = deepMerge(defaultSave(), JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); } catch (e) { /* sin guardado */ }
  /* ---------- Perfiles por alias (varios alumnos pueden compartir dispositivo) ---------- */
  function defaultProfile() {
    return { coins: 0, xp: 0, sword: 'classic', swords: ['classic'], bg: 'dojo', bgs: ['dojo'], ach: {}, records: { classic: 0, arcade: 0, arcadeTime: 0, adventure: 0, duel: 0 }, levels: {}, duels: [] };
  }
  const aliasKey = (a) => String(a || 'invitado').trim().toLowerCase();
  function P() {
    const k = aliasKey(save.alias);
    if (!save.profiles[k]) save.profiles[k] = Object.assign(defaultProfile(), { name: save.alias || 'Invitado' });
    return save.profiles[k];
  }
  // Migración desde la v0.1/v0.2 (un único progreso por dispositivo)
  (function migrate() {
    const keys = ['coins', 'xp', 'sword', 'swords', 'bg', 'bgs', 'ach', 'records', 'levels'];
    if (keys.some((k) => k in save)) {
      const legacy = defaultProfile();
      keys.forEach((k) => { if (k in save) { legacy[k] = save[k]; delete save[k]; } });
      if (legacy.coins || legacy.xp || Object.keys(legacy.levels).length) save.legacy = legacy;
    }
  })();
  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* modo privado */ } }
  const playerLevel = () => Math.floor(Math.sqrt(P().xp / 60)) + 1;

  /* =================================================================
     3. SONIDO (sintetizado con Web Audio; arranca tras el primer toque)
     ================================================================= */
  const Sound = (function () {
    let ctx = null, master = null, sfxGain = null, musicGain = null, noiseBuf = null;
    let musicTimer = null, track = null, step = 0, nextT = 0;
    function init() {
      if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      sfxGain = ctx.createGain(); sfxGain.gain.value = 0.7; sfxGain.connect(master);
      musicGain = ctx.createGain(); musicGain.gain.value = 0.32; musicGain.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const on = () => ctx && save.settings.sound;
    function tone(f, dur, type, vol, f2, delay) {
      if (!on()) return;
      const t = ctx.currentTime + (delay || 0);
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.15, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + dur + 0.02);
    }
    function noise(dur, vol, type, f1, f2, delay) {
      if (!on()) return;
      const t = ctx.currentTime + (delay || 0);
      const s = ctx.createBufferSource(); s.buffer = noiseBuf;
      const fl = ctx.createBiquadFilter(); fl.type = type || 'bandpass';
      fl.frequency.setValueAtTime(f1 || 2000, t);
      if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
      const g = ctx.createGain(); g.gain.setValueAtTime(vol || 0.3, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(fl); fl.connect(g); g.connect(sfxGain); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
    }
    const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const fx = {
      swish: () => noise(0.12, 0.12, 'bandpass', 1500, 5000),
      slice: () => { noise(0.1, 0.25, 'highpass', 3000, 8000); tone(900 + Math.random() * 300, 0.06, 'triangle', 0.06); },
      splat: () => noise(0.18, 0.35, 'lowpass', 1200, 300, 0.02),
      good: (n) => { const b = 72 + (n || 0) % 8; tone(midi(b), 0.09, 'square', 0.07); tone(midi(b + 7), 0.12, 'square', 0.06, null, 0.06); },
      target: () => [72, 76, 79, 84].forEach((m, i) => tone(midi(m), 0.16, 'square', 0.09, null, i * 0.07)),
      combo: (n) => { for (let i = 0; i < Math.min(6, (n || 2) + 2); i++) tone(midi(76 + i * 3), 0.12, 'triangle', 0.1, null, i * 0.05); },
      mult: () => tone(300, 0.35, 'sawtooth', 0.08, 1400),
      error: () => { tone(220, 0.18, 'square', 0.1, 140); tone(160, 0.22, 'square', 0.08, 110, 0.12); },
      bomb: () => { noise(0.8, 0.7, 'lowpass', 900, 60); tone(120, 0.6, 'sawtooth', 0.2, 30); },
      coin: () => { tone(1320, 0.07, 'square', 0.06); tone(1760, 0.12, 'square', 0.06, null, 0.06); },
      tick: () => tone(1000, 0.04, 'square', 0.04),
      boom: () => { noise(0.5, 0.5, 'lowpass', 1500, 100); tone(200, 0.3, 'triangle', 0.12, 60); },
      bossHit: () => { noise(0.3, 0.4, 'bandpass', 600, 200); tone(180, 0.25, 'square', 0.12, 90); },
      bossLaugh: () => [0, 1, 2].forEach((i) => tone(midi(55 - i * 2), 0.14, 'sawtooth', 0.08, null, i * 0.15)),
      win: () => [60, 64, 67, 72, 67, 72, 76, 79, 84].forEach((m, i) => tone(midi(m), 0.2, 'square', 0.08, null, i * 0.1)),
      lose: () => [67, 63, 60, 55].forEach((m, i) => tone(midi(m), 0.3, 'triangle', 0.1, null, i * 0.2)),
      click: () => tone(660, 0.05, 'triangle', 0.06),
    };
    /* ---- Música: secuenciador muy sencillo (bajo + melodía) ---- */
    const TRACKS = {
      menu: { bpm: 100, chords: [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]], lead: [0, 2, 1, 2, 0, 2, 1, 3], vol: 0.6 },
      game: { bpm: 128, chords: [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]], lead: [0, 1, 2, 3, 2, 1, 2, 0], vol: 0.8 },
      boss: { bpm: 150, chords: [[45, 48, 52], [41, 45, 48], [43, 47, 50], [40, 44, 47]], lead: [0, 2, 0, 3, 1, 2, 3, 1], vol: 0.9 },
    };
    function playStep(tr, s, t) {
      const bar = Math.floor(s / 16) % tr.chords.length, ch = tr.chords[bar], st = s % 16;
      const note = (m, dur, type, vol) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type; o.frequency.value = midi(m);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * tr.vol, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(musicGain); o.start(t); o.stop(t + dur + 0.02);
      };
      if (st % 4 === 0) note(ch[0] - 12, 0.22, 'triangle', 0.22);
      if (st % 4 === 2) note(ch[0], 0.1, 'triangle', 0.1);
      if (st % 2 === 0) {
        const idx = tr.lead[(st / 2) % 8];
        const m = idx === 3 ? ch[0] + 24 : ch[idx] + 12 + (bar % 2 ? 0 : 12);
        if (!(st === 14 && bar % 2)) note(m, 0.12, 'square', 0.05);
      }
      if (st % 8 === 4) { // caja
        const s2 = ctx.createBufferSource(); s2.buffer = noiseBuf;
        const g = ctx.createGain(); g.gain.setValueAtTime(0.06 * tr.vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
        const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2500;
        s2.connect(f); f.connect(g); g.connect(musicGain); s2.start(t); s2.stop(t + 0.1);
      }
    }
    function music(name) {
      if (!ctx) return;
      if (track && track.name === name && musicTimer) return;
      stopMusic();
      if (!save.settings.music || !name) return;
      track = Object.assign({ name }, TRACKS[name]);
      step = 0; nextT = ctx.currentTime + 0.05;
      musicTimer = setInterval(() => {
        if (!ctx || !track) return;
        while (nextT < ctx.currentTime + 0.15) { playStep(track, step, nextT); nextT += 60 / track.bpm / 4; step++; }
      }, 30);
    }
    function stopMusic() { if (musicTimer) clearInterval(musicTimer); musicTimer = null; track = null; }
    return { init, fx, music, stopMusic, get ready() { return !!ctx; }, get current() { return track && track.name; } };
  })();
  let wantedMusic = 'menu';
  function setMusic(name) { wantedMusic = name; if (Sound.ready) Sound.music(name); }
  // Los navegadores móviles solo permiten sonido tras un gesto del usuario
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => window.addEventListener(ev, () => {
    const first = !Sound.ready; Sound.init();
    if (first || !Sound.current) Sound.music(wantedMusic);
  }, { passive: true }));
  const sfx = Sound.fx;

  /* =================================================================
     4. LIENZO Y DIBUJO
     ================================================================= */
  const canvas = $('#game');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1, R = 44; // R = radio base de las frutas
  let bgCanvas = null;
  const layout = { lineY: 160, playTop: 190 };

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    R = clamp(Math.min(W * 0.105, H * 0.068), 34, 60);
    buildBackground();
    measureLayout();
  }
  function measureLayout() {
    const acc = $('#hAccBox');
    let top = 140;
    if (acc && !$('#hud').classList.contains('hidden')) {
      const rc = acc.getBoundingClientRect();
      if (rc.bottom > 0) top = rc.bottom;
    }
    layout.lineY = top + 26;
    layout.playTop = top + 50;
    if (game && game.boss) {
      game.boss.r = clamp(Math.min(W, H) * 0.11, 46, 84);
      game.boss.baseY = layout.playTop + game.boss.r + 40;
      layout.playTop = game.boss.baseY + game.boss.r + 8;
    }
  }

  /* ---------- Fondo ---------- */
  function buildBackground() {
    bgCanvas = document.createElement('canvas');
    bgCanvas.width = Math.round(W * DPR); bgCanvas.height = Math.round(H * DPR);
    const b = bgCanvas.getContext('2d');
    b.setTransform(DPR, 0, 0, DPR, 0, 0);
    const id = P().bg;
    let g;
    if (id === 'night') {
      g = b.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1b1f3a'); g.addColorStop(1, '#2d1f2f');
      b.fillStyle = g; b.fillRect(0, 0, W, H);
      const r2 = E.rng(7);
      for (let i = 0; i < 120; i++) { b.fillStyle = `rgba(244,237,215,${0.2 + r2() * 0.6})`; b.beginPath(); b.arc(r2() * W, r2() * H * 0.8, r2() * 1.6 + 0.3, 0, TAU); b.fill(); }
      b.fillStyle = '#F4EDD7'; b.beginPath(); b.arc(W * 0.82, H * 0.2, Math.min(W, H) * 0.07, 0, TAU); b.fill();
      b.fillStyle = '#1b1f3a'; b.beginPath(); b.arc(W * 0.82 + Math.min(W, H) * 0.03, H * 0.2 - 8, Math.min(W, H) * 0.065, 0, TAU); b.fill();
      // colinas retro
      b.fillStyle = '#241a2a'; b.beginPath(); b.moveTo(0, H);
      for (let x = 0; x <= W; x += 20) b.lineTo(x, H * 0.86 + Math.sin(x / 70) * 14);
      b.lineTo(W, H); b.fill();
    } else if (id === 'lab') {
      g = b.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2c4d42'); g.addColorStop(1, '#1b2f28');
      b.fillStyle = g; b.fillRect(0, 0, W, H);
      b.strokeStyle = 'rgba(244,237,215,0.06)'; b.lineWidth = 1;
      for (let x = 0; x < W; x += 24) { b.beginPath(); b.moveTo(x + 0.5, 0); b.lineTo(x + 0.5, H); b.stroke(); }
      for (let y = 0; y < H; y += 24) { b.beginPath(); b.moveTo(0, y + 0.5); b.lineTo(W, y + 0.5); b.stroke(); }
      b.fillStyle = 'rgba(244,237,215,0.07)'; b.font = `900 ${Math.round(R * 0.9)}px ${MARCA.fuente}`;
      const syms = ['+', '−', '×', '÷', '|x|', 'π', '0', '±'], r2 = E.rng(3);
      for (let i = 0; i < 22; i++) b.fillText(syms[i % syms.length], r2() * W, r2() * H);
    } else {
      g = b.createRadialGradient(W / 2, H * 0.42, 10, W / 2, H * 0.42, Math.max(W, H) * 0.8);
      g.addColorStop(0, '#4a3c39'); g.addColorStop(1, '#221c1b');
      b.fillStyle = g; b.fillRect(0, 0, W, H);
      // trama de puntos retro
      b.fillStyle = 'rgba(244,237,215,0.045)';
      for (let y = 0; y < H; y += 14) for (let x = (y / 14) % 2 ? 7 : 0; x < W; x += 14) { b.beginPath(); b.arc(x, y, 1.6, 0, TAU); b.fill(); }
      // tablas del dojo
      b.fillStyle = 'rgba(0,0,0,0.25)'; b.fillRect(0, H * 0.9, W, H * 0.1);
      b.strokeStyle = 'rgba(244,237,215,0.06)';
      for (let x = 0; x < W; x += 90) { b.beginPath(); b.moveTo(x, H * 0.9); b.lineTo(x - 30, H); b.stroke(); }
    }
  }
  function drawBackground(t) {
    ctx.drawImage(bgCanvas, 0, 0, W, H);
    if (P().bg === 'dojo') { // rayos retro que giran despacio
      ctx.save(); ctx.translate(W / 2, H * 0.42);
      if (!save.settings.reduce) ctx.rotate(t * 0.03);
      ctx.fillStyle = 'rgba(232,181,58,0.035)';
      const L = Math.max(W, H);
      for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, L, (i / 16) * TAU, ((i + 0.5) / 16) * TAU); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    }
  }

  /* ---------- Frutas (formas originales, estilo cartoon retro con contorno grueso) ---------- */
  function outline(c, r) { c.lineWidth = Math.max(2.5, r * 0.085); c.strokeStyle = C.espresso; c.lineJoin = 'round'; c.lineCap = 'round'; }
  function shine(c, r) {
    c.fillStyle = 'rgba(255,255,255,0.45)';
    c.beginPath(); c.ellipse(-r * 0.38, -r * 0.42, r * 0.2, r * 0.11, -0.7, 0, TAU); c.fill();
  }
  function leaf(c, r, x, y, ang, col) {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.fillStyle = col || '#5A8A78'; c.beginPath();
    c.moveTo(0, 0); c.quadraticCurveTo(r * 0.3, -r * 0.25, r * 0.55, 0); c.quadraticCurveTo(r * 0.3, r * 0.2, 0, 0);
    c.fill(); outline(c, r * 0.7); c.stroke(); c.restore();
  }
  /** Silueta de cada fruta (sirve para rellenar y para recortar mitades) */
  function shapePath(c, kind, r) {
    c.beginPath();
    switch (kind) {
      case 'apple':
        c.moveTo(0, -r * 0.7);
        c.bezierCurveTo(r * 0.6, -r * 1.05, r * 1.12, -r * 0.35, r * 0.92, r * 0.3);
        c.bezierCurveTo(r * 0.78, r * 0.88, r * 0.3, r * 1.02, 0, r * 0.86);
        c.bezierCurveTo(-r * 0.3, r * 1.02, -r * 0.78, r * 0.88, -r * 0.92, r * 0.3);
        c.bezierCurveTo(-r * 1.12, -r * 0.35, -r * 0.6, -r * 1.05, 0, -r * 0.7);
        break;
      case 'strawberry':
        c.moveTo(0, r * 1.0);
        c.bezierCurveTo(-r * 0.5, r * 0.75, -r * 1.05, r * 0.05, -r * 0.9, -r * 0.45);
        c.bezierCurveTo(-r * 0.75, -r * 0.9, r * 0.75, -r * 0.9, r * 0.9, -r * 0.45);
        c.bezierCurveTo(r * 1.05, r * 0.05, r * 0.5, r * 0.75, 0, r * 1.0);
        break;
      case 'lemon':
        c.ellipse(0, 0, r * 1.02, r * 0.78, 0, 0, TAU);
        break;
      case 'kiwi':
        c.ellipse(0, 0, r * 0.98, r * 0.82, 0, 0, TAU);
        break;
      case 'pineapple':
        c.ellipse(0, r * 0.1, r * 0.78, r * 0.95, 0, 0, TAU);
        break;
      case 'grape': {
        const pts = [[0, -0.55], [-0.45, -0.3], [0.45, -0.3], [-0.25, 0.1], [0.25, 0.1], [0, 0.5], [-0.62, 0.15], [0.62, 0.15]];
        pts.forEach(([x, y]) => { c.moveTo(x * r + r * 0.36, y * r); c.arc(x * r, y * r, r * 0.36, 0, TAU); });
        break;
      }
      case 'cherry':
        c.moveTo(-r * 0.05 + r * 0.5, r * 0.3); c.arc(-r * 0.4, r * 0.3, r * 0.5, 0, TAU);
        c.moveTo(r * 0.92, r * 0.36); c.arc(r * 0.42, r * 0.36, r * 0.5, 0, TAU);
        break;
      case 'gold': {
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.5 : r * 1.05;
          i ? c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        c.closePath();
        break;
      }
      case 'melon':
        c.ellipse(0, 0, r * 1.1, r * 0.95, 0, 0, TAU);
        break;
      default:
        c.arc(0, 0, r, 0, TAU);
    }
  }
  function drawFruitBody(c, kind, r, t) {
    const F = FRUITS[kind] || FRUITS.apple;
    if (kind === 'bomb') return drawBomb(c, r, t);
    // sombra suave
    c.save(); c.translate(r * 0.08, r * 0.12); shapePath(c, kind, r); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fill(); c.restore();
    shapePath(c, kind, r);
    c.fillStyle = F.skin; c.fill();
    // detalles por fruta
    c.save(); shapePath(c, kind, r); c.clip();
    if (kind === 'orange') { c.fillStyle = 'rgba(166,92,20,0.35)'; for (let i = 0; i < 14; i++) { const a = i * 2.4, d = r * (0.25 + (i % 4) * 0.17); c.beginPath(); c.arc(Math.cos(a) * d, Math.sin(a) * d, r * 0.035, 0, TAU); c.fill(); } }
    if (kind === 'strawberry') { c.fillStyle = '#FFE27A'; for (let i = 0; i < 12; i++) { const x = ((i % 4) - 1.5) * r * 0.42 + (Math.floor(i / 4) % 2) * r * 0.2, y = (Math.floor(i / 4) - 0.6) * r * 0.42; c.beginPath(); c.ellipse(x, y, r * 0.04, r * 0.07, 0, 0, TAU); c.fill(); } }
    if (kind === 'peach') { c.strokeStyle = 'rgba(200,90,60,0.5)'; c.lineWidth = r * 0.06; c.beginPath(); c.moveTo(0, -r); c.quadraticCurveTo(-r * 0.35, 0, 0, r); c.stroke(); c.fillStyle = 'rgba(228,109,77,0.35)'; c.beginPath(); c.arc(r * 0.35, r * 0.1, r * 0.6, 0, TAU); c.fill(); }
    if (kind === 'kiwi') { c.fillStyle = 'rgba(60,40,20,0.35)'; for (let i = 0; i < 30; i++) { const a = i * 1.7, d = r * (0.2 + (i % 5) * 0.16); c.fillRect(Math.cos(a) * d, Math.sin(a) * d, r * 0.03, r * 0.08); } }
    if (kind === 'plum') { c.fillStyle = 'rgba(255,255,255,0.12)'; c.beginPath(); c.arc(-r * 0.2, -r * 0.2, r * 0.7, 0, TAU); c.fill(); }
    if (kind === 'pineapple') { c.strokeStyle = 'rgba(140,90,20,0.6)'; c.lineWidth = r * 0.06; for (let i = -4; i <= 4; i++) { c.beginPath(); c.moveTo(i * r * 0.3 - r, -r); c.lineTo(i * r * 0.3 + r, r * 1.2); c.stroke(); c.beginPath(); c.moveTo(i * r * 0.3 + r, -r); c.lineTo(i * r * 0.3 - r, r * 1.2); c.stroke(); } }
    if (kind === 'melon') { c.strokeStyle = '#1F5E30'; c.lineWidth = r * 0.14; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * r * 0.38, -r); c.quadraticCurveTo(i * r * 0.5, 0, i * r * 0.38, r); c.stroke(); } }
    if (kind === 'coconut') { c.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < 18; i++) { const a = i * 2.1, d = r * (0.3 + (i % 3) * 0.2); c.fillRect(Math.cos(a) * d, Math.sin(a) * d, r * 0.1, r * 0.025); } c.fillStyle = '#3d2716'; [[-0.2, -0.45], [0.2, -0.45], [0, -0.2]].forEach(([x, y]) => { c.beginPath(); c.arc(x * r, y * r, r * 0.09, 0, TAU); c.fill(); }); }
    if (kind === 'gold') { c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.arc(-r * 0.2, -r * 0.3, r * 0.4, 0, TAU); c.fill(); }
    c.restore();
    if (kind === 'seed') { c.strokeStyle = C.salvia; c.lineWidth = r * 0.08; c.setLineDash([r * 0.2, r * 0.14]); c.beginPath(); c.arc(0, 0, r * 1.12, 0, TAU); c.stroke(); c.setLineDash([]); leaf(c, r, 0, -r * 0.95, -0.9); leaf(c, r, 0, -r * 0.95, -2.2); }
    shapePath(c, kind, r); outline(c, r); c.stroke();
    if (kind !== 'grape' && kind !== 'cherry') shine(c, r * (kind === 'gold' ? 0.7 : 1));
    // tallos, hojas, coronas
    if (kind === 'apple') { c.strokeStyle = C.espresso; c.lineWidth = r * 0.1; c.beginPath(); c.moveTo(0, -r * 0.65); c.lineTo(r * 0.06, -r * 0.98); c.stroke(); leaf(c, r, r * 0.06, -r * 0.88, -0.4); }
    if (kind === 'orange' || kind === 'peach' || kind === 'plum') leaf(c, r, 0, -r * 0.95, -0.6);
    if (kind === 'strawberry') { c.fillStyle = '#5A8A78'; c.beginPath(); for (let i = 0; i < 5; i++) { const a = Math.PI + (i * Math.PI) / 4; c.moveTo(0, -r * 0.62); c.lineTo(Math.cos(a) * r * 0.62, -r * 0.62 + Math.sin(a) * -r * 0.3 - r * 0.05); c.lineTo(Math.cos(a + 0.35) * r * 0.25, -r * 0.62); } c.fill(); outline(c, r * 0.6); c.stroke(); }
    if (kind === 'pineapple') { c.fillStyle = '#3F6E5C'; c.beginPath(); c.moveTo(-r * 0.4, -r * 0.75); c.lineTo(-r * 0.5, -r * 1.35); c.lineTo(-r * 0.15, -r * 0.95); c.lineTo(0, -r * 1.5); c.lineTo(r * 0.15, -r * 0.95); c.lineTo(r * 0.5, -r * 1.35); c.lineTo(r * 0.4, -r * 0.75); c.closePath(); c.fill(); outline(c, r * 0.7); c.stroke(); }
    if (kind === 'lemon') { c.fillStyle = F.skin; c.beginPath(); c.ellipse(r * 1.0, 0, r * 0.14, r * 0.1, 0, 0, TAU); c.fill(); outline(c, r * 0.5); c.stroke(); }
    if (kind === 'grape' || kind === 'cherry') {
      c.strokeStyle = C.espresso; c.lineWidth = r * 0.09; c.beginPath();
      if (kind === 'grape') { c.moveTo(0, -r * 0.85); c.lineTo(0, -r * 1.15); } else { c.moveTo(-r * 0.4, -r * 0.15); c.quadraticCurveTo(-r * 0.1, -r * 0.9, r * 0.15, -r * 1.05); c.moveTo(r * 0.42, -r * 0.1); c.quadraticCurveTo(r * 0.3, -r * 0.8, r * 0.15, -r * 1.05); }
      c.stroke(); leaf(c, r, r * 0.05, -r * 1.05, -0.3);
      c.fillStyle = 'rgba(255,255,255,0.4)';
      if (kind === 'cherry') { c.beginPath(); c.arc(-r * 0.58, r * 0.12, r * 0.1, 0, TAU); c.arc(r * 0.24, r * 0.18, r * 0.1, 0, TAU); c.fill(); }
    }
  }
  function drawBomb(c, r, t) {
    // anillo de aviso discontinuo (forma, no solo color)
    c.save(); c.rotate((t || 0) * 2);
    c.setLineDash([r * 0.25, r * 0.18]); c.lineWidth = r * 0.09; c.strokeStyle = 'rgba(228,109,77,0.9)';
    c.beginPath(); c.arc(0, 0, r * 1.18, 0, TAU); c.stroke(); c.restore(); c.setLineDash([]);
    c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.arc(r * 0.08, r * 0.12, r * 0.92, 0, TAU); c.fill();
    const g = c.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    g.addColorStop(0, '#5a4e4c'); g.addColorStop(1, '#151110');
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, r * 0.92, 0, TAU); c.fill();
    outline(c, r); c.strokeStyle = '#000'; c.stroke();
    // boquilla y mecha
    c.fillStyle = '#4a403e'; c.fillRect(-r * 0.22, -r * 1.08, r * 0.44, r * 0.26); c.strokeRect(-r * 0.22, -r * 1.08, r * 0.44, r * 0.26);
    c.strokeStyle = '#C8A06A'; c.lineWidth = r * 0.08; c.beginPath(); c.moveTo(0, -r * 1.08); c.quadraticCurveTo(r * 0.3, -r * 1.4, r * 0.5, -r * 1.3); c.stroke();
    const fl = 0.7 + Math.sin((t || 0) * 30) * 0.3;
    c.fillStyle = '#FFE066'; c.beginPath(); c.arc(r * 0.52, -r * 1.32, r * 0.16 * fl, 0, TAU); c.fill();
    c.fillStyle = '#FF6A2B'; c.beginPath(); c.arc(r * 0.52, -r * 1.32, r * 0.08 * fl, 0, TAU); c.fill();
    // calavera retro sencilla en blanco (icono universal de peligro)
    c.fillStyle = '#F4EDD7';
    c.beginPath(); c.arc(0, -r * 0.05, r * 0.36, 0, TAU); c.fill();
    c.fillRect(-r * 0.2, r * 0.18, r * 0.4, r * 0.2);
    c.fillStyle = '#151110';
    c.beginPath(); c.arc(-r * 0.14, -r * 0.08, r * 0.1, 0, TAU); c.arc(r * 0.14, -r * 0.08, r * 0.1, 0, TAU); c.fill();
    c.fillRect(-r * 0.03, r * 0.22, r * 0.06, r * 0.14); c.fillRect(-r * 0.13, r * 0.22, r * 0.04, r * 0.14); c.fillRect(r * 0.09, r * 0.22, r * 0.04, r * 0.14);
  }

  /** Etiqueta con el número (insignia crema centrada) */
  function drawBadge(c, op, r) {
    if (!op || op.type === 'bomb') return;
    let text, sub = null;
    if (op.type === 'num') text = E.fmt(op.v);
    else if (op.type === 'sub') text = E.MINUS + ' ' + E.par(op.v);
    else if (op.type === 'mul') { text = '×' + E.par(op.v); }
    else if (op.type === 'div') { text = '÷' + E.par(op.v); }
    else if (op.type === 'dbl') { text = '2·' + E.par(op.v); }
    else if (op.type === 'neg') text = '±';
    else if (op.type === 'abs') text = '| |';
    else if (op.type === 'gold') text = '★';
    else if (op.type === 'blast') text = '✸';
    else if (op.type === 'expr') text = E.exprLabel(op);
    else if (op.type === 'seed') text = E.fmt(op.v);
    const special = SPECIAL_INFO[op.type];
    if (special && op.type !== 'bomb') sub = special.cap;
    // el color solo ayuda en los números sueltos; en −( ), expresiones y semillas sería "chivarse"
    const val = op.type === 'num' ? op.v : null;
    let fs = r * (text.length <= 2 ? 0.72 : text.length <= 3 ? 0.6 : text.length <= 6 ? 0.46 : 0.36);
    c.font = `900 ${fs}px ${MARCA.fuente}`;
    let tw = c.measureText(text).width;
    const bh = fs * 1.25, bw = Math.max(bh, tw + fs * 0.55);
    // insignia
    c.fillStyle = '#FFF8E8'; c.strokeStyle = C.espresso; c.lineWidth = Math.max(2, r * 0.06);
    roundRect(c, -bw / 2, -bh / 2, bw, bh, bh / 2); c.fill(); c.stroke();
    c.fillStyle = val == null ? C.espresso : val > 0 ? C.salviaOsc : val < 0 ? C.coralOsc : C.espresso;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(text, 0, fs * 0.04);
    if (sub) {
      const fs2 = Math.max(10, r * 0.26);
      c.font = `900 ${fs2}px ${MARCA.fuente}`;
      const w2 = c.measureText(sub).width + 10;
      c.fillStyle = C.espresso; roundRect(c, -w2 / 2, r * 0.62, w2, fs2 * 1.35, 6); c.fill();
      c.fillStyle = C.crema; c.fillText(sub, 0, r * 0.62 + fs2 * 0.7);
    }
  }
  function roundRect(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }

  /* ---------- Jefe: el Rey de los Signos (personaje original) ---------- */
  function drawBoss(c, b, t) {
    const r = b.r, img = b.img;
    c.save(); c.translate(b.x, b.y);
    if (b.defeated) { c.rotate(b.deadT * 2.5); c.globalAlpha = Math.max(0, 1 - b.deadT / 1.4); c.scale(1 - b.deadT * 0.3, 1 - b.deadT * 0.3); }
    let sx = 1, sy = 1, ox = 0;
    if (b.expr === 'hurt') ox = Math.sin(t * 60) * r * 0.08;
    else if (b.expr === 'laugh') { sy = 1 + Math.abs(Math.sin(t * 14)) * 0.08; sx = 2 - sy; }
    else { sy = 1 + Math.sin(t * 3) * 0.025; sx = 2 - sy; }
    // halo crema para que el contorno oscuro se lea sobre el fondo
    const halo = c.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.35);
    halo.addColorStop(0, b.phases && b.phase === 3 ? 'rgba(228,109,77,0.55)' : 'rgba(244,237,215,0.4)'); halo.addColorStop(1, 'rgba(244,237,215,0)');
    c.fillStyle = halo; c.beginPath(); c.arc(0, 0, r * 1.35, 0, TAU); c.fill();
    c.translate(ox, 0); c.scale(sx, sy);
    if (b.flash > 0 && Math.floor(t * 20) % 2 === 0) c.globalAlpha *= 0.55;
    const S = r * 2.3;
    if (img && img.complete && img.naturalWidth) {
      const k = S / Math.max(img.naturalWidth, img.naturalHeight);
      c.drawImage(img, -img.naturalWidth * k / 2, -img.naturalHeight * k / 2, img.naturalWidth * k, img.naturalHeight * k);
    } else { c.fillStyle = C.espresso; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); }
    c.restore();
    if (b.defeated) return;
    // barra de vida con el nombre
    const bw = Math.min(W * 0.6, 300), bx = W / 2 - bw / 2, by = b.baseY - b.r - 26;
    c.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(c, bx - 3, by - 3, bw + 6, 16, 8); c.fill();
    c.fillStyle = C.coral; roundRect(c, bx, by, Math.max(0, bw * b.hpShow / b.max), 10, 5); c.fill();
    c.fillStyle = C.crema; c.font = `900 11px ${MARCA.fuente}`; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillText(b.en.name.toUpperCase() + (b.phases ? ' · FASE ' + b.phase : ''), W / 2, by - 6);
  }

  /* =================================================================
     5. EFECTOS
     ================================================================= */
  const fx = { particles: [], halves: [], splats: [], texts: [], rings: [], banner: null, shake: 0, flash: 0 };
  const sword = () => SWORDS.find((s) => s.id === P().sword) || SWORDS[0];
  const reduce = () => save.settings.reduce;
  function addParticles(x, y, color, n, speed, opts) {
    opts = opts || {};
    if (reduce()) n = Math.ceil(n * 0.3);
    for (let i = 0; i < n && fx.particles.length < 450; i++) {
      const a = opts.dir != null ? opts.dir + (rng() - 0.5) * (opts.spread || 1.2) : rng() * TAU;
      const s = (speed || 300) * (0.3 + rng() * 0.9);
      fx.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (opts.up || 0), r: (opts.size || 4) * (0.5 + rng()), color: Array.isArray(color) ? rng.pick(color) : color, life: opts.life || 0.7, max: opts.life || 0.7, g: opts.g != null ? opts.g : 900, shape: opts.shape });
    }
  }
  function floatText(x, y, text, color, size, life) {
    fx.texts.push({ x, y, text, color: color || C.crema, size: size || 22, life: life || 1, max: life || 1 });
  }
  function banner(text, sub, color, life) {
    fx.banner = { text, sub, color: color || C.mostaza, life: life || 1.4, max: life || 1.4 };
  }
  function shake(m) { if (!reduce()) fx.shake = Math.max(fx.shake, m); }

  /* =================================================================
     6. ESTADO DE LA PARTIDA
     ================================================================= */
  let game = null;       // partida actual (null en menús)
  let attract = [];      // frutas decorativas del menú
  const blade = { active: false, pts: [], id: null, swipe: null, lastSound: 0 };
  let lastTime = performance.now(), clock = 0;

  /** Construye la configuración matemática según modo, nivel y ajustes */
  function buildConfig(mode, level, opts) {
    const tch = save.teacher;
    if (mode === 'duel') {
      const P0 = MATH_PRESETS[(opts && opts.math) || 0] || MATH_PRESETS[0];
      const cfg = E.sanitize({ min: P0.min, max: P0.max, ops: P0.ops, targetMin: P0.targetMin, targetMax: P0.targetMax, solutionMin: P0.solutionMin, solutionMax: P0.solutionMax, distractors: P0.distractors, specials: true, bombs: true });
      const dec = !!(opts && opts.decide);
      return { cfg, motor: 1, special: P0.special, bombs: P0.bombs, hints: true, decide: dec, twins: dec, exact: true, filter: false, filterTypes: [], duration: 90 };
    }
    if (mode === 'adventure') {
      const L = level;
      return { cfg: E.sanitize(Object.assign({ bombs: true }, L.cfg)), motor: save.settings.motor === 0 ? 0 : L.motor, special: L.special || 0, specialPool: L.specialPool, bombs: [L.bombs, L.bombs], hints: true, decide: !!L.decide, twins: !!L.twins, filterTypes: ['neg', 'pos', 'lt', 'gt', 'abs', 'opp'] };
    }
    if (tch.on) {
      const maxAbs = Math.max(Math.abs(tch.min), Math.abs(tch.max));
      const span = clamp(Math.round(maxAbs * 1.2), 5, 40);
      const d = tch.diff;
      const cfg = E.sanitize({
        min: tch.min, max: tch.max, ops: { add: tch.add, sub: tch.sub, mul: tch.mul, div: tch.div },
        specials: tch.specials, bombs: tch.bombs, targetMin: -span, targetMax: span,
        solutionMin: d === 0 ? 1 : 2, solutionMax: d === 0 ? 2 : 3, distractors: 2 + d,
      });
      return { cfg, motor: tch.speed, special: tch.specials ? 0.25 + d * 0.1 : 0, bombs: tch.bombs ? [d === 2 ? 1 : 0, 1 + (d === 2 ? 1 : 0)] : [0, 0], hints: tch.hints, decide: tch.decide !== false, twins: tch.decide !== false, exact: tch.exact || !tch.filter, filter: tch.filter, filterTypes: filterTypesFor(cfg), duration: tch.dur };
    }
    const P = MATH_PRESETS[save.settings.math] || MATH_PRESETS[0];
    const cfg = E.sanitize({ min: P.min, max: P.max, ops: P.ops, targetMin: P.targetMin, targetMax: P.targetMax, solutionMin: P.solutionMin, solutionMax: P.solutionMax, distractors: P.distractors, specials: true, bombs: true });
    return { cfg, motor: save.settings.motor, special: P.special, bombs: P.bombs, hints: true, decide: save.settings.decide !== false, twins: save.settings.decide !== false, exact: true, filter: true, filterTypes: save.settings.math === 0 ? ['neg', 'pos', 'lt', 'gt'] : filterTypesFor(cfg), duration: 90 };
  }
  /** Misiones posibles según las operaciones activadas (las de expresiones practican la regla de los signos) */
  function filterTypesFor(cfg) {
    const t = ['neg', 'pos', 'lt', 'gt', 'abs', 'opp'];
    if (cfg.ops.sub) t.push('negparSign', 'negparEq');
    if (cfg.ops.mul) t.push('mulSign', 'mulEq');
    if (cfg.ops.div) t.push('divSign', 'divEq');
    return t;
  }
  /** Generador de lanzamientos (posiciones): el de la partida, o el general en el menú */
  const RL = () => (game ? game.rL : rng);
  function makeAnyMission(types) {
    const t = game.rT.pick(types);
    return E.EXPR_MISSIONS[t] ? E.EXPR_MISSIONS[t](game.rT) : E.makeMission([t], game.cfg, game.rT);
  }
  function makeBoss(id, hp, phases) {
    return { id, en: ENEMIES[id], img: IMG[id], hp, max: hp, hpShow: hp, phase: 1, phases: !!phases, x: W / 2, y: -220, baseY: 0, r: 60, expr: 'normal', exprT: 0, attackT: phases ? 11 : 16, flash: 0, defeated: false, deadT: 0 };
  }

  function newGame(mode, levelId, opts) {
    opts = opts || {};
    const level = mode === 'adventure' ? LEVELS.find((l) => l.id === levelId) : null;
    const setup = buildConfig(mode, level, opts);
    const relaxed = mode === 'duel' ? false : save.settings.relax; // en los retos, todos con las mismas reglas
    const seed = opts.seed != null ? opts.seed & 0xffff : Math.floor(Math.random() * 65536);
    game = {
      mode, level, setup, relaxed, seed, opts,
      // tres generadores con semilla: objetivos/misiones (idénticos en un reto), oleadas y posiciones
      rT: E.rng(seed * 3 + 1), rW: E.rng(seed * 7 + 2), rL: E.rng(seed * 11 + 3),
      cfg: setup.cfg,
      time: 0, timeLeft: (mode === 'classic' || mode === 'duel') && !relaxed ? setup.duration : Infinity,
      levelTime: level && !relaxed ? (level.boss ? 240 : 180) : Infinity,
      lives: 3, maxLives: 3, livesLost: 0, fallos: 0,
      score: 0, streak: 0, cutStreak: 0, mult: 1, bestMult: 1,
      A: 0, T: 0, Ashow: 0, roundCuts: 0, roundStart: 0, roundIndex: 0, roundLimit: Infinity, roundTime: 0,
      fruits: [], queue: [], waveCooldown: 0.6, nextId: 1,
      steps: [], stepIndex: -1, step: null, stepDone: 0, unitsDone: 0, unitsTotal: 0,
      mission: null, missionErrors: 0,
      arrows: [], eqText: '', over: false, paused: false, endT: 0,
      stats: { targets: 0, correct: 0, signErrors: 0, bombs: 0, combos: 0, hints: 0, noExact: 0, cuts: 0, gold: 0, decOk: 0, decErr: 0, decErrKinds: {}, rivals: 0 },
      decision: null, rivalIndex: 0,
      hintIds: [], hintUntil: 0, lastProgress: 0,
      boss: null,
    };
    if (level && level.steps) {
      game.steps = level.steps.map((s) => Object.assign({}, s));
      game.unitsTotal = game.steps.reduce((a, s) => a + s.n, 0);
    }
    if (level && level.boss) game.boss = makeBoss('rey', 10, true);
    else if (level && level.guardian) game.boss = makeBoss(level.guardian, game.unitsTotal, false);
    else if (mode === 'arcade') game.boss = makeBoss(ARCADE_RIVALS[0], 6, false);
    fx.particles = []; fx.halves = []; fx.splats = []; fx.texts = []; fx.rings = []; fx.banner = null;
    $('#explain').classList.add('hidden'); $('#pichuPop').classList.add('hidden');
    showScreen(null);
    $('#hud').classList.remove('hidden');
    $('#bHint').classList.toggle('hidden', !setup.hints);
    measureLayout();
    nextStep();
    updateHUD(true);
    setMusic(game.boss && game.boss.phases ? 'boss' : 'game');
    if (game.boss) say(game.boss.en.intro, 'oops', 2600);
    if (mode === 'duel') {
      const ch = opts.challenge;
      banner('⚔️ RETO', ch ? `Supera los ${ch.score.toLocaleString('es-ES')} puntos de ${ch.from || 'tu rival'}` : '90 segundos · misma partida para tu rival', C.coral, 2.2);
    }
  }

  /* ---------- Secuencia de pasos (misiones) ---------- */
  function generateStep() {
    // modos infinitos: clásico = objetivos exactos; arcade = alterna objetivos y misiones
    const s = game.setup;
    if (game.mode === 'classic' || game.mode === 'duel') {
      if (s.exact === false && s.filter) return { type: 'filter', mission: null, n: 8 };
      return { type: 'exact', n: Infinity };
    }
    const prev = game.step;
    const canExact = s.exact !== false, canFilter = !!s.filter;
    if (canExact && (!canFilter || !prev || prev.type === 'filter')) return { type: 'exact', n: 3 };
    return { type: 'filter', mission: null, n: 8 };
  }
  function nextStep() {
    game.stepIndex++;
    let st;
    if (game.steps.length) {
      if (game.stepIndex >= game.steps.length) return levelComplete();
      st = game.steps[game.stepIndex];
    } else st = generateStep();
    game.step = st; game.stepDone = 0;
    game.fruits.forEach((f) => { if (!f.cut) f.fade = true; }); // las frutas anteriores se van
    game.queue = [];
    game.waveCooldown = 1.3;
    if (st.type === 'exact') {
      game.mission = null;
      newRound(true);
      if (game.stepIndex > 0 || (game.mode !== 'classic' && game.mode !== 'duel')) banner('🎯 OBJETIVO EXACTO', 'Llega exactamente al número', C.mostaza, 1.6);
    } else {
      const types = st.mission ? [st.mission] : game.setup.filterTypes;
      game.mission = makeAnyMission(types);
      game.missionErrors = 0;
      game.A = 0; game.Ashow = 0; game.arrows = [];
      banner('⚡ ' + game.mission.text, 'Si cortas otro, pierdes 50 puntos', C.coral, 2);
      say(missionTip(game.mission), 'happy', 3000);
      sfx.mult();
    }
    updateHUD(true);
  }
  function missionTip(m) {
    switch (m.id) {
      case 'neg': return 'Negativos: llevan el signo −. ¡El 0 no vale!';
      case 'pos': return 'Positivos: mayores que 0. ¡El 0 no vale!';
      case 'lt': return 'Menores que ' + E.fmt(m.k) + ': los que están a su izquierda en la recta.';
      case 'gt': return 'Mayores que ' + E.fmt(m.k) + ': los que están a su derecha en la recta.';
      case 'abs': return 'Valor absoluto ' + m.k + ': hay dos, ' + E.fmt(m.k) + ' y ' + E.fmt(-m.k) + '.';
      case 'opp': return 'El opuesto de un número tiene el signo contrario. ¡No cortes el original!';
      case 'exprSign':
        if (m.kinds.length === 1 && m.kinds[0] === 'negpar') return 'Un − delante del paréntesis cambia el signo de dentro; un + lo deja igual.';
        if (m.kinds.length === 1) return 'Mira solo los signos: iguales → positivo; distintos → negativo.';
        return 'Decide el signo de cada cuenta antes de cortar: − delante cambia el signo; signos iguales → +.';
      case 'exprEq': return 'Cuidado con las gemelas: ' + E.fmt(-m.k) + ' tiene el mismo número pero el signo contrario.';
      default: return '';
    }
  }
  function newRound(first) {
    game.roundIndex++;
    game.T = E.makeTarget(game.cfg, game.rT, first ? null : game.T, game.roundIndex);
    game.A = 0; game.roundCuts = 0; game.roundStart = game.time; game.lastProgress = game.time;
    game.hintIds = []; game.arrows = [];
    game.eqText = 'Empiezas en 0';
    // límite de tiempo por objetivo (arcade y jefe), nunca en modo relajado
    let lim = Infinity;
    if (!game.relaxed) {
      if (game.mode === 'arcade') lim = Math.max(14, 24 - game.time / 20);
      if (game.boss && game.boss.phases) lim = game.boss.phase === 3 ? 22 : 28;
    }
    game.roundLimit = lim; game.roundTime = lim;
    $('#hGoalBox').classList.remove('flash'); void $('#hGoalBox').offsetWidth; $('#hGoalBox').classList.add('flash');
  }

  /* =================================================================
     7. LANZAMIENTO DE FRUTAS
     ================================================================= */
  function difficulty() { // 0 → 1 a lo largo de la partida arcade
    return game.mode === 'arcade' ? clamp(game.time / 160, 0, 1) : 0;
  }
  function airtime() {
    let a = AIRTIME[game ? game.setup.motor : 1] || 2.6;
    if (game) {
      if (game.relaxed) a *= 1.3;
      a *= 1 - difficulty() * 0.18;
      if (game.boss && game.boss.phases && game.boss.phase === 3) a *= 0.9;
    }
    return Math.max(1.8, a); // nunca tan rápido que no se pueda leer
  }
  function liveFruits() { return game.fruits.filter((f) => !f.cut && !f.fade && !f.gone); }

  function makeWave() {
    const s = game.setup, d = difficulty();
    let items;
    const bombsN = game.rW.int(s.bombs[0], s.bombs[1]) + (d > 0.5 ? 1 : 0);
    if (game.step.type === 'exact') {
      const cfg = game.cfg;
      let specialChance = s.special;
      const king = game.boss && game.boss.phases;
      if (king) { // la fase cambia lo que lanza el jefe
        const ph = game.boss.phase;
        cfg.specials = ph >= 2; cfg.ops.sub = ph >= 2; cfg.ops.mul = ph >= 3;
        specialChance = ph >= 2 ? 0.35 : 0;
      }
      const w = E.exactWave(game.A, game.T, cfg, game.rW, {
        distractors: cfg.distractors + Math.round(d * 2),
        bombs: king ? (game.boss.phase >= 2 ? game.boss.phase - 1 : 0) : bombsN,
        specialChance, twins: s.twins,
      });
      items = w.items;
      // en aventura, los especiales se limitan a los del nivel
      if (s.specialPool) items = items.filter((it) => it.role !== 'special' && it.role !== 'gold' && it.role !== 'blast' || s.specialPool.includes(it.op.type));
    } else {
      const n = 4 + Math.round(d * 2);
      const nb = game.cfg.bombs ? Math.min(2, bombsN) : 0;
      items = game.mission.kinds ? E.exprWave(game.mission, game.cfg, game.rW, game.mission.kinds ? Math.min(n, 5) : n, nb) : E.filterWave(game.mission, game.cfg, game.rW, n, nb);
      if (game.cfg.specials && game.rW.chance(0.15)) items.push({ op: { type: 'gold' }, role: 'gold' });
    }
    const stagger = (game.relaxed ? 0.32 : 0.24) * (1 - d * 0.3);
    // carriles: cada fruta sale por una zona distinta para que no se tapen
    const lanes = game.rW.shuffle(items.map((_, i) => lerp(W * 0.14, W * 0.86, items.length > 1 ? i / (items.length - 1) : 0.5)));
    items.forEach((it, i) => game.queue.push({ it, at: game.time + 0.15 + i * stagger, x: lanes[i] + (game.rW() - 0.5) * W * 0.05 }));
    game.waveCooldown = 0.9;
  }

  function launch(it, opts) {
    opts = opts || {};
    const op = it.op;
    const kind = op.type === 'num' || op.type === 'sub' || op.type === 'expr' ? RL().pick(NORMAL_KINDS) : (SPECIAL_INFO[op.type] || { kind: 'apple' }).kind;
    const r = op.type === 'bomb' ? R * 0.9 : op.type === 'blast' ? R * 1.1 : op.type === 'expr' ? R * 1.18 : (op.type === 'sub' || op.type === 'mul' || op.type === 'div' || op.type === 'dbl') ? R * 1.08 : R;
    const playTop = layout.playTop;
    const x = opts.x != null ? opts.x : opts.lane != null ? clamp(opts.lane, W * 0.1, W * 0.9) : lerp(W * 0.14, W * 0.86, RL()());
    const y = H + r * 1.3;
    const T = airtime();
    const hRef = Math.max(160, (H - playTop) * 0.8);
    const g = (8 * hRef) / (T * T);
    const apexY = lerp(playTop + r * 1.1, playTop + (H - playTop) * 0.42, RL()());
    const h = y - apexY;
    const vy = -Math.sqrt(2 * g * h);
    const tAir = (2 * -vy) / g;
    const targetX = opts.lane != null ? clamp(x + (RL()() - 0.5) * W * 0.18, W * 0.12, W * 0.88) : lerp(W * 0.22, W * 0.78, RL()());
    const vx = (targetX - x) / (tAir * 0.55);
    const f = { id: game ? game.nextId++ : rng.int(1, 1e9), op, role: it.role, kind, r, x, y, vx, vy, g, rot: (RL()() - 0.5) * 0.6, vr: (RL()() - 0.5) * 2.2, cut: false, born: clock };
    if (opts.vy != null) { f.vy = opts.vy; f.vx = opts.vx || 0; f.y = opts.y; }
    sfx.swish();
    return f;
  }

  /* =================================================================
     8. CORTES
     ================================================================= */
  function pointerPos(e) { const rc = canvas.getBoundingClientRect(); return { x: e.clientX - rc.left, y: e.clientY - rc.top }; }
  canvas.addEventListener('pointerdown', (e) => {
    if (game && (game.paused || game.over)) return;
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* */ }
    const p = pointerPos(e);
    blade.active = true; blade.id = e.pointerId; blade.pts = [{ x: p.x, y: p.y, t: clock }];
    blade.swipe = { entries: [], cuts: 0, hit: null }; blade.recent = [];
    if (save.settings.tap) {
      const list = game ? game.fruits : attract;
      const f = E.pickTap(list.filter((fr) => !fr.cut && !fr.fade && !fr.gone && (!game || !game.decision || fr.seed)), p);
      if (f) cutFruit(f, -Math.PI / 4);
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!blade.active || e.pointerId !== blade.id) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of (evs.length ? evs : [e])) {
      const p = pointerPos(ev);
      const last = blade.pts[blade.pts.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) < 2) continue;
      blade.pts.push({ x: p.x, y: p.y, t: clock });
      sliceSegment(last, p);
    }
  });
  const endBlade = (e) => { if (blade.active && (!e || e.pointerId === blade.id)) finishSwipe(); };
  canvas.addEventListener('pointerup', endBlade);
  canvas.addEventListener('pointercancel', endBlade);
  canvas.addEventListener('lostpointercapture', endBlade);

  /** Detección real: el segmento recorrido por el dedo atraviesa el círculo de la fruta */
  function sliceSegment(a, b) {
    const list = game ? game.fruits : attract;
    const hits = [];
    for (const f of list) {
      if (f.cut || f.fade || f.gone) continue;
      if (game && game.decision && !f.seed) continue; // durante la decisión solo se cortan las semillas
      const isBomb = f.kind === 'bomb';
      const t = E.segmentHitsCircle(a.x, a.y, b.x, b.y, f.x, f.y, f.r * (isBomb ? E.BOMB_HIT : 0.95));
      if (t >= 0) hits.push({ f, t, isBomb });
    }
    hits.sort((p, q) => p.t - q.t); // en el orden en que la espada las atraviesa
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const fruitsNow = hits.filter((h) => !h.isBomb).map((h) => h.f);
    const recent = (blade.recent = (blade.recent || []).filter((c) => clock - c.t <= E.BOMB_GRACE));
    for (const h of hits) {
      if (h.isBomb && E.bombShielded(h.f, fruitsNow, recent, clock)) continue; // la bomba estaba detrás
      const wasDecision = game && game.decision;
      cutFruit(h.f, ang);
      if (!h.isBomb) recent.push({ x: h.f.x, y: h.f.y, r: h.f.r, t: clock });
      if (game && !wasDecision && game.decision) break; // empieza una decisión: el gesto termina aquí
      if (!blade.active && game) break;
    }
    if (Math.hypot(b.x - a.x, b.y - a.y) > 25 && clock - blade.lastSound > 0.18) { sfx.swish(); blade.lastSound = clock; }
  }

  function cutFruit(f, ang) {
    if (f.cut || f.fade || f.gone) return;
    f.cut = true;
    const F = FRUITS[f.kind] || FRUITS.apple;
    // mitades
    if (f.kind !== 'bomb') {
      [-1, 1].forEach((side) => {
        const nx = Math.cos(ang + Math.PI / 2) * side, ny = Math.sin(ang + Math.PI / 2) * side;
        fx.halves.push({ kind: f.kind, r: f.r, x: f.x, y: f.y, vx: f.vx * 0.5 + nx * 140, vy: Math.min(f.vy, 0) * 0.3 + ny * 140 - 60, rot0: f.rot, spin: 0, vr: side * (2 + rng() * 2), ang, side, life: 1.6, g: 1100 });
      });
      addParticles(f.x, f.y, [F.juice, F.flesh], 18, 380, { size: 5, life: 0.8 });
      fx.splats.push({ x: f.x, y: f.y, r: f.r * (0.8 + rng() * 0.5), color: F.juice, life: 2.2, max: 2.2, seed: rng() });
      const sw = sword();
      addParticles(f.x, f.y, sw.glow === 'rainbow' ? ['#ff5e5e', '#ffd84a', '#7be495', '#5ec8ff', '#b07aff'] : sw.core, 8, 520, { dir: ang, spread: 0.5, size: 3, life: 0.35, g: 0 });
      sfx.slice(); sfx.splat();
    }
    if (!game) return; // en el menú solo es decorativo
    unlock('first_cut');
    game.stats.cuts++;
    const op = f.op;
    if (op.type === 'seed') return resolveDecision(f);
    if (op.type === 'bomb') return bombHit(f);
    if (op.type === 'gold') {
      game.stats.gold += 10;
      game.score += 50 * game.mult;
      floatText(f.x, f.y - f.r, '+10 🪙', C.mostaza, 26);
      addParticles(f.x, f.y, [C.mostaza, '#fff3b0'], 24, 420, { size: 4, life: 1, shape: 'star' });
      sfx.coin();
      return updateHUD();
    }
    if (op.type === 'blast') {
      fx.rings.push({ x: f.x, y: f.y, r: 10, max: R * 4.2, life: 0.5 });
      sfx.boom(); shake(8);
      floatText(f.x, f.y - f.r, '¡BOOM!', C.coral, 30);
      const targets = E.blastTargets(f, game.fruits, R * 4.2);
      targets.forEach((t, i) => setTimeout(() => { if (game && !t.cut) cutFruit(t, rng() * TAU); }, 60 * (i + 1)));
      return;
    }
    if (game.step.type === 'exact') applyExact(f);
    else applyFilter(f);
  }

  /* ----- Objetivo exacto: la fruta opera sobre el acumulador ----- */
  function applyExact(f) {
    // −( ), × y ÷: antes de aplicar, el alumno tiene que DECIDIR el resultado
    if (game.setup.decide && (f.op.type === 'sub' || f.op.type === 'mul' || f.op.type === 'div')) {
      const d = E.decision(game.A, f.op);
      if (d) return startDecision(f, d);
    }
    commitOp(f.op, f.x, f.y - f.r);
  }
  function commitOp(op, x, y) {
    const before = game.A;
    const r = E.apply(before, op);
    if (!r.ok) {
      game.stats.noExact++;
      floatText(x, y, 'No exacta', C.coral, 22);
      game.eqText = r.expr;
      say(r.expr + '. ¡El acumulador no cambia!', 'oops', 2600);
      sfx.error();
      return updateHUD();
    }
    game.A = r.value; game.roundCuts++;
    game.eqText = r.expr;
    game.arrows.push({ from: before, to: game.A, label: E.label(op), life: 1.8, max: 1.8 });
    if (op.type === 'neg') unlock('inverter');
    if (op.type === 'div') unlock('divider');
    const col = game.A > before ? '#9fd6c0' : game.A < before ? '#ff9f86' : C.crema;
    floatText(x, y, E.label(op), col, 30);
    blade.swipe && blade.swipe.entries.push({ op, before, after: game.A });
    game.score += 10 * game.mult;
    game.lastProgress = game.time;
    sfx.good(game.roundCuts);
    if (game.A === game.T && game.roundCuts >= 1) targetHit();
    updateHUD();
  }

  /* ----- 🌱 Semillas de decisión ----- */
  function startDecision(f, d) {
    const g = game;
    const limit = g.relaxed ? 25 : 9;
    const opts = game.rW.shuffle([d.correct, d.wrong]);
    const y = clamp(lerp(layout.playTop, H, 0.58), layout.playTop + R * 3, H - R * 3);
    const seeds = opts.map((v, i) => ({
      id: g.nextId++, op: { type: 'seed', v }, role: v === d.correct ? 'good' : 'bad', kind: 'seed', seed: true,
      r: R * 1.2, x: f.x, y: f.y, tx: W * (i === 0 ? 0.28 : 0.72), ty: y, vx: 0, vy: 0, g: 0, rot: 0, vr: 0, cut: false, born: clock,
    }));
    g.decision = { op: f.op, d, t: 0, limit, seeds, x: f.x, y: f.y };
    g.fruits.push(...seeds);
    g.hintIds = [];
    blade.active = false; blade.swipe = null; // el gesto termina aquí
    sfx.mult();
    floatText(f.x, f.y - f.r, E.label(f.op), C.mostaza, 30);
    say(d.kind === 'negpar' ? '¿Qué hace el − delante del paréntesis? ¡Elige!' : 'Primero el signo, después el número. ¡Elige!', 'happy', 2400);
  }
  function resolveDecision(seed) {
    const g = game, dec = g.decision;
    if (!dec) return;
    g.decision = null;
    dec.seeds.forEach((s) => { if (s !== seed) s.fade = true; });
    const d = dec.d;
    if (seed.op.v === d.correct) {
      g.stats.decOk++;
      g.score += 20 * g.mult;
      floatText(seed.x, seed.y - seed.r, '✔ ' + E.fmt(d.correct), '#9fd6c0', 32);
      showRuleCard(d, true);
      if (g.stats.decOk >= 10) unlock('rule10');
      const x = seed.x, y = seed.y - seed.r;
      if (dec.op.type === 'sub') commitOp(dec.op, x, y);
      else commitOp(dec.op, x, y);
    } else {
      g.stats.decErr++;
      g.stats.decErrKinds[d.kind] = (g.stats.decErrKinds[d.kind] || 0) + 1;
      g.streak = 0; g.cutStreak = 0; g.mult = 1;
      floatText(seed.x, seed.y - seed.r, '✘ ' + E.fmt(seed.op.v), C.coral, 32);
      sfx.error(); shake(6);
      g.eqText = d.question.replace('?', E.fmt(d.correct));
      showRuleCard(d, false);
      say('Era ' + E.fmt(d.correct) + '. ' + d.explain, 'oops', 3600);
      penalty(seed.x, seed.y);
      updateHUD();
    }
  }
  function decisionTimeout() {
    const g = game, dec = g.decision;
    g.decision = null;
    dec.seeds.forEach((s) => (s.fade = true));
    g.eqText = dec.d.question.replace('?', E.fmt(dec.d.correct));
    showRuleCard(dec.d, false);
    say('¡Se escaparon las semillas! ' + dec.d.explain, 'oops', 3400);
    updateHUD();
  }
  /** Tarjeta con la regla de los signos resaltada (verde si acertó, coral si falló) */
  function showRuleCard(d, okAnswer) {
    let rows;
    if (d.kind === 'negpar') rows = [['-(+)', '−(+a) = −a', 'cambia'], ['-(-)', '−(−a) = +a', 'cambia'], ['+(+)', '+(+a) = +a', 'igual'], ['+(-)', '+(−a) = −a', 'igual']];
    else { const o = d.kind === 'mul' ? '·' : ':'; rows = [['++', `(+)${o}(+) = +`, 'iguales'], ['−−', `(−)${o}(−) = +`, 'iguales'], ['+−', `(+)${o}(−) = −`, 'distintos'], ['−+', `(−)${o}(+) = −`, 'distintos']]; }
    const el = $('#explain');
    el.innerHTML = `<div class="rc-head ${okAnswer ? 'ok' : 'ko'}">${okAnswer ? '✔ ¡Correcto!' : '✘ Revisa la regla'}</div><div class="rc-q">${d.explain}</div><div class="rc-table">${rows.map((r) => `<span class="${r[0] === d.key ? 'on ' + (okAnswer ? 'ok' : 'ko') : ''}">${r[1]}</span>`).join('')}</div>`;
    el.classList.remove('hidden');
    clearTimeout(explainTimer);
    explainTimer = setTimeout(() => el.classList.add('hidden'), okAnswer ? 1700 : 3600);
  }

  function targetHit() {
    const g = game;
    g.stats.targets++; g.stepDone++; g.unitsDone++;
    g.streak++;
    const oldMult = g.mult;
    g.mult = E.multiplierFor(g.streak);
    g.bestMult = Math.max(g.bestMult, g.mult);
    let pts = 100 + Math.abs(g.T) * 5;
    if (g.hintIds.length) pts = Math.round(pts / 2); // con pista vale la mitad
    g.score += pts * g.mult;
    floatText(W / 2, layout.playTop + 40, `¡EXACTO! +${pts * g.mult}`, C.mostaza, 34, 1.3);
    addParticles(W / 2, layout.lineY, ['#E46D4D', '#E8B53A', '#5A8A78', '#F4EDD7', '#9fd6c0'], 60, 600, { size: 6, life: 1.2, g: 600 });
    sfx.target();
    unlock('first_target');
    if (g.mult > oldMult) {
      banner('×' + g.mult, 'MULTIPLICADOR', C.mostaza, 1.1); sfx.mult();
      const m = $('#hMult'); m.classList.remove('bump'); void m.offsetWidth; m.classList.add('bump');
      if (g.mult >= 5) unlock('streak5');
      if (g.mult >= 10) unlock('streak10');
    }
    // combo exacto / megacombo: ronda entera resuelta en un único gesto
    if (blade.swipe) {
      const e = blade.swipe.entries;
      const combos = e.length >= 2 ? E.evaluateCombos(e, { index: e.length - 1, roundCuts: g.roundCuts }) : [];
      combos.forEach(awardCombo);
      blade.swipe.entries = []; // lo que se corte después cuenta para la ronda nueva
    }
    const praise = ['¡Exacto!', '¡Así se hace!', '¡Cuenta perfecta!', '¡Ninja de los enteros!', '¡Impecable!'];
    say(rng.pick(praise) + ' ' + g.eqText, 'happy', 2200);
    $('#hAccBox').classList.remove('hit'); void $('#hAccBox').offsetWidth; $('#hAccBox').classList.add('hit');
    if (g.boss) bossDamage();
    if (g.over) return;
    if (g.stepDone >= g.step.n) nextStep();
    else newRound(false);
  }

  /** Valor numérico de una fruta (número, resta o expresión) */
  function fruitValue(op) {
    if (op.type === 'num') return op.v;
    if (op.type === 'sub') return -op.v;
    if (op.type === 'expr') return E.evalExpr(op);
    return null;
  }
  /* ----- Misiones de filtro: ¿cumple la condición? ----- */
  function applyFilter(f) {
    const g = game, m = g.mission;
    const v = fruitValue(f.op);
    if (v == null) return;
    let good, why = '', refs = [];
    good = m.test(v);
    if (!good) {
      why = m.explain(v, f.op);
      refs = m.id === 'lt' || m.id === 'gt' ? [m.k] : m.id === 'opp' ? [-v] : m.id === 'abs' ? [m.k, -m.k] : m.id === 'exprEq' ? [m.k] : [0];
    }
    if (good) {
      g.stats.correct++; g.stepDone++; g.unitsDone++; g.cutStreak++;
      const om = g.mult; g.mult = E.multiplierFor(Math.floor(g.cutStreak / 3)); g.bestMult = Math.max(g.bestMult, g.mult);
      if (g.mult > om) { banner('×' + g.mult, 'MULTIPLICADOR', C.mostaza, 1); sfx.mult(); if (g.mult >= 5) unlock('streak5'); if (g.mult >= 10) unlock('streak10'); }
      g.score += 25 * g.mult;
      floatText(f.x, f.y - f.r, '✔ ' + (f.op.type === 'expr' ? E.exprLabel(f.op) + ' = ' : '') + E.fmt(v), '#9fd6c0', f.op.type === 'expr' ? 24 : 28);
      sfx.good(g.stepDone);
      if (g.boss) bossDamage();
      if (g.stepDone >= g.step.n) {
        if (g.missionErrors === 0) { unlock('perfect'); g.score += 200 * g.mult; floatText(W / 2, layout.playTop + 60, '¡MISIÓN PERFECTA! +' + 200 * g.mult, C.mostaza, 28, 1.6); }
        sfx.target();
        if (!g.over) nextStep();
      }
    } else {
      g.stats.signErrors++; g.missionErrors++; g.cutStreak = 0; g.mult = 1;
      floatText(f.x, f.y - f.r, '✘ ' + (f.op.type === 'expr' ? E.exprLabel(f.op) + ' = ' : '') + E.fmt(v), C.coral, f.op.type === 'expr' ? 24 : 28);
      sfx.error(); shake(6);
      if (f.op.type === 'expr') { g.stats.decErrKinds[f.op.kind] = (g.stats.decErrKinds[f.op.kind] || 0) + 1; }
      showExplain(v, refs, why);
      say(why, 'oops', 3000);
      penalty(f.x, f.y);
    }
    updateHUD();
  }

  function awardCombo(c) {
    const g = game;
    g.stats.combos++;
    g.score += c.bonus * g.mult;
    const color = c.id === 'zero' ? '#9fd6c0' : c.id === 'neg' ? '#ff9f86' : c.id === 'pos' ? '#9fd6c0' : C.mostaza;
    const sub = c.id === 'zero' ? 'Los opuestos suman 0' : c.id === 'pos' ? 'Suma ' + E.fmt(c.sum) : c.id === 'neg' ? 'Suma ' + E.fmt(c.sum) : 'Un solo gesto';
    banner(c.name, `${sub} · +${c.bonus * g.mult}`, color, c.id === 'mega' ? 2 : 1.4);
    sfx.combo(c.id === 'mega' ? 6 : 3);
    addParticles(W / 2, H * 0.45, ['#E46D4D', '#E8B53A', '#5A8A78', '#F4EDD7'], c.id === 'mega' ? 120 : 50, c.id === 'mega' ? 900 : 600, { size: 6, life: 1.4, g: 500 });
    if (c.id === 'mega') shake(10);
    if (c.id === 'zero') unlock('zero');
    if (c.id === 'exact') unlock('exact');
    if (c.id === 'mega') { unlock('mega'); unlock('exact'); }
    say(c.id === 'zero' ? '¡Combo cero! Un número y su opuesto se anulan.' : c.id === 'mega' ? '¡MEGACOMBO! ¡Eres un maestro!' : '¡' + c.name + '!', 'happy', 2000);
  }

  function finishSwipe() {
    blade.active = false;
    const sw = blade.swipe; blade.swipe = null;
    if (!game || !sw) return;
    // Combos cero/positivo/negativo con todo lo cortado en este gesto (en modo exacto)
    if (game.step && game.step.type === 'exact' && sw.entries.length >= 2) {
      E.evaluateCombos(sw.entries, null).forEach(awardCombo);
      updateHUD();
    }
  }

  function bombHit(f) {
    const g = game;
    g.stats.bombs++;
    sfx.bomb(); shake(18);
    if (!reduce()) fx.flash = 0.35;
    addParticles(f.x, f.y, ['#FF6A2B', '#FFE066', '#332B2A', '#E46D4D'], 70, 800, { size: 7, life: 1, g: 300 });
    fx.rings.push({ x: f.x, y: f.y, r: 10, max: R * 3, life: 0.5 });
    g.streak = 0; g.cutStreak = 0; g.mult = 1;
    say('¡Ay! Las bombas rompen la racha.', 'oops', 2000);
    if (g.relaxed) { g.score = Math.max(0, g.score - 50); floatText(f.x, f.y, '−50', C.coral, 30); }
    else loseLife('bomba');
    updateHUD();
  }
  /** Fallo de misión o de semilla: −50 puntos (nunca por debajo de 0), sin perder vida.
      Las vidas solo se pierden con bombas y cuando se acaba el tiempo. */
  function penalty(x, y) {
    const g = game;
    g.fallos++;
    g.score = Math.max(0, g.score - 50);
    floatText(x, y + 34, '−50', C.coral, 26);
  }
  function loseLife(why) {
    const g = game;
    if (g.relaxed) return;
    g.lives--; g.livesLost++;
    g.streak = 0; g.mult = 1;
    if (g.lives <= 0) endGame(false, why === 'bomba' ? '¡BOOM! Sin vidas' : 'Sin vidas');
  }

  /* ---------- Pistas ---------- */
  function useHint() {
    if (!game || game.over || game.paused) return;
    game.stats.hints++;
    const live = liveFruits();
    if (game.decision) {
      const dec = game.decision;
      game.hintIds = dec.seeds.filter((s) => s.op.v === dec.d.correct).map((s) => s.id); game.hintUntil = game.time + 99;
      say('Pista: ' + dec.d.rule, 'happy', 3600);
      $('#bHint').classList.remove('glow');
      return;
    }
    if (game.step.type === 'exact') {
      const cands = live.filter((f) => E.isMathOp(f.op));
      const sol = E.findSolution(cands.map((f) => f.op), game.A, game.T, 4);
      if (sol) {
        game.hintIds = sol.map((i) => cands[i].id); game.hintUntil = game.time + 4;
        const txt = sol.map((i) => E.label(cands[i].op)).join(', luego ');
        say('Prueba con ' + txt + '. (Con pista, el objetivo vale la mitad).', 'happy', 3800);
      } else {
        const d = game.T - game.A;
        say(`Te faltan ${E.fmt(d)} para llegar a ${E.fmt(game.T)}. Con estas frutas no se puede: ¡espera la siguiente oleada o pulsa ↺0!`, 'oops', 4200);
      }
    } else {
      const m = game.mission;
      let ids;
      ids = live.filter((f) => fruitValue(f.op) != null && m.test(fruitValue(f.op))).map((f) => f.id);
      game.hintIds = ids; game.hintUntil = game.time + 3;
      say(missionTip(m), 'happy', 3000);
    }
    $('#bHint').classList.remove('glow');
  }
  function resetAccumulator() {
    if (!game || game.over || game.step.type !== 'exact' || game.A === 0) return;
    game.arrows.push({ from: game.A, to: 0, label: '↺', life: 1.2, max: 1.2 });
    game.A = 0; game.roundCuts = 0; game.streak = 0; game.mult = 1;
    game.eqText = 'Acumulador a 0 (la racha se pierde)';
    sfx.click(); updateHUD();
  }

  /* ---------- Jefe, guardianes y rivales ---------- */
  function bossDamage() {
    const b = game.boss;
    if (!b || b.defeated) return;
    b.hp = Math.max(0, b.hp - 1); b.expr = 'hurt'; b.exprT = 0.8; b.flash = 0.45;
    sfx.bossHit(); shake(b.phases ? 10 : 5);
    addParticles(b.x, b.y, ['#E46D4D', '#E8B53A', '#F4EDD7'], b.phases ? 40 : 18, 500, { size: 5, life: 0.9 });
    if (rng.chance(0.35) && b.hp > 0) say(b.en.name + ': «' + rng.pick(b.en.hurt) + '»', 'happy', 1800);
    if (b.phases) {
      const newPhase = b.hp > 6 ? 1 : b.hp > 3 ? 2 : 3;
      if (newPhase !== b.phase && b.hp > 0) {
        b.phase = newPhase;
        banner('FASE ' + newPhase, newPhase === 2 ? '¡Bombas, frutas especiales y −( )!' : '¡Más rápido y con multiplicaciones!', C.coral, 2);
        say(newPhase === 2 ? '¡Se ha enfadado! Ahora lanza bombas y restas con paréntesis.' : '¡Última fase! Piensa en la regla de los signos.', 'oops', 2600);
      }
    }
    if (b.hp > 0) return;
    b.defeated = true; b.expr = 'defeated'; b.deadT = 0;
    for (let i = 0; i < (b.phases ? 6 : 3); i++) setTimeout(() => { if (game && game.boss === b) { addParticles(b.x + (rng() - 0.5) * b.r * 2, b.y + (rng() - 0.5) * b.r, ['#FF6A2B', '#FFE066', '#E46D4D'], 40, 700, { size: 6, life: 1 }); sfx.boom(); shake(8); } }, i * 220);
    if (b.phases) { // el Rey: victoria final
      unlock('king');
      game.score += 2000;
      banner('¡VICTORIA!', 'El Rey de los Signos ha caído', C.mostaza, 3);
      coinRain();
      game.fruits.forEach((f) => { if (!f.cut) f.fade = true; });
      game.queue = []; game.decision = null;
      setTimeout(() => game && endGame(true, '¡Has derrotado al Rey!'), 2600);
      game.over = true; game.ending = true;
    } else if (game.mode === 'arcade') { // rival de arcade: premio y llega el siguiente
      game.stats.rivals++;
      const bonus = 500 * game.mult;
      game.score += bonus; game.stats.gold += 20;
      banner('¡RIVAL DERROTADO!', b.en.name + ' · +' + bonus + ' · +20 🪙', C.mostaza, 2);
      if (game.stats.rivals >= 3) unlock('rivals3');
      sfx.win();
      setTimeout(() => {
        if (!game || game.over || game.boss !== b) return;
        game.rivalIndex = (game.rivalIndex + 1) % ARCADE_RIVALS.length;
        game.boss = makeBoss(ARCADE_RIVALS[game.rivalIndex], 6 + Math.min(6, game.stats.rivals * 2), false);
        measureLayout();
        say('¡Nuevo rival! ' + game.boss.en.name + ': «' + game.boss.en.intro + '»', 'oops', 2600);
      }, 1800);
    } else banner('¡' + b.en.name.toUpperCase() + ' DERROTADO!', '', C.mostaza, 1.8);
  }
  function bossAttack() {
    const b = game.boss;
    b.expr = 'laugh'; b.exprT = 1.2; sfx.bossLaugh();
    let k = b.en.attack;
    if (k === 'mix') k = b.phases && b.phase === 1 ? 'flip' : rng.pick(['bombs', 'flip']);
    if (k === 'flip' && !(game.T !== 0 && game.step.type === 'exact')) k = 'bombs';
    if (k === 'flip') {
      game.T = -game.T;
      banner('¡CAMBIO DE SIGNO!', 'Nuevo objetivo: ' + E.fmt(game.T), C.coral, 1.8);
      say(b.en.name + ': «' + b.en.laugh + '» Ahora el objetivo es ' + E.fmt(game.T) + '.', 'oops', 2800);
      $('#hGoalBox').classList.remove('flash'); void $('#hGoalBox').offsetWidth; $('#hGoalBox').classList.add('flash');
      game.queue = []; game.waveCooldown = 0.3; // la siguiente oleada se recalcula con el nuevo objetivo
    } else {
      banner('¡BOMBARDEO!', b.en.name, C.coral, 1.4);
      say(b.en.name + ': «' + b.en.laugh + '»', 'oops', 2000);
      const n = b.phases ? b.phase + 1 : (b.en.bombs || 1);
      for (let i = 0; i < n; i++) {
        const f = launch({ op: { type: 'bomb' }, role: 'bomb' }, { x: b.x + (i - (n - 1) / 2) * R * 1.6, y: b.y + b.r * 0.6, vy: 60 + rng() * 80, vx: (rng() - 0.5) * 160 });
        game.fruits.push(f);
      }
    }
    updateHUD(true);
  }
  function coinRain() {
    for (let i = 0; i < (reduce() ? 25 : 90); i++) fx.particles.push({ x: rng() * W, y: -20 - rng() * H * 0.6, vx: (rng() - 0.5) * 60, vy: 100 + rng() * 200, r: 7 + rng() * 4, color: C.mostaza, life: 3.5, max: 3.5, g: 300, shape: 'coin' });
  }

  /* =================================================================
     9. BUCLE PRINCIPAL
     ================================================================= */
  function update(dt) {
    clock += dt;
    // efectos (también en el menú)
    for (const p of fx.particles) { p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
    fx.particles = fx.particles.filter((p) => p.life > 0 && p.y < H + 50);
    for (const h of fx.halves) { h.vy += h.g * dt; h.x += h.vx * dt; h.y += h.vy * dt; h.spin += h.vr * dt; h.life -= dt; }
    fx.halves = fx.halves.filter((h) => h.life > 0 && h.y < H + h.r * 3);
    fx.splats.forEach((s) => (s.life -= dt)); fx.splats = fx.splats.filter((s) => s.life > 0);
    fx.texts.forEach((t) => { t.life -= dt; t.y -= 40 * dt; }); fx.texts = fx.texts.filter((t) => t.life > 0);
    fx.rings.forEach((r) => { r.life -= dt; r.r = lerp(r.r, r.max, 0.25); }); fx.rings = fx.rings.filter((r) => r.life > 0);
    if (fx.banner) { fx.banner.life -= dt; if (fx.banner.life <= 0) fx.banner = null; }
    fx.shake *= Math.pow(0.002, dt); if (fx.shake < 0.3) fx.shake = 0;
    fx.flash = Math.max(0, fx.flash - dt);
    blade.pts = blade.pts.filter((p) => clock - p.t < 0.14);

    if (!game) return updateAttract(dt);
    const g = game;
    if (g.paused) return;
    // 🌱 decisión en curso: todo va a cámara lenta y los relojes se detienen
    if (g.decision && !g.over) {
      const dec = g.decision;
      dec.t += dt;
      for (const sd of dec.seeds) { sd.x = lerp(sd.x, sd.tx, 1 - Math.pow(0.001, dt)); sd.y = lerp(sd.y, sd.ty + Math.sin(clock * 3 + sd.tx) * 6, 1 - Math.pow(0.001, dt)); }
      if (dec.t >= dec.limit) decisionTimeout();
    }
    const slow = g.decision ? 0.12 : 1;
    // frutas
    for (const f of g.fruits) {
      if (f.cut || f.seed) { if (f.seed && f.fade) { f.alpha = (f.alpha == null ? 1 : f.alpha) - dt * 3; if (f.alpha <= 0) f.gone = true; } continue; }
      const dt0 = dt; dt = dt * slow;
      f.vy += f.g * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt;
      if (f.fade) { f.alpha = (f.alpha == null ? 1 : f.alpha) - dt * 2.5; if (f.alpha <= 0) f.gone = true; }
      if (f.vy > 0 && f.y > H + f.r * 2) f.gone = true;
      // rebote suave en los laterales para que no se escapen
      if (f.x < f.r * 0.6 && f.vx < 0) f.vx *= -0.6;
      if (f.x > W - f.r * 0.6 && f.vx > 0) f.vx *= -0.6;
      dt = dt0;
    }
    g.fruits = g.fruits.filter((f) => !f.gone && !f.cut);
    if (g.ending) { if (g.boss) updateBoss(dt); return; }
    if (g.over) return;
    if (g.decision) { if (g.boss) updateBoss(dt); hudTick(); return; }

    g.time += dt;
    if (g.timeLeft !== Infinity) {
      const before = Math.ceil(g.timeLeft);
      g.timeLeft -= dt;
      if (Math.ceil(g.timeLeft) !== before && g.timeLeft <= 5 && g.timeLeft > 0) sfx.tick();
      if (g.timeLeft <= 0) { g.timeLeft = 0; return endGame(true, '¡Tiempo!'); }
    }
    if (g.levelTime !== Infinity && g.time >= g.levelTime) return endGame(false, 'Se acabó el tiempo del nivel');
    // tiempo por objetivo (arcade/jefe)
    if (g.step.type === 'exact' && g.roundLimit !== Infinity) {
      g.roundTime -= dt;
      if (g.roundTime <= 0) {
        say(`¡Tiempo! El objetivo era ${E.fmt(g.T)} y tenías ${E.fmt(g.A)}.`, 'oops', 2600);
        sfx.error();
        if (g.boss) { g.boss.hp = Math.min(g.boss.max, g.boss.hp + 1); g.boss.expr = 'laugh'; g.boss.exprT = 1.2; sfx.bossLaugh(); }
        loseLife('tiempo');
        if (g.over) return;
        g.streak = 0; g.mult = 1;
        newRound(false);
        updateHUD(true);
      }
    }
    // lanzar lo que está en cola
    for (let i = g.queue.length - 1; i >= 0; i--) {
      if (g.queue[i].at <= g.time) { g.fruits.push(launch(g.queue[i].it, { lane: g.queue[i].x })); g.queue.splice(i, 1); }
    }
    // nueva oleada cuando quedan pocas frutas
    g.waveCooldown -= dt;
    const live = liveFruits().filter((f) => f.op.type !== 'bomb');
    const threshold = g.mode === 'arcade' && difficulty() > 0.6 ? 2 : 1;
    const allFalling = live.every((f) => f.vy > 0 && f.y > layout.playTop + (H - layout.playTop) * 0.35);
    if (!g.queue.length && g.waveCooldown <= 0 && (live.length === 0 || (live.length <= threshold && allFalling))) makeWave();
    // pista automática
    const stuck = g.step.type === 'exact' && g.time - g.lastProgress > 12;
    $('#bHint').classList.toggle('glow', stuck && g.setup.hints);
    if (g.relaxed && stuck && g.setup.hints && !g.hintIds.length && g.time - g.lastProgress > 14) { useHint(); g.lastProgress = g.time; }
    if (g.hintIds.length && g.time > g.hintUntil && !g.decision) g.hintIds = [];
    if (g.boss) updateBoss(dt);
    // logros por tiempo
    if (g.mode === 'arcade' && g.time >= 120) unlock('survivor');
    // número mostrado en la recta: animación suave
    g.Ashow = lerp(g.Ashow, g.A, 1 - Math.pow(0.0005, dt));
    g.arrows.forEach((a) => (a.life -= dt)); g.arrows = g.arrows.filter((a) => a.life > 0);
    hudTick();
  }
  function updateBoss(dt) {
    const b = game.boss;
    b.x = W / 2 + Math.sin(clock * 0.7) * W * 0.18;
    b.y = lerp(b.y, b.baseY + Math.sin(clock * 2) * 6, 1 - Math.pow(0.02, dt));
    b.hpShow = lerp(b.hpShow, b.hp, 0.1);
    b.flash = Math.max(0, b.flash - dt);
    if (b.exprT > 0) { b.exprT -= dt; if (b.exprT <= 0 && !b.defeated) b.expr = b.phase === 3 ? 'angry' : 'normal'; }
    if (b.defeated) { b.deadT += dt; b.y += 40 * dt; return; }
    if (game.decision) return; // no ataca mientras decides
    b.attackT -= dt;
    if (b.attackT <= 0) { bossAttack(); b.attackT = b.phases ? (b.phase === 3 ? 9 : 12) : game.mode === 'arcade' ? 14 : 17; }
  }

  function updateAttract(dt) {
    if (rng() < dt * 1.1 && attract.filter((f) => !f.cut).length < 4) {
      const v = E.randNonZero(rng, -9, 9);
      const f = launch({ op: { type: 'num', v }, role: 'demo' });
      attract.push(f);
    }
    for (const f of attract) { if (f.cut) continue; f.vy += f.g * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt; }
    attract = attract.filter((f) => !f.cut && !(f.vy > 0 && f.y > H + f.r * 2));
  }

  /* ---------- Dibujo ---------- */
  function render() {
    ctx.save();
    if (fx.shake) ctx.translate((rng() - 0.5) * fx.shake, (rng() - 0.5) * fx.shake);
    drawBackground(clock);
    // manchas de zumo
    for (const s of fx.splats) {
      ctx.globalAlpha = Math.min(1, s.life / s.max) * 0.35;
      ctx.fillStyle = s.color; ctx.beginPath();
      for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU + s.seed * 6, rr = s.r * (0.5 + ((i * 37 + s.seed * 100) % 10) / 14); ctx.moveTo(s.x + Math.cos(a) * rr + rr * 0.3, s.y + Math.sin(a) * rr); ctx.arc(s.x + Math.cos(a) * rr, s.y + Math.sin(a) * rr, rr * 0.3, 0, TAU); }
      ctx.arc(s.x, s.y, s.r * 0.6, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (game) {
      if (game.step && game.step.type === 'exact') drawNumberLine();
      else if (game.mission) drawMissionLine();
      if (game.boss) drawBoss(ctx, game.boss, clock);
    }
    // mitades
    for (const h of fx.halves) drawHalf(h);
    // frutas
    const list = game ? game.fruits : attract;
    for (const f of list) {
      if (f.cut || f.gone) continue;
      ctx.save(); ctx.translate(f.x, f.y);
      if (f.alpha != null) ctx.globalAlpha = Math.max(0, f.alpha);
      if (game && game.hintIds.includes(f.id)) {
        ctx.strokeStyle = C.mostaza; ctx.lineWidth = 6; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -clock * 40;
        ctx.beginPath(); ctx.arc(0, 0, f.r * 1.35, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
        const idx = game.hintIds.indexOf(f.id);
        if (game.step.type === 'exact') { ctx.fillStyle = C.mostaza; ctx.beginPath(); ctx.arc(f.r, -f.r, 14, 0, TAU); ctx.fill(); ctx.fillStyle = C.espresso; ctx.font = `900 16px ${MARCA.fuente}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(idx + 1), f.r, -f.r + 1); }
      }
      ctx.save(); ctx.rotate(f.rot); drawFruitBody(ctx, f.kind, f.r, clock); ctx.restore();
      drawBadge(ctx, f.op, f.r); // el número nunca gira: siempre legible
      ctx.restore();
    }
    if (game && game.decision) drawDecision(game.decision);
    // partículas
    for (const p of fx.particles) {
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
      ctx.fillStyle = p.color;
      if (p.shape === 'coin') { ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r * Math.abs(Math.sin(clock * 6 + p.x)), p.r, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#a07a1a'; ctx.lineWidth = 2; ctx.stroke(); }
      else if (p.shape === 'star') { drawStar(p.x, p.y, p.r * 1.4); }
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    for (const r of fx.rings) { ctx.strokeStyle = `rgba(255,224,102,${r.life * 2})`; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, TAU); ctx.stroke(); }
    drawBlade();
    // textos flotantes
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const t of fx.texts) {
      const a = clamp(t.life / t.max * 1.5, 0, 1);
      ctx.globalAlpha = a; ctx.font = `900 ${t.size}px ${MARCA.fuente}`;
      ctx.lineWidth = 5; ctx.strokeStyle = C.espresso; ctx.strokeText(t.text, t.x, t.y); ctx.fillStyle = t.color; ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
    if (fx.banner) drawBanner(fx.banner);
    ctx.restore();
    if (fx.flash > 0) { ctx.fillStyle = `rgba(255,240,200,${fx.flash})`; ctx.fillRect(0, 0, W, H); }
  }
  function drawDecision(dec) {
    const q = dec.d.question;
    const cy = clamp(lerp(layout.playTop, H, 0.3), layout.playTop + 40, H * 0.5);
    ctx.save();
    ctx.fillStyle = 'rgba(36,30,29,0.45)'; ctx.fillRect(0, 0, W, H); // atenúa el resto
    const fs = Math.min(W * 0.09, 46);
    ctx.font = `900 ${fs}px ${MARCA.fuente}`;
    const tw = ctx.measureText(q).width;
    const bw = Math.min(W * 0.94, tw + 48), bh = fs * 2.3;
    ctx.fillStyle = C.crema; ctx.strokeStyle = C.espresso; ctx.lineWidth = 4;
    roundRect(ctx, W / 2 - bw / 2, cy - bh / 2, bw, bh, 18); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.salviaOsc; ctx.font = `900 ${Math.max(11, fs * 0.3)}px ${MARCA.fuente}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(dec.d.kind === 'negpar' ? '🌱 ¿QUÉ HACE EL SIGNO DELANTE DEL PARÉNTESIS?' : '🌱 REGLA DE LOS SIGNOS: ELIGE EL RESULTADO', W / 2, cy - bh * 0.3);
    ctx.fillStyle = C.espresso; ctx.font = `900 ${fs}px ${MARCA.fuente}`;
    ctx.fillText(q, W / 2, cy + bh * 0.12);
    // tiempo restante
    const k = 1 - dec.t / dec.limit;
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; roundRect(ctx, W / 2 - bw / 2 + 14, cy + bh / 2 - 12, bw - 28, 6, 3); ctx.fill();
    ctx.fillStyle = k < 0.3 ? C.coral : C.salvia; roundRect(ctx, W / 2 - bw / 2 + 14, cy + bh / 2 - 12, (bw - 28) * clamp(k, 0, 1), 6, 3); ctx.fill();
    ctx.restore();
    // las semillas se vuelven a dibujar por encima del velo
    for (const sd of dec.seeds) {
      if (sd.cut || sd.gone) continue;
      ctx.save(); ctx.translate(sd.x, sd.y);
      if (game.hintIds.includes(sd.id)) { ctx.strokeStyle = C.mostaza; ctx.lineWidth = 6; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -clock * 40; ctx.beginPath(); ctx.arc(0, 0, sd.r * 1.3, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
      drawFruitBody(ctx, 'seed', sd.r, clock); drawBadge(ctx, sd.op, sd.r);
      ctx.restore();
    }
  }
  function drawStar(x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill();
  }
  function drawHalf(h) {
    const F = FRUITS[h.kind] || FRUITS.apple;
    ctx.save(); ctx.translate(h.x, h.y); ctx.globalAlpha = clamp(h.life, 0, 1);
    ctx.rotate(h.spin + h.ang); // el eje x queda a lo largo del corte
    // recorte por el plano del corte
    ctx.beginPath(); ctx.rect(-h.r * 2, h.side < 0 ? -h.r * 2 : 0, h.r * 4, h.r * 2); ctx.clip();
    ctx.save(); ctx.rotate(-h.ang + h.rot0); drawFruitBody(ctx, h.kind, h.r, clock); ctx.restore();
    // cara cortada (la pulpa)
    ctx.fillStyle = F.flesh; ctx.beginPath(); ctx.ellipse(0, 0, h.r * 0.86, h.r * 0.22, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.espresso; ctx.lineWidth = Math.max(2, h.r * 0.05); ctx.stroke();
    if (h.kind === 'kiwi' || h.kind === 'melon' || h.kind === 'strawberry') { ctx.fillStyle = '#2b2524'; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(i * h.r * 0.2, 0, h.r * 0.03, h.r * 0.06, 0, 0, TAU); ctx.fill(); } }
    ctx.restore(); ctx.globalAlpha = 1;
  }
  function drawBlade() {
    const pts = blade.pts;
    if (pts.length < 2) return;
    const sw = sword();
    const maxW = Math.max(8, R * 0.22);
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const k = i / (pts.length - 1);
        let col = pass === 0 ? sw.glow : sw.core;
        if (sw.glow === 'rainbow') col = pass === 0 ? `hsla(${(clock * 300 + i * 25) % 360},90%,60%,0.75)` : '#fff';
        ctx.strokeStyle = col; ctx.lineCap = 'round';
        ctx.lineWidth = (pass === 0 ? maxW * 2.2 : maxW) * (0.2 + k * 0.8);
        ctx.beginPath();
        if (sw.fx === 'spark' && pass === 1) { ctx.moveTo(a.x, a.y); ctx.lineTo((a.x + b.x) / 2 + (rng() - 0.5) * 10, (a.y + b.y) / 2 + (rng() - 0.5) * 10); ctx.lineTo(b.x, b.y); }
        else { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
        ctx.stroke();
      }
    }
    const tip = pts[pts.length - 1];
    if (blade.active && !reduce() && rng() < 0.6) {
      const map = { ember: ['#FF6A2B', '#FFE066'], snow: ['#EAFFFF', '#7fd8ff'], star: ['#F0E6FF', '#b07aff', '#fff'], spark: ['#FFE066', '#fff'], rainbow: ['#ff5e5e', '#ffd84a', '#7be495', '#5ec8ff'] };
      if (map[sw.fx]) addParticles(tip.x, tip.y, map[sw.fx], 1, 80, { size: sw.fx === 'star' ? 3 : 2.5, life: 0.45, g: sw.fx === 'ember' ? -200 : 80, shape: sw.fx === 'star' ? 'star' : null });
    }
  }
  function drawBanner(b) {
    const t = 1 - b.life / b.max;
    const s = t < 0.15 ? lerp(0.4, 1.12, t / 0.15) : t < 0.25 ? lerp(1.12, 1, (t - 0.15) / 0.1) : 1;
    const a = b.life < 0.3 ? b.life / 0.3 : 1;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, H * 0.48); ctx.scale(s, s);
    const size = Math.min(W * 0.11, 64) * (b.text.length > 18 ? 0.55 : b.text.length > 10 ? 0.75 : 1);
    ctx.font = `900 ${size}px ${MARCA.fuente}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = size * 0.22; ctx.strokeStyle = C.espresso; ctx.lineJoin = 'round';
    ctx.strokeText(b.text, 0, 0); ctx.fillStyle = b.color; ctx.fillText(b.text, 0, 0);
    if (b.sub) { ctx.font = `900 ${Math.max(15, size * 0.32)}px ${MARCA.fuente}`; ctx.lineWidth = 5; ctx.strokeText(b.sub, 0, size * 0.75); ctx.fillStyle = C.crema; ctx.fillText(b.sub, 0, size * 0.75); }
    ctx.restore();
  }

  /** Recta numérica del acumulador: el gran apoyo visual del modo objetivo exacto */
  function numberLineScale(vals) {
    const span = Math.max(10, ...vals.map((v) => Math.abs(v) + 2));
    const x0 = W * 0.07, x1 = W * 0.93;
    return { span, X: (v) => lerp(x0, x1, (v + span) / (2 * span)), x0, x1 };
  }
  function drawNumberLine() {
    const g = game, y = layout.lineY;
    const S = numberLineScale([g.A, g.T, g.Ashow, ...g.arrows.map((a) => a.from)]);
    g.lineSpan = lerp(g.lineSpan || S.span, S.span, 0.08);
    const span = g.lineSpan, x0 = S.x0, x1 = S.x1;
    const X = (v) => lerp(x0, x1, (v + span) / (2 * span));
    ctx.save();
    ctx.fillStyle = 'rgba(36,30,29,0.55)'; roundRect(ctx, x0 - 16, y - 22, x1 - x0 + 32, 44, 14); ctx.fill();
    ctx.strokeStyle = C.crema; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    const pxPerUnit = (x1 - x0) / (2 * span);
    const stepMinor = pxPerUnit >= 6 ? 1 : 5, stepLabel = pxPerUnit >= 26 ? 1 : pxPerUnit >= 12 ? 2 : pxPerUnit >= 5 ? 5 : 10;
    ctx.font = `700 11px ${MARCA.fuente}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = C.crema;
    for (let v = -Math.floor(span); v <= Math.floor(span); v++) {
      if (v % stepMinor) continue;
      const x = X(v), big = v % stepLabel === 0;
      ctx.strokeStyle = v === 0 ? C.mostaza : 'rgba(244,237,215,0.7)'; ctx.lineWidth = v === 0 ? 3 : 1.5;
      ctx.beginPath(); ctx.moveTo(x, y - (big ? 7 : 4)); ctx.lineTo(x, y + (big ? 7 : 4)); ctx.stroke();
      if (big) ctx.fillText(v === 0 ? '0' : E.fmt(v), x, y + 8);
    }
    // objetivo (bandera)
    const xt = X(g.T);
    ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xt, y); ctx.lineTo(xt, y - 20); ctx.stroke();
    ctx.fillStyle = C.coral; ctx.beginPath(); ctx.moveTo(xt, y - 20); ctx.lineTo(xt + 14, y - 15); ctx.lineTo(xt, y - 10); ctx.fill();
    // saltos (flechas en arco)
    for (const a of g.arrows) {
      const xa = X(a.from), xb = X(a.to), al = clamp(a.life / a.max * 2, 0, 1);
      const k = clamp((a.max - a.life) / 0.35, 0, 1);
      const xm = lerp(xa, xb, k);
      const hgt = Math.min(34, 10 + Math.abs(xb - xa) * 0.25);
      ctx.globalAlpha = al; ctx.strokeStyle = a.to >= a.from ? '#9fd6c0' : '#ff9f86'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(xa, y - 4);
      ctx.quadraticCurveTo((xa + xm) / 2, y - 4 - hgt * 1.6, xm, y - 4); ctx.stroke();
      if (k >= 1) {
        const dir = Math.sign(xb - xa) || 1;
        ctx.beginPath(); ctx.moveTo(xb, y - 4); ctx.lineTo(xb - dir * 8, y - 12); ctx.lineTo(xb - dir * 2, y - 14); ctx.closePath(); ctx.fillStyle = ctx.strokeStyle; ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    // acumulador (ficha)
    const xa = X(g.Ashow);
    ctx.fillStyle = C.salvia; ctx.strokeStyle = C.espresso; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(xa, y, 9, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  /** En las misiones: recta con la referencia (0, umbral, ±k…) */
  function drawMissionLine() {
    const m = game.mission, y = layout.lineY;
    const refs = m.id === 'lt' || m.id === 'gt' || m.id === 'exprEq' ? [m.k] : m.id === 'abs' ? [m.k, -m.k] : m.id === 'opp' ? m.list : [0];
    const span = Math.max(10, ...refs.map((v) => Math.abs(v) + 2));
    const x0 = W * 0.07, x1 = W * 0.93, X = (v) => lerp(x0, x1, (v + span) / (2 * span));
    ctx.save();
    ctx.fillStyle = 'rgba(36,30,29,0.55)'; roundRect(ctx, x0 - 16, y - 22, x1 - x0 + 32, 44, 14); ctx.fill();
    // zona "correcta" sombreada (comparaciones y signo)
    ctx.fillStyle = 'rgba(90,138,120,0.45)';
    if (m.id === 'neg') ctx.fillRect(x0, y - 6, X(0) - x0 - 4, 12);
    if (m.id === 'pos' || (m.id === 'exprSign' && m.wantPos)) ctx.fillRect(X(0) + 4, y - 6, x1 - X(0) - 4, 12);
    if (m.id === 'exprSign' && !m.wantPos) ctx.fillRect(x0, y - 6, X(0) - x0 - 4, 12);
    if (m.id === 'lt') ctx.fillRect(x0, y - 6, X(m.k) - x0 - 4, 12);
    if (m.id === 'gt') ctx.fillRect(X(m.k) + 4, y - 6, x1 - X(m.k) - 4, 12);
    ctx.strokeStyle = C.crema; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.font = `700 11px ${MARCA.fuente}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = C.crema;
    const stepL = span > 14 ? 5 : 2;
    for (let v = -span; v <= span; v++) { const x = X(v); ctx.strokeStyle = 'rgba(244,237,215,0.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4); ctx.stroke(); if (v % stepL === 0) ctx.fillText(v === 0 ? '0' : E.fmt(v), x, y + 8); }
    refs.forEach((v) => { const x = X(v); ctx.fillStyle = C.mostaza; ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x - 7, y - 18); ctx.lineTo(x + 7, y - 18); ctx.fill(); });
    if (m.id === 'abs') { ctx.strokeStyle = C.mostaza; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(-m.k), y - 12); ctx.lineTo(X(m.k), y - 12); ctx.stroke(); ctx.setLineDash([]); }
    ctx.restore();
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    try { update(dt); render(); } catch (err) { console.error(err); }
    requestAnimationFrame(loop);
  }

  /* =================================================================
     10. MARCADOR (HUD) Y πCHU
     ================================================================= */
  const hudCache = {};
  function setText(id, txt) { if (hudCache[id] !== txt) { hudCache[id] = txt; document.getElementById(id).textContent = txt; } }
  function setHTML(id, html) { if (hudCache[id] !== html) { hudCache[id] = html; document.getElementById(id).innerHTML = html; } }
  function updateHUD(force) {
    if (!game) return;
    if (force) for (const k in hudCache) delete hudCache[k];
    const g = game;
    setText('hScore', g.score.toLocaleString('es-ES'));
    setText('hMult', '×' + g.mult);
    const hearts = g.relaxed ? '<span title="Modo relajado">☮</span>' : Array.from({ length: g.maxLives }, (_, i) => `<span class="${i < g.lives ? '' : 'lost'}">❤</span>`).join('');
    setHTML('hLives', hearts);
    $('#hLives').setAttribute('aria-label', g.relaxed ? 'Modo relajado' : `Vidas: ${g.lives}`);
    if (g.step && g.step.type === 'exact') {
      setText('hGoalKicker', g.boss && g.boss.phases ? `OBJETIVO · ${g.boss.hp} ❤ DEL REY` : 'OBJETIVO EXACTO');
      setHTML('hGoal', `🎯 CONSIGUE <span class="num">${E.fmt(g.T)}</span>`);
      $('#hAccBox').classList.remove('hidden');
      setText('hAcc', E.fmt(g.A));
      $('#hAcc').className = g.A > 0 ? 'pos' : g.A < 0 ? 'neg' : '';
      setText('hEq', g.eqText);
      $('#bReset').classList.remove('hidden');
    } else if (g.mission) {
      setText('hGoalKicker', 'MISIÓN');
      setHTML('hGoal', '⚡ ' + g.mission.text);
      $('#hAccBox').classList.add('hidden');
      $('#bReset').classList.add('hidden');
    }
    // progreso
    let p = 0, txt = '';
    if (g.unitsTotal) { p = g.unitsDone / g.unitsTotal; txt = `${g.unitsDone}/${g.unitsTotal}`; }
    else if (g.step && g.step.n !== Infinity) { p = g.stepDone / g.step.n; txt = `${g.stepDone}/${g.step.n}`; }
    else { p = g.timeLeft !== Infinity ? 1 - g.timeLeft / g.setup.duration : 0; txt = `${g.stats.targets} 🎯`; }
    document.getElementById('hProg').style.width = (clamp(p, 0, 1) * 100).toFixed(1) + '%';
    setText('hProgTxt', txt);
    setText('hStreak', g.step && g.step.type === 'exact' ? `Racha ${g.streak}` : `Racha ${g.cutStreak}`);
    hudTick();
  }
  function hudTick() {
    const g = game; if (!g) return;
    let t;
    if (g.step && g.step.type === 'exact' && g.roundLimit !== Infinity) t = Math.ceil(g.roundTime);
    else if (g.timeLeft !== Infinity) t = Math.ceil(g.timeLeft);
    else if (g.mode === 'arcade') t = Math.floor(g.time);
    else t = g.levelTime !== Infinity ? Math.ceil(g.levelTime - g.time) : '∞';
    setText('hTime', String(t));
    const low = typeof t === 'number' && ((g.roundLimit !== Infinity && g.step.type === 'exact') || g.timeLeft !== Infinity) && t <= 5;
    $('#hTime').classList.toggle('low', !!low);
  }
  let sayTimer = null;
  function say(text, mood, ms) {
    const el = $('#pichuPop');
    $('#pichuSay').textContent = text;
    el.classList.remove('hidden', 'happy', 'oops'); void el.offsetWidth;
    if (mood) el.classList.add(mood);
    clearTimeout(sayTimer);
    sayTimer = setTimeout(() => el.classList.add('hidden'), ms || 2000);
  }
  let explainTimer = null;
  function showExplain(v, refs, why) {
    refs = refs.filter((r) => r !== v);
    const all = [v, ...refs];
    const lo = Math.min(...all) - 3, hi = Math.max(...all) + 3;
    const Wd = 360, X = (n) => 20 + ((n - lo) / (hi - lo)) * (Wd - 40);
    let svg = `<svg viewBox="0 0 ${Wd} 70" role="img" aria-label="Recta numérica"><line x1="10" y1="40" x2="${Wd - 10}" y2="40" stroke="#332B2A" stroke-width="3"/>`;
    for (let n = lo; n <= hi; n++) svg += `<line x1="${X(n)}" y1="35" x2="${X(n)}" y2="45" stroke="#332B2A" stroke-width="${n === 0 ? 3 : 1.5}"/>` + ((hi - lo) <= 16 || n % 2 === 0 ? `<text x="${X(n)}" y="62" font-size="11" text-anchor="middle" font-weight="700" fill="#332B2A">${E.fmt(n)}</text>` : '');
    refs.forEach((r) => { svg += `<circle cx="${X(r)}" cy="40" r="8" fill="#5A8A78" stroke="#332B2A" stroke-width="2"/><text x="${X(r)}" y="22" font-size="13" font-weight="900" text-anchor="middle" fill="#3F6E5C">${E.fmt(r)}</text>`; });
    svg += `<circle cx="${X(v)}" cy="40" r="8" fill="#E46D4D" stroke="#332B2A" stroke-width="2"/><text x="${X(v)}" y="22" font-size="13" font-weight="900" text-anchor="middle" fill="#A8402A">${E.fmt(v)} ✘</text></svg>`;
    const el = $('#explain');
    el.innerHTML = `<div>${why}</div>${svg}`;
    el.classList.remove('hidden');
    clearTimeout(explainTimer);
    explainTimer = setTimeout(() => el.classList.add('hidden'), 3200);
  }
  let toastTimer = null;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add('hidden'), 2600); }
  function unlock(id) {
    if (P().ach[id]) return;
    P().ach[id] = new Date().toISOString().slice(0, 10);
    const a = ACH.find((x) => x.id === id);
    if (a) toast(`🏆 Logro: ${a.i} ${a.n}`);
    persist();
  }

  /* ---------- Fin de partida ---------- */
  function levelComplete() {
    const g = game;
    if (g.boss && !g.boss.phases) {
      if (!g.boss.defeated) { g.boss.hp = 1; bossDamage(); }
      coinRain();
      g.fruits.forEach((f) => { if (!f.cut) f.fade = true; });
      g.queue = []; g.decision = null;
      g.over = true; g.ending = true;
      setTimeout(() => game === g && endGame(true, '¡Nivel superado!'), 1800);
      return;
    }
    endGame(true, '¡Nivel superado!');
  }
  function endGame(win, reason) {
    const g = game;
    if (!g || (g.over && !g.ending)) return;
    g.over = true; g.ending = false;
    blade.active = false; blade.pts = [];
    if (win && g.score > 0) unlock('first_target');
    if (g.score >= 1000) unlock('score1k');
    if (g.score >= 5000) unlock('score5k');
    // recompensas
    const coins = Math.floor(g.score / 25) + g.stats.gold;
    const xp = Math.floor(g.score / 10) + g.stats.targets * 5 + g.stats.correct * 2;
    P().coins += coins; P().xp += xp;
    let record = false, stars = 0;
    if (g.mode === 'classic' && !g.relaxed) { if (g.score > P().records.classic) { P().records.classic = g.score; record = true; } }
    if (g.mode === 'arcade' && !g.relaxed) { if (g.score > P().records.arcade) { P().records.arcade = g.score; record = true; } P().records.arcadeTime = Math.max(P().records.arcadeTime, Math.floor(g.time)); }
    if (g.mode === 'duel') {
      if (g.score > (P().records.duel || 0)) { P().records.duel = g.score; record = true; }
      const o = g.opts;
      g.duelCode = E.encodeDuel({ seed: g.seed, math: o.math || 0, decide: !!o.decide, score: g.score });
      const ch = o.challenge;
      g.duelResult = ch ? (g.score > ch.score ? 'win' : g.score < ch.score ? 'lose' : 'tie') : null;
      const hist = { fecha: new Date().toISOString().slice(0, 10), code: g.duelCode, score: g.score, rival: ch ? ch.from : o.rival || null, rivalScore: ch ? ch.score : null, result: g.duelResult };
      P().duels = [hist, ...(P().duels || [])].slice(0, 15);
      if (g.duelResult === 'win') unlock('duelwin');
      if (Online.cfg() && save.alias) {
        if (ch && ch.id) Online.enqueue({ action: 'duelResult', id: ch.id, alias: save.alias, score: g.score });
        else if (!ch && o.rival) Online.enqueue({ action: 'duel', from: save.alias, to: o.rival, code: g.duelCode, score: g.score });
      }
    }
    if (g.mode === 'adventure') {
      const L = g.level, prev = P().levels[L.id] || { stars: 0, best: 0 };
      if (win) {
        stars = g.relaxed ? 1 : E.starsFor(g.livesLost, g.fallos);
        if (L.id === 3) unlock('lvl3');
      }
      if (g.score > prev.best && win) record = prev.best > 0;
      P().levels[L.id] = { stars: Math.max(prev.stars, stars), best: Math.max(prev.best, win ? g.score : 0) };
      P().records.adventure = Object.values(P().levels).reduce((a, l) => a + l.best, 0);
    }
    // estadística anónima local (sin datos personales)
    save.stats.push({
      fecha: new Date().toISOString().slice(0, 16).replace('T', ' '), alias: save.alias || 'Invitado', modo: g.mode + (g.relaxed ? '-relajado' : '') + (g.mode !== 'adventure' && save.teacher.on ? '-docente' : ''),
      nivel: g.level ? g.level.id : '', duracion_s: Math.round(g.time), puntos: g.score, objetivos: g.stats.targets, cortes_correctos: g.stats.correct,
      errores_signo: g.stats.signErrors, decisiones_correctas: g.stats.decOk, decisiones_fallidas: g.stats.decErr, fallos_menos_parentesis: g.stats.decErrKinds.negpar || 0, fallos_multiplicar: g.stats.decErrKinds.mul || 0, fallos_dividir: g.stats.decErrKinds.div || 0, bombas: g.stats.bombs, combos: g.stats.combos, ayudas: g.stats.hints, divisiones_no_exactas: g.stats.noExact, resultado: win ? 'superado' : 'no superado',
    });
    if (save.stats.length > 500) save.stats = save.stats.slice(-500);
    // ranking de la clase (si está conectado y no es modo relajado)
    g.rankPos = null;
    if (Online.cfg() && save.alias && !g.relaxed && (g.mode !== 'adventure' || win)) {
      Online.enqueue({ action: 'score', alias: save.alias, mode: g.mode, level: g.level ? g.level.id : '', score: g.score, targets: g.stats.targets, decOk: g.stats.decOk, decErr: g.stats.decErr, stars }, (r) => { if (r && r.puesto) { g.rankPos = r.puesto; const el = $('#rRank'); if (el && game === g) { el.textContent = `🏆 Puesto ${r.puesto} en el ranking de la clase`; el.classList.remove('hidden'); } } });
    }
    persist();
    // pantalla de resultados
    setTimeout(() => {
      showResults(win, reason, { coins, xp, record, stars });
      win ? sfx.win() : sfx.lose();
    }, 700);
    setMusic('menu');
  }

  function showResults(win, reason, info) {
    const g = game;
    const panel = $('#sResult .panel');
    panel.classList.toggle('win', win); panel.classList.toggle('lose', !win);
    $('#rKicker').textContent = g.mode === 'adventure' ? `NIVEL ${g.level.id} · ${g.level.name.toUpperCase()}` : g.mode === 'arcade' ? 'MODO ARCADE' : g.mode === 'duel' ? 'RETO ENTRE COMPAÑEROS' : 'MODO CLÁSICO';
    $('#rTitle').textContent = g.mode === 'duel' && g.duelResult ? (g.duelResult === 'win' ? '¡Reto superado!' : g.duelResult === 'tie' ? '¡Empate!' : 'Reto no superado') : reason;
    $('#rRank').classList.add('hidden');
    renderDuelBox(g);
    $('#rTrophy').classList.toggle('hidden', !(g.boss && win));
    $('#rStars').innerHTML = g.mode === 'adventure' && win ? [1, 2, 3].map((i) => `<span class="${i <= info.stars ? '' : 'off'}">★</span>`).join('') : '';
    $('#rScore').textContent = g.score.toLocaleString('es-ES');
    $('#rRecord').classList.toggle('hidden', !info.record);
    const cells = [
      [g.stats.targets, 'objetivos'], [g.mode === 'duel' ? g.stats.combos : g.stats.correct, g.mode === 'duel' ? 'combos' : 'cortes correctos'], [g.mode === 'arcade' ? g.stats.rivals : '×' + g.bestMult, g.mode === 'arcade' ? 'rivales derrotados' : 'mejor multiplicador'],
      [g.stats.decOk + '/' + (g.stats.decOk + g.stats.decErr), 'decisiones 🌱'], [g.stats.signErrors + g.stats.decErr, 'errores'], [g.stats.bombs, 'bombas'],
      ['+' + info.coins + ' 🪙', 'monedas'], ['+' + info.xp, 'experiencia'], [g.mode === 'arcade' ? Math.floor(g.time) + ' s' : g.stats.hints, g.mode === 'arcade' ? 'aguantados' : 'pistas'],
    ];
    $('#rGrid').innerHTML = cells.map(([b, s]) => `<div><b>${b}</b><small>${s}</small></div>`).join('');
    // consejo de aprendizaje según los errores
    let tip = '';
    const dk = g.stats.decErrKinds;
    if ((dk.negpar || 0) >= 2) tip = '➖ <b>El signo delante del paréntesis:</b> un − CAMBIA el signo de dentro y un + lo deja igual. −(−4) = +4 · −(+4) = −4 · +(−4) = −4.';
    else if ((dk.mul || 0) + (dk.div || 0) >= 2) tip = '✖️ <b>Regla de los signos:</b> mira solo los signos. Iguales → positivo: (−)·(−) = +. Distintos → negativo: (+)·(−) = −. Para dividir, la misma regla.';
    else if (g.stats.signErrors >= 3) tip = '📏 <b>Repasa la recta numérica:</b> los negativos están a la izquierda del 0, y cuanto más a la izquierda, menor es el número (−7 &lt; −2).';
    else if (g.stats.noExact >= 2) tip = '➗ <b>División exacta:</b> solo se puede si el resto es 0. Por ejemplo, (−12):(+3) = −4, pero (+7):(+2) no da un entero.';
    else if (g.stats.bombs >= 2) tip = '💣 <b>Consejo:</b> antes de deslizar, busca las bombas (llevan un anillo discontinuo y una calavera).';
    else if (g.stats.targets > 0 && g.stats.combos === 0) tip = '✨ <b>Reto:</b> intenta cortar dos opuestos (como +6 y −6) en un mismo gesto: ¡COMBO CERO!';
    else if (g.stats.targets > 0 || g.stats.correct > 0) tip = '🌟 <b>¡Muy bien!</b> Si te resulta fácil, sube la dificultad matemática en Ajustes.';
    $('#rLearn').innerHTML = tip;
    currentCert = buildCert(win, info);
    $('#bCert').classList.toggle('hidden', !currentCert.ok);
    $('#rCertNote').classList.toggle('hidden', currentCert.ok);
    const nextLevel = g.mode === 'adventure' && win && LEVELS.find((l) => l.id === g.level.id + 1);
    $('#bNext').classList.toggle('hidden', !nextLevel);
    $('#hud').classList.add('hidden');
    $('#pichuPop').classList.add('hidden');
    showScreen('sResult', false);
    setTimeout(() => $(currentCert.ok ? '#bCert' : '#bAgain').focus(), 50);
    if (win) coinRain();
  }

  /* =================================================================
     11. PANTALLAS Y MENÚS
     ================================================================= */
  const screenStack = [];
  function showScreen(id, push) {
    $$('.screen').forEach((s) => s.classList.add('hidden'));
    if (id) {
      const el = document.getElementById(id);
      el.classList.remove('hidden');
      if (push !== false) screenStack.push(id);
      el.scrollTop = 0;
      const f = el.querySelector('button, select, input');
      if (f && !('ontouchstart' in window)) setTimeout(() => f.focus({ preventScroll: true }), 30);
    }
  }
  function back() {
    screenStack.pop();
    const prev = screenStack.pop() || 'sMenu';
    openScreen(prev);
  }
  function openScreen(id) {
    const map = { sRetos: renderRetos, sMenu: renderMenu, sLevels: renderLevels, sCustom: renderCustom, sAchievements: renderAchievements, sSettings: renderSettings, sTeacher: renderTeacher, sHowto: renderHowto };
    if (map[id]) map[id]();
    if (id === 'sMenu') screenStack.length = 0;
    showScreen(id);
  }
  function goMenu() {
    game = null; attract = [];
    $('#hud').classList.add('hidden'); $('#pichuPop').classList.add('hidden'); $('#explain').classList.add('hidden');
    setMusic('menu');
    openScreen('sMenu');
  }

  function renderMenu() {
    const best = Math.max(P().records.classic, P().records.arcade);
    $('#menuStats').innerHTML = `🪙 ${P().coins} · Nivel ${playerLevel()} · Récord ${best.toLocaleString('es-ES')}`;
    if (Online.cfg() && save.alias) { Online.flush(); Online.get({ action: 'duels', alias: save.alias }).then((d) => updateBadge(d.incoming.length)).catch(() => {}); }
    $('#menuAlias').innerHTML = save.alias ? `👤 Jugando como <b>${save.alias.replace(/</g, '&lt;')}</b> · <u>cambiar</u>` : '👤 Elegir alias';
  }
  function renderLevels() {
    const box = $('#levelsList');
    box.innerHTML = '';
    LEVELS.forEach((L) => {
      const st = P().levels[L.id];
      const unlocked = L.id === 1 || (P().levels[L.id - 1] && P().levels[L.id - 1].stars > 0);
      const b = document.createElement('button');
      b.className = 'level' + (L.boss ? ' boss' : '');
      b.disabled = !unlocked;
      b.innerHTML = `<span class="n">${unlocked ? L.id : '🔒'}</span><span class="t"><b>${L.icon} ${L.name}</b><small>${L.blurb}${L.guardian ? ' · Guardián: ' + ENEMIES[L.guardian].name : ''}</small></span>${L.guardian && ASSETS[L.guardian] ? `<img class="lv-enemy" alt="" src="${ASSETS[L.guardian]}">` : ''}<span class="s">${[1, 2, 3].map((i) => (st && st.stars >= i ? '★' : '☆')).join('')}${st && st.stars > 0 ? '<em class="superado">✔ SUPERADO</em>' : ''}</span>`;
      b.setAttribute('aria-label', `Nivel ${L.id}: ${L.name}. ${unlocked ? (st && st.stars > 0 ? 'Superado, ' + st.stars + ' de 3 estrellas' : 'Sin superar') : 'Bloqueado'}`);
      b.onclick = () => openIntro(L.id);
      box.appendChild(b);
    });
  }
  let introLevel = 1;
  function openIntro(id) {
    const L = LEVELS.find((l) => l.id === id);
    introLevel = id;
    $('#introKicker').textContent = L.boss ? 'JEFE FINAL' : 'NIVEL ' + L.id;
    $('#introTitle').textContent = L.icon + ' ' + L.name;
    $('#introSay').textContent = L.say;
    $('#introBody').innerHTML = L.body;
    const en = L.guardian && ENEMIES[L.guardian];
    $('#introEnemy').classList.toggle('hidden', !en);
    if (en) { $('#introEnemyImg').src = ASSETS[L.guardian] || ''; $('#introEnemyName').textContent = en.name; $('#introEnemySay').textContent = '«' + en.intro + '»'; }
    showScreen('sIntro');
  }
  function renderHowto() {
    const ul = $('#specialsList');
    if (ul.childElementCount) return;
    ['neg', 'abs', 'mul', 'div', 'dbl', 'blast', 'gold', 'bomb'].forEach((k) => {
      const info = SPECIAL_INFO[k];
      const li = document.createElement('li');
      const cv = document.createElement('canvas'); const s = 56; cv.width = s * 2; cv.height = s * 2; cv.style.width = cv.style.height = s + 'px';
      const c = cv.getContext('2d'); c.scale(2, 2); c.translate(s / 2, s / 2 + 3);
      drawFruitBody(c, info.kind, s * 0.33, 0);
      li.appendChild(cv);
      const d = document.createElement('div'); d.innerHTML = `<b>${info.name}</b><br><small>${info.desc}</small>`;
      li.appendChild(d); ul.appendChild(li);
    });
  }
  function renderCustom() {
    $('#cCoins').textContent = P().coins; $('#cLevel').textContent = playerLevel();
    const mk = (list, owned, current, kind) => {
      const box = $(kind === 'sword' ? '#shopSwords' : '#shopBgs');
      box.innerHTML = '';
      list.forEach((it) => {
        const has = owned.includes(it.id), on = current === it.id;
        const b = document.createElement('button');
        b.className = 'item' + (on ? ' on' : '') + (has ? '' : ' locked');
        const cv = document.createElement('canvas'); cv.width = 280; cv.height = 108;
        b.appendChild(cv);
        b.insertAdjacentHTML('beforeend', `<b>${it.icon ? it.icon + ' ' : ''}${it.name}</b><small>${on ? '✔ Equipada' : has ? 'Usar' : '🪙 ' + it.cost}</small>`);
        b.onclick = () => {
          if (!has) {
            if (P().coins < it.cost) { toast(`Te faltan ${it.cost - P().coins} monedas`); sfx.error(); return; }
            P().coins -= it.cost; owned.push(it.id); sfx.coin(); toast('¡Desbloqueado! ' + it.name);
            if (P().swords.length >= 3) unlock('collector');
          }
          if (kind === 'sword') P().sword = it.id; else { P().bg = it.id; buildBackground(); }
          persist(); sfx.click(); renderCustom();
        };
        box.appendChild(b);
        previewItem(cv, it, kind);
      });
    };
    mk(SWORDS, P().swords, P().sword, 'sword');
    mk(BGS, P().bgs, P().bg, 'bg');
  }
  function previewItem(cv, it, kind) {
    const c = cv.getContext('2d');
    if (kind === 'bg') {
      const old = P().bg; P().bg = it.id;
      const keepW = W, keepH = H; const sv = bgCanvas;
      W = 280; H = 108; buildBackground(); c.drawImage(bgCanvas, 0, 0, 280, 108);
      W = keepW; H = keepH; P().bg = old; bgCanvas = sv;
      return;
    }
    c.fillStyle = '#2b2524'; c.fillRect(0, 0, 280, 108);
    for (let pass = 0; pass < 2; pass++) for (let i = 1; i < 30; i++) {
      const x0 = 20 + (i - 1) * 8.5, x1 = 20 + i * 8.5, y0 = 80 - Math.sin((i - 1) / 9) * 50, y1 = 80 - Math.sin(i / 9) * 50;
      c.strokeStyle = it.glow === 'rainbow' ? (pass ? '#fff' : `hsl(${i * 12},90%,60%)`) : pass ? it.core : it.glow;
      c.lineWidth = (pass ? 5 : 13) * (i / 30); c.lineCap = 'round';
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    }
  }
  function renderAchievements() {
    const r = P().records;
    $('#recordsBox').innerHTML = `<div>Clásico<b>${r.classic.toLocaleString('es-ES')}</b></div><div>Arcade<b>${r.arcade.toLocaleString('es-ES')}</b></div><div>Arcade (tiempo)<b>${r.arcadeTime} s</b></div><div>Aventura<b>${Object.values(P().levels).reduce((a, l) => a + l.stars, 0)}★</b></div>`;
    $('#achList').innerHTML = ACH.map((a) => `<div class="ach ${P().ach[a.id] ? '' : 'off'}"><span class="i">${a.i}</span><span><b>${a.n}</b><small>${a.d}</small></span></div>`).join('') +
      `<p class="muted" style="grid-column:1/-1">Conseguidos: ${Object.keys(P().ach).length} de ${ACH.length}</p>`;
  }
  function renderSettings() {
    const s = save.settings;
    $('#optSound').checked = s.sound; $('#optMusic').checked = s.music; $('#optReduce').checked = s.reduce;
    $('#optTap').checked = s.tap; $('#optRelax').checked = s.relax;
    $('#optMath').value = String(s.math); $('#optMotor').value = String(s.motor);
    $('#optDecide').checked = s.decide !== false;
  }
  function readSettings() {
    const s = save.settings;
    s.sound = $('#optSound').checked; s.music = $('#optMusic').checked; s.reduce = $('#optReduce').checked;
    s.tap = $('#optTap').checked; s.relax = $('#optRelax').checked;
    s.math = +$('#optMath').value; s.motor = +$('#optMotor').value; s.decide = $('#optDecide').checked;
    applyReduce(); persist();
    if (!s.music) Sound.stopMusic(); else Sound.music(wantedMusic);
  }
  function applyReduce() { document.documentElement.classList.toggle('reduce-motion', !!save.settings.reduce); }
  function renderTeacher() {
    const t = save.teacher;
    $('#tOn').checked = t.on; $('#tAdd').checked = t.add; $('#tSub').checked = t.sub; $('#tMul').checked = t.mul; $('#tDiv').checked = t.div;
    $('#tExact').checked = t.exact; $('#tFilter').checked = t.filter; $('#tSpecials').checked = t.specials; $('#tBombs').checked = t.bombs; $('#tHints').checked = t.hints; $('#tDecide').checked = t.decide !== false; $('#tGroup').value = t.group || '';
    $('#tOnUrl').value = save.online ? 'https://script.google.com/macros/s/' + save.online.u + '/exec' : '';
    $('#tOnKey').value = save.online ? save.online.k : '';
    $('#tOnLink').value = classLink();
    $('#onOut').textContent = save.online ? '✔ Ranking en vivo configurado en este dispositivo.' : ''; $('#onOut').className = 'verify-out ok';
    $('#tMin').value = t.min; $('#tMax').value = t.max; $('#tSpeed').value = String(t.speed); $('#tDur').value = String(t.dur); $('#tDiff').value = String(t.diff);
    renderStats();
  }
  function readTeacher() {
    const t = save.teacher;
    t.on = $('#tOn').checked; t.add = $('#tAdd').checked; t.sub = $('#tSub').checked; t.mul = $('#tMul').checked; t.div = $('#tDiv').checked;
    if (!t.add && !t.sub) { t.add = true; toast('Hace falta al menos la suma o la resta: se ha activado la suma'); }
    t.exact = $('#tExact').checked; t.filter = $('#tFilter').checked;
    if (!t.exact && !t.filter) { t.exact = true; toast('Se ha activado “Objetivo exacto” (hace falta al menos un contenido)'); }
    t.specials = $('#tSpecials').checked; t.bombs = $('#tBombs').checked; t.hints = $('#tHints').checked; t.decide = $('#tDecide').checked; t.group = $('#tGroup').value.trim().slice(0, 30);
    t.min = clamp(Math.round(+$('#tMin').value || -20), -50, -1); t.max = clamp(Math.round(+$('#tMax').value || 20), 1, 50);
    t.speed = +$('#tSpeed').value; t.dur = +$('#tDur').value; t.diff = +$('#tDiff').value;
    persist();
  }
  function renderStats() {
    const st = save.stats;
    if (!st.length) { $('#statsBox').innerHTML = 'Todavía no hay partidas registradas.'; return; }
    const n = st.length, sum = (k) => st.reduce((a, x) => a + (+x[k] || 0), 0);
    const last = st.slice(-8).reverse();
    $('#statsBox').innerHTML = `<p><b>${n}</b> partidas · <b>${sum('objetivos')}</b> objetivos exactos · <b>${sum('cortes_correctos')}</b> cortes correctos · <b>${sum('errores_signo')}</b> errores de signo/comparación · <b>${sum('divisiones_no_exactas')}</b> divisiones no exactas · <b>${sum('ayudas')}</b> pistas</p>` +
      `<table><tr><th>Fecha</th><th>Modo</th><th>Pts</th><th>🎯</th><th>✘</th></tr>${last.map((x) => `<tr><td>${x.fecha}</td><td>${x.modo}${x.nivel ? ' ' + x.nivel : ''}</td><td>${x.puntos}</td><td>${x.objetivos}</td><td>${x.errores_signo}</td></tr>`).join('')}</table>`;
  }
  function buildCSV() {
    if (!save.stats.length) return '';
    const cols = Object.keys(save.stats[0]);
    const esc = (v) => { const s = String(v == null ? '' : v); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    return cols.join(';') + '\n' + save.stats.map((r) => cols.map((c) => esc(r[c])).join(';')).join('\n');
  }
  /** Guarda un archivo: en el visor de Claude con su sistema de descargas; fuera, con un enlace normal */
  function saveFile(filename, data, mime) {
    if (window.claude && window.claude.use) {
      return window.claude.use('downloads').then((dl) => {
        if (!dl) { toast('Descarga no disponible aquí'); return false; }
        return dl.save({ filename, data }).then(() => { toast('Archivo guardado'); return true; }, () => { toast('Descarga cancelada'); return false; });
      }).catch(() => { toast('Descarga no disponible aquí'); return false; });
    }
    const blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'application/octet-stream' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
    toast('Archivo descargado');
    return Promise.resolve(true);
  }
  function exportCSV() {
    if (!save.stats.length) return toast('No hay datos que exportar');
    saveFile('integer-ninja-estadisticas.csv', '﻿' + buildCSV(), 'text/csv;charset=utf-8');
  }

  /* =================================================================
     13. RANKING EN VIVO Y RETOS DE CLASE (Apps Script del profesor)
     Solo viajan: clave de clase, grupo, alias y números de la partida.
     Dentro de claude.ai no hay conexión (el visor la bloquea); funciona
     cuando el juego se publica en GitHub Pages, Netlify, etc.
     ================================================================= */
  const APPS_SCRIPT_CODE = /*{{APPS_SCRIPT}}*/'';
  const Online = (function () {
    let flushing = false;
    const cfg = () => (save.online && save.online.u && save.online.k ? save.online : null);
    const base = (c) => 'https://script.google.com/macros/s/' + c.u + '/exec';
    function timed(p, ms) { return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('tiempo agotado')), ms))]); }
    async function get(params, c) {
      c = c || cfg(); if (!c) throw new Error('sin configurar');
      const q = new URLSearchParams(Object.assign({ key: c.k, group: c.g || '' }, params));
      const r = await timed(fetch(base(c) + '?' + q.toString()), 9000);
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'error');
      return j;
    }
    async function post(body, c) {
      c = c || cfg(); if (!c) throw new Error('sin configurar');
      // text/plain evita la petición previa CORS, que Apps Script no admite
      const r = await timed(fetch(base(c), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ key: c.k, group: c.g || '' }, body)) }), 9000);
      const j = await r.json();
      if (!j.ok && j.error === 'clave') throw new Error('clave');
      return j;
    }
    const callbacks = new Map();
    /** Encola un envío (si no hay red, se reintenta en la próxima partida) */
    function enqueue(body, cb) {
      body._id = Date.now() + '-' + Math.random().toString(36).slice(2, 7);
      if (cb) callbacks.set(body._id, cb);
      save.onlineQueue = (save.onlineQueue || []).concat([body]).slice(-60);
      persist(); flush();
    }
    async function flush() {
      if (!cfg() || flushing) return;
      flushing = true;
      try {
        while ((save.onlineQueue || []).length) {
          const item = save.onlineQueue[0];
          let res;
          try { res = await post(item); } catch (e) { break; } // sin red: se queda en la cola
          save.onlineQueue.shift(); persist();
          const cb = callbacks.get(item._id); if (cb) { callbacks.delete(item._id); try { cb(res); } catch (e) { /* */ } }
        }
      } finally { flushing = false; }
    }
    return { cfg, get, post, enqueue, flush };
  })();
  function parseScriptId(text) {
    const t = String(text || '').trim();
    const m = t.match(/\/macros\/s\/([A-Za-z0-9_-]{20,})/);
    if (m) return m[1];
    return /^[A-Za-z0-9_-]{20,}$/.test(t) ? t : null;
  }
  const b64u = (str) => btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64u = (str) => decodeURIComponent(escape(atob(str.replace(/-/g, '+').replace(/_/g, '/'))));
  function classLink() {
    const c = save.online; if (!c) return '';
    const base = location.protocol.startsWith('http') ? location.origin + location.pathname : 'https://TU-WEB/integer-ninja/';
    return base + '?clase=' + b64u(JSON.stringify({ u: c.u, k: c.k, g: c.g || '' }));
  }
  // ¿Se ha abierto con el enlace de clase del profesor?
  (function readClassLink() {
    try {
      const qs = new URLSearchParams(location.search);
      const raw = qs.get('clase') || (location.hash.match(/clase=([A-Za-z0-9_-]+)/) || [])[1];
      if (!raw) return;
      const c = JSON.parse(unb64u(raw));
      if (c && parseScriptId(c.u) && c.k) {
        save.online = { u: parseScriptId(c.u), k: String(c.k).slice(0, 60), g: String(c.g || '').slice(0, 30) };
        if (c.g) save.teacher.group = save.teacher.group || c.g;
        persist();
        setTimeout(() => toast('Conectado a la clase ' + (c.g || '') + ' ✔'), 600);
      }
    } catch (e) { /* enlace dañado */ }
  })();

  /* ---------- Pantalla de retos y ranking ---------- */
  let rankMode = 'classic', retosTab = 'retos', pendingDuel = null;
  function renderRetos() {
    $$('.tabs [data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === retosTab));
    $('#paneRetos').classList.toggle('hidden', retosTab !== 'retos');
    $('#paneRank').classList.toggle('hidden', retosTab !== 'rank');
    const on = !!Online.cfg();
    $('#onlineStatus').innerHTML = on ? `🟢 Conectado a la clase <b>${esc(save.online.g || '')}</b> como <b>${esc(save.alias || 'Invitado')}</b>` : '⚪ Sin ranking en vivo: los retos funcionan con códigos. (Tu profe puede activar el ranking de la clase).';
    $('#inboxBox').classList.toggle('hidden', !on);
    $('#rivalRow').classList.toggle('hidden', !on);
    $('#duelMath').value = String(save.settings.math || 0);
    $('#duelInfo').textContent = ''; pendingDuel = null; $('#bDuelAccept').textContent = 'Comprobar código';
    renderDuelHistory();
    if (retosTab === 'retos' && on) loadInbox();
    if (retosTab === 'rank') loadRanking();
  }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function renderDuelHistory() {
    const h = P().duels || [];
    $('#duelHistory').innerHTML = h.length ? h.map((d) => `<li><span class="mono">${d.code}</span> · ${d.score} pts${d.rival ? ` · vs ${esc(d.rival)}${d.rivalScore != null ? ' (' + d.rivalScore + ')' : ''}` : ''} ${d.result === 'win' ? '🏆' : d.result === 'lose' ? '❌' : d.result === 'tie' ? '🤝' : '📤'}</li>`).join('') : '<li class="muted">Todavía no has jugado ningún reto.</li>';
  }
  async function loadInbox() {
    const box = $('#inbox');
    box.innerHTML = '<p class="muted">Buscando retos…</p>';
    try {
      const [d, pl] = await Promise.all([Online.get({ action: 'duels', alias: save.alias || '' }), Online.get({ action: 'players' }).catch(() => ({ aliases: [] }))]);
      $('#rivalList').innerHTML = (pl.aliases || []).filter((a) => aliasKey(a) !== aliasKey(save.alias)).map((a) => `<option value="${esc(a)}">`).join('');
      const items = d.incoming.map((r) => `<div class="inbox-item"><div><b>${esc(r.from)}</b> te reta: supera <b>${r.score.toLocaleString('es-ES')}</b> puntos <span class="mono">${r.code}</span></div><button class="btn primary" data-accept="${esc(r.id)}" data-code="${esc(r.code)}" data-from="${esc(r.from)}">⚔️ Aceptar</button></div>`);
      const hist = d.history.slice(-5).reverse().map((r) => `<div class="inbox-done">${esc(r.from)} (${r.score}) vs ${esc(r.to)} (${r.reply}) → ${r.winner === 'empate' ? '🤝 empate' : '🏆 ' + esc(r.winner)}</div>`);
      box.innerHTML = (items.length ? items.join('') : '<p class="muted">No tienes retos pendientes.</p>') + (hist.length ? '<h4>Últimos resultados</h4>' + hist.join('') : '');
      updateBadge(d.incoming.length);
    } catch (e) {
      box.innerHTML = `<p class="muted">No se pudo conectar con el ranking (${esc(e.message)}). Puedes usar los códigos de reto.</p>`;
    }
  }
  function updateBadge(n) { const b = $('#retosBadge'); b.textContent = n; b.classList.toggle('hidden', !n); }
  function localRanking(mode) {
    return Object.values(save.profiles).map((pr) => ({
      alias: pr.name, score: mode === 'adventure' ? Object.values(pr.levels || {}).reduce((a, l) => a + (l.best || 0), 0) : (pr.records || {})[mode] || 0,
      stars: Object.values(pr.levels || {}).reduce((a, l) => a + (l.stars || 0), 0),
    })).filter((r) => r.score > 0 || r.stars > 0).sort((a, b) => (mode === 'adventure' ? (b.stars - a.stars) || (b.score - a.score) : b.score - a.score)).slice(0, 10);
  }
  async function loadRanking() {
    $$('.seg [data-rk]').forEach((b) => b.classList.toggle('on', b.dataset.rk === rankMode));
    const list = $('#rankList'), src = $('#rankSource');
    const draw = (rows) => {
      list.innerHTML = rows.length ? rows.map((r, i) => `<li class="${aliasKey(r.alias) === aliasKey(save.alias) ? 'me' : ''}"><span class="pos">${['🥇', '🥈', '🥉'][i] || i + 1}</span><span class="who">${esc(r.alias)}</span><span class="pts">${rankMode === 'adventure' ? r.stars + '★ · ' : ''}${(r.score || 0).toLocaleString('es-ES')}</span></li>`).join('') : '<li class="muted">Todavía no hay puntuaciones en este modo.</li>';
    };
    if (Online.cfg()) {
      src.textContent = 'Cargando el ranking de la clase…';
      try { const j = await Online.get({ action: 'top', mode: rankMode, limit: 15 }); src.innerHTML = `🟢 Ranking en vivo · ${esc(save.online.g || 'clase')} · ${j.total} jugadores`; draw(j.rows); return; }
      catch (e) { src.textContent = 'Sin conexión: se muestra el ranking de este dispositivo.'; }
    } else src.textContent = 'Ranking de este dispositivo (todos los alias que han jugado aquí).';
    draw(localRanking(rankMode));
  }
  function startDuel(opts) {
    askAliasIfNeeded(() => newGame('duel', null, opts));
  }
  function askAliasIfNeeded(then) { if (save.alias) then(); else askAlias(then); }
  function renderDuelBox(g) {
    const box = $('#rDuel');
    if (g.mode !== 'duel') { box.classList.add('hidden'); return; }
    const ch = g.opts.challenge;
    const share = `Reto INTEGER NINJA de ${save.alias || 'un ninja'}: ${g.duelCode} — supera mis ${g.score} puntos`;
    box.dataset.share = share;
    let head = '';
    if (ch) head = `<p class="duel-vs"><b>${esc(save.alias || 'Tú')}</b> ${g.score} · <b>${esc(ch.from || 'Rival')}</b> ${ch.score} → ${g.duelResult === 'win' ? '🏆 ¡Ganas tú!' : g.duelResult === 'tie' ? '🤝 Empate' : '😤 Gana ' + esc(ch.from || 'tu rival')}</p>`;
    const sentTo = !ch && g.opts.rival ? `<p class="muted">📨 Reto enviado a <b>${esc(g.opts.rival)}</b>: lo verá en su bandeja de retos.</p>` : '';
    box.innerHTML = head + sentTo + `<p>${ch ? '¿Revancha? Pasa tu código:' : 'Pasa este código a un compañero para que juegue la misma partida:'}</p><div class="duel-code">${g.duelCode}</div><div class="row"><button class="btn" id="bDuelCopy">📋 Copiar reto</button><button class="btn hidden" id="bDuelShare">📤 Compartir</button></div>`;
    box.classList.remove('hidden');
    $('#bDuelCopy').onclick = () => { try { navigator.clipboard.writeText(share).then(() => toast('Reto copiado: pégalo en Classroom o pásaselo a tu compañero'), () => toast('Copia el código: ' + g.duelCode)); } catch (e) { toast('Código: ' + g.duelCode); } };
    if (navigator.share) { $('#bDuelShare').classList.remove('hidden'); $('#bDuelShare').onclick = () => navigator.share({ title: 'Reto INTEGER NINJA', text: share }).catch(() => {}); }
  }

  /* =================================================================
     12. ALIAS Y JUSTIFICANTE PARA CLASSROOM
     ================================================================= */
  const ALIAS_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 _.\-]{2,20}$/;
  let aliasThen = null;
  /** Pide el alias antes de jugar (viene escrito el último usado) */
  function askAlias(then) {
    aliasThen = then;
    $('#aliasInput').value = save.alias || '';
    $('#aliasError').textContent = '';
    const chips = $('#aliasChips');
    chips.innerHTML = '';
    (save.aliases || []).slice(0, 10).forEach((a) => {
      const b = document.createElement('button');
      b.className = 'chip'; b.type = 'button'; b.textContent = '👤 ' + a;
      b.onclick = () => { $('#aliasInput').value = a; confirmAlias(); };
      chips.appendChild(b);
    });
    showScreen('sAlias', false);
    setTimeout(() => { const el = $('#aliasInput'); el.focus(); el.select(); }, 60);
  }
  function confirmAlias() {
    const a = $('#aliasInput').value.trim().replace(/\s+/g, ' ');
    if (!ALIAS_RE.test(a)) { $('#aliasError').textContent = 'Escribe de 2 a 20 letras o números (sin símbolos raros).'; sfx.error(); return; }
    const isNew = !save.profiles[aliasKey(a)];
    save.alias = a;
    save.aliases = [a, ...(save.aliases || []).filter((x) => aliasKey(x) !== aliasKey(a))].slice(0, 12);
    if (isNew && save.legacy) { save.profiles[aliasKey(a)] = Object.assign(save.legacy, { name: a }); delete save.legacy; toast('Tu progreso anterior se ha guardado en «' + a + '»'); }
    P(); persist(); buildBackground(); sfx.click();
    const t = aliasThen; aliasThen = null;
    if (t) t();
  }

  /* Código de verificación: resumen (FNV-1a) del texto del justificante.
     Si alguien cambia una cifra, el código ya no coincide. Disuade de editar
     el justificante; no es una firma criptográfica. */
  const CERT_SALT = 'πCHU·IntegerNinja·2026';
  function certCode(lines) {
    let h = 0x811c9dc5;
    const str = lines.join('\n') + CERT_SALT;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    const c = h.toString(36).toUpperCase().padStart(7, '0').slice(-6);
    return c.slice(0, 3) + '-' + c.slice(3);
  }
  function buildCert(win, info) {
    const g = game, st = g.stats;
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const fecha = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const modo = g.mode === 'adventure' ? `Aventura · Nivel ${g.level.id}: ${g.level.name}` : g.mode === 'arcade' ? 'Arcade' : g.mode === 'duel' ? 'Reto ' + g.duelCode : 'Clásico' + (g.relaxed ? ' (relajado)' : '');
    const ch = g.mode === 'duel' && g.opts.challenge;
    const resultado = g.mode === 'adventure' ? (win ? 'SUPERADO' : 'NO SUPERADO') : g.mode === 'arcade' ? `Aguantó ${Math.floor(g.time)} s` : ch ? (g.duelResult === 'win' ? 'GANADO' : g.duelResult === 'tie' ? 'EMPATE' : 'PERDIDO') + ` vs ${ch.from || 'rival'} (${ch.score})` : 'COMPLETADO';
    const dk = st.decErrKinds;
    const aventura = LEVELS.map((L) => { const l = P().levels[L.id]; return L.id + ':' + (l ? '★'.repeat(l.stars) + '☆'.repeat(3 - l.stars) : '---'); }).join(' ');
    const rows = [
      ['Alias', save.alias || 'Invitado'],
      ['Grupo', save.teacher.group || '—'],
      ['Fecha', fecha],
      ['Modo', modo],
      ['Resultado', resultado + (g.mode === 'adventure' && win ? ' ' + '★'.repeat(info.stars) + '☆'.repeat(3 - info.stars) : '')],
      ['Puntos', String(g.score)],
      ['Objetivos exactos', String(st.targets)],
      ['Cortes correctos (misiones)', String(st.correct)],
      ['Decisiones de signo', `${st.decOk} bien / ${st.decErr} mal`],
      ['Fallos por tipo', `−( ): ${dk.negpar || 0} · ×: ${dk.mul || 0} · ÷: ${dk.div || 0}`],
      ['Errores en misiones', String(st.signErrors)],
      ['Bombas · Pistas', `${st.bombs} · ${st.hints}`],
      ['Vidas perdidas', g.relaxed ? 'modo relajado' : String(g.livesLost)],
      ['Fallos (−50 cada uno)', String(g.fallos || 0)],
      ['Tiempo jugado', `${Math.floor(g.time / 60)} min ${Math.floor(g.time % 60)} s`],
      ['Aventura', aventura],
    ];
    const lines = ['INTEGER NINJA · Justificante de partida', ...rows.map(([k, v]) => k + ': ' + v)];
    return { rows, lines, code: certCode(lines), win, ok: g.mode !== 'adventure' || win };
  }
  function certText(c) { return c.lines.join('\n') + '\nCódigo: ' + c.code; }
  /** Comprueba un justificante pegado como texto */
  function verifyCertText(text) {
    const ls = String(text).replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean);
    const ci = ls.findIndex((l) => /^C[óo]digo:/i.test(l));
    if (ci < 0) return { ok: false, msg: 'No encuentro la línea «Código:». Pega el texto completo del justificante.' };
    const code = ls[ci].split(':').slice(1).join(':').trim().toUpperCase();
    const body = ls.slice(0, ci);
    const ok = certCode(body) === code;
    const alias = (body.find((l) => l.startsWith('Alias:')) || '').slice(6).trim();
    return { ok, msg: ok ? `✔ Justificante válido de «${alias}».` : '✘ El código no coincide: el texto se ha modificado o está incompleto.' };
  }
  /** Dibuja el justificante como imagen (1080 × 1500) */
  function drawCert(c) {
    const cv = document.createElement('canvas');
    const Wc = 1080, Hc = 1560;
    cv.width = Wc; cv.height = Hc;
    const x = cv.getContext('2d');
    const F = (w, sz) => `${w} ${sz}px ${MARCA.fuente}`;
    x.fillStyle = C.crema; x.fillRect(0, 0, Wc, Hc);
    x.fillStyle = 'rgba(51,43,42,0.05)';
    for (let yy = 0; yy < Hc; yy += 22) for (let xx = (yy / 22) % 2 ? 11 : 0; xx < Wc; xx += 22) { x.beginPath(); x.arc(xx, yy, 2, 0, TAU); x.fill(); }
    x.strokeStyle = C.espresso; x.lineWidth = 14; roundRect(x, 24, 24, Wc - 48, Hc - 48, 40); x.stroke();
    // cabecera
    x.fillStyle = C.espresso; roundRect(x, 24, 24, Wc - 48, 230, 40); x.fill(); x.fillRect(24, 200, Wc - 48, 54);
    x.fillStyle = C.mostaza; x.font = F(900, 30); x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    x.fillText('πCHU ARCADE', 70, 92);
    x.fillStyle = C.crema; x.font = F(900, 78); x.fillText('INTEGER NINJA', 70, 170);
    x.font = F(700, 30); x.fillStyle = '#E9DFC2'; x.fillText('Justificante de partida', 70, 222);
    const pichu = document.querySelector('.menu-pichu');
    if (pichu && pichu.complete && pichu.naturalWidth) { const k = 220 / pichu.naturalHeight; x.drawImage(pichu, Wc - 80 - pichu.naturalWidth * k, 40, pichu.naturalWidth * k, 220); }
    // alias grande
    x.fillStyle = C.espresso; x.textAlign = 'center';
    x.font = F(700, 32); x.fillText('Alias', Wc / 2, 330);
    x.font = F(900, 76); x.fillText(c.rows[0][1], Wc / 2, 410);
    x.font = F(700, 30); x.fillStyle = C.salviaOsc; x.fillText((c.rows[1][1] !== '—' ? c.rows[1][1] + '   ·   ' : '') + c.rows[2][1], Wc / 2, 458);
    // sello
    x.save(); x.translate(Wc - 210, 560); x.rotate(-0.18);
    const stampTxt = c.ok ? (game.mode === 'adventure' ? 'SUPERADO' : 'COMPLETADO') : 'NO SUPERADO';
    x.strokeStyle = c.ok ? C.salviaOsc : C.coralOsc; x.fillStyle = x.strokeStyle; x.lineWidth = 8;
    roundRect(x, -170, -52, 340, 104, 18); x.stroke();
    x.font = F(900, stampTxt.length > 9 ? 40 : 50); x.textBaseline = 'middle'; x.fillText(stampTxt, 0, 4);
    x.restore();
    // guardián
    const gid = game.level && game.level.guardian;
    const gi = gid && IMG[gid];
    if (gi && gi.complete && gi.naturalWidth) { const k = 170 / gi.naturalHeight; x.drawImage(gi, 70, 490, gi.naturalWidth * k, 170); }
    // tabla
    let y = 700;
    x.textBaseline = 'alphabetic';
    c.rows.slice(3).forEach(([k, v], i) => {
      if (i % 2 === 0) { x.fillStyle = 'rgba(90,138,120,0.12)'; x.fillRect(64, y - 40, Wc - 128, 56); }
      x.fillStyle = C.salviaOsc; x.font = F(700, 28); x.textAlign = 'left'; x.fillText(k, 84, y);
      x.fillStyle = C.espresso; x.font = F(900, k === 'Aventura' || k === 'Modo' ? 26 : 32); x.textAlign = 'right';
      let vv = v; while (x.measureText(vv).width > 560 && vv.length > 4) vv = vv.slice(0, -2);
      x.fillText(vv === v ? v : vv + '…', Wc - 84, y);
      y += 56;
    });
    // código
    x.fillStyle = C.espresso; roundRect(x, 64, Hc - 190, Wc - 128, 120, 24); x.fill();
    x.fillStyle = '#E9DFC2'; x.font = F(700, 26); x.textAlign = 'left'; x.fillText('Código de verificación', 100, Hc - 140);
    x.fillStyle = C.crema; x.font = F(700, 24); x.fillText('Entrégalo en Classroom', 100, Hc - 100);
    x.fillStyle = C.mostaza; x.font = F(900, 64); x.textAlign = 'right'; x.fillText(c.code, Wc - 100, Hc - 105);
    return cv;
  }
  let currentCert = null;
  function openCert() {
    if (!currentCert) return;
    const cv = drawCert(currentCert);
    currentCert.canvas = cv;
    $('#certImg').src = cv.toDataURL('image/png');
    $('#certText').textContent = certText(currentCert);
    const canShare = !!(navigator.share && navigator.canShare);
    $('#bCertShare').classList.toggle('hidden', !canShare);
    showScreen('sCert', false);
  }
  function certFilename() {
    const a = (save.alias || 'invitado').replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ_-]+/g, '_');
    const lv = game.mode === 'adventure' ? 'nivel' + game.level.id : game.mode;
    return `integer-ninja_${a}_${lv}_${currentCert.code}.png`;
  }
  function certBlob() { return new Promise((res) => currentCert.canvas.toBlob(res, 'image/png')); }

  /* ---------- Pausa ---------- */
  function pause() {
    if (!game || game.over || game.paused) return;
    game.paused = true; blade.active = false;
    $('#pauseInfo').innerHTML = game.step.type === 'exact' ? `Objetivo ${E.fmt(game.T)} · Acumulador ${E.fmt(game.A)}` : game.mission.text;
    $('#pSound').checked = save.settings.sound; $('#pMusic').checked = save.settings.music;
    Sound.stopMusic();
    showScreen('sPause', false);
  }
  function resume() {
    if (!game) return;
    game.paused = false; showScreen(null, false); lastTime = performance.now();
    setMusic(game.boss ? 'boss' : 'game');
  }

  /* ---------- Eventos de la interfaz ---------- */
  document.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (go) {
      sfx.click();
      const d = go.dataset.go;
      if (d === 'classic') return askAlias(() => { if (!save.seenHowto) { save.seenHowto = true; persist(); pendingStart = 'classic'; return openScreen('sHowto'); } newGame('classic'); });
      if (d === 'arcade') return askAlias(() => newGame('arcade'));
      if (d === 'levels') return askAlias(() => openScreen('sLevels'));
      if (d === 'alias') return askAlias(() => openScreen('sMenu'));
      if (d === 'retos') return askAlias(() => { retosTab = 'retos'; openScreen('sRetos'); });
      const ids = { levels: 'sLevels', custom: 'sCustom', achievements: 'sAchievements', settings: 'sSettings', teacher: 'sTeacher', howto: 'sHowto' };
      if (d === 'teacher') readSettings();
      return openScreen(ids[d]);
    }
    if (e.target.closest('[data-back]')) {
      sfx.click();
      const cur = screenStack[screenStack.length - 1];
      if (cur === 'sSettings') readSettings();
      if (cur === 'sTeacher') readTeacher();
      if (cur === 'sHowto' && pendingStart) { const m = pendingStart; pendingStart = null; return newGame(m); }
      return back();
    }
  });
  let pendingStart = null;
  $('#bIntroGo').onclick = () => { sfx.click(); newGame('adventure', introLevel); say(LEVELS.find((l) => l.id === introLevel).say, 'happy', 3200); };
  $('#bPause').onclick = pause;
  $('#bHint').onclick = useHint;
  $('#bReset').onclick = resetAccumulator;
  $('#bResume').onclick = resume;
  $('#bRestart').onclick = () => { const g = game; newGame(g.mode, g.level && g.level.id, g.mode === 'duel' ? g.opts : null); };
  $('#bEnd').onclick = () => { game.paused = false; endGame((game.mode === 'classic' && game.relaxed) || game.mode === 'duel', 'Partida terminada'); };
  $('#pSound').onchange = (e) => { save.settings.sound = e.target.checked; persist(); };
  $('#pMusic').onchange = (e) => { save.settings.music = e.target.checked; persist(); };
  $('#bMenu').onclick = goMenu;
  $('#bAgain').onclick = () => { const g = game; newGame(g.mode, g.level && g.level.id, g.mode === 'duel' ? g.opts : null); };
  $('#bAliasOk').onclick = confirmAlias;
  $$('.tabs [data-tab]').forEach((b) => (b.onclick = () => { retosTab = b.dataset.tab; sfx.click(); renderRetos(); }));
  $$('.seg [data-rk]').forEach((b) => (b.onclick = () => { rankMode = b.dataset.rk; sfx.click(); loadRanking(); }));
  $('#bDuelCreate').onclick = () => {
    const rival = Online.cfg() ? $('#duelRival').value.trim() : '';
    if (rival && !ALIAS_RE.test(rival)) return toast('El alias del rival no es válido');
    if (rival && aliasKey(rival) === aliasKey(save.alias)) return toast('No puedes retarte a ti mismo 😉');
    save.settings.math = +$('#duelMath').value; persist();
    startDuel({ math: +$('#duelMath').value, decide: save.settings.decide !== false, rival: rival || null });
  };
  $('#bDuelAccept').onclick = () => {
    if (pendingDuel) return startDuel(pendingDuel);
    const d = E.decodeDuel($('#duelCodeIn').value);
    if (!d) { $('#duelInfo').textContent = '✘ Código no válido. Revisa que tenga 8 caracteres (por ejemplo K7Q2-M9XA).'; sfx.error(); return; }
    const dif = ['suave', 'media', 'reto'][d.math];
    pendingDuel = { seed: d.seed, math: d.math, decide: d.decide, challenge: { score: d.score, from: d.from, code: d.code } };
    $('#duelInfo').innerHTML = `✔ Reto ${d.code}${d.from ? ' de <b>' + esc(d.from) + '</b>' : ''}: supera <b>${d.score.toLocaleString('es-ES')}</b> puntos · dificultad ${dif}${d.decide ? ' · con semillas 🌱' : ''}`;
    $('#bDuelAccept').textContent = '⚔️ ¡Jugar el reto!';
  };
  $('#duelCodeIn').addEventListener('input', () => { pendingDuel = null; $('#bDuelAccept').textContent = 'Comprobar código'; $('#duelInfo').textContent = ''; });
  $('#inbox').addEventListener('click', (e) => {
    const b = e.target.closest('[data-accept]'); if (!b) return;
    const d = E.decodeDuel(b.dataset.code);
    if (!d) return toast('Código de reto dañado');
    startDuel({ seed: d.seed, math: d.math, decide: d.decide, challenge: { score: d.score, from: b.dataset.from, code: d.code, id: b.dataset.accept } });
  });
  $('#bOnSave').onclick = async () => {
    const id = parseScriptId($('#tOnUrl').value), k = $('#tOnKey').value.trim();
    const out = $('#onOut');
    if (!id || !k) { out.textContent = '✘ Pega la URL de la aplicación web (termina en /exec) y la clave de clase.'; out.className = 'verify-out ko'; return; }
    const c = { u: id, k, g: ($('#tGroup').value.trim() || save.teacher.group || '').slice(0, 30) };
    out.textContent = 'Probando conexión…'; out.className = 'verify-out';
    try {
      await Online.get({ action: 'ping' }, c);
      save.online = c; save.teacher.group = c.g; persist();
      out.textContent = '✔ Conectado. Comparte el enlace de clase con tus alumnos.'; out.className = 'verify-out ok';
      $('#tOnLink').value = classLink();
    } catch (e) {
      out.textContent = e.message === 'clave' ? '✘ La clave no coincide con la del Apps Script.' : `✘ No se pudo conectar (${e.message}). Si estás dentro de claude.ai, prueba desde la web publicada.`;
      out.className = 'verify-out ko';
    }
  };
  $('#bOnOff').onclick = () => { delete save.online; persist(); renderTeacher(); toast('Ranking en vivo desactivado en este dispositivo'); };
  $('#bOnCopyLink').onclick = () => { const l = classLink(); if (!l) return toast('Primero conecta el ranking'); try { navigator.clipboard.writeText(l).then(() => toast('Enlace copiado: publícalo en Classroom'), () => toast('Copia el enlace a mano')); } catch (e) { toast('Copia el enlace a mano'); } };
  $('#bOnScript').onclick = () => { try { navigator.clipboard.writeText(APPS_SCRIPT_CODE).then(() => toast('Código del Apps Script copiado'), () => toast('No se pudo copiar')); } catch (e) { toast('No se pudo copiar'); } };
  $('#aliasInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); confirmAlias(); } });
  $('#bAliasCancel').onclick = () => { aliasThen = null; openScreen('sMenu'); };
  $('#bCert').onclick = () => { sfx.click(); openCert(); };
  $('#bCertBack').onclick = () => showScreen('sResult', false);
  $('#bCertSave').onclick = () => certBlob().then((b) => saveFile(certFilename(), b, 'image/png'));
  $('#bCertShare').onclick = () => certBlob().then((b) => {
    const file = new File([b], certFilename(), { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) navigator.share({ files: [file], title: 'Justificante INTEGER NINJA', text: certText(currentCert) }).catch(() => {});
    else toast('Tu navegador no permite compartir: usa «Guardar imagen»');
  });
  $('#bCertCopy').onclick = () => {
    try { navigator.clipboard.writeText(certText(currentCert)).then(() => toast('Texto copiado: pégalo en Classroom'), () => toast('No se pudo copiar: mantén pulsado el texto')); } catch (err) { toast('No se pudo copiar'); }
  };
  $('#bVerify').onclick = () => { const r = verifyCertText($('#tVerify').value); const el = $('#verifyOut'); el.textContent = r.msg; el.className = 'verify-out ' + (r.ok ? 'ok' : 'ko'); };
  $('#bNext').onclick = () => { const id = game.level.id + 1; game = null; screenStack.length = 0; screenStack.push('sMenu', 'sLevels'); renderLevels(); openIntro(id); };
  /** Confirmación sin ventanas emergentes: hay que pulsar dos veces (algunos visores bloquean confirm()) */
  function armed(btn, msg) {
    if (btn.dataset.armed === '1') { btn.dataset.armed = ''; btn.textContent = btn.dataset.label; return true; }
    btn.dataset.label = btn.textContent; btn.dataset.armed = '1'; btn.textContent = msg;
    setTimeout(() => { if (btn.dataset.armed) { btn.dataset.armed = ''; btn.textContent = btn.dataset.label; } }, 3500);
    return false;
  }
  $('#bWipe').onclick = (e) => {
    if (!armed(e.currentTarget, '¿Seguro? Pulsa otra vez')) return;
    const keepTeacher = save.teacher, keepStats = save.stats; save = defaultSave(); save.teacher = keepTeacher; save.stats = keepStats; persist(); buildBackground(); renderSettings(); toast('Progreso de todos los alias borrado');
  };
  $('#bCsv').onclick = exportCSV;
  $('#bClearStats').onclick = (e) => { if (armed(e.currentTarget, '¿Seguro? Pulsa otra vez')) { save.stats = []; persist(); renderStats(); } };
  $('#bCsvCopy').onclick = () => {
    const csv = buildCSV(); if (!csv) return toast('No hay datos que copiar');
    try { navigator.clipboard.writeText(csv).then(() => toast('CSV copiado: pégalo en una hoja de cálculo'), () => toast('No se pudo copiar')); } catch (err) { toast('No se pudo copiar'); }
  };
  $('#tPreset').onclick = () => {
    Object.assign(save.teacher, { on: true, add: true, sub: true, mul: false, div: false, min: -20, max: 20, speed: 1, dur: 90, exact: true, filter: false });
    persist(); renderTeacher(); toast('Configuración: suma y resta de −20 a +20, velocidad media, 90 s');
  };
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      if (game && !game.over) { game.paused ? resume() : pause(); e.preventDefault(); }
      else if (screenStack.length > 1) back();
    }
    if (game && !game.paused && !game.over && (e.key === 'h' || e.key === 'H')) useHint();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { pause(); Sound.stopMusic(); } });
  window.addEventListener('resize', () => { resize(); if (game && game.boss) measureLayout(); });

  /* ---------- Arranque ---------- */
  applyReduce();
  resize();
  openScreen('sMenu');
  // Al entrar, se abre directamente el modo aventura (mapa de niveles); con ?menu se queda en el menú.
  if (!/[?&]menu\b/.test(location.search) && !/[?&]clase=/.test(location.search)) askAliasIfNeeded(() => openScreen('sLevels'));
  const start = () => requestAnimationFrame((t) => { lastTime = t; loop(t); });
  if (document.fonts && document.fonts.load) document.fonts.load(`900 20px Lato`).then(() => { buildBackground(); }).catch(() => {});
  start();

  // Gancho para pruebas automáticas (no afecta al juego)
  window.__IN = {
    get game() { return game; }, E, verifyCertText, Online, classLink, newRound, endGame, get cert() { return currentCert; }, newGame, cutFruit, useHint, pause, resume, goMenu, save: () => save, LEVELS,
    sliceSegment: (a, b) => { blade.swipe = blade.swipe || { entries: [] }; sliceSegment(a, b); }, finishSwipe,
  };
})();
