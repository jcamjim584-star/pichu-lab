# Registro de cambios

## 1.6.1 · 25/11/2026 · La Campiña: el trigal ya no parpadea
- El trigo alternaba dos dibujos cada medio segundo para «mecerse»; en iPhone y tableta el trigal entero parecía aparecer y
  desaparecer. Ahora está quieto (`applets/campina/shared/galois-escenarios.js`); el agua sigue moviéndose.
- Publicado también en el artefacto (mismo enlace). Comprobado: «Todo correcto», sin errores en la consola.

## 1.6.0 · 25/11/2026 · Llega la Campiña al repositorio, con portada, elección de matemático y sin parpadeo
- **GALOIS LEGACY · La Campiña** (`applets/campina/`): la aventura RPG del artefacto «Galois Legacy»
  (claude.ai/artifact/TSUtLR5wQwBpbcGH6x1KAz), con sus diez mundos de la Campiña sevillana, retos, cofres y álbum de cartas.
  Preguntas, niveles, mecánicas y guardado sin cambios. Carga `volver.js`; la insignia «◀ Mapa» se esconde dentro de los
  pueblos y combates para no tapar la cruceta. De momento se abre por enlace directo (no sale en el mapa de Gaussoria).
- **Portada nueva** (`aventura/portada.js`): atardecer pixel art dibujado con código (trigal que se mece, olivos, pueblo blanco con
  campanario, molino, estrellas) y el matemático elegido en el camino. Botones «Empezar aventura» o, si ya hay progreso,
  «Continuar» y «Cambiar de matemático». Quieta si el sistema pide menos movimiento. Al volver del álbum no se repite.
- **Elige tu matemático** antes del mapa: los 11 (Galois, Gauss, Euler, Noether, Hipatia, Ada, Fibonacci, Fermat, Germain,
  Ramanujan y Al-Juarismi) con su época, su aporte y su habilidad real en combate. Se maneja con flechas y Tab. Se guarda en la
  misma clave de siempre (`galoisLegacy.heroe`), así que nadie pierde nada.
- **Arreglado el parpadeo del paisaje en iPhone y tableta al andar**: al arrastrar el dedo, la barra del navegador se movía, la
  ventana cambiaba de tamaño y cada cambio borraba el lienzo. Ahora el lienzo solo se toca si cambia de verdad y se repinta en el
  acto, y el dedo ya no arrastra la página mientras se juega.
- **Sin Google Fonts** (regla 3): Pixelify Sans (títulos y botones grandes) y Lato (textos y números) desde `assets/fuentes/`.
- El mismo arreglo, la portada y la elección se han publicado en el artefacto (mismo enlace).
- Comprobado: «Todo correcto»; portada, elección, mapa de la Campiña y pueblo en iPhone 13 (390 px), tablet y 1280 px; andar con
  la cruceta táctil mientras cambia el tamaño de la ventana sin fotogramas vacíos; sin errores en la consola y sin peticiones a
  otros servidores al jugar.
- **Pendiente (consultar)**: el juego guarda en claves `galoisLegacy.*` (la regla 2 pide `pichu.<id>.vN`), y el álbum muestra 4
  fotografías enlazadas desde otros servidores (Wikimedia y medios de prensa), lo que choca con la regla 3.

## 1.5.1 · 24/11/2026 · El mapa de Gaussoria se ve mejor en el móvil y la tablet
- **Más paisaje en el móvil**: en pantallas de menos de 600 px las casillas miden unos 26 px (antes 36), así que se ven unas
  13 × 13 casillas en vez de 10 × 9 (`compartido/gaussoria.js`).
- **La cruceta ya no tapa el mapa**: en el móvil en vertical va debajo del mapa; con el móvil en horizontal, a su derecha y el
  mapa ocupa el alto de la pantalla. En tablet y ordenador sigue en la esquina, algo más transparente.
