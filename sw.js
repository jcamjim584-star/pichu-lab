/* =========================================================
   GALOIS LEGACY (πCHU LAB) · sw.js (service worker)
   Permite usar la web sin conexión y que se pueda instalar.

   ⚠️ CADA VEZ QUE PUBLIQUES CAMBIOS, sube el número de VERSION.
   Así los dispositivos descargan la versión nueva y la portada
   muestra el aviso "Hay una versión nueva".

   Si añades un juego, añade su ruta a ARCHIVOS.
   ========================================================= */
const VERSION = "pichu-v1.8.0";

const ARCHIVOS = [
  "./",
  "index.html",
  "privacidad.html",
  "accesibilidad.html",
  "manifest.webmanifest",
  "compartido/marca.css",
  "compartido/marca.js",
  "compartido/componentes.js",
  "compartido/volver.js",
  "compartido/mathquest.js",
  "compartido/gaussoria.js",
  "compartido/fuentes/lato-latin-400-normal.woff2",
  "compartido/fuentes/lato-latin-700-normal.woff2",
  "compartido/fuentes/lato-latin-900-normal.woff2",
  "compartido/fuentes/pixelify-sans-latin-400-normal.woff2",
  "compartido/fuentes/pixelify-sans-latin-700-normal.woff2",
  "compartido/img/galois/logo.svg",
  "compartido/img/galois/pichu-guia.png",
  "compartido/img/galois/heroes/hipatia.png",
  "compartido/img/galois/heroes/hipatia-retrato.png",
  "compartido/img/galois/heroes/ada_lovelace.png",
  "compartido/img/galois/heroes/ada_lovelace-retrato.png",
  "compartido/img/galois/heroes/emmy_noether.png",
  "compartido/img/galois/heroes/emmy_noether-retrato.png",
  "compartido/img/galois/heroes/sophie_germain.png",
  "compartido/img/galois/heroes/sophie_germain-retrato.png",
  "compartido/img/galois/heroes/gauss.png",
  "compartido/img/galois/heroes/gauss-retrato.png",
  "compartido/img/galois/heroes/fibonacci.png",
  "compartido/img/galois/heroes/fibonacci-retrato.png",
  "compartido/img/galois/heroes/ramanujan.png",
  "compartido/img/galois/heroes/ramanujan-retrato.png",
  "compartido/img/galois/heroes/al_juarismi.png",
  "compartido/img/galois/heroes/al_juarismi-retrato.png",
  "compartido/img/galois/enemigos/primox.png",
  "compartido/img/galois/enemigos/primox-grande.png",
  "compartido/img/galois/enemigos/negatron.png",
  "compartido/img/galois/enemigos/negatron-grande.png",
  "compartido/img/galois/enemigos/denominadoron.png",
  "compartido/img/galois/enemigos/denominadoron-grande.png",
  "compartido/img/galois/enemigos/incognita_x.png",
  "compartido/img/galois/enemigos/incognita_x-grande.png",
  "compartido/img/galois/enemigos/potenciator.png",
  "compartido/img/galois/enemigos/potenciator-grande.png",
  "compartido/img/galois/enemigos/porcentajin.png",
  "compartido/img/galois/enemigos/porcentajin-grande.png",
  "compartido/img/galois/enemigos/polinomio_mutante.png",
  "compartido/img/galois/enemigos/polinomio_mutante-grande.png",
  "compartido/img/galois/enemigos/pendientor.png",
  "compartido/img/galois/enemigos/pendientor-grande.png",
  "compartido/img/galois/enemigos/mediana_traviesa.png",
  "compartido/img/galois/enemigos/mediana_traviesa-grande.png",
  "compartido/img/galois/enemigos/dado_caotico.png",
  "compartido/img/galois/enemigos/dado_caotico-grande.png",
  "compartido/img/galois/isla-verde.png",
  "compartido/img/galois/isla-azul.png",
  "compartido/img/galois/isla-violeta.png",
  "compartido/img/galois/isla-niebla.png",
  "compartido/img/galois/icono-192.png",
  "compartido/img/galois/icono-512.png",
  "compartido/img/logo.png",
  "compartido/img/mascota.png",
  "compartido/img/icono-192.png",
  "compartido/img/icono-512.png",
  "compartido/img/centro.jpg",
  "compartido/img/personajes/arlequina.webp",
  "compartido/img/personajes/divison.webp",
  "compartido/img/personajes/duende.webp",
  "compartido/img/personajes/incognito.webp",
  "compartido/img/personajes/mago.webp",
  "compartido/img/personajes/menos.webp",
  "compartido/img/personajes/pirata.webp",
  "compartido/img/personajes/pizarra.webp",
  "compartido/img/personajes/punteo.webp",
  "compartido/img/personajes/reglino.webp",
  "compartido/img/personajes/salsita.webp",
  // Juegos
  "applets/minas/",
  "applets/minas/motor.js",
  "applets/pizzeria/",
  "applets/integer-ninja/",
  "applets/laboratorio/",
  "applets/laboratorio/pixel-skin.css",
  "applets/laboratorio/pixel-sprites.js",
  "applets/campina/",
  "applets/campina/assets/fuentes/lato-latin-400-normal.woff2",
  "applets/campina/assets/fuentes/lato-latin-700-normal.woff2",
  "applets/campina/assets/fuentes/lato-latin-900-normal.woff2",
  "applets/campina/assets/fuentes/pixelify-sans-latin-400-normal.woff2",
  "applets/campina/assets/fuentes/pixelify-sans-latin-700-normal.woff2",
  "applets/campina/assets/galois/mapa/campina-sevillana.svg",
  "applets/campina/assets/pichu-royale/enemigos/dado_caotico.png",
  "applets/campina/assets/pichu-royale/enemigos/denominadoron.png",
  "applets/campina/assets/pichu-royale/enemigos/despejador_oscuro.png",
  "applets/campina/assets/pichu-royale/enemigos/equilibrius.png",
  "applets/campina/assets/pichu-royale/enemigos/grafico_tramposo.png",
  "applets/campina/assets/pichu-royale/enemigos/incognita_x.png",
  "applets/campina/assets/pichu-royale/enemigos/mediana_traviesa.png",
  "applets/campina/assets/pichu-royale/enemigos/multiplax.png",
  "applets/campina/assets/pichu-royale/enemigos/negatron.png",
  "applets/campina/assets/pichu-royale/enemigos/parabola_vortice.png",
  "applets/campina/assets/pichu-royale/enemigos/parentesis_maldito.png",
  "applets/campina/assets/pichu-royale/enemigos/pendientor.png",
  "applets/campina/assets/pichu-royale/enemigos/polinomio_mutante.png",
  "applets/campina/assets/pichu-royale/enemigos/porcentajin.png",
  "applets/campina/assets/pichu-royale/enemigos/potenciator.png",
  "applets/campina/assets/pichu-royale/enemigos/primox.png",
  "applets/campina/assets/pichu-royale/enemigos/radicosmico.png",
  "applets/campina/assets/pichu-royale/enemigos/ruleta_imposible.png",
  "applets/campina/assets/pichu-royale/enemigos/senor_escala.png",
  "applets/campina/assets/pichu-royale/enemigos/simplifract.png",
  "applets/campina/aventura/aventura.css",
  "applets/campina/aventura/motor.js",
  "applets/campina/aventura/mundos.js",
  "applets/campina/aventura/portada.js",
  "applets/campina/aventura/retos.js",
  "applets/campina/assets/patrimonio/alcala-de-guadaira/castillo.png",
  "applets/campina/assets/patrimonio/alcala-de-guadaira/molino-benarosa.png",
  "applets/campina/assets/patrimonio/alcala-de-guadaira/molino-san-juan.png",
  "applets/campina/assets/patrimonio/carmona/murallas.png",
  "applets/campina/assets/patrimonio/carmona/puerta-de-cordoba.png",
  "applets/campina/assets/patrimonio/carmona/puerta-de-sevilla.png",
  "applets/campina/assets/patrimonio/ecija/palacio-benameji.png",
  "applets/campina/assets/patrimonio/ecija/palacio-penaflor.png",
  "applets/campina/assets/patrimonio/ecija/torre-san-juan.png",
  "applets/campina/assets/patrimonio/estepa/obrador-de-mantecados.png",
  "applets/campina/assets/patrimonio/estepa/torre-de-la-victoria.png",
  "applets/campina/assets/patrimonio/estepa/torre-del-homenaje.png",
  "applets/campina/assets/patrimonio/fuentes-de-andalucia/calle-carrera.png",
  "applets/campina/assets/patrimonio/fuentes-de-andalucia/capilla-de-la-aurora.png",
  "applets/campina/assets/patrimonio/fuentes-de-andalucia/castillo-de-la-monclova.png",
  "applets/campina/assets/patrimonio/fuentes-de-andalucia/castillo-del-hierro.png",
  "applets/campina/assets/patrimonio/fuentes-de-andalucia/fuente-de-la-reina.png",
  "applets/campina/assets/patrimonio/fuentes-de-andalucia/iglesia-san-jose.png",
  "applets/campina/assets/patrimonio/fuentes-de-andalucia/santa-maria-la-blanca.png",
  "applets/campina/assets/patrimonio/fuentes-de-andalucia/silo.png",
  "applets/campina/assets/patrimonio/italica/anfiteatro.png",
  "applets/campina/assets/patrimonio/italica/casa-de-los-pajaros.png",
  "applets/campina/assets/patrimonio/italica/termas.png",
  "applets/campina/assets/patrimonio/manifest.json",
  "applets/campina/assets/patrimonio/marchena/arco-de-la-rosa.png",
  "applets/campina/assets/patrimonio/marchena/olivar-cortijo.png",
  "applets/campina/assets/patrimonio/marchena/san-juan-bautista.png",
  "applets/campina/assets/patrimonio/osuna/antigua-universidad.png",
  "applets/campina/assets/patrimonio/osuna/colegiata.png",
  "applets/campina/assets/patrimonio/osuna/coto-de-las-canteras.png",
  "applets/campina/assets/patrimonio/sevilla/giralda.png",
  "applets/campina/assets/patrimonio/sevilla/jardines-del-alcazar.png",
  "applets/campina/assets/patrimonio/sevilla/patio-de-las-doncellas.png",
  "applets/campina/assets/patrimonio/triana/capilla-del-carmen.png",
  "applets/campina/assets/patrimonio/triana/puente-isabel-ii.png",
  "applets/campina/assets/patrimonio/triana/taller-de-ceramica.png",
  "applets/campina/aventura/rutas.js",
  "applets/campina/coleccion/album.js",
  "applets/campina/coleccion/arte.js",
  "applets/campina/coleccion/bridge.js",
  "applets/campina/coleccion/datos.js",
  "applets/campina/coleccion/estilo.css",
  "applets/campina/coleccion/index.html",
  "applets/campina/shared/galois-data.js",
  "applets/campina/shared/galois-escenarios.js",
  "applets/campina/shared/galois-musica.js",
  "applets/campina/shared/galois-sprites.js",
  "applets/campina/shared/galois-theme.css"
];

