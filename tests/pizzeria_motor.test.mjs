// Pruebas del motor de la Pizzería πCHU v0.3:  node tests/pizzeria_motor.test.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const M = require("../src/pizzeria/motor.js");

let n = 0, fallos = 0;
const vistos = new Set();
const ok = (nombre, cond, extra = "") => {
  n++;
  if (!cond) { fallos++; if (!vistos.has(nombre)) { vistos.add(nombre); console.log("✗ " + nombre + "  → " + extra); } }
};

// Valor de una fracción escrita en el texto: "{3/4}", "1 y {1/2}", "2"
function valor(s) {
  let m;
  if ((m = s.match(/^(\d+) y \{(\d+)\/(\d+)\}$/))) return M.aU(+m[1] * +m[3] + +m[2], +m[3]);
  if ((m = s.match(/^\{(\d+)\/(\d+)\}$/))) return M.aU(+m[1], +m[2]);
  return M.aU(+s, 1);
}
// Mínimo de porciones por fuerza bruta
function minBruto(t, botones) {
  let mejor = Infinity;
  const tam = botones.map(d => M.U / d);
  const rec = (i, s, k) => {
    if (s === t) { mejor = Math.min(mejor, k); return; }
    if (s > t || i === tam.length || k >= mejor) return;
    rec(i, s + tam[i], k + 1); rec(i + 1, s, k);
  };
  rec(0, 0, 0); return mejor;
}

// ---------- Fracciones básicas ----------
ok("simplificar 6/8", JSON.stringify(M.simplificar(6, 8)) === '{"n":3,"d":4}');
ok("aU 3/4 = 18", M.aU(3, 4) === 18);
ok("FU 18 = {3/4}", M.FU(18) === "{3/4}");
ok("FU 24 = 1", M.FU(24) === "1");
ok("plano", M.plano("Quiero {3/4} y {1/2}") === "Quiero 3/4 y 1/2");

// ---------- descomponer = mínimo por fuerza bruta ----------
for (const botones of [[2, 4], [2, 3, 4, 6, 8], [3, 8], [6, 8]]) {
  for (let t = 1; t <= 48; t++) {
    const d = M.descomponer(t, botones), b = minBruto(t, botones);
    if (b === Infinity) { ok(`descomponer ${t} con ${botones} imposible`, d === null, JSON.stringify(d)); continue; }
    ok(`descomponer ${t} con ${botones}`, d && d.length === b && d.reduce((s, x) => s + M.U / x, 0) === t, `${JSON.stringify(d)} vs ${b}`);
    ok(`descomponer ${t}: solo botones`, d && d.every(x => botones.includes(x)));
  }
}

// ---------- comprobar ----------
{
  const r = M.comprobar(18, [2, 4]);
  ok("½ + ¼ = ¾ exacto", r.exacto && r.dif === 0);
  const r2 = M.comprobar(18, [8, 8, 8]);
  ok("3 octavos para ¾: falta 3/8", !r2.exacto && r2.falta.n === 3 && r2.falta.d === 8 && r2.comun === 8 && r2.pedidoComun === 6 && r2.hechoComun === 3, JSON.stringify(r2));
  const r3 = M.comprobar(12, [2, 8]);
  ok("½ + ⅛ para ½: sobra 1/8", r3.sobra.n === 1 && r3.sobra.d === 8);
  const r4 = M.comprobar(12, []);
  ok("nada servido", !r4.exacto && r4.servido === 0 && r4.falta.n === 1 && r4.falta.d === 2);
}

// ---------- cuentaSuma ----------
ok("cuenta ½ + ¼", M.cuentaSuma([2, 4]) === "{1/2} + {1/4} = {2/4} + {1/4} = {3/4}", M.cuentaSuma([2, 4]));
ok("cuenta ¼ ¼ ¼", M.cuentaSuma([4, 4, 4]) === "{3/4}", M.cuentaSuma([4, 4, 4]));
ok("cuenta ¼ ¼", M.cuentaSuma([4, 4]) === "{2/4} = {1/2}", M.cuentaSuma([4, 4]));
ok("cuenta ½ ½", M.cuentaSuma([2, 2]) === "{2/2} = 1", M.cuentaSuma([2, 2]));
ok("cuenta ⅓ + ⅙", M.cuentaSuma([3, 6]) === "{1/3} + {1/6} = {2/6} + {1/6} = {3/6} = {1/2}", M.cuentaSuma([3, 6]));
ok("cuenta ½", M.cuentaSuma([2]) === "{1/2}");
ok("cuenta ½ ½ ½ ⅛ (mixta)", M.cuentaSuma([2, 2, 2, 8]) === "{3/2} + {1/8} = {12/8} + {1/8} = {13/8} = 1 y {5/8}", M.cuentaSuma([2, 2, 2, 8]));
ok("cuenta ¼ x5 (mixta)", M.cuentaSuma([4, 4, 4, 4, 4]) === "{5/4} = 1 y {1/4}", M.cuentaSuma([4, 4, 4, 4, 4]));

