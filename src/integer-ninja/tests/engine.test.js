/* Pruebas automáticas del motor matemático de INTEGER NINJA.
   Ejecutar:  node tests/engine.test.js            */
'use strict';
const E = require('../src/engine.js');

let checks = 0, fails = 0, typo = 0;
function ok(cond, msg) {
  checks++;
  if (!cond) { fails++; if (fails <= 25) console.error('✗ ' + msg); }
}
function eq(a, b, msg) { ok(Object.is(a, b) || a === b, msg + ' → esperado ' + b + ', obtenido ' + a); }

/* 1. Formato con signo */
eq(E.fmt(5), '+5', 'fmt positivo');
eq(E.fmt(-3), '−3', 'fmt negativo');
eq(E.fmt(0), '0', 'fmt cero');
eq(E.par(-3), '(−3)', 'paréntesis');

/* 2. Operaciones exhaustivas en [-60, 60] */
for (let A = -60; A <= 60; A++) {
  for (let v = -20; v <= 20; v++) {
    eq(E.apply(A, { type: 'num', v }).value, A + v, `suma ${A}+${v}`);
    eq(E.apply(A, { type: 'sub', v }).value, A - v, `resta ${A}-${v}`);
    eq(E.apply(A, { type: 'dbl', v }).value, A + 2 * v, `doble ${A}+2·${v}`);
    const m = E.apply(A, { type: 'mul', v });
    if (v === 0) ok(!m.ok, 'mul por 0 bloqueada');
    else { eq(m.value, A * v === 0 ? 0 : A * v, `mul ${A}·${v}`); ok(!Object.is(m.value, -0), 'sin -0 en mul'); }
    const d = E.apply(A, { type: 'div', v });
    if (v === 0) ok(!d.ok, 'div entre 0 bloqueada');
    else if (A % v === 0) { ok(d.ok, `div exacta ${A}:${v}`); eq(d.value, A / v === 0 ? 0 : A / v, `div ${A}:${v}`); ok(E.isInt(d.value), 'div entera'); }
    else { ok(!d.ok && d.reason === 'noExacta', `div no exacta ${A}:${v} rechazada`); eq(d.value, A, 'div no exacta no cambia A'); }
  }
  eq(E.apply(A, { type: 'neg' }).value, A === 0 ? 0 : -A, `opuesto ${A}`);
  ok(!Object.is(E.apply(0, { type: 'neg' }).value, -0), 'opuesto de 0 no es -0');
  eq(E.apply(A, { type: 'abs' }).value, Math.abs(A), `abs ${A}`);
}
/* regla de los signos */
eq(E.apply(-4, { type: 'mul', v: -2 }).value, 8, '(−4)·(−2)=+8');
eq(E.apply(-4, { type: 'mul', v: 2 }).value, -8, '(−4)·(+2)=−8');
eq(E.apply(12, { type: 'div', v: -3 }).value, -4, '(+12):(−3)=−4');
eq(E.apply(-12, { type: 'div', v: -3 }).value, 4, '(−12):(−3)=+4');
eq(E.apply(8, { type: 'num', v: -3 }).expr, '(+8) + (−3) = +5', 'expresión escrita');
eq(E.apply(2, { type: 'sub', v: -4 }).value, 6, '(+2) − (−4) = +6');

/* 3. Descomposición en sumandos no nulos dentro del intervalo */
const R = E.rng(12345);
for (let i = 0; i < 40000; i++) {
  const lo = -R.int(1, 25), hi = R.int(1, 25);
  const d = R.int(-90, 90), k = R.int(1, 4);
  const parts = E.splitSum(d, k, lo, hi, R);
  ok(parts.reduce((a, b) => a + b, 0) === d, `split suma ${d}`);
  ok(parts.every((p) => p !== 0 && p >= lo && p <= hi && E.isInt(p)), `split partes en [${lo},${hi}] para ${d}: ${parts}`);
  if (d === 0) ok(parts.length >= 2, 'split de 0 usa al menos 2 frutas');
}

