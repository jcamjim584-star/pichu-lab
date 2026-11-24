"""GALOIS LEGACY · generador de gráficos pixel art.

Crea, sin descargar nada de Internet, los gráficos de la identidad del juego:
  compartido/img/galois/logo.svg          logotipo «GALOIS LEGACY» (letras pixel propias)
  compartido/img/galois/pichu-guia.png    πCHU en pixel art (a partir de compartido/img/mascota.png)
  compartido/img/galois/heroes/<id>.png          los 8 matemáticos jugables, pequeños, para caminar por el mapa
  compartido/img/galois/heroes/<id>-retrato.png  su retrato para la pantalla «Elige tu matemático»
  compartido/img/galois/enemigos/<id>.png        enemigos de los reinos, pequeños (mapa)
  compartido/img/galois/enemigos/<id>-grande.png enemigos de los reinos, grandes (vista de lista)
  compartido/img/galois/isla-<color>.png         islas pixel de la vista de lista (verde, azul, violeta y niebla)
  compartido/img/galois/icono-192.png     icono de la app
  compartido/img/galois/icono-512.png

Los matemáticos y los enemigos salen de las hojas del Drive de GALOIS LEGACY, guardadas en
src/galois/drive/ (heroes.png, enemigos.png y atlas.json, que dice dónde está cada uno).

Uso (desde la carpeta del repositorio):
  python3 src/galois/generar_graficos.py
Necesita Pillow (pip install pillow).
"""
from pathlib import Path
from PIL import Image

RAIZ = Path(__file__).resolve().parents[2]
SALIDA = RAIZ / "compartido/img/galois"

# Paleta GALOIS LEGACY (la misma que :root de compartido/marca.css)
TINTA = "#1E1A3A"
NOCHE = "#16122C"
VIOLETA_OSC = "#4A3290"
VIOLETA = "#6A4BB8"
ORO_CLARO = "#FFE08A"
ORO = "#E8B53A"
ORO_OSC = "#B97A12"
VERDE = "#3E9A5E"
AZUL = "#3A7BC8"
PERGAMINO = "#F3ECD6"

# ---------------------------------------------------------------
# 1. Letras pixel propias (7 filas). "#" = píxel encendido.
# ---------------------------------------------------------------
LETRAS = {
    "G": [".#####.", "##...##", "##.....", "##.####", "##...##", "##...##", ".#####."],
    "A": [".#####.", "##...##", "##...##", "#######", "##...##", "##...##", "##...##"],
    "L": ["##.....", "##.....", "##.....", "##.....", "##.....", "##.....", "#######"],
    "O": [".#####.", "##...##", "##...##", "##...##", "##...##", "##...##", ".#####."],
    "I": ["####", ".##.", ".##.", ".##.", ".##.", ".##.", "####"],
    "S": [".#####.", "##...##", "##.....", ".#####.", ".....##", "##...##", ".#####."],
    "E": ["#######", "##.....", "##.....", "######.", "##.....", "##.....", "#######"],
    "C": [".#####.", "##...##", "##.....", "##.....", "##.....", "##...##", ".#####."],
    "Y": ["##...##", "##...##", ".##.##.", "..###..", "..###..", "..###..", "..###.."],
}
# Estrella de 5×5 para los destellos
ESTRELLA = ["..#..", "..#..", "#####", "..#..", "..#.."]


def palabra(texto):
    """Devuelve el conjunto de píxeles (x, y) de una palabra y su anchura."""
    pix, x = set(), 0
    for ch in texto:
        g = LETRAS[ch]
        for y, fila in enumerate(g):
            for dx, c in enumerate(fila):
                if c == "#":
                    pix.add((x + dx, y))
        x += len(g[0]) + 1
    return pix, x - 1


def dilatar(pix):
    return {(x + dx, y + dy) for (x, y) in pix for dx in (-1, 0, 1) for dy in (-1, 0, 1)}


