// Pruebas del motor de la Pizzería πCHU:  node tests/pizzeria_motor.test.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const M = require("../src/pizzeria/motor.js");

let n = 0, fallos = 0;
const ok = (nombre, cond, extra = "") => { n++; if (!cond) { fallos++; console.log("✗ " + nombre + "  → " + extra); } };
const azar = a => a[Math.floor(Math.random() * a.length)];

// Valor exacto de un pedido escrito: "3/4", "2", "1 y 1/2" → veinticuatroavos
function valorEscrito(s) {
  let m;
  if ((m = s.match(/^(\d+) y (\d+)\/(\d+)$/))) return M.aU(+m[1] * +m[3] + +m[2], +m[3]);
  if ((m = s.match(/^(\d+)\/(\d+)$/))) return M.aU(+m[1], +m[2]);
  return M.aU(+s, 1);
}
// Mínimo de porciones por fuerza bruta (mostradores pequeños)
function minBruto(porciones, t) {
  const tam = [...new Set(porciones)], cnt = tam.map(x => porciones.filter(y => y === x).length);
  let mejor = Infinity;
  const rec = (i, suma, k) => { if (suma > t) return; if (i === tam.length) { if (suma === t) mejor = Math.min(mejor, k); return; }
    for (let c = 0; c <= cnt[i]; c++) rec(i + 1, suma + c * tam[i], k + c); };
  rec(0, 0, 0); return mejor;
}
function mostrador(j, pizzas = j.pizzas || 4) {
  const p = [];
  for (let i = 0; i < pizzas; i++) { const d = azar(j.dens), quedan = 1 + Math.floor(Math.random() * d); for (let k = 0; k < quedan; k++) p.push(M.U / d); }
  return p;
}

// ---------- Pizza Rush: tickets siempre servibles con pizzas recién hechas de los cortes del turno ----------
for (const j of M.TURNOS) {
  for (let i = 0; i < 1500; i++) {
    const t = M.generarTicket(j);
    ok(`Turno ${j.id}: siempre hay ticket`, !!t);
    if (!t) continue;
    if (t.tipo !== "div_cuantas") {
      // con 2 pizzas recién hechas de cada corte útil se puede servir
      const utiles = M.cortesUtiles(t, j.dens);
      ok(`Turno ${j.id} ${t.tipo}: tiene cortes útiles`, utiles.length > 0, JSON.stringify(t));
      const stock = []; for (const d of utiles) for (let k = 0; k < d * 2; k++) stock.push(24 / d);
      ok(`Turno ${j.id} ${t.tipo}: servible con pizzas de cortes útiles`, M.sePuede(stock, t.objetivo), JSON.stringify(t));
      ok(`Turno ${j.id}: tipo permitido`, j.tipos.includes(t.tipo));
    }
  }
  // El horno prefiere cortes útiles
  const t = { tipo: "suma", objetivo: 8 };   // 1/3 → útiles: tercios, sextos, doceavos
  if (j.dens.includes(3)) { let utiles = 0; for (let i = 0; i < 2000; i++) if ([3, 6, 12].includes(M.elegirHorneado([t, t, t], j.dens))) utiles++;
    ok(`Turno ${j.id}: el horno prefiere cortes útiles`, utiles > 1000, utiles); }
}
ok("Monedas con combo y perfecto", M.monedas({ tipo: "suma", combo: 0, perfecto: false }) === 10 && M.monedas({ tipo: "suma", combo: 3, perfecto: true }) === 25 && M.monedas({ tipo: "condicion", combo: 10, perfecto: true, propinaOro: true, rapido: true }) === 95);
for (let t = 1; t <= 48; t++) for (const dens of [[2, 4], [2, 3, 4, 6], [2, 3, 4, 6, 8, 12]]) {
  const dm = M.descomposicionMinima(t, dens);
  if (dm) ok("Descomposición mínima suma el objetivo", dm.reduce((a, d) => a + 24 / d, 0) === t);
  if (dm && t <= 24) ok("Descomposición mínima = mínimo por fuerza bruta", dm.length === minBruto(M.stockVirtual(dens), t), `${t} ${dens}`);
}
ok("Rangos", M.rango(0) === "Puesto callejero" && M.rango(24) === "Imperio πCHU");
ok("Mejoras", M.intervaloHorno(3) === 3.5 && M.huecosMostrador(2) === 6 && M.factorPaciencia(2) === 1.5);

