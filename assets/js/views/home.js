/* =====================================================
   views/home.js · Panel de inicio
   ===================================================== */
import { DB } from '../data.js';
import { Progress } from '../progress.js';
import { icon } from '../icons.js';
import { esc } from '../utils.js';
import { sectionHead, itemRow, progressBar, badge, callout, empty } from '../components.js';

export function homeView() {
  const s = DB.site;
  const anyProgress = Progress.hasAny();

  /* 1. Bienvenida */
  const hero = `<section class="hero">
    <div class="eyebrow">${esc(s.institucion)}</div>
    <h1>${esc(s.bienvenida.titulo)}</h1>
    <p>${esc(s.subtitulo)}</p>
    <p>${esc(s.bienvenida.texto)}</p>
    <div class="btn-row">
      <a class="btn btn-gold" href="#/academy">${icon('route', 18)} Ruta de aprendizaje</a>
      <a class="btn btn-ghost-light" href="#/normativa">${icon('normativa', 18)} Normativa y actualizaciones</a>
    </div>
  </section>`;

  /* 2. Acceso rápido a las tres áreas */
  const areas = s.areas
    .map((a) => {
      const sm = Progress.areaSummary(a.id);
      return `<a class="card card-link area-card" href="#/${a.id}">
        <div class="card-ico">${icon(a.icono, 24)}</div>
        <h3>${esc(a.titulo)}</h3>
        <p class="muted" style="margin:0">${esc(a.descripcion)}</p>
        <div class="count">${sm.disponibles} de ${sm.total} ${esc(a.etiqueta_item.toLowerCase())}s con contenido inicial</div>
        ${anyProgress ? progressBar(sm.pct, 'Progreso en este navegador') : ''}
        <span class="go">Ingresar ${icon('arrow', 16)}</span>
      </a>`;
    })
    .join('');

  /* 3. Últimos módulos publicados */
  const latest = [...DB.items.values()]
    .filter((i) => i.estado === 'desarrollado')
    .sort((a, b) => (b.fecha_elaboracion || '').localeCompare(a.fecha_elaboracion || '') || a.id.localeCompare(b.id))
    .slice(0, 6);

  /* 4. Normativa y novedades */
  const nov = DB.normativa.novedades || [];
  const novHtml = nov.length
    ? nov.map((n) => `<div class="row-item"><span class="row-body"><span class="row-title">${esc(n.titulo)}</span><br><span class="row-sub">${esc(n.fecha || '')}</span></span></div>`).join('')
    : `<p class="placeholder">Sin novedades registradas. Esta plataforma <strong>no se actualiza automáticamente</strong>: cada cambio normativo requiere revisión humana y registro en <code>data/normativa.json</code>.</p>`;

  /* 5. Herramientas */
  const tools = (DB.tools.herramientas || [])
    .map(
      (t) => `<a class="card card-link tool-card" href="#/tools/${esc(t.id)}">
        ${badge('Planificada · Etapa 3', 'muted')}
        <h3 style="font-size:1rem">${esc(t.titulo)}</h3>
        <p class="muted small" style="margin:0">${esc(t.descripcion)}</p></a>`
    )
    .join('');

  /* 6. Ruta de aprendizaje */
  const ruta = (DB.academy.ruta || [])
    .map((f) => {
      const rows = f.items
        .map((id) => DB.items.get(id))
        .filter(Boolean)
        .map(itemRow)
        .join('');
      return `<div class="phase"><h3>${esc(f.fase)}</h3><p class="muted small" style="margin-bottom:6px">${esc(f.descripcion)}</p>${rows}</div>`;
    })
    .join('');

  /* 7. Indicadores de progreso */
  const overall = Progress.overall();
  const prog = anyProgress
    ? `<div class="stack">
        ${progressBar(overall.pct, `Avance general (${overall.completados} de ${overall.disponibles} módulos disponibles)`)}
        ${s.areas.map((a) => progressBar(Progress.areaSummary(a.id).pct, a.titulo)).join('')}
       </div>`
    : `<p class="placeholder">Aún no hay progreso registrado en este navegador. Al marcar módulos como estudiados y resolver evaluaciones, los indicadores aparecerán aquí.</p>`;

  return {
    title: 'Inicio',
    html: `${hero}
      <section class="section">${sectionHead('Acceso rápido a las áreas profesionales')}<div class="grid grid-3">${areas}</div></section>

      <section class="section"><div class="grid grid-2">
        <div class="card">${sectionHead('Últimos módulos publicados', '<a href="#/academy">Ver todos</a>')}
          ${latest.length ? latest.map(itemRow).join('') : empty('Aún no hay módulos publicados.')}</div>
        <div class="card">${sectionHead('Normativas y novedades', '<a href="#/normativa">Ir a normativa</a>')}
          ${novHtml}
          <p class="small muted" style="margin:14px 0 6px">Fuentes oficiales prioritarias:</p>
          <div class="chips">${DB.normativa.fuentes.map((f) => `<a class="chip" style="text-decoration:none" href="${esc(f.url)}" target="_blank" rel="noopener noreferrer">${esc(f.nombre)}</a>`).join('')}</div>
        </div>
      </div></section>

      <section class="section">${sectionHead('Herramientas disponibles', '<a href="#/tools">Ver FO Tools</a>')}
        ${callout('Las calculadoras interactivas se desarrollan en la <strong>Etapa 3</strong>. Hoy puede consultar el diseño previsto de cada herramienta: criterios, parámetros editables, advertencias y referencias normativas.')}
        <div class="grid grid-auto">${tools}</div></section>

      <section class="section"><div class="grid grid-2">
        <div>${sectionHead('Ruta de aprendizaje para practicantes', '<a href="#/academy">Abrir FO Academy</a>')}${ruta}</div>
        <div><div class="card">${sectionHead('Progreso de capacitación')}${prog}
          <p class="small muted" style="margin:14px 0 0">El avance se guarda solo en este navegador y no es un registro oficial.</p></div></div>
      </div></section>`,
  };
}