- **Botón «Entrar» en el centro de la cruceta**: se enciende (con el texto «Entrar», no solo color) al pisar la puerta de un
  reino abierto. Así se entra aunque el panel de πCHU quede más abajo en el móvil.
- En el móvil (vertical y horizontal) la cabecera deja de ir fija arriba para no ocupar media pantalla.
- Comprobado: «Todo correcto»; mapa en iPhone 13 (vertical y horizontal), Android de 320 px, tablet vertical y horizontal y
  1280 px; sin errores en la consola, sin desbordamiento; la cruceta mueve al personaje y «Entrar» abre el Laboratorio.

## 1.5.0 · 20/11/2026 · El Laboratorio πCHU sustituye a Fraction Merge; Equation Merge, próximamente
- **Reino 3 (Fracciones): Laboratorio πCHU** (`applets/laboratorio/`), de `jantoniolade-blip/pichu-lab` (rama `dev`,
  `juegos/fracciones`, copia del artefacto «Laboratorio πCHU»): fracciones con Biología y Geología en 6 estaciones.
  Jugabilidad sin cambios. Sin Google Fonts (letras locales), paleta y letras GALOIS LEGACY en su capa pixel, rótulo nuevo y
  vuelta con la insignia «◀ Mapa». Guarda en `pichu.laboratorio.v1`.
- **Fraction Merge y Equation Merge pasan a «próximamente»**: el reino 4 queda en la niebla. Los juegos siguen en `applets/` y
  sus guardados no se tocan; salen de la caché sin conexión.
- Portada: los logros solo cuentan los de juegos disponibles (si no hay ninguno, el botón no aparece) y el texto de ajustes ya no
  nombra juegos retirados.
- Comprobado: «Todo correcto»; lista de reinos, Laboratorio (menú y alias) a 360, 390 y 1280 px, sin errores en la consola, sin
  desbordamiento y sin peticiones a otros servidores.

## 1.4.0 · 20/11/2026 · Minas de los Primos sustituye a Factor Clash
- **Juego nuevo en el reino 1: Divisibilidad exprés** (`applets/minas/`), el modo fácil de πCHU ROYALE
  (`jantoniolade-blip/pichu-lab`, rama `dev`, `juegos/divisibilidad/facil.html`): 10 preguntas de 4 opciones contra Múltiplax o
  Prímox, sin perder vidas, con explicación tras cada respuesta. `motor.js` es copia literal (mismas preguntas y corrección).
- Adaptado a las reglas: letras locales en lugar de Google Fonts, paleta y marco pixel GALOIS LEGACY, el matemático del mapa como
  acompañante, guardado `pichu.minas.v1`, ✔/✘ además del color, una columna de temas en el móvil y resumen de estrellas en el mapa.
- **Factor Clash** pasa a «pronto» y deja de abrirse desde el mapa; el juego sigue en `applets/expres/` y su guardado
  `pichu.expres.v3` no se toca. Sale de la caché sin conexión (1,5 MB menos).
- Comprobado: «Todo correcto»; partida completa con teclado (teclas 1–4), récord guardado, resumen en el mapa, a 390 px sin
  desbordamiento, sin errores en la consola y sin ninguna petición a otros servidores.

## 1.3.0 · 20/11/2026 · Todo en pixel art (portada) y marco Galois en los juegos
- **Estilo pixel en toda la portada y en las páginas propias:** esquinas rectas y bordes «escalonados» (sin esquinas,
  dibujados con sombras), botones con relieve de consola de 16 bits, pergamino con punteado pixel, pie de noche con almenas,
  ventanas de logros y ajustes, «Mis datos», alias, cruceta y fichas de la cabecera con el mismo marco.
- **Islas de la vista de lista en pixel art** (`compartido/img/galois/isla-verde|azul|violeta|niebla.png`, generadas por
  `src/galois/generar_graficos.py`) en lugar de círculos de CSS.
- **Marco Galois en los juegos** (`compartido/volver.js`): la insignia «◀ Mapa» es pixel, con la cara del matemático elegido
  y letra pixel propia («GaloisPixel», para no pisar las letras del juego). Mide 44 px (antes 40, por debajo del mínimo).
