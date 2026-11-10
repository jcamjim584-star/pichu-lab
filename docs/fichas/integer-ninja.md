# Ficha · Integer Ninja v0.5

| | |
|---|---|
| Curso | 1.º ESO |
| Saberes | Números enteros: signo, comparación en la recta, suma, −( ), regla de los signos en productos y cocientes |
| Dónde | `applets/integer-ninja/` (generado) · fuentes en `src/integer-ninja/` |
| Guardado | `pichu.integerNinja.v1` (perfiles por alias) |

## Cómo se juega
- **▶ JUGAR** = modo aventura: 6 niveles con guardián; el último es el Rey de los Signos.
- **Modo clásico**: objetivos exactos con acumulador. **Arcade**: objetivos y misiones alternados.
- Al cortar −( ), la piña (×) o el coco (÷) salen dos **semillas**: hay que decidir el signo.

## Reglas de puntuación (v0.5)
- Fallo de misión o semilla equivocada: **−50 puntos** (nunca por debajo de 0), sin perder vida.
- Se pierde vida con una **bomba** o cuando se acaba el tiempo de un objetivo.
- Estrellas: ★★★ sin perder vidas y como mucho 1 fallo · ★★ como mucho 1 vida y 4 fallos · ★ superado.

## Bombas (corrección del 10/11/2026)
La bomba que asoma detrás de la fruta que cortas no explota: zona de corte al 60 %, escudo si la fruta se corta en el mismo
trazo, margen de 150 ms y el toque elige la fruta antes que la bomba. Una bomba sola sí explota.

## Pruebas
`node src/integer-ninja/tests/engine.test.js` · `browser.test.js` · `retos.test.js` · `apps-script.test.js`.

## Pendiente
- Probar en clase y recoger opiniones.
- Ranking en vivo: solo cuando el centro y la persona delegada de protección de datos lo autoricen.
