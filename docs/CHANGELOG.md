# Registro de cambios

## 0.9.2 · 17/11/2026
- **Equation Merge con la identidad πCHU**, igual que Fraction Merge: fondo crema, botones y colores de la marca, **πCHU** en el menú
  y en las ventanas de final de partida (en lugar del robot Kubo). Usa la misma hoja de estilos que Fraction Merge más lo propio de las ecuaciones.
  - Jefe final con la cara de **Incógnito X**, el personaje de Factor Clash.
  - Aspectos de la tienda iguales que en Fraction Merge: Clásico πCHU, Pizarra, Pastel y Papel.
  - Arreglo: las ecuaciones conservan los espacios («2x + 4» y no «2x+ 4»).
- **Fraction Merge:** Quebrón, el jefe final, tiene ahora la cara de **Pirata** (personaje de la marca). Es el único cambio en ese juego.
- Pruebas: motor 113 129 comprobaciones; los 13 niveles de Equation Merge superados por el jugador automático; sin errores de consola ni archivos que falten.

## 0.9.1 · 17/11/2026
- **Portada solo con el mapa de mundos.** Se quitan la mascota grande, el titular y la tarjeta «▶ Jugar / Continuar».
  Arriba queda una barra compacta: nivel con barra de experiencia, monedas, logros y ajustes.
- **Mapa más atractivo:** fondo de mar con olas y nubes, camino de baldosas, islas numeradas con el **personaje de cada mundo**
  (Divisón, Menos, Pirata, Incógnito X, Mago, Salsita, Arlequina, Pizarra, Punteo, Duende y Reglino) y **πCHU** señalando «¡Ahora en clase!».
  Los mundos cerrados enseñan su personaje en gris, como adelanto.
- Imágenes en `compartido/img/personajes/` (240 px, sacadas de Integer Ninja, Pizza Rush y Factor Clash). Cada mundo tiene su `personaje` en `MUNDOS` (`compartido/mathquest.js`).
- `MathQuest.avatarSVG` devuelve ahora la mascota πCHU en lugar de los robots.
- Se quita de la portada la lista de «Próximamente» (Pizza Rush, Laboratorio de Proporcionalidad, juegos de cartas): solo se ve lo que está en el mapa.
  Siguen en `MARCA.juegos` para volver a mostrarlos cuando estén listos.

## 0.9.0 · 17/11/2026
- **Equation Merge sustituye a Power Merge.** Juego de ecuaciones de primer grado de 1.º ESO (`applets/equation-merge/`, fuentes en `src/equation-merge/`).
  - Las fichas son números del 1 al 20; al chocar se **suman**. Las ecuaciones de arriba se resuelven entregando la ficha que es la solución.
  - 13 niveles en 5 escalones: `x + a = b`, `x − a = b`, problemas «Pienso un número…», `ax = b`, `x/a = b`, `ax + b = c`, `ax − b = c`,
    x en los dos miembros, paréntesis y el jefe **Incógnito, el Enmascarado**. Modo **balanza infinita**.
  - Pistas en dos pasos (idea de la balanza y luego la solución con comprobación). Los errores típicos (sumar en vez de restar, olvidar dividir…)
    se explican sustituyendo la x; un toque que no es un error típico solo informa, sin castigo.
  - Poderes ÷2 y −1 (en lugar de √ y ÷). Logros `eq.*` en lugar de `pm.*`.
  - Guardado nuevo `pichu.equation-merge.v1`. El de Power Merge (`pichu.power-merge.v1`) no se borra.
- Mapa de mundos: el mundo 4 · Ecuaciones pasa a jugable y el 5 · Potencias a «Próximamente» (Power Quest).
- Portada: el contador de logros solo cuenta logros de juegos actuales; el texto de Ajustes nombra Fraction Merge y Equation Merge.
- **El repositorio se pone al día con el artefacto de Claude** (versiones 0.7 y 0.8, que solo estaban allí): mapa de mundos MathQuest,
  `compartido/mathquest.js` y Fraction Merge (copiado ya compilado). Factor Clash se mantiene en la versión del repositorio (sin «πCHU Exprés», 0.6.1).
- Pruebas: motor de Equation Merge 113 129 comprobaciones; los 13 niveles superados por un jugador automático; portada 4/4 mundos jugables a 390 px sin errores de consola.

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