- **Arreglo:** el enlace de volver apuntaba a `../../index.html` desde `compartido/`, que en GitHub Pages (`/pichu-lab/`) se salía
  de la web. Ahora va a `../index.html` (comprobado sirviendo la web en `/pichu-lab/`).
- No cambia el interior de ningún juego (será el paso siguiente, juego a juego) ni ningún guardado.
- Comprobado: «Todo correcto»; inicio, elegir, mapa, lista, logros, privacidad y Fraction Merge con la insignia a 390 y 1280 px,
  sin errores en la consola ni desbordamiento horizontal.

## 1.2.1 · 20/11/2026
- **Arreglo:** en la primera visita la web ya no se recarga sola al activar el modo sin conexión (si el alumno pulsaba
  «Empezar» en ese momento, volvía a la pantalla de inicio). Solo se recarga al instalar una actualización.
- Los matemáticos no tendrán habilidades: solo cambian el aspecto (hoja de ruta actualizada). Galois se añadirá cuando tenga sprite.

## 1.2.0 · 20/11/2026 · Elige tu matemático y personajes del Drive
- **Elige tu matemático**: al empezar la aventura se elige entre los 8 matemáticos del Drive (Hipatia, Ada Lovelace, Emmy Noether,
  Sophie Germain, Gauss, Fibonacci, Ramanujan y Al-Juarismi), cada uno con su época y una frase. Ese matemático es el que camina
  por el mapa (mira hacia el lado al que anda y da un saltito en cada paso). Botón «Cambiar de matemático» en cualquier momento.
- **Enemigos del Drive** junto a cada reino, en el mapa y en la vista de lista: Primox (divisibilidad), Negatrón (enteros),
  Denominadorón (fracciones), Incógnita X (ecuaciones), Potenciator, Porcentajín, Polinomio mutante, Pendientor, Mediana traviesa
  y Dado caótico. Geometría no tiene enemigo todavía (no hay ninguno en el Drive). Sustituyen a las imágenes .webp en la portada;
  los juegos siguen usando sus personajes de siempre.
- **Se quita el πCHU pequeño** que seguía al explorador (y el explorador provisional). πCHU sigue como guía en el bocadillo.
- Hojas originales del Drive en `src/galois/drive/`; `generar_graficos.py` crea `compartido/img/galois/heroes/` y `enemigos/`.
- `MUNDOS` gana el campo `enemigo`; lista nueva `HEROES`. `pichu.galois.v1` guarda también `heroe` (campo nuevo, sin cambiar los demás).
- `tests/comprobar.mjs`: cada matemático y cada enemigo usado tiene sus imágenes y están en la caché sin conexión.
- Comprobado: «Todo correcto»; en Chromium a 390 y 760 px, sin errores en la consola ni desbordamiento: inicio → elegir → mapa,
  caminar, cambiar de matemático (queda marcado el elegido) y vista de lista con los enemigos nuevos.

## 1.1.0 · 20/11/2026 · GALOIS LEGACY, fase 2 (mapa explorable)
- El **Mapa de Gaussoria** se puede recorrer en vista cenital (pixel art de 16×16): un **explorador** provisional camina por los
  caminos con **πCHU** detrás. Cada reino es un edificio con su número y su personaje; al pisar la puerta, πCHU cuenta qué reino es
  y qué juego abre, y aparece el botón «Entrar en …». Los reinos sin juego tienen candado y niebla («¡muy pronto!»).
- Controles: flechas o W A S D (con el mapa enfocado) e Intro para entrar; cruceta táctil en la esquina del mapa; tocar o hacer
  clic en un sitio lleva andando hasta allí (si se toca un edificio, hasta su puerta).
