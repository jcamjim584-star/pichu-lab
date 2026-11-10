# Activar el ranking en vivo y los retos de clase (unos 15 minutos)

Los **retos por código** funcionan sin hacer nada: un alumno termina un reto, pasa el código (por ejemplo `K7Q2-M9XA`) y su compañero juega la misma partida.

Para tener además el **ranking de la clase en vivo** y la **bandeja de retos**, hacen falta dos cosas:
1. Publicar el juego en una web, porque dentro de claude.ai las conexiones externas están bloqueadas.
2. Crear una Hoja de Google con el Apps Script.

## 1. Publicar el juego (elige una opción)

**Opción rápida: Netlify Drop**
1. Entra en app.netlify.com/drop con tu cuenta.
2. Arrastra la carpeta `dist` del zip. Te da una dirección del tipo `https://nombre-raro.netlify.app`.

**Opción GitHub Pages**
1. Crea un repositorio, por ejemplo `pichu-arcade`.
2. Sube `dist/index.html` dentro de una carpeta `integer-ninja/`.
3. En *Settings → Pages*, activa la rama `main`.
4. La dirección será `https://TU-USUARIO.github.io/pichu-arcade/integer-ninja/`.

## 2. Crear la Hoja y el Apps Script (con tu cuenta del centro)
1. Crea una Hoja de cálculo nueva, por ejemplo «Ranking Integer Ninja 1.º ESO C».
2. Menú **Extensiones → Apps Script**. Borra lo que haya y pega el contenido de `apps-script/Code.gs`. También puedes copiarlo desde el juego: *Ajustes → Configuración docente → Copiar código del Apps Script*.
3. En la línea `const CLAVE = 'cambia-esta-clave';` pon una palabra secreta para tu clase y guarda.
4. **Implementar → Nueva implementación → Aplicación web.**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**. Es necesario porque los alumnos no inician sesión; la clave impide que otros escriban en tu hoja.
   - Autoriza los permisos.
5. Copia la URL que termina en `/exec`.

## 3. Conectar el juego
1. Abre el juego **desde la web publicada**. Entra en Ajustes → Configuración docente.
2. Escribe el **Grupo**, pega la **URL** y la **clave**, y pulsa **Conectar y probar**.
3. Pulsa **Copiar enlace de clase** y publícalo en Classroom. Cada alumno que lo abra queda conectado a tu clase en su dispositivo.

## Qué se guarda y dónde
- Todo se guarda en **tu** Hoja, en dos pestañas:
  - **Puntuaciones:** fecha, grupo, alias, modo, nivel, puntos, objetivos, decisiones de signo y estrellas.
  - **Retos:** quién reta a quién, código, puntos y resultado.
- No se guardan nombres ni otros datos personales; usad alias pactados en clase.
- Puedes borrar filas en cualquier momento, por ejemplo si alguien escribe un alias inapropiado.
- Las partidas en modo relajado no cuentan para el ranking.
- Si un alumno no tiene conexión, su puntuación queda en cola y se envía en la siguiente partida con internet.

## Límites conocidos
- El juego envía las puntuaciones desde el propio navegador. Un alumno con conocimientos técnicos podría enviar una puntuación falsa si conoce la clave. Para evaluar, el justificante y su código siguen siendo la referencia.
- La conexión se ha probado con una simulación del Apps Script, no contra los servidores reales de Google. La primera vez, comprueba que «Conectar y probar» da ✔.
