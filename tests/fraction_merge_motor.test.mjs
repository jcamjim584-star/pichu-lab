// FRACTION MERGE · pruebas del motor (node tests/fraction_merge_motor.test.mjs)
// Recalcula TODOS los pedidos con otra lógica (números enteros grandes), comprueba las reglas del
// tablero y que cada nivel se puede completar (un jugador automático lo juega 200 veces).
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const M = require("../src/fraction-merge/motor.js");
const { NIVELES, INFINITO } = require("../src/fraction-merge/niveles.js");

let fallos = 0, hechas = 0, n0 = 0;
const ok = (nombre, cond, extra = "") => { hechas++; if (!cond) { fallos++; if (fallos < 25) console.log("✗ " + nombre + "  → " + extra); } };
const grupo = t => { console.log(`✓ ${t} (${hechas - n0} comprobaciones)`); n0 = hechas; };

// ---------- Evaluador independiente: devuelve [numerador, denominador] como BigInt ----------
const PAL = { medio: 2, medios: 2, tercio: 3, tercios: 3, cuarto: 4, cuartos: 4, quinto: 5, quintos: 5, sexto: 6, sextos: 6, octavo: 8, octavos: 8,
  "décimo": 10, "décimos": 10, doceavo: 12, doceavos: 12 };
const NUM = { un: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11 };
const fr = s => { const m = s.trim().match(/^(\d+)(?:\/(\d+))?$/); if (!m) throw new Error("no es fracción: " + s); return [BigInt(m[1]), BigInt(m[2] || 1)]; };
const mas = (a, b) => [a[0] * b[1] + b[0] * a[1], a[1] * b[1]], menos = (a, b) => [a[0] * b[1] - b[0] * a[1], a[1] * b[1]];
function evaluar(p) {
  const s = p.texto;
  let m;
  if (p.forma === "dib") return [BigInt(p.dib.pintadas), BigInt(p.dib.partes)];
  if (s === "la mitad") return [1n, 2n];
  if ((m = s.match(/^la mitad de (.+)$/))) { const x = fr(m[1]); return [x[0], x[1] * 2n]; }
  if ((m = s.match(/^el doble de (.+)$/))) { const x = fr(m[1]); return [x[0] * 2n, x[1]]; }
  if ((m = s.match(/^(.+) \+ \? = 1$/))) return menos([1n, 1n], fr(m[1]));
  if ((m = s.match(/^(.+) \+ (.+)$/))) return mas(fr(m[1]), fr(m[2]));
  if ((m = s.match(/^(.+) − (.+)$/))) return menos(fr(m[1]), fr(m[2]));
  if ((m = s.match(/^0,(\d+)$/))) return [BigInt(m[1]), 10n ** BigInt(m[1].length)];
  if ((m = s.match(/^(\S+) (\S+)$/)) && NUM[m[1]] && PAL[m[2]]) return [BigInt(NUM[m[1]]), BigInt(PAL[m[2]])];
  return fr(s);
}
const vale = (v, n, d) => v[0] * BigInt(d) === BigInt(n) * v[1];

// ---------- 1. Operaciones básicas ----------
for (let a = 1; a <= 12; a++) for (let b = 1; b <= 12; b++) for (let c = 1; c <= 12; c++) for (let d = 1; d <= 12; d++) {
  const s = M.suma({ n: a, d: b }, { n: c, d }), r = M.resta({ n: a, d: b }, { n: c, d });
  ok("suma exacta e irreducible", s.n * b * d === (a * d + c * b) * s.d && M.mcd(s.n, s.d) === 1, `${a}/${b}+${c}/${d}`);
  ok("resta exacta", r.n * b * d === (a * d - c * b) * r.d, `${a}/${b}-${c}/${d}`);
}
grupo("Sumas y restas de fracciones");

