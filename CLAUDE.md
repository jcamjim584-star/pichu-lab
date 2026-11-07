# πCHU LAB — instrucciones para Claude Code

## Quién soy y cómo trabajar conmigo
- Juan Antonio Campos Jiménez, profesor de Matemáticas (1.º ESO, 4.º ESO Aplicadas, 1.º Bach CCSS) en Andalucía.
- Estoy aprendiendo a programar: explícame en español y paso a paso qué cambias y por qué.
- Antes de cambios grandes, preséntame un plan y espera mi aprobación.
- Regla del proyecto: no se empieza algo nuevo sin probar y documentar lo anterior.

## Qué es este repositorio
Portada (`index.html`) que enlaza juegos y laboratorios de matemáticas. Web estática, sin frameworks,
publicada en GitHub Pages con `.github/workflows/publicar.yml`.

```
index.html              portada / catálogo
privacidad.html         página de privacidad
accesibilidad.html      declaración de accesibilidad
sw.js                   modo sin conexión (lista ARCHIVOS + VERSION)
manifest.webmanifest    app instalable
compartido/marca.css    identidad visual (solo portada y páginas propias)
compartido/marca.js     nombre, versión y LISTA DE JUEGOS (MARCA.juegos)
compartido/componentes.js  alias, exportar/importar/borrar, confirmación doble
compartido/volver.js    botón "← πCHU" que se añade a cada juego
applets/<id>/index.html cada juego, autocontenido
tests/comprobar.mjs     comprobaciones (node tests/comprobar.mjs)
```

## Reglas que no se rompen
1. **Los juegos no se reescriben.** A cada juego solo se le añade, antes de `</head>`:
   `<script src="../../compartido/volver.js" defer></script>`
2. **Almacenamiento:** todos los juegos comparten `localStorage`. Cada juego usa claves que empiezan por
   `pichu.<id>.vN`. El alias común está en `pichu.perfil.v1`. **Prohibido `localStorage.clear()`.**
   Si cambias el formato de un guardado, crea una clave nueva (v+1) y migra desde la anterior sin borrarla.
3. **Privacidad (alumnado menor):** solo alias, nunca nombres ni correos. Sin cookies, analítica,
   anuncios ni recursos de otros servidores (la fuente Lato está en `compartido/fuentes/`).
   El ranking con Apps Script es opcional y está desactivado hasta que el centro lo autorice.
4. **Marca cambiable:** colores y tipografía solo en `:root` de `marca.css`; nombre y lema en `marca.js`.
   Paleta: espresso #332B2A, salvia #5A8A78, coral #E46D4D, crema #F4EDD7.
   Texto pequeño en coral → #A8402A. Botones con texto blanco → #3F6E5C.
   El coral y el salvia normales NO sirven para texto pequeño sobre crema (contraste insuficiente).
5. **Accesibilidad (WCAG 2.2 AA):** teclado, foco visible, botones ≥ 44 px, nunca información solo por color,
   respetar `prefers-reduced-motion`. Confirmaciones con doble pulsación (no usar `confirm()`).

## Añadir un juego nuevo
1. Copiar su HTML a `applets/<id>/index.html` (y su `src/` si lo tiene).
2. Añadir la línea de `volver.js` (regla 1).
3. Añadir un objeto a `MARCA.juegos` en `compartido/marca.js` con `estado: "jugar"`.
4. Añadir `"applets/<id>/"` a `ARCHIVOS` en `sw.js`.
5. Subir la versión en `marca.js` **y** en `sw.js` (deben coincidir).
6. `node tests/comprobar.mjs` debe decir "Todo correcto".

## Antes de dar algo por terminado
- `node tests/comprobar.mjs` sin fallos.
- Abrir la portada y el juego en un servidor local (`python3 -m http.server`) y revisar la consola.
- Probar en anchura de móvil (390 px).
- Actualizar `README.md` y `docs/CHANGELOG.md`.