const conteo = {};
for (const j of M.JORNADAS) {
  let nulos = 0;
  for (let i = 0; i < 2500; i++) {
    const pequeño = i % 5 === 0, porc = mostrador(j, pequeño ? 3 : j.pizzas);
    const p = M.generarPedido(porc, j);
    if (!p) { nulos++; continue; }
    conteo[p.tipo] = (conteo[p.tipo] || 0) + 1;
    const disp = porc.reduce((a, b) => a + b, 0);
    if (p.tipo !== "div_cuantas") {
      ok(`J${j.id} ${p.tipo}: se puede servir`, M.sePuede(porc, p.objetivo), JSON.stringify(p));
      ok(`J${j.id} ${p.tipo}: no supera lo disponible ni el máximo`, p.objetivo <= disp && p.objetivo <= j.maxU, p.objetivo);
      if (pequeño) ok(`J${j.id}: mínimo de porciones correcto`, p.minimo === minBruto(porc, p.objetivo), `${p.minimo} vs ${minBruto(porc, p.objetivo)}`);
    }
    if (p.tipo === "suma") ok(`J${j.id} suma: lo escrito vale el objetivo`, valorEscrito(p.escrito) === p.objetivo, p.escrito);
    if (p.tipo === "mult_entero") ok("multiplicar: k × base", p.objetivo === p.k * M.aU(p.base.n, p.base.d));
    if (p.tipo === "fraccion_de") ok("fracción de: fr × base", p.objetivo * p.base.d * p.fr.d === M.U * p.base.n * p.fr.n);
    if (p.tipo === "div_entero") ok("dividir entre k", p.objetivo * p.k === M.aU(p.base.n, p.base.d));
    if (p.tipo === "div_cuantas") {
      ok("cuántas caben: respuesta exacta", p.respuesta * M.aU(p.trozo.n, p.trozo.d) === M.aU(p.base.n, p.base.d));
      ok("cuántas caben: opciones válidas", p.opciones.includes(p.respuesta) && new Set(p.opciones).size === p.opciones.length && p.opciones.length >= 3 && p.opciones.every(x => x > 0), p.opciones);
    }
    if (p.cond) {
      const dp = M.cantidadesPosibles(porc, p.objetivo)[p.objetivo];
      if (p.cond.modo === "exactas") ok("Crítico: «exactamente k» es posible", dp.has(p.cond.k));
      if (p.cond.modo === "sin") ok("Crítico: «sin 1/d» es posible", M.sePuede(porc.filter(x => x !== p.cond.tam), p.objetivo));
      if (p.cond.modo === "minimo") ok("Crítico: «mínimo» correcto", p.cond.k === Math.min(...dp));
    }
    if (j.mixtos && p.tipo === "suma" && j.minU) ok("J4: pedidos de al menos 3/4", p.objetivo >= j.minU);
  }
  ok(`J${j.id}: casi siempre hay pedido posible (${nulos} sin pedido de 2500)`, nulos < 250, nulos);
}

// Evaluación exacta contra suma de fracciones con mcm
for (let i = 0; i < 20000; i++) {
  const servidas = Array.from({ length: 1 + Math.floor(Math.random() * 6) }, () => ({ d: azar(M.CORTES) }));
  const L = servidas.reduce((a, s) => M.mcm(a, s.d), 1), num = servidas.reduce((a, s) => a + L / s.d, 0);
  const obj = 1 + Math.floor(Math.random() * 48);
  const r = M.evaluar({ tipo: "suma", objetivo: obj, escrito: "x", minimo: 1 }, servidas);
  ok("evaluar: exacto solo si coincide", r.ok === (num * 24 === obj * L));
  ok("evaluar: pasos terminan en la suma correcta", r.pasos.includes(`${num}/${L}`));
}