// ---------- 2. TODOS los pedidos posibles valen lo que dicen ----------
const FORMAS = ["frac", "equiv", "dib", "pal", "dec", "sumaIgual", "restaIgual", "suma", "resta", "falta", "mitad", "doble"];
const rng = M.azar(7); let nPed = 0;
const CFGS = [[2, 4], [2, 4, 8], [2, 3, 6], [2, 3, 4, 6, 12], [2, 5, 10]].map(dens => ({ dens, comun: dens.reduce(M.mcm, 1) }));
for (const cfg of CFGS) for (const f of M.alcanzables(cfg.dens)) for (const forma of FORMAS) for (let k = 0; k < 60; k++) {
  const p = M.hacerPedido(forma, f, rng, cfg);
  if (!p) continue;
  nPed++;
  let v; try { v = evaluar(p); } catch (e) { v = null; ok("texto reconocible", false, `${forma}: ${p.texto} (${e.message})`); continue; }
  ok(`pedido ${forma}`, vale(v, f.n, f.d), `${p.texto} debía valer ${f.n}/${f.d}`);
  ok("explicación sin errores de texto", p.explica.length > 8 && !/NaN|undefined|null/.test(p.explica + p.texto), p.explica);
  // En las explicaciones, cada igualdad encadenada de fracciones debe ser cierta
  for (const cadena of p.explica.split(/[.:]\s/)) {
    const partes = cadena.split(" = ").map(x => x.trim()).filter(x => /^[\d/ +−]+$/.test(x) && /\d/.test(x));
    for (let i = 1; i < partes.length; i++) {
      const ev = x => { let mm; if ((mm = x.match(/^(.+) \+ (.+)$/))) return mas(fr(mm[1]), fr(mm[2])); if ((mm = x.match(/^(.+) − (.+)$/))) return menos(fr(mm[1]), fr(mm[2])); return fr(x); };
      let a, b; try { a = ev(partes[i - 1]); b = ev(partes[i]); } catch (e) { continue; }
      ok("igualdad cierta en la explicación", a[0] * b[1] === b[0] * a[1], `«${partes[i - 1]} = ${partes[i]}» en: ${p.explica}`);
    }
  }
  if (forma === "suma" || forma === "resta") { const ds = p.texto.match(/\/(\d+)/g) || []; ok("distinto denominador", new Set(ds.concat(/^1 /.test(p.texto) ? ["/1"] : [])).size === 2, p.texto); }
  if (forma === "sumaIgual" || forma === "restaIgual") { const ds = p.texto.match(/\/(\d+)/g); ok("mismo denominador", new Set(ds).size === 1, p.texto); }
  if (forma.startsWith("resta")) { const x = evaluar({ texto: p.texto.split(" − ")[0], forma: "frac" }); ok("minuendo como mucho 1", x[0] <= x[1], p.texto); }
}
grupo(`Pedidos: ${nPed} textos recalculados con otro método`);

// ---------- 3. Pedidos de cada nivel: válidos, alcanzables y sin ambigüedad ----------
for (const niv of [...NIVELES, ...INFINITO]) {
  const r = M.azar(100 + (niv.id || 0)), alc = M.alcanzables(niv.dens);
  ok("comun es el mínimo común múltiplo", niv.comun === niv.dens.reduce(M.mcm, 1), niv.nombre || "");
  ok("hay fracciones que pedir", alc.length >= 3);
  for (let k = 0; k < 400; k++) {
    const abiertos = [];
    for (let j = 0; j < 3; j++) {
      const p = M.nuevoPedido(niv, r, abiertos);
      ok("hay pedido", !!p, niv.nombre); if (!p) break;
      ok("pedido correcto", vale(evaluar(p), p.n, p.d), p.texto);
      ok("entre 0 y 1", p.n > 0 && p.n < p.d);
      ok("se puede fabricar con las fichas del nivel", alc.some(f => M.igual(f, p)), p.texto);
      ok("sin dos pedidos del mismo valor", !abiertos.some(q => M.igual(q, p)), p.texto);
      abiertos.push(p);
    }
  }
}
grupo("Pedidos de los niveles: correctos, fabricables y sin repetidos");

