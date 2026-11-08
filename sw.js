/* =========================================================
   πCHU · sw.js (service worker)
   Permite usar la web sin conexión y que se pueda instalar.

   ⚠️ CADA VEZ QUE PUBLIQUES CAMBIOS, sube el número de VERSION.
   Así los dispositivos descargan la versión nueva y la portada
   muestra el aviso "Hay una versión nueva".

   Si añades un juego, añade su ruta a ARCHIVOS.
   ========================================================= */
const VERSION = "pichu-v0.3.0";

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
  "compartido/fuentes/lato-latin-400-normal.woff2",
  "compartido/fuentes/lato-latin-700-normal.woff2",
  "compartido/fuentes/lato-latin-900-normal.woff2",
  "compartido/img/logo.png",
  "compartido/img/mascota.png",
  "compartido/img/icono-192.png",
  "compartido/img/icono-512.png",
  // Juegos
  "applets/expres/"
];

self.addEventListener("install", evento => {
  evento.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)));
  // No hacemos skipWaiting aquí: esperamos a que el usuario pulse "Actualizar"
  // para no cambiar de versión en mitad de una partida.
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
    caches.match(peticion, { ignoreSearch: true }).then(guardada => {
      if (guardada) return guardada;
      return fetch(peticion).then(respuesta => {
        if (respuesta && respuesta.ok && respuesta.type === "basic") {
          const copia = respuesta.clone();
          caches.open(VERSION).then(c => c.put(peticion, copia));
        }
        return respuesta;
      }).catch(() => (peticion.mode === "navigate" ? caches.match("index.html") : Response.error()));
    })
  );
});
