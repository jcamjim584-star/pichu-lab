"""Pruebas de Fraction Royale v0.4 en Chrome (Playwright).
Uso: python3 tests/prueba_fraction_royale.py <carpeta_web> <carpeta_capturas>
Comprueba: matemáticas exactas de la predicción, detector del error típico, retos del Gigante,
equilibrio con un jugador automático y el recorrido completo en la interfaz."""
import os, sys, threading, functools, http.server, socketserver, json, time
from playwright.sync_api import sync_playwright

WEB, CAP = sys.argv[1], sys.argv[2]
os.makedirs(CAP, exist_ok=True)
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=WEB)
Handler.log_message = lambda *a: None
srv = socketserver.TCPServer(("127.0.0.1", 0), Handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f"http://127.0.0.1:{srv.server_address[1]}/applets/fraction-royale/index.html"

res = []
def ok(n, c, e=""): res.append((n, bool(c), e))

with sync_playwright() as p:
    chrome = "/usr/bin/google-chrome"
    nav = p.chromium.launch(**({"executable_path": chrome} if os.path.exists(chrome) else {}), args=["--no-sandbox"])
    ctx = nav.new_context(viewport={"width": 1280, "height": 900})
    pag = ctx.new_page()
    errores = []
    pag.on("console", lambda m: m.type == "error" and errores.append(m.text))
    pag.on("pageerror", lambda e: errores.append(str(e)))

    # Datos de la v0.3 que deben migrarse sin borrarse
    pag.goto(URL)
    pag.evaluate("""localStorage.clear();
      localStorage.setItem('pichuRoyale.coleccion', JSON.stringify({combos:['ALTA'],mejor:321,victorias:3}));
      localStorage.setItem('pichuRoyale.partida', JSON.stringify({ronda:2,jefe:true}));""")
    pag.reload(); pag.wait_for_load_state("networkidle")
    ok("Migra la colección de la v0.3", json.loads(pag.evaluate("localStorage.getItem('pichu.fraction-royale.coleccion')") or "{}").get("victorias") == 3)
    ok("No borra los datos de la v0.3", pag.evaluate("localStorage.getItem('pichuRoyale.coleccion')") is not None)
    ok("No ofrece continuar una partida de la v0.3", pag.locator("#btnContinuar.oculto").count() == 1)
    ok("Sin peticiones a servidores externos", pag.evaluate("performance.getEntriesByType('resource').every(r=>r.name.startsWith(location.origin))"))
    ok("Lato cargada desde la portada", pag.evaluate("document.fonts.check('900 16px Lato')"))

    # ---------- 1. Matemáticas exactas: todas las manos de 1 a 5 cartas del mazo ----------
    r = pag.evaluate("""()=>{
      const R=__royale, M=R.mazoBase().map(([n,d])=>({n,d})), L=27720;   // mcm(2..12)
      const ref=(cs,ronda)=>{ const N=cs.reduce((a,c)=>a+c.n*L/c.d,0);
        if(N<L) return 'menos1'; if(N===L) return 'igual1'; if(ronda<2) return 'mas1';
        return N<2*L?'entre12':N===2*L?'igual2':'mas2'; };
      let total=0, fallos=0, ejemplo=null; const sel=[];
      const rec=(ini)=>{ if(sel.length>=1){ for(const ronda of [0,2]){ total++;
          const s=sel.reduce((a,c)=>R.sumar(a,R.Fr(c.n,c.d)),R.Fr(0,1));
          if(R.zonaDe(s,ronda)!==ref(sel,ronda)){ fallos++; ejemplo=ejemplo||JSON.stringify(sel); } } }
        if(sel.length===5) return;
        for(let i=ini;i<M.length;i++){ sel.push(M[i]); rec(i+1); sel.pop(); } };
      rec(0); return {total,fallos,ejemplo}; }""")
    ok(f"Zona de la suma exacta en {r['total']:,} casos (manos de 1 a 5 cartas, rondas 1-2 y 3)".replace(",", "."), r["fallos"] == 0, r)

    # ---------- 2. Detector del error típico (sumar numeradores y denominadores) ----------
    casos = pag.evaluate("""()=>{ const R=__royale, F=(n,d)=>({n,d});
      return {
        a: R.evaluarPrediccion([F(1,2),F(2,3)],'menos1',0).error2,   // 7/6 > 1, ingenua 3/5 < 1 → error típico
        b: R.evaluarPrediccion([F(1,2),F(1,3)],'mas1',0).error2,     // 5/6 < 1, ingenua 2/5 < 1 → otro error
        c: R.evaluarPrediccion([F(1,2),F(1,2)],'igual1',0).ok,        // 1/2+1/2 = 1
        d: R.evaluarPrediccion([F(3,4),F(3,4)],'menos1',0).error2,   // 3/2, ingenua 6/8 → error típico
        e: R.evaluarPrediccion([F(3,2),F(1,2)],'igual2',2).ok,
        f: R.evaluarPrediccion([F(1,2),F(2,3)],'menos1',0).texto,
        g: R.pasosSuma([F(1,3),F(2,6)])
      }; }""")
    ok("Detecta el error típico (1/2 + 2/3 → «menos de 1»)", casos["a"] is True)
    ok("No lo confunde con otros errores", casos["b"] is False)
    ok("1/2 + 1/2 = exactamente 1", casos["c"] is True)
    ok("Detecta el error típico (3/4 + 3/4)", casos["d"] is True)
    ok("3/2 + 1/2 = exactamente 2 en la ronda del jefe", casos["e"] is True)
    ok("El mensaje de error explica el denominador común", "denominador común" in casos["f"])
    ok("Pasos de la suma sin decimales", "." not in casos["g"].replace("</", "") and "4" in casos["g"], casos["g"])

    # ---------- 3. Retos del Gigante ----------
    r = pag.evaluate("""()=>{ const R=__royale; let malos=[];
      for(let i=0;i<3000;i++){ const k=3+i%3, l=R.generarReto(k);
        const vals=l.map(c=>R.Fr(c.n,c.d));
        const distintos=vals.every((v,a)=>vals.every((w,b)=>a===b||R.comparar(v,w)!==0));
        const trampa=l.some(c=>c.n===1&&c.d>=8)&&l.some(c=>c.n===1&&c.d<=4);
        const propias=l.every(c=>c.n<c.d);
        const ord=[...l].sort((a,b)=>R.comparar(R.Fr(a.n,a.d),R.Fr(b.n,b.d)));
        if(l.length!==k||!distintos||!trampa||!propias||R.ordenCorrecto(l)||!R.ordenCorrecto(ord)) malos.push(l); }
      return malos.length; }""")
    ok("3.000 retos válidos (3-5 cartas, sin empates, con trampa, desordenados al empezar)", r == 0, r)

    # ---------- 4. Equilibrio con jugador automático ----------
    sim = pag.evaluate("""()=>{ const R=__royale, D=R.DIFICULTAD.facil;
      const barajar=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
      // Jugador "alumno": no revisa todas las combinaciones, solo 'ver' elegidas al azar
      function alumno(mano,niv,ver){ let mejor=null;
        for(let t=0;t<ver;t++){ const k=1+Math.floor(Math.random()*Math.min(5,mano.length)); const sel=barajar([...mano]).slice(0,k);
          const r=R.detectar(sel), lv=niv[r.clave]||0;
          const pts=(R.COMBOS[r.clave].fichas+15*lv+r.puntuan.reduce((a,c)=>a+Math.max(1,Math.round(10*c.n/c.d)),0))*(R.COMBOS[r.clave].mult+lv);
          if(!mejor||pts>mejor.pts) mejor={pts,sel,clave:r.clave}; }
        return mejor; }
      function partida(p,ver){
        const S={v:4,dif:'facil',ronda:0,monedas:4,comodines:[],niveles:{},dorado:0,mazoBase:R.mazoBase(),racha:0,pred:{aciertos:0,total:0}};
        R.S=S;
        for(S.ronda=0;S.ronda<3;S.ronda++){
          let puntos=0,jug=D.jugadas,desc=D.descartes; const obj=D.objetivos[S.ronda];
          const mazo=barajar(S.mazoBase.map(([n,d],i)=>({id:i+1,n,d}))); let mano=[];
          const robar=()=>{while(mano.length<8&&mazo.length) mano.push(mazo.pop());}; robar();
          while(jug>0&&puntos<obj){
            const m=alumno(mano,S.niveles,ver), falta=(obj-puntos)/jug;
            if(m.pts<falta*0.7&&desc>0){ const fuera=mano.filter(c=>!m.sel.includes(c)).slice(0,5);
              if(fuera.length){ mano=mano.filter(c=>!fuera.includes(c)); desc--; robar(); continue; } }
            let extra=0; if(m.sel.length>=2){ if(Math.random()<p){S.racha++; extra=1+(S.racha%3===0?1:0);} else S.racha=0; }
            puntos+=R.puntuar(m.sel,extra).total; jug--; mano=mano.filter(c=>!m.sel.includes(c)); robar();
          }
          if(puntos<obj) return false;
        }
        return true;
      }
      const out={}; for(const ver of [15,40]) for(const p of [0,0.6,1]){ let g=0; for(let i=0;i<400;i++) g+=partida(p,ver); out[ver+'/'+p]=g/400; } R.S=null; return out; }""")
    print("Simulación (combinaciones que mira / prob. de acierto → victorias, sin tienda ni escudos):", sim)
    ok(f"Equilibrio (alumno medio, 40 combinaciones): acertando el 60 % gana el {sim['40/0.6']*100:.0f} % (meta ≥ 80 %)", sim["40/0.6"] >= 0.8, sim)
    ok("Predecir bien ayuda: más victorias cuanto más se acierta", sim["15/1"] >= sim["15/0.6"] >= sim["15/0"] and sim["40/1"] >= sim["40/0"], sim)

    # ---------- 5. Recorrido en la interfaz ----------
    pag.click("#btnNueva")
    pag.wait_for_selector("#juego:not(.oculto)")
    def carta(n, d): return pag.locator(f"#mano .carta[aria-label^='Carta {n} entre {d},']").first
    def esperar_libre(): pag.wait_for_function("!__royale.ocupado", timeout=20000)
    carta(1, 4).dispatch_event("click"); carta(3, 4).dispatch_event("click")
    ok("Tutorial: aparecen los botones de predicción", pag.is_visible("#predicciones") and not pag.is_visible("#btnJugar"))
    ok("Tutorial: solo está activa la respuesta correcta", pag.locator("#predicciones [data-pred]:not([disabled])").count() == 1)
    pag.locator("[data-pred='igual1']").dispatch_event("click"); esperar_libre()
    carta(1, 3).dispatch_event("click"); carta(2, 6).dispatch_event("click")
    pag.locator("[data-pred='menos1']").dispatch_event("click"); esperar_libre()
    pag.wait_for_selector("#tFin"); pag.click("#tFin")

    # Mano real: sin ayuda en vivo y sin revelar combinaciones de suma
    pag.evaluate("""()=>{ const S=__royale.S; let id=900; const F=(n,d)=>({id:++id,n,d});
      S.objetivo=99999; S.mano=[F(1,4),F(3,4),F(1,2),F(2,3),F(1,5),F(2,5),F(3,8),F(5,6)]; __royale.elegir([0,1]); }""")
    info = pag.text_content("#info")
    ok("Sin ayuda en vivo: no dice cuánto suman", "suman" not in info.replace("Si suman exactamente", ""), info)
    ok("No delata la Unidad perfecta antes de jugar", "Unidad" not in info, info)
    pag.screenshot(path=f"{CAP}/fr_prediccion.png")
    pag.locator("[data-pred='igual1']").dispatch_event("click"); esperar_libre()
    est = pag.evaluate("({...__royale.S.pred, racha:__royale.S.racha})")
    ok("Acierto contabilizado", est["aciertos"] == 1 and est["total"] == 1, est)

    # Fallo con el error típico: 1/2 + 2/3 → «menos de 1»
    pag.evaluate("""()=>{ const S=__royale.S; const i=S.mano.findIndex(c=>c.n===1&&c.d===2), j=S.mano.findIndex(c=>c.n===2&&c.d===3); __royale.elegir([i,j]); }""")
    pag.click("[data-pred='menos1']")
    pag.wait_for_function("document.querySelector('#explica').textContent.includes('Ojo')", timeout=10000)
    ok("El fallo muestra la explicación del error típico", "denominador común" in pag.text_content("#explica"))
    pag.screenshot(path=f"{CAP}/fr_fallo.png")
    esperar_libre()
    ok("La racha se reinicia tras fallar", pag.evaluate("__royale.S.racha") == 0)

    # Opción docente de ayuda en vivo
    pag.evaluate("__royale.AJ.ayuda=true; __royale.elegir([0,1])")
    ok("Con la opción docente, vuelve la ayuda en vivo", "suman" in pag.text_content("#info"))
    pag.evaluate("__royale.AJ.ayuda=false; __royale.elegir([])")

    # ---------- 6. Reto del Gigante ----------
    pag.evaluate("""()=>{ const S=__royale.S; S.ronda=2; S.jefe=true; S.escudos=0; S.jefeActuo=false; S.mano=[]; S.descartes=4; __royale.retoJefe(); }""")
    pag.wait_for_selector("#retoOk")
    n_items = pag.locator(".reto li").count()
    ok("El primer reto tiene 3 fracciones", n_items == 3, n_items)
    pag.screenshot(path=f"{CAP}/fr_reto.png")
    pag.click("#retoOk")
    ok("Orden incorrecto: muestra la recta y la pista", pag.locator("svg.recta").count() == 1 and "denominador" in pag.text_content("#retoMsg"))
    pag.screenshot(path=f"{CAP}/fr_reto_fallo.png")
    pag.click("#retoSeguir")       # otro intento
    def valores():
        return pag.evaluate("""[...document.querySelectorAll('.reto li .valor .fr')].map(f=>{const s=f.querySelectorAll('span');return [+s[0].textContent,+s[1].textContent]})""")
    for _ in range(20):            # ordenar con las flechas (burbuja)
        v = valores(); hecho = True
        for i in range(len(v) - 1):
            if v[i][0] * v[i+1][1] > v[i+1][0] * v[i][1]:
                pag.click(f"[data-mover='{i},1']"); hecho = False; break
        if hecho: break
    pag.click("#retoOk")
    ok("Orden correcto: escudo roto", "Correcto" in pag.text_content("#retoMsg"))
    pag.click("#retoSeguir")
    est = pag.evaluate("({e:__royale.S.escudos,d:__royale.S.descartes,m:__royale.S.mano.length,o:__royale.ocupado})")
    ok("Escudo +1, descarte +1 y se reparte la mano", est == {"e": 1, "d": 5, "m": 8, "o": False}, est)
    ok("El marcador del jefe muestra el escudo", pag.text_content("#jefeN") == "1")
    ok("En la ronda del jefe hay 5 opciones de predicción", pag.evaluate("__royale.elegir([0,1]), document.querySelectorAll('#predicciones [data-pred]').length") == 5)
    ok("Botón ← πCHU presente", pag.locator("#pichu-volver").count() == 1)
    ok("Sin errores de consola", not errores, "; ".join(errores))

    # Móvil
    m = nav.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pm = m.new_page(); pm.goto(URL)
    pm.evaluate("localStorage.setItem('pichu.fraction-royale.tutorialVisto','true')")
    pm.reload(); pm.click("#btnNueva"); pm.wait_for_selector("#juego:not(.oculto)")
    pm.evaluate("__royale.elegir([0,1,2])"); time.sleep(.5)
    pm.screenshot(path=f"{CAP}/fr_movil.png", full_page=True)
    ok("Móvil sin desbordamiento horizontal", pm.evaluate("document.documentElement.scrollWidth") <= 392)
    nav.close()

srv.shutdown()
f = 0
for n, c, e in res:
    print(("✓" if c else "✗"), n, "" if c else f"→ {e}"); f += 0 if c else 1
print(f"\n{len(res)-f}/{len(res)} pruebas superadas")
sys.exit(1 if f else 0)