// ---------- 4. Reglas del tablero ----------
{
  let t = M.crear(4, 1); M.ponerFicha(t, 0, 1, 2); M.ponerFicha(t, 3, 1, 4);
  let r = M.mover(t, "izq");
  ok("1/2 + 1/4 = 3/4", t.g[0].n === 3 && t.g[0].d === 4 && !t.g[3] && r.fusiones.length === 1);
  t = M.crear(4, 1); M.ponerFicha(t, 0, 1, 8); M.ponerFicha(t, 1, 1, 8);
  M.mover(t, "izq"); ok("1/8 + 1/8 = 1/4 (simplificada)", t.g[0].n === 1 && t.g[0].d === 4);
  t = M.crear(4, 1); M.ponerFicha(t, 0, 3, 4); M.ponerFicha(t, 1, 1, 4);
  r = M.mover(t, "izq"); ok("3/4 + 1/4 = 1: unidad completa y casilla vacía", !t.g[0] && !t.g[1] && r.fusiones[0].unidad);
  t = M.crear(4, 1); M.ponerFicha(t, 0, 3, 4); M.ponerFicha(t, 1, 1, 2);
  r = M.mover(t, "izq"); ok("3/4 + 1/2 pasa de 1: no se fusionan", r.fusiones.length === 0 && t.g[0].n === 3 && t.g[1].d === 2);
  t = M.crear(4, 1); for (let i = 0; i < 4; i++) M.ponerFicha(t, i, 1, 8);
  M.mover(t, "izq"); ok("una fusión por ficha y movimiento", t.g[0].d === 4 && t.g[1].d === 4 && !t.g[2]);
  t = M.crear(4, 1); M.ponerFicha(t, 0, 1, 2); M.ponerFicha(t, 1, 1, 2); M.ponerFicha(t, 2, 1, 4);
  M.mover(t, "izq"); ok("tras completar una unidad, las demás ocupan el hueco", t.g[0] && t.g[0].d === 4 && !t.g[1]);
  t = M.crear(4, 1); M.ponerRoca(t, 1, 1); M.ponerFicha(t, 3, 1, 4);
  M.mover(t, "izq"); ok("la roca frena", t.g[1].tipo === "roca" && t.g[2].d === 4);
  M.ponerFicha(t, 3, 1, 4); r = M.mover(t, "izq"); ok("la fusión rompe la roca", t.g[1] === null && t.g[2].d === 2);
  t = M.crear(4, 1); M.ponerFicha(t, 2, 1, 3, 1, true); M.ponerFicha(t, 3, 1, 6);
  M.mover(t, "izq"); ok("ficha helada: se fusiona y se descongela", t.g[2].n === 1 && t.g[2].d === 2 && !t.g[2].hielo);
  t = M.crear(4, 1); M.ponerFicha(t, 5, 1, 2);
  ok("✂ parte 1/2 en dos de 1/4", M.poderPartir(t, 5, 8) === "" && M.fichas(t).length === 2 && M.fichas(t).every(f => f.n === 1 && f.d === 4));
  t = M.crear(4, 1); M.ponerFicha(t, 5, 1, 8);
  ok("✂ no parte 1/8 si no hay dieciseisavos", M.poderPartir(t, 5, 8) !== "" && M.fichas(t).length === 1);
  const f = { tipo: "fr", n: 1, d: 2, m: 2 };
  ok("2/4 se entrega en un pedido de 1/2", M.coincide(f, { n: 1, d: 2 }) && M.coincide(f, { n: 3, d: 6 }) && !M.coincide(f, { n: 1, d: 4 }));
}
// Al mover, la suma de todas las fichas más las unidades completadas no cambia.
{
  const r = M.azar(5);
  for (let k = 0; k < 400; k++) {
    const t = M.crear(5, k);
    for (let i = 0; i < 14; i++) M.generar(t, { dens: [2, 3, 4, 6, 12], pEq: 0.3, hielo: 0.1 });
    for (let i = 0; i < 3; i++) { const v = M.vacias(t); if (v.length) M.ponerRoca(t, M.elige(r, v), 1); }
    const total = () => M.fichas(t).reduce((s, x) => s + x.n * 12 / x.d, 0);
    const a = total(), res = M.mover(t, M.elige(r, ["izq", "der", "arr", "aba"]));
    ok("la suma total se conserva (contando las unidades)", total() + 12 * res.fusiones.filter(x => x.unidad).length === a);
    ok("ninguna ficha vale 1 o más", M.fichas(t).every(x => x.n < x.d));
    ok("todas irreducibles", M.fichas(t).every(x => M.mcd(x.n, x.d) === 1));
  }
}
grupo("Reglas del tablero y poder ✂");

