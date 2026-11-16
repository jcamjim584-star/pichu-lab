// POWER MERGE · pruebas del motor (node tests/power_merge_motor.test.mjs)
// Comprueba las matemáticas de TODOS los pedidos posibles, las reglas del tablero y
// que cada nivel se puede completar (un jugador automático lo juega muchas veces).
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const M = require("../src/power-merge/motor.js");
const { NIVELES, INFINITO } = require("../src/power-merge/niveles.js");

let fallos = 0, hechas = 0;
const ok = (nombre, cond, extra = "") => { hechas++; if (!cond) { fallos++; console.log("✗ " + nombre + "  → " + extra); } };
const grupo = (t, n0) => console.log(`✓ ${t} (${hechas - n0} comprobaciones)`);
let n0 = 0;

// ---------- 1. Evaluador independiente de los textos de los pedidos ----------
// Vuelve a calcular cada texto con otra lógica (BigInt) para no fiarnos del generador.
const ORD = { cuadrado: 2, cubo: 3, cuarta: 4, quinta: 5, sexta: 6, "séptima": 7, octava: 8, novena: 9, "décima": 10 };
const limpio = s => s.replace(/ /g, "");
function evaluar(texto) {
  const s = limpio(texto);
  let m;
  if ((m = s.match(/^(\d+) (?:al|a la) (\S+)$/))) return BigInt(m[1]) ** BigInt(ORD[m[2]]);
  if ((m = s.match(/^√(\d+)$/))) {
    const rad = BigInt(m[1]); let r = BigInt(Math.round(Math.sqrt(Number(rad))));
    if (r * r !== rad) throw new Error("raíz no exacta: " + texto);
    return r;
  }
  if ((m = s.match(/^\((\d+)\^(\d+)\)\^(\d+)$/))) return (BigInt(m[1]) ** BigInt(m[2])) ** BigInt(m[3]);
  if ((m = s.match(/^(\d+)\^(\d+) · (\d+)\^(\d+)$/))) return BigInt(m[1]) ** BigInt(m[2]) * BigInt(m[3]) ** BigInt(m[4]);
  if ((m = s.match(/^(\d+)\^(\d+) : (\d+)\^(\d+)$/))) {
    const a = BigInt(m[1]) ** BigInt(m[2]), b = BigInt(m[3]) ** BigInt(m[4]);
    if (b === 0n || a % b !== 0n) throw new Error("división no exacta: " + texto);
    return a / b;
  }
  if ((m = s.match(/^(\d+)\^(\d+)$/))) return BigInt(m[1]) ** BigInt(m[2]);
  if (/^\d+(·\d+)+$/.test(s)) return s.split("·").reduce((p, x) => p * BigInt(x), 1n);
  if (/^\d+$/.test(s)) return BigInt(s);
  throw new Error("texto no reconocido: " + texto);
}

// ---------- 2. Valores: ninguna ficha vale lo mismo que otra distinta ----------
const vistos = new Map();
for (const b of Object.keys(M.BASES).map(Number)) for (let e = 1; e <= M.BASES[b]; e++) {
  const v = M.valor(b, e);
  ok(`valor ${b}^${e}`, BigInt(v) === BigInt(b) ** BigInt(e) && Number.isSafeInteger(v));
  ok(`valor único ${v}`, !vistos.has(v), `${b}^${e} = ${vistos.get(v)}`);
  vistos.set(v, `${b}^${e}`);
}
grupo("Valores de las fichas correctos y sin repetidos", n0); n0 = hechas;

// ---------- 3. TODOS los pedidos posibles valen lo que dicen ----------
const FORMAS = ["pot", "num", "desc", "pal", "raiz", "prod", "coc", "potpot"];
const rng = M.azar(7);
let nPedidos = 0;
for (const forma of FORMAS) for (const b of [2, 3, 5, 10]) for (const e of M.exponentesValidos(forma, b, 1, 10))
  for (let k = 0; k < 40; k++) {
    const p = M.hacerPedido(forma, b, e, rng); nPedidos++;
    let v; try { v = evaluar(p.texto); } catch (err) { v = err.message; }
    ok(`pedido ${forma} ${p.texto}`, v === BigInt(b) ** BigInt(e), `sale ${v}, debía ser ${b}^${e}`);
    ok(`valor del pedido ${p.texto}`, p.valor === M.valor(b, e));
    ok(`explicación de ${p.texto}`, typeof p.explica === "string" && p.explica.includes(limpio(M.num(p.valor)).length > 4 ? M.num(p.valor) : String(p.valor)));
    if (forma === "coc") { const m = limpio(p.texto).match(/\^(\d+) : \d+\^(\d+)/); ok("cociente con exponentes positivos", +m[1] > +m[2] && +m[2] >= 1); }
    if (forma === "raiz") ok("radicando razonable", evaluar(p.texto) ** 2n <= 1000000n);
  }
