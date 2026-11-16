/* =========================================================
   POWER MERGE · motor.js
   Las MATEMÁTICAS y las reglas del tablero, sin nada de pantalla.
   Se prueba solo con:  node tests/power_merge_motor.test.mjs

   Idea del juego:
   - Cada ficha es una potencia b^e (bases 2, 3, 5 y 10).
   - Al deslizar, dos fichas de la MISMA BASE que chocan se MULTIPLICAN:
         b^m · b^n = b^(m+n)      (se suman los exponentes)
   - Los pedidos piden un valor escrito de otra forma (64, √64, 2^2·2^4,
     (2^3)^2, "2 a la sexta"...). Se entregan tocando la ficha que vale eso.
   - Poderes: √ divide el exponente entre 2 (solo si es par) y ÷ divide
     entre la base (resta 1 al exponente).
   Los textos usan "^" para el exponente (2^5); la pantalla lo pinta como superíndice.
   ========================================================= */
(function (raiz) {
  "use strict";

  // Exponente máximo de cada base (para que los números sigan siendo de 1.º ESO).
  const BASES = { 2: 10, 3: 6, 5: 5, 10: 6 };
  // Hasta qué exponente se pide una raíz: √(b^(2e)) = b^e
  const RAIZ_MAX = { 2: 5, 3: 3, 5: 2, 10: 3 };
  const ORDINAL = { 2: "al cuadrado", 3: "al cubo", 4: "a la cuarta", 5: "a la quinta", 6: "a la sexta",
    7: "a la séptima", 8: "a la octava", 9: "a la novena", 10: "a la décima" };

  const valor = (b, e) => { let v = 1; for (let i = 0; i < e; i++) v *= b; return v; };
  // 12345 → "12 345" (los números de 5 cifras o más llevan espacio fino)
  const num = v => { const s = String(v); return s.length < 5 ? s : s.replace(/\B(?=(\d{3})+$)/g, " "); };
  const pot = (b, e) => b + "^" + e;
  const desarrollo = (b, e) => Array(e).fill(b).join("·");

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
  // e.g: array de n*n casillas. Cada casilla: null | ficha | roca
  //   ficha = { id, tipo:"pot", b, e, forma:"pot"|"num", hielo:false }
  //   roca  = { id, tipo:"roca", vida }
  function crear(n, semilla) {
    return { n, g: Array(n * n).fill(null), sig: 1, rng: azar(semilla == null ? Date.now() : semilla) };
  }
  const vacias = t => t.g.map((c, i) => c ? -1 : i).filter(i => i >= 0);
  const fichas = t => t.g.filter(c => c && c.tipo === "pot");

  function ponerFicha(t, i, b, e, forma, hielo) {
    t.g[i] = { id: t.sig++, tipo: "pot", b, e, forma: forma || "pot", hielo: !!hielo };
    return t.g[i];
  }
  function ponerRoca(t, i, vida) { t.g[i] = { id: t.sig++, tipo: "roca", vida: vida || 1 }; return t.g[i]; }

  // Ficha nueva en una casilla libre. cfg: { bases, e2 (prob. de exponente 2), pNum, hielo, pesos }
  function generar(t, cfg) {
    const libres = vacias(t);
    if (!libres.length) return null;
    const i = elige(t.rng, libres);
    const pesos = {};
    cfg.bases.forEach(b => { pesos[b] = (cfg.pesos && cfg.pesos[b]) || 1; });
    const b = +eligePeso(t.rng, pesos);
    const e = t.rng() < (cfg.e2 || 0) ? 2 : 1;
    const forma = e > 1 && t.rng() < (cfg.pNum || 0) ? "num" : "pot";
    const hielo = t.rng() < (cfg.hielo || 0);
    ponerFicha(t, i, b, e, forma, hielo);
    return i;
  }

  const puedeFusionar = (a, c) => a.tipo === "pot" && c.tipo === "pot" && a.b === c.b && a.e + c.e <= BASES[a.b];

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
  //   movs:     [{ id, de, a, fusion }]   fichas que se han movido (fusion = desaparece dentro de otra)
  //   fusiones: [{ en, b, e1, e2, e, id, ids, iguales }]   e1 = la que estaba quieta, e2 = la que llega
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
          const nueva = { id: t.sig++, tipo: "pot", b: q.b, e: q.e + c.e, forma: "pot", hielo: false };
          fusiones.push({ en: l[ult], b: q.b, e1: q.e, e2: c.e, e: nueva.e, id: nueva.id, ids: [q.id, c.id], iguales: q.e === c.e });
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
    t.g.forEach((c, i) => { if (!c) pos.push(i); else if (c.tipo === "pot" && !c.hielo) { pos.push(i); fs.push(c); } });
    for (const i of pos) t.g[i] = null;
    for (let i = pos.length - 1; i > 0; i--) { const j = Math.floor(t.rng() * (i + 1)); [pos[i], pos[j]] = [pos[j], pos[i]]; }
    fs.forEach((f, k) => { t.g[pos[k]] = f; });
  }

  // ---------- Poderes (devuelven "" si se aplican, o el motivo por el que no se puede) ----------
  // √(b^(2k)) = b^k : solo existe raíz exacta de este tipo si el exponente es par.
  function poderRaiz(f) {
    if (!f || f.tipo !== "pot") return "Elige una ficha.";
    if (f.e % 2 !== 0) return `${pot(f.b, f.e)} = ${num(valor(f.b, f.e))} no tiene raíz cuadrada exacta: el exponente ${f.e} es impar.`;
    f.e = f.e / 2; f.forma = "pot";
    return "";
  }
  // b^e : b = b^(e-1)
  function poderDividir(f) {
    if (!f || f.tipo !== "pot") return "Elige una ficha.";
    if (f.e < 2) return `${f.b} : ${f.b} = 1, y el 1 no sirve como ficha. Elige una ficha con exponente 2 o más.`;
    f.e -= 1; f.forma = "pot";
    return "";
  }

  // ---------- Pedidos ----------
  // Exponentes que se pueden pedir con cada forma y base.
  function exponentesValidos(forma, b, eMin, eMax) {
    const tope = Math.min(eMax, BASES[b]), lista = [];
    for (let e = Math.max(1, eMin); e <= tope; e++) {
      if (forma === "raiz" && e > RAIZ_MAX[b]) continue;
      if ((forma === "prod" || forma === "desc" || forma === "pal") && e < 2) continue;
      if (forma === "desc" && e > 6) continue;
      if (forma === "potpot" && ![4, 6, 8, 9, 10].includes(e)) continue;
      lista.push(e);
    }
    return lista;
  }

  // Construye el pedido (texto que se ve + explicación) para que valga exactamente b^e.
  function hacerPedido(forma, b, e, rng) {
    const v = valor(b, e), P = pot(b, e);
    const p = { b, e, forma, valor: v };
    if (forma === "pot") { p.texto = P; p.explica = `${P} = ${num(v)}`; }
    else if (forma === "num") { p.texto = num(v); p.explica = e === 1 ? `${num(v)} = ${P}` : `${num(v)} = ${desarrollo(b, e)} = ${P}`; }
    else if (forma === "desc") { p.texto = desarrollo(b, e); p.explica = `${desarrollo(b, e)}: el ${b} se multiplica ${e} veces, es ${P} = ${num(v)}`; }
    else if (forma === "pal") { p.texto = `${b} ${ORDINAL[e]}`; p.explica = `«${b} ${ORDINAL[e]}» es ${P} = ${num(v)}`; }
    else if (forma === "raiz") {
      const rad = valor(b, 2 * e);
      p.texto = "√" + num(rad);
      p.explica = `√${num(rad)} = ${num(v)} porque ${num(v)} · ${num(v)} = ${num(rad)}` + (e > 1 ? `. Y ${num(v)} = ${P}` : "");
    } else if (forma === "prod") {
      const m = entero(rng, 1, e - 1), k = e - m;
      p.texto = `${pot(b, m)} · ${pot(b, k)}`;
      p.explica = `Misma base: se suman los exponentes. ${pot(b, m)} · ${pot(b, k)} = ${b}^(${m}+${k}) = ${P} = ${num(v)}`;
    } else if (forma === "coc") {
      const k = entero(rng, 1, 3), m = e + k;
      p.texto = `${pot(b, m)} : ${pot(b, k)}`;
      p.explica = `Misma base: se restan los exponentes. ${pot(b, m)} : ${pot(b, k)} = ${b}^(${m}−${k}) = ${P} = ${num(v)}`;
    } else if (forma === "potpot") {
      const pares = [];
      for (let m = 2; m <= e / 2; m++) if (e % m === 0) pares.push([m, e / m]);
      const [m, k] = elige(rng, pares);
      p.texto = `(${pot(b, m)})^${k}`;
      p.explica = `Potencia de una potencia: se multiplican los exponentes. (${pot(b, m)})^${k} = ${b}^(${m}·${k}) = ${P} = ${num(v)}`;
    } else throw new Error("Forma desconocida: " + forma);
    return p;
  }

  // Pedido nuevo al azar. cfg: { bases, formas:{forma:peso}, eMin, eMax }.
  // "abiertos" = pedidos que ya están en pantalla: no se repite el mismo valor,
  // así cada ficha solo puede corresponder a un pedido (sin ambigüedad).
  function nuevoPedido(cfg, rng, abiertos) {
    const usados = new Set((abiertos || []).map(p => p.b + "^" + p.e));
    for (let intento = 0; intento < 60; intento++) {
      const forma = eligePeso(rng, cfg.formas);
      const b = elige(rng, cfg.bases);
      const es = exponentesValidos(forma, b, cfg.eMin, cfg.eMax).filter(e => !usados.has(b + "^" + e));
      if (!es.length) continue;
      return hacerPedido(forma, b, elige(rng, es), rng);
    }
    // Último recurso: cualquier valor libre, escrito como número.
    for (const b of cfg.bases) for (let e = 1; e <= BASES[b]; e++)
      if (!usados.has(b + "^" + e)) return hacerPedido("num", b, e, rng);
    return null;
  }

  const coincide = (f, p) => !!f && !!p && f.tipo === "pot" && f.b === p.b && f.e === p.e;

  // Explicación cuando se toca una ficha que no vale lo que ningún pedido.
  function explicaError(f, pedidos) {
    const v = valor(f.b, f.e);
    let t = f.e === 1 ? `Tu ficha vale ${f.b}.` : `Tu ficha: ${pot(f.b, f.e)} = ${desarrollo(f.b, f.e)} = ${num(v)}.`;
    const mismo = (pedidos || []).find(p => p.b === f.b);
    if (mismo) {
      const d = mismo.e - f.e;
      if (mismo.forma === "raiz") {
        const rad = mismo.valor * mismo.valor;
        if (v === rad) t = `Ojo: √${num(rad)} no es ${num(rad)}; es el número que multiplicado por sí mismo da ${num(rad)}. ` + t;
        else if (v * 2 === rad) t = `Ojo: la raíz cuadrada no es la mitad. ` + t;
      }
      t += ` El pedido ${mismo.texto} vale ${num(mismo.valor)} = ${pot(mismo.b, mismo.e)}. `;
      t += d > 0 ? `Te falta multiplicar por ${pot(f.b, d)}: fusiónala con otra ficha de base ${f.b}.`
                 : `Te has pasado: sobra un factor ${pot(f.b, -d)}. Puedes dividirla con ÷ o con √.`;
    } else t += " Ningún pedido vale eso ahora mismo.";
    return t;
  }

  const api = { BASES, RAIZ_MAX, valor, num, pot, desarrollo, azar, crear, vacias, fichas, ponerFicha, ponerRoca, generar,
    puedeFusionar, mover, clonar, hayMovimiento, barajar, poderRaiz, poderDividir, exponentesValidos, hacerPedido,
    nuevoPedido, coincide, explicaError, vecinas, elige, eligePeso };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  raiz.PowerMotor = api;
})(typeof window !== "undefined" ? window : globalThis);