// ---------- 5. Cada nivel se puede completar (jugador automático sencillo, sin poderes) ----------
function partida(niv, semilla) {
  const t = M.crear(niv.n, semilla), r = t.rng;
  for (let i = 0; i < (niv.rocas || 0); i++) M.ponerRoca(t, M.elige(r, M.vacias(t)), niv.vidaRoca || 1);
  for (let i = 0; i < 3; i++) M.generar(t, niv);
  const abiertos = []; let pendientes = niv.total, hechos = 0, movs = 0;
  const reponer = () => { while (abiertos.length < 3 && pendientes > 0) { abiertos.push(M.nuevoPedido(niv, r, abiertos)); pendientes--; } };
  const entregar = () => { let algo = true; while (algo) { algo = false;
    for (let i = 0; i < t.g.length; i++) { const k = abiertos.findIndex(p => M.coincide(t.g[i], p));
      if (k >= 0) { t.g[i] = null; abiertos.splice(k, 1); hechos++; reponer(); algo = true; } }
    if (hechos < niv.total && M.rellenarSiVacio(t, niv)) algo = true; } };
  const nota = tt => { let s = M.vacias(tt).length;
    for (const f of M.fichas(tt)) { if (abiertos.some(p => M.igual(p, f))) s += 100; else if (abiertos.every(p => p.n * f.d < f.n * p.d)) s -= 6; }
    return s; };
  reponer(); entregar();
  while (hechos < niv.total && movs < niv.movs) {
    let mejor = null, mejorN = -1e9;
    for (const d of ["izq", "der", "arr", "aba"]) { const c = M.clonar(t), res = M.mover(c, d); if (!res.movido) continue;
      const s = nota(c) + r() * 3 + 4 * res.fusiones.filter(x => x.unidad).length; if (s > mejorN) { mejorN = s; mejor = d; } }
    if (!mejor) return { ok: false, movs, atasco: true };
    M.mover(t, mejor); movs++; M.generar(t, niv); entregar();
  }
  return { ok: hechos >= niv.total, movs };
}
for (const niv of NIVELES) {
  const N = 200; let ganadas = 0; const ms = [];
  let atascos = 0;
  for (let s = 0; s < N; s++) { const p = partida(niv, 1000 * niv.id + s); if (p.ok) { ganadas++; ms.push(p.movs); } else if (p.atasco) atascos++; }
  ms.sort((a, b) => a - b);
  const pct = Math.round(100 * ganadas / N);
  console.log(`   nivel ${String(niv.id).padStart(2)} · gana ${String(pct).padStart(3)} % · mediana ${ms[ms.length >> 1] || "-"} de ${niv.movs} movimientos · atascos ${atascos}`);
  ok(`nivel ${niv.id} se puede completar`, pct >= 40, `solo gana el ${pct} %`);
}
grupo("Los 13 niveles se pueden completar sin poderes");

console.log(fallos ? `\n${fallos} comprobaciones fallidas de ${hechas}` : `\nTodo correcto (${hechas} comprobaciones)`);
process.exit(fallos ? 1 : 0);
