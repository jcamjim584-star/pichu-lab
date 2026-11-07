/* =========================================================
   πCHU · componentes.js
   Piezas comunes de la portada:
     - Perfil: un alias común para todos los juegos (pichu.perfil.v1)
     - Datos: exportar, importar y borrar SOLO las claves "pichu."
     - confirmarDoble: confirmación pulsando dos veces
       (muchos visores bloquean confirm())
     - Modo sin conexión: registra el service worker y avisa
       cuando hay una versión nueva
   Regla de oro: nunca vaciar todo el almacenamiento (clear), porque todos
   los juegos comparten el mismo almacenamiento.
   ========================================================= */
(function () {
  "use strict";

  const PREFIJO = "pichu.";
  const CLAVE_PERFIL = "pichu.perfil.v1";

  // ---------- Almacenamiento seguro ----------
  // En modo privado o en algunos visores, localStorage puede fallar.
  const Almacen = {
    disponible() {
      try { const k = "pichu.__prueba"; localStorage.setItem(k, "1"); localStorage.removeItem(k); return true; }
      catch (e) { return false; }
    },
    leer(clave) { try { return localStorage.getItem(clave); } catch (e) { return null; } },
    escribir(clave, valor) { try { localStorage.setItem(clave, valor); return true; } catch (e) { return false; } },
    borrar(clave) { try { localStorage.removeItem(clave); } catch (e) { /* nada */ } },
    clavesPichu() {
      const lista = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(PREFIJO)) lista.push(k);
        }
      } catch (e) { /* nada */ }
      return lista.sort();
    }
  };

  // ---------- Perfil (alias) ----------
  const Perfil = {
    leer() {
      try { const p = JSON.parse(Almacen.leer(CLAVE_PERFIL)); return p && typeof p.alias === "string" ? p : null; }
      catch (e) { return null; }
    },
    // Alias: 2 a 16 caracteres, letras (con tildes y ñ), números, espacio, guion o guion bajo.
    validar(alias) {
      const a = String(alias || "").trim();
      if (a.length < 2) return "El alias debe tener al menos 2 caracteres.";
      if (a.length > 16) return "El alias puede tener como máximo 16 caracteres.";
      if (!/^[\p{L}\p{N} _-]+$/u.test(a)) return "Usa solo letras, números, espacios, guiones o guiones bajos.";
      return "";
    },
    guardar(alias) {
      const a = String(alias).trim();
      const error = Perfil.validar(a);
      if (error) return error;
      const previo = Perfil.leer();
      const ok = Almacen.escribir(CLAVE_PERFIL, JSON.stringify({ alias: a, creado: previo ? previo.creado : new Date().toISOString().slice(0, 10) }));
      return ok ? "" : "No se ha podido guardar en este navegador (¿modo privado?).";
    }
  };

  // ---------- Datos: exportar / importar / borrar ----------
  const Datos = {
    exportar() {
      const datos = {};
      Almacen.clavesPichu().forEach(k => { datos[k] = Almacen.leer(k); });
      const paquete = {
        app: "pichu", formato: 1,
        version: (window.MARCA && MARCA.version) || "",
        fecha: new Date().toISOString(),
        datos
      };
      const blob = new Blob([JSON.stringify(paquete, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "pichu-mis-datos-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      return Object.keys(datos).length;
    },
    // Devuelve una promesa con el número de claves importadas o lanza un error con mensaje claro.
    importar(archivo) {
      return archivo.text().then(texto => {
        let p;
        try { p = JSON.parse(texto); } catch (e) { throw new Error("El archivo no es un JSON válido."); }
        if (!p || p.app !== "pichu" || typeof p.datos !== "object") throw new Error("Este archivo no es una copia de datos de πCHU.");
        let n = 0;
        Object.entries(p.datos).forEach(([k, v]) => {
          if (k.startsWith(PREFIJO) && typeof v === "string" && v.length < 2000000) {
            if (Almacen.escribir(k, v)) n++;
          }
        });
        return n;
      });
    },
    borrarTodo() {
      const claves = Almacen.clavesPichu();
      claves.forEach(k => Almacen.borrar(k));   // SOLO claves πCHU, nunca clear()
      return claves.length;
    }
  };

  // ---------- Confirmación pulsando dos veces ----------
  function confirmarDoble(boton, textoConfirmar, accion, ms = 4000) {
    const original = boton.textContent;
    let armado = false, temporizador = null;
    boton.addEventListener("click", () => {
      if (!armado) {
        armado = true;
        boton.textContent = textoConfirmar;
        boton.setAttribute("aria-live", "polite");
        temporizador = setTimeout(() => { armado = false; boton.textContent = original; }, ms);
        return;
      }
      clearTimeout(temporizador); armado = false; boton.textContent = original;
      accion();
    });
  }

  // ---------- Modo sin conexión (service worker) ----------
  function activarSinConexion(rutaSW, alHaberNovedad) {
    if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
    navigator.serviceWorker.register(rutaSW).then(reg => {
      const avisar = w => w && w.addEventListener("statechange", () => {
        if (w.state === "installed" && navigator.serviceWorker.controller) alHaberNovedad(() => w.postMessage("activar"));
      });
      if (reg.waiting && navigator.serviceWorker.controller) alHaberNovedad(() => reg.waiting.postMessage("activar"));
      reg.addEventListener("updatefound", () => avisar(reg.installing));
    }).catch(() => { /* sin conexión no disponible: la web sigue funcionando */ });
    let recargando = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (recargando) return; recargando = true; location.reload();
    });
  }

  window.Pichu = { Almacen, Perfil, Datos, confirmarDoble, activarSinConexion, PREFIJO, CLAVE_PERFIL };
})();
