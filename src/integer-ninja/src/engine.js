/* =====================================================================
   INTEGER NINJA · MOTOR MATEMÁTICO  (πCHU ARCADE)
   ---------------------------------------------------------------------
   Todo lo que es "matemáticas" vive aquí, separado del dibujo y de los
   controles. Así se puede probar de forma automática (tests/engine.test.js)
   y se puede reutilizar en otras applets.

   Reglas de oro:
   - Solo números enteros (Number.isSafeInteger). Nunca decimales.
   - La división solo se aplica si es exacta. Nunca se divide entre 0.
   - Cada oleada del modo "objetivo exacto" se genera a partir del
     acumulador ACTUAL, de modo que siempre contiene una solución.
   ===================================================================== */
(function (root) {
  'use strict';
  const E = {};
  const MINUS = '−'; // signo menos tipográfico (−), más legible que "-"

  /* ---------- Utilidades numéricas ---------- */
  const norm = (n) => (n === 0 ? 0 : n); // evita el "−0" de JavaScript
  E.norm = norm;
  E.isInt = (n) => Number.isSafeInteger(n);

  /** Texto de un entero con signo explícito: +5, −3, 0 */
  E.fmt = (n) => (n > 0 ? '+' + n : n < 0 ? MINUS + Math.abs(n) : '0');
  /** Entre paréntesis si hace falta, como se escribe en 1.º ESO: (−3), (+5) */
  E.par = (n) => (n === 0 ? '0' : '(' + E.fmt(n) + ')');
  E.MINUS = MINUS;

  /* ---------- Generador aleatorio con semilla (para pruebas repetibles) ---------- */
  E.rng = function (seed) {
    let s = (seed >>> 0) || 0x9e3779b9;
    const r = function () {
      // mulberry32
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.int = (a, b) => a + Math.floor(r() * (b - a + 1)); // entero en [a, b]
    r.pick = (arr) => arr[Math.floor(r() * arr.length)];
    r.chance = (p) => r() < p;
    r.shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    return r;
  };
  E.defaultRng = E.rng((Date.now() ^ (Math.random() * 1e9)) >>> 0);

  /** Entero aleatorio NO nulo en [lo, hi] (lo < 0 < hi o ambos del mismo signo) */
  E.randNonZero = function (rng, lo, hi) {
    for (let i = 0; i < 50; i++) {
      const v = rng.int(lo, hi);
      if (v !== 0) return v;
    }
    return hi !== 0 ? hi : lo;
  };

  /* =====================================================================
     OPERACIONES (lo que hace cada fruta al acumulador)
     ---------------------------------------------------------------------
     num  →  A + v          (fruta normal con un entero)
     sub  →  A − v          (fruta de resta: "− (−4)")
     mul  →  A × v          (piña multiplicadora)
     div  →  A ÷ v          (coco divisor, solo si es exacta)
     neg  →  −A             (limón inversor)
     abs  →  |A|            (uva de valor absoluto)
     dbl  →  A + v + v      (cereza doble)
     ===================================================================== */
  E.label = function (op) {
    switch (op.type) {
      case 'num': return E.fmt(op.v);
      case 'sub': return MINUS + ' ' + E.par(op.v);
      case 'mul': return '×' + E.par(op.v);
      case 'div': return '÷' + E.par(op.v);
      case 'neg': return MINUS + 'A';
      case 'abs': return '|A|';
      case 'dbl': return '2×' + E.par(op.v);
      default: return '';
    }
  };

  /**
   * Aplica una operación al acumulador.
   * Devuelve { ok, value, expr, reason }.
   *   ok=false → la operación no se puede hacer (división no exacta…)
   *   expr     → la cuenta escrita como en clase: "(+8) + (−3) = +5"
   */
  E.apply = function (A, op) {
    if (!E.isInt(A)) throw new Error('Acumulador no entero: ' + A);
    let value, expr;
    switch (op.type) {
      case 'num':
        value = A + op.v;
        expr = E.par(A) + ' + ' + E.par(op.v);
        break;
      case 'sub':
        value = A - op.v;
        expr = E.par(A) + ' ' + MINUS + ' ' + E.par(op.v);
        break;
      case 'mul':
        if (op.v === 0) return { ok: false, value: A, reason: 'cero', expr: '' };
        value = A * op.v;
        expr = E.par(A) + ' · ' + E.par(op.v);
        break;
      case 'div':
        if (op.v === 0) return { ok: false, value: A, reason: 'cero', expr: 'No se puede dividir entre 0' };
        if (A % op.v !== 0) {
          return {
            ok: false, value: A, reason: 'noExacta',
            expr: E.fmt(A) + ' no es divisible entre ' + E.par(op.v) + ': la división no es exacta',
          };
        }
        value = A / op.v;
        expr = E.par(A) + ' : ' + E.par(op.v);
        break;
      case 'neg':
        value = -A;
        expr = 'Opuesto de ' + E.par(A);
        break;
      case 'abs':
        value = Math.abs(A);
        expr = '|' + E.fmt(A) + '|';
        break;
      case 'dbl':
        value = A + 2 * op.v;
        expr = E.par(A) + ' + 2·' + E.par(op.v);
        break;
      default:
        return { ok: false, value: A, reason: 'desconocida', expr: '' };
    }
    value = norm(value);
    if (!E.isInt(value)) return { ok: false, value: A, reason: 'rango', expr: '' };
    return { ok: true, value, expr: expr + ' = ' + E.fmt(value) };
  };

  /** ¿La operación cambia el acumulador? (las frutas doradas y bombas no son operaciones) */
  E.isMathOp = (op) => !!op && ['num', 'sub', 'mul', 'div', 'neg', 'abs', 'dbl'].includes(op.type);

  /* =====================================================================
     BÚSQUEDA DE SOLUCIONES
     ¿Existe una secuencia de frutas (cada una como mucho una vez) que
     lleve el acumulador A exactamente al objetivo T?  Búsqueda en
     profundidad con límite. Devuelve los índices en orden, o null.
     ===================================================================== */
  E.findSolution = function (ops, A, T, maxLen) {
    maxLen = Math.min(maxLen || 5, ops.length);
    const used = new Array(ops.length).fill(false);
    const path = [];
    let found = null;
    const seen = new Set();
    function dfs(cur, depth) {
      if (found) return;
      if (depth > 0 && cur === T) { found = path.slice(); return; }
      if (depth >= maxLen) return;
      const key = cur + '|' + used.map((u) => (u ? 1 : 0)).join('');
      if (seen.has(key)) return;
      seen.add(key);
      for (let i = 0; i < ops.length; i++) {
        if (used[i] || !E.isMathOp(ops[i])) continue;
        const r = E.apply(cur, ops[i]);
        if (!r.ok) continue;
        used[i] = true; path.push(i);
        dfs(r.value, depth + 1);
        used[i] = false; path.pop();
        if (found) return;
      }
    }
    dfs(A, 0);
    return found;
  };

  /** Comprueba (y devuelve el valor final) de aplicar una secuencia */
  E.run = function (A, opsSeq) {
    let cur = A;
    for (const op of opsSeq) {
      const r = E.apply(cur, op);
      if (r.ok) cur = r.value;
    }
    return cur;
  };

  /* =====================================================================
     DESCOMPOSICIÓN: escribir d como suma de k enteros NO nulos de [−M, M]
     Primero se intenta al azar (más variedad) y, si no sale, se usa un
     método determinista que siempre funciona.
     ===================================================================== */
  E.splitSum = function (d, k, lo, hi, rng) {
    rng = rng || E.defaultRng;
    if (!(lo <= -1 && hi >= 1)) throw new Error('El intervalo debe contener negativos y positivos');
    if (d === 0 && k < 2) k = 2;
    const cap = d > 0 ? hi : -lo; // el mayor tamaño de parte en la dirección de d
    k = Math.max(k, Math.ceil(Math.abs(d) / cap));
    // intento aleatorio
    for (let tries = 0; tries < 300; tries++) {
      const parts = [];
      let sum = 0;
      for (let i = 0; i < k - 1; i++) {
        const v = E.randNonZero(rng, lo, hi);
        parts.push(v); sum += v;
      }
      const last = d - sum;
      if (last !== 0 && last >= lo && last <= hi) { parts.push(last); return rng.shuffle(parts); }
    }
    // método determinista (siempre funciona)
    if (d === 0) {
      const x = rng.int(1, Math.min(hi, -lo));
      return rng.shuffle([x, -x]);
    }
    const a = Math.abs(d), s = Math.sign(d);
    const kk = Math.max(Math.ceil(a / cap), Math.min(k, a));
    const base = Math.floor(a / kk), extra = a % kk;
    const parts = [];
    for (let i = 0; i < kk; i++) parts.push(s * (base + (i < extra ? 1 : 0)));
    return rng.shuffle(parts);
  };

  /** Normaliza una configuración (el intervalo siempre incluye negativos y positivos) */
  E.sanitize = function (cfg) {
    const c = Object.assign(E.defaultConfig(), cfg || {});
    c.ops = Object.assign({ add: true, sub: false, mul: false, div: false }, c.ops || {});
    if (!c.ops.add && !c.ops.sub) c.ops.add = true;
    c.min = Math.min(-1, Math.round(c.min));
    c.max = Math.max(1, Math.round(c.max));
    if (c.targetMin > c.targetMax) [c.targetMin, c.targetMax] = [c.targetMax, c.targetMin];
    return c;
  };

  /* =====================================================================
     CONFIGURACIÓN MATEMÁTICA
     ===================================================================== */
  E.defaultConfig = function () {
    return {
      min: -10, max: 10,          // intervalo de los números de las frutas
      ops: { add: true, sub: false, mul: false, div: false },
      specials: true,             // limón, uva, cereza, sandía explosiva, dorada
      bombs: true,
      solutionMin: 1, solutionMax: 2, // nº de frutas de la solución
      distractors: 2,             // frutas que no forman parte de la solución
      targetMin: -12, targetMax: 12,
    };
  };

  /** Valor máximo absoluto permitido para las frutas */
  E.maxAbs = (cfg) => Math.max(1, Math.max(Math.abs(cfg.min), Math.abs(cfg.max)));
  /** Entero no nulo dentro del intervalo docente */
  E.randInRange = (rng, cfg) => {
    const lo = cfg.min, hi = cfg.max;
    if (lo === 0 && hi === 0) return 1;
    return E.randNonZero(rng, lo, hi);
  };
  E.inRange = (v, cfg) => v >= cfg.min && v <= cfg.max;

  /* ---------- Objetivos ---------- */
  E.makeTarget = function (cfg, rng, prev, roundIndex) {
    rng = rng || E.defaultRng;
    const lo = cfg.targetMin, hi = cfg.targetMax;
    for (let i = 0; i < 40; i++) {
      let t = rng.int(lo, hi);
      // el 0 aparece de vez en cuando (pide opuestos: combo cero)
      if (t === 0 && !(roundIndex % 5 === 2)) continue;
      if (t === prev) continue;
      return norm(t);
    }
    return norm(prev === lo ? hi : lo);
  };

  /* =====================================================================
     OLEADA "OBJETIVO EXACTO"
     Devuelve { items, solution } donde items es la lista de frutas a lanzar
     (cada item: {op, role}) y solution los índices que resuelven la ronda.
     role: 'sol' | 'dist' | 'special' | 'bomb' | 'gold' | 'blast'
     ===================================================================== */
  E.exactWave = function (A, T, cfg, rng, opts) {
    rng = rng || E.defaultRng;
    opts = opts || {};
    const M = E.maxAbs(cfg);
    const items = [];
    const d = T - A;
    let solOps = null;

    // 1) A veces la solución usa una operación "especial" permitida
    // Con el acumulador en 0, la piña/coco también puede ser la solución: x y después ×m
    if (A === 0 && cfg.ops.mul && rng.chance(cfg.mulChance != null ? cfg.mulChance : 0.3)) {
      const ms = rng.shuffle([-3, -2, 2, 3]).filter((m) => T % m === 0 && T / m !== 0 && E.inRange(T / m, cfg));
      if (ms.length) solOps = [{ type: 'num', v: T / ms[0] }, { type: 'mul', v: ms[0] }];
    }
    if (!solOps && A === 0 && cfg.ops.div && rng.chance(cfg.divChance != null ? cfg.divChance : 0.3)) {
      const vs = rng.shuffle([-3, -2, 2, 3]).filter((v) => T !== 0 && E.inRange(T * v, cfg));
      if (vs.length) solOps = [{ type: 'num', v: T * vs[0] }, { type: 'div', v: vs[0] }];
    }
    if (!solOps && cfg.ops.mul && A !== 0 && rng.chance(cfg.mulChance != null ? cfg.mulChance : 0.3)) {
      const cands = [-3, -2, -1, 2, 3].filter((m) => T === A * m);
      if (cands.length) solOps = [{ type: 'mul', v: rng.pick(cands) }];
      else {
        // A·m + x = T con x en el intervalo
        const ms = rng.shuffle([-3, -2, 2, 3, -1]);
        for (const m of ms) {
          const x = T - A * m;
          if (x !== 0 && E.inRange(x, cfg) && Math.abs(A * m) <= 4 * M) {
            // el orden importa: primero multiplicar y después sumar
            solOps = [{ type: 'mul', v: m }, { type: 'num', v: x }];
            break;
          }
        }
      }
    }
    if (!solOps && cfg.ops.div && A !== 0 && rng.chance(cfg.divChance != null ? cfg.divChance : 0.3)) {
      const ds = rng.shuffle([-3, -2, 2, 3, -1].filter((v) => A % v === 0));
      for (const v of ds) {
        const q = A / v;
        if (q === T) { solOps = [{ type: 'div', v }]; break; }
        const x = T - q;
        if (x !== 0 && E.inRange(x, cfg)) { solOps = [{ type: 'div', v }, { type: 'num', v: x }]; break; }
      }
    }
    if (!solOps) {
      const k = rng.int(cfg.solutionMin, Math.max(cfg.solutionMin, cfg.solutionMax));
      const parts = E.splitSum(d, k, cfg.min, cfg.max, rng);
      solOps = parts.map((p) => {
        // con la resta activada, una parte p puede presentarse como "− (−p)"
        if (cfg.ops.sub && rng.chance(cfg.subChance != null ? cfg.subChance : 0.4) && E.inRange(-p, cfg)) return { type: 'sub', v: -p };
        if (!cfg.ops.add && cfg.ops.sub && E.inRange(-p, cfg)) return { type: 'sub', v: -p };
        return { type: 'num', v: p };
      });
    }
    solOps.forEach((op) => items.push({ op, role: 'sol' }));
    // Gemelas: la misma fruta con el signo contrario (obliga a pensar el signo)
    if (opts.twins) {
      solOps.forEach((op) => {
        if (op.type === 'sub' && E.inRange(-op.v, cfg)) items.push({ op: { type: 'sub', v: -op.v }, role: 'twin' });
        if ((op.type === 'mul' || op.type === 'div') && op.v !== -1) items.push({ op: { type: op.type, v: -op.v }, role: 'twin' });
      });
    }

    // 2) Distractores
    const nd = opts.distractors != null ? opts.distractors : cfg.distractors;
    for (let i = 0; i < nd; i++) {
      let v = E.randInRange(rng, cfg);
      if (cfg.ops.sub && rng.chance(0.3)) items.push({ op: { type: 'sub', v }, role: 'dist' });
      else items.push({ op: { type: 'num', v }, role: 'dist' });
    }
    // 3) Frutas especiales
    if (cfg.specials && rng.chance(opts.specialChance != null ? opts.specialChance : 0.35)) {
      const pool = ['neg', 'abs', 'dbl', 'gold', 'blast'];
      if (cfg.ops.mul) pool.push('mul');
      if (cfg.ops.div) pool.push('div');
      const kind = rng.pick(pool);
      if (kind === 'neg') items.push({ op: { type: 'neg' }, role: 'special' });
      else if (kind === 'abs') items.push({ op: { type: 'abs' }, role: 'special' });
      else if (kind === 'dbl') items.push({ op: { type: 'dbl', v: E.randNonZero(rng, -Math.min(M, 6), Math.min(M, 6)) }, role: 'special' });
      else if (kind === 'mul') items.push({ op: { type: 'mul', v: rng.pick([-3, -2, -1, 2, 3]) }, role: 'special' });
      else if (kind === 'div') items.push({ op: { type: 'div', v: rng.pick([-3, -2, 2, 3]) }, role: 'special' });
      else if (kind === 'gold') items.push({ op: { type: 'gold' }, role: 'gold' });
      else items.push({ op: { type: 'blast' }, role: 'blast' });
    }
    // 4) Bombas
    const nb = opts.bombs != null ? opts.bombs : 0;
    if (cfg.bombs) for (let i = 0; i < nb; i++) items.push({ op: { type: 'bomb' }, role: 'bomb' });

    rng.shuffle(items);
    const solution = [];
    // índice de la solución en el orden en que hay que cortarlas
    solOps.forEach((op) => solution.push(items.findIndex((it) => it.op === op)));
    return { items, solution, d };
  };

  /* =====================================================================
     MISIONES DE "CORTA SOLO…"  (filtros)
     ===================================================================== */
  E.missions = {
    neg: () => ({
      id: 'neg', text: 'CORTA LOS NEGATIVOS', short: 'negativos',
      test: (n) => n < 0,
      explain: (n) => (n === 0 ? '0 no es positivo ni negativo' : E.fmt(n) + ' es positivo: está a la derecha del 0'),
    }),
    pos: () => ({
      id: 'pos', text: 'CORTA LOS POSITIVOS', short: 'positivos',
      test: (n) => n > 0,
      explain: (n) => (n === 0 ? '0 no es positivo ni negativo' : E.fmt(n) + ' es negativo: está a la izquierda del 0'),
    }),
    lt: (k) => ({
      id: 'lt', k, text: 'CORTA LOS MENORES QUE ' + E.fmt(k), short: '< ' + E.fmt(k),
      test: (n) => n < k,
      explain: (n) => (n === k ? E.fmt(n) + ' es igual a ' + E.fmt(k) + ', no menor'
        : E.fmt(n) + ' > ' + E.fmt(k) + ': en la recta está a la derecha de ' + E.fmt(k)),
      line: [k],
    }),
    gt: (k) => ({
      id: 'gt', k, text: 'CORTA LOS MAYORES QUE ' + E.fmt(k), short: '> ' + E.fmt(k),
      test: (n) => n > k,
      explain: (n) => (n === k ? E.fmt(n) + ' es igual a ' + E.fmt(k) + ', no mayor'
        : E.fmt(n) + ' < ' + E.fmt(k) + ': en la recta está a la izquierda de ' + E.fmt(k)),
      line: [k],
    }),
    absEq: (k) => ({
      id: 'abs', k, text: 'CORTA LOS DE VALOR ABSOLUTO ' + k, short: '|x| = ' + k,
      test: (n) => Math.abs(n) === k,
      explain: (n) => '|' + E.fmt(n) + '| = ' + Math.abs(n) + ', no ' + k,
    }),
    opp: (list) => ({
      id: 'opp', list, text: 'CORTA LOS OPUESTOS DE ' + list.map(E.fmt).join(', '), short: 'opuestos',
      test: (n) => list.includes(-n) && n !== 0,
      explain: (n) => 'El opuesto de ' + E.fmt(n) + ' es ' + E.fmt(-n) + (list.includes(n) ? ' (¡cortaste el número, no su opuesto!)' : ', que no está en la lista'),
    }),
  };

  /** Crea una misión al azar entre los tipos permitidos */
  /** Estrellas de un nivel superado.
      3 ★: sin perder vidas y como mucho 1 fallo · 2 ★: como mucho 1 vida y 4 fallos · 1 ★: superado. */
  E.starsFor = function (livesLost, fallos) {
    if (livesLost === 0 && fallos <= 1) return 3;
    if (livesLost <= 1 && fallos <= 4) return 2;
    return 1;
  };

  /* ---------- Escudo de bombas (v0.5) ----------
     Una bomba que asoma DETRÁS de la fruta que estás cortando no explota:
     - su zona de corte es más pequeña (60 % del radio);
     - si en el mismo trazo cortas una fruta que la tapa, se ignora;
     - durante 150 ms tras cortar una fruta, las bombas pegadas a ella tampoco cuentan. */
  E.BOMB_HIT = 0.6;
  E.BOMB_GRACE = 0.15;
  E.overlaps = function (a, b, extra) {
    return Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r + (extra || 0);
  };
  /** ¿Se ignora el corte de esta bomba? fruitsNow: frutas cortadas en este mismo trazo;
      recent: [{x,y,r,t}] frutas cortadas hace poco en el gesto; now: reloj en segundos. */
  E.bombShielded = function (bomb, fruitsNow, recent, now) {
    if (fruitsNow.some((f) => E.overlaps(bomb, f, 0))) return true;
    return (recent || []).some((c) => now - c.t <= E.BOMB_GRACE && E.overlaps(bomb, c, 10));
  };
  /** Toque: la fruta más cercana que no sea bomba; la bomba solo si se toca su centro y no hay fruta. */
  E.pickTap = function (list, p) {
    let best = null, bestD = Infinity, bomb = null;
    for (const f of list) {
      const d = Math.hypot(f.x - p.x, f.y - p.y);
      if (f.kind === 'bomb') { if (d <= f.r * E.BOMB_HIT && !bomb) bomb = f; }
      else if (d <= f.r * 1.05 && d < bestD) { best = f; bestD = d; }
    }
    return best || bomb;
  };

  E.makeMission = function (types, cfg, rng) {
    rng = rng || E.defaultRng;
    const M = Math.min(E.maxAbs(cfg), 12);
    const t = rng.pick(types);
    switch (t) {
      case 'neg': return E.missions.neg();
      case 'pos': return E.missions.pos();
      case 'lt': return E.missions.lt(rng.int(-Math.min(M, 6), Math.min(M, 4)));
      case 'gt': return E.missions.gt(rng.int(-Math.min(M, 4), Math.min(M, 6)));
      case 'abs': return E.missions.absEq(rng.int(2, Math.max(2, Math.min(M, 9))));
      case 'opp': {
        const s = new Set();
        while (s.size < 3) s.add(E.randNonZero(rng, -M, M));
        // no puede haber a la vez x y −x en la lista (sería ambiguo)
        const arr = [...s].filter((v, i, a) => !a.slice(0, i).includes(-v));
        return E.missions.opp(arr);
      }
      default: return E.missions.neg();
    }
  };

  /**
   * Oleada para una misión de filtro: garantiza al menos 2 frutas
   * correctas y al menos 1 incorrecta (hay que pensar, no cortar todo).
   */
  E.filterWave = function (mission, cfg, rng, n, bombs) {
    rng = rng || E.defaultRng;
    const M = Math.min(E.maxAbs(cfg), 15);
    const items = [];
    {
      const good = [], bad = [];
      let guard = 0;
      // candidatos "trampa" pedagógicos: el propio umbral, el 0, el opuesto…
      const traps = [0];
      if (mission.k != null) traps.push(mission.k, -mission.k);
      if (mission.list) mission.list.forEach((v) => traps.push(v));
      if (mission.list) mission.list.forEach((v) => good.push(-v));
      while ((good.length < 3 || bad.length < 3) && guard++ < 500) {
        const v = rng.chance(0.25) ? rng.pick(traps) : rng.int(-M, M);
        if (mission.test(v)) { if (good.length < 6) good.push(v); }
        else if (bad.length < 6) bad.push(v);
      }
      const ng = Math.max(2, Math.ceil(n / 2));
      rng.shuffle(good).slice(0, ng).forEach((v) => items.push({ op: { type: 'num', v }, role: 'good' }));
      rng.shuffle(bad).slice(0, Math.max(1, n - ng)).forEach((v) => items.push({ op: { type: 'num', v }, role: 'bad' }));
    }
    if (cfg.bombs) for (let i = 0; i < (bombs || 0); i++) items.push({ op: { type: 'bomb' }, role: 'bomb' });
    return rng.shuffle(items);
  };

  /* =====================================================================
     COMBOS (se evalúan con los cortes de UN MISMO deslizamiento)
     entries: [{ op, before, after }] en el orden de corte
     hit: null o { index, roundCuts } si en este gesto se alcanzó el objetivo
          index      → posición (en entries) del corte que lo consiguió
          roundCuts  → cortes totales de la ronda en ese momento
     ===================================================================== */
  E.COMBO = {
    zero: { id: 'zero', name: 'COMBO CERO', bonus: 150 },
    pos: { id: 'pos', name: 'COMBO POSITIVO', bonus: 60 },
    neg: { id: 'neg', name: 'COMBO NEGATIVO', bonus: 60 },
    exact: { id: 'exact', name: 'COMBO EXACTO', bonus: 300 },
    mega: { id: 'mega', name: 'MEGACOMBO', bonus: 800 },
  };
  /** Contribución aditiva de una fruta (solo num y sub tienen "valor" sumable) */
  E.contribution = (op) => (op.type === 'num' ? op.v : op.type === 'sub' ? -op.v : op.type === 'dbl' ? 2 * op.v : null);

  E.evaluateCombos = function (entries, hit) {
    const out = [];
    const vals = entries.map((e) => E.contribution(e.op)).filter((v) => v !== null);
    // Cero: dos números opuestos cortados en el mismo gesto
    let zero = false;
    for (let i = 0; i < vals.length && !zero; i++)
      for (let j = i + 1; j < vals.length; j++)
        if (vals[i] !== 0 && vals[i] === -vals[j]) { zero = true; break; }
    if (zero) out.push({ ...E.COMBO.zero });
    // Positivo / negativo: 3 o más frutas sumables
    if (vals.length >= 3) {
      const s = vals.reduce((a, b) => a + b, 0);
      if (s > 0) out.push({ ...E.COMBO.pos, bonus: E.COMBO.pos.bonus * vals.length, sum: s });
      else if (s < 0) out.push({ ...E.COMBO.neg, bonus: E.COMBO.neg.bonus * vals.length, sum: s });
    }
    // Exacto / mega: TODA la ronda resuelta en un único gesto
    if (hit && hit.roundCuts === hit.index + 1 && hit.roundCuts >= 2) {
      if (hit.roundCuts >= 4) out.push({ ...E.COMBO.mega });
      else out.push({ ...E.COMBO.exact });
    }
    return out;
  };

  /** Multiplicador de puntuación según la racha (no afecta a las cuentas) */
  E.multiplierFor = (streak) => (streak >= 10 ? 10 : streak >= 7 ? 5 : streak >= 4 ? 3 : streak >= 2 ? 2 : 1);

  /* =====================================================================
     SANDÍA EXPLOSIVA: devuelve las frutas cercanas que se cortan,
     ordenadas por distancia (así el orden de las cuentas es predecible).
     Las bombas NUNCA se incluyen.
     ===================================================================== */
  E.blastTargets = function (center, fruits, radius) {
    return fruits
      .filter((f) => !f.cut && f.op && f.op.type !== 'bomb' && f.op.type !== 'blast')
      .map((f) => ({ f, d: Math.hypot(f.x - center.x, f.y - center.y) }))
      .filter((o) => o.d <= radius)
      .sort((a, b) => a.d - b.d)
      .map((o) => o.f);
  };

  /* =====================================================================
     GEOMETRÍA DEL CORTE: ¿el segmento P→Q atraviesa el círculo (C, r)?
     Devuelve el parámetro t∈[0,1] del punto más cercano o −1.
     ===================================================================== */
  E.segmentHitsCircle = function (px, py, qx, qy, cx, cy, r) {
    const dx = qx - px, dy = qy - py;
    const len2 = dx * dx + dy * dy;
    let t = len2 === 0 ? 0 : ((cx - px) * dx + (cy - py) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const x = px + t * dx, y = py + t * dy;
    const dist2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
    return dist2 <= r * r ? t : -1;
  };

  /* =====================================================================
     EXPRESIONES CON SIGNOS  (v0.2)
     Frutas que muestran una pequeña cuenta y valen su resultado:
       negpar → −(−4), −(+3), +(−2)        (signo delante del paréntesis)
       mul    → (−3)·(+4)                  (regla de los signos)
       div    → (+12):(−3)                 (siempre exacta)
     ===================================================================== */
  E.sign = (n) => (n > 0 ? '+' : n < 0 ? MINUS : '');
  E.makeExpr = function (kind, cfg, rng, value) {
    rng = rng || E.defaultRng;
    const M = Math.min(E.maxAbs(cfg || E.defaultConfig()), 9);
    if (kind === 'negpar') {
      const s = rng.chance(0.65) ? -1 : 1;
      const b = value != null ? s * value : E.randNonZero(rng, -M, M);
      return { type: 'expr', kind, s, b };
    }
    if (kind === 'mul') {
      if (value != null) {
        const n = Math.abs(value);
        const divs = [];
        for (let d = 2; d <= Math.min(9, n); d++) if (n % d === 0 && n / d <= 9) divs.push(d);
        const d = divs.length ? rng.pick(divs) : 1;
        const a = rng.chance(0.5) ? d : -d;
        return { type: 'expr', kind, a, b: value / a };
      }
      return { type: 'expr', kind, a: E.randNonZero(rng, -6, 6), b: E.randNonZero(rng, -6, 6) };
    }
    if (kind === 'div') {
      const q = value != null ? value : E.randNonZero(rng, -9, 9);
      const d = rng.pick([2, 3, 4, 5, 6]) * (rng.chance(0.5) ? 1 : -1);
      return { type: 'expr', kind, a: q * d, b: d };
    }
    throw new Error('tipo de expresión desconocido: ' + kind);
  };
  E.evalExpr = function (e) {
    if (e.kind === 'negpar') return norm(e.s * e.b);
    if (e.kind === 'mul') return norm(e.a * e.b);
    if (e.kind === 'div') {
      if (e.b === 0 || e.a % e.b !== 0) throw new Error('división no exacta en expresión');
      return norm(e.a / e.b);
    }
    throw new Error('expresión desconocida');
  };
  E.exprLabel = function (e) {
    if (e.kind === 'negpar') return (e.s < 0 ? MINUS : '+') + E.par(e.b);
    if (e.kind === 'mul') return E.par(e.a) + '·' + E.par(e.b);
    return E.par(e.a) + ':' + E.par(e.b);
  };
  /** Regla de los signos aplicada a dos números (texto corto) */
  E.signRule = function (a, b, op) {
    const same = (a > 0) === (b > 0);
    const sa = a > 0 ? '+' : MINUS, sb = b > 0 ? '+' : MINUS;
    return { same, text: '(' + sa + ')' + (op || '·') + '(' + sb + ') = ' + (same ? '+' : MINUS), key: sa + sb };
  };
  /** Explicación de por qué una expresión vale lo que vale */
  E.exprExplain = function (e) {
    const v = E.evalExpr(e), L = E.exprLabel(e);
    if (e.kind === 'negpar') {
      return e.s < 0
        ? L + ' = ' + E.fmt(v) + ': el ' + MINUS + ' delante del paréntesis CAMBIA el signo de dentro'
        : L + ' = ' + E.fmt(v) + ': el + delante del paréntesis DEJA el signo igual';
    }
    const r = E.signRule(e.a, e.b, e.kind === 'mul' ? '·' : ':');
    return L + ' = ' + E.fmt(v) + ': signos ' + (r.same ? 'iguales → positivo' : 'distintos → negativo') + '  ' + r.text;
  };

  /* Misiones con expresiones */
  const KIND_TXT = { negpar: '', mul: 'PRODUCTOS', div: 'DIVISIONES' };
  E.missions.exprSign = (kinds, wantPos) => ({
    id: 'exprSign', kinds, wantPos,
    text: 'CORTA ' + (kinds.length === 1 && KIND_TXT[kinds[0]] ? 'LOS ' + KIND_TXT[kinds[0]] + ' ' + (wantPos ? 'POSITIVOS' : 'NEGATIVOS') : 'LAS QUE DAN ' + (wantPos ? 'POSITIVO' : 'NEGATIVO')),
    short: wantPos ? 'resultado +' : 'resultado ' + MINUS,
    test: (n) => (wantPos ? n > 0 : n < 0),
    explain: (n, op) => (op && op.type === 'expr' ? E.exprExplain(op) : E.fmt(n) + (n > 0 ? ' es positivo' : ' es negativo')),
  });
  E.missions.exprEq = (k, kinds) => ({
    id: 'exprEq', k, kinds,
    text: 'CORTA LAS QUE VALEN ' + E.fmt(k), short: '= ' + E.fmt(k),
    test: (n) => n === k,
    explain: (n, op) => (op && op.type === 'expr' ? E.exprExplain(op) : E.fmt(n) + ' no es ' + E.fmt(k)) + (n === -k ? ' (¡el signo es el contrario!)' : ''),
  });
  E.EXPR_MISSIONS = {
    negparSign: (rng) => E.missions.exprSign(['negpar'], rng.chance(0.5)),
    negparEq: (rng) => E.missions.exprEq(E.randNonZero(rng, -8, 8), ['negpar']),
    mulSign: (rng) => E.missions.exprSign(['mul'], rng.chance(0.5)),
    mulEq: (rng) => { const a = rng.int(2, 6), b = rng.int(2, 6); return E.missions.exprEq((rng.chance(0.5) ? 1 : -1) * a * b, ['mul']); },
    divSign: (rng) => E.missions.exprSign(['div'], rng.chance(0.5)),
    divEq: (rng) => E.missions.exprEq(E.randNonZero(rng, -9, 9), ['div']),
    mixSign: (rng) => E.missions.exprSign(['negpar', 'mul', 'div'], rng.chance(0.5)),
  };

  /** Oleada de expresiones: al menos 2 correctas y 1 incorrecta; en "valen k"
      las trampas son las GEMELAS de signo contrario (valen −k). */
  E.exprWave = function (mission, cfg, rng, n, bombs) {
    rng = rng || E.defaultRng;
    const items = [];
    const kinds = mission.kinds;
    const ng = Math.max(2, Math.ceil(n / 2));
    if (mission.id === 'exprEq') {
      for (let i = 0; i < ng; i++) items.push({ op: E.makeExpr(rng.pick(kinds), cfg, rng, mission.k), role: 'good' });
      const nb = Math.max(1, n - ng);
      for (let i = 0; i < nb; i++) {
        let op;
        if (i < Math.ceil(nb * 0.7)) op = E.makeExpr(rng.pick(kinds), cfg, rng, -mission.k); // gemela
        else { do { op = E.makeExpr(rng.pick(kinds), cfg, rng); } while (E.evalExpr(op) === mission.k); }
        items.push({ op, role: 'bad' });
      }
    } else {
      let good = 0, bad = 0, guard = 0;
      while ((good < ng || bad < Math.max(1, n - ng)) && guard++ < 400) {
        const op = E.makeExpr(rng.pick(kinds), cfg, rng);
        const ok = mission.test(E.evalExpr(op));
        if (ok && good < ng) { items.push({ op, role: 'good' }); good++; }
        else if (!ok && bad < Math.max(1, n - ng)) { items.push({ op, role: 'bad' }); bad++; }
      }
    }
    if (cfg.bombs) for (let i = 0; i < (bombs || 0); i++) items.push({ op: { type: 'bomb' }, role: 'bomb' });
    return rng.shuffle(items);
  };

  /* =====================================================================
     DECISIÓN DE SIGNO (semillas): al cortar −(…), × o ÷ en objetivo exacto
     el alumno debe ELEGIR el resultado entre dos opciones de signo contrario.
     Devuelve null si no hay nada que decidir (resultado 0, división no exacta…).
     ===================================================================== */
  E.decision = function (A, op) {
    if (op.type === 'sub') {
      const c = -op.v;
      return {
        kind: 'negpar', question: MINUS + E.par(op.v) + ' = ?', correct: c, wrong: -c,
        rule: op.v < 0 ? MINUS + '(' + MINUS + ') = +   El menos cambia el signo' : MINUS + '(+) = ' + MINUS + '   El menos cambia el signo',
        explain: MINUS + E.par(op.v) + ' = ' + E.fmt(c) + ': el ' + MINUS + ' delante del paréntesis CAMBIA el signo de dentro',
        key: op.v < 0 ? '-(-)' : '-(+)',
      };
    }
    if (op.type === 'mul' || op.type === 'div') {
      if (A === 0) return null;
      if (op.type === 'div' && (op.v === 0 || A % op.v !== 0)) return null;
      const c = norm(op.type === 'mul' ? A * op.v : A / op.v);
      if (c === 0) return null;
      const sym = op.type === 'mul' ? '·' : ':';
      const r = E.signRule(A, op.v, sym);
      return {
        kind: op.type, question: E.par(A) + ' ' + sym + ' ' + E.par(op.v) + ' = ?', correct: c, wrong: -c,
        rule: r.text + (r.same ? '   Signos iguales → +' : '   Signos distintos → ' + MINUS),
        explain: E.par(A) + sym + E.par(op.v) + ' = ' + E.fmt(c) + ': signos ' + (r.same ? 'iguales → positivo' : 'distintos → negativo'),
        key: r.key,
      };
    }
    return null;
  };

  /* =====================================================================
     CÓDIGOS DE RETO (v0.4)
     8 caracteres Crockford-base32 = 40 bits:
       semilla 16 · dificultad 2 · semillas de decisión 1 · puntos/10 15 · control 6
     El control detecta erratas al teclear el código.
     ===================================================================== */
  const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const duelCheck = (n35) => {
    let h = 0x811c9dc5;
    const str = 'πCHU-duelo-' + n35;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h & 63;
  };
  E.encodeDuel = function (d) {
    const seed = d.seed & 0xffff, math = d.math & 3, dec = d.decide ? 1 : 0;
    const sc = Math.min(32767, Math.max(0, Math.round((d.score || 0) / 10)));
    // 34 bits de datos (cabe en Number sin pérdida)
    const data = ((seed * 4 + math) * 2 + dec) * 32768 + sc;
    const full = data * 64 + duelCheck(data);
    let out = '', n = full;
    for (let i = 0; i < 8; i++) { out = B32[n % 32] + out; n = Math.floor(n / 32); }
    return out.slice(0, 4) + '-' + out.slice(4);
  };
  E.decodeDuel = function (text) {
    const norm = String(text || '').toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1');
    const m = norm.match(/([0-9A-Z]{4})-?([0-9A-Z]{4})(?![0-9A-Z])/g);
    if (!m) return null;
    for (const cand of m.reverse()) {
      const code = cand.replace('-', '');
      let n = 0, okc = true;
      for (const ch of code) { const v = B32.indexOf(ch); if (v < 0) { okc = false; break; } n = n * 32 + v; }
      if (!okc) continue;
      const chk = n % 64, data = Math.floor(n / 64);
      if (duelCheck(data) !== chk) continue;
      const sc = data % 32768, rest = Math.floor(data / 32768);
      const dec = rest % 2, rest2 = Math.floor(rest / 2);
      const math = rest2 % 4, seed = Math.floor(rest2 / 4);
      if (seed > 0xffff) continue;
      const am = String(text).match(/de\s+([A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 _.\-]{2,20}?)\s*:/);
      return { seed, math, decide: !!dec, score: sc * 10, code: code.slice(0, 4) + '-' + code.slice(4), from: am ? am[1].trim() : null };
    }
    return null;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = E;
  root.IntegerEngine = E;
})(typeof window !== 'undefined' ? window : globalThis);
