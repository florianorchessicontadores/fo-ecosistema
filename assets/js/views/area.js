/* =====================================================
   views/area.js · Página de un área (contable, tributaria, laboral)
   Lista los módulos/temas con filtro por estado.
   ===================================================== */
import { DB } from '../data.js';
import { Progress } from '../progress.js';
import { icon } from '../icons.js';
import { esc, $$ } from '../utils.js';
import { pageHead, crumbs, sectionHead, badge, callout, normasTable, progressBar, AVISO_NORMATIVO } from '../components.js';

export function areaView(areaId) {
  const meta = DB.areaMeta[areaId];
  const content = DB.areaContent[areaId];
  const items = content.items || [];
  const sm = Progress.areaSummary(areaId);

  const cards = items
    .map((it) => {
      const st = Progress.get(it.id);
      const done = Progress.isCompleted(it);
      return `<a class="card card-link module-card" href="${it.ruta}" data-estado="${esc(it.estado)}">
        <span class="num">${esc(meta.etiqueta_item)} ${esc(it.numero)}</span>
        <h3 style="margin:0">${esc(it.titulo)}</h3>
        <p>${esc(it.resumen)}</p>
        <span class="foot">
          ${it.estado === 'desarrollado' ? badge('Contenido inicial', 'gold') : badge('Pendiente de desarrollo', 'muted')}
          ${done ? badge('Completado', 'ok') : st.studied ? badge('Estudiado', 'ok') : ''}
        </span>
      </a>`;
    })
    .join('');

  const html = `${pageHead({
    crumbsHtml: crumbs([{ t: 'Inicio', href: '#/' }, { t: meta.titulo }]),
    eyebrow: 'Área profesional',
    title: meta.titulo,
    lead: content.intro,
    meta: `${badge(`${sm.disponibles} con contenido inicial`, 'gold')}${badge(`${sm.total - sm.disponibles} pendientes de desarrollo`, 'muted')}`,
  })}
  ${callout(esc(AVISO_NORMATIVO), 'warn')}
  ${Progress.hasAny() ? `<div class="card" style="margin-bottom:8px">${progressBar(sm.pct, `Su avance en esta área (${sm.completados} de ${sm.disponibles} disponibles)`)}</div>` : ''}

  <section class="section">
    ${sectionHead(`${meta.etiqueta_item}s del área`)}
    <div class="chips" id="filtros" role="group" aria-label="Filtrar por estado">
      <button class="chip active" type="button" data-f="todos">Todos (${sm.total})</button>
      <button class="chip" type="button" data-f="desarrollado">Con contenido inicial (${sm.disponibles})</button>
      <button class="chip" type="button" data-f="pendiente">Pendientes (${sm.total - sm.disponibles})</button>
    </div>
    <div class="grid grid-auto" id="cards" style="margin-top:16px">${cards}</div>
  </section>

  <section class="section">
    ${sectionHead('Marco normativo del área')}
    ${normasTable(content.normas_marco || [])}
  </section>`;

  return {
    title: meta.titulo,
    html,
    mount(root) {
      const chips = $$('.chip', root);
      chips.forEach((c) =>
        c.addEventListener('click', () => {
          chips.forEach((x) => x.classList.toggle('active', x === c));
          $$('#cards > a', root).forEach((card) => {
            card.hidden = c.dataset.f !== 'todos' && card.dataset.estado !== c.dataset.f;
          });
        })
      );
    },
  };
}
