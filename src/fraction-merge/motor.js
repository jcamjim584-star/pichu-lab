/* =========================================================
   FRACTION MERGE · motor.js
   Las MATEMÁTICAS y las reglas del tablero, sin nada de pantalla.
   Se prueba solo con:  node tests/fraction_merge_motor.test.mjs

   Idea del juego:
   - Cada ficha es una fracción (1/2, 1/4, 3/8…).
   - Al deslizar, dos fichas que chocan se SUMAN si el resultado no pasa de 1:
         1/2 + 1/4 = 2/4 + 1/4 = 3/4
   - Si la suma da exactamente 1, se completa una UNIDAD y la ficha desaparece.
   - Los pedidos piden una fracción escrita de otra forma (6/8, un dibujo,
     «tres cuartos», 1/2 + 1/4, 1 − 1/4, 0,75…). Se entregan tocando la ficha
     que vale eso.
   Las fracciones se escriben "3/4" en los textos; la pantalla las pinta apiladas.
   Una ficha: { id, tipo:"fr", n, d, m, hielo }  → vale n/d (irreducible) y se ENSEÑA
   como (n·m)/(d·m): con m > 1 está sin simplificar (2/4 en vez de 1/2).
   ========================================================= */
(function (raiz) {
  "use strict";

  const mcd = (a, b) => b ? mcd(b, a % b) : a;
  const mcm = (a, b) => a / mcd(a, b) * b;
  const red = (n, d) => { const g = mcd(n, d); return { n: n / g, d: d / g }; };
  const suma = (a, b) => red(a.n * b.d + b.n * a.d, a.d * b.d);
  const resta = (a, b) => red(a.n * b.d - b.n * a.d, a.d * b.d);
  const igual = (a, b) => a.n * b.d === b.n * a.d;
  const menorIgual1 = f => f.n <= f.d;
  const txt = f => f.d === 1 ? String(f.n) : `${f.n}/${f.d}`;
  const sobre = (f, D) => `${f.n * D / f.d}/${D}`;            // la misma fracción con denominador D

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
    let r = rng() * claves.reduce((s, k) => s + pesos[k], 0);
    for (const k of claves) { r -= pesos[k]; if (r < 0) return k; }
    return claves[claves.length - 1];
  }

  // ---------- Tablero ----------
  function crear(n, semilla) { return { n, g: Array(n * n).fill(null), sig: 1, rng: azar(semilla == null ? Date.now() : semilla) }; }
  const vacias = t => t.g.map((c, i) => c ? -1 : i).filter(i => i >= 0);
  const fichas = t => t.g.filter(c => c && c.tipo === "fr");
  function ponerFicha(t, i, n, d, m, hielo) { const f = red(n, d); t.g[i] = { id: t.sig++, tipo: "fr", n: f.n, d: f.d, m: m || 1, hielo: !!hielo }; return t.g[i]; }
  function ponerRoca(t, i, vida) { t.g[i] = { id: t.sig++, tipo: "roca", vida: vida || 1 }; return t.g[i]; }

  // Ficha nueva: una fracción unitaria 1/d. cfg: { dens, pesos, pEq (prob. de salir sin simplificar), verMax, hielo }
  function generar(t, cfg) {
    const libres = vacias(t);
    if (!libres.length) return null;
    const i = elige(t.rng, libres), pesos = {};
    // Los medios salen la mitad de veces (son fichas grandes y atascan el tablero) y la ficha más
    // pequeña del nivel sale el doble (sirve para rellenar lo que falta hasta la unidad).
    const menor = Math.max(...cfg.dens);
    cfg.dens.forEach(d => { pesos[d] = (cfg.pesos && cfg.pesos[d]) || (d === 2 ? 0.5 : d === menor ? 2 : 1); });
    const d = +eligePeso(t.rng, pesos);
    let m = 1;
    if (t.rng() < (cfg.pEq || 0)) { const ms = [2, 3, 4].filter(k => d * k <= (cfg.verMax || 12)); if (ms.length) m = elige(t.rng, ms); }
    ponerFicha(t, i, 1, d, m, t.rng() < (cfg.hielo || 0));
    return i;
  }

  // Dos fichas se suman si el resultado no pasa de la unidad.
  // Si el tablero se queda sin fichas (se han entregado todas), salen dos nuevas para poder seguir.
  function rellenarSiVacio(t, cfg) {
    if (fichas(t).some(f => !f.hielo)) return false;          // quedan fichas que se pueden mover
    generar(t, cfg); generar(t, cfg);
    return true;
  }

  const puedeFusionar = (a, c) => a.tipo === "fr" && c.tipo === "fr" && menorIgual1(suma(a, c));

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
  //   fusiones: [{ en, a:{n,d}, b:{n,d}, r:{n,d}, id, unidad }]   a = la que estaba quieta, b = la que llega
  //             unidad = true → la suma da 1 y la casilla queda vacía
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
        if (c.hielo) { libre = p + 1; ult = p; continue; }
        if (ult >= 0 && !yaFus[ult] && puedeFusionar(g[l[ult]], c)) {
          const q = g[l[ult]], r = suma(q, c), unidad = r.n === r.d;
          const f = { en: l[ult], a: { n: q.n, d: q.d }, b: { n: c.n, d: c.d }, r, id: t.sig++, unidad };
          fusiones.push(f);
          movs.push({ id: c.id, de: l[p], a: l[ult], fusion: true });
          if (q.hielo) rotas.push({ en: l[ult], tipo: "hielo" });
          g[l[p]] = null;
          if (unidad) { g[l[ult]] = null; libre = ult; ult = -1; }
          else { g[l[ult]] = { id: f.id, tipo: "fr", n: r.n, d: r.d, m: 1, hielo: false }; yaFus[ult] = true; }
        } else {
          if (libre !== p) { g[l[libre]] = c; g[l[p]] = null; movs.push({ id: c.id, de: l[p], a: l[libre], fusion: false }); }
          ult = libre; libre++;
        }
      }
    }
    for (const f of fusiones) for (const v of vecinas(n, f.en)) {
      const c = g[v];
      if (!c) continue;
      if (c.tipo === "roca") { c.vida--; if (c.vida <= 0) { g[v] = null; rotas.push({ en: v, tipo: "roca" }); } else rotas.push({ en: v, tipo: "grieta" }); }
      else if (c.hielo) { c.hielo = false; rotas.push({ en: v, tipo: "hielo" }); }
    }
    return { movido: movs.length > 0, movs, fusiones, rotas };
  }
  function clonar(t) { return { n: t.n, g: t.g.map(c => c ? Object.assign({}, c) : null), sig: t.sig, rng: t.rng }; }
  const hayMovimiento = t => ["izq", "der", "arr", "aba"].some(d => mover(clonar(t), d).movido);
  function barajar(t) {
    const pos = [], fs = [];
    t.g.forEach((c, i) => { if (!c) pos.push(i); else if (c.tipo === "fr" && !c.hielo) { pos.push(i); fs.push(c); } });
    for (const i of pos) t.g[i] = null;
    for (let i = pos.length - 1; i > 0; i--) { const j = Math.floor(t.rng() * (i + 1)); [pos[i], pos[j]] = [pos[j], pos[i]]; }
    fs.forEach((f, k) => { t.g[pos[k]] = f; });
  }

  // Poder ✂: parte la ficha en dos mitades iguales. Devuelve "" si se hace o el motivo por el que no.
  // comun = denominador más grande del nivel (para no crear fracciones que no existen en él).
  function poderPartir(t, i, comun) {
    const f = t.g[i];
    if (!f || f.tipo !== "fr") return "Elige una ficha.";
    const h = red(f.n, f.d * 2);
    if (comun % h.d !== 0) return `La mitad de ${txt(f)} es ${txt(h)}, y en este nivel no hay fichas con denominador ${h.d}.`;
    const libres = vacias(t);
    if (!libres.length) return "No queda ninguna casilla libre para la otra mitad.";
    const n = t.n, dist = j => Math.abs(j % n - i % n) + Math.abs(Math.floor(j / n) - Math.floor(i / n));
    libres.sort((a, b) => dist(a) - dist(b));
    f.n = h.n; f.d = h.d; f.m = 1;
    ponerFicha(t, libres[0], h.n, h.d, 1);
    return "";
  }

  // ---------- Qué fracciones se pueden fabricar en un nivel ----------
  // Todas las sumas (menores que 1) de fracciones unitarias 1/d con d en dens.
  function alcanzables(dens) {
    const L = dens.reduce(mcm, 1), ok = Array(L + 1).fill(false), lista = [];
    ok[0] = true;
    for (let k = 1; k < L; k++) { ok[k] = dens.some(d => k - L / d >= 0 && ok[k - L / d]); if (ok[k]) lista.push(red(k, L)); }
    return lista;
  }

  // ---------- Pedidos ----------
  const UNO = ["", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once"];
  const PARTE = { 2: ["medio", "medios"], 3: ["tercio", "tercios"], 4: ["cuarto", "cuartos"], 5: ["quinto", "quintos"], 6: ["sexto", "sextos"],
    8: ["octavo", "octavos"], 10: ["décimo", "décimos"], 12: ["doceavo", "doceavos"] };
  const palabras = f => `${UNO[f.n]} ${PARTE[f.d][f.n === 1 ? 0 : 1]}`;
  const decimal = f => (100 % f.d === 0) ? String(f.n * 100 / f.d / 100).replace(".", ",") : null;

  // Pedido que vale exactamente f, escrito con la forma pedida. Devuelve null si esa forma no sirve para f.
  function hacerPedido(forma, f, rng, cfg) {
    const comun = cfg.comun, p = { n: f.n, d: f.d, forma }, F = txt(f);
    if (forma === "frac") { p.texto = F; p.explica = `Busca la ficha que vale ${F}. Vale también si está sin simplificar.`; }
    else if (forma === "equiv") {
      const ms = [2, 3, 4].filter(k => f.d * k <= 24); if (!ms.length) return null;
      const m = elige(rng, ms);
      p.texto = `${f.n * m}/${f.d * m}`; p.explica = `${p.texto} = ${F}: se divide arriba y abajo entre ${m}.`;
    } else if (forma === "dib") {
      const m = f.d <= 4 && rng() < 0.4 ? 2 : 1;
      p.dib = { pintadas: f.n * m, partes: f.d * m }; p.texto = `${f.n * m}/${f.d * m}`;
      p.explica = `Hay ${f.d * m} partes iguales y ${f.n * m} pintadas: ${f.n * m}/${f.d * m}` + (m > 1 ? ` = ${F}.` : ".");
    } else if (forma === "pal") {
      if (!PARTE[f.d] || f.n > 11) return null;
      p.texto = f.n === 1 && f.d === 2 ? "la mitad" : palabras(f); p.explica = `«${p.texto}» se escribe ${F}.`;
    } else if (forma === "dec") {
      const d = decimal(f); if (!d || d.length > 4) return null;
      p.texto = d; p.explica = `${d} = ${f.n * 100 / f.d}/100 = ${F}.`;
    } else if (forma === "sumaIgual" || forma === "restaIgual") {
      // Mismo denominador: se suman o restan los numeradores.
      const Ds = []; for (let D = f.d; D <= comun; D += f.d) if (comun % D === 0 && f.n * D / f.d >= (forma === "sumaIgual" ? 2 : 1) && f.n * D / f.d < D) Ds.push(D);
      if (!Ds.length) return null;
      const D = elige(rng, Ds), N = f.n * D / f.d;
      if (forma === "sumaIgual") {
        const i = entero(rng, 1, N - 1);
        p.texto = `${i}/${D} + ${N - i}/${D}`;
        p.explica = `Mismo denominador: se suman los numeradores. ${i} + ${N - i} = ${N}, así que da ${N}/${D}` + (D !== f.d ? ` = ${F}.` : ".");
      } else {
        const j = entero(rng, 1, D - N), a = N + j;
        p.texto = `${a === D ? "1" : a + "/" + D} − ${j}/${D}`;
        p.explica = (a === D ? `1 = ${D}/${D}. ` : "") + `Mismo denominador: se restan los numeradores. ${a} − ${j} = ${N}, así que da ${N}/${D}` + (D !== f.d ? ` = ${F}.` : ".");
      }
    } else if (forma === "suma" || forma === "resta") {
      // Distinto denominador: primero se pasa a denominador común.
      const todas = alcanzables(cfg.dens), pares = [];
      for (const x of todas) {
        const y = forma === "suma" ? resta(f, x) : suma(f, x);         // suma: x + y = f · resta: y − x = f
        if (y.n <= 0 || y.n > y.d || x.d === y.d || comun % y.d !== 0) continue;
        pares.push([x, y]);
      }
      if (!pares.length) return null;
      const [x, y] = elige(rng, pares), M = mcm(x.d, y.d);
      if (forma === "suma") {
        p.texto = `${txt(x)} + ${txt(y)}`;
        p.explica = `Denominador común ${M}: ${txt(x)} + ${txt(y)} = ${sobre(x, M)} + ${sobre(y, M)} = ${sobre(f, M)}` + (M !== f.d ? ` = ${F}.` : ".");
      } else {
        p.texto = `${txt(y)} − ${txt(x)}`;
        p.explica = `Denominador común ${M}: ${txt(y)} − ${txt(x)} = ${sobre(y, M)} − ${sobre(x, M)} = ${sobre(f, M)}` + (M !== f.d ? ` = ${F}.` : ".");
      }
    } else if (forma === "falta") {
      const x = resta({ n: 1, d: 1 }, f);
      p.texto = `${txt(x)} + ? = 1`;
      p.explica = `1 = ${f.d}/${f.d}. A ${sobre(x, f.d)} le faltan ${sobre(f, f.d)} para llegar a ${f.d}/${f.d}.`;
    } else if (forma === "mitad") {
      const x = red(f.n * 2, f.d); if (x.n >= x.d) return null;
      p.texto = `la mitad de ${txt(x)}`; p.explica = `La mitad de ${txt(x)}: se multiplica el denominador por 2 → ${x.n}/${x.d * 2}` + (x.d * 2 !== f.d ? ` = ${F}.` : ".");
    } else if (forma === "doble") {
      const x = red(f.n, f.d * 2); if (x.d > 24) return null;
      p.texto = `el doble de ${txt(x)}`; p.explica = `El doble de ${txt(x)}: se multiplica el numerador por 2 → ${x.n * 2}/${x.d}` + (x.d !== f.d ? ` = ${F}.` : ".");
    } else throw new Error("Forma desconocida: " + forma);
    return p;
  }

  // Pedido nuevo al azar. cfg: { dens, comun, formas:{forma:peso}, unidades (¿se piden 1/d sueltos?) }
  // No se repite el valor de un pedido abierto: cada ficha solo corresponde a un pedido.
  function nuevoPedido(cfg, rng, abiertos) {
    const todas = alcanzables(cfg.dens), compuestas = todas.filter(f => f.n > 1);
    // Las fracciones sueltas (1/4) se entregan nada más salir: solo se piden si el nivel lo dice o si hay muy pocas donde elegir.
    const base = cfg.unidades || compuestas.length < 5 ? todas : compuestas;
    const libres = base.filter(f => !(abiertos || []).some(p => p && igual(p, f)));
    for (let intento = 0; intento < 80 && libres.length; intento++) {
      const p = hacerPedido(eligePeso(rng, cfg.formas), elige(rng, libres), rng, cfg);
      if (p) return p;
    }
    return libres.length ? hacerPedido("frac", elige(rng, libres), rng, cfg) : null;
  }
  const coincide = (f, p) => !!f && !!p && f.tipo === "fr" && igual(f, p);

  // Explicación cuando se toca una ficha que no vale lo que ningún pedido: compara con el pedido más cercano.
  function explicaError(f, pedidos) {
    const ver = f.m > 1 ? `${f.n * f.m}/${f.d * f.m} = ${txt(f)}` : txt(f);
    let t = `Tu ficha vale ${ver}.`;
    const ps = (pedidos || []).filter(Boolean);
    if (!ps.length) return t + " Ningún pedido vale eso ahora mismo.";
    const dif = p => Math.abs(p.n / p.d - f.n / f.d);
    const p = ps.slice().sort((a, b) => dif(a) - dif(b))[0], P = txt(p), M = mcm(p.d, f.d);
    t += ` El pedido «${p.texto}» vale ${P}.`;
    if (p.n * f.d > f.n * p.d) t += ` Te falta ${txt(resta(p, f))}: ${sobre(p, M)} − ${sobre(f, M)} = ${sobre(resta(p, f), M)}. Súmale otra ficha.`;
    else t += ` Te has pasado en ${txt(resta(f, p))}. Puedes completarla hasta 1 para que desaparezca, o partirla con ✂.`;
    return t;
  }

  const api = { mcd, mcm, red, suma, resta, igual, txt, sobre, azar, elige, eligePeso, crear, vacias, fichas, ponerFicha, ponerRoca, generar, rellenarSiVacio, puedeFusionar,
    mover, clonar, hayMovimiento, barajar, poderPartir, alcanzables, hacerPedido, nuevoPedido, coincide, explicaError, vecinas, palabras, decimal };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  raiz.FraccionMotor = api;
})(typeof window !== "undefined" ? window : globalThis);
