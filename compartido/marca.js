/* =========================================================
   πCHU · marca.js
   Nombre, lema y lista de juegos. Para añadir un juego nuevo
   basta con añadir un objeto a MARCA.juegos (ver CLAUDE.md).
   ========================================================= */
window.MARCA = {
  nombre: "πCHU",
  lema: "Matemáticas que no te esperabas",
  version: "0.1.0",
  autor: "Juan Antonio Campos Jiménez",

  // Orden en que aparecen los cursos en la portada
  cursos: ["1.º ESO", "2.º ESO", "3.º ESO", "4.º ESO", "1.º Bachillerato CCSS"],

  // estado: "jugar" (disponible) | "pronto" (aún no subido o en diseño)
  juegos: [
    {
      id: "expres",
      titulo: "πCHU Exprés",
      subtitulo: "El reino de la divisibilidad",
      curso: "1.º ESO",
      saber: "Múltiplos, divisores, primos, MCD y mcm",
      descripcion: "Combates de cartas rápidos contra cinco rivales. Elige compañero, cumple la misión y usa su poder.",
      simbolo: "÷",
      url: "applets/expres/",
      estado: "jugar",
      claves: ["pichu.expres.v3", "pichu.expres.v4"]
    },
    {
      id: "integer-ninja",
      titulo: "Integer Ninja",
      subtitulo: "Corta frutas con números enteros",
      curso: "1.º ESO",
      saber: "Números enteros, signos y operaciones",
      descripcion: "Arcade de cortar frutas: decide antes de cortar, supera misiones y reta a tus compañeros con un código.",
      simbolo: "±",
      // De momento se abre la versión publicada en Netlify (v0.5, con el ranking de clase).
      // Cuando se copie a applets/integer-ninja/, quitar "externo" y cambiar la url.
      url: "https://tourmaline-frangipane-a48492.netlify.app",
      externo: true,
      estado: "jugar",
      claves: []
    },
    {
      id: "fracciones",
      titulo: "Laboratorio de Fracciones",
      subtitulo: "Explora, parte y compara",
      curso: "1.º ESO",
      saber: "Fracciones, equivalencia y comparación",
      descripcion: "Manipula círculos, barras y la recta numérica para descubrir cuándo dos fracciones valen lo mismo.",
      simbolo: "½",
      url: "applets/fracciones/",
      estado: "pronto",
      claves: []
    },
    {
      id: "fraccionario",
      titulo: "Fraccionario",
      subtitulo: "Juego de cartas de fracciones",
      curso: "1.º ESO",
      saber: "Fracciones equivalentes y comparación",
      descripcion: "Juega cartas de fracciones y llega a la meta antes que tu rival.",
      simbolo: "¾",
      url: "applets/fraccionario/",
      estado: "pronto",
      claves: []
    },
    {
      id: "proporcionalidad",
      titulo: "Laboratorio de Proporcionalidad",
      subtitulo: "Recetas, tablas y gráficas",
      curso: "1.º ESO",
      saber: "Proporcionalidad directa e inversa",
      descripcion: "Escala recetas y mezclas y descubre qué relaciones son proporcionales y cuáles no.",
      simbolo: "∝",
      url: "",
      estado: "pronto",
      claves: []
    },
    {
      id: "cartas-ecuaciones",
      titulo: "Juego de cartas de ecuaciones",
      subtitulo: "En diseño",
      curso: "4.º ESO",
      saber: "Ecuaciones",
      descripcion: "Próximamente.",
      simbolo: "=",
      url: "",
      estado: "pronto",
      claves: []
    },
    {
      id: "cartas-funciones",
      titulo: "Juego de cartas de funciones",
      subtitulo: "En diseño",
      curso: "1.º Bachillerato CCSS",
      saber: "Funciones",
      descripcion: "Próximamente.",
      simbolo: "ƒ",
      url: "",
      estado: "pronto",
      claves: []
    }
  ]
};
