/* =========================================================
   FRACTION MERGE · niveles.js
   Los 13 niveles de la campaña (5 escalones) y el modo infinito.
   Para retocar la dificultad basta con cambiar estos números:
     n        tamaño del tablero (n × n)
     dens     denominadores de las fichas que aparecen (siempre salen como 1/d)
     comun    denominador común de todos ellos (el mayor que puede aparecer)
     movs     movimientos disponibles
     total    pedidos que hay que entregar
     formas   cómo se escriben los pedidos (peso de cada forma):
              frac 3/4 · dib dibujo · pal «tres cuartos» · equiv 6/8 · dec 0,75
              sumaIgual 1/8 + 2/8 · restaIgual 7/8 − 4/8 · falta 1/4 + ? = 1
              suma 1/2 + 1/4 · resta 1 − 1/4 (distinto denominador)
              mitad «la mitad de 1/2» · doble «el doble de 1/8»
     unidades true = también se piden fracciones sueltas como 1/4
     pesos    { 4: 3 } = las fichas 1/4 salen el triple de veces
     pEq      probabilidad de que una ficha salga sin simplificar (2/4 en vez de 1/2)
     ayuda    las fichas enseñan un dibujo de su valor
     rocas    rocas al empezar · hielo  probabilidad de ficha congelada
     jefe     { cada: movimientos entre ataques }
   ========================================================= */
(function (raiz) {
  "use strict";
  const ESCALONES = ["", "Principiante", "Intermedio", "Avanzado", "Experto", "Jefe final"];
  const NIVELES = [
    { id: 1, esc: 1, nombre: "Mitades y cuartos", lema: "Junta dos fichas: se suman", n: 4, dens: [2, 4], comun: 4, movs: 20, total: 6,
      formas: { frac: 2, dib: 3 }, unidades: true, ayuda: true, pesos: { 4: 3 } },
    { id: 2, esc: 1, nombre: "Llegan los octavos", lema: "1/8 + 1/8 = 2/8 = 1/4", n: 4, dens: [2, 4, 8], comun: 8, movs: 40, total: 8,
      formas: { frac: 2, dib: 2, pal: 2 }, ayuda: true },
    { id: 3, esc: 1, nombre: "Iguales con otro disfraz", lema: "2/4 y 1/2 valen lo mismo", n: 4, dens: [2, 4, 8], comun: 8, movs: 38, total: 8,
      formas: { equiv: 3, dib: 1, frac: 1 }, pEq: 0.3, verMax: 8, ayuda: true, rocas: 2 },

    { id: 4, esc: 2, nombre: "Tercios y sextos", lema: "1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2", n: 5, dens: [2, 3, 6], comun: 6, movs: 30, total: 9,
      formas: { frac: 1, pal: 2, equiv: 2, dib: 1 }, pEq: 0.2, verMax: 12 },
    { id: 5, esc: 2, nombre: "Sumar con el mismo denominador", lema: "Se suman los numeradores", n: 5, dens: [2, 4, 8], comun: 8, movs: 44, total: 9,
      formas: { sumaIgual: 3, restaIgual: 1, equiv: 1 }, pEq: 0.2, verMax: 8 },
    { id: 6, esc: 2, nombre: "Hasta la unidad", lema: "¿Cuánto falta para llegar a 1?", n: 5, dens: [2, 3, 6], comun: 6, movs: 32, total: 10,
      formas: { falta: 3, restaIgual: 2, pal: 1 }, pEq: 0.2, verMax: 12, hielo: 0.12 },

    { id: 7, esc: 3, nombre: "Sumas con distinto denominador", lema: "Primero, denominador común", n: 5, dens: [2, 4, 8], comun: 8, movs: 54, total: 10,
      formas: { suma: 3, sumaIgual: 1, equiv: 1 }, pEq: 0.25, verMax: 16 },
    { id: 8, esc: 3, nombre: "Restas con distinto denominador", lema: "3/4 − 1/2 = 3/4 − 2/4 = 1/4", n: 5, dens: [2, 3, 6], comun: 6, movs: 32, total: 10,
      formas: { resta: 3, suma: 1, falta: 1 }, pEq: 0.25, verMax: 12 },
    { id: 9, esc: 3, nombre: "La cantera de los doceavos", lema: "Medios, tercios, cuartos y sextos juntos", n: 5, dens: [2, 3, 4, 6, 12], comun: 12, movs: 78, total: 10,
      formas: { suma: 2, resta: 2, equiv: 1, pal: 1 }, pEq: 0.25, verMax: 12, rocas: 4, vidaRoca: 2 },

    { id: 10, esc: 4, nombre: "Mitad y doble", lema: "La mitad de 1/2 es 1/4", n: 5, dens: [2, 4, 8], comun: 8, movs: 44, total: 10,
      formas: { mitad: 2, doble: 2, suma: 1, resta: 1 }, pEq: 0.3, verMax: 16 },
    { id: 11, esc: 4, nombre: "Quintos, décimos y decimales", lema: "1/2 = 0,5 y 1/10 = 0,1", n: 5, dens: [2, 5, 10], comun: 10, movs: 70, total: 10,
      formas: { dec: 3, suma: 1, resta: 1, equiv: 1 }, pEq: 0.3, verMax: 20, hielo: 0.1, rocas: 2 },
    { id: 12, esc: 4, nombre: "Todo mezclado", lema: "Todas las formas de escribir una fracción", n: 5, dens: [2, 3, 4, 6, 12], comun: 12, movs: 90, total: 12,
      formas: { suma: 2, resta: 2, falta: 1, mitad: 1, doble: 1, equiv: 1, pal: 1 }, pEq: 0.3, verMax: 12, hielo: 0.08 },

    { id: 13, esc: 5, nombre: "Quebrón, el Rompefracciones", lema: "Cada entrega le quita un escudo", n: 5, dens: [2, 3, 4, 6, 12], comun: 12, movs: 104, total: 14,
      formas: { suma: 2, resta: 2, falta: 1, mitad: 1, equiv: 1, dib: 1 }, pEq: 0.3, verMax: 12, jefe: { cada: 7 } }
  ];
  const INFINITO = [
    { hasta: 4, dens: [2, 4, 8], comun: 8, formas: { frac: 1, dib: 2, pal: 1, equiv: 1 }, pEq: 0.2, verMax: 8 },
    { hasta: 10, dens: [2, 3, 6], comun: 6, formas: { equiv: 1, sumaIgual: 2, falta: 2, pal: 1 }, pEq: 0.25, verMax: 12 },
    { hasta: 18, dens: [2, 4, 8], comun: 8, formas: { suma: 2, resta: 2, mitad: 1, equiv: 1 }, pEq: 0.3, verMax: 16, hielo: 0.05 },
    { hasta: 1e9, dens: [2, 3, 4, 6, 12], comun: 12, formas: { suma: 2, resta: 2, falta: 1, mitad: 1, doble: 1 }, pEq: 0.3, verMax: 12, hielo: 0.06 }
  ];
  const api = { ESCALONES, NIVELES, INFINITO };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  raiz.FraccionNiveles = api;
})(typeof window !== "undefined" ? window : globalThis);
