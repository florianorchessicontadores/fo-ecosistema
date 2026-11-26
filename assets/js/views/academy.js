/* =====================================================
   views/academy.js · FO Academy (pantalla principal)
   Cursos por área, ruta de aprendizaje con evaluaciones de fase
   y acceso a resultados. Los datos vienen de data/academy.json.
   ===================================================== */
import { DB } from '../data.js';
import { Progress } from '../progress.js';
import { icon } from '../icons.js';
import { esc } from '../utils.js';
import { pageHead, sectionHead, itemRow, progressBar, badge, callout } from '../components.js';
import { cursoItems, summarize, nextModule, faseDisponible, faseQuiz, phasePool, recommendations, MIN_PREGUNTAS } from '../academyLogic.js';

export function academyView() {
  const s = DB.site;
  const overall = Progress.overall();

  /* Continuar donde quedó */
  const nx = nextModule();
  const continuar = nx
    ? `<div class="card" style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
        <div><div class="eyebrow" style="margin:0 0 4px">Continuar</div><strong>${esc(nx.titulo)}</strong>
          <div class="small muted">${esc(DB.areaMeta[nx.area].corto)} · ${esc(DB.areaMeta[nx.area].etiqueta_item)} ${esc(nx.numero)}</div></div>
        <a class="btn btn-primary" href="${nx.ruta}">${icon('arrow', 18)} ${Progress.hasAny() ? 'Continuar' : 'Comenzar'}</a></div>`
    : callout('Ha completado todos los módulos disponibles. Los nuevos contenidos se publicarán por etapas.', 'ok');

  /* Cursos */
  const cursos = (DB.academy.cursos || [])
    .map((c) => {
      const sm = summarize(cursoItems(c));
      return `<div class="card">
        <div class="card-ico">${icon(c.icono, 22)}</div>
        <h3>${esc(c.titulo)}</h3>
        <p class="muted small">${esc(c.descripcion)}</p>
        <div class="small muted" style="margin-bottom:8px">${c.niveles.length} nivel${c.niveles.length === 1 ? '' : 'es'} · ${sm.disponibles} de ${sm.total} módulos con contenido</div>
        ${progressBar(sm.pct, `${sm.completados} de ${sm.disponibles} completados`)}
        <div class="btn-row"><a class="btn btn-outline btn-sm" href="#/academy/curso/${esc(c.id)}">Ver curso ${icon('arrow', 14)}</a></div>
      </div>`;
    })
    .join('');

  /* Ruta de aprendizaje con evaluación de fase */
  const ruta = (DB.academy.ruta || [])
    .map((f) => {
      const rows = f.items.map((id) => DB.items.get(id)).filter(Boolean).map(itemRow).join('');
      const q = faseQuiz(f);
      const examen = faseDisponible(f)
        ? `<div class="btn-row" style="margin-top:8px"><a class="btn btn-outline btn-sm" href="#/academy/evaluacion/${esc(f.id)}">${icon('list', 14)} Evaluación de la fase</a>
            ${q ? badge(`Último resultado: ${q.score} de ${q.total}`, q.score / q.total >= s.aprobacion_minima ? 'ok' : 'warn') : ''}</div>`
        : `<p class="small muted" style="margin:8px 0 0">Evaluación de fase disponible cuando haya al menos ${MIN_PREGUNTAS} preguntas en sus módulos (hoy: ${phasePool(f).length}).</p>`;
      return `<div class="phase"><h3>${esc(f.fase)}</h3><p class="muted small" style="margin-bottom:6px">${esc(f.descripcion)}</p>${rows}${examen}</div>`;
    })
    .join('');

  /* Recomendaciones (resumen) */
  const recs = recommendations().slice(0, 4);
  const recHtml = recs.length
    ? recs.map((r) => `<a class="row-item" href="${esc(r.ruta)}"><span class="row-body"><span class="row-title">${esc(r.texto)}</span></span>${badge(r.tipo, r.cls)}${icon('chevron', 16)}</a>`).join('')
    : '<p class="placeholder">Sin recomendaciones por ahora.</p>';

  const html = `${pageHead({
    eyebrow: 'Capacitación',
    title: 'FO Academy',
    lead: DB.academy.descripcion,
    meta: `${badge('Etapa 2', 'gold')}${badge(`Avance general: ${overall.pct}%`, 'muted')}`,
  })}
  ${callout('El progreso y los resultados se guardan <strong>solo en este navegador</strong>. No existe un sistema de usuarios: no es un registro oficial ni debe usarse como tal. Un seguimiento institucional requiere un backend (etapas futuras).', 'warn')}
  ${continuar}

  <section class="section">${sectionHead('Cursos')}<div class="grid grid-auto">${cursos}</div></section>

  <section class="section"><div class="grid grid-2">
    <div>${sectionHead('Ruta de aprendizaje para nuevos practicantes')}${ruta}</div>
    <div>${sectionHead('Recomendaciones', '<a href="#/academy/resultados">Resultados completos</a>')}
      <div class="card">${recHtml}
        <div class="btn-row"><a class="btn btn-primary btn-sm" href="#/academy/resultados">${icon('list', 14)} Ver mis resultados</a></div></div>
      <div class="card" style="margin-top:18px"><h3>Consejos de estudio</h3><ul class="list" style="margin:0">${(DB.academy.recomendaciones || []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
    </div>
  </div></section>`;

  return { title: 'FO Academy', html };
}