/* 4. Oleadas de objetivo exacto: SIEMPRE resolubles */
const configs = [
  { ops: { add: true }, min: -10, max: 10, targetMin: -12, targetMax: 12 },
  { ops: { add: true, sub: true }, min: -20, max: 20, targetMin: -20, targetMax: 20, solutionMax: 3 },
  { ops: { add: true, mul: true, div: true }, min: -6, max: 6, targetMin: -15, targetMax: 15 },
  { ops: { add: false, sub: true }, min: -5, max: 9, targetMin: -9, targetMax: 9 },
  { ops: { add: true, sub: true, mul: true, div: true }, min: -3, max: 3, targetMin: -15, targetMax: 15, solutionMax: 3 },
];
let waves = 0;
for (const raw of configs) {
  const cfg = E.sanitize(raw);
  for (let i = 0; i < 6000; i++) {
    const A = R.int(-70, 70);
    const T = E.makeTarget(cfg, R, null, i);
    ok(T >= cfg.targetMin && T <= cfg.targetMax, 'objetivo dentro de su intervalo');
    const w = E.exactWave(A, T, cfg, R, { bombs: R.int(0, 2), distractors: R.int(0, 4) });
    waves++;
    // la solución indicada lleva exactamente de A a T
    ok(w.solution.every((ix) => ix >= 0), 'índices de solución válidos');
    const seq = w.solution.map((ix) => w.items[ix].op);
    eq(E.run(A, seq), T, `solución de la oleada A=${A} T=${T}`);
    // y cada paso de la solución es una operación válida (sin divisiones no exactas)
    let cur = A, valid = true;
    for (const op of seq) { const r = E.apply(cur, op); if (!r.ok) valid = false; cur = r.value; }
    ok(valid, 'la solución no usa operaciones imposibles');
    // los números de frutas normales respetan el intervalo docente
    for (const it of w.items) {
      if (it.op.type === 'num' || it.op.type === 'sub') ok(it.op.v !== 0 && it.op.v >= cfg.min && it.op.v <= cfg.max, `fruta en intervalo ${it.op.v}`);
      if (it.op.type === 'mul') ok(!cfg.ops.mul ? it.role !== 'sol' : true, 'mul solo si está activada');
      if (it.op.type === 'mul' && it.role === 'sol') ok(cfg.ops.mul, 'piña solución solo con multiplicación');
      if (it.op.type === 'div') { ok(cfg.ops.div, 'división solo si está activada'); ok(it.op.v !== 0, 'divisor no nulo'); }
      if (it.op.type === 'bomb') ok(cfg.bombs, 'bombas solo si están activadas');
    }
    // el buscador independiente también encuentra solución
    if (w.items.length <= 9) ok(E.findSolution(w.items.map((x) => x.op), A, T, w.solution.length) !== null, `findSolution A=${A} T=${T}`);
  }
}
/* sin bombas si el docente las desactiva */
{
  const cfg = E.sanitize({ bombs: false });
  for (let i = 0; i < 500; i++) ok(!E.exactWave(0, 5, cfg, R, { bombs: 3 }).items.some((x) => x.op.type === 'bomb'), 'sin bombas');
  const cfg2 = E.sanitize({ specials: false });
  for (let i = 0; i < 500; i++) ok(E.exactWave(0, 5, cfg2, R, { specialChance: 1 }).items.every((x) => ['num', 'sub', 'bomb'].includes(x.op.type)), 'sin especiales');
}

