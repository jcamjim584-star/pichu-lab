# πCHU · Matemáticas que no te esperabas

Portada que reúne los juegos y laboratorios de matemáticas interactivos de Juan Antonio Campos Jiménez
(ESO y Bachillerato). Web estática: HTML, CSS y JavaScript, sin frameworks, sin registro y sin recoger datos personales.

## Qué incluye (versión 0.2.0)
| Juego | Curso | Estado |
|---|---|---|
| πCHU Exprés · El reino de la divisibilidad | 1.º ESO | Disponible |
| Fraction Royale v0.4 (cartas de fracciones con predicción y el Gigante del Denominador) | 1.º ESO | Disponible |
| Integer Ninja | 1.º ESO | Enlazado a la versión de Netlify (v0.5); pendiente de copiar aquí |
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
```
Prueba completa en navegador (opcional, Python + Playwright):
```
pip install playwright && python3 tests/prueba_navegador.py . capturas
python3 tests/prueba_fraction_royale.py . capturas
```

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
