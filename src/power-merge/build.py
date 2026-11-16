"""Construye applets/power-merge/index.html a partir de src/power-merge/.
Mete dentro del HTML el motor (motor.js) y los niveles (niveles.js),
para que el juego sea un único archivo.
Uso (desde la carpeta del repositorio):  python3 src/power-merge/build.py"""
import pathlib

AQUI = pathlib.Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
html = (AQUI / "juego.html").read_text(encoding="utf-8")
html = html.replace("/*MOTOR*/", (AQUI / "motor.js").read_text(encoding="utf-8"))
html = html.replace("/*NIVELES*/", (AQUI / "niveles.js").read_text(encoding="utf-8"))
assert "/*MOTOR*/" not in html and "/*NIVELES*/" not in html

destino = RAIZ / "applets" / "power-merge" / "index.html"
destino.parent.mkdir(parents=True, exist_ok=True)
destino.write_text(html, encoding="utf-8")
print(f"Creado {destino.relative_to(RAIZ)} ({len(html) // 1024} KB)")
