"""Une src/ en un único HTML autocontenido: dist/integer-ninja.html
   (la mascota πCHU va incrustada en base64 para que funcione sin archivos externos)."""
import base64, pathlib
root = pathlib.Path(__file__).parent
src = root / 'src'
html = (src / 'index.html').read_text(encoding='utf-8')
pichu = 'data:image/webp;base64,' + base64.b64encode((root / 'assets' / 'pichu.webp').read_bytes()).decode()
html = html.replace('/*{{CSS}}*/', (src / 'style.css').read_text(encoding='utf-8'))
html = html.replace('/*{{ENGINE}}*/', (src / 'engine.js').read_text(encoding='utf-8'))
html = html.replace('/*{{GAME}}*/', (src / 'game.js').read_text(encoding='utf-8'))
html = html.replace('{{PICHU}}', pichu)
import json
enemies = ['rey', 'duende', 'mago', 'fantasma', 'candado', 'arlequina', 'bajocero', 'menos']
assets = {n: 'data:image/webp;base64,' + base64.b64encode((root / 'assets' / (n + '.webp')).read_bytes()).decode() for n in enemies}
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
