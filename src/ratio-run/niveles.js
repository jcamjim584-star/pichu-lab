/* =========================================================
   RATIO RUN · niveles.js
   Las 9 etapas (5 escalones) y la carrera infinita.
   Para retocar la dificultad basta con cambiar estos números:
     tipos     qué retos salen (peso de cada uno): razon, equiv, propor, directa,
               inversa, tipo (¿directa o inversa?), pct, descuento, aumento, quepct
     num       dificultad de los números (1 fácil · 2 normal · 3 difícil)
     retos     cuántas puertas de respuesta hay
     ops       cuántas puertas de operación («+25 %», «×2»…) y opNivel su dificultad
     tReto     segundos para pensar cada reto (la carrera se frena)
     vel       velocidad de la carrera
     clases    obstáculos: B bloque (cambiar de carril) · b valla (saltar) · a barra (agacharse)
     densidad  cuántas filas llevan obstáculo (0 a 1)
     tema      decorado
     jefe      { vida }: cada puerta acertada le quita 1
   ========================================================= */
(function (raiz) {
  "use strict";
  const ESCALONES = ["", "Principiante", "Intermedio", "Avanzado", "Experto", "Jefe final"];
  const ETAPAS = [
    { id: 1, esc: 1, nombre: "Mercado de las razones", lema: "Razón: comparar dos cantidades", tipos: { razon: 1 }, num: 1, retos: 5, ops: 1, opNivel: 1,
      tReto: 11, vel: 22, clases: "Bb", densidad: 0.7, tema: "mercado", pistas: true },
    { id: 2, esc: 1, nombre: "Calle de las proporciones", lema: "Razones equivalentes y proporciones", tipos: { equiv: 2, propor: 2, razon: 1 }, num: 1, retos: 5, ops: 1, opNivel: 1,
      tReto: 11, vel: 22, clases: "Bb", densidad: 0.75, tema: "mercado", pistas: true },
    { id: 3, esc: 2, nombre: "Ruta directa", lema: "A doble cantidad, doble resultado", tipos: { directa: 3, propor: 1 }, num: 1, retos: 6, ops: 1, opNivel: 1,
      tReto: 13, vel: 24, clases: "Bba", densidad: 0.8, tema: "ciudad" },
    { id: 4, esc: 2, nombre: "Barrio del tanto por ciento", lema: "50 % la mitad, 25 % la cuarta parte…", tipos: { pct: 3, quepct: 1 }, num: 1, retos: 6, ops: 2, opNivel: 2,
      tReto: 12, vel: 24, clases: "Bba", densidad: 0.8, tema: "ciudad", poderes: 0.06 },
    { id: 5, esc: 3, nombre: "Rebajas y subidas", lema: "Descuentos y aumentos", tipos: { descuento: 3, aumento: 2, quepct: 2, pct: 1 }, num: 2, retos: 6, ops: 2, opNivel: 3,
      tReto: 13, vel: 25, clases: "Bba", densidad: 0.85, tema: "atardecer", poderes: 0.06 },
    { id: 6, esc: 3, nombre: "Túnel inverso", lema: "Con más pintores, menos días", tipos: { inversa: 3, directa: 1 }, num: 2, retos: 6, ops: 1, opNivel: 3,
      tReto: 14, vel: 25, clases: "Bba", densidad: 0.85, tema: "tunel", poderes: 0.06 },
    { id: 7, esc: 4, nombre: "¿Directa o inversa?", lema: "Piensa qué pasa si una cantidad se duplica", tipos: { tipo: 3, directa: 2, inversa: 2 }, num: 2, retos: 7, ops: 1, opNivel: 3,
      tReto: 13, vel: 26, clases: "Bba", densidad: 0.9, tema: "neon", poderes: 0.06 },
    { id: 8, esc: 4, nombre: "Gran maratón", lema: "Todo mezclado", tipos: { equiv: 1, propor: 1, directa: 2, inversa: 2, tipo: 1, pct: 1, descuento: 2, aumento: 2, quepct: 1 }, num: 3, retos: 7, ops: 2, opNivel: 3,
      tReto: 14, vel: 27, clases: "Bba", densidad: 0.9, tema: "neon", poderes: 0.06 },
    { id: 9, esc: 5, nombre: "Porcentrón, el tragamonedas", lema: "Cada puerta acertada le quita energía", tipos: { directa: 2, inversa: 2, tipo: 1, pct: 1, descuento: 2, aumento: 2, quepct: 2 }, num: 2, retos: 7, ops: 2, opNivel: 3,
      tReto: 14, vel: 26, clases: "Bba", densidad: 0.9, tema: "fabrica", poderes: 0.08, jefe: { vida: 6 } }
  ];
  // Carrera infinita: cada tramo es más variado; se acaba al quedarse sin corazones.
  const INFINITO = [
    { hasta: 3, tipos: { razon: 1, equiv: 1, propor: 1 }, num: 1, opNivel: 1, clases: "Bb", densidad: 0.75, tema: "mercado" },
    { hasta: 7, tipos: { directa: 2, pct: 2, propor: 1 }, num: 2, opNivel: 2, clases: "Bba", densidad: 0.8, tema: "ciudad" },
    { hasta: 12, tipos: { descuento: 2, aumento: 2, inversa: 2, quepct: 1 }, num: 2, opNivel: 3, clases: "Bba", densidad: 0.85, tema: "atardecer" },
    { hasta: 1e9, tipos: { directa: 1, inversa: 2, tipo: 1, descuento: 1, aumento: 1, quepct: 1, equiv: 1 }, num: 3, opNivel: 3, clases: "Bba", densidad: 0.9, tema: "neon" }
  ];
  const api = { ESCALONES, ETAPAS, INFINITO };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  raiz.RatioNiveles = api;
})(typeof window !== "undefined" ? window : globalThis);
