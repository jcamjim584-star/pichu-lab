# Ficha · Pizzería πCHU
Versión 0.1 · 08/11/2026 · Estado: **En pruebas** (en la portada πCHU 0.4.0) · Juego de fracciones elegido por Juan Antonio (sustituye a Fraction Royale: no se quiere otro juego de cartas)

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

## 4. Jornadas
| Jornada | Pizzas en el mostrador | Pedidos | Novedad |
|---|---|---|---|
| 1 · Primer día | mitades y cuartos | hasta 1 | Tutorial jugando (3/4 = 1/2 + 1/4) |
| 2 · Hora punta | + tercios y sextos | hasta 1 | Pedidos que obligan a mezclar |
| 3 · Cortes finos | + octavos y doceavos | hasta 1 | Pedidos sin simplificar (6/8); **servicio en caja** (ya no se ve el plato: hay que calcular) |
| 4 · Mesas grandes | todas | de 3/4 a 2 | Mayores que 1 (5/4, «1 y 1/2») |
| 5 · Pedidos en grupo | todas | hasta 2 | **Multiplicar**: «Somos 3 y queremos 1/4 cada uno», «la mitad de 3/4», «2/3 de 3/4» |
| 6 · A repartir | todas | hasta 1 y 1/2 | **Dividir**: «3/4 para 3 personas, sírveme mi parte» y «¿cuántas porciones de 1/8 salen de 3/4?» (se contesta con un número) |
| 7 · El Crítico (jefe) | todas | — | Pedidos con condición: «con exactamente k porciones», «sin porciones de 1/d», «con el menor número de porciones» (siempre más de una) |

Cada jornada se desbloquea al superar la anterior (servir al menos al 60 % de los clientes). Estrellas: 1 = 60 %, 2 = 80 %, 3 = todos y la mitad con servicio perfecto. Propina: 10 + 5 si es al primer intento + 5 si es servicio perfecto (+5 por rapidez en contra reloj).

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
- [x] Todos los pedidos generados se pueden servir con lo que queda (comprobación masiva).
- [x] La comprobación «exacto / de menos / de más» es exacta con enteros.
- [x] El bonus de menor número de porciones calcula el mínimo real.
- [x] Los detectores de errores saltan solo cuando corresponde.
- [x] Escritorio y móvil (390 px), teclado de principio a fin, modo tranquilo, sin errores en consola.
- [ ] Prueba con alumnado de 1.º ESO.

## 8. Decisiones de Juan Antonio (08/11/2026)
1. Modo **tranquilo** por defecto (contra reloj en Ajustes).
2. Al segundo fallo **el cliente se va**, sin más castigo (se le enseña una forma correcta de servirlo).
3. Fracciones **mayores que 1** incluidas.
4. Se añaden **multiplicación y división** de fracciones.
5. Personajes dibujados por Juan Antonio. Nombres provisionales (se cambian en la lista `CLIENTES` de `src/pizzeria/juego.html`): Salsita, Capitán Porciones, Pizarrín, Reina Ración, Don Compás, Profesora Malabares, Dama del Escudo y El Crítico Gastronómico (jefe).

## 9. Errores típicos que detecta
- Pide 3/4 y sirve 3 porciones de 1/8 (o al revés): explica que con denominador mayor los trozos son más pequeños.
- Multiplicar: sirve la parte de una sola persona.
- «La mitad de…» o repartos: sirve la cantidad entera, o multiplica en vez de dividir.
- Crítico: incumple la condición aunque la cantidad sea correcta.
- Siempre: suma de lo servido con denominador común y barras «pedido / servido».

## 10. Pruebas (08/11/2026)
- Motor (Node): 97.242 comprobaciones; todos los pedidos de las 7 jornadas se pueden servir con lo que hay; mínimo de porciones comparado con fuerza bruta; evaluación exacta en 20.000 platos al azar; detectores de errores; condiciones del Crítico siempre posibles.
- Navegador (Chrome): 45/45; tutorial, fallos, cliente que se va, teclado (Enter y S), las 7 jornadas jugadas dos veces con 3 estrellas, los 6 tipos de pedido, contra reloj, móvil de 390 px, sin errores de consola ni peticiones externas.
- Pendiente: prueba con alumnado de 1.º ESO.
