/* =====================================================
   data.js · Carga de todos los archivos JSON de /data
   y creación de índices para consulta rápida.
   ===================================================== */
import { fetchJSON } from './utils.js';

/** Base de datos en memoria que usan todas las vistas. */
export const DB = {
  site: null,
  normativa: null,
  academy: null,
  tools: null,
  biblioteca: null,
  areaContent: {},   // id de área -> contenido (intro, items…)
  areaMeta: {},      // id de área -> datos de site.json (título, icono…)
  items: new Map(),  // id de módulo/tema -> item
  normas: new Map(), // id de norma -> norma
};

export async function loadAll() {
  DB.site = await fetchJSON('data/site.json');

  const areaIds = DB.site.areas.map((a) => a.id);
  const [normativa, academy, tools, biblioteca, induccion, ...areas] = await Promise.all([
    fetchJSON('data/normativa.json'),
    fetchJSON('data/academy.json'),
    fetchJSON('data/tools.json'),
    fetchJSON('data/biblioteca.json'),
    fetchJSON('data/induccion.json'),
    ...areaIds.map((id) => fetchJSON(`data/${id}.json`)),
  ]);

  DB.normativa = normativa;
  DB.academy = academy;
  DB.tools = tools;
  DB.biblioteca = biblioteca;

  // Curso de inducción: sus lecciones se registran como "área" academy
  // para reutilizar la misma pantalla de detalle, progreso y evaluación.
  DB.areaMeta.academy = { id: 'academy', titulo: 'FO Academy · Inducción', corto: 'Inducción', etiqueta_item: 'Lección', icono: 'academy' };
  DB.areaContent.academy = induccion;
  (induccion.items || []).forEach((it) => {
    it.area = 'academy';
    it.ruta = `#/academy/${it.id}`;
    DB.items.set(it.id, it);
  });

  DB.site.areas.forEach((meta, i) => {
    DB.areaMeta[meta.id] = meta;
    DB.areaContent[meta.id] = areas[i];
    (areas[i].items || []).forEach((it) => {
      it.area = meta.id;
      it.ruta = `#/${meta.id}/${it.id}`;
      DB.items.set(it.id, it);
    });
  });

  (normativa.normas || []).forEach((n) => DB.normas.set(n.id, n));
}

/** Acepta ["id"] o [{id, articulos}] y devuelve siempre [{id, articulos}]. */
export function normalizeRefs(refs = []) {
  return refs.map((r) => (typeof r === 'string' ? { id: r, articulos: '' } : r));
}
