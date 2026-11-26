/* =====================================================
   views/course.js · Página de un curso de FO Academy
   Muestra los niveles progresivos y el estado de cada módulo.
   La progresión es una RECOMENDACIÓN: no bloquea módulos, porque sin
   sistema de usuarios no existe un control de acceso real.
   ===================================================== */
import { DB } from '../data.js';
import { Progress } from '../progress.js';
import { icon } from '../icons.js';
import { esc } from '../utils.js';
import { pageHead, crumbs, sectionHead, progressBar, badge, callout, statusBadge } from '../components.js';
import { cursoItems, summarize, nextModule } from '../academyLogic.js';

export function courseView(id) {
  const curso = (DB.academy.cursos || []).find((c) => c.id === id);
  if (!curso) return null;

  const all = cursoItems(curso);
  const sm = summarize(all);
  const nx = nextModule(all);

  let previo = null; // nivel anterior con módulos disponibles aún no completados
  const niveles = curso.niveles
    .map((n, idx) => {
      const items = n.items.map((x) => DB.items.get(x)).filter(Boolean);
      const nsm = summarize(items);
      const aviso =
        previo && nsm.disponibles > 0
          ? `<p class="small muted" style="margin:0 0 8px">${icon('info', 14)} Se recomienda completar antes el ${esc(previo.titulo.split(' · ')[0])} (${previo.pendientes} módulo${previo.pendientes === 1 ? '' : 's'} disponible${previo.pendientes === 1 ? '' : 's'} sin completar).</p>`
          : '';
      if (nsm.disponibles > 0 && nsm.completados < nsm.disponibles) {
        if (!previo) previo = { titulo: n.titulo, pendientes: nsm.disponibles - nsm.completados };
      }
      const filas = items
        .map(
          (it) => `<a class="row-item${Progress.isCompleted(it) ? ' done' : ''}" href="${it.ruta}">
            <span class="row-num">${Progress.isCompleted(it) ? icon('check', 16) : esc(it.numero)}</span>
            <span class="row-body"><span class="row-title">${esc(it.titulo)}</span><br><span class="row-sub">${esc(it.resumen)}</span></span>
            ${statusBadge(it)}${icon('chevron', 16)}</a>`
        )
        .join('');
      return `<div class="card" style="margin-bottom:18px">
        <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:baseline">
          <h3 style="margin:0">${esc(n.titulo)}</h3>
          ${nsm.disponibles ? badge(`${nsm.completados} de ${nsm.disponibles} completados`, nsm.completados === nsm.disponibles ? 'ok' : 'gold') : badge('Sin contenido disponible aún', 'muted')}
        </div>
        <p class="muted small" style="margin:4px 0 10px">${esc(n.descripcion)}</p>
        ${aviso}${filas}</div>`;
    })
    .join('');

  return {
    title: curso.titulo,
    html: `${pageHead({
      crumbsHtml: crumbs([{ t: 'Inicio', href: '#/' }, { t: 'FO Academy', href: '#/academy' }, { t: curso.titulo }]),
      eyebrow: 'FO Academy · Curso',
      title: curso.titulo,
      lead: curso.descripcion,
      meta: `${badge(`${curso.niveles.length} nivel${curso.niveles.length === 1 ? '' : 'es'}`, 'muted')}${badge(`${sm.disponibles} de ${sm.total} módulos con contenido`, 'gold')}`,
    })}
    <div class="card" style="margin-bottom:8px">
      ${progressBar(sm.pct, `Su avance en este curso (${sm.completados} de ${sm.disponibles} disponibles)`)}
      <div class="btn-row">${nx ? `<a class="btn btn-primary" href="${nx.ruta}">${icon('arrow', 18)} ${Progress.hasAny() ? 'Continuar' : 'Comenzar'}: ${esc(nx.titulo)}</a>` : badge('Curso completado hasta donde hay contenido', 'ok')}</div>
    </div>
    ${callout('Los niveles ordenan el aprendizaje de lo básico a lo avanzado. La progresión es una recomendación: la plataforma no bloquea módulos.')}
    <section class="section">${sectionHead('Niveles y módulos')}${niveles}</section>
    <div class="pager"><a class="btn btn-outline" href="#/academy">${icon('back', 16)} Volver a FO Academy</a></div>`,
  };
}