def rects(pix, color):
    """Agrupa píxeles seguidos de cada fila en un solo rectángulo (SVG más pequeño)."""
    out, filas = [], {}
    for x, y in pix:
        filas.setdefault(y, []).append(x)
    for y, xs in sorted(filas.items()):
        xs.sort()
        ini = prev = xs[0]
        for x in xs[1:] + [None]:
            if x is not None and x == prev + 1:
                prev = x
                continue
            out.append(f'<rect x="{ini}" y="{y}" width="{prev - ini + 1}" height="1" fill="{color}"/>')
            if x is not None:
                ini = prev = x
    return out


def logo_svg():
    m = 3                                   # margen
    l1, w1 = palabra("GALOIS")
    l2, w2 = palabra("LEGACY")
    ancho = max(w1, w2) + 2 * m + 2
    sep = 10                                # distancia vertical entre líneas
    letras = {(x + m + (ancho - 2 * m - 2 - w1) // 2, y + m) for x, y in l1}
    letras |= {(x + m + (ancho - 2 * m - 2 - w2) // 2, y + m + sep) for x, y in l2}
    alto = m + sep + 7 + m + 2
    borde = dilatar(letras)
    sombra = {(x + 1, y + 1) for x, y in borde} | {(x, y + 1) for x, y in borde}
    # Relleno con bandas de 16 bits: claro arriba, oro en medio, oscuro abajo
    def banda(y):
        fila = (y - m) % sep
        return ORO_CLARO if fila <= 1 else (ORO if fila <= 4 else ORO_OSC)
    partes = rects(sombra - borde, VIOLETA_OSC) + rects(borde - letras, TINTA)
    for color in (ORO_CLARO, ORO, ORO_OSC):
        partes += rects({p for p in letras if banda(p[1]) == color}, color)
    # Brillo: un píxel blanco en la esquina superior izquierda de cada letra
    brillos = {(x, y) for (x, y) in letras if (x - 1, y) not in letras and (x, y - 1) not in letras and (x + 1, y) in letras}
    partes += rects(brillos, "#FFFFFF")
    # Destellos
    for ox, oy in ((0, 0), (ancho - 5, alto - 6)):
        partes += rects({(ox + dx, oy + dy) for dy, f in enumerate(ESTRELLA) for dx, c in enumerate(f) if c == "#"}, ORO_CLARO)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ancho} {alto + 1}" width="{ancho * 8}" '
           f'height="{(alto + 1) * 8}" shape-rendering="crispEdges" role="img" aria-label="GALOIS LEGACY">'
           f'<title>GALOIS LEGACY</title>' + "".join(partes) + "</svg>\n")
    (SALIDA / "logo.svg").write_text(svg, encoding="utf-8")
    return ancho, alto


# ---------------------------------------------------------------
# 2. πCHU en pixel art: se reduce la mascota, se limitan sus colores
#    y se le pone un contorno de 1 píxel, como un sprite de 16 bits.
# ---------------------------------------------------------------
def hex_rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def pichu_pixel(alto=64, nombre="pichu-guia.png"):
    im = Image.open(RAIZ / "compartido/img/mascota.png").convert("RGBA")
    im = im.crop(im.getbbox())
    ancho = round(im.width * alto / im.height)
    peq = im.resize((ancho, alto), Image.LANCZOS)
    # Colores limitados (como una paleta de consola): cada píxel toma el color
    # más parecido de la paleta propia de πCHU (crema, sombra, línea, verde, coral).
    PALETA_PICHU = [(246, 234, 206), (222, 203, 166), (176, 150, 118), (104, 84, 72), (44, 34, 32),
                    (96, 150, 130), (54, 98, 84), (230, 108, 78), (255, 255, 255)]
    rgb = Image.new("RGB", peq.size, (255, 255, 255))
    rgb.paste(peq, mask=peq.split()[3])
    q = rgb.copy()
    qp, rp = q.load(), rgb.load()
    for y in range(q.height):
        for x in range(q.width):
            c = rp[x, y]
            verdoso = c[1] - c[0] > 12                    # el verde solo donde el original es verde
            opciones = [p for p in PALETA_PICHU if (p[1] - p[0] > 12) == verdoso]
            qp[x, y] = min(opciones, key=lambda p: sum((p[i] - c[i]) ** 2 for i in range(3)))
    a = peq.split()[3].point(lambda v: 255 if v > 128 else 0)
    spr = Image.new("RGBA", (ancho + 2, alto + 2), (0, 0, 0, 0))
    spr.paste(q, (1, 1), a)
    # Contorno de 1 píxel en tinta
    px = spr.load()
    tinta = hex_rgb(TINTA) + (255,)
    marco = []
    for y in range(spr.height):
        for x in range(spr.width):
            if px[x, y][3] == 0 and any(
                0 <= x + dx < spr.width and 0 <= y + dy < spr.height and px[x + dx, y + dy][3] == 255 and px[x + dx, y + dy][:3] != tinta[:3]
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                marco.append((x, y))
    for p in marco:
        px[p] = tinta
    spr.save(SALIDA / nombre, optimize=True)
    return spr


def icono(spr, lado):
    """Icono: noche violeta, marco dorado pixelado y πCHU en el centro."""
    n = 32                                   # el icono se dibuja a 32×32 «píxeles gordos»
    base = Image.new("RGBA", (n, n), hex_rgb(NOCHE) + (255,))
    px = base.load()
    for i in range(n):
        for j in range(n):
            borde = min(i, j, n - 1 - i, n - 1 - j)
            if borde == 1:
                px[i, j] = hex_rgb(ORO) + (255,)
            elif borde == 2:
                px[i, j] = hex_rgb(VIOLETA_OSC) + (255,)
    # Estrellas del cielo
    for x, y in ((6, 6), (25, 8), (8, 24), (24, 25), (17, 5)):
        px[x, y] = hex_rgb(ORO_CLARO) + (255,)
    grande = base.resize((lado, lado), Image.NEAREST)
    s = spr.copy()
    escala = max(1, (lado * 70 // 100) // s.height)
    s = s.resize((s.width * escala, s.height * escala), Image.NEAREST)
    grande.alpha_composite(s, ((lado - s.width) // 2, (lado - s.height) // 2))
    grande.convert("RGB").save(SALIDA / f"icono-{lado}.png", optimize=True)


# ---------------------------------------------------------------
# 3. Matemáticos y enemigos (hojas del Drive en src/galois/drive/)
# ---------------------------------------------------------------
DRIVE = RAIZ / "src/galois/drive"


def recorte(atlas, nombre):
    """Recorta un dibujo de su hoja y quita el borde transparente."""
    a = atlas[nombre]
    hoja = Image.open(DRIVE / Path(a["atlas"]).name).convert("RGBA")
    c = hoja.crop((a["x"], a["y"], a["x"] + a["width"], a["y"] + a["height"]))
    return c.crop(c.getbbox())


def sprite(im, alto):
    """Versión pequeña de pixel art: se reduce promediando, la transparencia
    queda en sí/no y se añade un contorno de 1 píxel en tinta."""
    ancho = max(1, round(im.width * alto / im.height))
    peq = im.resize((ancho, alto), Image.BOX)
    px = peq.load()
    for y in range(peq.height):
        for x in range(peq.width):
            r, g, b, a = px[x, y]
            px[x, y] = (r, g, b, 255 if a > 110 else 0)
    spr = Image.new("RGBA", (ancho + 2, alto + 2), (0, 0, 0, 0))
    spr.paste(peq, (1, 1), peq)
    p = spr.load()
    marco = [(x, y) for y in range(spr.height) for x in range(spr.width)
             if p[x, y][3] == 0 and any(0 <= x + dx < spr.width and 0 <= y + dy < spr.height and p[x + dx, y + dy][3] == 255
                                        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
    for q in marco:
        p[q] = hex_rgb(NOCHE) + (255,)
    return spr


def personajes():
    import json
    atlas = json.loads((DRIVE / "atlas.json").read_text(encoding="utf-8"))
    n = {"heroes": 0, "enemigos": 0}
    for nombre, a in atlas.items():
        carpeta = Path(a["atlas"]).stem               # "heroes" o "enemigos" (los iconos no se usan todavía)
        if carpeta not in n:
            continue
        (SALIDA / carpeta).mkdir(exist_ok=True)
        im = recorte(atlas, nombre)
        if carpeta == "heroes":
            sprite(im, 26).save(SALIDA / carpeta / f"{nombre}.png", optimize=True)
            im.resize((96, round(96 * im.height / im.width)), Image.BOX).save(SALIDA / carpeta / f"{nombre}-retrato.png", optimize=True)
        else:
            sprite(im, 22).save(SALIDA / carpeta / f"{nombre}.png", optimize=True)
            im.resize((96, round(96 * im.height / im.width)), Image.BOX).save(SALIDA / carpeta / f"{nombre}-grande.png", optimize=True)
        n[carpeta] += 1
    return n


# ---------------------------------------------------------------
# 4. Islas de la vista de lista: disco pixel con borde, brillo y tierra debajo
# ---------------------------------------------------------------
ISLAS = {  # nombre: (claro, medio, oscuro)
    "verde": ("#DCEFE2", "#BFE3C8", "#8FC9A0"),
    "azul": ("#E2EDFA", "#C9DDF5", "#93B7E3"),
    "violeta": ("#ECE6F8", "#DCD2F3", "#B3A3E0"),
    "niebla": ("#B4AFC8", "#8C86A8", "#6E6890"),
}


def islas():
    import math
    n, r = 32, 13.6                                # lienzo de 32×36 «píxeles gordos»
    for nombre, (claro, medio, oscuro) in ISLAS.items():
        im = Image.new("RGBA", (n, n + 4), (0, 0, 0, 0))
        px = im.load()
        cx = cy = (n - 1) / 2
        dentro = lambda x, y, rr=r: math.hypot(x - cx, (y - cy)) <= rr
        tierra = "#6B4A22" if nombre != "niebla" else "#4E4866"
        for y in range(n + 4):
            for x in range(n):
                if dentro(x, y - 4) and not dentro(x, y):           # tierra que asoma por debajo
                    px[x, y] = hex_rgb(tierra) + (255,)
        for y in range(n):
            for x in range(n):
                if dentro(x, y):
                    d = (x - cx) * -0.5 + (y - cy) * 0.9          # luz de arriba a la izquierda
                    c = claro if d < -6 else (medio if d < 6 else oscuro)
                    px[x, y] = hex_rgb(c) + (255,)
        # contorno de 1 píxel en tinta
        borde = [(x, y) for y in range(n + 4) for x in range(n) if px[x, y][3] == 0 and any(
            0 <= x + dx < n and 0 <= y + dy < n + 4 and px[x + dx, y + dy][3] == 255 for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
        for q in borde:
            px[q] = hex_rgb(TINTA) + (255,)
        im.save(SALIDA / f"isla-{nombre}.png", optimize=True)


if __name__ == "__main__":
    SALIDA.mkdir(parents=True, exist_ok=True)
    w, h = logo_svg()
    spr = pichu_pixel()
    for lado in (192, 512):
        icono(spr, lado)
    n = personajes()
    islas()
    print(f"Logo {w}×{h} px de arte · πCHU {spr.width}×{spr.height} · iconos 192 y 512 · "
          f"{n['heroes']} matemáticos y {n['enemigos']} enemigos → {SALIDA.relative_to(RAIZ)}")
