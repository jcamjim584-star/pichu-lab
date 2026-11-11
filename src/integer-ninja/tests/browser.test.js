/* Pruebas en navegador real (Chromium + Playwright) de INTEGER NINJA.
   Ejecutar:  node tests/browser.test.js            */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const URL = 'file://' + path.resolve(__dirname, '../dist/index.html');
const SHOTS = path.resolve(__dirname, '../shots');
fs.mkdirSync(SHOTS, { recursive: true });

let checks = 0, fails = 0;
const ok = (c, m) => { checks++; if (!c) { fails++; console.error('✗ ' + m); } else console.log('✓ ' + m); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function swipeThrough(page, fx, fy, len, touch) {
  len = len || 70;
  if (touch) {
    await page.evaluate(({ fx, fy, len }) => {
      const c = document.getElementById('game');
      const mk = (type, x, y) => c.dispatchEvent(new PointerEvent(type, { pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, bubbles: true, cancelable: true, buttons: type === 'pointerup' ? 0 : 1 }));
      mk('pointerdown', fx - len, fy - 8);
      for (let i = 1; i <= 8; i++) mk('pointermove', fx - len + (2 * len * i) / 8, fy - 8 + (16 * i) / 8);
      mk('pointerup', fx + len, fy + 8);
    }, { fx, fy, len });
    return;
  }
  await page.mouse.move(fx - len, fy - 6);
  await page.mouse.down();
  await page.mouse.move(fx + len, fy + 6, { steps: 6 });
  await page.mouse.up();
}
/** Posición actual de las frutas vivas (no cortadas) */
const liveFruits = (page) => page.evaluate(() => window.__IN.game.fruits.filter((f) => !f.cut && !f.fade && !f.gone).map((f) => ({ id: f.id, x: f.x, y: f.y, r: f.r, vy: f.vy, op: f.op, role: f.role })));
const visibleNow = (f, H, top) => f.y > top + f.r && f.y < H - f.r * 1.2;

/** Resuelve un objetivo cortando frutas de verdad con el ratón/dedo */
async function solveOneTarget(page, touch, maxMs) {
  const start = Date.now();
  const before = await page.evaluate(() => window.__IN.game.stats.targets);
  while (Date.now() - start < (maxMs || 25000)) {
    const st = await page.evaluate(() => { const g = window.__IN.game; return { A: g.A, T: g.T, over: g.over, type: g.step && g.step.type, top: 0, H: innerHeight, targets: g.stats.targets }; });
    if (st.over || st.targets > before) return true;
    const dec = await page.evaluate(() => { const d = window.__IN.game.decision; return d && d.seeds.filter((s) => !s.cut && !s.fade).map((s) => ({ x: s.x, y: s.y, v: s.op.v, c: d.d.correct })); });
    if (dec && dec.length) { const sd = dec.find((s) => s.v === s.c); await sleep(350); const sd2 = await page.evaluate(() => { const d = window.__IN.game.decision; return d && d.seeds.filter((s) => s.op.v === d.d.correct).map((s) => ({ x: s.x, y: s.y }))[0]; }); if (sd2) await swipeThrough(page, sd2.x, sd2.y, 50, touch); await sleep(80); continue; }
    const fr = (await liveFruits(page)).filter((f) => f.op.type !== 'bomb' && visibleNow(f, st.H, 200));
    const sol = await page.evaluate(({ ops, A, T }) => window.__IN.E.findSolution(ops, A, T, 4), { ops: fr.map((f) => f.op), A: st.A, T: st.T });
    if (sol && sol.length) {
      const f = fr[sol[0]];
      // cortar solo esa fruta: gesto corto y comprobar que no hay bomba cerca
      await swipeThrough(page, f.x, f.y + f.vy * 0.03, Math.min(f.r * 1.4, 60), touch);
      await sleep(60);
    } else {
      await sleep(120);
    }
  }
  return (await page.evaluate(() => window.__IN.game.stats.targets)) > before;
}

(async () => {
  const browser = await chromium.launch();
  for (const device of [
    { name: 'movil', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 },
    { name: 'escritorio', viewport: { width: 1280, height: 800 } },
  ]) {
    console.log(`\n=== ${device.name} ===`);
    const ctx = await browser.newContext(device);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|fonts\.g/.test(m.text())) errors.push('console: ' + m.text()); });
    await page.goto(URL + '?menu');
    await sleep(1200);
    ok(await page.isVisible('#sMenu'), 'menú visible');
    ok(await page.isVisible('text=¡Corta, calcula y conquista!'), 'subtítulo del menú');
    await page.screenshot({ path: `${SHOTS}/${device.name}-menu.png` });
    const touch = !!device.hasTouch;

    // El botón principal JUGAR lleva al modo aventura (v0.5)
    ok((await page.getAttribute('.menu-buttons .btn.primary', 'data-go')) === 'levels', 'JUGAR abre el modo aventura');
    {
      const p2 = await browser.newPage();
      await p2.goto(URL); await p2.waitForTimeout(500);
      ok(await p2.isVisible('#sAlias'), 'al abrir el juego sin alias: pide el alias para ir a la aventura');
      await p2.fill('#aliasInput', 'Inicio'); await p2.click('#bAliasOk'); await p2.waitForTimeout(300);
      ok(await p2.isVisible('#sLevels'), 'después del alias se abre el mapa de la aventura');
      await p2.reload(); await p2.waitForTimeout(500);
      ok(await p2.isVisible('#sLevels'), 'con alias guardado, el juego arranca directamente en la aventura');
      await p2.close();
    }
    // MODO CLÁSICO (primera vez: pantalla de cómo se juega)
    await page.click('text=🎯 MODO CLÁSICO');
    ok(await page.isVisible('#sAlias'), 'el modo clásico pide el alias');
    await page.click('#bAliasOk');
    ok((await page.textContent('#aliasError')).length > 0, 'alias vacío: aviso');
    await page.fill('#aliasInput', 'Ninja7');
    await page.screenshot({ path: `${SHOTS}/${device.name}-alias.png` });
    await page.click('#bAliasOk');
    ok(await page.isVisible('#sHowto'), 'primera partida muestra "¿Cómo se juega?"');
    await page.screenshot({ path: `${SHOTS}/${device.name}-howto.png`, fullPage: false });
    await page.click('#sHowto >> text=Entendido');
    await sleep(300);
    ok(await page.evaluate(() => window.__IN.game && window.__IN.game.mode === 'classic'), 'partida clásica iniciada');
    ok(await page.isVisible('#hud'), 'marcador visible');
    ok(/CONSIGUE/.test(await page.textContent('#hGoal')), 'objetivo en el marcador: ' + (await page.textContent('#hGoal')));
    await sleep(2200);
    const fr0 = await liveFruits(page);
    ok(fr0.length > 0, `aparecen frutas (${fr0.length})`);
    // las frutas suben (trayectoria parabólica): velocidad vertical cambia con la gravedad
    const y1 = await page.evaluate(() => window.__IN.game.fruits.map((f) => [f.id, f.vy]));
    await sleep(300);
    const y2 = await page.evaluate(() => window.__IN.game.fruits.map((f) => [f.id, f.vy]));
    const common = y1.filter(([id]) => y2.find(([j]) => j === id));
    ok(common.length && common.every(([id, v]) => y2.find(([j]) => j === id)[1] > v), 'gravedad: la velocidad vertical aumenta (parábola)');
    await page.screenshot({ path: `${SHOTS}/${device.name}-juego.png` });

    // corte real de una fruta numérica
    const st0 = await page.evaluate(() => ({ A: window.__IN.game.A, cuts: window.__IN.game.stats.cuts }));
    let target = (await liveFruits(page)).find((f) => f.op.type === 'num' && visibleNow(f, device.viewport.height, 200));
    for (let i = 0; i < 30 && !target; i++) { await sleep(150); target = (await liveFruits(page)).find((f) => f.op.type === 'num' && visibleNow(f, device.viewport.height, 200)); }
    if (target) {
      await swipeThrough(page, target.x, target.y, 60, touch);
      await sleep(80);
      const st1 = await page.evaluate(() => ({ A: window.__IN.game.A, cuts: window.__IN.game.stats.cuts, halves: 0 }));
      ok(st1.cuts > st0.cuts, `corte con ${touch ? 'dedo (touch)' : 'ratón'}: la fruta ${target.op.v} se corta`);
      const halves = await page.evaluate(() => 1);
      await page.screenshot({ path: `${SHOTS}/${device.name}-corte.png` });
    } else ok(false, 'no se encontró fruta para cortar');

    // resolver objetivos exactos de verdad
    const solved = await solveOneTarget(page, touch, 30000);
    ok(solved, 'se consigue un objetivo exacto cortando frutas');
    const s2 = await page.evaluate(() => { const g = window.__IN.game; return { score: g.score, A: g.A, T: g.T, hud: document.getElementById('hScore').textContent }; });
    ok(s2.score > 0 && s2.hud.replace(/\./g, '') === String(s2.score), `la puntuación se actualiza (${s2.hud})`);
    ok(s2.A === 0, 'nuevo objetivo: acumulador vuelve a 0');

    // acumulador correcto con frutas inyectadas en posiciones conocidas
    await page.evaluate(() => {
      const g = window.__IN.game; g.queue = []; g.waveCooldown = 99;
      g.fruits.forEach((f) => (f.fade = true));
      g.A = 0; g.T = 99; g.roundCuts = 0;
      const mk = (x, y, op) => ({ id: g.nextId++, op, role: 'test', kind: 'apple', r: 40, x, y, vx: 0, vy: 0, g: 0, rot: 0, vr: 0, cut: false });
      g.fruits.push(mk(100, 420, { type: 'num', v: 8 }), mk(220, 420, { type: 'num', v: -3 }), mk(330, 420, { type: 'sub', v: -4 }));
    });
    await sleep(450);
    await page.mouse.move(40, 420); await page.mouse.down(); await page.mouse.move(380, 420, { steps: 12 }); await page.mouse.up();
    if (touch) { /* en móvil el ratón emulado también genera eventos de puntero */ }
    await sleep(100);
    // −(−4) abre la decisión: el acumulador espera en +5
    const decA = await page.evaluate(() => ({ A: window.__IN.game.A, dec: !!window.__IN.game.decision, q: window.__IN.game.decision && window.__IN.game.decision.d.question }));
    ok(decA.A === 5 && decA.dec, `−(−4) abre las semillas de decisión (${decA.q}) con el acumulador en +5`);
    await sleep(500);
    await page.screenshot({ path: `${SHOTS}/${device.name}-decision.png` });
    const good = await page.evaluate(() => { const d = window.__IN.game.decision; const s = d.seeds.find((x) => x.op.v === d.d.correct); return { x: s.x, y: s.y }; });
    await swipeThrough(page, good.x, good.y, 50, touch);
    await sleep(150);
    const acc = await page.evaluate(() => ({ A: window.__IN.game.A, eq: document.getElementById('hEq').textContent, acc: document.getElementById('hAcc').textContent }));
    ok(acc.A === 9, `+8, −3 y después −(−4) con su semilla: acumulador = ${acc.A} (esperado +9)`);
    ok(acc.acc === '+9', 'el marcador muestra +9');
    ok(acc.eq.includes('= +9'), 'la última cuenta se muestra: ' + acc.eq);

    // bomba: pierde vida y racha
    const lives0 = await page.evaluate(() => { const g = window.__IN.game; g.streak = 3; g.mult = 2; g.fruits.push({ id: g.nextId++, op: { type: 'bomb' }, role: 'bomb', kind: 'bomb', r: 38, x: 200, y: 500, vx: 0, vy: 0, g: 0, rot: 0, vr: 0, cut: false }); return g.lives; });
    await sleep(100);
    await swipeThrough(page, 200, 500, 50, touch);
    await sleep(150);
    const b = await page.evaluate(() => ({ lives: window.__IN.game.lives, mult: window.__IN.game.mult, streak: window.__IN.game.streak }));
    ok(b.lives === lives0 - 1 && b.mult === 1 && b.streak === 0, `bomba: vidas ${lives0}→${b.lives}, racha rota`);
    await page.screenshot({ path: `${SHOTS}/${device.name}-bomba.png` });

    // combo cero en un gesto
    await page.evaluate(() => {
      const g = window.__IN.game; g.A = 0; g.T = 50; g.roundCuts = 0; g.stats.combos = 0;
      const mk = (x, y, op) => ({ id: g.nextId++, op, role: 'test', kind: 'orange', r: 40, x, y, vx: 0, vy: 0, g: 0, rot: 0, vr: 0, cut: false });
      g.fruits.push(mk(120, 600, { type: 'num', v: 7 }), mk(270, 600, { type: 'num', v: -7 }));
    });
    await sleep(80);
    await swipeThrough(page, 195, 600, 130, touch);
    await sleep(120);
    ok(await page.evaluate(() => window.__IN.game.stats.combos >= 1 && window.__IN.save().profiles.ninja7.ach.zero), 'COMBO CERO detectado (+7 y −7 en un gesto)');

    // pausa y reanudar
    await page.click('#bPause');
    ok(await page.isVisible('#sPause'), 'pausa');
    const tP = await page.evaluate(() => window.__IN.game.timeLeft);
    await sleep(500);
    ok(Math.abs((await page.evaluate(() => window.__IN.game.timeLeft)) - tP) < 0.001, 'en pausa el tiempo no corre');
    await page.click('#bResume');

    // fin de partida por tiempo y volver a jugar
    await page.evaluate(() => { window.__IN.game.timeLeft = 0.3; });
    await sleep(1500);
    ok(await page.isVisible('#sResult'), 'la partida termina al acabar el tiempo');
    await page.screenshot({ path: `${SHOTS}/${device.name}-resultado.png` });
    ok(await page.isVisible('#bCert'), 'botón de justificante para Classroom');
    await page.click('#bCert');
    await sleep(300);
    ok(await page.isVisible('#sCert') && await page.evaluate(() => document.getElementById('certImg').naturalWidth === 1080 && document.getElementById('certImg').naturalHeight === 1560), 'justificante generado como imagen 1080 px');
    const txt = await page.textContent('#certText');
    ok(txt.includes('Alias: Ninja7') && /Código: [0-9A-Z]{3}-[0-9A-Z]{3}/.test(txt), 'texto del justificante con alias y código');
    ok(await page.evaluate((t) => window.__IN.verifyCertText(t).ok, txt), 'verificación: justificante original válido');
    ok(await page.evaluate((t) => !window.__IN.verifyCertText(t.replace(/Puntos: (\d+)/, (m, n) => 'Puntos: ' + (+n + 1000))).ok, txt), 'verificación: si cambian los puntos, el código no coincide');
    await page.screenshot({ path: `${SHOTS}/${device.name}-justificante.png` });
    const [dlc] = await Promise.all([page.waitForEvent('download'), page.click('#bCertSave')]);
    ok(/integer-ninja_Ninja7_classic_.*\.png$/.test(dlc.suggestedFilename()), 'descarga de la imagen: ' + dlc.suggestedFilename());
    await page.click('#bCertBack');
    await page.click('#bAgain');
    await sleep(400);
    ok(await page.evaluate(() => { const g = window.__IN.game; return g && !g.over && g.score === 0 && g.lives === 3; }), 'jugar otra vez reinicia la partida');

    if (device.name === 'movil') {
      // modo aventura nivel 1: misión de filtro
      await page.evaluate(() => window.__IN.newGame('adventure', 1));
      await sleep(3200);
      const m = await page.evaluate(() => window.__IN.game.mission.id);
      ok(m === 'neg', 'nivel 1 empieza con "corta los negativos"');
      let fr = (await liveFruits(page)).filter((f) => visibleNow(f, 844, 200) && f.op.type === 'num');
      for (let i = 0; i < 30 && !(fr.some((f) => f.op.v < 0) && fr.some((f) => f.op.v >= 0)); i++) { await sleep(150); fr = (await liveFruits(page)).filter((f) => visibleNow(f, 844, 200) && f.op.type === 'num'); }
      const good = fr.find((f) => f.op.v < 0), bad = fr.find((f) => f.op.v >= 0);
      if (good) {
        await page.evaluate((id) => { const g = window.__IN.game; const f = g.fruits.find((x) => x.id === id); window.__IN.cutFruit(f, 0); }, good.id);
        ok(await page.evaluate(() => window.__IN.game.stats.correct === 1), `cortar ${good.op.v} cuenta como correcto`);
      } else ok(false, 'no apareció un negativo');
      if (bad) {
        const b0 = await page.evaluate(() => { const g = window.__IN.game; g.score = Math.max(g.score, 80); return { l: g.lives, s: g.score }; });
        await page.evaluate((id) => { const g = window.__IN.game; const f = g.fruits.find((x) => x.id === id); window.__IN.cutFruit(f, 0); }, bad.id);
        await sleep(100);
        ok(await page.evaluate((b0) => { const g = window.__IN.game; return g.lives === b0.l && g.score === b0.s - 50 && g.fallos === 1; }, b0), `cortar ${bad.op.v}: −50 puntos y ninguna vida`);
        ok(await page.isVisible('#explain'), 'aparece la explicación con recta numérica: ' + (await page.textContent('#explain')).slice(0, 60));
        await page.screenshot({ path: `${SHOTS}/movil-error-explicado.png` });
      }
      ok(await page.evaluate(() => window.__IN.game.boss && window.__IN.game.boss.id === 'fantasma'), 'nivel 1: guardián Fantasma de la Recta');
      // nivel 3: misión −( ) y decisión equivocada
      await page.evaluate(() => window.__IN.newGame('adventure', 3));
      await sleep(2500);
      const m3 = await page.evaluate(() => { const m = window.__IN.game.mission; return { id: m.id, kinds: m.kinds, boss: window.__IN.game.boss.id }; });
      ok(m3.id === 'exprSign' && m3.kinds[0] === 'negpar' && m3.boss === 'menos', 'nivel 3 empieza con misión de −( ) y guardián Don Menos');
      let ex = []; for (let i = 0; i < 30 && !ex.length; i++) { await sleep(150); ex = (await liveFruits(page)).filter((f) => f.op.type === 'expr' && visibleNow(f, 844, 200)); }
      ok(ex.length > 0, 'aparecen frutas con −( )');
      await page.screenshot({ path: `${SHOTS}/movil-nivel3-mision.png` });
      const r3 = await page.evaluate(() => { const g = window.__IN.game; const f = g.fruits.find((x) => x.op.type === 'expr' && !x.cut); const v = window.__IN.E.evalExpr(f.op); const good = g.mission.test(v); const hp0 = g.boss.hp, l0 = g.lives, fa0 = g.fallos; window.__IN.cutFruit(f, 0); return { good, hp: g.boss.hp, hp0, lives: g.lives, l0, fa: g.fallos, fa0, label: window.__IN.E.exprLabel(f.op) }; });
      ok(r3.good ? r3.hp === r3.hp0 - 1 : r3.lives === r3.l0 && r3.fa === r3.fa0 + 1, `cortar ${r3.label}: ${r3.good ? 'daña al guardián' : '−50 sin perder vida'}`);
      // decisión equivocada en objetivo exacto
      const d3 = await page.evaluate(() => {
        const g = window.__IN.game; g.step = { type: 'exact', n: 3 }; g.mission = null; g.A = 2; g.T = 50; g.queue = []; g.waveCooldown = 99;
        g.fruits.forEach((f) => (f.fade = true));
        const f = { id: g.nextId++, op: { type: 'sub', v: -4 }, role: 'test', kind: 'plum', r: 44, x: 200, y: 420, vx: 0, vy: 0, g: 0, rot: 0, vr: 0, cut: false };
        g.fruits.push(f); window.__IN.cutFruit(f, 0);
        const d = g.decision; const bad = d.seeds.find((s) => s.op.v !== d.d.correct); const l0 = g.lives;
        window.__IN.cutFruit(bad, 0);
        return { A: g.A, lives: g.lives, l0, correct: d.d.correct, err: g.stats.decErr, fallos: g.fallos };
      });
      ok(d3.correct === 4 && d3.A === 2 && d3.lives === d3.l0 && d3.fallos >= 1 && d3.err === 1, 'semilla equivocada en −(−4): acumulador sin cambiar, −50 y sin perder vida');
      await sleep(200);
      ok(await page.isVisible('#explain') && /cambia/i.test(await page.textContent('#explain')), 'tarjeta de la regla del menos visible');
      await page.screenshot({ path: `${SHOTS}/movil-regla-menos.png` });
      // v0.5: escudo de bombas — la bomba que asoma detrás de la fruta no explota
      const bs = await page.evaluate(() => {
        const g = window.__IN.game; g.queue = []; g.waveCooldown = 99; g.decision = null;
        g.fruits.forEach((f) => (f.fade = true));
        const mk = (o) => Object.assign({ id: g.nextId++, role: 'test', r: 44, vx: 0, vy: 0, g: 0, rot: 0, vr: 0, cut: false }, o);
        const fruta = mk({ op: { type: 'num', v: 3 }, kind: 'apple', x: 200, y: 400 });
        const bomba = mk({ op: { type: 'bomb' }, kind: 'bomb', x: 225, y: 420, role: 'bomb' });
        const sola = mk({ op: { type: 'bomb' }, kind: 'bomb', x: 300, y: 650, role: 'bomb' });
        g.fruits.push(fruta, bomba, sola);
        const l0 = g.lives, b0 = g.stats.bombs;
        window.__IN.sliceSegment({ x: 120, y: 405 }, { x: 320, y: 415 }); // atraviesa fruta y bomba
        const tras = { lives: g.lives, bombs: g.stats.bombs, fruta: fruta.cut, bomba: bomba.cut };
        window.__IN.finishSwipe();
        window.__IN.sliceSegment({ x: 230, y: 650 }, { x: 370, y: 650 }); // bomba sola, sin fruta delante
        return { l0, b0, tras, sola: sola.cut, bombs2: g.stats.bombs };
      });
      ok(bs.tras.fruta && !bs.tras.bomba && bs.tras.lives === bs.l0 && bs.tras.bombs === bs.b0, 'bomba detrás de la fruta: se corta la fruta y la bomba no explota');
      ok(bs.sola && bs.bombs2 === bs.b0 + 1, 'una bomba sola sí explota');
      // nivel 4: regla de los signos
      await page.evaluate(() => window.__IN.newGame('adventure', 4));
      await sleep(2600);
      ok(await page.evaluate(() => { const g = window.__IN.game; return g.mission.id === 'exprSign' && g.mission.kinds[0] === 'mul' && g.boss.id === 'mago'; }), 'nivel 4: productos con el Mago de los Signos');
      await page.screenshot({ path: `${SHOTS}/movil-nivel4.png` });
      const d4 = await page.evaluate(() => {
        const g = window.__IN.game; g.step = { type: 'exact', n: 3 }; g.mission = null; g.A = -4; g.T = 50; g.queue = []; g.waveCooldown = 99;
        g.fruits.forEach((f) => (f.fade = true));
        const f = { id: g.nextId++, op: { type: 'mul', v: -2 }, role: 'test', kind: 'pineapple', r: 44, x: 200, y: 420, vx: 0, vy: 0, g: 0, rot: 0, vr: 0, cut: false };
        g.fruits.push(f); window.__IN.cutFruit(f, 0);
        const d = g.decision; return { q: d.d.question, opts: d.seeds.map((s) => s.op.v).sort((a, b) => a - b), correct: d.d.correct };
      });
      ok(d4.correct === 8 && d4.opts.join() === '-8,8', `piña: ${d4.q} con opciones ±8`);
      await sleep(500);
      await page.screenshot({ path: `${SHOTS}/movil-decision-pina.png` });
      await page.evaluate(() => { const g = window.__IN.game; const d = g.decision; window.__IN.cutFruit(d.seeds.find((s) => s.op.v === d.d.correct), 0); });
      ok(await page.evaluate(() => window.__IN.game.A === 8), 'semilla correcta: (−4)·(−2) = +8 en el acumulador');
      await page.screenshot({ path: `${SHOTS}/movil-regla-ok.png` });
      // jefe final: comprobar dibujo, ataque y victoria
      await page.evaluate(() => window.__IN.newGame('adventure', 6));
      await sleep(2500);
      ok(await page.evaluate(() => !!window.__IN.game.boss && window.__IN.game.boss.hp === 10), 'aparece el jefe con 10 de vida');
      await page.screenshot({ path: `${SHOTS}/movil-jefe.png` });
      await page.evaluate(() => { window.__IN.game.boss.attackT = 0; window.__IN.game.boss.phase = 2; });
      await sleep(400);
      await page.screenshot({ path: `${SHOTS}/movil-jefe-ataque.png` });
      await page.evaluate(() => { const b = window.__IN.game.boss; b.hp = 1; b.attackT = 99; window.__IN.game.roundTime = 999; });
      const beat = await solveOneTarget(page, true, 30000);
      ok(beat, 'objetivo conseguido contra el jefe');
      await sleep(3800);
      ok(await page.isVisible('#sResult') && await page.isVisible('#rTrophy'), 'victoria: pantalla final con trofeo');
      await page.screenshot({ path: `${SHOTS}/movil-victoria.png` });
      ok(await page.evaluate(() => window.__IN.save().profiles.ninja7.levels[6].stars >= 1 && !!window.__IN.save().profiles.ninja7.ach.king), 'progreso guardado: nivel 6 y logro del Rey');
      const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem('pichu.integerNinja.v1')).profiles.ninja7.levels[6].stars);
      ok(persisted >= 1, 'guardado en localStorage');

      // perfiles por alias: otro alias no hereda el progreso
      await page.evaluate(() => window.__IN.goMenu());
      await page.click('text=▶ JUGAR');
      ok(await page.isVisible('#sAlias') && (await page.inputValue('#aliasInput')) === 'Ninja7', 'aventura pide alias con el último escrito');
      await page.fill('#aliasInput', 'Pitagoras');
      await page.click('#bAliasOk');
      ok(await page.isVisible('#sLevels'), 'mapa de aventura abierto');
      ok(await page.evaluate(() => document.querySelectorAll('.level:not([disabled])').length === 1), 'alias nuevo: solo el nivel 1 desbloqueado');
      await page.click('#sLevels >> [data-back]');
      await page.click('#menuAlias');
      ok(await page.evaluate(() => document.querySelectorAll('#aliasChips .chip').length === 2), 'chips con los alias del dispositivo');
      await page.click('#aliasChips >> text=Ninja7');
      ok(await page.evaluate(() => window.__IN.save().profiles.ninja7.levels[6].stars >= 1), 'Ninja7 conserva su progreso');
      // configuración docente: intervalo −5..5, sin multiplicar
      await page.evaluate(() => {
        const s = window.__IN.save(); Object.assign(s.teacher, { on: true, add: true, sub: false, mul: false, div: false, min: -5, max: 5, bombs: false, specials: false, exact: true, filter: false });
        window.__IN.newGame('classic');
        window.__seen = [];
        const g = () => window.__IN.game;
        window.__spy = setInterval(() => { g() && g().fruits.forEach((f) => window.__seen.push(f.op)); }, 100);
      });
      await sleep(7000);
      const seen = await page.evaluate(() => { clearInterval(window.__spy); return window.__seen; });
      ok(seen.length > 10, `fruitas observadas con config. docente: ${seen.length}`);
      ok(seen.every((op) => op.type === 'num' && op.v >= -5 && op.v <= 5 && op.v !== 0), 'config. docente respetada: solo sumas entre −5 y +5, sin bombas ni especiales');
      await page.evaluate(() => { window.__IN.save().teacher.on = false; window.__IN.goMenu(); });

      // menús
      for (const [btn, sel] of [['⚔️ PERSONALIZACIÓN', '#sCustom'], ['🏆 LOGROS', '#sAchievements'], ['⚙️ AJUSTES', '#sSettings']]) {
        await page.click(`text=${btn}`);
        ok(await page.isVisible(sel), 'pantalla ' + btn);
        await page.screenshot({ path: `${SHOTS}/movil-${sel.slice(2).toLowerCase()}.png` });
        await page.click(`${sel} >> [data-back]`);
        await sleep(150);
      }
      // estadísticas y CSV
      await page.click('text=⚙️ AJUSTES');
      await page.click('text=👩‍🏫 Configuración docente');
      ok(await page.isVisible('#sTeacher'), 'configuración docente abre');
      ok((await page.textContent('#statsBox')).includes('partidas'), 'estadísticas locales visibles');
      const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#bCsv')]);
      const csvPath = await dl.path();
      const csv = fs.readFileSync(csvPath, 'utf8');
      ok(csv.split('\n')[0].includes('puntos') && csv.split('\n')[0].includes('alias') && !/nombre|email/i.test(csv), 'CSV exportado con alias y sin otros datos personales');
      await page.screenshot({ path: `${SHOTS}/movil-docente.png` });
    }

    // rendimiento: fotogramas por segundo durante una partida
    await page.evaluate(() => window.__IN.newGame('arcade'));
    await sleep(2500);
    const fps = await page.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else res(n / 2); }; requestAnimationFrame(f); }));
    ok(fps >= 45, `rendimiento: ${fps.toFixed(0)} fps`);
    await page.screenshot({ path: `${SHOTS}/${device.name}-arcade.png` });
    ok(await page.evaluate(() => !!window.__IN.game.boss && window.__IN.game.boss.id === 'duende'), 'arcade: aparece el primer rival');

    ok(errors.length === 0, 'sin errores de JavaScript' + (errors.length ? ': ' + errors.slice(0, 5).join(' | ') : ''));
    await ctx.close();
  }
  await browser.close();
  console.log(`\nNavegador: ${checks} comprobaciones, ${fails} fallos`);
  process.exit(fails ? 1 : 0);
})();
