# Ficha · Pizzería πCHU
Versión 0.3 · 18/11/2026 · Estado: **En pruebas** (portada πCHU 0.6.5, en «Próximamente») · Juego de fracciones de 1.º ESO

---

## 1. Por qué la v0.3
- La v0.1 (un cliente cada vez, sin ritmo) resultó aburrida.
- La v0.2 «Pizza Rush» (tickets, horno, mostrador, paciencia, tienda, 8 turnos…) era **muy complicada y poco atractiva**: había que aprender muchas reglas antes de pensar en fracciones, y la fracción pedida no se veía como una sola imagen.
- La v0.3 se queda con **una sola idea**: un cliente pide un trozo de pizza y se sirve llenando **una pizza grande** con porciones. Vuelven los personajes ilustrados.

## 2. Objetivos y errores que ataca
- Reconocer fracciones como parte de una unidad; equivalencias (2/4 = 1/2, 6/8 = 3/4).
- Sumar fracciones con distinto denominador sin fórmula previa (se ve, y después se escribe la cuenta).
- Fracciones mayores que 1 (impropias y mixtas).
- Multiplicar (k · a/b, «la mitad de…», a/b de c/d) y dividir entre un número («repartir entre 3»).
- Errores: «denominador mayor = trozo mayor» (los botones dibujan el tamaño real), quedarse corto/pasarse (se dice cuánto, con denominador común).

## 3. Cómo se juega
- El cliente pide en su bocadillo: «Quiero 3/4 de pizza», «1/2 para mí y 1/4 para mi amigo», «Somos 3 y cada uno quiere 1/4».
- Se tocan las porciones (½ ⅓ ¼ ⅙ ⅛; teclas 1–5). Cada porción se coloca seguida en la pizza con su número escrito. «Quitar» y «Vaciar» corrigen.
- **¡Servir!** Tiene que ser exacto.
  - Acierto: el cliente se alegra y se enseña la cuenta (½ + ¼ = 2/4 + 1/4 = 3/4; en el menú 4, también la operación del pedido).
  - Fallo: «Te falta 1/8» o «Te sobra 1/4», con pedido y servido en denominador común. Aparece la guía y se puede corregir. Tras 2 fallos se ofrece «Ver una forma de servirlo».
- **Guía**: zona rayada + raya roja hasta donde llenar. Solo en los primeros clientes de cada menú (4, 3, 2 y 0); después, «Sin guía: ¡calcula!».
- No se puede poner más de lo que cabe en la(s) pizza(s): esos botones se desactivan.
- Sin cuenta atrás. **Contrarreloj** opcional (90 s, sin guía, gana quien sirva más) cuando el menú tiene al menos ★.

## 4. Menús
| Menú | Porciones | Pizzas | Pedidos |
|---|---|---|---|
| 1 · Medios y cuartos | ½ ¼ | 1 | 1/4, 1/2 (también 2/4 y «media pizza»), 3/4, 1 (también 4/4) |
| 2 · Tercios, sextos y octavos | todas | 1 | tercios, sextos, octavos (a veces sin simplificar) y sumas «amigas» (½ + ⅛, ⅓ + ⅙…) |
| 3 · Más de una pizza | todas | 2 | entre 1 y 2: 5/4, «1 y 1/2», 11/8, sumas que pasan de 1 |
| 4 · Para compartir | todas | 2 | «somos k, a/b cada uno», «la mitad de…», «2/3 de 1/2», «3/4 para 3 amigos: mi parte» |

8 clientes por menú. **Estrellas** según los servidos a la primera: ★★★ 8 de 8 · ★★ 6 o 7 · ★ el resto. Cada menú se abre con ★ en el anterior.
**Álbum**: 8 personajes; cada menú regala uno con ★★ y otro con ★★★.

## 5. Técnico
- `src/pizzeria/motor.js` (matemáticas con enteros: 1 pizza = 24/24; generador de pedidos, descomposición mínima, comprobación, cuenta escrita, estrellas y premios) + `src/pizzeria/juego.html` + `src/pizzeria/personajes/*.webp` → `python3 src/pizzeria/build.py` → `applets/pizzeria/index.html` (≈ 467 KB, todo dentro, sin recursos externos).
- Guardado `pichu.pizzeria.v3` (estrellas, álbum, récords, ajustes). La `pichu.pizzeria.v2` de Pizza Rush no se borra ni se migra (era otro juego). Lee el alias de `pichu.perfil.v1`.
- Sonidos generados con Web Audio (desactivables). Animaciones desactivables y respeto a «reducir movimiento».
- Accesibilidad: teclado (1–5, Retroceso, Intro, Esc), foco visible, botones ≥ 44 px, avisos con `aria-live`, la información nunca va solo por color (números en cada porción, rayas en la guía, ✓/• en el progreso), salir a mitad con doble pulsación.

## 6. Pruebas (18/11/2026)
- Motor (Node, `tests/pizzeria_motor.test.mjs`): 605.183 comprobaciones. 20.000 pedidos por menú: siempre servibles con sus porciones, caben en sus pizzas, la fracción escrita y la operación valen el objetivo, no se repite el anterior; descomposición mínima comparada con fuerza bruta; cuentas escritas; estrellas y premios.
- Navegador (Chromium, `tests/prueba_pizzeria.mjs`): 53/53. Ayuda inicial, alias, tutorial, fallo con explicación, pista tras 2 fallos, teclado, capacidad, guía que desaparece, estrellas, menús encadenados, salir con doble pulsación, guardado, los 4 menús con ★★★ y álbum completo, contrarreloj y récord, móvil de 390 px (sin desplazamiento horizontal, ¡Servir! visible), «reducir movimiento», sin errores ni peticiones externas.
- Pendiente: prueba con alumnado de 1.º ESO.

## 7. Decisiones abiertas
1. ¿Pasa a «Jugar» en la portada tras probarlo en clase?
2. ¿8 clientes por menú es buena duración para una sesión?
3. ¿Ranking de clase del contrarreloj (como Integer Ninja), cuando el centro lo autorice?
