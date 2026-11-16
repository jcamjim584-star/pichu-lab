/* =========================================================
   POWER MERGE · niveles.js
   Los 13 niveles de la campaña (5 escalones de dificultad) y el modo infinito.
   Para retocar la dificultad basta con cambiar estos números:
     n       tamaño del tablero (n × n)
     bases   bases que aparecen
     movs    movimientos disponibles
     total   pedidos que hay que entregar
     formas  cómo se escriben los pedidos (peso de cada forma):
             pot 2^5 · num 32 · desc 2·2·2·2·2 · pal «2 a la quinta» · raiz √1024
             prod 2^2·2^3 · coc 2^7:2^2 · potpot (2^2)^3
     eMin/eMax  exponentes que se piden
     e2      probabilidad de que una ficha nueva salga con exponente 2
     pNum    probabilidad de que salga escrita como número (4, 9, 25, 100)
     ayuda   las fichas enseñan también su valor
     rocas   rocas al empezar · hielo  probabilidad de ficha congelada
     jefe    { cada: movimientos entre ataques }
   ========================================================= */
(function (raiz) {
  "use strict";
  const ESCALONES = ["", "Principiante", "Intermedio", "Avanzado", "Experto", "Jefe final"];
  const NIVELES = [
    { id: 1, esc: 1, nombre: "Primeras chispas", lema: "Fusiona fichas de la misma base", n: 4, bases: [2, 3], movs: 30, total: 4,
      formas: { desc: 2, pot: 2, num: 1 }, eMin: 2, eMax: 3, e2: 0.15, pNum: 0, ayuda: true },
    { id: 2, esc: 1, nombre: "Cuadrados y cubos", lema: "Al cuadrado, al cubo…", n: 4, bases: [2, 3, 5], movs: 40, total: 5,
      formas: { num: 2, pal: 2, desc: 1 }, eMin: 2, eMax: 3, e2: 0.15, pNum: 0, ayuda: true },
    { id: 3, esc: 1, nombre: "La cantera", lema: "Una fusión al lado rompe la roca", n: 4, bases: [2, 3], movs: 40, total: 5,
      formas: { num: 3, pal: 1 }, eMin: 2, eMax: 4, e2: 0.15, pNum: 0, ayuda: true, rocas: 2 },

    { id: 4, esc: 2, nombre: "Base diez", lema: "100, 1000, 10 000…", n: 5, bases: [2, 3, 10], movs: 50, total: 6,
      formas: { num: 3, pal: 1, desc: 1 }, eMin: 2, eMax: 4, e2: 0.2, pNum: 0.3 },
    { id: 5, esc: 2, nombre: "Raíces exactas", lema: "√64 = 8 porque 8 · 8 = 64", n: 5, bases: [2, 3, 5], movs: 50, total: 6,
      formas: { raiz: 3, num: 1 }, eMin: 2, eMax: 4, e2: 0.2, pNum: 0.3 },
    { id: 6, esc: 2, nombre: "Hielo fino", lema: "Las fichas heladas no se mueven", n: 5, bases: [2, 3, 5], movs: 60, total: 7,
      formas: { num: 2, raiz: 2, pal: 1 }, eMin: 2, eMax: 5, e2: 0.2, pNum: 0.3, hielo: 0.14 },

    { id: 7, esc: 3, nombre: "Producto de potencias", lema: "Misma base: se suman los exponentes", n: 5, bases: [2, 3, 10], movs: 60, total: 7,
      formas: { prod: 3, num: 1, raiz: 1 }, eMin: 3, eMax: 6, e2: 0.25, pNum: 0.4 },
    { id: 8, esc: 3, nombre: "Cociente de potencias", lema: "Misma base: se restan los exponentes", n: 5, bases: [2, 3, 5, 10], movs: 65, total: 7,
      formas: { coc: 3, prod: 1, raiz: 1 }, eMin: 2, eMax: 5, e2: 0.25, pNum: 0.4 },
    { id: 9, esc: 3, nombre: "Laberinto de roca", lema: "Abre camino a golpe de fusión", n: 5, bases: [2, 3, 5], movs: 70, total: 8,
      formas: { prod: 1, coc: 1, raiz: 1, num: 1 }, eMin: 2, eMax: 6, e2: 0.25, pNum: 0.4, rocas: 4, vidaRoca: 2 },

    { id: 10, esc: 4, nombre: "Potencia de potencia", lema: "(2^2)^3: se multiplican los exponentes", n: 5, bases: [2, 3, 10], movs: 75, total: 8,
      formas: { potpot: 3, prod: 1, coc: 1 }, eMin: 3, eMax: 8, e2: 0.3, pNum: 0.5 },
    { id: 11, esc: 4, nombre: "Todo mezclado", lema: "Hielo, roca y todas las propiedades", n: 5, bases: [2, 3, 5, 10], movs: 80, total: 9,
      formas: { num: 1, raiz: 1, prod: 1, coc: 1, potpot: 1, pal: 1 }, eMin: 2, eMax: 6, e2: 0.3, pNum: 0.5, hielo: 0.1, rocas: 2 },
    { id: 12, esc: 4, nombre: "La gran forja", lema: "Potencias enormes", n: 5, bases: [2, 3, 10], movs: 85, total: 8,
      formas: { num: 1, raiz: 1, prod: 1, coc: 1, potpot: 1 }, eMin: 4, eMax: 10, e2: 0.35, pNum: 0.5 },

    { id: 13, esc: 5, nombre: "Radikal, el Devorador", lema: "Cada entrega le quita un escudo", n: 5, bases: [2, 3, 5, 10], movs: 95, total: 10,
      formas: { num: 1, raiz: 2, prod: 2, coc: 2, potpot: 1, pal: 1 }, eMin: 2, eMax: 7, e2: 0.3, pNum: 0.5, jefe: { cada: 7 } }
  ];
  // Modo infinito: sin límite de movimientos; la dificultad sube con las entregas.
  const INFINITO = [
    { hasta: 4, bases: [2, 3], formas: { num: 2, pal: 1, desc: 1 }, eMin: 2, eMax: 4, e2: 0.2, pNum: 0.2 },
    { hasta: 10, bases: [2, 3, 5], formas: { num: 2, raiz: 2, pal: 1 }, eMin: 2, eMax: 5, e2: 0.25, pNum: 0.35 },
    { hasta: 18, bases: [2, 3, 5, 10], formas: { raiz: 1, prod: 2, coc: 2, num: 1 }, eMin: 2, eMax: 6, e2: 0.3, pNum: 0.45, hielo: 0.06 },
    { hasta: 1e9, bases: [2, 3, 5, 10], formas: { raiz: 1, prod: 1, coc: 1, potpot: 1, num: 1 }, eMin: 3, eMax: 8, e2: 0.3, pNum: 0.5, hielo: 0.08 }
  ];
  const api = { ESCALONES, NIVELES, INFINITO };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  raiz.PowerNiveles = api;
})(typeof window !== "undefined" ? window : globalThis);
