/* =====================================================
   utils.js · Funciones de apoyo generales
   ===================================================== */

/** Escapa texto para insertarlo de forma segura en HTML. */
export const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Lee un archivo JSON y devuelve mensajes de error claros para quien mantiene el proyecto. */
export async function fetchJSON(path) {
  let res;
  try {
    res = await fetch(path, { cache: 'no-cache' });
  } catch (e) {
    throw new Error(`No se pudo leer ${path}. ¿Está abriendo la plataforma con Live Server o GitHub Pages?`);
  }
  if (!res.ok) throw new Error(`No se pudo cargar ${path} (HTTP ${res.status}).`);
  try {
    return await res.json();
  } catch (e) {
    throw new Error(`El archivo ${path} no es un JSON válido: ${e.message}`);
  }
}

/** "2026-11-18" -> "18/11/2026" (sin conversiones de zona horaria). */
export function fmtDate(iso) {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(iso);
}

/** Normaliza texto para búsquedas: minúsculas y sin tildes. */
export const norm = (s) =>
  String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Solo permite enlaces http(s). */
export const safeUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : '#');

export const pct = (a, b) => (b ? Math.round((a * 100) / b) : 0);

/** Convierte una lista de textos en <p>…</p>. */
export const paras = (arr = []) => arr.map((t) => `<p>${esc(t)}</p>`).join('');

/** Convierte una lista de textos en <ul> u <ol>. */
export const list = (arr = [], ordered = false) => {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag} class="list">${arr.map((t) => `<li>${esc(t)}</li>`).join('')}</${tag}>`;
};
