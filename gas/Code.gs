/**
 * Levo.dev — Backend (Google Apps Script)
 * Endpoints REST sobre doPost / doGet. Maneja IA (Claude), ofertas, postulaciones y banco.
 *
 * SETUP:
 *  1. Crea un proyecto nuevo en script.google.com
 *  2. Pega este archivo
 *  3. Configuración → Propiedades del script → agrega:
 *       ANTHROPIC_API_KEY = sk-ant-...      (tu llave de Claude API)
 *       SHEET_ID          = id-del-spreadsheet  (crea uno nuevo, copia el id de la URL)
 *  4. Implementar → Implementación nueva → Aplicación web
 *       Ejecutar como: Yo · Quién tiene acceso: Cualquiera
 *  5. Copia la URL `/exec` y pégala en Levo.dev ⚙️ Config → Backend
 *
 * El frontend NUNCA ve la llave; el backend es el proxy seguro.
 */

const MODEL = 'claude-sonnet-4-5';
const SHEETS = { OFERTAS:'Ofertas', POSTULACIONES:'Postulaciones', BANCO:'Banco' };

// ===== PERFIL DE LUIS — fuente de verdad del prompt sistema =====
const PERFIL = `Luis Enrique Vásquez Ostos. Desarrollador full-stack en Lima, Perú (100% remoto).
Posicionamiento: AI-Augmented Solutions Builder. Más diseñador de soluciones que coder puro.
Stack: JavaScript ES6+, Vue 3, PWAs, Google Apps Script (serverless), APIs REST, n8n, Tailwind.
Integraciones reales: Nubefact (facturación electrónica SUNAT), PrintNode (impresión térmica ESC/POS y ZPL), Firebase Cloud Messaging, Claude API (construyó un OCR de facturas con IA), Chart.js.
Experiencia: 3+ años construyendo y desplegando 6 PWAs en producción que operan dos grupos empresariales completos (un negocio mayorista/minorista y un hotel + operador turístico). Antes: 15+ años en operaciones y logística retail.
Recorrido de herramientas IA: AppSheet → n8n → Antigravity → Claude Code (su favorita).
SQL: nivel intermedio-avanzado. TypeScript: en aprendizaje (base sólida en JS).
Idiomas: Español nativo · Inglés B1-B2 (lee técnico fluido, reuniones de trabajo).
Estudios universitarios multidisciplinarios (PUCP, USIL, ESAN, UTP) — NO culminó título; autodidacta fuerte.
GitHub: github.com/Levo19 · Email: luisvo.19@gmail.com
Busca: empleo fijo remoto semi-senior (USD 1,200-1,800/mes) o freelance.`;

// ============ ROUTER ============
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const { action } = body;
    switch (action) {
      case 'askIA':            return _json(askIA(body));
      case 'getOfertas':       return _json({ ok:true, data: getOfertas() });
      case 'addOferta':        return _json({ ok:true, data: addOferta(body.oferta) });
      case 'updateOferta':     return _json({ ok:true, data: updateOferta(body.id, body.cambios) });
      case 'getPostulaciones': return _json({ ok:true, data: getPostulaciones() });
      case 'addPostulacion':   return _json({ ok:true, data: addPostulacion(body.postulacion) });
      case 'updatePostulacion':return _json({ ok:true, data: updatePostulacion(body.id, body.cambios) });
      case 'deletePostulacion':return _json({ ok:true, data: deletePostulacion(body.id) });
      case 'getStats':         return _json({ ok:true, data: getStats() });
      case 'ping':             return _json({ ok:true, msg:'pong' });
      default: return _json({ ok:false, error:'Acción desconocida: '+action });
    }
  } catch (err) { return _json({ ok:false, error: String(err) }); }
}

function doGet() {
  return _json({ ok:true, name:'Levo.dev backend', endpoints: ['askIA','getOfertas','addOferta','updateOferta','getPostulaciones','addPostulacion','updatePostulacion','deletePostulacion','getStats','ping'] });
}

// ============ IA ============
function askIA(req) {
  const { plantilla, idioma, form } = req;
  const prompt = _construirPrompt(plantilla, idioma, form || {});
  const texto = _callClaude(prompt);
  return { ok:true, texto };
}

function _construirPrompt(plantilla, idioma, form) {
  const lang = idioma === 'en' ? 'English' : 'Spanish';
  const len = '50-1000 characters, ideal 700-900';

  if (plantilla === 'porque') {
    const empresa = form.empresa || 'the company';
    const detalles = form.detalles ? `\nDetalles del aviso/empresa que el usuario pegó:\n${form.detalles}` : '';
    return `Escribe en ${lang} una respuesta a "¿Por qué te interesa trabajar en ${empresa}?" tailored al perfil del candidato. ${len}. Tono profesional, seguro y honesto, en primera persona. Conecta lo que hace la empresa con la experiencia y stack del candidato. Cierra con una frase de "deberían contratarme porque...". NO uses bullets ni listas; un párrafo fluido. NO inventes detalles que no estén en el perfil.${detalles}`;
  }
  if (plantilla === 'adaptar') {
    return `En ${lang}, lee el siguiente aviso de trabajo y genera 5-6 bullets adaptados del CV del candidato que más encajan con lo que piden. Usa verbos de acción, métricas reales del perfil y palabras clave del aviso. NO inventes tecnologías o experiencias que no estén en el perfil.\n\nAVISO:\n${form.oferta || ''}`;
  }
  if (plantilla === 'cover') {
    const empresa = form.empresa || 'the company';
    const puesto = form.puesto || 'the role';
    return `Escribe en ${lang} una cover letter corta y directa (máximo 180 palabras) del candidato para el puesto "${puesto}" en ${empresa}. Estructura: 1) gancho conectando experiencia con la necesidad de la empresa, 2) 2-3 logros concretos del perfil, 3) por qué ${empresa} específicamente, 4) cierre con CTA. Sin frases genéricas tipo "I am a hardworking professional".`;
  }
  if (plantilla === 'traducir') {
    const dest = idioma === 'en' ? 'English' : 'Spanish';
    return `Traduce el siguiente texto a ${dest} manteniendo el tono profesional. Solo devuelve la traducción, sin explicaciones.\n\nTEXTO:\n${form.texto || ''}`;
  }
  return 'Responde brevemente: el usuario no eligió plantilla.';
}