/* 5. Misiones de filtro */
{
  const cfg = E.sanitize({ min: -15, max: 15 });
  const types = ['neg', 'pos', 'lt', 'gt', 'abs', 'opp'];
  for (let i = 0; i < 6000; i++) {
    const m = E.makeMission(types, cfg, R);
    const items = E.filterWave(m, cfg, R, R.int(4, 6), 1);
    const nums = items.filter((x) => x.op.type === 'num');
    ok(nums.filter((x) => x.role === 'good').length >= 2, `al menos 2 correctas (${m.text})`);
    ok(nums.filter((x) => x.role === 'bad').length >= 1, `al menos 1 incorrecta (${m.text})`);
    for (const x of nums) ok(m.test(x.op.v) === (x.role === 'good'), `clasificación ${x.op.v} en ${m.text}`);
    if (m.id === 'opp') ok(!m.list.some((v, i2) => m.list.includes(-v)), 'lista de opuestos sin pares x/−x');
  }
  const neg = E.missions.neg();
  ok(neg.test(-1) && !neg.test(0) && !neg.test(3), 'negativos');
  ok(!E.missions.pos().test(0), '0 no es positivo');
  ok(E.missions.lt(-3).test(-5) && !E.missions.lt(-3).test(-2) && !E.missions.lt(-3).test(-3), 'menor que −3');
  ok(E.missions.gt(5).test(6) && !E.missions.gt(5).test(5), 'mayor que +5');
  ok(E.missions.absEq(6).test(-6) && E.missions.absEq(6).test(6) && !E.missions.absEq(6).test(5), '|x|=6');
  ok(E.missions.opp([4, -7]).test(-4) && E.missions.opp([4, -7]).test(7) && !E.missions.opp([4, -7]).test(4), 'opuestos');
  ok(E.makeMission(['order'], cfg, R).id === 'neg', 'la misión «ordenar» ya no existe (se usa una de signo)');
}

/* 6. Combos */
{
  const e = (v) => ({ op: { type: 'num', v } });
  const ids = (arr) => arr.map((c) => c.id).sort().join(',');
  eq(ids(E.evaluateCombos([e(7), e(-7)], null)), 'zero', 'combo cero +7 −7');
  eq(ids(E.evaluateCombos([e(7), e(-6)], null)), '', 'no combo con +7 −6');
  eq(ids(E.evaluateCombos([e(3), e(2), e(-1)], null)), 'pos', 'combo positivo');
  eq(ids(E.evaluateCombos([e(-3), e(-2), e(1)], null)), 'neg', 'combo negativo');
  eq(ids(E.evaluateCombos([e(3), e(-3), e(2)], null)), 'pos,zero', 'cero + positivo');
  eq(ids(E.evaluateCombos([e(3), e(-3), e(-2)], null)), 'neg,zero', 'cero + negativo');
  eq(ids(E.evaluateCombos([e(8), e(-3)], { index: 1, roundCuts: 2 })), 'exact', 'combo exacto');
  eq(ids(E.evaluateCombos([e(8), e(-3)], { index: 1, roundCuts: 3 })), '', 'no exacto si la ronda empezó antes');
  eq(ids(E.evaluateCombos([e(2), e(2), e(2), e(-1)], { index: 3, roundCuts: 4 })), 'mega,pos', 'megacombo 4 frutas');
  eq(ids(E.evaluateCombos([e(5)], { index: 0, roundCuts: 1 })), '', 'una fruta no es combo');
  eq(ids(E.evaluateCombos([{ op: { type: 'sub', v: -4 } }, e(-4)], null)), 'zero', '−(−4) aporta +4 y se anula con −4');
  eq(E.multiplierFor(0), 1, 'mult 1'); eq(E.multiplierFor(2), 2, 'mult 2'); eq(E.multiplierFor(4), 3, 'mult 3');
  eq(E.multiplierFor(7), 5, 'mult 5'); eq(E.multiplierFor(12), 10, 'mult 10');
}

/* 7. Geometría del corte */
ok(E.segmentHitsCircle(0, 0, 100, 0, 50, 5, 10) >= 0, 'segmento atraviesa círculo');
ok(E.segmentHitsCircle(0, 0, 100, 0, 50, 30, 10) < 0, 'segmento no toca');
ok(E.segmentHitsCircle(0, 0, 10, 0, 50, 0, 10) < 0, 'segmento corto no llega');
ok(E.segmentHitsCircle(45, -20, 55, 20, 50, 0, 8) >= 0, 'corte rápido que cruza el centro (sin tocar el centro con los extremos)');

/* 8. Sandía explosiva: sin bombas, por distancia */
{
  const fr = [
    { x: 10, y: 0, op: { type: 'num', v: 2 } },
    { x: 5, y: 0, op: { type: 'num', v: -1 } },
    { x: 3, y: 0, op: { type: 'bomb' } },
    { x: 500, y: 0, op: { type: 'num', v: 9 } },
    { x: 20, y: 0, op: { type: 'num', v: 4 }, cut: true },
  ];
  const t = E.blastTargets({ x: 0, y: 0 }, fr, 100);
  eq(t.length, 2, 'explosión alcanza 2 frutas');
  eq(t[0].op.v, -1, 'primero la más cercana');
  ok(!t.some((f) => f.op.type === 'bomb'), 'nunca corta bombas');
}


