// Pruebas de Pizza Duel en Chrome (Playwright).
// Uso (desde la carpeta del repositorio):  node tests/prueba_pizza_duel.mjs [carpeta_capturas]
// Levanta un servidor local propio, juega duelos de verdad y comprueba guardado, reglas y diseño.
import { createRequire } from "node:module";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const CAP = process.argv[2] || null;
if (CAP) fs.mkdirSync(CAP, { recursive: true });
const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".webmanifest": "application/manifest+json" };
const srv = http.createServer((req, res) => {
  let f = path.join(RAIZ, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!f.startsWith(RAIZ) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": TIPOS[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
}).listen(0);
const BASE = `http://127.0.0.1:${srv.address().port}`;
const URL_JUEGO = `${BASE}/applets/pizzeria/`;

const res = [];
const ok = (n, c, e = "") => { res.push([n, !!c, e]); };
const espera = ms => new Promise(r => setTimeout(r, ms));

// Pone en el mostrador las pizzas justas para servir la comanda con el mínimo de porciones y las mete en el plato.
// mal = true: sirve una cantidad equivocada a propósito.
const PREPARAR = `(mal) => { const Z = __pizzeria, G = Z.G, M = Z.M, p = G.t.ped;
  if (p.tipo === 'div_cuantas') return 'num';
  let cortes;
  if (mal) cortes = [2, 2, 2];
  else if (p.cond && p.cond.modo === 'iguales') { const [n, d] = p.cond.formas.reduce((a, f) => +f.split('/')[0] < +a.split('/')[0] ? f : a).split('/').map(Number); cortes = Array(n).fill(d); }
  else cortes = M.descomposicionMinima(p.objetivo, G.rival.cfg.dens);
  for (const d of cortes) { const id = 5000 + Math.floor(Math.random() * 1e6); G.pizzas.push({ id, d, por: Array(d).fill('m') }); Z.meterPorcion(id, 0); }
  return cortes.length; }`;

async function servirBien(p) { await p.evaluate(`(${PREPARAR})(false)`); await p.click("[data-servir]"); await espera(60); }
async function siguiente(p) { await p.waitForFunction(() => { const G = __pizzeria.G; return G.fin || !G.ocupado; }, null, { timeout: 5000 }); }

const b = await chromium.launch();
const errores = [], externas = [];
async function nueva(vista = { width: 1366, height: 768 }, alPrincipio) {
  const ctx = await b.newContext({ viewport: vista });
  const p = await ctx.newPage();
  p.on("console", m => { if (m.type() === "error") errores.push(m.text()); });
  p.on("pageerror", e => errores.push(e.message));
  p.on("request", r => { if (!r.url().startsWith(BASE) && !r.url().startsWith("data:")) externas.push(r.url()); });
  if (alPrincipio) await p.addInitScript(alPrincipio);
  await p.goto(URL_JUEGO);
  await p.waitForFunction(() => window.__pizzeria);
  return { ctx, p };
}
const foto = async (p, n) => { if (CAP) await p.screenshot({ path: path.join(CAP, n + ".png") }); };

// 1) Mapa
{
  const { ctx, p } = await nueva();
  const tarjetas = await p.$$eval("[data-rival]", els => els.map(e => ({ id: +e.dataset.rival, off: e.disabled, txt: e.textContent })));
  ok("Mapa: 8 rivales", tarjetas.length === 8);
  ok("Mapa: Salsita abierta y El Compás bloqueado", !tarjetas[0].off && tarjetas[1].off);
  ok("Mapa: rivales 3-8 «Próximamente»", tarjetas.slice(2).every(t => t.off && /Próximamente/.test(t.txt)));
  ok("Mapa: el botón propone a Salsita", /Salsita/.test(await p.textContent("#btnJugar")));
  ok("Guardado v3 creado", await p.evaluate(() => !!localStorage.getItem("pichu.pizzeria.v3")));
  await foto(p, "01_mapa");
  await ctx.close();
}

// 2) Migración desde Pizza Rush (v2) sin borrar la clave antigua
{
  const { ctx, p } = await nueva(undefined, () => { if (!sessionStorage.getItem("hecho")) { sessionStorage.setItem("hecho", "1"); localStorage.setItem("pichu.pizzeria.v2", JSON.stringify({ estrellas: { 1: 2 }, monedas: 300, tutorial: true, ajustes: { musica: false } })); } });
  const d = await p.evaluate(() => ({ e: __pizzeria.D.estrellas, tut: __pizzeria.D.tutorial, mus: __pizzeria.AJ.musica, v2: localStorage.getItem("pichu.pizzeria.v2") }));
  ok("Migración: estrellas del turno 1 → Salsita", d.e[1] === 2, JSON.stringify(d.e));
  ok("Migración: tutorial y ajustes", d.tut === true && d.mus === false);
  ok("Migración: la clave v2 sigue ahí", !!d.v2);
  ok("Migración: El Compás desbloqueado", !(await p.$eval('[data-rival="2"]', e => e.disabled)));
  await ctx.close();
}

// 3) Salsita: tutorial, crítico, superpoder, ataques y victoria
{
  const { ctx, p } = await nueva();
  await p.click('[data-rival="1"]');
  ok("Presentación del duelo", /Salsita/.test(await p.textContent("#capaCaja")) && /Lee la/.test(await p.textContent("#capaCaja")));
  await foto(p, "02_presentacion");
  await p.click("#iEmpezar");
  let G = await p.evaluate(() => ({ obj: __pizzeria.G.t.ped.objetivo, sin: __pizzeria.G.t.sinPrisa }));
  ok("Tutorial: primera comanda 3/4 sin reloj", G.obj === 18 && G.sin);
  ok("Tutorial: el reloj muestra ∞", (await p.textContent("#reloj")).includes("∞"));
  // Servir 1/2 + 1/4 con clics reales
  await p.evaluate(() => { const Z = __pizzeria; Z.G.pizzas.push({ id: 801, d: 2, por: ["m", "m"] }, { id: 802, d: 4, por: ["m", "m", "m", "m"] }); Z.renderTodo(); });
  await p.click('.porcion[data-p="801"][data-i="0"]'); await p.click('.porcion[data-p="802"][data-i="0"]');
  ok("El plato muestra las porciones", (await p.$$(".plato .chip")).length === 2);
  await foto(p, "03_plato");
  await p.click("[data-servir]");
  G = await p.evaluate(() => ({ vida: __pizzeria.G.vida, carga: __pizzeria.G.carga, tut: __pizzeria.D.tutorial }));
  ok("Golpe crítico con el mínimo (−30)", G.vida === 50, G.vida);
  ok("El golpe carga el superpoder", G.carga === 1);
  ok("Tutorial marcado como hecho", G.tut === true);
  await foto(p, "04_golpe");
  await siguiente(p);
  // Fallo y segundo fallo → ataque
  const objetivo = await p.evaluate(() => __pizzeria.G.t.ped.objetivo);
  await p.evaluate(`(${PREPARAR})(true)`);
  if (objetivo !== 36) {
    await p.click("[data-servir]");
    ok("Primer fallo: sigue la comanda y avisa", await p.evaluate(() => __pizzeria.G.t.intentos === 1 && __pizzeria.G.corazones === 3) && /intento/.test(await p.textContent("#aviso")));
    await p.evaluate(`(${PREPARAR})(true)`); await p.click("[data-servir]");
    ok("Segundo fallo: el rival ataca (−1 corazón)", await p.evaluate(() => __pizzeria.G.corazones === 2));
    ok("El ataque enseña una forma de servirlo", /forma de servirlo/.test(await p.textContent("#aviso")));
    ok("El ataque vacía la carga del superpoder", await p.evaluate(() => __pizzeria.G.carga === 0));
    await foto(p, "05_ataque");
    await siguiente(p);
  }
  // Reloj: si se acaba el tiempo, ataca
  await p.evaluate(() => { __pizzeria.G.t.resto = 0.05; });
  await espera(300);
  ok("Se acaba el tiempo: el rival ataca", await p.evaluate(() => __pizzeria.G.corazones) === (objetivo !== 36 ? 1 : 2));
  await siguiente(p);
  // Pausa: el reloj no corre
  await p.keyboard.press("p");
  const r0 = await p.evaluate(() => __pizzeria.G.t.resto); await espera(600);
  ok("Pausa con P: el reloj se para", await p.evaluate(r => __pizzeria.G.pausa && __pizzeria.G.t.resto === r, r0));
  await p.click("#pSeguir");
  // Tres golpes → superpoder
  await p.evaluate(() => { __pizzeria.G.vida = 80; __pizzeria.G.carga = 2; __pizzeria.renderTodo(); });
  await servirBien(p); await siguiente(p);
  ok("Con 3 golpes el superpoder está listo", await p.evaluate(() => __pizzeria.G.carga === 3) && !(await p.$eval("[data-super]", e => e.disabled)));
  const vAntes = await p.evaluate(() => { __pizzeria.G.vida = 80; __pizzeria.renderTodo(); return 80; });
  await p.keyboard.press("s");
  ok("Superpoder con S: reloj congelado y golpe doble", await p.evaluate(() => __pizzeria.G.superActivo && __pizzeria.G.congelado > 7));
  ok("Reloj congelado a la vista", (await p.textContent("#reloj")).includes("❄"));
  await foto(p, "06_superpoder");
  await servirBien(p);
  const vDespues = await p.evaluate(() => __pizzeria.G.vida);
  ok("El golpe con superpoder hace doble daño", vAntes - vDespues >= 60, `${vAntes} → ${vDespues}`);
  await siguiente(p);
  // Rematar
  for (let i = 0; i < 6 && !(await p.evaluate(() => __pizzeria.G.fin)); i++) { await servirBien(p); await siguiente(p); }
  await p.waitForSelector("#fRevancha", { timeout: 4000 });
  const fin = await p.evaluate(() => ({ e: __pizzeria.D.estrellas[1], v3: JSON.parse(localStorage.getItem("pichu.pizzeria.v3")).estrellas[1], txt: document.querySelector("#capaCaja").textContent }));
  ok("Victoria contra Salsita", /Victoria/.test(fin.txt));
  ok("Estrellas según corazones (1 corazón → ★)", fin.e >= 1 && fin.e === fin.v3, JSON.stringify(fin));
  ok("Desbloquea a El Compás", /El Compás/.test(fin.txt) && !!(await p.$("#fSig")));
  await foto(p, "07_victoria");
  // 4) El Compás: regla de porciones iguales
  await p.click("#fSig"); await p.click("#iEmpezar");
  const ped = await p.evaluate(() => __pizzeria.G.t.ped);
  ok("El Compás: la comanda lleva la regla de iguales", ped.cond && ped.cond.modo === "iguales");
  ok("El Compás: la regla se ve en la comanda", /IGUALES/.test(await p.textContent(".comanda")));
  // Servir el objetivo con porciones distintas (si se puede) → fallo con pista
  const mezcla = await p.evaluate(() => { const Z = __pizzeria, G = Z.G, M = Z.M, p = G.t.ped;
    const sol = M.descomposicionMinima(p.objetivo, G.rival.cfg.dens); let alt = null;
    // busca dos cortes distintos a + b = objetivo
    for (const a of [2, 3, 4, 6]) for (const b of [2, 3, 4, 6]) if (a !== b && 24 / a + 24 / b === p.objetivo) alt = [a, b];
    if (!alt) return false;
    for (const d of alt) { const id = 7000 + Math.floor(Math.random() * 1e6); G.pizzas.push({ id, d, por: Array(d).fill("m") }); Z.meterPorcion(id, 0); }
    return true; });
  if (mezcla) {
    await p.click("[data-servir]");
    ok("El Compás: porciones distintas no valen y explica la equivalencia", /IGUALES/.test(await p.textContent("#aviso")) && /=/.test(await p.textContent("#aviso")));
    await foto(p, "08_compas_regla");
  }
  await servirBien(p);
  ok("El Compás: con porciones iguales sí golpea", await p.evaluate(() => __pizzeria.G.vida < 100));
  await foto(p, "09_compas");
  await siguiente(p);
  // Derrota
  await p.evaluate(() => { __pizzeria.G.corazones = 1; });
  await p.evaluate(() => { __pizzeria.G.t.resto = 0.05; });
  await p.waitForSelector("#fRevancha", { timeout: 4000 });
  ok("Derrota al perder el último corazón", /Derrota/.test(await p.textContent("#capaCaja")));
  await foto(p, "10_derrota");
  await p.click("#fMapa");
  ok("Vuelta al mapa con estrellas", /★/.test(await p.textContent('[data-rival="1"]')));
  await ctx.close();
}

// 5) Teclado y modo tranquilo
{
  const { ctx, p } = await nueva(undefined, () => { if (!sessionStorage.getItem("h")) { sessionStorage.setItem("h", "1"); localStorage.setItem("pichu.pizzeria.v3", JSON.stringify({ estrellas: { 1: 1 }, tutorial: true, ajustes: { tranquilo: true, musica: false } })); } });
  await p.click('[data-rival="1"]'); await p.click("#iEmpezar");
  const r0 = await p.evaluate(() => __pizzeria.G.t.resto); await espera(500);
  ok("Modo tranquilo: sin reloj", await p.evaluate(r => __pizzeria.G.t.resto === r, r0) && (await p.textContent("#reloj")).includes("∞"));
  // Teclado: llevar el foco a una porción y pulsar Enter
  await p.evaluate(() => { const Z = __pizzeria; Z.G.pizzas.push({ id: 901, d: 2, por: ["m", "m"] }); Z.renderTodo(); document.querySelector('.porcion[data-p="901"]').focus(); });
  await p.keyboard.press("Enter");
  ok("Teclado: Enter mete la porción", await p.evaluate(() => __pizzeria.G.t.caja.length === 1));
  await p.keyboard.press("v");
  ok("Teclado: V vacía el plato", await p.evaluate(() => __pizzeria.G.t.caja.length === 0));
  await p.evaluate(`(${PREPARAR})(false)`); await p.keyboard.press("e");
  ok("Teclado: E sirve", await p.evaluate(() => __pizzeria.G.servidos === 1));
  await ctx.close();
}

// 6) Móvil (390 px)
{
  const { ctx, p } = await nueva({ width: 390, height: 844 });
  ok("Móvil: mapa sin desplazamiento lateral", await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await foto(p, "11_movil_mapa");
  await p.click('[data-rival="1"]'); await p.click("#iEmpezar");
  ok("Móvil: duelo sin desplazamiento lateral", await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const medidas = await p.evaluate(() => [...document.querySelectorAll("#duelo button")].filter(b => b.offsetParent).map(b => [b.textContent.trim(), b.getBoundingClientRect().width, b.getBoundingClientRect().height]));
  const peq = medidas.filter(([, w, h]) => w < 44 || h < 44);
  ok("Móvil: botones de al menos 44 px", peq.length === 0, JSON.stringify(peq));
  ok("Móvil: la arena sigue a la vista al bajar", await p.evaluate(async () => { scrollTo(0, 600); await new Promise(r => setTimeout(r, 100)); const r = document.querySelector(".arena").getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }));
  await p.evaluate(() => scrollTo(0, 0));
  await foto(p, "12_movil_duelo");
  await ctx.close();
}

ok("Sin errores en la consola", errores.length === 0, errores.join(" | "));
ok("Sin peticiones a otros servidores", externas.length === 0, externas.join(" | "));
await b.close(); srv.close();
const fallos = res.filter(r => !r[1]);
for (const [n, c, e] of res) console.log(`${c ? "✓" : "✗"} ${n}${!c && e ? "  → " + e : ""}`);
console.log(fallos.length ? `\n${fallos.length} de ${res.length} pruebas fallidas` : `\n${res.length}/${res.length} pruebas correctas`);
process.exit(fallos.length ? 1 : 0);
