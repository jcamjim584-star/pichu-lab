/**
 * INTEGER NINJA · Ranking y retos de clase (πCHU ARCADE)
 * ------------------------------------------------------------------
 * Guarda en ESTA hoja de cálculo las puntuaciones y los retos de tu clase.
 * Solo se guardan: alias, grupo, modo, nivel y números de la partida.
 *
 * INSTALACIÓN (una sola vez, unos 5 minutos)
 *  1. Crea una Hoja de cálculo nueva con tu cuenta del centro.
 *  2. Menú Extensiones → Apps Script. Borra lo que haya y pega este código.
 *  3. Cambia la CLAVE de abajo por una palabra secreta para tu clase.
 *  4. Guarda (icono del disquete).
 *  5. Implementar → Nueva implementación → tipo «Aplicación web».
 *       Ejecutar como: «Yo».   Quién tiene acceso: «Cualquier usuario».
 *     Autoriza los permisos que pide (solo esta hoja).
 *  6. Copia la URL que termina en /exec y pégala en el juego:
 *     Ajustes → Configuración docente → Ranking en vivo.
 *
 * Si cambias el código, vuelve a Implementar → Gestionar implementaciones
 * → editar → «Nueva versión», para que se aplique.
 */
const CLAVE = 'cambia-esta-clave';

const MODOS = ['classic', 'arcade', 'duel', 'adventure'];
const RE_ALIAS = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 _.\-]{2,20}$/;
const RE_CODIGO = /^[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/;
const CAB_PUNT = ['fecha', 'grupo', 'alias', 'modo', 'nivel', 'puntos', 'objetivos', 'decisiones_bien', 'decisiones_mal', 'estrellas'];
const CAB_RETOS = ['id', 'fecha', 'grupo', 'de', 'para', 'codigo', 'puntos_de', 'estado', 'puntos_para', 'ganador', 'fecha_resultado'];

function doGet(e) { return responder_(e && e.parameter ? e.parameter : {}); }
function doPost(e) {
  let p = {};
  try { p = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return salida_({ ok: false, error: 'json' }); }
  return responder_(p);
}
function responder_(p) {
  try { return salida_(atender_(p)); } catch (err) { return salida_({ ok: false, error: String(err && err.message || err) }); }
}
function salida_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function atender_(p) {
  if (String(p.key || '') !== CLAVE) return { ok: false, error: 'clave' };
  const grupo = limpia_(p.group, 30);
  switch (p.action) {
    case 'ping': return { ok: true, grupo: grupo };
    case 'top': return top_(grupo, String(p.mode || 'classic'), Math.min(50, Number(p.limit) || 10));
    case 'players': return jugadores_(grupo);
    case 'duels': return retosDe_(grupo, String(p.alias || ''));
    case 'score': return conBloqueo_(function () { return guardarPuntos_(grupo, p); });
    case 'duel': return conBloqueo_(function () { return crearReto_(grupo, p); });
    case 'duelResult': return conBloqueo_(function () { return resultadoReto_(grupo, p); });
  }
  return { ok: false, error: 'accion' };
}

/* ---------- utilidades ---------- */
function hoja_(nombre, cabecera) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(nombre);
  if (!sh) { sh = ss.insertSheet(nombre); sh.appendRow(cabecera); sh.setFrozenRows(1); }
  return sh;
}
function filas_(sh) {
  const v = sh.getDataRange().getValues();
  const cab = v.shift() || [];
  return v.map(function (r, i) { const o = { _fila: i + 2 }; cab.forEach(function (k, j) { o[k] = r[j]; }); return o; });
}
// quita caracteres que una hoja podría interpretar como fórmula
function limpia_(s, n) { return String(s == null ? '' : s).replace(/[<>=+@\t\r\n]/g, '').trim().slice(0, n); }
function igual_(a, b) { return String(a).trim().toLowerCase() === String(b).trim().toLowerCase(); }
function entero_(v, max) { const n = Math.round(Number(v)); return isFinite(n) && n >= 0 && n <= max ? n : null; }
function conBloqueo_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try { return fn(); } finally { lock.releaseLock(); }
}

