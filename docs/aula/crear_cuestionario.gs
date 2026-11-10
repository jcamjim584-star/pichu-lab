/**
 * πCHU · Crea el cuestionario anónimo de los juegos en Google Forms.
 * Uso: script.google.com (con la cuenta del centro) → Nuevo proyecto → pega este código → Guardar →
 *      elige la función «crearCuestionarioPichu» → Ejecutar → autoriza. En «Registro de ejecución»
 *      aparecen el enlace para el alumnado y el enlace para editar. El formulario queda en tu Drive.
 * Es anónimo: no recoge correos ni nombres. Solo pregunta el grupo.
 */
function crearCuestionarioPichu() {
  const form = FormApp.create("πCHU · ¿Qué te han parecido los juegos?");
  form.setDescription("Es anónimo: no escribas tu nombre ni tu alias. Contesta con sinceridad: " +
    "tus respuestas sirven para mejorar los juegos y no cuentan para nota.");

  // Anonimato: no recoger correos (según la versión de Forms, funciona una u otra instrucción)
  try { form.setEmailCollectionType(FormApp.EmailCollectionType.DO_NOT_COLLECT); }
  catch (e) { try { form.setCollectEmail(false); } catch (e2) {} }
  form.setLimitOneResponsePerUser(false);   // así no hace falta registrar quién responde
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(false);
  form.setProgressBar(true);
  form.setConfirmationMessage("¡Gracias por ayudarnos a mejorar πCHU!");

  const escala = (titulo) => form.addScaleItem().setTitle(titulo).setBounds(1, 5).setLabels("Nada", "Mucho").setRequired(true);
  const opciones = (titulo, ops, obligatoria = true) => form.addMultipleChoiceItem().setTitle(titulo).setChoiceValues(ops).setRequired(obligatoria);

  form.addListItem().setTitle("Grupo").setChoiceValues(["1.º ESO A", "1.º ESO B", "1.º ESO C", "Otro"]).setRequired(true);

  form.addPageBreakItem().setTitle("A. Los juegos");
  opciones("1. ¿A qué juegos has jugado?", ["πCHU Exprés (divisibilidad)", "Pizza Rush (fracciones)", "Los dos"]);
  escala("2. Me ha gustado jugar.");
  escala("3. He entendido qué tenía que hacer sin necesitar mucha ayuda.");
  opciones("4. La dificultad me ha parecido…", ["Muy fácil", "Fácil", "Adecuada", "Difícil", "Muy difícil"]);
  opciones("5. En Pizza Rush, ¿cómo jugaste?", ["Con cuenta atrás", "En modo tranquilo", "Probé los dos", "No jugué a Pizza Rush"]);
  form.addCheckboxItem().setTitle("6. ¿Qué es lo que más te ha gustado? (puedes marcar varias)")
    .setChoiceValues(["Los retos y misiones", "Las rachas, estrellas y monedas", "La tienda y mejorar la pizzería",
      "Los compañeros con poderes (Exprés)", "La música y los efectos", "Que me explique cuando fallo"]).setRequired(false);

  form.addPageBreakItem().setTitle("B. ¿Te ha ayudado a aprender?");
  escala("7. Exprés me ha ayudado a entender los múltiplos, divisores y primos.");
  escala("8. Exprés me ha ayudado a saber cuándo usar el MCD y cuándo el mcm.");
  escala("9. Pizza Rush me ha ayudado a entender que, por ejemplo, 1/8 es más pequeño que 1/4.");
  opciones("10. ¿Jugarías en casa por tu cuenta?", ["Sí", "Quizá", "No"]);
  form.addParagraphTextItem().setTitle("11. ¿Qué cambiarías o añadirías a los juegos?").setRequired(false);

  form.addPageBreakItem().setTitle("C. Tres preguntas rápidas").setHelpText("No cuentan para nota.");
  opciones("12. ¿Qué fracción es mayor?", ["1/6", "1/3", "Son iguales"]);
  opciones("13. 1/2 + 1/4 =", ["2/6", "2/4", "3/4", "1/8"]);
  opciones("14. Dos semáforos se ponen en verde cada 20 y cada 30 segundos. Para saber cuándo coinciden, uso…", ["El MCD", "El mcm", "Una suma"]);

  // Hoja de cálculo con las respuestas, en tu Drive
  const hoja = SpreadsheetApp.create("Respuestas · Cuestionario πCHU");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, hoja.getId());

  Logger.log("Enlace para el alumnado (Classroom): " + form.getPublishedUrl());
  Logger.log("Enlace para editar el formulario: " + form.getEditUrl());
  Logger.log("Hoja de respuestas: " + hoja.getUrl());
}
