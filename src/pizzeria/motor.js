/* =====================================================================
   Pizzería πCHU v0.3 · motor matemático
   Todo se calcula con ENTEROS: una pizza = 24 "veinticuatroavos"
   (24 se puede dividir entre 2, 3, 4, 6 y 8). Así no hay decimales
   ni errores de redondeo.
   Este archivo no toca la pantalla: se puede probar en Node.
   ===================================================================== */
(function (raiz) {
  "use strict";

  const U = 24;                                   // una pizza entera
  const TODAS = [2, 3, 4, 6, 8];                  // porciones que hay: ½ ⅓ ¼ ⅙ ⅛
  const NOMBRE = { 2: "un medio", 3: "un tercio", 4: "un cuarto", 6: "un sexto", 8: "un octavo" };

  // ---------- Fracciones ----------
  const mcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const mcm = (a, b) => a / mcd(a, b) * b;
  const simplificar = (n, d) => { const g = mcd(n, d); return { n: n / g, d: d / g }; };
  const aU = (n, d) => n * U / d;                 // fracción → veinticuatroavos
  const deU = t => simplificar(t, U);             // veinticuatroavos → fracción simplificada

  // Fracción como marca de texto: {3/4}. La pantalla la dibuja apilada.
  const F = (n, d) => d === 1 ? String(n) : `{${n}/${d}}`;
  const FU = t => { const s = deU(t); return F(s.n, s.d); };
  // Para lectores de pantalla y pruebas: quita las llaves.
  const plano = s => s.replace(/\{(\d+)\/(\d+)\}/g, "$1/$2");

  // ---------- ¿Se puede formar t con las porciones de los botones? ----------
  // Devuelve la lista MÍNIMA de porciones (denominadores), preferiendo las grandes, o null.
  function descomponer(t, botones) {
    const tam = [...botones].sort((a, b) => a - b).map(d => ({ d, u: U / d }));   // de grande a pequeña en u
    const mejor = Array(t + 1).fill(null); mejor[0] = [];
    for (let s = 1; s <= t; s++) {
      for (const { d, u } of tam) {
        if (u <= s && mejor[s - u] && (!mejor[s] || mejor[s - u].length + 1 < mejor[s].length)) mejor[s] = [...mejor[s - u], d];
      }
    }
    return mejor[t] ? mejor[t].sort((a, b) => a - b) : null;
  }
  const sePuede = (t, botones) => t > 0 && descomponer(t, botones) !== null;

  // ---------- Comprobar lo servido ----------
  // porciones: lista de denominadores, en el orden en que se pusieron.
  function comprobar(objetivo, porciones) {
    const servido = porciones.reduce((s, d) => s + U / d, 0);
    const ps = deU(objetivo), ss = servido ? deU(servido) : { n: 0, d: 1 };
    const comun = mcm(ps.d, ss.d);
    const dif = servido - objetivo;
    return {
      exacto: dif === 0, servido, objetivo, dif,
      pedido: ps, hecho: ss, comun,
      pedidoComun: ps.n * comun / ps.d, hechoComun: ss.n * comun / ss.d,
      falta: dif < 0 ? deU(-dif) : null, sobra: dif > 0 ? deU(dif) : null
    };
  }

  // Agrupa porciones iguales seguidas por tamaño: [2,8,8,8] → [{n:1,d:2},{n:3,d:8}]
  function agrupar(porciones) {
    const cuenta = new Map();
    for (const d of porciones) cuenta.set(d, (cuenta.get(d) || 0) + 1);
    return [...cuenta.entries()].sort((a, b) => a[0] - b[0]).map(([d, n]) => ({ n, d }));
  }

  // Si pasa de 1 y no es entero, se añade la forma mixta: " = 1 y {5/8}"
  const mixtoFinal = f => f.d > 1 && f.n > f.d ? ` = ${Math.floor(f.n / f.d)} y ${F(f.n % f.d, f.d)}` : "";

  // Cuenta que se enseña al acertar: "{1/2} + {1/4} = {2/4} + {1/4} = {3/4}"
  function cuentaSuma(porciones) {
    const g = agrupar(porciones);
    if (!g.length) return "";
    const total = deU(porciones.reduce((s, d) => s + U / d, 0));
    const fin = total.d === 1 ? String(total.n) : F(total.n, total.d);
    if (g.length === 1) {
      const { n, d } = g[0];
      return (n === 1 ? fin : `${F(n, d)}${F(n, d) === fin ? "" : " = " + fin}`) + mixtoFinal(total);
    }
    const comun = g.reduce((m, x) => mcm(m, x.d), 1);
    const paso1 = g.map(x => F(x.n, x.d)).join(" + ");
    const paso2 = g.map(x => F(x.n * comun / x.d, comun)).join(" + ");
    const sumaN = g.reduce((s, x) => s + x.n * comun / x.d, 0);
    const pasos = [paso1];
    if (paso2 !== paso1) pasos.push(paso2);
    const crudo = F(sumaN, comun);
    if (crudo !== fin) pasos.push(crudo);
    pasos.push(fin);
    return pasos.join(" = ") + mixtoFinal(total);
  }

  // ---------- Generador de pedidos ----------
  const azar = a => a[Math.floor(Math.random() * a.length)];
  const entre = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  // Frases. {P} = la fracción del pedido.
  const FRASES = ["Quiero {P} de pizza, por favor.", "¡Ponme {P} de pizza!", "Para mí, {P} de pizza.",
    "¿Me pones {P} de pizza?", "Hoy me apetece {P} de pizza."];
  const pedir = txt => azar(FRASES).replace("{P}", txt);

  // Escribe t a veces sin simplificar (6/8 en vez de 3/4) usando denominadores de los botones
  function escribirFraccion(t, botones, probSinSimplificar) {
    const s = deU(t);
    if (s.d > 1 && Math.random() < probSinSimplificar) {
      const ks = [2, 3, 4].filter(k => botones.includes(s.d * k));
      if (ks.length) { const k = azar(ks); return F(s.n * k, s.d * k); }
    }
    return F(s.n, s.d);
  }
  // Fracción mayor que 1 en forma mixta: "1 y {1/2}"
  function mixto(t) { const e = Math.floor(t / U), r = t % U; return r ? `${e} y ${FU(r)}` : String(e); }

  // Fracciones propias con denominadores dados (simplificadas, sin repetir)
  function propias(dens) {
    const out = new Map();
    for (const d of dens) for (let n = 1; n < d; n++) out.set(aU(n, d), true);
    return [...out.keys()];
  }

  // Dos cantidades "amigas" para sumar: denominadores distintos, uno múltiplo del otro (½ y ⅛, ⅓ y ⅙…)
  function amigas(a, b) {
    const da = deU(a).d, db = deU(b).d;
    return da !== db && (da % db === 0 || db % da === 0);
  }
  const coprimos = (n, d) => mcd(n, d) === 1;

  const GEN = {
    // Menú 1: medios y cuartos
    1(cfg) {
      const t = azar([6, 12, 18, 12, 18, 6, 24]);
      if (t === U && Math.random() < 0.4) return { texto: pedir(F(4, 4)), objetivo: t, tipo: "fraccion" };
      if (t === U) return { texto: azar(["¡Una pizza entera, que tengo mucha hambre!", "Quiero una pizza entera."]), objetivo: t, tipo: "entera" };
      if (t === 12 && Math.random() < 0.4) return { texto: azar(["Media pizza, por favor.", "Ponme media pizza."]), objetivo: t, tipo: "palabras" };
      return { texto: pedir(escribirFraccion(t, cfg.botones, 0.3)), objetivo: t, tipo: "fraccion" };
    },
    // Menú 2: tercios, sextos y octavos (y sumas en la misma pizza)
    2(cfg) {
      if (Math.random() < 0.3) {
        // dos personas comparten pizza: a + b < 1 con denominadores distintos
        for (let i = 0; i < 50; i++) {
          const a = azar(propias([2, 3, 4, 6, 8])), b = azar(propias([3, 4, 6, 8]));
          if (!amigas(a, b) || a + b >= U || !sePuede(a + b, cfg.botones)) continue;
          return { texto: `${FU(a)} para mí y ${FU(b)} para mi amigo. ¡En la misma pizza!`, objetivo: a + b, tipo: "suma",
            operacion: `${FU(a)} + ${FU(b)}` };
        }
      }
      const t = azar(propias([3, 6, 8]).filter(x => deU(x).d !== 2 && deU(x).d !== 4 || Math.random() < 0.3));
      return { texto: pedir(escribirFraccion(t, cfg.botones, 0.3)), objetivo: t, tipo: "fraccion" };
    },
    // Menú 3: más de una pizza
    3(cfg) {
      const r = Math.random();
      if (r < 0.25) {
        for (let i = 0; i < 50; i++) {
          const a = azar(propias([2, 3, 4, 6, 8])), b = azar(propias([2, 3, 4, 6, 8]));
          if (a + b <= U || !amigas(a, b) || !sePuede(a + b, cfg.botones)) continue;
          return { texto: `Yo quiero ${FU(a)} y mi hermana ${FU(b)}.`, objetivo: a + b, tipo: "suma", operacion: `${FU(a)} + ${FU(b)}` };
        }
      }
      const t = U + azar(propias([2, 3, 4, 6, 8]));
      if (r < 0.55) return { texto: `¡Tengo hambre! Quiero ${mixto(t)} pizzas.`, objetivo: t, tipo: "mixto" };
      if (r < 0.65) return { texto: "Dos pizzas enteras, por favor.", objetivo: 2 * U, tipo: "entera" };
      const s = deU(t);
      return { texto: pedir(F(s.n, s.d)), objetivo: t, tipo: "impropia" };
    },
    // Menú 4: para compartir (multiplicar y dividir)
    4(cfg) {
      for (let i = 0; i < 200; i++) {
        const tipo = azar(["veces", "veces", "parte", "fraccionDe", "repartir", "repartir"]);
        let p;
        if (tipo === "veces") {                          // k · n/d
          const k = entre(2, 4), d = azar([3, 4, 6, 8]), n = entre(1, 2), t = k * aU(n, d);
          if (!coprimos(n, d) || t > 2 * U) continue;
          p = { texto: `Somos ${k} y cada uno quiere ${F(n, d)} de pizza.`, objetivo: t, operacion: `${k} · ${F(n, d)}` };
        } else if (tipo === "parte") {                   // la mitad / la tercera parte de n/d
          const [k, nombre] = azar([[2, "La mitad"], [3, "La tercera parte"], [4, "La cuarta parte"]]);
          const d = azar([2, 3, 4]), n = entre(1, d - 1 || 1) + (Math.random() < 0.3 ? d : 0);
          const t = aU(n, d) / k;
          if (!coprimos(n, d) || !Number.isInteger(t)) continue;
          p = { texto: `${nombre} de ${F(n, d)} de pizza, por favor.`, objetivo: t, operacion: `${F(1, k)} · ${F(n, d)}` };
        } else if (tipo === "fraccionDe") {              // a/b de n/d
          const b = azar([3, 4]), a = entre(2, b - 1), d = azar([2, 4]), n = entre(1, d);
          const t = aU(n, d) * a / b;
          if (!coprimos(n, d) || !coprimos(a, b) || !Number.isInteger(t)) continue;
          const de = n === d ? "una pizza entera" : `${F(n, d)} de pizza`;
          if (n === d) continue;                         // "a/b de una pizza" no es multiplicar de verdad
          p = { texto: `Quiero ${F(a, b)} de ${de}.`, objetivo: t, operacion: `${F(a, b)} · ${F(n, d)}` };
        } else {                                         // n/d repartido entre k: mi parte
          const k = entre(2, 4), d = azar([2, 4]), n = entre(1, d - 1) + (Math.random() < 0.35 ? d : 0);
          const t = aU(n, d) / k;
          if (!coprimos(n, d) || !Number.isInteger(t)) continue;
          const cuanto = n >= d ? mixto(aU(n, d)) + " pizzas" : `${F(n, d)} de pizza`;
          p = { texto: `Hay ${cuanto} para ${k} amigos, a partes iguales. Ponme mi parte.`, objetivo: t, operacion: `${FU(aU(n, d))} : ${k}` };
        }
        if (p.objetivo <= 0 || p.objetivo > 2 * U || !sePuede(p.objetivo, cfg.botones)) continue;
        return { ...p, tipo };
      }
      return { texto: pedir(F(3, 4)), objetivo: 18, tipo: "fraccion" };
    }
  };

  const MENUS = [
    { id: 1, titulo: "Medios y cuartos", sub: "Reconoce fracciones y descubre que 2/4 = 1/2", botones: [2, 4], pizzas: 1, clientes: 8, guia: 4 },
    { id: 2, titulo: "Tercios, sextos y octavos", sub: "Suma porciones de distinto tamaño", botones: [2, 3, 4, 6, 8], pizzas: 1, clientes: 8, guia: 3 },
    { id: 3, titulo: "Más de una pizza", sub: "Fracciones mayores que 1: 5/4, 1 y 1/2…", botones: [2, 3, 4, 6, 8], pizzas: 2, clientes: 8, guia: 2 },
    { id: 4, titulo: "Para compartir", sub: "Multiplica y divide: «somos 3, 1/4 cada uno»", botones: [2, 3, 4, 6, 8], pizzas: 2, clientes: 8, guia: 0 }
  ];

  // Crea un pedido del menú, distinto del anterior (si se pasa)
  function generarPedido(menu, anterior) {
    const cfg = typeof menu === "number" ? MENUS[menu - 1] : menu;
    let p;
    for (let i = 0; i < 30; i++) {
      p = GEN[cfg.id](cfg);
      if (!anterior || p.objetivo !== anterior.objetivo) break;
    }
    p.solucion = descomponer(p.objetivo, cfg.botones);
    p.leer = plano(p.texto);
    return p;
  }

  // Estrellas de un menú según los clientes servidos a la primera
  function estrellas(primera, total) {
    if (primera >= total) return 3;
    if (primera >= total - 2) return 2;
    return 1;
  }

  // Clientes del álbum: cada menú regala uno con 2 estrellas y otro con 3
  const CLIENTES = [
    { id: "compas", nombre: "Don Compás", menu: 1, est: 2 }, { id: "malabares", nombre: "La Malabarista", menu: 1, est: 3 },
    { id: "pizarra", nombre: "El Profe Pizarra", menu: 2, est: 2 }, { id: "escudo", nombre: "Lady Escudo", menu: 2, est: 3 },
    { id: "pirata", nombre: "El Pirata", menu: 3, est: 2 }, { id: "salsita", nombre: "Salsita", menu: 3, est: 3 },
    { id: "reina", nombre: "La Reina", menu: 4, est: 2 }, { id: "critico", nombre: "El Crítico", menu: 4, est: 3 }
  ];
  // Clientes que se ganan con e estrellas en el menú m
  const premios = (m, e) => CLIENTES.filter(c => c.menu === m && c.est <= e).map(c => c.id);

  const CONTRARRELOJ = 90;   // segundos

  const motor = { U, TODAS, NOMBRE, MENUS, CLIENTES, CONTRARRELOJ, mcd, mcm, simplificar, aU, deU, F, FU, plano,
    descomponer, sePuede, comprobar, agrupar, cuentaSuma, generarPedido, estrellas, premios };
  if (typeof module !== "undefined" && module.exports) module.exports = motor; else raiz.Motor = motor;
})(typeof window !== "undefined" ? window : globalThis);
