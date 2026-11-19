# GALOIS LEGACY (πCHU LAB) — instrucciones para Claude Code

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
compartido/marca.css    identidad visual GALOIS LEGACY (portada y páginas propias)
compartido/marca.js     nombre, versión y LISTA DE JUEGOS (MARCA.juegos)
compartido/componentes.js  alias, exportar/importar/borrar, confirmación doble
compartido/volver.js    botón "← Mapa" que se añade a cada juego
compartido/mathquest.js progreso común (pichu.mathquest.v1), MUNDOS (reinos de Gaussoria) y LOGROS
compartido/img/personajes/  personaje de cada reino (.webp; por ahora, sus enemigos y jefes)
compartido/img/galois/  logo, πCHU pixel e iconos (generados por src/galois/generar_graficos.py)
applets/<id>/index.html cada juego, autocontenido
src/<juego>/            fuentes de los juegos que se compilan (p. ej. src/pizzeria: motor.js + juego.html + personajes)
                        → python3 src/pizzeria/build.py genera applets/pizzeria/index.html (no editar el generado)
tests/comprobar.mjs     comprobaciones (node tests/comprobar.mjs)
tests/pizzeria_motor.test.mjs  pruebas del motor de la Pizzería
docs/fichas/            una ficha por juego
```

## Reglas que no se rompen
1. **Los juegos se pueden adaptar a GALOIS LEGACY** (aspecto, textos, personajes e integración en el mundo),
   pero **sin quitar preguntas, niveles, mecánicas ni progreso** sin consultarlo antes con Juan Antonio.
   Las matemáticas de cada juego se respetan. Si el juego tiene fuentes en `src/`, se edita allí y se regenera.
   Cada juego sigue cargando, antes de `</head>`: `<script src="../../compartido/volver.js" defer></script>`
2. **Almacenamiento:** todos los juegos comparten `localStorage`. Cada juego usa claves que empiezan por
   `pichu.<id>.vN`. El alias común está en `pichu.perfil.v1`. **Prohibido `localStorage.clear()`.**
   Si cambias el formato de un guardado, crea una clave nueva (v+1) y migra desde la anterior sin borrarla.
3. **Privacidad (alumnado menor):** solo alias, nunca nombres ni correos. Sin cookies, analítica,
   anuncios ni recursos de otros servidores (la fuente Lato está en `compartido/fuentes/`).
   El ranking con Apps Script es opcional y está desactivado hasta que el centro lo autorice.
4. **Marca: GALOIS LEGACY · El legado de los matemáticos — un juego de πCHU LAB.**
   Colores y tipografía solo en `:root` de `marca.css`; nombre, subtítulo y lema en `marca.js`.
   Estilo: RPG de aventuras en pixel art de 16 bits, original (inspirado en los clásicos, sin copiar recursos de Zelda).
   Paleta: noche #16122C, tinta #1E1A3A, pergamino #F3ECD6, verde #3E9A5E, azul #3A7BC8, oro #E8B53A, violeta #6A4BB8.
   Texto pequeño: tinta, violeta #6A4BB8, oro oscuro #7A5200 o rubí #9E2B3A. Botones con texto blanco: verde oscuro #246B3E,
   azul oscuro #1F4F8A o violeta oscuro #4A3290. El oro solo como texto sobre fondo oscuro (noche/tinta).
   El verde y el azul normales NO sirven para texto pequeño sobre pergamino (contraste insuficiente).
   Letras: Pixelify Sans solo en títulos grandes (en pequeño confunde 2/8 y E/€); Lato en textos, números y etiquetas. πCHU es el guía y compañero del jugador.
   Los gráficos pixel art se generan con `python3 src/galois/generar_graficos.py`.
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
