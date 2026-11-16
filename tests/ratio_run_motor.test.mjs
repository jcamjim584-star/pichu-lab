// RATIO RUN · pruebas del motor (node tests/ratio_run_motor.test.mjs)
// Cada reto se vuelve a resolver aquí con sus datos y otra lógica, para no fiarnos del generador.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const M = require("../src/ratio-run/motor.js");
const { ETAPAS, INFINITO } = require("../src/ratio-run/niveles.js");

let fallos = 0, hechas = 0, n0 = 0;
const ok = (nombre, cond, extra = "") => { hechas++; if (!cond) { fallos++; if (fallos < 30) console.log("✗ " + nombre + "  → " + extra); } };
const grupo = t => { console.log(`✓ ${t} (${hechas - n0} comprobaciones)`); n0 = hechas; };
const numero = s => parseFloat(String(s).replace(/ /g, " "));

// Solución independiente a partir de los datos del reto.
function esperado(q) {
  const d = q.datos;
  switch (q.tipo) {
    case "razon": return d.total ? `${d.b}:${d.a + d.b}` : `${d.a}:${d.b}`;
    case "equiv": return null;                       // se comprueba con productos cruzados
    case "propor": return d.hueco === 3 ? d.a * d.k : d.b * d.k;
    case "directa": return d.p / d.c * d.d;
    case "inversa": return d.a * d.t / d.m;
    case "pct": return d.N * d.p / 100;
    case "descuento": return d.N * (100 - d.p) / 100;
    case "aumento": return d.N * (100 + d.p) / 100;
    case "quepct": return (d.N - d.M) * 100 / d.N;
    case "tipo": return M.SITUACIONES.find(s => s[0] === d.situacion)[1];
  }
}
const rng = M.azar(11);
for (const tipo of M.TIPOS) for (const nivel of [1, 2, 3]) for (let k = 0; k < 2000; k++) {
  const q = M.pregunta(tipo, nivel, rng), c = q.opciones[q.correcta], id = `${tipo} n${nivel}: ${q.texto} → ${q.opciones.join(" | ")}`;
  ok("tres puertas", q.opciones.length === 3 && q.correcta >= 0 && q.correcta < 3, id);
  ok("puertas distintas", new Set(q.opciones).size === 3, id);
  ok("una sola puerta correcta", q.opciones.filter(o => M.mismoValor(o, c)).length === 1, id);
  ok("pista y explicación", q.pista.length > 5 && q.explica.length > 5, id);
  ok("sin NaN ni undefined", !/NaN|undefined|null|Infinity/.test(q.texto + q.opciones.join() + q.explica + q.pista), id);
  const e = esperado(q);
  if (tipo === "razon") ok("razón correcta", c === e, id);
  else if (tipo === "equiv") {
    const [x, y] = c.split(":").map(Number);
    ok("razón equivalente (productos cruzados)", x * q.datos.b === y * q.datos.a && c !== `${q.datos.a}:${q.datos.b}`, id);
    for (const o of q.opciones) if (o !== c) { const [u, v] = o.split(":").map(Number); ok("distractor NO equivalente", u * q.datos.b !== v * q.datos.a, id); }
  } else if (tipo === "tipo") ok("clasificación correcta", q.correcta === e && q.opciones.join() === "Directa,Inversa,Ninguna", id);
  else {
    ok("resultado entero y positivo", Number.isInteger(e) && e > 0, id + " esperado " + e);
    ok("respuesta correcta", numero(c) === e, id + " esperado " + e);
    for (const o of q.opciones) ok("opciones enteras positivas", Number.isInteger(numero(o)) && numero(o) > 0, id);
  }
  if (tipo === "inversa") ok("inversa: el producto se conserva", q.datos.a * q.datos.t === q.datos.m * numero(c), id);
  if (tipo === "directa") ok("directa: la razón se conserva", q.datos.p * q.datos.d === q.datos.c * numero(c), id);
  if (tipo === "quepct") ok("porcentaje entre 1 y 99", numero(c) > 0 && numero(c) < 100, id);
}
grupo("Retos: 60 000 preguntas resueltas otra vez con sus datos");

// ---------- Puertas de operación ----------
function evalOp(etq, b) {
  const t = etq.replace(/ /g, ""), n = parseFloat(t.slice(1));
  if (t.endsWith("%")) return t[0] === "+" ? b * (100 + n) / 100 : b * (100 - n) / 100;
  return t[0] === "+" ? b + n : t[0] === "−" ? b - n : t[0] === "×" ? b * n : b / n;
}
for (const nivel of [1, 2, 3]) for (let b = 20; b <= 600; b += 20) for (let k = 0; k < 150; k++) {
  const p = M.puertasOp(b, nivel, rng), id = `op n${nivel} bolsa ${b}: ${p.opciones.join(" | ")}`;
  const vals = p.opciones.map(o => evalOp(o, b));
  ok("valores recalculados", vals.every((v, i) => v === p.valores[i]), id + " " + vals + " vs " + p.valores);
  ok("valores enteros y no negativos", vals.every(v => Number.isInteger(v) && v >= 0), id);
  ok("una única puerta mejor", vals.filter(v => v === Math.max(...vals)).length === 1 && vals[p.correcta] === Math.max(...vals), id);
  ok("etiquetas distintas", new Set(p.opciones).size === 3, id);
}
for (let b = 0; b < 500; b++) { const r = M.redondear20(b); ok("redondeo a múltiplo de 20", r % 20 === 0 && r >= b && r >= 20 && r - b < 20 + (b === 0 ? 1 : 0), b + "→" + r); }
grupo("Puertas de operación recalculadas");

// ---------- Pista: siempre se puede pasar ----------
for (const cfg of [...ETAPAS, ...INFINITO]) for (let s = 0; s < 300; s++) {
  const r = M.azar(s * 7 + 1), t = M.tramo(cfg, r, 1000, 300);
  let zAnt = -1e9;
  for (const f of t.filas) {
    ok("fila con algún carril sin bloque", f.c.some(x => x !== "B"), JSON.stringify(f));
    ok("solo obstáculos de la etapa", f.c.every(x => x === "" || cfg.clases.includes(x)), JSON.stringify(f) + cfg.clases);
    ok("separación para reaccionar", f.z - zAnt >= M.SEP_MIN, f.z - zAnt);
    ok("dentro del tramo", f.z > 1000 + 25 && f.z < 1300 - 15, f.z);
    zAnt = f.z;
  }
  ok("hay obstáculos y monedas", t.filas.length >= 1 && t.monedas.length >= 10);
  for (const m of t.monedas) { const f = t.filas.find(x => Math.abs(x.z - m.z) < 0.01); ok("ninguna moneda dentro de un bloque", !f || f.c[m.carril] !== "B"); }
}
for (const e of ETAPAS) {
  ok(`etapa ${e.id}: tipos válidos`, Object.keys(e.tipos).every(t => M.TIPOS.includes(t)));
  if (e.jefe) ok("el jefe se puede vencer", e.jefe.vida <= e.retos + e.ops - 1);
}
grupo("Pista: siempre hay paso y tiempo para reaccionar");

console.log(fallos ? `\n${fallos} comprobaciones fallidas de ${hechas}` : `\nTodo correcto (${hechas} comprobaciones)`);
process.exit(fallos ? 1 : 0);