// Estrategia (desde 0.6.2): PRIMERO LA RED, y la copia guardada solo si no hay conexión.
// Así, con Internet, siempre se ve la última versión publicada; sin Internet, la última que se guardó.
// (Antes era "primero la copia guardada" y algunos dispositivos se quedaban con la versión antigua).

self.addEventListener("install", evento => {
  // cache: "reload" → descarga los archivos de GitHub, no de la memoria del navegador.
  evento.waitUntil(
    caches.open(VERSION)
      .then(c => Promise.all(ARCHIVOS.map(a => fetch(new Request(a, { cache: "reload" })).then(r => r.ok && c.put(a, r)).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("message", evento => {
  if (evento.data === "activar") self.skipWaiting();
});

self.addEventListener("activate", evento => {
  evento.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(k => k.startsWith("pichu-") && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", evento => {
  const peticion = evento.request;
  const url = new URL(peticion.url);
  // Solo GET de nuestra propia web. Nunca tocamos el ranking (Apps Script)
  // ni ninguna otra dirección externa.
  if (peticion.method !== "GET" || url.origin !== self.location.origin) return;

  evento.respondWith(
    fetch(peticion, { cache: "no-cache" }).then(respuesta => {
      if (respuesta && respuesta.ok && respuesta.type === "basic") {
        const copia = respuesta.clone();
        caches.open(VERSION).then(c => c.put(peticion, copia));
      }
      return respuesta;
    }).catch(() =>
      caches.match(peticion, { ignoreSearch: true }).then(guardada => {
        if (guardada) return guardada;
        // "applets/x/index.html" y "applets/x/" son la misma página
        if (url.pathname.endsWith("/index.html")) {
          const carpeta = url.pathname.slice(0, -"index.html".length);
          return caches.match(carpeta).then(r => r || (peticion.mode === "navigate" ? caches.match("index.html") : Response.error()));
        }
        return peticion.mode === "navigate" ? caches.match("index.html") : Response.error();
      })
    )
  );
});
