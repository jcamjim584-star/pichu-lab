/* =========================================================
   MATHQUEST · mathquest.js
   Progreso COMÚN de todos los juegos de MathQuest:
   experiencia (XP), nivel, monedas, logros, personaje y ajustes.
   Se guarda solo en este dispositivo, en la clave pichu.mathquest.v1.
   Lo cargan la portada (el mapa de mundos) y cada juego nuevo.
   No guarda nombres ni ningún dato personal.
   ========================================================= */
(function () {
  "use strict";
  const CLAVE = "pichu.mathquest.v1";
  const INICIAL = () => ({ v: 1, xp: 0, monedas: 0, logros: {}, juegos: {}, avatar: "pichu", ultimo: "",
    ajustes: { sonido: true, musica: true, animaciones: true, tranquilo: false } });

  function leer() {
    try {
      const d = JSON.parse(localStorage.getItem(CLAVE));
      if (d && d.v === 1) { const b = INICIAL(); return Object.assign(b, d, { ajustes: Object.assign(b.ajustes, d.ajustes) }); }
    } catch (e) { /* sin datos o almacenamiento bloqueado */ }
    return INICIAL();
  }
  function guardar(d) { try { localStorage.setItem(CLAVE, JSON.stringify(d)); return true; } catch (e) { return false; } }

  // Nivel del jugador: para pasar del nivel n al n+1 hacen falta 100·n puntos de experiencia.
  function nivel(xp) {
    let n = 1, base = 0;
    while (xp >= base + 100 * n) { base += 100 * n; n++; }
    return { nivel: n, tiene: xp - base, hace_falta: 100 * n, pct: Math.round(100 * (xp - base) / (100 * n)) };
  }

  // Suma experiencia y monedas. Devuelve si se ha subido de nivel.
  function sumar(xp, monedas) {
    const d = leer(), antes = nivel(d.xp).nivel;
    d.xp += Math.max(0, xp | 0); d.monedas += Math.max(0, monedas | 0);
    guardar(d);
    const ahora = nivel(d.xp).nivel;
    return { subio: ahora > antes, nivel: ahora };
  }
  function gastar(monedas) {
    const d = leer();
    if (d.monedas < monedas) return false;
    d.monedas -= monedas; guardar(d); return true;
  }
  // Marca un logro. Devuelve sus datos si es nuevo (para enseñar el aviso) o null si ya lo tenía.
  function logro(id) {
    const d = leer();
    if (d.logros[id]) return null;
    d.logros[id] = new Date().toISOString().slice(0, 10); guardar(d);
    return LOGROS.find(l => l.id === id) || null;
  }
  // Cada juego deja aquí un resumen para el portal: { superados, total, estrellas, maxEstrellas, record }
  function resumen(juego, datos) {
    const d = leer(); d.juegos[juego] = Object.assign(d.juegos[juego] || {}, datos); d.ultimo = juego; guardar(d);
  }
  function ajuste(nombre, valor) {
    const d = leer();
    if (valor === undefined) return d.ajustes[nombre];
    d.ajustes[nombre] = valor; guardar(d); return valor;
  }
  const sinMovimiento = () => !leer().ajustes.animaciones ||
    (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  // ---------- Mundos del mapa de la portada ----------
  // "juego" es el id en MARCA.juegos (compartido/marca.js). Sin juego = todavía no existe.
  // El orden de esta lista es el orden del mapa. "ahora: true" marca el tema que se está dando en clase.
  // "personaje" es la imagen de compartido/img/personajes/<personaje>.webp que se ve en la isla del mapa.
  const MUNDOS = [
    { id: "divisibilidad", personaje: "divison", juego: "expres", nombre: "Factor Clash", tema: "Divisibilidad", icono: "÷", url: "applets/expres/" },
    { id: "enteros", personaje: "menos", juego: "integer-ninja", nombre: "Integer Ninja", tema: "Números enteros", icono: "±", url: "applets/integer-ninja/" },
    { id: "fracciones", personaje: "pirata", juego: "fraction-merge", nombre: "Fraction Merge", tema: "Fracciones", icono: "½", url: "applets/fraction-merge/", mq: true, ahora: true },
    { id: "ecuaciones", personaje: "incognito", juego: "equation-merge", nombre: "Equation Merge", tema: "Ecuaciones", icono: "x=", url: "applets/equation-merge/", mq: true },
    { id: "potencias", personaje: "mago", juego: "", nombre: "Power Quest", tema: "Potencias y raíces", icono: "x²" },
    { id: "proporcionalidad", personaje: "salsita", juego: "", nombre: "Ratio Run", tema: "Proporcionalidad", icono: "%" },
    { id: "algebra", personaje: "arlequina", juego: "", nombre: "Algebra Royale", tema: "Expresiones algebraicas", icono: "3x" },
    { id: "funciones", personaje: "pizarra", juego: "", nombre: "Graph Dash", tema: "Funciones y gráficas", icono: "ƒ" },
    { id: "estadistica", personaje: "punteo", juego: "", nombre: "Data Ninja", tema: "Estadística", icono: "x̄" },
    { id: "probabilidad", personaje: "duende", juego: "", nombre: "Probability Arena", tema: "Probabilidad", icono: "🎲" },
    { id: "geometria", personaje: "reglino", juego: "", nombre: "Geometry Builder", tema: "Geometría", icono: "△" }
  ];

  // ---------- Logros y medallas ----------
  const LOGROS = [
    { id: "fm.primera", juego: "fraction-merge", icono: "✨", titulo: "Primera suma", desc: "Junta dos fichas por primera vez." },
    { id: "fm.unidad", juego: "fraction-merge", icono: "🍕", titulo: "¡Unidad completa!", desc: "Junta fichas que sumen exactamente 1." },
    { id: "fm.equiv", juego: "fraction-merge", icono: "🪞", titulo: "Lo mismo con otro disfraz", desc: "Entrega un pedido usando fracciones equivalentes." },
    { id: "fm.combo3", juego: "fraction-merge", icono: "⚡", titulo: "Reacción en cadena", desc: "Consigue 3 sumas en un solo movimiento." },
    { id: "fm.limpio", juego: "fraction-merge", icono: "🎯", titulo: "Pulso de cirujano", desc: "Supera un nivel sin ningún error." },
    { id: "fm.unidades25", juego: "fraction-merge", icono: "🧩", titulo: "Completista", desc: "Completa 25 unidades." },
    { id: "fm.entregas100", juego: "fraction-merge", icono: "📦", titulo: "Repartidor de fracciones", desc: "Entrega 100 pedidos." },
    { id: "fm.esc1", juego: "fraction-merge", icono: "🥉", titulo: "Medalla de bronce", desc: "Completa el escalón Principiante." },
    { id: "fm.esc2", juego: "fraction-merge", icono: "🥈", titulo: "Medalla de plata", desc: "Completa el escalón Intermedio." },
    { id: "fm.esc3", juego: "fraction-merge", icono: "🥇", titulo: "Medalla de oro", desc: "Completa el escalón Avanzado." },
    { id: "fm.esc4", juego: "fraction-merge", icono: "🏅", titulo: "Medalla de platino", desc: "Completa el escalón Experto." },
    { id: "fm.jefe", juego: "fraction-merge", icono: "👑", titulo: "Domador de Quebrón", desc: "Derrota al jefe final." },
    { id: "fm.estrellas", juego: "fraction-merge", icono: "🌠", titulo: "Constelación completa", desc: "Consigue las 39 estrellas." },
    { id: "fm.inf20", juego: "fraction-merge", icono: "♾️", titulo: "Sin fin", desc: "Entrega 20 pedidos en una partida infinita." },
    { id: "eq.primera", juego: "equation-merge", icono: "✨", titulo: "Primera suma", desc: "Haz tu primera fusión." },
    { id: "eq.combo3", juego: "equation-merge", icono: "⚡", titulo: "Reacción en cadena", desc: "Consigue 3 fusiones en un solo movimiento." },
    { id: "eq.limpio", juego: "equation-merge", icono: "🎯", titulo: "Pulso de cirujano", desc: "Supera un nivel sin ningún error." },
    { id: "eq.pasos10", juego: "equation-merge", icono: "🪜", titulo: "Paso a paso", desc: "Resuelve 10 ecuaciones de dos pasos o más." },
    { id: "eq.entregas100", juego: "equation-merge", icono: "📦", titulo: "Cien incógnitas", desc: "Resuelve 100 ecuaciones." },
    { id: "eq.veinte", juego: "equation-merge", icono: "💎", titulo: "Tope de la balanza", desc: "Forma una ficha de 20." },
    { id: "eq.racha", juego: "equation-merge", icono: "🔥", titulo: "Imparable", desc: "Llega a una racha ×3." },
    { id: "eq.esc1", juego: "equation-merge", icono: "🥉", titulo: "Medalla de bronce", desc: "Completa el escalón Principiante." },
    { id: "eq.esc2", juego: "equation-merge", icono: "🥈", titulo: "Medalla de plata", desc: "Completa el escalón Intermedio." },
    { id: "eq.esc3", juego: "equation-merge", icono: "🥇", titulo: "Medalla de oro", desc: "Completa el escalón Avanzado." },
    { id: "eq.esc4", juego: "equation-merge", icono: "🏅", titulo: "Medalla de platino", desc: "Completa el escalón Experto." },
    { id: "eq.jefe", juego: "equation-merge", icono: "👑", titulo: "Sin máscara", desc: "Desenmascara a Incógnito, el jefe final." },
    { id: "eq.estrellas", juego: "equation-merge", icono: "🌠", titulo: "Constelación completa", desc: "Consigue las 39 estrellas." },
    { id: "eq.inf20", juego: "equation-merge", icono: "♾️", titulo: "Balanza sin fin", desc: "Resuelve 20 ecuaciones en una partida infinita." }
  ];

  // ---------- Personaje del jugador ----------
  // Todos los juegos usan la mascota πCHU (la misma identidad que la portada).
  // avatarSVG se mantiene por compatibilidad: devuelve la imagen de πCHU. gesto: "feliz" | "triste" | ""
  const BASE = (document.currentScript && document.currentScript.src || location.href).replace(/mathquest\.js.*$/, "");
  const AVATARES = [{ id: "pichu", nombre: "πCHU", nivel: 1 }];
  function avatarSVG(id, gesto) {
    return `<img src="${BASE}img/mascota.png" alt="πCHU" width="600" height="620" style="width:100%;height:auto${gesto === "triste" ? ";filter:grayscale(.7);transform:rotate(-6deg)" : ""}">`;
  }
  const personaje = id => `${BASE}img/personajes/${id}.webp`;

  window.MathQuest = { CLAVE, leer, guardar, nivel, sumar, gastar, logro, resumen, ajuste, sinMovimiento,
    MUNDOS, LOGROS, AVATARES, avatarSVG, personaje };
})();
