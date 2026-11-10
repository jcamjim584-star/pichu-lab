# Registro de cambios

## 10/11/2026 · Materiales de aula
- `docs/aula/`: guía docente (sesiones, evidencias, lista de cotejo, rúbrica, DUA, errores típicos, registro de la prueba), fichas del alumnado de Exprés y Pizza Rush con solucionario, y cuestionario anónimo listo para Google Forms.
- Web publicada en https://jcamjim584-star.github.io/pichu-lab/

## 0.5.0 · 08/11/2026
- La Pizzería se rehace como **Pizza Rush** (v0.2), porque la v0.1 resultaba aburrida. Sin personajes.
  - Turnos frenéticos: tickets con cuenta atrás, horno que saca pizzas a una cinta, cajas por pedido, rachas x2/x3/x4, «¡PERFECTO!», confeti, música y efectos generados en el navegador.
  - Entre turnos, **tienda**: Horno turbo, Mostrador XL, Campanita de paciencia, Cortador mágico (equivalencias), Propina de oro y decoración (luces, mantel, neón, plantas). La pizzería sube de categoría con las estrellas.
  - 8 turnos (el 7 mezcla todo y el 8 es el jefe). Modo tranquilo en Ajustes. Teclado completo.
  - El horno prefiere los cortes que sirven para los pedidos abiertos; los resultados siempre se escriben con los cortes del turno.
- Pruebas: 150.885 comprobaciones del motor y 48/48 en Chrome.

## 0.4.0 · 08/11/2026
- Nuevo juego: **Pizzería πCHU v0.1** (`applets/pizzeria/`, fuentes en `src/pizzeria/`).
  - 7 jornadas: mitades y cuartos · tercios y sextos · octavos, doceavos y equivalencias (servicio en caja) · más de una pizza · multiplicar · dividir · jefe (el Crítico Gastronómico).
  - Modo tranquilo por defecto (contra reloj opcional); al segundo fallo el cliente se va.
  - Detecta el error del denominador, «la parte de una sola persona» y «multiplicar en vez de dividir»; barras de comparación pedido/servido.
  - Personajes de Juan Antonio; motor con enteros (1 pizza = 24/24).
- Pruebas: 97.242 comprobaciones del motor en Node y 45/45 en Chrome.

## 0.3.0 · 08/11/2026
- La portada se organiza por **juegos** (Juegos · Próximamente), sin cursos ni filtro. Los cursos siguen guardados en `marca.js` (`mostrarCursos: false`) para usarlos más adelante.
- Se retira Fraction Royale de la portada: el juego de fracciones se replantea sin cartas. Su código queda en el historial de git (versión 0.2.0).

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
