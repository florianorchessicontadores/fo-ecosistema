// =====================================================
// scripts/validar.mjs · Validador OPCIONAL de los archivos de datos
// Requiere Node.js (https://nodejs.org). Uso, desde la carpeta del proyecto:
//     node scripts/validar.mjs
// Revisa: JSON válido, referencias entre archivos, evaluaciones,
// archivos referenciados (imágenes/documentos) y posibles datos sensibles.
// =====================================================
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errores = [];
const avisos = [];
const err = (m) => errores.push(m);
const warn = (m) => avisos.push(m);

function leer(rel) {
  try {
    return JSON.parse(readFileSync(join(root, rel), 'utf8'));
  } catch (e) {
    err(`${rel}: ${e.message}`);
    return null;
  }
}

const site = leer('data/site.json');
const normativa = leer('data/normativa.json');
const academy = leer('data/academy.json');
const tools = leer('data/tools.json');
const biblioteca = leer('data/biblioteca.json');
if (!site || !normativa || !academy || !tools || !biblioteca) finish();

const normas = new Set();
for (const n of normativa.normas) {
  if (normas.has(n.id)) err(`normativa.json: norma duplicada «${n.id}»`);
  normas.add(n.id);
  for (const k of ['id', 'ambito', 'nombre', 'fuente', 'url', 'estado']) if (!n[k]) err(`normativa.json: la norma «${n.id}» no tiene «${k}»`);
  if (!['vigente', 'modificada', 'derogada', 'por_verificar'].includes(n.estado)) err(`normativa.json: estado inválido en «${n.id}»`);
  if (n.estado === 'vigente' && (!n.publicacion || !n.vigencia || !n.ultima_revision)) warn(`normativa.json: «${n.id}» figura vigente sin fechas completas`);
}

const items = new Map();
for (const area of site.areas) {
  const data = leer(`data/${area.id}.json`);
  if (!data) continue;
  for (const it of data.items) {
    if (items.has(it.id)) err(`ID repetido «${it.id}»`);
    items.set(it.id, it);
    if (!['desarrollado', 'pendiente'].includes(it.estado)) err(`${it.id}: estado inválido`);
    for (const r of it.normas || []) {
      const id = typeof r === 'string' ? r : r.id;
      if (!normas.has(id)) err(`${it.id}: referencia a norma inexistente «${id}»`);
    }
    for (const c of it.capturas || []) if (!existsSync(join(root, c.archivo))) err(`${it.id}: no existe la captura ${c.archivo}`);
    if (it.estado === 'desarrollado') {
      for (const k of ['objetivo', 'explicacion', 'procedimiento', 'ejemplos', 'errores', 'recomendaciones', 'ejercicios', 'evaluacion'])
        if (!it[k] || !it[k].length) warn(`${it.id}: módulo desarrollado sin «${k}»`);
      (it.evaluacion || []).forEach((q, i) => {
        if (!Number.isInteger(q.correcta) || q.correcta < 0 || q.correcta >= q.opciones.length) err(`${it.id}: pregunta ${i + 1} con «correcta» fuera de rango`);
      });
    }
  }
  (data.normas_marco || []).forEach((id) => !normas.has(id) && err(`${area.id}.json: norma_marco inexistente «${id}»`));
}

for (const f of academy.ruta) for (const id of f.items) if (!items.has(id)) err(`academy.json: la ruta menciona un módulo inexistente «${id}»`);
for (const t of tools.herramientas) for (const r of t.normas || []) if (!normas.has(r.id)) err(`tools.json: ${t.id} cita una norma inexistente «${r.id}»`);
for (const c of biblioteca.categorias) {
  if (!existsSync(join(root, c.carpeta))) err(`biblioteca.json: no existe la carpeta ${c.carpeta}`);
  for (const d of c.documentos || []) if (!existsSync(join(root, d.archivo))) err(`biblioteca.json: no existe el archivo ${d.archivo}`);
}
if (site.logo && !existsSync(join(root, site.logo))) err(`site.json: no existe el logotipo ${site.logo}`);

// Búsqueda básica de datos sensibles en archivos de texto del proyecto
const sensibles = [
  [/\b(10|15|17|20)\d{9}\b/, 'posible RUC (11 dígitos)'],
  [/clave\s*sol\s*[:=]\s*\S+/i, 'posible clave SOL'],
  [/(password|contraseña|token)\s*[:=]\s*["']?\S{4,}/i, 'posible credencial'],
];
function recorrer(dir) {
  for (const f of readdirSync(dir)) {
    if (['node_modules', '.git'].includes(f)) continue;
    const p = join(dir, f);
    if (statSync(p).isDirectory()) recorrer(p);
    else if (/\.(json|js|mjs|html|css|md)$/.test(f) && !p.endsWith('validar.mjs')) {
      const txt = readFileSync(p, 'utf8');
      for (const [re, desc] of sensibles) if (re.test(txt)) warn(`${p.replace(root + '/', '')}: ${desc}`);
    }
  }
}
recorrer(root);

finish();

function finish() {
  console.log(`\nMódulos/temas: ${items.size} · Normas: ${normas.size}`);
  if (avisos.length) console.log('\nAvisos:\n - ' + avisos.join('\n - '));
  if (errores.length) {
    console.log('\nERRORES:\n - ' + errores.join('\n - '));
    process.exit(1);
  }
  console.log('\n✔ Validación correcta: sin errores.');
  process.exit(0);
}