// Detector de errores típicos
const s = (...ds) => ds.map(d => ({ d }));
ok("Error del denominador: pidió 3/4 y sirvió 3 de 1/8", /más PEQUEÑAS/.test(M.evaluar({ tipo: "suma", objetivo: 18, escrito: "3/4", minimo: 2 }, s(8, 8, 8)).pista));
ok("Error del denominador al revés: pidió 2/8 y sirvió 2 de 1/4", /más GRANDES/.test(M.evaluar({ tipo: "suma", objetivo: 6, escrito: "2/8", minimo: 1 }, s(4, 4)).pista));
ok("Sin falso aviso con otra combinación", M.evaluar({ tipo: "suma", objetivo: 18, escrito: "3/4", minimo: 2 }, s(2, 8)).pista === "");
ok("Multiplicar: sirvió la parte de uno", /una sola persona/.test(M.evaluar({ tipo: "mult_entero", objetivo: 18, k: 3, base: { n: 1, d: 4 }, minimo: 2 }, s(4)).pista));
ok("Dividir: multiplicó en vez de dividir", /en vez de dividir/.test(M.evaluar({ tipo: "div_entero", objetivo: 4, k: 3, base: { n: 1, d: 2 }, minimo: 1 }, s(2, 2, 2)).pista));
ok("Dividir: sirvió todo", /enteros/.test(M.evaluar({ tipo: "div_entero", objetivo: 4, k: 3, base: { n: 1, d: 2 }, minimo: 1 }, s(2)).pista));
ok("Servicio perfecto con el mínimo", M.evaluar({ tipo: "suma", objetivo: 12, escrito: "1/2", minimo: 1 }, s(2)).perfecto === true);
ok("Correcto pero no perfecto con más porciones", (r => r.ok && !r.perfecto)(M.evaluar({ tipo: "suma", objetivo: 12, escrito: "1/2", minimo: 1 }, s(4, 4))));
ok("Crítico: exactamente 3 porciones", M.evaluar({ tipo: "condicion", objetivo: 12, escrito: "1/2", minimo: 1, cond: { modo: "exactas", k: 3 } }, s(4, 8, 8)).ok === true);
ok("Crítico: usa una prohibida", M.evaluar({ tipo: "condicion", objetivo: 12, escrito: "1/2", minimo: 1, cond: { modo: "sin", tam: 6 } }, s(4, 4)).ok === false);
ok("Crítico: no es el mínimo", M.evaluar({ tipo: "condicion", objetivo: 12, escrito: "1/2", minimo: 1, cond: { modo: "minimo", k: 1 } }, s(4, 4)).ok === false);
ok("Texto mixto", M.texto({ n: 3, d: 2 }, true) === "1 y 1/2" && M.texto({ n: 6, d: 8 }) === "3/4" && M.texto({ n: 4, d: 2 }) === "2");
ok("Estrellas", M.estrellas(6, 3, 6) === 3 && M.estrellas(5, 0, 6) === 2 && M.estrellas(4, 0, 6) === 1 && M.estrellas(3, 3, 6) === 0);

