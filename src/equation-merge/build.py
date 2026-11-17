"""Construye applets/equation-merge/index.html a partir de src/equation-merge/.
Mete dentro del HTML el motor (motor.js) y los niveles (niveles.js) para que el juego
sea un único archivo que funciona sin conexión.
Uso (desde la carpeta del repositorio):  python3 src/equation-merge/build.py
No edites applets/equation-merge/index.html a mano: se sobrescribe con este script."""
import pathlib

AQUI = pathlib.Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
html = (AQUI / "juego.html").read_text(encoding="utf-8")
html = html.replace("/*MOTOR*/", (AQUI / "motor.js").read_text(encoding="utf-8"))
html = html.replace("/*NIVELES*/", (AQUI / "niveles.js").read_text(encoding="utf-8"))
assert "/*MOTOR*/" not in html and "/*NIVELES*/" not in html
assert "compartido/volver.js" in html, "Falta el botón de volver (regla 1)"

destino = RAIZ / "applets" / "equation-merge" / "index.html"
destino.parent.mkdir(parents=True, exist_ok=True)
destino.write_text(html, encoding="utf-8")
print(f"Creado {destino.relative_to(RAIZ)} ({len(html) // 1024} KB)")
