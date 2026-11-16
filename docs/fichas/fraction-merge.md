# Ficha · Fraction Merge v1

| | |
|---|---|
| Curso | 1.º ESO |
| Saberes | Fracción como parte de la unidad, fracciones equivalentes y simplificación, suma y resta con igual y distinto denominador, completar la unidad, mitad y doble de una fracción, fracción y decimal |
| Dónde | `applets/fraction-merge/` (generado) · fuentes en `src/fraction-merge/` |
| Guardado | `pichu.fraction-merge.v1` (estrellas, récords, tienda, misiones) y `pichu.mathquest.v1` (XP, monedas, logros, ajustes) |

## Cómo se juega
- Se **desliza** el dedo (o las flechas): todas las fichas se mueven a la vez.
- Dos fichas que chocan **se suman** si el resultado no pasa de 1: 1/2 + 1/4 = 2/4 + 1/4 = 3/4. La cinta enseña los pasos.
- Si suman **exactamente 1**, se completa una unidad: desaparecen y dan 50 puntos. Así se libera sitio.
- Arriba hay tres **pedidos** escritos de otra forma. Se entregan **tocando la ficha que vale eso** (no gasta movimiento).
  Una ficha sin simplificar (2/4) sirve para un pedido de 1/2.
- **Fichas claras**: están sin simplificar (2/4, 3/6…). **Rocas y hielo**: se rompen con una suma al lado.
- **Poderes:** 🔨 martillo (tras el nivel 2), ✂ partir una ficha en dos mitades (tras el 4), 🌀 mezcla (tras el 7).
- No hay límite de tiempo: el límite son los **movimientos**.

## Niveles (se ajustan en `src/fraction-merge/niveles.js`)
| Escalón | Niveles | Contenido |
|---|---|---|
| 1 Principiante | 1–3 | Mitades, cuartos y octavos con dibujos; fracciones equivalentes |
| 2 Intermedio | 4–6 | Tercios y sextos; suma y resta con el mismo denominador; cuánto falta para 1 |
| 3 Avanzado | 7–9 | Suma y resta con distinto denominador; doceavos |
| 4 Experto | 10–12 | Mitad y doble; quintos, décimos y decimales; todo mezclado |
| 5 Jefe final | 13 | Quebrón: lanza rocas y congela fichas cada 7 movimientos |

Partida infinita (se abre al superar el nivel 3): sin límite de movimientos, 3 vidas.

## Errores y ayudas
- Tocar una ficha que no vale lo que ningún pedido es un **error**: se explica comparando con el pedido más cercano
  («Tu ficha vale 1/2. El pedido 3/4… te falta 1/4»). El primero no penaliza; los siguientes cuestan 1 movimiento.
  Al segundo error se activa la ayuda: cada ficha enseña un dibujo de lo que vale.
- Tocar un pedido da una **pista**; un segundo toque enseña la solución (ese pedido vale la mitad).
- Tras una derrota, el siguiente intento tiene un 15 % más de movimientos (hasta un 45 %).
- Con 3 estrellas en un nivel se abre también el siguiente al próximo. Modo tranquilo: 50 % más de movimientos.

## Pruebas
`node tests/fraction_merge_motor.test.mjs` · `node tests/fraction_merge_navegador.test.js` (Playwright).

## Pendiente
- Probar en clase con dispositivos reales. Dificultad ajustada con un jugador automático, no con alumnado.
