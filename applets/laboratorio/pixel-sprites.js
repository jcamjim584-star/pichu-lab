/* =====================================================================
   Sprites pixelados (de πCHU ROYALE; GALOIS LEGACY lo usa en el Laboratorio)
   ---------------------------------------------------------------------
   Reduce cada ilustración a una rejilla pequeña y la amplía sin suavizar,
   como un sprite de 16 bits. Solo cambia el aspecto de las imágenes.

   Uso:
     <script src="pixel-sprites.js" data-selector="img" data-grid="72"></script>
   Las imágenes del banco (assets/pichu-royale/) ya son pixel art y se
   dejan como están. Para excluir otra imagen: atributo data-px-skip.
   ===================================================================== */
(function () {
  'use strict';
  var me = document.currentScript;
  var SELECTOR = (me && me.dataset.selector) || 'img';
  var GRID = +((me && me.dataset.grid) || 72);
  var done = new WeakMap();

  function skip(img) {
    return img.hasAttribute('data-px-skip') || /assets\/pichu-royale\//.test(img.getAttribute('src') || '');
  }

  function pixelate(img) {
    if (!img || !img.src || skip(img) || done.get(img) === img.src) return;
    var src = img.src;
    var run = function () {
      if (img.src !== src || !img.naturalWidth) return;
      var w = img.naturalWidth, h = img.naturalHeight, k = GRID / Math.max(w, h);
      if (k >= 1) { done.set(img, src); return; }
      var cw = Math.max(1, Math.round(w * k)), ch = Math.max(1, Math.round(h * k));
      var c = document.createElement('canvas');
      c.width = cw; c.height = ch;
      var x = c.getContext('2d');
      x.imageSmoothingEnabled = true;
      try {
        x.drawImage(img, 0, 0, cw, ch);
        var d = x.getImageData(0, 0, cw, ch), p = d.data;
        for (var i = 3; i < p.length; i += 4) p[i] = p[i] < 110 ? 0 : 255; // bordes nítidos
        x.putImageData(d, 0, 0);
        var out = c.toDataURL('image/png');
        done.set(img, out);
        img.src = out;
        img.style.imageRendering = 'pixelated';
      } catch (e) { done.set(img, src); /* imagen de otro origen: se deja igual */ }
    };
    if (img.complete && img.naturalWidth) run(); else img.addEventListener('load', run, { once: true });
  }

  function scan(root) {
    if (!root || root.nodeType !== 1) return;
    if (root.matches(SELECTOR)) pixelate(root);
    root.querySelectorAll(SELECTOR).forEach(pixelate);
  }

  function start() {
    scan(document.body);
    new MutationObserver(function (list) {
      list.forEach(function (m) {
        if (m.type === 'attributes') { if (m.target.matches && m.target.matches(SELECTOR)) pixelate(m.target); }
        else m.addedNodes.forEach(scan);
      });
    }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
