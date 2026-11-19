/* =====================================================
   views/tools.js · FO Tools (Etapa 3)
   En esta etapa solo se muestra el DISEÑO de cada herramienta
   (criterios, parámetros editables, advertencias, normas).
   No hay cálculos ni tasas hasta verificar su vigencia.
   ===================================================== */
import { DB } from '../data.js';
import { icon } from '../icons.js';
import { esc } from '../utils.js';
import { pageHead, crumbs, sectionHead, badge, callout, normasTable, list } from '../components.js';

export function toolsView() {
  const cards = (DB.tools.herramientas || [])
    .map(
      (t) => `<a class="card card-link tool-card" href="#/tools/${esc(t.id)}">
        <div class="card-ico">${icon(t.icono, 22)}</div>
        ${badge('Planificada · Etapa 3', 'muted')}
        <h3>${esc(t.titulo)}</h3>
        <p class="muted small" style="margin:0">${esc(t.descripcion)}</p>
      </a>`
    )
    .join('');

  return {
    title: 'FO Tools',
    html: `${pageHead({ eyebrow: 'Herramientas profesionales', title: 'FO Tools', lead: DB.tools.descripcion })}
      ${callout(esc(DB.tools.aviso), 'warn')}
      <section class="section">${sectionHead('Herramientas previstas')}<div class="grid grid-auto">${cards}</div></section>`,
  };
}

export function toolDetailView(id) {
  const t = (DB.tools.herramientas || []).find((x) => x.id === id);
  if (!t) return null;

  const params = (t.parametros || [])
    .map((p) => `<tr><td><strong>${esc(p.nombre)}</strong></td><td>${esc(p.descripcion)}</td><td>${badge('Editable · valor por verificar', 'warn')}</td></tr>`)
    .join('');

  return {
    title: t.titulo,
    html: `${pageHead({
      crumbsHtml: crumbs([{ t: 'Inicio', href: '#/' }, { t: 'FO Tools', href: '#/tools' }, { t: t.titulo }]),
      eyebrow: 'FO Tools · diseño previsto',
      title: t.titulo,
      lead: t.descripcion,
      meta: badge('Planificada · Etapa 3', 'muted'),
    })}
    ${callout('Esta herramienta <strong>aún no está disponible</strong>. Esta ficha define cómo se construirá para que el equipo pueda revisarla antes de programarla. No se usarán tasas ni parámetros legales sin verificar su vigencia.', 'warn')}
    <section class="doc-sec"><h2>Criterios que se utilizarán</h2>${list(t.criterios || [])}</section>
    <section class="doc-sec"><h2>Parámetros editables</h2>
      <div class="table-wrap"><table class="table" style="min-width:560px"><thead><tr><th>Parámetro</th><th>Descripción</th><th>Condición</th></tr></thead><tbody>${params}</tbody></table></div></section>
    <section class="doc-sec"><h2>Advertencias</h2>${list(t.advertencias || [])}</section>
    <section class="doc-sec"><h2>Referencias normativas aplicables</h2>${normasTable(t.normas || [])}</section>
    <div class="pager"><a class="btn btn-outline" href="#/tools">${icon('back', 16)} Volver a FO Tools</a></div>`,
  };
}
