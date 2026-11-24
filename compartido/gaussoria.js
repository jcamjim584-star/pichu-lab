/* =========================================================
   GALOIS LEGACY · gaussoria.js  (un juego de πCHU LAB)
   Mapa de Gaussoria explorable en vista cenital (desde arriba).
   El matemático elegido camina por casillas; al pisar la puerta
   de un reino se puede entrar en su juego.

   - MAPA: el terreno, una letra por casilla (leyenda abajo).
   - Las puertas de los reinos NO están en MAPA: están en
     compartido/mathquest.js → MUNDOS[i].puerta = [columna, fila].
   - Todo se dibuja con código (pixel art de 16×16): no se
     descarga nada de otros servidores.
   - No guarda nada por sí mismo: la portada guarda la posición
     en pichu.galois.v1 (ver index.html).
   ========================================================= */
(function () {
  "use strict";

  // ---------- El terreno (44 columnas × 32 filas) ----------
  // .  hierba        ,  flores         =  camino       p  plaza de piedra
  // S  salida (plaza de πCHU)          T  árbol        M  roca
  // ~  agua          b  puente
  // T, M y ~ no se pueden pisar. Cada edificio de reino ocupa 3×2 casillas
  // (la puerta abajo en el centro) y se pinta encima del terreno.
  const MAPA = [
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
    "TTT..TTTTT..TTT...MMMMMMMMMMMMMT.......,..TT",
    "TTTTTTT.TTT.TTT,..MMMM,MM.MMMMM.,.TT.T.T..TT",
    "TTT.,TTT.,TTTTT..,MMMMMMMMMMMMM........T..TT",
    "TTTTTTTTTTTTTT,.,T.MMT.M.T.,M.M.T,..TT..T,TT",
    "TTT..TTTTTTTTTT..,M.MMMT..TM.T........T.T.TT",
    "TTTTTTTTTTTTTT......................,.....TT",
    "TT.TTTTTT.TT.TT....T.................T..,,TT",
    "TTTTT.TTTTT.T.T...........................TT",
    "TT..,T..=============================.....TT",
    "TT......=............=..............=.....TT",
    "TT....T.=.........TT.=.......T..,,T.=.....TT",
    "TT.,..T.====..,......=............T.=.....TT",
    "TT...T..=.,.,........=.....,....TT..=.....TT",
    "TT..,...=,,..T.....pp=p........T,T..====..TT",
    "TT......=.,..,,..========...T.T.T...=.....TT",
    "TT,T....=....,.....pp=pp...T.,..,.T.=..,..TT",
    "TT......=.,..T...T...=...T.......,..=...,.TT",
    "TT......=..,.T.......=.,...........,=.....TT",
    "TT,.....=.......,,..,=..............=.,T,.TT",
    "TTT..================================..,..TT",
    "TT.T.=.,.....,.......=,.,...,,...=.,......TT",
    "TTT..=.TT..,.,.TT....=......~~~~~b~~~~~~~~TT",
    "TT...=..T....,....,T.=..,T~~~~~~~b~~~~~~~~TT",
    "TT.,.=.........,T....=....~~~~~~~b~~~~~~~~TT",
    "TT...=........TT.....=....~~~~~,.=.....~~~TT",
    "TT,..=........,....ppppp..~~~~~T.=.....~~~TT",
    "TT...==============ppSpp..~~~~~,.====..~~~TT",
    "TTT,,..,.,.........ppppp..~~~~~........~~~TT",
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT"
  ];
  const ANCHO = MAPA[0].length, ALTO = MAPA.length, C = 16;     // C = lado de una casilla en píxeles de arte
  const BLOQUEA = "TM~";

  // Busca la salida (S)
  function salida() {
    for (let y = 0; y < ALTO; y++) { const x = MAPA[y].indexOf("S"); if (x >= 0) return { x, y }; }
    return { x: 1, y: 1 };
  }
  // Casillas ocupadas por los edificios de los reinos (todas menos la puerta)
  function casillasEdificio(mundos) {
    const s = new Set();
    for (const m of mundos) {
      if (!m.puerta) continue;
      const [x, y] = m.puerta;
      for (const [dx, dy] of [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0]]) s.add((x + dx) + "," + (y + dy));
    }
    return s;
  }
  function sePuedePisar(x, y, edificios) {
    if (x < 0 || y < 0 || x >= ANCHO || y >= ALTO) return false;
    return !BLOQUEA.includes(MAPA[y][x]) && !edificios.has(x + "," + y);
  }
  // Camino más corto (búsqueda en anchura). Devuelve la lista de casillas o null.
  function ruta(desde, hasta, edificios) {
    const clave = p => p.x + "," + p.y, previo = new Map([[clave(desde), null]]), cola = [desde];
    while (cola.length) {
      const p = cola.shift();
      if (p.x === hasta.x && p.y === hasta.y) {
        const camino = []; let k = clave(p), q = p;
        while (q) { camino.unshift(q); q = previo.get(k); k = q && clave(q); }
        return camino.slice(1);
      }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = { x: p.x + dx, y: p.y + dy };
        if (!previo.has(clave(n)) && sePuedePisar(n.x, n.y, edificios)) { previo.set(clave(n), p); cola.push(n); }
      }
    }
    return null;
  }

  // ---------- Paleta del pixel art (la de marca.css y alguna más) ----------
  const COL = {
    o: "#16122C", hierba: "#3E9A5E", hierbaOsc: "#2F7D4B", hierbaCla: "#5DB57A",
    camino: "#D9B878", caminoOsc: "#C4A061", caminoCla: "#E8CF98", caminoBorde: "#A8874E",
    plaza: "#CFC4A6", plazaLinea: "#A89E84", agua: "#3A7BC8", aguaCla: "#A9D0F5", aguaOsc: "#2C62A6",
    madera: "#9B6B3A", maderaOsc: "#6B4A22", oro: "#E8B53A", oroCla: "#FFE08A", pergamino: "#F3ECD6"
  };
  // Color del tejado de cada reino (por orden)
  const TEJADOS = ["#6A4BB8", "#3A7BC8", "#3E9A5E", "#9E2B3A", "#4F8FD6", "#C98A1E", "#8E5BC8", "#2E8C7A", "#2C62A6", "#B8456A", "#B07A2A"];

  // Dibujos de 16×16: cada letra es un color, "." es transparente
  const ARBOL = {
    o: "#16122C", d: "#1F5A3A", g: "#246B3E", l: "#3E9A5E", t: "#6B4A22",
    px: [
      "......oooo......",
      "....oolllgoo....",
      "...olllgggggo...",
      "..olllggggggdo..",
      "..ollggggggddo..",
      ".olgggggggggddo.",
      ".ogggggggggdddo.",
      ".oggggggggddddo.",
      ".ogggggggdddddo.",
      "..oggggddddddo..",
      "..oddddddddddo..",
      "...oodddddooo...",
      ".....oottoo.....",
      "......otto......",
      "......otto......",
      ".....oottoo....."
    ]
  };
  const ROCA = {
    o: "#16122C", w: "#B9B4CF", r: "#8C86A8", s: "#6E6890",
    px: [
      "................",
      "................",
      "......oooo......",
      "....oowwwroo....",
      "...owwwrrrrso...",
      "..owwrrrrrrsso..",
      "..owrrrrrrrsso..",
      ".owrrrrrrrrssso.",
      ".orrrrrrrrsssso.",
      ".orrrrrrrssssso.",
      ".osrrrrssssssso.",
      "..ossssssssssoo.",
      "...oooooooooo...",
      "................",
      "................",
      "................"
    ]
  };
  // Cifras pixel de 3×5 para el número de cada reino
  const CIFRAS = ["111101101101111", "010110010010111", "111001111100111", "111001111001111", "101101111001001",
    "111100111001111", "111100111101111", "111001010010010", "111101111101111", "111101111001111"];

  // Pinta un dibujo de letras en un contexto (a escala de arte, 1 píxel = 1 píxel)
  function pintarPx(ctx, dibujo, colores, x0, y0, espejo) {
    dibujo.forEach((fila, y) => {
      for (let x = 0; x < fila.length; x++) {
        const c = fila[x];
        if (c === "." || !colores[c]) continue;
        ctx.fillStyle = colores[c];
        ctx.fillRect(x0 + (espejo ? fila.length - 1 - x : x), y0 + y, 1, 1);
      }
    });
  }
  // Número pseudoaleatorio fijo para cada casilla (así la hierba no «baila»)
  const azar = (x, y, i) => { let h = (x * 374761393 + y * 668265263 + i * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

  // ---------- Crear el mapa en un <canvas> ----------
  // op = { lienzo, mundos: [{ indice, puerta, jugable, ahora, imagen }], posicion, heroe (imagen del matemático),
  //        sinMovimiento(), alPisar(mundo|null), alMoverse(pos), alEntrar(mundo) }
  function crear(op) {
    const lienzo = op.lienzo, ctx = lienzo.getContext("2d");
    const mundos = op.mundos.filter(m => m.puerta);
    const edificios = casillasEdificio(mundos);
    const enPuerta = (x, y) => mundos.find(m => m.puerta[0] === x && m.puerta[1] === y) || null;

    // Posición inicial: la guardada (si se puede pisar) o la salida
    let pos = op.posicion && sePuedePisar(op.posicion.x, op.posicion.y, edificios) ? { x: op.posicion.x, y: op.posicion.y } : salida();
    let dir = (op.posicion && op.posicion.dir) || "abajo";
    let paso = null;               // { desde, hasta, t0 } mientras se camina de una casilla a otra
    let ruta_ = [];                // casillas pendientes al tocar el mapa
    const pulsadas = [];           // direcciones mantenidas (teclado o cruceta), la última manda
    let puertaActual = enPuerta(pos.x, pos.y);
    const DURACION = 150;          // ms por casilla

    // --- Capa fija: terreno + edificios (se pinta una vez, a escala de arte) ---
    const fija = document.createElement("canvas");
    fija.width = ANCHO * C; fija.height = ALTO * C;
    const imagenes = {};
    // El matemático elegido (imagen pequeña de pixel art, compartido/img/galois/heroes/<id>.png)
    let heroe = new Image();
    function ponerHeroe(src) {
      const img = new Image();
      img.onload = () => { heroe = img; dibujar(performance.now()); };
      img.src = src;
    }
    if (op.heroe) ponerHeroe(op.heroe);
    function pintarFija() {
      const f = fija.getContext("2d");
      f.imageSmoothingEnabled = false;
      for (let y = 0; y < ALTO; y++) for (let x = 0; x < ANCHO; x++) casilla(f, x, y);
      mundos.forEach(m => edificio(f, m));
      mundos.forEach(m => { if (!m.jugable) niebla(f, m); });
    }
    function hierba(f, x, y) {
      const X = x * C, Y = y * C;
      f.fillStyle = COL.hierba; f.fillRect(X, Y, C, C);
      for (let i = 0; i < 7; i++) {
        f.fillStyle = i < 5 ? COL.hierbaOsc : COL.hierbaCla;
        const px = X + Math.floor(azar(x, y, i) * 15), py = Y + Math.floor(azar(x, y, i + 9) * 15);
        f.fillRect(px, py, 1, 2);
      }
    }
    const tipo = (x, y) => (x < 0 || y < 0 || x >= ANCHO || y >= ALTO) ? "T" : MAPA[y][x];
    function casilla(f, x, y) {
      const t = MAPA[y][x], X = x * C, Y = y * C;
      if (t === "~" || t === "b") {
        f.fillStyle = COL.agua; f.fillRect(X, Y, C, C);
        f.fillStyle = COL.aguaOsc;
        for (let i = 0; i < 3; i++) f.fillRect(X + Math.floor(azar(x, y, i) * 12), Y + Math.floor(azar(x, y, i + 4) * 14), 3, 1);
        // Orilla clara donde toca tierra
        f.fillStyle = COL.aguaCla;
        if (!"~b".includes(tipo(x, y - 1))) f.fillRect(X, Y, C, 1);
        if (!"~b".includes(tipo(x - 1, y))) f.fillRect(X, Y, 1, C);
        if (!"~b".includes(tipo(x + 1, y))) f.fillRect(X + C - 1, Y, 1, C);
        if (t === "b") {                                          // puente de tablas
          f.fillStyle = COL.madera; f.fillRect(X + 2, Y, 12, C);
          f.fillStyle = COL.maderaOsc;
          for (let i = 0; i < C; i += 4) f.fillRect(X + 2, Y + i, 12, 1);
          f.fillRect(X + 1, Y, 1, C); f.fillRect(X + 14, Y, 1, C);
        }
        return;
      }
      if (t === "=" ) {
        f.fillStyle = COL.camino; f.fillRect(X, Y, C, C);
        for (let i = 0; i < 6; i++) {
          f.fillStyle = i % 2 ? COL.caminoOsc : COL.caminoCla;
          f.fillRect(X + Math.floor(azar(x, y, i) * 15), Y + Math.floor(azar(x, y, i + 7) * 15), 2, 1);
        }
        f.fillStyle = COL.caminoBorde;                            // borde donde empieza la hierba
        const camino = c => "=pSb".includes(c);
        if (!camino(tipo(x, y - 1))) f.fillRect(X, Y, C, 1);
        if (!camino(tipo(x, y + 1))) f.fillRect(X, Y + C - 1, C, 1);
        if (!camino(tipo(x - 1, y))) f.fillRect(X, Y, 1, C);
        if (!camino(tipo(x + 1, y))) f.fillRect(X + C - 1, Y, 1, C);
        return;
      }
      if (t === "p" || t === "S") {
        f.fillStyle = COL.plaza; f.fillRect(X, Y, C, C);
        f.fillStyle = COL.plazaLinea;
        f.fillRect(X, Y + 7, C, 1); f.fillRect(X, Y + 15, C, 1);
        f.fillRect(X + (y % 2 ? 3 : 11), Y, 1, 7); f.fillRect(X + (y % 2 ? 11 : 3), Y + 8, 1, 7);
        if (t === "S") {                                          // estrella dorada de la salida
          pintarPx(f, ["...o...", "..ogo..", "ooogooo", "oggyggo", ".ogggo.", "ogo.ogo", "oo...oo"],
            { o: COL.o, g: COL.oro, y: COL.oroCla }, X + 4, Y + 4);
        }
        return;
      }
      hierba(f, x, y);
      if (t === ",") {
        const flores = [COL.oroCla, COL.pergamino, "#E7A0C8"];
        for (let i = 0; i < 3; i++) {
          const px = X + 2 + Math.floor(azar(x, y, i + 20) * 11), py = Y + 2 + Math.floor(azar(x, y, i + 30) * 11);
          f.fillStyle = flores[i]; f.fillRect(px - 1, py, 3, 1); f.fillRect(px, py - 1, 1, 3);
          f.fillStyle = COL.oro; f.fillRect(px, py, 1, 1);
        }
      } else if (t === "T") pintarPx(f, ARBOL.px, ARBOL, X, Y);
      else if (t === "M") pintarPx(f, ROCA.px, ROCA, X, Y);
    }
    // Edificio de un reino: 3×2 casillas, tejado de color, puerta en el centro y el número
    function edificio(f, m) {
      const [px, py] = m.puerta, X = (px - 1) * C, Y = (py - 1) * C;
      const gris = !m.jugable;
      const tejado = gris ? "#7D7896" : TEJADOS[m.indice % TEJADOS.length];
      const pared = gris ? "#BDB8CC" : COL.pergamino;
      f.fillStyle = "rgba(22,18,44,.35)"; f.fillRect(X + 3, Y + 30, 44, 2);        // sombra en el suelo
      f.fillStyle = COL.o; f.fillRect(X + 2, Y + 11, 44, 20);
      f.fillStyle = pared; f.fillRect(X + 3, Y + 12, 42, 18);
      f.fillStyle = gris ? "#A9A4BC" : "#D8CCA8"; f.fillRect(X + 3, Y + 26, 42, 4);   // zócalo
      // Ventanas
      [[8, 16], [34, 16]].forEach(([vx, vy]) => {
        f.fillStyle = COL.o; f.fillRect(X + vx - 1, Y + vy - 1, 8, 7);
        f.fillStyle = gris ? "#8C86A8" : COL.oroCla; f.fillRect(X + vx, Y + vy, 6, 5);
        f.fillStyle = COL.o; f.fillRect(X + vx + 3, Y + vy, 1, 5);
      });
      // Tejado escalonado (pixel)
      for (let i = 0; i < 6; i++) {
        const w = 26 + i * 4, x0 = X + 24 - w / 2, y0 = Y - 1 + i * 2;
        f.fillStyle = COL.o; f.fillRect(x0 - 1, y0, w + 2, 3);
        f.fillStyle = tejado; f.fillRect(x0, y0 + 1, w, 2);
      }
      f.fillStyle = "rgba(255,255,255,.25)"; f.fillRect(X + 12, Y + 2, 24, 1);
      // Puerta (arco oscuro)
      f.fillStyle = COL.o; f.fillRect(X + 18, Y + 17, 12, 15); f.fillRect(X + 19, Y + 16, 10, 1);
      f.fillStyle = gris ? "#3A3550" : "#2A2150"; f.fillRect(X + 19, Y + 18, 10, 14);
      if (gris) {                                                              // candado
        f.fillStyle = COL.o; f.fillRect(X + 21, Y + 22, 6, 6);
        f.fillStyle = "#BDB8CC"; f.fillRect(X + 22, Y + 23, 4, 4);
        f.fillStyle = COL.o; f.fillRect(X + 22, Y + 19, 1, 3); f.fillRect(X + 25, Y + 19, 1, 3); f.fillRect(X + 22, Y + 19, 4, 1);
      } else { f.fillStyle = COL.oro; f.fillRect(X + 27, Y + 25, 1, 2); }
      // Placa con el número del reino
      const num = String(m.indice + 1), ancho = num.length * 4 + 3;
      const nx = X + 24 - Math.ceil(ancho / 2), ny = Y + 3;
      f.fillStyle = COL.o; f.fillRect(nx - 1, ny - 1, ancho + 2, 9);
      f.fillStyle = gris ? "#D8D4E4" : COL.oro; f.fillRect(nx, ny, ancho, 7);
      [...num].forEach((d, i) => {
        const p = CIFRAS[+d];
        for (let k = 0; k < 15; k++) if (p[k] === "1") { f.fillStyle = COL.o; f.fillRect(nx + 2 + i * 4 + (k % 3), ny + 1 + Math.floor(k / 3), 1, 1); }
      });
      // Enemigo del reino junto al edificio (pixel art ya preparado: se pinta a su tamaño)
      const img = imagenes[m.indice];
      if (img && img.complete && img.naturalWidth) {
        const w = img.naturalWidth, h = img.naturalHeight, lx = X + 44, ly = Y + 33 - h;
        if (gris) {                                     // en gris y medio transparente
          const c = document.createElement("canvas"); c.width = w; c.height = h;
          const g = c.getContext("2d");
          g.drawImage(img, 0, 0);
          g.globalCompositeOperation = "saturation"; g.fillStyle = "#808080"; g.fillRect(0, 0, w, h);
          g.globalCompositeOperation = "destination-in"; g.drawImage(img, 0, 0);
          f.globalAlpha = .55; f.drawImage(c, lx, ly); f.globalAlpha = 1;
        } else f.drawImage(img, lx, ly);
      }
    }
    // Niebla oscura sobre los reinos que aún no tienen juego
    function niebla(f, m) {
      const [px, py] = m.puerta;
      for (let y = py - 3; y <= py + 2; y++) for (let x = px - 3; x <= px + 3; x++) {
        if (x < 0 || y < 0 || x >= ANCHO || y >= ALTO) continue;
        const d = Math.hypot(x - px, (y - py + .5) * 1.2);
        if (d > 3.4) continue;
        f.fillStyle = `rgba(74,50,144,${(0.38 - d * 0.09).toFixed(2)})`;
        f.fillRect(x * C, y * C, C, C);
        // Volutas de niebla (pixel)
        f.fillStyle = "rgba(231,224,247,.35)";
        f.fillRect(x * C + Math.floor(azar(x, y, 50) * 8), y * C + Math.floor(azar(x, y, 51) * 12), 8, 2);
      }
    }
    // Carga los personajes; al llegar cada uno se repinta la capa fija
    let pendientes = 0;
    mundos.forEach(m => {
      if (!m.imagen) return;
      const img = new Image(); pendientes++;
      img.onload = img.onerror = () => { if (--pendientes === 0) { pintarFija(); dibujar(performance.now()); } };
      img.src = m.imagen; imagenes[m.indice] = img;
    });
    pintarFija();

    // --- Tamaño: escala entera para que los píxeles se vean nítidos ---
    let k = 3, vw = 0, vh = 0;
    function redimensionar() {
      const r = lienzo.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      lienzo.width = Math.max(1, Math.round(r.width * dpr)); lienzo.height = Math.max(1, Math.round(r.height * dpr));
      // Casillas de unos 36 px en pantalla (26 px en el móvil, para que se vea más paisaje):
      // entre 12 y 16 casillas de ancho, y al menos 8 de alto
      const tamCasilla = r.width < 600 ? 26 : 36;
      const columnas = Math.max(12, Math.min(16, r.width / tamCasilla));
      k = Math.max(1, Math.min(Math.round(lienzo.width / (C * columnas)), Math.floor(lienzo.height / (C * 8))));
      vw = lienzo.width / k; vh = lienzo.height / k;       // lo que se ve, en píxeles de arte
      dibujar(performance.now());
    }

    // --- Movimiento ---
    const DIRS = { arriba: [0, -1], abajo: [0, 1], izquierda: [-1, 0], derecha: [1, 0] };
    function intentar(d) {
      dir = d;
      const [dx, dy] = DIRS[d], n = { x: pos.x + dx, y: pos.y + dy };
      if (!sePuedePisar(n.x, n.y, edificios)) { ruta_ = []; return false; }
      paso = { desde: { ...pos }, hasta: n, t0: performance.now() };
      if (op.sinMovimiento()) terminarPaso();                // sin animación: salta a la casilla
      return true;
    }
    function terminarPaso() {
      if (!paso) return;
      const anterior = puertaActual;
      pos = paso.hasta; paso = null;
      puertaActual = enPuerta(pos.x, pos.y);
      op.alMoverse && op.alMoverse({ x: pos.x, y: pos.y, dir });
      if (puertaActual !== anterior) op.alPisar && op.alPisar(puertaActual);
    }
    let ultimoPasoSinMov = 0;
    function siguiente(t) {
      if (paso) return;
      // Sin animación, se respeta el mismo ritmo al mantener pulsado
      if (op.sinMovimiento() && t - ultimoPasoSinMov < DURACION) return;
      let d = pulsadas[pulsadas.length - 1];
      if (!d && ruta_.length) {
        const n = ruta_.shift();
        d = n.x > pos.x ? "derecha" : n.x < pos.x ? "izquierda" : n.y > pos.y ? "abajo" : "arriba";
      }
      if (d) { ultimoPasoSinMov = t; intentar(d); }
    }

    // --- Cámara: centrada en el jugador, sin salirse del mapa (en píxeles de arte) ---
    let ultimaCamara = [0, 0];
    function camara(fx, fy) {
      const mw = ANCHO * C, mh = ALTO * C;
      let cx = Math.round(fx * C + C / 2 - vw / 2), cy = Math.round(fy * C + C / 2 - vh / 2);
      cx = mw <= vw ? Math.round((mw - vw) / 2) : Math.max(0, Math.min(mw - vw, cx));
      cy = mh <= vh ? Math.round((mh - vh) / 2) : Math.max(0, Math.min(mh - vh, cy));
      return (ultimaCamara = [cx, cy]);
    }

    // --- Dibujo ---
    function dibujar(t) {
      if (!vw) return;
      // Posición en píxeles de arte (con el paso a medias si se está andando)
      let fx = pos.x, fy = pos.y, avance = 0;
      if (paso) {
        avance = Math.min(1, (t - paso.t0) / DURACION);
        fx = paso.desde.x + (paso.hasta.x - paso.desde.x) * avance;
        fy = paso.desde.y + (paso.hasta.y - paso.desde.y) * avance;
      }
      const [cx, cy] = camara(fx, fy);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = COL.o; ctx.fillRect(0, 0, lienzo.width, lienzo.height);
      ctx.setTransform(k, 0, 0, k, -cx * k, -cy * k);
      ctx.drawImage(fija, 0, 0);

      const quieto = op.sinMovimiento();
      // Olas del agua (se mueven si hay animaciones)
      const fase = quieto ? 0 : Math.floor(t / 400) % 4;
      ctx.fillStyle = COL.aguaCla;
      const x0 = Math.max(0, Math.floor(cx / C)), y0 = Math.max(0, Math.floor(cy / C));
      const x1 = Math.min(ANCHO - 1, Math.ceil((cx + vw) / C)), y1 = Math.min(ALTO - 1, Math.ceil((cy + vh) / C));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        if (MAPA[y][x] !== "~") continue;
        const ox = Math.floor(azar(x, y, 60) * 9), oy = 3 + Math.floor(azar(x, y, 61) * 9);
        ctx.fillRect(x * C + ((ox + fase) % 12), y * C + oy, 3, 1);
      }
      // Puerta pisada: marco dorado
      if (puertaActual) {
        const brillo = quieto ? 1 : 0.6 + 0.4 * Math.sin(t / 180);
        ctx.globalAlpha = brillo; ctx.fillStyle = COL.oroCla;
        const X = pos.x * C, Y = pos.y * C;
        ctx.fillRect(X, Y + C - 2, C, 2); ctx.fillRect(X, Y + C, C, 1);
        ctx.globalAlpha = 1;
      }
      // «!» dorado sobre el reino que se da en clase
      mundos.forEach(m => {
        if (!m.ahora || !m.jugable) return;
        const bote = quieto ? 0 : Math.round(Math.abs(Math.sin(t / 260)) * 3);
        pintarPx(ctx, [".ooo.", "oyyyo", "oyyyo", "oggyo", "oggyo", ".ogo.", "..o..", ".ooo.", "oggyo", ".ooo."],
          { o: COL.o, y: COL.oroCla, g: COL.oro }, m.puerta[0] * C + 5, (m.puerta[1] - 1) * C - 13 - bote);
      });
      // El matemático elegido: sombra, saltito al andar y mirando hacia el lado al que camina
      ctx.fillStyle = "rgba(22,18,44,.35)";
      ctx.fillRect(Math.round(fx * C) + 2, Math.round(fy * C) + 13, 12, 3);
      if (heroe.complete && heroe.naturalWidth) {
        const w = heroe.naturalWidth, h = heroe.naturalHeight;
        const bote = paso && !quieto ? Math.round(Math.sin(avance * Math.PI) * 2) : 0;
        const x = Math.round(fx * C + C / 2 - w / 2), y = Math.round(fy * C + C - h + 1) - bote;
        if (dir === "izquierda") { ctx.save(); ctx.translate(x + w, y); ctx.scale(-1, 1); ctx.drawImage(heroe, 0, 0); ctx.restore(); }
        else ctx.drawImage(heroe, x, y);
      }
    }

    // --- Bucle: solo mientras el mapa se ve ---
    let activo = false, idBucle = 0;
    function bucle(t) {
      if (!activo) return;
      if (paso && t - paso.t0 >= DURACION) terminarPaso();
      siguiente(t);
      dibujar(t);
      idBucle = requestAnimationFrame(bucle);
    }
    function arrancar() { if (activo) return; activo = true; redimensionar(); idBucle = requestAnimationFrame(bucle); }
    function parar() { activo = false; cancelAnimationFrame(idBucle); pulsadas.length = 0; ruta_ = []; if (paso) terminarPaso(); }

    // --- Teclado (cuando el mapa tiene el foco) ---
    const TECLAS = { ArrowUp: "arriba", ArrowDown: "abajo", ArrowLeft: "izquierda", ArrowRight: "derecha",
      w: "arriba", s: "abajo", a: "izquierda", d: "derecha", W: "arriba", S: "abajo", A: "izquierda", D: "derecha" };
    lienzo.addEventListener("keydown", e => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const d = TECLAS[e.key];
      if (d) { e.preventDefault(); pulsar(d); return; }
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); entrar(); }
    });
    lienzo.addEventListener("keyup", e => { const d = TECLAS[e.key]; if (d) soltar(d); });
    lienzo.addEventListener("blur", () => { pulsadas.length = 0; });
    // Al pulsar se da el primer paso enseguida (así un toque rápido también mueve)
    function pulsar(d) { if (!activo) return; ruta_ = []; if (!pulsadas.includes(d)) pulsadas.push(d); siguiente(performance.now()); }
    function soltar(d) { const i = pulsadas.indexOf(d); if (i >= 0) pulsadas.splice(i, 1); }
    function unPaso(d) { ruta_ = []; if (!paso) intentar(d); }

    // --- Tocar o hacer clic en el mapa: el jugador va andando hasta allí ---
    lienzo.addEventListener("pointerdown", e => {
      const r = lienzo.getBoundingClientRect(), dpr = lienzo.width / r.width;
      const [cx, cy] = ultimaCamara;
      const tx = Math.floor(((e.clientX - r.left) * dpr / k + cx) / C), ty = Math.floor(((e.clientY - r.top) * dpr / k + cy) / C);
      // Si se toca un edificio, se va a su puerta
      let destino = { x: tx, y: ty };
      const m = mundos.find(m => Math.abs(m.puerta[0] - tx) <= 1 && (ty === m.puerta[1] || ty === m.puerta[1] - 1));
      if (m) destino = { x: m.puerta[0], y: m.puerta[1] };
      if (destino.x === pos.x && destino.y === pos.y) { if (puertaActual) entrar(); return; }
      const camino = ruta(paso ? paso.hasta : pos, destino, edificios);
      if (camino) { pulsadas.length = 0; ruta_ = camino; }
    });

    function entrar() { if (puertaActual && op.alEntrar) op.alEntrar(puertaActual); }

    return { arrancar, parar, redimensionar, pulsar, soltar, unPaso, entrar, ponerHeroe,
      actual: () => puertaActual, posicion: () => ({ x: pos.x, y: pos.y, dir }) };
  }

  window.Gaussoria = { MAPA, ANCHO, ALTO, BLOQUEA, salida, casillasEdificio, sePuedePisar, ruta, crear };
})();