/* ---------- puntuaciones ---------- */
function guardarPuntos_(grupo, p) {
  const alias = String(p.alias || '').trim();
  if (!RE_ALIAS.test(alias)) return { ok: false, error: 'alias' };
  if (MODOS.indexOf(p.mode) < 0) return { ok: false, error: 'modo' };
  const puntos = entero_(p.score, 2000000);
  if (puntos === null) return { ok: false, error: 'puntos' };
  const nivel = p.mode === 'adventure' ? entero_(p.level, 6) : '';
  if (p.mode === 'adventure' && !nivel) return { ok: false, error: 'nivel' };
  hoja_('Puntuaciones', CAB_PUNT).appendRow([
    new Date(), grupo, alias, p.mode, nivel, puntos,
    entero_(p.targets, 10000) || 0, entero_(p.decOk, 10000) || 0, entero_(p.decErr, 10000) || 0, entero_(p.stars, 3) || 0,
  ]);
  return { ok: true, puesto: puesto_(grupo, p.mode, alias) };
}
function ranking_(grupo, modo) {
  const filas = filas_(hoja_('Puntuaciones', CAB_PUNT)).filter(function (r) { return igual_(r.grupo, grupo) && r.modo === modo; });
  const porAlias = {};
  filas.forEach(function (r) {
    const k = String(r.alias).toLowerCase();
    const a = porAlias[k] || (porAlias[k] = { alias: String(r.alias), score: 0, stars: 0, niveles: {}, fecha: r.fecha });
    if (modo === 'adventure') {
      const n = a.niveles[r.nivel] || { estrellas: 0, puntos: 0 };
      a.niveles[r.nivel] = { estrellas: Math.max(n.estrellas, Number(r.estrellas) || 0), puntos: Math.max(n.puntos, Number(r.puntos) || 0) };
    } else if (Number(r.puntos) > a.score) { a.score = Number(r.puntos); a.fecha = r.fecha; }
  });
  const lista = Object.keys(porAlias).map(function (k) {
    const a = porAlias[k];
    if (modo === 'adventure') {
      Object.keys(a.niveles).forEach(function (n) { a.stars += a.niveles[n].estrellas; a.score += a.niveles[n].puntos; });
    }
    return { alias: a.alias, score: a.score, stars: a.stars, fecha: a.fecha instanceof Date ? a.fecha.toISOString() : String(a.fecha) };
  });
  lista.sort(function (x, y) { return modo === 'adventure' ? (y.stars - x.stars) || (y.score - x.score) : y.score - x.score; });
  return lista;
}
function top_(grupo, modo, limite) {
  if (MODOS.indexOf(modo) < 0) return { ok: false, error: 'modo' };
  const lista = ranking_(grupo, modo);
  return { ok: true, rows: lista.slice(0, limite), total: lista.length };
}
function puesto_(grupo, modo, alias) {
  const lista = ranking_(grupo, modo);
  for (let i = 0; i < lista.length; i++) if (igual_(lista[i].alias, alias)) return i + 1;
  return null;
}
function jugadores_(grupo) {
  const vistos = {};
  filas_(hoja_('Puntuaciones', CAB_PUNT)).forEach(function (r) { if (igual_(r.grupo, grupo)) vistos[String(r.alias).toLowerCase()] = String(r.alias); });
  return { ok: true, aliases: Object.keys(vistos).map(function (k) { return vistos[k]; }).sort() };
}

/* ---------- retos entre compañeros ---------- */
function crearReto_(grupo, p) {
  const de = String(p.from || '').trim(), para = String(p.to || '').trim();
  if (!RE_ALIAS.test(de) || !RE_ALIAS.test(para)) return { ok: false, error: 'alias' };
  if (igual_(de, para)) return { ok: false, error: 'mismo' };
  const codigo = String(p.code || '').toUpperCase();
  if (!RE_CODIGO.test(codigo)) return { ok: false, error: 'codigo' };
  const puntos = entero_(p.score, 2000000);
  if (puntos === null) return { ok: false, error: 'puntos' };
  const id = Utilities.getUuid().slice(0, 8);
  hoja_('Retos', CAB_RETOS).appendRow([id, new Date(), grupo, de, para, codigo, puntos, 'pendiente', '', '', '']);
  return { ok: true, id: id };
}
function retosDe_(grupo, alias) {
  if (!RE_ALIAS.test(alias.trim())) return { ok: false, error: 'alias' };
  const filas = filas_(hoja_('Retos', CAB_RETOS)).filter(function (r) { return igual_(r.grupo, grupo); });
  const fmt = function (r) {
    return { id: String(r.id), from: String(r.de), to: String(r.para), code: String(r.codigo), score: Number(r.puntos_de), state: String(r.estado), reply: r.puntos_para === '' ? null : Number(r.puntos_para), winner: String(r.ganador || '') };
  };
  return {
    ok: true,
    incoming: filas.filter(function (r) { return igual_(r.para, alias) && r.estado === 'pendiente'; }).map(fmt),
    history: filas.filter(function (r) { return (igual_(r.para, alias) || igual_(r.de, alias)) && r.estado !== 'pendiente'; }).slice(-15).map(fmt),
    sent: filas.filter(function (r) { return igual_(r.de, alias) && r.estado === 'pendiente'; }).map(fmt),
  };
}
function resultadoReto_(grupo, p) {
  const alias = String(p.alias || '').trim();
  const puntos = entero_(p.score, 2000000);
  if (!RE_ALIAS.test(alias) || puntos === null) return { ok: false, error: 'datos' };
  const sh = hoja_('Retos', CAB_RETOS);
  const r = filas_(sh).filter(function (x) { return String(x.id) === String(p.id) && igual_(x.grupo, grupo); })[0];
  if (!r) return { ok: false, error: 'no_existe' };
  if (!igual_(r.para, alias)) return { ok: false, error: 'no_es_tuyo' };
  if (r.estado !== 'pendiente') return { ok: false, error: 'ya_jugado' };
  const ganador = puntos > Number(r.puntos_de) ? alias : puntos < Number(r.puntos_de) ? String(r.de) : 'empate';
  sh.getRange(r._fila, 8, 1, 4).setValues([['jugado', puntos, ganador, new Date()]]);
  return { ok: true, winner: ganador };
}
