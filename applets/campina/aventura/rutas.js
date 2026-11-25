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
    ]
  };
})();
