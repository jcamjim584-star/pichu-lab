# Ficha · Laboratorio πCHU (fracciones con Biología y Geología)

| | |
|---|---|
| Curso | 1.º ESO |
| Reino | 3 · Bosque de las Fracciones (el que se da en clase) |
| Saberes | Fracciones: representar (colorear), medir en la probeta, equivalentes, simplificar, operar y resolver problemas |
| Dónde | `applets/laboratorio/index.html` + `pixel-skin.css` (aspecto) + `pixel-sprites.js` (pixela las ilustraciones) |
| Origen | `jantoniolade-blip/pichu-lab`, rama `dev`, `juegos/fracciones` (commit `3e7ae85`): copia del artefacto «Laboratorio πCHU» (versión 1795021998-d019) |
| Guardado | `pichu.laboratorio.v1` → `{ alias, group, prog: { alias: progreso } }` (solo en este navegador) |

## Cómo se juega
- Seis estaciones (el planeta azul, el aire, el microscopio, la mesa del laboratorio, los ecosistemas…), cada una con 5 tareas:
  colorear, medir en la probeta, escribir y construir operaciones. Estrellas por estación.
- Pide un alias (no el nombre). Tiene «Zona docente» y justificante para Classroom (del original).

## Cambios al traerlo a GALOIS LEGACY (solo aspecto: jugabilidad sin cambios)
- Sin Google Fonts (regla 3): Lato y Pixelify Sans de `compartido/fuentes/`.
- `pixel-skin.css`: paleta GALOIS LEGACY y letras de la regla 4 (Pixelify solo en el título; Lato en textos y números).
  El cuaderno sigue claro para colorear y escribir.
- Se quita su enlace «◀ GAUSSORIA»: la vuelta la pone `volver.js` (insignia «◀ Mapa»). Rótulo «GALOIS LEGACY · BIOLOGÍA + MATES».

## Pendiente
- Probar en clase. Fraction Merge (`applets/fraction-merge/`) queda en «próximamente»; su guardado se conserva.
