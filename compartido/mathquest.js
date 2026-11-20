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

  // ---------- Reinos de Gaussoria (mapa de la portada de GALOIS LEGACY) ----------
  // Cada tema de 1.º ESO es un reino. "reino" y "escenario" son el nombre y la descripción en el mundo del juego;
  // "nombre" es el juego que se abre al entrar. Los personajes actuales hacen de enemigos y jefes por ahora.
  // "juego" es el id en MARCA.juegos (compartido/marca.js). Sin juego = todavía no existe.
  // El orden de esta lista es el orden del mapa. "ahora: true" marca el tema que se está dando en clase.
  // "personaje" es la imagen de compartido/img/personajes/<personaje>.webp que se ve en la isla del mapa.
  // "enemigo" es el enemigo del reino en el mapa y en la lista (compartido/img/galois/enemigos/<enemigo>.png,
  //   sacado de las hojas del Drive con src/galois/generar_graficos.py). Sin enemigo, el reino no muestra ninguno.
  // "puerta" es [columna, fila] de la puerta del reino en el mapa explorable (compartido/gaussoria.js, MAPA).
  //   El edificio ocupa la fila de encima y las casillas de los lados; se entra desde la casilla de abajo.
  const MUNDOS = [
    { id: "divisibilidad", enemigo: "primox", puerta: [10, 27], reino: "Minas de los Primos", escenario: "Cuevas de gemas donde cada número esconde sus factores.", personaje: "divison", juego: "expres", nombre: "Factor Clash", tema: "Divisibilidad", icono: "÷", url: "applets/expres/" },
    { id: "enteros", enemigo: "negatron", puerta: [5, 20], reino: "Reino de Hielo y Fuego", escenario: "Glaciares bajo cero y volcanes positivos.", personaje: "menos", juego: "integer-ninja", nombre: "Integer Ninja", tema: "Números enteros", icono: "±", url: "applets/integer-ninja/" },
    { id: "fracciones", enemigo: "denominadoron", puerta: [11, 12], reino: "Bosque de las Fracciones", escenario: "Laberintos, puentes y árboles partidos en partes iguales.", personaje: "pirata", juego: "fraction-merge", nombre: "Fraction Merge", tema: "Fracciones", icono: "½", url: "applets/fraction-merge/", mq: true, ahora: true },
    { id: "ecuaciones", enemigo: "incognita_x", puerta: [16, 9], reino: "Fortaleza del Álgebra", escenario: "Un castillo de incógnitas que solo se abre con ecuaciones.", personaje: "incognito", juego: "equation-merge", nombre: "Equation Merge", tema: "Ecuaciones", icono: "x=", url: "applets/equation-merge/", mq: true },
    { id: "potencias", enemigo: "potenciator", puerta: [24, 9], reino: "Cumbres de las Potencias", escenario: "Montañas que crecen al multiplicarse por sí mismas.", personaje: "mago", juego: "", nombre: "Power Quest", tema: "Potencias y raíces", icono: "x²" },
    { id: "proporcionalidad", enemigo: "porcentajin", puerta: [32, 9], reino: "Valle de las Proporciones", escenario: "Molinos, recetas y mapas a escala.", personaje: "salsita", juego: "", nombre: "Ratio Run", tema: "Proporcionalidad", icono: "%" },
    { id: "algebra", enemigo: "polinomio_mutante", puerta: [39, 14], reino: "Torre de las Letras", escenario: "Donde los números se disfrazan de letras.", personaje: "arlequina", juego: "", nombre: "Algebra Royale", tema: "Expresiones algebraicas", icono: "3x" },
    { id: "funciones", enemigo: "pendientor", puerta: [30, 20], reino: "Llanuras de las Gráficas", escenario: "Caminos que suben, bajan y se cruzan en los ejes.", personaje: "pizarra", juego: "", nombre: "Graph Dash", tema: "Funciones y gráficas", icono: "ƒ" },
    { id: "estadistica", enemigo: "mediana_traviesa", puerta: [36, 27], reino: "Archipiélago de los Datos", escenario: "Islas de tablas, gráficos y medias.", personaje: "punteo", juego: "", nombre: "Data Ninja", tema: "Estadística", icono: "x̄" },
    { id: "probabilidad", enemigo: "dado_caotico", puerta: [24, 15], reino: "Laberinto del Azar", escenario: "Dados, monedas y puertas que se abren por suerte… o no.", personaje: "duende", juego: "", nombre: "Probability Arena", tema: "Probabilidad", icono: "🎲" },
    { id: "geometria", puerta: [17, 15], reino: "Templo de la Geometría", escenario: "Ruinas de figuras, ángulos y acertijos espaciales.", personaje: "reglino", juego: "", nombre: "Geometry Builder", tema: "Geometría", icono: "△" }
  ];

  // ---------- Matemáticos jugables (se elige uno en «Elige tu matemático») ----------
  // Imágenes: compartido/img/galois/heroes/<id>.png (mapa) y <id>-retrato.png (pantalla de elegir).
  const HEROES = [
    { id: "hipatia", nombre: "Hipatia", epoca: "Alejandría, hacia el año 400", frase: "Enseñó matemáticas y astronomía en la gran biblioteca de Alejandría." },
    { id: "ada_lovelace", nombre: "Ada Lovelace", epoca: "Londres, 1815–1852", frase: "Escribió el primer algoritmo pensado para que lo hiciera una máquina." },
    { id: "emmy_noether", nombre: "Emmy Noether", epoca: "Alemania, 1882–1935", frase: "Una de las grandes del álgebra: encontró orden donde otros veían caos." },
    { id: "sophie_germain", nombre: "Sophie Germain", epoca: "París, 1776–1831", frase: "Estudió los números primos y firmaba sus cartas como «Monsieur Le Blanc»." },
    { id: "gauss", nombre: "Gauss", epoca: "Alemania, 1777–1855", frase: "De niño sumó todos los números del 1 al 100 en un momento." },
    { id: "fibonacci", nombre: "Fibonacci", epoca: "Pisa, hacia 1170–1250", frase: "Llevó a Europa nuestras cifras y la sucesión 1, 1, 2, 3, 5, 8…" },
    { id: "ramanujan", nombre: "Ramanujan", epoca: "India, 1887–1920", frase: "Aprendió casi solo y llenó cuadernos de fórmulas sorprendentes." },
    { id: "al_juarismi", nombre: "Al-Juarismi", epoca: "Bagdad, hacia 780–850", frase: "De su nombre viene «algoritmo», y de su libro, la palabra «álgebra»." }
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
  const heroe = (id, retrato) => `${BASE}img/galois/heroes/${id}${retrato ? "-retrato" : ""}.png`;
  const enemigo = (id, grande) => `${BASE}img/galois/enemigos/${id}${grande ? "-grande" : ""}.png`;

  window.MathQuest = { CLAVE, leer, guardar, nivel, sumar, gastar, logro, resumen, ajuste, sinMovimiento,
    MUNDOS, HEROES, LOGROS, AVATARES, avatarSVG, personaje, heroe, enemigo };
})();
