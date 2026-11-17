# Ficha · Equation Merge
Versión 1.0 · 17/11/2026 · Estado: **Disponible** (portada πCHU 0.9.0) · Mundo 4 · Ecuaciones · 1.º ESO

---

## 1. Qué es
Juego de deslizar y fusionar (MathQuest) que **sustituye a Power Merge**. Se reutiliza su motor de tablero (rocas, hielo, poderes,
jefe, tienda, misiones, estrellas y modo infinito), pero las matemáticas son de **ecuaciones de primer grado**.

## 2. Objetivos y errores que ataca
- Resolver ecuaciones de un paso (`x + a = b`, `x − a = b`, `ax = b`, `x/a = b`) y de dos pasos (`ax ± b = c`).
- Ecuaciones con x en los dos miembros y con paréntesis. Traducir enunciados («Pienso un número…», «el doble de…»).
- Idea de **balanza**: lo que se hace en un lado se hace en el otro. **Comprobar** sustituyendo.
- Errores típicos que reconoce y explica: sumar en vez de restar (y al revés), restar el coeficiente en vez de dividir,
  confundir el resultado con la x, olvidar el segundo paso, sumar las x en vez de restarlas, multiplicar solo el primer término del paréntesis.

## 3. Cómo se juega
- **Desliza**: todas las fichas se mueven. Dos fichas que chocan **se suman** (máximo 20).
- Arriba hay **3 ecuaciones** con soluciones distintas. Se toca la ficha que es la **solución** para entregarla.
- **Pista** (tocar la ecuación): 1.ª pulsación, una orientación sin la solución; 2.ª, la resolución completa con comprobación (la ecuación vale la mitad de puntos).
- **Error típico**: ventana «Casi…» con el motivo y la sustitución (p. ej. «si x = 17, 17 + 5 = 22, no 12»). El primero no cuesta nada; después, un movimiento.
  Al segundo error se activa la **ayuda**: cada ecuación enseña su primer paso. Un toque que no es un error típico solo informa.
- **Poderes**: 🔨 martillo, ÷2 (mitad de una ficha par), −1 (resta 1), 🌀 mezcla. Cada 3 «dobles» (4 + 4) se gana un ÷2.
- Estrellas: ★★★ con 1 error como mucho y el 30 % de los movimientos sin usar. Modo tranquilo: 50 % más de movimientos.

## 4. Niveles
| Nivel | Escalón | Contenido | Movs | Ecuaciones |
|---|---|---|---|---|
| 1 Primer equilibrio | Principiante | `x + a = b` (con ayuda) | 30 | 4 |
| 2 Lo que se resta | Principiante | `x − a = b` | 40 | 5 |
| 3 La cantera | Principiante | «Pienso un número…» + rocas | 40 | 5 |
| 4 Multiplicar por x | Intermedio | `ax = b` | 50 | 6 |
| 5 Partido por | Intermedio | `x/a = b` (soluciones hasta 18) | 60 | 6 |
| 6 Hielo fino | Intermedio | Un paso mezclado + hielo | 60 | 7 |
| 7 Dos pasos | Avanzado | `ax + b = c` | 48 | 7 |
| 8 Dos pasos con resta | Avanzado | `ax − b = c` y enunciados de dos pasos | 52 | 7 |
| 9 Laberinto de roca | Avanzado | Mezcla + rocas duras | 62 | 8 |
| 10 x a los dos lados | Experto | `ax + b = cx + d` | 58 | 8 |
| 11 Paréntesis | Experto | `a(x ± b) = c` | 62 | 8 |
| 12 Todo mezclado | Experto | Todo, soluciones hasta 20, hielo y roca | 70 | 9 |
| 13 Incógnito, el Enmascarado | Jefe final | Mezcla difícil; el jefe lanza rocas y congela fichas | 80 | 10 |

Balanza infinita (se abre al superar el nivel 3): sin límite de movimientos, 3 vidas, la dificultad sube con las entregas.

## 5. Datos y privacidad
- Guardado del juego: `pichu.equation-merge.v1`. Progreso común: `pichu.mathquest.v1`. Sin nombres ni datos personales.
- El guardado de Power Merge (`pichu.power-merge.v1`) se conserva sin uso; sus logros `pm.*` ya no se cuentan.

## 6. Pruebas (17/11/2026)
- `node tests/equation_merge_motor.test.mjs`: 113 129 comprobaciones (solución única entera entre 1 y 20 en todas las formas y niveles, explicación coherente,
  errores típicos distintos de la solución, tablero, poderes).
- Jugador automático en navegador: los 13 niveles superados (8 partidas por nivel; 102 de 104 ganadas), sin errores de consola, a 390 px.
- Pendiente: probarlo con alumnado y ajustar movimientos si hace falta (`src/equation-merge/niveles.js`).
