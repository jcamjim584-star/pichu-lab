/* =========================================================
   EQUATION MERGE · niveles.js
   Los 13 niveles de la campaña (5 escalones de dificultad) y el modo infinito.
   Para retocar la dificultad basta con cambiar estos números:
     n       tamaño del tablero (n × n)
     movs    movimientos disponibles
     total   ecuaciones que hay que resolver
     formas  qué ecuaciones salen (peso de cada tipo):
             suma x + 5 = 12 · resta x − 3 = 4 · mult 3x = 18 · div x/3 = 4
             dos 2x + 3 = 11 · dosr 2x − 3 = 11 · ambos 5x + 3 = 2x + 12
             par 3(x + 2) = 21 · pal «Pienso un número…»
     xMin/xMax  soluciones posibles (como mucho 20, el valor máximo de una ficha)
     palDif  1 = problemas en palabras de un paso · 2 = también de dos pasos
     fichas  valores con los que nacen las fichas nuevas
     ayuda   las ecuaciones enseñan el primer paso
     rocas   rocas al empezar · vidaRoca golpes para romperlas · hielo  probabilidad de ficha congelada
     jefe    { cada: movimientos entre ataques }
   ========================================================= */
(function (raiz) {
  "use strict";
  const ESCALONES = ["", "Principiante", "Intermedio", "Avanzado", "Experto", "Jefe final"];
  const NIVELES = [
    { id: 1, esc: 1, nombre: "Primer equilibrio", lema: "x + 5 = 12: quita 5 en los dos lados", n: 4, movs: 30, total: 4,
      formas: { suma: 1 }, xMin: 2, xMax: 8, fichas: [1, 2], ayuda: true },
    { id: 2, esc: 1, nombre: "Lo que se resta", lema: "x − 3 = 4: suma 3 en los dos lados", n: 4, movs: 40, total: 5,
      formas: { resta: 3, suma: 1 }, xMin: 3, xMax: 10, fichas: [1, 2], ayuda: true },
    { id: 3, esc: 1, nombre: "La cantera", lema: "Pienso un número… · una fusión al lado rompe la roca", n: 4, movs: 40, total: 5,
      formas: { pal: 2, suma: 1, resta: 1 }, xMin: 3, xMax: 10, palDif: 1, fichas: [1, 2], ayuda: true, rocas: 2 },

    { id: 4, esc: 2, nombre: "Multiplicar por x", lema: "3x = 18: divide entre 3 en los dos lados", n: 5, movs: 50, total: 6,
      formas: { mult: 3, suma: 1 }, xMin: 2, xMax: 10, fichas: [1, 2, 3] },
    { id: 5, esc: 2, nombre: "Partido por", lema: "x/3 = 4: multiplica por 3 en los dos lados", n: 5, movs: 60, total: 6,
      formas: { div: 3, mult: 1 }, xMin: 4, xMax: 18, fichas: [1, 2, 3] },
    { id: 6, esc: 2, nombre: "Hielo fino", lema: "Las fichas heladas no se mueven", n: 5, movs: 60, total: 7,
      formas: { suma: 1, resta: 1, mult: 1, div: 1, pal: 1 }, xMin: 3, xMax: 14, palDif: 1, fichas: [1, 2, 3], hielo: 0.14 },

    { id: 7, esc: 3, nombre: "Dos pasos", lema: "2x + 3 = 11: primero quita el 3, luego divide", n: 5, movs: 48, total: 7,
      formas: { dos: 3, mult: 1 }, xMin: 2, xMax: 10, fichas: [1, 2, 3] },
    { id: 8, esc: 3, nombre: "Dos pasos con resta", lema: "2x − 3 = 11: primero suma 3, luego divide", n: 5, movs: 52, total: 7,
      formas: { dosr: 2, dos: 2, pal: 1 }, xMin: 2, xMax: 12, palDif: 2, fichas: [1, 2, 3] },
    { id: 9, esc: 3, nombre: "Laberinto de roca", lema: "Abre camino a golpe de fusión", n: 5, movs: 62, total: 8,
      formas: { dos: 1, dosr: 1, div: 1, pal: 1 }, xMin: 2, xMax: 14, palDif: 2, fichas: [1, 2, 3], rocas: 4, vidaRoca: 2 },

    { id: 10, esc: 4, nombre: "x a los dos lados", lema: "5x + 3 = 2x + 12: junta las x en un lado", n: 5, movs: 58, total: 8,
      formas: { ambos: 3, dos: 1 }, xMin: 2, xMax: 12, fichas: [1, 2, 3] },
    { id: 11, esc: 4, nombre: "Paréntesis", lema: "3(x + 2) = 21: el 3 multiplica a todo", n: 5, movs: 62, total: 8,
      formas: { par: 3, dosr: 1 }, xMin: 2, xMax: 12, fichas: [1, 2, 3] },
    { id: 12, esc: 4, nombre: "Todo mezclado", lema: "Hielo, roca y todo tipo de ecuaciones", n: 5, movs: 70, total: 9,
      formas: { suma: 1, resta: 1, mult: 1, div: 1, dos: 1, dosr: 1, ambos: 1, par: 1, pal: 1 }, xMin: 2, xMax: 20, palDif: 2,
      fichas: [1, 2, 3, 4], hielo: 0.1, rocas: 2 },

    { id: 13, esc: 5, nombre: "Incógnito, el Enmascarado", lema: "Cada ecuación resuelta le quita una máscara", n: 5, movs: 80, total: 10,
      formas: { mult: 1, div: 1, dos: 2, dosr: 2, ambos: 2, par: 2, pal: 1 }, xMin: 2, xMax: 16, palDif: 2, fichas: [1, 2, 3], jefe: { cada: 7 } }
  ];
  // Modo infinito: sin límite de movimientos; la dificultad sube con las entregas.
  const INFINITO = [
    { hasta: 4, formas: { suma: 2, resta: 2, pal: 1 }, xMin: 2, xMax: 10, palDif: 1, fichas: [1, 2] },
    { hasta: 10, formas: { suma: 1, resta: 1, mult: 2, div: 2, pal: 1 }, xMin: 2, xMax: 14, palDif: 1, fichas: [1, 2, 3] },
    { hasta: 18, formas: { mult: 1, div: 1, dos: 2, dosr: 2, pal: 1 }, xMin: 2, xMax: 14, palDif: 2, fichas: [1, 2, 3], hielo: 0.06 },
    { hasta: 1e9, formas: { dos: 1, dosr: 1, ambos: 2, par: 2, pal: 1 }, xMin: 2, xMax: 18, palDif: 2, fichas: [1, 2, 3, 4], hielo: 0.08 }
  ];
  const api = { ESCALONES, NIVELES, INFINITO };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  raiz.EquationNiveles = api;
})(typeof window !== "undefined" ? window : globalThis);