function _callClaude(userPrompt) {
  const key = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!key) throw new Error('Falta ANTHROPIC_API_KEY en Propiedades del Script.');
  const payload = {
    model: MODEL, max_tokens: 1024,
    system: `Eres un copywriter experto en CVs y postulaciones. Escribes respuestas que suenan humanas, seguras y honestas — sin clichés corporativos.\n\nPERFIL DEL CANDIDATO (úsalo como única fuente de verdad, no inventes):\n${PERFIL}`,
    messages: [{ role:'user', content: userPrompt }]
  };
  const resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method:'post', contentType:'application/json',
    headers:{ 'x-api-key': key, 'anthropic-version':'2023-06-01' },
    payload: JSON.stringify(payload), muteHttpExceptions: true
  });
  const code = resp.getResponseCode();
  const data = JSON.parse(resp.getContentText());
  if (code !== 200) throw new Error('Claude API '+code+': '+(data.error?.message||resp.getContentText()));
  return data.content[0].text.trim();
}

// ============ OFERTAS ============
function getOfertas() {
  const sh = _sheet(SHEETS.OFERTAS, ['id','empresa','puesto','ubicacion','fecha','encaje','estado','razon','link','tags']);
  return _readAll(sh);
}
function addOferta(o) {
  const sh = _sheet(SHEETS.OFERTAS, ['id','empresa','puesto','ubicacion','fecha','encaje','estado','razon','link','tags']);
  o.id = o.id || ('o'+Date.now());
  o.fecha = o.fecha || _hoy();
  o.estado = o.estado || 'nueva';
  _appendRow(sh, o);
  return o;
}
function updateOferta(id, cambios) { return _updateRow(SHEETS.OFERTAS, id, cambios); }

// ============ POSTULACIONES ============
function getPostulaciones() {
  const sh = _sheet(SHEETS.POSTULACIONES, ['id','empresa','puesto','link','fecha','estado','notas']);
  return _readAll(sh);
}
function addPostulacion(p) {
  const sh = _sheet(SHEETS.POSTULACIONES, ['id','empresa','puesto','link','fecha','estado','notas']);
  p.id = p.id || ('p'+Date.now());
  p.fecha = p.fecha || _hoy();
  p.estado = p.estado || 'enviada';
  _appendRow(sh, p);
  return p;
}
function updatePostulacion(id, cambios) { return _updateRow(SHEETS.POSTULACIONES, id, cambios); }
function deletePostulacion(id) {
  const sh = _ss().getSheetByName(SHEETS.POSTULACIONES);
  if (!sh) return null;
  const data = sh.getDataRange().getValues();
  for (let i=1; i<data.length; i++) if (String(data[i][0])===String(id)) { sh.deleteRow(i+1); return { ok:true }; }
  return { ok:false };
}

// ============ STATS ============
function getStats() {
  const ps = getPostulaciones();
  const enviadas = ps.filter(p => p.estado!=='por-postular').length;
  const respuestas = ps.filter(p => ['entrevista','oferta','rechazada'].includes(p.estado)).length;
  return {
    postulaciones: enviadas,
    entrevistas:   ps.filter(p => p.estado==='entrevista').length,
    ofertas:       ps.filter(p => p.estado==='oferta').length,
    rechazadas:    ps.filter(p => p.estado==='rechazada').length,
    respuestas,
    tasa: enviadas ? Math.round(respuestas/enviadas*100) : 0
  };
}

// ============ HELPERS ============
function _ss() {
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!id) throw new Error('Falta SHEET_ID en Propiedades del Script.');
  return SpreadsheetApp.openById(id);
}
function _sheet(nombre, headers) {
  const ss = _ss();
  let sh = ss.getSheetByName(nombre);
  if (!sh) {
    sh = ss.insertSheet(nombre);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
  return sh;
}
function _readAll(sh) {
  const data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).filter(r => r[0]).map(r => {
    const o = {};
    headers.forEach((h, i) => o[h] = r[i]);
    return o;
  });
}
function _appendRow(sh, obj) {
  const headers = sh.getDataRange().getValues()[0];
  sh.appendRow(headers.map(h => obj[h] ?? ''));
}
function _updateRow(nombre, id, cambios) {
  const sh = _ss().getSheetByName(nombre);
  if (!sh) return null;
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  for (let i=1; i<data.length; i++) {
    if (String(data[i][0])===String(id)) {
      Object.keys(cambios).forEach(k => {
        const col = headers.indexOf(k);
        if (col >= 0) sh.getRange(i+1, col+1).setValue(cambios[k]);
      });
      return { ok:true, id };
    }
  }
  return { ok:false };
}
function _hoy() { return Utilities.formatDate(new Date(), 'America/Lima', 'yyyy-MM-dd'); }
function _json(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

// ============ TESTS ============
function testPing() { Logger.log(JSON.stringify(askIA({ plantilla:'porque', idioma:'es', form:{ empresa:'Improving South America' }}))); }
function testStats() { Logger.log(JSON.stringify(getStats())); }
