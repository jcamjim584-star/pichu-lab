"""Une src/ en un único HTML autocontenido: dist/integer-ninja.html
   (la mascota πCHU va incrustada en base64 para que funcione sin archivos externos)."""
import base64, io, pathlib
root = pathlib.Path(__file__).parent


def pixelar(ruta, alto=64, colores=24):
    """Convierte una ilustración en pixel art (v0.6): la reduce a `alto` píxeles, le deja
    `colores` colores y bordes sin transparencias a medias. El navegador la amplía con
    image-rendering: pixelated. Si no está Pillow (pip install pillow), usa la original."""
    datos = ruta.read_bytes()
    try:
        from PIL import Image
    except ImportError:
        print('Aviso: sin Pillow, las imágenes no se pasan a pixel art:', ruta.name)
        return datos
    im = Image.open(io.BytesIO(datos)).convert('RGBA')
    ancho = max(1, round(im.width * alto / im.height))
    im = im.resize((ancho, alto), Image.LANCZOS)
    alfa = im.getchannel('A').point(lambda a: 255 if a >= 110 else 0)
    color = im.convert('RGB').quantize(colors=colores, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGB')
    color.putalpha(alfa)
    salida = io.BytesIO()
    color.save(salida, 'WEBP', lossless=True)
    return salida.getvalue()

src = root / 'src'
html = (src / 'index.html').read_text(encoding='utf-8')
pichu = 'data:image/webp;base64,' + base64.b64encode(pixelar(root / 'assets' / 'pichu.webp', 72)).decode()
html = html.replace('/*{{CSS}}*/', (src / 'style.css').read_text(encoding='utf-8'))
html = html.replace('/*{{ENGINE}}*/', (src / 'engine.js').read_text(encoding='utf-8'))
html = html.replace('/*{{GAME}}*/', (src / 'game.js').read_text(encoding='utf-8'))
html = html.replace('{{PICHU}}', pichu)
import json
enemies = ['rey', 'duende', 'mago', 'fantasma', 'candado', 'arlequina', 'bajocero', 'menos']
assets = {n: 'data:image/webp;base64,' + base64.b64encode(pixelar(root / 'assets' / (n + '.webp'))).decode() for n in enemies}
html = html.replace('/*{{ASSETS}}*/null', json.dumps(assets))
gs = (root / 'apps-script' / 'Code.gs').read_text(encoding='utf-8')
html = html.replace("/*{{APPS_SCRIPT}}*/''", json.dumps(gs).replace('</', '<\\/'))
out = root / 'dist'
out.mkdir(exist_ok=True)
(out / 'integer-ninja.html').write_text(html, encoding='utf-8')
(out / 'index.html').write_text(html, encoding='utf-8')
print('OK', len(html) // 1024, 'KB')
# Copia publicada en el portal πCHU LAB (no editar a mano: se regenera con este script)
portal = root.parent.parent / 'applets' / 'integer-ninja'
portal.mkdir(parents=True, exist_ok=True)
(portal / 'index.html').write_text(html, encoding='utf-8')
print('Portal:', portal / 'index.html')