grupo(`Pedidos: ${nPedidos} textos recalculados con otro método`, n0); n0 = hechas;

// ---------- 4. Pedidos de cada nivel: válidos y sin ambigüedad ----------
for (const niv of [...NIVELES, ...INFINITO]) {
  const r = M.azar(100 + (niv.id || 0));
  for (let k = 0; k < 400; k++) {
    const abiertos = [];
    for (let j = 0; j < 3; j++) {
      const p = M.nuevoPedido(niv, r, abiertos);
      ok("hay pedido", !!p); if (!p) break;
      ok("base del nivel", niv.bases.includes(p.b));
      ok("exponente en rango", p.e >= 1 && p.e <= M.BASES[p.b]);
      ok("pedido correcto", evaluar(p.texto) === BigInt(p.b) ** BigInt(p.e), p.texto);
      ok("sin dos pedidos del mismo valor", !abiertos.some(q => q.valor === p.valor), p.texto);
      abiertos.push(p);
    }
  }
}
grupo("Pedidos de los niveles: correctos y nunca dos con el mismo valor", n0); n0 = hechas;

// ---------- 5. Reglas del tablero ----------
{
  // b^m · b^n = b^(m+n): 2^1 y 2^2 hacia la izquierda → 2^3
  let t = M.crear(4, 1);
  M.ponerFicha(t, 0, 2, 1); M.ponerFicha(t, 3, 2, 2);
  let r = M.mover(t, "izq");
  ok("fusión misma base", t.g[0] && t.g[0].e === 3 && t.g[0].b === 2 && !t.g[3] && r.fusiones.length === 1);
  ok("la fusión conserva el producto", M.valor(2, 1) * M.valor(2, 2) === M.valor(t.g[0].b, t.g[0].e));
  // Bases distintas no se fusionan
  t = M.crear(4, 1); M.ponerFicha(t, 0, 2, 1); M.ponerFicha(t, 3, 3, 1);
  r = M.mover(t, "izq");
  ok("bases distintas no se fusionan", t.g[0].b === 2 && t.g[1].b === 3 && r.fusiones.length === 0);
  // Cada ficha se fusiona una sola vez por movimiento: 2 2 2 2 → 2^2 2^2
  t = M.crear(4, 1); for (let i = 0; i < 4; i++) M.ponerFicha(t, i, 2, 1);
  M.mover(t, "izq");
  ok("una fusión por ficha y movimiento", t.g[0].e === 2 && t.g[1].e === 2 && !t.g[2] && !t.g[3]);
  // No se supera el exponente máximo: 2^6 y 2^5 no se fusionan (2^11 > 2^10)
  t = M.crear(4, 1); M.ponerFicha(t, 0, 2, 6); M.ponerFicha(t, 1, 2, 5);
  r = M.mover(t, "izq");
  ok("no se pasa del exponente máximo", r.fusiones.length === 0 && t.g[0].e === 6 && t.g[1].e === 5);
  // La roca no se mueve y frena; una fusión al lado la rompe
  t = M.crear(4, 1); M.ponerRoca(t, 1, 1); M.ponerFicha(t, 3, 2, 1);
  M.mover(t, "izq");
  ok("la roca frena", t.g[1].tipo === "roca" && t.g[2] && t.g[2].b === 2);
  M.ponerFicha(t, 3, 2, 1); r = M.mover(t, "izq");
  ok("la fusión rompe la roca", t.g[1] === null && r.rotas.some(x => x.tipo === "roca") && t.g[2].e === 2);
  // Hielo: no se mueve, pero se fusiona si le llega una de su base, y se descongela
  t = M.crear(4, 1); M.ponerFicha(t, 2, 3, 1, "pot", true); M.ponerFicha(t, 3, 3, 2);
  M.mover(t, "izq");
  ok("ficha helada: se fusiona y se descongela", t.g[2] && t.g[2].e === 3 && !t.g[2].hielo && !t.g[0]);
  t = M.crear(4, 1); M.ponerFicha(t, 2, 3, 1, "pot", true);
  ok("ficha helada sola no se mueve", !M.mover(t, "izq").movido && t.g[2].hielo);
  // Poderes
  let f = { tipo: "pot", b: 2, e: 6 };
  ok("√(2^6) = 2^3", M.poderRaiz(f) === "" && f.e === 3 && M.valor(2, 3) ** 2 === M.valor(2, 6));
  ok("√ con exponente impar no se aplica", M.poderRaiz(f) !== "" && f.e === 3);
  ok("2^3 : 2 = 2^2", M.poderDividir(f) === "" && f.e === 2);
  f = { tipo: "pot", b: 5, e: 1 };
  ok("no se divide hasta 1", M.poderDividir(f) !== "" && f.e === 1);
  // Barajar no cambia las fichas
  t = M.crear(5, 3); const cfg = { bases: [2, 3, 5], e2: 0.3 };
  for (let i = 0; i < 12; i++) M.generar(t, cfg);
  const antes = M.fichas(t).map(x => x.b + "^" + x.e).sort().join();
  M.barajar(t);
  ok("barajar conserva las fichas", M.fichas(t).map(x => x.b + "^" + x.e).sort().join() === antes);
}
// En cualquier movimiento, el producto de todas las fichas no cambia (solo se reagrupan factores).
{
  const r = M.azar(5);
  for (let k = 0; k < 300; k++) {
    const t = M.crear(5, k);
    for (let i = 0; i < 14; i++) M.generar(t, { bases: [2, 3, 5, 10], e2: 0.4, hielo: 0.1 });
    for (let i = 0; i < 3; i++) { const v = M.vacias(t); if (v.length) M.ponerRoca(t, M.elige(r, v), 1); }
    const exps = () => { const s = { 2: 0, 3: 0, 5: 0, 10: 0 }; M.fichas(t).forEach(x => s[x.b] += x.e); return JSON.stringify(s); };
    const a = exps(); M.mover(t, M.elige(r, ["izq", "der", "arr", "aba"]));
    ok("el producto total se conserva al mover", exps() === a);
    ok("exponentes dentro del máximo", M.fichas(t).every(x => x.e <= M.BASES[x.b]));
  }
}
grupo("Reglas del tablero y poderes", n0); n0 = hechas;

