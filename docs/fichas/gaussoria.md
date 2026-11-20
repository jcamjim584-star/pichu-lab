# Ficha · Mapa de Gaussoria (explorable)

| | |
|---|---|
| Dónde | Portada (`index.html`), motor y terreno en `compartido/gaussoria.js` |
| Reinos | `compartido/mathquest.js` → `MUNDOS` (campo `puerta: [columna, fila]`) |
| Guardado | `pichu.galois.v1` → `{ v: 1, pos: { x, y, dir }, vista: "explorar" \| "lista" }` |
| Gráficos | Casillas, edificios y explorador dibujados por código; πCHU pequeño en `compartido/img/galois/pichu-mini.png` |

## Cómo se juega
- El explorador sale de la plaza de la estrella (abajo, en el centro) con πCHU detrás.
- Se camina por la hierba, los caminos y los puentes; los árboles, las rocas y el agua no se pueden pisar.
- Cada reino es un edificio con su número. Se entra **desde la casilla de abajo**, pisando la puerta.
- Al pisar una puerta, πCHU dice qué reino es y qué juego abre. **Intro** o el botón **Entrar en …** abre el juego.
- La «!» dorada marca el reino que se da en clase (`ahora: true` en `MUNDOS`).
- Reinos sin juego: edificio gris con candado y niebla. Se puede llegar, pero no entrar.

## Controles
| Dispositivo | Moverse | Entrar |
|---|---|---|
| Teclado (con el mapa enfocado) | Flechas o W A S D (mantener = seguir andando) | Intro o Espacio |
| Móvil o tableta | Cruceta de la esquina, o tocar el sitio de destino | Botón «Entrar en …» o tocar otra vez el edificio |
| Ratón | Clic en el sitio de destino | Botón «Entrar en …» o clic otra vez en el edificio |

## Cómo cambiar el mapa
- **Terreno:** editar `MAPA` en `compartido/gaussoria.js` (una letra por casilla; leyenda en el propio archivo).
  Todas las filas deben tener la misma longitud.
- **Mover un reino:** cambiar su `puerta` en `MUNDOS`. El edificio ocupa la fila de encima y las casillas de los lados.
- Después, `node tests/comprobar.mjs` avisa si un edificio tapa árboles, rocas o agua, si choca con otro, o si no se puede llegar.

## Accesibilidad
- **Ver como lista** muestra los reinos como enlaces normales (la vista de islas de la versión 1.0).
- El lienzo tiene nombre e instrucciones; al llegar a una puerta se anuncia el reino (`aria-live`).
- Sin animaciones (sistema o ajuste «Animaciones»), el explorador salta de casilla en casilla y el agua no se mueve.

## Pendiente (fases siguientes)
- Fase 3: el explorador se cambia por los ocho matemáticos jugables.
- Probar en clase: ritmo de los pasos (150 ms por casilla) y tamaño de la cruceta.
