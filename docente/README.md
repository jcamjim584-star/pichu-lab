# Plataforma docente · Corrector (v0.2)

Primera versión funcional del corrector de exámenes. Nombre de marca pendiente de decisión.

## Qué hace hoy
0. **Seudonimizar**: tapa a mano las zonas con datos personales de un PDF y descarga la copia que se envía a la IA.
1. **Preparar**: carga `examen.json`, los PDF de cada estudiante (`E21.pdf`…), las correcciones de la IA (`.json`) y, opcionalmente, `identidades.csv`.
2. **Revisar**: examen a la izquierda y propuesta a la derecha; lo dudoso primero; se edita puntuación, comentario y feedback; las notas por criterio se recalculan al instante.
3. **Diagnóstico**: medias por criterio y por contenido, grupos de refuerzo, consolidación y ampliación, y modo proyección sin nombres.
4. **Exportar**: Excel (hoja «Notas» con fórmulas, hoja «Actividades») y PDF corregidos (original íntegro con márgenes de notas + hoja de informe).

Todo se ejecuta en el navegador y se guarda en el dispositivo (IndexedDB). No hay servidor ni servicios de pago.
La IA no está integrada todavía por API: las correcciones se importan (modo asistente). Ver `docs/GUIA_USO.md`.

## Estructura
- `app/` — PWA (Vite + React + TypeScript).
  - `src/core/` — lógica sin interfaz: `tipos`, `criterios` (cálculo determinista), `validar`, `excel`, `pdf`, `almacen`.
  - `src/pruebas/` — pruebas automáticas con los cinco exámenes de referencia.
  - `public/contexto/` — instrucciones y esquema que se entregan a cualquier IA.
- `validacion/` — banco de prueba (exámenes seudonimizados, contexto, referencia, herramientas Python).
  `validacion/privado/` contiene datos personales y **no se versiona**.
- `docs/` — guía de uso, decisiones técnicas y pendientes.

## Instalar y ejecutar
```bash
cd app
npm install
npm test          # pruebas
npm run dev       # desarrollo
npm run build     # genera app/dist (estático; se puede alojar en cualquier servidor de archivos)
```

## Datos personales y este repositorio
Este repositorio es **público**. Aquí solo hay código y datos de prueba sin identidad (puntuaciones con códigos, sin textos ni imágenes).
Nunca se suben exámenes, nombres ni la tabla de identidades: `validacion/privado/` y `validacion/paquetes/` están excluidos.
Esta carpeta vive en la rama `corrector-docente`; no está publicada en la web de los juegos.
