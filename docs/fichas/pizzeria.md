# Ficha · Pizzería πCHU
Versión 0.1 (propuesta, 08/11/2026) · Estado: **En diseño** · Juego de fracciones elegido por Juan Antonio (sustituye a Fraction Royale: no se quiere otro juego de cartas)

---

## 1. Idea
πCHU abre una pizzería. Llegan clientes con pedidos («3/4 de pizza, por favor») y el alumno los sirve **exactos** juntando porciones de pizzas cortadas en trozos de distinto tamaño. Si sirve de menos o de más, el cliente reacciona y πCHU explica por qué con el dibujo y con el cálculo.

Pregunta clave: ¿qué entiende el alumno jugando que le costaría más con una explicación? Que **1/8 es más pequeño que 1/4 aunque 8 sea mayor que 4**, que **2/4 y 1/2 son la misma cantidad de pizza** y que para juntar trozos distintos hay que **pensar en trozos del mismo tamaño** (denominador común).

## 2. Curso y objetivos
1.º ESO (de momento la portada no muestra cursos).
- Comparar fracciones con ayuda visual y sin ella.
- Reconocer y usar fracciones equivalentes.
- Sumar fracciones con distinto denominador hasta llegar a una cantidad exacta.
- Más adelante: fracciones mayores que la unidad (1 y 1/4 = 5/4).

Errores que ataca:
1. «Denominador mayor = trozo mayor» (1/8 > 1/4).
2. Sumar numeradores y denominadores (1/2 + 1/4 = 2/6).
3. No ver la equivalencia (pedido de 1/2 cuando solo quedan cuartos u octavos).

## 3. Bucle de juego
- **Jornada** = un nivel: llegan de 5 a 8 clientes, uno detrás de otro.
- En el **mostrador** hay de 2 a 4 pizzas, cada una cortada de una forma (mitades, tercios, cuartos, sextos, octavos o doceavos). Se ven las porciones que quedan.
- El alumno toca porciones para ponerlas en el **plato** (y las quita tocándolas otra vez) y pulsa **Servir**.
- **Sin ayuda en vivo**: el plato no dice cuánto lleva. La ayuda es el propio dibujo (las porciones se ven de su tamaño real). Así se razona y no se prueba a ciegas.
- **Exacto** → cliente contento, propina (puntos) y estrellas.
- **De menos o de más** → el cliente se queja; πCHU muestra la suma con denominador común y la compara con el pedido sobre una pizza «fantasma». Las porciones vuelven al mostrador y se puede intentar otra vez. Al segundo fallo el cliente se va sin propina.
- **Bonus «servicio perfecto»**: servir con el menor número de porciones posible (ataca la equivalencia: mejor 1/2 que 4/8).
- Las porciones se gastan: los pedidos siguientes tienen que apañarse con lo que queda, lo que obliga a usar equivalencias.

## 4. Jornadas (propuesta)
| Jornada | Pizzas en el mostrador | Pedidos | Novedad |
|---|---|---|---|
| 1 | mitades y cuartos | de 1/4 a 1 | Tutorial jugando |
| 2 | + tercios y sextos | hasta 1 | Pedidos que obligan a mezclar (1/2 + 1/3) |
| 3 | + octavos | hasta 1 | Pedidos escritos sin simplificar (6/8) |
| 4 | + doceavos, mezcla de todo | hasta 1 | Porciones escasas: hay que usar equivalencias |
| 5 | todas | hasta 2 | Fracciones mayores que 1 (5/4, «1 y 1/2») |
| Jefe | todas | — | **El Crítico Gastronómico**: pedidos con condición («3/4 con exactamente 3 porciones», «2/3 sin usar tercios», «con la menor cantidad de porciones») |

Cada pedido se genera solo si **se puede servir** con las porciones que quedan (se comprueba con enteros, denominador común 24).

## 5. Tiempo y accesibilidad (DUA)
- Modo **Contra reloj**: cada cliente espera un tiempo; servir rápido da más propina.
- Modo **Tranquilo** (sin reloj), recomendado para empezar y para quien lo necesite.
- Teclado: Tab por las porciones, Enter para poner o quitar, S para servir. Botones de 44 px o más.
- Las fracciones se escriben siempre además del dibujo (nunca solo color o forma). Reducir movimiento.

## 6. Integración en la portada πCHU
- `applets/pizzeria/index.html`: un solo HTML sin librerías, con dibujos en SVG.
- Guardado `pichu.pizzeria.v1`; lee el alias común `pichu.perfil.v1`.
- Botón ← πCHU (`volver.js`); Lato local; sin servidores externos.
- Motor matemático separado dentro del archivo (aritmética exacta con enteros) y ganchos de prueba.

## 7. Criterios de aceptación
- [ ] Todos los pedidos generados se pueden servir con lo que queda (comprobación masiva).
- [ ] La comprobación «exacto / de menos / de más» es exacta con enteros.
- [ ] El bonus de menor número de porciones calcula el mínimo real.
- [ ] El detector del error 2 salta solo cuando corresponde.
- [ ] Escritorio y móvil (390 px), teclado de principio a fin, modo tranquilo, sin errores en consola.
- [ ] Prueba con alumnado de 1.º ESO.

## 8. Decisiones abiertas (para Juan Antonio)
1. ¿Modo por defecto Tranquilo o Contra reloj?
2. ¿Fallar un pedido dos veces hace que el cliente se vaya (sin más castigo) o resta una «vida» de la jornada?
3. ¿Incluimos la jornada 5 (mayores que 1) en la primera versión o la dejamos para después?
4. Clientes: ¿personajes nuevos o los de la biblioteca de πCHU (Gauss, Ada, Turing…)?
