/* =====================================================
   search.js · Buscador general
   Indexa módulos, normas, herramientas, biblioteca y secciones.
   Todos los términos escritos deben aparecer (sin importar tildes ni mayúsculas).
   ===================================================== */
import { DB } from './data.js';
import { norm } from './utils.js';

let index = null;

function build() {
  const out = [];

  DB.items.forEach((it) => {
    const meta = DB.areaMeta[it.area];
    const body = [it.resumen, it.objetivo, ...(it.explicacion || []).flatMap((e) => [e.titulo, e.texto])].join(' ');
    out.push({ tipo: meta.corto, titulo: `${it.numero}. ${it.titulo}`, texto: body, resumen: it.resumen, ruta: it.ruta });
  });

  DB.normas.forEach((n) => {
    out.push({ tipo: 'Norma', titulo: n.nombre, texto: `${n.descripcion} ${n.fuente}`, resumen: n.descripcion, ruta: '#/normativa' });
  });

  (DB.tools.herramientas || []).forEach((t) => {
    out.push({ tipo: 'FO Tools', titulo: t.titulo, texto: t.descripcion, resumen: t.descripcion, ruta: `#/tools/${t.id}` });
  });

  (DB.biblioteca.categorias || []).forEach((c) => {
    out.push({ tipo: 'Biblioteca', titulo: c.titulo, texto: c.descripcion, resumen: c.descripcion, ruta: '#/biblioteca' });
    (c.documentos || []).forEach((d) => {
      out.push({ tipo: 'Biblioteca', titulo: d.titulo, texto: d.descripcion || '', resumen: d.descripcion || c.titulo, ruta: '#/biblioteca' });
    });
  });

  DB.site.menu.forEach((m) => {
    out.push({ tipo: 'Sección', titulo: m.titulo, texto: m.descripcion || '', resumen: m.descripcion || '', ruta: m.ruta });
  });

  out.forEach((e) => {
    e._t = norm(e.titulo);
    e._x = norm(e.texto);
  });
  return out;
}

export function search(query) {
  if (!index) index = build();
  const terms = norm(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return index
    .map((e) => {
      let score = 0;
      for (const t of terms) {
        const inTitle = e._t.includes(t);
        const inText = e._x.includes(t);
        if (!inTitle && !inText) return null; // deben aparecer todos los términos
        score += inTitle ? 3 : 1;
      }
      return { e, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 40)
    .map((r) => r.e);
}