// ---------- Pizza Duel ----------
ok("Duel: 8 rivales con imagen, tiempo y vida", M.RIVALES.length === 8 && M.RIVALES.every((r, i) => r.id === i + 1 && r.img && r.vida > 0 && r.tiempo > 0 && r.frases.golpe.length && r.frases.fallo.length));
for (const r of M.RIVALES) {
  for (let i = 0; i < 1500; i++) {
    const vida = 1 + Math.floor(Math.random() * r.vida);
    const p = M.generarComanda(r, vida);
    ok(`Duel ${r.nombre}: siempre hay comanda`, !!p);
    if (!p) continue;
    ok(`Duel ${r.nombre}: tipo permitido`, r.cfg.tipos.includes(p.tipo), p.tipo);
    if (p.tipo === "div_cuantas") continue;
    const utiles = M.cortesUtiles(p, r.cfg.dens);
    const stock = []; for (const d of utiles) for (let k = 0; k < d * 2; k++) stock.push(24 / d);
    ok(`Duel ${r.nombre}: servible con cortes útiles`, utiles.length > 0 && M.sePuede(stock, p.objetivo), JSON.stringify(p));
    if (r.reglas.includes("iguales")) {
      ok(`Duel ${r.nombre}: comanda con regla de iguales`, p.cond && p.cond.modo === "iguales" && p.cond.formas.length > 0, JSON.stringify(p));
      // Cada forma vale el objetivo, y el mínimo es la forma con menos porciones
      ok(`Duel ${r.nombre}: formas equivalentes correctas`, p.cond.formas.every(f => { const [n, d] = f.split("/").map(Number); return r.cfg.dens.includes(d) && n * 24 / d === p.objetivo; }), p.cond.formas);
      const [n, d] = p.cond.formas[p.cond.formas.length - 1].split("/").map(Number);
      ok(`Duel ${r.nombre}: servir con iguales es correcto`, M.evaluar(p, Array(n).fill({ d })).ok);
      ok(`Duel ${r.nombre}: cortes útiles solo los exactos`, utiles.every(c => p.objetivo % (24 / c) === 0));
      ok(`Duel ${r.nombre}: mínimo con iguales`, p.minimo === Math.min(...p.cond.formas.map(f => +f.split("/")[0])));
    }
    if (r.fases) {
      const fase = M.faseDe(r, vida);
      ok(`Duel ${r.nombre}: fase correcta`, p.fase === fase && fase >= 1 && fase <= 3);
      if (p.tipo === "condicion") ok(`Duel ${r.nombre}: condición de la fase`, p.cond.modo === r.fases[fase - 1], `${p.cond.modo} fase ${fase}`);
    }
  }
}
const iguales = { tipo: "suma", objetivo: 16, escrito: "2/3", minimo: 2, cond: { modo: "iguales", formas: ["2/3", "4/6"] } };
ok("Iguales: 1/2 + 1/6 suma 2/3 pero no vale", (r => !r.ok && /IGUALES/.test(r.pista) && /2\/3 = 4\/6/.test(r.pista))(M.evaluar(iguales, s(2, 6))));
ok("Iguales: 4 sextos sí vale", M.evaluar(iguales, s(6, 6, 6, 6)).ok);
ok("Iguales: 2 tercios es perfecto", M.evaluar(iguales, s(3, 3)).perfecto);
ok("Formas iguales de 1/2", JSON.stringify(M.formasIguales(12, [2, 3, 4, 6])) === '["1/2","2/4","3/6"]');
const esc = M.RIVALES.find(r => r.reglas.includes("escudo")), sal = M.RIVALES[0];
ok("Daño normal y crítico", M.danio({ perfecto: false, rival: sal }).valor === 20 && M.danio({ perfecto: true, rival: sal }).valor === 30);
ok("Daño rápido y superpoder", M.danio({ perfecto: true, rapido: true, superpoder: true, rival: sal }).valor === 70);
ok("Escudo para medio golpe si no es perfecto", (d => d.valor === 10 && d.bloqueado)(M.danio({ perfecto: false, rival: esc })) && !M.danio({ perfecto: true, rival: esc }).bloqueado);
ok("Estrellas de duelo", M.estrellasDuelo(false, 3) === 0 && M.estrellasDuelo(true, 1) === 1 && M.estrellasDuelo(true, 2) === 2 && M.estrellasDuelo(true, 3) === 3);
ok("Desbloqueo de rivales", M.rivalDesbloqueado(1, {}) && !M.rivalDesbloqueado(2, {}) && M.rivalDesbloqueado(2, { 1: 1 }));
ok("Estrellas de Pizza Rush pasan a los rivales", JSON.stringify(M.estrellasDesdeV2({ estrellas: { 1: 3, 2: 1 } })) === '{"1":3,"2":1}' && JSON.stringify(M.estrellasDesdeV2(null)) === "{}");
ok("Fases del Crítico", (r => M.faseDe(r, 150) === 1 && M.faseDe(r, 90) === 2 && M.faseDe(r, 40) === 3)(M.RIVALES[7]));

console.log(`Tipos generados: ${JSON.stringify(conteo)}`);
console.log(fallos ? `\n${fallos} de ${n} comprobaciones fallidas` : `\n${n.toLocaleString("es-ES")} comprobaciones correctas`);
process.exit(fallos ? 1 : 0);
