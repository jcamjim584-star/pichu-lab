# Ficha · Pizza Rush (Pizzería πCHU)
Versión 0.2 · 08/11/2026 · Estado: **En pruebas** (portada πCHU 0.5.0) · Juego de fracciones de 1.º ESO

---

## 1. Por qué la v0.2
La v0.1 (un cliente cada vez, sin ritmo) le resultó aburrida a Juan Antonio. La v0.2 mezcla una **cocina frenética** (lo jugable) con una **pizzería que se mejora** entre turnos (lo que hace volver). Sin personajes. Las matemáticas y su motor son los de la v0.1.

## 2. Objetivos y errores que ataca
- Comparar fracciones, reconocer equivalencias, sumar con distinto denominador, fracciones mayores que 1, multiplicar y dividir fracciones.
- Errores: «denominador mayor = trozo mayor» (3/4 servido con 3 octavos), servir la parte de una sola persona al multiplicar, servir todo o multiplicar en vez de dividir.

## 3. Cómo se juega
- **Tickets** (2 o 3 a la vez) con pedidos y una barra de paciencia. Se elige un ticket tocándolo (o con 1, 2, 3).
- El **horno** saca pizzas cortadas de distintas formas a una **cinta/mostrador**. Prefiere los cortes que sirven para los pedidos abiertos.
- Se tocan porciones para meterlas en la **caja** del ticket y se pulsa **Enviar**. Tiene que ser exacto.
- Fallo: explicación breve (suma con denominador común + error típico), las porciones vuelven y se pierde un poco de paciencia. Al segundo fallo o si se acaba la paciencia, el pedido se pierde y se enseña una forma de servirlo.
- Preguntas «¿Cuántas porciones de 1/8 salen de 3/4?»: se contesta con un número en el propio ticket.
- **Racha**: aciertos seguidos multiplican las monedas (x2 desde 3, x3 desde 6, x4 desde 10). **Perfecto**: menor número de porciones posible.
- 🗑 tira una pizza que no sirve; desde el turno 3 la caja está cerrada (hay que calcular, no mirar).
- Modo **tranquilo** (Ajustes): sin cuenta atrás. Pausa con P o al cambiar de pestaña.

## 4. Turnos
| Turno | Contenido | Pedidos (a la vez) |
|---|---|---|
| 1 · Gran apertura | Mitades y cuartos (tutorial) | 6 (2) |
| 2 · Hora punta | Tercios y sextos | 8 (3) |
| 3 · Cortes finos | Octavos, doceavos, 6/8 sin simplificar; caja cerrada | 8 (3) |
| 4 · Mesas grandes | Mayores que 1 (5/4, «1 y 1/2») | 8 (3) |
| 5 · Pedidos en grupo | Multiplicar: «somos 3, 1/4 cada uno», «la mitad de 3/4», «2/3 de 3/4» | 8 (3) |
| 6 · A repartir | Dividir: «3/4 para 3, mi parte», «¿cuántas de 1/8 en 3/4?» | 8 (3) |
| 7 · Noche de fiesta | Todo mezclado | 10 (3) |
| 8 · Inspección del Crítico (jefe) | Condiciones: exactamente k porciones, sin 1/d, el mínimo de porciones | 8 (3) |

Estrellas: ★ 60 % servidos · ★★ 80 % · ★★★ todos y la mitad perfectos. Cada turno se desbloquea con ★ en el anterior.

## 5. Tienda y pizzería
| Mejora | Efecto | Precio |
|---|---|---|
| 🔥 Horno turbo (3 niveles) | Pizza cada 7 → 5,5 → 4,5 → 3,5 s | 120 · 260 · 450 |
| 🍽️ Mostrador XL (2) | 4 → 5 → 6 huecos | 150 · 350 |
| 🔔 Campanita de paciencia (2) | +25 % de paciencia por nivel | 100 · 240 |
| 🔪 Cortador mágico | Volver a cortar una pizza entera (equivalencias) | 300 |
| 🪙 Propina de oro | Perfecto da el doble | 220 |
| Decoración | Luces, mantel, neón, plantas (se ven en la cocina y en «Mi pizzería») | 60–150 |

Monedas por pedido: 10 (suma), 12 (¿cuántas?), 15 (multiplicar/dividir), 20 (Crítico), por la racha, +5 perfecto (+10 con Propina de oro), +5 si se sirve con más de la mitad de paciencia. Categorías por estrellas totales: Puesto callejero → Pizzería de barrio (6) → Trattoria famosa (12) → Restaurante con estrella (18) → Imperio πCHU (24).

## 6. Técnico
- `src/pizzeria/motor.js` (matemáticas, turnos, mejoras; con enteros: 1 pizza = 24/24) + `src/pizzeria/juego.html` → `python3 src/pizzeria/build.py` → `applets/pizzeria/index.html` (78 KB, sin imágenes externas).
- Guardado `pichu.pizzeria.v2` (estrellas, monedas, mejoras, decoración, ajustes); lee el alias `pichu.perfil.v1`.
- Música y sonidos generados con Web Audio. Animaciones desactivables y respeto a «reducir movimiento».
- Las imágenes de personajes de la v0.1 siguen en `src/pizzeria/personajes/` por si se usan más adelante, pero el juego no las carga.

## 7. Pruebas (08/11/2026)
- Motor (Node): 150.885 comprobaciones. Tickets de los 8 turnos siempre servibles con los cortes que da el horno; descomposición mínima comparada con fuerza bruta; horno que prefiere cortes útiles; monedas, rangos y mejoras.
- Chrome: 48/48. Tutorial, error del denominador, teclado (1, Enter, E, P, Esc), racha x2, tienda y decoración, cortador, tirar, pérdida por paciencia, los 8 turnos con 3 estrellas, los 6 tipos de pedido, categoría «Imperio πCHU», móvil de 390 px, sin errores ni peticiones externas.
- Pendiente: prueba con alumnado de 1.º ESO (sobre todo, el ritmo de la paciencia).

## 8. Decisiones abiertas
1. Ritmo por defecto: ahora hay cuenta atrás (antes se acordó modo tranquilo por defecto). ¿Lo dejamos así o tranquilo por defecto?
2. ¿Precios y velocidad de la tienda adecuados tras probarlo en clase?
3. ¿Añadir un ranking de clase por turno (como Integer Ninja)?
