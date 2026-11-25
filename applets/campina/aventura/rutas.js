/* GALOIS LEGACY · Recorridos por paradas (1.7.0)
   Cada pueblo con recorrido deja de explorarse andando: el matemático va de parada en parada
   por el camino, y en cada una hay un monumento o sitio singular.
   Campos de cada parada:
     id, nombre, texto        lo que se lee al llegar (textos POR REVISAR por el profesor)
     img                      monumento en PNG (assets/patrimonio/...) o
     sprite                   edificio pixel del propio juego (E.edificio) si no hay PNG
     vecino                   nombre exacto del vecino de mundos.js que espera allí
     aventura                 etapa (1-5) obligatoria en esta parada (5 = jefe)
     cofres                   ids de cofres del saber de mundos.js (opcionales)
     encargo                  hito de un encargo opcional (vecino con «encargo» en mundos.js)
     tienda                   true: el puesto de pociones está aquí
     pregunta                 { q, ok, mal: [..], por } pregunta corta sobre el texto (obligatoria, sin nota)
     grupo                    paradas con el mismo grupo forman un cruce: se hacen en el orden que se elija
   Los monumentos en PNG vienen de jantoniolade-blip/pichu-lab (assets/galois-legacy/patrimonio). */
(function () {
  'use strict';
  var P = 'assets/patrimonio/';
  window.GaloisRutas = {
    1: [
      { id: 'ies', nombre: 'IES Alarifes Ruiz Florindo', sprite: 'ies', vecino: 'Inés, la aprendiz del taller', aventura: 1,
        texto: 'El patio del instituto, punto de partida. En la maqueta de Fuentes, la Fuente de la Reina está seca y faltan tres piezas de su conducción.' },
      { id: 'forja', nombre: 'La Forja de los Alarifes', sprite: 'alfareria', vecino: 'Alonso Ruiz Florindo', aventura: 2, cofres: ['c1-c'],
        texto: 'Taller de azulejos inspirado en el Centro de Interpretación del Barroco. Aquí se cortan y se cuecen los paños que cubren las fachadas.' },
      { id: 'san-jose', nombre: 'Iglesia de San José', img: P + 'fuentes-de-andalucia/iglesia-san-jose.png',
        texto: 'Una iglesia del casco histórico con fachada de ladrillo, portada barroca y espadaña con campanas. El barroco de Fuentes debe mucho a los alarifes de la familia Ruiz Florindo, que trabajaron en el siglo XVIII.',
        pregunta: { q: '¿En qué siglo trabajaron los alarifes Ruiz Florindo?', ok: 'En el siglo XVIII', mal: ['En el siglo XII', 'En el siglo XX'], por: 'El texto dice que trabajaron en el siglo XVIII, la época del barroco.' } },
      { id: 'santa-maria', nombre: 'Santa María la Blanca', img: P + 'fuentes-de-andalucia/santa-maria-la-blanca.png', cofres: ['c1-a'],
        texto: 'La parroquia de Fuentes, encalada y con una torre de ladrillo que se ve desde lejos. Desde aquí salió en procesión la Virgen del Rosario, patrona del pueblo junto a San Sebastián.',
        pregunta: { q: '¿Qué imagen salió en procesión desde Santa María la Blanca?', ok: 'La Virgen del Rosario', mal: ['María Auxiliadora', 'La Virgen de la Aurora'], por: 'La Virgen del Rosario es la patrona y salió desde esta parroquia.' } },
      { id: 'silo', grupo: 'cruce', nombre: 'El Silo · Mirador de la Campiña', img: P + 'fuentes-de-andalucia/silo.png', vecino: 'Lola del Silo', aventura: 3,
        texto: 'Donde se guardaba el grano, hoy se mira la Campiña. Desde la azotea se distingue el horizonte... y la dirección de la fuente.' },
      { id: 'carrera', grupo: 'cruce', nombre: 'Casas señoriales de la calle Carrera', img: P + 'fuentes-de-andalucia/calle-carrera.png', vecino: 'La Máscara del Reverso', aventura: 4, tienda: true,
        texto: 'Casas señoriales con portada, rejas y balcones de forja. En Carnaval, la calle Carrera es el escenario del mascareo: disfraces de ropa vieja, voces en falsete y coplas.' },
      { id: 'aurora', nombre: 'Capilla de Nuestra Señora de la Aurora', img: P + 'fuentes-de-andalucia/capilla-de-la-aurora.png', encargo: 'm1-lardero',
        texto: 'Una capilla pequeña y encalada, con una portada barroca muy decorada. Muy cerca, en el horno, Rosario prepara los entornaos para la comida del Jueves Lardero, que abre el Carnaval.',
        pregunta: { q: '¿Qué fiesta abre la comida del Jueves Lardero?', ok: 'El Carnaval', mal: ['La romería', 'San Juan'], por: 'El texto dice que el Jueves Lardero abre el Carnaval.' } },
      { id: 'monclova', nombre: 'Castillo de la Monclova', img: P + 'fuentes-de-andalucia/castillo-de-la-monclova.png',
        texto: 'Uno de los castillos del municipio, levantado en la campiña, fuera del casco urbano de Fuentes de Andalucía. Desde la azotea del Silo se distingue en el horizonte.',
        pregunta: { q: '¿Desde dónde se distingue el castillo de la Monclova?', ok: 'Desde la azotea del Silo', mal: ['Desde la torre de la iglesia', 'Desde la calle Carrera'], por: 'Desde la azotea del Silo se ve en el horizonte.' } },
      { id: 'hierro', nombre: 'Castillo del Hierro', img: P + 'fuentes-de-andalucia/castillo-del-hierro.png', cofres: ['c1-b'], encargo: 'm1-romeria',
        texto: 'Un castillo de piedra con torre almenada. Las torres y castillos de la campiña vigilaban los caminos y los campos de cereal. Por el camino pasa la romería hacia la ermita de María Auxiliadora.',
        pregunta: { q: '¿Qué vigilaban las torres y castillos de la campiña?', ok: 'Los caminos y los campos de cereal', mal: ['El mar y los puertos', 'Las minas de oro'], por: 'Vigilaban los caminos y los campos de cereal de la campiña.' } },
      { id: 'fuente-reina', nombre: 'Fuente de la Reina', img: P + 'fuentes-de-andalucia/fuente-de-la-reina.png', aventura: 5,
        texto: 'A las afueras del pueblo. Sus conducciones recogían el agua del cerro hasta el abrevadero. Con las tres piezas colocadas, la compuerta espera: aquí aguarda el jefe.' }
    ],
    2: [
      { id: 'murallas', nombre: 'Murallas de Carmona', img: P + 'carmona/murallas.png', vecino: 'Guardia de la muralla', aventura: 1, cofres: ['c2-a'],
        texto: 'Recinto defensivo que protegió la ciudad desde la Antigüedad. Se conservan tramos de muralla y varias puertas monumentales.' },
      { id: 'necropolis', nombre: 'Necrópolis romana', sprite: 'necropolis', aventura: 2, charla: ['Arqueóloga Julia'],
        texto: 'Cementerio de época romana con tumbas excavadas en la roca, como la Tumba de Servilia o la del Elefante. Es uno de los conjuntos arqueológicos más importantes de Andalucía.' },
      { id: 'cordoba', nombre: 'Puerta de Córdoba', img: P + 'carmona/puerta-de-cordoba.png', cofres: ['c2-b'], tienda: true, charla: ['Lucía'],
        texto: 'Puerta de origen romano, reformada en la Edad Moderna con aspecto clásico. Se abría al camino que llevaba hacia Córdoba.',
        pregunta: { q: '¿Cuál es el origen de la Puerta de Córdoba?', ok: 'Romano', mal: ['Del siglo XX', 'Barroco, del siglo XVIII'], por: 'Es de origen romano, aunque se reformó en la Edad Moderna.' } },
      { id: 'puerta-sevilla', nombre: 'Puerta de Sevilla', sprite: 'puerta', aventura: 3,
        texto: 'Puerta fortificada de origen romano, reformada en época islámica y cristiana. Es uno de los símbolos de Carmona y la entrada histórica desde el camino de Sevilla.' },
      { id: 'casa', nombre: 'Casa señorial', sprite: 'palacio', aventura: 4, cofres: ['c2-c'],
        texto: 'Una casa señorial del casco histórico, con portada de piedra. En una de sus salas se esconden los factores que guardan el último sello.' },
      { id: 'alcazar', nombre: 'Alcázar de la Puerta de Sevilla', img: P + 'carmona/puerta-de-sevilla.png', aventura: 5,
        texto: 'Fortaleza levantada sobre la Puerta de Sevilla de Carmona. Desde su torre se domina la vega y los caminos que llegaban a la ciudad. Aquí custodia Prímox el último sello.' }
    ],
    3: [
      { id: 'salon', nombre: 'Plaza de España · «el Salón»', sprite: 'fuente', vecino: 'Doña Astigi', aventura: 1, cofres: ['c3-a'],
        texto: 'Plaza mayor de Écija, conocida popularmente como «el Salón». Es el centro de la vida de la ciudad y bajo ella se han hallado restos de su pasado.' },
      { id: 'benameji', nombre: 'Palacio de Benamejí', img: P + 'ecija/palacio-benameji.png', aventura: 2, charla: ['Mosaicista'],
        texto: 'Palacio barroco del siglo XVIII. Hoy guarda el museo histórico de la ciudad, donde se exponen mosaicos de Astigi, el nombre romano de Écija.' },
      { id: 'penaflor', nombre: 'Palacio de Peñaflor', img: P + 'ecija/palacio-penaflor.png', cofres: ['c3-b'], tienda: true, charla: ['Javi'],
        texto: 'Palacio barroco famoso por su larguísimo balcón de forja y su fachada pintada. Por eso muchos lo llaman «el palacio del balcón largo».',
        pregunta: { q: '¿Por qué es famoso el Palacio de Peñaflor?', ok: 'Por su larguísimo balcón de forja', mal: ['Por su torre de azulejos', 'Por sus mosaicos romanos'], por: 'Su balcón de forja es tan largo que lo llaman «el palacio del balcón largo».' } },
      { id: 'san-juan', nombre: 'Torre de San Juan', img: P + 'ecija/torre-san-juan.png', aventura: 3,
        texto: 'Campanario barroco del siglo XVIII, decorado con azulejos de colores. Es una de las torres más admiradas del horizonte de Écija, «la ciudad de las torres».' },
      { id: 'santa-cruz', nombre: 'Torre de Santa Cruz', sprite: 'torre_barroca', aventura: 4, cofres: ['c3-c'],
        texto: 'Torre de la iglesia de Santa Cruz, parte de la ruta de las once torres ecijanas. Sus campanas y remates forman parte del perfil barroco de la ciudad.' },
      { id: 'reloj', nombre: 'Templo del reloj', sprite: 'iglesia', aventura: 5,
        texto: 'Paréntesis Maldito ha convertido el reloj de la torre en una trampa. Para vencerlo hay que dominar los signos de los números enteros.' }
    ],
    4: [
      { id: 'arco', nombre: 'Arco de la Rosa', img: P + 'marchena/arco-de-la-rosa.png', vecino: 'Aceitunero Paco', aventura: 1, cofres: ['c4-a'],
        texto: 'Puerta de la antigua muralla de Marchena, también conocida como Puerta de Sevilla. Da paso al casco histórico de la villa.' },
      { id: 'casa-labor', nombre: 'Casa de labor', sprite: 'palacio', aventura: 2, charla: ['Carmen'],
        texto: 'Una casa de labor de la campiña, donde se guardan los aperos y se reparte la cosecha.' },
      { id: 'olivar', nombre: 'Olivar y cortijo', img: P + 'marchena/olivar-cortijo.png', cofres: ['c4-b'], tienda: true,
        texto: 'El olivar ocupa buena parte de la campiña sevillana. De la aceituna se obtienen aceite y aceituna de mesa, de la que la provincia de Sevilla es gran productora.',
        pregunta: { q: '¿Qué se obtiene de la aceituna?', ok: 'Aceite y aceituna de mesa', mal: ['Harina y pan', 'Vino y vinagre'], por: 'De la aceituna salen el aceite de oliva y la aceituna de mesa.' } },
      { id: 'almazara', nombre: 'Almazara tradicional', sprite: 'almazara', aventura: 3, charla: ['Maestra almazarera'],
        texto: 'En la almazara se lava, muele y prensa la aceituna para obtener el aceite de oliva. Antes se usaban molinos de piedra y prensas de viga; hoy, máquinas modernas.' },
      { id: 'murallas', nombre: 'Murallas de Marchena', sprite: 'puerta', aventura: 4, cofres: ['c4-c'],
        texto: 'Restos del recinto amurallado medieval que protegía Marchena. Sus tramos y puertas recuerdan la importancia de la villa en la campiña.' },
      { id: 'san-juan', nombre: 'Iglesia de San Juan Bautista', img: P + 'marchena/san-juan-bautista.png', aventura: 5,
        texto: 'Gran iglesia gótico-mudéjar del casco histórico, que guarda una colección de pinturas de Zurbarán. Simplifract ha robado el libro de las cosechas y se esconde aquí.' }
    ],
    5: [
      { id: 'obrador', nombre: 'Obrador de mantecados', img: P + 'estepa/obrador-de-mantecados.png', vecino: 'Maestra pastelera', aventura: 1, cofres: ['c5-a'],
        texto: 'El mantecado es un dulce navideño de manteca, harina y azúcar, famoso en toda España. Su elaboración es una tradición artesanal e industrial muy importante en Estepa.' },
      { id: 'santa-maria', nombre: 'Iglesia de Santa María', sprite: 'iglesia', aventura: 2, charla: ['Topógrafo'],
        texto: 'Iglesia junto al castillo, en lo alto del Cerro de San Cristóbal, sobre el que se asentó la Estepa histórica.' },
      { id: 'victoria', nombre: 'Torre de la Victoria', img: P + 'estepa/torre-de-la-victoria.png', cofres: ['c5-b'], tienda: true,
        texto: 'Esbelta torre barroca del siglo XVIII, lo que queda de un antiguo convento. Con unos 50 metros de altura, se ve desde toda la comarca.',
        pregunta: { q: '¿De qué época es la Torre de la Victoria?', ok: 'Barroca, del siglo XVIII', mal: ['Romana', 'Del siglo XX'], por: 'Es una torre barroca del siglo XVIII.' } },
      { id: 'ermita', nombre: 'Ermita del camino', sprite: 'ermita', aventura: 3,
        texto: 'Una ermita en el camino del cerro. Hay que reconstruir su plano a escala: cada centímetro del papel representa una distancia real.' },
      { id: 'mercado', nombre: 'Mercado de la plaza', sprite: 'puesto', aventura: 4, cofres: ['c5-c'], charla: ['Pablo'],
        texto: 'Puestos de la plaza con mantecados y polvorones. El polvorón lleva almendra y se envuelve tradicionalmente en papel de seda. Hoy anuncian rebajas... ¿serán de verdad?' },
      { id: 'homenaje', nombre: 'Torre del Homenaje', img: P + 'estepa/torre-del-homenaje.png', aventura: 5,
        texto: 'Torre del castillo medieval de Estepa, en lo alto del Cerro de San Cristóbal. Por sus vistas, a Estepa la llaman «el Balcón de Andalucía».' }
    ],
    6: [
      { id: 'san-pedro', nombre: 'Calle San Pedro', sprite: 'palacio', vecino: 'Bibliotecaria', aventura: 1, cofres: ['c6-a'],
        texto: 'Calle de Osuna famosa por sus palacios y portadas barrocas. Pasear por ella es recorrer la arquitectura señorial de la villa.' },
      { id: 'casa', nombre: 'Casa señorial', sprite: 'palacio', aventura: 2, charla: ['Doña Úrsula'],
        texto: 'Una casa señorial con portada barroca. En sus paredes alguien ha dejado versos cifrados con letras que esconden números.' },
      { id: 'ducal', nombre: 'Palacio de la villa ducal', sprite: 'palacio', cofres: ['c6-b'], tienda: true,
        texto: 'Osuna fue sede del ducado del mismo nombre, uno de los más poderosos de España. Sus palacios e iglesias recuerdan aquella época.',
        pregunta: { q: '¿Cómo era el ducado de Osuna?', ok: 'Uno de los más poderosos de España', mal: ['Uno de los más pequeños de España', 'Un ducado inventado para el juego'], por: 'El ducado de Osuna fue uno de los más poderosos de España.' } },
      { id: 'universidad', nombre: 'Antigua Universidad', img: P + 'osuna/antigua-universidad.png', aventura: 3, charla: ['Estudiante'],
        texto: 'Universidad fundada en el siglo XVI por el conde de Ureña. Su edificio, con torres en las esquinas y patio central, domina Osuna desde lo alto.' },
      { id: 'canteras', nombre: 'Coto de las Canteras', img: P + 'osuna/coto-de-las-canteras.png', aventura: 4, cofres: ['c6-c'],
        texto: 'Antiguas canteras de piedra explotadas desde época romana. Sus paredes talladas forman hoy un paisaje singular junto a la localidad.' },
      { id: 'colegiata', nombre: 'Colegiata de la Asunción', img: P + 'osuna/colegiata.png', aventura: 5,
        texto: 'Gran templo renacentista del siglo XVI, junto a la antigua universidad. Guarda obras de arte y el panteón de los duques de Osuna.' }
    ],
    7: [
      { id: 'ceramica', nombre: 'Taller de cerámica', img: P + 'triana/taller-de-ceramica.png', vecino: 'Maestro alfarero', aventura: 1, cofres: ['c7-a'],
        texto: 'Triana es desde hace siglos un gran centro alfarero. Sus talleres han dado azulejos, platos y piezas de cerámica que decoran toda Sevilla.' },
      { id: 'azulejos', nombre: 'Taller de azulejos', sprite: 'alfareria', aventura: 2, charla: ['Rocío'],
        texto: 'En este taller se pesan el barro y los esmaltes con una balanza: si los dos platillos no quedan iguales, la pieza no sale bien.' },
      { id: 'carmen', nombre: 'Capilla del Carmen', img: P + 'triana/capilla-del-carmen.png', cofres: ['c7-b'], tienda: true,
        texto: 'Pequeña capilla de ladrillo y azulejo a la entrada del puente, obra del arquitecto Aníbal González. Por su forma, en el barrio la llaman «el Mechero».',
        pregunta: { q: '¿Cómo llaman en Triana a la capilla del Carmen?', ok: '«El Mechero»', mal: ['«La Giralda chica»', '«El Faro»'], por: 'Por su forma, la llaman «el Mechero».' } },
      { id: 'alfareria', nombre: 'Alfarería trianera', sprite: 'alfareria', aventura: 3,
        texto: 'Triana es famosa por su cerámica y sus azulejos. Esta alfarería necesita un peso exacto para volver a funcionar.' },
      { id: 'puente', nombre: 'Puente de Isabel II', img: P + 'triana/puente-isabel-ii.png', aventura: 4, cofres: ['c7-c'], charla: ['Vecina de Triana'],
        texto: 'Inaugurado en 1852, fue el primer puente fijo de hierro sobre el Guadalquivir en Sevilla. Une el barrio de Triana con el centro de la ciudad.' },
      { id: 'torno', nombre: 'Torno del Despeje', sprite: 'alcazar', aventura: 5,
        texto: 'Al otro lado del puente, Despejador Oscuro protege el último torno. Solo quien sepa despejar la incógnita podrá recuperarlo.' }
    ],
    8: [
      { id: 'san-juan', nombre: 'Molino de San Juan', img: P + 'alcala-de-guadaira/molino-san-juan.png', vecino: 'Molinera', aventura: 1, cofres: ['c8-a'],
        texto: 'El agua del río mueve la rueda y la rueda mueve la piedra que muele el grano. Así funcionaban los molinos hidráulicos del Guadaíra.' },
      { id: 'panaderia', nombre: 'Panadería', sprite: 'puesto', aventura: 2, charla: ['Panadero'],
        texto: 'A Alcalá se la conoció como «Alcalá de los Panaderos» porque abastecía de pan a Sevilla. La tradición panadera sigue viva en el pueblo.' },
      { id: 'benarosa', nombre: 'Molino de Benarosa', img: P + 'alcala-de-guadaira/molino-benarosa.png', cofres: ['c8-b'], tienda: true, charla: ['Dani'],
        texto: 'Durante siglos, decenas de molinos harineros aprovecharon la corriente del Guadaíra. Molían el trigo con el que se hacía el famoso pan de Alcalá.',
        pregunta: { q: '¿Qué molían los molinos del Guadaíra?', ok: 'Trigo, para hacer pan', mal: ['Aceitunas, para hacer aceite', 'Piedra, para hacer casas'], por: 'Molían el trigo del famoso pan de Alcalá.' } },
      { id: 'molino', nombre: 'Molino del Guadaíra', sprite: 'molino', aventura: 3,
        texto: 'Alcalá de Guadaíra tuvo muchos molinos harineros a orillas del río. Este se ha parado: hay que ponerlo a punto con la subida de la corriente.' },
      { id: 'orilla', nombre: 'Río Guadaíra', sprite: 'molino', aventura: 4, cofres: ['c8-c'],
        texto: 'Afluente del Guadalquivir que atraviesa Alcalá de Guadaíra. Sus orillas, con pinares y molinos, forman un paisaje muy valioso.' },
      { id: 'castillo', nombre: 'Castillo de Alcalá de Guadaíra', img: P + 'alcala-de-guadaira/castillo.png', aventura: 5,
        texto: 'Castillo de origen almohade, uno de los mayores recintos fortificados de la provincia. Se alza sobre el río Guadaíra; Parábola Vórtice retuerce aquí el cauce.' }
    ],
    9: [
      { id: 'san-isidoro', nombre: 'Monasterio de San Isidoro del Campo', sprite: 'iglesia', vecino: 'Organizador del censo', aventura: 1, cofres: ['c9-a'],
        texto: 'Monasterio fundado en la Edad Media en Santiponce, la localidad sevillana junto a la que se conservan las ruinas de Itálica.' },
      { id: 'termas', nombre: 'Termas romanas', img: P + 'italica/termas.png', aventura: 2, charla: ['Historiadora'],
        texto: 'Las termas eran los baños públicos de la ciudad romana, con salas de agua fría, templada y caliente. También eran un lugar de reunión.' },
      { id: 'pajaros', nombre: 'Casa de los Pájaros', img: P + 'italica/casa-de-los-pajaros.png', cofres: ['c9-b'], tienda: true, charla: ['Marta'],
        texto: 'Una de las casas romanas de Itálica. Su nombre viene de sus mosaicos de aves: los suelos se decoraban con teselas que formaban figuras geométricas, aves y escenas mitológicas.',
        pregunta: { q: '¿De dónde viene el nombre de la Casa de los Pájaros?', ok: 'De sus mosaicos de aves', mal: ['De un palomar en el tejado', 'De un emperador llamado Pájaro'], por: 'Se llama así por sus mosaicos de aves.' } },
      { id: 'ruinas', nombre: 'Ruinas de Itálica', sprite: 'columnas', aventura: 3,
        texto: 'Itálica fue fundada por Escipión en el 206 a. C., junto a la actual Santiponce. Aquí hay que recomponer los mosaicos de barras.' },
      { id: 'templo', nombre: 'Templo romano', sprite: 'columnas', aventura: 4, cofres: ['c9-c'],
        texto: 'Marco Ulpio Trajano nació en Itálica en el año 53 y fue el primer emperador romano nacido fuera de Italia. Adriano, muy ligado a la ciudad, la embelleció con nuevos barrios.' },
      { id: 'anfiteatro', nombre: 'Anfiteatro de Itálica', img: P + 'italica/anfiteatro.png', aventura: 5,
        texto: 'Uno de los mayores anfiteatros del Imperio romano, con capacidad para unos 25 000 espectadores. Gráfico Tramposo controla aquí la votación.' }
    ],
    10: [
      { id: 'jardines', nombre: 'Jardines del Alcázar', img: P + 'sevilla/jardines-del-alcazar.png', vecino: 'Jardinero del Alcázar', aventura: 1, cofres: ['c10-a'],
        texto: 'El Real Alcázar es un conjunto de palacios y jardines usado por los reyes durante siglos, con arte mudéjar. Es Patrimonio de la Humanidad junto con la Catedral y el Archivo de Indias.' },
      { id: 'torre-oro', nombre: 'Torre del Oro', sprite: 'torre_oro', aventura: 2, charla: ['Sevillana'],
        texto: 'Torre almohade junto al Guadalquivir. Vigilaba el río y el puerto de la ciudad.' },
      { id: 'giralda', nombre: 'La Giralda', img: P + 'sevilla/giralda.png', cofres: ['c10-b'], tienda: true,
        texto: 'Antiguo alminar almohade del siglo XII, al que en el siglo XVI se añadió el campanario renacentista. Mide unos 100 metros y la corona el Giraldillo.',
        pregunta: { q: '¿Qué corona la Giralda?', ok: 'El Giraldillo', mal: ['Una cúpula de azulejos', 'Una estrella dorada'], por: 'En lo más alto está el Giraldillo.' } },
      { id: 'doncellas', nombre: 'Patio de las Doncellas', img: P + 'sevilla/patio-de-las-doncellas.png', aventura: 3,
        texto: 'Patio principal del palacio mudéjar del rey Pedro I, en el Real Alcázar, con una alberca larga entre jardines.' },
      { id: 'plaza-espana', nombre: 'Plaza de España', sprite: 'plaza_espana', aventura: 4, cofres: ['c10-c'], charla: ['Álvaro'],
        texto: 'Obra del arquitecto Aníbal González para la Exposición Iberoamericana de 1929. Sus bancos de azulejos representan las provincias de España.' },
      { id: 'catedral', nombre: 'Catedral de Sevilla', sprite: 'colegiata', aventura: 5,
        texto: 'Una de las mayores catedrales góticas del mundo. Ruleta Imposible guarda aquí la décima y última pieza del Compás.' }
    ]
  };
})();
