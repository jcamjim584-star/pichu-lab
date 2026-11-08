"""Construye applets/pizzeria/index.html a partir de src/pizzeria/.
Mete dentro del HTML el motor (motor.js) y las imágenes de los personajes,
para que el juego sea un único archivo que funciona sin conexión.
Uso (desde la carpeta del repositorio):  python3 src/pizzeria/build.py"""
import base64, pathlib, re

AQUI = pathlib.Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
html = (AQUI / "juego.html").read_text(encoding="utf-8")
motor = (AQUI / "motor.js").read_text(encoding="utf-8")

html = html.replace("/*MOTOR*/", motor)

def imagen(m):
    ruta = AQUI / "personajes" / f"{m.group(1)}.webp"
    return "data:image/webp;base64," + base64.b64encode(ruta.read_bytes()).decode()

html = re.sub(r"\{\{IMG:(\w+)\}\}", imagen, html)
assert "{{IMG:" not in html and "/*MOTOR*/" not in html

destino = RAIZ / "applets" / "pizzeria" / "index.html"
destino.parent.mkdir(parents=True, exist_ok=True)
destino.write_text(html, encoding="utf-8")
print(f"Creado {destino.relative_to(RAIZ)} ({len(html) // 1024} KB)")