/* 9. Expresiones con signos (v0.2) */
{
  const cfg = E.sanitize({ min: -10, max: 10 });
  for (let i = 0; i < 20000; i++) {
    const kind = R.pick(['negpar', 'mul', 'div']);
    const e = E.makeExpr(kind, cfg, R);
    const v = E.evalExpr(e);
    if (kind === 'negpar') eq(v, e.s * e.b, 'negpar valor');
    if (kind === 'mul') eq(v, e.a * e.b, 'mul valor');
    if (kind === 'div') { ok(e.b !== 0 && e.a % e.b === 0, 'div exacta'); eq(v, e.a / e.b, 'div valor'); }
    ok(v !== 0 && E.isInt(v), 'expresión entera no nula');
    // con valor pedido
    const k = R.int(-9, 9) || 4;
    eq(E.evalExpr(E.makeExpr(kind, cfg, R, k)), k, `makeExpr ${kind} con valor ${k}`);
    // la regla de los signos coincide con el resultado
    if (kind !== 'negpar') ok(E.signRule(e.a, e.b).same === (v > 0), 'regla de los signos coherente');
    if (kind === 'negpar') ok((e.s < 0) === (Math.sign(v) !== Math.sign(e.b)), 'el − cambia el signo');
  }
  eq(E.exprLabel({ type: 'expr', kind: 'negpar', s: -1, b: -4 }), '−(−4)', 'etiqueta −(−4)');
  eq(E.evalExpr({ type: 'expr', kind: 'negpar', s: -1, b: -4 }), 4, '−(−4) = +4');
  eq(E.evalExpr({ type: 'expr', kind: 'negpar', s: 1, b: -2 }), -2, '+(−2) = −2');
  eq(E.evalExpr({ type: 'expr', kind: 'mul', a: -3, b: 4 }), -12, '(−3)·(+4) = −12');
  eq(E.evalExpr({ type: 'expr', kind: 'div', a: 12, b: -3 }), -4, '(+12):(−3) = −4');
  // misiones de expresiones
  for (const key of Object.keys(E.EXPR_MISSIONS)) {
    for (let i = 0; i < 1500; i++) {
      const m = E.EXPR_MISSIONS[key](R);
      const w = E.exprWave(m, cfg, R, R.int(4, 6), 1);
      const ex = w.filter((x) => x.op.type === 'expr');
      ok(ex.filter((x) => x.role === 'good').length >= 2, `${key}: ≥2 correctas`);
      ok(ex.filter((x) => x.role === 'bad').length >= 1, `${key}: ≥1 incorrecta`);
      for (const x of ex) {
        ok(m.kinds.includes(x.op.kind), `${key}: tipo permitido`);
        ok(m.test(E.evalExpr(x.op)) === (x.role === 'good'), `${key}: clasificación de ${E.exprLabel(x.op)}`);
      }
      if (m.id === 'exprEq') ok(ex.some((x) => E.evalExpr(x.op) === -m.k), `${key}: hay gemela de signo contrario`);
    }
  }
  // decisiones de signo
  for (let i = 0; i < 20000; i++) {
    const A = R.int(-40, 40);
    const type = R.pick(['sub', 'mul', 'div', 'num']);
    const v = E.randNonZero(R, -9, 9);
    const op = { type, v };
    const d = E.decision(A, op);
    const r = E.apply(A, op);
    if (type === 'num') { ok(d === null, 'sin decisión en sumas'); continue; }
    if (d) {
      ok(d.correct === -d.wrong && d.correct !== 0, 'opciones de signo contrario y no nulas');
      if (type === 'sub') eq(A + d.correct, r.value, 'decisión resta coincide con el motor');
      else eq(d.correct, r.value, `decisión ${type} coincide con el motor`);
      if (type !== 'sub') ok(E.signRule(A, v).same === (d.correct > 0), 'decisión respeta la regla de los signos');
    } else ok(type !== 'sub' && (A === 0 || (type === 'div' && A % v !== 0)), 'sin decisión solo si A=0 o no exacta');
  }
  // gemelas en las oleadas
  const c2 = E.sanitize({ ops: { add: true, sub: true, mul: true, div: true }, min: -8, max: 8, mulChance: 0.8, divChance: 0.8, subChance: 0.8 });
  for (let i = 0; i < 4000; i++) {
    const A = R.int(-20, 20), T = R.int(-16, 16);
    const w = E.exactWave(A, T, c2, R, { twins: true, distractors: 1 });
    eq(E.run(A, w.solution.map((ix) => w.items[ix].op)), T, 'oleada con gemelas sigue siendo resoluble');
    for (const ix of w.solution) {
      const op = w.items[ix].op;
      if (op.type === 'mul' || op.type === 'div') ok(op.v === -1 || w.items.some((it) => it.role === 'twin' && it.op.type === op.type && it.op.v === -op.v), 'gemela de la piña/coco');
    }
  }
}

