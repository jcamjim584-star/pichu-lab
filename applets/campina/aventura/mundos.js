/* =====================================================================
   GALOIS LEGACY · los diez mundos jugables
   ---------------------------------------------------------------------
   Cada mundo tiene un mapa propio de 32×24 tiles, monumentos, vecinos, cofres
   del saber y cinco aventuras (coleccion/datos.js):
     1 Exploración  · hablar con un vecino, reunir 3 fragmentos y resolver
     2 Combate      · vencer al primer enemigo
     3 Construcción · restaurar un monumento resolviendo retos
     4 Minijefe     · vencer al segundo enemigo
     5 Jefe         · combate en tres fases (solo tras las aventuras 1-4)
   Los textos culturales son breves y generales; conviene contrastarlos.
   ===================================================================== */
(function (root) {
  'use strict';
  var W = 32, H = 24;

  function Mapa(fondo) { this.t = []; for (var y = 0; y < H; y++) { this.t.push([]); for (var x = 0; x < W; x++) this.t[y].push(fondo || '.'); } }
  Mapa.prototype.rect = function (x, y, w, h, c) { for (var j = y; j < y + h; j++) for (var i = x; i < x + w; i++) if (j >= 0 && j < H && i >= 0 && i < W) this.t[j][i] = c; return this; };
  Mapa.prototype.borde = function (c) { this.rect(0, 0, W, 1, c).rect(0, H - 1, W, 1, c).rect(0, 0, 1, H, c).rect(W - 1, 0, 1, H, c); return this; };
  Mapa.prototype.salpicar = function (c, x, y, w, h, n, seed) { for (var k = 0; k < n; k++) { var i = x + Math.floor(rnd(seed + k * 7) * w), j = y + Math.floor(rnd(seed + k * 13 + 1) * h); this.t[j][i] = c; } return this; };
  function rnd(s) { var v = Math.sin(s * 12.9898) * 43758.5453; return v - Math.floor(v); }

  var M = [];
  /* ===================== 1 · Fuentes de Andalucía (mapa propio) ===================== */
  (function () {
    var m = new Mapa('.');
    m.salpicar(',', 1, 1, 30, 22, 50, 5).borde('h');
    m.rect(1, 1, 10, 5, 'w');            // trigales de la Campiña
    m.rect(19, 16, 12, 6, 'w');
    m.rect(1, 15, 12, 7, '.').salpicar('o', 1, 15, 12, 7, 16, 9); // olivar
    m.rect(15, 8, 2, 16, ':').rect(1, 12, 30, 1, ':').rect(22, 6, 1, 6, ':');
    m.rect(11, 8, 10, 7, '=');
    [[11, 8], [20, 8], [11, 14], [20, 14]].forEach(function (p) { m.t[p[1]][p[0]] = 'F'; });
    m.t[11][12] = 'L'; m.t[11][19] = 'L'; m.t[9][12] = 'T'; m.t[9][19] = 'T';
    M.push({
      id: 1, mapa: m, inicio: [5, 12], salida: [15, 23], musica: 'campina',
      edificios: [
        { t: 'ies', x: 1, y: 7, nombre: 'IES Alarifes Ruiz Florindo', texto: 'El patio del instituto, punto de partida. En la maqueta de Fuentes, la Fuente de la Reina está seca y faltan tres piezas de su conducción.' },
        { t: 'alfareria', x: 3, y: 1, nombre: 'La Forja de los Alarifes', texto: 'Taller de azulejos inspirado en el Centro de Interpretación del Barroco. Aquí se cortan y se cuecen los paños que cubren las fachadas.' },
        { t: 'iglesia', x: 13, y: 1, nombre: 'Iglesia barroca', texto: 'Una iglesia barroca de Fuentes con su espadaña. Los alarifes de la familia Ruiz Florindo trabajaron en el barroco del siglo XVIII.' },
        { t: 'torre_homenaje', x: 18, y: 1, nombre: 'El Silo · Mirador de la Campiña', obra: true, texto: 'Donde se guardaba el grano, hoy se mira la Campiña. Desde la azotea se distingue el horizonte... y la dirección de la fuente.' },
        { t: 'castillo', x: 24, y: 0, nombre: 'Castillo de la Monclova', texto: 'Uno de los castillos del municipio, levantado fuera del casco urbano. Desde el mirador del Silo se ve al fondo de la campiña.' },
        { t: 'palacio', x: 24, y: 7, nombre: 'Casa palacio', texto: 'Una casa señorial con portada de ladrillo y balcón de forja, como las de las familias nobles de Fuentes.' },
        { t: 'fuente', x: 15, y: 10, nombre: 'La fuente de la plaza', texto: 'Fuentes de Andalucía debe su nombre al agua de sus manantiales y fuentes. Esta es la de la plaza; la de la Reina está a las afueras.' },
        { t: 'puesto', x: 8, y: 15, nombre: 'El horno de Rosario', o: { toldo: '#c05c40', genero: '#e8a85c' }, texto: 'En el horno se apartan los entornaos en bandejas. El pimentón les da su color característico.' },
        { t: 'ermita', x: 24, y: 14, nombre: 'Ermita de María Auxiliadora', texto: 'La ermita a la que llega la romería por el camino de la Campiña.' },
        { t: 'fuente', x: 28, y: 18, nombre: 'Fuente de la Reina', texto: 'A las afueras del pueblo. Por sus conducciones llegaba el agua del cerro hasta el abrevadero.' },
        { t: 'casa', x: 3, y: 17, nombre: 'Casa encalada', o: { teja: '#b04a30' } }
      ],
      vecinos: [
        { v: 'alumna', x: 6, y: 13, nombre: 'Inés, la aprendiz del taller', aventura: 1, dir: 'down',
          dialogo: ['¿Tú eres Galois? Ven un momento. La fuente de la maqueta se ha quedado seca otra vez.', 'La última vez faltaba un azulejo. Hoy faltan tres piezas y hay huellas de barro en el patio.', 'Recoge los tres azulejos sueltos (✦) y vuelve: con ellos podremos leer el orden de las piezas.'],
          pedido: 'Busca los tres azulejos brillantes (✦) y vuelve a hablar conmigo.', listo: 'El profe dice que cuente dos veces. Yo digo que primero saquemos el barro. Venga: ordena las piezas por su número.' },
        { v: 'alfarero', x: 8, y: 8, nombre: 'Alonso Ruiz Florindo', aventura: 2, dir: 'down',
          dialogo: ['Siete filas de siete. Si lo ves en el suelo, luego lo ves en el papel.', 'Me falta el paño cuadrado del taller y un diablillo de barro me desplaza una hilera en cuanto me descuido.', 'Ayúdame a cuadrarlo y te llevas el Marco de medida.'],
          listo: 'Vamos con el paño: 49 azulejos tienen que quedar cuadrados.' },
        { v: 'agricultor', x: 19, y: 7, nombre: 'Lola del Silo', aventura: 3, dir: 'down',
          dialogo: ['Apunta los sacos cuando pasan. Si los cuentas al final, te toca bajar otra vez.', 'Hasta que la báscula marque lo que debe, el contrapeso no sale del almacén.'],
          listo: 'Cinco vagonetas, doce sacos cada una y las ocho entregas del patio. A ver qué marca.' },
        { v: 'abuela', x: 17, y: 13, nombre: 'La Máscara del Reverso', aventura: 4, dir: 'down',
          dialogo: ['¿Quién soy? Mira cómo ando, que de mi voz no te puedes fiar.', 'Llevo el plano cosido al forro de la colcha. Si me reconoces, es tuyo.'],
          listo: 'Acompáñame la copla: tres grupos de cuatro pulsos y ni uno de más.' },
        { v: 'molinera', x: 13, y: 16, nombre: 'Rosario, del horno', encargo: 'm1-lardero', dir: 'down',
          dialogo: ['Ve apartando cuatro en cada bandeja. Como me descuide, me desaparece la primera.', 'Esto es para la comida del Jueves Lardero, que abre el Carnaval.'],
          hecho: 'Las bandejas ya están puestas. Llévate un entornao para el camino.' },
        { v: 'maestra', x: 25, y: 13, nombre: 'Comitiva de la romería', encargo: 'm1-romeria', dir: 'down',
          dialogo: ['Acompañamos a María Auxiliadora hasta su ermita, por el camino de la Campiña.', 'Si echas cuentas del camino, puedes venir con nosotros.'],
          hecho: 'La comitiva ya llegó a la ermita. Gracias por acompañarla.' },
        { v: 'pastelera', x: 13, y: 13, nombre: 'Puesto de la plaza', tienda: true, dialogo: ['¿Una poción de vida? Son 15 monedas. Las monedas se ganan en las aventuras y en los cofres del saber.'] }
      ],
      fragmentos: [[12, 5], [28, 13], [6, 20]],
      enemigo2: [9, 4], obra: 1, minijefe: [7, 19], jefe: [26, 19],
      cofres: [{ id: 'c1-a', x: 2, y: 14, monedas: 12 }, { id: 'c1-b', x: 29, y: 22, monedas: 15 }, { id: 'c1-c', x: 11, y: 6, monedas: 10 }]
    });
  })();

  /* ===================== 2-10 · Mapas propios ===================== */
  function base(fondo, seed) { var m = new Mapa(fondo || '.'); if (fondo !== 's') m.salpicar(',', 1, 1, 30, 22, 35, seed); m.borde('h'); return m; }
  function marco(m, x, y, w, h, c) { m.rect(x, y, w, 1, c).rect(x, y + h - 1, w, 1, c).rect(x, y, 1, h, c).rect(x + w - 1, y, 1, h, c); }
  function salida(m, x) { m.rect(x, 22, 1, 2, ':'); }
  function c(id, x, y, mo) { return { id: id, x: x, y: y, monedas: mo || 12 }; }
  function tienda(x, y, v) { return { v: v || 'pastelera', x: x, y: y, nombre: 'Puesto de pociones', tienda: true, dialogo: ['Pociones de vida a 15 monedas. Se ganan monedas en las aventuras y en los cofres del saber.'] }; }
  function mundo(o) { o.salida = o.salida || [o.inicio[0], 23]; M.push(o); }

  /* ---------- 2 · Carmona: ciudad amurallada sobre la vega ---------- */
  (function () {
    var m = base('.', 22);
    m.rect(1, 1, 6, 22, 's').salpicar('r', 1, 1, 6, 22, 7, 4);             // necrópolis fuera de la muralla
    marco(m, 7, 2, 22, 18, 'M');                                           // muralla
    m.t[10][7] = ':'; m.rect(1, 10, 6, 1, ':');                            // postigo hacia la necrópolis
    m.rect(8, 8, 20, 1, ':').rect(15, 9, 1, 14, ':').rect(13, 10, 7, 4, '=');
    m.rect(8, 20, 23, 2, 'c').salpicar('o', 18, 20, 12, 2, 6, 9);          // vega
    salida(m, 15); m.t[11][14] = 'F'; m.t[11][19] = 'F';
    m.rect(26, 15, 2, 1, 'm');                                             // matorral que esconde un cofre
    mundo({ id: 2, mapa: m, inicio: [15, 21],
      edificios: [
        { t: 'puerta', x: 13, y: 16, paso: [2], nombre: 'Puerta de Sevilla', obra: true, texto: 'La gran puerta fortificada de Carmona. Por su arco se entra en la ciudad desde el camino de Sevilla.' },
        { t: 'castillo', x: 8, y: 3, nombre: 'Alcázar de la Puerta de Sevilla', texto: 'Fortaleza que protege la entrada a la ciudad. Prímox custodia aquí el último sello.' },
        { t: 'puerta', x: 21, y: 0, nombre: 'Puerta de Córdoba', o: { piedra: '#b8946a' }, texto: 'Otra de las puertas de la muralla, en el camino hacia Córdoba.' },
        { t: 'necropolis', x: 2, y: 4, nombre: 'Necrópolis romana', texto: 'Carmona conserva una necrópolis romana con tumbas excavadas en la roca.' },
        { t: 'necropolis', x: 2, y: 14, nombre: 'Tumbas romanas' },
        { t: 'casa', x: 20, y: 4 }, { t: 'casa', x: 24, y: 4 }, { t: 'palacio', x: 21, y: 10, nombre: 'Casa señorial' }, { t: 'casa', x: 9, y: 12 }, { t: 'fuente', x: 16, y: 11, nombre: 'Fuente de la plaza' }
      ],
      vecinos: [
        { v: 'guardia', x: 14, y: 15, nombre: 'Guardia de la muralla', aventura: 1, dialogo: ['¡Alto! Las puertas de Carmona solo se abren con números que se dejan dividir.', 'Han desaparecido tres sillares mágicos de la muralla. Tráemelos y te enseñaré a abrir los portones.'], pedido: 'Busca los tres sillares brillantes (✦).', listo: 'Bien hecho. Ahora, cada portón: ¿se puede repartir el grupo exactamente?' },
        { v: 'romano', x: 4, y: 9, nombre: 'Arqueóloga Julia', dialogo: ['Carmona fue una ciudad importante en época romana: la llamaban Carmo.', 'Los números primos son como sillares que no se pueden partir en piezas iguales más pequeñas.'] },
        tienda(13, 14), { v: 'alumna', x: 20, y: 9, nombre: 'Lucía', dialogo: ['Truco: un número es divisible entre 3 si la suma de sus cifras es múltiplo de 3.', 'Hay un matorral junto a la muralla este... ¡con el compás (botón B) se puede cortar!'] }
      ],
      fragmentos: [[3, 18], [26, 9], [17, 5]], enemigo2: [22, 16], minijefe: [10, 17], jefe: [11, 9], obra: 0,
      cofres: [c('c2-a', 2, 21), c('c2-b', 27, 16, 20), c('c2-c', 27, 3)] });
  })();

  /* ---------- 3 · Écija: la ciudad de las torres junto al Genil ---------- */
  (function () {
    var m = base('.', 33);
    m.rect(1, 1, 30, 9, 's').rect(26, 1, 3, 22, '~').rect(26, 12, 3, 1, 'B');
    m.rect(29, 1, 2, 22, '.'); [[29, 2], [30, 7], [30, 17], [29, 21]].forEach(function (p) { m.t[p[1]][p[0]] = 'T'; });
    m.rect(1, 12, 25, 1, ':').rect(15, 13, 1, 11, ':').rect(9, 13, 12, 6, '=');
    [[9, 13], [20, 13], [9, 18], [20, 18]].forEach(function (p) { m.t[p[1]][p[0]] = 'P'; });
    m.rect(1, 19, 8, 4, 'w').rect(18, 19, 7, 4, 'c'); salida(m, 15);
    m.rect(22, 9, 3, 1, 'f');                                              // valla: hay que saltarla
    mundo({ id: 3, mapa: m, inicio: [15, 21],
      edificios: [
        { t: 'torre_barroca', x: 3, y: 1, nombre: 'Torre de San Juan', obra: true, texto: 'Écija es «la ciudad de las torres»: sus campanarios barrocos lucen azulejos de colores.' },
        { t: 'torre_barroca', x: 8, y: 1, nombre: 'Torre de Santa Cruz', texto: 'Otra de las once torres de la ruta ecijana.' },
        { t: 'torre_barroca', x: 23, y: 1, nombre: 'Torre de Santa María' },
        { t: 'iglesia', x: 16, y: 1, nombre: 'Templo del reloj', o: { ocre: '#e8a060' }, texto: 'Paréntesis Maldito ha convertido el reloj de la torre en una trampa.' },
        { t: 'palacio', x: 2, y: 14, nombre: 'Palacio ecijano', texto: 'Écija conserva muchos palacios barrocos.' },
        { t: 'casa', x: 22, y: 14 }, { t: 'casa', x: 11, y: 4 }, { t: 'fuente', x: 14, y: 15, nombre: 'Fuente del Salón', texto: 'La Plaza de España de Écija, conocida como «el Salón».' }
      ],
      vecinos: [
        { v: 'abuela', x: 11, y: 11, nombre: 'Doña Astigi', aventura: 1, dialogo: ['A Écija la llaman «la sartén de Andalucía» por su calor... pero en invierno se puede bajar de cero.', 'El ascensor mágico de la torre necesita tres engranajes perdidos. ¿Me los traes?'], pedido: 'Busca los tres engranajes (✦). Uno está al otro lado del Genil.', listo: '¡Perfecto! El ascensor sube y baja por plantas positivas y negativas. ¿Cuál está más alta?' },
        { v: 'romano', x: 5, y: 18, nombre: 'Mosaicista', dialogo: ['En época romana Écija se llamaba Astigi y tenía mosaicos espléndidos.'] },
        tienda(12, 19), { v: 'alumno', x: 24, y: 12, nombre: 'Javi', dialogo: ['Menos por menos da más. ¡No lo olvides en el campanario!', 'Esa valla junto a la torre se puede saltar (botón ⤴).'] }
      ],
      fragmentos: [[29, 4], [6, 10], [21, 21]], enemigo2: [4, 21], minijefe: [12, 9], jefe: [18, 8], obra: 0,
      cofres: [c('c3-a', 30, 20), c('c3-b', 25, 8, 20), c('c3-c', 24, 22)] });
  })();

  /* ---------- 4 · Marchena: villa amurallada entre olivares ---------- */
  (function () {
    var m = base('.', 44);
    for (var y = 14; y <= 22; y += 2) for (var x = 1; x <= 30; x += 2) m.t[y][x] = 'o';
    m.rect(1, 9, 30, 1, 'M').rect(1, 10, 30, 3, '.').rect(1, 12, 30, 1, ':').rect(15, 10, 1, 14, ':');
    m.rect(18, 2, 8, 5, '=').rect(10, 7, 20, 1, ':'); salida(m, 15);
    m.rect(1, 13, 30, 1, '.'); m.rect(28, 3, 1, 3, 'm');
    mundo({ id: 4, mapa: m, inicio: [15, 21],
      edificios: [
        { t: 'almazara', x: 2, y: 10, nombre: 'Almazara tradicional', obra: true, texto: 'En la almazara se muele la aceituna para obtener el aceite de oliva.' },
        { t: 'puerta', x: 13, y: 6, paso: [2], nombre: 'Puerta de Sevilla de Marchena', texto: 'Puerta de la antigua muralla, también llamada Arco de la Rosa.' },
        { t: 'iglesia', x: 3, y: 1, nombre: 'Iglesia de San Juan', texto: 'Simplifract ha robado el libro de las cosechas y se esconde junto a la iglesia.' },
        { t: 'casa', x: 9, y: 2 }, { t: 'palacio', x: 23, y: 10, nombre: 'Casa de labor' }, { t: 'fuente', x: 21, y: 3 }
      ],
      vecinos: [
        { v: 'agricultor', x: 14, y: 11, nombre: 'Aceitunero Paco', aventura: 1, dialogo: ['El olivar de Marchena se ha dividido en parcelas desiguales.', 'Encuentra los tres sacos de aceitunas perdidos y te enseño a repartir la cosecha.'], pedido: 'Busca los tres sacos (✦).', listo: 'Muy bien. Ahora dime qué fracción de la parcela se ha cosechado.' },
        { v: 'molinera', x: 7, y: 11, nombre: 'Maestra almazarera', dialogo: ['Para sumar fracciones de aceite hay que usar el mismo tamaño de jarra: el común denominador.'] },
        tienda(19, 7), { v: 'alumna', x: 20, y: 11, nombre: 'Carmen', dialogo: ['6/8 y 3/4 son la misma cantidad. ¡Es la misma parcela cortada de otra forma!'] }
      ],
      fragmentos: [[3, 15], [27, 19], [24, 1]], enemigo2: [8, 19], minijefe: [24, 17], jefe: [5, 8], obra: 0,
      cofres: [c('c4-a', 2, 21), c('c4-b', 29, 4, 20), c('c4-c', 29, 13)] });
  })();

  /* ---------- 5 · Estepa: el cerro de San Cristóbal ---------- */
  (function () {
    var m = base('.', 55);
    m.rect(17, 1, 14, 7, '.').rect(17, 8, 14, 1, 'r').rect(16, 1, 1, 8, 'r'); m.t[8][20] = ':';
    m.rect(20, 9, 1, 3, ':').rect(1, 12, 30, 1, ':').rect(15, 13, 1, 11, ':');
    for (var y = 15; y <= 21; y += 2) for (var x = 18; x <= 30; x += 3) m.t[y][x] = 'o';
    m.rect(6, 14, 7, 4, '='); m.rect(1, 19, 12, 3, 'c'); salida(m, 15);
    m.rect(28, 1, 1, 2, 'f');
    mundo({ id: 5, mapa: m, inicio: [15, 21],
      edificios: [
        { t: 'torre_homenaje', x: 24, y: 1, nombre: 'Torre del Homenaje', texto: 'Desde el cerro, la torre domina la campiña: a Estepa la llaman «el Balcón de Andalucía».' },
        { t: 'iglesia', x: 18, y: 1, nombre: 'Iglesia de Santa María', texto: 'Iglesia junto al castillo, en lo alto del Cerro de San Cristóbal.' },
        { t: 'ermita', x: 3, y: 2, nombre: 'Ermita del camino', obra: true, texto: 'Hay que reconstruir su plano a escala.' },
        { t: 'puesto', x: 4, y: 9, nombre: 'Obrador de mantecados', o: { toldo: '#d9a441', genero: '#e8c890' }, texto: 'Estepa es famosa por sus mantecados y polvorones.' },
        { t: 'casa', x: 9, y: 2 }, { t: 'casa', x: 9, y: 7 }, { t: 'fuente', x: 8, y: 15 }
      ],
      vecinos: [
        { v: 'pastelera', x: 7, y: 11, nombre: 'Maestra pastelera', aventura: 1, dialogo: ['¡Se me han perdido tres recetas de mantecados! Están escritas en proporción.', 'Tráemelas y aprenderás a calcular precios proporcionales.'], pedido: 'Busca las tres recetas (✦). Una está en lo alto del cerro.', listo: '¡Gracias! Si 3 cajas cuestan tanto... ¿cuánto cuestan 5?' },
        { v: 'agricultor', x: 21, y: 10, nombre: 'Topógrafo', dialogo: ['El camino sube al cerro por este paso entre las rocas.', 'En un mapa a escala 1:100 000, 1 cm son 100 000 cm reales, es decir, 1 km.'] },
        tienda(12, 13, 'jardinero'), { v: 'alumno', x: 27, y: 12, nombre: 'Pablo', dialogo: ['El 25 % es la cuarta parte. ¡Porcentajín intenta liarte con las rebajas!'] }
      ],
      fragmentos: [[29, 5], [2, 17], [13, 4]], enemigo2: [8, 20], minijefe: [24, 18], jefe: [25, 7], obra: 2,
      cofres: [c('c5-a', 30, 1, 20), c('c5-b', 1, 10), c('c5-c', 29, 22)] });
  })();

  /* ---------- 6 · Osuna: la Universidad y la calle San Pedro ---------- */
  (function () {
    var m = base('.', 66);
    m.rect(9, 8, 22, 1, 'h'); m.t[8][15] = ':'; m.t[8][20] = '.';
    m.rect(15, 6, 1, 3, ':').rect(1, 12, 30, 1, ':').rect(15, 9, 1, 15, ':');
    m.rect(1, 18, 12, 5, 's').salpicar('r', 1, 18, 12, 5, 8, 2).rect(18, 18, 13, 5, 'c'); salida(m, 15);
    m.rect(1, 7, 4, 1, 'm');
    mundo({ id: 6, mapa: m, inicio: [15, 21],
      edificios: [
        { t: 'universidad', x: 12, y: 1, paso: [3], nombre: 'Antigua Universidad de Osuna', obra: true, texto: 'La Universidad de Osuna se fundó en el siglo XVI. Sus pergaminos esconden expresiones algebraicas.' },
        { t: 'colegiata', x: 21, y: 1, nombre: 'Colegiata de Osuna', texto: 'Gran templo renacentista del siglo XVI. Polinomio Mutante transforma aquí los manuscritos.' },
        { t: 'palacio', x: 3, y: 13, nombre: 'Palacio de la calle San Pedro', texto: 'La calle San Pedro reúne portadas barrocas muy admiradas.' },
        { t: 'palacio', x: 9, y: 13, nombre: 'Casa señorial' }, { t: 'palacio', x: 18, y: 13, nombre: 'Portada barroca' }, { t: 'palacio', x: 24, y: 13, nombre: 'Palacio' },
        { t: 'casa', x: 2, y: 9 }, { t: 'casa', x: 5, y: 9 }, { t: 'fuente', x: 11, y: 9 }
      ],
      vecinos: [
        { v: 'maestra', x: 13, y: 6, nombre: 'Bibliotecaria', aventura: 1, dialogo: ['Los pergaminos de la Universidad están codificados con letras que valen números.', 'Recupera las tres hojas sueltas y te enseño a descifrarlas.'], pedido: 'Busca las tres hojas (✦).', listo: 'Ahora traduce: «el doble de un número más tres».' },
        { v: 'alumno', x: 8, y: 11, nombre: 'Estudiante', dialogo: ['3x + 5x = 8x porque son términos semejantes. Pero 3x + 5 no se puede juntar.'] },
        tienda(17, 11), { v: 'abuela', x: 26, y: 17, nombre: 'Doña Úrsula', dialogo: ['Un signo menos delante de un paréntesis cambia el signo de todo lo de dentro.'] }
      ],
      fragmentos: [[3, 20], [29, 10], [19, 4]], enemigo2: [7, 20], minijefe: [24, 20], jefe: [24, 7], obra: 0,
      cofres: [c('c6-a', 1, 1, 20), c('c6-b', 30, 22), c('c6-c', 29, 3)] });
  })();

  /* ---------- 7 · Triana: el barrio, el río y el puente ---------- */
  (function () {
    var m = base('.', 77);
    m.rect(19, 1, 5, 22, '~').rect(19, 11, 5, 2, 'B').rect(17, 1, 2, 22, ':').rect(1, 12, 16, 1, ':').rect(24, 11, 7, 2, ':');
    m.rect(7, 9, 8, 6, 'a').rect(12, 15, 1, 9, ':'); salida(m, 12);
    m.salpicar('P', 24, 14, 7, 8, 6, 5); m.salpicar('T', 1, 15, 10, 6, 5, 8);
    m.rect(28, 2, 1, 1, 'f'); m.rect(27, 1, 1, 2, 'f'); m.rect(27, 3, 3, 1, 'f');
    mundo({ id: 7, mapa: m, inicio: [12, 21],
      edificios: [
        { t: 'alfareria', x: 3, y: 2, nombre: 'Alfarería trianera', obra: true, texto: 'Triana es famosa por su cerámica y sus azulejos.' },
        { t: 'alfareria', x: 9, y: 2, nombre: 'Taller de azulejos' }, { t: 'casa', x: 13, y: 2 }, { t: 'casa', x: 2, y: 16 }, { t: 'casa', x: 6, y: 17 },
        { t: 'alcazar', x: 24, y: 4, nombre: 'Torno del Despeje', texto: 'Despejador Oscuro protege el último torno, al otro lado del puente.' },
        { t: 'fuente', x: 10, y: 11 }
      ],
      vecinos: [
        { v: 'alfarero', x: 5, y: 6, nombre: 'Maestro alfarero', aventura: 1, dialogo: ['La balanza del viejo puente solo responde a igualdades equilibradas.', 'Tráeme las tres pesas perdidas y te enseño a equilibrarla.'], pedido: 'Busca las tres pesas (✦).', listo: 'Lo que hagas en un platillo, hazlo en el otro: x + 3 = 7...' },
        { v: 'molinera', x: 16, y: 12, nombre: 'Vecina de Triana', dialogo: ['El Puente de Isabel II, el «puente de Triana», une el barrio con Sevilla desde el siglo XIX.'] },
        tienda(8, 15), { v: 'alumna', x: 27, y: 13, nombre: 'Rocío', dialogo: ['Para comprobar una ecuación, sustituye la solución: los dos lados deben dar lo mismo.'] }
      ],
      fragmentos: [[2, 10], [29, 20], [16, 2]], enemigo2: [4, 21], minijefe: [27, 18], jefe: [26, 9], obra: 0,
      cofres: [c('c7-a', 1, 22), c('c7-b', 28, 2, 20), c('c7-c', 15, 20)] });
  })();

  /* ---------- 8 · Alcalá de Guadaíra: el río de los molinos ---------- */
  (function () {
    var m = base('.', 88);
    for (var x = 1; x <= 30; x++) { var y = 14 + (Math.sin(x / 4) > .3 ? 1 : 0); m.rect(x, y, 1, 2, '~'); }
    m.rect(8, 13, 2, 4, 'B').rect(22, 13, 2, 4, 'B');
    m.rect(8, 6, 2, 7, ':').rect(8, 6, 15, 1, ':').rect(22, 7, 1, 6, ':').rect(15, 17, 1, 7, ':').rect(8, 17, 16, 1, ':');
    m.salpicar('T', 1, 1, 18, 5, 10, 6); m.rect(17, 19, 6, 3, '='); salida(m, 15);
    m.rect(1, 20, 3, 1, 'm');
    mundo({ id: 8, mapa: m, inicio: [15, 21],
      edificios: [
        { t: 'molino', x: 3, y: 10, nombre: 'Molino del Guadaíra', obra: true, texto: 'Alcalá de Guadaíra tuvo muchos molinos harineros a orillas del río: de ahí su fama de pueblo panadero.' },
        { t: 'molino', x: 13, y: 10, nombre: 'Molino harinero' }, { t: 'molino', x: 26, y: 17, nombre: 'Molino de la orilla sur' },
        { t: 'castillo', x: 21, y: 0, nombre: 'Castillo de Alcalá', texto: 'Castillo de origen almohade sobre el río. Parábola Vórtice retuerce aquí el cauce.' },
        { t: 'puesto', x: 4, y: 18, nombre: 'Panadería', o: { toldo: '#d9a441', genero: '#d8a050' } }, { t: 'casa', x: 9, y: 18 }, { t: 'casa', x: 25, y: 9 }
      ],
      vecinos: [
        { v: 'molinera', x: 7, y: 9, nombre: 'Molinera', aventura: 1, dialogo: ['Las ruedas del molino giran al ritmo de las gráficas.', 'Encuentra las tres palas perdidas de la rueda y te enseño el plano de coordenadas.'], pedido: 'Busca las tres palas (✦).', listo: 'Primero la x (izquierda-derecha), luego la y (arriba-abajo). ¿En qué cuadrante está?' },
        { v: 'agricultor', x: 7, y: 20, nombre: 'Panadero', dialogo: ['El pan de Alcalá era famoso en Sevilla. Cuanto más trigo, más pan: ¡una función creciente!'] },
        tienda(18, 18), { v: 'alumno', x: 24, y: 12, nombre: 'Dani', dialogo: ['Si en y = mx + n la m es negativa, la recta baja.'] }
      ],
      fragmentos: [[2, 3], [29, 11], [12, 21]], enemigo2: [13, 7], minijefe: [27, 21], jefe: [23, 6], obra: 0,
      cofres: [c('c8-a', 1, 21, 20), c('c8-b', 30, 2), c('c8-c', 18, 9)] });
  })();

  /* ---------- 9 · Itálica: la ciudad romana y Santiponce ---------- */
  (function () {
    var m = base('s', 99);
    m.rect(8, 1, 1, 15, 'x').rect(16, 1, 1, 23, ':').rect(1, 8, 30, 1, 'x').rect(1, 15, 30, 1, 'x');
    [[7, 3], [9, 3], [7, 6], [9, 6], [12, 7], [20, 7], [12, 9], [20, 9]].forEach(function (p) { m.t[p[1]][p[0]] = 'k'; });
    m.rect(1, 16, 30, 7, '.').salpicar(',', 1, 16, 30, 7, 15, 3); m.rect(1, 16, 15, 1, ':'); salida(m, 16);
    m.rect(29, 1, 1, 4, 'm');
    mundo({ id: 9, mapa: m, inicio: [16, 21],
      edificios: [
        { t: 'columnas', x: 3, y: 2, nombre: 'Ruinas de Itálica', obra: true, texto: 'Itálica fue fundada por Escipión en el 206 a. C., junto a la actual Santiponce.' },
        { t: 'columnas', x: 10, y: 2, nombre: 'Templo romano' }, { t: 'columnas', x: 2, y: 10, nombre: 'Casa de los Pájaros', texto: 'Una de las casas romanas de Itálica, con mosaicos de aves.' },
        { t: 'anfiteatro', x: 21, y: 1, nombre: 'Anfiteatro de Itálica', texto: 'Uno de los mayores anfiteatros del mundo romano. Gráfico Tramposo controla la votación.' },
        { t: 'casa', x: 2, y: 18, o: { cal: '#f0e4cc', teja: '#a8503a' } }, { t: 'casa', x: 6, y: 18, o: { cal: '#f0e4cc', teja: '#a8503a' } },
        { t: 'iglesia', x: 24, y: 16, nombre: 'Monasterio de San Isidoro del Campo', texto: 'Monasterio fundado en la Edad Media en Santiponce, junto a las ruinas.' }
      ],
      vecinos: [
        { v: 'romano', x: 14, y: 9, nombre: 'Organizador del censo', aventura: 1, dialogo: ['Necesito contar a los espectadores del anfiteatro, ¡pero se han perdido las tablillas!', 'Tráeme las tres tablillas y ordenaremos los datos.'], pedido: 'Busca las tres tablillas (✦).', listo: 'Veamos qué dato se repite más en el censo.' },
        { v: 'romano', x: 19, y: 12, nombre: 'Historiadora', dialogo: ['Los emperadores Trajano y Adriano están ligados a Itálica.'] },
        tienda(10, 17), { v: 'alumna', x: 13, y: 20, nombre: 'Marta', dialogo: ['Desconfía de los gráficos cuyo eje no empieza en cero.'] }
      ],
      fragmentos: [[2, 7], [29, 12], [21, 20]], enemigo2: [5, 13], minijefe: [27, 11], jefe: [25, 7], obra: 0,
      cofres: [c('c9-a', 1, 1), c('c9-b', 30, 22), c('c9-c', 30, 2, 20)] });
  })();

  /* ---------- 10 · Sevilla: Giralda, río y laberinto del Alcázar ---------- */
  (function () {
    var m = base('.', 110);
    m.rect(1, 1, 3, 22, '~').rect(4, 1, 1, 22, ':');
    m.rect(5, 12, 17, 1, ':').rect(10, 9, 1, 15, ':').rect(5, 8, 6, 3, 'a'); salida(m, 10);
    [[6, 13], [13, 13], [17, 13], [6, 11]].forEach(function (p) { m.t[p[1]][p[0]] = 'T'; });
    // jardines del Alcázar: laberinto de setos
    marco(m, 22, 6, 9, 9, 'h'); m.t[9][22] = '.'; m.rect(23, 7, 7, 7, ',');
    m.rect(24, 6, 1, 7, 'h'); m.rect(27, 8, 1, 7, 'h'); m.rect(21, 9, 1, 1, ':'); m.rect(21, 5, 10, 1, '.');
    m.rect(29, 7, 1, 1, ','); m.rect(5, 2, 2, 1, 'm');
    mundo({ id: 10, mapa: m, inicio: [10, 21],
      edificios: [
        { t: 'alcazar', x: 23, y: 1, nombre: 'Real Alcázar', obra: true, texto: 'Palacio con jardines y arcos de tradición mudéjar.' },
        { t: 'giralda', x: 12, y: 0, nombre: 'La Giralda', texto: 'Antiguo alminar almohade convertido en campanario de la Catedral, coronado por el Giraldillo.' },
        { t: 'colegiata', x: 15, y: 2, nombre: 'Catedral de Sevilla', texto: 'Una de las mayores catedrales góticas del mundo.' },
        { t: 'torre_oro', x: 5, y: 15, nombre: 'Torre del Oro', texto: 'Torre almohade junto al Guadalquivir.' },
        { t: 'plaza_espana', x: 19, y: 17, nombre: 'Plaza de España', texto: 'Construida para la Exposición Iberoamericana de 1929.' },
        { t: 'casa', x: 7, y: 2 }, { t: 'fuente', x: 7, y: 9 }
      ],
      vecinos: [
        { v: 'jardinero', x: 20, y: 9, nombre: 'Jardinero del Alcázar', aventura: 1, dialogo: ['En los jardines aparecen dados con rutas alternativas.', 'Encuentra los tres dados perdidos y aprenderemos qué puede pasar al lanzarlos.'], pedido: 'Busca los tres dados (✦).', listo: '¿Cuántos resultados distintos tiene un dado de seis caras?' },
        { v: 'abuela', x: 8, y: 13, nombre: 'Sevillana', dialogo: ['La probabilidad siempre está entre 0 (imposible) y 1 (seguro).', 'Ruleta Imposible se ha escondido al fondo del laberinto de setos.'] },
        tienda(12, 14), { v: 'alumno', x: 16, y: 15, nombre: 'Álvaro', dialogo: ['¡Último mundo! Ruleta Imposible guarda la décima pieza del Compás.'] }
      ],
      fragmentos: [[6, 6], [29, 16], [14, 20]], enemigo2: [8, 20], minijefe: [16, 19], jefe: [28, 12], obra: 0,
      cofres: [c('c10-a', 5, 1, 20), c('c10-b', 29, 13, 20), c('c10-c', 30, 22)] });
  })();

  root.GaloisMundos = { lista: M, W: W, H: H };
})(window);
