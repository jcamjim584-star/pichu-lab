# Ficha · GALOIS LEGACY · La Campiña (aventura RPG)

| | |
|---|---|
| Curso | 1.º ESO |
| Saberes | 10 mundos: naturales, potencias y raíces (Fuentes de Andalucía) · divisibilidad (Carmona) · enteros (Écija) · fracciones (Marchena) · proporcionalidad (Estepa) · álgebra (Osuna) · ecuaciones (Triana) · funciones (Alcalá de Guadaíra) · estadística (Itálica) · probabilidad (Sevilla) |
| Dónde | `applets/campina/` → `index.html`, `aventura/` (motor, retos, mundos, portada), `shared/` (sprites, escenarios, música, tema), `coleccion/` (álbum de cartas), `assets/` |
| Origen | Artefacto «Galois Legacy» (claude.ai/artifact/TSUtLR5wQwBpbcGH6x1KAz), versión 1795446700-384d, más los cambios de la 1.6.0 |
| Guardado | `galoisLegacy.ruta.v1` (recorrido), `galoisLegacy.coleccion.v1` (progreso por alias: cartas, retos, nivel, monedas…), `galoisLegacy.coleccion.perfil.v1` (alias activo), `galoisLegacy.album.vistas.v1`, `galoisLegacy.heroe`, `galoisLegacy.musica`, `galoisLegacy.musica.vol`, `galoisLegacy.sonido`, `galoisLegacy.tactil`, `galoisLegacy.docente` |

## Cómo se juega
- Portada → elegir matemático → mapa de la Campiña → entrar en un pueblo.
- En el pueblo: flechas/WASD o cruceta táctil (empujar hasta el borde para correr), A/Espacio para hablar y abrir, B/X para
  atacar con el compás, salto con C o el botón verde. Cada mundo tiene 5 aventuras (exploración, combate, construcción,
  minijefe y jefe); al vencer al jefe se abre el mundo siguiente.
- Tres dificultades (Explorador, Aventurero, Maestro). Cada matemático tiene una habilidad, una vez por combate.
- Monedas, XP, insignias y cartas son del juego: no cambian notas. Modo docente (abre todos los mundos) con código.

## Cambios de la 1.6.0
- Portada (`aventura/portada.js`) y elección de matemático (en `aventura/motor.js`, «Portada y elección de personaje»).
- Parpadeo en iPhone/tableta: `ajustar()` solo redimensiona si cambia el tamaño y repinta al momento; se bloquea el arrastre de la
  página mientras se juega (`touchmove`) y `overscroll-behavior: none`.
- Letras locales: Pixelify Sans (títulos) y Lato (textos y números), sin Google Fonts. Tamaños de letra reducidos un 20 % porque
  la letra anterior (Jersey 10) era muy estrecha.
- `volver.js` se carga (regla 1); la clase `en-juego` lo esconde dentro de pueblos y combates para no tapar la cruceta.

## Recorrido por paradas (1.7.0)
- Los 10 pueblos se juegan de parada en parada (sin cruceta) con las rutas de `aventura/rutas.js` (1.8.0). Fuentes tiene 10 paradas y un cruce; los demás, 6.
- Cada parada: monumento (PNG de `assets/patrimonio/` o edificio pixel del juego), texto, vecino y acciones (aventura, cofres,
  encargo, tienda) o una pregunta corta. Las paradas con el mismo `grupo` forman un cruce (se hacen en cualquier orden).
- Guardado propio: `galoisLegacy.ruta.v1` → `{ alias: { m1: { idParada: true } } }` (preguntas de monumento acertadas).
- Para convertir otro pueblo: añadir su lista en `rutas.js` con sus 3 monumentos y repartir las 5 aventuras.

## Pendiente (consultar con Juan Antonio)
- Revisar los textos y preguntas de las paradas de Fuentes (`aventura/rutas.js`).
- El código de la exploración libre sigue en `motor.js` (sin uso) por si se quiere recuperar.
- Revisar los textos y preguntas de las paradas de los otros 9 pueblos.
- Claves de guardado: no siguen `pichu.<id>.vN` (regla 2). Cambiarlas exige migrar sin borrar las antiguas.
- Álbum: 4 cartas cargan fotografías de otros servidores (Wikimedia, Grupo Joly, El Mundo y otra web). La regla 3 lo prohíbe:
  habría que guardarlas en el repositorio (si la licencia lo permite) o dejar su marcador «Falta la fotografía».
- Decidir si sale en el mapa de Gaussoria o sustituye a la portada actual.
- Probar en clase en iPhone y tableta reales.
