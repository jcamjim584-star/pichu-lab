/* =========================================================
   EQUATION MERGE · motor.js
   Las MATEMÁTICAS y las reglas del tablero, sin nada de pantalla.
   Se prueba solo con:  node tests/equation_merge_motor.test.mjs

   Idea del juego:
   - Cada ficha es un número natural del 1 al 20.
   - Al deslizar, dos fichas que chocan se SUMAN (si el resultado no pasa de 20).
     Así se "fabrican" números.
   - Los pedidos son ECUACIONES de primer grado (x + 5 = 12, 3x = 18, 2x + 3 = 11...).
     Se entregan tocando la ficha que es la SOLUCIÓN.
   - Todas las ecuaciones tienen una única solución entera entre 1 y 20.
   - Poderes: ÷2 (mitad de una ficha par) y −1 (resta 1 a una ficha).
   ========================================================= */
(function (raiz) {
  "use strict";

  const MAX = 20;          // valor máximo de una ficha (y de una solución)

  // Generador de azar con semilla (para poder repetir las pruebas).
  function azar(semilla) {
    let a = semilla >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const entero = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
  const elige = (rng, lista) => lista[Math.floor(rng() * lista.length)];
  function eligePeso(rng, pesos) {
    const claves = Object.keys(pesos).filter(k => pesos[k] > 0);
    let total = claves.reduce((s, k) => s + pesos[k], 0), r = rng() * total;
    for (const k of claves) { r -= pesos[k]; if (r < 0) return k; }
    return claves[claves.length - 1];
  }

  // ---------- Tablero ----------
  // t.g: array de n*n casillas. Cada casilla: null | ficha | roca
  //   ficha = { id, tipo:"num", v, hielo:false }
  //   roca  = { id, tipo:"roca", vida }
  function crear(n, semilla) {
    return { n, g: Array(n * n).fill(null), sig: 1, rng: azar(semilla == null ? Date.now() : semilla) };
  }
  const vacias = t => t.g.map((c, i) => c ? -1 : i).filter(i => i >= 0);
  const fichas = t => t.g.filter(c => c && c.tipo === "num");

  function ponerFicha(t, i, v, hielo) {
    t.g[i] = { id: t.sig++, tipo: "num", v, hielo: !!hielo };
    return t.g[i];
  }
  function ponerRoca(t, i, vida) { t.g[i] = { id: t.sig++, tipo: "roca", vida: vida || 1 }; return t.g[i]; }

  // Ficha nueva en una casilla libre. cfg: { fichas: [valores posibles], hielo: probabilidad }
  function generar(t, cfg) {
    const libres = vacias(t);
    if (!libres.length) return null;
    const i = elige(t.rng, libres);
    const v = elige(t.rng, cfg.fichas || [1, 2, 3]);
    ponerFicha(t, i, v, t.rng() < (cfg.hielo || 0));
    return i;
  }

  const puedeFusionar = (a, c) => a.tipo === "num" && c.tipo === "num" && a.v + c.v <= MAX;

  // Las casillas de cada fila/columna, empezando por la pared hacia la que se desliza.
  function lineas(n, dir) {
    const L = [];
    for (let k = 0; k < n; k++) {
      const l = [];
      for (let p = 0; p < n; p++) {
        if (dir === "izq") l.push(k * n + p);
        else if (dir === "der") l.push(k * n + (n - 1 - p));
        else if (dir === "arr") l.push(p * n + k);
        else l.push((n - 1 - p) * n + k);
      }
      L.push(l);
    }
    return L;
  }
  function vecinas(n, i) {
    const f = Math.floor(i / n), c = i % n, v = [];
    if (f > 0) v.push(i - n); if (f < n - 1) v.push(i + n);
    if (c > 0) v.push(i - 1); if (c < n - 1) v.push(i + 1);
    return v;
  }

  // Desliza todo el tablero. Devuelve lo que ha pasado para poder animarlo.
  //   movs:     [{ id, de, a, fusion }]
  //   fusiones: [{ en, v1, v2, v, id, ids, iguales }]   v1 = la que estaba quieta, v2 = la que llega
  //   rotas:    [{ en, tipo:"roca"|"hielo"|"grieta" }]
  function mover(t, dir) {
    const n = t.n, g = t.g, movs = [], fusiones = [], rotas = [];
    for (const l of lineas(n, dir)) {
      let libre = 0, ult = -1;
      const yaFus = {};
      for (let p = 0; p < n; p++) {
        const c = g[l[p]];
        if (!c) continue;
        if (c.tipo === "roca") { libre = p + 1; ult = -1; continue; }
        if (c.hielo) { libre = p + 1; ult = p; continue; }           // no se mueve, pero se puede fusionar con ella
        if (ult >= 0 && !yaFus[ult] && puedeFusionar(g[l[ult]], c)) {
          const q = g[l[ult]];
          const nueva = { id: t.sig++, tipo: "num", v: q.v + c.v, hielo: false };
          fusiones.push({ en: l[ult], v1: q.v, v2: c.v, v: nueva.v, id: nueva.id, ids: [q.id, c.id], iguales: q.v === c.v });
          movs.push({ id: c.id, de: l[p], a: l[ult], fusion: true });
          if (q.hielo) rotas.push({ en: l[ult], tipo: "hielo" });
          g[l[ult]] = nueva; g[l[p]] = null; yaFus[ult] = true;
        } else {
          if (libre !== p) { g[l[libre]] = c; g[l[p]] = null; movs.push({ id: c.id, de: l[p], a: l[libre], fusion: false }); }
          ult = libre; libre++;
        }
      }
    }
    // Una fusión rompe las rocas y el hielo de las casillas de al lado.
    for (const f of fusiones) for (const v of vecinas(n, f.en)) {
      const c = g[v];
      if (!c) continue;
      if (c.tipo === "roca") {
        c.vida--;
        if (c.vida <= 0) { g[v] = null; rotas.push({ en: v, tipo: "roca" }); } else rotas.push({ en: v, tipo: "grieta" });
      } else if (c.hielo) { c.hielo = false; rotas.push({ en: v, tipo: "hielo" }); }
    }
    return { movido: movs.length > 0, movs, fusiones, rotas };
  }

  function clonar(t) { return { n: t.n, g: t.g.map(c => c ? Object.assign({}, c) : null), sig: t.sig, rng: t.rng }; }
  function hayMovimiento(t) {
    return ["izq", "der", "arr", "aba"].some(d => mover(clonar(t), d).movido);
  }

  // Mezcla las fichas que se pueden mover (rocas y hielo se quedan donde están).
  function barajar(t) {
    const pos = [], fs = [];
    t.g.forEach((c, i) => { if (!c) pos.push(i); else if (c.tipo === "num" && !c.hielo) { pos.push(i); fs.push(c); } });
    for (const i of pos) t.g[i] = null;
    for (let i = pos.length - 1; i > 0; i--) { const j = Math.floor(t.rng() * (i + 1)); [pos[i], pos[j]] = [pos[j], pos[i]]; }
    fs.forEach((f, k) => { t.g[pos[k]] = f; });
  }

  // ---------- Poderes (devuelven "" si se aplican, o el motivo por el que no se puede) ----------
  function poderMitad(f) {
    if (!f || f.tipo !== "num") return "Elige una ficha.";
    if (f.v % 2 !== 0) return `${f.v} es impar: su mitad no es un número entero. Elige una ficha par (2, 4, 6…).`;
    f.v = f.v / 2;
    return "";
  }
  function poderMenos(f) {
    if (!f || f.tipo !== "num") return "Elige una ficha.";
    if (f.v < 2) return "1 − 1 = 0, y el 0 no sirve como ficha. Elige una ficha de 2 o más.";
    f.v -= 1;
    return "";
  }

  // ---------- Ecuaciones (pedidos) ----------
  // Cada forma sabe construir una ecuación cuya solución es x.
  // Devuelve null si con ese x no se puede (por ejemplo, x − 5 = ... con x = 3).
  // Escritura: "·" para multiplicar cuando hace falta, "/" para "partido por", "−" (signo menos de verdad).
  const PASOS2 = new Set(["dos", "dosr", "ambos", "par"]);          // ecuaciones de dos pasos o más

  // Cada forma tiene:
  //   num(x, rng)       elige los números de la ecuación (o null si con ese x no se puede)
  //   crear(x, ...nums) construye texto, primer paso, explicación, comprobación y errores típicos
  const k1 = k => k === 1 ? "" : String(k);                          // 1x se escribe x
  const FORMAS = {
    // x + a = b
    suma: {
      num: (x, rng) => [entero(rng, 1, 12), rng() < 0.3],
      crear(x, a, alReves) {
        const b = x + a, izq = alReves ? `${a} + x` : `x + ${a}`;
        return { texto: `${izq} = ${b}`, paso: `−${a} en los dos lados`,
          explica: `${izq} = ${b} → restamos ${a} en los dos lados: x = ${b} − ${a} = ${x}. Comprobación: ${x} + ${a} = ${b} ✓`,
          comprueba: v => `${v} + ${a} = ${v + a}`, lado: b,
          tipicos: [[b + a, `Has sumado ${a} en vez de restarlo: lo que suma en un lado pasa restando al otro.`], [b, `${b} es el resultado de la ecuación, no la x.`]] };
      }
    },
    // x − a = b
    resta: {
      num: (x, rng) => x < 2 ? null : [entero(rng, 1, Math.min(12, x - 1))],
      crear(x, a) {
        const b = x - a;
        return { texto: `x − ${a} = ${b}`, paso: `+${a} en los dos lados`,
          explica: `x − ${a} = ${b} → sumamos ${a} en los dos lados: x = ${b} + ${a} = ${x}. Comprobación: ${x} − ${a} = ${b} ✓`,
          comprueba: v => `${v} − ${a} = ${v - a}`, lado: b,
          tipicos: [[b - a, `Has restado ${a} en vez de sumarlo: lo que resta en un lado pasa sumando al otro.`], [b, `${b} es el resultado de la ecuación, no la x.`]] };
      }
    },
    // a·x = b
    mult: {
      num: (x, rng) => [entero(rng, 2, x > 10 ? 4 : 6)],
      crear(x, a) {
        const b = a * x;
        return { texto: `${a}x = ${b}`, paso: `÷${a} en los dos lados`,
          explica: `${a}x = ${b} significa ${a} · x = ${b} → dividimos entre ${a} los dos lados: x = ${b} : ${a} = ${x}. Comprobación: ${a} · ${x} = ${b} ✓`,
          comprueba: v => `${a} · ${v} = ${a * v}`, lado: b,
          tipicos: [[b - a, `${a}x es ${a} · x: el ${a} está multiplicando, así que pasa dividiendo (no restando).`], [b, `${b} es el resultado de la ecuación, no la x.`]] };
      }
    },
    // x / a = b
    div: {
      num(x, rng) { const as = [2, 3, 4, 5].filter(a => x % a === 0 && x > a); return as.length ? [elige(rng, as)] : null; },
      crear(x, a) {
        const b = x / a;
        return { texto: `x/${a} = ${b}`, paso: `·${a} en los dos lados`,
          explica: `x/${a} = ${b} significa x : ${a} = ${b} → multiplicamos por ${a} los dos lados: x = ${b} · ${a} = ${x}. Comprobación: ${x} : ${a} = ${b} ✓`,
          comprueba: v => `${v} : ${a} = ${String(+(v / a).toFixed(2)).replace(".", ",")}`, lado: b,
          tipicos: [[b, `${b} es el resultado de dividir; la x es el número que se divide.`], [b + a, `El ${a} está dividiendo, así que pasa multiplicando (no sumando).`]] };
      }
    },
    // a·x + b = c
    dos: {
      num: (x, rng) => [entero(rng, 2, x > 8 ? 3 : 5), entero(rng, 1, 10)],
      crear(x, a, b) {
        const c = a * x + b;
        return { texto: `${a}x + ${b} = ${c}`, paso: `primero −${b}, luego ÷${a}`,
          explica: `${a}x + ${b} = ${c} → restamos ${b}: ${a}x = ${c - b} → dividimos entre ${a}: x = ${x}. Comprobación: ${a} · ${x} + ${b} = ${c} ✓`,
          comprueba: v => `${a} · ${v} + ${b} = ${a * v + b}`, lado: c,
          tipicos: [[(c + b) / a, `Has sumado ${b} en vez de restarlo.`], [c - b, `Vas bien: ${a}x = ${c - b}. Te falta dividir entre ${a}.`], [c / a - b, `Primero se quita el ${b} y después se divide entre ${a}.`]] };
      }
    },
    // a·x − b = c
    dosr: {
      num(x, rng) { const a = entero(rng, 2, x > 8 ? 3 : 5); return a * x < 2 ? null : [a, entero(rng, 1, Math.min(10, a * x - 1))]; },
      crear(x, a, b) {
        const c = a * x - b;
        return { texto: `${a}x − ${b} = ${c}`, paso: `primero +${b}, luego ÷${a}`,
          explica: `${a}x − ${b} = ${c} → sumamos ${b}: ${a}x = ${c + b} → dividimos entre ${a}: x = ${x}. Comprobación: ${a} · ${x} − ${b} = ${c} ✓`,
          comprueba: v => `${a} · ${v} − ${b} = ${a * v - b}`, lado: c,
          tipicos: [[(c - b) / a, `Has restado ${b} en vez de sumarlo.`], [c + b, `Vas bien: ${a}x = ${c + b}. Te falta dividir entre ${a}.`]] };
      }
    },
    // a·x + b = c·x + d   (x en los dos miembros)
    ambos: {
      num(x, rng) { const c = entero(rng, 1, 3); return [c + entero(rng, 1, 3), entero(rng, 0, 8), c]; },
      crear(x, a, b, c) {
        const k = a - c, d = k * x + b;
        const izq = b ? `${a}x + ${b}` : `${a}x`, der = `${k1(c)}x + ${d}`, kx = `${k1(k)}x`;
        return { texto: `${izq} = ${der}`, paso: `primero −${k1(c)}x en los dos lados`,
          explica: `${izq} = ${der} → restamos ${k1(c)}x en los dos lados: ${b ? `${kx} + ${b}` : kx} = ${d}` +
            (b ? ` → restamos ${b}: ${kx} = ${d - b}` : "") + (k > 1 ? ` → dividimos entre ${k}: x = ${x}` : "") +
            `. Comprobación: ${a} · ${x}${b ? ` + ${b}` : ""} = ${a * x + b} y ${c} · ${x} + ${d} = ${c * x + d} ✓`,
          comprueba: v => `en la izquierda sale ${a * v + b} y en la derecha ${c * v + d}`, lado: null,
          tipicos: [[(d - b) / (a + c), `Las x se juntan restando: ${a}x − ${k1(c)}x = ${kx} (no se suman).`], [d - b, `Vas bien: ${kx} = ${d - b}.${k > 1 ? ` Te falta dividir entre ${k}.` : ""}`]] };
      }
    },
    // a(x + b) = c   o   a(x − b) = c
    par: {
      num(x, rng) { const a = entero(rng, 2, x > 8 ? 3 : 4), menos = x > 2 && rng() < 0.4;
        return [a, menos ? entero(rng, 1, Math.min(5, x - 1)) : entero(rng, 1, 5), menos]; },
      crear(x, a, b, menos) {
        const s = menos ? "−" : "+", dentro = menos ? x - b : x + b, c = a * dentro, t = `${a}(x ${s} ${b})`;
        return { texto: `${t} = ${c}`, paso: `primero ÷${a}, luego ${menos ? "+" : "−"}${b}`,
          explica: `${t} = ${c} → dividimos entre ${a}: x ${s} ${b} = ${dentro} → ${menos ? "sumamos" : "restamos"} ${b}: x = ${x}. ` +
            `(También vale quitar el paréntesis: ${a}x ${s} ${a * b} = ${c}.) Comprobación: ${a} · (${x} ${s} ${b}) = ${c} ✓`,
          comprueba: v => `${a} · (${v} ${s} ${b}) = ${a * (menos ? v - b : v + b)}`, lado: c,
          tipicos: [[menos ? (c + b) / a : (c - b) / a, `El ${a} multiplica a TODO el paréntesis: ${a}(x ${s} ${b}) = ${a}x ${s} ${a * b}.`],
            [dentro, `Vas bien: x ${s} ${b} = ${dentro}. Te falta ${menos ? "sumar" : "restar"} ${b}.`]] };
      }
    },
    // Problemas en palabras: se traducen a una de las ecuaciones anteriores
    pal: {
      num(x, rng, dif) {
        const ops = [() => ["Pienso un número, le sumo {a} y obtengo {r}", "suma", entero(rng, 2, 9), false]];
        if (x > 2) ops.push(() => ["Pienso un número, le resto {a} y obtengo {r}", "resta", entero(rng, 1, Math.min(9, x - 1))]);
        if (x <= 10) ops.push(() => ["El doble de un número es {r}", "mult", 2], () => ["El triple de un número es {r}", "mult", 3]);
        if (x % 2 === 0 && x > 2) ops.push(() => ["La mitad de un número es {r}", "div", 2]);
        if (dif >= 2 && x <= 9) ops.push(() => ["El doble de un número más {b} es {r}", "dos", 2, entero(rng, 1, 6)]);
        if (dif >= 2 && x >= 2 && x <= 7) ops.push(() => ["El triple de un número menos {b} es {r}", "dosr", 3, entero(rng, 1, Math.min(5, 3 * x - 1))]);
        return elige(rng, ops)();
      },
      crear(x, frase, forma, ...nums) {
        const e = FORMAS[forma].crear(x, ...nums), r = e.texto.split(" = ")[1];
        const texto = frase.replace("{a}", nums[0]).replace("{b}", nums[1]).replace("{r}", r);
        return Object.assign(e, { texto, ecuacion: e.texto, explica: `«${texto}» se escribe ${e.texto}. ${e.explica}`, paso: `escríbela: ${e.texto}`,
          pasos2: PASOS2.has(forma) });
      }
    }
  };

  // Solución de una ecuación escrita como texto (para las pruebas: comprueba que es única).
  function solucionTexto(ec) {
    const [izq, der] = ec.replace(/−/g, "-").split(" = ");
    const js = lado => lado.replace(/(\d)x/g, "$1*x").replace(/(\d)\(/g, "$1*(");
    const val = (lado, x) => Function("x", "return " + js(lado) + ";")(x);
    const sols = [];
    for (let x = -50; x <= 100; x++) if (Math.abs(val(izq, x) - val(der, x)) < 1e-9) sols.push(x);
    return sols.length === 1 ? sols[0] : NaN;
  }

  // Construye el pedido para que la solución sea exactamente x (o null si no se puede con ese x).
  function hacerPedido(forma, x, rng, dif) {
    const f = FORMAS[forma];
    if (!f) throw new Error("Forma desconocida: " + forma);
    const nums = f.num(x, rng, dif || 1);
    if (!nums) return null;
    const e = Object.assign({ forma, x, pasos2: PASOS2.has(forma) }, f.crear(x, ...nums));
    // Errores típicos: solo números que podrían estar en una ficha y que no sean la solución.
    const vistos = new Set([x]);
    e.tipicos = e.tipicos.filter(([v]) => Number.isInteger(v) && v >= 1 && v <= MAX && !vistos.has(v) && vistos.add(v));
    return e;
  }

  // Pedido nuevo al azar. cfg: { formas:{forma:peso}, xMin, xMax, palDif }.
  // "abiertos" = pedidos en pantalla: no se repite la misma solución, así cada ficha
  // solo puede corresponder a un pedido (sin ambigüedad).
  function nuevoPedido(cfg, rng, abiertos) {
    const usados = new Set((abiertos || []).map(p => p.x));
    const xs = [];
    for (let x = Math.max(1, cfg.xMin || 2); x <= Math.min(MAX, cfg.xMax || 10); x++) if (!usados.has(x)) xs.push(x);
    if (!xs.length) return null;
    for (let intento = 0; intento < 60; intento++) {
      const forma = eligePeso(rng, cfg.formas);
      const p = hacerPedido(forma, elige(rng, xs), rng, cfg.palDif);
      if (p) return p;
    }
    return hacerPedido("suma", elige(rng, xs), rng);   // último recurso
  }

  const coincide = (f, p) => !!f && !!p && f.tipo === "num" && f.v === p.x;

  // Si la ficha es un error típico de algún pedido, devuelve { pedido, motivo }; si no, null.
  function errorTipico(f, pedidos) {
    for (const p of pedidos || []) {
      if (!p || p.x === f.v) continue;
      const t = p.tipicos.find(([v]) => v === f.v);
      if (t) return { pedido: p, motivo: t[1] };
    }
    return null;
  }
  // Explicación cuando se toca una ficha que no es la solución de ningún pedido.
  function explicaError(f, pedidos) {
    const tip = errorTipico(f, pedidos), p = tip ? tip.pedido : (pedidos || []).find(Boolean);
    if (!p) return `Tu ficha vale ${f.v}. Ahora mismo no hay ecuaciones.`;
    const ec = p.ecuacion || p.texto;
    let t = tip ? tip.motivo + " " : `Tu ficha vale ${f.v} y no es la solución de ninguna ecuación. `;
    t += `Compruébalo en ${ec}: si x = ${f.v}, ${p.comprueba(f.v)}` + (p.lado != null ? `, no ${p.lado}.` : ": no son iguales.");
    return t;
  }

  const api = { MAX, azar, crear, vacias, fichas, ponerFicha, ponerRoca, generar, puedeFusionar, mover, clonar, hayMovimiento,
    barajar, poderMitad, poderMenos, FORMAS, PASOS2, hacerPedido, nuevoPedido, coincide, errorTipico, explicaError,
    solucionTexto, vecinas, elige, eligePeso, entero };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  raiz.EquationMotor = api;
})(typeof window !== "undefined" ? window : globalThis);
