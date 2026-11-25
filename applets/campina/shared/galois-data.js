/* =====================================================================
   GALOIS LEGACY · datos del juego (fuente única)
   ---------------------------------------------------------------------
   Matemáticos seleccionables y reinos de Gaussoria. Cada reino enlaza
   con los juegos que ya existen en /juegos/: no se cambia su contenido.
   Las habilidades actúan en los combates de aventura/ (una vez por combate).
   ===================================================================== */
window.GALOIS = {
  nombre: "GALOIS LEGACY",
  subtitulo: "El legado de los matemáticos",
  lema: ["Aprende", "Explora", "Resuelve", "Restaura"],

  // Los ocho del documento de diseño. imagen: ruta desde la raíz del sitio.
  heroes: [
    { id: "galois", nombre: "Évariste Galois", corto: "Galois", periodo: "1811–1832", origen: "Francia",
      aporte: "Con veinte años relacionó las ecuaciones con las simetrías de sus soluciones: el origen de la teoría de grupos.",
      habilidad: "Simetría oculta", efecto: "Simetría que delata: descarta una respuesta incorrecta en un combate.",
      imagen: "assets/galois/heroes/galois.png" },
    { id: "gauss", nombre: "Carl Friedrich Gauss", corto: "Gauss", periodo: "1777–1855", origen: "Alemania",
      aporte: "Aritmética, teoría de números, astronomía y estadística. De niño sumó del 1 al 100 emparejando números.",
      habilidad: "Cálculo relámpago", efecto: "Cálculo relámpago: tu próximo acierto vale doble.",
      imagen: "assets/pichu-royale/heroes/gauss.png" },
    { id: "euler", nombre: "Leonhard Euler", corto: "Euler", periodo: "1707–1783", origen: "Suiza",
      aporte: "Popularizó la notación f(x), π, e e i, y resolvió el problema de los puentes de Königsberg, inicio de la teoría de grafos.",
      habilidad: "Ruta de los puentes", efecto: "Ruta de los puentes: muestra una pista del reto.",
      imagen: "assets/galois/heroes/euler.png" },
    { id: "emmy_noether", nombre: "Emmy Noether", corto: "Noether", periodo: "1882–1935", origen: "Alemania",
      aporte: "Una de las fundadoras del álgebra abstracta. Su teorema une simetrías y leyes de conservación en física.",
      habilidad: "Patrón oculto", efecto: "Muestra una pista que destaca la regularidad del reto.",
      imagen: "assets/pichu-royale/heroes/emmy_noether.png" },
    { id: "hipatia", nombre: "Hipatia de Alejandría", corto: "Hipatia", periodo: "c. 355–415", origen: "Alejandría (Egipto)",
      aporte: "Matemática, astrónoma y maestra. Comentó obras de geometría y aritmética de autores griegos.",
      habilidad: "Escudo geométrico", efecto: "Crea una figura protectora: el próximo fallo no te quita vida.",
      imagen: "assets/pichu-royale/heroes/hipatia.png" },
    { id: "ada_lovelace", nombre: "Ada Lovelace", corto: "Ada", periodo: "1815–1852", origen: "Reino Unido",
      aporte: "Escribió el primer algoritmo pensado para una máquina: calcular números de Bernoulli con la máquina analítica.",
      habilidad: "Código maestro", efecto: "Muestra una pista sobre el siguiente paso del problema.",
      imagen: "assets/pichu-royale/heroes/ada_lovelace.png" },
    { id: "fibonacci", nombre: "Leonardo de Pisa (Fibonacci)", corto: "Fibonacci", periodo: "c. 1170–c. 1250", origen: "Pisa (Italia)",
      aporte: "Su Liber Abaci difundió en Europa las cifras indoarábigas y la sucesión 1, 1, 2, 3, 5, 8…",
      habilidad: "Cadena Fibonacci", efecto: "Tu próximo acierto vale doble, como la suma de los dos anteriores.",
      imagen: "assets/pichu-royale/heroes/fibonacci.png" },
    { id: "fermat", nombre: "Pierre de Fermat", corto: "Fermat", periodo: "1607–1665", origen: "Francia",
      aporte: "Jurista y matemático: teoría de números, el pequeño teorema y la famosa nota escrita en el margen de un libro.",
      habilidad: "Nota al margen", efecto: "Lee la nota del margen: muestra una pista del reto.",
      imagen: "assets/galois/heroes/fermat.png" }
  ],

  // Personajes del banco πCHU ROYALE que no están en el documento: se conservan como aliados.
  aliados: [
    { id: "sophie_germain", nombre: "Sophie Germain", corto: "Germain", periodo: "1776–1831", origen: "Francia",
      aporte: "Teoría de números y elasticidad. Estudió con el seudónimo «Monsieur Le Blanc».",
      habilidad: "Primo protector", efecto: "Descarta una respuesta incorrecta en un combate.",
      imagen: "assets/pichu-royale/heroes/sophie_germain.png" },
    { id: "ramanujan", nombre: "Srinivasa Ramanujan", corto: "Ramanujan", periodo: "1887–1920", origen: "India",
      aporte: "Descubrió por su cuenta miles de resultados sobre números, series y particiones.",
      habilidad: "Intuición numérica", efecto: "Muestra una pista numérica del reto.",
      imagen: "assets/pichu-royale/heroes/ramanujan.png" },
    { id: "al_juarismi", nombre: "Al-Juarismi", corto: "Al-Juarismi", periodo: "c. 780–c. 850", origen: "Bagdad",
      aporte: "Su libro sobre al-jabr dio nombre al álgebra; de su nombre viene la palabra «algoritmo».",
      habilidad: "Despeje maestro", efecto: "Despeja el camino: descarta una respuesta incorrecta.",
      imagen: "assets/pichu-royale/heroes/al_juarismi.png" }
  ],

  // Reinos = unidades que ya tienen juego. x, y: posición del marcador sobre el mapa (%).
  reinos: [
    { id: "ciudadela", nombre: "Ciudadela de Gaussoria", simbolo: "★", x: 50, y: 47, tipo: "inicio",
      desc: "Punto de partida. Aquí eliges a tu matemático antes de partir." },
    { id: "enteros", nombre: "Reino de los Enteros", simbolo: "ℤ", x: 37, y: 22, tema: "Números enteros",
      desc: "Glaciares bajo cero y un volcán en ebullición: números positivos y negativos, operaciones y objetivos exactos.",
      enemigos: ["negatron", "parentesis_maldito"], jefe: "Rey de los Signos",
      juegos: [{ ruta: "juegos/integer-ninja/", texto: "▶ Entrar" }] },
    { id: "divisibilidad", nombre: "Minas de los Primos", simbolo: "÷", x: 76, y: 35, tema: "Divisibilidad",
      desc: "Galerías de cristal donde se esconden divisores, primos, factorizaciones, MCD y mcm.",
      enemigos: ["multiplax", "primox"],
      juegos: [{ ruta: "juegos/divisibilidad/facil.html", texto: "▶ Modo fácil" }, { ruta: "juegos/divisibilidad/", texto: "⚔ Duelo de cartas" }] },
    { id: "fracciones", nombre: "Bosque de las Fracciones", simbolo: "½", x: 21, y: 60, tema: "Fracciones",
      desc: "Un laboratorio entre los árboles: colorea, mide, simplifica y resuelve problemas de Biología y Geología.",
      enemigos: ["denominadoron", "simplifract"],
      juegos: [{ ruta: "juegos/fracciones/", texto: "▶ Entrar" }] },
    // Reinos del documento que aún no tienen juego en el proyecto
    { id: "algebra", nombre: "Fortaleza del Álgebra", simbolo: "x", x: 78, y: 70, bloqueado: true,
      desc: "Incógnitas, expresiones y ecuaciones. Se abrirá cuando el proyecto tenga su juego." },
    { id: "geometria", nombre: "Templo de la Geometría", simbolo: "△", x: 60, y: 79, bloqueado: true,
      desc: "Ruinas, formas y puzles espaciales. Se abrirá cuando el proyecto tenga su juego." },
    { id: "pi", nombre: "Costa de π", simbolo: "π", x: 33, y: 88, bloqueado: true,
      desc: "Mapas, símbolos y desafíos numéricos. Se abrirá cuando el proyecto tenga su juego." }
  ]
};
