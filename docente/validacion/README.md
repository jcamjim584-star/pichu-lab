# Validación del corrector con IA (Fase 1)

Banco de prueba del examen T2 Proporcionalidad, Matemáticas A 4.º ESO, versión B (10/11/2026).

| Carpeta | Contenido |
|---|---|
| `paquetes/` | Copias seudonimizadas: `E##.pdf` y sus páginas en JPG. Es lo único que se envía a una IA. |
| `contexto/` | `examen.json` (enunciados, soluciones, baremo, criterios, decisiones docentes), `instrucciones_correccion.md` y `esquema_correccion.json`. |
| `herramientas/` | `seudonimizar.py` + `mascaras.json`, `criterios.py` (notas por criterio y comparación) y sus pruebas. |
| `privado/` | Originales e `identidades.csv` (código ↔ nombre). No se comparte ni se versiona. |

## Uso
```bash
python3 herramientas/seudonimizar.py trabajo herramientas/mascaras.json paquetes
python3 herramientas/criterios.py comparar referencia/notas_docente.csv resultados/ia.csv
cd herramientas && python3 -m unittest test_criterios
```

## Prueba con un asistente (ChatGPT, Claude u otro)
Una conversación nueva por estudiante: adjuntar `E##.pdf`, `examen.json` y `esquema_correccion.json`,
pegar `instrucciones_correccion.md` y guardar el JSON devuelto como `resultados/<modelo>/E##.json`.

## Pendiente
- Notas de referencia del profesor (ejercicio a ejercicio).
- Sexto examen, de perfil bajo o de lectura difícil; y versión A.
- Enunciados transcritos de fotos: confirmar con el documento original.