/* 10. Códigos de reto */
{
  for (let i = 0; i < 20000; i++) {
    const d = { seed: R.int(0, 65535), math: R.int(0, 2), decide: R.chance(0.5), score: R.int(0, 300000) };
    const c = E.encodeDuel(d);
    ok(/^[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/.test(c), 'formato del código ' + c);
    const back = E.decodeDuel('Reto INTEGER NINJA de Ninja7: ' + c.toLowerCase());
    ok(back && back.seed === d.seed && back.math === d.math && back.decide === d.decide && back.score === Math.min(327670, Math.round(d.score / 10) * 10), 'ida y vuelta ' + c);
    ok(back && back.from === 'Ninja7', 'alias del retador');
    // una errata en un carácter casi siempre se detecta
    const pos = R.pick([0, 1, 2, 3, 5, 6, 7]);
    const alt = c.slice(0, pos) + (c[pos] === 'A' ? 'B' : 'A') + c.slice(pos + 1);
    if (E.decodeDuel(alt)) typo++;
  }
  ok(typo < 20000 / 40, `erratas no detectadas: ${typo} de 20000`);
  ok(E.decodeDuel('hola') === null, 'texto sin código');
}
/* v0.5. Estrellas y escudo de bombas */
{
  ok(E.starsFor(0, 0) === 3 && E.starsFor(0, 1) === 3, '3 estrellas: sin vidas perdidas y ≤1 fallo');
  ok(E.starsFor(0, 2) === 2 && E.starsFor(1, 4) === 2, '2 estrellas: ≤1 vida y ≤4 fallos');
  ok(E.starsFor(1, 5) === 1 && E.starsFor(2, 0) === 1, '1 estrella en el resto');
  const fruta = { x: 100, y: 100, r: 40, kind: 'apple' };
  const detras = { x: 130, y: 110, r: 40, kind: 'bomb' };
  const lejos = { x: 400, y: 100, r: 40, kind: 'bomb' };
  ok(E.bombShielded(detras, [fruta], [], 0), 'bomba detrás de la fruta cortada en el mismo trazo: no explota');
  ok(!E.bombShielded(lejos, [fruta], [], 0), 'bomba lejos: sí explota');
  ok(E.bombShielded(detras, [], [{ x: 100, y: 100, r: 40, t: 1 }], 1.1), 'bomba pegada a una fruta recién cortada (100 ms): no explota');
  ok(!E.bombShielded(detras, [], [{ x: 100, y: 100, r: 40, t: 1 }], 1.3), 'pasado el margen (300 ms): sí explota');
  ok(!E.bombShielded(lejos, [], [], 0), 'bomba sola: sí explota');
  ok(E.pickTap([detras, fruta], { x: 120, y: 105 }) === fruta, 'toque entre fruta y bomba: gana la fruta');
  ok(E.pickTap([lejos], { x: 405, y: 100 }) === lejos, 'toque en el centro de una bomba sola: bomba');
  ok(E.pickTap([lejos], { x: 435, y: 100 }) === null, 'toque en el borde de una bomba: no cuenta');
}
console.log(`Motor matemático: ${checks} comprobaciones, ${waves} oleadas, ${fails} fallos`);
process.exit(fails ? 1 : 0);
