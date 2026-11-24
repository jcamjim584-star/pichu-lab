/* =========================================================
   GALOIS LEGACY · volver.js
   Añade a cualquier juego el «marco Galois»: una insignia pixel
   «← Mapa» con la cara del matemático elegido, para volver al
   Mapa de Gaussoria. Es lo ÚNICO que se añade a cada juego:
     <script src="../../compartido/volver.js" defer></script>
   Sus estilos van dentro de un Shadow DOM, así no choca con el
   CSS del juego ni el juego con él. La letra pixel se registra con
   un nombre propio («GaloisPixel») para no pisar las del juego.
   Se oculta solo si el juego se abre dentro de un iframe
   (por ejemplo, incrustado en Google Sites).
   ========================================================= */
(function () {
  "use strict";
  if (window.top !== window.self) return;           // incrustado: no mostrar

  const base = document.currentScript ? document.currentScript.src : location.href;
  const ruta = r => new URL(r, base).href;
  const portada = ruta("../index.html");

  // Matemático elegido en la portada (pichu.galois.v1 → heroe). Solo se lee; nunca se escribe.
  let heroe = "";
  try { const d = JSON.parse(localStorage.getItem("pichu.galois.v1")); if (d && /^[a-z_]+$/.test(d.heroe || "")) heroe = d.heroe; } catch (e) { /* sin datos */ }

  // Letra pixel (la misma de la portada, OFL), con nombre propio
  try {
    const f = new FontFace("GaloisPixel", `url("${ruta("fuentes/pixelify-sans-latin-700-normal.woff2")}")`, { weight: "700" });
    f.load().then(x => document.fonts.add(x)).catch(() => {});
  } catch (e) { /* navegador antiguo: se usa Lato */ }

  const anfitrion = document.createElement("div");
  anfitrion.id = "pichu-volver";
  anfitrion.style.cssText = "position:fixed;left:13px;bottom:13px;z-index:2147483000;";
  const sombra = anfitrion.attachShadow({ mode: "open" });
  const o = "#E8B53A";   // oro
  sombra.innerHTML = `
    <style>
      a{display:inline-flex;align-items:center;gap:.45em;min-height:44px;padding:.2em .8em .2em .45em;margin:3px;
        background:#16122C;color:#F3ECD6;border:0;border-radius:0;font:700 16px/1 GaloisPixel,"Lato",system-ui,sans-serif;
        text-decoration:none;opacity:.92;
        box-shadow:0 -3px 0 ${o},0 3px 0 ${o},-3px 0 0 ${o},3px 0 0 ${o},0 7px 0 rgba(0,0,0,.45),inset -3px -3px 0 rgba(0,0,0,.35)}
      a:hover,a:focus-visible{opacity:1;background:#4A3290}
      a:active{transform:translateY(3px);box-shadow:0 -3px 0 ${o},0 3px 0 ${o},-3px 0 0 ${o},3px 0 0 ${o}}
      a:focus-visible{outline:3px solid #FFE08A;outline-offset:6px}
      img{width:auto;height:36px;image-rendering:pixelated;image-rendering:crisp-edges;margin-top:-6px}
      .flecha{color:#FFE08A}
      @media (max-width:600px){a{min-width:44px;padding:.2em .45em;justify-content:center}.txt{display:none}}
      @media print{a{display:none}}
    </style>
    <a href="${portada}" title="Volver al mapa de Gaussoria" aria-label="Volver al mapa de Gaussoria">
      <span class="flecha" aria-hidden="true">◀</span>${heroe ? `<img src="${ruta(`img/galois/heroes/${heroe}.png`)}" alt="">` : ""}<span class="txt">Mapa</span>
    </a>`;
  const img = sombra.querySelector("img");
  if (img) img.onerror = () => img.remove();         // si falta la imagen, solo flecha y texto
  const poner = () => document.body && document.body.appendChild(anfitrion);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", poner); else poner();
})();
