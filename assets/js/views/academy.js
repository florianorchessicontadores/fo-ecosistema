/* =====================================================
   views/academy.js · FO Academy
   Cursos por área, ruta de aprendizaje, resultados y recomendaciones.
   Los módulos y evaluaciones se leen de data/contable|tributaria|laboral.json
   y la ruta se define en data/academy.json.
   ===================================================== */
import { DB } from '../data.js';
import { Progress } from '../progress.js';
import { icon } from '../icons.js';
import { esc, fmtDate, $ } from '../utils.js';
import { pageHead, sectionHead, itemRow, progressBar, badge, callout, empty, list } from '../components.js';

export function academyView() {
  const s = DB.site;

  /* Ruta de aprendizaje */
  const ruta = (DB.academy.ruta || [])
    .map((f) => {
      const rows = f.items.map((id) => DB.items.get(id)).filter(Boolean).map(itemRow).join('');
      return `<div class="phase"><h3>${esc(f.fase)}</h3><p class="muted small" style="margin-bottom:6px">${esc(f.descripcion)}</p>${rows}</div>`;
    })
    .join('');

  /* Cursos por área */
  const cursos = s.areas
    .map((a) => {
      const sm = Progress.areaSummary(a.id);
      const rows = DB.areaContent[a.id].items.map(itemRow).join('');
      return `<div class="card">
        <div class="card-ico">${icon(a.icono, 22)}</div>
        <h3>Curso: ${esc(a.titulo.replace('Área ', ''))}</h3>
        <p class="muted small">${esc(a.descripcion)}</p>
        ${progressBar(sm.pct, `${sm.completados} de ${sm.disponibles} módulos disponibles completados`)}
        <details style="margin-top:12px"><summary style="cursor:pointer;font-weight:600;color:var(--navy-800)">Ver ${sm.total} ${esc(a.etiqueta_item.toLowerCase())}s</summary>${rows}</details>
      </div>`;
    })
    .join('');

  /* Resultados de evaluaciones (guardados en este navegador) */
  const evaluated = [...DB.items.values()].filter((i) => Progress.get(i.id).quiz);
  const resultados = evaluated.length
    ? `<div class="table-wrap"><table class="table" style="min-width:520px"><thead><tr><th>Módulo</th><th>Resultado</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>
        ${evaluated
          .map((i) => {
            const q = Progress.get(i.id).quiz;
            const ok = q.score / q.total >= s.aprobacion_minima;
            return `<tr><td><a href="${i.ruta}">${esc(i.titulo)}</a></td><td>${q.score} de ${q.total}</td><td>${esc(fmtDate(q.date))}</td>
              <td>${Progress.isCompleted(i) ? badge('Completado', 'ok') : ok ? badge('Aprobado · falta marcar estudiado', 'gold') : badge('Por reforzar', 'warn')}</td></tr>`;
          })
          .join('')}</tbody></table></div>`
    : empty('Aún no hay evaluaciones resueltas en este navegador.', 'list');

  /* Siguiente módulo recomendado: primero disponible que no esté completado */
  const siguiente = [...DB.items.values()]
    .filter((i) => i.estado === 'desarrollado' && !Progress.isCompleted(i))
    .sort((a, b) => ordenRuta(a.id) - ordenRuta(b.id))[0];

  function ordenRuta(id) {
    const flat = (DB.academy.ruta || []).flatMap((f) => f.items);
    const k = flat.indexOf(id);
    return k === -1 ? 999 : k;
  }

  const reco = `${
    siguiente
      ? callout(`<strong>Siguiente módulo sugerido:</strong> <a href="${siguiente.ruta}">${esc(siguiente.titulo)}</a>`, 'ok')
      : callout('Ha completado todos los módulos disponibles. Los nuevos contenidos se publicarán por etapas.', 'ok')
  }${list(DB.academy.recomendaciones || [])}`;

  const html = `${pageHead({
    eyebrow: 'Capacitación',
    title: 'FO Academy',
    lead: DB.academy.descripcion,
    meta: `${badge('Etapa 1: estructura y ruta', 'gold')}${badge('Etapa 2: cursos completos (pendiente)', 'muted')}`,
  })}
  ${callout('El progreso y los resultados se guardan <strong>solo en este navegador</strong>. No existe un sistema de usuarios: no es un registro oficial ni debe usarse como tal. Un seguimiento institucional requiere un backend (etapas futuras).', 'warn')}

  <section class="section">${sectionHead('Ruta de aprendizaje para nuevos practicantes')}<div>${ruta}</div></section>
  <section class="section">${sectionHead('Cursos por área')}<div class="grid grid-3">${cursos}</div></section>
  <section class="section"><div class="grid grid-2">
    <div>${sectionHead('Resultados de evaluaciones')}${resultados}
      <div class="btn-row"><button class="btn btn-outline btn-sm" type="button" id="btn-reset">${icon('refresh', 16)} Borrar progreso de este navegador</button></div></div>
    <div>${sectionHead('Recomendaciones de aprendizaje')}<div class="card">${reco}</div></div>
  </div></section>`;

  return {
    title: 'FO Academy',
    html,
    mount(root) {
      $('#btn-reset', root).addEventListener('click', () => {
        if (window.confirm('¿Borrar el progreso y los resultados guardados en este navegador?')) {
          Progress.reset();
          location.reload();
        }
      });
    },
  };
}
