// πCHU · Comprobaciones automáticas (se ejecutan con: node tests/comprobar.mjs)
// También las ejecuta GitHub antes de publicar: si algo falla, no se publica.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const raiz = new URL("..", import.meta.url).pathname;
let fallos = 0;
const ok = (nombre, cond, extra = "") => {
  console.log((cond ? "✓ " : "✗ ") + nombre + (cond ? "" : "  → " + extra));
  if (!cond) fallos++;
};

// 1. Leer la lista de juegos (marca.js) y la lista de archivos del modo sin conexión (sw.js)
const ctx = { window: {} };
vm.runInNewContext(readFileSync(join(raiz, "compartido/marca.js"), "utf8"), ctx);
const MARCA = ctx.window.MARCA;
const sw = readFileSync(join(raiz, "sw.js"), "utf8");
const ARCHIVOS = vm.runInNewContext(sw.match(/const ARCHIVOS = (\[[\s\S]*?\]);/)[1]);
const VERSION = sw.match(/const VERSION = "([^"]+)"/)[1];

ok("La versión de sw.js coincide con MARCA.version", VERSION === "pichu-v" + MARCA.version, `${VERSION} vs ${MARCA.version}`);

// 2. Todos los archivos de la caché existen
for (const a of ARCHIVOS) {
  const ruta = join(raiz, a === "./" ? "index.html" : a.endsWith("/") ? a + "index.html" : a);
  ok("Existe " + a, existsSync(ruta), ruta);
}

// 3. Cada juego disponible existe, está en la caché y tiene el botón de volver
const ids = new Set();
for (const j of MARCA.juegos) {
  ok(`Id único: ${j.id}`, !ids.has(j.id)); ids.add(j.id);
  ok(`Curso válido en ${j.id}`, MARCA.cursos.includes(j.curso), j.curso);
  if (j.estado !== "jugar") continue;
  if (j.externo) { ok(`${j.id}: enlace externo seguro (https)`, j.url.startsWith("https://"), j.url); continue; }
  const html = join(raiz, j.url, "index.html");
  ok(`Existe el juego ${j.id}`, existsSync(html), html);
  ok(`${j.id} está en la caché sin conexión`, ARCHIVOS.includes(j.url));
  if (existsSync(html)) ok(`${j.id} carga volver.js`, readFileSync(html, "utf8").includes("compartido/volver.js"));
}

// 4. Nadie usa localStorage.clear() (borraría los datos de todos los juegos)
const recorrer = d => readdirSync(d).flatMap(n => {
  const r = join(d, n);
  if (n.startsWith(".") || n === "node_modules") return [];
  return statSync(r).isDirectory() ? recorrer(r) : [r];
});
const conClear = recorrer(raiz).filter(f => /\.(html|js|mjs)$/.test(f) && !f.endsWith("comprobar.mjs"))
  .filter(f => /localStorage\s*\.\s*clear\s*\(/.test(readFileSync(f, "utf8")));
ok("Ningún archivo usa localStorage.clear()", conClear.length === 0, conClear.join(", "));

// 5. Mapa de Gaussoria explorable (compartido/gaussoria.js + MUNDOS de compartido/mathquest.js)
const ctxMQ = { window: {}, document: {}, location: { href: "" } };
vm.runInNewContext(readFileSync(join(raiz, "compartido/mathquest.js"), "utf8"), ctxMQ);
const ctxG = { window: {} };
vm.runInNewContext(readFileSync(join(raiz, "compartido/gaussoria.js"), "utf8"), ctxG);
const MUNDOS = ctxMQ.window.MathQuest.MUNDOS, G = ctxG.window.Gaussoria;
ok("Todas las filas del MAPA tienen la misma anchura", G.MAPA.every(f => f.length === G.ANCHO));
ok("El MAPA solo usa letras de la leyenda", G.MAPA.every(f => /^[.,=pSTM~b]+$/.test(f)));
ok("El MAPA tiene exactamente una salida (S)", G.MAPA.join("").split("S").length === 2);
const edificios = G.casillasEdificio(MUNDOS), inicio = G.salida(), ocupadas = new Map();
for (const [i, m] of MUNDOS.entries()) {
  const nombre = `Reino ${i + 1} (${m.reino})`;
  const p = m.puerta;
  ok(`${nombre}: tiene puerta en el mapa`, Array.isArray(p) && p.length === 2, JSON.stringify(p));
  if (!Array.isArray(p)) continue;
  const [x, y] = p;
  // El edificio (3×2) cabe en el mapa, no tapa árboles, rocas ni agua y no choca con otro edificio
  let cabe = true, choca = "";
  for (let dy = -1; dy <= 0; dy++) for (let dx = -1; dx <= 1; dx++) {
    const cx = x + dx, cy = y + dy;
    if (cx < 0 || cy < 0 || cx >= G.ANCHO || cy >= G.ALTO || G.BLOQUEA.includes(G.MAPA[cy][cx])) cabe = false;
    const k = cx + "," + cy;
    if (ocupadas.has(k)) choca = ocupadas.get(k); else ocupadas.set(k, nombre);
  }
  ok(`${nombre}: su edificio cabe sobre terreno libre`, cabe, `puerta en ${x},${y}`);
  ok(`${nombre}: su edificio no se monta sobre otro`, !choca, choca);
  ok(`${nombre}: se entra por la casilla de abajo`, G.sePuedePisar(x, y + 1, edificios), `${x},${y + 1}`);
  ok(`${nombre}: se puede llegar andando desde la salida`, G.ruta(inicio, { x, y }, edificios) !== null);
}

// 6. Matemáticos jugables y enemigos de los reinos (gráficos del Drive, src/galois/generar_graficos.py)
const MQ = ctxMQ.window.MathQuest;
const idsHeroes = new Set();
for (const h of MQ.HEROES) {
  ok(`Matemático con id único: ${h.id}`, !idsHeroes.has(h.id)); idsHeroes.add(h.id);
  for (const f of [`compartido/img/galois/heroes/${h.id}.png`, `compartido/img/galois/heroes/${h.id}-retrato.png`]) {
    ok(`${h.nombre}: existe ${f}`, existsSync(join(raiz, f)));
    ok(`${h.nombre}: ${f} está en la caché sin conexión`, ARCHIVOS.includes(f));
  }
}
for (const m of MUNDOS.filter(m => m.enemigo)) {
  for (const f of [`compartido/img/galois/enemigos/${m.enemigo}.png`, `compartido/img/galois/enemigos/${m.enemigo}-grande.png`]) {
    ok(`${m.reino}: existe ${f}`, existsSync(join(raiz, f)));
    ok(`${m.reino}: ${f} está en la caché sin conexión`, ARCHIVOS.includes(f));
  }
}

console.log(fallos ? `\n${fallos} comprobaciones fallidas` : "\nTodo correcto");
process.exit(fallos ? 1 : 0);
