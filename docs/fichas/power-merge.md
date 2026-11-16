# Ficha · Power Merge v1 (MathQuest)

| | |
|---|---|
| Curso | 1.º ESO |
| Saberes | Potencias de base natural, cuadrados y cubos, potencias de 10, raíces cuadradas exactas, producto y cociente de potencias de la misma base, potencia de una potencia |
| Dónde | `applets/power-merge/` (generado) · fuentes en `src/power-merge/` |
| Guardado | `pichu.power-merge.v1` (estrellas, récords, tienda, misiones) y `pichu.mathquest.v1` (XP, monedas, logros, ajustes) |

## Cómo se juega
- Se **desliza** el dedo (o las flechas): todas las fichas se mueven, como en un 2048.
- Dos fichas de la **misma base** que chocan se **multiplican**: 2² · 2³ = 2⁵ (se suman los exponentes). Bases: 2, 3, 5 y 10.
- Arriba hay tres **pedidos** escritos de otra forma (32, 2·2·2, «3 al cubo», √64, 2²·2³, 3⁵:3², (2²)³).
  Se entregan **tocando la ficha que vale eso**. Entregar no gasta movimiento.
- Las **fichas blancas** (4, 9, 25, 100…) son potencias escritas como número: hay que reconocer su base.
- **Rocas y hielo** se rompen con una fusión al lado. El **jefe** (nivel 13) lanza rocas y congela fichas cada 7 movimientos.
- **Poderes:** 🔨 martillo (tras el nivel 2), √ raíz: divide el exponente entre 2, solo si es par (tras el 4),
  ÷ divisor: resta 1 al exponente (tras el 7), 🌀 mezcla (tras el 9).
- No hay límite de tiempo: el límite son los **movimientos**.

## Niveles (se ajustan en `src/power-merge/niveles.js`)
1 Principiante (1–3): factores repetidos, cuadrados y cubos, con el valor a la vista · 2 Intermedio (4–6): potencias de 10, raíces, hielo ·
3 Avanzado (7–9): producto y cociente · 4 Experto (10–12): potencia de potencia, todo mezclado, potencias grandes · 5 Jefe final (13).
Forja infinita (se abre al superar el 3): sin límite de movimientos, 3 vidas, la dificultad sube con las entregas y baja con los errores.

## Errores y ayudas
- Tocar una ficha de la misma base que un pedido pero con otro valor es un **error**: se explica («Tu ficha: 3³ = 27. El pedido 9 = 3².
  Te has pasado…»). El primero no penaliza (segunda oportunidad); los siguientes cuestan 1 movimiento. Al segundo se activa la ayuda
  (las fichas enseñan su valor). Se detectan dos confusiones de la raíz: «√64 = 64» y «√64 = 32».
- Tocar un pedido da una **pista**; un segundo toque enseña la solución (ese pedido vale la mitad).
- Tras una derrota, el siguiente intento tiene un 15 % más de movimientos (hasta un 45 %).
- Con 3 estrellas en un nivel se abre también el nivel siguiente al próximo (salto por dominio).
- Ajustes: sonidos, música, animaciones y **modo tranquilo** (50 % más de movimientos, jefe más lento).

## Estrellas y premios
★★★ como mucho 1 error y que sobre el 30 % de los movimientos · ★★ hasta 3 errores y que sobre el 10 % · ★ superado.
Las monedas (sin valor real, no se compran) sirven para aspectos de fichas y para +1 uso de cada poder.

## Pruebas
`node tests/power_merge_motor.test.mjs` · `node tests/power_merge_navegador.test.js` (Playwright).

## Pendiente
- Probar en clase con dispositivos reales y recoger opiniones (dificultad de los niveles 7–13, música).
