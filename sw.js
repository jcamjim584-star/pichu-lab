/* =========================================================
   GALOIS LEGACY (πCHU LAB) · sw.js (service worker)
   Permite usar la web sin conexión y que se pueda instalar.

   ⚠️ CADA VEZ QUE PUBLIQUES CAMBIOS, sube el número de VERSION.
   Así los dispositivos descargan la versión nueva y la portada
   muestra el aviso "Hay una versión nueva".

   Si añades un juego, añade su ruta a ARCHIVOS.
   ========================================================= */
const VERSION = "pichu-v1.1.0";

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
  "compartido/img/galois/pichu-mini.png",
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
  "applets/expres/",
  "applets/pizzeria/",
  "applets/integer-ninja/",
  "applets/equation-merge/",
  "applets/fraction-merge/"
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
