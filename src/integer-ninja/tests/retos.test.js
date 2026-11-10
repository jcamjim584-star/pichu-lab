/* Pruebas de retos por código y ranking en vivo (Apps Script simulado) */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const { createGas } = require('./gas-mock');
const FILE = 'file://' + path.resolve(__dirname, '../dist/index.html');
const SHOTS = path.resolve(__dirname, '../shots');
let checks = 0, fails = 0;
const ok = (c, m) => { checks++; if (!c) { fails++; console.error('✗ ' + m); } else console.log('✓ ' + m); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SCRIPT_ID = 'AKfycbTEST_1234567890abcdefghij';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|fonts\.g/.test(m.text())) errors.push(m.text()); });
  const G = createGas('pizarra42');
  let calls = 0;
  await ctx.route('https://script.google.com/**', async (route) => {
    calls++;
    const req = route.request();
    let body;
    if (req.method() === 'POST') body = G.post(JSON.parse(req.postData()));
    else body = G.get(Object.fromEntries(new URL(req.url()).searchParams));
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) });
  });

  /* ---------- 1. Retos por código (sin conexión) ---------- */
  await page.goto(FILE);
  await sleep(900);
  await page.click('text=🥊 RETOS Y RANKING');
  await page.fill('#aliasInput', 'Ninja7');
  await page.click('#bAliasOk');
  ok(await page.isVisible('#sRetos'), 'pantalla de retos');
  ok((await page.textContent('#onlineStatus')).includes('Sin ranking en vivo'), 'sin conexión: aviso de que los retos van por código');
  await page.screenshot({ path: `${SHOTS}/retos-offline.png` });
  // misma semilla → mismos objetivos, aunque se juegue distinto
  const seq = await page.evaluate(() => {
    const out = [];
    for (let k = 0; k < 2; k++) {
      window.__IN.newGame('duel', null, { seed: 4242, math: 1, decide: true });
      const g = window.__IN.game, ts = [g.T];
      for (let i = 0; i < 6; i++) { g.A = i * 7 - 3; window.__IN.newRound(false); ts.push(g.T); }
      out.push(ts.join(','));
    }
    window.__IN.goMenu();
    return out;
  });
  ok(seq[0] === seq[1], 'misma semilla, misma secuencia de objetivos: ' + seq[0]);
  // crear un reto jugando
  await page.click('text=🥊 RETOS Y RANKING');
  await page.click('#bAliasOk');
  await page.selectOption('#duelMath', '1');
  await page.click('#bDuelCreate');
  await sleep(400);
  const g1 = await page.evaluate(() => ({ mode: window.__IN.game.mode, t: window.__IN.game.timeLeft, relaxed: window.__IN.game.relaxed, seed: window.__IN.game.seed }));
  ok(g1.mode === 'duel' && g1.t > 88 && g1.t <= 90 && !g1.relaxed, 'partida de reto: 90 s y sin modo relajado');
  await page.evaluate(() => { const g = window.__IN.game; g.score = 1840; g.timeLeft = 0.2; });
  await sleep(1500);
  ok(await page.isVisible('#rDuel'), 'al terminar aparece el código de reto');
  const code = (await page.textContent('#rDuel .duel-code')).trim();
  const dec = await page.evaluate((c) => window.__IN.E.decodeDuel(c), code);
  ok(dec && dec.seed === g1.seed && dec.math === 1 && dec.score === 1840, `el código ${code} guarda semilla, dificultad y puntos`);
  await page.screenshot({ path: `${SHOTS}/reto-codigo.png` });
  // otro alumno acepta el reto con el código
  await page.click('#bMenu');
  await page.click('text=🥊 RETOS Y RANKING');
  await page.fill('#aliasInput', 'Hipatia');
  await page.click('#bAliasOk');
  await page.fill('#duelCodeIn', `Reto INTEGER NINJA de Ninja7: ${code} — supera mis 1840 puntos`);
  await page.click('#bDuelAccept');
  ok((await page.textContent('#duelInfo')).includes('Ninja7') && (await page.textContent('#duelInfo')).includes('1840'), 'código comprobado: reto de Ninja7, 1840 puntos');
  await page.screenshot({ path: `${SHOTS}/reto-aceptar.png` });
  await page.click('#bDuelAccept');
  await sleep(400);
  ok(await page.evaluate((s) => window.__IN.game.mode === 'duel' && window.__IN.game.seed === s && window.__IN.game.opts.challenge.score === 1840, g1.seed), 'Hipatia juega la misma partida');
  await page.evaluate(() => { const g = window.__IN.game; g.score = 2100; g.timeLeft = 0.2; });
  await sleep(1500);
  ok((await page.textContent('#rTitle')).includes('Reto superado'), 'Hipatia supera el reto');
  ok((await page.textContent('#rDuel')).includes('Ganas tú'), 'marcador del duelo');
  await page.screenshot({ path: `${SHOTS}/reto-ganado.png` });
  ok(await page.evaluate(() => !!window.__IN.save().profiles.hipatia.ach.duelwin), 'logro Duelista');
  // errata en el código
  await page.click('#bMenu');
  await page.click('text=🥊 RETOS Y RANKING');
  await page.click('#bAliasOk');
  await page.fill('#duelCodeIn', code.slice(0, 7) + (code[7] === 'A' ? 'B' : 'A'));
  await page.click('#bDuelAccept');
  ok((await page.textContent('#duelInfo')).includes('no válido'), 'código con errata rechazado');
  // ranking local
  await page.click('.tabs [data-tab="rank"]');
  await page.click('.seg [data-rk="duel"]');
  await sleep(200);
  const loc = await page.$$eval('#rankList li .who', (els) => els.map((e) => e.textContent));
  ok(loc[0] === 'Hipatia' && loc[1] === 'Ninja7', 'ranking local de retos: ' + loc.join(', '));

  /* ---------- 2. Ranking en vivo con el enlace de clase ---------- */
  const link = await page.evaluate((id) => { window.__IN.save().online = { u: id, k: 'pizarra42', g: '1.º ESO C' }; return window.__IN.classLink(); }, SCRIPT_ID);
  ok(link.includes('?clase='), 'enlace de clase generado');
  await page.evaluate(() => { delete window.__IN.save().online; localStorage.setItem('pichu.integerNinja.v1', JSON.stringify(window.__IN.save())); });
  await page.goto(FILE + '?' + link.split('?')[1]);
  await sleep(1000);
  ok(await page.evaluate(() => window.__IN.save().online && window.__IN.save().online.k === 'pizarra42' && window.__IN.save().online.g === '1.º ESO C'), 'el enlace de clase conecta el dispositivo');
  // Ninja7 juega un clásico: la puntuación llega a la Hoja
  await page.evaluate(() => { window.__IN.save().alias = 'Ninja7'; window.__IN.newGame('classic'); });
  await sleep(300);
  await page.evaluate(() => { const g = window.__IN.game; g.score = 1500; g.timeLeft = 0.2; });
  await sleep(2200);
  const rowsP = G.sheets.Puntuaciones ? G.sheets.Puntuaciones.data.slice(1) : [];
  ok(rowsP.some((r) => r[2] === 'Ninja7' && r[3] === 'classic' && r[5] === 1500 && r[1] === '1.º ESO C'), 'puntuación guardada en la Hoja (simulada)');
  ok((await page.textContent('#rRank')).includes('Puesto 1'), 'resultado muestra el puesto en la clase');
  await page.screenshot({ path: `${SHOTS}/ranking-puesto.png` });
  // Ninja7 reta a Hipatia
  await page.click('#bMenu');
  await page.click('text=🥊 RETOS Y RANKING');
  await page.click('#bAliasOk');
  await sleep(600);
  ok((await page.textContent('#onlineStatus')).includes('Conectado'), 'estado: conectado a la clase');
  await page.fill('#duelRival', 'Hipatia');
  await page.click('#bDuelCreate');
  await sleep(300);
  await page.evaluate(() => { const g = window.__IN.game; g.score = 1700; g.timeLeft = 0.2; });
  await sleep(2200);
  ok((await page.textContent('#rDuel')).includes('Reto enviado a'), 'aviso de reto enviado');
  const retoRow = (G.sheets.Retos ? G.sheets.Retos.data.slice(1) : []).find((r) => r[3] === 'Ninja7' && r[4] === 'Hipatia');
  ok(retoRow && retoRow[6] === 1700 && retoRow[7] === 'pendiente', 'reto guardado en la Hoja');
  // Hipatia ve el reto en su bandeja y lo juega
  await page.click('#bMenu');
  await page.click('#menuAlias');
  await page.fill('#aliasInput', 'Hipatia');
  await page.click('#bAliasOk');
  await sleep(800);
  ok((await page.textContent('#retosBadge')).trim() === '1' && await page.isVisible('#retosBadge'), 'insignia: 1 reto pendiente en el menú');
  await page.screenshot({ path: `${SHOTS}/menu-insignia.png` });
  await page.click('text=🥊 RETOS Y RANKING');
  await page.click('#bAliasOk');
  await sleep(800);
  ok((await page.textContent('#inbox')).includes('Ninja7 te reta'), 'bandeja de Hipatia con el reto');
  await page.screenshot({ path: `${SHOTS}/retos-bandeja.png` });
  await page.click('#inbox [data-accept]');
  await sleep(300);
  ok(await page.evaluate((s) => window.__IN.game.mode === 'duel' && window.__IN.game.opts.challenge.id && window.__IN.game.opts.challenge.score === 1700, 0), 'reto aceptado desde la bandeja');
  await page.evaluate(() => { const g = window.__IN.game; g.score = 1650; g.timeLeft = 0.2; });
  await sleep(2200);
  const done = (G.sheets.Retos.data.slice(1)).find((r) => r[3] === 'Ninja7' && r[4] === 'Hipatia');
  ok(done[7] === 'jugado' && done[8] === 1650 && done[9] === 'Ninja7', 'resultado del reto en la Hoja: gana Ninja7');
  ok((await page.textContent('#rTitle')).includes('no superado'), 'Hipatia ve que no lo ha superado');
  // ranking en vivo
  await page.click('#bMenu');
  await page.click('text=🥊 RETOS Y RANKING');
  await page.click('#bAliasOk');
  await page.click('.tabs [data-tab="rank"]');
  await page.click('.seg [data-rk="duel"]');
  await sleep(700);
  ok((await page.textContent('#rankSource')).includes('Ranking en vivo'), 'ranking en vivo desde la Hoja');
  const live = await page.$$eval('#rankList li .who', (els) => els.map((e) => e.textContent));
  ok(live[0] === 'Ninja7' && live.includes('Hipatia'), 'ranking de retos de la clase: ' + live.join(', '));
  await page.screenshot({ path: `${SHOTS}/ranking-vivo.png` });
  // sin red: la puntuación espera en la cola y se envía después
  await ctx.unroute('https://script.google.com/**');
  await ctx.route('https://script.google.com/**', (route) => route.abort());
  await page.evaluate(() => { window.__IN.newGame('classic'); });
  await sleep(300);
  await page.evaluate(() => { const g = window.__IN.game; g.score = 999; g.timeLeft = 0.2; });
  await sleep(2000);
  ok(await page.evaluate(() => window.__IN.save().onlineQueue.length === 1), 'sin red: la puntuación queda en cola');
  await ctx.unroute('https://script.google.com/**');
  await ctx.route('https://script.google.com/**', async (route) => {
    const req = route.request();
    const body = req.method() === 'POST' ? G.post(JSON.parse(req.postData())) : G.get(Object.fromEntries(new URL(req.url()).searchParams));
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) });
  });
  await page.evaluate(() => window.__IN.Online.flush());
  await sleep(800);
  ok(await page.evaluate(() => window.__IN.save().onlineQueue.length === 0), 'al volver la red, la cola se envía');
  ok(G.sheets.Puntuaciones.data.some((r) => r[2] === 'Hipatia' && r[5] === 999), 'puntuación pendiente guardada');
  ok(errors.length === 0, 'sin errores de JavaScript' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  console.log(`Retos y ranking: ${checks} comprobaciones, ${fails} fallos (${calls} llamadas a la Hoja simulada)`);
  process.exit(fails ? 1 : 0);
})();
