/* =========================================================
   πCHU · marca.js
   Nombre, lema y lista de juegos. Para añadir un juego nuevo
   basta con añadir un objeto a MARCA.juegos (ver CLAUDE.md).
   ========================================================= */
window.MARCA = {
  nombre: "πCHU",
  lema: "Matemáticas que no te esperabas",
  version: "0.6.2",
  autor: "Juan Antonio Campos Jiménez",

  // Cursos: de momento la portada NO los muestra (se organiza por juegos).
  // Se guardan en cada juego para poder agruparlos más adelante.
  cursos: ["1.º ESO", "2.º ESO", "3.º ESO", "4.º ESO", "1.º Bachillerato CCSS"],
  mostrarCursos: false,

  // estado: "jugar" (disponible) | "pronto" (aún no subido o en diseño)
  juegos: [
    {
      id: "expres",
      titulo: "Factor Clash",
      subtitulo: "Duelos de divisibilidad",
      curso: "1.º ESO",
      saber: "Múltiplos, divisores, primos, MCD y mcm",
      descripcion: "Combates de cartas rápidos contra cinco rivales. Elige compañero, cumple la misión y usa su poder.",
      simbolo: "÷",
      url: "applets/expres/",
      estado: "jugar",
      claves: ["pichu.expres.v3"]
    },
    {
      id: "integer-ninja",
      titulo: "Integer Ninja",
      subtitulo: "Corta frutas con números enteros",
      curso: "1.º ESO",
      saber: "Números enteros, signos y operaciones",
      descripcion: "Arcade de cortar frutas: decide antes de cortar, supera misiones y reta a tus compañeros con un código.",
      simbolo: "±",
      // Fuentes en src/integer-ninja/ → python3 src/integer-ninja/build.py genera applets/integer-ninja/index.html
      url: "applets/integer-ninja/",
      estado: "jugar",
      claves: ["pichu.integerNinja.v1"]
    },
    {
      id: "pizzeria",
      titulo: "Pizza Rush",
      subtitulo: "La cocina de fracciones de πCHU",
      curso: "1.º ESO",
      saber: "Fracciones: equivalencias, suma, multiplicación y división",
      descripcion: "Cocina a toda prisa: tickets con cuenta atrás, horno, rachas y una pizzería que mejoras con tus monedas. Suma, multiplica y divide fracciones.",
      simbolo: "🍕",
      url: "applets/pizzeria/",
      estado: "pronto",
      claves: ["pichu.pizzeria.v1"]
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
