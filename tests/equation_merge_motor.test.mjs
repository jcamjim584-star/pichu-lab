// Pruebas del motor de Equation Merge:  node tests/equation_merge_motor.test.mjs
// Comprueba que TODAS las ecuaciones que puede generar el juego tienen una única solución entera
// entre 1 y 20, que la explicación llega a esa solución y que el tablero funciona.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const M = require("../src/equation-merge/motor.js");
const { NIVELES, INFINITO } = require("../src/equation-merge/niveles.js");

let fallos = 0, n = 0;
const ok = (nombre, cond, extra = "") => { n++; if (!cond) { fallos++; if (fallos < 30) console.log("✗ " + nombre + "  → " + extra); } };

// 1. Cada forma, para cada x y muchas semillas
const formas = Object.keys(M.FORMAS);
for (const forma of formas) for (let x = 1; x <= M.MAX; x++) for (let s = 0; s < 60; s++) {
  const p = M.hacerPedido(forma, x, M.azar(s * 97 + x), 2);
  if (!p) continue;
  const ec = p.ecuacion || p.texto;
  ok(`${forma} x=${x}: solución única`, M.solucionTexto(ec) === x, `${ec} → ${M.solucionTexto(ec)}`);
  ok(`${forma} x=${x}: la explicación acaba en x = ${x}`, p.explica.includes(`x = ${x}`) || p.explica.includes(`= ${x}.`), p.explica);
  ok(`${forma} x=${x}: comprobación con la solución`, p.lado == null || p.comprueba(x).endsWith("= " + p.lado), p.comprueba(x));
  ok(`${forma} x=${x}: sin números negativos ni decimales en el enunciado`, !/-\d|\d[.,]\d/.test(ec.replace(/−/g, "")), ec);
  for (const [v] of p.tipicos) ok(`${forma}: un error típico nunca es la solución`, v !== x, `${ec} típico ${v}`);
}

// 2. Cada nivel genera ecuaciones válidas, con soluciones dentro de su rango y distintas entre sí
for (const niv of [...NIVELES, ...INFINITO]) {
  const rng = M.azar(12345);
  for (let r = 0; r < 300; r++) {
    const abiertos = [];
    for (let k = 0; k < 3; k++) {
      const p = M.nuevoPedido(niv, rng, abiertos);
      ok(`nivel ${niv.id || "inf"}: hay pedido`, !!p);
      if (!p) continue;
      ok(`nivel ${niv.id || "inf"}: x en rango`, p.x >= niv.xMin && p.x <= Math.min(M.MAX, niv.xMax), p.x);
      ok(`nivel ${niv.id || "inf"}: forma permitida`, p.forma in niv.formas, p.forma);
      ok(`nivel ${niv.id || "inf"}: soluciones distintas en pantalla`, !abiertos.some(q => q.x === p.x));
      abiertos.push(p);
    }
  }
}

// 3. Tablero: las fichas chocan y se suman
let t = M.crear(4, 1);
M.ponerFicha(t, 0, 3); M.ponerFicha(t, 1, 4); M.ponerFicha(t, 2, 2);
let r = M.mover(t, "izq");
ok("3 + 4 = 7 al deslizar a la izquierda", t.g[0].v === 7 && t.g[1].v === 2 && !t.g[2], JSON.stringify(t.g.slice(0, 4)));
ok("se informa de la fusión", r.fusiones.length === 1 && r.fusiones[0].v === 7);
t = M.crear(4, 1); M.ponerFicha(t, 0, 15); M.ponerFicha(t, 1, 9);
M.mover(t, "izq");
ok("15 + 9 no se funden (pasaría de 20)", t.g[0].v === 15 && t.g[1].v === 9);
t = M.crear(4, 1); M.ponerFicha(t, 0, 5); M.ponerFicha(t, 1, 5); M.ponerRoca(t, 4, 1);   // la roca está debajo de la casilla 0
r = M.mover(t, "izq");
ok("fusión dobles: 5 + 5", r.fusiones[0].iguales && t.g[0].v === 10);
ok("la fusión rompe la roca de al lado", !t.g[4], JSON.stringify(t.g.slice(0, 8)));
t = M.crear(4, 1); M.ponerFicha(t, 2, 3, true); M.ponerFicha(t, 3, 4);
M.mover(t, "izq");
ok("el hielo no se mueve pero se fusiona", t.g[2] && t.g[2].v === 7 && !t.g[0]);

// 4. Poderes
const f8 = { tipo: "num", v: 8 }, f7 = { tipo: "num", v: 7 }, f1 = { tipo: "num", v: 1 };
ok("÷2 de 8 = 4", M.poderMitad(f8) === "" && f8.v === 4);
ok("÷2 de 7 no se puede", M.poderMitad(f7) !== "" && f7.v === 7);
ok("−1 de 7 = 6", M.poderMenos(f7) === "" && f7.v === 6);
ok("−1 de 1 no se puede", M.poderMenos(f1) !== "" && f1.v === 1);

// 5. Errores típicos
const pedido = M.hacerPedido("suma", 7, () => 0.34);   // azar fijo: x + 5 = 12
ok("pedido de prueba x + 5 = 12", pedido.texto === "x + 5 = 12", pedido.texto);
ok("x + 5 = 12: entregar 17 es «has sumado»", M.errorTipico({ tipo: "num", v: 17 }, [pedido]).motivo.includes("sumado"));
ok("la explicación del error sustituye", M.explicaError({ tipo: "num", v: 17 }, [pedido]).includes("17 + 5 = 22"));
ok("un 9 no es error típico", M.errorTipico({ tipo: "num", v: 9 }, [pedido]) === null);

// 6. Partidas al azar: el tablero nunca tiene fichas fuera de 1..20
for (let s = 0; s < 200; s++) {
  const tb = M.crear(5, s), cfg = { fichas: [1, 2, 3], hielo: 0.1 };
  for (let i = 0; i < 3; i++) M.generar(tb, cfg);
  for (let k = 0; k < 120 && M.hayMovimiento(tb); k++) { M.mover(tb, ["izq", "der", "arr", "aba"][k % 4]); M.generar(tb, cfg); }
  ok("fichas entre 1 y 20", M.fichas(tb).every(f => f.v >= 1 && f.v <= 20));
}

console.log(fallos ? `\n${fallos} de ${n} comprobaciones fallidas` : `\nMotor de Equation Merge: ${n} comprobaciones, todo correcto`);
process.exit(fallos ? 1 : 0);
