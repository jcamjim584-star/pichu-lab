/* =====================================================================
   Pizzería πCHU · motor matemático
   Todo se calcula con ENTEROS: una pizza = 24 "veinticuatroavos"
   (24 se puede dividir entre 2, 3, 4, 6, 8 y 12). Así no hay decimales
   ni errores de redondeo.
   Este archivo no toca la pantalla: se puede probar en Node.
   ===================================================================== */
(function (raiz) {
  "use strict";

  const U = 24;                                   // una pizza entera
  const CORTES = [2, 3, 4, 6, 8, 12];             // formas de cortar una pizza
  const NOMBRE_CORTE = { 2: "mitades", 3: "tercios", 4: "cuartos", 6: "sextos", 8: "octavos", 12: "doceavos" };

  // ---------- Fracciones ----------
  const mcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const mcm = (a, b) => a / mcd(a, b) * b;
  const simplificar = (n, d) => { const g = mcd(n, d); return { n: n / g, d: d / g }; };
  const aU = (n, d) => n * U / d;                 // fracción → veinticuatroavos (debe ser entero)
  const deU = t => simplificar(t, U);             // veinticuatroavos → fracción simplificada
  const esEntero24 = (n, d) => (n * U) % d === 0;

  // Texto de una fracción (para mensajes): "3/4", "2", "1 y 1/2"
  function texto(f, mixto = false) {
    const s = simplificar(f.n, f.d);
    if (s.d === 1) return String(s.n);
    if (mixto && s.n > s.d) { const e = Math.floor(s.n / s.d), r = s.n % s.d; return `${e} y ${r}/${s.d}`; }
    return `${s.n}/${s.d}`;
  }

  // ---------- Qué se puede servir con las porciones del mostrador ----------
  // porciones: lista de tamaños en veinticuatroavos (una entrada por porción).
  // Devuelve, para cada total t, el conjunto de números de porciones posibles.
  function cantidadesPosibles(porciones, max) {
    const dp = Array.from({ length: max + 1 }, () => new Set());
    dp[0].add(0);
    for (const p of porciones) {
      for (let t = max; t >= p; t--) {
        for (const k of dp[t - p]) dp[t].add(k + 1);
      }
    }
    return dp;
  }
  const sePuede = (porciones, t) => t > 0 && cantidadesPosibles(porciones, t)[t].size > 0;
  function minPorciones(porciones, t) {
    const s = cantidadesPosibles(porciones, t)[t];
    return s.size ? Math.min(...s) : Infinity;
  }

  // ---------- Generador de pedidos ----------
  const azar = (a) => a[Math.floor(Math.random() * a.length)];
  const entre = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  // Fracciones "de pizza" que se pueden pedir: denominador entre los cortes permitidos
  function fraccionesPedibles(dens, maxU) {
    const lista = [], vistos = new Set();
    for (const d of dens) for (let n = 1; aU(n, d) <= maxU; n++) {
      const s = simplificar(n, d), k = s.n + "/" + s.d;
      if (!vistos.has(k)) { vistos.add(k); lista.push(s); }
    }
    return lista;
  }

  // Escritura del pedido: a veces sin simplificar (6/8) o en forma mixta (1 y 1/2)
  function escribir(f, cfg) {
    let { n, d } = f;
    if (cfg.sinSimplificar && Math.random() < 0.35) {
      const ks = [2, 3, 4].filter(k => cfg.dens.includes(d * k));
      if (ks.length && n < d * 2) { const k = azar(ks); n *= k; d *= k; }
    }
    const mixto = cfg.mixtos && n > d && n % d !== 0 && Math.random() < 0.5;
    return mixto ? texto({ n, d }, true) : (d === 1 ? String(n) : `${n}/${d}`);
  }

  const PARTES = { 2: "la mitad", 3: "la tercera parte", 4: "la cuarta parte" };
  // "3/4 de pizza", "una pizza entera", "2 pizzas"
  const cant = f => { const s = simplificar(f.n, f.d); return s.d === 1 ? (s.n === 1 ? "una pizza entera" : `${s.n} pizzas`) : `${texto(s)} de pizza`; };

  /* Crea un pedido que SE PUEDE servir con las porciones del mostrador.
     cfg: { tipos, dens, maxU, sinSimplificar, mixtos, minU }
     Devuelve null si no hay ninguno posible (entonces hay que hornear más pizza). */
  function generarPedido(porciones, cfg) {
    const disponible = porciones.reduce((a, b) => a + b, 0);
    const maxU = Math.min(cfg.maxU, disponible);
    const dp = cantidadesPosibles(porciones, maxU);
    // El resultado tiene que poder escribirse con los cortes del turno (nada de 5/24 en 1.º ESO)
    const denOk = t => { const d = deU(t).d; return d === 1 || cfg.dens.includes(d); };
    const ok = t => t >= (cfg.minU || 1) && t <= maxU && dp[t].size > 0 && denOk(t);
    const pedibles = fraccionesPedibles(cfg.dens, maxU);

    for (let intento = 0; intento < 60; intento++) {
      const tipo = azar(cfg.tipos);
      let p = null;

      if (tipo === "suma") {
        // Preferimos pedidos que obligan a juntar varias porciones
        const cand = pedibles.filter(f => ok(aU(f.n, f.d)) && (cfg.mixtos ? true : f.n < f.d * 1.01));
        if (!cand.length) continue;
        const buenos = cand.filter(f => Math.min(...dp[aU(f.n, f.d)]) >= 2);
        const f = azar(buenos.length && Math.random() < 0.8 ? buenos : cand);
        p = { tipo, objetivo: aU(f.n, f.d), escrito: escribir(f, cfg), op: null };
        p.texto = /^\d+$/.test(p.escrito)
          ? `Quiero ${p.escrito === "1" ? "una pizza entera" : p.escrito + " pizzas enteras"}, por favor.`
          : `Quiero ${p.escrito} de pizza, por favor.`;
      }

      else if (tipo === "mult_entero") {
        const k = entre(2, 4), base = azar(pedibles.filter(f => f.n < f.d));
        if (!base) continue;
        const t = k * aU(base.n, base.d);
        if (!ok(t)) continue;
        p = { tipo, objetivo: t, k, base, escrito: texto(base),
              texto: `Somos ${k} y queremos ${texto(base)} de pizza cada uno.`,
              op: `${k} × ${texto(base)} = ${texto({ n: k * base.n, d: base.d })}` };
      }

      else if (tipo === "fraccion_de") {
        // "la mitad de 3/4" o "2/3 de 3/4"
        const base = azar(pedibles.filter(f => f.n <= f.d * 2));
        if (!base) continue;
        const usarPartes = Math.random() < 0.6;
        const fr = usarPartes ? { n: 1, d: azar([2, 3, 4]) } : azar([{ n: 2, d: 3 }, { n: 3, d: 4 }, { n: 1, d: 2 }, { n: 1, d: 3 }]);
        const prodN = base.n * fr.n, prodD = base.d * fr.d;
        if (!esEntero24(prodN, prodD)) continue;
        const t = aU(prodN, prodD);
        if (!ok(t)) continue;
        const nombre = fr.n === 1 && PARTES[fr.d] ? PARTES[fr.d] : texto(fr);
        p = { tipo, objetivo: t, base, fr, escrito: texto(base),
              texto: `Quiero ${nombre} de ${cant(base)}.`,
              op: `${texto(fr)} × ${texto(base)} = ${prodN}/${prodD}` + (simplificar(prodN, prodD).d !== prodD ? ` = ${texto({ n: prodN, d: prodD })}` : "") };
      }

      else if (tipo === "div_entero") {
        const k = entre(2, 4), base = azar(pedibles.filter(f => f.n <= f.d * 2));
        if (!base || !esEntero24(base.n, base.d * k)) continue;
        const t = aU(base.n, base.d * k);
        if (!ok(t)) continue;
        p = { tipo, objetivo: t, k, base, escrito: texto(base),
              texto: `Hemos pedido ${cant(base)} para ${k} personas. Sírveme mi parte.`,
              op: `${texto(base)} ÷ ${k} = ${base.n}/${base.d * k}` + (simplificar(base.n, base.d * k).d !== base.d * k ? ` = ${texto({ n: base.n, d: base.d * k })}` : "") };
      }

      else if (tipo === "div_cuantas") {
        // ¿Cuántas porciones de 1/d (o k/d) caben en a/b? (respuesta: un número entero)
        const base = azar(pedibles.filter(f => f.n <= f.d * 2));
        const trozo = azar(fraccionesPedibles(cfg.dens, U).filter(f => f.n < f.d && f.n <= 3));
        if (!base || !trozo) continue;
        const tb = aU(base.n, base.d), tt = aU(trozo.n, trozo.d);
        if (tb % tt || tb / tt < 2 || tb / tt > 12) continue;
        if (simplificar(base.n, base.d).d === trozo.d) continue;   // sería solo contar porciones iguales
        const r = tb / tt;
        p = { tipo, objetivo: tb, respuesta: r, base, trozo, escrito: texto(base),
              texto: `Tengo ${cant(base)}. ¿Cuántas porciones de ${texto(trozo)} salen?`,
              op: `${texto(base)} ÷ ${texto(trozo)} = ${texto(base)} × ${trozo.d}/${trozo.n} = ${r}`,
              opciones: opcionesNumero(r, base, trozo) };
      }

      else if (tipo === "condicion") {
        // El Crítico: pedido con condición
        const cand = pedibles.filter(f => ok(aU(f.n, f.d)));
        if (!cand.length) continue;
        const f = azar(cand), t = aU(f.n, f.d);
        const modo = azar(["exactas", "sin", "minimo"]);
        if (modo === "exactas") {
          const ks = [...dp[t]].filter(k => k >= 2 && k !== Math.min(...dp[t]));
          if (!ks.length) continue;
          const k = azar(ks);
          p = { tipo, objetivo: t, escrito: texto(f), cond: { modo, k },
                texto: `Quiero ${texto(f)} de pizza… ¡con exactamente ${k} porciones!` };
        } else if (modo === "sin") {
          const usados = [...new Set(porciones)].filter(x => x > 0);
          const q = azar(usados), sinQ = porciones.filter(x => x !== q);
          if (!sePuede(sinQ, t) || sinQ.length === porciones.length) continue;
          const dq = U / q;
          p = { tipo, objetivo: t, escrito: texto(f), cond: { modo, tam: q },
                texto: `Quiero ${texto(f)} de pizza, pero ¡sin ninguna porción de 1/${dq}!` };
        } else {
          const m = Math.min(...dp[t]);
          if (m < 2) continue;                 // que no se pueda con una sola porción
          p = { tipo, objetivo: t, escrito: texto(f), cond: { modo, k: m },
                texto: `Quiero ${texto(f)} de pizza con el MENOR número de porciones posible.` };
        }
      }

      if (p) { p.minimo = p.tipo === "div_cuantas" ? null : minPorciones(porciones, p.objetivo); return p; }
    }
    return null;
  }

  function opcionesNumero(r, base, trozo) {
    const s = new Set([r]);
    // Distractores: errores típicos (multiplicar en vez de dividir, o solo dividir numeradores) y vecinos
    const prod = base.n * trozo.n / (base.d * trozo.d);
    if (Number.isInteger(prod) && prod > 0) s.add(prod);
    if (Number.isInteger(base.n / trozo.n) && base.n / trozo.n > 0) s.add(base.n / trozo.n);
    for (const v of [r - 1, r + 1, r + 2, r - 2, r * 2]) { if (s.size >= 4) break; if (v > 0) s.add(v); }
    return [...s].slice(0, 4).sort((a, b) => a - b);
  }

  // ---------- Evaluar lo servido ----------
  /* servidas: lista de porciones servidas [{d}] (cada una vale 1/d). */
  function evaluar(pedido, servidas) {
    const total = servidas.reduce((a, s) => a + U / s.d, 0);
    const res = { total, objetivo: pedido.objetivo, ok: total === pedido.objetivo, perfecto: false, pista: "" };
    res.diferencia = total - pedido.objetivo;
    if (pedido.cond) {
      if (pedido.cond.modo === "exactas" && servidas.length !== pedido.cond.k) res.ok = false, res.pista = `El Crítico quería exactamente ${pedido.cond.k} porciones y has servido ${servidas.length}.`;
      if (pedido.cond.modo === "sin" && servidas.some(s => U / s.d === pedido.cond.tam)) res.ok = false, res.pista = `¡Has usado porciones de 1/${U / pedido.cond.tam}, y estaban prohibidas!`;
      if (pedido.cond.modo === "minimo" && res.ok && servidas.length > pedido.cond.k) res.ok = false, res.pista = `La cantidad es correcta, pero se podía con solo ${pedido.cond.k} porciones.`;
    }
    res.perfecto = res.ok && pedido.minimo != null && servidas.length === pedido.minimo;
    if (!res.ok && !res.pista) res.pista = detectarError(pedido, servidas, total);
    res.pasos = pasos(servidas, pedido);
    return res;
  }

  // Errores típicos que se pueden reconocer en lo servido
  function detectarError(p, servidas, total) {
    const dens = [...new Set(servidas.map(s => s.d))];
    // "Denominador mayor = trozo mayor": pidió 3/4 y sirvió 3 porciones de 1/8
    if (p.tipo === "suma" || p.tipo === "condicion") {
      const m = String(p.escrito).match(/^(\d+)\/(\d+)$/);
      if (m && dens.length === 1 && servidas.length === +m[1] && dens[0] !== +m[2]) {
        const d = dens[0], b = +m[2];
        return `Has servido ${m[1]} porciones de 1/${d}, pero el pedido era de ${m[1]} porciones de 1/${b}. ` +
          (d > b ? `Las porciones de 1/${d} son más PEQUEÑAS: cuanto mayor es el denominador, más trozos y más pequeños.`
                 : `Las porciones de 1/${d} son más GRANDES: cuanto menor es el denominador, menos trozos y más grandes.`);
      }
    }
    const tb = p.base ? aU(p.base.n, p.base.d) : null;
    if (p.tipo === "mult_entero" && total === tb) return `Has servido la parte de una sola persona. Son ${p.k}: hay que multiplicar ${p.k} × ${texto(p.base)}.`;
    if ((p.tipo === "fraccion_de" || p.tipo === "div_entero") && total === tb) return `Has servido los ${texto(p.base)} enteros. Hay que quedarse solo con ${p.tipo === "div_entero" ? "una de las " + p.k + " partes" : "la parte que pide"}.`;
    if (p.tipo === "div_entero" && total === tb * p.k) return `Has multiplicado por ${p.k} en vez de dividir: al repartir entre ${p.k}, a cada uno le toca MENOS.`;
    return "";
  }

  // Pasos de la suma de lo servido con denominador común, sin decimales
  function pasos(servidas, pedido) {
    if (!servidas.length) return "No has servido nada.";
    const L = servidas.reduce((a, s) => mcm(a, s.d), 1);
    const tot = servidas.reduce((a, s) => a + L / s.d, 0);
    const partes = servidas.map(s => `1/${s.d}`).join(" + ");
    const comun = servidas.every(s => s.d === L) ? "" : " = " + servidas.map(s => `${L / s.d}/${L}`).join(" + ");
    const simp = simplificar(tot, L);
    const fin = (simp.n !== tot || simp.d !== L) ? ` = ${texto(simp)}` : "";
    return `${partes}${comun} = ${tot}/${L}${fin}`;
  }

  function comparar(total, objetivo) { return total < objetivo ? "corto" : total > objetivo ? "pasado" : "exacto"; }

  // ---------- Pizza Rush: tickets, horno, turnos y mejoras ----------
  // Los tickets se generan como si hubiera pizzas de todos los cortes del turno:
  // así siempre se pueden servir con lo que va sacando el horno.
  function stockVirtual(dens) { const p = []; for (const d of dens) for (let k = 0; k < d * 2; k++) p.push(U / d); return p; }
  function generarTicket(cfg) {
    for (let i = 0; i < 20; i++) { const t = generarPedido(stockVirtual(cfg.dens), cfg); if (t) return t; }
    return null;
  }
  // ¿Qué pizza hornear? Preferimos cortes que sirvan para los tickets abiertos.
  // Forma de servir con el menor número de porciones (cortes de "dens", sin el prohibido)
  function descomposicionMinima(objetivo, dens, prohibido) {
    const tam = dens.map(d => U / d).filter(x => x !== prohibido);
    const mejor = Array(objetivo + 1).fill(null); mejor[0] = [];
    for (let t = 1; t <= objetivo; t++) for (const x of tam) if (x <= t && mejor[t - x] && (!mejor[t] || mejor[t - x].length + 1 < mejor[t].length)) mejor[t] = [...mejor[t - x], x];
    return mejor[objetivo] ? mejor[objetivo].map(x => U / x) : null;
  }
  function cortesUtiles(ticket, dens) {
    if (!ticket || ticket.tipo === "div_cuantas") return [];
    const prohib = ticket.cond && ticket.cond.modo === "sin" ? ticket.cond.tam : null;
    const permitido = d => U / d !== prohib;
    const exactos = dens.filter(d => permitido(d) && ticket.objetivo % (U / d) === 0);
    const minima = descomposicionMinima(ticket.objetivo, dens, prohib) || [];
    // Los cortes de la solución más corta (p. ej. 1 y 7/8 = 1/2 + 1/2 + 1/2 + 1/4 + 1/8) y los que sirven solos
    const u = [...new Set([...minima, ...exactos])];
    return u.length ? dens.filter(d => u.includes(d)) : dens.filter(d => permitido(d) && U / d <= ticket.objetivo);
  }
  function elegirHorneado(tickets, dens) {
    const peso = d => 1 + 3 * tickets.filter(t => cortesUtiles(t, dens).includes(d)).length;
    const total = dens.reduce((a, d) => a + peso(d), 0);
    let r = Math.random() * total;
    for (const d of dens) { r -= peso(d); if (r <= 0) return d; }
    return dens[dens.length - 1];
  }
  // ¿Se puede servir este ticket con las porciones del mostrador (más las que ya estén en su caja)?
  const servibleCon = (ticket, porciones) => ticket.tipo === "div_cuantas" || sePuede(porciones, ticket.objetivo);

  // Monedas de un ticket bien servido
  const BASE_TIPO = { suma: 10, mult_entero: 15, fraccion_de: 15, div_entero: 15, div_cuantas: 12, condicion: 20 };
  function monedas({ tipo, combo, perfecto, rapido, propinaOro }) {
    const mult = combo >= 10 ? 4 : combo >= 6 ? 3 : combo >= 3 ? 2 : 1;
    return BASE_TIPO[tipo] * mult + (perfecto ? (propinaOro ? 10 : 5) : 0) + (rapido ? 5 : 0);
  }
  const multiplicador = combo => combo >= 10 ? 4 : combo >= 6 ? 3 : combo >= 3 ? 2 : 1;

  const TURNOS = [
    { id: 1, nombre: "Gran apertura", tema: "Mitades y cuartos", dens: [2, 4], tickets: 6, simult: 2, tipos: ["suma"], maxU: 24, vista: "plato", paciencia: 70 },
    { id: 2, nombre: "Hora punta", tema: "Tercios y sextos", dens: [2, 3, 4, 6], tickets: 8, simult: 3, tipos: ["suma"], maxU: 24, vista: "plato", paciencia: 65 },
    { id: 3, nombre: "Cortes finos", tema: "Octavos, doceavos y equivalencias", dens: [2, 3, 4, 6, 8, 12], tickets: 8, simult: 3, tipos: ["suma"], maxU: 24, vista: "caja", sinSimplificar: true, paciencia: 65 },
    { id: 4, nombre: "Mesas grandes", tema: "Más de una pizza", dens: [2, 3, 4, 6, 8], tickets: 8, simult: 3, tipos: ["suma"], maxU: 48, minU: 18, vista: "caja", mixtos: true, paciencia: 75 },
    { id: 5, nombre: "Pedidos en grupo", tema: "Multiplicar fracciones", dens: [2, 3, 4, 6, 8, 12], tickets: 8, simult: 3, tipos: ["mult_entero", "fraccion_de"], maxU: 48, vista: "caja", mixtos: true, paciencia: 80 },
    { id: 6, nombre: "A repartir", tema: "Dividir fracciones", dens: [2, 3, 4, 6, 8, 12], tickets: 8, simult: 3, tipos: ["div_entero", "div_cuantas", "div_cuantas"], maxU: 36, vista: "caja", paciencia: 80 },
    { id: 7, nombre: "Noche de fiesta", tema: "Todo mezclado", dens: [2, 3, 4, 6, 8, 12], tickets: 10, simult: 3, tipos: ["suma", "suma", "mult_entero", "fraccion_de", "div_entero", "div_cuantas"], maxU: 48, vista: "caja", mixtos: true, sinSimplificar: true, paciencia: 70 },
    { id: 8, nombre: "Inspección del Crítico", tema: "Jefe: pedidos con condiciones", dens: [2, 3, 4, 6, 8, 12], tickets: 8, simult: 3, tipos: ["condicion", "condicion", "fraccion_de", "div_entero"], maxU: 36, vista: "caja", jefe: true, paciencia: 75 }
  ];
  const JORNADAS = TURNOS;   // compatibilidad con la v0.1

  // Mejoras de la tienda. nivel: lo que tiene el jugador; precio por nivel.
  const MEJORAS = [
    { id: "horno", nombre: "Horno turbo", icono: "🔥", desc: "El horno saca pizzas más rápido.", precios: [120, 260, 450], tipo: "juego" },
    { id: "mostrador", nombre: "Mostrador XL", icono: "🍽️", desc: "Caben más pizzas en el mostrador.", precios: [150, 350], tipo: "juego" },
    { id: "campana", nombre: "Campanita de paciencia", icono: "🔔", desc: "Los clientes esperan un 25 % más por nivel.", precios: [100, 240], tipo: "juego" },
    { id: "cortador", nombre: "Cortador mágico", icono: "🔪", desc: "Vuelve a cortar una pizza entera en el corte que elijas (¡equivalencias!).", precios: [300], tipo: "juego" },
    { id: "oro", nombre: "Propina de oro", icono: "🪙", desc: "El servicio perfecto da el doble de propina.", precios: [220], tipo: "juego" },
    { id: "luces", nombre: "Luces de verbena", icono: "💡", desc: "Decoración: guirnalda de luces en la cocina.", precios: [80], tipo: "deco" },
    { id: "mantel", nombre: "Mantel de cuadros", icono: "🟥", desc: "Decoración: mostrador con mantel de cuadros.", precios: [80], tipo: "deco" },
    { id: "neon", nombre: "Letrero de neón", icono: "✨", desc: "Decoración: letrero πCHU de neón.", precios: [150], tipo: "deco" },
    { id: "plantas", nombre: "Plantas de albahaca", icono: "🌿", desc: "Decoración: macetas de albahaca.", precios: [60], tipo: "deco" }
  ];
  const intervaloHorno = nivel => [7, 5.5, 4.5, 3.5][nivel || 0];
  const huecosMostrador = nivel => 4 + (nivel || 0);
  const factorPaciencia = nivel => 1 + 0.25 * (nivel || 0);
  const RANGOS = [[0, "Puesto callejero"], [6, "Pizzería de barrio"], [12, "Trattoria famosa"], [18, "Restaurante con estrella"], [24, "Imperio πCHU"]];
  const rango = estrellasTotales => RANGOS.filter(r => estrellasTotales >= r[0]).pop()[1];

  // Estrellas de una jornada: servir al menos el 60 % para superarla
  function estrellas(servidos, perfectos, total) {
    if (servidos < Math.ceil(total * 0.6)) return 0;
    if (servidos === total && perfectos >= Math.ceil(total / 2)) return 3;
    if (servidos >= Math.ceil(total * 0.8)) return 2;
    return 1;
  }

  const motor = { U, CORTES, NOMBRE_CORTE, mcd, mcm, simplificar, aU, deU, texto, cantidadesPosibles, sePuede, minPorciones,
    generarPedido, evaluar, detectarError, pasos, comparar, JORNADAS, TURNOS, estrellas, fraccionesPedibles, opcionesNumero,
    generarTicket, stockVirtual, cortesUtiles, descomposicionMinima, elegirHorneado, servibleCon, monedas, multiplicador, MEJORAS, intervaloHorno, huecosMostrador, factorPaciencia, rango, RANGOS };
  if (typeof module !== "undefined" && module.exports) module.exports = motor; else raiz.Motor = motor;
})(typeof window !== "undefined" ? window : globalThis);