- **Ver como lista**: la vista de islas anterior sigue disponible con un botón; la web recuerda la vista elegida.
- Accesibilidad: el lienzo tiene nombre e instrucciones, se anuncia la llegada a cada puerta (aviso `aria-live`), botones de 48 px,
  y sin animaciones (sistema o ajuste de los juegos) el explorador salta de casilla en casilla y el agua no se mueve.
- Archivo nuevo `compartido/gaussoria.js` (terreno en letras y motor). `MUNDOS` gana el campo `puerta: [columna, fila]`.
- Guardado nuevo `pichu.galois.v1` (posición del explorador y vista). **No cambia ningún guardado anterior ni ningún juego.**
  Al volver de un juego, el explorador aparece en la puerta por la que entró.
- `src/galois/generar_graficos.py` crea también `pichu-mini.png` (πCHU pequeño que sigue al explorador).
- `tests/comprobar.mjs`: cada reino tiene puerta, su edificio cabe sobre terreno libre sin montarse en otro, se entra desde abajo
  y se llega andando desde la salida.
- Privacidad y accesibilidad explican el mapa y la clave nueva.
- Comprobado: `node tests/comprobar.mjs` «Todo correcto»; en Chromium a 390, 760 y 1280 px sin errores en la consola ni
  desbordamiento horizontal; caminar con teclado, cruceta y toque; entrar con Intro en Fraction Merge y volver a la misma puerta;
  reino en la niebla sin botón de entrar; vista de lista recordada al recargar; modo sin movimiento.

## 1.0.0 · 19/11/2026 · GALOIS LEGACY, fase 1 (identidad)
- πCHU pasa a ser **GALOIS LEGACY · El legado de los matemáticos — un juego de πCHU LAB**. Solo 1.º ESO.
- **Pantalla de inicio** nueva: logo pixel art, subtítulo y πCHU (guía y compañero) contando la historia de Gaussoria en 4 pasos.
- El Mapa de mundos pasa a ser el **Mapa de Gaussoria**: cada tema es un reino (Minas de los Primos, Reino de Hielo y Fuego,
  Bosque de las Fracciones, Fortaleza del Álgebra…) y debajo se ve el juego que abre. Los reinos sin juego están «en la niebla».
  Los personajes de cada isla se mantienen (por ahora hacen de enemigos y jefes).
- Paleta nueva (verdes, azules, dorados y violetas) en `:root` de `marca.css`, con contraste AA comprobado. Los nombres de color
  antiguos siguen funcionando como alias. Estilo pixel: esquinas rectas, bordes gruesos y sombras duras.
- Letra pixel **Pixelify Sans** (OFL, en `compartido/fuentes/`) solo en títulos grandes; Lato en textos y números.
- `src/galois/generar_graficos.py` crea el logo (letras pixel propias), πCHU en pixel art y los iconos de la app (`compartido/img/galois/`).
- Botón de los juegos: «← πCHU» pasa a «← Mapa» con los colores nuevos. Manifiesto, privacidad y accesibilidad con el nombre nuevo.
- `CLAUDE.md`: se cambian la regla 1 (los juegos se pueden adaptar sin quitar preguntas, niveles ni progreso) y la regla 4 (marca GALOIS LEGACY).
- Arreglo: la portada tenía un envoltorio HTML duplicado (dos `<!doctype>` y dos `<body>`) que venía del artefacto.
- No cambia ningún juego ni ningún guardado.
- Comprobado: `node tests/comprobar.mjs` «Todo correcto»; inicio, mapa, un juego y privacidad a 390, 768 y 1280 px sin errores
  en la consola y sin desbordamiento horizontal; el foco pasa al título del mapa al empezar.

## 0.9.2 · 18/11/2026
- El repositorio se pone al día con el artefacto publicado en Claude (de 0.6.4 a 0.9.2), para poder editarlo también con Codex.
- **Portada nueva: Mapa de mundos.** 11 islas (una por tema de 1.º ESO) unidas por un camino, con el personaje de cada juego;
  πCHU señala el tema que se da en clase. Barra del jugador con nivel, monedas, logros y ajustes.
