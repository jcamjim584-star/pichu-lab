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
  const INICIAL = () => ({ v: 1, xp: 0, monedas: 0, logros: {}, juegos: {}, avatar: "kubo", ultimo: "",
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
  const MUNDOS = [
    { id: "divisibilidad", juego: "expres", nombre: "Factor Clash", tema: "Divisibilidad", icono: "÷", url: "applets/expres/" },
    { id: "enteros", juego: "integer-ninja", nombre: "Integer Ninja", tema: "Números enteros", icono: "±", url: "applets/integer-ninja/" },
    { id: "fracciones", juego: "fraction-merge", nombre: "Fraction Merge", tema: "Fracciones", icono: "½", url: "applets/fraction-merge/", mq: true, ahora: true },
    { id: "ecuaciones", juego: "equation-merge", nombre: "Equation Merge", tema: "Ecuaciones", icono: "x=", url: "applets/equation-merge/", mq: true },
    { id: "potencias", juego: "", nombre: "Power Quest", tema: "Potencias y raíces", icono: "x²" },
    { id: "proporcionalidad", juego: "", nombre: "Ratio Run", tema: "Proporcionalidad", icono: "%" },
    { id: "algebra", juego: "", nombre: "Algebra Royale", tema: "Expresiones algebraicas", icono: "3x" },
    { id: "funciones", juego: "", nombre: "Graph Dash", tema: "Funciones y gráficas", icono: "ƒ" },
    { id: "estadistica", juego: "", nombre: "Data Ninja", tema: "Estadística", icono: "x̄" },
    { id: "probabilidad", juego: "", nombre: "Probability Arena", tema: "Probabilidad", icono: "🎲" },
    { id: "geometria", juego: "", nombre: "Geometry Builder", tema: "Geometría", icono: "△" }
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

  // ---------- Personajes (se desbloquean al subir de nivel) ----------
  const AVATARES = [
    { id: "kubo", nombre: "Kubo", nivel: 1, c1: "#22d3ee", c2: "#0e7490", extra: "antena" },
    { id: "chispa", nombre: "Chispa", nivel: 2, c1: "#fde047", c2: "#ca8a04", extra: "rayo" },
    { id: "radi", nombre: "Radi", nivel: 3, c1: "#86efac", c2: "#15803d", extra: "hoja" },
    { id: "exa", nombre: "Exa", nivel: 5, c1: "#c4b5fd", c2: "#6d28d9", extra: "estrella" },
    { id: "mixi", nombre: "Mixi", nivel: 7, c1: "#f9a8d4", c2: "#be185d", extra: "orejas" },
    { id: "nova", nombre: "Nova", nivel: 10, c1: "#fdba74", c2: "#c2410c", extra: "corona" }
  ];
  // Dibujo del personaje (SVG propio, sin imágenes externas). gesto: "feliz" | "triste" | ""
  let nDibujo = 0;
  function avatarSVG(id, gesto) {
    const a = AVATARES.find(x => x.id === id) || AVATARES[0], g = "mqg" + (++nDibujo);   // id único: si se repite, el degradado falla
    const extra = {
      antena: `<line x1="50" y1="22" x2="50" y2="8" stroke="${a.c2}" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="7" r="6" fill="#fff"/>`,
      rayo: `<path d="M54 2 40 16h9l-5 10 16-15h-9z" fill="#fff" stroke="${a.c2}" stroke-width="2" stroke-linejoin="round"/>`,
      hoja: `<path d="M50 22C44 8 56 2 66 4 66 14 60 22 50 22z" fill="#16a34a" stroke="${a.c2}" stroke-width="2"/>`,
      estrella: `<path d="m50 1 3.5 8 8.5.8-6.4 5.6 2 8.4L50 19.4 42.4 23.8l2-8.4L38 9.8l8.5-.8z" fill="#fde047" stroke="${a.c2}" stroke-width="1.5" stroke-linejoin="round"/>`,
      orejas: `<path d="M22 28 20 6l18 14zM78 28 80 6 62 20z" fill="${a.c1}" stroke="${a.c2}" stroke-width="3" stroke-linejoin="round"/>`,
      corona: `<path d="M30 22 28 4l11 9 11-11 11 11 11-9-2 18z" fill="#fde047" stroke="${a.c2}" stroke-width="2" stroke-linejoin="round"/>`
    }[a.extra];
    const boca = gesto === "triste" ? `<path d="M40 76q10-8 20 0" fill="none" stroke="#1e1b4b" stroke-width="4" stroke-linecap="round"/>`
      : gesto === "feliz" ? `<path d="M37 68h26q-2 14-13 14T37 68z" fill="#1e1b4b"/><path d="M43 77q7-5 14 0-3 5-7 5t-7-5z" fill="#fb7185"/>`
      : `<path d="M40 70q10 9 20 0" fill="none" stroke="#1e1b4b" stroke-width="4" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 100 100" role="img" aria-label="${a.nombre}" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a.c1}"/><stop offset="1" stop-color="${a.c2}"/></linearGradient></defs>
      ${extra}
      <rect x="14" y="22" width="72" height="70" rx="20" fill="url(#${g})" stroke="#1e1b4b" stroke-width="4"/>
      <rect x="22" y="29" width="34" height="12" rx="6" fill="#fff" opacity=".35"/>
      <circle cx="36" cy="54" r="10" fill="#fff"/><circle cx="64" cy="54" r="10" fill="#fff"/>
      <circle cx="${gesto === "triste" ? 36 : 38}" cy="${gesto === "triste" ? 57 : 55}" r="5" fill="#1e1b4b"/><circle cx="${gesto === "triste" ? 64 : 66}" cy="${gesto === "triste" ? 57 : 55}" r="5" fill="#1e1b4b"/>
      ${boca}</svg>`;
  }

  window.MathQuest = { CLAVE, leer, guardar, nivel, sumar, gastar, logro, resumen, ajuste, sinMovimiento,
    MUNDOS, LOGROS, AVATARES, avatarSVG };
})();