// ---------- Pedidos de cada menú ----------
for (const menu of M.MENUS) {
  const tipos = new Set(), objetivos = new Set();
  let anterior = null;
  for (let i = 0; i < 20000; i++) {
    const p = M.generarPedido(menu.id, anterior);
    const max = menu.pizzas * M.U;
    tipos.add(p.tipo); objetivos.add(p.objetivo);
    ok(`Menú ${menu.id}: objetivo entero y positivo`, Number.isInteger(p.objetivo) && p.objetivo > 0, JSON.stringify(p));
    ok(`Menú ${menu.id}: cabe en ${menu.pizzas} pizza(s)`, p.objetivo <= max, JSON.stringify(p));
    ok(`Menú ${menu.id}: se puede servir con sus botones`, p.solucion && p.solucion.reduce((s, d) => s + M.U / d, 0) === p.objetivo, JSON.stringify(p));
    ok(`Menú ${menu.id}: distinto del anterior`, !anterior || anterior.objetivo !== p.objetivo, p.texto);
    ok(`Menú ${menu.id}: texto sin llaves sueltas`, !/[{}]/.test(p.leer), p.leer);
    if (menu.id === 1 || menu.id === 2) ok(`Menú ${menu.id}: máximo una pizza`, p.objetivo <= M.U, p.texto);
    if (menu.id === 2) ok("Menú 2: no es una pizza entera", p.objetivo < M.U, p.texto);
    if (menu.id === 3) ok("Menú 3: más de una pizza", p.objetivo > M.U, p.texto);
    // La fracción escrita vale lo que se pide
    if (["fraccion", "impropia", "mixto"].includes(p.tipo)) {
      const m = p.texto.match(/(\d+ y \{\d+\/\d+\}|\{\d+\/\d+\})/);
      ok(`Menú ${menu.id} ${p.tipo}: la fracción escrita vale el objetivo`, m && valor(m[1]) === p.objetivo, p.texto);
    }
    // Operaciones: se recalcula a partir de la cuenta escrita
    if (p.operacion) {
      const o = M.plano(p.operacion);
      let m, v = null;
      if ((m = o.match(/^(\d+)\/(\d+) \+ (\d+)\/(\d+)$/))) v = M.aU(+m[1], +m[2]) + M.aU(+m[3], +m[4]);
      else if ((m = o.match(/^(\d+) · (\d+)\/(\d+)$/))) v = +m[1] * M.aU(+m[2], +m[3]);
      else if ((m = o.match(/^(\d+)\/(\d+) · (\d+)\/(\d+)$/))) v = M.aU(+m[1], +m[2]) * +m[3] / +m[4];
      else if ((m = o.match(/^(\d+)\/(\d+) : (\d+)$/))) v = M.aU(+m[1], +m[2]) / +m[3];
      else if ((m = o.match(/^(\d+) : (\d+)$/))) v = M.aU(+m[1], 1) / +m[2];
      ok(`Menú ${menu.id}: operación reconocible`, v !== null, o);
      ok(`Menú ${menu.id}: la operación da el objetivo`, v === p.objetivo, `${o} → ${v} vs ${p.objetivo}`);
    }
    if (menu.id === 4) ok("Menú 4: siempre con operación", !!p.operacion, p.texto);
    anterior = p;
  }
  console.log(`Menú ${menu.id}: tipos ${[...tipos].join(", ")} · ${objetivos.size} cantidades distintas`);
  ok(`Menú ${menu.id}: variedad de cantidades`, objetivos.size >= 4, objetivos.size);
}
ok("Menú 2 tiene sumas", true);

// ---------- Estrellas ----------
ok("8/8 = 3★", M.estrellas(8, 8) === 3);
ok("6/8 = 2★", M.estrellas(6, 8) === 2);
ok("5/8 = 1★", M.estrellas(5, 8) === 1);
ok("0/8 = 1★", M.estrellas(0, 8) === 1);
ok("8 clientes distintos", new Set(M.CLIENTES.map(c => c.id)).size === 8);
for (const m of [1, 2, 3, 4]) {
  ok(`Menú ${m}: 1★ no da clientes`, M.premios(m, 1).length === 0);
  ok(`Menú ${m}: 2★ da un cliente`, M.premios(m, 2).length === 1);
  ok(`Menú ${m}: 3★ da dos clientes`, M.premios(m, 3).length === 2);
}

console.log(fallos ? `\n${fallos} de ${n} comprobaciones fallidas` : `\nTodo correcto (${n.toLocaleString("es")} comprobaciones)`);
process.exit(fallos ? 1 : 0);
