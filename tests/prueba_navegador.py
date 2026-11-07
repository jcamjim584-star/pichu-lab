"""Prueba de humo de la portada πCHU con Chrome (Playwright).
Uso: python3 prueba_navegador.py <carpeta_web> <carpeta_capturas>"""
import os, sys, threading, functools, http.server, socketserver, json, time
from playwright.sync_api import sync_playwright

WEB, CAP = sys.argv[1], sys.argv[2]
PUERTO = 8765
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=WEB)
Handler.log_message = lambda *a: None
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(("127.0.0.1", 0), Handler)
PUERTO = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{PUERTO}/"

resultados = []
def ok(nombre, cond, extra=""):
    resultados.append((nombre, bool(cond), extra))

with sync_playwright() as p:
    chrome = "/usr/bin/google-chrome"
    nav = p.chromium.launch(**({"executable_path": chrome} if os.path.exists(chrome) else {}), args=["--no-sandbox"])
    ctx = nav.new_context(viewport={"width": 1280, "height": 900}, accept_downloads=True)
    pag = ctx.new_page()
    errores = []
    pag.on("console", lambda m: m.type == "error" and errores.append(m.text))
    pag.on("pageerror", lambda e: errores.append(str(e)))

    # Datos antiguos de Exprés que NO deben perderse
    pag.goto(BASE + "privacidad.html")
    pag.evaluate("localStorage.setItem('pichu.expres.v3', JSON.stringify({prueba:1})); localStorage.setItem('otra.web','no-tocar')")

    pag.goto(BASE)
    pag.wait_for_load_state("networkidle")
    ok("Portada carga sin errores de consola", not errores, "; ".join(errores))
    ok("7 tarjetas en el catálogo", pag.locator("article.juego").count() == 7, pag.locator("article.juego").count())
    ok("Integer Ninja enlaza a Netlify", pag.locator("a.boton[href^='https://tourmaline']").count() == 1)
    ok("Exprés tiene botón Jugar", pag.locator("a.boton[href='applets/expres/index.html']").count() == 1)
    ok("Lato cargada en local", pag.evaluate("document.fonts.check('900 16px Lato')"))
    pag.screenshot(path=f"{CAP}/portada_escritorio.png", full_page=True)

    # Filtro por curso
    pag.click("button[data-curso='4.º ESO']")
    ok("Filtro 4.º ESO muestra 1 tarjeta", pag.locator("article.juego").count() == 1)
    pag.click("button[data-curso='Todos']")

    # Alias
    pag.fill("#campoAlias", "x")
    pag.click("#formAlias button")
    ok("Alias corto da error", "al menos 2" in pag.text_content("#errorAlias"))
    pag.fill("#campoAlias", "Tigre_7")
    pag.click("#formAlias button")
    ok("Alias guardado en pichu.perfil.v1", "Tigre_7" in (pag.evaluate("localStorage.getItem('pichu.perfil.v1')") or ""))
    ok("Chip de alias visible", pag.is_visible("#chipAlias"))

    # Exportar
    with pag.expect_download() as d:
        pag.click("#btnExportar")
    ruta = d.value.path()
    paquete = json.load(open(ruta, encoding="utf-8"))
    ok("Exportar incluye perfil y Exprés", set(paquete["datos"]) >= {"pichu.perfil.v1", "pichu.expres.v3"}, list(paquete["datos"]))
    ok("Exportar NO incluye datos ajenos", "otra.web" not in paquete["datos"])

    # Borrar (doble pulsación)
    pag.click("#btnBorrar")
    ok("Primera pulsación no borra", pag.evaluate("localStorage.getItem('pichu.perfil.v1')") is not None)
    pag.click("#btnBorrar")
    ok("Segunda pulsación borra lo de πCHU", pag.evaluate("localStorage.getItem('pichu.perfil.v1')") is None and pag.evaluate("localStorage.getItem('pichu.expres.v3')") is None)
    ok("Borrar respeta datos ajenos", pag.evaluate("localStorage.getItem('otra.web')") == "no-tocar")

    # Importar la copia
    pag.set_input_files("#archivoImportar", ruta)
    pag.wait_for_function("localStorage.getItem('pichu.perfil.v1') !== null")
    ok("Importar restaura los datos", pag.evaluate("localStorage.getItem('pichu.expres.v3')") is not None)

    # Exprés con el botón de volver
    errores.clear()
    pag.click("a.boton[href='applets/expres/index.html']")
    pag.wait_for_load_state("networkidle")
    time.sleep(1)
    ok("Exprés carga sin errores", not errores, "; ".join(errores))
    ok("Botón volver presente", pag.locator("#pichu-volver").count() == 1)
    pag.screenshot(path=f"{CAP}/expres_con_volver.png")
    pag.locator("#pichu-volver").locator("a").click()
    pag.wait_for_load_state("networkidle")
    ok("Volver lleva a la portada", pag.url in (BASE, BASE + "index.html"))

    # Sin conexión
    pag.wait_for_function("navigator.serviceWorker.controller !== null || navigator.serviceWorker.ready.then(()=>true)")
    pag.reload(); pag.wait_for_load_state("networkidle")
    pag.evaluate("caches.keys()")
    time.sleep(1.5)
    claves = pag.evaluate("caches.keys()")
    ok("Caché versionada creada", "pichu-v0.1.0" in claves, claves)
    ctx.set_offline(True)
    pag.reload(); pag.wait_for_load_state("domcontentloaded")
    ok("Portada funciona sin conexión", pag.locator("article.juego").count() == 7)
    pag.goto(BASE + "applets/expres/"); pag.wait_for_load_state("domcontentloaded")
    ok("Exprés funciona sin conexión", "Exprés" in pag.title())
    ctx.set_offline(False)

    # Móvil
    movil = nav.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pm = movil.new_page(); pm.goto(BASE); pm.wait_for_load_state("networkidle")
    ancho = pm.evaluate("document.documentElement.scrollWidth")
    ok("Móvil sin desbordamiento horizontal", ancho <= 390, ancho)
    pm.screenshot(path=f"{CAP}/portada_movil.png", full_page=True)
    pm.goto(BASE + "applets/expres/"); pm.wait_for_load_state("networkidle"); time.sleep(1)
    pm.screenshot(path=f"{CAP}/expres_movil.png")
    nav.close()

srv.shutdown()
fallos = 0
for n, c, e in resultados:
    print(("✓" if c else "✗"), n, ("" if c else f"→ {e}"))
    fallos += 0 if c else 1
print(f"\n{len(resultados) - fallos}/{len(resultados)} pruebas superadas")
sys.exit(1 if fallos else 0)
