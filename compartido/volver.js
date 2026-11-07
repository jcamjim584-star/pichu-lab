/* =========================================================
   πCHU · volver.js
   Añade a cualquier juego un botón pequeño "← πCHU" para volver
   a la portada. Es lo ÚNICO que se añade a cada juego:
     <script src="../../compartido/volver.js" defer></script>
   Sus estilos van dentro de un Shadow DOM, así no choca con el
   CSS del juego ni el juego con él.
   Se oculta solo si el juego se abre suelto (sin la portada) o
   dentro de un iframe (por ejemplo, incrustado en Google Sites).
   ========================================================= */
(function () {
  "use strict";
  if (window.top !== window.self) return;           // incrustado: no mostrar

  const portada = new URL("../../index.html", document.currentScript ? document.currentScript.src : location.href).href;

  const anfitrion = document.createElement("div");
  anfitrion.id = "pichu-volver";
  anfitrion.style.cssText = "position:fixed;left:10px;bottom:10px;z-index:2147483000;";
  const sombra = anfitrion.attachShadow({ mode: "open" });
  sombra.innerHTML = `
    <style>
      a{display:inline-flex;align-items:center;gap:.35em;min-height:40px;padding:.4em .9em;
        border-radius:999px;background:#332B2A;color:#F4EDD7;font:700 15px/1 "Lato",system-ui,sans-serif;
        text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.25);opacity:.88}
      a:hover,a:focus-visible{opacity:1}
      a:focus-visible{outline:3px solid #E46D4D;outline-offset:3px}
      .pi{color:#E46D4D;font-size:1.15em}
      @media (max-width:600px){a{width:44px;height:44px;padding:0;justify-content:center;font-size:0;opacity:.8}a .flecha{font-size:20px}}
      @media print{a{display:none}}
    </style>
    <a href="${portada}" title="Volver a la portada de πCHU" aria-label="Volver a la portada de πCHU">
      <span class="flecha" aria-hidden="true">←</span><span class="pi" aria-hidden="true">π</span>CHU
    </a>`;
  const poner = () => document.body && document.body.appendChild(anfitrion);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", poner); else poner();
})();
