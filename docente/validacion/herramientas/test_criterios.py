import json, os, unittest
from decimal import Decimal as D
from criterios import notas_por_criterio, leer_csv, comparar, redondear

BASE = os.path.join(os.path.dirname(__file__), '..', '..', 'app', 'src', 'pruebas', 'datos')
CRIT = json.load(open(os.path.join(BASE, 'examen.json'), encoding="utf-8"))["criterios"]
# Notas impresas en los cinco PDF corregidos aportados por el profesor

class T(unittest.TestCase):
    def test_redondeo_mitad_hacia_arriba(self):
        self.assertEqual(str(redondear(D("5.375"))), "5.38")
    def test_criterio_pendiente_si_falta_actividad(self):
        n = notas_por_criterio({1: D(10)}, {"1.3": [1, 7]})
        self.assertIsNone(n["1.3"])
    def test_comparar(self):
        r = comparar({"E1": {1: D(8), 2: D(5)}}, {"E1": {1: D(8), 2: D(7)}})
        self.assertEqual(r["pct_iguales"], 50.0)
        self.assertEqual(r["discrepancias_mayores_de_1"], [("E1", 2, 5.0, 7.0)])

if __name__ == "__main__":
    unittest.main()
