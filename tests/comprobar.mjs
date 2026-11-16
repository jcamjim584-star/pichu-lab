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

// 3b. MathQuest: cada mundo con juego apunta a un juego que existe en MARCA.juegos
const ctxMQ = { window: {}, localStorage: { getItem: () => null, setItem() {} } };
vm.runInNewContext(readFileSync(join(raiz, "compartido/mathquest.js"), "utf8"), ctxMQ);
const MQ = ctxMQ.window.MathQuest;
for (const m of MQ.MUNDOS) {
  if (!m.juego) continue;
  const j = MARCA.juegos.find(x => x.id === m.juego);
  ok(`MathQuest: el mundo ${m.id} apunta a un juego de la lista`, !!j && j.url === m.url, m.juego);
}
ok("MathQuest: logros con id único", new Set(MQ.LOGROS.map(l => l.id)).size === MQ.LOGROS.length);
ok("MathQuest: niveles de experiencia", MQ.nivel(0).nivel === 1 && MQ.nivel(99).nivel === 1 && MQ.nivel(100).nivel === 2 && MQ.nivel(300).nivel === 3);

// 3c. Los juegos que se compilan están al día con sus fuentes (no se ha olvidado ejecutar build.py)
{
  const d = join(raiz, "src/power-merge/"), gen = readFileSync(join(raiz, "applets/power-merge/index.html"), "utf8");
  const esperado = readFileSync(d + "juego.html", "utf8").replace("/*MOTOR*/", () => readFileSync(d + "motor.js", "utf8")).replace("/*NIVELES*/", () => readFileSync(d + "niveles.js", "utf8"));
  ok("Power Merge: applets/ coincide con src/ (python3 src/power-merge/build.py)", gen === esperado);
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

console.log(fallos ? `\n${fallos} comprobaciones fallidas` : "\nTodo correcto");
process.exit(fallos ? 1 : 0);
