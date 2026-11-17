# πCHU · Matemáticas que no te esperabas

**Web publicada:** https://jcamjim584-star.github.io/pichu-lab/

Portada que reúne los juegos y laboratorios de matemáticas interactivos de Juan Antonio Campos Jiménez
(ESO y Bachillerato). Web estática: HTML, CSS y JavaScript, sin frameworks, sin registro y sin recoger datos personales.

## Qué incluye (versión 0.9.0)
La portada es un **mapa de mundos** de 1.º ESO (uno por tema). Los juegos con experiencia, monedas, logros y
personajes comunes forman **MathQuest** (`compartido/mathquest.js`, guardado en `pichu.mathquest.v1`).

| Mundo | Juego | Estado |
|---|---|---|
| 1 · Divisibilidad | Factor Clash · duelos de divisibilidad | Disponible |
| 2 · Números enteros | Integer Ninja v0.5 · signos, comparar, sumas, −( ), productos y cocientes | Disponible |
| 3 · Fracciones | Fraction Merge · suma y fusiona fracciones (MathQuest) | Disponible |
| 4 · Ecuaciones | **Equation Merge** · ecuaciones de primer grado (MathQuest) | Disponible (nuevo en 0.9.0) |
| 5 · Potencias y raíces | Power Quest | Próximamente (Power Merge se retiró en la 0.9.0) |
| 6 a 11 | Proporcionalidad, álgebra, funciones, estadística, probabilidad, geometría | Próximamente |

Fuera del mapa: Pizza Rush (fracciones, en revisión) y los juegos de cartas de ecuaciones (4.º ESO) y funciones (1.º Bach), en diseño.

Funciones comunes:
- **Alias común** para todos los juegos (nunca el nombre real).
- **Mis datos:** descargar una copia, cargarla en otro dispositivo y borrar los datos (útil en ordenadores compartidos).
- **Funciona sin conexión** y se puede **instalar** como app (móvil, Chromebook, ordenador) una vez visitada.
- Botón **← πCHU** en cada juego para volver a la portada.
- Páginas de **privacidad** y **accesibilidad**.

## Probar en tu ordenador
Hace falta un pequeño servidor (el modo sin conexión no funciona abriendo el archivo con doble clic):
```
python3 -m http.server 8000
```
y abrir http://localhost:8000

Comprobaciones automáticas (necesita Node 18 o superior):
```
node tests/comprobar.mjs
node tests/pizzeria_motor.test.mjs
node tests/equation_merge_motor.test.mjs
```
Prueba completa en navegador (opcional, Python + Playwright):
```
pip install playwright && python3 tests/prueba_navegador.py . capturas
python3 tests/prueba_pizzeria.py . capturas
```

## Pizza Rush (Pizzería πCHU): cómo modificarla
El juego se edita en `src/pizzeria/` (`motor.js` = matemáticas, `juego.html` = pantalla, `personajes/` = imágenes).
Después se genera el archivo final con:
```
python3 src/pizzeria/build.py
```
Los turnos, las mejoras de la tienda y sus precios están en `motor.js` (`TURNOS` y `MEJORAS`).

## Equation Merge: cómo modificarlo
El juego se edita en `src/equation-merge/`:
- `motor.js` = matemáticas (fichas, fusiones y cómo se fabrican las ecuaciones con su explicación y sus errores típicos),
- `niveles.js` = los 13 niveles y el modo infinito (movimientos, tipos de ecuación, soluciones posibles…),
- `juego.html` = pantalla, sonidos, tienda y logros.

Después se genera el archivo final (no edites `applets/equation-merge/index.html` a mano):
```
python3 src/equation-merge/build.py
```
Prueba del motor: `node tests/equation_merge_motor.test.mjs` (comprueba que todas las ecuaciones tienen una única solución entera entre 1 y 20).
Ficha didáctica: `docs/fichas/equation-merge.md`.

## Fraction Merge
`applets/fraction-merge/index.html` se copió ya compilado desde el artefacto de Claude; sus fuentes (`src/fraction-merge/`) todavía no están en el repositorio.

## Integer Ninja: cómo modificarlo
El juego se edita en `src/integer-ninja/src/` (`engine.js` = matemáticas, `game.js` = juego, `index.html` y `style.css` = pantalla).
Después se genera el archivo final (también la copia del portal) con:
```
python3 src/integer-ninja/build.py
```
Pruebas: `node src/integer-ninja/tests/engine.test.js` (motor), `node src/integer-ninja/tests/browser.test.js`
y `node src/integer-ninja/tests/retos.test.js` (navegador, necesitan Playwright).
El ranking en vivo (Apps Script) **no viene configurado**: se activa desde *Retos y ranking* o con el enlace de clase
cuando el centro lo autorice.

## Publicar en GitHub Pages
1. Sube esta carpeta a un repositorio **público** de GitHub (rama `main`).
2. En el repositorio: **Settings → Pages → Source: GitHub Actions**.
3. Cada vez que subas cambios a `main`, GitHub comprueba y publica solo. La dirección será
   `https://<tu-usuario>.github.io/<repositorio>/`.

**Importante:** cada vez que cambies algo, sube la versión en `compartido/marca.js` y en `sw.js`
(deben coincidir). Si no, los dispositivos que ya la tienen guardada seguirán viendo la versión antigua.

## Insertar en Google Sites o Classroom
- Google Sites: Insertar → Insertar → Por URL → pega la dirección de GitHub Pages. Añade también un botón
  "Abrir en pantalla completa" con la misma dirección.
- Classroom: comparte la dirección como enlace en la tarea.

## Licencia y créditos
- Código y contenidos: © Juan Antonio Campos Jiménez. Licencia pendiente de decidir (propuesta: CC BY-NC-SA 4.0 para contenidos).
- Tipografía Lato (Łukasz Dziedzic), licencia SIL Open Font License 1.1, alojada en `compartido/fuentes/`.
- Marca y mascota πCHU: identidad propia del proyecto.
