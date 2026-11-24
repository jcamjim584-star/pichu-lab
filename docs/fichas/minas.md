# Ficha · Minas de los Primos (Divisibilidad exprés)

| | |
|---|---|
| Curso | 1.º ESO |
| Reino | 1 · Minas de los Primos (divisibilidad) |
| Saberes | Número de divisores, el intruso (no divisor), reconstruir un número desde sus potencias de primos, MCD y mcm, número secreto |
| Dónde | `applets/minas/index.html` + `applets/minas/motor.js` |
| Origen | Modo fácil de πCHU ROYALE (`jantoniolade-blip/pichu-lab`, rama `dev`, `juegos/divisibilidad/facil.html`, commit `3e7ae85`) |
| Guardado | `pichu.minas.v1` → `{ cfg: { tema, nivel }, rec: { "tema-nivel": mejores aciertos } }` y resumen en `pichu.mathquest.v1` |

## Cómo se juega
- Se elige **tema** (Divisores · Primos y potencias · MCD y mcm · Mezcla) y **dificultad** (Fácil = números pequeños, Medio = más grandes).
- 10 preguntas de 4 opciones contra **Múltiplax** o **Prímox**. Cada acierto le quita vida.
- **Fallar no quita vidas:** se marca la respuesta correcta (✔) y la elegida (✘) y se ve la explicación. Hay una pista por pregunta.
- Estrellas: ★★★ con 9 o 10 aciertos, ★★ con 7–8, ★ con 5–6. Récord por tema y dificultad.
- Teclado: teclas 1–4 para responder.
- El matemático que acompaña es el elegido en el Mapa de Gaussoria.

## Motor
`motor.js` es **copia literal** del motor del Duelo de divisibilidad (πCHU ROYALE): generadores `GEN` y corrección `evaluar`.
No se edita aquí. Según su autor, se comprobó con 36 000 preguntas que siempre hay una única respuesta correcta y al menos 3 incorrectas
(el juego descarta cualquier pregunta que no cumpla eso).

## Cambios al adaptarlo a GALOIS LEGACY
- Sin Google Fonts (regla 3): Pixelify Sans (títulos) y Lato (textos y números) de `compartido/fuentes/`.
- Paleta y marco GALOIS LEGACY, fondo de cueva pixel; enemigos y matemáticos de `compartido/img/galois/`.
- Se quita el selector de héroe (se usa el del mapa) y los enlaces propios (volver lo pone `volver.js`; el duelo de cartas no se enlaza).
- Guardado renombrado a `pichu.minas.v1` (regla 2). Las respuestas llevan ✔/✘ además del color (regla 5).

## Pendiente
- Probar en clase. Factor Clash (`applets/expres/`) ya no se abre desde el mapa; su guardado `pichu.expres.v3` se conserva.
