# Ficha · Pizza Duel (antes Pizza Rush)
Versión 0.3 · 17/11/2026 · Estado: **En pruebas**, 2 de 8 rivales (portada πCHU 0.7.0, tarjeta en «Próximamente») · Juego de fracciones

---

## 1. Por qué Pizza Duel
La v0.2 (Pizza Rush, cocina con tickets y tienda) no resultaba lo bastante emocionante. Pizza Duel mantiene las mismas
matemáticas y el mismo motor, pero cada partida es un **duelo** contra un chef rival con personaje, vida y frases.
Es el mismo esquema que funciona en Factor Clash: rival con cara, partida corta, reto claro.

## 2. Objetivos y errores que ataca
- Comparar fracciones, reconocer equivalencias, sumar con distinto denominador, fracciones mayores que 1, multiplicar y dividir.
- Errores: «denominador mayor = trozo mayor» (3/4 servido con 3 octavos), servir la parte de una sola persona al multiplicar,
  servir todo o multiplicar en vez de dividir. **Nuevo:** El Compás obliga a buscar la fracción equivalente
  (2/3 no se puede servir como 1/2 + 1/6; hay que usar 2 tercios o 4 sextos).

## 3. Cómo se juega
- El rival pide una **comanda** con reloj. Se tocan porciones de las pizzas del mostrador para ponerlas en el **plato** y se pulsa **Servir**.
- Exacto → **golpe**: −20 de vida. Con el menor número de porciones → **golpe crítico** (−30). Servir con más de la mitad del tiempo: +5.
- Fallo: explicación (suma con denominador común y error típico), las porciones vuelven y el reloj pierde un 20 %.
  Segundo fallo o fin del tiempo → el rival **ataca**: −1 corazón (hay 3) y se enseña una forma de servirlo.
- **Superpoder** ⚡: se carga con 3 golpes (se pierde si el rival te ataca). Congela el reloj 8 s, el horno saca una pizza al momento y el siguiente golpe hace doble daño.
- El horno saca pizzas solo (cada 5 s, 4 huecos) y prefiere los cortes útiles para la comanda. 🗑 tira una pizza que no sirve.
- En los dos primeros rivales el plato dibuja la pizza que llevas; a partir del tercero solo se ven las porciones («caja cerrada»).
- **Modo tranquilo** (Ajustes): sin reloj; el rival solo ataca si fallas dos veces. Pausa con P o al cambiar de pestaña.
- Teclado: Tab y Enter para coger porciones · E servir · V vaciar · S superpoder · P pausa.

## 4. Rivales
| Duelo | Rival | Contenido | Regla | Vida | Estado |
|---|---|---|---|---|---|
| 1 | Salsita | Mitades y cuartos (tutorial) | Ninguna | 80 | **Jugable** |
| 2 | El Compás | Tercios y sextos | Solo porciones iguales | 100 | **Jugable** |
| 3 | La Malabarista | Octavos, doceavos, 6/8 sin simplificar | Recorta tus pizzas de otra forma | 100 | Próximamente |
| 4 | El Escudo | Mayores que 1 (5/4, «1 y 1/2») | Medio golpe si no usas el mínimo de porciones | 100 | Próximamente |
| 5 | La Pizarra | Multiplicar | Pedidos en grupo | 100 | Próximamente |
| 6 | El Pirata | Dividir | Si tardas, te roba una pizza | 100 | Próximamente |
| 7 | La Reina | Todo mezclado | Porciones iguales + escudo | 110 | Próximamente |
| 8 | El Crítico (jefe) | Pedidos con condiciones | 3 fases: exactamente k porciones · una prohibida · el mínimo | 150 | Próximamente |

El motor ya genera y comprueba las comandas de los 8 rivales (incluidas las reglas «iguales», «escudo» y las fases del Crítico).
Falta la parte de pantalla de La Malabarista y El Pirata, y probar el ritmo de cada uno.

**Estrellas:** ★ ganar · ★★ ganar con 2 corazones o más · ★★★ ganar sin perder ningún corazón. Cada rival se desbloquea con ★ en el anterior.

## 5. Técnico
- `src/pizzeria/motor.js` (matemáticas, rivales, reglas y daño; con enteros: 1 pizza = 24/24) + `src/pizzeria/juego.html`
  → `python3 src/pizzeria/build.py` → `applets/pizzeria/index.html` (unos 500 KB, con los personajes incrustados; sin recursos externos).
- Rivales jugables: `LISTOS` en `juego.html`.
- Guardado `pichu.pizzeria.v3` (estrellas por rival, tutorial, ajustes). La primera vez copia estrellas y ajustes de `pichu.pizzeria.v2`
  (cada turno de Pizza Rush → el rival del mismo número) **sin borrar** la v2. Lee el alias de `pichu.perfil.v1`.
- Música (bucle original en menor) y sonidos generados con Web Audio. Animaciones desactivables y respeto a «reducir movimiento».
- Ya no hay tienda ni monedas. El código de Pizza Rush sigue en el historial de git.

## 6. Pruebas (17/11/2026)
- Motor (Node, `node tests/pizzeria_motor.test.mjs`): 203.595 comprobaciones. Las de Pizza Rush siguen pasando. Además: las comandas de los 8 rivales
  siempre se pueden servir con los cortes que da el horno, la regla de iguales siempre tiene solución y su mínimo es correcto, fases del Crítico,
  daño (normal, crítico, rápido, superpoder, escudo), estrellas, desbloqueo y migración de estrellas.
- Chrome (`node tests/prueba_pizza_duel.mjs`): 45/45. Mapa, migración desde v2, tutorial, golpe crítico, fallo y ataque, fin del tiempo,
  pausa, superpoder y golpe doble, victoria y desbloqueo, regla de El Compás con su explicación, derrota, modo tranquilo, teclado,
  móvil de 390 px (sin desplazamiento lateral, botones ≥ 44 px, arena siempre a la vista), sin errores ni peticiones externas.
- Pendiente: prueba con alumnado (sobre todo el tiempo por comanda y la vida de cada rival).

## 7. Decisiones abiertas
1. ¿Tiempo por comanda adecuado (45 s Salsita, 42 s El Compás)? ¿Reloj por defecto o modo tranquilo por defecto?
2. ¿Recuperar la tienda más adelante como «desbloquear superpoderes»?
3. ¿Ranking de clase por rival (como Integer Ninja)?
