// Prueba de la Pizzería πCHU v0.3 en Chromium (Playwright).
// Uso (desde la carpeta del repositorio):  node tests/prueba_pizzeria.mjs [carpeta_capturas]
// Necesita Playwright: npm install playwright (o el que venga instalado en el sistema).
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const RAIZ = new URL("..", import.meta.url).pathname, CAP = process.argv[2] || "";
if (CAP) await mkdir(CAP, { recursive: true });
const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".json": "application/json", ".webmanifest": "application/manifest+json", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml" };
const srv = createServer(async (req, res) => {
  let ruta = decodeURIComponent(req.url.split("?")[0]); if (ruta.endsWith("/")) ruta += "index.html";
  try { res.writeHead(200, { "content-type": TIPOS[extname(ruta)] || "application/octet-stream" }); res.end(await readFile(join(RAIZ, ruta))); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const URL_JUEGO = `http://127.0.0.1:${srv.address().port}/applets/pizzeria/`;

let n = 0, fallos = 0;
const ok = (nombre, cond, extra = "") => { n++; console.log((cond ? "✓ " : "✗ ") + nombre + (cond ? "" : "  → " + extra)); if (!cond) fallos++; };
const foto = async (p, nombre) => { if (CAP) await p.screenshot({ path: join(CAP, nombre + ".png") }); };

const nav = await chromium.launch();

async function abrir(ancho, alto, estado) {
  const ctx = await nav.newContext({ viewport: { width: ancho, height: alto } });
  const p = await ctx.newPage();
  p.errores = []; p.externas = [];
  p.on("console", m => { if (m.type() === "error") p.errores.push(m.text()); });
  p.on("pageerror", e => p.errores.push(e.message));
  p.on("request", r => { if (!r.url().startsWith("http://127.0.0.1") && !r.url().startsWith("data:")) p.externas.push(r.url()); });
  if (estado) await p.addInitScript(e => { for (const [k, v] of Object.entries(e)) localStorage.setItem(k, v); }, estado);
  await p.goto(URL_JUEGO);
  return p;
}
// Sirve al cliente actual con la solución del motor, clicando los botones de verdad
async function servirBien(p) {
  const sol = await p.evaluate(() => __pizzeria.J.pedido.solucion);
  for (const d of sol) await p.click(`.porcion[data-d="${d}"]`);
  await p.click("#btnServir");
}

// ---------- 1. Primera visita (ordenador) ----------
{
  const p = await abrir(1280, 800, { "pichu.perfil.v1": JSON.stringify({ alias: "Lince7" }) });
  ok("Se abre la ayuda en la primera visita", await p.isVisible("#capa:not(.oculto)"));
  await foto(p, "01_ayuda");
  await p.keyboard.press("Escape");
  ok("Escape cierra la ayuda", await p.isHidden("#capa:not(.oculto)"));
  ok("Saluda con el alias", (await p.textContent("#saludo")).includes("Lince7"));
  ok("Solo el menú 1 está abierto", await p.locator("[data-jugar]").count() === 1);
  ok("Sin contrarreloj al principio", await p.locator("[data-reloj]").count() === 0);
  await foto(p, "02_inicio");

  // Menú 1: tutorial, error, arreglo
  await p.click('[data-jugar="1"]');
  ok("Se ve el consejo del primer cliente", await p.isVisible("#pista"));
  ok("Hay guía (raya roja) al principio", (await p.locator("#pizzas svg line").count()) > 0);
  ok("¡Servir! desactivado con la pizza vacía", await p.isDisabled("#btnServir"));
  const obj = await p.evaluate(() => __pizzeria.J.pedido.objetivo);
  // Servir de más o de menos a propósito
  const malo = obj === 6 ? ["2"] : ["4"];
  for (const d of malo) await p.click(`.porcion[data-d="${d}"]`);
  await p.click("#btnServir");
  ok("El fallo se explica", await p.isVisible("#respuesta.mal") && /Te (falta|sobra)/.test(await p.textContent("#respuesta")), await p.textContent("#respuesta"));
  await foto(p, "03_fallo");
  await p.click("#btnVaciar");
  ok("Vaciar deja la pizza vacía", (await p.evaluate(() => __pizzeria.J.porciones.length)) === 0);
  // Segundo fallo → aparece la pista
  for (const d of malo) await p.click(`.porcion[data-d="${d}"]`);
  await p.click("#btnServir");
  ok("Tras 2 fallos se ofrece una forma de servirlo", await p.isVisible("#btnPista"));
  await p.click("#btnPista");
  ok("La pista muestra una solución", (await p.textContent("#respuesta")).includes("Una forma"));
  await p.click("#btnVaciar");
  await servirBien(p);
  ok("Servir exacto da ✔", await p.isVisible("#respuesta.bien"));
  ok("La cuenta aparece al acertar", (await p.textContent("#respuesta")).includes("Has servido"));
  await foto(p, "04_acierto");
  ok("Este cliente no cuenta a la primera", (await p.evaluate(() => __pizzeria.J.resultados[0])) === false);
  // Teclado: Intro pasa al siguiente; números ponen porciones; Retroceso quita
  await p.focus("body"); await p.evaluate(() => document.activeElement.blur());
  await p.keyboard.press("Enter");
  ok("Intro pasa al siguiente cliente", (await p.evaluate(() => __pizzeria.J.n)) === 1);
  await p.keyboard.press("2"); await p.keyboard.press("2");
  ok("La tecla 2 pone un cuarto", JSON.stringify(await p.evaluate(() => __pizzeria.J.porciones)) === "[4,4]");
  await p.keyboard.press("Backspace");
  ok("Retroceso quita la última", JSON.stringify(await p.evaluate(() => __pizzeria.J.porciones)) === "[4]");
  await p.click("#btnVaciar");
  // Capacidad: no se puede pasar de una pizza
  for (let i = 0; i < 4; i++) await p.click('.porcion[data-d="4"]');
  ok("Con la pizza llena, los botones se desactivan", await p.isDisabled('.porcion[data-d="4"]'));
  await p.click("#btnVaciar");
  // Resto del menú a la primera
  await servirBien(p);
  for (let i = 2; i < 8; i++) {
    await p.click("#btnSig");
    if (i === 4) ok("Desde el cliente 5 del menú 1 no hay guía", (await p.locator("#pizzas svg line").count()) === 0);
    await servirBien(p);
  }
  await p.click("#btnSig");
  ok("Al acabar se ven las estrellas", await p.isVisible("#capa:not(.oculto) .estrellas"));
  ok("7 de 8 a la primera = 2 estrellas", (await p.getAttribute(".estrellas", "aria-label")).startsWith("2"));
  await foto(p, "05_fin_menu");
  await p.click("#cSig");
  ok("El botón lleva al menú 2", (await p.evaluate(() => __pizzeria.J.menu.id)) === 2);
  ok("El menú 2 tiene 5 porciones", await p.locator(".porcion").count() === 5);
  await servirBien(p);
  await p.click("#btnSalir");
  ok("Primera pulsación de salir no sale (partida empezada)", await p.isVisible("#juego"));
  ok("Salir pide confirmar con otra pulsación", (await p.textContent("#btnSalir")).includes("otra vez"));
  await p.click("#btnSalir");
  ok("Segunda pulsación sale a los menús", await p.isVisible("#inicio"));
  ok("Ya hay contrarreloj en el menú 1", await p.locator('[data-reloj="1"]').count() === 1);
  const g = await p.evaluate(() => JSON.parse(localStorage.getItem("pichu.pizzeria.v3")));
  ok("Se guarda en pichu.pizzeria.v3", g && g.estrellas[1] === 2 && JSON.stringify(g.album) === '["compas"]', JSON.stringify(g));
  ok("2 estrellas en el menú 1 = 1 cliente en el álbum", await p.locator(".album li:not(.no)").count() === 1);
  ok("Sin errores en la consola", p.errores.length === 0, p.errores.join(" | "));
  ok("Sin peticiones a otros servidores", p.externas.length === 0, p.externas.join(" "));
  await p.context().close();
}

// ---------- 2. Todos los menús a la primera (3 estrellas) ----------
{
  const p = await abrir(1280, 800, { "pichu.pizzeria.v3": JSON.stringify({ ayudaVista: true }) });
  for (const m of [1, 2, 3, 4]) {
    await p.click(`[data-jugar="${m}"]`);
    if (m >= 3) ok(`Menú ${m}: dos pizzas`, await p.locator("#pizzas .pizza").count() === 2);
    for (let i = 0; i < 8; i++) {
      await servirBien(p);
      if (!(await p.isVisible("#respuesta.bien"))) { ok(`Menú ${m}: cliente ${i + 1} servido`, false, await p.textContent("#pedido")); break; }
      if (m === 3 && i === 0) await foto(p, "06_menu3");
      if (m === 4 && i === 0) { ok("Menú 4: se enseña la operación", (await p.textContent("#respuesta")).includes("Pedido:")); await foto(p, "07_menu4"); }
      await p.click("#btnSig");
    }
    ok(`Menú ${m}: 3 estrellas`, (await p.getAttribute(".estrellas", "aria-label")).startsWith("3"));
    await p.click("#cMenu");
  }
  ok("Las 4 tarjetas con 3 estrellas", await p.locator('.menu-card .est[aria-label^="3"]').count() === 4);
  ok("Álbum completo con 3 estrellas en todo", await p.locator(".album li:not(.no)").count() === 8);
  await foto(p, "08b_album");
  // Contrarreloj (se acorta el tiempo para la prueba)
  await p.click('[data-reloj="2"]');
  ok("Contrarreloj: se ve el reloj", await p.isVisible("#reloj"));
  ok("Contrarreloj: sin guía", (await p.locator("#pizzas svg line").count()) === 0);
  await servirBien(p);
  await p.waitForTimeout(1300);
  await servirBien(p);
  await p.evaluate(() => { __pizzeria.J.fin = performance.now() + 50; });
  await p.waitForTimeout(500);
  ok("Contrarreloj: al acabar se ve el resultado", (await p.textContent("#capa")).includes("¡Tiempo!"));
  const rec = await p.evaluate(() => JSON.parse(localStorage.getItem("pichu.pizzeria.v3")).records[2]);
  ok("Contrarreloj: se guarda el récord", rec >= 1, rec);
  await foto(p, "08_contrarreloj");
  ok("Sin errores en la consola (todos los menús)", p.errores.length === 0, p.errores.join(" | "));
  await p.context().close();
}

// ---------- 3. Móvil (390 px) ----------
{
  const p = await abrir(390, 844, { "pichu.pizzeria.v3": JSON.stringify({ ayudaVista: true, estrellas: { 1: 1, 2: 1 } }) });
  const ancho = () => p.evaluate(() => document.documentElement.scrollWidth);
  ok("Móvil: inicio sin desplazamiento horizontal", (await ancho()) <= 390, await ancho());
  await p.click('[data-jugar="1"]');
  ok("Móvil: juego sin desplazamiento horizontal", (await ancho()) <= 390, await ancho());
  const caja = await p.locator("#btnServir").boundingBox();
  ok("Móvil: ¡Servir! se ve sin bajar", caja && caja.y + caja.height <= 844, JSON.stringify(caja));
  const bot = await p.locator(".porcion").first().boundingBox();
  ok("Móvil: botones de porción ≥ 44 px", bot.width >= 44 && bot.height >= 44, JSON.stringify(bot));
  await foto(p, "09_movil");
  await p.click("#btnSalir"); await p.click('[data-jugar="3"]');
  ok("Móvil: dos pizzas sin desplazamiento horizontal", (await ancho()) <= 390, await ancho());
  await servirBien(p);
  await foto(p, "10_movil_menu3");
  ok("Móvil: sin errores", p.errores.length === 0, p.errores.join(" | "));
  await p.context().close();
}

// ---------- 4. Menos movimiento ----------
{
  const ctx = await nav.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.addInitScript(() => localStorage.setItem("pichu.pizzeria.v3", JSON.stringify({ ayudaVista: true })));
  await p.goto(URL_JUEGO); await p.click('[data-jugar="1"]');
  await p.click('.porcion[data-d="4"]');
  ok("Con «reducir movimiento» no se anima la porción", await p.locator("#pizzas .nueva").count() === 0);
  await ctx.close();
}

await nav.close(); srv.close();
console.log(fallos ? `\n${fallos} de ${n} pruebas fallidas` : `\nTodo correcto (${n} pruebas)`);
process.exit(fallos ? 1 : 0);
