// FRACTION MERGE y portada · prueba en un navegador real (Chromium con Playwright), con GESTOS TÁCTILES.
// Uso:  node tests/fraction_merge_navegador.test.js [carpeta_para_capturas]
// Juega una partida completa del nivel 1 deslizando el dedo, comprueba victoria, derrota, reinicio,
// guardado, errores con explicación, diseño en móvil/tableta/apaisado y el portal.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const RAIZ = path.join(__dirname, ".."), CAP = process.argv[2] || "";
const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json",
  ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".ico": "image/x-icon" };
const srv = http.createServer((q, r) => {
  let f = path.join(RAIZ, decodeURIComponent(q.url.split("?")[0])); if (f.endsWith(path.sep) || q.url.endsWith("/")) f = path.join(f, "index.html");
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "content-type": TIPOS[path.extname(f)] || "application/octet-stream" }); r.end(d); } });
});
let fallos = 0;
const ok = (n, c, extra = "") => { console.log((c ? "✓ " : "✗ ") + n + (c ? "" : "  → " + extra)); if (!c) fallos++; };
const foto = async (p, n) => { if (CAP) await p.screenshot({ path: path.join(CAP, n + ".png") }); };

(async () => {
  await new Promise(s => srv.listen(0, "127.0.0.1", s));
  const BASE = `http://127.0.0.1:${srv.address().port}/`;
  const nav = await chromium.launch();
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage(), errores = [];
  p.on("console", m => m.type() === "error" && errores.push(m.text())); p.on("pageerror", e => errores.push(String(e)));
  const cdp = await ctx.newCDPSession(p);
  // Deslizamiento real con el dedo sobre el tablero
  async function deslizar(dir) {
    const r = await p.evaluate(() => { const b = document.querySelector("#tablero").getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
    const d = { izq: [-120, 0], der: [120, 0], arr: [0, -120], aba: [0, 120] }[dir];
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: r.x, y: r.y }] });
    for (let i = 1; i <= 4; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: r.x + d[0] * i / 4, y: r.y + d[1] * i / 4 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await p.waitForTimeout(190);
  }
  const tocarFicha = async i => { const b = await p.locator(`#tablero .ficha[data-i="${i}"]`).boundingBox(); await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await p.waitForTimeout(120); };
  // Jugador automático: decide con el estado del juego, pero actúa con el dedo.
  const decide = (entregar) => p.evaluate((entregar) => {
    const J = __FM.J, M = FraccionMotor;
    if (!J || J.fin) return { fin: true };
    if (entregar) for (let i = 0; i < J.t.g.length; i++) if (J.abiertos.some(q => M.coincide(J.t.g[i], q))) return { toca: i };
    let mejor = null, nota = -1e9;
    for (const d of ["izq", "der", "arr", "aba"]) {
      const c = M.clonar(J.t); if (!M.mover(c, d).movido) continue;
      let s = M.vacias(c).length + Math.random() * 3;
      for (const f of M.fichas(c)) { if (J.abiertos.some(q => q && M.igual(q, f))) s += 100; }
      if (s > nota) { nota = s; mejor = d; }
    }
    return { dir: mejor, movs: J.movs };
  }, entregar);
  async function jugar(entregar, tope = 200) {
    for (let k = 0; k < tope; k++) {
      const a = await decide(entregar);
      if (a.fin) return true;
      if (a.toca != null) await tocarFicha(a.toca); else if (a.dir) await deslizar(a.dir); else return false;
    }
    return false;
  }
  const encaja = () => p.evaluate(() => {
    const fuera = [...document.querySelectorAll("#pJuego #hud > *, #pedidos > *, #tablero, #poderes > *")].filter(e => { const r = e.getBoundingClientRect(); return r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1; });
    const b = document.querySelector("#tablero").getBoundingClientRect();
    return { fuera: fuera.length, scroll: document.documentElement.scrollWidth > innerWidth || document.documentElement.scrollHeight > innerHeight, lado: Math.round(b.width) };
  });

  // ---------- 1. Arranque ----------
  await p.goto(BASE + "applets/fraction-merge/index.html"); await p.waitForTimeout(400);
  ok("El juego arranca sin errores de consola", !errores.length, errores.join(" | "));
  ok("Fuente Lato cargada en local", await p.evaluate(() => document.fonts.check("900 16px Lato")));
  ok("Carga el botón ← πCHU (volver.js)", await p.locator("#pichu-volver").count() === 1);
  const peq = await p.evaluate(() => [...document.querySelectorAll("#pMenu button")].filter(b => b.getBoundingClientRect().height < 44).length);
  ok("Botones del menú de 44 px o más", peq === 0, peq);
  await foto(p, "fm_menu_movil");

  // ---------- 2. Partida completa del nivel 1 con el dedo ----------
  await p.locator("#bJugar").tap(); await p.waitForTimeout(500);
  ok("Empieza el nivel 1", await p.evaluate(() => __FM.J && __FM.J.niv.id === 1));
  let m = await encaja();
  ok("Móvil 390×844: nada cortado y sin barras de desplazamiento", m.fuera === 0 && !m.scroll && m.lado > 300, JSON.stringify(m));
  const antes = await p.evaluate(() => JSON.stringify(__FM.J.t.g.map(c => c && c.id)));
  await deslizar("izq"); await deslizar("aba");
  ok("Deslizar con el dedo mueve las fichas", antes !== await p.evaluate(() => JSON.stringify(__FM.J.t.g.map(c => c && c.id))));
  await foto(p, "fm_partida_movil");
  ok("Se completa el nivel 1 jugando", await jugar(true));
  await p.waitForTimeout(900);
  ok("Pantalla de victoria con estrellas", await p.locator("#capa.ver .estrellas").count() === 1 && /superado/.test(await p.locator("#ventana h2").innerText()));
  await foto(p, "fm_victoria");
  const g1 = await p.evaluate(() => ({ pm: JSON.parse(localStorage.getItem("pichu.fraction-merge.v1")), mq: JSON.parse(localStorage.getItem("pichu.mathquest.v1")) }));
  ok("El progreso se guarda (estrellas, XP y monedas)", g1.pm.estrellas[1] >= 1 && g1.mq.xp > 0 && g1.mq.monedas > 0 && g1.mq.juegos["fraction-merge"].superados === 1, JSON.stringify(g1.mq));
  ok("Logro «Primera suma» conseguido", !!g1.mq.logros["fm.primera"]);

  // ---------- 3. Siguiente nivel, error con explicación y derrota ----------
  await p.locator('#ventana [data-a="jugar"]').first().tap(); await p.waitForTimeout(500);
  ok("«Siguiente» abre el nivel 2", await p.evaluate(() => __FM.J.niv.id === 2 && !__FM.J.fin));
  // Preparamos un error: piden 3/4 y se entrega 1/2
  await p.evaluate(() => { const J = __FM.J, M = FraccionMotor; J.t.g.fill(null); M.ponerFicha(J.t, 5, 1, 2);
    J.abiertos = [[3, 4], [5, 8], [7, 8]].map(([n, d]) => Object.assign(M.hacerPedido("frac", { n, d }, J.t.rng, J.niv), { pista: 0 })); __FM.deslizar("arr"); });
  await p.waitForTimeout(250);
  const iMal = await p.evaluate(() => __FM.J.t.g.findIndex(c => c && c.n === 1 && c.d === 2));
  await tocarFicha(iMal);
  const txtErr = await p.locator("#ventana").innerText();
  ok("Un error enseña la explicación matemática y da una segunda oportunidad", /Te falta/.test(txtErr) && /segunda oportunidad/.test(txtErr), txtErr);
  await foto(p, "fm_error");
  await p.locator('#ventana [data-a="cerrar"]').tap();
  ok("Tras el error la partida sigue", await p.evaluate(() => !__FM.J.fin && __FM.J.errores === 1));
  await p.locator('.pedido[data-k="0"]').tap();
  ok("Tocar un pedido da una pista", /💡/.test(await p.locator("#cinta").innerText()));
  await p.evaluate(() => { __FM.J.movs = 3; });
  await jugar(false, 12);
  if (await p.locator("#ultimo.ver").count()) await p.locator("#bTerminar").tap();
  await p.waitForTimeout(900);
  const txtDer = await p.locator("#ventana").innerText();
  ok("Pantalla de derrota con consejo y movimientos extra", /Sin movimientos|bloqueado/.test(txtDer) && /Consejo/.test(txtDer) && /extra/.test(txtDer), txtDer);
  await foto(p, "fm_derrota");
  await p.locator('#ventana [data-a="jugar"]').tap(); await p.waitForTimeout(500);
  const re = await p.evaluate(() => __FM.J ? { id: __FM.J.niv.id, fin: __FM.J.fin, hechos: __FM.J.hechos, movs: __FM.J.movs } : null);
  ok("«Reintentar» reinicia el nivel con movimientos extra", re && re.id === 2 && !re.fin && re.hechos === 0 && re.movs > 40, JSON.stringify(re));

  // ---------- 4. El progreso sigue ahí al recargar ----------
  await p.reload(); await p.waitForTimeout(400);
  await p.locator("#bNiveles").tap(); await p.waitForTimeout(200);
  ok("Tras recargar: nivel 1 con estrellas y nivel 2 abierto", await p.evaluate(() => !document.querySelector('[data-niv="2"]').disabled && document.querySelector('[data-niv="5"]').disabled && __FM.S.estrellas[1] >= 1));
  await foto(p, "fm_niveles");

  // ---------- 5. Poderes y jefe (niveles avanzados) ----------
  await p.evaluate(() => { for (let i = 1; i <= 12; i++) __FM.S.estrellas[i] = 2; __FM.empezar(13); });
  await p.waitForTimeout(400);
  await p.evaluate(() => { const J = __FM.J, M = FraccionMotor; J.t.g.fill(null); M.ponerFicha(J.t, 0, 2, 3); M.ponerFicha(J.t, 4, 1, 12); J.abiertos = [null, null, null]; });
  await deslizar("aba");
  await p.locator('.poder[data-p="partir"]').tap();
  let i2 = await p.evaluate(() => __FM.J.t.g.findIndex(c => c && c.n === 2 && c.d === 3)); await tocarFicha(i2);
  ok("Poder ✂: 2/3 se parte en dos fichas de 1/3", await p.evaluate(() => __FM.J.t.g.filter(c => c && c.n === 1 && c.d === 3).length >= 2 && __FM.J.cargas.partir === 1),
    await p.evaluate(() => JSON.stringify({ g: __FM.J.t.g.map(c => c && c.n + "/" + c.d), c: __FM.J.cargas })));
  await p.locator('.poder[data-p="partir"]').tap();
  i2 = await p.evaluate(() => __FM.J.t.g.findIndex(c => c && c.d === 12)); await tocarFicha(i2);
  ok("Poder ✂ con 1/12: explica que no hay veinticuatroavos y no gasta el poder", /24/.test(await p.locator("#ventana").innerText()) && await p.evaluate(() => __FM.J.cargas.partir === 1));
  await p.locator('#ventana [data-a="cerrar"]').tap();
  for (let k = 0; k < 8; k++) await deslizar(["izq", "aba", "der", "arr"][k % 4]);
  ok("El jefe ataca (roca o hielo)", await p.evaluate(() => __FM.J.jefe.ataques >= 1));
  await foto(p, "fm_jefe");
  m = await encaja(); ok("Nivel del jefe en móvil: nada cortado", m.fuera === 0 && !m.scroll, JSON.stringify(m));

  // ---------- 6. Otros tamaños ----------
  for (const [nombre, w, h] of [["móvil pequeño 320×568", 320, 568], ["móvil apaisado 844×390", 844, 390], ["tableta 820×1180", 820, 1180], ["tableta apaisada 1180×820", 1180, 820], ["ordenador 1366×768", 1366, 768]]) {
    await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(300);
    m = await encaja();
    ok(`${nombre}: nada cortado, sin desplazamiento, tablero de ${m.lado} px`, m.fuera === 0 && !m.scroll && m.lado >= 200, JSON.stringify(m));
    await foto(p, "fm_" + w + "x" + h);
  }
  const nAntes = await p.evaluate(() => __FM.J.nMov);
  for (const t of ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"]) { await p.keyboard.press(t); await p.waitForTimeout(200); }
  ok("También funciona con teclado (flechas)", await p.evaluate(n => __FM.J.nMov > n, nAntes));

  // ---------- 7. La portada es el mapa de mundos ----------
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto(BASE + "index.html"); await p.waitForTimeout(600);
  ok("Portada: mapa con 11 mundos", await p.locator(".mundo").count() === 11);
  ok("Portada: 4 mundos se pueden abrir", await p.locator("a.mundo").count() === 4, await p.locator("a.mundo").count());
  ok("Portada: enseña el progreso de Fraction Merge", /de 13 niveles/.test(await p.locator('a.mundo[href*="fraction-merge"]').innerText()));
  ok("Portada: Fracciones marcado «Ahora en clase»", /Ahora en clase/.test(await p.locator(".mundo.ahora").innerText()) && /Fraction Merge/.test(await p.locator(".mundo.ahora").innerText()));
  ok("Portada: logo, mascota y centro", await p.locator("img.logo").count() === 1 && await p.locator(".portada img").count() === 1 && /IES Alarifes Ruiz Florindo/.test(await p.locator("#centro").innerText()));
  ok("Portada: sin desplazamiento horizontal", await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  ok("Portada: botones de 44 px o más", await p.evaluate(() => [...document.querySelectorAll(".progreso .boton")].every(b => b.getBoundingClientRect().height >= 44)));
  if (CAP) await p.screenshot({ path: path.join(CAP, "portada_movil.png"), fullPage: true });
  await p.locator("#bLogros").tap(); await p.waitForTimeout(200);
  ok("Portada: lista de logros", await p.locator("#ventana .item").count() >= 28);
  await foto(p, "portada_logros");
  await p.locator("#ventana [data-cerrar]").tap();
  await p.locator("#bContinuar").tap(); await p.waitForTimeout(500);
  ok("Portada: «Continuar» abre el último juego", p.url().includes("fraction-merge"));
  ok("Sin errores de consola en toda la prueba", !errores.length, errores.join(" | "));

  await nav.close(); srv.close();
  console.log(fallos ? `\n${fallos} comprobaciones fallidas` : "\nTodo correcto");
  process.exit(fallos ? 1 : 0);
})();