- `compartido/mathquest.js`: progreso común de los juegos (`pichu.mathquest.v1`), lista de mundos y logros.
- `compartido/img/personajes/`: 11 personajes en `.webp`.
- Juegos nuevos: **Fraction Merge** (`applets/fraction-merge/`) y **Equation Merge** (`applets/equation-merge/`).
  Solo está el HTML generado; faltan sus fuentes en `src/`.
- Comprobado: `node tests/comprobar.mjs` «Todo correcto», portada y juegos nuevos a 390 px sin errores en la consola.

## 0.6.4 · 11/11/2026
- Logo del IES Alarifes Ruiz Florindo en el recuadro del centro (`compartido/img/centro.jpg`, sacado del Drive del centro y sin metadatos).

## 0.6.3 · 11/11/2026
- La portada muestra al pie un recuadro del **Departamento de Matemáticas · IES Alarifes Ruiz Florindo**. Los datos están en `MARCA.centro` (`compartido/marca.js`).
  El logo del centro se añadirá en `compartido/img/centro.png` cuando se tenga la imagen; mientras tanto solo se ve el texto.

## 0.6.2 · 11/11/2026
- **Arreglo de actualizaciones:** el modo sin conexión daba prioridad a la copia guardada y algunos dispositivos seguían viendo la versión antigua.
  Ahora, con Internet, siempre se carga lo último publicado; la copia guardada solo se usa sin conexión. La versión nueva se instala sola.

## 0.6.1 · 11/11/2026
- **Integer Ninja** arranca directamente en el **modo aventura** (mapa de niveles). Si no hay alias, lo pide primero. Con `?menu` se abre el menú.
- **Factor Clash:** el juego ya no muestra el nombre «πCHU Exprés» (título, cabecera y récord). El guardado `pichu.expres.v3` no cambia.
- **Pizza Rush** pasa a «Próximamente» en la portada. El juego sigue en `applets/pizzeria/` para seguir puliéndolo.

## 0.6.0 · 10/11/2026
- **Integer Ninja v0.5 entra en el portal** (`applets/integer-ninja/`, fuentes en `src/integer-ninja/`). Ya no se abre en Netlify.
  - El botón principal **▶ JUGAR** abre el **modo aventura**; el clásico pasa a «🎯 MODO CLÁSICO».
  - Se quita la misión «CORTA DE MENOR A MAYOR» (nivel 1 y motor).
  - **Bombas detrás de las frutas:** su zona de corte es más pequeña, no explotan si en el mismo trazo cortas la fruta que las tapa
    ni durante 150 ms junto a una fruta recién cortada, el gesto se corta al salir las semillas y el modo toque prefiere la fruta.
  - Se recuperan las decisiones de la v0.5: un fallo de misión o de semilla resta 50 puntos (nunca por debajo de 0) y no quita vida;
    las vidas solo se pierden con bombas y al acabarse el tiempo; estrellas 3 = sin perder vidas y ≤1 fallo, 2 = ≤1 vida y ≤4 fallos;
    sello «✔ SUPERADO» en el mapa.
  - Lato desde `compartido/fuentes` (sin Google Fonts) y botón «← πCHU». El ranking no viene preconfigurado.
- Pruebas: motor 899.015 comprobaciones, navegador 101/101, retos 31/31, Apps Script 20/20, portada 23/23.

## 0.5.1 · 10/11/2026
- En la portada, «πCHU Exprés» pasa a llamarse **Factor Clash** (duelos de divisibilidad). El juego y su guardado no cambian.

## 10/11/2026 · Materiales de aula
- `docs/aula/`: guía docente (sesiones, evidencias, lista de cotejo, rúbrica, DUA, errores típicos, registro de la prueba), fichas del alumnado de Exprés y Pizza Rush con solucionario, y cuestionario anónimo listo para Google Forms.
- Web publicada en https://jcamjim584-star.github.io/pichu-lab/

