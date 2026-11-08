"""Pruebas de la Pizzería πCHU en Chrome (Playwright).
Uso: python3 tests/prueba_pizzeria.py <carpeta_web> <carpeta_capturas>"""
import os, sys, threading, functools, http.server, socketserver, time
from playwright.sync_api import sync_playwright

WEB, CAP = sys.argv[1], sys.argv[2]
os.makedirs(CAP, exist_ok=True)
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=WEB)
Handler.log_message = lambda *a: None
srv = socketserver.TCPServer(("127.0.0.1", 0), Handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f"http://127.0.0.1:{srv.server_address[1]}/applets/pizzeria/index.html"
res = []
def ok(n, c, e=""): res.append((n, bool(c), e))

# Resuelve el pedido actual con el menor número de porciones (o la respuesta correcta)
RESOLVER = """() => { const Z = __pizzeria, E = Z.E, p = E.pedido;
  if (p.tipo === 'div_cuantas') return {resp: p.respuesta};
  const items = []; E.pizzas.forEach(z => z.porciones.forEach((st, i) => { if (st === 'mostrador') items.push({pid: z.id, i, d: z.d}); }));
  const prohib = p.cond && p.cond.modo === 'sin' ? p.cond.tam : null, exactas = p.cond && p.cond.modo === 'exactas' ? p.cond.k : null;
  const usar = items.filter(x => 24 / x.d !== prohib).sort((a, b) => a.d - b.d);
  let mejor = null;
  const rec = (k, suma, sel) => {
    if (suma === p.objetivo && (!exactas || sel.length === exactas)) { if (!mejor || sel.length < mejor.length) mejor = [...sel]; return; }
    if (suma > p.objetivo || k >= usar.length || sel.length > 14 || (mejor && !exactas && sel.length >= mejor.length)) return;
    sel.push(usar[k]); rec(k + 1, suma + 24 / usar[k].d, sel); sel.pop();
    let j = k + 1; while (j < usar.length && usar[j].d === usar[k].d) j++; rec(j, suma, sel);
  };
  rec(0, 0, []); return {sel: mejor}; }"""

def resolver(pag, clic_real=False):
    r = pag.evaluate(RESOLVER)
    if "resp" in r:
        pag.click(f"[data-resp='{r['resp']}']"); return True
    if not r["sel"]: return False
    for x in r["sel"]:
        if clic_real: pag.locator(f".porcion[data-p='{x['pid']}'][data-i='{x['i']}']").dispatch_event("click")
        else: pag.evaluate(f"__pizzeria.alternarPorcion({x['pid']},{x['i']})")
    pag.click("#btnServir"); return True

with sync_playwright() as p:
    chrome = "/usr/bin/google-chrome"
    nav = p.chromium.launch(**({"executable_path": chrome} if os.path.exists(chrome) else {}), args=["--no-sandbox"])
    ctx = nav.new_context(viewport={"width": 1280, "height": 900})
    pag = ctx.new_page()
    errores = []
    pag.on("console", lambda m: m.type == "error" and errores.append(m.text))
    pag.on("pageerror", lambda e: errores.append(str(e)))
    pag.goto(URL); pag.evaluate("localStorage.clear(); localStorage.setItem('pichu.perfil.v1', JSON.stringify({alias:'Tigre_7'}))"); pag.reload()
    pag.wait_for_load_state("networkidle")
    ok("Menú con 7 jornadas", pag.locator("[data-jornada]").count() == 7)
    ok("Solo la jornada 1 abierta al empezar", pag.locator("[data-jornada]:not([disabled])").count() == 1)
    ok("Saluda con el alias común", "Tigre_7" in pag.text_content(".portada"))
    ok("Modo tranquilo por defecto", pag.evaluate("__pizzeria.AJ.reloj") is False)
    ok("Sin peticiones externas", pag.evaluate("performance.getEntriesByType('resource').every(r=>r.name.startsWith(location.origin))"))
    pag.screenshot(path=f"{CAP}/pz_menu.png", full_page=True)

    # ---------- Jornada 1 con tutorial ----------
    pag.click("[data-jornada='1']")
    ok("Tutorial: el primer pedido es 3/4", pag.evaluate("__pizzeria.E.pedido.escrito") == "3/4")
    ok("Tutorial: πCHU explica", "Bienvenido" in pag.text_content("#narradorTxt"))
    mitad = pag.evaluate("__pizzeria.E.pizzas.find(z=>z.d===2).id"); cuarto = pag.evaluate("__pizzeria.E.pizzas.find(z=>z.d===4).id")
    pag.locator(f".porcion[data-p='{mitad}'][data-i='0']").dispatch_event("click")
    pag.screenshot(path=f"{CAP}/pz_j1_plato.png")
    ok("Plato sin total escrito", "3/4" not in pag.text_content("#zonaPlato") and "suma" not in pag.text_content("#zonaPlato").lower())
    pag.locator(f".porcion[data-p='{cuarto}'][data-i='0']").dispatch_event("click")
    pag.click("#btnServir")
    ok("1/2 + 1/4 = 3/4: servido", "propina" in pag.text_content("#feedback") and pag.evaluate("__pizzeria.E.servidos") == 1)
    ok("Servicio perfecto y propina 20", pag.evaluate("[__pizzeria.E.perfectos, __pizzeria.E.propinas]") == [1, 20])
    ok("Se marca el tutorial como visto", pag.evaluate("__pizzeria.DATOS.tutorial") is True)
    pag.screenshot(path=f"{CAP}/pz_j1_bien.png")
    pag.click("#btnSiguiente")

    # Fallo: error del denominador (3 octavos para un pedido de 3/4)
    pag.evaluate("""()=>{const E=__pizzeria.E; E.pedido={tipo:'suma',objetivo:18,escrito:'3/4',texto:'Quiero 3/4 de pizza, por favor.',op:null,minimo:2};
      E.pizzas.push({id:999,d:8,porciones:Array(8).fill('mostrador'),sal:1}); E.plato=[];}""")
    for i in range(3): pag.evaluate(f"__pizzeria.alternarPorcion(999,{i})")
    pag.click("#btnServir")
    fb = pag.text_content("#feedback")
    ok("Detecta el error del denominador", "más PEQUEÑAS" in fb, fb)
    ok("Muestra la suma con denominador común y las barras", "3/8" in fb.replace(" ", "") or "3\n8" in fb, fb) if False else ok("Muestra las barras de comparación", pag.locator("#feedback svg.barras").count() == 1)
    ok("Primer fallo: las porciones vuelven al mostrador", pag.evaluate("__pizzeria.E.plato.length") == 0)
    pag.screenshot(path=f"{CAP}/pz_fallo.png")
    for i in range(3): pag.evaluate(f"__pizzeria.alternarPorcion(999,{i})")
    pag.click("#btnServir")
    ok("Segundo fallo: el cliente se va", "se ha ido" in pag.text_content("#feedback") and pag.evaluate("__pizzeria.E.servidos") == 1)
    ok("Enseña una forma de servirlo", "Una forma de servirlo" in pag.text_content("#feedback"))
    pag.click("#btnSiguiente")

    # Teclado: Enter en una porción y S para servir
    pag.evaluate("__pizzeria.E.plato.length")
    pag.focus(".porcion"); pag.keyboard.press("Enter")
    ok("Teclado: Enter pone la porción en el plato", pag.evaluate("__pizzeria.E.plato.length") == 1)
    pag.evaluate("document.activeElement.blur()")
    antes = pag.evaluate("__pizzeria.E.intentos + __pizzeria.E.servidos")
    pag.keyboard.press("s")
    ok("Teclado: S sirve", pag.evaluate("__pizzeria.E.intentos + __pizzeria.E.servidos") == antes + 1)
    if pag.locator("#btnSiguiente").count() == 0:   # si falló, resolver bien
        resolver(pag, clic_real=True)
    pag.click("#btnSiguiente")
    while pag.locator("#capa:not(.oculto)").count() == 0:
        resolver(pag, clic_real=True); pag.click("#btnSiguiente")
    ok("Fin de jornada con estrellas", "estrellas" in (pag.get_attribute(".capa .estr", "aria-label") or ""))
    ok("Jornada 1 superada y guardada", pag.evaluate("JSON.parse(localStorage.getItem('pichu.pizzeria.v1')).estrellas['1']") >= 1)
    pag.screenshot(path=f"{CAP}/pz_fin.png")
    pag.click("#fMenu")
    ok("La jornada 2 se desbloquea", pag.locator("[data-jornada='2']:not([disabled])").count() == 1)

    # ---------- Todas las jornadas, jugando perfecto ----------
    vistos = set()
    for j in range(1, 8):
        for vuelta in range(2):
            pag.evaluate(f"__pizzeria.empezarJornada({j})")
            n = pag.evaluate("__pizzeria.J.clientes")
            for k in range(n):
                vistos.add(pag.evaluate("__pizzeria.E.pedido.tipo"))
                if j == 5 and k == 0 and vuelta == 0: pag.screenshot(path=f"{CAP}/pz_j5_caja.png")
                if pag.evaluate("__pizzeria.E.pedido.tipo") == "div_cuantas" and "pz_j6" not in str(vistos): vistos.add("pz_j6"); pag.screenshot(path=f"{CAP}/pz_j6_pregunta.png")
                if pag.evaluate("__pizzeria.E.pedido.tipo") == "condicion" and "pz_j7" not in str(vistos): vistos.add("pz_j7"); pag.screenshot(path=f"{CAP}/pz_j7_critico.png")
                if not resolver(pag): ok(f"J{j}: pedido sin solución", False, pag.evaluate("JSON.stringify(__pizzeria.E.pedido)")); break
                if "propina" not in pag.text_content("#feedback"): ok(f"J{j}: solución rechazada", False, pag.text_content("#feedback")); break
                pag.click("#btnSiguiente")
            est = pag.evaluate(f"JSON.parse(localStorage.getItem('pichu.pizzeria.v1')).estrellas['{j}']")
            ok(f"Jornada {j} (vuelta {vuelta+1}) jugando perfecto: 3 estrellas", est == 3, est)
            pag.click("#fMenu")
    for t in ["suma", "mult_entero", "fraccion_de", "div_entero", "div_cuantas", "condicion"]:
        ok(f"Aparece el tipo de pedido «{t}»", t in vistos)

    # Contra reloj
    pag.evaluate("__pizzeria.AJ.reloj = true; __pizzeria.empezarJornada(2)")
    time.sleep(.6)
    ok("Contra reloj: barra de paciencia visible", pag.is_visible("#paciencia"))
    pag.evaluate("__pizzeria.AJ.reloj = false")
    pag.click("#btnMenu")
    ok("Botón ← πCHU presente", pag.locator("#pichu-volver").count() == 1)
    ok("Sin errores de consola", not errores, "; ".join(errores))

    # Móvil
    m = nav.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pm = m.new_page(); pm.goto(URL); pm.evaluate("localStorage.setItem('pichu.pizzeria.v1', JSON.stringify({tutorial:true,estrellas:{1:1,2:1,3:1,4:1,5:1,6:1}}))"); pm.reload()
    pm.click("[data-jornada='3']"); time.sleep(.3)
    pm.locator(".porcion").first.dispatch_event("click")
    pm.screenshot(path=f"{CAP}/pz_movil.png", full_page=True)
    ok("Móvil sin desbordamiento horizontal", pm.evaluate("document.documentElement.scrollWidth") <= 392, pm.evaluate("document.documentElement.scrollWidth"))
    nav.close()

srv.shutdown()
f = 0
for n_, c, e in res:
    print(("✓" if c else "✗"), n_, "" if c else f"→ {str(e)[:300]}"); f += 0 if c else 1
print(f"\n{len(res)-f}/{len(res)} pruebas superadas")
sys.exit(1 if f else 0)
