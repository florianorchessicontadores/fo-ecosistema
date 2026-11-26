/* =====================================================
   views/results.js · Resultados y recomendaciones de FO Academy
   Todo proviene del progreso guardado en este navegador.
   ===================================================== */
import { DB } from '../data.js';
import { Progress } from '../progress.js';
import { icon } from '../icons.js';
import { esc, fmtDate, $ } from '../utils.js';
import { pageHead, crumbs, sectionHead, progressBar, badge, callout, empty, statusBadge } from '../components.js';
import { cursoItems, summarize, recommendations } from '../academyLogic.js';

export function resultsView() {
  const min = DB.site.aprobacion_minima;
  const items = [...DB.items.values()].filter((i) => i.estado === 'desarrollado');
  const evaluados = items.filter((i) => Progress.get(i.id).quiz);
  const completados = items.filter((i) => Progress.isCompleted(i));
  const fases = (DB.academy.ruta || []).filter((f) => Progress.get(f.id).quiz);

  const todos = [...evaluados.map((i) => Progress.get(i.id).quiz), ...fases.map((f) => Progress.get(f.id).quiz)];
  const promedio = todos.length ? Math.round((todos.reduce((s, q) => s + (q.score * 100) / q.total, 0) / todos.length)) : null;

  const tile = (n, label) => `<div class="card" style="text-align:center"><div class="score" style="font-size:2rem">${n}</div><div class="small muted">${label}</div></div>`;
  const resumen = `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr))">
    ${tile(`${completados.length} de ${items.length}`, 'módulos completados')}
    ${tile(evaluados.length + fases.length, 'evaluaciones rendidas')}
    ${tile(promedio === null ? '—' : `${promedio}%`, 'promedio de aciertos')}</div>`;

  const cursos = (DB.academy.cursos || [])
    .map((c) => progressBar(summarize(cursoItems(c)).pct, c.titulo))
    .join('');

  const tablaModulos = evaluados.length
    ? `<div class="table-wrap"><table class="table" style="min-width:560px"><thead><tr><th>Módulo</th><th>Resultado</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>
      ${evaluados
        .map((i) => {
          const q = Progress.get(i.id).quiz;
          return `<tr><td><a href="${i.ruta}">${esc(i.titulo)}</a><div class="small muted">${esc(DB.areaMeta[i.area].corto)}</div></td>
            <td>${q.score} de ${q.total} (${Math.round((q.score * 100) / q.total)}%)</td><td>${esc(fmtDate(q.date))}</td><td>${statusBadge(i)}</td></tr>`;
        })
        .join('')}</tbody></table></div>`
    : empty('Aún no hay evaluaciones de módulos resueltas en este navegador.', 'list');

  const tablaFases = fases.length
    ? `<div class="table-wrap"><table class="table" style="min-width:480px"><thead><tr><th>Fase</th><th>Resultado</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>
      ${fases
        .map((f) => {
          const q = Progress.get(f.id).quiz;
          const ok = q.score / q.total >= min;
          return `<tr><td><a href="#/academy/evaluacion/${esc(f.id)}">${esc(f.fase)}</a></td><td>${q.score} de ${q.total}</td><td>${esc(fmtDate(q.date))}</td><td>${ok ? badge('Aprobada', 'ok') : badge('Por reforzar', 'warn')}</td></tr>`;
        })
        .join('')}</tbody></table></div>`
    : empty('Aún no ha rendido evaluaciones de fase.', 'list');

  const recs = recommendations();
  const recHtml = recs.length
    ? `<div class="card">${recs.map((r) => `<a class="row-item" href="${esc(r.ruta)}"><span class="row-body"><span class="row-title">${esc(r.texto)}</span></span>${badge(r.tipo, r.cls)}${icon('chevron', 16)}</a>`).join('')}</div>`
    : callout('Ha completado todos los módulos disponibles. Los nuevos contenidos se publicarán por etapas.', 'ok');

  return {
    title: 'Mis resultados',
    html: `${pageHead({
      crumbsHtml: crumbs([{ t: 'Inicio', href: '#/' }, { t: 'FO Academy', href: '#/academy' }, { t: 'Mis resultados' }]),
      eyebrow: 'FO Academy',
      title: 'Mis resultados',
      lead: 'Resumen de su avance, resultados de evaluaciones y recomendaciones de aprendizaje.',
    })}
    ${callout('Estos datos viven solo en este navegador. No son un registro oficial de capacitación y se pierden si se borran los datos del navegador.', 'warn')}
    <section class="section">${sectionHead('Resumen')}${resumen}</section>
    <section class="section"><div class="grid grid-2">
      <div>${sectionHead('Avance por curso')}<div class="card stack">${cursos}</div></div>
      <div>${sectionHead('Recomendaciones de aprendizaje')}${recHtml}</div>
    </div></section>
    <section class="section">${sectionHead('Evaluaciones de módulos')}${tablaModulos}</section>
    <section class="section">${sectionHead('Evaluaciones de fase')}${tablaFases}</section>
    <section class="section">${sectionHead('Datos de este navegador')}
      <div class="btn-row" style="margin-top:0"><button class="btn btn-outline btn-sm" type="button" id="btn-reset">${icon('refresh', 16)} Borrar progreso de este navegador</button></div></section>`,
    mount(root) {
      $('#btn-reset', root).addEventListener('click', () => {
        if (window.confirm('¿Borrar el progreso y los resultados guardados en este navegador?')) {
          Progress.reset();
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      });
    },
  };
}