## 0.5.0 · 08/11/2026
- La Pizzería se rehace como **Pizza Rush** (v0.2), porque la v0.1 resultaba aburrida. Sin personajes.
  - Turnos frenéticos: tickets con cuenta atrás, horno que saca pizzas a una cinta, cajas por pedido, rachas x2/x3/x4, «¡PERFECTO!», confeti, música y efectos generados en el navegador.
  - Entre turnos, **tienda**: Horno turbo, Mostrador XL, Campanita de paciencia, Cortador mágico (equivalencias), Propina de oro y decoración (luces, mantel, neón, plantas). La pizzería sube de categoría con las estrellas.
  - 8 turnos (el 7 mezcla todo y el 8 es el jefe). Modo tranquilo en Ajustes. Teclado completo.
  - El horno prefiere los cortes que sirven para los pedidos abiertos; los resultados siempre se escriben con los cortes del turno.
- Pruebas: 150.885 comprobaciones del motor y 48/48 en Chrome.

## 0.4.0 · 08/11/2026
- Nuevo juego: **Pizzería πCHU v0.1** (`applets/pizzeria/`, fuentes en `src/pizzeria/`).
  - 7 jornadas: mitades y cuartos · tercios y sextos · octavos, doceavos y equivalencias (servicio en caja) · más de una pizza · multiplicar · dividir · jefe (el Crítico Gastronómico).
  - Modo tranquilo por defecto (contra reloj opcional); al segundo fallo el cliente se va.
  - Detecta el error del denominador, «la parte de una sola persona» y «multiplicar en vez de dividir»; barras de comparación pedido/servido.
  - Personajes de Juan Antonio; motor con enteros (1 pizza = 24/24).
- Pruebas: 97.242 comprobaciones del motor en Node y 45/45 en Chrome.

## 0.3.0 · 08/11/2026
- La portada se organiza por **juegos** (Juegos · Próximamente), sin cursos ni filtro. Los cursos siguen guardados en `marca.js` (`mostrarCursos: false`) para usarlos más adelante.
- Se retira Fraction Royale de la portada: el juego de fracciones se replantea sin cartas. Su código queda en el historial de git (versión 0.2.0).

## 0.2.0 · 07/11/2026
- Nuevo juego: **Fraction Royale v0.4** (`applets/fraction-royale/`).
  - Predicción obligatoria de la suma antes de jugar 2 o más cartas (+1 al multiplicador si acierta, +1 extra cada 3 aciertos).
  - Detector del error típico (sumar numeradores y denominadores) con explicación del denominador común.
  - Sin ayuda en vivo salvo en el tutorial o con la opción «Profesorado».
  - Nuevo jefe, el Gigante del Denominador: retos de ordenar fracciones en la recta (escudo roto = +1 descarte).
  - Guardado en claves `pichu.fraction-royale.*` con migración desde la v0.3; Lato local.
- Pruebas: 33/33 de Fraction Royale (3,1 millones de sumas comprobadas, 3.000 retos, equilibrio, interfaz) y 22/22 de la portada.

## 0.1.0 · 07/11/2026
- Portada πCHU con catálogo agrupado por curso y filtro.
- πCHU Exprés v4 integrado sin cambios en su código (solo se añade el botón ← πCHU).
- Alias común `pichu.perfil.v1`; descargar, cargar y borrar datos (solo claves `pichu.`).
- App instalable y sin conexión (service worker con caché versionada; no intercepta Apps Script).
- Lato alojada en la propia web; páginas de privacidad y accesibilidad.
- Comprobaciones automáticas (`tests/comprobar.mjs`) y publicación en GitHub Pages con Actions.
- Pruebas en Chrome: 22/22 superadas (escritorio, móvil 390 px y sin conexión).

### Pendiente
- Integer Ninja: enlazado a Netlify (v0.5); copiarlo a applets/ con su src/.
- Fracciones: el Laboratorio se replanteará y Fraccionario queda aparcado (fuera de la portada por ahora).
- Prueba en aula y en la red del centro.
