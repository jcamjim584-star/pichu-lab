/* Simulación mínima de Google Apps Script para probar apps-script/Code.gs sin internet */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
function createGas(clave) {
  const sheets = {};
  const makeSheet = (name) => {
    const data = [];
    return {
      name, data,
      appendRow(r) { data.push(r.slice()); },
      setFrozenRows() {},
      getDataRange() { return { getValues: () => data.map((r) => r.slice()) }; },
      getRange(row, col, nr, nc) { return { setValues(v) { for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) data[row - 1 + i][col - 1 + j] = v[i][j]; } }; },
    };
  };
  const ss = { getSheetByName: (n) => sheets[n] || null, insertSheet: (n) => (sheets[n] = makeSheet(n)) };
  const ctx = {
    SpreadsheetApp: { getActiveSpreadsheet: () => ss },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (t) => ({ text: t, setMimeType() { return this; } }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    Utilities: { getUuid: () => crypto.randomUUID() },
    Date, JSON, Math, Number, String, Object, isFinite,
  };
  vm.createContext(ctx);
  const code = fs.readFileSync(path.join(__dirname, '../apps-script/Code.gs'), 'utf8').replace("const CLAVE = 'cambia-esta-clave';", `const CLAVE = ${JSON.stringify(clave)};`);
  vm.runInContext(code, ctx);
  return {
    sheets,
    get: (params) => JSON.parse(ctx.doGet({ parameter: params }).text),
    post: (body) => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(body) } }).text),
  };
}
module.exports = { createGas };
