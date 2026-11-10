"""Cálculo determinista de notas por criterio y comparación de correcciones.

  python3 criterios.py notas  <examen.json> <puntuaciones.csv>
  python3 criterios.py comparar <referencia.csv> <ia.csv>
Los CSV tienen columnas: codigo,a1,...,aN
"""
import csv, json, sys
from decimal import Decimal, ROUND_HALF_UP

def redondear(x, cifras="0.01"):
    return Decimal(x).quantize(Decimal(cifras), rounding=ROUND_HALF_UP)

def notas_por_criterio(puntos, criterios):
    """puntos: {n_actividad: Decimal}; criterios: {criterio: [n_actividad,...]}"""
    out = {}
    for cr, acts in criterios.items():
        faltan = [a for a in acts if a not in puntos]
        if faltan:
            out[cr] = None            # no se cierra un criterio con actividades pendientes
            continue
        out[cr] = redondear(sum(puntos[a] for a in acts) / Decimal(len(acts)))
    return out

def leer_csv(ruta):
    filas = {}
    with open(ruta, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            filas[r["codigo"]] = {int(k[1:]): Decimal(v.replace(",", ".")) for k, v in r.items()
                                  if k != "codigo" and v not in ("", None)}
    return filas

def comparar(ref, ia):
    difs = []
    for cod in sorted(ref):
        for a in sorted(ref[cod]):
            if cod in ia and a in ia[cod]:
                difs.append((cod, a, ref[cod][a], ia[cod][a], abs(ref[cod][a] - ia[cod][a])))
    n = len(difs)
    return {
        "ejercicios_comparados": n,
        "diferencia_media": float(redondear(sum(d[4] for d in difs) / n)) if n else None,
        "pct_iguales": round(100 * sum(d[4] == 0 for d in difs) / n, 1) if n else None,
        "pct_dentro_0_5": round(100 * sum(d[4] <= Decimal("0.5") for d in difs) / n, 1) if n else None,
        "pct_dentro_1": round(100 * sum(d[4] <= 1 for d in difs) / n, 1) if n else None,
        "discrepancias_mayores_de_1": [(c, a, float(r), float(i)) for c, a, r, i, d in difs if d > 1],
    }

if __name__ == "__main__":
    if sys.argv[1] == "notas":
        ex = json.load(open(sys.argv[2], encoding="utf-8"))
        for cod, p in leer_csv(sys.argv[3]).items():
            n = notas_por_criterio(p, ex["criterios"])
            print(cod, {k: (str(v).replace(".", ",") if v is not None else "pendiente") for k, v in n.items()})
    elif sys.argv[1] == "comparar":
        print(json.dumps(comparar(leer_csv(sys.argv[2]), leer_csv(sys.argv[3])), indent=2, ensure_ascii=False))