// ---------- 6. Cada nivel se puede completar (jugador automático sencillo, sin poderes) ----------
function partida(niv, semilla, tope) {
  const t = M.crear(niv.n, semilla), r = t.rng;
  for (let i = 0; i < (niv.rocas || 0); i++) M.ponerRoca(t, M.elige(r, M.vacias(t)), niv.vidaRoca || 1);
  for (let i = 0; i < 3; i++) M.generar(t, niv);
  const abiertos = []; let pendientes = niv.total, hechos = 0, movs = 0;
  const reponer = () => { while (abiertos.length < 3 && pendientes > 0) { abiertos.push(M.nuevoPedido(niv, r, abiertos)); pendientes--; } };
  const entregar = () => { let algo = true; while (algo) { algo = false;
    for (let i = 0; i < t.g.length; i++) { const k = abiertos.findIndex(p => M.coincide(t.g[i], p));
      if (k >= 0) { t.g[i] = null; abiertos.splice(k, 1); hechos++; reponer(); algo = true; } } } };
  const nota = tt => { let s = M.vacias(tt).length;
    for (const f of M.fichas(tt)) { const ps = abiertos.filter(p => p.b === f.b);
      if (ps.some(p => p.e === f.e)) s += 100; else if (ps.length && ps.every(p => p.e < f.e)) s -= 25; }
    return s; };
  reponer(); entregar();
  while (hechos < niv.total && movs < tope) {
    let mejor = null, mejorN = -1e9;
    for (const d of ["izq", "der", "arr", "aba"]) { const c = M.clonar(t); if (!M.mover(c, d).movido) continue;
      const s = nota(c) + r() * 3; if (s > mejorN) { mejorN = s; mejor = d; } }
    if (!mejor) return { ok: false, movs, atasco: true };
    M.mover(t, mejor); movs++; M.generar(t, niv); entregar();
  }
  return { ok: hechos >= niv.total, movs };
}
for (const niv of NIVELES) {
  const N = 200; let ganadas = 0; const ms = [];
  for (let s = 0; s < N; s++) { const p = partida(niv, 1000 * niv.id + s, niv.movs); if (p.ok) { ganadas++; ms.push(p.movs); } }
  ms.sort((a, b) => a - b);
  const pct = Math.round(100 * ganadas / N);
  console.log(`   nivel ${String(niv.id).padStart(2)} · gana ${String(pct).padStart(3)} % · mediana ${ms[ms.length >> 1] || "-"} de ${niv.movs} movimientos`);
  ok(`nivel ${niv.id} se puede completar`, pct >= 35, `solo gana el ${pct} %`);
}
grupo("Los 13 niveles se pueden completar sin poderes", n0);

console.log(fallos ? `\n${fallos} comprobaciones fallidas de ${hechas}` : `\nTodo correcto (${hechas} comprobaciones)`);
process.exit(fallos ? 1 : 0);
