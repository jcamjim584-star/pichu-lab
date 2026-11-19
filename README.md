# GALOIS LEGACY · El legado de los matemáticos
### Un juego de πCHU LAB

**Web publicada:** https://jcamjim584-star.github.io/pichu-lab/

Aventura RPG de matemáticas en pixel art (16 bits) para 1.º ESO, de Juan Antonio Campos Jiménez.
El universo matemático de **Gaussoria** ha perdido los símbolos del conocimiento: cada tema es un **reino**
y el jugador los recorre con **πCHU**, su guía y compañero. Web estática: HTML, CSS y JavaScript, sin frameworks,
sin registro y sin recoger datos personales.

## Qué incluye (versión 1.0.0)
- **Pantalla de inicio** con el logo GALOIS LEGACY y πCHU contando la historia (se salta al volver de un juego;
  `?inicio` la fuerza y `?mapa` la omite).
- **Mapa de Gaussoria**: 11 reinos (uno por tema de 1.º ESO). La lista está en `compartido/mathquest.js` (`MUNDOS`,
  campos `reino` y `escenario`); `"ahora: true"` marca el tema que se da en clase. Los reinos sin juego aparecen «en la niebla».
- Progreso común (nivel, XP, monedas, logros y ajustes) en `pichu.mathquest.v1`.
- Identidad visual: paleta y letras en `compartido/marca.css`; gráficos pixel art (logo, πCHU, iconos) generados con
  `python3 src/galois/generar_graficos.py` en `compartido/img/galois/`.

| Reino | Juego que se abre | Estado |
|---|---|---|
| Minas de los Primos (divisibilidad) | Factor Clash | Disponible |
| Reino de Hielo y Fuego (enteros) | Integer Ninja | Disponible |
| Bosque de las Fracciones | Fraction Merge (y Pizza Rush, en revisión) | Disponible |
| Fortaleza del Álgebra (ecuaciones) | Equation Merge | Disponible |
| Potencias, proporcionalidad, expresiones algebraicas, funciones, estadística, probabilidad, geometría | — | En la niebla (próximamente) |

**Hoja de ruta de GALOIS LEGACY** (cada fase se prueba y documenta antes de la siguiente):
1. ✅ Identidad: nombre, logo, pantalla de inicio, paleta, letra pixel, πCHU guía (1.0.0).
2. Mapa de Gaussoria explorable en vista cenital (teclado, cruceta táctil y lista accesible).
3. Ocho matemáticos jugables (Galois, Gauss, Euler, Noether, Hipatia, Lovelace, Fibonacci, Fermat) con habilidades.
4. Primera mazmorra RPG (Reino de Hielo y Fuego) con combate por preguntas, reutilizando el motor de Integer Ninja.
5. Adaptación visual de cada juego al universo Galois.

### Juegos (detalle)
| Juego | Curso (de momento no se muestra) | Estado |
|---|---|---|
| Factor Clash · duelos de divisibilidad | 1.º ESO | Disponible |
| Fraction Merge · suma y fusiona fracciones | 1.º ESO | Disponible |
| Equation Merge · ecuaciones de primer grado | 1.º ESO | Disponible |
| Pizza Rush · Pizzería πCHU v0.2 (fracciones: equivalencias, suma, multiplicación y división) | 1.º ESO | Próximamente (en revisión) |
| Integer Ninja v0.5 · enteros: signos, comparar, sumas, −( ), productos y cocientes | 1.º ESO | Disponible |
| Laboratorio de Proporcionalidad · cartas de ecuaciones · cartas de funciones | 1.º ESO · 4.º ESO · 1.º Bach | En diseño |

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

## Fraction Merge y Equation Merge: cómo modificarlos
Entraron desde el artefacto de Claude (0.9.2) **solo como HTML ya generado**: sus fuentes (`src/fraction-merge/`,
`src/equation-merge/`) no están en el repositorio. Hasta recuperarlas, cualquier cambio se hace en
`applets/<id>/index.html`.

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
