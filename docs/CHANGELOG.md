# Registro de cambios

## 0.2.0 · 07/11/2026
- Nuevo juego: **Fraction Royale v0.4** (`applets/fraction-royale/`).
  - Predicción obligatoria de la suma antes de jugar 2 o más cartas (+1 al multiplicador si acierta, +1 extra cada 3 aciertos).
  - Detector del error típico (sumar numeradores y denominadores) con explicación del denominador común.
  - Sin ayuda en vivo salvo en el tutorial o con la opción «Profesorado».
  - Nuevo jefe, el Gigante del Denominador: retos de ordenar fracciones en la recta (escudo roto = +1 descarte).
  - Guardado en claves `pichu.fraction-royale.*` con migración desde la v0.3; Lato local.
- Pruebas: 33/33 de Fraction Royale (3,1 millones de sumas comprobadas, 3.000 retos, equilibrio, interfaz) y 22/22 de la portada.

## 0.1.0 · 07/11/2026
- Portada πCHU con catálogo agrupado por curso y filtro.
- πCHU Exprés v4 integrado sin cambios en su código (solo se añade el botón ← πCHU).
- Alias común `pichu.perfil.v1`; descargar, cargar y borrar datos (solo claves `pichu.`).
- App instalable y sin conexión (service worker con caché versionada; no intercepta Apps Script).
- Lato alojada en la propia web; páginas de privacidad y accesibilidad.
- Comprobaciones automáticas (`tests/comprobar.mjs`) y publicación en GitHub Pages con Actions.
- Pruebas en Chrome: 22/22 superadas (escritorio, móvil 390 px y sin conexión).

### Pendiente
- Integer Ninja: enlazado a Netlify (v0.5); copiarlo a applets/ con su src/.
- Fracciones: el Laboratorio se replanteará y Fraccionario queda aparcado (fuera de la portada por ahora).
- Prueba en aula y en la red del centro.
