"""Genera copias seudonimizadas: tapa las zonas indicadas en mascaras.json,
elimina metadatos y compone un PDF por estudiante. No modifica los originales.

Uso: python3 seudonimizar.py <dir_fotos> <mascaras.json> <dir_salida>
"""
import json, sys, glob, os
from PIL import Image, ImageDraw

def main(src, mask_file, out):
    masks = json.load(open(mask_file, encoding="utf-8"))
    os.makedirs(out, exist_ok=True)
    por_estudiante = {}
    for f in sorted(glob.glob(os.path.join(src, "e??-???.jpg"))):
        nombre = os.path.basename(f)
        if nombre not in masks:
            sys.exit(f"ERROR: {nombre} no tiene entrada en mascaras.json (revisar antes de exportar)")
        im = Image.open(f).convert("RGB")
        limpio = Image.new("RGB", im.size)          # copia sin EXIF ni perfil
        limpio.paste(im)
        d = ImageDraw.Draw(limpio)
        for x1, y1, x2, y2 in masks[nombre]:
            d.rectangle([x1, y1, x2, y2], fill=(40, 40, 40))
        cod = "E" + nombre[1:3]
        por_estudiante.setdefault(cod, []).append(limpio)
        limpio.save(os.path.join(out, f"{cod}_p{len(por_estudiante[cod])}.jpg"), quality=90)
    for cod, pags in por_estudiante.items():
        pags[0].save(os.path.join(out, f"{cod}.pdf"), save_all=True, append_images=pags[1:], resolution=200)
        print(cod, len(pags), "páginas")

if __name__ == "__main__":
    main(*sys.argv[1:4])
