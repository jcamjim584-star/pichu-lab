"""Pruebas de Pizza Rush (Pizzería πCHU v0.2) en Chrome (Playwright).
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

# Prepara la caja del ticket activo con la combinación mínima del mostrador.
# Si el mostrador no alcanza, añade pizzas de cortes útiles (como haría el horno con tiempo).
PREPARAR = """() => { const Z = __pizzeria, G = Z.G, M = Z.M, t = G.tickets.find(x => x.id === G.activo && !x.saliendo) || G.tickets.find(x => !x.saliendo);
  if (!t) return null; Z.elegirTicket(t.id);
  const p = t.ped; if (p.tipo === 'div_cuantas') return {id: t.id, resp: p.respuesta};
  const prohib = p.cond && p.cond.modo === 'sin' ? p.cond.tam : null, exactas = p.cond && p.cond.modo === 'exactas' ? p.cond.k : null;
  const buscar = () => {
    const items = []; G.pizzas.forEach(z => z.por.forEach((st, i) => { if (st === 'm' && 24 / z.d !== prohib) items.push({pid: z.id, i, d: z.d}); }));
    items.sort((a, b) => a.d - b.d); let mejor = null;
    const rec = (k, s, sel) => { if (s === p.objetivo && (!exactas || sel.length === exactas)) { if (!mejor || sel.length < mejor.length) mejor = [...sel]; return; }
      if (s > p.objetivo || k >= items.length || sel.length > 24 || (mejor && !exactas && sel.length >= mejor.length)) return;
      sel.push(items[k]); rec(k + 1, s + 24 / items[k].d, sel); sel.pop(); let j = k + 1; while (j < items.length && items[j].d === items[k].d) j++; rec(j, s, sel); };
    rec(0, 0, []); return mejor; };
  let sel = buscar();
  if (!sel || (!exactas && p.minimo && sel.length > p.minimo)) { for (const d of M.cortesUtiles(p, G.cfg.dens)) { G.pizzas.push({id: 9000 + Math.floor(Math.random() * 1e6), d, por: Array(d).fill('m')}); G.pizzas.push({id: 9000 + Math.floor(Math.random() * 1e6), d, por: Array(d).fill('m')}); } Z.renderTodo(); sel = buscar(); }
  if (!sel) return {id: t.id, error: JSON.stringify(p)};
  sel.forEach(x => Z.meterPorcion(x.pid, x.i));
  return {id: t.id, n: sel.length}; }"""

def servir_activo(pag, clic=False):
    r = pag.evaluate(PREPARAR)
    if r is None: return None
    if "error" in r: return r
    if "resp" in r:
        pag.locator(f"[data-resp='{r['id']}:{r['resp']}']").dispatch_event("click")
    else:
        if clic: pag.locator(f"[data-enviar='{r['id']}']").click()
        else: pag.evaluate(f"__pizzeria.enviar({r['id']})")
    return r

def jugar_turno(pag, ver=None, max_vueltas=200):
    for _ in range(max_vueltas):
        if pag.evaluate("__pizzeria.G.fin"): return True
        if pag.evaluate("__pizzeria.G.tickets.filter(t=>!t.saliendo).length") == 0:
            pag.evaluate("__pizzeria.G.espera = 0"); time.sleep(.12); continue
        if ver is not None: ver.add(pag.evaluate("(__pizzeria.G.tickets.find(t=>t.id===__pizzeria.G.activo)||__pizzeria.G.tickets[0]).ped.tipo"))
        r = servir_activo(pag)
        if r and "error" in r: ok("Pedido sin solución posible", False, r["error"]); return False
        time.sleep(.05)
    return pag.evaluate("__pizzeria.G.fin")

with sync_playwright() as p:
    chrome = "/usr/bin/google-chrome"
    nav = p.chromium.launch(**({"executable_path": chrome} if os.path.exists(chrome) else {}), args=["--no-sandbox", "--autoplay-policy=no-user-gesture-required"])
    ctx = nav.new_context(viewport={"width": 1280, "height": 900})
    pag = ctx.new_page()
    errores = []
    pag.on("console", lambda m: m.type == "error" and errores.append(m.text))
    pag.on("pageerror", lambda e: errores.append(str(e)))
    pag.goto(URL); pag.evaluate("localStorage.clear(); localStorage.setItem('pichu.perfil.v1', JSON.stringify({alias:'Tigre_7'}))"); pag.reload()
    pag.wait_for_load_state("networkidle")
    ok("Pantalla Mi pizzería con 8 turnos", pag.locator("[data-turno]").count() == 8)
    ok("Solo el turno 1 abierto", pag.locator("[data-turno]:not([disabled])").count() == 1)
    ok("Categoría inicial: Puesto callejero", pag.text_content("#rango") == "Puesto callejero")
    ok("Saluda con el alias común", "Tigre_7" in pag.text_content(".logo-rush"))
    ok("Sin peticiones externas", pag.evaluate("performance.getEntriesByType('resource').every(r=>r.name.startsWith(location.origin))"))
    pag.screenshot(path=f"{CAP}/rush_inicio.png", full_page=True)

    # ---------- Turno 1 con tutorial ----------
    pag.click("#btnJugar"); time.sleep(.8)
    ok("Tutorial: primer ticket 3/4", pag.evaluate("__pizzeria.G.tickets[0].ped.escrito") == "3/4")
    ok("Tutorial: aviso de bienvenida", "Bienvenido" in pag.text_content("#aviso"))
    ok("Mostrador con pizzas", pag.locator(".pizza svg").count() >= 3)
    pag.screenshot(path=f"{CAP}/rush_cocina.png")
    # Error típico: 3 octavos para 3/4
    pag.evaluate("__pizzeria.G.pizzas.push({id:777,d:8,por:Array(8).fill('m')}); __pizzeria.renderTodo()")
    for i in range(3): pag.locator(f".porcion[data-p='777'][data-i='{i}']").dispatch_event("click")
    ok("Las porciones entran en la caja del ticket", pag.evaluate("__pizzeria.G.tickets[0].caja.length") == 3)
    pag.click("[data-enviar]")
    ok("Detecta el error del denominador", "más PEQUEÑAS" in pag.text_content("#aviso"), pag.text_content("#aviso"))
    ok("Fallo: las porciones vuelven al mostrador", pag.evaluate("__pizzeria.G.tickets[0].caja.length") == 0)
    pag.screenshot(path=f"{CAP}/rush_fallo.png")
    servir_activo(pag, clic=True); time.sleep(.6)
    ok("Acierto: monedas y pedido servido", pag.evaluate("__pizzeria.G.servidos") == 1 and pag.evaluate("__pizzeria.G.monedas") > 0)
    ok("Tutorial completado", pag.evaluate("__pizzeria.D.tutorial") is True)
    # Teclado: 1 elige ticket, Enter mete porción, E envía
    pag.evaluate("__pizzeria.G.espera = 0"); time.sleep(.4)
    pag.keyboard.press("1")
    pag.focus(".porcion"); pag.keyboard.press("Enter")
    ok("Teclado: Enter mete la porción", pag.evaluate("__pizzeria.G.tickets.reduce((a,t)=>a+t.caja.length,0)") >= 1)
    pag.evaluate("document.activeElement.blur()")
    antes = pag.evaluate("__pizzeria.G.servidos + __pizzeria.G.tickets.reduce((a,t)=>a+t.intentos,0)")
    pag.keyboard.press("e"); time.sleep(.6)
    ok("Teclado: E envía", pag.evaluate("__pizzeria.G.servidos + __pizzeria.G.tickets.reduce((a,t)=>a+t.intentos,0) + __pizzeria.G.resueltos") > antes)
    # Pausa
    pag.keyboard.press("p")
    ok("Pausa con P", pag.evaluate("__pizzeria.G.pausa") is True and pag.is_visible("#capa"))
    pag.keyboard.press("Escape")
    ok("Escape reanuda", pag.evaluate("__pizzeria.G.pausa") is False)
    ok("Termina el turno 1", jugar_turno(pag))
    ok("Fin de turno con estrellas", "estrellas" in (pag.get_attribute(".caja-capa .estrellas", "aria-label") or ""))
    pag.screenshot(path=f"{CAP}/rush_fin.png")
    ok("Monedas guardadas", pag.evaluate("JSON.parse(localStorage.getItem('pichu.pizzeria.v2')).monedas") > 0)
    pag.click("#fMenu")
    ok("Turno 2 desbloqueado", pag.locator("[data-turno='2']:not([disabled])").count() == 1)

    # ---------- Combo ----------
    pag.evaluate("__pizzeria.AJ.tranquilo = true; __pizzeria.empezarTurno(2)"); time.sleep(.3)
    for _ in range(3):
        pag.evaluate("__pizzeria.G.espera = 0"); time.sleep(.15)
        servir_activo(pag); time.sleep(.55)
    ok("Racha de 3: multiplicador x2", "x2" in pag.text_content("#hCombo"), pag.text_content("#hCombo"))
    pag.screenshot(path=f"{CAP}/rush_racha.png")

    # ---------- Tienda ----------
    pag.evaluate("__pizzeria.inicio(); __pizzeria.D.monedas = 3000")
    pag.click("[data-abre='tienda']")
    for mid in ["horno", "mostrador", "cortador", "luces", "mantel", "neon", "plantas"]:
        pag.click(f"[data-comprar='{mid}']")
    ok("Compras en la tienda", pag.evaluate("[__pizzeria.D.mejoras.horno, __pizzeria.D.mejoras.mostrador, __pizzeria.D.mejoras.cortador]") == [1, 1, 1])
    ok("Se descuentan las monedas", pag.evaluate("__pizzeria.D.monedas") == 3000 - 120 - 150 - 300 - 80 - 80 - 150 - 60)
    pag.screenshot(path=f"{CAP}/rush_tienda.png")
    pag.click("#tCerrar")
    ok("La decoración se ve en Mi pizzería", pag.locator("#escaparate .neon").count() == 1)
    pag.screenshot(path=f"{CAP}/rush_inicio_deco.png", full_page=True)
    pag.evaluate("__pizzeria.empezarTurno(3)"); time.sleep(.5)
    ok("Mostrador XL: 5 huecos", pag.locator("#huecos .pizza").count() == 5)
    ok("Decoración en la cocina", pag.is_visible("#decoLuces") and "mantel" in pag.get_attribute("#mostrador", "class"))
    entera = pag.evaluate("(__pizzeria.G.pizzas.find(z=>z.por.every(s=>s==='m'))||{}).id")
    if entera:
        pag.click(f"[data-cortar='{entera}']")
        antes_d = pag.evaluate(f"__pizzeria.G.pizzas.find(z=>z.id==={entera}).d")
        pag.locator("[data-nuevo]").first.click()
        ok("Cortador mágico cambia el corte", pag.evaluate(f"__pizzeria.G.pizzas.find(z=>z.id==={entera}).d") != antes_d)
        n = pag.evaluate("__pizzeria.G.pizzas.length"); pag.click(f"[data-tirar='{entera}']")
        ok("Tirar quita la pizza", pag.evaluate("__pizzeria.G.pizzas.length") == n - 1)
    pag.screenshot(path=f"{CAP}/rush_t3_caja.png")

    # ---------- Paciencia (sin modo tranquilo) ----------
    pag.evaluate("__pizzeria.AJ.tranquilo = false; __pizzeria.empezarTurno(2)"); time.sleep(.3)
    pag.evaluate("__pizzeria.G.tickets[0].resto = 0.05"); time.sleep(.8)
    ok("Se acaba la paciencia: pedido perdido", "perdido" in pag.text_content("#aviso").lower() and pag.evaluate("__pizzeria.G.resueltos") == 1)
    pag.evaluate("__pizzeria.AJ.tranquilo = true")

    # ---------- Los 8 turnos jugando perfecto ----------
    vistos = set()
    for t in range(1, 9):
        pag.evaluate(f"__pizzeria.empezarTurno({t})"); time.sleep(.2)
        fin = jugar_turno(pag, vistos)
        est = pag.evaluate(f"__pizzeria.D.estrellas['{t}']")
        ok(f"Turno {t} jugando perfecto: 3 estrellas", fin and est == 3, est)
        if t in (5, 6, 8): pass
    for tipo in ["suma", "mult_entero", "fraccion_de", "div_entero", "div_cuantas", "condicion"]:
        ok(f"Aparece el pedido «{tipo}»", tipo in vistos)
    pag.evaluate("__pizzeria.inicio()")
    ok("Categoría sube con las estrellas", pag.text_content("#rango") == "Imperio πCHU", pag.text_content("#rango"))
    # capturas de turnos con multiplicar, dividir y jefe
    for t, nombre in [(5, "rush_t5"), (6, "rush_t6"), (8, "rush_t8")]:
        pag.evaluate(f"__pizzeria.empezarTurno({t})"); time.sleep(.3)
        pag.evaluate("__pizzeria.G.espera = 0"); time.sleep(.3); pag.evaluate("__pizzeria.G.espera = 0"); time.sleep(.6)
        pag.screenshot(path=f"{CAP}/{nombre}.png")
    pag.evaluate("__pizzeria.inicio()")
    ok("Botón ← πCHU presente", pag.locator("#pichu-volver").count() == 1)
    ok("Sin errores de consola", not errores, "; ".join(errores))

    # Móvil
    m = nav.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pm = m.new_page(); pm.goto(URL)
    pm.evaluate("localStorage.setItem('pichu.pizzeria.v2', JSON.stringify({tutorial:true,estrellas:{1:2,2:1},monedas:50,ajustes:{tranquilo:true,musica:false}}))"); pm.reload()
    pm.screenshot(path=f"{CAP}/rush_movil_inicio.png", full_page=True)
    pm.click("[data-turno='3']"); time.sleep(1.2)
    pm.evaluate("__pizzeria.G.espera = 0"); time.sleep(.4)
    pm.locator(".porcion").first.dispatch_event("click")
    pm.screenshot(path=f"{CAP}/rush_movil.png", full_page=True)
    ok("Móvil sin desbordamiento horizontal", pm.evaluate("document.documentElement.scrollWidth") <= 392, pm.evaluate("document.documentElement.scrollWidth"))
    nav.close()

srv.shutdown()
f = 0
for n_, c, e in res:
    print(("✓" if c else "✗"), n_, "" if c else f"→ {str(e)[:300]}"); f += 0 if c else 1
print(f"\n{len(res)-f}/{len(res)} pruebas superadas")
sys.exit(1 if f else 0)
