# INTEGER NINJA · El ataque de los números enteros (πCHU ARCADE)

**Curso:** 1.º ESO · **Contenido:** números enteros (signo, comparación, orden, suma, resta, opuesto, multiplicación, división exacta, valor absoluto) · **Versión:** v0.4 (03/11/2026)

## Qué es
Un arcade de cortar frutas. Cada fruta lleva un entero; al deslizar el dedo (o el ratón con el botón pulsado) se corta y su número se incorpora a un **acumulador**. El alumnado tiene que llegar **exactamente** a un objetivo. Una **recta numérica** bajo el marcador muestra cada corte como un salto, de modo que la suma de enteros se ve como un desplazamiento.

## Modos
- **Jugar (clásico):** 90 s de objetivos exactos, con combos, multiplicadores, bombas, frutas especiales y récord.
- **Arcade:** 3 vidas y velocidad creciente (sin dejar de ser legible). Alterna objetivos exactos (con tiempo por objetivo) y misiones del tipo “Corta solo…” (negativos, positivos, < k, > k, |x| = k, opuestos).
- **Aventura:** 6 niveles. Cada uno empieza con una presentación de πCHU que explica la regla:
  1. La invasión de los signos: signo, comparación y orden.
  2. El poder de la suma.
  3. La venganza de los negativos: resta y opuestos.
  4. El laboratorio de los signos: multiplicación, división exacta y regla de los signos.
  5. La tormenta matemática: operaciones combinadas y valor absoluto.
  6. Jefe final, el Rey de los Signos: 3 fases, 10 de vida y dos ataques (bombardeo y cambio de signo del objetivo).
- **Modo relajado** (en Ajustes): sin reloj y sin perder vidas, con frutas más lentas y pistas automáticas.

## Novedades v0.2: aprender de verdad el signo menos y la regla de los signos
- 🌱 **Semillas de decisión:** al cortar −( ), la piña (×) o el coco (÷), el juego va a cámara lenta y salen dos semillas con resultados de signo contrario. Hay que cortar la correcta. Después aparece la tabla de la regla con la fila resaltada: en verde si se acierta y en coral si se falla (además, el acumulador no cambia y se pierde una vida).
- **Gemelas:** cada oleada trae la misma fruta con el signo contrario (−(−4) y −(+4), ×(−2) y ×(+2)), y los colores no delatan el resultado.
- **Misiones con expresiones:** “Corta las que dan positivo/negativo” y “Corta las que valen k”, con −( ), productos y divisiones exactas, y gemelas como trampa.
- **Guardianes** (ilustraciones propias): Fantasma de la Recta, Barón Bajo Cero, Don Menos, Mago de los Signos, Arlequina del Caos y el Rey de los Signos. En el modo arcade, rivales rotativos (incluidos el Duendecillo Negativo y el Guardián Candado).

## Novedades v0.4: retos entre compañeros y ranking
- **🥊 RETOS Y RANKING** en el menú. Un reto es una partida de 90 s con semilla: el rival recibe **los mismos objetivos en el mismo orden** y tiene que superar la puntuación. Al terminar se obtiene un **código de 8 caracteres** (con control de erratas) que se pasa al compañero; se puede copiar o compartir.
- **Ranking:** clásico, arcade, retos y aventura (estrellas). Sin conexión, muestra el ranking de los alias del dispositivo.
- **Ranking en vivo de la clase** (opcional): Apps Script en una Hoja de Google del profesor (`apps-script/Code.gs`) y enlace de clase para conectar a los alumnos. Incluye bandeja de retos, con aviso en el menú, y resultados. Ver `GUIA_RANKING_EN_VIVO.md`. Solo funciona con el juego publicado en la web (no dentro de claude.ai).
- Pruebas: Apps Script simulado (20 comprobaciones) y navegador con la red simulada (31 comprobaciones).

## Novedades v0.3: alias y justificante para Classroom
- Al pulsar JUGAR, ARCADE o AVENTURA se pide un **alias** (2–20 letras o números, sin nombre completo). Viene escrito el último que se usó, y hay botones con los alias del dispositivo. Cada alias tiene su progreso (niveles, monedas, espadas, logros, récords), así que varios alumnos pueden compartir una tableta.
- Al terminar (aventura superada, partida clásica o arcade) aparece **📜 Justificante para Classroom**: una imagen PNG (1080×1560) con alias, grupo, fecha, nivel, resultado, estrellas, puntos, decisiones de signo (aciertos y fallos de −( ), × y ÷), errores, vidas, tiempo y progreso de la aventura. Se puede guardar como imagen, compartir (móvil) o copiar como texto para pegarlo en Classroom.
- **Código de verificación** (XXX-XXX): resumen del contenido. En *Configuración docente → Comprobar un justificante* se pega el texto y el juego dice si es válido o si se ha modificado. Disuade de editar cifras, pero no es una firma infalible: un alumno con conocimientos técnicos podría falsificarlo.
- La configuración docente tiene un campo *Grupo* (sale en los justificantes). El CSV incluye la columna alias.
- El progreso anterior a la v0.3 pasa automáticamente al primer alias que se cree en ese dispositivo.

## Frutas especiales
🍋 limón (opuesto del acumulador) · 🍇 uva (valor absoluto) · 🍍 piña (× entero) · 🥥 coco (÷ entero, solo si es exacta) · 🍒 cereza (suma dos veces) · 🍉 sandía explosiva (corta las cercanas, nunca bombas) · ⭐ dorada (monedas) · 💣 bomba (anillo discontinuo y calavera, para no depender del color).

## Combos (puntúan, no cambian las cuentas)
COMBO CERO (dos opuestos en un mismo gesto), POSITIVO/NEGATIVO (3 o más frutas), EXACTO (toda la ronda en un gesto) y MEGACOMBO (4 o más frutas). Multiplicadores ×2, ×3, ×5 y ×10 por racha.

## Rigor matemático
- Motor separado (`src/engine.js`), solo con enteros, sin −0, sin dividir entre 0 y con divisiones solo exactas.
- Cada oleada se genera **a partir del acumulador actual** e incluye una solución, así que el jugador nunca queda bloqueado. El botón ↺0 vuelve a empezar y 💡 busca una solución entre las frutas visibles.
- Pruebas automáticas: `node tests/engine.test.js` hace 577.473 comprobaciones sobre 30.000 oleadas, con 0 fallos.

## Docente
Ajustes → Configuración docente: operaciones, intervalo, contenidos, bombas, especiales, ayudas, velocidad, duración y dificultad, más un preset de suma y resta de −20 a +20. Las estadísticas son locales y anónimas, y se pueden exportar o copiar en CSV.

## Progresión
Monedas, experiencia y nivel de jugador, 16 logros, récords, 6 espadas (solo cambian el aspecto) y 3 escenarios. No hay compras, publicidad ni recompensas aleatorias. Todo se guarda en `localStorage` (`pichu.integerNinja.v1`).

## Estructura
`src/` (index.html, style.css, engine.js, game.js) → `python3 build.py` → `dist/index.html` (un único HTML autocontenido, listo para GitHub Pages o Vercel). Pruebas en navegador: `node tests/browser.test.js` (Playwright).

## Pendiente / ideas
Prueba en el aula; mosaico de “tarjeta para redes”; más fases del jefe; modo de dos jugadores; ajustar el equilibrio de la puntuación con datos reales.
