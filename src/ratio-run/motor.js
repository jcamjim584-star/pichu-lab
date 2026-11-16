/* =========================================================
   RATIO RUN · motor.js
   Las MATEMÁTICAS y el trazado de la pista, sin nada de pantalla.
   Se prueba solo con:  node tests/ratio_run_motor.test.mjs

   - pregunta(tipo, nivel, rng): un reto con 3 puertas (una sola correcta),
     pista y explicación. Los distractores son errores típicos del alumnado.
   - puertasOp(bolsa, nivel, rng): 3 puertas que cambian tu botín
     («+25 %», «+30», «×2», «−10 %»…). Hay que elegir la que deja más.
   - tramo(cfg, rng, z0, largo): un trozo de pista con obstáculos y monedas,
     siempre con al menos un carril por el que se puede pasar.
   Todos los resultados son números enteros (se eligen los datos para eso).
   ========================================================= */
(function (raiz) {
  "use strict";

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
  function barajar(rng, lista) {
    const l = lista.slice();
    for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
    return l;
  }
  const mcd = (a, b) => b ? mcd(b, a % b) : a;
  const esEntero = x => Number.isInteger(x);

  // Dos respuestas "valen lo mismo": números iguales, o razones equivalentes (2:4 y 1:2).
  function mismoValor(a, b) {
    if (String(a) === String(b)) return true;
    const ra = String(a).match(/^(\d+):(\d+)$/), rb = String(b).match(/^(\d+):(\d+)$/);
    if (ra && rb) return +ra[1] * +rb[2] === +ra[2] * +rb[1];
    return parseFloat(a) === parseFloat(b) && String(a).replace(/[\d\s.,]/g, "") === String(b).replace(/[\d\s.,]/g, "");
  }

  // Monta el reto: la respuesta correcta + 2 distractores distintos (por orden de preferencia) y baraja.
  function armar(rng, r, correcta, candidatos, unidad) {
    const u = unidad ? " " + unidad : "";
    const ok = correcta + u, malas = [];
    for (const c of candidatos) {
      if (c == null || (typeof c === "number" && (!esEntero(c) || c <= 0))) continue;
      const t = c + u;
      if (mismoValor(t, ok) || malas.some(m => mismoValor(m, t))) continue;
      malas.push(t);
      if (malas.length === 2) break;
    }
    // Último recurso (solo respuestas numéricas): números cercanos.
    for (let d = 1; malas.length < 2 && typeof correcta === "number"; d++) {
      for (const c of [correcta + d, correcta - d]) {
        if (c > 0 && malas.length < 2 && !malas.some(m => mismoValor(m, c + u))) malas.push(c + u);
      }
    }
    if (malas.length < 2) throw new Error("Faltan distractores: " + r.texto);
    const opciones = barajar(rng, [ok, malas[0], malas[1]]);
    return Object.assign(r, { opciones, correcta: opciones.indexOf(ok) });
  }

  const COSAS = [["manzanas", "peras", "🍎", "🍐"], ["perros", "gatos", "🐶", "🐱"], ["balones", "raquetas", "⚽", "🎾"], ["coches", "bicis", "🚗", "🚲"], ["lápices", "gomas", "✏️", "🧽"]];
  const TIENDA = ["Una camiseta", "Una mochila", "Un balón", "Un juego", "Unos auriculares", "Un patinete", "Una sudadera"];
  const SITUACIONES = [
    ["Kilos de naranjas que compras y lo que pagas", 0, "Doble de kilos, doble de precio."],
    ["Horas trabajadas y sueldo, cobrando lo mismo por hora", 0, "Doble de horas, doble de sueldo."],
    ["Lado de un cuadrado y su perímetro", 0, "Perímetro = 4 · lado: doble de lado, doble de perímetro."],
    ["Litros de gasolina y kilómetros recorridos al mismo ritmo", 0, "Doble de litros, doble de kilómetros."],
    ["Número de entradas de cine y precio total", 0, "Doble de entradas, doble de precio."],
    ["Tiempo que está abierto un grifo y litros que salen", 0, "Doble de tiempo, doble de litros."],
    ["Velocidad y tiempo que tardas en el mismo trayecto", 1, "Doble de velocidad, la mitad de tiempo."],
    ["Número de pintores y días que tardan en pintar la misma valla", 1, "Doble de pintores, la mitad de días."],
    ["Número de grifos iguales y tiempo en llenar el mismo depósito", 1, "Doble de grifos, la mitad de tiempo."],
    ["Personas que se reparten una pizza y trozo que le toca a cada una", 1, "Doble de personas, la mitad de pizza para cada una."],
    ["Vacas que comen del mismo pienso y días que dura", 1, "Doble de vacas, el pienso dura la mitad."],
    ["Amigos que pagan a partes iguales un regalo y lo que pone cada uno", 1, "Doble de amigos, cada uno pone la mitad."],
    ["Edad de una persona y su altura", 2, "No crece siempre lo mismo: con el doble de edad no mides el doble."],
    ["Lado de un cuadrado y su área", 2, "Doble de lado, área cuatro veces mayor: ni directa ni inversa."],
    ["Páginas que llevas leídas de un libro y páginas que te faltan", 2, "Se restan: leer el doble no hace que falte la mitad."],
    ["Edad de un padre y edad de su hija", 2, "Siempre se llevan los mismos años: cuando el padre tenga el doble de edad, la hija no tendrá el doble."],
    ["Número de goles de un equipo y minutos jugados", 2, "Jugar el doble de minutos no asegura el doble de goles."]
  ];
  const TIPOS_REL = ["Directa", "Inversa", "Ninguna"];

  const GEN = {
    // Razón entre dos cantidades
    razon(n, rng) {
      const [A, B, ia, ib] = elige(rng, COSAS);
      let a = entero(rng, 1, n > 1 ? 9 : 6), b = entero(rng, 1, n > 1 ? 9 : 6);
      if (a === b) b = a + 1;
      if (n >= 2 && rng() < 0.5) {
        return armar(rng, { texto: `Hay ${a} ${ia} y ${b} ${ib}. ¿Razón de ${B} al TOTAL?`, pista: "Primero suma para saber el total. El orden importa.",
          explica: `Total: ${a} + ${b} = ${a + b}. ${B} al total → ${b}:${a + b}.`, datos: { a, b, total: true } }, `${b}:${a + b}`, [`${b}:${a}`, `${a}:${a + b}`, `${a}:${b}`]);
      }
      return armar(rng, { texto: `Hay ${a} ${ia} y ${b} ${ib}. ¿Razón de ${A} a ${B}?`, pista: `El orden importa: primero ${A}, después ${B}.`,
        explica: `${A} a ${B} → ${a}:${b} (el orden importa).`, datos: { a, b } }, `${a}:${b}`, [`${b}:${a}`, `${a}:${a + b}`, `${b}:${a + b}`]);
    },
    // Razones equivalentes
    equiv(n, rng) {
      let a = entero(rng, 1, 5), b = entero(rng, 1, 5);
      if (a === b) b = a + 1;
      const g = mcd(a, b); a /= g; b /= g;
      const k = entero(rng, 2, n + 2);
      return armar(rng, { texto: `¿Qué razón es equivalente a ${a}:${b}?`, pista: "Multiplica (o divide) los dos números por lo mismo. Sumar no vale.",
        explica: `${a}·${k} = ${a * k} y ${b}·${k} = ${b * k}: ${a}:${b} = ${a * k}:${b * k}. Sumar el mismo número NO da una razón equivalente.`, datos: { a, b, k } },
        `${a * k}:${b * k}`, [`${a + k}:${b + k}`, `${b * k}:${a * k}`, `${a * k}:${b * k + k}`]);
    },
    // Proporción con un hueco
    propor(n, rng) {
      const a = entero(rng, 1, n > 1 ? 7 : 4), b = entero(rng, 2, n > 1 ? 9 : 5), k = entero(rng, 2, n > 2 ? 6 : 4);
      if (n >= 3 && rng() < 0.5) {
        return armar(rng, { texto: `${a} : ${b} = ${a * k} : ?`, pista: `¿Por cuánto se ha multiplicado ${a} para dar ${a * k}?`,
          explica: `${a} · ${k} = ${a * k}, así que ${b} · ${k} = ${b * k}.`, datos: { a, b, k, hueco: 4 } }, b * k, [b + (a * k - a), a * k + b, b * k + k, k]);
      }
      return armar(rng, { texto: `${a} : ${b} = ? : ${b * k}`, pista: `¿Por cuánto se ha multiplicado ${b} para dar ${b * k}?`,
        explica: `${b} · ${k} = ${b * k}, así que ${a} · ${k} = ${a * k}.`, datos: { a, b, k, hueco: 3 } }, a * k, [a + (b * k - b), b * k - a, a * k + k, k]);
    },
    // Proporcionalidad directa (regla de tres directa)
    directa(n, rng) {
      const u = n >= 3 ? entero(rng, 5, 12) : entero(rng, 2, 5), c = entero(rng, 2, n >= 2 ? 6 : 4);
      let d = n === 1 ? c * entero(rng, 2, 3) : entero(rng, 2, n >= 3 ? 12 : 10);
      if (d === c) d = c + 1;
      const p = u * c, r = u * d;
      const [texto, unidad, que] = elige(rng, [
        [`${c} cuadernos cuestan ${p} €. ¿Cuánto cuestan ${d} cuadernos?`, "€", "cuaderno"],
        [`Un grifo echa ${p} litros en ${c} minutos. ¿Cuántos litros echa en ${d} minutos?`, "L", "minuto"],
        [`Una bici recorre ${p} km en ${c} horas. Al mismo ritmo, ¿cuántos km en ${d} horas?`, "km", "hora"],
        [`Para ${c} personas hacen falta ${p} g de arroz. ¿Y para ${d} personas?`, "g", "persona"]]);
      return armar(rng, { texto, pista: `Calcula primero lo que corresponde a 1 ${que}.`,
        explica: `1 ${que} → ${p} : ${c} = ${u} ${unidad}. Entonces ${d} → ${d} · ${u} = ${r} ${unidad}.`, datos: { c, p, d } }, r, [p + (d - c), p + d, u, p * d], unidad);
    },
    // Proporcionalidad inversa
    inversa(n, rng) {
      let m, r, K, divs, intentos = 0;
      do { r = entero(rng, 2, n >= 2 ? 9 : 6); m = entero(rng, 2, n >= 3 ? 9 : 6); K = r * m;
        divs = []; for (let x = 2; x <= 12; x++) if (K % x === 0 && x !== m && K / x <= 24 && K / x >= 2) divs.push(x);
      } while (!divs.length && ++intentos < 50);
      const a = divs.length ? elige(rng, divs) : 1, t = K / a;
      const [texto, unidad, mas, f] = elige(rng, [
        [`${a} pintores tardan ${t} días en pintar una valla. ¿Cuántos días tardan ${m} pintores?`, "días", "pintores", 1],
        [`${a} grifos iguales llenan un depósito en ${t} horas. ¿Cuánto tardan ${m} grifos?`, "h", "grifos", 1],
        [`Con ${a} vacas hay pienso para ${t} días. ¿Para cuántos días hay con ${m} vacas?`, "días", "vacas", 1],
        [`A ${a * 10} km/h un viaje dura ${t} horas. ¿Cuánto dura a ${m * 10} km/h?`, "h", "velocidad", 10]]);
      const dir = t * m / a;
      return armar(rng, { texto, pista: `Ojo: con más ${mas}, MENOS tiempo. Es proporcionalidad inversa.`,
        explica: `Inversa: el producto no cambia. ${a * f} · ${t} = ${K * f}, y ${K * f} : ${m * f} = ${r} ${unidad}.`, datos: { a: a * f, t, m: m * f } },
        r, [esEntero(dir) ? dir : null, t + Math.abs(m - a), K, t * m, Math.abs(t - Math.abs(m - a))], unidad);
    },
    // ¿Directa, inversa o ninguna?
    tipo(n, rng) {
      const [s, c, porque] = elige(rng, SITUACIONES);
      return { texto: `${s}. ¿Qué proporcionalidad hay?`, pista: "Imagina que una cantidad se hace el doble. ¿Qué le pasa a la otra?",
        explica: `${TIPOS_REL[c]}. ${porque}`, opciones: TIPOS_REL.slice(), correcta: c, datos: { situacion: s } };
    },
    // Tanto por ciento de una cantidad
    pct(n, rng) {
      const p = elige(rng, [[50, 10, 25], [20, 75, 5, 30], [15, 40, 60, 35]][n - 1]);
      const N = 20 * entero(rng, 1, n === 1 ? 10 : 20), r = p * N / 100;
      const como = p === 50 ? "la mitad" : p === 25 ? "la cuarta parte" : p === 10 ? "la décima parte" : p === 20 ? "la quinta parte" : `${p} de cada 100`;
      return armar(rng, { texto: `¿Cuánto es el ${p} % de ${N}?`, pista: `El ${p} % es ${como}.`,
        explica: `${p} % de ${N} = ${N} · ${p} : 100 = ${r}.`, datos: { p, N } }, r, [N - p, N - r, N * p / 10, N / p, p, r * 2]);
    },
    // Descuento: precio final
    descuento(n, rng) {
      const p = elige(rng, [[50, 10, 25], [20, 30, 25, 10], [15, 5, 40, 35]][n - 1]), N = 20 * entero(rng, 1, n === 1 ? 5 : 10), d = p * N / 100;
      return armar(rng, { texto: `${elige(rng, TIENDA)} de ${N} € tiene un ${p} % de descuento. ¿Precio final?`, pista: "Calcula el descuento en euros y RÉSTALO del precio.",
        explica: `Descuento: ${p} % de ${N} = ${d} €. Precio final: ${N} − ${d} = ${N - d} €.`, datos: { p, N } }, N - d, [d, N - p, N + d], "€");
    },
    // Aumento: precio final
    aumento(n, rng) {
      const p = elige(rng, [[50, 10, 25], [20, 30, 25, 10], [15, 5, 40, 35]][n - 1]), N = 20 * entero(rng, 1, n === 1 ? 5 : 10), d = p * N / 100;
      return armar(rng, { texto: `Un abono de ${N} € sube un ${p} %. ¿Cuánto cuesta ahora?`, pista: "Calcula la subida en euros y SÚMALA al precio.",
        explica: `Subida: ${p} % de ${N} = ${d} €. Precio nuevo: ${N} + ${d} = ${N + d} €.`, datos: { p, N } }, N + d, [d, N + p, N - d], "€");
    },
    // ¿Qué porcentaje de descuento es?
    quepct(n, rng) {
      const lista = n === 1 ? [50, 25, 10] : [10, 20, 25, 50, 75], p = elige(rng, lista), N = 20 * entero(rng, 1, 10), d = p * N / 100, M = N - d;
      const otros = barajar(rng, [...new Set(lista.concat([20, 40, 75]))].filter(x => x !== p));
      return armar(rng, { texto: `Costaba ${N} € y ahora cuesta ${M} €. ¿Qué descuento tiene?`, pista: `Primero: ¿cuántos euros han rebajado? Luego compáralo con ${N}.`,
        explica: `Rebaja: ${N} − ${M} = ${d} €. ${d} de ${N} es el ${p} % (${d} · 100 : ${N} = ${p}).`, datos: { N, M } }, `${p} %`,
        [d !== p && d < 100 ? `${d} %` : null, 100 - p !== p ? `${100 - p} %` : null, ...otros.map(x => `${x} %`)]);
    }
  };
  const TIPOS = Object.keys(GEN);
  const NOMBRE_TIPO = { razon: "Razones", equiv: "Razones equivalentes", propor: "Proporciones", directa: "Proporcionalidad directa", inversa: "Proporcionalidad inversa",
    tipo: "¿Directa o inversa?", pct: "Porcentajes", descuento: "Descuentos", aumento: "Aumentos", quepct: "¿Qué porcentaje?" };

  function pregunta(tipo, nivel, rng) {
    const q = GEN[tipo](Math.max(1, Math.min(3, nivel | 0)), rng);
    q.tipo = tipo;
    return q;
  }

  // ---------- Puertas de operación ----------
  // Cada operación: etiqueta, cómo cambia el botín y cómo se explica.
  const hacerOp = {
    mas: n => ({ etq: `+${n}`, f: b => b + n, ex: b => `${b} + ${n} = ${b + n}` }),
    menos: n => ({ etq: `−${n}`, f: b => b - n, ex: b => `${b} − ${n} = ${b - n}` }),
    por: k => ({ etq: `×${k}`, f: b => b * k, ex: b => `${b} · ${k} = ${b * k}` }),
    entre: k => ({ etq: `:${k}`, f: b => b / k, ex: b => `${b} : ${k} = ${b / k}` }),
    sube: p => ({ etq: `+${p} %`, f: b => b + b * p / 100, ex: b => `${b} + ${p} % de ${b} = ${b} + ${b * p / 100} = ${b + b * p / 100}` }),
    baja: p => ({ etq: `−${p} %`, f: b => b - b * p / 100, ex: b => `${b} − ${p} % de ${b} = ${b} − ${b * p / 100} = ${b - b * p / 100}` })
  };
  // La bolsa debe ser múltiplo de 20 (así todos los porcentajes dan enteros).
  function puertasOp(bolsa, nivel, rng) {
    const una = () => {
      const r = rng();
      if (nivel <= 1) return r < 0.45 ? hacerOp.mas(10 * entero(rng, 1, 5)) : r < 0.7 ? hacerOp.por(2) : r < 0.85 ? hacerOp.entre(2) : hacerOp.menos(10);
      if (nivel === 2) return r < 0.5 ? hacerOp.sube(elige(rng, [10, 25, 50])) : r < 0.85 ? hacerOp.mas(10 * entero(rng, 1, 6)) : hacerOp.baja(elige(rng, [10, 50]));
      return r < 0.5 ? hacerOp.sube(elige(rng, [5, 10, 15, 20, 25, 30, 50, 75])) : r < 0.75 ? hacerOp.mas(5 * entero(rng, 1, 14)) : hacerOp.baja(elige(rng, [5, 10, 20, 25]));
    };
    for (let i = 0; i < 200; i++) {
      const ops = [una(), una(), una()], vals = ops.map(o => o.f(bolsa));
      if (new Set(ops.map(o => o.etq)).size < 3 || vals.some(v => !esEntero(v) || v < 0)) continue;
      const max = Math.max(...vals);
      if (vals.filter(v => v === max).length !== 1) continue;
      return { tipo: "op", bolsa, texto: `Tienes ${bolsa} 🪙. ¿Qué puerta te deja MÁS monedas?`, opciones: ops.map(o => o.etq), valores: vals, correcta: vals.indexOf(max),
        pista: nivel >= 2 ? "Calcula cuánto es cada porcentaje de TU botín antes de comparar." : "Calcula el resultado de cada puerta y compara.",
        explica: ops.map(o => o.ex(bolsa)).join("  |  ") };
    }
    throw new Error("No se han podido generar puertas de operación para " + bolsa);
  }
  // Redondea el botín hacia arriba al múltiplo de 20 (mínimo 20): un pequeño regalo antes de las puertas.
  const redondear20 = b => Math.max(20, Math.ceil(b / 20) * 20);

  // ---------- Pista ----------
  // Una fila de obstáculos: c[carril] = "" libre · "B" bloque (hay que cambiar de carril)
  //                                      · "b" valla baja (saltar) · "a" barra alta (agacharse)
  const SEP_MIN = 26;
  function tramo(cfg, rng, z0, largo) {
    const filas = [], monedas = [], poderes = [];
    let z = z0 + 34, libreAnt = 1;
    const clases = cfg.clases || "Bb";
    while (z < z0 + largo - 20) {
      const c = ["", "", ""];
      if (rng() < (cfg.densidad == null ? 0.8 : cfg.densidad)) {
        const nB = clases.includes("B") ? (rng() < 0.45 ? 2 : rng() < 0.75 ? 1 : 0) : 0;
        const orden = barajar(rng, [0, 1, 2]);
        for (let i = 0; i < nB; i++) c[orden[i]] = "B";
        const otras = clases.replace("B", "");
        for (let i = nB; i < 3; i++) if (otras && rng() < (nB === 2 ? 0.35 : 0.5)) c[orden[i]] = elige(rng, otras.split(""));
        if (c.every(x => x === "")) c[orden[0]] = clases[0];
        filas.push({ z, c });
      }
      // Monedas que guían hacia un carril por el que se puede pasar
      const pasables = [0, 1, 2].filter(i => c[i] !== "B"), limpios = pasables.filter(i => c[i] === "");
      const carril = limpios.length ? elige(rng, limpios) : elige(rng, pasables);
      for (let k = 0; k < 4; k++) monedas.push({ z: z - 18 + k * 4, carril });
      if (c[carril] !== "" || limpios.length) for (let k = 1; k <= 2; k++) monedas.push({ z: z + k * 4, carril });
      if (cfg.poderes && rng() < cfg.poderes) poderes.push({ z: z + 12, carril: elige(rng, [0, 1, 2]), clase: rng() < 0.5 ? "iman" : "escudo" });
      libreAnt = carril;
      z += SEP_MIN + Math.floor(rng() * 10);
    }
    return { filas, monedas, poderes, fin: z0 + largo, libre: libreAnt };
  }

  const api = { azar, entero, elige, eligePeso, barajar, mismoValor, pregunta, puertasOp, redondear20, tramo, TIPOS, NOMBRE_TIPO, TIPOS_REL, SITUACIONES, SEP_MIN };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  raiz.RatioMotor = api;
})(typeof window !== "undefined" ? window : globalThis);
